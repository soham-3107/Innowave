import sys
sys.stdout.reconfigure(encoding='utf-8')

from agents.pipeline import run_agent_pipeline

test_suite = [
    {
        "id": "1. Specific Species Profile (Hindi)",
        "query": "मुंबई में पापलेट और सुरमई मछली पकड़ने की गहराई और चारा क्या है?",
        "expected_lang": "hi",
        "expected_region": "mumbai",
        "expected_domain_keyword": "मछली प्रजाति विवरण"
    },
    {
        "id": "2. Dockside Market Prices & Fuel (Marathi)",
        "query": "मुंबई गोदीत आज माशांचे लिलाव बाजारभाव काय आहेत आणि डिझेल कसे वाचवावे?",
        "expected_lang": "mr",
        "expected_region": "mumbai",
        "expected_domain_keyword": "बाजारभाव"
    },
    {
        "id": "3. Coast Guard Emergency SOS (English)",
        "query": "What is the Indian Coast Guard emergency distress helpline and VHF channel?",
        "expected_lang": "en",
        "expected_region": "mumbai",
        "expected_domain_keyword": "Coast Guard"
    },
    {
        "id": "4. Ocean Waves & Swell Hydrodynamics (Marathi)",
        "query": "गोव्यात समुद्रात लाटांची उंची आणि उसळीचा कालावधी किती आहे?",
        "expected_lang": "mr",
        "expected_region": "goa",
        "expected_domain_keyword": "लाटांची उंची"
    },
    {
        "id": "5. Tidal Schedule & Slack Navigation (Hindi)",
        "query": "कोच्चि में उच्च ज्वार और नौका प्रस्थान का शांत समय क्या है?",
        "expected_lang": "hi",
        "expected_region": "kochi",
        "expected_domain_keyword": "ज्वार"
    },
    {
        "id": "6. Satellite SST & Chlorophyll PFZ (English)",
        "query": "What is the satellite chlorophyll density and SST thermal front in Veraval?",
        "expected_lang": "en",
        "expected_region": "veraval",
        "expected_domain_keyword": "Chlorophyll"
    },
    {
        "id": "7. Marine Border & Naval Boundary (Marathi)",
        "query": "वेरावळ किनाऱ्यापासून आंतरराष्ट्रीय सागरी सीमा (IMBL) किती लांब आहे?",
        "expected_lang": "mr",
        "expected_region": "veraval",
        "expected_domain_keyword": "आंतरराष्ट्रीय"
    },
    {
        "id": "8. Fishing Gear & Mesh Size (Hindi)",
        "query": "चेन्नई में मछली पकड़ने के लिए कौन सा जाल और मेश साइज सही है?",
        "expected_lang": "hi",
        "expected_region": "chennai",
        "expected_domain_keyword": "गियर"
    },
    {
        "id": "9. Best Time for Departure (English)",
        "query": "What is the best time to go fishing tomorrow morning in Goa?",
        "expected_lang": "en",
        "expected_region": "goa",
        "expected_domain_keyword": "Best"
    },
    {
        "id": "10. Sea Venture Safety Assessment (Marathi)",
        "query": "गोव्यात आज समुद्रात जाणे सुरक्षित आहे का?",
        "expected_lang": "mr",
        "expected_region": "goa",
        "expected_domain_keyword": "सुरक्षा"
    }
]

print("="*80)
print("RUNNING MULTI-DOMAIN DIVERSE MARINE INTELLIGENCE TEST SUITE")
print("="*80)

all_passed = True
collected_answers = []

for item in test_suite:
    print(f"\n--- Testing [{item['id']}]: '{item['query']}' ---")
    res = run_agent_pipeline(item["query"])
    
    lang_ok = (res["language"] == item["expected_lang"])
    region_ok = (res["region"] == item["expected_region"])
    keyword_ok = (item["expected_domain_keyword"] in res["final_answer"])
    
    print(f"Detected Language : {res['language']} (Expected: {item['expected_lang']}) -> {'PASS' if lang_ok else 'FAIL'}")
    print(f"Detected Region   : {res['region']} (Expected: {item['expected_region']}) -> {'PASS' if region_ok else 'FAIL'}")
    print(f"Domain Specificity: '{item['expected_domain_keyword']}' -> {'PASS' if keyword_ok else 'FAIL'}")
    
    print("Reasoning Trace:")
    for step in res["reasoning_trace"]:
        print(f"  [{step['agent']}] {step['message']}")
        
    print("\nBrain Agent Final Response:")
    print(res["final_answer"])
    print("-" * 60)
    
    collected_answers.append(res["final_answer"])
    
    if not (lang_ok and region_ok and keyword_ok):
        all_passed = False

# Verify that answers are truly distinct and not duplicates
unique_answers = set(collected_answers)
diversity_rate = (len(unique_answers) / len(collected_answers)) * 100.0
print(f"\nResponse Diversity Rate: {diversity_rate:.1f}% ({len(unique_answers)} unique responses for {len(collected_answers)} queries)")

print("\n" + "="*80)
if all_passed and diversity_rate == 100.0:
    print("ALL TESTS PASSED WITH 100% SUCCESS AND 100% DISTINCT DATA GENERATION!")
else:
    print("SOME TESTS FAILED OR RESPONSES WERE DUPLICATED!")
print("="*80)
