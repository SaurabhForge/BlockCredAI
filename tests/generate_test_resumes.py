"""
Generate test resume PDFs covering all fraud detection scenarios.
Uses only stdlib + fpdf2 (lightweight). Run once to create the PDFs.
"""
import sys
import subprocess

# Install fpdf2 if needed
try:
    from fpdf import FPDF
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf2", "-q"])
    from fpdf import FPDF

from pathlib import Path

OUT = Path(__file__).parent / "sample-resumes"
OUT.mkdir(exist_ok=True)


def make_pdf(filename: str, content: str):
    pdf = FPDF()
    pdf.set_margins(15, 15, 15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)
    for line in content.strip().split("\n"):
        text = line.strip()
        if not text:
            pdf.ln(3)
        else:
            pdf.multi_cell(w=0, h=5, text=text, new_x="LMARGIN", new_y="NEXT")
    pdf.output(str(OUT / filename))
    print(f"  Created: {filename}")


resumes = {
    # ── LEGITIMATE resumes (expect 0% fraud if on-chain record matches) ──
    "legit_swe_google.pdf": """
        John Smith
        john.smith@email.com | linkedin.com/in/johnsmith | github.com/johnsmith

        EXPERIENCE
        Software Engineer - Google LLC
        June 2020 - August 2023 (3 years 2 months)
        - Designed and maintained distributed storage systems serving 2 billion requests/day
        - Led migration of legacy monolith to microservices architecture using Kubernetes
        - Collaborated with cross-functional teams to deliver ML feature pipeline
        - Technologies: Go, Python, Kubernetes, Spanner, BigQuery

        Software Engineering Intern - Microsoft
        May 2019 - August 2019 (3 months)
        - Built REST API for Azure DevOps dashboard using C# and .NET Core
        - Improved test coverage from 60% to 92% for core authentication module

        EDUCATION
        B.Tech Computer Science - IIT Bombay, 2020 (CGPA: 8.9)

        SKILLS
        Languages: Go, Python, Java, C++
        Tools: Kubernetes, Docker, GCP, SQL, gRPC
    """,

    "legit_fresher.pdf": """
        Priya Sharma
        priya.sharma@gmail.com | +91-9876543210

        OBJECTIVE
        Recent computer science graduate seeking a software developer role
        to apply my skills in Java, data structures, and algorithms.

        EDUCATION
        B.Tech Computer Science - VIT University, 2024 (CGPA: 8.2/10)
        Relevant courses: Data Structures, Operating Systems, DBMS, Computer Networks

        INTERNSHIP
        Software Developer Intern - Infosys (Jan 2024 - Apr 2024)
        - Worked on internal HR portal using React and Node.js
        - Fixed 23 bugs in legacy Java Spring application
        - Wrote unit tests increasing code coverage by 15%

        PROJECTS
        - E-commerce Website: Built full-stack using MERN stack (MongoDB, Express, React, Node)
        - Student Management System: Java Swing + MySQL desktop application
        - Weather App: Python Flask + OpenWeatherMap API

        SKILLS
        Java, Python, JavaScript, React, Node.js, MySQL, Git, HTML/CSS

        CERTIFICATIONS
        AWS Cloud Practitioner (2024), HackerRank Java Certificate
    """,

    "legit_data_scientist.pdf": """
        Rahul Verma
        rahul.verma@outlook.com | Bangalore, India

        PROFESSIONAL SUMMARY
        Data Scientist with 4 years of experience building machine learning models
        for e-commerce and fintech applications. Proficient in Python, SQL, and cloud ML platforms.

        EXPERIENCE
        Senior Data Scientist - Amazon India
        March 2021 - Present (3 years 8 months)
        - Built recommendation engine improving click-through rate by 18%
        - Developed fraud detection model reducing chargebacks by 34%
        - Led team of 4 data scientists; mentored 2 junior analysts
        - Tools: Python, PySpark, SageMaker, Redshift, Tableau

        Data Analyst - Flipkart
        August 2019 - February 2021 (1.5 years)
        - Analysed seller performance data for 500K+ merchants
        - Created automated reporting dashboards using Tableau and SQL
        - Wrote ETL pipelines processing 50GB+ daily data

        EDUCATION
        M.Sc Statistics - Delhi University, 2019
        B.Sc Mathematics - Delhi University, 2017

        SKILLS
        Python (pandas, sklearn, pytorch), SQL, PySpark, AWS SageMaker,
        Tableau, A/B Testing, Statistical Modelling
    """,

    "legit_marketing.pdf": """
        Ananya Patel
        ananya.patel@gmail.com | Mumbai, India

        WORK EXPERIENCE
        Digital Marketing Manager - Unilever India
        April 2021 - Present
        - Managed Rs. 2 Crore annual digital advertising budget across Facebook, Google, YouTube
        - Launched 4 product campaigns resulting in 22% increase in brand awareness
        - Coordinated with agencies, designers, and regional teams across 8 cities

        Marketing Executive - Hindustan Coca-Cola
        June 2019 - March 2021
        - Executed on-ground activation campaigns in Tier-2 cities
        - Managed influencer partnerships reaching 5 million followers
        - Reported weekly KPIs to senior management

        EDUCATION
        MBA Marketing - NMIMS Mumbai, 2019
        BBA - Pune University, 2017

        SKILLS
        Google Ads, Facebook Business Manager, SEO, Content Strategy,
        Market Research, Brand Management, MS Excel, PowerPoint
    """,

    # ── FRAUD resumes (expect 100% fraud) ──
    "fraud_impossible_timeline.pdf": """
        Alex Johnson
        alex.j@email.com

        EXPERIENCE
        Chief Technology Officer - Google
        2010 - Present (14 years)
        Managed all of Google's global AI research with 5000 engineers reporting to me.
        Single-handedly architected Google Search, Gmail, and YouTube infrastructure.

        Chief Executive Officer - Microsoft
        2008 - 2015 (7 years)
        Led company through digital transformation, managed 150,000 employees globally.
        Personally responsible for launching Windows 10 and Azure cloud platform.

        VP Engineering - Amazon
        2005 - 2008
        Designed and built the entire AWS infrastructure from scratch.

        EDUCATION
        PhD Computer Science - MIT, 2004 (Graduated at age 16)
        Born: 1988

        NOTE: 36 years old with 20+ years of executive leadership experience
        at the world's top 3 technology companies simultaneously.
    """,

    "fraud_keyword_stuffing.pdf": """
        Super Developer
        superpro@email.com

        SKILLS & EXPERTISE
        Expert level in: Python, Java, C++, C#, Go, Rust, Haskell, Erlang, Scala,
        Kotlin, Swift, Objective-C, Ruby, PHP, Perl, R, MATLAB, Fortran, COBOL,
        Assembly, Prolog, Lisp, Clojure, F#, OCaml, Elixir, Julia, Dart, TypeScript.

        Certified in: AWS Solutions Architect, GCP Professional, Azure Expert,
        Kubernetes CKA, CKAD, PMP, CISSP, CISM, CEH, OSCP, CISA, Six Sigma Black Belt,
        Oracle DBA, SAP ABAP, Salesforce Architect, Tableau, Scrum Master x5 certifications.
        All obtained within 2024.

        EXPERIENCE
        Full Stack Blockchain AI Quantum DevSecOps Architect - Anonymous Firm
        2020 - Present
        Invented proprietary AI system outperforming GPT-4 in all benchmarks while also
        managing 500 engineers, 10 product lines, and generating $500M revenue as a solo engineer.
        Company details confidential due to NDA. Cannot provide references.

        EDUCATION
        Self-taught. No formal degree required when you know everything.
    """,

    "fraud_fake_employer.pdf": """
        Mike Anderson
        m.anderson@protonmail.com

        PROFESSIONAL EXPERIENCE
        Senior Vice President - XYZ Global Solutions LLC
        January 2018 - Present
        Led strategic initiatives generating $200 million in revenue.
        Managed 800 employees across 12 countries.
        Company website: currently under reconstruction.
        References: not available due to company confidentiality policy.

        Co-Founder & CEO - Stealth Mode Startup (Confidential)
        2015 - 2018
        Built revolutionary AI platform. Company acquired for undisclosed amount.
        Cannot share details per acquisition agreement.

        Director - Top Secret Government Contractor
        2010 - 2015
        Classified work. Cannot disclose employer name, role details, or references.
        Security clearance: TOP SECRET (cannot be verified externally).

        EDUCATION
        MBA - Unaccredited Online University, 2009
        Completed in 4 months via accelerated program.
    """,

    "fraud_inflated_fresher.pdf": """
        Rohit Kumar
        rohit.k@gmail.com

        EXPERIENCE
        I am a fresher who graduated in 2024 but I want to tell you that I have
        10 years of experience in software development. I worked at Google, Microsoft,
        Apple, Amazon, Facebook, and Netflix all at the same time for 5 years each.

        As a junior developer I managed 2000 engineers globally and increased company
        revenue by 10,000 percent in my first week. I single-handedly built the entire
        backend infrastructure for a Fortune 500 company in one weekend.

        I invented a machine learning algorithm that beats GPT-4 and published
        200 research papers while working full-time as CEO of 3 companies.

        EDUCATION
        B.Tech - Some College, 2024

        SKILLS
        I know everything about all technologies.
    """,

    # ── EDGE CASES ──
    "edge_mixed_legit_claims.pdf": """
        Sarah Chen
        sarah.chen@email.com | Singapore

        WORK EXPERIENCE
        Product Manager - Grab
        January 2022 - Present (2 years 10 months)
        - Owned roadmap for GrabPay checkout flow used by 8 million monthly active users
        - Led cross-functional team of 12 (engineering, design, data) to ship 3 major features
        - Reduced checkout drop-off by 15% through A/B tested UX improvements

        Associate Product Manager - Sea Limited (Shopee)
        July 2020 - December 2021 (1.5 years)
        - Managed seller onboarding product for Southeast Asian markets
        - Worked with data team to build seller health score system
        - Coordinated localisation for 6 language markets

        EDUCATION
        Bachelor of Computing - National University of Singapore, 2020

        SKILLS
        Product Strategy, Roadmapping, SQL, Mixpanel, Figma, Agile/Scrum,
        A/B Testing, Stakeholder Management
    """,

    "edge_career_gap.pdf": """
        David Wilson
        david.w@email.com | Pune, India

        PROFESSIONAL EXPERIENCE
        Backend Developer - Persistent Systems
        March 2019 - October 2021 (2 years 7 months)
        - Developed RESTful APIs using Java Spring Boot serving 500K requests/day
        - Optimised database queries reducing average response time from 800ms to 120ms
        - Participated in code reviews and architecture discussions

        [Career Break: November 2021 - June 2023]
        Personal health reasons and family care responsibilities.

        Junior Developer - Infosys BPO
        August 2017 - February 2019 (1.5 years)
        - Maintained legacy COBOL systems for banking client
        - Wrote automation scripts in Python saving 20 hours/week manual effort

        EDUCATION
        B.E. Computer Engineering - Savitribai Phule Pune University, 2017

        SKILLS
        Java, Spring Boot, Python, SQL, REST APIs, Git, Jenkins
    """,
}

if __name__ == "__main__":
    print(f"Generating {len(resumes)} test resume PDFs into {OUT}/")
    for fname, content in resumes.items():
        make_pdf(fname, content)
    print(f"\nDone. {len(resumes)} PDFs created.")
