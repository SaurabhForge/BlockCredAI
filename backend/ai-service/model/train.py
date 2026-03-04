from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib

def main():
    texts = [
        "Worked at Google from 2020 to 2022 as Software Engineer",
        "Worked at FakeCorp with unrealistic salary and 1 month CEO",
        "3 years at Microsoft as SDE 2",
        "10 years at Random LLC, CTO at age 18"
    ]
    labels = [0, 1, 0, 1]  # 0 legit, 1 fraud

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("clf", LogisticRegression())
    ])
    pipe.fit(texts, labels)

    joblib.dump(pipe, "resume_fraud_model.joblib")

if __name__ == "__main__":
    main()
