"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BrainCircuit, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Navigation, 
  Activity, 
  Wind, 
  Waves, 
  Satellite, 
  MapPin, 
  ShieldAlert, 
  RefreshCw,
  Users,
  Volume2,
  Square,
  VolumeX
} from "lucide-react";

import { REGION_SPECIES } from "@/data/speciesData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Message {
  sender: "user" | "innowave";
  text: string;
  timestamp: string;
}

// Detect response language from script and grammar keywords
const detectLanguage = (text: string): { langCode: string; label: string } => {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (!hasDevanagari) {
    return { langCode: "en-US", label: "English" };
  }
  
  const marathiMarkers = ["आहे", "आहेत", "नाही", "नाहीत", "कोणती", "कोणता", "कोणते", "मासेमारी", "मासे", "वादळ", "वादळाचा", "वादळाची", "वेळ", "वेळापत्रक", "साठी", "च्या", "ची", "चे", "चा", "तील", "समुद्रात", "उद्या", "लाटा", "लाटांची", "वारा", "वाऱ्याचा", "अहवाल", "किनारपट्टी", "बाजारभाव", "जाळे", "खोली"];
  const hindiMarkers = ["है", "हैं", "था", "थी", "क्या", "कौन", "कौनसा", "कौनसी", "कौन सा", "कौन सी", "मछली", "पकड़ने", "में", "के", "की", "का", "को", "से", "पास", "लिए", "जाना", "सकता", "सकती", "मौसम", "तूफान", "समय", "खतरा", "अच्छा", "अच्छी", "तट", "दाम", "जाल", "गहराई"];
  
  let mrScore = marathiMarkers.filter(word => text.includes(word)).length;
  let hiScore = hindiMarkers.filter(word => text.includes(word)).length;
  
  if (text.endsWith("का") || text.endsWith("का?") || text.includes("आहे का")) {
    mrScore += 2;
  }
  
  return mrScore > hiScore
    ? { langCode: "mr-IN", label: "Marathi" } 
    : { langCode: "hi-IN", label: "Hindi" };
};

