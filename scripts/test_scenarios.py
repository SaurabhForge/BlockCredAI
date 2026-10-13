"""
Simulate the full resume.ts logic in Python to verify all 4 scenarios.
"""
import urllib.request, json, re

AI_URL = "http://localhost:8001/predict"

def ai_predict(resume_text, claimed_experience, mismatches):
    data = json.dumps({
        "resume_text": resume_text,
        "claimed_experience": claimed_experience,
        "unverified_mismatches": mismatches
    }).encode()
    req = urllib.request.Request(AI_URL, data=data, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=5) as r:
        return json.loads(r.read())

def count_specific_claims(text):
    lower = text.lower()
    patterns = [
        r'(worked|employed|working|interned|serving)\s+(at|for|with|in)\s+[a-z0-9]',
        r'(engineer|developer|manager|analyst|lead|director|consultant|executive|officer|intern|architect|designer|associate)\s+(at|for|in|with)\s+[a-z0-9]',
        r'\bat\s+[a-z0-9]{3,}',
        r'\d+\s*(year|month|yr)s?\s*(of\s*)?(experience|at|in)',
        r'(engineer|developer|manager|analyst|lead|director|consultant|executive|intern)\s*[,:\-–]\s*[a-z0-9]',
        r'20\d\d\s*[-–to]+\s*(20\d\d|present|current)',
        r'(company|employer|organization)\s*[:=]\s*[a-z0-9]',
    ]
    total = sum(len(re.findall(p, lower)) for p in patterns)
    return min(6, total)

MATCH_STOPWORDS = {
    "years", "year", "month", "months", "experience", "work", "worked",
    "working", "with", "from", "have", "having", "team", "role", "position",
    "company", "firm", "organization", "using", "responsible", "developed",
    "managed", "built", "designed", "created", "leading", "senior", "junior",
    "multiple", "various", "overall", "total", "more", "than", "over",
}

def identity_tokens(text):
    return [t for t in re.split(r'[^a-z0-9]+', text.lower())
            if len(t) >= 4 and t not in MATCH_STOPWORDS]

def simulate_resume_route(resume_text, claimed_experience, on_chain_history):
    """Mirrors the updated resume.ts logic exactly."""
    if len(on_chain_history) == 0:
        mismatches = count_specific_claims(claimed_experience)
    else:
        norm_claim = claimed_experience.lower()
        verified_text = " ".join(j.lower() for j in on_chain_history)
        keywords = identity_tokens(norm_claim)
        verified_kw = set(identity_tokens(verified_text))
        unmatched = [t for t in keywords if t not in verified_kw and t not in verified_text]
        if not unmatched:
            mismatches = 0
        else:
            ratio = len(unmatched) / max(1, len(keywords))
            mismatches = 1 if ratio < 0.5 else (2 if ratio < 0.75 else 4)

    ai = ai_predict(resume_text, claimed_experience, mismatches)
    prob = ai["fraud_probability"]
    explanation = ai["explanation"]

    # Post-processing
    if len(on_chain_history) == 0:
        claim_count = count_specific_claims(claimed_experience)
        if claim_count > 0:
            prob = 1.0
            explanation = (
                f"100% Fraud Detected: No blockchain-verified employment records found for this candidate. "
                f"Candidate claims {claim_count} specific employment position(s) with zero on-chain verification."
            )
        else:
            prob = ai["fraud_probability"]
            explanation = f"No on-chain corporate records found. Entry-level applicant; low fraud risk ({round(prob * 100)}%)."
    elif mismatches == 0:
        if ai["fraud_probability"] <= 0.5:
            prob = 0.0
            explanation = f"Verified on-chain: 0% fraud risk. All claims match {len(on_chain_history)} record(s)."
        else:
            prob = max(0, round((ai["fraud_probability"] - 0.3) * 100) / 100)
            explanation = f"Partially verified on-chain ({len(on_chain_history)} record(s)), unusual wording."
    else:
        prob = 1.0
        explanation = (
            f"100% Fraud Detected: Critical mismatch with blockchain employment records. "
            f"Candidate claims employment that contradicts or does not match their {len(on_chain_history)} verified on-chain record(s)."
        )

    if ai["fraud_probability"] >= 0.8:
        prob = 1.0
        explanation = "100% Fraud Detected: AI analysis identified severe fraudulent patterns or fabricated credentials."

    return round(prob, 2), explanation

# ── Test cases ─────────────────────────────────────────────────────────────

cases = [
    {
        "label": "LEGIT - Verified on-chain match",
        "resume_text": "Software Engineer at Google from 2019 to 2022 working on distributed systems",
        "claimed_experience": "Software engineer at Google 3 years",
        "on_chain": ["Software Engineer at Google 2019-2022 distributed systems Kubernetes"],
        "expect": 0.0,
    },
    {
        "label": "FRAUD - Claims employment, ZERO on-chain records",
        "resume_text": "Senior Software Engineer at Microsoft for 4 years led Azure cloud team",
        "claimed_experience": "Senior engineer at Microsoft 4 years Azure",
        "on_chain": [],
        "expect": 1.0,
    },
    {
        "label": "FRAUD - Has records but claims don't match them",
        "resume_text": "Software Engineer at Google for 3 years working on distributed systems",
        "claimed_experience": "CEO at Amazon for 10 years managing 5000 employees",
        "on_chain": ["Junior developer at small startup 2022-2023"],
        "expect": 1.0,
    },
    {
        "label": "LEGIT - Fresher, no claims, no records",
        "resume_text": "Recent computer science graduate with Python and data structures knowledge",
        "claimed_experience": "Fresher looking for entry level software developer position",
        "on_chain": [],
        "expect": 0.0,
    },
]

print(f"{'Scenario':<52} {'Risk%':>6}  {'Expected%':>10}  Verdict")
print("-" * 80)
for c in cases:
    prob, expl = simulate_resume_route(c["resume_text"], c["claimed_experience"], c["on_chain"])
    pct = f"{prob*100:.0f}%"
    exp_pct = f"{c['expect']*100:.0f}%"
    verdict = "PASS" if prob == c["expect"] or (c["expect"] == 0.0 and prob <= 0.05) else "FAIL"
    print(f"{c['label']:<52} {pct:>6}  {exp_pct:>10}  {verdict}")
    print(f"   -> {expl}")
    print()
