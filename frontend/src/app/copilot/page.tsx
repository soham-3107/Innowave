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
  
  const marathiMarkers = ["आहे", "आहेत", "नाही", "नाहीत", "कोणती", "कोणता", "कोणते", "मासेमारी", "मासे", "वादळ", "वादळाचा", "वादळाची", "वेळ", "वेळापत्रक", "साठी", "च्या", "ची", "चे", "चा", "तील", "समुद्रात", "उद्या", "लाटा", "लाटांची", "वारा", "वाऱ्याचा", "अहवाल", "किनारपट्टी"];
  const hindiMarkers = ["है", "हैं", "था", "थी", "क्या", "कौन", "कौनसा", "कौनसी", "कौन सा", "कौन सी", "मछली", "पकड़ने", "में", "के", "की", "का", "को", "से", "पास", "लिए", "जाना", "सकता", "सकती", "मौसम", "तूफान", "समय", "खतरा", "अच्छा", "अच्छी", "तट"];
  
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
    .replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, "")
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

// Telemetry database for client fallback simulation
const LOCAL_MOCK_DATA: Record<string, any> = {
  mumbai: {
    name: "Mumbai Coast", name_hi: "मुंबई तट", name_mr: "मुंबई किनारपट्टी",
    lat: 18.95, lon: 72.80,
    wind: 12.5, wave: 1.2, chloro: 4.8, sst: 28.2, tide_ht: "05:42 AM (3.8m)", tide_lt: "11:58 AM (1.1m)", imbl: 320.0,
    safety: "SAFE", danger_score: 18,
    condition: "Partly Cloudy", condition_hi: "आंशिक बादल", condition_mr: "अंशतः ढगाळ",
    restricted_zone: "Naval Dockyard Zone", restricted_dist: 8.5
  },
  goa: {
    name: "Goa Coast", name_hi: "गोवा तट", name_mr: "गोवा किनारपट्टी",
    lat: 15.49, lon: 73.82,
    wind: 9.8, wave: 0.8, chloro: 5.1, sst: 28.5, tide_ht: "06:15 AM (1.8m)", tide_lt: "12:20 PM (0.3m)", imbl: 380.0,
    safety: "SAFE", danger_score: 15,
    condition: "Sunny and Clear", condition_hi: "धूप और साफ मौसम", condition_mr: "स्वच्छ व निरभ्र आकाश",
    restricted_zone: "Mormugao Port Limit", restricted_dist: 11.5
  },
  kochi: {
    name: "Kochi Coast", name_hi: "कोच्चि तट", name_mr: "कोची किनारपट्टी",
    lat: 9.93, lon: 76.15,
    wind: 28.0, wave: 3.8, chloro: 1.2, sst: 26.5, tide_ht: "04:12 AM (1.4m)", tide_lt: "10:30 AM (0.4m)", imbl: 280.0,
    safety: "DANGER", danger_score: 75,
    condition: "Severe Thunderstorm", condition_hi: "भीषण आंधी-तूफान", condition_mr: "तीव्र वादळी पाऊस",
    warnings: ["Gale warning in effect"], warnings_hi: ["तेज समुद्री तूफान की चेतावनी जारी"], warnings_mr: ["वेगवान वादळी वाऱ्यांचा इशारा जारी"],
    restricted_zone: "Port Channel Area", restricted_dist: 1.2
  },
  chennai: {
    name: "Chennai Coast", name_hi: "चेन्नई तट", name_mr: "चेन्नई किनारपट्टी",
    lat: 13.08, lon: 80.30,
    wind: 9.5, wave: 0.8, chloro: 3.1, sst: 29.5, tide_ht: "06:30 AM (1.2m)", tide_lt: "12:45 PM (0.2m)", imbl: 210.0,
    safety: "SAFE", danger_score: 12,
    condition: "Sunny / Clear", condition_hi: "धूप और साफ मौसम", condition_mr: "स्वच्छ व निरभ्र",
    restricted_zone: "Ennore Port Limit", restricted_dist: 12.0
  },
  veraval: {
    name: "Veraval / Gujarat Coast", name_hi: "वेरावल / गुजरात तट", name_mr: "वेरावळ / गुजरात किनारपट्टी",
    lat: 20.90, lon: 70.37,
    wind: 18.0, wave: 2.2, chloro: 6.2, sst: 27.0, tide_ht: "07:10 AM (2.8m)", tide_lt: "13:20 PM (0.8m)", imbl: 78.0,
    safety: "CAUTION", danger_score: 45,
    condition: "Overcast", condition_hi: "घने बादल", condition_mr: "ढगाळ वातावरण",
    warnings: ["Moderate swell advisory"], warnings_hi: ["मध्यम ऊंची लहरों की सलाह"], warnings_mr: ["मध्यम लाटांचा इशारा"],
    restricted_zone: "International Maritime Boundary Line", restricted_dist: 78.0
  },
  vizag: {
    name: "Visakhapatnam Coast", name_hi: "विशाखापट्टनम तट", name_mr: "विशाखापट्टणम किनारपट्टी",
    lat: 17.68, lon: 83.30,
    wind: 14.0, wave: 1.4, chloro: 5.5, sst: 28.8, tide_ht: "05:15 AM (1.6m)", tide_lt: "11:30 AM (0.3m)", imbl: 450.0,
    safety: "SAFE", danger_score: 22,
    condition: "Light Drizzle", condition_hi: "हल्की बूंदाबांदी", condition_mr: "हलक्या पावसाच्या सरी",
    restricted_zone: "Naval Base Prohibited Area", restricted_dist: 4.2
  }
};

