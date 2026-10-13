from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
import joblib
from pathlib import Path


def main():
    # ── Legitimate resumes (label = 0) ───────────────────────────────────────
    legit = [
        # Named companies / verified roles
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
        # Generic / entry-level / fresher wording that is still legitimate
        "Software developer with 2 years of experience in web development using Python and Django",
        "Fresher looking for software developer position with skills in Java and data structures",
        "Recent graduate with internship experience in machine learning and data analysis",
        "2 years experience as a web developer building websites using HTML CSS JavaScript and React",
        "Experienced in Python programming, data analysis and building REST APIs with Flask",
        "Working as a junior software engineer for 1 year developing mobile applications",
        "Computer science graduate with knowledge of algorithms, databases and software engineering",
        "Intern at tech company for 6 months working on backend services and database optimization",
        "1 year experience in Android development using Kotlin and Java at a mid-size company",
        "Accountant with 3 years experience in bookkeeping and financial reporting at a small firm",
        "Sales executive with 4 years experience in B2B software sales achieving 120 percent quota",
        "Graphic designer with 2 years experience creating marketing materials and brand identities",
        "Operations executive managing supply chain and logistics for manufacturing company for 3 years",
        "Customer support specialist with 2 years experience resolving technical issues for SaaS product",
        "Data entry operator with 3 years experience processing financial records accurately",
        "Software tester with 2 years manual and automated testing experience using Selenium",
        "Network engineer with 3 years experience configuring Cisco routers and switches",
        "Technical writer documenting APIs and software products for 2 years at software company",
        "Product manager with 4 years experience working with engineering and design teams",
        "UX designer with 3 years experience conducting user research and creating wireframes",
    ]

    # ── Fraudulent resumes (label = 1) ───────────────────────────────────────
    fraud = [
        # Impossible timelines / age conflicts
        "CEO of Fortune 500 company at age 19, managed 10000 employees for 15 years",
        "CTO at age 18 with 20 years of experience in blockchain and quantum computing",
        "VP of Engineering after 6 months of experience, led 500 engineers globally",
        "Director at Goldman Sachs with only 1 year total work experience managing 5 billion fund",
        "Chief AI Officer at Google with 3 years total experience overseeing all AI research globally",
        "Senior Principal Architect with 30 years experience since age 15",
        "Managing Director with 25 years experience graduated college 3 years ago",
        "CTO at 21 years old managing 1000 person engineering organization",
        # Unverifiable / fake employers
        "Worked at XYZ Corp as CEO for 10 years, company does not have verifiable history",
        "Co-founder of multiple billion dollar startups with no verifiable record",
        "Freelance blockchain developer earning 5 lakh per month with no portfolio",
        "Worked at a top secret government agency for 12 years cannot disclose details",
        "Serial entrepreneur founded 7 companies all acquired for undisclosed amounts",
        "CEO of anonymous consulting firm with confidential clients for 8 years",
        # Impossibly inflated responsibilities
        "Managed entire engineering department of 2000 people as a fresh graduate in 2023",
        "Single-handedly built and deployed entire ERP system for Fortune 100 company in 1 month",
        "Increased company revenue by 10000 percent in first 3 months as intern",
        "Invented proprietary AI system outperforming GPT-4 while working part time",
        "Supervised 50 PhD researchers as a bachelors graduate with 1 year experience",
        "Designed and launched 50 enterprise products simultaneously as sole engineer",
        "Generated 500 million dollars in revenue as a first year sales associate",
        # Credential overload / keyword stuffing
        "Expert in Python Java C++ Rust Go Haskell Erlang Lisp Prolog and 40 other languages simultaneously",
        "Certified in AWS GCP Azure Oracle SAP Salesforce PMP CISSP CISM CEH and 30 more in one year",
        "Full stack machine learning blockchain quantum devops security architect in 2 years",
        "Nobel prize nominated researcher published 200 papers while working full time CEO role",
        "Worked at Google Microsoft Apple Amazon Facebook Netflix all simultaneously for 5 years",
        "Master of all programming languages frameworks databases cloud platforms in 1 year",
        "Simultaneously held 5 executive positions at competing Fortune 500 companies",
    ]

    texts = legit + fraud
    labels = [0] * len(legit) + [1] * len(fraud)

    # Use CalibratedClassifierCV (cv=3) so predict_proba gives reliable probabilities.
    # Removed class_weight="balanced" — it was pushing the decision boundary too far toward fraud,
    # causing legitimate resumes to score 0.5+ incorrectly.
    base_clf = LogisticRegression(C=0.5, random_state=42, max_iter=1000)
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=1000, ngram_range=(1, 2), sublinear_tf=True)),
        ("clf", CalibratedClassifierCV(base_clf, cv=5, method="sigmoid")),
    ])
    pipe.fit(texts, labels)

    model_path = Path(__file__).resolve().parent / "resume_fraud_model.joblib"
    joblib.dump(pipe, model_path)
    print(f"Model retrained on {len(texts)} examples ({len(legit)} legit, {len(fraud)} fraud)")
    print(f"Saved to {model_path}")

    # Self-test: verify probabilities are sensible
    test_cases = [
        ("Software Engineer at Google for 3 years building distributed systems", 0),
        ("Software developer with 2 years experience in web development", 0),
        ("Fresher looking for software developer position with skills in Java", 0),
        ("Recent graduate with internship experience in machine learning", 0),
        ("CEO at age 17 managing 10000 employees with 30 years experience", 1),
        ("Expert in Python Java C++ Rust Go and 40 other languages simultaneously", 1),
        ("Single-handedly built entire ERP system for Fortune 100 in 1 month", 1),
        ("Worked at Google Microsoft Apple Amazon Facebook Netflix all simultaneously", 1),
    ]
    print("\nSelf-test results:")
    all_ok = True
    for text, expected in test_cases:
        prob = pipe.predict_proba([text])[0][1]
        pred = 1 if prob > 0.5 else 0
        ok = "OK" if pred == expected else "WRONG"
        if ok == "WRONG":
            all_ok = False
        print(f"  [{ok}] fraud_prob={prob:.3f}  expected={'fraud' if expected else 'legit'}  '{text[:65]}'")
    print(f"\nAll tests passed: {all_ok}")


if __name__ == "__main__":
    main()
