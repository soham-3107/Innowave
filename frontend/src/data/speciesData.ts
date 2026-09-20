export interface RegionSpeciesInfo {
  region: string;
  regionName: string;
  primarySpecies: string[];
  scientificNames: string[];
  depthRangeMeters: string;
  recommendedGear: string;
  catchWindow: string;
  cmfriStatus: string;
  chlorophyllFront: string;
}

export const REGION_SPECIES: Record<string, RegionSpeciesInfo> = {
  mumbai: {
    region: "mumbai",
    regionName: "Mumbai Coast",
    primarySpecies: ["Indian Mackerel", "Silver Pomfret", "Bombay Duck", "Oil Sardines"],
    scientificNames: ["Rastrelliger kanagurta", "Pampus argenteus", "Harpadon nehereus", "Sardinella longiceps"],
    depthRangeMeters: "15 - 45m Shelf Contours",
    recommendedGear: "Pelagic Drift Nets & Gillnets",
    catchWindow: "Early Morning (05:00 - 09:30 AM)",
    cmfriStatus: "High Pelagic Biomass Zone",
    chlorophyllFront: "Strong Front (4.8 mg/m³)"
  },
  goa: {
    region: "goa",
    regionName: "Goa Coast",
    primarySpecies: ["Kingfish (Surmai)", "Yellowfin Tuna", "Indian Mackerel", "Seer Fish"],
    scientificNames: ["Scomberomorus commerson", "Thunnus albacares", "Rastrelliger kanagurta", "Scomberomorus guttatus"],
    depthRangeMeters: "25 - 60m Mid-Shelf",
    recommendedGear: "Trolling Lines & Hook-and-Line",
    catchWindow: "Dawn & Dusk Tidal Influx",
    cmfriStatus: "Prime Pelagic Predator Corridor",
    chlorophyllFront: "Optimal Front (5.1 mg/m³)"
  },
  kochi: {
    region: "kochi",
    regionName: "Kochi Coast",
    primarySpecies: ["Indian Oil Sardines", "Malabar Anchovy", "Karikkadi Prawns", "Threadfin Bream"],
    scientificNames: ["Sardinella longiceps", "Encrasicholina devisi", "Parapenaeopsis stylifera", "Nemipterus japonicus"],
    depthRangeMeters: "10 - 35m Coastal Upwelling",
    recommendedGear: "Ring Seine & Bottom Trawls",
    catchWindow: "Pre-Dawn to Sunrise (04:30 - 07:30 AM)",
    cmfriStatus: "High Inshore Coastal Shoaling",
    chlorophyllFront: "Active Upwelling Plume (1.2 - 2.5 mg/m³)"
  },
  chennai: {
    region: "chennai",
    regionName: "Chennai Coast",
    primarySpecies: ["Ribbonfish", "Squid & Cuttlefish", "Tiger Prawns", "Lesser Sardines"],
    scientificNames: ["Trichiurus lepturus", "Uroteuthis duvaucelii", "Penaeus monodon", "Sardinella gibbosa"],
    depthRangeMeters: "20 - 50m Shelf Boundary",
    recommendedGear: "Trawl Nets & Light Jigging",
    catchWindow: "Late Evening & Night Drift",
    cmfriStatus: "Active Cephalopod & Demersal Shoal",
    chlorophyllFront: "Stable Front (3.1 mg/m³)"
  },
  veraval: {
    region: "veraval",
    regionName: "Veraval / Gujarat Coast",
    primarySpecies: ["Yellowfin Tuna", "Ribbonfish", "Silver Pomfret", "Croaker (Ghol)"],
    scientificNames: ["Thunnus albacares", "Trichiurus lepturus", "Pampus argenteus", "Protonibea diacanthus"],
    depthRangeMeters: "30 - 80m Shelf Slope",
    recommendedGear: "Longlines & Heavy Gillnets",
    catchWindow: "Early Morning (04:30 - 08:30 AM)",
    cmfriStatus: "Major Commercial Demersal/Pelagic Hub",
    chlorophyllFront: "High Plankton Density (6.2 mg/m³)"
  },
  vizag: {
    region: "vizag",
    regionName: "Visakhapatnam Coast",
    primarySpecies: ["Skipjack Tuna", "Tiger Prawns", "Indian Mackerel", "Anchovies"],
    scientificNames: ["Katsuwonus pelamis", "Penaeus monodon", "Rastrelliger kanagurta", "Stolephorus indicus"],
    depthRangeMeters: "25 - 70m Trench Margin",
    recommendedGear: "Purse Seine & Deep Handlines",
    catchWindow: "Morning High Slack Tide",
    cmfriStatus: "Oceanic Pelagic Migration Route",
    chlorophyllFront: "Strong Coastal Front (5.5 mg/m³)"
  }
};

