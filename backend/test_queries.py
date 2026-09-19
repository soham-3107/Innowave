import sys
sys.stdout.reconfigure(encoding='utf-8')

from agents.pipeline import run_agent_pipeline

test_suite = [
    {
        "id": "Q1 (Hindi Fishing Zone)",
        "query": "मुंबई तट के पास सबसे अच्छा मछली पकड़ने का क्षेत्र कौन सा है?",
        "expected_lang": "hi",
        "expected_intent": "fish",
        "expected_region": "mumbai"
    },
    {
        "id": "Q2 (Hindi Sea Safety)",
        "query": "आज समुद्र में जाना सुरक्षित है क्या?",
        "expected_lang": "hi",
        "expected_intent": "safety",
        "expected_region": "mumbai"
    },
    {
        "id": "Q3 (Marathi Best Time)",
        "query": "मासेमारीसाठी सर्वोत्तम वेळ कोणती आहे?",
        "expected_lang": "mr",
        "expected_intent": "fish",
        "expected_region": "mumbai"
    },
    {
        "id": "Q4 (Marathi Storm Warning)",
        "query": "समुद्रात वादळाचा इशारा आहे का?",
        "expected_lang": "mr",
        "expected_intent": "weather",
        "expected_region": "mumbai"
    },
    {
        "id": "Regression 1 (English Goa PFZ)",
        "query": "Where is the best fishing zone in Goa?",
        "expected_lang": "en",
        "expected_intent": "fish",
        "expected_region": "goa"
    },
    {
        "id": "Regression 2 (Hindi Kochi Storm Alert)",
        "query": "कोच्चि में क्या तूफान का खतरा है?",
        "expected_lang": "hi",
        "expected_intent": "weather",
        "expected_region": "kochi"
    },
    {
        "id": "Regression 3 (Marathi Goa Sea Safety)",
        "query": "गोव्यात आज समुद्रात जाणे सुरक्षित आहे का?",
        "expected_lang": "mr",
        "expected_intent": "safety",
        "expected_region": "goa"
    }
]

print("="*70)
print("RUNNING EXTENDED MULTI-LANGUAGE TEST SUITE")
print("="*70)

all_passed = True

for item in test_suite:
    print(f"\n--- Running Test [{item['id']}]: '{item['query']}' ---")
    res = run_agent_pipeline(item["query"])
    
    lang_ok = (res["language"] == item["expected_lang"])
    region_ok = (res["region"] == item["expected_region"])
    
    print(f"Detected Language : {res['language']} (Expected: {item['expected_lang']}) -> {'PASS' if lang_ok else 'FAIL'}")
    print(f"Detected Region   : {res['region']} (Expected: {item['expected_region']}) -> {'PASS' if region_ok else 'FAIL'}")
    
    print("Reasoning Trace:")
    for step in res["reasoning_trace"]:
        print(f"  [{step['agent']}] {step['message']}")
        
    print("\nBrain Agent Final Response:")
    print(res["final_answer"])
    print("-" * 50)
    
    if not (lang_ok and region_ok):
        all_passed = False

print("\n" + "="*70)
if all_passed:
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
else:
    print("SOME TESTS FAILED!")
print("="*70)
