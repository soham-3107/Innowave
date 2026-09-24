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
  VolumeX,
  HardDrive,
  WifiOff
} from "lucide-react";

import { REGION_SPECIES, GLOBAL_SPECIES_PROFILES } from "@/data/speciesData";
import { getCoastalRegionData } from "@/utils/indexedDb";
import { usePWA } from "@/context/PWAContext";

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
  const { isOffline, lastSyncTime } = usePWA();

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

    // 4. Granular Intent Detection (Priority Order)
    const isDangerExplanation = [
      "why the danger index", "why is the danger index", "explain why the danger", "explain the danger index",
      "why danger index is", "why the danger score", "explain the danger score", "why danger is", "danger index right now",
      "धोका निर्देशांक का", "धोक्याचा निर्देशांक का", "धोका का आहे", "धोका निर्देशांक समजावून", "खतरा इंडेक्स क्यों", "डेंजर स्कोर क्यों", "खतरा क्यों है"
    ].some(w => textLower.includes(w)) || ((textLower.includes("danger") || textLower.includes("threat") || textLower.includes("धोका") || textLower.includes("खतरा")) && (textLower.includes("why") || textLower.includes("explain") || textLower.includes("का") || textLower.includes("क्यों") || textLower.includes("समझाएं") || textLower.includes("सांगा")));

    const isSpeciesExpected = [
      "what species should i expect", "species should i expect", "what species to expect", "what fish to expect",
      "species can i expect", "what fish should i expect", "what species can i catch", "what fish can i catch", "what species are near",
      "कोणते मासे मिळतील", "कोणत्या माशांची अपेक्षा आहे", "कोणते मासे मिळण्याची अपेक्षा",
      "कौन सी मछली मिलने की उम्मीद", "कौन सी मछली मिलेगी", "कौन सी प्रजाति मिलेगी"
    ].some(w => textLower.includes(w)) || ((textLower.includes("expect") || textLower.includes("मिळेल") || textLower.includes("मिळतील") || textLower.includes("उम्मीद") || textLower.includes("अपेक्षा")) && (textLower.includes("species") || textLower.includes("fish") || textLower.includes("मासे") || textLower.includes("मछली") || textLower.includes("प्रजाति")));

    const isSmallBoat = ["small boat", "small fishing boat", "25 km/h", "25 kmph", "25 किमी", "छोटी नाव", "लहान बोट", "हवा 25", "vara 25", "25 km"].some(w => textLower.includes(w)) ||
      (textLower.includes("small") && (textLower.includes("boat") || textLower.includes("wind") || textLower.includes("offshore")));
    
    const isPfzDiscrepancy = ["different from where", "actually catching", "difference between", "why might the predicted", "discrepancy", "अंतर क्यों", "अलग क्यों", "वास्तविक मछली", "फरक का", "प्रत्यक्ष मासेमारी"].some(w => textLower.includes(w)) ||
      (textLower.includes("predicted") && textLower.includes("different"));

    const isPfzExplanation = ["why you recommended", "why recommended", "why this zone", "reason for this zone", "explain why", "यह क्षेत्र क्यों", "सिफारिश क्यों", "हे क्षेत्र का", "हे क्षेत्र का निवडले"].some(w => textLower.includes(w)) ||
      (textLower.includes("why") && (textLower.includes("recommended") || textLower.includes("fishing zone") || textLower.includes("zone")));

    const isTripAdvisory = ["should i go fishing tomorrow", "can i go fishing tomorrow", "weather, wind, wave height and sea conditions", "should i go", "go tomorrow", "कल मछली पकड़ने जाना चाहिए", "क्या कल जाना चाहिए", "उद्या मासेमारीला जावे का", "उद्या जावे का"].some(w => textLower.includes(w)) ||
      ((textLower.includes("tomorrow") || textLower.includes("कल") || textLower.includes("उद्या")) && (textLower.includes("fishing") || textLower.includes("go") || textLower.includes("जाना") || textLower.includes("जावे")));

    const isTuna = ["tuna", "टुना", "टूना", "yellowfin", "skipjack"].some(w => textLower.includes(w));
    const isPomfret = ["pomfret", "पापलेट", "हलवा", "सिल्वर पापलेट"].some(w => textLower.includes(w));
    const isSurmai = ["surmai", "सुरमई", "kingfish", "seer fish", "इसवण"].some(w => textLower.includes(w));
    const isMackerel = ["mackerel", "बांगडा", "बांगड़ा", "bangda"].some(w => textLower.includes(w));
    const isGhol = ["ghol", "घोल", "croaker", "blackspotted"].some(w => textLower.includes(w));
    const isFishSpecies = isTuna || isPomfret || isSurmai || isMackerel || isGhol || ["sardine", "prawn", "squid", "तारली", "कोळंबी", "झींगा", "माकली", "रिबनफिश", "species", "bait", "मछली", "मासा"].some(w => textLower.includes(w));

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

    let intent = "general";
    if (isDangerExplanation) intent = "danger_index_explanation";
    else if (isSpeciesExpected) intent = "species_expected";
    else if (isSmallBoat) intent = "small_boat_safety";
    else if (isPfzDiscrepancy) intent = "pfz_discrepancy";
    else if (isPfzExplanation) intent = "pfz_explanation";
    else if (isTripAdvisory) intent = "trip_advisory";
    else if (isEmergency) intent = "emergency";
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

    if (["weather", "storm", "safety", "trip_advisory", "small_boat_safety", "general"].includes(intent)) {
      simulatedTrace.push({ agent: "Weather Agent", status: "completed", message: `Atmospheric scan: Wind speed **${wind_val} knots** (${d.wind_dir}), Gusts **${d.wind_gusts} kts**, Barometer: **${d.barometer} hPa**.` });
    }
    if (["wave", "safety", "trip_advisory", "small_boat_safety", "general"].includes(intent)) {
      simulatedTrace.push({ agent: "Ocean Agent", status: "completed", message: `Hydrodynamic check: Swells **${wave_val}m** (Period: **${d.swell_period}s**). Current speed: **${d.current_spd} kts** (${d.current_dir}). Sea State: **${d.sea_state}**.` });
    }
    if (["satellite", "species_profile", "market", "pfz_discrepancy", "pfz_explanation", "general"].includes(intent)) {
      simulatedTrace.push({ agent: "Satellite Agent", status: "completed", message: `Remote Sensing: Chlorophyll-a evaluated at **${chloro_val} mg/m³**, SST at **${sst_val}°C**.` });
    }
    if (["tide", "timing", "trip_advisory", "general"].includes(intent)) {
      simulatedTrace.push({ agent: "Tide Agent", status: "completed", message: `Tidal Telemetry: High Tide: **${d.tide_ht}**, Low Tide: **${d.tide_lt}**. Slack: **${d.slack_window}**.` });
    }
    if (["gis", "safety", "emergency", "small_boat_safety", "pfz_explanation"].includes(intent)) {
      simulatedTrace.push({ agent: "GIS Agent", status: "completed", message: `Geospatial scan: Boundary line distance: **${d.imbl} km**. Sector: **${d.restricted_zone}**.` });
    }
    if (["market", "species_profile"].includes(intent)) {
      simulatedTrace.push({ agent: "Economic Agent", status: "completed", message: `Economic audit: Loaded dockside price matrices and fuel optimization vector.` });
    }
    if (["emergency", "safety", "trip_advisory", "small_boat_safety"].includes(intent)) {
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

    // Species profile selection
    let targetSpeciesKey = "tuna";
    if (isPomfret) targetSpeciesKey = "pomfret";
    else if (isSurmai) targetSpeciesKey = "surmai";
    else if (isMackerel) targetSpeciesKey = "mackerel";
    else if (isGhol) targetSpeciesKey = "ghol";
    const spProfile = GLOBAL_SPECIES_PROFILES[targetSpeciesKey] || GLOBAL_SPECIES_PROFILES.tuna;

    if (detectedLang === "en") {
      if (intent === "trip_advisory") {
        const goVerdict = safety_level === "SAFE" 
          ? "✅ **YES, CONDITIONS ARE FAVORABLE FOR FISHING TOMORROW.**"
          : safety_level === "CAUTION"
          ? "⚠️ **CAUTION: CONDITIONAL GO FOR TOMORROW — NEARSHORE ONLY.**"
          : "🚫 **NO-GO: DO NOT VENTURE OUT TOMORROW DUE TO HAZARDOUS CONDITIONS.**";

        finalAnswer = `${goVerdict}\n\nHere is your comprehensive tomorrow fishing advisory for **${d.name}**:\n\n` +
          `1. 🌤️ **Weather & Wind Conditions**:\n` +
          `  • **Wind Speed**: **${wind_val} knots** (~${Math.round(wind_val * 1.852)} km/h) from **${d.wind_dir}**\n` +
          `  • **Gusts**: Peaking up to **${d.wind_gusts} knots**\n` +
          `  • **Sky & Atmospheric Pressure**: ${d.condition}, Barometer: **${d.barometer} hPa** (Stable)\n` +
          `  • **Visibility**: **${d.visibility_nm} NM** (Good ocean horizon)\n\n` +
          `2. 🌊 **Waves & Sea State**:\n` +
          `  • **Significant Wave Height**: **${wave_val} meters**\n` +
          `  • **Swell Period**: **${d.swell_period} seconds** heading ${d.swell_dir}\n` +
          `  • **Sea State Severity**: **${d.sea_state}** (Safe for motorized/mechanized crafts)\n` +
          `  • **Surface Drift Current**: **${d.current_spd} knots** towards ${d.current_dir}\n\n` +
          `3. ⏳ **High/Low Tide & Departure Slack Window**:\n` +
          `  • 🔺 **High Tide 1**: ${d.tide_ht} | 🔻 **Low Tide 1**: ${d.tide_lt}\n` +
          `  • 🔺 **High Tide 2**: ${d.tide_ht2} | 🔻 **Low Tide 2**: ${d.tide_lt2}\n` +
          `  • 🎯 **Optimal Harbor Exit Window**: **${d.slack_window}** (Minimum harbor tidal turbulence)\n\n` +
          `4. 🛡️ **Safety Checklist Before Departure**:\n` +
          `  • Wear ISI-approved Lifejackets for all crew members\n` +
          `  • Test VHF Marine Radio on **${d.mrcc_vhf}**\n` +
          `  • Check GPS / NavIC unit and keep Indian Coast Guard Toll-Free helpline saved: **${d.emergency_helpline}**`;

      } else if (intent === "species_profile") {
        finalAnswer = `🐟 **Comprehensive Target Species Guide: ${spProfile.name}**\n\n` +
          `1. 📍 **Target Location & Offshore Distance**:\n` +
          `  • ${spProfile.location}\n\n` +
          `2. 🌊 **Optimal Water Depth**:\n` +
          `  • **${spProfile.depth}**\n\n` +
          `3. 🪱 **Recommended Bait, Lures & Tackle**:\n` +
          `  • **Bait & Lures**: ${spProfile.bait}\n` +
          `  • **Recommended Gear**: ${spProfile.gear}\n\n` +
          `4. 🌤️ **Ideal Weather, Temperature & Sea Conditions**:\n` +
          `  • **Optimal Sea Surface Temp (SST)**: **${spProfile.temp_opt}**\n` +
          `  • **Conditions**: ${spProfile.weather}\n\n` +
          `5. 💰 **Dockside Market Value & Preservation**:\n` +
          `  • **Estimated Market Price**: **${spProfile.market_price}**\n` +
          `  • **Preservation Tip**: 1:1 ice slurry ratio immediately upon landing to prevent histamines.`;

      } else if (intent === "small_boat_safety") {
        finalAnswer = `⚠️ **SAFETY ADVISORY: SMALL BOATS IN 25 KM/H WIND**\n\n` +
          `**Verdict: EXTREME CAUTION — DO NOT VENTURE OFFSHORE IN A SMALL BOAT.**\n\n` +
          `1. 💨 **Why 25 km/h Wind (~13.5 Knots) is Risky for Small Boats**:\n` +
          `  • 25 km/h winds produce **1.2 to 1.8 meter choppy, short-period waves** with frequent whitecaps.\n` +
          `  • Small FRP fiber boats and traditional canoes have low freeboard (< 0.6m). Steep waves can easily wash over the gunwales and flood the bilge.\n` +
          `  • Outboard motors (OBMs) risk cavitation or drowning when the stern lifts in choppy sea swells.\n\n` +
          `2. ⚓ **Safe Operational Boundary for Small Crafts**:\n` +
          `  • **Stay within 3 to 5 Nautical Miles (5 - 9 km) of the coastline / sheltered bays** where waves are dampened.\n` +
          `  • **Strictly avoid deep offshore waters (> 10 NM)** where wind gusts exceed 35 km/h with no shelter.\n\n` +
          `3. 🛡️ **Mandatory Small-Boat Safety Rules**:\n` +
          `  • Every crew member MUST wear a strapped lifejacket before leaving the jetty.\n` +
          `  • Carry a manual bailer/bucket and a working bilge pump.\n` +
          `  • Travel in a buddy system (at least 2 boats together).\n` +
          `  • Return to harbor immediately if wind shifts or dark squall clouds approach.\n` +
          `  • Coast Guard Emergency: **${d.emergency_helpline}** (VHF Ch 16).`;

      } else if (intent === "pfz_discrepancy") {
        finalAnswer = `🔍 **Why Predicted Fishing Zones (PFZ) Might Differ From Actual Catch**\n\n` +
          `Satellite PFZ advisories identify high-probability zones, but real-world catch variations occur due to 5 key oceanographic factors:\n\n` +
          `1. ⏱️ **Satellite Data Time-Lag (12 to 24 Hours)**:\n` +
          `  • Satellites (MODIS, Oceansat, Sentinel) capture ocean surface images once or twice daily. Strong currents drift the plankton bloom **5 to 15 km away** before boats arrive.\n\n` +
          `2. 🌊 **Surface Plankton vs. Deep Thermocline Depth**:\n` +
          `  • Satellites only measure the **top 1 meter (ocean skin)**. Pelagic fish (like Tuna and Pomfret) often feed **20 to 60 meters deep** below the thermocline where water temperature is comfortable.\n\n` +
          `3. 🐟 **Biological Food Chain Delay (Plankton → Small Fish → Predators)**:\n` +
          `  • High chlorophyll means abundant microscopic plant plankton. It takes **2 to 4 days** for zooplankton and small fish (sardines/anchovies) to gather, and only then do larger predators (Tuna, Surmai) arrive.\n\n` +
          `4. 🚤 **Boat Engine Noise & Vessel Concentration**:\n` +
          `  • When many mechanized trawlers gather in the exact same PFZ coordinate, propeller noise and net disturbances scatter shoals into deeper waters.\n\n` +
          `5. ☁️ **Monsoon Cloud Cover & Interpolation Gaps**:\n` +
          `  • Thick cloud cover blocks optical satellite sensors, causing forecasting algorithms to interpolate data from adjacent sectors.\n\n` +
          `💡 **Pro-Tip for Fishermen**: Use PFZ as a starting boundary. Once in the zone, follow **bird feeding frenzies**, water color convergence lines, and depth sonar for the highest catch rate.`;

      } else if (intent === "pfz_explanation") {
        finalAnswer = `🧠 **Multi-Agent Explainability: Why We Recommended This Fishing Zone**\n\n` +
          `Our multi-agent marine intelligence system recommended this zone near **${d.name}** through 5 verified layers of scientific evidence:\n\n` +
          `1. 🛰️ **High Chlorophyll-a & Plankton Biomass**:\n` +
          `  • Remote sensing indicates a rich chlorophyll-a concentration of **${chloro_val} mg/m³**, indicating active marine primary productivity and micro-algae blooms that attract forage baitfish.\n\n` +
          `2. 🌡️ **Sea Surface Temperature (SST) & Thermal Front Upwelling**:\n` +
          `  • SST is measured at **${sst_val}°C**. The thermal gradient shows nutrient-rich cold water welling up from the deep seabed, creating an ideal temperature convergence boundary for pelagic schools.\n\n` +
          `3. 🗺️ **Continental Shelf Bathymetry**:\n` +
          `  • The zone lies along depth contours where submarine ridges funnel nutrient-dense currents upwards, naturally trapping shoaling pelagics.\n\n` +
          `4. 🛡️ **Weather & Maritime Boundary (IMBL) Safety Clearance**:\n` +
          `  • The zone maintains a safe distance of **${d.imbl} km** from international maritime boundaries and restricted naval channels, with calm to moderate waves (**${wave_val}m**) and safe wind speeds (**${wind_val} knots**).\n\n` +
          `5. 👥 **Community & Historical Catch Validation**:\n` +
          `  • Recent reports from regional fishing cooperatives confirm healthy catches of ${(d.species_primary || []).slice(0, 3).join(", ")}.`;

      } else if (intent === "market") {
        const pricesList = Object.entries(d.prices || {}).map(([k, v]) => `  • **${k}**: ${v}`).join("\n");
        finalAnswer = `💰 **Dockside Market Rates & Economics (${d.name})**:\n\n**Current Estimated Fish Auction Rates**:\n${pricesList}\n\n⛽ **Fuel Optimization**: ${d.fuel_tip}\n🧊 **Preservation**: 1:1 ice to fish ratio recommended.`;
      } else if (intent === "emergency") {
        finalAnswer = `🚨 **Emergency Helplines & Maritime Safety Protocol (${d.name})**:\n\n• 📞 **Indian Coast Guard 24x7 Helpline**: **${d.emergency_helpline}**\n• 📻 **International VHF Distress**: **${d.mrcc_vhf}**\n• 👮 **Coastal Police**: **1093**\n\n**Mandatory Safety Checklist**:\n  ✅ Lifejackets for all crew\n  ✅ VHF Radio tested on Channel 16\n  ✅ NavIC / GPS with active anchor alarm\n  ✅ Emergency distress flares and fresh water`;
      } else if (intent === "wave") {
        finalAnswer = `🌊 **Hydrodynamics & Sea State Analysis for ${d.name}**:\n\n• **Significant Wave Height**: **${wave_val} meters**\n• **Swell Period & Heading**: **${d.swell_period} seconds** from **${d.swell_dir}**\n• **Surface Drift Current**: **${d.current_spd} knots** heading ${d.current_dir}\n• **Sea State Severity**: **${d.sea_state}** (SST: ${sst_val}°C)`;
      } else if (intent === "weather") {
        finalAnswer = `🌤️ **Atmospheric & Weather Telemetry for ${d.name}**:\n\n• **Wind Speed**: **${wind_val} knots** from ${d.wind_dir} (Gusts: **${d.wind_gusts} kts**)\n• **Barometer**: **${d.barometer} hPa** (Steady)\n• **Air Temp & Humidity**: ${sst_val}°C | ${d.humidity}%\n• **Conditions**: ${d.condition} (Visibility: ${d.visibility_nm} NM)`;
      } else if (intent === "storm") {
        if (has_storm_warning) {
          finalAnswer = `⚠️ **STORM & CYCLONE ALERT**: Active storm advisory in effect for ${d.name}!\n\n• Wind Speed: **${wind_val} knots** with squall gusts to **${d.wind_gusts} kts**\n• Wave Swells: **${wave_val}m** (${d.sea_state})\n• Barometer: **${d.barometer} hPa** (Falling)\n🛡️ **Advisory**: Fishermen are strictly advised NOT to venture into sea.`;
        } else {
          finalAnswer = `✅ **NO STORM ALERT**: No active storm or cyclone warnings for ${d.name}.\n\n• Conditions: ${d.condition} | Winds: ${wind_val} knots | Waves: ${wave_val}m`;
        }
      } else if (intent === "tide") {
        finalAnswer = `⏳ **Tidal Schedule & Navigation Window (${d.name})**:\n\n• 🔺 **High Tide 1**: ${d.tide_ht} | 🔻 **Low Tide 1**: ${d.tide_lt}\n• 🔺 **High Tide 2**: ${d.tide_ht2} | 🔻 **Low Tide 2**: ${d.tide_lt2}\n• **Optimal Slack Navigation Window**: ${d.slack_window}`;
      } else if (intent === "satellite") {
        finalAnswer = `🛰️ **Satellite Oceanography & Thermal PFZ Analysis (${d.name})**:\n\n• **Chlorophyll-a Density**: **${chloro_val} mg/m³**\n• **Sea Surface Temperature (SST)**: **${sst_val}°C**\n• **Thermal Front**: Convergence boundary located 20-35 km offshore`;
      } else if (intent === "gear") {
        finalAnswer = `🎣 **Recommended Gear & Net Configuration for ${d.name}**:\n\n• **Primary Gear**: Pelagic Drift Nets & Gillnets\n• **Mesh Size**: 35-45mm for shoaling pelagics, 120-140mm for large pomfret/surmai\n• **Target Species**: ${(d.species_primary || []).join(", ")}`;
      } else if (intent === "gis") {
        finalAnswer = `🌐 **Maritime Boundaries & Restricted Zones (${d.name})**:\n\n• **Distance to IMBL Limit**: **${d.imbl} km**\n• **Local Restricted Sector**: **${d.restricted_zone}** (${d.restricted_dist} km away)`;
      } else if (intent === "danger_index_explanation") {
        finalAnswer = `🧠 **COMPOSITE DANGER INDEX EXPLANATION: ${final_danger_score}/100 (${safety_level} RISK)**\n\n` +
          `The current marine danger index for **${d.name}** is computed at **${final_danger_score}/100** by combining real-time atmospheric, hydrodynamic, geospatial, and community threat scores:\n\n` +
          `1. 💨 **Wind Threat Component (${wind_risk.toFixed(1)} / 35 pts)**: Based on sustained winds of **${wind_val} knots** (~${Math.round(wind_val * 1.852)} km/h) and gusts up to **${d.wind_gusts} knots**.\n` +
          `2. 🌊 **Wave & Swell Component (${wave_risk.toFixed(1)} / 35 pts)**: Derived from a significant wave height of **${wave_val} meters** and an **${d.swell_period}-second swell period** (${d.sea_state}).\n` +
          `3. 🌐 **Geospatial & Boundary Risk (${Math.min(30.0, gis_risk).toFixed(1)} / 30 pts)**: Operating **${d.imbl} km from the IMBL** and clear of the ${d.restricted_zone} boundary.\n` +
          `4. 👥 **Community Report Modifier (${community_risk_mod >= 0 ? "+" : ""}${community_risk_mod} pts)**: Adjusted based on ${activeReports.length} verified harbor logs and active weather warnings.\n\n` +
          `**Summary**: At ${final_danger_score}/100, the overall operational risk remains **${safety_level}**, allowing standard commercial fishing crafts to operate with normal maritime vigilance.`;

      } else if (intent === "species_expected") {
        const expSpeciesList = (d.species_primary || ["Indian Mackerel", "Silver Pomfret", "Surmai", "Yellowfin Tuna"]).join(", ");
        finalAnswer = `🐟 **EXPECTED FISH SPECIES NEAR ${d.name.toUpperCase()} (${time_ctx.en || "THIS WEEK"})**\n\n` +
          `Along the **${d.name}** coastline and mid-shelf waters this week, fishermen should primarily expect healthy biomass of **${expSpeciesList}**.\n\n` +
          `• **Bathymetric Depth & Habitat**: Target depths range between **20 - 55 meters** along the continental shelf contours where upwelling concentrates forage shoals.\n` +
          `• **Oceanic Indicators**: Satellite remote sensing records rich chlorophyll-a concentrations at **${chloro_val} mg/m³** and sea surface temperatures at **${sst_val}°C**, creating an active thermal convergence front located 18-35 km offshore.\n` +
          `• **Recommended Tackle & Gear**: Deploy **trolling lines with wire trace and pelagic driftnets** during early morning tidal influxes.\n` +
          `• **Commercial Value**: Dockside auction rates are averaging **₹600 - ₹850/kg for Surmai, ₹240 - ₹380/kg for Tuna, ₹140 - ₹220/kg for Mackerel** with strong local market demand.`;

      } else if (intent === "safety") {
        const verdictBanner = safety_level === "SAFE"
          ? `✅ **YES, IT IS SAFE TO GO FISHING NEAR ${d.name.toUpperCase()} TODAY.**`
          : safety_level === "CAUTION"
          ? `⚠️ **CAUTION IS ADVISED BEFORE GOING FISHING NEAR ${d.name.toUpperCase()} TODAY.**`
          : `🚫 **NO, IT IS NOT SAFE TO GO FISHING NEAR ${d.name.toUpperCase()} TODAY.**`;
        const verdictReason = safety_level === "SAFE"
          ? `Atmospheric and hydrodynamic telemetry indicate favorable sea conditions across ${d.name}. Sustained winds are moderate at **${wind_val} knots** (~${Math.round(wind_val * 1.852)} km/h) from ${d.wind_dir} with peak gusts under ${d.wind_gusts} knots, and significant wave swells are stable at **${wave_val} meters** (${d.sea_state}).`
          : safety_level === "CAUTION"
          ? `While nearshore waters within 3-5 nautical miles are manageable, choppy wave swells of **${wave_val} meters** and gusty winds reaching **${d.wind_gusts} knots** create moderate risk for smaller crafts.`
          : `Severe marine hazards are active with heavy wave swells of **${wave_val} meters** and squall wind gusts exceeding **${d.wind_gusts} knots**, making sea ventures highly dangerous.`;

        finalAnswer = `${verdictBanner}\n\n${verdictReason} The composite danger score is currently **${final_danger_score}/100 (${safety_level})**, with barometric pressure holding steady at **${d.barometer} hPa** under ${d.condition}.\n\n` +
          `Vessels are located **${d.imbl} km safely clear of the International Maritime Boundary Line (IMBL)**. Motorized crafts are cleared for standard daytime voyages, but all crews must wear ISI-approved lifejackets and keep VHF Marine Radio tuned to **${d.mrcc_vhf}** for real-time Coast Guard updates.`;
      } else {
        finalAnswer = `🛰️ **Marine Overview (${d.name})**:\n\n• **Potential Fishing Zone**: Chlorophyll at **${chloro_val} mg/m³** and SST at **${sst_val}°C**\n• **Primary Species**: ${(d.species_primary || []).join(", ")}\n• **Safety Level**: **${safety_level}** (Threat Score: ${final_danger_score}/100, Waves: ${wave_val}m, Wind: ${wind_val} kts)`;
      }

    } else if (detectedLang === "hi") {
      if (intent === "trip_advisory") {
        const goVerdictHi = safety_level === "SAFE"
          ? "✅ **हाँ, कल मछली पकड़ने जाने के लिए मौसम और समुद्र की स्थिति अनुकूल है।**"
          : safety_level === "CAUTION"
          ? "⚠️ **सावधानी: कल केवल तट के निकटवर्ती क्षेत्रों में ही जाएं, गहरे समुद्र में जाने से बचें।**"
          : "🚫 **खतरा: खराब मौसम और अशांत समुद्र के कारण कल समुद्र में बिल्कुल न जाएं।**";

        finalAnswer = `${goVerdictHi}\n\n**${regNameHi}** के लिए कल का विस्तृत समुद्री व मौसम पूर्वानुमान:\n\n` +
          `1. 🌤️ **मौसम और हवा की स्थिति**:\n` +
          `  • **हवा की गति**: **${wind_val} नॉट** (~${Math.round(wind_val * 1.852)} किमी/घंटा) दिशा ${d.wind_dir}\n` +
          `  • **झोंके**: **${d.wind_gusts} नॉट** तक\n` +
          `  • **मौसम**: ${condHi}, वायुमंडलीय दबाव: **${d.barometer} hPa** (स्थिर)\n` +
          `  • **दृश्यता**: **${d.visibility_nm} नॉटिकल मील** (स्पष्ट)\n\n` +
          `2. 🌊 **लहरें और समुद्र की स्थिति**:\n` +
          `  • **लहरों की ऊंचाई**: **${wave_val} मीटर**\n` +
          `  • **उफान अवधि**: **${d.swell_period} सेकंड**\n` +
          `  • **समुद्र स्थिति**: **${d.sea_state_hi || d.sea_state}**\n` +
          `  • **जल प्रवाह**: **${d.current_spd} नॉट** (${d.current_dir})\n\n` +
          `3. ⏳ **ज्वार-भाटा और शांत प्रस्थान समय**:\n` +
          `  • 🔺 **उच्च ज्वार 1**: ${d.tide_ht} | 🔻 **निम्न ज्वार 1**: ${d.tide_lt}\n` +
          `  • 🔺 **उच्च ज्वार 2**: ${d.tide_ht2} | 🔻 **निम्न ज्वार 2**: ${d.tide_lt2}\n` +
          `  • 🎯 **बंदरगाह से प्रस्थान का सबसे शांत समय**: **${d.slack_window_hi || d.slack_window}**\n\n` +
          `4. 🛡️ **प्रस्थान से पहले सुरक्षा जांच**:\n` +
          `  • सभी हेतु लाइफ जैकेट अनिवार्य\n` +
          `  • VHF मरीन रेडियो चैनल 16 पर जांचें\n` +
          `  • तटरक्षक आपातकालीन नंबर याद रखें: **${d.emergency_helpline}**`;

      } else if (intent === "species_profile") {
        finalAnswer = `🐟 **लक्षित मछली संपूर्ण गाइड: ${spProfile.name_hi || spProfile.name}**\n\n` +
          `1. 📍 **स्थान और तट से दूरी**:\n` +
          `  • ${spProfile.location_hi || spProfile.location}\n\n` +
          `2. 🌊 **पानी की अनुकूल गहराई**:\n` +
          `  • **${spProfile.depth_hi || spProfile.depth}**\n\n` +
          `3. 🪱 **चारा (Bait), ल्यूर और अनुशंसित गियर**:\n` +
          `  • **चारा और ल्यूर**: ${spProfile.bait_hi || spProfile.bait}\n` +
          `  • **उपयुक्त जाल/गियर**: ${spProfile.gear_hi || spProfile.gear}\n\n` +
          `4. 🌤️ **अनुकूल मौसम, तापमान और समुद्री स्थिति**:\n` +
          `  • **समुद्री तापमान (SST)**: **${spProfile.temp_opt}**\n` +
          `  • **मौसम स्थिति**: ${spProfile.weather_hi || spProfile.weather}\n\n` +
          `5. 💰 **अनुमानित बाजार भाव और बर्फ संरक्षण**:\n` +
          `  • **बाजार दर**: **${spProfile.market_price_hi || spProfile.market_price}**\n` +
          `  • **संरक्षण**: ताजगी बनाए रखने हेतु 1:1 के अनुपात में बर्फ का उपयोग करें।`;

      } else if (intent === "small_boat_safety") {
        finalAnswer = `⚠️ **सुरक्षा चेतावनी: 25 किमी/घंटा हवा में छोटी नाव का संचालन**\n\n` +
          `**निर्णय: अत्यधिक सावधानी — छोटी नाव से गहरे समुद्र में जाना सुरक्षित नहीं है।**\n\n` +
          `1. 💨 **25 किमी/घंटा हवा (~13.5 नॉट) छोटी नावों के लिए खतरनाक क्यों है?**:\n` +
          `  • 25 किमी/घंटा की हवा से **1.2 से 1.8 मीटर ऊंची तीखी और अशांत लहरें** उठती हैं।\n` +
          `  • छोटी फाइबर (FRP) नावों की ऊंचाई (फ्रीबोर्ड) कम होती है, जिससे लहरों का पानी नाव के अंदर भरकर उसे डुबो सकता है।\n` +
          `  • नाव के आउटबोर्ड मोटर (OBM) में पानी जाने या हवा में उठने से प्रोपेलर बंद होने का खतरा रहता है।\n\n` +
          `2. ⚓ **छोटी नावों के लिए सुरक्षित सीमा**:\n` +
          `  • **तट से केवल 3 से 5 नॉटिकल मील (5-9 किमी) के सुरक्षित दायरे में ही रहें।**\n` +
          `  • **10 नॉटिकल मील से अधिक गहरे समुद्र में बिल्कुल न जाएं।**\n\n` +
          `3. 🛡️ **अनिवार्य सुरक्षा नियम**:\n` +
          `  • सभी नाविकों के लिए लाइफ जैकेट पहनना अनिवार्य है।\n` +
          `  • नाव में पानी निकालने हेतु बाल्टी/पंप साथ रखें।\n` +
          `  • कम से कम दो नावें एक साथ जाएं।\n` +
          `  • तटरक्षक हेल्पलाइन: **${d.emergency_helpline}**`;

      } else if (intent === "pfz_discrepancy") {
        finalAnswer = `🔍 **सैटेलाइट PFZ पूर्वानुमान और वास्तविक मछली पकड़ में अंतर क्यों हो सकता है?**\n\n` +
          `सैटेलाइट केवल संभावित क्षेत्र दर्शाते हैं। वास्तविक अंतर के मुख्य 5 वैज्ञानिक कारण:\n\n` +
          `1. ⏱️ **डेटा का समय अंतराल (12-24 घंटे)**: सैटेलाइट चित्र लेने के बाद समुद्री धाराएं प्लवक (भोजन) को 5-15 किमी दूर बहा ले जाती हैं।\n` +
          `2. 🌊 **सतह बनाम गहराई का तापमान**: सैटेलाइट केवल सतह (1 मीटर) मापता है, जबकि टूना व सुरमई 20-60 मीटर की गहराई में तैरती हैं।\n` +
          `3. 🐟 **खाद्य श्रृंखला में समय**: प्लवक आने के 2-4 दिन बाद छोटी मछलियां और फिर शिकारी मछलियां पहुंचती हैं।\n` +
          `4. 🚤 **नावों और इंजनों का शोर**: एक स्थान पर अधिक नावें पहुंचने से मछलियां गहराई में भाग जाती हैं।\n` +
          `5. ☁️ **बादलों का अवरोध**: घने बादलों के कारण सैटेलाइट डेटा का अनुमान लगाया जाता है।\n\n` +
          `💡 **सुझाव**: PFZ क्षेत्र में पहुंचकर पानी के रंग और **समुद्री पक्षियों के झुंड** को देखकर जाल डालें।`;

      } else if (intent === "pfz_explanation") {
        finalAnswer = `🧠 **यह संभावित मत्स्य क्षेत्र (PFZ) क्यों अनुशंसित किया गया?**\n\n` +
          `**${regNameHi}** के पास यह क्षेत्र 5 ठोस वैज्ञानिक मापदंडों के आधार पर चुना गया है:\n\n` +
          `1. 🛰️ **उच्च क्लोरोफिल-a घनत्व**: यहाँ क्लोरोफिल **${chloro_val} mg/m³** है, जो मछलियों के भोजन का प्रमुख स्रोत है।\n` +
          `2. 🌡️ **समुद्री तापमान व अपवेलिंग**: तापमान **${sst_val}°C** है, जहाँ ठंडे और गर्म पानी के मिलन से पोषक तत्व ऊपर आते हैं।\n` +
          `3. 🗺️ **समुद्री तलहटी रचना**: 30-80 मीटर की ढलान पर मछलियों के झुंड प्राकृतिक रूप से एकत्र होते हैं।\n` +
          `4. 🛡️ **मौसम व सीमा सुरक्षा**: यह क्षेत्र अंतरराष्ट्रीय सीमा से **${d.imbl} किमी** दूर सुरक्षित है और लहरें **${wave_val}m** नियंत्रित हैं।\n` +
          `5. 👥 **सामुदायिक पुष्टि**: स्थानीय मछुआरों ने इस क्षेत्र में ${(d.species_primary_hi || d.species_primary || []).slice(0, 3).join(", ")} मिलने की पुष्टि की है।`;

      } else if (intent === "market") {
        const pricesList = Object.entries(d.prices || {}).map(([k, v]) => `  • **${k}**: ${v}`).join("\n");
        finalAnswer = `💰 **मत्स्य बाजार भाव व आर्थिक जानकारी (${regNameHi})**:\n\n**वर्तमान अनुमानित नीलामी दरें (प्रति किग्रा)**:\n${pricesList}\n\n⛽ **ईंधन बचत सलाह**: ${d.fuel_tip_hi}\n🧊 **बर्फ अनुपात**: ताजे माल हेतु 1:1 का अनुपात रखें।`;
      } else if (intent === "emergency") {
        finalAnswer = `🚨 **आपातकालीन हेल्पलाइन व समुद्री सुरक्षा प्रोटोकॉल (${regNameHi})**:\n\n• 📞 **भारतीय तटरक्षक बल (ICG हेल्पलाइन)**: **${d.emergency_helpline}**\n• 📻 **आपातकालीन रेडियो फ्रीक्वेंसी**: **${d.mrcc_vhf}**\n• 👮 **मरीन पुलिस**: **1093**\n\n**अनिवार्य सुरक्षा चेकलिस्ट**:\n  ✅ सभी हेतु लाइफ जैकेट\n  ✅ VHF मरीन रेडियो चैनल 16\n  ✅ NavIC / GPS रिसीवर व फ्लेयर्स`;
      } else if (intent === "wave") {
        finalAnswer = `🌊 **सागरी लहरों व जल-प्रवाह की स्थिति (${regNameHi})**:\n\n• **लहरों की ऊंचाई**: **${wave_val} मीटर**\n• **उफान अवधि**: **${d.swell_period} सेकंड** (${d.swell_dir} से)\n• **प्रवाह गति**: **${d.current_spd} समुद्री मील** (${d.current_dir})\n• **समुद्र स्थिति**: **${d.sea_state_hi || d.sea_state}** (तापमान: ${sst_val}°C)`;
      } else if (intent === "weather") {
        finalAnswer = `🌤️ **मौसम व वायुमंडलीय स्थिति (${regNameHi})**:\n\n• **हवा की गति**: **${wind_val} समुद्री मील** (${d.wind_dir}) | झोंके: **${d.wind_gusts} नॉट**\n• **वायुदाब**: **${d.barometer} hPa** (स्थिर)\n• **मौसम स्थिति**: ${condHi} (दृश्यता: ${d.visibility_nm} नॉटिकल मील)`;
      } else if (intent === "storm") {
        if (has_storm_warning) {
          finalAnswer = `⚠️ **तूफान व चक्रवात चेतावनी**: ${regNameHi} में मौसम विभाग द्वारा आंधी की चेतावनी जारी है!\n\n• हवा: **${wind_val} नॉट** (झोंके: **${d.wind_gusts} नॉट**) | लहरें: **${wave_val} मीटर**\n🛡️ **सलाह**: मछुआरे समुद्र में बिल्कुल न जाएं।`;
        } else {
          finalAnswer = `✅ **तूफान का कोई अलर्ट नहीं**: वर्तमान में ${regNameHi} में कोई तूफान चेतावनी नहीं है।\n\n• मौसम: ${condHi} | हवा: ${wind_val} नॉट | लहरें: ${wave_val} मीटर`;
        }
      } else if (intent === "tide") {
        finalAnswer = `⏳ **ज्वार-भाटा समय व नौकायन विंडो (${regNameHi})**:\n\n• 🔺 **उच्च ज्वार 1**: ${d.tide_ht} | 🔻 **निम्न ज्वार 1**: ${d.tide_lt}\n• 🔺 **उच्च ज्वार 2**: ${d.tide_ht2} | 🔻 **निम्न ज्वार 2**: ${d.tide_lt2}\n• **शांत जल प्रस्थान विंडो**: ${d.slack_window_hi || d.slack_window}`;
      } else if (intent === "danger_index_explanation") {
        finalAnswer = `🧠 **खतरा इंडेक्स (DANGER INDEX) का संपूर्ण वैज्ञानिक विश्लेषण: ${final_danger_score}/100 (${dangerHi})**\n\n` +
          `वर्तमान में **${regNameHi}** हेतु खतरा इंडेक्स **${final_danger_score}/100** आंका गया है। इसके 4 प्रमुख वैज्ञानिक घटक निम्न हैं:\n\n` +
          `१. 💨 **हवा का खतरा (${wind_risk.toFixed(1)} / 35 अंक)**: हवा की गति **${wind_val} नॉट** (~${Math.round(wind_val * 1.852)} किमी/घंटा) और झोंके **${d.wind_gusts} नॉट** के आधार पर।\n` +
          `२. 🌊 **लहरों का खतरा (${wave_risk.toFixed(1)} / 35 अंक)**: लहरों की ऊंचाई **${wave_val} मीटर** और **${d.swell_period} सेकंड** की उफान अवधि पर आधारित।\n` +
          `३. 🌐 **सीमा व प्रतिबंधित क्षेत्र (${Math.min(30.0, gis_risk).toFixed(1)} / 30 अंक)**: IMBL सीमा से **${d.imbl} किमी** दूर पूर्णतः सुरक्षित।\n` +
          `४. 👥 **सामुदायिक व मौसम अलर्ट (${community_risk_mod >= 0 ? "+" : ""}${community_risk_mod} अंक)**: स्थानीय बंदरगाह से प्राप्त सत्यापित रिपोर्टों के अनुसार।\n\n` +
          `**निष्कर्ष**: ${final_danger_score}/100 का स्कोर दर्शाता है कि वर्तमान में स्थिति **${dangerHi}** श्रेणी में है।`;

      } else if (intent === "species_expected") {
        const expSpeciesList = (d.species_primary_hi || d.species_primary || ["बांगड़ा", "सिल्वर पापलेट", "सुरमई", "टूना"]).join(", ");
        finalAnswer = `🐟 **${regNameHi} के पास मिलने वाली अपेक्षित मछलियाँ (${time_ctx.hi || "इस सप्ताह"})**\n\n` +
          `इस सप्ताह **${regNameHi}** के तटीय व मध्य-शेल्फ क्षेत्रों में मुख्य रूप से **${expSpeciesList}** का अच्छा भंडार मिलने की प्रबल संभावना है।\n\n` +
          `• **अनुकूल गहराई व क्षेत्र**: महाद्वीपीय शेल्फ पर **20 - 55 मीटर** की गहराई में मछलियों के झुंड सक्रिय हैं।\n` +
          `• **सागरीय स्थिति**: उपग्रह से प्राप्त क्लोरोफिल स्तर **${chloro_val} मि.ग्रा./घन मीटर** और समुद्री तापमान **${sst_val}°C** है, जो तट से 20-35 किमी दूर उत्तम थर्मल फ्रंट बनाता है।\n` +
          `• **अनुशंसित गियर**: सुबह की चढ़ती ज्वार के समय **ट्रोलिंग लाइन्स व पेलाजिक ड्रिफ्ट जाल** का प्रयोग करें।\n` +
          `• **बाजार भाव**: वर्तमान मंडी दरें **सुरमई: ₹600-850/किग्रा, टूना: ₹240-380/किग्रा, बांगड़ा: ₹140-220/किग्रा** चल रही हैं।`;

      } else if (intent === "safety") {
        const verdictBanner = safety_level === "SAFE"
          ? `✅ **हाँ, आज ${regNameHi} के पास समुद्र में मछली पकड़ने जाना पूरी तरह सुरक्षित है।**`
          : safety_level === "CAUTION"
          ? `⚠️ **आज ${regNameHi} के पास समुद्र में जाने के लिए सावधानी बरतने की सलाह दी जाती है।**`
          : `🚫 **नहीं, आज ${regNameHi} के पास समुद्र में जाना खतरनाक और असुरक्षित है।**`;
        const verdictReason = safety_level === "SAFE"
          ? `मौसमी और सागरीय आंकड़े अनुकूल हैं। हवा की गति **${wind_val} नॉट** (~${Math.round(wind_val * 1.852)} किमी/घंटा) दिशा ${d.wind_dir} है तथा लहरों की ऊंचाई नियंत्रित **${wave_val} मीटर** है।`
          : safety_level === "CAUTION"
          ? `तट के 3-5 नॉटिकल मील के भीतर स्थिति सामान्य है, परंतु गहरे समुद्र में **${wave_val} मीटर** की अशांत लहरें और **${d.wind_gusts} नॉट** के तेज झोंके हैं।`
          : `खराब मौसम के कारण **${wave_val} मीटर** की ऊंची तूफानी लहरें और **${d.wind_gusts} नॉट** की तेज आंधी चल रही है।`;

        finalAnswer = `${verdictBanner}\n\n${verdictReason} समग्र खतरा इंडेक्स **${final_danger_score}/100 (${dangerHi})** पर है तथा वायुदाब **${d.barometer} hPa** पर स्थिर है।\n\n` +
          `यह क्षेत्र अंतरराष्ट्रीय समुद्री सीमा (IMBL) से **${d.imbl} किमी सुरक्षित दूरी** पर है। सभी मछुआरे लाइफ जैकेट अवश्य पहनें और VHF मरीन रेडियो चैनल 16 पर चालू रखें।`;
      } else {
        finalAnswer = `🛰️ **मत्स्य व सागरीय सूचना रिपोर्ट (${regNameHi})**:\n\n• **क्लोरोफिल**: ${chloro_val} मि.ग्रा., तापमान: ${sst_val}°C\n• **प्रमुख मछलियाँ**: ${(d.species_primary_hi || d.species_primary || []).join(", ")}\n• **सुरक्षा स्थिति**: **${dangerHi}** (जोखिम: ${final_danger_score}/100)`;
      }

    } else { // Marathi
      if (intent === "trip_advisory") {
        const goVerdictMr = safety_level === "SAFE"
          ? "✅ **होय, उद्या मासेमारीसाठी हवामान आणि समुद्राची स्थिती अनुकूल आहे.**"
          : safety_level === "CAUTION"
          ? "⚠️ **सावधगिरी: उद्या केवळ किनाऱ्याजवळच्या भागातच मासेमारी करा, खोल समुद्रात जाणे टाळा.**"
          : "🚫 **धोका: खराब हवामान आणि खवळलेल्या समुद्रामुळे उद्या मासेमारीला जाणे पूर्णपणे टाळा.**";

        finalAnswer = `${goVerdictMr}\n\n**${regNameMr}** साठी उद्याचा सविस्तर सागरी व हवामान अहवाल:\n\n` +
          `1. 🌤️ **हवामान आणि वाऱ्याची स्थिती**:\n` +
          `  • **वाऱ्याचा वेग**: **${wind_val} नॉट्स** (~${Math.round(wind_val * 1.852)} किमी/तास) दिशा ${d.wind_dir}\n` +
          `  • **झोत (Gusts)**: **${d.wind_gusts} नॉट्स** पर्यंत\n` +
          `  • **हवामान**: ${condMr}, हवेचा दाब: **${d.barometer} hPa** (स्थिर)\n` +
          `  • **दृश्यमानता**: **${d.visibility_nm} नॉटिकल मैल**\n\n` +
          `2. 🌊 **लाटा आणि समुद्राची स्थिती**:\n` +
          `  • **लाटांची उंची**: **${wave_val} मीटर**\n` +
          `  • **उसळीचा कालावधी**: **${d.swell_period} सेकंद**\n` +
          `  • **समुद्राची स्थिती**: **${d.sea_state_mr || d.sea_state}**\n` +
          `  • **प्रवाहाचा वेग**: **${d.current_spd} नॉट्स** (${d.current_dir})\n\n` +
          `3. ⏳ **भरती-ओहोटी व बोट सोडण्याची शांत वेळ**:\n` +
          `  • 🔺 **पहिली भरती**: ${d.tide_ht} | 🔻 **पहिली ओहोटी**: ${d.tide_lt}\n` +
          `  • 🔺 **दुसरी भरती**: ${d.tide_ht2} | 🔻 **दुसरी ओहोटी**: ${d.tide_lt2}\n` +
          `  • 🎯 **बंदर सोडण्यासाठी सर्वात शांत वेळ**: **${d.slack_window_mr || d.slack_window}**\n\n` +
          `4. 🛡️ **प्रस्थानापूर्वी सुरक्षा तपासणी सूची**:\n` +
          `  • सर्व खलाशांसाठी लाईफ जॅकेट अनिवार्य\n` +
          `  • VHF मरीन रेडिओ चॅनेल १६ वर तपासा\n` +
          `  • तटरक्षक दल आपत्कालीन संपर्क: **${d.emergency_helpline}**`;

      } else if (intent === "species_profile") {
        finalAnswer = `🐟 **लक्षित मासा सविस्तर मार्गदर्शक: ${spProfile.name_mr || spProfile.name}**\n\n` +
          `1. 📍 **स्थान आणि किनाऱ्यापासून अंतर**:\n` +
          `  • ${spProfile.location_mr || spProfile.location}\n\n` +
          `2. 🌊 **पाण्याची योग्य खोली**:\n` +
          `  • **${spProfile.depth_mr || spProfile.depth}**\n\n` +
          `3. 🪱 **चारा (Bait), आमिष आणि योग्य जाळे**:\n` +
          `  • **चारा व कृत्रिम आमिष**: ${spProfile.bait_mr || spProfile.bait}\n` +
          `  • **योग्य जाळे/गियर**: ${spProfile.gear_mr || spProfile.gear}\n\n` +
          `4. 🌤️ **अनुकूल हवामान, तापमान आणि समुद्राची स्थिती**:\n` +
          `  • **पाण्याचे तापमान (SST)**: **${spProfile.temp_opt}**\n` +
          `  • **हवामान स्थिती**: ${spProfile.weather_mr || spProfile.weather}\n\n` +
          `5. 💰 **अंदाजे बाजारभाव आणि बर्फ साठवण**:\n` +
          `  • **बाजारभाव**: **${spProfile.market_price_mr || spProfile.market_price}**\n` +
          `  • **साठवणूक**: माशांची प्रत टिकवण्यासाठी १:१ प्रमाणात बर्फ वापरावा.`;

      } else if (intent === "small_boat_safety") {
        finalAnswer = `⚠️ **सुरक्षा इशारा: २५ किमी/तास वाऱ्यात लहान बोटींचे संचालन**\n\n` +
          `**निष्कर्ष: अत्यंत सावधगिरी बाळगा — लहान बोटीने खोल समुद्रात जाणे सुरक्षित नाही.**\n\n` +
          `1. 💨 **२५ किमी/तास वारा (~१३.५ नॉट्स) लहान बोटींसाठी का धोकादायक आहे?**:\n` +
          `  • २५ किमी/तास वेगाच्या वाऱ्यामुळे समुद्रात **१.२ ते १.८ मीटर उंच आणि उसळणाऱ्या लाटा** निर्माण होतात.\n` +
          `  • लहान फायबर (FRP) बोटींची उंची कमी असल्याने लाटांचे पाणी सहज आत शिरून बोट बुडण्याचा धोका संभवतो.\n` +
          `  • आउटबोर्ड मोटर (OBM) मध्ये पाणी शिरल्यास किंवा इंजिन हवेत उचलल्यास प्रोपेलर बंद पडू शकते.\n\n` +
          `2. ⚓ **लहान बोटींसाठी सुरक्षित मर्यादा**:\n` +
          `  • **किनाऱ्यापासून केवळ ३ ते ५ नॉटिकल मैल (५ ते ९ किमी) अंतरावरच राहा.**\n` +
          `  • **१० नॉटिकल मैलांपेक्षा जास्त खोल समुद्रात अजिबात जाऊ नका.**\n\n` +
          `3. 🛡️ **अनिवार्य सुरक्षा नियम**:\n` +
          `  • सर्वांनी लाईफ जॅकेट घालणे बंधनकारक आहे.\n` +
          `  • पाणी बाहेर काढण्यासाठी बादली किंवा पंप सोबत ठेवा.\n` +
          `  • नेहमी किमान दोन बोटी एकत्र जा.\n` +
          `  • तटरक्षक दल हेल्पलाईन: **${d.emergency_helpline}**`;

      } else if (intent === "pfz_discrepancy") {
        finalAnswer = `🔍 **उपग्रह PFZ अंदाज आणि प्रत्यक्ष मासे मिळण्यात फरक का असू शकतो?**\n\n` +
          `उपग्रह केवळ संभाव्य मासेमारी क्षेत्र दर्शवतात. प्रत्यक्षातील फरकाची ५ मुख्य शास्त्रीय कारणे:\n\n` +
          `1. ⏱️ **डेटाचा वेळेतील अंतर (१२-२४ तास)**: उपग्रहाने फोटो घेतल्यानंतर समुद्राच्या प्रवाहामुळे प्लवक ५ ते १५ किमी वाहून जातो.\n` +
          `2. 🌊 **पृष्ठभाग विरुद्ध खोल पाण्याचे तापमान**: उपग्रह केवळ वरचा थर (१ मीटर) मोजतो, तर टुना आणि सुरमई २० ते ६० मीटर खोल थरात असतात.\n` +
          `3. 🐟 **अन्न साखळीतील अंतर**: प्लवक तयार झाल्यानंतर लहान मासे आणि त्यानंतर मोठे शिकारी मासे येण्यासाठी २ ते ४ दिवस लागतात.\n` +
          `4. 🚤 **बोटींचा आवाज आणि मासे विखुरणे**: एकाच ठिकाणी अनेक यांत्रिकी बोटी आल्याने इंजिनच्या आवाजाने मासे खोलवर पळून जातात.\n` +
          `5. ☁️ **ढगाळ हवामान**: ढगांमुळे उपग्रहाला अचूक फोटो घेता न आल्याने अंदाजित डेटा वापरला जातो.\n\n` +
          `💡 **मच्छीमारांसाठी सल्ला**: PFZ पट्ट्यात पोहोचल्यावर पाण्याचा रंग आणि **समुद्रावरील पक्ष्यांचे थवे** पाहून जाळे टाकावे.`;

      } else if (intent === "pfz_explanation") {
        finalAnswer = `🧠 **हे संभाव्य मासेमारी क्षेत्र (PFZ) का निवडले गेले?**\n\n` +
          `**${regNameMr}** नजीकचे हे क्षेत्र खालील ५ वैज्ञानिक कारणांमुळे निवडले गेले आहे:\n\n` +
          `1. 🛰️ **उच्च क्लोरोफिल-a घनता**: येथे क्लोरोफिल **${chloro_val} mg/m³** आहे, जे माशांचे मुख्य खाद्य (प्लवक) दर्शवते.\n` +
          `2. 🌡️ **समुद्राचे तापमान व थर्मल फ्रंट**: तापमान **${sst_val}°C** असून, पोषक द्रव्यांचे प्रवाह पृष्ठभागावर येत आहेत.\n` +
          `3. 🗺️ **समुद्राच्या तळाची रचना**: ३०-८० मीटरच्या शेल्फ उतारावर माशांचे थवे नैसर्गिकरित्या जमा होतात.\n` +
          `4. 🛡️ **हवामान आणि सुरक्षित सीमा**: हे क्षेत्र आंतरराष्ट्रीय सीमेपासून **${d.imbl} किमी** सुरक्षित असून लाटा **${wave_val}m** नियंत्रित आहेत.\n` +
          `5. 👥 **मच्छीमार नोंदी**: स्थानिक मच्छीमारांनी या भागात ${(d.species_primary_mr || d.species_primary || []).slice(0, 3).join(", ")} मुबलक मिळण्याची नोंद केली आहे.`;

      } else if (intent === "market") {
        const pricesList = Object.entries(d.prices || {}).map(([k, v]) => `  • **${k}**: ${v}`).join("\n");
        finalAnswer = `💰 **मत्स्य बाजारभाव व आर्थिक मार्गदर्शन (${regNameMr})**:\n\n**आजचे अंदाजे लिलाव बाजारभाव (प्रति किलो)**:\n${pricesList}\n\n⛽ **डिझेल बचत सल्ला**: ${d.fuel_tip_mr}\n🧊 **बर्फ वापर**: १:१ प्रमाणात बर्फ वापरावा.`;
      } else if (intent === "emergency") {
        finalAnswer = `🚨 **आपत्कालीन मदत क्रमांक व सागरी सुरक्षा नियम (${regNameMr})**:\n\n• 📞 **तटरक्षक दल (ICG हेल्पलाईन)**: **${d.emergency_helpline}**\n• 📻 **आंतरराष्ट्रीय आणीबाणी फ्रिक्वेन्सी**: **${d.mrcc_vhf}**\n• 👮 **सागरी पोलीस**: **1093**\n\n**अनिवार्य सुरक्षा तपासणी सूची**:\n  ✅ सर्व खलाशांसाठी लाईफ जॅकेट\n  ✅ VHF मरीन रेडिओ चॅनेल १६\n  ✅ NavIC / GPS यंत्र व लाल फ्लेअर्स`;
      } else if (intent === "wave") {
        finalAnswer = `🌊 **सागरी लाटा व प्रवाहाचे स्वरूप (${regNameMr})**:\n\n• **लाटांची उंची**: **${wave_val} मीटर**\n• **उसळीचा कालावधी**: **${d.swell_period} सेकंद** (${d.swell_dir} कडून)\n• **प्रवाहाचा वेग**: **${d.current_spd} नॉट्स** (${d.current_dir})\n• **समुद्राची स्थिती**: **${d.sea_state_mr || d.sea_state}** (तापमान: ${sst_val}°C)`;
      } else if (intent === "weather") {
        finalAnswer = `🌤️ **हवामान व वातावरणीय नोंदी (${regNameMr})**:\n\n• **वाऱ्याचा वेग**: **${wind_val} नॉट्स** (${d.wind_dir}) | झोत: **${d.wind_gusts} नॉट्स**\n• **हवेचा दाब**: **${d.barometer} hPa** (स्थिर)\n• **हवामान स्थिती**: ${condMr} (दृश्यमानता: ${d.visibility_nm} मैल)`;
      } else if (intent === "storm") {
        if (has_storm_warning) {
          finalAnswer = `⚠️ **वादळ व चक्रीवादळ इशारा**: ${regNameMr} भागात वादळी हवामानाचा इशारा जारी आहे!\n\n• वाऱ्याचा वेग: **${wind_val} नॉट्स** (झोत: **${d.wind_gusts} नॉट्स**) | लाटा: **${wave_val} मीटर**\n🛡️ **सूचना**: मच्छीमारांनी समुद्रात जाणे पूर्णपणे टाळावे.`;
        } else {
          finalAnswer = `✅ **वादळाचा कोणताही इशारा नाही**: सध्या ${regNameMr} परिसरात वादळाचा कोणताही इशारा नाही.\n\n• हवामान: ${condMr} | वारे: ${wind_val} नॉट्स | लाटा: ${wave_val} मीटर`;
        }
      } else if (intent === "tide") {
        finalAnswer = `⏳ **भरती-ओहोटी वेळापत्रक व शांत पाण्याची वेळ (${regNameMr})**:\n\n• 🔺 **पहिली भरती**: ${d.tide_ht} | 🔻 **पहिली ओहोटी**: ${d.tide_lt}\n• 🔺 **दुसरी भरती**: ${d.tide_ht2} | 🔻 **दुसरी ओहोटी**: ${d.tide_lt2}\n• **शांत पाण्याचा कालावधी**: ${d.slack_window_mr || d.slack_window}`;
      } else if (intent === "danger_index_explanation") {
        finalAnswer = `🧠 **धोका निर्देशांक (DANGER INDEX) चे सविस्तर वैज्ञानिक स्पष्टीकरण: ${final_danger_score}/100 (${dangerMr})**\n\n` +
          `सध्या **${regNameMr}** भागातील धोका निर्देशांक **${final_danger_score}/100** निश्चित करण्यात आला आहे. याची ४ मुख्य वैज्ञानिक कारणे खालीलप्रमाणे आहेत:\n\n` +
          `१. 💨 **वाऱ्याचा धोका घटक (${wind_risk.toFixed(1)} / ३५ गुण)**: वाऱ्याचा वेग **${wind_val} नॉट्स** (~${Math.round(wind_val * 1.852)} किमी/तास) आणि झोत **${d.wind_gusts} नॉट्स** च्या आधारे.\n` +
          `२. 🌊 **लाटांचा उसळी घटक (${wave_risk.toFixed(1)} / ३५ गुण)**: लाटांची उंची **${wave_val} मीटर** आणि **${d.swell_period} सेकंद** उसळी कालावधीच्या आधारे.\n` +
          `३. 🌐 **सागरी सीमा सुरक्षा (${Math.min(30.0, gis_risk).toFixed(1)} / ३० गुण)**: आंतरराष्ट्रीय सीमेपासून **${d.imbl} किमी** सुरक्षित.\n` +
          `४. 👥 **मच्छीमार नोंदी व अलर्ट (${community_risk_mod >= 0 ? "+" : ""}${community_risk_mod} गुण)**: स्थानिक बंदरातील ताज्या नोंदींनुसार.\n\n` +
          `**निष्कर्ष**: ${final_danger_score}/100 चा निर्देशांक दर्शवतो की सध्या समुद्रातील स्थिती **${dangerMr}** वर्गात आहे.`;

      } else if (intent === "species_expected") {
        const expSpeciesList = (d.species_primary_mr || d.species_primary || ["बांगडा", "पापलेट", "सुरमई", "टुना"]).join(", ");
        finalAnswer = `🐟 **${regNameMr} जवळ मिळणारे अपेक्षित मासे (${time_ctx.mr || "या आठवड्यात"})**\n\n` +
          `या आठवड्यात **${regNameMr}** किनारपट्टी व मध्य-शेल्फ भागात प्रामुख्याने **${expSpeciesList}** मुबलक मिळण्याची शक्यता आहे.\n\n` +
          `• **योग्य खोली व अधिवास**: महाद्वीपीय शेल्फवर **२० - ५५ मीटर** खोलीच्या पट्ट्यात माशांचे मोठे थवे फिरत आहेत.\n` +
          `• **सागरी परिस्थिती**: उपग्रहाद्वारे क्लोरोफिलचे प्रमाण **${chloro_val} mg/m³** आणि समुद्राचे तापमान **${sst_val}°C** नोंदवले गेले आहे, ज्यामुळे किनाऱ्यापासून २०-३५ किमी अंतरावर उत्तम थर्मल फ्रंट तयार झाला आहे.\n` +
          `• **योग्य जाळे व पद्धत**: पहाटेच्या भरतीवेळी **ट्रोलिंग लाईन्स व मोठे ड्रिफ्ट जाळे** वापरल्यास भरपूर मासळी मिळेल.\n` +
          `• **अंदाजे बाजारभाव**: सध्या गोदीतील लिलाव भाव **सुरमई: ₹६००-८५०/किलो, टुना: ₹२४०-३८०/किलो, बांगडा: ₹१४०-२२०/किलो** चालू आहेत.`;

      } else if (intent === "safety") {
        const verdictBanner = safety_level === "SAFE"
          ? `✅ **होय, आज ${regNameMr} जवळ समुद्रात मासेमारीला जाणे पूर्णपणे सुरक्षित आहे.**`
          : safety_level === "CAUTION"
          ? `⚠️ **आज ${regNameMr} जवळ समुद्रात जाताना विशेष सावधगिरी बाळगावी.**`
          : `🚫 **नाही, आज ${regNameMr} जवळ समुद्रात जाणे अत्यंत धोकादायक आणि असुरक्षित आहे.**`;
        const verdictReason = safety_level === "SAFE"
          ? `हवामान आणि सागरी स्थिती पूर्णपणे अनुकूल आहे. वाऱ्याचा वेग **${wind_val} नॉट्स** (~${Math.round(wind_val * 1.852)} किमी/तास) दिशा ${d.wind_dir} असून लाटांची उंची केवळ **${wave_val} मीटर** (${d.sea_state_mr || d.sea_state}) आहे.`
          : safety_level === "CAUTION"
          ? `किनाऱ्याजवळ ३-५ सागरी मैलांपर्यंत स्थिती नियंत्रणात आहे, मात्र खुल्या समुद्रात **${wave_val} मीटर** उसळणाऱ्या लाटा आणि **${d.wind_gusts} नॉट्स** वाऱ्याचे झोत आहेत.`
          : `खराब हवामानामुळे समुद्रात **${wave_val} मीटर** उंच लाटा आणि **${d.wind_gusts} नॉट्स** वेगाचे वादळी वारे वाहत आहेत.`;

        finalAnswer = `${verdictBanner}\n\n${verdictReason} एकूण धोका निर्देशांक **${final_danger_score}/100 (${dangerMr})** असून हवेचा दाब **${d.barometer} hPa** वर स्थिर आहे.\n\n` +
          `हे क्षेत्र आंतरराष्ट्रीय सागरी सीमेपासून (IMBL) **${d.imbl} किमी सुरक्षित अंतरावर** आहे. सर्व खलाशांनी लाईफ जॅकेट घालावे आणि VHF मरीन रेडिओ चॅनेल १६ वर सुरू ठेवावा.`;
      } else {
        finalAnswer = `🛰️ **मासेमारी व सागरी माहिती अहवाल (${regNameMr})**:\n\n• **क्लोरोफिल**: ${chloro_val} mg/m³, तापमान: ${sst_val}°C\n• **स्थानिक मासे**: ${(d.species_primary_mr || d.species_primary || []).join(", ")}\n• **सुरक्षा पातळी**: **${dangerMr}** (जोखिम: ${final_danger_score}/100)`;
      }
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
      let res: Response | null = null;
      let data: any = null;

      // 1. Try relative Next.js API route /api/chat (always on same origin)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        res = await fetch(`/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res && res.ok) {
          data = await res.json();
        }
      } catch (e) {
        console.warn("Relative /api/chat endpoint attempt:", e);
      }

      // 2. If relative route did not produce data, try external API_BASE_URL (if different)
      if (!data && API_BASE_URL) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);
          res = await fetch(`${API_BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: messageText }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (res && res.ok) {
            data = await res.json();
          }
        } catch (e) {
          console.warn("External API_BASE_URL /api/chat attempt:", e);
        }
      }

      if (!data || (!data.final_answer && !data.text)) {
        throw new Error("No network API response, switching to local multi-agent intelligence");
      }

      setMessages(prev => [...prev, {
        sender: "innowave",
        text: data.final_answer || data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setReasoningTrace(data.reasoning_trace || []);
      setDangerScore(data.metrics?.danger_score ?? data.danger_score ?? null);
      setConfidenceScore(data.confidence_score ?? null);
      setAgentAgreement(data.agent_agreement ?? null);

      if (data.region) {
        localStorage.setItem("innowave-active-location", data.region);
      }

    } catch (err) {
      console.warn("Engaging local/offline multi-agent intelligence engine:", err);

      const localResult = runLocalAgentSimulation(messageText);

      setMessages(prev => [...prev, {
        sender: "innowave",
        text: localResult.final_answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setReasoningTrace(localResult.reasoning_trace || []);
      setDangerScore(localResult.danger_score ?? null);
      setConfidenceScore(localResult.confidence_score ?? null);
      setAgentAgreement(localResult.agent_agreement ?? null);

      if (localResult.region) {
        localStorage.setItem("innowave-active-location", localResult.region);
      }

    } finally {
      setLoading(false);
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
      <div className="bg-white border border-stone-200 p-4 rounded-xl flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-blue-900 h-8 w-8 flex-shrink-0" />
          <div>
            <h2 className="font-bold text-blue-955 flex flex-wrap items-center gap-2">
              AI Copilot & Multi-Agent Network
              {isOffline && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  Offline Cached Intelligence Active
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 leading-normal">
              {isOffline
                ? `You are currently offline. Querying cached safety parameters and regional intelligence from local offline cache (Last synced: ${lastSyncTime || "earlier"}).`
                : "Converse with the agent network in Hindi, Marathi, or English. Multi-agent collaborative reasoning automatically delivers specialized data for specific fish species, net/gear types, market rates, ocean swells, tides, Coast Guard helplines, and safety."}
            </p>
          </div>
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

          {/* Quick Prompts Panel covering user operational questions */}
          <div className="p-3 bg-stone-50 border-b border-stone-150 flex flex-wrap gap-1.5 text-xs">
            {language === "hi" ? (
              <>
                <button 
                  onClick={() => handleSendMessage("आज के मौसम, हवा, लहरों की ऊंचाई और समुद्र की स्थिति के आधार पर, क्या मुझे कल मछली पकड़ने जाना चाहिए?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🌤️ कल मासेमारी सलाह
                </button>
                <button 
                  onClick={() => handleSendMessage("मैं टूना मछली पकड़ना चाहता हूँ। मुझे किस स्थान, गहराई, चारा और मौसम की स्थिति को देखना चाहिए?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🐟 टूना मछली गाइड
                </button>
                <button 
                  onClick={() => handleSendMessage("मेरे पास एक छोटी मछली पकड़ने वाली नाव है और हवा की गति 25 किमी/घंटा है। क्या गहरे समुद्र में जाना सुरक्षित है?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  ⛵ छोटी नाव व 25 किमी हवा
                </button>
                <button 
                  onClick={() => handleSendMessage("पूर्वानुमानित मछली पकड़ने का क्षेत्र (PFZ) उस जगह से अलग क्यों हो सकता है जहाँ मछुआरे वास्तव में मछलियाँ पकड़ रहे हैं?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🔍 PFZ और शिकार में अंतर?
                </button>
                <button 
                  onClick={() => handleSendMessage("क्या आप समझा सकते हैं कि आपने इस मछली पकड़ने के क्षेत्र की सिफारिश क्यों की?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🧠 यह क्षेत्र क्यों चुना?
                </button>
                <button 
                  onClick={() => handleSendMessage("आपातकाल में भारतीय तटरक्षक (Coast Guard) का SOS नंबर क्या है?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🚨 तटरक्षक हेल्पलाइन
                </button>
              </>
            ) : language === "mr" ? (
              <>
                <button 
                  onClick={() => handleSendMessage("आजचे हवामान, वारा, लाटांची उंची आणि समुद्राची स्थिती लक्षात घेता, मी उद्या मासेमारीला जावे का?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🌤️ उद्याची मासेमारी सल्ला
                </button>
                <button 
                  onClick={() => handleSendMessage("मला टुना मासा पकडायचा आहे. त्यासाठी कोणते स्थान, पाण्याची खोली, आमिष/चारा आणि हवामान योग्य ठरेल?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🐟 टुना मासा मार्गदर्शक
                </button>
                <button 
                  onClick={() => handleSendMessage("माझ्याकडे एक लहान मासेमारी बोट आहे आणि वाऱ्याचा वेग २५ किमी/तास आहे. खोल समुद्रात जाणे सुरक्षित आहे का?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  ⛵ लहान बोट व २५ किमी वारा
                </button>
                <button 
                  onClick={() => handleSendMessage("उपग्रहाने दर्शवलेले संभाव्य मासेमारी क्षेत्र (PFZ) आणि मच्छीमारांना प्रत्यक्षात मासे मिळण्याचे ठिकाण यात फरक का असू शकतो?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🔍 PFZ व प्रत्यक्ष मासेमारीत फरक?
                </button>
                <button 
                  onClick={() => handleSendMessage("तुम्ही हेच मासेमारी क्षेत्र का सुचवले याचे कारण सांगू शकता का?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🧠 हे क्षेत्र का निवडले?
                </button>
                <button 
                  onClick={() => handleSendMessage("आपत्कालीन मदतीसाठी तटरक्षक दल (Coast Guard) नंबर काय आहे?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🚨 आपत्कालीन हेल्पलाईन
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleSendMessage("Based on today's weather, wind, wave height and sea conditions, should I go fishing tomorrow?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🌤️ Tomorrow Trip Advisory
                </button>
                <button 
                  onClick={() => handleSendMessage("I'm targeting tuna. What location, depth, bait and weather conditions should I look for?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🐟 Tuna Guide
                </button>
                <button 
                  onClick={() => handleSendMessage("I have a small fishing boat and the wind speed is 25 km/h. Is it safe to go offshore?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  ⛵ Small Boat & 25 km/h Wind
                </button>
                <button 
                  onClick={() => handleSendMessage("Why might the predicted fishing zone be different from where fishermen are actually catching fish?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🔍 Why PFZ differs from catch?
                </button>
                <button 
                  onClick={() => handleSendMessage("Can you explain why you recommended this fishing zone?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🧠 Why recommended this zone?
                </button>
                <button 
                  onClick={() => handleSendMessage("What is the Indian Coast Guard emergency distress helpline and VHF frequency?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  🚨 Coast Guard SOS
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
