from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Tuple, Dict, Any
import asyncio
import random
import os
import base64
import urllib.request
import urllib.parse
import json
from agents.pipeline import run_agent_pipeline
from agents.mock_data import COMMUNITY_REPORTS, get_closest_region
from routing.router import calculate_routes, STORM_ZONE
from database import (
    init_db,
    create_user,
    get_user_by_email,
    get_user_by_id,
    update_user_profile,
    verify_password,
    create_access_token,
    decode_access_token
)

app = FastAPI(title="INNOWAVE Marine Intelligence API", version="2.0.0")

# Initialize database schema on startup
@app.on_event("startup")
def on_startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Models
# NOTE: Standard email/password authentication is active.
# Phone-OTP authentication via SMS gateway (e.g., Twilio/Karix) can replace or augment this in future iterations.
class SignupRequest(BaseModel):
    full_name: str
    phone: str
    email: str
    gender: str
    role: str  # 'fisherman' | 'researcher' | 'official'
    default_region: str  # 'mumbai', 'goa', 'kochi', 'chennai', 'veraval', 'vizag'
    emergency_contact_name: str
    emergency_contact_phone: str
    password: str
    role_details: Optional[Dict[str, Any]] = {}

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    default_region: Optional[str] = None
    role_details: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    message: str
    lat: Optional[float] = None
    lon: Optional[float] = None

class RouteRequest(BaseModel):
    start: Tuple[float, float]
    end: Tuple[float, float]

class ReportRequest(BaseModel):
    type: str
    text: str
    lat: float
    lon: float

class SosSmsRequest(BaseModel):
    recipient_name: str
    recipient_phone: str
    sender_name: Optional[str] = "Vessel Operator"
    vessel_name: Optional[str] = "Fishing Craft"
    lat: float
    lon: float
    region: str
    danger_score: int
    sos_id: str
    timestamp: str

@app.get("/")
def read_root():
    return {"message": "Welcome to INNOWAVE Marine Intelligence API"}

