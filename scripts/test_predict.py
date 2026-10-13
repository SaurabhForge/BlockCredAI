"""Quick live test of the /predict endpoint."""
import urllib.request
import json

def post(payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        "http://localhost:8001/predict",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        return json.loads(r.read())

cases = [
    ("Legitimate - generic", {
        "resume_text": "Software engineer with 2 years experience in web development using Python and React",
        "claimed_experience": "2 years software developer",
        "unverified_mismatches": 0,
    }),
    ("Legitimate - named company", {
        "resume_text": "Senior Software Engineer at Microsoft for 4 years led a team of 6 on Azure cloud services",
        "claimed_experience": "4 years Microsoft Azure",
        "unverified_mismatches": 0,
    }),
    ("Fraud - impossible age", {
        "resume_text": "CEO of Fortune 500 company at age 19 managed 10000 employees for 15 years",
        "claimed_experience": "CEO Fortune 500",
        "unverified_mismatches": 2,
    }),
    ("Fraud - keyword stuffing", {
        "resume_text": "Expert in Python Java C++ Rust Go Haskell Erlang Lisp and 40 other languages simultaneously",
        "claimed_experience": "All programming languages",
        "unverified_mismatches": 3,
    }),
]

for label, payload in cases:
    result = post(payload)
    pct = result["fraud_probability"] * 100
    print(f"\n[{label}]")
    print(f"  Fraud Probability : {pct:.0f}%")
    print(f"  Explanation       : {result['explanation']}")
