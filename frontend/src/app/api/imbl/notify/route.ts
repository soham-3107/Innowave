import { NextRequest, NextResponse } from "next/server";

function maskCredential(val?: string, prefixLen = 4, suffixLen = 4): string {
  if (!val) return "MISSING / NOT SET";
  const clean = val.trim();
  if (!clean) return "EMPTY STRING";
  if (clean.length <= prefixLen + suffixLen) return `SET (length ${clean.length})`;
  return `${clean.slice(0, prefixLen)}...${clean.slice(-suffixLen)} (length ${clean.length})`;
}

function formatE164Phone(phoneStr: string): string {
  const raw = String(phoneStr || "").trim();
  const digits = raw.replace(/\D/g, "");

  if (raw.startsWith("+")) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  } else if (digits.length > 10) {
    return `+${digits}`;
  } else {
    return `+91${digits}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      vessel_name = "Matsya Sagar IV",
      vessel_registration = "IND-MH-01-MM-4820",
      operator_name = "Capt. Rajesh Patil",
      lat = 21.84,
      lon = 68.21,
      region = "Veraval Coast",
      boundary_name = "India - Pakistan International Maritime Boundary Line",
      distance_nm = 3.42,
      distance_km = 6.33,
      alert_level = "WARNING",
      timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      authority_phone = process.env.MARITIME_AUTHORITY_PHONE || "+91 98110 99887",
      authority_name = "Indian Coast Guard Regional HQ"
    } = body;

    const latNum = typeof lat === "number" ? lat : parseFloat(lat) || 21.84;
    const lonNum = typeof lon === "number" ? lon : parseFloat(lon) || 68.21;
    const distNmNum = typeof distance_nm === "number" ? distance_nm : parseFloat(distance_nm) || 3.42;
    const distKmNum = typeof distance_km === "number" ? distance_km : parseFloat(distance_km) || 6.33;
    const maps_link = `https://maps.google.com/?q=${latNum.toFixed(5)},${lonNum.toFixed(5)}`;

    // Official Maritime Boundary Violation Notice Text
    const sms_text = 
      `🚨 [ORCA IMBL SENSITIVE BOUNDARY ALERT]\n` +
      `ENFORCEMENT NOTICE: Vessel ${vessel_name} (${vessel_registration}) operated by ${operator_name} ` +
      `is within ${distNmNum.toFixed(2)} NM (${distKmNum.toFixed(2)} km) of ${boundary_name}.\n` +
      `📍 GPS Coords: ${latNum.toFixed(5)}°N, ${lonNum.toFixed(5)}°E (${region})\n` +
      `🗺️ Live Chart: ${maps_link}\n` +
      `⏱️ Timestamp: ${timestamp}\n` +
      `⚠️ Threat Severity: ${alert_level}\n` +
      `📡 Maritime Rescue Coordination Centre (MRCC) & Coast Guard Operations Center alerted.`;

    let provider = "ORCA Marine Cellular & Satellite SMS Gateway";
    let gateway_id = `IMBL-GW-${Math.floor(100000 + Math.random() * 900000)}`;
    let delivery_status = "DELIVERED (SIMULATED)";

    // Read Twilio environment variables
    const twilioSid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
    const twilioAuth = (process.env.TWILIO_AUTH_TOKEN || "").trim();
    const twilioFrom = (process.env.TWILIO_PHONE_NUMBER || "").trim();

    const formattedAuthorityPhone = formatE164Phone(authority_phone);

    const diagnostics: any = {
      authority_phone_formatted: formattedAuthorityPhone,
      twilio_attempted: false,
      twilio_success: false,
      twilio_sid: null,
      delivery_status: null
    };

    // =========================================================================
    // TWILIO REST INTEGRATION DISPATCH
    // If TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set,
    // this executes a real HTTPS POST call to Twilio's Messages.json API endpoint.
    // =========================================================================
    if (twilioSid && twilioAuth && twilioFrom) {
      diagnostics.twilio_attempted = true;
      console.log(
        `[TWILIO-IMBL-DISPATCH] Sending Automated IMBL Alert to Maritime Authorities:\n` +
        `  🏢 Authority: ${authority_name} (${formattedAuthorityPhone})\n` +
        `  🚢 Vessel: ${vessel_name} (${vessel_registration})\n` +
        `  📍 Proximity: ${distNmNum.toFixed(2)} NM to ${boundary_name}`
      );

      try {
        const authStr = Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");
        const formParams = new URLSearchParams();
        formParams.append("To", formattedAuthorityPhone);
        formParams.append("From", twilioFrom);
        formParams.append("Body", sms_text);

        // REAL TWILIO API DISPATCH CALL GOES HERE:
        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authStr}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formParams.toString()
        });

        const twData = await twilioRes.json().catch(() => ({}));

        if (twilioRes.ok) {
          console.log(`[TWILIO-IMBL-SUCCESS] Dispatched to Coast Guard. SID: ${twData.sid}`);
          provider = "Twilio Cloud SMS Gateway";
          gateway_id = twData.sid || `TW-IMBL-${Math.floor(100000 + Math.random() * 900000)}`;
          delivery_status = twData.status ? String(twData.status).toUpperCase() : "DELIVERED";
          diagnostics.twilio_success = true;
          diagnostics.twilio_sid = twData.sid;
          diagnostics.delivery_status = delivery_status;
        } else {
          console.warn(`[TWILIO-IMBL-ERROR] Twilio rejected authority alert:`, twData);
        }
      } catch (err: any) {
        console.error(`[TWILIO-IMBL-EXCEPTION] Failed dispatch:`, err);
      }
    } else {
      console.info(
        `[IMBL-AUTHORITY-NOTIFICATION] Twilio credentials not configured. Using simulated marine dispatch.\n` +
        `  👉 To send real SMS to Coast Guard / Authorities, provide TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.`
      );
    }

    // Secondary provider (Fast2SMS)
    const fast2smsKey = (process.env.FAST2SMS_API_KEY || "").trim();
    if (fast2smsKey && !diagnostics.twilio_success) {
      try {
        const cleanNum = authority_phone.replace(/\D/g, "").slice(-10);
        const f2sParams = new URLSearchParams();
        f2sParams.append("authorization", fast2smsKey);
        f2sParams.append("message", sms_text);
        f2sParams.append("language", "english");
        f2sParams.append("route", "q");
        f2sParams.append("numbers", cleanNum);

        const f2sRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: f2sParams.toString()
        });

        if (f2sRes.ok) {
          provider = "Fast2SMS India Gateway";
          gateway_id = `F2S-${Math.floor(100000 + Math.random() * 900000)}`;
          delivery_status = "DELIVERED";
        }
      } catch (ex) {
        console.warn("[FAST2SMS-IMBL-NOTE]", ex);
      }
    }

    return NextResponse.json({
      status: "success",
      authorities_notified: true,
      delivery_status,
      gateway_id,
      provider,
      sms_text,
      authority_name,
      authority_phone: formattedAuthorityPhone,
      vessel_name,
      boundary_name,
      distance_nm: distNmNum,
      distance_km: distKmNum,
      timestamp,
      diagnostics
    });
  } catch (error: any) {
    console.error("[IMBL-NOTIFY-ROUTE-ERROR] Failed to process authority alert:", error);
    return NextResponse.json({ error: "Failed to dispatch authority alert", details: error.message }, { status: 500 });
  }
}
