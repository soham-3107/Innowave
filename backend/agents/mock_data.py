# Mock datasets for coastal regions in India with multilingual support

MOCK_REGIONS = {
    "mumbai": {
        "name": "Mumbai Coast",
        "name_hi": "मुंबई तट",
        "name_mr": "मुंबई किनारपट्टी",
        "lat": 18.95,
        "lon": 72.80,
        "weather": {
            "wind_speed": 12.5,
            "wind_direction": "WSW",
            "precipitation": 15.0,
            "air_temperature": 29.5,
            "condition": "Partly Cloudy",
            "condition_hi": "आंशिक बादल",
            "condition_mr": "अंशतः ढगाळ",
            "warnings": [],
            "warnings_hi": [],
            "warnings_mr": []
        },
        "ocean": {
            "wave_height": 1.2,
            "sst": 28.2,
            "swell_period": 8.0,
            "sea_state": "Slightly Rough",
            "current_speed": 0.6
        },
        "satellite": {
            "chlorophyll": 4.8,
            "sst_anomaly": 0.4,
            "pfz_status": "High Potential Zone",
            "pfz_status_hi": "उच्च संभावित मत्स्य क्षेत्र (PFZ)",
            "pfz_status_mr": "उच्च संभाव्य मासेमारी क्षेत्र (PFZ)",
            "plankton_density": "High"
        },
        "species": {
            "primary": ["Indian Mackerel", "Silver Pomfret", "Bombay Duck", "Oil Sardines"],
            "primary_hi": ["बांगड़ा (मैकेरल)", "सिल्वर पापलेट", "बम्बिल (बॉम्बे डक)", "तारली (सार्डिन)"],
            "primary_mr": ["बांगडा (मॅकरेल)", "पापलेट", "बोंबील", "तारली (सार्डिन)"],
            "depth_range": "15 - 45m Shelf Contours",
            "depth_range_hi": "15 - 45 मीटर शेल्फ समोच्च",
            "depth_range_mr": "15 - 45 मीटर सागरी खोली",
            "gear": "Pelagic Drift Nets & Gillnets",
            "gear_hi": "पेलाजिक ड्रिफ्ट नेट व गिलनेट",
            "gear_mr": "ड्रिफ्ट नेट आणि गिलनेट",
            "catch_window": "Early Morning (05:00 - 09:30 AM)",
            "catch_window_hi": "सुबह 05:00 से 09:30 बजे तक (सवेरे)",
            "catch_window_mr": "पहाटे ०५:०० ते सकाळी ०९:३० वाजेपर्यंत",
            "cmfri_status": "High Pelagic Biomass Zone (CMFRI Baseline)"
        },
        "tide": {
            "high_tide_1": "05:42 AM (3.8m)",
            "low_tide_1": "11:58 AM (1.1m)",
            "high_tide_2": "18:15 PM (3.5m)",
            "low_tide_2": "23:49 PM (0.8m)"
        },
        "gis": {
            "distance_to_imbl": 320.0,
            "restricted_zones": [
                {
                    "name": "Naval Dockyard Zone",
                    "name_hi": "नौसेना डॉकयार्ड प्रतिबंधित क्षेत्र",
                    "name_mr": "नौदल गोदी प्रतिबंधित क्षेत्र",
                    "distance_km": 8.5,
                    "status": "Restricted"
                }
            ]
        }
    },
    "goa": {
        "name": "Goa Coast",
        "name_hi": "गोवा तट",
        "name_mr": "गोवा किनारपट्टी",
        "lat": 15.49,
        "lon": 73.82,
        "weather": {
            "wind_speed": 9.8,
            "wind_direction": "NW",
            "precipitation": 10.0,
            "air_temperature": 30.2,
            "condition": "Sunny and Clear",
            "condition_hi": "धूप और साफ मौसम",
            "condition_mr": "स्वच्छ व निरभ्र आकाश",
            "warnings": [],
            "warnings_hi": [],
            "warnings_mr": []
        },
        "ocean": {
            "wave_height": 0.8,
            "sst": 28.5,
            "swell_period": 7.2,
            "sea_state": "Calm",
            "current_speed": 0.4
        },
        "satellite": {
            "chlorophyll": 5.1,
            "sst_anomaly": 0.6,
            "pfz_status": "High Potential Zone",
            "pfz_status_hi": "उच्च संभावित मत्स्य क्षेत्र (PFZ)",
            "pfz_status_mr": "उच्च संभाव्य मासेमारी क्षेत्र (PFZ)",
            "plankton_density": "High"
        },
        "species": {
            "primary": ["Kingfish (Surmai)", "Yellowfin Tuna", "Indian Mackerel", "Seer Fish"],
            "primary_hi": ["सुरमई", "येलोफिन टूना", "बांगड़ा (मैकेरल)", "सीर फिश"],
            "primary_mr": ["सुरमई", "यलोफिन टुना", "बांगडा", "इसवण"],
            "depth_range": "25 - 60m Mid-Shelf",
            "depth_range_hi": "25 - 60 मीटर मध्य शेल्फ",
            "depth_range_mr": "25 - 60 मीटर सागरी खोली",
            "gear": "Trolling Lines & Hook-and-Line",
            "gear_hi": "ट्रोलिंग लाइन्स व हुक-एंड-लाइन",
            "gear_mr": "ट्रोलिंग लाइन्स व गळ मासेमारी",
            "catch_window": "Dawn & Dusk Tidal Influx",
            "catch_window_hi": "सुबह तड़के व शाम के ज्वार का समय",
            "catch_window_mr": "पहाटे व संध्याकाळच्या भरतीची वेळ",
            "cmfri_status": "Prime Pelagic Predator Corridor (CMFRI Baseline)"
        },
        "tide": {
            "high_tide_1": "06:15 AM (1.8m)",
            "low_tide_1": "12:20 PM (0.3m)",
            "high_tide_2": "18:40 PM (1.6m)",
            "low_tide_2": "00:45 AM (0.2m)"
        },
        "gis": {
            "distance_to_imbl": 380.0,
            "restricted_zones": [
                {
                    "name": "Mormugao Port Limit",
                    "name_hi": "मोरमुगाओ बंदरगाह सीमा",
                    "name_mr": "मोरमुगाओ बंदर मर्यादा",
                    "distance_km": 11.5,
                    "status": "Permitted"
                }
            ]
        }
    },
    "kochi": {
        "name": "Kochi Coast",
        "name_hi": "कोच्चि तट",
        "name_mr": "कोची किनारपट्टी",
        "lat": 9.93,
        "lon": 76.15,
        "weather": {
            "wind_speed": 28.0,
            "wind_direction": "W",
            "precipitation": 85.0,
            "air_temperature": 25.0,
            "condition": "Severe Thunderstorm",
            "condition_hi": "भीषण आंधी-तूफान",
            "condition_mr": "तीव्र वादळी पाऊस",
            "warnings": ["Gale warning in effect", "Heavy squall alerts"],
            "warnings_hi": ["तेज समुद्री तूफान की चेतावनी जारी", "भारी बारिश व आंधी अलर्ट"],
            "warnings_mr": ["वेगवान वादळी वाऱ्यांचा इशारा जारी", "मुसळधार पाऊस व वादळ अलर्ट"]
        },
        "ocean": {
            "wave_height": 3.8,
            "sst": 26.5,
            "swell_period": 12.0,
            "sea_state": "Rough to Very Rough",
            "current_speed": 1.8
        },
        "satellite": {
            "chlorophyll": 1.2,
            "sst_anomaly": -1.2,
            "pfz_status": "Low Potential Zone",
            "pfz_status_hi": "कम संभावना वाला क्षेत्र",
            "pfz_status_mr": "कमी संभाव्यता क्षेत्र",
            "plankton_density": "Low"
        },
        "species": {
            "primary": ["Indian Oil Sardines", "Malabar Anchovy", "Karikkadi Prawns", "Threadfin Bream"],
            "primary_hi": ["तारली (सार्डिन)", "एंकोवी", "करिक्काडी झींगा", "किलिमीस"],
            "primary_mr": ["तारली", "नेतळी", "कोळंबी", "राणी मासा"],
            "depth_range": "10 - 35m Coastal Upwelling",
            "depth_range_hi": "10 - 35 मीटर अपवेलिंग क्षेत्र",
            "depth_range_mr": "10 - 35 मीटर किनारपट्टी भाग",
            "gear": "Ring Seine & Bottom Trawls",
            "gear_hi": "रिंग सीन व बॉटम ट्रॉल",
            "gear_mr": "रिंग सीन आणि बॉटम ट्रॉल्स",
            "catch_window": "Pre-Dawn to Sunrise (04:30 - 07:30 AM)",
            "catch_window_hi": "भोर से सूर्योदय तक (04:30 - 07:30 AM)",
            "catch_window_mr": "पहाटे ते सूर्योदयापर्यंत (०४:३० - ०७:३० AM)",
            "cmfri_status": "High Inshore Coastal Shoaling (CMFRI Baseline)"
        },
        "tide": {
            "high_tide_1": "04:12 AM (1.4m)",
            "low_tide_1": "10:30 AM (0.4m)",
            "high_tide_2": "16:45 PM (1.3m)",
            "low_tide_2": "22:50 PM (0.3m)"
        },
        "gis": {
            "distance_to_imbl": 280.0,
            "restricted_zones": [
                {
                    "name": "Port Channel Area",
                    "name_hi": "बंदरगाह चैनल क्षेत्र",
                    "name_mr": "बंदर जलमार्ग क्षेत्र",
                    "distance_km": 1.2,
                    "status": "Caution"
                }
            ]
        }
    },
    "veraval": {
        "name": "Veraval / Gujarat Coast",
        "name_hi": "वेरावल / गुजरात तट",
        "name_mr": "वेरावळ / गुजरात किनारपट्टी",
        "lat": 20.90,
        "lon": 70.37,
        "weather": {
            "wind_speed": 18.0,
            "wind_direction": "NW",
            "precipitation": 40.0,
            "air_temperature": 27.8,
            "condition": "Overcast",
            "condition_hi": "घने बादल",
            "condition_mr": "ढगाळ वातावरण",
            "warnings": ["Moderate swell advisory"],
            "warnings_hi": ["मध्यम ऊंची लहरों की सलाह"],
            "warnings_mr": ["मध्यम लाटांचा इशारा"]
        },
        "ocean": {
            "wave_height": 2.2,
            "sst": 27.0,
            "swell_period": 9.5,
            "sea_state": "Moderate",
            "current_speed": 0.9
        },
        "satellite": {
            "chlorophyll": 6.2,
            "sst_anomaly": 0.8,
            "pfz_status": "High Potential Zone",
            "pfz_status_hi": "उच्च संभावित मत्स्य क्षेत्र (PFZ)",
            "pfz_status_mr": "उच्च संभाव्य मासेमारी क्षेत्र (PFZ)",
            "plankton_density": "Very High"
        },
        "species": {
            "primary": ["Yellowfin Tuna", "Ribbonfish", "Silver Pomfret", "Croaker (Ghol)"],
            "primary_hi": ["येलोफिन टूना", "रिबनफिश", "सिल्वर पापलेट", "घोल मछली"],
            "primary_mr": ["टुना", "रिबनफिश", "पापलेट", "घोल मासा"],
            "depth_range": "30 - 80m Shelf Slope",
            "depth_range_hi": "30 - 80 मीटर शेल्फ ढलान",
            "depth_range_mr": "30 - 80 मीटर सागरी उतार",
            "gear": "Longlines & Heavy Gillnets",
            "gear_hi": "लॉन्गलाइन्स व हेवी गिलनेट",
            "gear_mr": "लाँगलाईन्स आणि हेवी गिलनेट्स",
            "catch_window": "Early Morning (04:30 - 08:30 AM)",
            "catch_window_hi": "सुबह 04:30 से 08:30 बजे तक",
            "catch_window_mr": "पहाटे ०४:३० ते सकाळी ०८:३० वाजेपर्यंत",
            "cmfri_status": "Major Commercial Demersal/Pelagic Hub (CMFRI Baseline)"
        },
        "tide": {
            "high_tide_1": "07:10 AM (2.8m)",
            "low_tide_1": "13:20 PM (0.8m)",
            "high_tide_2": "19:35 PM (2.6m)",
            "low_tide_2": "01:40 AM (0.6m)"
        },
        "gis": {
            "distance_to_imbl": 78.0,
            "restricted_zones": [
                {
                    "name": "International Maritime Boundary Line",
                    "name_hi": "अंतर्राष्ट्रीय समुद्री सीमा रेखा (IMBL)",
                    "name_mr": "आंतरराष्ट्रीय सागरी सीमा रेषा (IMBL)",
                    "distance_km": 78.0,
                    "status": "High Alert"
                }
            ]
        }
    },
    "chennai": {
        "name": "Chennai Coast",
        "name_hi": "चेन्नई तट",
        "name_mr": "चेन्नई किनारपट्टी",
        "lat": 13.08,
        "lon": 80.30,
        "weather": {
            "wind_speed": 9.5,
            "wind_direction": "SE",
            "precipitation": 5.0,
            "air_temperature": 31.0,
            "condition": "Sunny / Clear",
            "condition_hi": "धूप और साफ मौसम",
            "condition_mr": "स्वच्छ व निरभ्र",
            "warnings": [],
            "warnings_hi": [],
            "warnings_mr": []
        },
        "ocean": {
            "wave_height": 0.8,
            "sst": 29.5,
            "swell_period": 7.0,
            "sea_state": "Calm",
            "current_speed": 0.4
        },
        "satellite": {
            "chlorophyll": 3.1,
            "sst_anomaly": 0.2,
            "pfz_status": "Medium Potential Zone",
            "pfz_status_hi": "मध्यम संभावित मत्स्य क्षेत्र",
            "pfz_status_mr": "मध्यम संभाव्य मासेमारी क्षेत्र",
            "plankton_density": "Moderate"
        },
        "species": {
            "primary": ["Ribbonfish", "Squid & Cuttlefish", "Tiger Prawns", "Lesser Sardines"],
            "primary_hi": ["रिबनफिश", "स्क्विड / कट्टलफिश", "टाइगर झींगा", "सार्डिन"],
            "primary_mr": ["वाकटी", "मांदेली / स्क्विड", "वाघ्या कोळंबी", "तारली"],
            "depth_range": "20 - 50m Shelf Boundary",
            "depth_range_hi": "20 - 50 मीटर शेल्फ सीमा",
            "depth_range_mr": "20 - 50 मीटर सागरी मर्यादा",
            "gear": "Trawl Nets & Light Jigging",
            "gear_hi": "ट्रॉल नेट व लाइट जिगिंग",
            "gear_mr": "ट्रॉल नेट आणि लाईट जिगिंग",
            "catch_window": "Late Evening & Night Drift",
            "catch_window_hi": "देर शाम व रात्रि ड्रिफ्ट का समय",
            "catch_window_mr": "उशिरा संध्याकाळी व रात्रीची वेळ",
            "cmfri_status": "Active Cephalopod & Demersal Shoal (CMFRI Baseline)"
        },
        "tide": {
            "high_tide_1": "06:30 AM (1.2m)",
            "low_tide_1": "12:45 PM (0.2m)",
            "high_tide_2": "18:50 PM (1.1m)",
            "low_tide_2": "00:55 AM (0.1m)"
        },
        "gis": {
            "distance_to_imbl": 210.0,
            "restricted_zones": [
                {
                    "name": "Ennore Port Limit",
                    "name_hi": "एन्नोर बंदरगाह सीमा",
                    "name_mr": "एन्नोर बंदर मर्यादा",
                    "distance_km": 12.0,
                    "status": "Permitted"
                }
            ]
        }
    },
    "vizag": {
        "name": "Visakhapatnam Coast",
        "name_hi": "विशाखापट्टनम तट",
        "name_mr": "विशाखापट्टणम किनारपट्टी",
        "lat": 17.68,
        "lon": 83.30,
        "weather": {
            "wind_speed": 14.0,
            "wind_direction": "ENE",
            "precipitation": 20.0,
            "air_temperature": 30.2,
            "condition": "Light Drizzle",
            "condition_hi": "हल्की बूंदाबांदी",
            "condition_mr": "हलक्या पावसाच्या सरी",
            "warnings": [],
            "warnings_hi": [],
            "warnings_mr": []
        },
        "ocean": {
            "wave_height": 1.4,
            "sst": 28.8,
            "swell_period": 8.5,
            "sea_state": "Slightly Rough",
            "current_speed": 0.7
        },
        "satellite": {
            "chlorophyll": 5.5,
            "sst_anomaly": 0.5,
            "pfz_status": "High Potential Zone",
            "pfz_status_hi": "उच्च संभावित मत्स्य क्षेत्र (PFZ)",
            "pfz_status_mr": "उच्च संभाव्य मासेमारी क्षेत्र (PFZ)",
            "plankton_density": "High"
        },
        "species": {
            "primary": ["Skipjack Tuna", "Tiger Prawns", "Indian Mackerel", "Anchovies"],
            "primary_hi": ["स्किपजैक टूना", "टाइगर झींगा", "बांगड़ा (मैकेरल)", "एंकोवी"],
            "primary_mr": ["टुना", "वाघ्या कोळंबी", "बांगडा", "नेतळी"],
            "depth_range": "25 - 70m Trench Margin",
            "depth_range_hi": "25 - 70 मीटर ट्रेंच मार्जिन",
            "depth_range_mr": "25 - 70 मीटर खोल सागरी भाग",
            "gear": "Purse Seine & Deep Handlines",
            "gear_hi": "पर्स सीन व डीप हैंडलाइन्स",
            "gear_mr": "पर्स सीन आणि खोल हँडलाइन्स",
            "catch_window": "Morning High Slack Tide",
            "catch_window_hi": "सुबह के उच्च ज्वार का समय",
            "catch_window_mr": "सकाळच्या भरतीची वेळ",
            "cmfri_status": "Oceanic Pelagic Migration Route (CMFRI Baseline)"
        },
        "tide": {
            "high_tide_1": "05:15 AM (1.6m)",
            "low_tide_1": "11:30 AM (0.3m)",
            "high_tide_2": "17:35 PM (1.5m)",
            "low_tide_2": "23:40 PM (0.2m)"
        },
        "gis": {
            "distance_to_imbl": 450.0,
            "restricted_zones": [
                {
                    "name": "Naval Base Prohibited Area",
                    "name_hi": "नौसेना बेस निषिद्ध क्षेत्र",
                    "name_mr": "नौदल तळ प्रतिबंधित क्षेत्र",
                    "distance_km": 4.2,
                    "status": "Restricted"
                }
            ]
        }
    }
}

