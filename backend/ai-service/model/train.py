from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib
from pathlib import Path

def main():
    texts = [
        "Worked at Google from 2020 to 2022 as Software Engineer",
        "Worked at FakeCorp with unrealistic salary and 1 month CEO",
        "3 years at Microsoft as SDE 2",
        "10 years at Random LLC, CTO at age 18"
    ]
    labels = [0, 1, 0, 1]  # 0 legit, 1 fraud

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=250, ngram_range=(1, 2))),
        ("clf", LogisticRegression(random_state=42, max_iter=250))
    ])
    pipe.fit(texts, labels)

    model_path = Path(__file__).resolve().parent / "resume_fraud_model.joblib"
    joblib.dump(pipe, model_path)
    print(f"Model trained and saved to {model_path}")

if __name__ == "__main__":
    main()
