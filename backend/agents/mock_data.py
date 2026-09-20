# Mock datasets for coastal regions in India with multilingual support and rich domain-specific intelligence

MOCK_REGIONS = {
    "mumbai": {
        "name": "Mumbai Coast",
        "name_hi": "मुंबई तट",
        "name_mr": "मुंबई किनारपट्टी",
        "lat": 18.95,
        "lon": 72.80,
        "weather": {
            "wind_speed": 12.5,
            "wind_speed_kmh": 23.2,
            "wind_gusts": 16.0,
            "wind_direction": "WSW",
            "precipitation": 15.0,
            "air_temperature": 29.5,
            "barometric_pressure": 1012.4,
            "pressure_trend": "Steady",
            "humidity": 74,
            "visibility_nm": 6.5,
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
            "swell_direction": "WSW (245°)",
            "sea_state": "Slightly Rough (Douglas Scale 3)",
            "sea_state_hi": "हल्का अशांत (स्केल 3)",
            "sea_state_mr": "किंचित खवळलेला समुद्र (स्केल ३)",
            "current_speed": 0.6,
            "current_direction": "SSE",
            "underwater_visibility_m": 4.5
        },
        "satellite": {
            "chlorophyll": 4.8,
            "sst_anomaly": 0.4,
            "pfz_status": "High Potential Zone",
            "pfz_status_hi": "उच्च संभावित मत्स्य क्षेत्र (PFZ)",
            "pfz_status_mr": "उच्च संभाव्य मासेमारी क्षेत्र (PFZ)",
            "plankton_density": "High (Diatom bloom active)",
            "sensor_source": "ISRO Oceansat-3 (EOS-06) & MODIS Aqua",
            "thermal_front": "28.2°C to 27.4°C convergence boundary located 18-32 km offshore WSW"
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
        "species_profiles": {
            "pomfret": {
                "name": "Silver Pomfret (Paplet)",
                "name_hi": "सिल्वर पापलेट",
                "name_mr": "सिल्वर पापलेट",
                "scientific": "Pampus argenteus",
                "depth": "18 - 38 meters",
                "depth_hi": "18 - 38 मीटर",
                "depth_mr": "१८ - ३८ मीटर",
                "temp_opt": "26.5°C - 28.5°C",
                "gear": "Bottom Set Gillnets (Mesh size 120-140 mm)",
                "gear_hi": "बॉटम सेट गिलनेट (मेश आकार 120-140 मिमी)",
                "gear_mr": "बॉटम सेट गिलनेट (जाळे मेश आकार १२०-१४० मिमी)",
                "bait": "Squid strips, small shrimp lures, or clear monofilament gillnets",
                "bait_hi": "स्क्विड के टुकड़े, झींगा चारा या मोनोफिलामेंट जाल",
                "bait_mr": "मांदेली/स्क्विड तुकडे, कोळंबी चारा किंवा मोनोफिलामेंट जाळे",
                "market_price": "₹750 - ₹950/kg (Grade A Prime)",
                "market_price_hi": "₹750 - ₹950 प्रति किग्रा (ग्रेड A)",
                "market_price_mr": "₹७५० - ₹९५० प्रति किलो (उत्कृष्ट प्रत)",
                "hotspot": "Muddy shelf contours 22 km west of Versova/Sassoon Docks"
            },
            "mackerel": {
                "name": "Indian Mackerel (Bangda)",
                "name_hi": "बांगड़ा (मैकेरल)",
                "name_mr": "बांगडा (मॅकरेल)",
                "scientific": "Rastrelliger kanagurta",
                "depth": "12 - 30 meters (Mid-water shoals)",
                "depth_hi": "12 - 30 मीटर (मध्य-जल झुंड)",
                "depth_mr": "१२ - ३० मीटर (मध्यम खोलीवर थवे)",
                "temp_opt": "27.0°C - 29.0°C",
                "gear": "Pelagic Drift Gillnets & Ring Seine (Mesh size 35-45 mm)",
                "gear_hi": "पेलाजिक ड्रिफ्ट गिलनेट व रिंग सीन (मेश 35-45 मिमी)",
                "gear_mr": "ड्रिफ्ट गिलनेट व रिंग सीन (मेश ३५-४५ मिमी)",
                "bait": "Plankton attraction lights, small metal jigs, shrimp paste",
                "bait_hi": "प्लैंकटन लाइट, छोटे धातु जिग, झींगा चारा",
                "bait_mr": "लाईट जिगिंग, प्लवक आकर्षण लाईट, लहान कोळंबी चारा",
                "market_price": "₹140 - ₹220/kg",
                "market_price_hi": "₹140 - ₹220 प्रति किग्रा",
                "market_price_mr": "₹१४० - ₹२२० प्रति किलो",
                "hotspot": "Surface chlorophyll fronts 12-25 km offshore"
            },
            "bombay_duck": {
                "name": "Bombay Duck (Bombil)",
                "name_hi": "बम्बिल (बॉम्बे डक)",
                "name_mr": "बोंबील",
                "scientific": "Harpadon nehereus",
                "depth": "10 - 25 meters (Estuarine & Inshore mud banks)",
                "depth_hi": "10 - 25 मीटर (तटीय कीचड़दार क्षेत्र)",
                "depth_mr": "१० - २५ मीटर (किनारपट्टी गाळाचा भाग)",
                "temp_opt": "26.0°C - 28.0°C",
                "gear": "Dol Net (Bag Net with tidal mooring)",
                "gear_hi": "डोल नेट (ज्वारीय प्रवाह आधारित जाल)",
                "gear_mr": "डोल जाळे (भरती प्रवाहावर आधारित)",
                "bait": "Tidal flow entrapment (Passive suspension)",
                "bait_hi": "ज्वारीय प्रवाह में स्वतः फंसाव",
                "bait_mr": "प्रवाहातील नैसर्गिक फंसाव",
                "market_price": "₹160 - ₹260/kg (Fresh)",
                "market_price_hi": "₹160 - ₹260 प्रति किग्रा (ताजा)",
                "market_price_mr": "₹१६० - ₹२६० प्रति किलो (ताजे)",
                "hotspot": "Tidal current channels off Mahim Bay and Thane Creek approach"
            },
            "sardines": {
                "name": "Indian Oil Sardine (Tarli)",
                "name_hi": "तारली (सार्डिन)",
                "name_mr": "तारली (सार्डिन)",
                "scientific": "Sardinella longiceps",
                "depth": "8 - 25 meters (Surface pelagic schools)",
                "depth_hi": "8 - 25 मीटर (सतही झुंड)",
                "depth_mr": "८ - २५ मीटर (वरच्या थरातील थवे)",
                "temp_opt": "27.5°C - 29.5°C",
                "gear": "Purse Seine & Shore Seine (Mesh size 20-28 mm)",
                "gear_hi": "पर्स सीन व शोर सीन (मेश 20-28 मिमी)",
                "gear_mr": "पर्स सीन व किनारपट्टी जाळे (मेश २०-२८ मिमी)",
                "bait": "Light attraction at dawn",
                "bait_hi": "सुबह के समय लाइट आकर्षण",
                "bait_mr": "पहाटेच्या प्रकाशाचे आकर्षण",
                "market_price": "₹80 - ₹140/kg",
                "market_price_hi": "₹80 - ₹140 प्रति किग्रा",
                "market_price_mr": "₹८० - ₹१४० प्रति किलो",
                "hotspot": "Plankton blooms within 15 km of coast"
            },
            "surmai": {
                "name": "Kingfish / Seer Fish (Surmai)",
                "name_hi": "सुरमई (किंगफिश)",
                "name_mr": "सुरमई",
                "scientific": "Scomberomorus commerson",
                "depth": "20 - 55 meters",
                "depth_hi": "20 - 55 मीटर",
                "depth_mr": "२० - ५५ मीटर",
                "temp_opt": "26.0°C - 28.5°C",
                "gear": "Surface Trolling & Heavy Driftnets (130-160 mm)",
                "gear_hi": "ट्रोलिंग लाइन्स व हेवी ड्रिफ्टनेट (130-160 मिमी)",
                "gear_mr": "ट्रोलिंग लाईन्स व मोठे ड्रिफ्ट जाळे (१३०-१६० मिमी)",
                "bait": "Live Indian Mackerel, Sardine chunks, Rapala silver lures",
                "bait_hi": "जीवित बांगड़ा, सार्डिन टुकड़े, सिल्वर ल्यूर",
                "bait_mr": "जिवंत बांगडा, तारलीचे तुकडे, चमकदार कृत्रिम आमिष",
                "market_price": "₹600 - ₹850/kg",
                "market_price_hi": "₹600 - ₹850 प्रति किग्रा",
                "market_price_mr": "₹६०० - ₹८५० प्रति किलो",
                "hotspot": "Shelf drop-offs 30-45 km offshore"
            },
            "prawns": {
                "name": "Prawns & Shrimps (Kolambi / Jhinga)",
                "name_hi": "झींगा (प्रॉन्स)",
                "name_mr": "कोळंबी (प्रॉन्स)",
                "scientific": "Penaeus indicus / Parapenaeopsis",
                "depth": "12 - 35 meters (Soft muddy sea floor)",
                "depth_hi": "12 - 35 मीटर (मुलायम कीचड़दार तल)",
                "depth_mr": "१२ - ३५ मीटर (गाळाचा मऊ तळभाग)",
                "temp_opt": "25.5°C - 28.0°C",
                "gear": "Bottom Trawl Net with Turtle Excluder Device (TED)",
                "gear_hi": "बॉटम ट्रॉल नेट (TED सुसज्जित)",
                "gear_mr": "बॉटम ट्रॉल जाळे (TED कासव रक्षक साधनासह)",
                "bait": "Bottom scraping trawl footrope",
                "bait_hi": "बॉटम ड्रॅग विधि",
                "bait_mr": "तळावरून ट्रॉलिंग पद्धत",
                "market_price": "₹380 - ₹620/kg",
                "market_price_hi": "₹380 - ₹620 प्रति किग्रा",
                "market_price_mr": "₹३८० - ₹६२० प्रति किलो",
                "hotspot": "Muddy river mouth outflows and shelf flats"
            }
        },
        "tide": {
            "high_tide_1": "05:42 AM (3.8m)",
            "low_tide_1": "11:58 AM (1.1m)",
            "high_tide_2": "18:15 PM (3.5m)",
            "low_tide_2": "23:49 PM (0.8m)",
            "tidal_range_m": 2.7,
            "cycle": "Spring Tide (Strong Influx)",
            "cycle_hi": "स्प्रिंग टाइड (तीव्र ज्वारीय प्रवाह)",
            "cycle_mr": "मोठी भरती / उधाण (वेगवान प्रवाह)",
            "slack_window": "11:30 AM - 12:30 PM (Low Slack) & 05:15 AM - 06:10 AM (High Slack)",
            "slack_window_hi": "11:30 AM से 12:30 PM और 05:15 AM से 06:10 AM (शांत जल समय)",
            "slack_window_mr": "सकाळी ११:३० ते दुपारी १२:३० व पहाटे ०५:१५ ते ०६:१० (शांत पाण्याचा कालावधी)",
            "sandbar_clearance_m": 2.6
        },
        "gis": {
            "distance_to_imbl": 320.0,
            "imbl_status": "Secure (Over 300 km from IMBL)",
            "imbl_status_hi": "सुरक्षित (अंतर्राष्ट्रीय सीमा से 300+ किमी दूर)",
            "imbl_status_mr": "पूर्ण सुरक्षित (आंतरराष्ट्रीय सीमेपासून ३००+ किमी दूर)",
            "restricted_zones": [
                {
                    "name": "Naval Dockyard Zone",
                    "name_hi": "नौसेना डॉकयार्ड प्रतिबंधित क्षेत्र",
                    "name_mr": "नौदल गोदी प्रतिबंधित क्षेत्र",
                    "distance_km": 8.5,
                    "status": "Strictly Prohibited for Commercial Fishing",
                    "status_hi": "व्यावसायिक मत्स्य पालन हेतु पूर्णतः निषिद्ध",
                    "status_mr": "व्यावसायिक मासेमारीसाठी पूर्ण बंदी"
                },
                {
                    "name": "Mumbai Port Shipping Channel",
                    "name_hi": "मुंबई पोर्ट शिपिंग चैनल",
                    "name_mr": "मुंबई बंदर मुख्य जहाज जलमार्ग",
                    "distance_km": 4.2,
                    "status": "Transit Only - No Net Casting",
                    "status_hi": "केवल पारगमन - जाल डालना वर्जित",
                    "status_mr": "केवळ बोटींच्या ये-जासाठी - जाळे टाकण्यास बंदी"
                }
            ]
        },
        "economics": {
            "dockside_prices": {
                "Pomfret (सिल्वर पापलेट)": "₹750 - ₹950/kg",
                "Surmai (सुरमई)": "₹600 - ₹850/kg",
                "Mackerel (बांगडा)": "₹140 - ₹220/kg",
                "Bombay Duck (बोंबील)": "₹160 - ₹260/kg",
                "Prawns (कोळंबी)": "₹380 - ₹620/kg",
                "Sardines (तारली)": "₹80 - ₹140/kg"
            },
            "fuel_saving_tips": "Following direct bearing 255° to the 4.8 mg/m³ chlorophyll front at 8.5 knots saves ~24% diesel compared to unguided scouting.",
            "fuel_saving_tips_hi": "255° दिशा में 8.5 समुद्री मील की गति से सीधे PFZ क्षेत्र की ओर जाने पर लगभग 24% डीजल की बचत होती है।",
            "fuel_saving_tips_mr": "२५५° दिशेने थेट PFZ क्लोरोफिल पट्ट्याकडे ८.५ नॉट्स वेगाने गेल्यास अंदाजे २४% डिझेलची बचत होते.",
            "ice_ratio": "1:1 ratio (1 ton ice per 1 ton pelagic catch)"
        },
        "emergency": {
            "coast_guard_helpline": "1554 (Toll-Free, 24x7 National Maritime Distress)",
            "mrcc_frequency": "VHF Marine Channel 16 (156.800 MHz) & DSC Ch 70",
            "coastal_police": "1093 / 022-22620821 (Yellow Gate Marine Police Station)",
            "mandatory_checklist": [
                "Lifejackets (ISI Approved for all crew members)",
                "VHF Marine Transceiver & NavIC / GPS Receiver",
                "Distress Alert Transmitter (DAT) / AIS Type-B",
                "Orange Smoke Floats and Red Hand Flares",
                "48-hour emergency potable water and first-aid kit"
            ],
            "mandatory_checklist_hi": [
                "सभी चालक दल हेतु ISI प्रमाणित लाइफ जैकेट",
                "VHF मरीन रेडियो व NavIC / GPS रिसीवर",
                "डिस्ट्रेस अलर्ट ट्रांसमीटर (DAT) / AIS",
                "ऑरेंज स्मोक फ्लोट्स व रेड हैंड फ्लेयर्स",
                "48 घंटे का आपातकालीन पेयजल व प्राथमिक चिकित्सा किट"
            ],
            "mandatory_checklist_mr": [
                "सर्व खलाशांसाठी ISI प्रमाणित लाईफ जॅकेट",
                "VHF मरीन ट्रान्सिव्हर व NavIC / GPS यंत्र",
                "आपत्कालीन डिस्ट्रेस अलर्ट ट्रान्समीटर (DAT / AIS)",
                "ऑरेंज स्मोक फ्लोट्स व लाल आणीबाणी फ्लेअर्स",
                "४८ तासांचे पिण्याचे पाणी व प्रथमोपचार पेटी"
            ]
        },
        "bathymetry": {
            "shelf_width_km": 140.0,
            "seabed_type": "Gradual continental shelf with soft alluvial mud and scattered rocky reefs",
            "seabed_type_hi": "मुलायम कीचड़ और बिखरी हुई चट्टानों वाला समोच्च शेल्फ",
            "seabed_type_mr": "गाळाचा मऊ तळभाग व खडकाळ पट्टे असलेला विस्तीर्ण समुद्रतळ",
            "depth_10km": "18 meters",
            "depth_25km": "36 meters",
            "depth_50km": "62 meters",
            "depth_shelf_break": "180 meters at 135 km offshore"
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
            "wind_speed_kmh": 18.1,
            "wind_gusts": 13.0,
            "wind_direction": "NW",
            "precipitation": 10.0,
            "air_temperature": 30.2,
            "barometric_pressure": 1013.2,
            "pressure_trend": "Steady",
            "humidity": 68,
            "visibility_nm": 8.0,
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
            "swell_direction": "WNW (290°)",
            "sea_state": "Calm (Douglas Scale 2)",
            "sea_state_hi": "शांत समुद्र (स्केल 2)",
            "sea_state_mr": "शांत समुद्र (स्केल २)",
            "current_speed": 0.4,
            "current_direction": "SE",
            "underwater_visibility_m": 7.0
        },
        "satellite": {
            "chlorophyll": 5.1,
            "sst_anomaly": 0.6,
            "pfz_status": "High Potential Zone",
            "pfz_status_hi": "उच्च संभावित मत्स्य क्षेत्र (PFZ)",
            "pfz_status_mr": "उच्च संभाव्य मासेमारी क्षेत्र (PFZ)",
            "plankton_density": "High (Rich Dinoflagellate & Copepod concentrations)",
            "sensor_source": "ISRO Oceansat-3 (EOS-06) & MODIS Aqua",
            "thermal_front": "Strong 28.5°C to 27.8°C thermal gradient running parallel 20-40 km offshore"
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
        "species_profiles": {
            "surmai": {
                "name": "Kingfish (Surmai / Isvan)",
                "name_hi": "सुरमई (किंगफिश)",
                "name_mr": "सुरमई / इसवण",
                "scientific": "Scomberomorus commerson",
                "depth": "25 - 55 meters",
                "depth_hi": "25 - 55 मीटर",
                "depth_mr": "२५ - ५५ मीटर",
                "temp_opt": "27.0°C - 28.8°C",
                "gear": "Trolling Lines with Skirted Lures & Heavy Drift Gillnets (140 mm)",
                "gear_hi": "ट्रोलिंग लाइन्स व हेवी ड्रिफ्ट गिलनेट (140 मिमी)",
                "gear_mr": "ट्रोलिंग लाईन्स व मोठे गिलनेट (१४० मिमी)",
                "bait": "Live Indian Mackerel, Sardine slabs, Rapala Magnum silver-blue lure",
                "bait_hi": "जीवित बांगड़ा, सार्डिन टुकड़े, चमकीला ब्लू ल्यूर",
                "bait_mr": "जिवंत बांगडा, ताज्या तारलीचे तुकडे, निळा-चांदी कृत्रिम ल्यूर",
                "market_price": "₹650 - ₹900/kg",
                "market_price_hi": "₹650 - ₹900 प्रति किग्रा",
                "market_price_mr": "₹६५० - ₹९०० प्रति किलो",
                "hotspot": "Reef edges and thermal drop 28 km west of Aguada / Betul"
            },
            "tuna": {
                "name": "Yellowfin Tuna (Kera)",
                "name_hi": "येलोफिन टूना",
                "name_mr": "यलोफिन टुना (केरा)",
                "scientific": "Thunnus albacares",
                "depth": "35 - 80 meters (Deep pelagic drop-offs)",
                "depth_hi": "35 - 80 मीटर (गहरा पेलाजिक क्षेत्र)",
                "depth_mr": "३५ - ८० मीटर (खोल सागरी भाग)",
                "temp_opt": "26.0°C - 28.2°C",
                "gear": "Drifting Pelagic Longlines & Deep Handlines with circle hooks (16/0)",
                "gear_hi": "पेलाजिक लॉन्गलाइन्स व डीप हैंडलाइन्स (सर्कल हुक 16/0)",
                "gear_mr": "पेलाजिक लाँगलाईन्स व खोल हँडलाईन्स (सर्कल गळ १६/०)",
                "bait": "Whole frozen squid, flying fish, chub mackerel",
                "bait_hi": "साबुत स्क्विड, फ्लाइंग फिश, मैकेरल",
                "bait_mr": "संपूर्ण स्क्विड, उडणारा मासा, बांगडा आमिष",
                "market_price": "₹240 - ₹350/kg",
                "market_price_hi": "₹240 - ₹350 प्रति किग्रा",
                "market_price_mr": "₹२४० - ₹३५० प्रति किलो",
                "hotspot": "Shelf-slope thermal convergence 35-50 km offshore"
            },
            "squid": {
                "name": "Squid & Cuttlefish (Mekhe)",
                "name_hi": "स्क्विड / कट्टलफिश",
                "name_mr": "मांदेली / स्क्विड (माकली)",
                "scientific": "Uroteuthis duvaucelii",
                "depth": "20 - 45 meters",
                "depth_hi": "20 - 45 मीटर",
                "depth_mr": "२० - ४५ मीटर",
                "temp_opt": "27.5°C - 29.0°C",
                "gear": "Light Jigging with luminous squid jigs & Light Trawling",
                "gear_hi": "ल्यूमिनस स्क्विड जिग्स व लाइट ट्रॉलिंग",
                "gear_mr": "प्रकाशाधारित स्क्विड जिगिंग व हलके ट्रॉलिंग",
                "bait": "Luminescent LED jigs and reflective squid jigs",
                "bait_hi": "चमकीले एलईडी जिग्स",
                "bait_mr": "रात्रीचे रेडियम/एलईडी चमकदार जिग्स",
                "market_price": "₹300 - ₹450/kg",
                "market_price_hi": "₹300 - ₹450 प्रति किग्रा",
                "market_price_mr": "₹३०० - ₹४५० प्रति किलो",
                "hotspot": "Sandy-rocky transitions 15-28 km off Mormugao"
            }
        },
        "tide": {
            "high_tide_1": "06:15 AM (1.8m)",
            "low_tide_1": "12:20 PM (0.3m)",
            "high_tide_2": "18:40 PM (1.6m)",
            "low_tide_2": "00:45 AM (0.2m)",
            "tidal_range_m": 1.5,
            "cycle": "Moderate Tide Cycle (Favorable Drift)",
            "cycle_hi": "मध्यम ज्वार (अनुकूल प्रवाह)",
            "cycle_mr": "मध्यम भरती (अनुकूल प्रवाह)",
            "slack_window": "11:50 AM - 12:45 PM (Low Slack) & 05:45 AM - 06:40 AM (High Slack)",
            "slack_window_hi": "11:50 AM से 12:45 PM और 05:45 AM से 06:40 AM",
            "slack_window_mr": "सकाळी ११:५० ते दुपारी १२:४५ व पहाटे ०५:४५ ते ०६:४०",
            "sandbar_clearance_m": 3.2
        },
        "gis": {
            "distance_to_imbl": 380.0,
            "imbl_status": "Completely Safe (380 km from IMBL)",
            "imbl_status_hi": "पूर्णतः सुरक्षित (IMBL से 380 किमी दूर)",
            "imbl_status_mr": "पूर्ण सुरक्षित (IMBL पासून ३८० किमी दूर)",
            "restricted_zones": [
                {
                    "name": "Mormugao Port Limit",
                    "name_hi": "मोरमुगाओ बंदरगाह सीमा",
                    "name_mr": "मोरमुगाओ बंदर मर्यादा",
                    "distance_km": 11.5,
                    "status": "Permitted Navigation Corridor",
                    "status_hi": "अनुमत नौवहन गलियारा",
                    "status_mr": "परवानगी असलेला जलमार्ग"
                }
            ]
        },
        "economics": {
            "dockside_prices": {
                "Surmai (सुरमई)": "₹650 - ₹900/kg",
                "Yellowfin Tuna (टुना)": "₹240 - ₹350/kg",
                "Squid (माकली)": "₹300 - ₹450/kg",
                "Mackerel (बांगडा)": "₹150 - ₹230/kg",
                "Pomfret (पापलेट)": "₹700 - ₹920/kg"
            },
            "fuel_saving_tips": "Following direct bearing 270° towards 5.1 mg/m³ PFZ zone at 8.0 knots yields up to 26% fuel efficiency.",
            "fuel_saving_tips_hi": "270° दिशा में 8.0 समुद्री मील की गति से PFZ की ओर जाने पर लगभग 26% ईंधन की बचत होती है।",
            "fuel_saving_tips_mr": "२७०° दिशेने ८.० नॉट्स वेगाने गेल्यास सुमारे २६% इंधनाची बचत होते.",
            "ice_ratio": "1:1 ratio with crushed ice slurry"
        },
        "emergency": {
            "coast_guard_helpline": "1554 (Toll-Free, 24x7 ICG Goa District HQ)",
            "mrcc_frequency": "VHF Marine Channel 16 (156.800 MHz)",
            "coastal_police": "1093 / 0832-2520333 (Goa Marine Police)",
            "mandatory_checklist": [
                "Lifejackets with distress whistles for all crew",
                "VHF Marine radio operational on Ch 16 & 68",
                "NavIC GPS navigator with charted waypoints",
                "Emergency flares and waterproof strobe light",
                "Fresh drinking water (minimum 5 liters per person/day)"
            ],
            "mandatory_checklist_hi": [
                "सीटी युक्त लाइफ जैकेट सभी सदस्यों हेतु",
                "VHF मरीन रेडियो (चैनल 16 व 68)",
                "NavIC GPS नेविगेटर",
                "इमरजेंसी फ्लेयर्स व स्ट्रोब लाइट",
                "प्रति व्यक्ति न्यूनतम 5 लीटर पीने का पानी"
            ],
            "mandatory_checklist_mr": [
                "सर्व खलाशांसाठी शिट्टीसह लाईफ जॅकेट",
                "VHF मरीन रेडिओ (चॅनेल १६ व ६८)",
                "NavIC GPS नेव्हिगेटर",
                "आणीबाणी फ्लेअर्स व वॉटरप्रूफ स्ट्रोब लाईट",
                "पिण्याचे स्वच्छ पाणी (दर व्यक्ती किमान ५ लिटर)"
            ]
        },
        "bathymetry": {
            "shelf_width_km": 110.0,
            "seabed_type": "Clean sandy bottom with lateral rocky reef ridges at 30-50m depth",
            "seabed_type_hi": "साफ रेतीला तल और 30-50 मीटर पर चट्टानी कटकें",
            "seabed_type_mr": "स्वच्छ वाळूचा तळभाग व ३०-५० मीटरवर खडकाळ पट्टे",
            "depth_10km": "22 meters",
            "depth_25km": "44 meters",
            "depth_50km": "78 meters",
            "depth_shelf_break": "200 meters at 105 km offshore"
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
            "wind_speed_kmh": 51.8,
            "wind_gusts": 38.0,
            "wind_direction": "W",
            "precipitation": 85.0,
            "air_temperature": 25.0,
            "barometric_pressure": 998.2,
            "pressure_trend": "Rapidly Falling",
            "humidity": 94,
            "visibility_nm": 2.0,
            "condition": "Severe Thunderstorm",
            "condition_hi": "भीषण आंधी-तूफान",
            "condition_mr": "तीव्र वादळी पाऊस",
            "warnings": ["Gale warning in effect", "Heavy squall alerts", "IMD Red Warning"],
            "warnings_hi": ["तेज समुद्री तूफान की चेतावनी जारी", "भारी बारिश व आंधी अलर्ट", "IMD रेड अलर्ट"],
            "warnings_mr": ["वेगवान वादळी वाऱ्यांचा इशारा जारी", "मुसळधार पाऊस व वादळ अलर्ट", "IMD रेड वॉर्निंग"]
        },
        "ocean": {
            "wave_height": 3.8,
            "sst": 26.5,
            "swell_period": 12.0,
            "swell_direction": "WSW (240°)",
            "sea_state": "Rough to Very Rough (Douglas Scale 6)",
            "sea_state_hi": "अत्यंत अशांत समुद्र (स्केल 6)",
            "sea_state_mr": "अत्यंत खवळलेला समुद्र (स्केल ६)",
            "current_speed": 1.8,
            "current_direction": "SSE",
            "underwater_visibility_m": 1.5
        },
        "satellite": {
            "chlorophyll": 1.2,
            "sst_anomaly": -1.2,
            "pfz_status": "Low Potential Zone",
            "pfz_status_hi": "कम संभावना वाला क्षेत्र",
            "pfz_status_mr": "कमी संभाव्यता क्षेत्र",
            "plankton_density": "Low (Heavy upwelling cloud cover)",
            "sensor_source": "ISRO Oceansat-3 & INSAT-3DR Rapid Scan",
            "thermal_front": "Disrupted by monsoonal cyclonic wind shear"
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
            "cmfri_status": "High Inshore Coastal Shoaling (Suspended during gale)"
        },
        "species_profiles": {
            "sardines": {
                "name": "Indian Oil Sardine (Mathi)",
                "name_hi": "तारली (सार्डिन)",
                "name_mr": "तारली (सार्डिन)",
                "scientific": "Sardinella longiceps",
                "depth": "10 - 28 meters",
                "depth_hi": "10 - 28 मीटर",
                "depth_mr": "१० - २८ मीटर",
                "temp_opt": "26.0°C - 28.0°C",
                "gear": "Ring Seine Nets (Mesh 18-24 mm)",
                "gear_hi": "रिंग सीन जाल (मेश 18-24 मिमी)",
                "gear_mr": "रिंग सीन जाळे (मेश १८-२४ मिमी)",
                "bait": "Natural shoaling entrapment",
                "bait_hi": "प्राकृतिक झुंड विधि",
                "bait_mr": "नैसर्गिक थवे फंसाव",
                "market_price": "₹70 - ₹120/kg",
                "market_price_hi": "₹70 - ₹120 प्रति किग्रा",
                "market_price_mr": "₹७० - ₹१२० प्रति किलो",
                "hotspot": "Mud bank (Chakara) formation areas off Munambam"
            },
            "prawns": {
                "name": "Karikkadi Prawns",
                "name_hi": "करिक्काडी झींगा",
                "name_mr": "करिक्काडी कोळंबी",
                "scientific": "Parapenaeopsis stylifera",
                "depth": "15 - 35 meters",
                "depth_hi": "15 - 35 मीटर",
                "depth_mr": "१५ - ३५ मीटर",
                "temp_opt": "25.0°C - 27.5°C",
                "gear": "Shrimp Trawls with TED",
                "gear_hi": "झींगा ट्रॉल जाल",
                "gear_mr": "कोळंबी ट्रॉल जाळे",
                "bait": "Bottom trawling",
                "bait_hi": "बॉटम ट्रॉलिंग",
                "bait_mr": "तळाचे ट्रॉलिंग",
                "market_price": "₹260 - ₹390/kg",
                "market_price_hi": "₹260 - ₹390 प्रति किग्रा",
                "market_price_mr": "₹२६० - ₹३९० प्रति किलो",
                "hotspot": "Inshore mud flats 8-16 km off Fort Kochi"
            }
        },
        "tide": {
            "high_tide_1": "04:12 AM (1.4m)",
            "low_tide_1": "10:30 AM (0.4m)",
            "high_tide_2": "16:45 PM (1.3m)",
            "low_tide_2": "22:50 PM (0.3m)",
            "tidal_range_m": 1.0,
            "cycle": "Rough Storm Surge Influenced",
            "cycle_hi": "तूफानी ज्वार प्रभाव",
            "cycle_mr": "वादळी लाटांचा तीव्र प्रभाव",
            "slack_window": "Hazardous - Strong storm surges overpower tidal slack",
            "slack_window_hi": "खतरनाक - तेज तूफान के कारण नौकायन वर्जित",
            "slack_window_mr": "धोकादायक - तीव्र वादळामुळे बोटी समुद्रात नेणे वर्जित",
            "sandbar_clearance_m": 1.8
        },
        "gis": {
            "distance_to_imbl": 280.0,
            "imbl_status": "Safe distance, but severe localized hazard",
            "imbl_status_hi": "सीमा से सुरक्षित, किन्तु स्थानीय खतरा भीषण",
            "imbl_status_mr": "सीमेपासून सुरक्षित, परंतु स्थानिक धोका अत्यंत तीव्र",
            "restricted_zones": [
                {
                    "name": "Kochi Port Channel Area",
                    "name_hi": "कोच्चि बंदरगाह चैनल क्षेत्र",
                    "name_mr": "कोची बंदर जलमार्ग क्षेत्र",
                    "distance_km": 1.2,
                    "status": "High Alert Caution",
                    "status_hi": "उच्च सतर्कता चेतावनी",
                    "status_mr": "अतिदक्षतेचा इशारा"
                }
            ]
        },
        "economics": {
            "dockside_prices": {
                "Sardines (तारली)": "₹70 - ₹120/kg",
                "Karikkadi Prawns (कोळंबी)": "₹260 - ₹390/kg",
                "Anchovy (नेतळी)": "₹110 - ₹170/kg",
                "Threadfin Bream (राणी मासा)": "₹180 - ₹260/kg"
            },
            "fuel_saving_tips": "Sailing not recommended due to high wave resistance and severe safety danger.",
            "fuel_saving_tips_hi": "तूफान के कारण समुद्र में जाना पूर्णतः वर्जित है।",
            "fuel_saving_tips_mr": "वादळी हवामानामुळे समुद्रात जाणे पूर्णपणे टाळावे.",
            "ice_ratio": "Standard 1:1"
        },
        "emergency": {
            "coast_guard_helpline": "1554 (Toll-Free, MRCC Kochi 0484-2218804)",
            "mrcc_frequency": "VHF Marine Channel 16 (156.800 MHz) & Ch 70 DSC",
            "coastal_police": "1093 / 0484-2215440 (Fort Kochi Coastal Police Station)",
            "mandatory_checklist": [
                "IMMEDIATE ADVISORY: Do not venture into sea",
                "Return to nearest harbor (Cochin Fisheries Harbour / Munambam)",
                "Secure all moored vessels and double mooring lines",
                "Keep VHF Channel 16 active for emergency broadcasts"
            ],
            "mandatory_checklist_hi": [
                "तत्काल सलाह: समुद्र में बिल्कुल न जाएं",
                "निकटतम बंदरगाह पर तुरंत वापस लौटें",
                "नावों को मजबूत रस्सियों से बांधकर सुरक्षित करें",
                "आपातकालीन अलर्ट हेतु VHF चैनल 16 चालू रखें"
            ],
            "mandatory_checklist_mr": [
                "तातडीचा इशारा: समुद्रात अजिबात जाऊ नये",
                "जवळच्या बंदराकडे त्वरित परत फिरावे",
                "सर्व बोटींना भक्कम दोरांनी बांधून सुरक्षित ठेवावे",
                "आणीबाणी अलर्टसाठी VHF चॅनेल १६ सुरू ठेवावे"
            ]
        },
        "bathymetry": {
            "shelf_width_km": 65.0,
            "seabed_type": "Steep inshore slope with soft alluvial mud bank shoals",
            "seabed_type_hi": "ढलानयुक्त शेल्फ और कीचड़दार मड बैंक",
            "seabed_type_mr": "उतार असलेला समुद्रतळ व गाळाचे मड बँक्स",
            "depth_10km": "24 meters",
            "depth_25km": "50 meters",
            "depth_50km": "110 meters",
            "depth_shelf_break": "200 meters at 62 km offshore"
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
            "wind_speed_kmh": 33.3,
            "wind_gusts": 24.0,
            "wind_direction": "NW",
            "precipitation": 40.0,
            "air_temperature": 27.8,
            "barometric_pressure": 1008.5,
            "pressure_trend": "Slightly Falling",
            "humidity": 80,
            "visibility_nm": 5.0,
            "condition": "Overcast",
            "condition_hi": "घने बादल",
            "condition_mr": "ढगाळ वातावरण",
            "warnings": ["Moderate swell advisory", "IMBL proximity alert"],
            "warnings_hi": ["मध्यम ऊंची लहरों की सलाह", "अंतर्राष्ट्रीय सीमा निकटता अलर्ट"],
            "warnings_mr": ["मध्यम लाटांचा इशारा", "आंतरराष्ट्रीय सागरी सीमा दक्षता इशारा"]
        },
        "ocean": {
            "wave_height": 2.2,
            "sst": 27.0,
            "swell_period": 9.5,
            "swell_direction": "WNW (285°)",
            "sea_state": "Moderate (Douglas Scale 4)",
            "sea_state_hi": "मध्यम अशांत (स्केल 4)",
            "sea_state_mr": "मध्यम खवळलेला (स्केल ४)",
            "current_speed": 0.9,
            "current_direction": "SE",
            "underwater_visibility_m": 3.8
        },
        "satellite": {
            "chlorophyll": 6.2,
            "sst_anomaly": 0.8,
            "pfz_status": "High Potential Zone",
            "pfz_status_hi": "उच्च संभावित मत्स्य क्षेत्र (PFZ)",
            "pfz_status_mr": "उच्च संभाव्य मासेमारी क्षेत्र (PFZ)",
            "plankton_density": "Very High (Massive Copepod & Microzooplankton bloom)",
            "sensor_source": "ISRO Oceansat-3 (EOS-06) & VIIRS SNPP",
            "thermal_front": "Strong 27.0°C to 26.2°C thermal edge 25-45 km offshore"
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
        "species_profiles": {
            "ghol": {
                "name": "Blackspotted Croaker (Ghol / 'Sea Gold')",
                "name_hi": "घोल मछली ('समुद्री सोना')",
                "name_mr": "घोल मासा ('समुद्रातील सोने')",
                "scientific": "Protonibea diacanthus",
                "depth": "35 - 75 meters (Rocky deep contours)",
                "depth_hi": "35 - 75 मीटर (चट्टानी गहराई)",
                "depth_mr": "३५ - ७५ मीटर (खोल खडकाळ समुद्रतळ)",
                "temp_opt": "25.5°C - 27.5°C",
                "gear": "Heavy Bottom Longlines with 14/0 hooks & Bottom Set Gillnets (180 mm)",
                "gear_hi": "हेवी बॉटम लॉन्गलाइन्स व बॉटम सेट गिलनेट (180 मिमी)",
                "gear_mr": "मोठ्या आकाराचे बॉटम लाँगलाईन्स व गिलनेट्स (१८० मिमी)",
                "bait": "Squid, cuttlefish, whole mud crabs, live croakers",
                "bait_hi": "स्क्विड, कट्टलफिश, केकड़ा चारा",
                "bait_mr": "स्क्विड, माकली, चिंबोरी/खेकडा आमिष",
                "market_price": "₹1,200 - ₹3,500/kg (High value due to swim bladder / maws)",
                "market_price_hi": "₹1,200 - ₹3,500 प्रति किग्रा (स्विम ब्लैडर के कारण अत्यधिक मूल्यवान)",
                "market_price_mr": "₹१,२०० - ₹३,५०० प्रति किलो (एअर ब्लॅडरमुळे अत्यंत महागडा)",
                "hotspot": "Saurashtra shelf reefs 35-48 km South-Southwest of Veraval"
            },
            "tuna": {
                "name": "Yellowfin Tuna",
                "name_hi": "येलोफिन टूना",
                "name_mr": "यलोफिन टुना",
                "scientific": "Thunnus albacares",
                "depth": "40 - 85 meters",
                "depth_hi": "40 - 85 मीटर",
                "depth_mr": "४० - ८५ मीटर",
                "temp_opt": "26.0°C - 27.5°C",
                "gear": "Pelagic Longlines & Drift Gillnets (150 mm)",
                "gear_hi": "पेलाजिक लॉन्गलाइन्स व ड्रिफ्ट गिलनेट",
                "gear_mr": "लाँगलाईन्स व ड्रिफ्ट गिलनेट",
                "bait": "Whole squid and frozen sardines",
                "bait_hi": "स्क्विड व सार्डिन",
                "bait_mr": "स्क्विड व तारली मासे",
                "market_price": "₹220 - ₹320/kg",
                "market_price_hi": "₹220 - ₹320 प्रति किग्रा",
                "market_price_mr": "₹२२० - ₹३२० प्रति किलो",
                "hotspot": "Thermal front 32-55 km offshore"
            },
            "ribbonfish": {
                "name": "Ribbonfish / Hairtail",
                "name_hi": "रिबनफिश (फीता मछली)",
                "name_mr": "वाकटी (रिबनफिश)",
                "scientific": "Trichiurus lepturus",
                "depth": "25 - 65 meters",
                "depth_hi": "25 - 65 मीटर",
                "depth_mr": "२५ - ६५ मीटर",
                "temp_opt": "26.5°C - 28.0°C",
                "gear": "High Opening Bottom Trawls & Driftnets",
                "gear_hi": "हाई ओपनिंग ट्रॉल जाल",
                "gear_mr": "हाय ओपनिंग ट्रॉल जाळे",
                "bait": "Luminous flashing lures and small fish scraps",
                "bait_hi": "चमकदार ल्यूर",
                "bait_mr": "चमकदार आमिष व लहान मासे",
                "market_price": "₹160 - ₹250/kg",
                "market_price_hi": "₹160 - ₹250 प्रति किग्रा",
                "market_price_mr": "₹१६० - ₹२५० प्रति किलो",
                "hotspot": "Muddy shelf depressions 20-38 km offshore"
            }
        },
        "tide": {
            "high_tide_1": "07:10 AM (2.8m)",
            "low_tide_1": "13:20 PM (0.8m)",
            "high_tide_2": "19:35 PM (2.6m)",
            "low_tide_2": "01:40 AM (0.6m)",
            "tidal_range_m": 2.0,
            "cycle": "Strong Tidal Streams off Saurashtra",
            "cycle_hi": "सौराष्ट्र तट पर तीव्र ज्वारीय धाराएं",
            "cycle_mr": "सौराष्ट्र किनारपट्टीवरील वेगवान भरती प्रवाह",
            "slack_window": "12:50 PM - 01:45 PM (Low Slack) & 06:40 AM - 07:35 AM (High Slack)",
            "slack_window_hi": "12:50 PM से 01:45 PM और 06:40 AM से 07:35 AM",
            "slack_window_mr": "दुपारी १२:५० ते ०१:४५ व सकाळी ०६:४० ते ०७:३५",
            "sandbar_clearance_m": 2.4
        },
        "gis": {
            "distance_to_imbl": 78.0,
            "imbl_status": "CRITICAL ALERT: 78 km to Pakistan IMBL limit. Keep NavIC GPS boundary alarms active at all times!",
            "imbl_status_hi": "अति संवेदनशील चेतावनी: अंतर्राष्ट्रीय समुद्री सीमा (IMBL) केवल 78 किमी दूर है। NavIC सीमा अलार्म हमेशा चालू रखें!",
            "imbl_status_mr": "अतिसंवेदनशील इशारा: आंतरराष्ट्रीय सागरी सीमा (IMBL) केवळ ७८ किमी अंतरावर आहे. NavIC जीपीएस अलार्म सतत सुरू ठेवा!",
            "restricted_zones": [
                {
                    "name": "International Maritime Boundary Line (IMBL)",
                    "name_hi": "अंतर्राष्ट्रीय समुद्री सीमा रेखा (IMBL)",
                    "name_mr": "आंतरराष्ट्रीय सागरी सीमा रेषा (IMBL)",
                    "distance_km": 78.0,
                    "status": "High Alert Proximity Buffer",
                    "status_hi": "उच्च सतर्कता बफर जोन",
                    "status_mr": "अतिदक्षता सीमा क्षेत्र"
                }
            ]
        },
        "economics": {
            "dockside_prices": {
                "Ghol (घोल मासा)": "₹1,200 - ₹3,500/kg",
                "Pomfret (पापलेट)": "₹700 - ₹900/kg",
                "Yellowfin Tuna (टुना)": "₹220 - ₹320/kg",
                "Ribbonfish (वाकटी)": "₹160 - ₹250/kg",
                "Lobster (शेवंड)": "₹1,100 - ₹1,800/kg"
            },
            "fuel_saving_tips": "Maintaining 8.2 knots along the 6.2 mg/m³ plankton contour saves ~22% diesel on extended multi-day Saurashtra voyages.",
            "fuel_saving_tips_hi": "6.2 मि.ग्रा. प्लवक समोच्च के साथ 8.2 समुद्री मील की गति से यात्रा करने पर लगभग 22% डीजल की बचत होती है।",
            "fuel_saving_tips_mr": "६.२ mg/m³ प्लवक पट्ट्यात ८.२ नॉट्स वेगाने गेल्यास सुमारे २२% डिझेलची बचत होते.",
            "ice_ratio": "1.2:1 ice to fish ratio for multi-day trips"
        },
        "emergency": {
            "coast_guard_helpline": "1554 (Toll-Free, ICG Station Veraval / Porbandar)",
            "mrcc_frequency": "VHF Marine Channel 16 (156.800 MHz) & DSC Ch 70",
            "coastal_police": "1093 / 02876-220033 (Veraval Marine Police)",
            "mandatory_checklist": [
                "NavIC / GPS Boundary Alarm strictly enabled (Alarm set at 30km before IMBL)",
                "AIS Transponder Class-B powered ON continuously",
                "Lifejackets, VHF Radio, and Emergency Epirb / DAT beacon",
                "Indian Identity Cards (Biometric Fishermen Card) for all crew"
            ],
            "mandatory_checklist_hi": [
                "NavIC / GPS सीमा अलार्म अनिवार्य रूप से सक्रिय (IMBL से 30 किमी पहले अलर्ट)",
                "AIS ट्रांसपोंडर 24x7 चालू रखें",
                "लाइफ जैकेट, VHF मरीन रेडियो व DAT बीकन",
                "सभी सदस्यों हेतु बायोमेट्रिक मछुआरा पहचान पत्र"
            ],
            "mandatory_checklist_mr": [
                "NavIC / GPS सीमा अलार्म सक्तीने सुरू (IMBL च्या ३० किमी आधी अलर्ट)",
                "AIS ट्रान्सपॉन्डर सतत चालू ठेवणे बंधनकारक",
                "लाईफ जॅकेट, VHF मरीन रेडिओ व DAT बीकन",
                "सर्व खलाशांचे बायोमेट्रिक मच्छीमार ओळखपत्र"
            ]
        },
        "bathymetry": {
            "shelf_width_km": 160.0,
            "seabed_type": "Broad shelf with rich organic silt, rocky banks, and deep shelf trenches",
            "seabed_type_hi": "विशाल शेल्फ, जैविक गाद और गहरी समुद्री खाइयाँ",
            "seabed_type_mr": "विस्तीर्ण शेल्फ, सुपीक गाळाचा तळभाग व खोल सागरी घळया",
            "depth_10km": "20 meters",
            "depth_25km": "38 meters",
            "depth_50km": "68 meters",
            "depth_shelf_break": "200 meters at 155 km offshore"
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
            "wind_speed_kmh": 17.6,
            "wind_gusts": 12.0,
            "wind_direction": "SE",
            "precipitation": 5.0,
            "air_temperature": 31.0,
            "barometric_pressure": 1011.8,
            "pressure_trend": "Steady",
            "humidity": 72,
            "visibility_nm": 8.5,
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
            "swell_direction": "ESE (115°)",
            "sea_state": "Calm (Douglas Scale 2)",
            "sea_state_hi": "शांत समुद्र (स्केल 2)",
            "sea_state_mr": "शांत समुद्र (स्केल २)",
            "current_speed": 0.4,
            "current_direction": "NNE",
            "underwater_visibility_m": 6.5
        },
        "satellite": {
            "chlorophyll": 3.1,
            "sst_anomaly": 0.2,
            "pfz_status": "Medium Potential Zone",
            "pfz_status_hi": "मध्यम संभावित मत्स्य क्षेत्र",
            "pfz_status_mr": "मध्यम संभाव्य मासेमारी क्षेत्र",
            "plankton_density": "Moderate (Pelagic food web active)",
            "sensor_source": "ISRO Oceansat-3 (EOS-06) & MODIS Terra",
            "thermal_front": "Stable Coromandel thermal front 15-30 km offshore"
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
        "species_profiles": {
            "tiger_prawns": {
                "name": "Giant Tiger Prawn (Vaghya Kolambi)",
                "name_hi": "टाइगर झींगा (प्रॉन्स)",
                "name_mr": "वाघ्या कोळंबी (टायगर प्रॉन्स)",
                "scientific": "Penaeus monodon",
                "depth": "15 - 45 meters",
                "depth_hi": "15 - 45 मीटर",
                "depth_mr": "१५ - ४५ मीटर",
                "temp_opt": "27.5°C - 29.5°C",
                "gear": "Bottom Trawl Nets (Mesh 28-32 mm codend) & Trammel Nets",
                "gear_hi": "बॉटम ट्रॉल व ट्रैमेल नेट",
                "gear_mr": "बॉटम ट्रॉल व ट्रॅमेल जाळे",
                "bait": "Bottom disturbance trawl rig",
                "bait_hi": "बॉटम ट्रॉलिंग",
                "bait_mr": "तळाचे ट्रॉलिंग",
                "market_price": "₹550 - ₹800/kg (Export Grade)",
                "market_price_hi": "₹550 - ₹800 प्रति किग्रा (निर्यात ग्रेड)",
                "market_price_mr": "₹५५० - ₹८०० प्रति किलो (निर्यात दर्जा)",
                "hotspot": "Mud flats off Ennore and Pulicat Lake mouth"
            },
            "squid": {
                "name": "Indian Squid & Cuttlefish",
                "name_hi": "स्क्विड व कट्टलफिश",
                "name_mr": "मांदेली / स्क्विड",
                "scientific": "Uroteuthis duvaucelii",
                "depth": "22 - 50 meters",
                "depth_hi": "22 - 50 मीटर",
                "depth_mr": "२२ - ५० मीटर",
                "temp_opt": "28.0°C - 29.8°C",
                "gear": "Hand Jigging with LED lights & Cephalopod Trawls",
                "gear_hi": "एलईडी जिगिंग व ट्रॉल",
                "gear_mr": "एलईडी जिगिंग व ट्रॉल",
                "bait": "Fluorescent jigs",
                "bait_hi": "चमकीले जिग्स",
                "bait_mr": "चमकदार जिग्स",
                "market_price": "₹320 - ₹480/kg",
                "market_price_hi": "₹320 - ₹480 प्रति किग्रा",
                "market_price_mr": "₹३२० - ₹४८० प्रति किलो",
                "hotspot": "20 km offshore along Coromandel shelf edge"
            }
        },
        "tide": {
            "high_tide_1": "06:30 AM (1.2m)",
            "low_tide_1": "12:45 PM (0.2m)",
            "high_tide_2": "18:50 PM (1.1m)",
            "low_tide_2": "00:55 AM (0.1m)",
            "tidal_range_m": 1.0,
            "cycle": "Micro-Tidal Stable Sea",
            "cycle_hi": "माइक्रो-टाइडल स्थिर समुद्र",
            "cycle_mr": "स्थिर व शांत भरती-ओहोटी",
            "slack_window": "12:15 PM - 01:15 PM (Low Slack) & 06:00 AM - 07:00 AM (High Slack)",
            "slack_window_hi": "12:15 PM से 01:15 PM और 06:00 AM से 07:00 AM",
            "slack_window_mr": "दुपारी १२:१५ ते ०१:१५ व सकाळी ०६:०० ते ०७:००",
            "sandbar_clearance_m": 2.8
        },
        "gis": {
            "distance_to_imbl": 210.0,
            "imbl_status": "Clear distance from international boundary",
            "imbl_status_hi": "अंतर्राष्ट्रीय सीमा से सुरक्षित दूरी",
            "imbl_status_mr": "आंतरराष्ट्रीय सीमेपासून सुरक्षित अंतर",
            "restricted_zones": [
                {
                    "name": "Ennore Port Limit",
                    "name_hi": "एन्नोर बंदरगाह सीमा",
                    "name_mr": "एन्नोर बंदर मर्यादा",
                    "distance_km": 12.0,
                    "status": "Permitted Navigation Corridor",
                    "status_hi": "अनुमत गलियारा",
                    "status_mr": "परवानगी असलेला जलमार्ग"
                }
            ]
        },
        "economics": {
            "dockside_prices": {
                "Tiger Prawns (वाघ्या कोळंबी)": "₹550 - ₹800/kg",
                "Squid (स्क्विड)": "₹320 - ₹480/kg",
                "Ribbonfish (वाकटी)": "₹150 - ₹230/kg",
                "Sardines (तारली)": "₹90 - ₹150/kg",
                "Pomfret (पापलेट)": "₹680 - ₹880/kg"
            },
            "fuel_saving_tips": "Sailing at 8.0 knots directly along the 3.1 mg/m³ chlorophyll band reduces diesel consumption by ~20%.",
            "fuel_saving_tips_hi": "3.1 मि.ग्रा. क्लोरोफिल बैंड के साथ 8.0 समुद्री मील पर चलने से लगभग 20% ईंधन बचता है।",
            "fuel_saving_tips_mr": "३.१ mg/m³ क्लोरोफिल पट्ट्यात ८.० नॉट्स वेगाने गेल्यास अंदाजे २०% इंधन वाचते.",
            "ice_ratio": "1:1 ratio"
        },
        "emergency": {
            "coast_guard_helpline": "1554 (Toll-Free, MRCC Chennai 044-23460405)",
            "mrcc_frequency": "VHF Marine Channel 16 (156.800 MHz) & DSC Ch 70",
            "coastal_police": "1093 / 044-25912444 (Chennai Coastal Police)",
            "mandatory_checklist": [
                "Lifejackets for all crew members on board",
                "VHF Marine radio operational on Channel 16",
                "NavIC / GPS receiver and distress flare set",
                "Adequate fresh water and first-aid supplies"
            ],
            "mandatory_checklist_hi": [
                "नाव पर सभी हेतु लाइफ जैकेट",
                "VHF मरीन रेडियो (चैनल 16)",
                "NavIC / GPS रिसीवर व डिस्ट्रेस फ्लेयर्स",
                "पर्याप्त पेयजल व फर्स्ट-एड किट"
            ],
            "mandatory_checklist_mr": [
                "बोटीवरील सर्व खलाशांसाठी लाईफ जॅकेट",
                "VHF मरीन रेडिओ (चॅनेल १६)",
                "NavIC / GPS यंत्र व आपत्कालीन फ्लेअर्स",
                "पुरेसे पिण्याचे पाणी व प्रथमोपचार साहित्य"
            ]
        },
        "bathymetry": {
            "shelf_width_km": 45.0,
            "seabed_type": "Narrow continental shelf dropping steeply into the Coromandel basin",
            "seabed_type_hi": "संकीर्ण शेल्फ जो तेजी से गहरे बेसिन में उतरता है",
            "seabed_type_mr": "अरुंद समुद्रतळ जो वेगाने खोल समुद्रात उतरतो",
            "depth_10km": "26 meters",
            "depth_25km": "58 meters",
            "depth_50km": "130 meters",
            "depth_shelf_break": "200 meters at 45 km offshore"
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
            "wind_speed_kmh": 25.9,
            "wind_gusts": 18.0,
            "wind_direction": "ENE",
            "precipitation": 20.0,
            "air_temperature": 30.2,
            "barometric_pressure": 1010.4,
            "pressure_trend": "Steady",
            "humidity": 76,
            "visibility_nm": 6.0,
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
            "swell_direction": "ENE (070°)",
            "sea_state": "Slightly Rough (Douglas Scale 3)",
            "sea_state_hi": "हल्का अशांत (स्केल 3)",
            "sea_state_mr": "किंचित खवळलेला (स्केल ३)",
            "current_speed": 0.7,
            "current_direction": "SW",
            "underwater_visibility_m": 5.0
        },
        "satellite": {
            "chlorophyll": 5.5,
            "sst_anomaly": 0.5,
            "pfz_status": "High Potential Zone",
            "pfz_status_hi": "उच्च संभावित मत्स्य क्षेत्र (PFZ)",
            "pfz_status_mr": "उच्च संभाव्य मासेमारी क्षेत्र (PFZ)",
            "plankton_density": "High (Rich Oceanic Front aggregation)",
            "sensor_source": "ISRO Oceansat-3 (EOS-06) & MODIS Aqua",
            "thermal_front": "Strong 28.8°C to 27.9°C thermal boundary 20-38 km offshore"
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
        "species_profiles": {
            "tuna": {
                "name": "Skipjack & Yellowfin Tuna",
                "name_hi": "स्किपजैक व येलोफिन टूना",
                "name_mr": "स्किपजॅक व यलोफिन टुना",
                "scientific": "Katsuwonus pelamis",
                "depth": "30 - 75 meters",
                "depth_hi": "30 - 75 मीटर",
                "depth_mr": "३० - ७५ मीटर",
                "temp_opt": "27.0°C - 28.8°C",
                "gear": "Purse Seine & Deep Handlines with Japanese circle hooks",
                "gear_hi": "पर्स सीन व डीप हैंडलाइन्स",
                "gear_mr": "पर्स सीन व खोल हँडलाईन्स",
                "bait": "Live Anchovy chumming and silver squid jigs",
                "bait_hi": "जीवित एंकोवी चारा व स्क्विड जिग्स",
                "bait_mr": "जिवंत नेतळी मासे व स्क्विड जिग्स",
                "market_price": "₹260 - ₹380/kg",
                "market_price_hi": "₹260 - ₹380 प्रति किग्रा",
                "market_price_mr": "₹२६० - ₹३८० प्रति किलो",
                "hotspot": "Oceanic trench margins 25-42 km East-Southeast of Vizag port"
            },
            "prawns": {
                "name": "Tiger Prawns (Black Tiger)",
                "name_hi": "टाइगर झींगा",
                "name_mr": "वाघ्या कोळंबी",
                "scientific": "Penaeus monodon",
                "depth": "18 - 40 meters",
                "depth_hi": "18 - 40 मीटर",
                "depth_mr": "१८ - ४० मीटर",
                "temp_opt": "26.5°C - 28.5°C",
                "gear": "Shrimp Bottom Trawls with TED",
                "gear_hi": "झींगा बॉटम ट्रॉल",
                "gear_mr": "कोळंबी बॉटम ट्रॉल",
                "bait": "Bottom trawling",
                "bait_hi": "बॉटम ट्रॉलिंग",
                "bait_mr": "तळाचे ट्रॉलिंग",
                "market_price": "₹500 - ₹750/kg",
                "market_price_hi": "₹500 - ₹750 प्रति किग्रा",
                "market_price_mr": "₹५०० - ₹७५० प्रति किलो",
                "hotspot": "Alluvial flats off Bheemunipatnam and Dolphin's Nose"
            }
        },
        "tide": {
            "high_tide_1": "05:15 AM (1.6m)",
            "low_tide_1": "11:30 AM (0.3m)",
            "high_tide_2": "17:35 PM (1.5m)",
            "low_tide_2": "23:40 PM (0.2m)",
            "tidal_range_m": 1.3,
            "cycle": "Semi-Diurnal Moderate Tides",
            "cycle_hi": "सेमी-डायरनल मध्यम ज्वार",
            "cycle_mr": "मध्यम भरती प्रवाह",
            "slack_window": "11:00 AM - 12:00 PM (Low Slack) & 04:45 AM - 05:45 AM (High Slack)",
            "slack_window_hi": "11:00 AM से 12:00 PM और 04:45 AM से 05:45 AM",
            "slack_window_mr": "सकाळी ११:०० ते दुपारी १२:०० व पहाटे ०४:४५ ते ०५:४५",
            "sandbar_clearance_m": 3.0
        },
        "gis": {
            "distance_to_imbl": 450.0,
            "imbl_status": "Completely Safe from international border",
            "imbl_status_hi": "अंतर्राष्ट्रीय सीमा से पूर्णतः सुरक्षित",
            "imbl_status_mr": "आंतरराष्ट्रीय सीमेपासून पूर्ण सुरक्षित",
            "restricted_zones": [
                {
                    "name": "Naval Base Prohibited Area (Eastern Naval Command)",
                    "name_hi": "नौसेना बेस निषिद्ध क्षेत्र (पूर्वी नौसेना कमान)",
                    "name_mr": "नौदल तळ प्रतिबंधित क्षेत्र (पूर्व नौदल कमान)",
                    "distance_km": 4.2,
                    "status": "Strictly Prohibited Naval Area",
                    "status_hi": "पूर्णतः निषिद्ध नौसेना क्षेत्र",
                    "status_mr": "अतिप्रतिबंधित नौदल क्षेत्र"
                }
            ]
        },
        "economics": {
            "dockside_prices": {
                "Tiger Prawns (वाघ्या कोळंबी)": "₹500 - ₹750/kg",
                "Skipjack Tuna (टुना)": "₹260 - ₹380/kg",
                "Mackerel (बांगडा)": "₹130 - ₹190/kg",
                "Anchovies (नेतळी)": "₹100 - ₹160/kg",
                "Pomfret (पापलेट)": "₹650 - ₹850/kg"
            },
            "fuel_saving_tips": "Following direct bearing 105° to the 5.5 mg/m³ thermal front at 8.4 knots saves ~25% diesel fuel.",
            "fuel_saving_tips_hi": "105° दिशा में 8.4 समुद्री मील पर चलने से लगभग 25% डीजल की बचत होती है।",
            "fuel_saving_tips_mr": "१०५° दिशेने थेट थर्मल फ्रंटकडे ८.४ नॉट्स वेगाने गेल्यास अंदाजे २५% डिझेल वाचते.",
            "ice_ratio": "1:1 ratio"
        },
        "emergency": {
            "coast_guard_helpline": "1554 (Toll-Free, ICG District HQ Vizag)",
            "mrcc_frequency": "VHF Marine Channel 16 (156.800 MHz) & DSC Ch 70",
            "coastal_police": "1093 / 0891-2565100 (Vizag Marine Police)",
            "mandatory_checklist": [
                "Lifejackets with retro-reflective tape for all crew",
                "VHF Marine radio tested on Channel 16",
                "NavIC / GPS navigator with active anchor alarm",
                "Waterproof emergency beacon and red flares"
            ],
            "mandatory_checklist_hi": [
                "रेट्रो-रिफ्लेक्टिव लाइफ जैकेट",
                "VHF मरीन रेडियो (चैनल 16)",
                "NavIC / GPS नेविगेटर",
                "वॉटरप्रूफ इमरजेंसी बीकन व रेड फ्लेयर्स"
            ],
            "mandatory_checklist_mr": [
                "रेट्रो-रिफ्लेक्टीव्ह पट्टी असलेले लाईफ जॅकेट",
                "VHF मरीन रेडिओ (चॅनेल १६)",
                "NavIC / GPS नेव्हिगेटर",
                "वॉटरप्रूफ आणीबाणी बीकन व लाल फ्लेअर्स"
            ]
        },
        "bathymetry": {
            "shelf_width_km": 50.0,
            "seabed_type": "Narrow shelf with deep underwater submarine canyons and rocky drop-offs",
            "seabed_type_hi": "संकीर्ण शेल्फ, गहरी समुद्री खाइयाँ और चट्टानी ढलान",
            "seabed_type_mr": "अरुंद समुद्रतळ, खोल सागरी घळया व खडकाळ उतार",
            "depth_10km": "28 meters",
            "depth_25km": "65 meters",
            "depth_50km": "140 meters",
            "depth_shelf_break": "200 meters at 48 km offshore"
        }
    }
}

COMMUNITY_REPORTS = [
    {
        "id": 1,
        "type": "Good Catch",
        "type_hi": "उत्कृष्ट शिकार",
        "type_mr": "उत्तम मासेमारी",
        "text": "Spotted large school of mackerel 12km out with heavy feeding bird activity.",
        "text_hi": "तट से 12 किमी दूर बांगड़ा (मैकेरल) का बड़ा झुंड व पक्षियों की भारी सक्रियता देखी गई।",
        "text_mr": "किनाऱ्यापासून १२ किमी अंतरावर बांगडा माशांचा मोठा थवा आणि पक्ष्यांची हालचाल आढळली आहे.",
        "lat": 18.78,
        "lon": 72.50,
        "timestamp": "2 hours ago",
        "timestamp_hi": "2 घंटे पहले",
        "timestamp_mr": "२ तासांपूर्वी",
        "region": "mumbai",
        "species": "Indian Mackerel",
        "depth_m": 22
    },
    {
        "id": 2,
        "type": "Calm Seas",
        "type_hi": "शांत समुद्र",
        "type_mr": "शांत समुद्र",
        "text": "Calm and clear seas today, perfect for trolling lines and Kingfish catch.",
        "text_hi": "आज समुद्र शांत और साफ है, ट्रोलिंग और सुरमई मछली पकड़ने हेतु सर्वोत्तम स्थिति है।",
        "text_mr": "आज समुद्र शांत आणि स्वच्छ आहे, ट्रोलिंग व सुरमई मासेमारीसाठी उत्तम परिस्थिती आहे.",
        "lat": 15.42,
        "lon": 73.75,
        "timestamp": "5 hours ago",
        "timestamp_hi": "5 घंटे पहले",
        "timestamp_mr": "५ तासांपूर्वी",
        "region": "goa",
        "species": "Kingfish (Surmai)",
        "depth_m": 35
    },
    {
        "id": 3,
        "type": "Storm Warning",
        "type_hi": "तूफान चेतावनी",
        "type_mr": "वादळाचा इशारा",
        "text": "Sudden squall winds peaking 35 kts and dark storm clouds forming. Boats retreating to harbor.",
        "text_hi": "अचानक 35 नॉट की तेज आंधी और काले तूफानी बादल घिर रहे हैं। नावें बंदरगाह लौट रही हैं।",
        "text_mr": "अचानक ३५ नॉट्सचे जोरदार वादळी वारे व काळे ढग जमा होत आहेत. सर्व बोटी बंदराकडे परतत आहेत.",
        "lat": 9.98,
        "lon": 76.08,
        "timestamp": "1 hour ago",
        "timestamp_hi": "1 घंटा पहले",
        "timestamp_mr": "१ तासापूर्वी",
        "region": "kochi",
        "species": "None (Severe Hazard)",
        "depth_m": 15
    },
    {
        "id": 4,
        "type": "High Waves",
        "type_hi": "ऊंची लहरें",
        "type_mr": "उंच लाटा",
        "text": "Slightly high wave swells of 1.6m, good bottom trawl catches of Tiger Prawns.",
        "text_hi": "1.6 मीटर ऊंची लहरें, बॉटम ट्रॉल में टाइगर झींगा की अच्छी मात्रा मिली।",
        "text_mr": "१.६ मीटर उंच लाटा, बॉटम ट्रॉलमध्ये वाघ्या कोळंबीची उत्तम मासेमारी झाली.",
        "lat": 13.12,
        "lon": 80.45,
        "timestamp": "4 hours ago",
        "timestamp_hi": "4 घंटे पहले",
        "timestamp_mr": "४ तासांपूर्वी",
        "region": "chennai",
        "species": "Tiger Prawns",
        "depth_m": 28
    },
    {
        "id": 5,
        "type": "Good Catch",
        "type_hi": "उत्कृष्ट शिकार",
        "type_mr": "उत्तम मासेमारी",
        "text": "Rich plankton density, caught massive haul of Tuna and Ghol fish 35km offshore.",
        "text_hi": "भरपूर प्लवक घनत्व, 35 किमी दूर टूना और घोल मछली की भारी मात्रा पकड़ी गई।",
        "text_mr": "प्लवक घनता उत्तम असून ३५ किमी अंतरावर टुना व घोल माशांची विक्रमी मासेमारी झाली.",
        "lat": 20.85,
        "lon": 70.25,
        "timestamp": "6 hours ago",
        "timestamp_hi": "6 घंटे पहले",
        "timestamp_mr": "६ तासांपूर्वी",
        "region": "veraval",
        "species": "Ghol & Tuna",
        "depth_m": 48
    }
]

def get_closest_region(lat: float, lon: float) -> str:
    """Finds the closest mock region based on euclidean distance."""
    import math
    closest_key = "mumbai"
    min_dist = float("inf")
    
    for key, data in MOCK_REGIONS.items():
        dist = math.sqrt((data["lat"] - lat)**2 + (data["lon"] - lon)**2)
        if dist < min_dist:
            min_dist = dist
            closest_key = key
            
    return closest_key
