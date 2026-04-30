from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
from pathlib import Path

app = FastAPI(title="BlockCredAI Fraud Detector")

MODEL_PATH = Path(__file__).resolve().parent / "model" / "resume_fraud_model.joblib"
model = joblib.load(MODEL_PATH)

class ResumePayload(BaseModel):
    resume_text: str = Field(min_length=10, max_length=10000)
    claimed_experience: str = Field(min_length=10, max_length=2000)
    unverified_mismatches: int = Field(ge=0, le=10)

class FraudResponse(BaseModel):
    fraud_probability: float = Field(ge=0, le=1)
    explanation: str

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": MODEL_PATH.exists()}

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
