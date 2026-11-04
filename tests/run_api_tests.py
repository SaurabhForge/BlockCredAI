"""
End-to-end test runner for BlockCredAI /api/scanResume.
Tests all 10 sample PDFs against the live backend.
Prints a detailed report and exits non-zero if any MUST-PASS case fails.
"""
import sys
import io
import json
# Force UTF-8 output on Windows cmd
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
import urllib.request
import urllib.error
from pathlib import Path

API = "http://localhost:4000/api/scanResume"
# Use a Hardhat test wallet that has NO on-chain records (Hardhat Account #4)
NO_RECORDS_WALLET = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"

TESTS = [
    # (pdf_file, claimed_experience, expected_result, description)
    # expected_result:
    #   "low"      = fraud_prob < 0.25  (Low Risk)
    #   "moderate" = 0.25 <= fraud_prob < 0.50
    #   "high"     = 0.50 <= fraud_prob < 0.75
    #   "critical" = fraud_prob >= 0.75
    #   "not_low"  = fraud_prob >= 0.25 (anything that is not low risk)

    # ── LEGITIMATE resumes (no on-chain) ──
    (
        "legit_swe_google.pdf",
        "Software Engineer at Google from 2020 to 2023 working on distributed systems",
        "low",       # Clean SWE resume at Google without on-chain record → calibrated Low Risk (~19%)
        "[LEGIT] Clean SWE at Google, no on-chain → Low Risk baseline",
    ),
    (
        "legit_fresher.pdf",
        "Recent graduate with internship experience at Infosys in web development",
        "low",       # Intern → fresher path → AI says low
        "[AI] Fresher with intern claim → Low Risk",
    ),
    (
        "legit_data_scientist.pdf",
        "Data Scientist at Amazon for 3 years building recommendation engines",
        "low",       # Clean legitimate data scientist resume → Low Risk
        "[LEGIT] Clean DS resume at Amazon → Low Risk",
    ),
    (
        "legit_marketing.pdf",
        "Marketing manager with experience in digital campaigns",
        "moderate",  # Vague claim but resume mentions real companies (Unilever, Coca-Cola) → AI picks up patterns → moderate
        "[AI] Vague claim but real corporate names in resume → Moderate Risk (realistic)",
    ),

    # ── FRAUD resumes ──
    (
        "fraud_impossible_timeline.pdf",
        "CTO at Google for 14 years and CEO of Microsoft for 7 years simultaneously",
        "high",      # Multiple FAANG + impossible timeline → high/critical
        "[FRAUD] Impossible timeline + simultaneous FAANG → High/Critical",
    ),
    (
        "fraud_keyword_stuffing.pdf",
        "Expert in 40 programming languages, certified in 30 certifications in one year",
        "high",      # Heavy fraud text signals → high
        "[FRAUD] Keyword stuffing → High Risk AI score",
    ),
    (
        "fraud_fake_employer.pdf",
        "SVP at XYZ Global Solutions generating 200 million revenue, details confidential",
        "not_low",   # Specific claim, no records, confidential → elevated
        "[FRAUD] Fake/confidential employer → elevated risk",
    ),
    (
        "fraud_inflated_fresher.pdf",
        "Worked at Google Microsoft Apple Amazon Facebook Netflix all simultaneously",
        "high",      # 6 FAANG + no records → high
        "[FRAUD] 6 simultaneous FAANG claims → High/Critical",
    ),

    # ── EDGE CASES ──
    (
        "edge_mixed_legit_claims.pdf",
        "Product Manager at Grab for 2 years owning GrabPay checkout roadmap",
        "not_low",   # Specific company + no on-chain → elevated
        "[EDGE] Legitimate PM resume, no on-chain verification → elevated",
    ),
    (
        "edge_career_gap.pdf",
        "Backend developer with experience in Java Spring Boot at Persistent Systems",
        "not_low",   # Specific company + no on-chain → elevated
        "[EDGE] Career gap resume + specific employer → elevated",
    ),
]

RESUME_DIR = Path(__file__).parent / "sample-resumes"


