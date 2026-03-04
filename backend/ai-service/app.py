from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import math

app = FastAPI(title="BlockCredAI Fraud Detector")

model = joblib.load("model/resume_fraud_model.joblib")

class ResumePayload(BaseModel):
    resume_text: str
    claimed_experience: str
    unverified_mismatches: int  # how many jobs reported but not on-chain

class FraudResponse(BaseModel):
    fraud_probability: float
    explanation: str

@app.post("/predict", response_model=FraudResponse)
def predict(payload: ResumePayload):
    base_prob = model.predict_proba([payload.resume_text])[0][1]
    mismatch_boost = min(0.5, 0.15 * payload.unverified_mismatches)
    fraud_prob = min(1.0, base_prob + mismatch_boost)
    explanation = (
        f"Base model risk {base_prob:.2f}, "
        f"{payload.unverified_mismatches} unverified claims boosting risk."
    )
    return FraudResponse(
        fraud_probability=round(fraud_prob, 2),
        explanation=explanation
    )
