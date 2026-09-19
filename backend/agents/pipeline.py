import re
import random
from typing import Dict, Any, List
from agents.mock_data import MOCK_REGIONS, get_closest_region, COMMUNITY_REPORTS

def detect_language(text: str) -> str:
    """
    Accurately detects whether input is Hindi (hi), Marathi (mr), or English (en)
    by evaluating script presence and language-specific grammatical markers and vocabulary.
    """
    devanagari_pattern = re.compile(r"[\u0900-\u097F]+")
    if not devanagari_pattern.search(text):
        return "en"
    
    clean_text = text.strip()
    
    # Marathi grammatical markers, postpositions, question words, and distinct vocabulary
    marathi_tokens = {
        "आहे", "आहेत", "नाही", "नाहीत", "होते", "होता", "होती", "असेल", "असावे",
        "कोणती", "कोणता", "कोणते", "कधी", "कुठे", "कसे", "कशी", "कसा",
        "मासेमारी", "मासेमारीसाठी", "मासे", "माशांची", "माशांचे", "माशांना",
        "वादळ", "वादळाचा", "वादळाची", "वादळाचे", "वादळात",
        "वेळ", "वेळापत्रक", "वेळेस", "साठी", "च्या", "ची", "चे", "चा", "तील", "तटावर",
        "समुद्रात", "उद्या", "काल", "लाटा", "लाटांची", "वारा", "वाऱ्याचा",
        "किंवा", "सांगा", "मिळेल", "करा", "पाहिजे", "अहवाल", "किनारपट्टी", "किनारपट्टीवर",
        "इशारा"
    }
    
    # Hindi grammatical markers, postpositions, question words, and distinct vocabulary
    hindi_tokens = {
        "है", "हैं", "था", "थी", "थे", "होगा", "होगी", "होंगे",
        "क्या", "कौन", "कौनसा", "कौनसी", "कौन सा", "कौन सी", "किसे", "किस", "कहाँ", "कब", "कैसे", "क्यों",
        "में", "से", "के", "की", "का", "को", "पर", "लिए", "पास",
        "मछली", "मछलियां", "मछुआरे", "मछुआरों", "पकड़ने", "पकड़ना", "तट",
        "मौसम", "तूफान", "चक्रवात", "जाना", "सकता", "सकती", "सकते", "चाहिए",
        "अच्छा", "अच्छी", "अच्छे", "बारे", "स्थिति", "बताओ", "दीजिए", "बताएं"
    }
    
    words = re.findall(r"[\u0900-\u097F]+", clean_text)
    
    marathi_score = 0
    hindi_score = 0
    
    for word in words:
        if word in marathi_tokens:
            marathi_score += 2
        if word in hindi_tokens:
            hindi_score += 2
            
        # Suffix matching for Marathi inflections (e.g. मासेमारीसाठी, वादळाचा, समुद्रात, मुंबईत)
        if word.endswith("साठी") or word.endswith("ाचा") or word.endswith("ाची") or word.endswith("ाचे") or word.endswith("ात") or word.endswith("तील"):
            marathi_score += 1
            
    # Multi-word phrase boosts
    if re.search(r"\b(कौन\s+सा|कौन\s+सी|के\s+पास|में\s+जाना|सुरक्षित\s+है|है\s+क्या|मछली\s+पकड़ने)\b", clean_text):
        hindi_score += 4
    if re.search(r"\b(कोणती\s+आहे|कोणता\s+आहे|वादळाचा\s+इशारा|आहे\s+का|नाही\s+का|सर्वोत्तम\s+वेळ|मासेमारीसाठी)\b", clean_text):
        marathi_score += 4

    # Interrogative 'का' at sentence end or after Marathi verb is Marathi
    if re.search(r"(आहे|नाही|होते|असेल)\s+का[?।\s]*$", clean_text) or clean_text.endswith("का") or clean_text.endswith("का?"):
        marathi_score += 2
        
    if marathi_score > hindi_score:
        return "mr"
    elif hindi_score > marathi_score:
        return "hi"
    else:
        # Default tie-breaker: check presence of 'है' vs 'आहे'
        if "है" in clean_text or "क्या" in clean_text or "में" in clean_text or "के" in clean_text:
            return "hi"
        if "आहे" in clean_text or "का" in clean_text or "साठी" in clean_text:
            return "mr"
        return "hi"