def call_api(pdf_path: Path, wallet: str, claimed: str) -> dict:
    boundary = "----FormBoundary7MA4YWxkTrZu0gW"
    body_parts = []

    def field(name, value):
        return (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'
            f"{value}\r\n"
        ).encode()

    body_parts.append(field("walletAddress", wallet))
    body_parts.append(field("claimedExperience", claimed))

    pdf_bytes = pdf_path.read_bytes()
    body_parts.append((
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="resume"; filename="{pdf_path.name}"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode() + pdf_bytes + b"\r\n")
    body_parts.append(f"--{boundary}--\r\n".encode())

    body = b"".join(body_parts)
    req = urllib.request.Request(
        API,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": e.read().decode(), "status": e.code}
    except Exception as e:
        return {"error": str(e)}


def main():
    print("=" * 70)
    print("  BlockCredAI — Resume Fraud Detection End-to-End Test Suite")
    print("=" * 70)
    print(f"  API: {API}")
    print(f"  Wallet (no on-chain records): {NO_RECORDS_WALLET}")
    print("=" * 70)

    passed = 0
    failed = 0
    results = []

    for pdf_file, claimed, expected, desc in TESTS:
        pdf_path = RESUME_DIR / pdf_file
        if not pdf_path.exists():
            print(f"\n  [SKIP] {pdf_file} not found")
            continue

        print(f"\n  Testing: {pdf_file}")
        print(f"  Desc   : {desc}")
        print(f"  Claimed: {claimed[:70]}...")

        resp = call_api(pdf_path, NO_RECORDS_WALLET, claimed)

        if "error" in resp:
            print(f"  ❌ API ERROR: {resp['error']}")
            failed += 1
            results.append((pdf_file, "ERROR", expected, desc, resp))
            continue

        prob = resp.get("fraudProbability", -1)
        explanation = resp.get("explanation", "")
        risk_level = resp.get("riskLevel", "?")
        ai_score = resp.get("aiTextScore", "?")
        blockchain_status = resp.get("blockchainStatus", "?")
        risk_signals = resp.get("riskSignals", [])
        total_claims = resp.get("totalClaims", "?")
        verified_claims = resp.get("verifiedClaims", "?")
        on_chain = resp.get("onChainJobs", [])

        # Map probability to band
        if prob < 0.25:    actual_band = "low"
        elif prob < 0.50:  actual_band = "moderate"
        elif prob < 0.75:  actual_band = "high"
        else:              actual_band = "critical"

        def band_matches(exp: str, band: str) -> bool:
            if exp == "low":      return band == "low"
            if exp == "moderate": return band == "moderate"
            if exp == "high":     return band in ("high", "critical")
            if exp == "critical": return band == "critical"
            if exp == "not_low":  return band != "low"
            if exp == "any":      return True
            return False

        ok = band_matches(expected, actual_band)
        icon = "✅" if ok else "❌"
        result_label = "PASS" if ok else "FAIL"
        if ok: passed += 1
        else:  failed += 1

        print(f"  {icon} {result_label}  fraud_prob={prob:.0%}  riskLevel={risk_level}  aiText={ai_score:.0%}  blockchain={blockchain_status}")
        print(f"     Claims: {verified_claims} verified / {total_claims} total")
        if risk_signals:
            for sig in risk_signals[:3]:
                print(f"     Signal: {sig[:90]}")
        print(f"     Explanation: {explanation[:110]}")
        print(f"     On-chain jobs: {len(on_chain)}")
        results.append((pdf_file, result_label, expected, desc, resp))

    print("\n" + "=" * 70)
    print(f"  Results: {passed} passed, {failed} failed out of {passed+failed} tests")
    print("=" * 70)

    # Detailed failure report
    failures = [(f, d, e, r) for f, s, e, d, r in results if s == "FAIL"]
    if failures:
        print("\n  FAILURES:")
        for fname, desc, expected, resp in failures:
            print(f"    • {fname}: expected={expected}, got fraud_prob={resp.get('fraudProbability','?')}")
            print(f"      {resp.get('explanation','')[:120]}")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