export interface SpeciesDetail {
  name: string;
  name_hi: string;
  name_mr: string;
  scientific: string;
  location: string;
  location_hi: string;
  location_mr: string;
  depth: string;
  depth_hi: string;
  depth_mr: string;
  temp_opt: string;
  gear: string;
  gear_hi: string;
  gear_mr: string;
  bait: string;
  bait_hi: string;
  bait_mr: string;
  weather: string;
  weather_hi: string;
  weather_mr: string;
  market_price: string;
  market_price_hi: string;
  market_price_mr: string;
}

export const GLOBAL_SPECIES_PROFILES: Record<string, SpeciesDetail> = {
  tuna: {
    name: "Yellowfin & Skipjack Tuna (टुना / टूना)",
    name_hi: "येलोफिन व स्किपजैक टूना मछली",
    name_mr: "यलोफिन व स्किपजॅक टुना मासा",
    scientific: "Thunnus albacares / Katsuwonus pelamis",
    location: "Offshore shelf slope, continental shelf break (25 to 60 km offshore along the 100m depth contour lines). Look for bird feeding frenzies and floating oceanic debris.",
    location_hi: "तट से 25 से 60 किमी दूर महाद्वीपीय शेल्फ ढलान (100 मीटर समोच्च रेखा)। पानी की सतह पर मंडराते समुद्री पक्षियों के झुंड के पास।",
    location_mr: "किनाऱ्यापासून २५ ते ६० किमी खोल समुद्रात (१०० मीटर खोलीच्या शेल्फ कडेवर). समुद्रावर घिरट्या घालणाऱ्या पक्ष्यांच्या थव्यांजवळ.",
    depth: "30 to 80 meters (swims in the epipelagic layer just above the thermocline)",
    depth_hi: "30 से 80 मीटर (थर्मोक्लाइन के ठीक ऊपर ऊपरी जल परत में)",
    depth_mr: "३० ते ८० मीटर खोल (थर्मोक्लाईन थराच्या वरच्या भागात)",
    temp_opt: "27.0°C - 29.5°C (optimal thermal front boundary)",
    gear: "Drift Longlines (with steel wire leaders), Surface Trolling Lines, and Heavy Mesh Pelagic Driftnets (140-160 mm)",
    gear_hi: "लॉन्गलाइन (स्टील वायर लीडर्स के साथ), सर्फेस ट्रोलिंग लाइनें और हेवी मेश ड्रिफ्टनेट (140-160 मिमी)",
    gear_mr: "लाँगलाईन (स्टील वायर लीडर्ससह), पृष्ठभागावरील ट्रोलिंग आणि मोठे ड्रिफ्ट जाळे (१४०-१६० मिमी)",
    bait: "Fresh whole Oil Sardines, Indian Mackerel, Squid, or bright artificial skirted lures / Rapala diving plugs (silver/blue)",
    bait_hi: "ताजी साबुत तारली (सार्डिन), बांगड़ा (मैकेरल), स्क्विड (माकली) या चमकदार सिल्वर/ब्लू रापाला ल्यूर",
    bait_mr: "ताजी संपूर्ण तारली, बांगडा, स्क्विड (माकली) किंवा चमकदार सिल्व्हर/निळे कृत्रिम रापाला ल्यूर्स",
    weather: "Mild to moderate breeze (8-14 knots), wave swell 0.8-1.4m, clear blue oceanic water, Sea Surface Temp around 27.5-29°C. Best caught at early dawn (04:30 - 08:30 AM) during high tide slack.",
    weather_hi: "हल्की से मध्यम हवा (8-14 नॉट), लहरें 0.8-1.4 मीटर, गहरा नीला साफ पानी और तापमान 27.5-29°C। सबसे अनुकूल समय सुबह 04:30 से 08:30 बजे।",
    weather_mr: "हलकी ते मध्यम हवा (८-१४ नॉट्स), लाटा ०.८-१.४ मीटर, स्वच्छ निळे पाणी व तापमान २७.५-२९°C. सर्वोत्तम वेळ पहाटे ०४:३० ते सकाळी ०८:३०.",
    market_price: "₹240 - ₹380/kg (Fresh grade) | Up to ₹600/kg for Sashimi export grade",
    market_price_hi: "₹240 - ₹380 प्रति किग्रा (निर्यात ग्रेड हेतु ₹600 तक)",
    market_price_mr: "₹२४० - ₹३८० प्रति किलो (निर्यात ग्रेडसाठी ₹६०० पर्यंत)"
  },
  pomfret: {
    name: "Silver & White Pomfret (पापलेट / हलवा)",
    name_hi: "सिल्वर पापलेट मछली",
    name_mr: "सिल्वर पापलेट मासा",
    scientific: "Pampus argenteus",
    location: "Coastal inshore to mid-shelf waters (15 to 35 km offshore) over soft muddy or sandy sea bottoms.",
    location_hi: "तट से 15 से 35 किमी दूर मुलायम रेतीले या कीचड़दार समुद्री तल के ऊपर।",
    location_mr: "किनाऱ्यापासून १५ ते ३५ किमी अंतरावर मऊ वाळू किंवा गाळाच्या तळाशी.",
    depth: "15 to 45 meters",
    depth_hi: "15 से 45 मीटर",
    depth_mr: "१५ ते ४५ मीटर",
    temp_opt: "26.5°C - 28.5°C",
    gear: "Specialized Monofilament Bottom Drift Gillnets (110 - 130 mm mesh)",
    gear_hi: "मोनोफिलामेंट बॉटम ड्रिफ्ट गिलनेट (110 - 130 मिमी मेश)",
    gear_mr: "मोनोफिलामेंट बॉटम ड्रिफ्ट जाळे (११० - १३० मिमी मेश)",
    bait: "Pelagic plankton drift; no hook bait required (entrapped via fine mesh driftnetting during slack water)",
    bait_hi: "प्लैंकटन बहाव; जालों द्वारा शांत जल में पकड़",
    bait_mr: "प्लवक प्रवाह; शांत पाण्यात जाळ्यांच्या साहाय्याने पकड",
    weather: "Calm to slight sea (wind < 12 knots, waves < 1.1m), moderate turbidity with high chlorophyll concentration (3.5 - 5.5 mg/m³). Best caught around dusk and pre-dawn slack tide.",
    weather_hi: "शांत समुद्र (हवा < 12 नॉट, लहरें < 1.1 मीटर), उच्च क्लोरोफिल (3.5-5.5 mg/m³)।",
    weather_mr: "शांत समुद्र (वारा < १२ नॉट्स, लाटा < १.१ मीटर), उच्च क्लोरोफिल (३.५-५.५ mg/m³).",
    market_price: "₹750 - ₹950/kg",
    market_price_hi: "₹750 - ₹950 प्रति किग्रा",
    market_price_mr: "₹७५० - ₹९५० प्रति किलो"
  },
  surmai: {
    name: "Kingfish / Seer Fish (सुरमई)",
    name_hi: "सुरमई (किंगफिश)",
    name_mr: "सुरमई (इसवण)",
    scientific: "Scomberomorus commerson",
    location: "Coastal reef edges, rocky drop-offs, and mid-shelf waters 20 to 45 km offshore.",
    location_hi: "तट से 20 से 45 किमी दूर चट्टानी किनारों और शेल्फ ढलानों के पास।",
    location_mr: "किनाऱ्यापासून २० ते ४५ किमी अंतरावर खडकाळ कडा व शेल्फ उताराजवळ.",
    depth: "20 to 55 meters",
    depth_hi: "20 से 55 मीटर",
    depth_mr: "२० - ५५ मीटर",
    temp_opt: "26.0°C - 28.5°C",
    gear: "Surface Trolling Lines (with wire trace) & Pelagic Large-Mesh Driftnets (130-160 mm)",
    gear_hi: "ट्रोलिंग लाइन्स (स्टील वायर ट्रेस के साथ) व हेवी ड्रिफ्टनेट (130-160 मिमी)",
    gear_mr: "ट्रोलिंग लाईन्स (स्टील वायर ट्रेससह) व मोठे ड्रिफ्ट जाळे (१३०-१६० मिमी)",
    bait: "Live Indian Mackerel, whole Sardines, Squid strips, silver spoons, and fast-moving Rapala lures",
    bait_hi: "जीवित बांगड़ा, साबुत सार्डिन, स्क्विड के टुकड़े व चमकदार सिल्वर ल्यूर",
    bait_mr: "जिवंत बांगडा, संपूर्ण तारली, माकलीचे तुकडे व चमकदार कृत्रिम आमिष",
    weather: "Clear to slightly choppy water (wind 8-15 knots, waves 0.8-1.3m), high visibility. Peak feeding during sunrise and incoming high tide.",
    weather_hi: "साफ पानी, हल्की हवा (8-15 नॉट), लहरें 0.8-1.3 मीटर। सूर्योदय और चढ़ती ज्वार पर सर्वोत्तम।",
    weather_mr: "स्वच्छ पाणी, हलकी हवा (८-१५ नॉट्स), लाटा ०.८-१.३ मीटर. सूर्योदय व भरतीच्या वेळी सर्वोत्तम.",
    market_price: "₹600 - ₹850/kg",
    market_price_hi: "₹600 - ₹850 प्रति किग्रा",
    market_price_mr: "₹६०० - ₹८५० प्रति किलो"
  },
  mackerel: {
    name: "Indian Mackerel (बांगडा / बांगड़ा)",
    name_hi: "भारतीय बांगड़ा (मैकेरल)",
    name_mr: "भारतीय बांगडा (मॅकरेल)",
    scientific: "Rastrelliger kanagurta",
    location: "Coastal shelf waters within 10 to 25 km of coastline along rich upwelling fronts.",
    location_hi: "तट से 10 से 25 किमी की दूरी पर समृद्ध अपवेलिंग क्षेत्रों में।",
    location_mr: "किनाऱ्यापासून १० ते २५ किमी अंतरावर मुबलक प्लवक असलेल्या भागात.",
    depth: "10 to 35 meters",
    depth_hi: "10 से 35 मीटर",
    depth_mr: "१० ते ३५ मीटर",
    temp_opt: "26.5°C - 29.0°C",
    gear: "Purse Seine, Ring Seine, and Surface Drift Gillnets (35-45 mm mesh)",
    gear_hi: "पर्स सीन, रिंग सीन व सरफेस ड्रिफ्ट गिलनेट (35-45 मिमी)",
    gear_mr: "पर्स सीन, रिंग सीन व पृष्ठभागावरील ड्रिफ्ट जाळे (३५-४५ मिमी)",
    bait: "Attracted to light rigs and bioluminescent plankton blooms; small shrimp paste or shiny sabiki rigs",
    bait_hi: "प्लैंकटन आकर्षण व साबीकी रिग्स",
    bait_mr: "प्लवक व प्रकाशाचे आकर्षण; सबिकी रिग्स",
    weather: "Moderate breeze, calm to moderate swell (0.6-1.2m), high chlorophyll (>4.0 mg/m³). Peak catch during early dawn.",
    weather_hi: "मध्यम हवा, हल्की लहरें (0.6-1.2 मीटर), उच्च क्लोरोफिल (>4.0 mg/m³)।",
    weather_mr: "मध्यम हवा, हलक्या लाटा (०.६-१.२ मीटर), उच्च क्लोरोफिल (>४.० mg/m³).",
    market_price: "₹140 - ₹220/kg",
    market_price_hi: "₹140 - ₹220 प्रति किग्रा",
    market_price_mr: "₹१४० - ₹२२० प्रति किलो"
  },
  ghol: {
    name: "Blackspotted Croaker (घोल मासा / घोल मछली - Sea Gold)",
    name_hi: "घोल मछली (समुद्री सोना / ब्लैकस्पॉटेड क्रोकर)",
    name_mr: "घोल मासा (समुद्रातील सोने)",
    scientific: "Protonibea diacanthus",
    location: "Deep rocky trenches, submerged reefs, and muddy shelf depressions (30 to 65 km offshore Saurashtra & North Konkan coast).",
    location_hi: "तट से 30 से 65 किमी दूर गहरे चट्टानी गड्ढों व मलबे वाले समुद्री तल के पास।",
    location_mr: "किनाऱ्यापासून ३० ते ६५ किमी अंतरावर खोल खडकाळ चर व मऊ गाळाच्या भागात.",
    depth: "35 to 80 meters (Demersal sea bed dweller)",
    depth_hi: "35 से 80 मीटर (समुद्री तलहटी पर)",
    depth_mr: "३५ ते ८० मीटर (समुद्राच्या तळाशी)",
    temp_opt: "25.0°C - 27.5°C",
    gear: "Heavy Bottom Set Gillnets (180-220 mm) & Heavy Bottom Handlines",
    gear_hi: "हैवी बॉटम सेट गिलनेट (180-220 मिमी) व बॉटम हैंडलाइन",
    gear_mr: "तळाचे जाळे (१८०-२२० मिमी) व हेवी बॉटम हॅन्डलाईन",
    bait: "Live mud crabs, fresh squid, cut mackerel fillets, and large prawns",
    bait_hi: "जीवित केकड़ा, ताजा स्क्विड, बांगड़ा मछली के टुकड़े",
    bait_mr: "जिवंत खेकडे, ताजी माकली, बांगड्याचे तुकडे व मोठी कोळंबी",
    weather: "Stable sea floor currents, moderate swell (< 1.5m), night or early dawn slack tide.",
    weather_hi: "स्थिर समुद्री तल, मध्यम लहरें (< 1.5 मीटर), रात या सुबह का शांत जल।",
    weather_mr: "स्थिर प्रवाह, मध्यम लाटा (< १.५ मीटर), रात्रीची किंवा पहाटेची शांत वेळ.",
    market_price: "₹1,200 - ₹3,500/kg (Air bladder / maws can fetch ₹50,000 - ₹2,00,000+ per piece for medicinal trade)",
    market_price_hi: "₹1,200 - ₹3,500 प्रति किग्रा (औषधीय एयर ब्लैडर हेतु ₹50,000 से ₹2,00,000+ प्रति पीस)",
    market_price_mr: "₹१,२०० - ₹३,५०० प्रति किलो (औषधी पोत्यासाठी ₹५०,००० ते ₹२,००,०००+ प्रति नग)"
  }
};

