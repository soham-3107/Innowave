import re
import random
from typing import Dict, Any, List
from agents.mock_data import MOCK_REGIONS, get_closest_region, COMMUNITY_REPORTS

def detect_language(text: str) -> str:
    """Detects whether input is Hindi, Marathi, or English."""
    devanagari_pattern = re.compile(r"[\u0900-\u097F]+")
    if not devanagari_pattern.search(text):
        return "en"
    marathi_keywords = ["आहे", "का", "नाही", "उद्या", "आज", "कसे", "मासे", "मासेमारी", "वारा", "लाटा", "धोका", "सुरक्षित"]
    marathi_count = sum(1 for word in marathi_keywords if word in text)
    return "mr" if marathi_count > 0 else "hi"

def extract_location(text: str) -> tuple[str, str, bool]:
    """
    Extracts location key from text query.
    Returns (location_key, trace_message, is_explicit)
    """
    text_lower = text.lower()
    
    variations = {
        "mumbai": ["mumbai", "bombay", "mumb", "mum", "मुम्बई", "मुंबई"],
        "goa": ["goa", "panaji", "panjim", "गोवा", "पणजी"],
        "kochi": ["kochi", "cochin", "cochy", "कोच्चि", "कोची"],
        "chennai": ["chennai", "madras", "चेन्नई", "मद्रास"],
        "veraval": ["veraval", "gujarat", "वेरावळ", "गुजरात"],
        "vizag": ["vizag", "visakhapatnam", "विशाखापट्टनम", "विशाखापट्टणम", "वाईझॅग"]
    }
    
    for key, words in variations.items():
        if any(w in text_lower for w in words):
            return key, f"Resolved location target: **{MOCK_REGIONS[key]['name']}**.", True
            
    return "mumbai", "No specific location detected, using Mumbai as default", False

def extract_time_context(text: str) -> str:
    """
    Extracts time keywords and returns a formatted string.
    """
    text_lower = text.lower()
    
    is_tomorrow = any(w in text_lower for w in ["tomorrow", "कल", "उद्या"])
    is_today = any(w in text_lower for w in ["today", "आज"])
    is_morning = any(w in text_lower for w in ["morning", "सकाळ", "सकाळी", "सुबह"])
    is_evening = any(w in text_lower for w in ["evening", "संध्याकाळ", "शाम"])
    is_week = any(w in text_lower for w in ["week", "हफ्ता", "आठवडा"])
    
    time_str = ""
    if is_tomorrow:
        time_str = "tomorrow"
    elif is_today:
        time_str = "today"
    
    if is_morning:
        time_str += " morning" if time_str else "morning"
    elif is_evening:
        time_str += " evening" if time_str else "evening"
    elif is_week:
        time_str += " this week" if time_str else "this week"
        
    return time_str.strip()

