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


@app.get("/")
def root():
    return {
        "service": "BlockCredAI Fraud Detector",
        "status": "ok",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": MODEL_PATH.exists()}


@app.post("/predict", response_model=FraudResponse)
def predict(payload: ResumePayload):
    base_prob = float(model.predict_proba([payload.resume_text])[0][1])

    # If any unverified mismatch exists against blockchain truth, it is 100% fraud
    if payload.unverified_mismatches > 0:
        fraud_prob = 1.0
        explanation = (
            f"100% Fraud Detected: {payload.unverified_mismatches} unverified employment "
            f"claim mismatch(es) detected against blockchain ground truth."
        )
    elif base_prob >= 0.80:
        fraud_prob = 1.0
        explanation = (
            f"100% Fraud Detected: AI text model identified severe fraudulent patterns, "
            f"impossible career timelines, or fabricated credentials."
        )
    elif base_prob < 0.20:
        fraud_prob = 0.0
        explanation = (
            "0% Fraud Risk: Resume text patterns are consistent with legitimate "
            "professional experience with zero unverified claims."
        )
    else:
        fraud_prob = round(base_prob, 2)
        explanation = (
            f"Moderate risk ({base_prob:.0%}): Resume contains unusual text patterns; "
            f"manual review recommended."
        )

    return FraudResponse(
        fraud_probability=round(fraud_prob, 2),
        explanation=explanation,
    )
