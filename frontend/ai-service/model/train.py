from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib
import os

def main():
    """Train fraud detection model on synthetic resume data."""
    
    # Synthetic training data
    texts = [
        "Worked at Google from 2020 to 2022 as Software Engineer with competitive salary",
        "Worked at FakeCorp with unrealistic salary 500k and 1 month CEO experience",
        "3 years at Microsoft as SDE 2 with valid employment dates",
        "10 years at Random LLC, became CTO at age 18 before birth",
        "Senior Engineer at Apple 2021-2023 managing large teams",
        "Founder of 50 startups simultaneously with PhD from every Ivy League",
        "Junior Developer at Amazon 2019-2020 working on backend systems",
        "Worked at fictional DataSoft earning 1 million per month as intern",
    ]
    
    # Labels: 0 = legitimate, 1 = fraud
    labels = [0, 1, 0, 1, 0, 1, 0, 1]
    
    print("Training fraud detection model...")
    
    # Create pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=100)),
        ('clf', LogisticRegression(random_state=42, max_iter=200))
    ])
    
    # Train model
    pipeline.fit(texts, labels)
    
    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'resume_fraud_model.joblib')
    joblib.dump(pipeline, model_path)
    
    print(f"Model trained and saved to {model_path}")
    
    # Test predictions
    test_text = "Worked at Google 2020-2022 as SDE"
    prediction = pipeline.predict_proba([test_text])[0][1]
    print(f"Test prediction for legitimate resume: {prediction:.2f}")
    
    test_fraud = "CEO at age 16 earning 10 million"
    fraud_prediction = pipeline.predict_proba([test_fraud])[0][1]
    print(f"Test prediction for fraudulent resume: {fraud_prediction:.2f}")

if __name__ == "__main__":
    main()