COMMUNITY_REPORTS = [
    {
        "id": 1,
        "type": "Good Catch",
        "type_hi": "उत्कृष्ट शिकार",
        "type_mr": "उत्तम मासेमारी",
        "text": "Spotted large school of mackerel 12km out.",
        "text_hi": "तट से 12 किमी दूर बांगड़ा (मैकेरल) मछली का बड़ा झुंड देखा गया।",
        "text_mr": "किनाऱ्यापासून १२ किमी अंतरावर बांगडा माशांचा मोठा थवा आढळला आहे.",
        "lat": 18.78,
        "lon": 72.50,
        "timestamp": "2 hours ago",
        "timestamp_hi": "2 घंटे पहले",
        "timestamp_mr": "२ तासांपूर्वी",
        "region": "mumbai"
    },
    {
        "id": 2,
        "type": "Calm Seas",
        "type_hi": "शांत समुद्र",
        "type_mr": "शांत समुद्र",
        "text": "Calm and clear seas today, perfect for fishing.",
        "text_hi": "आज समुद्र शांत और साफ है, मछली पकड़ने के लिए उत्तम स्थिति है।",
        "text_mr": "आज समुद्र शांत आणि स्वच्छ आहे, मासेमारीसाठी उत्तम परिस्थिती आहे.",
        "lat": 15.42,
        "lon": 73.75,
        "timestamp": "5 hours ago",
        "timestamp_hi": "5 घंटे पहले",
        "timestamp_mr": "५ तासांपूर्वी",
        "region": "goa"
    },
    {
        "id": 3,
        "type": "Storm Warning",
        "type_hi": "तूफान चेतावनी",
        "type_mr": "वादळाचा इशारा",
        "text": "Sudden strong winds and dark storm clouds forming.",
        "text_hi": "अचानक तेज हवाएं और काले तूफानी बादल घिर रहे हैं।",
        "text_mr": "अचानक जोरदार वारे आणि काळे वादळी ढग जमा होत आहेत.",
        "lat": 9.98,
        "lon": 76.08,
        "timestamp": "1 hour ago",
        "timestamp_hi": "1 घंटा पहले",
        "timestamp_mr": "१ तासापूर्वी",
        "region": "kochi"
    },
    {
        "id": 4,
        "type": "High Waves",
        "type_hi": "ऊंची लहरें",
        "type_mr": "उंच लाटा",
        "text": "Slightly high waves swell, but manageable for large vessels.",
        "text_hi": "लहरें थोड़ी ऊंची हैं, लेकिन बड़ी नौकाओं के लिए सुरक्षित हैं।",
        "text_mr": "लाटांची उंची थोडी जास्त आहे, पण मोठ्या बोटींसाठी सुरक्षित आहे.",
        "lat": 13.12,
        "lon": 80.45,
        "timestamp": "4 hours ago",
        "timestamp_hi": "4 घंटे पहले",
        "timestamp_mr": "४ तासांपूर्वी",
        "region": "chennai"
    },
    {
        "id": 5,
        "type": "Good Catch",
        "type_hi": "उत्कृष्ट शिकार",
        "type_mr": "उत्तम मासेमारी",
        "text": "Rich plankton density, caught massive haul of tuna.",
        "text_hi": "भरपूर प्लवक घनत्व, बड़ी मात्रा में टूना मछली पकड़ी गई।",
        "text_mr": "प्लवक घनता उत्तम असून मोठ्या प्रमाणात टुना मासे मिळाले.",
        "lat": 20.85,
        "lon": 70.25,
        "timestamp": "6 hours ago",
        "timestamp_hi": "6 घंटे पहले",
        "timestamp_mr": "६ तासांपूर्वी",
        "region": "veraval"
    }
]

def get_closest_region(lat: float, lon: float) -> str:
    """Finds the closest mock region based on distance."""
    import math
    closest_key = "mumbai"
    min_dist = float("inf")
    
    for key, data in MOCK_REGIONS.items():
        dist = math.sqrt((data["lat"] - lat)**2 + (data["lon"] - lon)**2)
        if dist < min_dist:
            min_dist = dist
            closest_key = key
            
    return closest_key
