import sys
import os

# Set UTF-8 encoding for standard output
sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from agents.pipeline import run_agent_pipeline

# Test suite containing the 4 primary test queries from Requirement 5 + comprehensive coverage
test_suite = [
    {
        "id": "R5-1. Safety Inquiry (Mumbai Today)",
        "query": "Is it safe to go fishing near Mumbai today?",
        "expected_lang": "en",
        "expected_domain": "safety",
        "expected_keywords": ["SAFE", "MUMBAI", "knots", "meters", "IMBL"],
        "min_words": 60,
        "max_words": 300
    },
    {
        "id": "R5-2. Expected Species Inquiry (Goa This Week)",
        "query": "What species should I expect near Goa this week?",
        "expected_lang": "en",
        "expected_domain": "species_expected",
        "expected_keywords": ["EXPECTED FISH SPECIES", "GOA", "Surmai", "chlorophyll", "depth"],
        "min_words": 60,
        "max_words": 300
    },
    {
        "id": "R5-3. Danger Index Explanation",
        "query": "Explain why the danger index is what it is right now.",
        "expected_lang": "en",
        "expected_domain": "danger_index_explanation",
        "expected_keywords": ["DANGER INDEX EXPLANATION", "Wind Threat", "Wave & Swell", "Geospatial", "Community"],
        "min_words": 60,
        "max_words": 300
    },
    {
        "id": "R5-4. Best Departure/Fishing Time (Kochi Tomorrow Morning)",
        "query": "What's the best time to fish near Kochi tomorrow morning?",
        "expected_lang": "en",
        "expected_domain": "timing",
        "expected_keywords": ["OPTIMAL FISHING", "KOCHI", "Slack", "Tidal", "Morning"],
        "min_words": 60,
        "max_words": 300
    },
    {
        "id": "Trip Advisory (Tomorrow Sea Conditions)",
        "query": "Based on today's weather, wind, wave height and sea conditions, should I go fishing tomorrow?",
        "expected_lang": "en",
        "expected_domain": "trip_advisory",
        "expected_keywords": ["CONDITIONS", "Weather & Wind", "Waves & Sea State"],
        "min_words": 60,
        "max_words": 300
    },
    {
        "id": "Tuna Species Profile",
        "query": "I'm targeting tuna. What location, depth, bait and weather conditions should I look for?",
        "expected_lang": "en",
        "expected_domain": "species_profile",
        "expected_keywords": ["Tuna", "Location", "Depth", "Bait"],
        "min_words": 60,
        "max_words": 300
    },
    {
        "id": "Small Boat 25 km/h Wind Safety",
        "query": "I have a small fishing boat and the wind speed is 25 km/h. Is it safe to go offshore?",
        "expected_lang": "en",
        "expected_domain": "small_boat_safety",
        "expected_keywords": ["Small Boat Safety", "25 km/h", "CAUTION"],
        "min_words": 60,
        "max_words": 300
    },
    {
        "id": "PFZ Discrepancy Explanation",
        "query": "Why might the predicted fishing zone be different from where fishermen are actually catching fish?",
        "expected_lang": "en",
        "expected_domain": "pfz_discrepancy",
        "expected_keywords": ["Why Predicted Fishing Zones", "Time Lag", "Thermocline"],
        "min_words": 60,
        "max_words": 300
    },
    {
        "id": "PFZ Multi-Agent Recommendation Reason",
        "query": "Can you explain why you recommended this fishing zone?",
        "expected_lang": "en",
        "expected_domain": "pfz_explanation",
        "expected_keywords": ["Why ORCA Recommended", "Satellite Ocean Color", "Thermal Upwelling"],
        "min_words": 60,
        "max_words": 300
    },
    {
        "id": "Hindi - Tomorrow Trip Advisory",
        "query": "आज के मौसम, हवा, लहरों की ऊंचाई और समुद्री स्थिति के आधार पर क्या मुझे कल मछली पकड़ने जाना चाहिए?",
        "expected_lang": "hi",
        "expected_domain": "trip_advisory",
        "expected_keywords": ["मछली पकड़ने", "मौसम", "लहरें"],
        "min_words": 40,
        "max_words": 350
    },
    {
        "id": "Hindi - Danger Index Explanation",
        "query": "समझाएं कि वर्तमान में खतरा इंडेक्स इतना क्यों है?",
        "expected_lang": "hi",
        "expected_domain": "danger_index_explanation",
        "expected_keywords": ["खतरा इंडेक्स", "हवा का खतरा", "लहरों का खतरा"],
        "min_words": 40,
        "max_words": 350
    },
    {
        "id": "Hindi - Expected Species",
        "query": "इस सप्ताह गोवा के पास कौन सी मछली मिलने की उम्मीद है?",
        "expected_lang": "hi",
        "expected_domain": "species_expected",
        "expected_keywords": ["अपेक्षित मछलियाँ", "गोवा", "क्लोरोफिल"],
        "min_words": 40,
        "max_words": 350
    },
    {
        "id": "Marathi - Tomorrow Trip Advisory",
        "query": "आजचे हवामान, वारा, लाटांची उंची आणि समुद्राची स्थिती पाहून मी उद्या मासेमारीला जावे का?",
        "expected_lang": "mr",
        "expected_domain": "trip_advisory",
        "expected_keywords": ["मासेमारीसाठी", "हवामान", "लाटा"],
        "min_words": 40,
        "max_words": 350
    },
    {
        "id": "Marathi - Danger Index Explanation",
        "query": "सध्याचा धोका निर्देशांक असा का आहे हे समजावून सांगा.",
        "expected_lang": "mr",
        "expected_domain": "danger_index_explanation",
        "expected_keywords": ["धोका निर्देशांक", "वाऱ्याचा धोका", "लाटांचा उसळी"],
        "min_words": 40,
        "max_words": 350
    },
    {
        "id": "Marathi - Expected Species",
        "query": "या आठवड्यात गोव्याच्या किनाऱ्यावर कोणते मासे मिळण्याची अपेक्षा आहे?",
        "expected_lang": "mr",
        "expected_domain": "species_expected",
        "expected_keywords": ["अपेक्षित मासे", "गोवा", "क्लोरोफिल"],
        "min_words": 40,
        "max_words": 350
    }
]

