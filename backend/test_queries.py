import sys
sys.stdout.reconfigure(encoding='utf-8')

from agents.pipeline import run_agent_pipeline

test_suite = [
    {
        "id": "1. Tomorrow Fishing Advisory (English)",
        "query": "Based on today's weather, wind, wave height and sea conditions, should I go fishing tomorrow?",
        "expected_lang": "en",
        "expected_domain": "trip_advisory",
        "expected_keyword": "CONDITIONS"
    },
    {
        "id": "2. Tuna Target Guide (English)",
        "query": "I'm targeting tuna. What location, depth, bait and weather conditions should I look for?",
        "expected_lang": "en",
        "expected_domain": "species_profile",
        "expected_keyword": "Tuna"
    },
    {
        "id": "3. Small Boat & 25 km/h Wind Safety (English)",
        "query": "I have a small fishing boat and the wind speed is 25 km/h. Is it safe to go offshore?",
        "expected_lang": "en",
        "expected_domain": "small_boat_safety",
        "expected_keyword": "Small Boat Safety"
    },
    {
        "id": "4. PFZ Discrepancy Explanation (English)",
        "query": "Why might the predicted fishing zone be different from where fishermen are actually catching fish?",
        "expected_lang": "en",
        "expected_domain": "pfz_discrepancy",
        "expected_keyword": "Why Predicted Fishing Zones"
    },
    {
        "id": "5. PFZ Recommendation Explainability (English)",
        "query": "Can you explain why you recommended this fishing zone?",
        "expected_lang": "en",
        "expected_domain": "pfz_explanation",
        "expected_keyword": "Why INNOWAVE Recommended"
    },
    {
        "id": "6. Tomorrow Fishing Advisory (Hindi)",
        "query": "आज के मौसम, हवा, लहरों की ऊंचाई और समुद्री स्थिति के आधार पर क्या मुझे कल मछली पकड़ने जाना चाहिए?",
        "expected_lang": "hi",
        "expected_domain": "trip_advisory",
        "expected_keyword": "कल मछली पकड़ने"
    },
    {
        "id": "7. Tuna Target Guide (Hindi)",
        "query": "टूना मछली पकड़ने के लिए कौन सी जगह, गहराई, चारा और मौसम देखना चाहिए?",
        "expected_lang": "hi",
        "expected_domain": "species_profile",
        "expected_keyword": "टूना"
    },
    {
        "id": "8. Small Boat & 25 km/h Wind (Hindi)",
        "query": "मेरे पास छोटी नाव है और हवा की गति 25 किमी/घंटा है, क्या गहरे समुद्र में जाना सुरक्षित है?",
        "expected_lang": "hi",
        "expected_domain": "small_boat_safety",
        "expected_keyword": "छोटी नाव"
    },
    {
        "id": "9. PFZ Discrepancy Explanation (Hindi)",
        "query": "भविष्यवाणी किया गया मत्स्य क्षेत्र वास्तविक मछली पकड़ने की जगह से अलग क्यों हो सकता है?",
        "expected_lang": "hi",
        "expected_domain": "pfz_discrepancy",
        "expected_keyword": "वास्तविक मछली"
    },
    {
        "id": "10. Tomorrow Fishing Advisory (Marathi)",
        "query": "आजचे हवामान, वारा, लाटांची उंची आणि समुद्राची स्थिती पाहून मी उद्या मासेमारीला जावे का?",
        "expected_lang": "mr",
        "expected_domain": "trip_advisory",
        "expected_keyword": "उद्या मासेमारीसाठी"
    },
    {
        "id": "11. Tuna Target Guide (Marathi)",
        "query": "टुना माशासाठी कोणती जागा, खोली, आमिष आणि हवामान योग्य आहे?",
        "expected_lang": "mr",
        "expected_domain": "species_profile",
        "expected_keyword": "टुना"
    },
    {
        "id": "12. Small Boat & 25 km/h Wind (Marathi)",
        "query": "माझ्याकडे लहान बोट आहे आणि वाऱ्याचा वेग 25 किमी/तास आहे, खोल समुद्रात जाणे सुरक्षित आहे का?",
        "expected_lang": "mr",
        "expected_domain": "small_boat_safety",
        "expected_keyword": "लहान बोट"
    },
    {
        "id": "13. PFZ Discrepancy (Marathi)",
        "query": "अंदाजित मासेमारी क्षेत्र (PFZ) आणि प्रत्यक्षात मासे मिळण्याची जागा यात फरक का असू शकतो?",
        "expected_lang": "mr",
        "expected_domain": "pfz_discrepancy",
        "expected_keyword": "फरक का"
    },
    {
        "id": "14. PFZ Recommendation Explainability (Marathi)",
        "query": "तुम्ही हे मासेमारी क्षेत्र का निवडले किंवा शिफारस केली हे समजावून सांगू शकता का?",
        "expected_lang": "mr",
        "expected_domain": "pfz_explanation",
        "expected_keyword": "का निवडले"
    }
]

print("="*80)
print("RUNNING EXTENDED USER-QUESTION TEST SUITE")
print("="*80)

all_passed = True
collected_answers = []

for item in test_suite:
    print(f"\n--- Testing [{item['id']}]: '{item['query']}' ---")
    res = run_agent_pipeline(item["query"])
    
    lang_ok = (res["language"] == item["expected_lang"])
    domain_ok = (res["detected_intent"] == item["expected_domain"])
    keyword_ok = (item["expected_keyword"] in res["final_answer"])
    
    print(f"Detected Language : {res['language']} (Expected: {item['expected_lang']}) -> {'PASS' if lang_ok else 'FAIL'}")
    print(f"Detected Intent   : {res['detected_intent']} (Expected: {item['expected_domain']}) -> {'PASS' if domain_ok else 'FAIL'}")
    print(f"Domain Specificity: '{item['expected_keyword']}' -> {'PASS' if keyword_ok else 'FAIL'}")
    
    print("Reasoning Trace:")
    for step in res["reasoning_trace"]:
        print(f"  [{step['agent']}] {step['message']}")
        
    print("\nBrain Agent Final Response:")
    print(res["final_answer"])
    print("-" * 60)
    
    if not (lang_ok and domain_ok and keyword_ok):
        all_passed = False
        print(f"FAILED on test: {item['id']}")
        
    collected_answers.append(res["final_answer"])

# Verify Diversity
unique_answers = set(collected_answers)
diversity_rate = (len(unique_answers) / len(collected_answers)) * 100
print(f"\nResponse Diversity Rate: {diversity_rate:.1f}% ({len(unique_answers)} unique responses for {len(collected_answers)} queries)")

if all_passed and diversity_rate == 100.0:
    print("\n" + "="*80)
    print("ALL TESTS PASSED WITH 100% SUCCESS AND 100% DISTINCT DATA GENERATION!")
    print("="*80)
else:
    print("\nSome tests failed or generated duplicates.")
    sys.exit(1)