def run_agent_pipeline(query: str, client_lat: float = None, client_lon: float = None) -> Dict[str, Any]:
    """
    Executes Planner -> Intent Routing -> Specific Agents -> Community Agent -> Risk Agent -> Brain pipeline.
    """
    trace = []
    lang = detect_language(query)
    lang_name = "English" if lang == "en" else "Hindi (हिंदी)" if lang == "hi" else "Marathi (मराठी)"
    
    trace.append({
        "agent": "Planner Agent",
        "status": "completed",
        "message": f"Detected query language: **{lang_name}**. Deconstructing question structure."
    })
    
    # Extract Location
    location_key, loc_message, is_explicit_loc = extract_location(query)
    region_data = MOCK_REGIONS[location_key]
    trace.append({
        "agent": "Planner Agent",
        "status": "completed",
        "message": loc_message
    })
    
    # Extract Time Context
    time_context = extract_time_context(query)
    if time_context:
        trace.append({
            "agent": "Planner Agent",
            "status": "completed",
            "message": f"Time context parsed: **{time_context}**."
        })
        
    # Classify Intent
    query_lower = query.lower()
    is_tide = any(w in query_lower for w in ["tide", "tides", "high tide", "low tide", "भरती", "ओहोटी", "ज्वार", "भाटा"])
    is_fish = any(w in query_lower for w in ["fish", "pfz", "chlorophyll", "catch", "sardine", "mackerel", "मछली", "मासे", "मासेमारी"])
    is_weather = any(w in query_lower for w in ["weather", "wind", "storm", "rain", "temperature", "हवामान", "मौसम", "वारा", "वादळ"])
    is_gis = any(w in query_lower for w in ["border", "boundary", "imbl", "restricted", "navy", "सीमा", "प्रतिबंधित"])
    is_safe = any(w in query_lower for w in ["safe", "safety", "danger", "warning", "सुरक्षित", "धोका"])
    
    # Intent Resolution: If multiple intents match, resolve to general to run all calculations.
    matched_intents = []
    if is_tide: matched_intents.append("tide")
    if is_fish: matched_intents.append("fish")
    if is_weather: matched_intents.append("weather")
    if is_gis: matched_intents.append("gis")
    if is_safe: matched_intents.append("safety")
    
    if len(matched_intents) > 1:
        intent = "general"
    elif len(matched_intents) == 1:
        intent = matched_intents[0]
    else:
        intent = "general"
        
    trace.append({
        "agent": "Planner Agent",
        "status": "completed",
        "message": f"Query classified under **{intent.upper()}** domain. Dynamic routing active."
    })

    # Retrieve and apply random live fluctuations on mock data
    raw_wind = region_data["weather"]["wind_speed"]
    wind_val = round(max(2.0, raw_wind + random.uniform(-1.5, 1.5)), 1)
    
    raw_wave = region_data["ocean"]["wave_height"]
    wave_val = round(max(0.2, raw_wave + random.uniform(-0.15, 0.15)), 2)
    
    raw_chloro = region_data["satellite"]["chlorophyll"]
    chloro_val = round(max(0.1, raw_chloro + random.uniform(-0.3, 0.3)), 1)
    
    raw_sst = region_data["ocean"]["sst"]
    sst_val = round(raw_sst + random.uniform(-0.4, 0.4), 1)

    # Intent Routing Execution
    run_weather = intent in ["general", "weather", "safety"]
    run_ocean = intent in ["general", "weather", "safety", "fish"]
    run_satellite = intent in ["general", "fish"]
    run_tide = intent in ["general", "tide"]
    run_gis = intent in ["general", "safety", "gis"]
    run_risk = intent in ["general", "safety"]

    if run_weather:
        trace.append({
            "agent": "Weather Agent",
            "status": "completed",
            "message": f"Weather scan: Wind speed evaluated at **{wind_val} knots** ({region_data['weather']['wind_direction']}). Conditions are **{region_data['weather']['condition']}**."
        })
    if run_ocean:
        trace.append({
            "agent": "Ocean Agent",
            "status": "completed",
            "message": f"Ocean swap: Swells measured at **{wave_val}m**, current is **{region_data['ocean']['current_speed']} knots** at **{sst_val}°C**."
        })
    if run_satellite:
        trace.append({
            "agent": "Satellite Agent",
            "status": "completed",
            "message": f"Biochemical scan: Chlorophyll-a density calculated at **{chloro_val} mg/m³** ({region_data['satellite']['pfz_status']})."
        })
    if run_tide:
        trace.append({
            "agent": "Tide Agent",
            "status": "completed",
            "message": f"Tides limit check: High Tide: **{region_data['tide']['high_tide_1']}**, Low Tide: **{region_data['tide']['low_tide_1']}**."
        })
    if run_gis:
        restricted_msgs = [f"{z['name']} ({z['distance_km']} km)" for z in region_data["gis"]["restricted_zones"]]
        trace.append({
            "agent": "GIS Agent",
            "status": "completed",
            "message": f"Boundary scan: Distance to International Boundary (IMBL) is **{region_data['gis']['distance_to_imbl']} km**. Nearby zones: {', '.join(restricted_msgs)}."
        })
    
    # 5. Community Agent Integration
    region_reports = [r for r in COMMUNITY_REPORTS if r["region"] == location_key]
    community_risk_mod = 0
    if len(region_reports) > 0:
        latest_rep = region_reports[0]
        trace.append({
            "agent": "Community Agent",
            "status": "completed",
            "message": f"Retrieved {len(region_reports)} community reports. Latest report ({latest_rep['timestamp']}): '{latest_rep['text']}' (Type: **{latest_rep['type']}**)."
        })
        
        # Calculate risk modifier from reports
        for rep in region_reports:
            if rep["type"] == "Storm Warning":
                community_risk_mod += 15
            elif rep["type"] == "High Waves":
                community_risk_mod += 10
            elif rep["type"] == "Calm Seas":
                community_risk_mod -= 5
    else:
        trace.append({
            "agent": "Community Agent",
            "status": "completed",
            "message": f"No recent community logs compiled for {region_data['name']}."
        })
    
    # Risk Assessment
    total_risk = 0
    danger_level = "SAFE"
    if run_risk:
        imbl_val = region_data["gis"]["distance_to_imbl"]
        closest_restricted_dist = min([z["distance_km"] for z in region_data["gis"]["restricted_zones"]])
        
        wind_risk = min(35.0, (wind_val / 30.0) * 35.0)
        wave_risk = min(35.0, (wave_val / 4.0) * 35.0)
        gis_risk = 0.0
        if imbl_val < 100.0:
            gis_risk += (100.0 - imbl_val) * 0.3
        if closest_restricted_dist < 10.0:
            gis_risk += (10.0 - closest_restricted_dist) * 2.0
        gis_risk = min(30.0, gis_risk)
        
        # Factor in crowdsourced community modifier
        total_risk = round(max(0, min(100, wind_risk + wave_risk + gis_risk + community_risk_mod)))
        danger_level = "SAFE" if total_risk < 40 else "CAUTION" if total_risk < 70 else "DANGER"
        
        trace.append({
            "agent": "Risk Agent",
            "status": "completed",
            "message": f"Threat index compiled (Community adjustments included: {community_risk_mod:+}). Danger Score: **{total_risk}/100** ({danger_level})."
        })
    else:
        # Re-estimate danger score for alignment checks when Risk Agent was skipped
        wind_risk = min(35.0, (wind_val / 30.0) * 35.0)
        wave_risk = min(35.0, (wave_val / 4.0) * 35.0)
        total_risk = round(max(0, min(100, wind_risk + wave_risk + community_risk_mod)))
        danger_level = "SAFE" if total_risk < 40 else "CAUTION" if total_risk < 70 else "DANGER"

    # Calculate Agent Agreement & Confidence Score
    is_high_pfz = chloro_val >= 4.5
    is_unsafe = total_risk >= 15 # Lowered threat threshold to detect disagreement on minor caution alerts (e.g. Goa)
    
    if is_high_pfz and is_unsafe:
        agreement_status = "disagree"
        agreement_badge = "⚡ Agents partially disagree"
        agreement_explanation = "Fishing potential is high, but safety conditions are a concern."
        confidence_score = random.randint(80, 86)
    elif not is_high_pfz and total_risk >= 70:
        agreement_status = "agree"
        agreement_badge = "✅ Agents in agreement"
        agreement_explanation = "Agents align: low fishing potential and high wave danger."
        confidence_score = random.randint(92, 98)
    elif is_high_pfz and total_risk < 15:
        agreement_status = "agree"
        agreement_badge = "✅ Agents in agreement"
        agreement_explanation = "Agents align: favorable catch potential and safe sea states."
        confidence_score = random.randint(94, 98)
    else:
        agreement_status = "agree"
        agreement_badge = "✅ Agents in agreement"
        agreement_explanation = "All agents report normal baseline marine and safety thresholds."
        confidence_score = random.randint(88, 93)

    # Time context prefixes
    time_prefix_en = f"for **{time_context}**" if time_context else ""
    time_prefix_hi = f"**{time_context}** के लिए" if time_context else ""
    time_prefix_mr = f"**{time_context}** साठी" if time_context else ""

    # Synthesize dynamic texts
    if lang == "en":
        if is_explicit_loc:
            intro = f"Regarding your inquiry about {region_data['name']} {time_prefix_en}:"
        else:
            intro = f"Regarding your inquiry {time_prefix_en}:"
        
        if intent == "tide":
            body = f"Next High Tide will peak at {region_data['tide']['high_tide_1']} and Low Tide is scheduled at {region_data['tide']['low_tide_1']}."
        elif intent == "fish":
            body = f"Chlorophyll density is evaluated at {chloro_val} mg/m³ ({region_data['satellite']['pfz_status']}). Sea Surface Temperature is {sst_val}°C, representing high catch potential."
        elif intent == "weather":
            body = f"Winds are at {wind_val} knots under {region_data['weather']['condition']} skies. Wave height swell is measuring {wave_val}m."
        elif intent == "gis":
            body = f"The vessel is safely {region_data['gis']['distance_to_imbl']} km from the IMBL limit. Port boundary restricts are at {region_data['gis']['restricted_zones'][0]['distance_km']} km."
        elif intent == "safety":
            body = f"The risk level is calculated as {danger_level} (Danger Index: {total_risk}/100). Wave heights are at {wave_val}m and wind speeds are {wind_val} knots."
        else:
            body = f"Safety rating is {danger_level} (Wave: {wave_val}m, Wind: {wind_val} knots). Chlorophyll levels are at {chloro_val} mg/m³."
            
        # Add Community Sub-report Feed
        if len(region_reports) > 0:
            body += f"\n\n👥 **COMMUNITY LOGS**: {len(region_reports)} local reports verify this area. Latest alert: \"{region_reports[0]['text']}\" ({region_reports[0]['timestamp']})."
            
        final_answer = f"{intro}\n\n{body}"
        
    elif lang == "hi":
        if is_explicit_loc:
            intro = f"{region_data['name']} {time_prefix_hi} की स्थिति रिपोर्ट:"
        else:
            intro = f"आपके सवाल {time_prefix_hi} की स्थिति रिपोर्ट:"
        
        if intent == "tide":
            body = f"ज्वार-भाटा विवरण: अगला उच्च ज्वार {region_data['tide']['high_tide_1']} पर और निम्न ज्वार {region_data['tide']['low_tide_1']} पर है।"
        elif intent == "fish":
            body = f"उपग्रह के अनुसार यहाँ क्लोरोफिल स्तर {chloro_val} mg/m³ ({region_data['satellite']['pfz_status']}) है। मछली मिलने की संभावनाएं अच्छी हैं।"
        elif intent == "weather":
            body = f"मौसम विवरण: हवा की गति {wind_val} समुद्री मील और लहरों की ऊंचाई {wave_val} मीटर है।"
        elif intent == "gis":
            body = f"आप अंतर्राष्ट्रीय सीमा से {region_data['gis']['distance_to_imbl']} किमी दूर हैं। स्थानीय प्रतिबंधित क्षेत्र {region_data['gis']['restricted_zones'][0]['distance_km']} किमी पर है।"
        elif intent == "safety":
            body = f"सुरक्षा श्रेणी {danger_level} (जोखिम स्तर: {total_risk}/100) है। लहर की ऊंचाई {wave_val} मीटर और हवा की गति {wind_val} समुद्री मील है।"
        else:
            body = f"सुरक्षा स्तर {danger_level} है। वर्तमान लहर की ऊंचाई {wave_val} मीटर और हवा की गति {wind_val} समुद्री मील है। क्लोरोफिल स्तर {chloro_val} mg/m³ है।"
            
        if len(region_reports) > 0:
            body += f"\n\n👥 **स्थानीय मछुआरा रिपोर्ट**: यहाँ {len(region_reports)} हालिया रिपोर्ट मिली हैं। ताज़ा जानकारी: \"{region_reports[0]['text']}\" ({region_reports[0]['timestamp']})."
            
        final_answer = f"{intro}\n\n{body}"
        
    else:  # Marathi (mr)
        if is_explicit_loc:
            intro = f"{region_data['name']} Kinarpattivaril {time_prefix_mr} अहवाल:"
        else:
            intro = f"आपल्या चौकशीचा {time_prefix_mr} अहवाल:"
        
        if intent == "tide":
            body = f"भरती-ओहोटीचे वेळापत्रक: पुढील भरती {region_data['tide']['high_tide_1']} वाजता आणि ओहोटी {region_data['tide']['low_tide_1']} वाजता असेल."
        elif intent == "fish":
            body = f"मासेमारी संभाव्यता: उपग्रहानुसार क्लोरोफिल पातळी {chloro_val} mg/m³ असून हा परिसर संभाव्य मासेमारी क्षेत्र बनला आहे. सागरी पाण्याचे तापमान {sst_val}°C आहे."
        elif intent == "weather":
            body = f"हवामानाविषयी: वाऱ्याचा वेग {wind_val} नॉट्स असून लाटांची उंची {wave_val} मीटर आहे."
        elif intent == "gis":
            body = f"आन्तरराष्ट्रीय सागरी सीमेपासूनचे अंतर {region_data['gis']['distance_to_imbl']} किमी असून आपण सुरक्षित भागात आहात."
        elif intent == "safety":
            body = f"सुरक्षा पातळी {danger_level} (जोखिम निर्देशांक: {total_risk}/100) आहे. लाटांची उंची {wave_val} मी आणि वारे {wind_val} नॉट्स आहेत."
        else:
            body = f"आज सुरक्षा निर्देशांक {danger_level} आहे. लाटा {wave_val} मी आणि वारे {wind_val} नॉट्स आहेत. क्लोरोफिल पातळी {chloro_val} mg/m³ आहे."
            
        if len(region_reports) > 0:
            body += f"\n\n👥 **मच्छीमार समुदाय अहवाल**: या भागात {len(region_reports)} समुदाय नोंदी आहेत. ताजी नोंद: \"{region_reports[0]['text']}\" ({region_reports[0]['timestamp']})."
            
        final_answer = f"{intro}\n\n{body}"
        
    trace.append({
        "agent": "Brain Agent",
        "status": "completed",
        "message": f"Consolidated findings and translated dynamic output to user preferred language (**{lang_name}**)."
    })
    
    return {
        "query": query,
        "language": lang,
        "region": location_key,
        "region_name": region_data["name"],
        "coordinates": {"lat": region_data["lat"], "lon": region_data["lon"]},
        "metrics": {
            "wind_speed": wind_val,
            "wave_height": wave_val,
            "chlorophyll": chloro_val,
            "sst": sst_val,
            "danger_score": total_risk,
            "danger_level": danger_level
        },
        "gis": {
            "imbl_dist": region_data["gis"]["distance_to_imbl"],
            "restricted_zones": region_data["gis"]["restricted_zones"]
        },
        "agent_agreement": {
            "status": agreement_status,
            "badge_text": agreement_badge,
            "explanation": agreement_explanation
        },
        "confidence_score": confidence_score,
        "final_answer": final_answer,
        "reasoning_trace": trace
    }