// Clean text for natural speech synthesis playback
const cleanTextForSpeech = (rawText: string) => {
  return rawText
    .replace(/[*#`_~]/g, "")
    .replace(/^[•\-\*]\s+/gm, "")
    .replace(/([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF])/g, "")
    .replace(/\bkts\b/gi, " knots")
    .replace(/\bkm\/h\b/gi, " kilometers per hour")
    .replace(/\bmg\/m³\b/gi, " milligrams per cubic meter")
    .replace(/\(Client Fallback Active\)/gi, "")
    .trim();
};

// Best matching voice resolver with cross-language phonetic fallback
const getBestVoice = (targetLang: string): SpeechSynthesisVoice | null => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact match (e.g. "mr-IN", "hi-IN", "en-US")
  let match = voices.find(v => v.lang.toLowerCase() === targetLang.toLowerCase());
  if (match) return match;

  // 2. Prefix match (e.g. "mr", "hi", "en")
  const prefix = targetLang.split("-")[0].toLowerCase();
  match = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
  if (match) return match;

  // 3. Marathi Devanagari fallback to Hindi voice if Marathi voice is not installed
  if (prefix === "mr") {
    const hiVoice = voices.find(v => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) return hiVoice;
  }

  return null;
};

// Enriched Telemetry database for client fallback simulation
const LOCAL_MOCK_DATA: Record<string, any> = {
  mumbai: {
    name: "Mumbai Coast", name_hi: "मुंबई तट", name_mr: "मुंबई किनारपट्टी",
    lat: 18.95, lon: 72.80,
    wind: 12.5, wave: 1.2, chloro: 4.8, sst: 28.2, tide_ht: "05:42 AM (3.8m)", tide_lt: "11:58 AM (1.1m)", tide_ht2: "18:15 PM (3.5m)", tide_lt2: "23:49 PM (0.8m)",
    imbl: 320.0, safety: "SAFE", danger_score: 18,
    condition: "Partly Cloudy", condition_hi: "आंशिक बादल", condition_mr: "अंशतः ढगाळ",
    wind_gusts: 16.0, wind_dir: "WSW", swell_period: 8.0, swell_dir: "WSW (245°)", current_spd: 0.6, current_dir: "SSE",
    sea_state: "Slightly Rough (Scale 3)", sea_state_hi: "हल्का अशांत (स्केल 3)", sea_state_mr: "किंचित खवळलेला (स्केल ३)",
    barometer: 1012.4, humidity: 74, visibility_nm: 6.5,
    slack_window: "11:30 AM - 12:30 PM (Low Slack) & 05:15 AM - 06:10 AM (High Slack)",
    slack_window_hi: "11:30 AM से 12:30 PM और 05:15 AM से 06:10 AM",
    slack_window_mr: "सकाळी ११:३० ते दुपारी १२:३० व पहाटे ०५:१५ ते ०६:१०",
    restricted_zone: "Naval Dockyard Zone", restricted_dist: 8.5,
    species_primary: ["Indian Mackerel", "Silver Pomfret", "Bombay Duck", "Oil Sardines"],
    species_primary_hi: ["बांगड़ा (मैकेरल)", "सिल्वर पापलेट", "बम्बिल", "तारली"],
    species_primary_mr: ["बांगडा (मॅकरेल)", "पापलेट", "बोंबील", "तारली"],
    prices: { "Silver Pomfret (पापलेट)": "₹750 - ₹950/kg", "Surmai (सुरमई)": "₹600 - ₹850/kg", "Mackerel (बांगडा)": "₹140 - ₹220/kg", "Bombay Duck (बोंबील)": "₹160 - ₹260/kg", "Prawns (कोळंबी)": "₹380 - ₹620/kg" },
    fuel_tip: "Following bearing 255° to the 4.8 mg/m³ chlorophyll front at 8.5 knots saves ~24% diesel.",
    fuel_tip_hi: "255° दिशा में 8.5 नॉट की गति से PFZ की ओर जाने पर 24% डीजल की बचत होती है।",
    fuel_tip_mr: "२५५° दिशेने ८.५ नॉट्स वेगाने गेल्यास अंदाजे २४% डिझेलची बचत होते.",
    emergency_helpline: "1554 (Toll-Free, 24x7 ICG Distress)",
    mrcc_vhf: "VHF Channel 16 (156.800 MHz)"
  },
  goa: {
    name: "Goa Coast", name_hi: "गोवा तट", name_mr: "गोवा किनारपट्टी",
    lat: 15.49, lon: 73.82,
    wind: 9.8, wave: 0.8, chloro: 5.1, sst: 28.5, tide_ht: "06:15 AM (1.8m)", tide_lt: "12:20 PM (0.3m)", tide_ht2: "18:40 PM (1.6m)", tide_lt2: "00:45 AM (0.2m)",
    imbl: 380.0, safety: "SAFE", danger_score: 15,
    condition: "Sunny and Clear", condition_hi: "धूप और साफ मौसम", condition_mr: "स्वच्छ व निरभ्र आकाश",
    wind_gusts: 13.0, wind_dir: "NW", swell_period: 7.2, swell_dir: "WNW (290°)", current_spd: 0.4, current_dir: "SE",
    sea_state: "Calm (Scale 2)", sea_state_hi: "शांत समुद्र (स्केल 2)", sea_state_mr: "शांत समुद्र (स्केल २)",
    barometer: 1013.2, humidity: 68, visibility_nm: 8.0,
    slack_window: "11:50 AM - 12:45 PM & 05:45 AM - 06:40 AM",
    slack_window_hi: "11:50 AM से 12:45 PM और 05:45 AM से 06:40 AM",
    slack_window_mr: "सकाळी ११:५० ते दुपारी १२:४५ व पहाटे ०५:४५ ते ०६:४०",
    restricted_zone: "Mormugao Port Limit", restricted_dist: 11.5,
    species_primary: ["Kingfish (Surmai)", "Yellowfin Tuna", "Indian Mackerel", "Seer Fish"],
    species_primary_hi: ["सुरमई", "येलोफिन टूना", "बांगड़ा", "सीर फिश"],
    species_primary_mr: ["सुरमई", "यलोफिन टुना", "बांगडा", "इसवण"],
    prices: { "Surmai (सुरमई)": "₹650 - ₹900/kg", "Yellowfin Tuna (टुना)": "₹240 - ₹350/kg", "Squid (माकली)": "₹300 - ₹450/kg", "Pomfret (पापलेट)": "₹700 - ₹920/kg" },
    fuel_tip: "Following bearing 270° towards the 5.1 mg/m³ PFZ zone at 8.0 knots yields ~26% fuel efficiency.",
    fuel_tip_hi: "270° दिशा में 8.0 नॉट की गति से जाने पर लगभग 26% ईंधन बचता है।",
    fuel_tip_mr: "२७०° दिशेने ८.० नॉट्स वेगाने गेल्यास सुमारे २६% इंधनाची बचत होते.",
    emergency_helpline: "1554 (Toll-Free, ICG Goa HQ)",
    mrcc_vhf: "VHF Channel 16 (156.800 MHz)"
  },
  kochi: {
    name: "Kochi Coast", name_hi: "कोच्चि तट", name_mr: "कोची किनारपट्टी",
    lat: 9.93, lon: 76.15,
    wind: 28.0, wave: 3.8, chloro: 1.2, sst: 26.5, tide_ht: "04:12 AM (1.4m)", tide_lt: "10:30 AM (0.4m)", tide_ht2: "16:45 PM (1.3m)", tide_lt2: "22:50 PM (0.3m)",
    imbl: 280.0, safety: "DANGER", danger_score: 85,
    condition: "Severe Thunderstorm", condition_hi: "भीषण आंधी-तूफान", condition_mr: "तीव्र वादळी पाऊस",
    warnings: ["Gale warning in effect", "Squall alert", "IMD Red Alert"],
    warnings_hi: ["तेज समुद्री तूफान चेतावनी", "IMD रेड अलर्ट"],
    warnings_mr: ["वेगवान वादळी वाऱ्यांचा इशारा", "IMD रेड वॉर्निंग"],
    wind_gusts: 38.0, wind_dir: "W", swell_period: 12.0, swell_dir: "WSW (240°)", current_spd: 1.8, current_dir: "SSE",
    sea_state: "Rough to Very Rough (Scale 6)", sea_state_hi: "अत्यंत अशांत (स्केल 6)", sea_state_mr: "अत्यंत खवळलेला (स्केल ६)",
    barometer: 998.2, humidity: 94, visibility_nm: 2.0,
    slack_window: "Hazardous - Storm surges overpower tidal slack",
    slack_window_hi: "खतरनाक - तेज आंधी के कारण नौकायन वर्जित",
    slack_window_mr: "धोकादायक - तीव्र वादळामुळे बोटी समुद्रात नेणे वर्जित",
    restricted_zone: "Port Channel Area", restricted_dist: 1.2,
    species_primary: ["Indian Oil Sardines", "Malabar Anchovy", "Karikkadi Prawns", "Threadfin Bream"],
    species_primary_hi: ["तारली", "एंकोवी", "करिक्काडी झींगा", "किलिमीस"],
    species_primary_mr: ["तारली", "नेतळी", "कोळंबी", "राणी मासा"],
    prices: { "Sardines (तारली)": "₹70 - ₹120/kg", "Karikkadi Prawns (कोळंबी)": "₹260 - ₹390/kg", "Anchovy (नेतळी)": "₹110 - ₹170/kg" },
    fuel_tip: "Sailing strictly not recommended due to severe squall hazards.",
    fuel_tip_hi: "तूफान के कारण समुद्र में जाना पूर्णतः वर्जित है।",
    fuel_tip_mr: "वादळी हवामानामुळे समुद्रात जाणे पूर्णपणे टाळावे.",
    emergency_helpline: "1554 (MRCC Kochi 0484-2218804)",
    mrcc_vhf: "VHF Channel 16 & DSC Ch 70"
  },
  chennai: {
    name: "Chennai Coast", name_hi: "चेन्नई तट", name_mr: "चेन्नई किनारपट्टी",
    lat: 13.08, lon: 80.30,
    wind: 9.5, wave: 0.8, chloro: 3.1, sst: 29.5, tide_ht: "06:30 AM (1.2m)", tide_lt: "12:45 PM (0.2m)", tide_ht2: "18:50 PM (1.1m)", tide_lt2: "00:55 AM (0.1m)",
    imbl: 210.0, safety: "SAFE", danger_score: 12,
    condition: "Sunny / Clear", condition_hi: "धूप और साफ मौसम", condition_mr: "स्वच्छ व निरभ्र",
    wind_gusts: 12.0, wind_dir: "SE", swell_period: 7.0, swell_dir: "ESE (115°)", current_spd: 0.4, current_dir: "NNE",
    sea_state: "Calm (Scale 2)", sea_state_hi: "शांत समुद्र (स्केल 2)", sea_state_mr: "शांत समुद्र (स्केल २)",
    barometer: 1011.8, humidity: 72, visibility_nm: 8.5,
    slack_window: "12:15 PM - 01:15 PM & 06:00 AM - 07:00 AM",
    slack_window_hi: "12:15 PM से 01:15 PM और 06:00 AM से 07:00 AM",
    slack_window_mr: "दुपारी १२:१५ ते ०१:१५ व सकाळी ०६:०० ते ०७:००",
    restricted_zone: "Ennore Port Limit", restricted_dist: 12.0,
    species_primary: ["Ribbonfish", "Squid & Cuttlefish", "Tiger Prawns", "Lesser Sardines"],
    species_primary_hi: ["रिबनफिश", "स्क्विड", "टाइगर झींगा", "सार्डिन"],
    species_primary_mr: ["वाकटी", "मांदेली/स्क्विड", "वाघ्या कोळंबी", "तारली"],
    prices: { "Tiger Prawns (वाघ्या कोळंबी)": "₹550 - ₹800/kg", "Squid (स्क्विड)": "₹320 - ₹480/kg", "Ribbonfish (वाकटी)": "₹150 - ₹230/kg" },
    fuel_tip: "Sailing at 8.0 knots directly along the 3.1 mg/m³ chlorophyll band saves ~20% fuel.",
    fuel_tip_hi: "3.1 मि.ग्रा. क्लोरोफिल बैंड के साथ 8.0 नॉट पर चलने से 20% ईंधन बचता है।",
    fuel_tip_mr: "३.१ mg/m³ क्लोरोफिल पट्ट्यात ८.० नॉट्स वेगाने गेल्यास २०% इंधन वाचते.",
    emergency_helpline: "1554 (MRCC Chennai 044-23460405)",
    mrcc_vhf: "VHF Channel 16 (156.800 MHz)"
  },
  veraval: {
    name: "Veraval / Gujarat Coast", name_hi: "वेरावल / गुजरात तट", name_mr: "वेरावळ / गुजरात किनारपट्टी",
    lat: 20.90, lon: 70.37,
    wind: 18.0, wave: 2.2, chloro: 6.2, sst: 27.0, tide_ht: "07:10 AM (2.8m)", tide_lt: "13:20 PM (0.8m)", tide_ht2: "19:35 PM (2.6m)", tide_lt2: "01:40 AM (0.6m)",
    imbl: 78.0, safety: "CAUTION", danger_score: 48,
    condition: "Overcast", condition_hi: "घने बादल", condition_mr: "ढगाळ वातावरण",
    warnings: ["Moderate swell advisory", "IMBL proximity alert"],
    warnings_hi: ["मध्यम ऊंची लहरों की सलाह", "अंतर्राष्ट्रीय सीमा निकटता अलर्ट"],
    warnings_mr: ["मध्यम लाटांचा इशारा", "आंतरराष्ट्रीय सागरी सीमा दक्षता इशारा"],
    wind_gusts: 24.0, wind_dir: "NW", swell_period: 9.5, swell_dir: "WNW (285°)", current_spd: 0.9, current_dir: "SE",
    sea_state: "Moderate (Scale 4)", sea_state_hi: "मध्यम अशांत (स्केल 4)", sea_state_mr: "मध्यम खवळलेला (स्केल ४)",
    barometer: 1008.5, humidity: 80, visibility_nm: 5.0,
    slack_window: "12:50 PM - 01:45 PM & 06:40 AM - 07:35 AM",
    slack_window_hi: "12:50 PM से 01:45 PM और 06:40 AM से 07:35 AM",
    slack_window_mr: "दुपारी १२:५० ते ०१:४५ व सकाळी ०६:४० ते ०७:३५",
    restricted_zone: "International Maritime Boundary Line (78 km)", restricted_dist: 78.0,
    species_primary: ["Yellowfin Tuna", "Ribbonfish", "Silver Pomfret", "Croaker (Ghol)"],
    species_primary_hi: ["येलोफिन टूना", "रिबनफिश", "सिल्वर पापलेट", "घोल मछली"],
    species_primary_mr: ["टुना", "रिबनफिश", "पापलेट", "घोल मासा"],
    prices: { "Ghol (घोल मासा)": "₹1,200 - ₹3,500/kg", "Pomfret (पापलेट)": "₹700 - ₹900/kg", "Yellowfin Tuna (टुना)": "₹220 - ₹320/kg", "Lobster (शेवंड)": "₹1,100 - ₹1,800/kg" },
    fuel_tip: "Cruising at 8.2 knots along the 6.2 mg/m³ plankton contour saves ~22% diesel on Saurashtra voyages.",
    fuel_tip_hi: "6.2 मि.ग्रा. प्लवक क्षेत्र में 8.2 नॉट की गति से 22% डीजल बचता है।",
    fuel_tip_mr: "६.२ mg/m³ प्लवक पट्ट्यात ८.२ नॉट्स वेगाने सुमारे २२% डिझेल वाचते.",
    emergency_helpline: "1554 (ICG Station Veraval)",
    mrcc_vhf: "VHF Channel 16 & DSC Ch 70"
  },
  vizag: {
    name: "Visakhapatnam Coast", name_hi: "विशाखापट्टनम तट", name_mr: "विशाखापट्टणम किनारपट्टी",
    lat: 17.68, lon: 83.30,
    wind: 14.0, wave: 1.4, chloro: 5.5, sst: 28.8, tide_ht: "05:15 AM (1.6m)", tide_lt: "11:30 AM (0.3m)", tide_ht2: "17:35 PM (1.5m)", tide_lt2: "23:40 PM (0.2m)",
    imbl: 450.0, safety: "SAFE", danger_score: 22,
    condition: "Light Drizzle", condition_hi: "हल्की बूंदाबांदी", condition_mr: "हलक्या पावसाच्या सरी",
    wind_gusts: 18.0, wind_dir: "ENE", swell_period: 8.5, swell_dir: "ENE (070°)", current_spd: 0.7, current_dir: "SW",
    sea_state: "Slightly Rough (Scale 3)", sea_state_hi: "हल्का अशांत (स्केल 3)", sea_state_mr: "किंचित खवळलेला (स्केल ३)",
    barometer: 1010.4, humidity: 76, visibility_nm: 6.0,
    slack_window: "11:00 AM - 12:00 PM & 04:45 AM - 05:45 AM",
    slack_window_hi: "11:00 AM से 12:00 PM और 04:45 AM से 05:45 AM",
    slack_window_mr: "सकाळी ११:०० ते दुपारी १२:०० व पहाटे ०४:४५ ते ०५:४५",
    restricted_zone: "Naval Base Prohibited Area (Eastern Naval Command)", restricted_dist: 4.2,
    species_primary: ["Skipjack Tuna", "Tiger Prawns", "Indian Mackerel", "Anchovies"],
    species_primary_hi: ["स्किपजैक टूना", "टाइगर झींगा", "बांगड़ा", "एंकोवी"],
    species_primary_mr: ["टुना", "वाघ्या कोळंबी", "बांगडा", "नेतळी"],
    prices: { "Tiger Prawns (वाघ्या कोळंबी)": "₹500 - ₹750/kg", "Skipjack Tuna (टुना)": "₹260 - ₹380/kg", "Mackerel (बांगडा)": "₹130 - ₹190/kg" },
    fuel_tip: "Direct bearing 105° towards the 5.5 mg/m³ thermal front at 8.4 knots saves ~25% diesel fuel.",
    fuel_tip_hi: "105° दिशा में 8.4 नॉट की गति से चलने से 25% डीजल बचता है।",
    fuel_tip_mr: "१०५° दिशेने थर्मल फ्रंटकडे ८.४ नॉट्स वेगाने गेल्यास २५% डिझेल वाचते.",
    emergency_helpline: "1554 (ICG District HQ Vizag)",
    mrcc_vhf: "VHF Channel 16 (156.800 MHz)"
  }
};

const LOCAL_REPORTS = [
  { id: 1, type: "Good Catch", text: "Spotted large school of mackerel 12km out with heavy feeding bird activity.", text_hi: "तट से 12 किमी दूर बांगड़ा का बड़ा झुंड देखा गया।", text_mr: "किनाऱ्यापासून १२ किमी अंतरावर बांगडा माशांचा मोठा थवा आढळला आहे.", region: "mumbai", timestamp: "2 hours ago", timestamp_hi: "2 घंटे पहले", timestamp_mr: "२ तासांपूर्वी" },
  { id: 2, type: "Calm Seas", text: "Calm and clear seas today, perfect for trolling lines and Kingfish catch.", text_hi: "आज समुद्र शांत है, सुरमई मछली पकड़ने हेतु सर्वोत्तम स्थिति है।", text_mr: "आज समुद्र शांत असून सुरमई मासेमारीसाठी उत्तम स्थिती आहे.", region: "goa", timestamp: "5 hours ago", timestamp_hi: "5 घंटे पहले", timestamp_mr: "५ तासांपूर्वी" },
  { id: 3, type: "Storm Warning", text: "Sudden squall winds peaking 35 kts and dark storm clouds forming. Boats retreating to harbor.", text_hi: "अचानक 35 नॉट की तेज आंधी और काले तूफानी बादल घिर रहे हैं।", text_mr: "अचानक ३५ नॉट्सचे जोरदार वादळी वारे व काळे ढग जमा होत आहेत.", region: "kochi", timestamp: "1 hour ago", timestamp_hi: "1 घंटा पहले", timestamp_mr: "१ तासापूर्वी" },
  { id: 4, type: "High Waves", text: "Slightly high wave swells of 1.6m, good bottom trawl catches of Tiger Prawns.", text_hi: "1.6 मीटर ऊंची लहरें, बॉटम ट्रॉल में टाइगर झींगा मिला।", text_mr: "१.६ मीटर उंच लाटा, बॉटम ट्रॉलमध्ये वाघ्या कोळंबी मिळाली.", region: "chennai", timestamp: "4 hours ago", timestamp_hi: "4 घंटे पहले", timestamp_mr: "४ तासांपूर्वी" },
  { id: 5, type: "Good Catch", text: "Rich plankton density, caught massive haul of Tuna and Ghol fish 35km offshore.", text_hi: "भरपूर प्लवक घनत्व, टूना और घोल मछली की भारी मात्रा पकड़ी गई।", text_mr: "प्लवक घनता उत्तम असून टुना व घोल माशांची मोठी मासेमारी झाली.", region: "veraval", timestamp: "6 hours ago", timestamp_hi: "6 घंटे पहले", timestamp_mr: "६ तासांपूर्वी" }
];

export default function CopilotPage() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        setQuery(q);
      }
    }
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "innowave",
      text: "Hello! I am INNOWAVE, your collaborative marine intelligence assistant. Ask me questions about ocean conditions, fish species, dockside market prices, gear recommendations, wave swells, tides, Coast Guard emergency helplines, or potential fishing zones near Mumbai, Goa, Kochi, Chennai, Veraval, or Vizag. You can speak to me in English, Hindi, or Marathi.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("en"); // en, hi, mr
  
  // Agent Trace states
  const [reasoningTrace, setReasoningTrace] = useState<any[]>([]);
  const [dangerScore, setDangerScore] = useState<number | null>(null);
  
  // Confidence & Agreement states
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [agentAgreement, setAgentAgreement] = useState<{
    status: string;
    badge_text: string;
    explanation: string;
  } | null>(null);

  // Read Aloud (TTS) state
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load and cache SpeechSynthesis voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Toggle Read Aloud for a given message
  const toggleReadAloud = (index: number, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    if (isListening) {
      setIsListening(false);
    }

    const { langCode } = detectLanguage(text);
    const cleanedText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = langCode;

    const voice = getBestVoice(langCode);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.warn("SpeechSynthesis error:", e);
      }
      setSpeakingIndex(null);
    };

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const startSpeechRecognition = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-US";
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };
    recognition.start();
  };

  // Run Local Simulator Flow (Granular Multi-Intent Dynamic Engine)
  const runLocalAgentSimulation = (text: string) => {
    const textLower = text.toLowerCase();
    
    // 1. Detect language
    const { langCode } = detectLanguage(text);
    const detectedLang = langCode.startsWith("mr") ? "mr" : langCode.startsWith("hi") ? "hi" : "en";

    // 2. Resolve Location
    let targetKey = "";
    let loc_trace_msg = "";
    
    const locationVariations: Record<string, string[]> = {
      mumbai: ["mumbai", "bombay", "mumb", "mum", "मुम्बई", "मुंबई", "मुंबईत", "मुंबईच्या", "मुंबईतील", "बॉम्बे"],
      goa: ["goa", "panaji", "panjim", "गोवा", "गोव्यात", "गोव्याच्या", "गोव्या", "पणजी"],
      kochi: ["kochi", "cochin", "कोच्चि", "कोची", "कोचीन", "कोच्चीत", "कोचीच्या"],
      chennai: ["chennai", "madras", "चेन्नई", "मद्रास", "चेन्नईत", "चेन्नईच्या"],
      veraval: ["veraval", "gujarat", "वेरावळ", "वेरावळात", "वेरावल", "गुजरात", "सौराष्ट्र"],
      vizag: ["vizag", "visakhapatnam", "विशाखापट्टनम", "विशाखापट्टणम", "विशाखापत्तनम", "वाईझॅग"]
    };

    for (const [key, words] of Object.entries(locationVariations)) {
      if (words.some(w => textLower.includes(w))) {
        targetKey = key;
        loc_trace_msg = `Resolved location target: **${LOCAL_MOCK_DATA[key].name}**.`;
        break;
      }
    }

    if (!targetKey) {
      targetKey = "mumbai";
      loc_trace_msg = "No specific location detected, using Mumbai as default";
    }

    const d = LOCAL_MOCK_DATA[targetKey];
    const langName = detectedLang === "en" ? "English" : detectedLang === "hi" ? "Hindi (हिंदी)" : "Marathi (मराठी)";

    // 3. Extract Time Context
    const isTomorrow = textLower.includes("tomorrow") || textLower.includes("कल") || textLower.includes("उद्या");
    const isToday = textLower.includes("today") || textLower.includes("आज");
    const isMorning = textLower.includes("morning") || textLower.includes("सकाळ") || textLower.includes("सकाळी") || textLower.includes("सुबह") || textLower.includes("पहाटे");
    const isEvening = textLower.includes("evening") || textLower.includes("संध्याकाळ") || textLower.includes("संध्याकाळी") || textLower.includes("शाम");
    
    let time_ctx = { key: "", en: "", hi: "", mr: "" };
    if (isTomorrow && isMorning) time_ctx = { key: "tomorrow morning", en: "tomorrow morning", hi: "कल सुबह", mr: "उद्या सकाळी" };
    else if (isTomorrow && isEvening) time_ctx = { key: "tomorrow evening", en: "tomorrow evening", hi: "कल शाम", mr: "उद्या संध्याकाळी" };
    else if (isTomorrow) time_ctx = { key: "tomorrow", en: "tomorrow", hi: "कल", mr: "उद्या" };
    else if (isToday && isMorning) time_ctx = { key: "today morning", en: "today morning", hi: "आज सुबह", mr: "आज सकाळी" };
    else if (isToday && isEvening) time_ctx = { key: "today evening", en: "today evening", hi: "आज शाम", mr: "आज संध्याकाळी" };
    else if (isToday) time_ctx = { key: "today", en: "today", hi: "आज", mr: "आज" };
    else if (isMorning) time_ctx = { key: "morning", en: "morning", hi: "सुबह", mr: "सकाळी" };
    else if (isEvening) time_ctx = { key: "evening", en: "evening", hi: "शाम", mr: "संध्याकाळी" };

    // 4. Granular Intent Detection
    const isEmergency = ["emergency", "sos", "helpline", "coast guard", "distress", "rescue", "help number", "आपत्कालीन", "मदत", "कोस्ट गार्ड", "नंबर", "आपातकालीन", "तटरक्षक"].some(w => textLower.includes(w));
    const isMarket = ["price", "prices", "rate", "rates", "cost", "market", "demand", "auction", "diesel", "fuel", "दाम", "भाव", "बाजारभाव", "कीमत", "मूल्य", "डीजल", "डिझेल", "इंधन"].some(w => textLower.includes(w));
    const isGear = ["gear", "net", "nets", "mesh", "gillnet", "trawl", "hooks", "जाळे", "मेश", "गियर", "नेट", "जाल", "कांटा"].some(w => textLower.includes(w));
    const isStorm = ["storm", "cyclone", "squall", "depression", "gale", "वादळ", "चक्रीवादळ", "आंधी", "तूफान"].some(w => textLower.includes(w));
    const isWave = ["wave", "waves", "swell", "swells", "current", "sea state", "लाटा", "लाट", "उसळी", "प्रवाह", "लहर", "तरंग"].some(w => textLower.includes(w));
    const isWeather = ["wind", "gust", "rain", "temperature", "humidity", "weather", "वारा", "पाऊस", "हवामान", "मौसम", "हवा", "बारिश"].some(w => textLower.includes(w));
    const isTide = ["tide", "tides", "high tide", "low tide", "slack", "भरती", "ओहोटी", "ज्वार", "भाटा"].some(w => textLower.includes(w));
    const isSatellite = ["chlorophyll", "plankton", "sst", "satellite", "thermal", "oceansat", "क्लोरोफिल", "प्लवक", "उपग्रह"].some(w => textLower.includes(w));
    const isBoundary = ["border", "boundary", "imbl", "restricted", "navy", "dockyard", "सीमा", "प्रतिबंधित", "नौदल", "नौसेना"].some(w => textLower.includes(w));
    const isCommunity = ["community", "other fishermen", "reports", "crowd", "recent catch", "अहवाल", "मच्छीमार नोंदी", "मछुआरों की रिपोर्ट"].some(w => textLower.includes(w));
    const isTiming = ["best time", "timing", "departure", "when to go", "सर्वोत्तम वेळ", "कधी जावे", "अनुकूल समय", "कब जाना"].some(w => textLower.includes(w));
    const isSafe = ["safe", "safety", "danger", "warning", "सुरक्षित", "धोका", "खतरा", "इशारा", "चेतावनी"].some(w => textLower.includes(w));
    const isFishSpecies = ["pomfret", "surmai", "tuna", "mackerel", "sardine", "prawn", "ghol", "squid", "पापलेट", "सुरमई", "टुना", "टूना", "बांगडा", "बांगड़ा", "तारली", "कोळंबी", "झींगा", "घोल"].some(w => textLower.includes(w));

    let intent = "general";
    if (isEmergency) intent = "emergency";
    else if (isMarket) intent = "market";
    else if (isFishSpecies) intent = "species_profile";
    else if (isGear) intent = "gear";
    else if (isStorm) intent = "storm";
    else if (isWave) intent = "wave";
    else if (isWeather) intent = "weather";
    else if (isTide) intent = "tide";
    else if (isSatellite) intent = "satellite";
    else if (isBoundary) intent = "gis";
    else if (isCommunity) intent = "community";
    else if (isTiming) intent = "timing";
    else if (isSafe) intent = "safety";

    // 5. Calculations
    const wind_val = parseFloat((d.wind + (Math.random() * 1.0 - 0.5)).toFixed(1));
    const wave_val = parseFloat(Math.max(0.2, d.wave + (Math.random() * 0.2 - 0.1)).toFixed(2));
    const chloro_val = parseFloat(Math.max(0.1, d.chloro + (Math.random() * 0.3 - 0.15)).toFixed(1));
    const sst_val = parseFloat((d.sst + (Math.random() * 0.4 - 0.2)).toFixed(1));

    const activeReports = LOCAL_REPORTS.filter(r => r.region === targetKey);
    let community_risk_mod = 0;
    activeReports.forEach(r => {
      if (r.type === "Storm Warning") community_risk_mod += 15;
      else if (r.type === "High Waves") community_risk_mod += 10;
      else if (r.type === "Calm Seas") community_risk_mod -= 5;
    });

    const has_storm_warning = (d.warnings && d.warnings.length > 0) || activeReports.some(r => r.type === "Storm Warning");
    let wind_risk = Math.min(35.0, (wind_val / 30.0) * 35.0);
    const wave_risk = Math.min(35.0, (wave_val / 4.0) * 35.0);
    const gis_risk = d.imbl < 100.0 ? (100.0 - d.imbl) * 0.3 : 0.0;
    if (has_storm_warning) wind_risk += 15.0;

    const final_danger_score = Math.round(Math.max(0, Math.min(100, wind_risk + wave_risk + Math.min(30.0, gis_risk) + community_risk_mod)));
    const safety_level = final_danger_score < 40 ? "SAFE" : final_danger_score < 70 ? "CAUTION" : "DANGER";

    // Dynamic Agreement Status
    const isHighPfz = chloro_val >= 4.5;
    const isUnsafe = final_danger_score >= 35;
    let agreementStatus = "agree";
    let agreementBadge = "✅ Agents in agreement";
    let agreementExplanation = "All agents report normal baseline marine and safety thresholds.";
    let confidence_score = Math.floor(88 + Math.random() * 5);
    
    if (isHighPfz && isUnsafe) {
      agreementStatus = "disagree";
      agreementBadge = "⚡ Agents partially disagree";
      agreementExplanation = "Fishing potential is high, but safety conditions are a concern.";
      confidence_score = Math.floor(81 + Math.random() * 5);
    } else if (!isHighPfz && final_danger_score >= 70) {
      agreementStatus = "agree";
      agreementBadge = "✅ Agents in agreement";
      agreementExplanation = "Agents align: low fishing potential and high storm hazard.";
      confidence_score = Math.floor(93 + Math.random() * 5);
    }

    // Compile reasoning trace
    const simulatedTrace = [];
    simulatedTrace.push({ agent: "Planner Agent", status: "completed", message: `Detected query language: **${langName}**. Deconstructing question intent structure.` });
    simulatedTrace.push({ agent: "Planner Agent", status: "completed", message: loc_trace_msg });
    
    if (time_ctx.en) {
      simulatedTrace.push({ agent: "Planner Agent", status: "completed", message: `Time context parsed: **${time_ctx.en}**.` });
    }

    simulatedTrace.push({ agent: "Planner Agent", status: "completed", message: `Query classified under **${intent.toUpperCase()}** domain. Dynamic multi-agent routing active.` });

    if (["weather", "storm", "safety", "general"].includes(intent)) {
      simulatedTrace.push({ agent: "Weather Agent", status: "completed", message: `Atmospheric scan: Wind speed **${wind_val} knots** (${d.wind_dir}), Gusts **${d.wind_gusts} kts**, Barometer: **${d.barometer} hPa**.` });
    }
    if (["wave", "safety", "general"].includes(intent)) {
      simulatedTrace.push({ agent: "Ocean Agent", status: "completed", message: `Hydrodynamic check: Swells **${wave_val}m** (Period: **${d.swell_period}s**). Current speed: **${d.current_spd} kts** (${d.current_dir}). Sea State: **${d.sea_state}**.` });
    }
    if (["satellite", "species_profile", "market", "general"].includes(intent)) {
      simulatedTrace.push({ agent: "Satellite Agent", status: "completed", message: `Remote Sensing: Chlorophyll-a evaluated at **${chloro_val} mg/m³**, SST at **${sst_val}°C**.` });
    }
    if (["tide", "timing", "general"].includes(intent)) {
      simulatedTrace.push({ agent: "Tide Agent", status: "completed", message: `Tidal Telemetry: High Tide: **${d.tide_ht}**, Low Tide: **${d.tide_lt}**. Slack: **${d.slack_window}**.` });
    }
    if (["gis", "safety", "emergency"].includes(intent)) {
      simulatedTrace.push({ agent: "GIS Agent", status: "completed", message: `Geospatial scan: Boundary line distance: **${d.imbl} km**. Sector: **${d.restricted_zone}**.` });
    }
    if (["market"].includes(intent)) {
      simulatedTrace.push({ agent: "Economic Agent", status: "completed", message: `Economic audit: Loaded dockside price matrices and fuel optimization vector.` });
    }
    if (["emergency", "safety"].includes(intent)) {
      simulatedTrace.push({ agent: "Safety & Rescue Agent", status: "completed", message: `Distress Readiness: Coast Guard Helpline **${d.emergency_helpline}** & **${d.mrcc_vhf}** verified.` });
    }
    if (activeReports.length > 0) {
      simulatedTrace.push({ agent: "Community Agent", status: "completed", message: `Retrieved ${activeReports.length} community logs. Key alert: '${activeReports[0].text}'.` });
    }

    simulatedTrace.push({ agent: "Brain Agent", status: "completed", message: `Consolidated domain findings and translated dynamic output to user preferred language (**${langName}**).` });

    // Localized assembly
    let finalAnswer = "";
    const regNameHi = d.name_hi || d.name;
    const regNameMr = d.name_mr || d.name;
    const condHi = d.condition_hi || d.condition;
    const condMr = d.condition_mr || d.condition;
    const dangerHi = safety_level === "SAFE" ? "पूर्णतः सुरक्षित" : safety_level === "CAUTION" ? "सावधानी बरतें (मध्यम जोखिम)" : "खतरा / असुरक्षित";
    const dangerMr = safety_level === "SAFE" ? "पूर्णपणे सुरक्षित" : safety_level === "CAUTION" ? "सावधगिरी बाळगा (मध्यम धोका)" : "धोकादायक / असुरक्षित";

    if (detectedLang === "en") {
      const time_prefix = time_ctx.en ? `for **${time_ctx.en}**` : "";
      const intro = `Regarding your inquiry about ${d.name} ${time_prefix}:`.trim();
      let body = "";

      if (intent === "market") {
        const pricesList = Object.entries(d.prices || {}).map(([k, v]) => `  • **${k}**: ${v}`).join("\n");
        body = `💰 **Dockside Market Rates & Economics (${d.name})**:\n\n**Current Estimated Fish Auction Rates**:\n${pricesList}\n\n⛽ **Fuel Optimization**: ${d.fuel_tip}\n🧊 **Preservation**: 1:1 ice to fish ratio recommended.`;
      } else if (intent === "emergency") {
        body = `🚨 **Emergency Helplines & Maritime Safety Protocol (${d.name})**:\n\n• 📞 **Indian Coast Guard 24x7 Helpline**: **${d.emergency_helpline}**\n• 📻 **International VHF Distress**: **${d.mrcc_vhf}**\n• 👮 **Coastal Police**: **1093**\n\n**Mandatory Safety Checklist**:\n  ✅ Lifejackets for all crew\n  ✅ VHF Radio tested on Channel 16\n  ✅ NavIC / GPS with active anchor alarm\n  ✅ Emergency distress flares and fresh water`;
      } else if (intent === "wave") {
        body = `🌊 **Hydrodynamics & Sea State Analysis for ${d.name}**:\n\n• **Significant Wave Height**: **${wave_val} meters**\n• **Swell Period & Heading**: **${d.swell_period} seconds** from **${d.swell_dir}**\n• **Surface Drift Current**: **${d.current_spd} knots** heading ${d.current_dir}\n• **Sea State Severity**: **${d.sea_state}** (SST: ${sst_val}°C)`;
      } else if (intent === "weather") {
        body = `🌤️ **Atmospheric & Weather Telemetry for ${d.name}**:\n\n• **Wind Speed**: **${wind_val} knots** from ${d.wind_dir} (Gusts: **${d.wind_gusts} kts**)\n• **Barometer**: **${d.barometer} hPa** (Steady)\n• **Air Temp & Humidity**: ${sst_val}°C | ${d.humidity}%\n• **Conditions**: ${d.condition} (Visibility: ${d.visibility_nm} NM)`;
      } else if (intent === "storm") {
        if (has_storm_warning) {
          body = `⚠️ **STORM & CYCLONE ALERT**: Active storm advisory in effect for ${d.name}!\n\n• Wind Speed: **${wind_val} knots** with squall gusts to **${d.wind_gusts} kts**\n• Wave Swells: **${wave_val}m** (${d.sea_state})\n• Barometer: **${d.barometer} hPa** (Falling)\n🛡️ **Advisory**: Fishermen are strictly advised NOT to venture into sea.`;
        } else {
          body = `✅ **NO STORM ALERT**: No active storm or cyclone warnings for ${d.name}.\n\n• Conditions: ${d.condition} | Winds: ${wind_val} knots | Waves: ${wave_val}m`;
        }
      } else if (intent === "tide") {
        body = `⏳ **Tidal Schedule & Navigation Window (${d.name})**:\n\n• 🔺 **High Tide 1**: ${d.tide_ht} | 🔻 **Low Tide 1**: ${d.tide_lt}\n• 🔺 **High Tide 2**: ${d.tide_ht2} | 🔻 **Low Tide 2**: ${d.tide_lt2}\n• **Optimal Slack Navigation Window**: ${d.slack_window}`;
      } else if (intent === "satellite") {
        body = `🛰️ **Satellite Oceanography & Thermal PFZ Analysis (${d.name})**:\n\n• **Chlorophyll-a Density**: **${chloro_val} mg/m³**\n• **Sea Surface Temperature (SST)**: **${sst_val}°C**\n• **Thermal Front**: Convergence boundary located 20-35 km offshore`;
      } else if (intent === "gear") {
        body = `🎣 **Recommended Gear & Net Configuration for ${d.name}**:\n\n• **Primary Gear**: Pelagic Drift Nets & Gillnets\n• **Mesh Size**: 35-45mm for shoaling pelagics, 120-140mm for large pomfret/surmai\n• **Target Species**: ${(d.species_primary || []).join(", ")}`;
      } else if (intent === "gis") {
        body = `🌐 **Maritime Boundaries & Restricted Zones (${d.name})**:\n\n• **Distance to IMBL Limit**: **${d.imbl} km**\n• **Local Restricted Sector**: **${d.restricted_zone}** (${d.restricted_dist} km away)`;
      } else if (intent === "safety") {
        const verdict = safety_level === "SAFE" ? "Yes, it is SAFE to proceed to sea today." : "CAUTION is advised before venturing into sea.";
        body = `🛡️ **Multi-Agent Sea Venture Safety Verdict**:\n\n**${verdict}**\n\n• **Safety Rating**: **${safety_level}** (Threat Score: ${final_danger_score}/100)\n• **Wave Height**: ${wave_val}m | **Wind Speed**: ${wind_val} knots (${d.wind_dir})\n• **Weather**: ${d.condition} | **IMBL Distance**: ${d.imbl} km`;
      } else {
        body = `🛰️ **Marine Overview (${d.name})**:\n\n• **Potential Fishing Zone**: Chlorophyll at **${chloro_val} mg/m³** and SST at **${sst_val}°C**\n• **Primary Species**: ${(d.species_primary || []).join(", ")}\n• **Safety Level**: **${safety_level}** (Threat Score: ${final_danger_score}/100, Waves: ${wave_val}m, Wind: ${wind_val} kts)`;
      }

      finalAnswer = `${intro}\n\n${body}`;

    } else if (detectedLang === "hi") {
      const time_prefix_hi = time_ctx.hi ? `${time_ctx.hi} के लिए ` : "";
      const intro = `${time_prefix_hi}${regNameHi} की स्थिति रिपोर्ट:`;
      let body = "";

      if (intent === "market") {
        const pricesList = Object.entries(d.prices || {}).map(([k, v]) => `  • **${k}**: ${v}`).join("\n");
        body = `💰 **मत्स्य बाजार भाव व आर्थिक जानकारी (${regNameHi})**:\n\n**वर्तमान अनुमानित नीलामी दरें (प्रति किग्रा)**:\n${pricesList}\n\n⛽ **ईंधन बचत सलाह**: ${d.fuel_tip_hi}\n🧊 **बर्फ अनुपात**: ताजे माल हेतु 1:1 का अनुपात रखें।`;
      } else if (intent === "emergency") {
        body = `🚨 **आपातकालीन हेल्पलाइन व समुद्री सुरक्षा प्रोटोकॉल (${regNameHi})**:\n\n• 📞 **भारतीय तटरक्षक बल (ICG हेल्पलाइन)**: **${d.emergency_helpline}**\n• 📻 **आपातकालीन रेडियो फ्रीक्वेंसी**: **${d.mrcc_vhf}**\n• 👮 **मरीन पुलिस**: **1093**\n\n**अनिवार्य सुरक्षा चेकलिस्ट**:\n  ✅ सभी हेतु लाइफ जैकेट\n  ✅ VHF मरीन रेडियो चैनल 16\n  ✅ NavIC / GPS रिसीवर व फ्लेयर्स`;
      } else if (intent === "wave") {
        body = `🌊 **सागरी लहरों व जल-प्रवाह की स्थिति (${regNameHi})**:\n\n• **लहरों की ऊंचाई**: **${wave_val} मीटर**\n• **उफान अवधि**: **${d.swell_period} सेकंड** (${d.swell_dir} से)\n• **प्रवाह गति**: **${d.current_spd} समुद्री मील** (${d.current_dir})\n• **समुद्र स्थिति**: **${d.sea_state_hi || d.sea_state}** (तापमान: ${sst_val}°C)`;
      } else if (intent === "weather") {
        body = `🌤️ **मौसम व वायुमंडलीय स्थिति (${regNameHi})**:\n\n• **हवा की गति**: **${wind_val} समुद्री मील** (${d.wind_dir}) | झोंके: **${d.wind_gusts} नॉट**\n• **वायुदाब**: **${d.barometer} hPa** (स्थिर)\n• **मौसम स्थिति**: ${condHi} (दृश्यता: ${d.visibility_nm} नॉटिकल मील)`;
      } else if (intent === "storm") {
        if (has_storm_warning) {
          body = `⚠️ **तूफान व चक्रवात चेतावनी**: ${regNameHi} में मौसम विभाग द्वारा आंधी की चेतावनी जारी है!\n\n• हवा: **${wind_val} नॉट** (झोंके: **${d.wind_gusts} नॉट**) | लहरें: **${wave_val} मीटर**\n🛡️ **सलाह**: मछुआरे समुद्र में बिल्कुल न जाएं।`;
        } else {
          body = `✅ **तूफान का कोई अलर्ट नहीं**: वर्तमान में ${regNameHi} में कोई तूफान चेतावनी नहीं है।\n\n• मौसम: ${condHi} | हवा: ${wind_val} नॉट | लहरें: ${wave_val} मीटर`;
        }
      } else if (intent === "tide") {
        body = `⏳ **ज्वार-भाटा समय व नौकायन विंडो (${regNameHi})**:\n\n• 🔺 **उच्च ज्वार 1**: ${d.tide_ht} | 🔻 **निम्न ज्वार 1**: ${d.tide_lt}\n• 🔺 **उच्च ज्वार 2**: ${d.tide_ht2} | 🔻 **निम्न ज्वार 2**: ${d.tide_lt2}\n• **शांत जल प्रस्थान विंडो**: ${d.slack_window_hi || d.slack_window}`;
      } else if (intent === "safety") {
        const verdict = safety_level === "SAFE" ? "हाँ, आज समुद्र में जाना सुरक्षित है।" : "आज समुद्र में जाने के लिए सावधानी आवश्यक है।";
        body = `🛡️ **सुरक्षा निर्णय**: ${verdict}\n\n• **सुरक्षा स्थिति**: **${dangerHi}** (जोखिम: ${final_danger_score}/100)\n• **लहरें**: ${wave_val} मीटर | **हवा**: ${wind_val} नॉट\n• **मौसम**: ${condHi} | **सीमा से दूरी**: ${d.imbl} किमी`;
      } else {
        body = `🛰️ **मत्स्य व सागरीय सूचना रिपोर्ट (${regNameHi})**:\n\n• **क्लोरोफिल**: ${chloro_val} मि.ग्रा., तापमान: ${sst_val}°C\n• **प्रमुख मछलियाँ**: ${(d.species_primary_hi || d.species_primary || []).join(", ")}\n• **सुरक्षा स्थिति**: **${dangerHi}** (जोखिम: ${final_danger_score}/100)`;
      }

      finalAnswer = `${intro}\n\n${body}`;

    } else { // Marathi
      const time_prefix_mr = time_ctx.mr ? `${time_ctx.mr} च्या माहितीनुसार ` : "";
      const intro = `${time_prefix_mr}${regNameMr} अहवाल:`;
      let body = "";

      if (intent === "market") {
        const pricesList = Object.entries(d.prices || {}).map(([k, v]) => `  • **${k}**: ${v}`).join("\n");
        body = `💰 **मत्स्य बाजारभाव व आर्थिक मार्गदर्शन ({regNameMr})**:\n\n**आजचे अंदाजे लिलाव बाजारभाव (प्रति किलो)**:\n${pricesList}\n\n⛽ **डिझेल बचत सल्ला**: ${d.fuel_tip_mr}\n🧊 **बर्फ वापर**: १:१ प्रमाणात बर्फ वापरावा.`;
      } else if (intent === "emergency") {
        body = `🚨 **आपत्कालीन मदत क्रमांक व सागरी सुरक्षा नियम (${regNameMr})**:\n\n• 📞 **तटरक्षक दल (ICG हेल्पलाईन)**: **${d.emergency_helpline}**\n• 📻 **आंतरराष्ट्रीय आणीबाणी फ्रिक्वेन्सी**: **${d.mrcc_vhf}**\n• 👮 **सागरी पोलीस**: **1093**\n\n**अनिवार्य सुरक्षा तपासणी सूची**:\n  ✅ सर्व खलाशांसाठी लाईफ जॅकेट\n  ✅ VHF मरीन रेडिओ चॅनेल १६\n  ✅ NavIC / GPS यंत्र व लाल फ्लेअर्स`;
      } else if (intent === "wave") {
        body = `🌊 **सागरी लाटा व प्रवाहाचे स्वरूप (${regNameMr})**:\n\n• **लाटांची उंची**: **${wave_val} मीटर**\n• **उसळीचा कालावधी**: **${d.swell_period} सेकंद** (${d.swell_dir} कडून)\n• **प्रवाहाचा वेग**: **${d.current_spd} नॉट्स** (${d.current_dir})\n• **समुद्राची स्थिती**: **${d.sea_state_mr || d.sea_state}** (तापमान: ${sst_val}°C)`;
      } else if (intent === "weather") {
        body = `🌤️ **हवामान व वातावरणीय नोंदी (${regNameMr})**:\n\n• **वाऱ्याचा वेग**: **${wind_val} नॉट्स** (${d.wind_dir}) | झोत: **${d.wind_gusts} नॉट्स**\n• **हवेचा दाब**: **${d.barometer} hPa** (स्थिर)\n• **हवामान स्थिती**: ${condMr} (दृश्यमानता: ${d.visibility_nm} मैल)`;
      } else if (intent === "storm") {
        if (has_storm_warning) {
          body = `⚠️ **वादळ व चक्रीवादळ इशारा**: ${regNameMr} भागात वादळी हवामानाचा इशारा जारी आहे!\n\n• वाऱ्याचा वेग: **${wind_val} नॉट्स** (झोत: **${d.wind_gusts} नॉट्स**) | लाटा: **${wave_val} मीटर**\n🛡️ **सूचना**: मच्छीमारांनी समुद्रात जाणे पूर्णपणे टाळावे.`;
        } else {
          body = `✅ **वादळाचा कोणताही इशारा नाही**: सध्या ${regNameMr} परिसरात वादळाचा कोणताही इशारा नाही.\n\n• हवामान: ${condMr} | वारे: ${wind_val} नॉट्स | लाटा: ${wave_val} मीटर`;
        }
      } else if (intent === "tide") {
        body = `⏳ **भरती-ओहोटी वेळापत्रक व शांत पाण्याची वेळ (${regNameMr})**:\n\n• 🔺 **पहिली भरती**: ${d.tide_ht} | 🔻 **पहिली ओहोटी**: ${d.tide_lt}\n• 🔺 **दुसरी भरती**: ${d.tide_ht2} | 🔻 **दुसरी ओहोटी**: ${d.tide_lt2}\n• **शांत पाण्याचा कालावधी**: ${d.slack_window_mr || d.slack_window}`;
      } else if (intent === "safety") {
        const verdict = safety_level === "SAFE" ? "होय, आज समुद्रात जाणे पूर्णपणे सुरक्षित आहे." : "आज समुद्रात जाताना सावधगिरी बाळगावी.";
        body = `🛡️ **सुरक्षा निष्कर्ष**: ${verdict}\n\n• **सुरक्षा पातळी**: **${dangerMr}** (जोखिम: ${final_danger_score}/100)\n• **लाटांची उंची**: ${wave_val} मीटर | **वाऱ्याचा वेग**: ${wind_val} नॉट्स\n• **हवामान**: ${condMr} | **सीमेपासून अंतर**: ${d.imbl} किमी`;
      } else {
        body = `🛰️ **मासेमारी व सागरी माहिती अहवाल (${regNameMr})**:\n\n• **क्लोरोफिल**: ${chloro_val} mg/m³, तापमान: ${sst_val}°C\n• **स्थानिक मासे**: ${(d.species_primary_mr || d.species_primary || []).join(", ")}\n• **सुरक्षा पातळी**: **${dangerMr}** (जोखिम: ${final_danger_score}/100)`;
      }

      finalAnswer = `${intro}\n\n${body}`;
    }

    return {
      final_answer: finalAnswer,
      reasoning_trace: simulatedTrace,
      danger_score: final_danger_score,
      confidence_score: confidence_score,
      agent_agreement: {
        status: agreementStatus,
        badge_text: agreementBadge,
        explanation: agreementExplanation
      },
      region: targetKey
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || query;
    if (!messageText.trim()) return;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }

    setMessages(prev => [...prev, {
      sender: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    if (!textToSend) setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText })
      });
      
      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      setMessages(prev => [...prev, {
        sender: "innowave",
        text: data.final_answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setReasoningTrace(data.reasoning_trace || []);
      setDangerScore(data.metrics?.danger_score ?? null);
      setConfidenceScore(data.confidence_score ?? null);
      setAgentAgreement(data.agent_agreement ?? null);

      if (data.region) {
        localStorage.setItem("innowave-active-location", data.region);
      }

    } catch (err) {
      console.warn("Backend offline. Running client fallback agent network.", err);
      const simulatedResult = runLocalAgentSimulation(messageText);

      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: "innowave",
          text: simulatedResult.final_answer + " (Client Fallback Active)",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setReasoningTrace(simulatedResult.reasoning_trace);
        setDangerScore(simulatedResult.danger_score);
        setConfidenceScore(simulatedResult.confidence_score);
        setAgentAgreement(simulatedResult.agent_agreement);

        if (simulatedResult.region) {
          localStorage.setItem("innowave-active-location", simulatedResult.region);
        }
      }, 1500);

    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  const getAgentIcon = (agentName: string) => {
    switch (agentName.toLowerCase()) {
      case "planner agent": return <BrainCircuit className="text-purple-600 h-5 w-5" />;
      case "weather agent": return <Wind className="text-blue-600 h-5 w-5" />;
      case "ocean agent": return <Waves className="text-cyan-600 h-5 w-5" />;
      case "satellite agent": return <Satellite className="text-teal-600 h-5 w-5" />;
      case "tide agent": return <Activity className="text-sky-600 h-5 w-5" />;
      case "gis agent": return <MapPin className="text-amber-600 h-5 w-5" />;
      case "ecology & gear agent": return <Waves className="text-emerald-600 h-5 w-5" />;
      case "economic agent": return <Activity className="text-amber-600 h-5 w-5" />;
      case "safety & rescue agent": return <ShieldAlert className="text-rose-600 h-5 w-5" />;
      case "community agent": return <Users className="text-indigo-600 h-5 w-5 animate-pulse" />;
      case "risk agent": return <ShieldAlert className="text-rose-600 h-5 w-5 animate-pulse" />;
      default: return <BrainCircuit className="text-blue-900 h-5 w-5" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score < 70) return "bg-yellow-50 text-yellow-750 border-yellow-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-slate-800">
      
      {/* Intro Header */}
      <div className="bg-white border border-stone-200 p-4 rounded-xl flex items-center gap-3 shadow-sm">
        <BrainCircuit className="text-blue-900 h-8 w-8 flex-shrink-0" />
        <div>
          <h2 className="font-bold text-blue-955">AI Copilot & Multi-Agent Network</h2>
          <p className="text-xs text-slate-500 leading-normal">
            Converse with the agent network in Hindi, Marathi, or English. Multi-agent collaborative reasoning automatically delivers specialized data for specific fish species, net/gear types, market rates, ocean swells, tides, Coast Guard helplines, and safety.
          </p>
        </div>
      </div>

      {/* Main Grid: Chat on Left, Reasoning Trace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Chat Feed Panel - 5 cols */}
        <div className="lg:col-span-5 flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm min-h-[500px] max-h-[70vh]">
          {/* Active Settings Panel */}
          <div className="p-4 border-b border-stone-150 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-blue-900 h-5 w-5" />
              <span className="font-bold text-sm text-blue-950">Conversational Assistant</span>
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200">
              {["en", "hi", "mr"].map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLanguage(lng)}
                  className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold transition duration-150 ${language === lng ? "bg-blue-900 text-white" : "text-slate-500"}`}
                >
                  {lng}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Prompts Panel covering diverse domains */}
          <div className="p-3 bg-stone-50 border-b border-stone-150 flex flex-wrap gap-1.5 text-xs">
            {language === "hi" ? (
              <>
                <button 
                  onClick={() => handleSendMessage("सुरमई और पापलेट मछली पकड़ने की गहराई और चारा क्या है?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🐟 सुरमई व पापलेट
                </button>
                <button 
                  onClick={() => handleSendMessage("मुंबई बंदरगाह में मछलियों के आज के बाजार भाव क्या हैं?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  💰 बाजार भाव व ईंधन
                </button>
                <button 
                  onClick={() => handleSendMessage("समुद्र में लहरों की ऊंचाई और जल प्रवाह कैसा है?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🌊 लहरें व प्रवाह
                </button>
                <button 
                  onClick={() => handleSendMessage("आपातकाल में भारतीय तटरक्षक (Coast Guard) का SOS नंबर क्या है?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🚨 तटरक्षक हेल्पलाइन
                </button>
                <button 
                  onClick={() => handleSendMessage("कोच्चि में उच्च ज्वार और नौकायन का शांत समय क्या है?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  ⏳ ज्वार-भाटा समय
                </button>
                <button 
                  onClick={() => handleSendMessage("गोवा में क्या आज समुद्र में जाना सुरक्षित है?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🛡️ सुरक्षा निर्णय
                </button>
              </>
            ) : language === "mr" ? (
              <>
                <button 
                  onClick={() => handleSendMessage("पापलेट आणि सुरमई मासे पकडण्यासाठी योग्य जाळे आणि खोली कोणती?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🐟 पापलेट व सुरमई
                </button>
                <button 
                  onClick={() => handleSendMessage("मुंबई गोदीत आज माशांचे लिलाव बाजारभाव काय आहेत?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  💰 बाजारभाव व डिझेल
                </button>
                <button 
                  onClick={() => handleSendMessage("समुद्रात लाटांची उंची आणि प्रवाहाचा वेग किती आहे?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🌊 लाटा व प्रवाह
                </button>
                <button 
                  onClick={() => handleSendMessage("आपत्कालीन मदतीसाठी तटरक्षक दल (Coast Guard) नंबर काय आहे?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🚨 आपत्कालीन हेल्पलाईन
                </button>
                <button 
                  onClick={() => handleSendMessage("भरती-ओहोटीचे वेळापत्रक आणि बोट सोडण्यासाठी शांत वेळ कोणती?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  ⏳ भरती-ओहोटी वेळ
                </button>
                <button 
                  onClick={() => handleSendMessage("गोव्यात आज समुद्रात जाणे सुरक्षित आहे का?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🛡️ सुरक्षा निष्कर्ष
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleSendMessage("What depth, bait, and gear is best for Surmai and Pomfret in Mumbai?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🐟 Surmai & Pomfret
                </button>
                <button 
                  onClick={() => handleSendMessage("What are current dockside fish market auction prices and fuel savings?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  💰 Market Prices & Fuel
                </button>
                <button 
                  onClick={() => handleSendMessage("What is the wave swell period, height, and surface current in Goa?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🌊 Waves & Swells
                </button>
                <button 
                  onClick={() => handleSendMessage("What is the Indian Coast Guard emergency distress helpline and VHF frequency?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🚨 Coast Guard SOS
                </button>
                <button 
                  onClick={() => handleSendMessage("What is the full high tide schedule and harbor slack window in Kochi?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  ⏳ Tide & Slack Window
                </button>
                <button 
                  onClick={() => handleSendMessage("What is the sea venture safety threat score and weather for Veraval?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🛡️ Safety Verdict
                </button>
              </>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs md:text-sm">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div 
                  className={`p-3.5 rounded-xl leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-blue-900 text-white rounded-br-none" 
                      : "bg-stone-50 border border-stone-200 text-slate-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line text-xs font-semibold leading-relaxed">{msg.text}</p>
                </div>

                {/* Message Meta: Timestamp and Read Aloud Action */}
                <div className={`flex items-center gap-2 mt-1 px-1 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>

                  {msg.sender === "innowave" && (
                    <button
                      type="button"
                      onClick={() => toggleReadAloud(i, msg.text)}
                      className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        speakingIndex === i
                          ? "bg-red-50 text-red-700 border-red-200 shadow-2xs font-bold ring-1 ring-red-300 animate-pulse"
                          : "bg-white text-slate-600 border-stone-200 hover:text-blue-900 hover:border-blue-300 shadow-2xs"
                      }`}
                      title={speakingIndex === i ? "Stop playback" : `Read aloud in ${detectLanguage(msg.text).label}`}
                      aria-label={speakingIndex === i ? "Stop playback" : "Read aloud"}
                    >
                      {speakingIndex === i ? (
                        <>
                          <Square className="h-2.5 w-2.5 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3 text-blue-900" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-250 p-3 rounded-xl rounded-bl-none max-w-[80%]">
                <BrainCircuit className="animate-pulse text-blue-900 h-4 w-4" />
                <span className="text-[11px] text-blue-905 font-mono">Routing agent calculations...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Panel */}
          <div className="p-3 border-t border-stone-200 bg-white flex gap-2 items-center">
            <button 
              onClick={startSpeechRecognition}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                isListening 
                  ? "bg-red-600 border-red-500 text-white animate-pulse" 
                  : "bg-stone-50 border-stone-200 text-blue-900 hover:bg-stone-100"
              }`}
              title="Click to dictate speech in chosen language"
            >
              {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>

            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={isListening ? "Listening..." : "Ask about fish species, prices, swells, weather, SOS, or safety..."}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-slate-850 text-xs outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900/15 transition duration-150"
              disabled={loading}
            />

            <button 
              onClick={() => handleSendMessage()}
              disabled={loading}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold p-3 rounded-xl transition duration-150 cursor-pointer"
            >
              <Navigation className="h-4 w-4 transform rotate-90" />
            </button>
          </div>
        </div>

        {/* Reasoning Trace Panel - 7 cols */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col">
          
          <div className="flex flex-col gap-2.5 mb-4 border-b border-stone-150 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-blue-955 flex items-center gap-2 text-sm md:text-base">
                <BrainCircuit className="text-blue-900 h-5 w-5" />
                Collaborative Trace Centerpiece
              </h3>
              <div className="flex items-center gap-2">
                {confidenceScore !== null && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-md font-extrabold bg-stone-50 border border-stone-200 text-blue-900 font-mono shadow-sm">
                    🎯 {confidenceScore}% Confidence
                  </span>
                )}
                {dangerScore !== null && (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-extrabold border shadow-sm ${getRiskColor(dangerScore)}`}>
                    Danger Score: {dangerScore}/100
                  </span>
                )}
              </div>
            </div>

            {/* Agent alignment/disagreement indicator badge */}
            {agentAgreement && (
              <div className={`text-[10.5px] px-3.5 py-2 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 animate-fade-in ${
                agentAgreement.status === "disagree" 
                  ? "bg-amber-50 border-amber-250 text-amber-900" 
                  : "bg-emerald-50 border-emerald-250 text-emerald-900"
              }`}>
                <span className="font-extrabold flex items-center gap-1.5 font-sans">
                  {agentAgreement.badge_text}
                </span>
                <span className="font-medium text-slate-500 font-sans italic text-[10px] sm:text-right">
                  "{agentAgreement.explanation}"
                </span>
              </div>
            )}
          </div>

          {reasoningTrace.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-slate-400">
              <Activity className="h-12 w-12 text-blue-900/15 mb-3 animate-pulse" />
              <p className="text-xs font-mono max-w-[280px]">No telemetry streaming. Ask a marine, species, gear, economic, or safety question to trigger the Planner Agent trace graph.</p>
            </div>
          ) : (
            <div className="space-y-3.5 overflow-y-auto pr-1">
              {reasoningTrace.map((step, idx) => (
                <div key={idx} className="relative pl-6 border-l border-stone-200 pb-0.5 last:pb-0">
                  {/* Node Bullet */}
                  <span className="absolute -left-3 top-0.5 bg-white border border-stone-200 p-0.5 rounded-full shadow-sm">
                    {getAgentIcon(step.agent)}
                  </span>
                  
                  {/* Node Card */}
                  <div className="bg-stone-50 border border-stone-150 rounded-xl p-3.5 transition duration-150 animate-fade-in hover:border-slate-300">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-blue-900 font-mono">{step.agent}</span>
                      <span className="text-[9px] text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded uppercase font-semibold">
                        {step.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-655 leading-normal font-sans">{step.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
