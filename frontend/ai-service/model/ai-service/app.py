from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import os

app = FastAPI(title="BlockCredAI Fraud Detector")

# Load the trained model
model_path = os.path.join(os.path.dirname(__file__), 'model', 'resume_fraud_model.joblib')
try:
    model = joblib.load(model_path)
except FileNotFoundError:
    model = None
    print(f"Warning: Model not found at {model_path}")

class ResumePayload(BaseModel):
    """Resume data for fraud detection."""
    resume_text: str
    claimed_experience: str
    unverified_mismatches: int = 0

class FraudResponse(BaseModel):
    """Fraud detection response."""
    fraud_probability: float
    explanation: str

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict", response_model=FraudResponse)
def predict(payload: ResumePayload):
    """Predict fraud probability for resume."""
    if model is None:
        return FraudResponse(
            fraud_probability=0.5,
            explanation="Model not loaded. Please train the model first."
        )
    
    # Get base probability from model
    base_prob = model.predict_proba([payload.resume_text])[0][1]
    
    # Boost probability based on unverified mismatches
    mismatch_boost = min(0.5, 0.15 * payload.unverified_mismatches)
    fraud_prob = min(1.0, base_prob + mismatch_boost)
    
    explanation = (
        f"Base model risk: {base_prob:.2f}, "
        f"{payload.unverified_mismatches} unverified claims boosting risk."
    )
    
    return FraudResponse(
        fraud_probability=round(fraud_prob, 2),
        explanation=explanation
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
