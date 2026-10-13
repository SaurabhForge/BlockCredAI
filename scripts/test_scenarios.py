"""
Simulate the updated resume.ts logic in Python to verify all 4 scenarios.
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

def count_specific_employment_claims(text):
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
    "multiple", "various", "overall", "total", "more", "than", "over", "into",
    "also", "such", "this", "that", "were", "been"
}

def to_identity_tokens(text):
    return [t for t in re.split(r'[^a-z0-9]+', text.lower())
            if len(t) >= 3 and t not in MATCH_STOPWORDS]

def is_claim_verified_by_on_chain_records(claimed_experience, resume_text, verified_jobs):
    if not verified_jobs:
        return False

    combined = f"{claimed_experience} {resume_text}".lower()
    candidate_tokens = set(to_identity_tokens(combined))

    for job_details in verified_jobs:
        job_lower = job_details.lower().strip()
        if not job_lower:
            continue

        # 1. Substring match
        if job_lower in combined or claimed_experience.lower().strip() in job_lower:
            return True

        # 2. Token overlap analysis
        job_tokens = list(set(to_identity_tokens(job_lower)))
        if not job_tokens:
            continue

        matched_tokens = [t for t in job_tokens if t in candidate_tokens or t in combined]

        if len(matched_tokens) / len(job_tokens) >= 0.5:
            return True

        if len(matched_tokens) >= 2:
            return True

    return False

def simulate_resume_route(resume_text, claimed_experience, on_chain_history):
    has_records = len(on_chain_history) > 0
    is_verified = has_records and is_claim_verified_by_on_chain_records(claimed_experience, resume_text, on_chain_history)
    claim_count = count_specific_employment_claims(claimed_experience)

    mismatches = claim_count if not has_records else (0 if is_verified else 1)
    ai = ai_predict(resume_text, claimed_experience, mismatches)

    if has_records:
        if is_verified:
            prob = 0.0
            explanation = f"Verified on-chain: 0% fraud risk. All claims match {len(on_chain_history)} record(s)."
        else:
            prob = 1.0
            explanation = f"100% Fraud Detected: Critical mismatch with blockchain employment records ({len(on_chain_history)} record(s))."
    else:
        if claim_count > 0:
            prob = 1.0
            explanation = f"100% Fraud Detected: No blockchain-verified records found for {claim_count} specific claim(s)."
        else:
            if ai["fraud_probability"] >= 0.8:
                prob = 1.0
                explanation = "100% Fraud Detected: AI analysis identified severe fraudulent patterns."
            else:
                prob = ai["fraud_probability"]
                explanation = f"No on-chain records. Entry-level applicant; low fraud risk ({round(prob*100)}%)."

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
        "label": "LEGIT - Detailed claim, short on-chain title",
        "resume_text": "Worked at Google as a Software Engineer developing backend services and REST APIs",
        "claimed_experience": "Worked at Google as a Software Engineer from 2020 to 2022 building backend services",
        "on_chain": ["Software Engineer at Google"],
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

print(f"{'Scenario':<54} {'Risk%':>6}  {'Expected%':>10}  Verdict")
print("-" * 85)
for c in cases:
    prob, expl = simulate_resume_route(c["resume_text"], c["claimed_experience"], c["on_chain"])
    pct = f"{prob*100:.0f}%"
    exp_pct = f"{c['expect']*100:.0f}%"
    verdict = "PASS" if prob == c["expect"] or (c["expect"] == 0.0 and prob <= 0.05) else "FAIL"
    print(f"{c['label']:<54} {pct:>6}  {exp_pct:>10}  {verdict}")
    print(f"   -> {expl}")
    print()
