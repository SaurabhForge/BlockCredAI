from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib
from pathlib import Path

def main():
    # ── Legitimate resumes (label = 0) ───────────────────────────────────────
    legit = [
        # Software / Tech
        "Software Engineer at Google from 2019 to 2022, worked on distributed systems and Kubernetes infrastructure",
        "Senior Software Engineer at Microsoft for 4 years, led a team of 6 on Azure cloud services",
        "Junior Developer at Infosys, 2 years experience building REST APIs with Node.js and PostgreSQL",
        "Data Scientist at Amazon for 3 years, developed recommendation engine improving CTR by 12 percent",
        "Backend Engineer at Flipkart from 2018 to 2021, maintained payment gateway handling 1 million transactions daily",
        "Full Stack Developer at Wipro, 2.5 years, built customer portal using React and Spring Boot",
        "DevOps Engineer at IBM for 3 years, managed CI/CD pipelines for 20 microservices",
        "Machine Learning Engineer at Meta for 2 years, worked on content ranking models",
        "iOS Developer at a startup for 1.5 years, shipped 3 apps with over 50000 downloads each",
        "QA Engineer at TCS for 3 years, automated test suites reducing regression time by 40 percent",
        "Software Developer Intern at Oracle for 6 months followed by full time role for 2 years",
        "Embedded Systems Engineer at Bosch for 4 years working on automotive firmware",
        "Cloud Architect at Accenture for 5 years designing AWS solutions for enterprise clients",
        "Frontend Developer at Razorpay for 2 years building React dashboards",
        "Security Analyst at Deloitte for 3 years conducting penetration testing and VAPT assessments",
        # Finance / Business
        "Financial Analyst at JP Morgan for 3 years, managed portfolio worth 200 million USD",
        "Business Analyst at KPMG for 2 years, worked on process improvement for retail clients",
        "Marketing Manager at Unilever for 4 years, launched 5 product campaigns across South Asia",
        "HR Manager at Tata Consultancy Services for 3 years managing recruitment for 500 plus hires",
        "Project Manager at L&T for 6 years leading infrastructure projects worth 50 crore INR",
        # Healthcare / Other
        "Registered Nurse at Apollo Hospitals for 5 years working in ICU",
        "Civil Engineer at construction firm for 4 years supervising road projects",
        "Teacher at Delhi Public School for 6 years teaching mathematics to classes 9 to 12",
        "Research Associate at IIT Delhi for 2 years working on materials science project",
        "Content Writer at digital agency for 2 years producing SEO articles",
    ]

    # ── Fraudulent resumes (label = 1) ───────────────────────────────────────
    fraud = [
        # Impossible timelines / titles
        "CEO of Fortune 500 company at age 19, managed 10000 employees for 15 years",
        "CTO at age 18 with 20 years of experience in blockchain and quantum computing",
        "VP of Engineering after 6 months of experience, led 500 engineers globally",
        "Director at Goldman Sachs with only 1 year total work experience managing 5 billion fund",
        "Chief AI Officer at Google with 3 years total experience overseeing all AI research globally",
        "Senior Principal Architect with 30 years experience since age 15",
        # Fake / vague companies
        "Worked at XYZ Corp as CEO for 10 years, company does not have verifiable history",
        "Co-founder of multiple billion dollar startups with no verifiable record",
        "Freelance blockchain developer earning 5 lakh per month with no portfolio",
        "Worked at a top secret government agency for 12 years cannot disclose details",
        "Serial entrepreneur founded 7 companies all acquired for undisclosed amounts",
        # Inflated responsibilities
        "Managed entire engineering department of 2000 people as a fresh graduate in 2023",
        "Single-handedly built and deployed entire ERP system for Fortune 100 company in 1 month",
        "Increased company revenue by 10000 percent in first 3 months as intern",
        "Invented proprietary AI system outperforming GPT-4 while working part time",
        "Supervised 50 PhD researchers as a bachelors graduate with 1 year experience",
        # Credential stuffing / keyword overload
        "Expert in Python Java C++ Rust Go Haskell Erlang Lisp Prolog and 40 other languages simultaneously",
        "Certified in AWS GCP Azure Oracle SAP Salesforce PMP CISSP CISM CEH and 30 more in one year",
        "Full stack machine learning blockchain quantum devops security architect in 2 years",
        "Nobel prize nominated researcher published 200 papers while working full time CEO role",
        "Worked at Google Microsoft Apple Amazon Facebook Netflix all simultaneously for 5 years",
    ]

    texts = legit + fraud
    labels = [0] * len(legit) + [1] * len(fraud)

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=500, ngram_range=(1, 2))),
        ("clf", LogisticRegression(C=1.0, random_state=42, max_iter=500, class_weight="balanced")),
    ])
    pipe.fit(texts, labels)

    model_path = Path(__file__).resolve().parent / "resume_fraud_model.joblib"
    joblib.dump(pipe, model_path)
    print(f"Model retrained on {len(texts)} examples ({len(legit)} legit, {len(fraud)} fraud)")
    print(f"Saved to {model_path}")

    # Quick self-test
    test_cases = [
        ("Software Engineer at Google for 3 years building distributed systems", 0),
        ("CEO at age 17 managing 10000 employees with 30 years experience", 1),
    ]
    for text, expected in test_cases:
        pred = pipe.predict([text])[0]
        prob = pipe.predict_proba([text])[0][1]
        status = "OK" if pred == expected else "WRONG"
        print(f"  [{status}] fraud_prob={prob:.2f}  '{text[:60]}...'")

if __name__ == "__main__":
    main()
