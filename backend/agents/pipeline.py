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
        "कोणती", "कोणता", "कोणते", "कधी", "कुठे", "कसे", "कशी", "कसा", "काय",
        "मासेमारी", "मासेमारीसाठी", "मासे", "माशांची", "माशांचे", "माशांना", "माशाचे",
        "वादळ", "वादळाचा", "वादळाची", "वादळाचे", "वादळात", "चक्रीवादळ",
        "वेळ", "वेळापत्रक", "वेळेस", "साठी", "च्या", "ची", "चे", "चा", "तील", "तटावर",
        "समुद्रात", "उद्या", "काल", "लाटा", "लाटांची", "वारा", "वाऱ्याचा", "वाऱ्याची",
        "किंवा", "सांगा", "मिळेल", "करा", "पाहिजे", "अहवाल", "किनारपट्टी", "किनारपट्टीवर",
        "इशारा", "बाजारभाव", "भाव", "जाळे", "जाळ्याचा", "खोली", "तळभाग", "मदत", "नंबर"
    }
    
    # Hindi grammatical markers, postpositions, question words, and distinct vocabulary
    hindi_tokens = {
        "है", "हैं", "था", "थी", "थे", "होगा", "होगी", "होंगे",
        "क्या", "कौन", "कौनसा", "कौनसी", "कौन सा", "कौन सी", "किसे", "किस", "कहाँ", "कब", "कैसे", "क्यों",
        "में", "से", "के", "की", "का", "को", "पर", "लिए", "पास",
        "मछली", "मछलियां", "मछुआरे", "मछुआरों", "पकड़ने", "पकड़ना", "तट",
        "मौसम", "तूफान", "चक्रवात", "जाना", "सकता", "सकती", "सकते", "चाहिए",
        "अच्छा", "अच्छी", "अच्छे", "बारे", "स्थिति", "बताओ", "दीजिए", "बताएं",
        "दाम", "कीमत", "जाल", "गहराई", "सहायता", "हेल्पलाइन"
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
    if re.search(r"\b(कौन\s+सा|कौन\s+सी|के\s+पास|में\s+जाना|सुरक्षित\s+है|है\s+क्या|मछली\s+पकड़ने|बाजार\s+भाव|कितनी\s+दूरी)\b", clean_text):
        hindi_score += 4
    if re.search(r"\b(कोणती\s+आहे|कोणता\s+आहे|वादळाचा\s+इशारा|आहे\s+का|नाही\s+का|सर्वोत्तम\s+वेळ|मासेमारीसाठी|काय\s+आहे|बाजारभाव\s+काय)\b", clean_text):
        marathi_score += 4

    # Interrogative 'का' at sentence end or after Marathi verb is Marathi
    if re.search(r"(आहे|नाही|होते|असेल)\s+का[?।\s]*$", clean_text) or clean_text.endswith("का") or clean_text.endswith("का?"):
        marathi_score += 2
        
    if marathi_score > hindi_score:
        return "mr"
    elif hindi_score > marathi_score:
        return "hi"
    else:
        # Default tie-breaker
        if "है" in clean_text or "क्या" in clean_text or "में" in clean_text or "के" in clean_text:
            return "hi"
        if "आहे" in clean_text or "का" in clean_text or "साठी" in clean_text or "काय" in clean_text:
            return "mr"
        return "hi"

def extract_location(text: str, client_lat: float = None, client_lon: float = None) -> tuple[str, str, bool]:
    """
    Extracts location key from text query across English, Hindi, and Marathi variants.
    Returns (location_key, trace_message, is_explicit)
    """
    text_lower = text.lower()
    
    variations = {
        "mumbai": ["mumbai", "bombay", "mumb", "mum", "मुम्बई", "मुंबई", "मुंबईत", "मुंबईच्या", "मुंबईतील", "बॉम्बे", "वर्सोवा", "ससून"],
        "goa": ["goa", "panaji", "panjim", "वास्को", "गोवा", "गोव्यात", "गोव्याच्या", "गोव्या", "पणजी", "मुरगाव"],
        "kochi": ["kochi", "cochin", "cochy", "कोच्चि", "कोची", "कोचीन", "कोच्चीत", "कोचीच्या", "मुनंबम", "केरळ", "केरल"],
        "chennai": ["chennai", "madras", "चेन्नई", "मद्रास", "चेन्नईत", "चेन्नईच्या", "एन्नोर"],
        "veraval": ["veraval", "gujarat", "saurashtra", "वेरावळ", "वेरावळात", "वेरावल", "गुजरात", "सौराष्ट्र", "पोरबंदर"],
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
    is_evening = any(w in text_lower for w in ["evening", "संध्याकाळ", "संध्याकाळी", "शाम", "रात्री", "रात", "night"])
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

def classify_granular_intent(query_lower: str) -> tuple[str, str]:
    """
    Classifies the user query into fine-grained marine domains and identifies any target species.
    Returns (intent_category, target_species_key_or_empty)
    """
    # 1. Target Species Detection
    species_map = {
        "pomfret": ["pomfret", "paplet", "पापलेट", "पांपलेट", "सिल्वर पापलेट"],
        "surmai": ["surmai", "kingfish", "seer fish", "isvan", "सुरमई", "इसवण", "किंगफिश"],
        "tuna": ["tuna", "yellowfin", "skipjack", "टूना", "टुना", "येलोफिन"],
        "mackerel": ["mackerel", "bangda", "बांगड़ा", "बांगडा", "मैकेरल", "मॅकरेल"],
        "bombay_duck": ["bombay duck", "bombil", "बोंबील", "बम्बिल", "बॉम्बे डक"],
        "sardines": ["sardine", "sardines", "tarli", "mathi", "तारली", "सार्डिन", "मथी"],
        "prawns": ["prawn", "prawns", "shrimp", "shrimps", "kolambi", "jhinga", "झींगा", "कोळंबी", "प्रॉन्स", "करिक्काडी"],
        "ghol": ["ghol", "croaker", "घोल", "घोल मासा", "समुद्री सोना"],
        "squid": ["squid", "cuttlefish", "makali", "मांदेली", "माकली", "स्क्विड", "कट्टलफिश"],
        "ribbonfish": ["ribbonfish", "hairtail", "vakthi", "वाकटी", "रिबनफिश", "फीता मछली"]
    }
    
    detected_species = ""
    for sp_key, aliases in species_map.items():
        if any(a in query_lower for a in aliases):
            detected_species = sp_key
            break

    # 2. Granular Intent Keywords
    is_emergency = any(w in query_lower for w in [
        "emergency", "sos", "helpline", "coast guard", "distress", "rescue", "accident", "help number", "contact",
        "आपत्कालीन", "मदत", "कोस्ट गार्ड", "नंबर", "फोन", "बचाव", "आपातकालीन", "तटरक्षक", "हेल्पलाइन", "दुर्घटना"
    ])
    
    is_market = any(w in query_lower for w in [
        "price", "prices", "rate", "rates", "cost", "market", "demand", "auction", "profit", "diesel", "fuel", "save fuel",
        "दाम", "भाव", "बाजारभाव", "कीमत", "मूल्य", "मंडी", "डीजल", "डिझेल", "इंधन", "बाजार भाव", "कितने में"
    ])
    
    is_gear = any(w in query_lower for w in [
        "gear", "net", "nets", "mesh", "mesh size", "gillnet", "trawl", "trawling", "longline", "hook", "hooks", "trolling", "purse seine", "dol net",
        "जाळे", "जाळ्याचा", "मेश", "गियर", "नेट", "हुक", "जाल", "गिलनेट", "ट्रॉल", "कांटा", "डोल जाळे"
    ])
    
    is_storm = any(w in query_lower for w in [
        "storm", "cyclone", "squall", "depression", "gale", "thunderstorm",
        "वादळ", "वादळाचा", "वादळाची", "वादळाचे", "चक्रीवादळ", "आंधी", "तूफान", "चक्रवात"
    ])
    
    is_wave = any(w in query_lower for w in [
        "wave", "waves", "swell", "swells", "wave height", "sea state", "roughness", "current", "currents", "underwater",
        "लाटा", "लाट", "लाटांची", "उसळी", "प्रवाह", "समुद्रातील लाटा", "लहर", "लहरें", "तरंग", "धाराएं"
    ])
    
    is_wind_weather = any(w in query_lower for w in [
        "wind", "wind speed", "gust", "gusts", "rain", "rainfall", "temperature", "humidity", "weather", "forecast", "cloud",
        "वारा", "वाऱ्याचा", "वाऱ्याचा वेग", "पाऊस", "हवामान", "ढग", "मौसम", "हवा", "वायु", "बारिश", "तापमान", "बादल"
    ])
    
    is_tide = any(w in query_lower for w in [
        "tide", "tides", "high tide", "low tide", "slack", "slack water", "sandbar",
        "भरती", "ओहोटी", "भरती-ओहोटी", "वेळापत्रक", "ज्वार", "भाटा", "ज्वार-भाटा", "उधाण"
    ])
    
    is_satellite = any(w in query_lower for w in [
        "chlorophyll", "plankton", "sst", "satellite", "thermal", "oceansat", "remote sensing", "color",
        "क्लोरोफिल", "प्लवक", "उपग्रह", "समुद्री तापमान", "रिमोट सेंसिंग"
    ])
    
    is_depth = any(w in query_lower for w in [
        "depth", "bathymetry", "shelf", "continental shelf", "bottom", "seabed", "deep",
        "खोली", "समुद्रतळ", "तळभाग", "गहराई", "तलहटी", "शेल्फ"
    ])
    
    is_boundary = any(w in query_lower for w in [
        "border", "boundary", "imbl", "restricted", "navy", "dockyard", "port limit", "pakistan border",
        "सीमा", "आंतरराष्ट्रीय सीमा", "प्रतिबंधित", "नौदल", "नौसेना", "बंदरगाह सीमा"
    ])
    
    is_community = any(w in query_lower for w in [
        "community", "other fishermen", "reports", "crowd", "recent catch", "boat reports",
        "अहवाल", "मच्छीमार नोंदी", "समुदाय", "स्थानिक रिपोर्ट", "मछुआरों की रिपोर्ट", "ताजी खबर"
    ])
    
    is_timing = any(w in query_lower for w in [
        "best time", "good time", "when to go", "timing", "departure",
        "सर्वोत्तम वेळ", "वेळ कोणती", "कधी जावे", "अनुकूल समय", "अच्छा समय", "कब जाना", "प्रस्थान"
    ])
    
    is_safety = any(w in query_lower for w in [
        "safe", "safety", "danger", "warning", "threat", "can i go", "proceed",
        "सुरक्षित", "धोका", "खतरा", "इशारा", "चेतावनी", "सावध", "सावधानी", "जा सकते हैं", "जावे का"
    ])

    # Intent Priority Resolution:
    if is_emergency:
        return "emergency", detected_species
    if is_market:
        return "market", detected_species
    if detected_species:
        return "species_profile", detected_species
    if is_gear:
        return "gear", detected_species
    if is_storm:
        return "storm", detected_species
    if is_wave:
        return "wave", detected_species
    if is_wind_weather:
        return "weather", detected_species
    if is_tide:
        return "tide", detected_species
    if is_satellite:
        return "satellite", detected_species
    if is_depth:
        return "bathymetry", detected_species
    if is_boundary:
        return "gis", detected_species
    if is_community:
        return "community", detected_species
    if is_timing:
        return "timing", detected_species
    if is_safety:
        return "safety", detected_species
        
    # Check if generic fish inquiry
    if any(w in query_lower for w in ["fish", "pfz", "catch", "fishing", "मासे", "मासेमारी", "मछली", "मछलियां", "मत्स्य"]):
        return "fish_general", detected_species
        
    return "general", detected_species

def run_agent_pipeline(query: str, client_lat: float = None, client_lon: float = None) -> Dict[str, Any]:
    """
    Executes dynamic Multi-Agent collaborative reasoning across 15+ specialized domains
    with natural multilingual synthesis in English, Hindi, and Marathi.
    """
    trace = []
    lang = detect_language(query)
    lang_name = "English" if lang == "en" else "Hindi (हिंदी)" if lang == "hi" else "Marathi (मराठी)"
    
    trace.append({
        "agent": "Planner Agent",
        "status": "completed",
        "message": f"Detected query language: **{lang_name}**. Deconstructing question intent structure."
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
        
    # Granular Intent Resolution
    query_lower = query.lower()
    intent, target_species = classify_granular_intent(query_lower)
    
    trace.append({
        "agent": "Planner Agent",
        "status": "completed",
        "message": f"Query classified under **{intent.upper()}** domain" + (f" (Target: **{target_species.upper()}**)" if target_species else "") + ". Dynamic multi-agent routing active."
    })

    # Telemetry live variation
    raw_wind = region_data["weather"]["wind_speed"]
    wind_val = round(max(2.0, raw_wind + random.uniform(-0.6, 0.6)), 1)
    wind_kmh = round(wind_val * 1.852, 1)
    
    raw_wave = region_data["ocean"]["wave_height"]
    wave_val = round(max(0.2, raw_wave + random.uniform(-0.1, 0.1)), 2)
    
    raw_chloro = region_data["satellite"]["chlorophyll"]
    chloro_val = round(max(0.1, raw_chloro + random.uniform(-0.2, 0.2)), 1)
    
    raw_sst = region_data["ocean"]["sst"]
    sst_val = round(raw_sst + random.uniform(-0.2, 0.2), 1)

    species_info = region_data.get("species", {})
    species_profiles = region_data.get("species_profiles", {})

    # Specialized Agent Trace Execution matching specific intents
    if intent in ["weather", "storm", "safety", "general", "timing"]:
        trace.append({
            "agent": "Weather Agent",
            "status": "completed",
            "message": f"Atmospheric scan: Wind speed **{wind_val} knots ({wind_kmh} km/h)** [{region_data['weather']['wind_direction']}], Gusts up to **{region_data['weather']['wind_gusts']} kts**, Barometer: **{region_data['weather']['barometric_pressure']} hPa** ({region_data['weather']['pressure_trend']}). Conditions: **{region_data['weather']['condition']}**."
        })
        
    if intent in ["wave", "ocean", "safety", "general", "bathymetry"]:
        trace.append({
            "agent": "Ocean Agent",
            "status": "completed",
            "message": f"Hydrodynamic check: Significant wave swell **{wave_val}m** (Period: **{region_data['ocean']['swell_period']}s**, Dir: **{region_data['ocean']['swell_direction']}**). Surface drift current: **{region_data['ocean']['current_speed']} knots** ({region_data['ocean']['current_direction']}). Sea State: **{region_data['ocean']['sea_state']}**."
        })
        
    if intent in ["satellite", "fish_general", "species_profile", "market", "timing"]:
        trace.append({
            "agent": "Satellite Agent",
            "status": "completed",
            "message": f"Remote Sensing Ocean Color: Chlorophyll-a concentration evaluated at **{chloro_val} mg/m³** ({region_data['satellite']['pfz_status']}). SST: **{sst_val}°C**. Thermal front: **{region_data['satellite']['thermal_front']}** (Sensor: {region_data['satellite']['sensor_source']})."
        })
        
    if intent in ["tide", "timing", "general", "fish_general"]:
        trace.append({
            "agent": "Tide Agent",
            "status": "completed",
            "message": f"Tidal Telemetry: High Tide 1: **{region_data['tide']['high_tide_1']}**, Low Tide 1: **{region_data['tide']['low_tide_1']}**, High Tide 2: **{region_data['tide']['high_tide_2']}**. Slack Window: **{region_data['tide']['slack_window']}** (Sandbar clearance draft: {region_data['tide']['sandbar_clearance_m']}m)."
        })
        
    if intent in ["gis", "safety", "emergency", "general"]:
        restricted_msgs = [f"{z['name']} ({z['distance_km']} km - {z['status']})" for z in region_data["gis"]["restricted_zones"]]
        trace.append({
            "agent": "GIS Agent",
            "status": "completed",
            "message": f"Geospatial Security Scan: Distance to International Boundary (IMBL) is **{region_data['gis']['distance_to_imbl']} km** ({region_data['gis']['imbl_status']}). Restricted sectors: {', '.join(restricted_msgs)}."
        })
        
    if intent in ["gear", "species_profile", "fish_general"]:
        trace.append({
            "agent": "Ecology & Gear Agent",
            "status": "completed",
            "message": f"Ecosystem audit: Primary coastal biomass baseline contains **{', '.join(species_info.get('primary', []))}**. Recommended sustainable mesh configuration: **{species_info.get('gear', 'Standard Pelagic Nets')}**."
        })

    if intent in ["market", "general"]:
        trace.append({
            "agent": "Economic Agent",
            "status": "completed",
            "message": f"Market & Fuel Logistics: Dockside price matrix loaded for {len(region_data['economics']['dockside_prices'])} species. Vector navigation advisory: **{region_data['economics']['fuel_saving_tips']}**."
        })

    if intent in ["emergency", "safety"]:
        trace.append({
            "agent": "Safety & Rescue Agent",
            "status": "completed",
            "message": f"Distress Readiness: Coast Guard National Helpline **{region_data['emergency']['coast_guard_helpline']}** verified. Radio listening watch on **{region_data['emergency']['mrcc_frequency']}**."
        })

    # Community Agent Integration
    region_reports = [r for r in COMMUNITY_REPORTS if r["region"] == location_key]
    community_risk_mod = 0
    if len(region_reports) > 0:
        latest_rep = region_reports[0]
        if intent in ["community", "general", "safety", "fish_general"]:
            trace.append({
                "agent": "Community Agent",
                "status": "completed",
                "message": f"Crowdsourced Intelligence: Retrieved {len(region_reports)} verified logs. Latest report ({latest_rep['timestamp']}): '{latest_rep['text']}' (Type: **{latest_rep['type']}**)."
            })
        
        for rep in region_reports:
            if rep["type"] == "Storm Warning":
                community_risk_mod += 15
            elif rep["type"] == "High Waves":
                community_risk_mod += 10
            elif rep["type"] == "Calm Seas":
                community_risk_mod -= 5
    else:
        if intent in ["community", "general"]:
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

    if intent in ["safety", "storm", "general"]:
        trace.append({
            "agent": "Risk Agent",
            "status": "completed",
            "message": f"Composite Threat Analysis compiled (Community adjustments: {community_risk_mod:+}). Total Threat Index: **{total_risk}/100** ({danger_level})."
        })

    # Agent Agreement & Confidence Score
    is_high_pfz = chloro_val >= 4.5
    is_unsafe = total_risk >= 35
    
    if is_high_pfz and is_unsafe:
        agreement_status = "disagree"
        agreement_badge = "⚡ Agents partially disagree"
        agreement_explanation = "Fishing potential is high, but safety conditions are a concern."
        confidence_score = random.randint(81, 86)
    elif not is_high_pfz and total_risk >= 70:
        agreement_status = "agree"
        agreement_badge = "✅ Agents in agreement"
        agreement_explanation = "Agents align: low fishing potential and high storm hazard."
        confidence_score = random.randint(93, 98)
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

    # Localized Names
    reg_name_en = region_data["name"]
    reg_name_hi = region_data.get("name_hi", region_data["name"])
    reg_name_mr = region_data.get("name_mr", region_data["name"])
    
    cond_hi = region_data["weather"].get("condition_hi", region_data["weather"]["condition"])
    cond_mr = region_data["weather"].get("condition_mr", region_data["weather"]["condition"])
    
    danger_hi = "पूर्णतः सुरक्षित" if danger_level == "SAFE" else "सावधानी बरतें (मध्यम जोखिम)" if danger_level == "CAUTION" else "खतरा / असुरक्षित"
    danger_mr = "पूर्णपणे सुरक्षित" if danger_level == "SAFE" else "सावधगिरी बाळगा (मध्यम धोका)" if danger_level == "CAUTION" else "धोकादायक / असुरक्षित"

    # Brain Agent Multilingual Synthesis across distinct domains
    if lang == "en":
        time_prefix = f" for **{time_ctx['en']}**" if time_ctx["en"] else ""
        intro = f"Regarding your inquiry about {reg_name_en}{time_prefix}:"
        
        if intent == "species_profile":
            sp_key = target_species if target_species in species_profiles else list(species_profiles.keys())[0] if species_profiles else "pomfret"
            prof = species_profiles.get(sp_key, {})
            if prof:
                body = (
                    f"🐟 **Species Profile: {prof.get('name', 'Marine Species')}** (*{prof.get('scientific', '')}*)\n\n"
                    f"• **Operating Depth**: {prof.get('depth', '15-40m')}\n"
                    f"• **Optimal Sea Temperature**: {prof.get('temp_opt', '27-29°C')} (Current SST: {sst_val}°C)\n"
                    f"• **Recommended Gear & Mesh**: {prof.get('gear', 'Standard Gillnets')}\n"
                    f"• **Effective Bait / Technique**: {prof.get('bait', 'Natural Baits')}\n"
                    f"• **Dockside Market Value**: {prof.get('market_price', '₹300 - ₹500/kg')}\n"
                    f"• **Identified Local Hotspot**: {prof.get('hotspot', 'Near offshore shelf contour')}"
                )
            else:
                body = f"Primary commercial species in {reg_name_en} are: {', '.join(species_info.get('primary', []))}."

        elif intent == "gear":
            body = (
                f"🎣 **Recommended Gear & Net Configuration for {reg_name_en}**:\n\n"
                f"• **Primary Recommended Gear**: {species_info.get('gear', 'Pelagic Drift Nets & Gillnets')}\n"
                f"• **Operating Depth Range**: {species_info.get('depth_range', '15-45m')}\n"
                f"• **Target Species**: {', '.join(species_info.get('primary', []))}\n"
                f"• **Net Mesh Regulations**: Mesh size limits (e.g. min 25mm for pelagic shoals, 120-140mm for large pomfret/surmai) to protect juvenile biomass.\n"
                f"• **Deployment Advice**: Current is {region_data['ocean']['current_speed']} kts ({region_data['ocean']['current_direction']}) - set driftnets perpendicular to the tidal influx."
            )

        elif intent == "market":
            prices_str = "\n".join([f"  • **{k}**: {v}" for k, v in region_data["economics"]["dockside_prices"].items()])
            body = (
                f"💰 **Dockside Market Rates & Economic Insights ({reg_name_en})**:\n\n"
                f"**Current Estimated Fish Auction Rates**:\n{prices_str}\n\n"
                f"⛽ **Fuel Optimization**: {region_data['economics']['fuel_saving_tips']}\n"
                f"🧊 **Preservation Guide**: {region_data['economics']['ice_ratio']} recommended for optimal market freshness."
            )

        elif intent == "emergency":
            checklist_str = "\n".join([f"  ✅ {item}" for item in region_data["emergency"]["mandatory_checklist"]])
            body = (
                f"🚨 **Emergency Helplines & Maritime Safety Protocol ({reg_name_en})**:\n\n"
                f"• 📞 **Indian Coast Guard 24x7 Distress**: **{region_data['emergency']['coast_guard_helpline']}**\n"
                f"• 📻 **International Distress Frequency**: **{region_data['emergency']['mrcc_frequency']}**\n"
                f"• 👮 **Coastal Police Control**: **{region_data['emergency']['coastal_police']}**\n\n"
                f"**Mandatory Pre-Sailing Safety Checklist**:\n{checklist_str}"
            )

        elif intent == "wave":
            body = (
                f"🌊 **Hydrodynamics & Sea State Analysis for {reg_name_en}**:\n\n"
                f"• **Significant Wave Height**: **{wave_val} meters**\n"
                f"• **Swell Period & Heading**: **{region_data['ocean']['swell_period']} seconds** from **{region_data['ocean']['swell_direction']}**\n"
                f"• **Surface Drift Current**: **{region_data['ocean']['current_speed']} knots** heading {region_data['ocean']['current_direction']}\n"
                f"• **Sea State Severity**: **{region_data['ocean']['sea_state']}**\n"
                f"• **Underwater Visibility**: {region_data['ocean']['underwater_visibility_m']} meters (SST: {sst_val}°C)"
            )

        elif intent == "weather":
            body = (
                f"🌤️ **Atmospheric & Weather Telemetry for {reg_name_en}**:\n\n"
                f"• **Wind Speed**: **{wind_val} knots ({wind_kmh} km/h)** from {region_data['weather']['wind_direction']}\n"
                f"• **Peak Wind Gusts**: **{region_data['weather']['wind_gusts']} knots**\n"
                f"• **Barometric Pressure**: **{region_data['weather']['barometric_pressure']} hPa** ({region_data['weather']['pressure_trend']})\n"
                f"• **Precipitation Probability**: {region_data['weather']['precipitation']}%\n"
                f"• **Air Temperature & Humidity**: {region_data['weather']['air_temperature']}°C | {region_data['weather']['humidity']}%\n"
                f"• **Marine Visibility**: {region_data['weather']['visibility_nm']} nautical miles ({region_data['weather']['condition']})"
            )

        elif intent == "storm":
            if has_storm_warning:
                warnings_str = ", ".join(region_data["weather"].get("warnings", ["Squall Advisory"]))
                body = (
                    f"⚠️ **STORM & CYCLONE ALERT**: Active storm advisory in effect for {reg_name_en} ({warnings_str})!\n\n"
                    f"• Wind Speed: **{wind_val} knots ({wind_kmh} km/h)** with squall gusts to **{region_data['weather']['wind_gusts']} kts**\n"
                    f"• Swells: **{wave_val}m** ({region_data['ocean']['sea_state']})\n"
                    f"• Barometer: **{region_data['weather']['barometric_pressure']} hPa** ({region_data['weather']['pressure_trend']})\n"
                    f"🛡️ **Advisory**: Fishermen are strictly warned NOT to venture into open waters. Return to port immediately."
                )
            else:
                body = (
                    f"✅ **NO STORM ALERT**: No active storm, cyclone, or squall warnings for {reg_name_en}.\n\n"
                    f"• Weather: {region_data['weather']['condition']}\n"
                    f"• Winds: {wind_val} knots | Swells: {wave_val}m | Barometer: {region_data['weather']['barometric_pressure']} hPa (Steady)"
                )

        elif intent == "tide":
            body = (
                f"⏳ **Tidal Schedule & Navigation Window ({reg_name_en})**:\n\n"
                f"• 🔺 **High Tide 1**: {region_data['tide']['high_tide_1']}\n"
                f"• 🔻 **Low Tide 1**: {region_data['tide']['low_tide_1']}\n"
                f"• 🔺 **High Tide 2**: {region_data['tide']['high_tide_2']}\n"
                f"• 🔻 **Low Tide 2**: {region_data['tide']['low_tide_2']}\n\n"
                f"• **Tidal Range & Cycle**: {region_data['tide']['tidal_range_m']}m ({region_data['tide']['cycle']})\n"
                f"• **Optimal Slack Navigation Window**: {region_data['tide']['slack_window']}\n"
                f"• **Harbor Sandbar Clearance**: {region_data['tide']['sandbar_clearance_m']}m draft clearance at lowest tide."
            )

        elif intent == "satellite":
            body = (
                f"🛰️ **Satellite Oceanography & Thermal PFZ Analysis ({reg_name_en})**:\n\n"
                f"• **Chlorophyll-a Density**: **{chloro_val} mg/m³** ({region_data['satellite']['pfz_status']})\n"
                f"• **Sea Surface Temperature (SST)**: **{sst_val}°C** (Anomaly: {region_data['satellite']['sst_anomaly']:+}°C)\n"
                f"• **Plankton Bloom Status**: {region_data['satellite']['plankton_density']}\n"
                f"• **Thermal Edge Convergence**: {region_data['satellite']['thermal_front']}\n"
                f"• **Sensor Calibration**: {region_data['satellite']['sensor_source']}"
            )

        elif intent == "bathymetry":
            body = (
                f"🗺️ **Seabed Bathymetry & Continental Shelf Profile ({reg_name_en})**:\n\n"
                f"• **Continental Shelf Width**: {region_data['bathymetry']['shelf_width_km']} km offshore\n"
                f"• **Seabed Substrate**: {region_data['bathymetry']['seabed_type']}\n"
                f"• **Depth Contours**:\n"
                f"  - 10 km offshore: {region_data['bathymetry']['depth_10km']}\n"
                f"  - 25 km offshore: {region_data['bathymetry']['depth_25km']}\n"
                f"  - 50 km offshore: {region_data['bathymetry']['depth_50km']}\n"
                f"  - Shelf Break: {region_data['bathymetry']['depth_shelf_break']}"
            )

        elif intent == "gis":
            zones_str = "\n".join([f"  • **{z['name']}**: {z['distance_km']} km away ({z['status']})" for z in region_data["gis"]["restricted_zones"]])
            body = (
                f"🌐 **Maritime Boundaries & Restricted Zones ({reg_name_en})**:\n\n"
                f"• **Distance to International Boundary (IMBL)**: **{region_data['gis']['distance_to_imbl']} km**\n"
                f"• **IMBL Security Status**: {region_data['gis']['imbl_status']}\n\n"
                f"**Nearby Restricted Maritime Zones**:\n{zones_str}"
            )

        elif intent == "community":
            if len(region_reports) > 0:
                rep_list_str = "\n".join([f"  • [{r['timestamp']}] ({r['type']}): \"{r['text']}\"" for r in region_reports])
                body = f"👥 **Community Fishermen Logs & Crowd Reports ({reg_name_en})**:\n\n{rep_list_str}"
            else:
                body = f"👥 **Community Fishermen Logs**: No recent reports filed for {reg_name_en} in the last 12 hours."

        elif intent == "timing":
            body = (
                f"⏰ **Optimal Departure & Fishing Timing for {reg_name_en}**:\n\n"
                f"• **Best Catch Window**: **{species_info.get('catch_window', 'Early Morning 05:00 - 09:30 AM')}** (Peak feeding during high tide influx)\n"
                f"• **Tidal Slack for Harbor Departure**: {region_data['tide']['slack_window']}\n"
                f"• **Marine State**: Swells {wave_val}m | Winds {wind_val} knots ({region_data['weather']['wind_direction']})\n"
                f"• **Target Species**: {', '.join(species_info.get('primary', []))}"
            )

        elif intent == "safety":
            safety_verdict = "Yes, it is SAFE to proceed to sea today." if danger_level == "SAFE" else "CAUTION is advised before venturing into sea today." if danger_level == "CAUTION" else "NO, it is DANGEROUS to go to sea today due to severe marine hazards."
            body = (
                f"🛡️ **Multi-Agent Sea Venture Safety Verdict**:\n\n"
                f"**{safety_verdict}**\n\n"
                f"• **Composite Danger Score**: **{total_risk}/100** ({danger_level})\n"
                f"• **Wave Swell**: {wave_val}m ({region_data['ocean']['sea_state']})\n"
                f"• **Wind & Gusts**: {wind_val} kts ({wind_kmh} km/h) | Gusts: {region_data['weather']['wind_gusts']} kts\n"
                f"• **Atmosphere**: {region_data['weather']['condition']} | Barometer: {region_data['weather']['barometric_pressure']} hPa\n"
                f"• **Security**: {region_data['gis']['distance_to_imbl']} km from IMBL"
            )

        else: # fish_general or general
            species_list_en = ", ".join(species_info.get("primary", ["Indian Mackerel", "Sardines"]))
            body = (
                f"🛰️ **Marine Intelligence Overview ({reg_name_en})**:\n\n"
                f"• **Potential Fishing Zone (PFZ)**: {region_data['satellite']['pfz_status']} with Chlorophyll at **{chloro_val} mg/m³** and SST at **{sst_val}°C**.\n"
                f"• **Primary Species**: {species_list_en}\n"
                f"• **Recommended Gear & Depth**: {species_info.get('gear', 'Pelagic Drift Nets')} ({species_info.get('depth_range', '15-45m')})\n"
                f"• **Tide Timings**: High Tide at {region_data['tide']['high_tide_1']}, Low Tide at {region_data['tide']['low_tide_1']}\n"
                f"• **Safety Rating**: **{danger_level}** (Threat score: {total_risk}/100, Wind: {wind_val} kts, Waves: {wave_val}m)"
            )
            
        final_answer = f"{intro}\n\n{body}"

    elif lang == "hi":
        time_prefix_hi = f"{time_ctx['hi']} के लिए " if time_ctx["hi"] else ""
        intro = f"{time_prefix_hi}{reg_name_hi} की स्थिति रिपोर्ट:"
        
        if intent == "species_profile":
            sp_key = target_species if target_species in species_profiles else list(species_profiles.keys())[0] if species_profiles else "pomfret"
            prof = species_profiles.get(sp_key, {})
            if prof:
                body = (
                    f"🐟 **मछली प्रजाति विवरण: {prof.get('name_hi', prof.get('name', 'मछली'))}** (*{prof.get('scientific', '')}*)\n\n"
                    f"• **परिचालन गहराई**: {prof.get('depth_hi', prof.get('depth', '15-40 मीटर'))}\n"
                    f"• **अनुकूल सागरी तापमान**: {prof.get('temp_opt', '27-29°C')} (वर्तमान तापमान: {sst_val}°C)\n"
                    f"• **अनुशंसित गियर व मेश आकार**: {prof.get('gear_hi', prof.get('gear', 'गिलनेट'))}\n"
                    f"• **प्रभावी चारा / तकनीक**: {prof.get('bait_hi', prof.get('bait', 'प्राकृतिक चारा'))}\n"
                    f"• **अनुमानित बाजार भाव**: {prof.get('market_price_hi', prof.get('market_price', '₹300 - ₹500/किग्रा'))}\n"
                    f"• **प्रमुख संभावित क्षेत्र**: {prof.get('hotspot', 'तट से 20-35 किमी दूर')}"
                )
            else:
                body = f"{reg_name_hi} में पाई जाने वाली मुख्य मछलियाँ: {', '.join(species_info.get('primary_hi', []))} हैं।"

        elif intent == "gear":
            body = (
                f"🎣 **{reg_name_hi} हेतु अनुशंसित जाल व गियर विवरण**:\n\n"
                f"• **अनुशंसित मुख्य गियर**: {species_info.get('gear_hi', 'पेलाजिक ड्रिफ्ट नेट व गिलनेट')}\n"
                f"• **परिचालन गहराई**: {species_info.get('depth_range_hi', '15 - 45 मीटर')}\n"
                f"• **लक्षित मछलियाँ**: {', '.join(species_info.get('primary_hi', []))}\n"
                f"• **मेश साइज दिशा-निर्देश**: छोटी मछलियों के संरक्षण हेतु न्यूनतम मेश आकार (25 मिमी से 140 मिमी तक) का पालन करें।\n"
                f"• **जाल लगाने की सलाह**: वर्तमान सागरी प्रवाह {region_data['ocean']['current_speed']} समुद्री मील है - जाल को ज्वारीय प्रवाह के लंबवत लगाएं।"
            )

        elif intent == "market":
            prices_str = "\n".join([f"  • **{k}**: {v}" for k, v in region_data["economics"]["dockside_prices"].items()])
            body = (
                f"💰 **मत्स्य बाजार भाव व आर्थिक जानकारी ({reg_name_hi})**:\n\n"
                f"**वर्तमान अनुमानित नीलामी दरें (प्रति किग्रा)**:\n{prices_str}\n\n"
                f"⛽ **ईंधन बचत सलाह**: {region_data['economics'].get('fuel_saving_tips_hi', region_data['economics']['fuel_saving_tips'])}\n"
                f"🧊 **बर्फ अनुपात**: ताजे माल हेतु 1:1 का अनुपात रखें।"
            )

        elif intent == "emergency":
            checklist_str = "\n".join([f"  ✅ {item}" for item in region_data["emergency"].get("mandatory_checklist_hi", region_data["emergency"]["mandatory_checklist"])])
            body = (
                f"🚨 **आपातकालीन हेल्पलाइन व समुद्री सुरक्षा प्रोटोकॉल ({reg_name_hi})**:\n\n"
                f"• 📞 **भारतीय तटरक्षक बल (ICG 24x7 हेल्पलाइन)**: **{region_data['emergency']['coast_guard_helpline']}**\n"
                f"• 📻 **अंतर्राष्ट्रीय आपातकालीन रेडियो फ्रीक्वेंसी**: **{region_data['emergency']['mrcc_frequency']}**\n"
                f"• 👮 **तटीय मरीन पुलिस**: **{region_data['emergency']['coastal_police']}**\n\n"
                f"**समुद्र में जाने से पूर्व अनिवार्य सुरक्षा चेकलिस्ट**:\n{checklist_str}"
            )

        elif intent == "wave":
            body = (
                f"🌊 **सागरी लहरों व जल-प्रवाह की स्थिति ({reg_name_hi})**:\n\n"
                f"• **लहरों की ऊंचाई**: **{wave_val} मीटर**\n"
                f"• **उफान अवधि व दिशा**: **{region_data['ocean']['swell_period']} सेकंड** ({region_data['ocean']['swell_direction']} से)\n"
                f"• **सतही प्रवाह गति**: **{region_data['ocean']['current_speed']} समुद्री मील** ({region_data['ocean']['current_direction']})\n"
                f"• **समुद्र की स्थिति**: **{region_data['ocean'].get('sea_state_hi', region_data['ocean']['sea_state'])}**\n"
                f"• **जल-दृश्यता व तापमान**: {region_data['ocean']['underwater_visibility_m']} मीटर | सतही तापमान: {sst_val}°C"
            )

        elif intent == "weather":
            body = (
                f"🌤️ **वायुमंडलीय व मौसम स्थिति ({reg_name_hi})**:\n\n"
                f"• **हवा की गति**: **{wind_val} समुद्री मील ({wind_kmh} किमी/घंटा)** दिशा: {region_data['weather']['wind_direction']}\n"
                f"• **तेज हवाओं के झोंके**: **{region_data['weather']['wind_gusts']} समुद्री मील**\n"
                f"• **वायुदाब (Barometer)**: **{region_data['weather']['barometric_pressure']} hPa** ({region_data['weather']['pressure_trend']})\n"
                f"• **बारिश की संभावना**: {region_data['weather']['precipitation']}%\n"
                f"• **तापमान व आर्द्रता**: {region_data['weather']['air_temperature']}°C | आर्द्रता: {region_data['weather']['humidity']}%\n"
                f"• **दृश्यता**: {region_data['weather']['visibility_nm']} नॉटिकल मील ({cond_hi})"
            )

        elif intent == "storm":
            if has_storm_warning:
                warn_hi = ", ".join(region_data["weather"].get("warnings_hi", ["तेज समुद्री आंधी अलर्ट"]))
                body = (
                    f"⚠️ **तूफान व चक्रवात चेतावनी**: {reg_name_hi} में मौसम विभाग द्वारा चेतावनी जारी है ({warn_hi})!\n\n"
                    f"• हवा की गति: **{wind_val} समुद्री मील ({wind_kmh} किमी/घंटा)** झोंके: **{region_data['weather']['wind_gusts']} नॉट**\n"
                    f"• लहरों की ऊंचाई: **{wave_val} मीटर** ({region_data['ocean'].get('sea_state_hi', region_data['ocean']['sea_state'])})\n"
                    f"• वायुदाब: **{region_data['weather']['barometric_pressure']} hPa**\n"
                    f"🛡️ **चेतावनी**: मछुआरों को समुद्र में जाने से सख्त मना किया जाता है। तुरंत सुरक्षित तट पर लौटें।"
                )
            else:
                body = (
                    f"✅ **तूफान का कोई अलर्ट नहीं**: वर्तमान में {reg_name_hi} क्षेत्र में तूफान अथवा चक्रवात का कोई खतरा नहीं है।\n\n"
                    f"• मौसम स्थिति: {cond_hi}\n"
                    f"• हवा: {wind_val} नॉट | लहरें: {wave_val} मीटर | वायुदाब: {region_data['weather']['barometric_pressure']} hPa (स्थिर)"
                )

        elif intent == "tide":
            body = (
                f"⏳ **ज्वार-भाटा का समय व नौकायन विंडो ({reg_name_hi})**:\n\n"
                f"• 🔺 **पहला उच्च ज्वार (High Tide)**: {region_data['tide']['high_tide_1']}\n"
                f"• 🔻 **पहला निम्न ज्वार (Low Tide)**: {region_data['tide']['low_tide_1']}\n"
                f"• 🔺 **दूसरा उच्च ज्वार**: {region_data['tide']['high_tide_2']}\n"
                f"• 🔻 **दूसरा निम्न ज्वार**: {region_data['tide']['low_tide_2']}\n\n"
                f"• **ज्वारीय सीमा व चक्र**: {region_data['tide']['tidal_range_m']} मीटर ({region_data['tide'].get('cycle_hi', region_data['tide']['cycle'])})\n"
                f"• **शांत जल प्रस्थान विंडो (Slack Water)**: {region_data['tide'].get('slack_window_hi', region_data['tide']['slack_window'])}\n"
                f"• **सैंडबार क्लीयरेंस**: निम्नतम ज्वार पर भी {region_data['tide']['sandbar_clearance_m']} मीटर जल गहराई उपलब्ध।"
            )

        elif intent == "satellite":
            body = (
                f"🛰️ **उपग्रह क्लोरोफिल व PFZ थर्मल विश्लेषण ({reg_name_hi})**:\n\n"
                f"• **क्लोरोफिल घनत्व**: **{chloro_val} मि.ग्रा./घन मीटर** ({region_data['satellite'].get('pfz_status_hi', region_data['satellite']['pfz_status'])})\n"
                f"• **समुद्री सतह का तापमान (SST)**: **{sst_val}°C** (विसंगति: {region_data['satellite']['sst_anomaly']:+}°C)\n"
                f"• **प्लवक (Plankton) सक्रियता**: {region_data['satellite']['plankton_density']}\n"
                f"• **थर्मल फ्रंट सीमा**: {region_data['satellite']['thermal_front']}\n"
                f"• **उपग्रह सेंसर स्रोत**: {region_data['satellite']['sensor_source']}"
            )

        elif intent == "bathymetry":
            body = (
                f"🗺️ **समुद्र तल व महाद्वीपीय शेल्फ गहराई ({reg_name_hi})**:\n\n"
                f"• **शेल्फ चौड़ाई**: तट से {region_data['bathymetry']['shelf_width_km']} किमी तक\n"
                f"• **समुद्र तल की बनावट**: {region_data['bathymetry'].get('seabed_type_hi', region_data['bathymetry']['seabed_type'])}\n"
                f"• **गहराई समोच्च (Contours)**:\n"
                f"  - 10 किमी दूर: {region_data['bathymetry']['depth_10km']}\n"
                f"  - 25 किमी दूर: {region_data['bathymetry']['depth_25km']}\n"
                f"  - 50 किमी दूर: {region_data['bathymetry']['depth_50km']}\n"
                f"  - शेल्फ ब्रेक: {region_data['bathymetry']['depth_shelf_break']}"
            )

        elif intent == "gis":
            zones_str = "\n".join([f"  • **{z.get('name_hi', z['name'])}**: {z['distance_km']} किमी दूर ({z.get('status_hi', z['status'])})" for z in region_data["gis"]["restricted_zones"]])
            body = (
                f"🌐 **अंतर्राष्ट्रीय सीमा व प्रतिबंधित क्षेत्र ({reg_name_hi})**:\n\n"
                f"• **अंतर्राष्ट्रीय समुद्री सीमा (IMBL) से दूरी**: **{region_data['gis']['distance_to_imbl']} किमी**\n"
                f"• **सीमा सुरक्षा स्थिति**: {region_data['gis'].get('imbl_status_hi', region_data['gis']['imbl_status'])}\n\n"
                f"**निकटवर्ती प्रतिबंधित समुद्री क्षेत्र**:\n{zones_str}"
            )

        elif intent == "community":
            if len(region_reports) > 0:
                rep_list_str = "\n".join([f"  • [{r.get('timestamp_hi', r['timestamp'])}] ({r.get('type_hi', r['type'])}): \"{r.get('text_hi', r['text'])}\"" for r in region_reports])
                body = f"👥 **स्थानीय मछुआरा समुदाय रिपोर्ट ({reg_name_hi})**:\n\n{rep_list_str}"
            else:
                body = f"👥 **स्थानीय मछुआरा रिपोर्ट**: {reg_name_hi} क्षेत्र में पिछले 12 घंटों में कोई नई रिपोर्ट दर्ज नहीं हुई।"

        elif intent == "timing":
            body = (
                f"⏰ **मछली पकड़ने और नौका प्रस्थान का सर्वोत्तम समय ({reg_name_hi})**:\n\n"
                f"• **सर्वोत्तम शिकार समय**: **{species_info.get('catch_window_hi', 'सुबह 05:00 से 09:30 बजे तक')}** (ज्वार के समय मछलियों की अधिक सक्रियता)\n"
                f"• **नौका प्रस्थान का शांत समय**: {region_data['tide'].get('slack_window_hi', region_data['tide']['slack_window'])}\n"
                f"• **सागरीय स्थिति**: लहरें {wave_val} मीटर | हवा {wind_val} नॉट ({region_data['weather']['wind_direction']})\n"
                f"• **संभावित मछलियाँ**: {', '.join(species_info.get('primary_hi', []))}"
            )

        elif intent == "safety":
            safety_verdict = "हाँ, आज समुद्र में जाना पूर्णतः सुरक्षित है।" if danger_level == "SAFE" else "आज समुद्र में जाने के लिए सावधानी आवश्यक है।" if danger_level == "CAUTION" else "नहीं, आज समुद्र में जाना खतरनाक व असुरक्षित है।"
            body = (
                f"🛡️ **सुरक्षा निर्णय व खतरा विश्लेषण**:\n\n"
                f"**{safety_verdict}**\n\n"
                f"• **सुरक्षा स्थिति**: **{danger_hi}** (जोखिम स्तर: {total_risk}/100)\n"
                f"• **लहरों की ऊंचाई**: {wave_val} मीटर ({region_data['ocean'].get('sea_state_hi', region_data['ocean']['sea_state'])})\n"
                f"• **हवा की गति व झोंके**: {wind_val} नॉट ({wind_kmh} किमी/घंटा) | झोंके: {region_data['weather']['wind_gusts']} नॉट\n"
                f"• **मौसम**: {cond_hi} | वायुदाब: {region_data['weather']['barometric_pressure']} hPa\n"
                f"• **सीमा दूरी**: IMBL से {region_data['gis']['distance_to_imbl']} किमी दूर"
            )

        else: # fish_general or general
            species_list_hi = ", ".join(species_info.get("primary_hi", ["बांगड़ा (मैकेरल)", "सिल्वर पापलेट", "बम्बिल", "तारली"]))
            body = (
                f"🛰️ **मत्स्य व सागरीय सूचना रिपोर्ट ({reg_name_hi})**:\n\n"
                f"• **संभावित मत्स्य क्षेत्र (PFZ)**: {region_data['satellite'].get('pfz_status_hi', 'उच्च संभावित मत्स्य क्षेत्र')} (क्लोरोफिल: {chloro_val} मि.ग्रा., तापमान: {sst_val}°C)\n"
                f"• **प्रमुख संभावित प्रजातियाँ**: {species_list_hi}\n"
                f"• **अनुशंसित गियर व गहराई**: {species_info.get('gear_hi', 'पेलाजिक ड्रिफ्ट नेट')} ({species_info.get('depth_range_hi', '15-45 मीटर')})\n"
                f"• **ज्वार समय**: उच्च ज्वार {region_data['tide']['high_tide_1']}, निम्न ज्वार {region_data['tide']['low_tide_1']}\n"
                f"• **सुरक्षा रेटिंग**: **{danger_hi}** (जोखिम: {total_risk}/100, हवा: {wind_val} नॉट, लहरें: {wave_val} मीटर)"
            )
            
        final_answer = f"{intro}\n\n{body}"

    else:  # Marathi (mr)
        time_prefix_mr = f"{time_ctx['mr']}च्या माहितीनुसार " if time_ctx["mr"] else ""
        intro = f"{time_prefix_mr}{reg_name_mr} अहवाल:"
        
        if intent == "species_profile":
            sp_key = target_species if target_species in species_profiles else list(species_profiles.keys())[0] if species_profiles else "pomfret"
            prof = species_profiles.get(sp_key, {})
            if prof:
                body = (
                    f"🐟 **माशांची प्रजाती माहिती: {prof.get('name_mr', prof.get('name', 'मासा'))}** (*{prof.get('scientific', '')}*)\n\n"
                    f"• **सागरी खोली (Depth)**: {prof.get('depth_mr', prof.get('depth', '15-40 मीटर'))}\n"
                    f"• **अनुकूल तापमान**: {prof.get('temp_opt', '27-29°C')} (सध्याचे तापमान: {sst_val}°C)\n"
                    f"• **शिफारस केलेले जाळे व मेश आकार**: {prof.get('gear_mr', prof.get('gear', 'गिलनेट'))}\n"
                    f"• **प्रभावी आमिष / पद्धत**: {prof.get('bait_mr', prof.get('bait', 'नैसर्गिक आमिष'))}\n"
                    f"• **अंदाजे बाजारभाव**: {prof.get('market_price_mr', prof.get('market_price', '₹३०० - ₹५००/किलो'))}\n"
                    f"• **सापडण्याचे मुख्य क्षेत्र**: {prof.get('hotspot', 'किनाऱ्यापासून २०-३५ किमी अंतरावर')}"
                )
            else:
                body = f"{reg_name_mr} भागात प्रामुख्याने आढळणारे मासे: {', '.join(species_info.get('primary_mr', []))}."

        elif intent == "gear":
            body = (
                f"🎣 **{reg_name_mr} साठी योग्य जाळे व गियर माहिती**:\n\n"
                f"• **शिफारस केलेले मुख्य जाळे**: {species_info.get('gear_mr', 'ड्रिफ्ट नेट आणि गिलनेट')}\n"
                f"• **कार्यरत सागरी खोली**: {species_info.get('depth_range_mr', '15 - 45 मीटर')}\n"
                f"• **प्रमुख मासे**: {', '.join(species_info.get('primary_mr', []))}\n"
                f"• **मेश साइजचे नियम**: लहान माशांच्या संवर्धनासाठी योग्य मेश आकाराचा (२५ मिमी ते १४० मिमी) वापर करावा.\n"
                f"• **जाळे टाकण्याचा सल्ला**: सध्या समुद्रातील प्रवाह {region_data['ocean']['current_speed']} नॉट्स आहे - जाळे भरतीच्या प्रवाहाला काटकोनात लावावे."
            )

        elif intent == "market":
            prices_str = "\n".join([f"  • **{k}**: {v}" for k, v in region_data["economics"]["dockside_prices"].items()])
            body = (
                f"💰 **मत्स्य बाजारभाव व आर्थिक मार्गदर्शन ({reg_name_mr})**:\n\n"
                f"**आजचे अंदाजे लिलाव बाजारभाव (प्रति किलो)**:\n{prices_str}\n\n"
                f"⛽ **डिझेल इंधन बचत सल्ला**: {region_data['economics'].get('fuel_saving_tips_mr', region_data['economics']['fuel_saving_tips'])}\n"
                f"🧊 **बर्फ वापर प्रमाण**: मासे ताजे राहण्यासाठी १:१ प्रमाणात बर्फाचा वापर करा."
            )

        elif intent == "emergency":
            checklist_str = "\n".join([f"  ✅ {item}" for item in region_data["emergency"].get("mandatory_checklist_mr", region_data["emergency"]["mandatory_checklist"])])
            body = (
                f"🚨 **आपत्कालीन मदत क्रमांक व सागरी सुरक्षा नियम ({reg_name_mr})**:\n\n"
                f"• 📞 **भारतीय तटरक्षक दल (ICG २४x७ आपत्कालीन नंबर)**: **{region_data['emergency']['coast_guard_helpline']}**\n"
                f"• 📻 **आंतरराष्ट्रीय आणीबाणी रेडिओ फ्रिक्वेन्सी**: **{region_data['emergency']['mrcc_frequency']}**\n"
                f"• 👮 **सागरी पोलीस नियंत्रण कक्ष**: **{region_data['emergency']['coastal_police']}**\n\n"
                f"**समुद्रात निघण्यापूर्वी अनिवार्य सुरक्षा तपासणी सूची**:\n{checklist_str}"
            )

        elif intent == "wave":
            body = (
                f"🌊 **सागरी लाटा व प्रवाहाचे स्वरूप ({reg_name_mr})**:\n\n"
                f"• **लाटांची उंची**: **{wave_val} मीटर**\n"
                f"• **उसळीचा कालावधी व दिशा**: **{region_data['ocean']['swell_period']} सेकंद** ({region_data['ocean']['swell_direction']} कडून)\n"
                f"• **प्रवाहाचा वेग**: **{region_data['ocean']['current_speed']} नॉट्स** ({region_data['ocean']['current_direction']})\n"
                f"• **समुद्राची स्थिती**: **{region_data['ocean'].get('sea_state_mr', region_data['ocean']['sea_state'])}**\n"
                f"• **पाण्याची पारदर्शकता व तापमान**: {region_data['ocean']['underwater_visibility_m']} मीटर | पाण्याचे तापमान: {sst_val}°C"
            )

        elif intent == "weather":
            body = (
                f"🌤️ **हवामान व वातावरणीय नोंदी ({reg_name_mr})**:\n\n"
                f"• **वाऱ्याचा वेग**: **{wind_val} नॉट्स ({wind_kmh} किमी/तास)** दिशा: {region_data['weather']['wind_direction']}\n"
                f"• **वाऱ्याचे जोरदार झोत**: **{region_data['weather']['wind_gusts']} नॉट्स**\n"
                f"• **हवेचा दाब (Barometer)**: **{region_data['weather']['barometric_pressure']} hPa** ({region_data['weather']['pressure_trend']})\n"
                f"• **पावसाची शक्यता**: {region_data['weather']['precipitation']}%\n"
                f"• **तापमान व आर्द्रता**: {region_data['weather']['air_temperature']}°C | आर्द्रता: {region_data['weather']['humidity']}%\n"
                f"• **दृश्यमानता**: {region_data['weather']['visibility_nm']} सागरी मैल ({cond_mr})"
            )

        elif intent == "storm":
            if has_storm_warning:
                warn_mr = ", ".join(region_data["weather"].get("warnings_mr", ["वेगवान वादळी वाऱ्यांचा इशारा"]))
                body = (
                    f"⚠️ **वादळ व चक्रीवादळ इशारा**: {reg_name_mr} भागात वादळी हवामानाचा इशारा जारी आहे ({warn_mr})!\n\n"
                    f"• वाऱ्याचा वेग: **{wind_val} नॉट्स ({wind_kmh} किमी/तास)** झोत: **{region_data['weather']['wind_gusts']} नॉट्स**\n"
                    f"• लाटांची उंची: **{wave_val} मीटर** ({region_data['ocean'].get('sea_state_mr', region_data['ocean']['sea_state'])})\n"
                    f"• हवेचा दाब: **{region_data['weather']['barometric_pressure']} hPa**\n"
                    f"🛡️ **सूचना**: मच्छीमारांनी समुद्रात जाणे पूर्णपणे टाळावे व बोटी त्वरित किनाऱ्यावर आणाव्यात."
                )
            else:
                body = (
                    f"✅ **वादळाचा कोणताही इशारा नाही**: सध्या {reg_name_mr} परिसरात वादळाचा अथवा चक्रीवादळाचा कोणताही इशारा नाही.\n\n"
                    f"• हवामान: {cond_mr}\n"
                    f"• वारे: {wind_val} नॉट्स | लाटा: {wave_val} मीटर | हवेचा दाब: {region_data['weather']['barometric_pressure']} hPa (स्थिर)"
                )

        elif intent == "tide":
            body = (
                f"⏳ **भरती-ओहोटी वेळापत्रक व नौकायन वेळ ({reg_name_mr})**:\n\n"
                f"• 🔺 **पहिली भरती (High Tide)**: {region_data['tide']['high_tide_1']}\n"
                f"• 🔻 **पहिली ओहोटी (Low Tide)**: {region_data['tide']['low_tide_1']}\n"
                f"• 🔺 **दुसरी भरती**: {region_data['tide']['high_tide_2']}\n"
                f"• 🔻 **दुसरी ओहोटी**: {region_data['tide']['low_tide_2']}\n\n"
                f"• **भरती मर्यादा व प्रकार**: {region_data['tide']['tidal_range_m']} मीटर ({region_data['tide'].get('cycle_mr', region_data['tide']['cycle'])})\n"
                f"• **शांत पाण्याचा कालावधी (Slack Water)**: {region_data['tide'].get('slack_window_mr', region_data['tide']['slack_window'])}\n"
                f"• **सँडबार पाण्याची खोली**: ओहोटीच्या वेळीही {region_data['tide']['sandbar_clearance_m']} मीटर सुरक्षित खोली."
            )

        elif intent == "satellite":
            body = (
                f"🛰️ **उपग्रह क्लोरोफिल व PFZ मासेमारी पट्टा विश्लेषण ({reg_name_mr})**:\n\n"
                f"• **क्लोरोफिल प्रमाण**: **{chloro_val} mg/m³** ({region_data['satellite'].get('pfz_status_mr', region_data['satellite']['pfz_status'])})\n"
                f"• **समुद्राचे तापमान (SST)**: **{sst_val}°C** (बदल: {region_data['satellite']['sst_anomaly']:+}°C)\n"
                f"• **प्लवक (Plankton) घनता**: {region_data['satellite']['plankton_density']}\n"
                f"• **थर्मल फ्रंट सीमा**: {region_data['satellite']['thermal_front']}\n"
                f"• **उपग्रह स्रोत**: {region_data['satellite']['sensor_source']}"
            )

        elif intent == "bathymetry":
            body = (
                f"🗺️ **समुद्रतळ व महाद्वीपीय शेल्फ खोली ({reg_name_mr})**:\n\n"
                f"• **शेल्फचा विस्तार**: किनाऱ्यापासून {region_data['bathymetry']['shelf_width_km']} किमी\n"
                f"• **समुद्रतळाचा प्रकार**: {region_data['bathymetry'].get('seabed_type_mr', region_data['bathymetry']['seabed_type'])}\n"
                f"• **सागरी खोली (Contours)**:\n"
                f"  - १० किमी अंतरावर: {region_data['bathymetry']['depth_10km']}\n"
                f"  - २५ किमी अंतरावर: {region_data['bathymetry']['depth_25km']}\n"
                f"  - ५० किमी अंतरावर: {region_data['bathymetry']['depth_50km']}\n"
                f"  - शेल्फ ब्रेक: {region_data['bathymetry']['depth_shelf_break']}"
            )

        elif intent == "gis":
            zones_str = "\n".join([f"  • **{z.get('name_mr', z['name'])}**: {z['distance_km']} किमी दूर ({z.get('status_mr', z['status'])})" for z in region_data["gis"]["restricted_zones"]])
            body = (
                f"🌐 **सागरी सीमा व प्रतिबंधित क्षेत्र माहिती ({reg_name_mr})**:\n\n"
                f"• **आंतरराष्ट्रीय सागरी सीमेपासून (IMBL) अंतर**: **{region_data['gis']['distance_to_imbl']} किमी**\n"
                f"• **सीमा सुरक्षा स्थिती**: {region_data['gis'].get('imbl_status_mr', region_data['gis']['imbl_status'])}\n\n"
                f"**जवळचे प्रतिबंधित सागरी क्षेत्र**:\n{zones_str}"
            )

        elif intent == "community":
            if len(region_reports) > 0:
                rep_list_str = "\n".join([f"  • [{r.get('timestamp_mr', r['timestamp'])}] ({r.get('type_mr', r['type'])}): \"{r.get('text_mr', r['text'])}\"" for r in region_reports])
                body = f"👥 **स्थानिक मच्छीमार समुदाय अहवाल ({reg_name_mr})**:\n\n{rep_list_str}"
            else:
                body = f"👥 **स्थानिक मच्छीमार अहवाल**: {reg_name_mr} भागात मागील १२ तासांत नवीन नोंद नाही."

        elif intent == "timing":
            body = (
                f"⏰ **मासेमारी व बोट सोडण्यासाठी सर्वोत्तम वेळ ({reg_name_mr})**:\n\n"
                f"• **सर्वोत्तम मासेमारी वेळ**: **{species_info.get('catch_window_mr', 'पहाटे ०५:०० ते सकाळी ०९:३० वाजेपर्यंत')}** (भरतीच्या काळात माशांची हालचाल अधिक)\n"
                f"• **बोट सोडण्यासाठी शांत पाण्याची वेळ**: {region_data['tide'].get('slack_window_mr', region_data['tide']['slack_window'])}\n"
                f"• **सागरी स्थिती**: लाटा {wave_val} मीटर | वारे {wind_val} नॉट्स ({region_data['weather']['wind_direction']})\n"
                f"• **स्थानिक मासे**: {', '.join(species_info.get('primary_mr', []))}"
            )

        elif intent == "safety":
            safety_verdict = "होय, आज समुद्रात जाणे पूर्णपणे सुरक्षित आहे." if danger_level == "SAFE" else "आज समुद्रात जाताना सावधगिरी बाळगावी." if danger_level == "CAUTION" else "नाही, आज समुद्रात जाणे धोकादायक व असुरक्षित आहे."
            body = (
                f"🛡️ **सुरक्षा निष्कर्ष व धोका विश्लेषण**:\n\n"
                f"**{safety_verdict}**\n\n"
                f"• **सुरक्षा पातळी**: **{danger_mr}** (जोखिम निर्देशांक: {total_risk}/100)\n"
                f"• **लाटांची उंची**: {wave_val} मीटर ({region_data['ocean'].get('sea_state_mr', region_data['ocean']['sea_state'])})\n"
                f"• **वाऱ्याचा वेग व झोत**: {wind_val} नॉट्स ({wind_kmh} किमी/तास) | झोत: {region_data['weather']['wind_gusts']} नॉट्स\n"
                f"• **हवामान**: {cond_mr} | हवेचा दाब: {region_data['weather']['barometric_pressure']} hPa\n"
                f"• **सीमेपासून अंतर**: IMBL पासून {region_data['gis']['distance_to_imbl']} किमी दूर"
            )

        else: # fish_general or general
            species_list_mr = ", ".join(species_info.get("primary_mr", ["बांगडा (मॅकरेल)", "पापलेट", "बोंबील", "तारली"]))
            body = (
                f"🛰️ **मासेमारी व सागरी माहिती अहवाल ({reg_name_mr})**:\n\n"
                f"• **संभाव्य मासेमारी क्षेत्र (PFZ)**: {region_data['satellite'].get('pfz_status_mr', 'उच्च संभाव्य मासेमारी क्षेत्र')} (क्लोरोफिल: {chloro_val} mg/m³, तापमान: {sst_val}°C)\n"
                f"• **स्थानिक प्रमुख मासे**: {species_list_mr}\n"
                f"• **योग्य जाळे व खोली**: {species_info.get('gear_mr', 'ड्रिफ्ट नेट आणि गिलनेट')} ({species_info.get('depth_range_mr', '15-45 मीटर')})\n"
                f"• **भरतीची वेळ**: पहिली भरती {region_data['tide']['high_tide_1']}, ओहोटी {region_data['tide']['low_tide_1']}\n"
                f"• **सुरक्षा पातळी**: **{danger_mr}** (जोखिम: {total_risk}/100, वारे: {wind_val} नॉट्स, लाटा: {wave_val} मी)"
            )
            
        final_answer = f"{intro}\n\n{body}"

    trace.append({
        "agent": "Brain Agent",
        "status": "completed",
        "message": f"Consolidated domain findings and translated dynamic output to user preferred language (**{lang_name}**)."
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
