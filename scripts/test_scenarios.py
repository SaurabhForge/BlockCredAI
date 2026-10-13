"""
Simulate the full resume.ts logic in Python to verify all 3 scenarios
without needing a running Express server.
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
        r'worked\s+(at|for|with)\s+\w',
        r'employed\s+(at|by)\s+\w',
        r'\d+\s*(year|month)s?\s+(at|of|experience)',
        r'(engineer|developer|manager|analyst|lead|director|consultant|executive|officer|intern)\s+at\s+\w',
        r'joined\s+\w',
        r'\bat\s+[A-Z][a-zA-Z]{2,}',
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
    """Mirrors the resume.ts logic exactly."""
    # --- estimateMismatchCount ---
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

    # --- post-processing ---
    if len(on_chain_history) == 0:
        claim_count = count_specific_claims(claimed_experience)
        if claim_count > 0:
            prob = max(prob, 0.75)
            explanation = (
                f"High risk: No blockchain-verified employment records found. "
                f"{claim_count} specific employment claim(s) have no cryptographic backing."
            )
        else:
            explanation = f"No on-chain records. No specific claims detected. AI: {explanation}"
    elif mismatches == 0:
        if ai["fraud_probability"] <= 0.5:
            prob = 0.0
            explanation = f"Verified on-chain: 0% fraud risk. All claims match {len(on_chain_history)} record(s)."
        else:
            prob = max(0, round((ai["fraud_probability"] - 0.3) * 100) / 100)
            explanation = f"Partially verified on-chain ({len(on_chain_history)} record(s)), unusual wording."
    else:
        prob = max(prob, 0.60)
        explanation = f"Mismatch: {len(on_chain_history)} record(s) found but claims don't align. {explanation}"

    return round(prob, 2), explanation

# ── Test cases ─────────────────────────────────────────────────────────────

cases = [
    {
        "label": "✅ LEGIT - Verified on-chain match",
        "resume_text": "Software Engineer at Google from 2019 to 2022 working on distributed systems",
        "claimed_experience": "Software engineer at Google 3 years",
        "on_chain": ["Software Engineer at Google 2019-2022 distributed systems Kubernetes"],
        "expect": "LOW (0%)",
    },
    {
        "label": "🚨 FRAUD - Claims employment, ZERO on-chain records",
        "resume_text": "Senior Software Engineer at Microsoft for 4 years led Azure cloud team",
        "claimed_experience": "Senior engineer at Microsoft 4 years Azure",
        "on_chain": [],
        "expect": "HIGH (>=75%)",
    },
    {
        "label": "🚨 FRAUD - Has records but claims don't match them",
        "resume_text": "Software Engineer at Google for 3 years working on distributed systems",
        "claimed_experience": "CEO at Amazon for 10 years managing 5000 employees",
        "on_chain": ["Junior developer at small startup 2022-2023"],
        "expect": "HIGH (>=50%)",
    },
    {
        "label": "✅ LEGIT - Fresher, no claims, no records",
        "resume_text": "Recent computer science graduate with Python and data structures knowledge",
        "claimed_experience": "Fresher looking for entry level software developer position",
        "on_chain": [],
        "expect": "LOW (<30%)",
    },
]

print(f"{'Scenario':<52} {'Risk%':>6}  {'Expected':<18}  Verdict")
print("─" * 100)
for c in cases:
    prob, expl = simulate_resume_route(c["resume_text"], c["claimed_experience"], c["on_chain"])
    pct = f"{prob*100:.0f}%"
    # Quick pass/fail
    if "0%" in c["expect"] and prob == 0.0: verdict = "PASS ✓"
    elif ">=75%" in c["expect"] and prob >= 0.75: verdict = "PASS ✓"
    elif ">=50%" in c["expect"] and prob >= 0.50: verdict = "PASS ✓"
    elif "<30%" in c["expect"] and prob < 0.30: verdict = "PASS ✓"
    else: verdict = "FAIL ✗"
    print(f"{c['label']:<52} {pct:>6}  {c['expect']:<18}  {verdict}")
    print(f"   → {expl[:110]}")
    print()