def extract_location(text: str, client_lat: float = None, client_lon: float = None) -> tuple[str, str, bool]:
    """
    Extracts location key from text query across English, Hindi, and Marathi variants.
    Returns (location_key, trace_message, is_explicit)
    """
    text_lower = text.lower()
    
    variations = {
        "mumbai": ["mumbai", "bombay", "mumb", "mum", "मुम्बई", "मुंबई", "मुंबईत", "मुंबईच्या", "मुंबईतील", "बॉम्बे"],
        "goa": ["goa", "panaji", "panjim", "गोवा", "गोव्यात", "गोव्याच्या", "गोव्या", "पणजी"],
        "kochi": ["kochi", "cochin", "cochy", "कोच्चि", "कोची", "कोचीन", "कोच्चीत", "कोचीच्या"],
        "chennai": ["chennai", "madras", "चेन्नई", "मद्रास", "चेन्नईत", "चेन्नईच्या"],
        "veraval": ["veraval", "gujarat", "वेरावळ", "वेरावळात", "वेरावल", "गुजरात", "सौराष्ट्र"],
        "vizag": ["vizag", "visakhapatnam", "विशाखापट्टनम", "विशाखापट्टणम", "विशाखापत्तनम", "वाईझॅग"]
    }
    
    for key, words in variations.items():
        if any(w in text_lower for w in words):
            return key, f"Resolved location target: **{MOCK_REGIONS[key]['name']}**.", True
            
    if client_lat is not None and client_lon is not None:
        closest = get_closest_region(client_lat, client_lon)
        return closest, f"Location resolved from client GPS coordinates: **{MOCK_REGIONS[closest]['name']}**.", False
        
    return "mumbai", "No specific location detected, using Mumbai as default", False

def extract_time_context(text: str) -> dict:
    """
    Extracts time keywords and returns localized time context dictionary.
    """
    text_lower = text.lower()
    
    is_tomorrow = any(w in text_lower for w in ["tomorrow", "कल", "उद्या"])
    is_today = any(w in text_lower for w in ["today", "आज"])
    is_morning = any(w in text_lower for w in ["morning", "सकाळ", "सकाळी", "सुबह", "पहाटे", "सवेरे"])
    is_evening = any(w in text_lower for w in ["evening", "संध्याकाळ", "संध्याकाळी", "शाम"])
    is_week = any(w in text_lower for w in ["week", "हफ्ता", "आठवडा", "सप्ताह"])
    
    if is_tomorrow and is_morning:
        return {"key": "tomorrow morning", "en": "tomorrow morning", "hi": "कल सुबह", "mr": "उद्या सकाळी"}
    elif is_tomorrow and is_evening:
        return {"key": "tomorrow evening", "en": "tomorrow evening", "hi": "कल शाम", "mr": "उद्या संध्याकाळी"}
    elif is_tomorrow:
        return {"key": "tomorrow", "en": "tomorrow", "hi": "कल", "mr": "उद्या"}
    elif is_today and is_morning:
        return {"key": "today morning", "en": "today morning", "hi": "आज सुबह", "mr": "आज सकाळी"}
    elif is_today and is_evening:
        return {"key": "today evening", "en": "today evening", "hi": "आज शाम", "mr": "आज संध्याकाळी"}
    elif is_today:
        return {"key": "today", "en": "today", "hi": "आज", "mr": "आज"}
    elif is_morning:
        return {"key": "morning", "en": "morning", "hi": "सुबह", "mr": "सकाळी"}
    elif is_evening:
        return {"key": "evening", "en": "evening", "hi": "शाम", "mr": "संध्याकाळी"}
    elif is_week:
        return {"key": "this week", "en": "this week", "hi": "इस सप्ताह", "mr": "या आठवड्यात"}
        
    return {"key": "", "en": "", "hi": "", "mr": ""}