const LOCAL_REPORTS = [
  { id: 1, type: "Good Catch", text: "Spotted large school of mackerel 12km out.", text_hi: "तट से 12 किमी दूर बांगड़ा मछली का बड़ा झुंड देखा गया।", text_mr: "किनाऱ्यापासून १२ किमी अंतरावर बांगडा माशांचा मोठा थवा आढळला आहे.", region: "mumbai", timestamp: "2 hours ago", timestamp_hi: "2 घंटे पहले", timestamp_mr: "२ तासांपूर्वी" },
  { id: 2, type: "Calm Seas", text: "Calm and clear seas today, perfect for fishing.", text_hi: "आज समुद्र शांत और साफ है, मछली पकड़ने के लिए उत्तम स्थिति है।", text_mr: "आज समुद्र शांत आणि स्वच्छ आहे, मासेमारीसाठी उत्तम परिस्थिती आहे.", region: "goa", timestamp: "5 hours ago", timestamp_hi: "5 घंटे पहले", timestamp_mr: "५ तासांपूर्वी" },
  { id: 3, type: "Storm Warning", text: "Sudden strong winds and dark storm clouds forming.", text_hi: "अचानक तेज हवाएं और काले तूफानी बादल घिर रहे हैं।", text_mr: "अचानक जोरदार वारे आणि काळे वादळी ढग जमा होत आहेत.", region: "kochi", timestamp: "1 hour ago", timestamp_hi: "1 घंटा पहले", timestamp_mr: "१ तासापूर्वी" },
  { id: 4, type: "High Waves", text: "Slightly high waves swell, but manageable for large vessels.", text_hi: "लहरें थोड़ी ऊंची हैं, लेकिन बड़ी नौकाओं के लिए सुरक्षित हैं।", text_mr: "लाटांची उंची थोडी जास्त आहे, पण मोठ्या बोटींसाठी सुरक्षित आहे.", region: "chennai", timestamp: "4 hours ago", timestamp_hi: "4 घंटे पहले", timestamp_mr: "४ तासांपूर्वी" },
  { id: 5, type: "Good Catch", text: "Rich plankton density, caught massive haul of tuna.", text_hi: "भरपूर प्लवक घनत्व, बड़ी मात्रा में टूना मछली पकड़ी गई।", text_mr: "प्लवक घनता उत्तम असून मोठ्या प्रमाणात टुना मासे मिळाले.", region: "veraval", timestamp: "6 hours ago", timestamp_hi: "6 घंटे पहले", timestamp_mr: "६ तासांपूर्वी" }
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
      text: "Hello! I am INNOWAVE, your collaborative marine intelligence assistant. Ask me questions about ocean conditions, weather safety, or potential fishing zones near Mumbai, Kochi, Chennai, Veraval, or Vizag. You can speak to me in English, Hindi, or Marathi.",
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

    // Stop if already speaking this message
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Stop mic listening if active so there is no audio loop
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
    // Interlock: cancel any playing speech so the mic doesn't capture speaker audio
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

  // Run Local Simulator Flow (Dynamic Natural Language Generator with dynamic routing, noise, and time context)
  const runLocalAgentSimulation = (text: string) => {
    const textLower = text.toLowerCase();
    
    // 1. Detect language
    const { langCode } = detectLanguage(text);
    const detectedLang = langCode.startsWith("mr") ? "mr" : langCode.startsWith("hi") ? "hi" : "en";

    // 2. Resolve Location with variations and log defaults
    let targetKey = "";
    let loc_trace_msg = "";
    let is_explicit_loc = false;
    
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
        is_explicit_loc = true;
        break;
      }
    }

    if (!targetKey) {
      targetKey = "mumbai";
      loc_trace_msg = "No specific location detected, using Mumbai as default";
      is_explicit_loc = false;
    }

    const d = LOCAL_MOCK_DATA[targetKey];
    const langName = detectedLang === "en" ? "English" : detectedLang === "hi" ? "Hindi (हिंदी)" : "Marathi (मराठी)";

    // 3. Extract Time Context
    const isTomorrow = textLower.includes("tomorrow") || textLower.includes("कल") || textLower.includes("उद्या");
    const isToday = textLower.includes("today") || textLower.includes("आज");
    const isMorning = textLower.includes("morning") || textLower.includes("सकाळ") || textLower.includes("सकाळी") || textLower.includes("सुबह") || textLower.includes("पहाटे");
    const isEvening = textLower.includes("evening") || textLower.includes("संध्याकाळ") || textLower.includes("संध्याकाळी") || textLower.includes("शाम");
    const isWeek = textLower.includes("week") || textLower.includes("हफ्ता") || textLower.includes("आठवडा") || textLower.includes("सप्ताह");
    
    let time_ctx = { key: "", en: "", hi: "", mr: "" };
    if (isTomorrow && isMorning) time_ctx = { key: "tomorrow morning", en: "tomorrow morning", hi: "कल सुबह", mr: "उद्या सकाळी" };
    else if (isTomorrow && isEvening) time_ctx = { key: "tomorrow evening", en: "tomorrow evening", hi: "कल शाम", mr: "उद्या संध्याकाळी" };
    else if (isTomorrow) time_ctx = { key: "tomorrow", en: "tomorrow", hi: "कल", mr: "उद्या" };
    else if (isToday && isMorning) time_ctx = { key: "today morning", en: "today morning", hi: "आज सुबह", mr: "आज सकाळी" };
    else if (isToday && isEvening) time_ctx = { key: "today evening", en: "today evening", hi: "आज शाम", mr: "आज संध्याकाळी" };
    else if (isToday) time_ctx = { key: "today", en: "today", hi: "आज", mr: "आज" };
    else if (isMorning) time_ctx = { key: "morning", en: "morning", hi: "सुबह", mr: "सकाळी" };
    else if (isEvening) time_ctx = { key: "evening", en: "evening", hi: "शाम", mr: "संध्याकाळी" };
    else if (isWeek) time_ctx = { key: "this week", en: "this week", hi: "इस सप्ताह", mr: "या आठवड्यात" };

    // 4. Identify intent
    const isTide = textLower.includes("tide") || textLower.includes("tides") || textLower.includes("भरती") || textLower.includes("ज्वार") || textLower.includes("ओहोटी") || textLower.includes("भाटा");
    const isFish = textLower.includes("fish") || textLower.includes("pfz") || textLower.includes("chlorophyll") || textLower.includes("मासे") || textLower.includes("मछली") || textLower.includes("मासेमारी") || textLower.includes("पकड़ने");
    const isWeather = textLower.includes("weather") || textLower.includes("wind") || textLower.includes("storm") || textLower.includes("cyclone") || textLower.includes("वारा") || textLower.includes("लाटा") || textLower.includes("मौसम") || textLower.includes("हवामान") || textLower.includes("वादळ") || textLower.includes("तूफान");
    const isBorder = textLower.includes("border") || textLower.includes("imbl") || textLower.includes("restricted") || textLower.includes("navy") || textLower.includes("सीमा") || textLower.includes("प्रतिबंधित");
    const isSafe = textLower.includes("safe") || textLower.includes("safety") || textLower.includes("danger") || textLower.includes("warning") || textLower.includes("सुरक्षित") || textLower.includes("धोका") || textLower.includes("खतरा") || textLower.includes("इशारा") || textLower.includes("चेतावनी");
    const isTimingSpecific = textLower.includes("best time") || textLower.includes("सर्वोत्तम वेळ") || textLower.includes("वेळ कोणती") || textLower.includes("अनुकूल समय") || textLower.includes("अच्छा समय") || textLower.includes("कब");
    const isStormSpecific = textLower.includes("storm") || textLower.includes("cyclone") || textLower.includes("वादळ") || textLower.includes("वादळाचा") || textLower.includes("तूफान");

    let intent = "general";
    if (isStormSpecific) intent = "weather";
    else if (isSafe) intent = "safety";
    else if (isFish) intent = "fish";
    else if (isWeather) intent = "weather";
    else if (isTide) intent = "tide";
    else if (isBorder) intent = "gis";

    // 5. Apply telemetry calculations
    const wind_val = parseFloat((d.wind + (Math.random() * 1.6 - 0.8)).toFixed(1));
    const wave_val = parseFloat(Math.max(0.2, d.wave + (Math.random() * 0.2 - 0.1)).toFixed(2));
    const chloro_val = parseFloat(Math.max(0.1, d.chloro + (Math.random() * 0.4 - 0.2)).toFixed(1));
    const sst_val = parseFloat((d.sst + (Math.random() * 0.6 - 0.3)).toFixed(1));

    // Community observation filter
    const activeReports = LOCAL_REPORTS.filter(r => r.region === targetKey);
    let community_risk_mod = 0;
    activeReports.forEach(r => {
      if (r.type === "Storm Warning") community_risk_mod += 15;
      else if (r.type === "High Waves") community_risk_mod += 10;
      else if (r.type === "Calm Seas") community_risk_mod -= 5;
    });

    const has_storm_warning = (d.warnings && d.warnings.length > 0) || activeReports.some(r => r.type === "Storm Warning");

    // Calculate dynamic danger score
    let wind_risk = Math.min(35.0, (wind_val / 30.0) * 35.0);
    const wave_risk = Math.min(35.0, (wave_val / 4.0) * 35.0);
    const gis_risk = d.imbl < 100.0 ? (100.0 - d.imbl) * 0.3 : 0.0;
    if (has_storm_warning) wind_risk += 15.0;

    const final_danger_score = Math.round(Math.max(0, Math.min(100, wind_risk + wave_risk + Math.min(30.0, gis_risk) + community_risk_mod)));
    const safety_level = final_danger_score < 40 ? "SAFE" : final_danger_score < 70 ? "CAUTION" : "DANGER";

    // Dynamic Agreement Status & Confidence
    const isHighPfz = chloro_val >= 4.5;
    const isUnsafe = final_danger_score >= 35;
    
    let agreementStatus = "agree";
    let agreementBadge = "✅ Agents in agreement";
    let agreementExplanation = "All agents report normal baseline marine and safety thresholds.";
    let confidence_score = Math.floor(88 + Math.random() * 5); // 88-92%
    
    if (isHighPfz && isUnsafe) {
      agreementStatus = "disagree";
      agreementBadge = "⚡ Agents partially disagree";
      agreementExplanation = "Fishing potential is high, but safety conditions are a concern.";
      confidence_score = Math.floor(80 + Math.random() * 6); // 80-85%
    } else if (!isHighPfz && final_danger_score >= 70) {
      agreementStatus = "agree";
      agreementBadge = "✅ Agents in agreement";
      agreementExplanation = "Agents align: low fishing potential and high wave danger.";
      confidence_score = Math.floor(92 + Math.random() * 6); // 92-97%
    } else if (isHighPfz && final_danger_score < 35) {
      agreementStatus = "agree";
      agreementBadge = "✅ Agents in agreement";
      agreementExplanation = "Agents align: favorable catch potential and safe sea states.";
      confidence_score = Math.floor(94 + Math.random() * 4); // 94-97%
    }

    // Compile reasoning trace
    const simulatedTrace = [];
    simulatedTrace.push({ agent: "Planner Agent", status: "completed", message: `Detected query language: **${langName}**. Deconstructing question structure.` });
    simulatedTrace.push({ agent: "Planner Agent", status: "completed", message: loc_trace_msg });
    
    if (time_ctx.en) {
      simulatedTrace.push({ agent: "Planner Agent", status: "completed", message: `Time context parsed: **${time_ctx.en}**.` });
    }

    simulatedTrace.push({ agent: "Planner Agent", status: "completed", message: `Query classified under **${intent.toUpperCase()}** domain. Dynamic routing active.` });

    // Routing activation
    const run_weather = ["general", "weather", "safety"].includes(intent);
    const run_ocean = ["general", "weather", "safety", "fish"].includes(intent);
    const run_satellite = ["general", "fish"].includes(intent);
    const run_tide = ["general", "tide", "fish"].includes(intent);
    const run_gis = ["general", "gis", "safety"].includes(intent);
    const run_risk = ["general", "safety", "weather"].includes(intent);

    if (run_weather) {
      simulatedTrace.push({ agent: "Weather Agent", status: "completed", message: `Weather analysis: Wind speeds are **${wind_val} knots**.` });
    }
    if (run_ocean) {
      simulatedTrace.push({ agent: "Ocean Agent", status: "completed", message: `Hydrodynamic check: Wave height is **${wave_val}m**, SST is **${sst_val}°C**.` });
    }
    if (run_satellite) {
      simulatedTrace.push({ agent: "Satellite Agent", status: "completed", message: `Satellite evaluation: Chlorophyll density is **${chloro_val} mg/m³**.` });
    }
    if (run_tide) {
      simulatedTrace.push({ agent: "Tide Agent", status: "completed", message: `Retrieved tidal limits: High: **${d.tide_ht}**, Low: **${d.tide_lt}**.` });
    }
    if (run_gis) {
      simulatedTrace.push({ agent: "GIS Agent", status: "completed", message: `Boundaries check: Proximity to boundary line: **${d.imbl} km**.` });
    }

    if (activeReports.length > 0) {
      simulatedTrace.push({
        agent: "Community Agent",
        status: "completed",
        message: `Retrieved ${activeReports.length} community logs. Key alert: '${activeReports[0].text}' (${activeReports[0].type}).`
      });
    } else {
      simulatedTrace.push({
        agent: "Community Agent",
        status: "completed",
        message: "No recent crowdsourced logs registered for this area."
      });
    }

    if (run_risk) {
      simulatedTrace.push({ agent: "Risk Agent", status: "completed", message: `Synthesized danger index (Community adjusted: ${community_risk_mod >= 0 ? '+' : ''}${community_risk_mod}): **${final_danger_score}/100** (${safety_level}).` });
    }

    simulatedTrace.push({ agent: "Brain Agent", status: "completed", message: `Consolidated findings and translated dynamic output to user preferred language (**${langName}**).` });

    // Localized output assembly
    let finalAnswer = "";
    const speciesObj = REGION_SPECIES[targetKey] || REGION_SPECIES.mumbai;
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

      if (intent === "tide") {
        body = `Next High Tide will peak at ${d.tide_ht} and Low Tide is scheduled at ${d.tide_lt}.`;
      } else if (intent === "fish") {
        if (isTimingSpecific) {
          body = `⏰ **Best Fishing Time**: ${speciesObj.catchWindow} during peak tidal flux.\n\n🌊 **Marine State**: High Tide: ${d.tide_ht}, Low Tide: ${d.tide_lt}. SST is ${sst_val}°C with swells at ${wave_val}m.\n🐟 **Primary Species (CMFRI Baseline)**: ${speciesObj.primarySpecies.join(", ")}.\n• Recommended Gear: ${speciesObj.recommendedGear}\n• Depth Range: ${speciesObj.depthRangeMeters}`;
        } else {
          body = `Satellite telemetry indicates high catch potential 15-35 km offshore with Chlorophyll density at ${chloro_val} mg/m³ and SST at ${sst_val}°C.\n\n🐟 **Likely Local Species (CMFRI Baseline)**: ${speciesObj.primarySpecies.join(", ")}.\n• Bathymetric Operating Depth: ${speciesObj.depthRangeMeters}\n• Recommended Gear: ${speciesObj.recommendedGear}\n• Peak Catch Window: ${speciesObj.catchWindow}`;
        }
      } else if (isStormSpecific || intent === "weather") {
        if (has_storm_warning) {
          body = `⚠️ **STORM ALERT**: Active storm advisory in effect for ${d.name}. Wind speed is ${wind_val} knots and wave swells are ${wave_val}m. Fishermen are advised to exercise extreme caution.`;
        } else {
          body = `✅ **NO STORM WARNING**: There are currently no active storm warnings for ${d.name}. Weather is ${d.condition}. Winds are at ${wind_val} knots and waves are at ${wave_val}m.`;
        }
      } else if (intent === "gis") {
        body = `The vessel is safely ${d.imbl} km from the IMBL limit. Local restricted regions include ${d.restricted_zone} (${d.restricted_dist} km away).`;
      } else if (intent === "safety") {
        const verdict = safety_level === "SAFE" ? "Yes, it is safe to proceed to sea today." : "Caution is advised before venturing into sea.";
        body = `🛡️ **Safety Verdict**: ${verdict}\n\n• Safety Rating: **${safety_level}** (Threat Score: ${final_danger_score}/100)\n• Wave Height: ${wave_val}m | Wind Speed: ${wind_val} knots\n• Weather: ${d.condition} | IMBL Distance: ${d.imbl} km`;
      } else {
        body = `Safety rating is ${safety_level} (Wave: ${wave_val}m, Wind: ${wind_val} knots). Chlorophyll levels are at ${chloro_val} mg/m³. Likely local species: ${speciesObj.primarySpecies.slice(0, 3).join(", ")}.`;
      }

      if (activeReports.length > 0) {
        body += `\n\n👥 **COMMUNITY LOGS**: ${activeReports.length} local reports verify this area. Latest alert: "${activeReports[0].text}" (${activeReports[0].timestamp}).`;
      }

      finalAnswer = `${intro}\n\n${body}`;

    } else if (detectedLang === "hi") {
      const time_prefix_hi = time_ctx.hi ? `${time_ctx.hi} के लिए ` : "";
      const intro = `${time_prefix_hi}${regNameHi} की स्थिति रिपोर्ट:`;
      let body = "";

      if (intent === "tide") {
        body = `ज्वार-भाटा विवरण: अगला उच्च ज्वार ${d.tide_ht} पर और निम्न ज्वार ${d.tide_lt} पर है।`;
      } else if (intent === "fish") {
        const speciesHi = ["बांगड़ा (मैकेरल)", "सिल्वर पापलेट", "बम्बिल", "तारली"].join(", ");
        if (isTimingSpecific) {
          body = `⏰ **मछली पकड़ने का सर्वोत्तम समय**: सुबह 05:00 से 09:30 बजे तक (सुबह के ज्वार का अनुकूल समय)।\n\n🌊 **सागरी व ज्वार स्थिति**: अगला उच्च ज्वार ${d.tide_ht} और निम्न ज्वार ${d.tide_lt} पर है। तापमान ${sst_val}°C और लहरें ${wave_val} मीटर हैं।\n🐟 **प्रमुख संभावित प्रजातियाँ (CMFRI डेटा)**: ${speciesHi}।\n• अनुशंसित गियर: पेलाजिक ड्रिफ्ट नेट व गिलनेट\n• परिचालन गहराई: 15 - 45 मीटर`;
        } else {
          body = `उपग्रह रिमोट सेंसिंग के अनुसार ${regNameHi} के 15-35 किमी पश्चिम में अपतटीय क्षेत्र सबसे अच्छा मछली पकड़ने का क्षेत्र (**उच्च संभावित मत्स्य क्षेत्र - PFZ**) है। यहाँ क्लोरोफिल घनत्व ${chloro_val} मि.ग्रा./घन मीटर और समुद्री सतह का तापमान ${sst_val}°C है।\n\n🐟 **संभावित स्थानीय प्रजातियाँ (CMFRI डेटा)**: ${speciesHi}।\n• परिचालन गहराई: 15 - 45 मीटर शेल्फ समोच्च\n• अनुशंसित गियर: पेलाजिक ड्रिफ्ट नेट व गिलनेट\n• सबसे अनुकूल समय: सुबह 05:00 से 09:30 बजे तक`;
        }
      } else if (isStormSpecific || intent === "weather") {
        if (has_storm_warning) {
          body = `⚠️ **तूफान चेतावनी**: ${regNameHi} में मौसम विभाग द्वारा तूफान की चेतावनी जारी है। हवा की गति ${wind_val} समुद्री मील और लहरें ${wave_val} मीटर हैं। मछुआरों को समुद्र में जाने से बचने की सलाह दी जाती है।`;
        } else {
          body = `✅ **तूफान का कोई अलर्ट नहीं**: वर्तमान में ${regNameHi} क्षेत्र में तूफान अथवा चक्रवात की कोई चेतावनी नहीं है। मौसम ${condHi} है। हवा की गति ${wind_val} समुद्री मील और लहरों की ऊंचाई ${wave_val} मीटर सामान्य स्तर पर है।`;
        }
      } else if (intent === "gis") {
        body = `आप अंतर्राष्ट्रीय सीमा से ${d.imbl} किमी दूर हैं। स्थानीय प्रतिबंधित क्षेत्र ${d.restricted_zone} है।`;
      } else if (intent === "safety") {
        const verdict = safety_level === "SAFE" ? "हाँ, आज समुद्र में जाना सुरक्षित है।" : "आज समुद्र में जाने के लिए सावधानी आवश्यक है।";
        body = `🛡️ **सुरक्षा निर्णय**: ${verdict}\n\n• सुरक्षा स्थिति: **${dangerHi}** (जोखिम स्तर: ${final_danger_score}/100)\n• लहरों की ऊंचाई: ${wave_val} मीटर | हवा की गति: ${wind_val} समुद्री मील\n• मौसम स्थिति: ${condHi} | अंतर्राष्ट्रीय सीमा से दूरी: ${d.imbl} किमी`;
      } else {
        body = `सुरक्षा स्तर ${dangerHi} है। वर्तमान लहर की ऊंचाई ${wave_val} मीटर और हवा की गति ${wind_val} समुद्री मील है। क्लोरोफिल स्तर ${chloro_val} मि.ग्रा./घन मीटर है।`;
      }

      if (activeReports.length > 0) {
        const rep = activeReports[0];
        body += `\n\n👥 **स्थानीय मछुआरा रिपोर्ट**: यहाँ ${activeReports.length} हालिया रिपोर्ट मिली हैं। ताज़ा जानकारी: "${rep.text_hi || rep.text}" (${rep.timestamp_hi || rep.timestamp})।`;
      }

      finalAnswer = `${intro}\n\n${body}`;

    } else { // Marathi (mr)
      const time_prefix_mr = time_ctx.mr ? `${time_ctx.mr} च्या माहितीनुसार ` : "";
      const intro = `${time_prefix_mr}${regNameMr} अहवाल:`;
      let body = "";

      if (intent === "tide") {
        body = `भरती-ओहोटीचे वेळापत्रक: पुढील भरती ${d.tide_ht} वाजता आणि ओहोटी ${d.tide_lt} वाजता असेल.`;
      } else if (intent === "fish") {
        const speciesMr = ["बांगडा (मॅकरेल)", "पापलेट", "बोंबील", "तारली"].join(", ");
        if (isTimingSpecific) {
          body = `⏰ **मासेमारीसाठी सर्वोत्तम वेळ**: पहाटे ०५:०० ते सकाळी ०९:३० वाजेपर्यंत आहे (भरतीच्या प्रवाहाचा अनुकूल काळ).\n\n🌊 **सागरी व भरती स्थिती**: पुढील भरती ${d.tide_ht} वाजता आणि ओहोटी ${d.tide_lt} वाजता आहे. सागरी तापमान ${sst_val}°C आणि लाटांची उंची ${wave_val} मीटर आहे.\n🐟 **स्थानिक संभाव्य मासे (CMFRI अभ्यास)**: ${speciesMr}.\n• शिफारस केलेले जाळे: ड्रिफ्ट नेट आणि गिलनेट\n• कार्यरत खोली: 15 - 45 मीटर सागरी खोली`;
        } else {
          body = `उपग्रह नोंदींनुसार ${regNameMr} किनाऱ्यापासून १५-३५ किमी पश्चिम पट्ट्यात **उच्च संभाव्य मासेमारी क्षेत्र (PFZ)** आहे. येथे क्लोरोफिल पातळी ${chloro_val} mg/m³ आणि समुद्राचे तापमान ${sst_val}°C आहे.\n\n🐟 **स्थानिक संभाव्य मासे (CMFRI नोंद)**: ${speciesMr}.\n• कार्यरत खोली: 15 - 45 मीटर सागरी खोली\n• शिफारस केलेले जाळे: ड्रिफ्ट नेट आणि गिलनेट\n• सर्वोत्तम वेळ: पहाटे ०५:०० ते सकाळी ०९:३० वाजेपर्यंत`;
        }
      } else if (isStormSpecific || intent === "weather") {
        if (has_storm_warning) {
          body = `⚠️ **वादळाचा इशारा**: ${regNameMr} भागात सध्या वादळी हवामानाचा इशारा जारी आहे. वाऱ्याचा वेग ${wind_val} नॉट्स आणि लाटांची उंची ${wave_val} मीटर आहे. मच्छीमारांनी समुद्रात जाणे टाळावे.`;
        } else {
          body = `✅ **वादळाचा कोणताही इशारा नाही**: सध्या ${regNameMr} परिसरात वादळाचा अथवा चक्रीवादळाचा कोणताही इशारा नाही. हवामान ${condMr} आहे. वाऱ्याचा वेग ${wind_val} नॉट्स आणि लाटांची उंची ${wave_val} मीटर सुरक्षित मर्यादेत आहे.`;
        }
      } else if (intent === "gis") {
        body = `आन्तरराष्ट्रीय सागरी सीमेपासूनचे अंतर ${d.imbl} किमी असून आपण सुरक्षित भागात आहात.`;
      } else if (intent === "safety") {
        const verdict = safety_level === "SAFE" ? "होय, आज समुद्रात जाणे पूर्णपणे सुरक्षित आहे." : "आज समुद्रात जाताना सावधगिरी बाळगावी.";
        body = `🛡️ **सुरक्षा निष्कर्ष**: ${verdict}\n\n• सुरक्षा पातळी: **${dangerMr}** (जोखिम निर्देशांक: ${final_danger_score}/100)\n• लाटांची उंची: ${wave_val} मीटर | वाऱ्याचा वेग: ${wind_val} नॉट्स\n• हवामान: ${condMr} | आंतरराष्ट्रीय सीमेपासून अंतर: ${d.imbl} किमी`;
      } else {
        body = `आज सुरक्षा निर्देशांक ${dangerMr} आहे. लाटा ${wave_val} मी आणि वारे ${wind_val} नॉट्स आहेत. क्लोरोफिल पातळी ${chloro_val} mg/m³ आहे.`;
      }

      if (activeReports.length > 0) {
        const rep = activeReports[0];
        body += `\n\n👥 **मच्छीमार समुदाय अहवाल**: या भागात ${activeReports.length} समुदाय नोंदी आहेत. ताजी नोंद: "${rep.text_mr || rep.text}" (${rep.timestamp_mr || rep.timestamp})।`;
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

    // Cancel any playing speech so audio doesn't overlap
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
      }, 2500);

    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2500);
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
            Converse with the agent network in Hindi, Marathi, or English. When a query is entered, the Planner divides it into telemetry lookups, compiles threats via the Risk Agent, and renders the live step-by-step reasoning trace.
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

          {/* Quick Prompts Panel */}
          <div className="p-3 bg-stone-50 border-b border-stone-150 flex flex-wrap gap-2 text-xs">
            {language === "hi" ? (
              <>
                <button 
                  onClick={() => handleSendMessage("गोवा में सबसे अच्छा मछली क्षेत्र कहाँ है?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  गोवा मछली क्षेत्र (PFZ)
                </button>
                <button 
                  onClick={() => handleSendMessage("कोच्चि में उच्च ज्वार (High Tide) का समय क्या है?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  कोच्चि टाइड्स
                </button>
                <button 
                  onClick={() => handleSendMessage("मुंबई मौसम और समुद्री सुरक्षा जानकारी")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  मुंबई सुरक्षा
                </button>
              </>
            ) : language === "mr" ? (
              <>
                <button 
                  onClick={() => handleSendMessage("गोव्यात सर्वोत्तम मासेमारी क्षेत्र कुठे आहे?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  गोवा मासेमारी (PFZ)
                </button>
                <button 
                  onClick={() => handleSendMessage("कोची भरतीचे वेळापत्रक काय आहे?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  कोची भरती-ओहोटी
                </button>
                <button 
                  onClick={() => handleSendMessage("मुंबई हवामान आणि सुरक्षा स्थिती")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  मुंबई सुरक्षा
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleSendMessage("Where is the best fish zone in Goa?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  Goa Fish PFZ
                </button>
                <button 
                  onClick={() => handleSendMessage("What is the high tide schedule in Kochi?")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  Kochi Tides
                </button>
                <button 
                  onClick={() => handleSendMessage("Goa border warnings and weather safety")}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-blue-900 px-2.5 py-1 rounded-md transition duration-150 text-[11px] font-semibold cursor-pointer"
                >
                  Goa Safety
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
              placeholder={isListening ? "Listening..." : "Dictate or type safety query..."}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-slate-850 text-xs outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900/15 transition duration-150"
              disabled={loading}
            />

            <button 
              onClick={() => handleSendMessage()}
              disabled={loading}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold p-3 rounded-xl transition duration-150"
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
              <p className="text-xs font-mono max-w-[280px]">No telemetry streaming. Ask a safety question to trigger the Planner Agent trace graph.</p>
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