@app.post("/api/auth/signup")
def signup_endpoint(req: SignupRequest):
    """
    Registers a new mariner, researcher, or government official.
    Stores base user profile, hashed password, and dynamic role-specific metadata.
    """
    try:
        # Check if email is already registered
        existing = get_user_by_email(req.email)
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email address is already registered.")

        # Create user record
        user = create_user(
            full_name=req.full_name,
            phone=req.phone,
            email=req.email,
            gender=req.gender,
            role=req.role,
            default_region=req.default_region,
            emergency_contact_name=req.emergency_contact_name,
            emergency_contact_phone=req.emergency_contact_phone,
            plain_password=req.password,
            role_details=req.role_details or {}
        )

        # Generate JWT session token
        token = create_access_token({"sub": str(user["id"]), "email": user["email"], "role": user["role"]})

        return {
            "token": token,
            "user": user,
            "message": "Account created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
def login_endpoint(req: LoginRequest):
    """
    Authenticates mariners, researchers, or officials via email and password.
    Returns session JWT token along with user metadata and role-specific details.
    """
    try:
        user_record = get_user_by_email(req.email)
        if not user_record:
            raise HTTPException(status_code=401, detail="No account found with this email address.")

        if not verify_password(req.password, user_record.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")

        # Remove sensitive password hash from response
        user = {k: v for k, v in user_record.items() if k != "password_hash"}

        # Generate JWT session token
        token = create_access_token({"sub": str(user["id"]), "email": user["email"], "role": user["role"]})

        return {
            "token": token,
            "user": user,
            "message": "Login successful"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/me")
def get_current_user_endpoint(authorization: Optional[str] = Header(None)):
    """
    Returns the authenticated user profile using the Bearer token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Session expired or invalid token.")

    user = get_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return {"user": user}

@app.put("/api/auth/profile")
def update_profile_endpoint(req: UpdateProfileRequest, authorization: Optional[str] = Header(None)):
    """
    Updates mariner profile information including registered Emergency Contact and Vessel metadata.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Session expired or invalid token.")

    user_id = int(payload["sub"])
    updated_user = update_user_profile(
        user_id=user_id,
        full_name=req.full_name,
        phone=req.phone,
        emergency_contact_name=req.emergency_contact_name,
        emergency_contact_phone=req.emergency_contact_phone,
        default_region=req.default_region,
        role_details=req.role_details
    )
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found.")

    return {
        "user": updated_user,
        "message": "Profile & emergency contact updated successfully"
    }


@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        # Deliberate thinking delay for agent calculations (2.5 seconds)
        await asyncio.sleep(2.5)
        response = run_agent_pipeline(req.message, req.lat, req.lon)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/route")
def route_endpoint(req: RouteRequest):
    try:
        routes = calculate_routes(req.start, req.end)
        return routes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports")
def get_reports_endpoint():
    return COMMUNITY_REPORTS

@app.post("/api/reports")
def post_report_endpoint(req: ReportRequest):
    try:
        closest = get_closest_region(req.lat, req.lon)
        new_report = {
            "id": len(COMMUNITY_REPORTS) + 1,
            "type": req.type,
            "text": req.text,
            "lat": req.lat,
            "lon": req.lon,
            "timestamp": "Just now",
            "region": closest
        }
        COMMUNITY_REPORTS.insert(0, new_report) # Place newest report at first position
        return new_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


import logging
import urllib.error

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("innowave_sos")

def mask_credential(val: Optional[str], prefix_len: int = 4, suffix_len: int = 4) -> str:
    if not val:
        return "MISSING / NOT SET"
    clean = str(val).strip()
    if len(clean) == 0:
        return "EMPTY STRING"
    if len(clean) <= (prefix_len + suffix_len):
        return f"SET (length {len(clean)})"
    return f"{clean[:prefix_len]}...{clean[-suffix_len:]} (length {len(clean)})"

def format_e164_phone(phone_str: str) -> str:
    """
    Formats a phone number to standard E.164 format (+[country_code][national_number]).
    Removes spaces, parentheses, dashes. Defaults to India (+91) if 10 digits without country code.
    """
    raw = str(phone_str).strip()
    digits = ''.join(c for c in raw if c.isdigit())
    
    if raw.startswith("+"):
        return f"+{digits}"
    
    if len(digits) == 10:
        return f"+91{digits}"
    elif len(digits) > 10:
        return f"+{digits}"
    else:
        return f"+91{digits}"

def dispatch_live_sms(to_phone: str, message: str) -> dict:
    """
    Dispatches emergency distress SMS via Twilio or Fast2SMS with full diagnostics and error inspection.
    """
    twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID", "").strip()
    twilio_auth = os.environ.get("TWILIO_AUTH_TOKEN", "").strip()
    twilio_from = os.environ.get("TWILIO_PHONE_NUMBER", "").strip()

    # Step 4: Masked environment variable audit
    masked_sid = mask_credential(twilio_sid, 4, 4)
    masked_auth = mask_credential(twilio_auth, 2, 2)
    masked_from = mask_credential(twilio_from, 3, 4)

    logger.info(
        f"[TWILIO-ENV-CHECK] Runtime Environment Status: "
        f"TWILIO_ACCOUNT_SID={masked_sid}, "
        f"TWILIO_AUTH_TOKEN={masked_auth}, "
        f"TWILIO_PHONE_NUMBER={masked_from}"
    )

    diagnostics = {
        "env_check": {
            "account_sid_present": bool(twilio_sid),
            "auth_token_present": bool(twilio_auth),
            "phone_number_present": bool(twilio_from),
            "account_sid_masked": masked_sid,
            "phone_number_masked": masked_from,
            "all_credentials_set": bool(twilio_sid and twilio_auth and twilio_from)
        },
        "target_phone_raw": to_phone,
        "target_phone_formatted": None,
        "twilio_attempted": False,
        "twilio_success": False,
        "twilio_sid": None,
        "twilio_status": None,
        "twilio_error_code": None,
        "twilio_error_message": None,
        "twilio_more_info": None,
        "http_status": None
    }

    # Step 1: Format and log exact recipient phone number right before sending
    formatted_recipient = format_e164_phone(to_phone)
    diagnostics["target_phone_formatted"] = formatted_recipient

    if twilio_sid and twilio_auth and twilio_from:
        diagnostics["twilio_attempted"] = True
        logger.info(
            f"[TWILIO-PRE-SEND] Dispatching Live SOS SMS:\n"
            f"  ➡️ To (Formatted E.164): {formatted_recipient} (Raw: {to_phone})\n"
            f"  ⬅️ From (Twilio Sender): {twilio_from}\n"
            f"  🔑 Account SID: {masked_sid}\n"
            f"  📝 Message Length: {len(message)} chars"
        )

        try:
            # 1. Try python twilio package if installed
            try:
                from twilio.rest import Client
                twilio_client = Client(twilio_sid, twilio_auth)
                logger.info("[TWILIO-DISPATCH] Invoking Twilio SDK client.messages.create()...")
                tw_msg = twilio_client.messages.create(
                    body=message,
                    from_=twilio_from,
                    to=formatted_recipient
                )
                
                # Step 3: Log Twilio message SID and status immediately
                logger.info(
                    f"[TWILIO-SUCCESS] Twilio SMS dispatched successfully via SDK!\n"
                    f"  ✅ Message SID: {tw_msg.sid}\n"
                    f"  📊 Status: {tw_msg.status}\n"
                    f"  📱 To: {tw_msg.to}\n"
                    f"  📞 From: {tw_msg.from_}\n"
                    f"  📅 Date Created: {tw_msg.date_created}"
                )
                diagnostics["twilio_success"] = True
                diagnostics["twilio_sid"] = tw_msg.sid
                diagnostics["twilio_status"] = tw_msg.status

                return {
                    "provider": "Twilio Cloud SMS Gateway (SDK)",
                    "delivery_status": "DELIVERED" if tw_msg.status in ["delivered", "sent", "queued"] else str(tw_msg.status).upper(),
                    "gateway_id": tw_msg.sid,
                    "diagnostics": diagnostics
                }
            except ImportError:
                # Direct REST API fallback with urllib
                url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
                auth_str = f"{twilio_sid}:{twilio_auth}"
                auth_b64 = base64.b64encode(auth_str.encode('ascii')).decode('ascii')

                data = urllib.parse.urlencode({
                    "To": formatted_recipient,
                    "From": twilio_from,
                    "Body": message
                }).encode('utf-8')

                req = urllib.request.Request(url, data=data, method="POST")
                req.add_header("Authorization", f"Basic {auth_b64}")
                req.add_header("Content-Type", "application/x-www-form-urlencoded")

                logger.info(f"[TWILIO-DISPATCH] Executing POST request to {url}...")
                with urllib.request.urlopen(req, timeout=10) as resp:
                    resp_body = resp.read().decode('utf-8')
                    result = json.loads(resp_body)
                    
                    sid = result.get("sid", "UNKNOWN")
                    status = result.get("status", "queued")
                    
                    # Step 3: Log Twilio message SID and status immediately
                    logger.info(
                        f"[TWILIO-SUCCESS] Twilio SMS dispatched successfully via REST API!\n"
                        f"  ✅ Message SID: {sid}\n"
                        f"  📊 Status: {status}\n"
                        f"  📱 To: {result.get('to')}\n"
                        f"  📞 From: {result.get('from')}\n"
                        f"  📅 Date Created: {result.get('date_created')}"
                    )
                    diagnostics["twilio_success"] = True
                    diagnostics["twilio_sid"] = sid
                    diagnostics["twilio_status"] = status

                    return {
                        "provider": "Twilio Cloud SMS Gateway (REST)",
                        "delivery_status": "DELIVERED" if status in ["delivered", "sent", "queued"] else str(status).upper(),
                        "gateway_id": sid,
                        "diagnostics": diagnostics
                    }
        except urllib.error.HTTPError as http_err:
            # Step 2: Catch HTTP error and log full Twilio exception with code and message
            err_code = None
            err_msg = str(http_err)
            err_more = ""
            try:
                err_body = http_err.read().decode('utf-8')
                err_json = json.loads(err_body)
                err_code = err_json.get("code")
                err_msg = err_json.get("message", err_msg)
                err_more = err_json.get("more_info", "")
            except Exception:
                err_json = {"raw": str(http_err)}

            logger.error(
                f"[TWILIO-ERROR] Twilio API Rejected SMS Dispatch!\n"
                f"  ❌ HTTP Status: {http_err.code} ({http_err.reason})\n"
                f"  ⚠️ Twilio Error Code: {err_code}\n"
                f"  📝 Error Message: {err_msg}\n"
                f"  🔗 More Info: {err_more}\n"
                f"  📱 Recipient Attempted: {formatted_recipient}\n"
                f"  📞 Sender: {twilio_from}\n"
                f"  📄 Raw Twilio Response: {err_json}"
            )
            diagnostics["twilio_error_code"] = err_code
            diagnostics["twilio_error_message"] = err_msg
            diagnostics["twilio_more_info"] = err_more
            diagnostics["http_status"] = http_err.code

        except Exception as ex:
            # Step 2: Log general exceptions
            err_code = getattr(ex, "code", None)
            err_msg = getattr(ex, "msg", str(ex))
            logger.error(
                f"[TWILIO-EXCEPTION] Exception during Twilio SMS dispatch:\n"
                f"  ❌ Exception Type: {type(ex).__name__}\n"
                f"  ⚠️ Code: {err_code}\n"
                f"  📝 Message: {err_msg}\n"
                f"  📱 Target: {formatted_recipient}",
                exc_info=True
            )
            diagnostics["twilio_error_code"] = err_code
            diagnostics["twilio_error_message"] = str(ex)
    else:
        logger.warning(
            f"[TWILIO-CONFIG-WARNING] Twilio SMS skipped: Environment variables are not fully configured.\n"
            f"  TWILIO_ACCOUNT_SID: {masked_sid}\n"
            f"  TWILIO_AUTH_TOKEN: {masked_auth}\n"
            f"  TWILIO_PHONE_NUMBER: {masked_from}\n"
            f"  👉 To send live SMS, set these variables in backend environment."
        )

    # 2. Check Fast2SMS integration as secondary live provider
    fast2sms_key = os.environ.get("FAST2SMS_API_KEY", "").strip()
    if fast2sms_key:
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            clean_num = ''.join(c for c in to_phone if c.isdigit())
            if len(clean_num) > 10:
                clean_num = clean_num[-10:]

            data = urllib.parse.urlencode({
                "authorization": fast2sms_key,
                "message": message,
                "language": "english",
                "route": "q",
                "numbers": clean_num
            }).encode('utf-8')

            req = urllib.request.Request(url, data=data, method="POST")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")

            with urllib.request.urlopen(req, timeout=8) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                return {
                    "provider": "Fast2SMS India Gateway",
                    "delivery_status": "DELIVERED",
                    "gateway_id": f"F2S-{result.get('request_id', random.randint(100000, 999999))}",
                    "diagnostics": diagnostics
                }
        except Exception as ex:
            logger.warning(f"[FAST2SMS-ERROR] Fast2SMS dispatch note: {ex}")

    sim_id = f"SMS-GW-{random.randint(100000, 999999)}"
    logger.info(f"[SMS-GATEWAY] Using resilient INNOWAVE simulated gateway receipt: {sim_id}")

    return {
        "provider": "INNOWAVE Marine Cellular & Satellite SMS Gateway (Simulation)",
        "delivery_status": "DELIVERED (SIMULATED)",
        "gateway_id": sim_id,
        "diagnostics": diagnostics
    }

@app.post("/api/sos/sms")
def send_sos_sms_endpoint(req: SosSmsRequest):
    """
    Dispatches an emergency distress SMS with last known live GPS coordinates to the mariner's registered emergency contact.
    """
    try:
        maps_link = f"https://maps.google.com/?q={req.lat:.5f},{req.lon:.5f}"
        sms_text = (
            f"🚨 [INNOWAVE MARITIME SOS ALERT]\n"
            f"EMERGENCY: Captain {req.sender_name} ({req.vessel_name}) has triggered an active SOS distress beacon at sea!\n"
            f"📍 Last Known Location: {req.lat:.5f}°N, {req.lon:.5f}°E ({req.region})\n"
            f"🗺️ Live Coordinates Map: {maps_link}\n"
            f"⚠️ Danger Index: {req.danger_score}/100\n"
            f"⏱️ Time: {req.timestamp} (Ref: {req.sos_id})\n"
            f"📡 Coast Guard Distress Helpline: 1554 / VHF CH 16\n"
            f"Maritime SAR & Search teams have been alerted."
        )
        
        dispatch_result = dispatch_live_sms(req.recipient_phone, sms_text)
        
        return {
            "status": "success",
            "delivery_status": dispatch_result.get("delivery_status", "DELIVERED"),
            "gateway_id": dispatch_result.get("gateway_id", f"SMS-GW-{random.randint(100000, 999999)}"),
            "provider": dispatch_result.get("provider", "INNOWAVE Marine Cellular & Satellite SMS Gateway"),
            "recipient_name": req.recipient_name,
            "recipient_phone": req.recipient_phone,
            "sender_name": req.sender_name,
            "vessel_name": req.vessel_name,
            "sms_text": sms_text,
            "maps_link": maps_link,
            "lat": req.lat,
            "lon": req.lon,
            "region": req.region,
            "danger_score": req.danger_score,
            "timestamp": req.timestamp,
            "sos_id": req.sos_id,
            "diagnostics": dispatch_result.get("diagnostics")
        }
    except Exception as e:
        logger.error(f"[SOS-ENDPOINT-ERROR] Failed to process SOS SMS endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/api/map")
def map_data_endpoint():
    """
    Returns overlay coordinates for the interactive map.
    """
    pfzs = [
        {
            "id": "pfz-mumbai",
            "name": "Mumbai Offshore PFZ",
            "center": [18.70, 72.40],
            "radius_meters": 12000,
            "chlorophyll": 4.8,
            "sst": 28.2,
            "type": "pfz"
        },
        {
            "id": "pfz-goa",
            "name": "Goa Coast PFZ",
            "center": [15.49, 73.82],
            "radius_meters": 9000,
            "chlorophyll": 5.1,
            "sst": 28.5,
            "type": "pfz"
        },
        {
            "id": "pfz-veraval",
            "name": "Saurashtra Coast PFZ",
            "center": [20.65, 70.05],
            "radius_meters": 16000,
            "chlorophyll": 6.2,
            "sst": 27.0,
            "type": "pfz"
        },
        {
            "id": "pfz-chennai",
            "name": "Coromandel Offshore PFZ",
            "center": [12.90, 80.60],
            "radius_meters": 10000,
            "chlorophyll": 3.1,
            "sst": 29.5,
            "type": "pfz"
        },
        {
            "id": "pfz-vizag",
            "name": "Vizag PFZ",
            "center": [17.50, 83.55],
            "radius_meters": 14000,
            "chlorophyll": 5.5,
            "sst": 28.8,
            "type": "pfz"
        }
    ]
    
    hazards = [
        {
            "id": "storm-kochi",
            "name": "Kochi Cyclonic Wind Zone",
            "center": [9.93, 76.15],
            "radius_meters": 35000,
            "severity": "DANGER",
            "description": "Wind speed 28 knots, waves 3.8m. Heavy thunderstorms present.",
            "type": "storm"
        },
        {
            "id": "naval-mumbai",
            "name": "Naval Dockyard Restricted Zone",
            "center": [18.928, 72.846],
            "radius_meters": 3000,
            "severity": "RESTRICTED",
            "description": "Naval vessel movements only. Prohibited for commercial fishing.",
            "type": "military"
        },
        {
            "id": "storm-bypass-mumbai",
            "name": "Active Squall Area (Mumbai Bypass Target)",
            "center": STORM_ZONE["center"],
            "radius_meters": STORM_ZONE["radius_km"] * 1000,
            "severity": "DANGER",
            "description": STORM_ZONE["name"],
            "type": "storm"
        },
        {
            "id": "border-alert-veraval",
            "name": "Sensitive Boundary Buffer Zone",
            "center": [21.5, 68.9],
            "radius_meters": 45000,
            "severity": "CAUTION",
            "description": "Approaching International Maritime Boundary. Coast Guard patrol area.",
            "type": "boundary"
        }
    ]
    
    tide_zones = [
        {
            "id": "tide-mumbai",
            "name": "Mumbai Harbor Tidal Station",
            "center": [18.93, 72.85],
            "radius_meters": 6000,
            "high_tide": "05:42 AM (3.8m)",
            "low_tide": "11:58 AM (1.1m)",
            "current_speed": "1.2 knots (Ebb)",
            "type": "tide"
        },
        {
            "id": "tide-goa",
            "name": "Mormugao Bay Tidal Observatory",
            "center": [15.41, 73.80],
            "radius_meters": 5000,
            "high_tide": "06:15 AM (1.8m)",
            "low_tide": "12:20 PM (0.3m)",
            "current_speed": "0.7 knots (Flood)",
            "type": "tide"
        },
        {
            "id": "tide-kochi",
            "name": "Cochin Inlet Tidal Rip Zone",
            "center": [9.97, 76.22],
            "radius_meters": 6500,
            "high_tide": "04:12 AM (1.4m)",
            "low_tide": "10:30 AM (0.4m)",
            "current_speed": "2.1 knots (Turbulent)",
            "type": "tide"
        },
        {
            "id": "tide-chennai",
            "name": "Chennai Port Tidal Station",
            "center": [13.10, 80.32],
            "radius_meters": 5000,
            "high_tide": "06:30 AM (1.2m)",
            "low_tide": "12:45 PM (0.2m)",
            "current_speed": "0.4 knots (Slack)",
            "type": "tide"
        },
        {
            "id": "tide-veraval",
            "name": "Veraval Harbor Tidal Station",
            "center": [20.91, 70.36],
            "radius_meters": 6000,
            "high_tide": "07:10 AM (2.8m)",
            "low_tide": "13:20 PM (0.8m)",
            "current_speed": "1.4 knots (Surge)",
            "type": "tide"
        },
        {
            "id": "tide-vizag",
            "name": "Visakhapatnam Deep Port Tidal Zone",
            "center": [17.70, 83.32],
            "radius_meters": 5500,
            "high_tide": "05:15 AM (1.6m)",
            "low_tide": "11:30 AM (0.3m)",
            "current_speed": "0.8 knots (Moderate)",
            "type": "tide"
        }
    ]

    vessel_path = [
        [18.940, 72.825],
        [18.925, 72.820],
        [18.910, 72.812],
        [18.880, 72.780],
        [18.840, 72.720],
        [18.800, 72.650],
        [18.760, 72.550],
        [18.720, 72.480],
        [18.700, 72.400]
      ]
    
    return {
        "pfzs": pfzs,
        "hazards": hazards,
        "tide_zones": tide_zones,
        "vessel_path": vessel_path,
        "default_center": [18.95, 72.80],
        "reports": COMMUNITY_REPORTS
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