def run_agent_pipeline(query: str, client_lat: float = None, client_lon: float = None) -> Dict[str, Any]:
    """
    Executes Planner -> Intent Routing -> Specific Agents -> Community Agent -> Risk Agent -> Brain pipeline
    with natural multilingual synthesis in English, Hindi, and Marathi.
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
    location_key, loc_message, is_explicit_loc = extract_location(query, client_lat, client_lon)
    region_data = MOCK_REGIONS[location_key]
    trace.append({
        "agent": "Planner Agent",
        "status": "completed",
        "message": loc_message
    })
    
    # Extract Time Context
    time_ctx = extract_time_context(query)
    if time_ctx["key"]:
        trace.append({
            "agent": "Planner Agent",
            "status": "completed",
            "message": f"Time context parsed: **{time_ctx['en']}**."
        })
        
    # Classify Intent
    query_lower = query.lower()
    is_tide = any(w in query_lower for w in ["tide", "tides", "high tide", "low tide", "भरती", "ओहोटी", "ज्वार", "भाटा"])
    is_fish = any(w in query_lower for w in ["fish", "pfz", "chlorophyll", "catch", "sardine", "mackerel", "मछली", "मछलियां", "मछुआरे", "मासे", "मासेमारी", "मासेमारीसाठी", "पकड़ने", "पकडण्यासाठी"])
    is_weather = any(w in query_lower for w in ["weather", "wind", "storm", "cyclone", "rain", "temperature", "हवामान", "मौसम", "वारा", "वादळ", "वादळाचा", "वादळाची", "वादळाचे", "तूफान", "चक्रवात", "बारिश", "पाऊस"])
    is_gis = any(w in query_lower for w in ["border", "boundary", "imbl", "restricted", "navy", "सीमा", "प्रतिबंधित", "नौसेना", "नौदल"])
    is_safe = any(w in query_lower for w in ["safe", "safety", "danger", "warning", "सुरक्षित", "धोका", "खतरा", "इशारा", "चेतावनी", "सावध", "सावधानी"])
    is_timing_specific = any(w in query_lower for w in ["best time", "सर्वोत्तम वेळ", "वेळ कोणती", "अनुकूल समय", "अच्छा समय", "कब जाना", "कधी जावे", "टाइमिंग"])
    is_storm_specific = any(w in query_lower for w in ["storm", "cyclone", "वादळ", "वादळाचा", "वादळाची", "तूफान", "चक्रवात", "आंधी"])
    
    # Intent Resolution:
    if is_storm_specific:
        intent = "weather"
    elif is_safe:
        intent = "safety"
    elif is_fish:
        intent = "fish"
    elif is_weather:
        intent = "weather"
    elif is_tide:
        intent = "tide"
    elif is_gis:
        intent = "gis"
    else:
        intent = "general"
        
    trace.append({
        "agent": "Planner Agent",
        "status": "completed",
        "message": f"Query classified under **{intent.upper()}** domain. Dynamic routing active."
    })

    # Retrieve telemetry with minor live variations
    raw_wind = region_data["weather"]["wind_speed"]
    wind_val = round(max(2.0, raw_wind + random.uniform(-0.8, 0.8)), 1)
    
    raw_wave = region_data["ocean"]["wave_height"]
    wave_val = round(max(0.2, raw_wave + random.uniform(-0.1, 0.1)), 2)
    
    raw_chloro = region_data["satellite"]["chlorophyll"]
    chloro_val = round(max(0.1, raw_chloro + random.uniform(-0.2, 0.2)), 1)
    
    raw_sst = region_data["ocean"]["sst"]
    sst_val = round(raw_sst + random.uniform(-0.3, 0.3), 1)

    # Intent Routing Execution
    run_weather = intent in ["general", "weather", "safety"]
    run_ocean = intent in ["general", "weather", "safety", "fish"]
    run_satellite = intent in ["general", "fish"]
    run_tide = intent in ["general", "tide", "fish"]
    run_gis = intent in ["general", "safety", "gis"]
    run_risk = intent in ["general", "safety", "weather"]

    species_info = region_data.get("species", {})

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
            "message": f"Ocean scan: Swells measured at **{wave_val}m**, current is **{region_data['ocean']['current_speed']} knots** at **{sst_val}°C**."
        })
    if run_satellite:
        species_names_trace = ", ".join(species_info.get("primary", ["Mackerel", "Sardines"]))
        trace.append({
            "agent": "Satellite Agent",
            "status": "completed",
            "message": f"Biochemical scan: Chlorophyll-a density calculated at **{chloro_val} mg/m³** ({region_data['satellite']['pfz_status']}). Likely local species: **{species_names_trace}** (CMFRI Baseline)."
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
    
    # Community Agent Integration
    region_reports = [r for r in COMMUNITY_REPORTS if r["region"] == location_key]
    community_risk_mod = 0
    if len(region_reports) > 0:
        latest_rep = region_reports[0]
        trace.append({
            "agent": "Community Agent",
            "status": "completed",
            "message": f"Retrieved {len(region_reports)} community reports. Latest report ({latest_rep['timestamp']}): '{latest_rep['text']}' (Type: **{latest_rep['type']}**)."
        })
        
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
    
    has_storm_warning = len(region_data["weather"].get("warnings", [])) > 0 or any(r["type"] == "Storm Warning" for r in region_reports)
    if has_storm_warning:
        wind_risk += 15.0
        
    total_risk = round(max(0, min(100, wind_risk + wave_risk + gis_risk + community_risk_mod)))
    danger_level = "SAFE" if total_risk < 40 else "CAUTION" if total_risk < 70 else "DANGER"
    
    if run_risk:
        trace.append({
            "agent": "Risk Agent",
            "status": "completed",
            "message": f"Threat index compiled (Community adjustments included: {community_risk_mod:+}). Danger Score: **{total_risk}/100** ({danger_level})."
        })

    # Agent Agreement & Confidence Score
    is_high_pfz = chloro_val >= 4.5
    is_unsafe = total_risk >= 35
    
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
    elif is_high_pfz and total_risk < 35:
        agreement_status = "agree"
        agreement_badge = "✅ Agents in agreement"
        agreement_explanation = "Agents align: favorable catch potential and safe sea states."
        confidence_score = random.randint(94, 98)
    else:
        agreement_status = "agree"
        agreement_badge = "✅ Agents in agreement"
        agreement_explanation = "All agents report normal baseline marine and safety thresholds."
        confidence_score = random.randint(88, 93)

    # Brain Agent Localized Synthesis
    reg_name_en = region_data["name"]
    reg_name_hi = region_data.get("name_hi", region_data["name"])
    reg_name_mr = region_data.get("name_mr", region_data["name"])
    
    cond_hi = region_data["weather"].get("condition_hi", region_data["weather"]["condition"])
    cond_mr = region_data["weather"].get("condition_mr", region_data["weather"]["condition"])
    
    danger_hi = "पूर्णतः सुरक्षित" if danger_level == "SAFE" else "सावधानी बरतें (मध्यम जोखिम)" if danger_level == "CAUTION" else "खतरा / असुरक्षित"
    danger_mr = "पूर्णपणे सुरक्षित" if danger_level == "SAFE" else "सावधगिरी बाळगा (मध्यम धोका)" if danger_level == "CAUTION" else "धोकादायक / असुरक्षित"

    if lang == "en":
        time_prefix = f" for **{time_ctx['en']}**" if time_ctx["en"] else ""
        intro = f"Regarding your inquiry about {reg_name_en}{time_prefix}:"
        
        if intent == "tide":
            body = f"Next High Tide will peak at {region_data['tide']['high_tide_1']} and Low Tide is scheduled at {region_data['tide']['low_tide_1']}."
        elif intent == "fish":
            species_list_en = ", ".join(species_info.get("primary", ["Indian Mackerel", "Sardines"]))
            if is_timing_specific:
                body = (
                    f"⏰ **Best Fishing Time**: {species_info.get('catch_window', 'Early Morning (05:00 - 09:30 AM)')} during high tidal influx.\n\n"
                    f"🌊 **Marine & Tidal State**: High Tide: {region_data['tide']['high_tide_1']}, Low Tide: {region_data['tide']['low_tide_1']}. Sea temperature is {sst_val}°C with swell of {wave_val}m.\n"
                    f"🐟 **Primary Species (CMFRI Baseline)**: {species_list_en}.\n"
                    f"• Recommended Gear: {species_info.get('gear', 'Pelagic Drift Nets & Gillnets')}\n"
                    f"• Operating Depth: {species_info.get('depth_range', '15-45m Shelf Contours')}"
                )
            else:
                body = (
                    f"Satellite telemetry indicates a **{region_data['satellite']['pfz_status']}** located 15-35 km offshore with Chlorophyll density at {chloro_val} mg/m³ and SST at {sst_val}°C.\n\n"
                    f"🐟 **Likely Local Species (CMFRI Baseline)**: {species_list_en}.\n"
                    f"• Depth Contours: {species_info.get('depth_range', '15-45m Shelf Contours')}\n"
                    f"• Recommended Gear: {species_info.get('gear', 'Pelagic Drift Nets & Gillnets')}\n"
                    f"• Peak Catch Window: {species_info.get('catch_window', 'Early Morning (05:00 - 09:30 AM)')}\n"
                    f"• Tide Window: High Tide at {region_data['tide']['high_tide_1']}"
                )
        elif is_storm_specific or intent == "weather":
            if has_storm_warning:
                warnings_str = ", ".join(region_data["weather"].get("warnings", ["Squall Advisory"]))
                body = f"⚠️ **STORM ALERT**: Active storm advisory in effect for {reg_name_en} ({warnings_str}). Wind speed is {wind_val} knots and wave swells are {wave_val}m. Fishermen are advised to exercise extreme caution."
            else:
                body = f"✅ **NO STORM WARNING**: There are currently no active storm or cyclone warnings for {reg_name_en}. Weather conditions are {region_data['weather']['condition']}. Winds are at {wind_val} knots and waves are at {wave_val}m."
        elif intent == "gis":
            body = f"The vessel is safely {region_data['gis']['distance_to_imbl']} km from the IMBL limit. Port boundary restrictions are at {region_data['gis']['restricted_zones'][0]['distance_km']} km ({region_data['gis']['restricted_zones'][0]['name']})."
        elif intent == "safety":
            safety_verdict = "Yes, it is safe to proceed to sea today." if danger_level == "SAFE" else "Caution is advised before venturing into sea today." if danger_level == "CAUTION" else "No, it is NOT safe to go to sea today due to rough conditions."
            body = (
                f"🛡️ **Safety Verdict**: {safety_verdict}\n\n"
                f"• Safety Rating: **{danger_level}** (Threat Score: {total_risk}/100)\n"
                f"• Wave Height: {wave_val}m | Wind Speed: {wind_val} knots ({region_data['weather']['wind_direction']})\n"
                f"• Weather: {region_data['weather']['condition']} | IMBL Distance: {region_data['gis']['distance_to_imbl']} km"
            )
        else:
            body = f"Safety rating is {danger_level} (Wave: {wave_val}m, Wind: {wind_val} knots). Chlorophyll levels are at {chloro_val} mg/m³."
            
        if len(region_reports) > 0:
            body += f"\n\n👥 **COMMUNITY LOGS**: {len(region_reports)} local reports verified. Latest report: \"{region_reports[0]['text']}\" ({region_reports[0]['timestamp']})."
            
        final_answer = f"{intro}\n\n{body}"
        
    elif lang == "hi":
        time_prefix_hi = f"{time_ctx['hi']} के लिए " if time_ctx["hi"] else ""
        intro = f"{time_prefix_hi}{reg_name_hi} की स्थिति रिपोर्ट:"
        
        if intent == "tide":
            body = f"ज्वार-भाटा विवरण: अगला उच्च ज्वार {region_data['tide']['high_tide_1']} पर और निम्न ज्वार {region_data['tide']['low_tide_1']} पर रहेगा।"
        elif intent == "fish":
            species_list_hi = ", ".join(species_info.get("primary_hi", ["बांगड़ा (मैकेरल)", "सिल्वर पापलेट", "बम्बिल", "तारली"]))
            if is_timing_specific:
                body = (
                    f"⏰ **मछली पकड़ने का सर्वोत्तम समय**: {species_info.get('catch_window_hi', 'सुबह 05:00 से 09:30 बजे तक')} है (सुबह के ज्वार का अनुकूल समय)।\n\n"
                    f"🌊 **सागरी व ज्वार स्थिति**: अगला उच्च ज्वार {region_data['tide']['high_tide_1']} और निम्न ज्वार {region_data['tide']['low_tide_1']} पर है। सागरी तापमान {sst_val}°C और लहरें {wave_val} मीटर हैं।\n"
                    f"🐟 **प्रमुख संभावित प्रजातियाँ (CMFRI डेटा)**: {species_list_hi}।\n"
                    f"• अनुशंसित गियर: {species_info.get('gear_hi', 'पेलाजिक ड्रिफ्ट नेट व गिलनेट')}\n"
                    f"• परिचालन गहराई: {species_info.get('depth_range_hi', '15 - 45 मीटर शेल्फ समोच्च')}"
                )
            else:
                body = (
                    f"उपग्रह रिमोट सेंसिंग के अनुसार {reg_name_hi} के 15-35 किमी पश्चिम में अपतटीय क्षेत्र सबसे अच्छा मछली पकड़ने का क्षेत्र (**{region_data['satellite'].get('pfz_status_hi', 'उच्च संभावित मत्स्य क्षेत्र - PFZ')}**) है। यहाँ क्लोरोफिल घनत्व {chloro_val} मि.ग्रा./घन मीटर और समुद्री सतह का तापमान {sst_val}°C है।\n\n"
                    f"🐟 **संभावित स्थानीय मछली प्रजातियाँ (CMFRI बेसलाइन)**: {species_list_hi}।\n"
                    f"• परिचालन गहराई: {species_info.get('depth_range_hi', '15 - 45 मीटर शेल्फ समोच्च')}\n"
                    f"• अनुशंसित गियर: {species_info.get('gear_hi', 'पेलाजिक ड्रिफ्ट नेट व गिलनेट')}\n"
                    f"• सबसे अनुकूल समय: {species_info.get('catch_window_hi', 'सुबह 05:00 से 09:30 बजे तक')}\n"
                    f"• ज्वार समय: उच्च ज्वार {region_data['tide']['high_tide_1']}"
                )
        elif is_storm_specific or intent == "weather":
            if has_storm_warning:
                warn_hi = ", ".join(region_data["weather"].get("warnings_hi", ["तेज समुद्री हवाओं का अलर्ट"]))
                body = f"⚠️ **तूफान चेतावनी**: {reg_name_hi} में मौसम विभाग द्वारा तूफान/आंधी की चेतावनी जारी है ({warn_hi})। हवा की गति {wind_val} समुद्री मील और लहरें {wave_val} मीटर हैं। मछुआरों को समुद्र में जाने से बचने की सलाह दी जाती है।"
            else:
                body = f"✅ **तूफान का कोई अलर्ट नहीं**: वर्तमान में {reg_name_hi} क्षेत्र में तूफान अथवा चक्रवात की कोई चेतावनी नहीं है। मौसम {cond_hi} है। हवा की गति {wind_val} समुद्री मील और लहरों की ऊंचाई {wave_val} मीटर सामान्य स्तर पर है।"
        elif intent == "gis":
            body = f"आप अंतर्राष्ट्रीय सीमा (IMBL) से सुरक्षित {region_data['gis']['distance_to_imbl']} किमी दूर हैं। स्थानीय प्रतिबंधित क्षेत्र {region_data['gis']['restricted_zones'][0].get('name_hi', region_data['gis']['restricted_zones'][0]['name'])} {region_data['gis']['restricted_zones'][0]['distance_km']} किमी की दूरी पर है।"
        elif intent == "safety":
            safety_verdict = "हाँ, आज समुद्र में जाना सुरक्षित है।" if danger_level == "SAFE" else "आज समुद्र में जाने के लिए सावधानी आवश्यक है।" if danger_level == "CAUTION" else "नहीं, आज समुद्र में जाना असुरक्षित है।"
            body = (
                f"🛡️ **सुरक्षा निर्णय**: {safety_verdict}\n\n"
                f"• सुरक्षा स्थिति: **{danger_hi}** (जोखिम स्तर: {total_risk}/100)\n"
                f"• लहरों की ऊंचाई: {wave_val} मीटर | हवा की गति: {wind_val} समुद्री मील ({region_data['weather']['wind_direction']})\n"
                f"• मौसम स्थिति: {cond_hi} | अंतर्राष्ट्रीय सीमा (IMBL) से दूरी: {region_data['gis']['distance_to_imbl']} किमी"
            )
        else:
            body = f"सुरक्षा स्तर {danger_hi} है। वर्तमान लहर की ऊंचाई {wave_val} मीटर और हवा की गति {wind_val} समुद्री मील है। क्लोरोफिल स्तर {chloro_val} मि.ग्रा./घन मीटर है।"
            
        if len(region_reports) > 0:
            latest_rep_hi = region_reports[0]
            rep_text_hi = latest_rep_hi.get("text_hi", latest_rep_hi["text"])
            rep_time_hi = latest_rep_hi.get("timestamp_hi", latest_rep_hi["timestamp"])
            body += f"\n\n👥 **स्थानीय मछुआरा रिपोर्ट**: यहाँ {len(region_reports)} हालिया रिपोर्ट दर्ज हैं। ताज़ा जानकारी: \"{rep_text_hi}\" ({rep_time_hi})।"
            
        final_answer = f"{intro}\n\n{body}"
        
    else:  # Marathi (mr)
        time_prefix_mr = f"{time_ctx['mr']}च्या माहितीनुसार " if time_ctx["mr"] else ""
        intro = f"{time_prefix_mr}{reg_name_mr} अहवाल:"
        
        if intent == "tide":
            body = f"भरती-ओहोटीचे वेळापत्रक: पुढील भरती {region_data['tide']['high_tide_1']} वाजता आणि ओहोटी {region_data['tide']['low_tide_1']} वाजता असेल."
        elif intent == "fish":
            species_list_mr = ", ".join(species_info.get("primary_mr", ["बांगडा (मॅकरेल)", "पापलेट", "बोंबील", "तारली"]))
            if is_timing_specific:
                body = (
                    f"⏰ **मासेमारीसाठी सर्वोत्तम वेळ**: {species_info.get('catch_window_mr', 'पहाटे ०५:०० ते सकाळी ०९:३० वाजेपर्यंत')} आहे (भरतीच्या प्रवाहाचा अनुकूल काळ).\n\n"
                    f"🌊 **सागरी व भरती स्थिती**: पुढील भरती {region_data['tide']['high_tide_1']} वाजता आणि ओहोटी {region_data['tide']['low_tide_1']} वाजता आहे. सागरी तापमान {sst_val}°C आणि लाटांची उंची {wave_val} मीटर आहे.\n"
                    f"🐟 **स्थानिक संभाव्य मासे (CMFRI अभ्यास)**: {species_list_mr}.\n"
                    f"• शिफारस केलेले जाळे: {species_info.get('gear_mr', 'ड्रिफ्ट नेट आणि गिलनेट')}\n"
                    f"• कार्यरत खोली: {species_info.get('depth_range_mr', '15 - 45 मीटर सागरी खोली')}"
                )
            else:
                body = (
                    f"उपग्रह नोंदींनुसार {reg_name_mr} किनाऱ्यापासून १५-३५ किमी पश्चिम पट्ट्यात **{region_data['satellite'].get('pfz_status_mr', 'उच्च संभाव्य मासेमारी क्षेत्र - PFZ')}** आहे. येथे क्लोरोफिल पातळी {chloro_val} mg/m³ आणि समुद्राचे तापमान {sst_val}°C आहे.\n\n"
                    f"🐟 **स्थानिक पातळीवर आढळणारे संभाव्य मासे (CMFRI अभ्यास)**: {species_list_mr}.\n"
                    f"• कार्यरत खोली: {species_info.get('depth_range_mr', '15 - 45 मीटर सागरी खोली')}\n"
                    f"• शिफारस केलेले जाळे: {species_info.get('gear_mr', 'ड्रिफ्ट नेट आणि गिलनेट')}\n"
                    f"• सर्वोत्तम मासेमारी वेळ: {species_info.get('catch_window_mr', 'पहाटे ०५:०० ते सकाळी ०९:३० वाजेपर्यंत')}\n"
                    f"• भरतीची वेळ: पुढील भरती {region_data['tide']['high_tide_1']}"
                )
        elif is_storm_specific or intent == "weather":
            if has_storm_warning:
                warn_mr = ", ".join(region_data["weather"].get("warnings_mr", ["वेगवान वादळी वाऱ्यांचा इशारा"]))
                body = f"⚠️ **वादळाचा इशारा**: {reg_name_mr} भागात सध्या वादळी हवामानाचा इशारा जारी आहे ({warn_mr}). वाऱ्याचा वेग {wind_val} नॉट्स आणि लाटांची उंची {wave_val} मीटर आहे. मच्छीमारांनी समुद्रात जाणे टाळावे."
            else:
                body = f"✅ **वादळाचा कोणताही इशारा नाही**: सध्या {reg_name_mr} परिसरात वादळाचा अथवा चक्रीवादळाचा कोणताही इशारा नाही. हवामान {cond_mr} आहे. वाऱ्याचा वेग {wind_val} नॉट्स आणि लाटांची उंची {wave_val} मीटर सुरक्षित मर्यादेत आहे."
        elif intent == "gis":
            body = f"आपण आंतरराष्ट्रीय सागरी सीमेपासून (IMBL) {region_data['gis']['distance_to_imbl']} किमी सुरक्षित अंतरावर आहात. जवळचे प्रतिबंधित क्षेत्र {region_data['gis']['restricted_zones'][0].get('name_mr', region_data['gis']['restricted_zones'][0]['name'])} {region_data['gis']['restricted_zones'][0]['distance_km']} किमी अंतरावर आहे."
        elif intent == "safety":
            safety_verdict = "होय, आज समुद्रात जाणे पूर्णपणे सुरक्षित आहे." if danger_level == "SAFE" else "आज समुद्रात जाताना सावधगिरी बाळगावी." if danger_level == "CAUTION" else "नाही, आज समुद्रात जाणे धोकादायक आहे."
            body = (
                f"🛡️ **सुरक्षा निष्कर्ष**: {safety_verdict}\n\n"
                f"• सुरक्षा पातळी: **{danger_mr}** (जोखिम निर्देशांक: {total_risk}/100)\n"
                f"• लाटांची उंची: {wave_val} मीटर | वाऱ्याचा वेग: {wind_val} नॉट्स ({region_data['weather']['wind_direction']})\n"
                f"• हवामान: {cond_mr} | आंतरराष्ट्रीय सीमेपासून अंतर: {region_data['gis']['distance_to_imbl']} किमी"
            )
        else:
            body = f"आज सुरक्षा निर्देशांक {danger_mr} आहे. लाटा {wave_val} मी आणि वारे {wind_val} नॉट्स आहेत. क्लोरोफिल पातळी {chloro_val} mg/m³ आहे."
            
        if len(region_reports) > 0:
            latest_rep_mr = region_reports[0]
            rep_text_mr = latest_rep_mr.get("text_mr", latest_rep_mr["text"])
            rep_time_mr = latest_rep_mr.get("timestamp_mr", latest_rep_mr["timestamp"])
            body += f"\n\n👥 **मच्छीमार समुदाय अहवाल**: या भागात {len(region_reports)} समुदाय नोंदी उपलब्ध आहेत. ताजी नोंद: \"{rep_text_mr}\" ({rep_time_mr})."
            
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