print("="*80)
print("RUNNING EXTENDED USER-QUESTION TEST SUITE WITH REQUIREMENT 5 QUERIES")
print("="*80)

all_passed = True
collected_answers = []

for idx, item in enumerate(test_suite, 1):
    print(f"\n[{idx}/{len(test_suite)}] Testing: '{item['query']}'")
    res = run_agent_pipeline(item["query"])
    
    answer_text = res["final_answer"]
    words = answer_text.split()
    word_count = len(words)
    
    lang_ok = (res["language"] == item["expected_lang"])
    domain_ok = (res["detected_intent"] == item["expected_domain"])
    keywords_ok = all(kw.lower() in answer_text.lower() for kw in item["expected_keywords"])
    length_ok = (word_count >= item["min_words"])
    
    print(f"  • Language        : {res['language']} (Expected: {item['expected_lang']}) -> {'PASS' if lang_ok else 'FAIL'}")
    print(f"  • Intent Domain   : {res['detected_intent']} (Expected: {item['expected_domain']}) -> {'PASS' if domain_ok else 'FAIL'}")
    print(f"  • Keyword Checks  : {item['expected_keywords']} -> {'PASS' if keywords_ok else 'FAIL'}")
    print(f"  • Word Count      : {word_count} words (Min: {item['min_words']}) -> {'PASS' if length_ok else 'FAIL'}")
    
    print(f"\n  --- Brain Agent Output Preview ---")
    print(f"  {answer_text[:280]}...")
    print(f"  ----------------------------------")
    
    if not (lang_ok and domain_ok and keywords_ok and length_ok):
        all_passed = False
        print(f"  ❌ FAILED on test: {item['id']}")
    else:
        print(f"  ✅ PASSED: {item['id']}")
        
    collected_answers.append(answer_text)

# Check for pairwise diversity
unique_answers = set(collected_answers)
diversity_rate = (len(unique_answers) / len(collected_answers)) * 100
print("\n" + "="*80)
print(f"TEST SUITE SUMMARY:")
print(f"Total Test Cases: {len(test_suite)}")
print(f"Unique Answers  : {len(unique_answers)} / {len(collected_answers)}")
print(f"Diversity Rate  : {diversity_rate:.1f}%")
print("="*80)

if all_passed and diversity_rate == 100.0:
    print("\n🎉 ALL TESTS PASSED WITH 100% SPECIFICITY AND 100% DISTINCT RESPONSES!")
else:
    print("\n⚠️ Some test cases failed or duplicate answers were generated.")
    sys.exit(1)
