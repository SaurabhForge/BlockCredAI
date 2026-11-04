import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
import requests
from pathlib import Path

RESUMES = Path(__file__).parent / "sample-resumes"

def test_fully_verified_onchain():
    # Candidate wallet holds TechCorp credential, and claimed/resume matches TechCorp
    with open(RESUMES / "legit_swe_google.pdf", "rb") as f:
        r = requests.post(
            "http://localhost:4000/api/scanResume",
            data={
                "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                "claimedExperience": "Senior Software Engineer at Google LLC and TechCorp",
            },
            files={"resume": ("sample.pdf", f, "application/pdf")},
        )
    print("=== TEST 1: Partial Verified On-Chain ===")
    print("HTTP Status:", r.status_code)
    data = r.json()
    print("Fraud Probability:", data.get("fraudProbability"))
    print("Risk Level:", data.get("riskLevel"))
    print("Blockchain Status:", data.get("blockchainStatus"))
    print(f"Claims: {data.get('verifiedClaims')} verified / {data.get('totalClaims')} total")

def test_single_verified_onchain():
    # Test with Account #0 (StartupXYZ) with only StartupXYZ in resume/claim
    with open(RESUMES / "legit_fresher.pdf", "rb") as f:
        r = requests.post(
            "http://localhost:4000/api/scanResume",
            data={
                "walletAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                "claimedExperience": "Full Stack Engineer at StartupXYZ",
            },
            files={"resume": ("sample.pdf", f, "application/pdf")},
        )
    print("\n=== TEST 1B: 100% Fully Verified On-Chain ===")
    print("HTTP Status:", r.status_code)
    data = r.json()
    print("Fraud Probability:", data.get("fraudProbability"))
    print("Risk Level:", data.get("riskLevel"))
    print("Blockchain Status:", data.get("blockchainStatus"))
    print(f"Claims: {data.get('verifiedClaims')} verified / {data.get('totalClaims')} total")
    print("Signals:", data.get("riskSignals")[:2])

def test_optional_claim_blank():
    with open(RESUMES / "legit_data_scientist.pdf", "rb") as f:
        # Leave claimedExperience completely BLANK to test PDF auto-detection!
        r = requests.post(
            "http://localhost:4000/api/scanResume",
            data={
                "walletAddress": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
                "claimedExperience": "",
            },
            files={"resume": ("sample.pdf", f, "application/pdf")},
        )
    print("\n=== TEST 2: Blank Claim (Auto-Detection from PDF) ===")
    print("HTTP Status:", r.status_code)
    data = r.json()
    print("Fraud Probability:", data.get("fraudProbability"))
    print("Risk Level:", data.get("riskLevel"))
    print(f"Claims: {data.get('verifiedClaims')} verified / {data.get('totalClaims')} total")
    print("Extracted Profile:", data.get("extractedProfile"))
    print("Signals:", data.get("riskSignals")[:3])

def test_blockchain_mismatch():
    with open(RESUMES / "legit_swe_google.pdf", "rb") as f:
        # Wallet belongs to FinanceHub (Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC)
        # But candidate claims Google!
        r = requests.post(
            "http://localhost:4000/api/scanResume",
            data={
                "walletAddress": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
                "claimedExperience": "Software Engineer at Google LLC",
            },
            files={"resume": ("sample.pdf", f, "application/pdf")},
        )
    print("\n=== TEST 3: Blockchain Mismatch ===")
    print("HTTP Status:", r.status_code)
    data = r.json()
    print("Fraud Probability:", data.get("fraudProbability"))
    print("Risk Level:", data.get("riskLevel"))
    print("Blockchain Status:", data.get("blockchainStatus"))
    print(f"Claims: {data.get('verifiedClaims')} verified / {data.get('totalClaims')} total")
    print("Signals:", data.get("riskSignals")[:2])
    print("Explanation:", data.get("explanation")[:120])

if __name__ == "__main__":
    test_fully_verified_onchain()
    test_single_verified_onchain()
    test_optional_claim_blank()
    test_blockchain_mismatch()
