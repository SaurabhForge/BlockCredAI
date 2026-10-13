import win32com.client
import os
import sys

# Ensure stdout uses UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# Colors
COLOR_HEADER_TITLE = 801924      # Maroon/Brown theme color: RGB(132, 60, 12)
COLOR_BODY_TITLE = 12611584     # Navy/Teal theme: RGB(0, 112, 192)
COLOR_DARK_TEXT = 0x222222      # Charcoal/Dark text: RGB(34, 34, 34)

BASE_DIR = r"c:\Users\Saurabh Kumar\OneDrive\Desktop\BlockCredAI-main"
ASSETS_DIR = os.path.join(BASE_DIR, "presentation_assets")
FIXTURES_DIR = os.path.join(BASE_DIR, "tests", "e2e", "fixtures")
TEMPLATE_PPT = r"C:\Users\Saurabh Kumar\Downloads\ppt_template.ppt"
OUTPUT_PPTX = os.path.join(BASE_DIR, "BlockCredAI_Presentation_Report.pptx")
OUTPUT_PDF = os.path.join(BASE_DIR, "BlockCredAI_Presentation_Report.pdf")

def format_title(shape, text):
    if shape.HasTextFrame:
        tf = shape.TextFrame
        tf.TextRange.Text = text
        tf.TextRange.Font.Name = "Footlight MT Light"
        tf.TextRange.Font.Size = 28
        tf.TextRange.Font.Bold = -1
        tf.TextRange.Font.Color.RGB = COLOR_HEADER_TITLE

def apply_clean_bullets(slide, bullet_items, font_size=13.5, space_after=10, show_bullet=True):
    """
    Deletes any legacy content shapes on the slide and creates
    a clean, properly anchored, point-spaced Textbox.
    """
    # Delete old content shapes in the body area
    shapes_to_delete = []
    for sh in list(slide.Shapes):
        if "Shape;207" in sh.Name or (sh.Type == 1 and sh.Top > 70 and sh.Top < 460):
            shapes_to_delete.append(sh)
    for sh in shapes_to_delete:
        try:
            sh.Delete()
        except:
            pass

    # Create fresh Textbox
    tb = slide.Shapes.AddTextbox(1, Left=50.0, Top=85.0, Width=860.0, Height=385.0)
    tf = tb.TextFrame
    tf.WordWrap = -1
    tf.VerticalAnchor = 1 # msoAnchorTop
    tf.MarginLeft = 0
    tf.MarginTop = 0
    tf.MarginRight = 0
    tf.MarginBottom = 0

    tr = tf.TextRange
    for idx, (title, desc) in enumerate(bullet_items):
        if idx == 0:
            p = tr
        else:
            p = tr.Characters(tr.Length + 1)
            p.InsertAfter("\n")
            p = tr.Paragraphs(idx + 1)

        # Strip any existing bullet characters from title
        clean_title = title.lstrip("•").strip() if title else ""

        if clean_title:
            if show_bullet:
                p.Text = f"•  {clean_title}: {desc}"
                head_len = len(clean_title) + 4 # "•  " + title + ":"
            else:
                if clean_title.startswith("[") and clean_title.endswith("]"):
                    p.Text = f"{clean_title}  {desc}"
                    head_len = len(clean_title)
                else:
                    p.Text = f"{clean_title}: {desc}"
                    head_len = len(clean_title) + 1
        else:
            p.Text = desc
            head_len = 0

        p.Font.Name = "Calibri"
        p.Font.Size = font_size
        p.Font.Color.RGB = COLOR_DARK_TEXT
        p.ParagraphFormat.LineRuleWithin = -1
        p.ParagraphFormat.SpaceWithin = 1.0
        p.ParagraphFormat.LineRuleBefore = 0
        p.ParagraphFormat.SpaceBefore = 0
        p.ParagraphFormat.LineRuleAfter = 0 # points
        p.ParagraphFormat.SpaceAfter = space_after

        # Color and bold the heading if present
        if head_len > 0:
            try:
                p.Characters(1, head_len).Font.Bold = -1
                p.Characters(1, head_len).Font.Color.RGB = COLOR_BODY_TITLE
            except:
                pass

def setup_full_image_slide(slide, image_path, title_text):
    # Format Title
    for sh in slide.Shapes:
        if sh.HasTextFrame and sh.TextFrame.HasText:
            if sh.Top < 75 and sh.Height < 70 and sh.Width > 400:
                format_title(sh, title_text)
                break

    # Delete content shape
    shapes_to_delete = []
    for sh in list(slide.Shapes):
        if "Shape;207" in sh.Name or (sh.Type == 1 and sh.Top > 70 and sh.Top < 460):
            shapes_to_delete.append(sh)
    for sh in shapes_to_delete:
        try:
            sh.Delete()
        except:
            pass

    # Insert centered picture
    img_left = 40.0
    img_top = 85.0
    img_w = 880.0
    img_h = 385.0
    slide.Shapes.AddPicture(
        FileName=image_path,
        LinkToFile=False,
        SaveWithDocument=True,
        Left=img_left,
        Top=img_top,
        Width=img_w,
        Height=img_h
    )

def setup_two_images_slide(slide, img1_path, img2_path, label1, label2, title_text):
    for sh in slide.Shapes:
        if sh.HasTextFrame and sh.TextFrame.HasText:
            if sh.Top < 75 and sh.Height < 70 and sh.Width > 400:
                format_title(sh, title_text)
                break

    shapes_to_delete = []
    for sh in list(slide.Shapes):
        if "Shape;207" in sh.Name or (sh.Type == 1 and sh.Top > 70 and sh.Top < 460):
            shapes_to_delete.append(sh)
    for sh in shapes_to_delete:
        try:
            sh.Delete()
        except:
            pass

    gap = 25.0
    img_w = 425.0
    img_h = 285.0
    top_pos = 95.0
    left1 = 40.0
    left2 = left1 + img_w + gap

    slide.Shapes.AddPicture(
        FileName=img1_path,
        LinkToFile=False,
        SaveWithDocument=True,
        Left=left1,
        Top=top_pos,
        Width=img_w,
        Height=img_h
    )

    slide.Shapes.AddPicture(
        FileName=img2_path,
        LinkToFile=False,
        SaveWithDocument=True,
        Left=left2,
        Top=top_pos,
        Width=img_w,
        Height=img_h
    )

    # Caption 1
    lbl1 = slide.Shapes.AddTextbox(1, left1, top_pos + img_h + 8, img_w, 40)
    lbl1.TextFrame.TextRange.Text = label1
    lbl1.TextFrame.TextRange.Font.Name = "Calibri"
    lbl1.TextFrame.TextRange.Font.Size = 13
    lbl1.TextFrame.TextRange.Font.Bold = -1
    lbl1.TextFrame.TextRange.Font.Color.RGB = COLOR_BODY_TITLE
    lbl1.TextFrame.TextRange.ParagraphFormat.Alignment = 2 # Center

    # Caption 2
    lbl2 = slide.Shapes.AddTextbox(1, left2, top_pos + img_h + 8, img_w, 40)
    lbl2.TextFrame.TextRange.Text = label2
    lbl2.TextFrame.TextRange.Font.Name = "Calibri"
    lbl2.TextFrame.TextRange.Font.Size = 13
    lbl2.TextFrame.TextRange.Font.Bold = -1
    lbl2.TextFrame.TextRange.Font.Color.RGB = COLOR_BODY_TITLE
    lbl2.TextFrame.TextRange.ParagraphFormat.Alignment = 2 # Center

def main():
    print("Opening PowerPoint application...")
    ppt = win32com.client.Dispatch('PowerPoint.Application')
    pres = ppt.Presentations.Open(TEMPLATE_PPT, WithWindow=False)
    print(f"Loaded template with {pres.Slides.Count} slides.")

    print("Duplicating slides for extra sections (HLD, LLD, Flowchart, Infographic, Extra Screenshot)...")
    # Duplicate slide 11 (Screenshots) -> new slide 12
    pres.Slides(11).Duplicate()
    # Duplicate slide 10 (Conclusion) -> new slide 11 (Infographic)
    pres.Slides(10).Duplicate()
    # Duplicate slide 8 (Implementation) -> new slide 9 (Flowchart)
    pres.Slides(8).Duplicate()
    # Duplicate slide 7 (System Design) -> new slide 8 (HLD)
    pres.Slides(7).Duplicate()
    # Duplicate slide 8 (HLD) -> new slide 9 (LLD)
    pres.Slides(8).Duplicate()

    print(f"Total slides after duplication: {pres.Slides.Count}")

    # ----------------------------------------------------
    # SLIDE 1: Title Slide
    # ----------------------------------------------------
    print("Updating Slide 1: Title...")
    s1 = pres.Slides(1)
    for sh in s1.Shapes:
        if "Rounded Rectangle 48" in sh.Name or (sh.Type == 1 and sh.Top > 100 and sh.Top < 180):
            if sh.HasTextFrame and sh.TextFrame.HasText:
                sh.TextFrame.TextRange.Text = "BLOCKCREDAI: DECENTRALIZED EMPLOYMENT VERIFICATION WITH AI FRAUD DETECTION"
                sh.TextFrame.TextRange.Font.Name = "Footlight MT Light"
                sh.TextFrame.TextRange.Font.Size = 21
                sh.TextFrame.TextRange.Font.Bold = -1
                sh.TextFrame.TextRange.Font.Color.RGB = COLOR_BODY_TITLE

    # ----------------------------------------------------
    # SLIDE 2: Flow of Presentation
    # ----------------------------------------------------
    print("Updating Slide 2: Flow of Presentation...")
    flow_items = [
        ("1", "Abstract & Project Motivation"),
        ("2", "Introduction & Problem Context"),
        ("3", "Literature Review & State of the Art"),
        ("4", "System Analysis & Problem Statement"),
        ("5", "System Design (HLD & LLD Architecture)"),
        ("6", "Implementation & Execution Flowchart"),
        ("7", "Testing & Verification Matrix"),
        ("8", "Conclusion & Future Enhancements"),
        ("9", "Live Prototype Screenshots"),
        ("10", "Publications & References"),
    ]
    apply_clean_bullets(pres.Slides(2), flow_items, font_size=14, space_after=6)

    # ----------------------------------------------------
    # SLIDE 3: Abstract
    # ----------------------------------------------------
    print("Updating Slide 3: Abstract...")
    abstract_bullets = [
        ("Problem Context", "Credential fabrication, inflated job titles, and fake experience certificates severely undermine hiring integrity, with global surveys indicating over 70% of resumes contain discrepancies."),
        ("Industry Bottleneck", "Conventional background screening relies on slow manual phone/email verifications taking 2–4 weeks, costing $50–$200 per candidate with zero cross-employer data portability."),
        ("Proposed Solution", "BlockCredAI delivers an end-to-end decentralized trust platform fusing EVM smart contracts with an asynchronous AI Natural Language Processing fraud detection microservice."),
        ("Dual-Layer Innovation", "Combines non-transferable ERC-721 Soulbound-style cryptographic badges minted by authorized employers with a bi-gram TF-IDF & Logistic Regression discrepancy classifier."),
        ("Key Outcomes", "Achieves sub-second on-chain verification, 0% fraud risk for cryptographic matches, automated detection of unverified claims, and zero intermediary verification fees."),
    ]
    apply_clean_bullets(pres.Slides(3), abstract_bullets, font_size=13.5, space_after=10)

    # ----------------------------------------------------
    # SLIDE 4: Introduction
    # ----------------------------------------------------
    print("Updating Slide 4: Introduction...")
    intro_bullets = [
        ("Background & Motivation", "The explosion of remote work and automated hiring has accelerated resume fraud; hiring teams lack a cryptographically secure method to verify historical employment claims."),
        ("Decentralized Identity Vision", "Transitioning from vulnerable paper certificates and forgeable PDFs to verifiable on-chain credentials cryptographically signed by authorized corporate entities."),
        ("Blockchain Ledger Tier", "Ethereum-compatible smart contracts store immutable employee job histories, including corporate wallet identity, job descriptions, and verified date boundaries."),
        ("AI Fraud Scoring Tier", "Machine learning microservice analyzes candidate resume text against claimed experiences and on-chain records, computing real-time fraud probability scores."),
        ("Primary Target Beneficiaries", "Recruiters (instant verification), Candidates (self-sovereign credential ownership), and Enterprise Employers (tamper-proof alumni verification)."),
    ]
    apply_clean_bullets(pres.Slides(4), intro_bullets, font_size=13.5, space_after=10)

    # ----------------------------------------------------
    # SLIDE 5: Literature Review
    # ----------------------------------------------------
    print("Updating Slide 5: Literature Review...")
    lit_bullets = [
        ("1. Said et al. (IEEE Access, 2025)", "A Comprehensive Blockchain-Based System for Educational Qualifications Management and Verification (ElimuChain) — Utilized Binance Smart Chain smart contracts and IPFS for decentralized credential anti-forgery validation. [Gap Addressed: Focuses strictly on static academic qualifications; lacks dynamic multi-employer tenure tracking and real-time AI/NLP resume discrepancy auditing]."),
        ("2. Tariq et al. (IEEE TCSS, 2024)", "Cerberus: A Blockchain-Based Accreditation and Degree Verification System — Designed an immutable on-chain credential verification and revocation architecture using Ethereum smart contracts to mitigate educational fraud. [Gap Addressed: Tailored for academic degree accreditation; lacks corporate tenure tracking, role transitions, or automated ML discrepancy scoring]."),
        ("3. Sakib et al. (IEEE ICCIT, 2023)", "Blockchain Based Certificate Verification for Employee Hiring & Admission System — Developed an Ethereum smart contract and Web3 wallet workflow to verify applicant credentials directly during recruitment. [Gap Addressed: Relies on manual hash matching; lacks an automated NLP engine to extract and cross-examine unstructured PDF resume claims against chain state]."),
        ("4. Habib et al. (IEEE Access, 2022)", "Online Recruitment Fraud (ORF) Detection Using Machine Learning & NLP Techniques — Evaluated TF-IDF n-grams with Random Forest and Logistic Regression classifiers, achieving high predictive accuracy on fraudulent employment text. [Gap Addressed: Analyzes isolated text patterns only; lacks cryptographic ledger integration to verify historical candidate claims against trusted issuers]."),
        ("5. Han et al. (IEEE Access, 2022)", "A Secure Academic & Employment Certificate Management System Using Blockchain Technology — Formulated a decentralized role-based access control (RBAC) model for issuing and verifying employment credentials on Ethereum. [Gap Addressed: Suffers from high public mainnet gas overhead and lacks automated semantic CV parsing to catch inflated candidate timelines]."),
    ]
    apply_clean_bullets(pres.Slides(5), lit_bullets, font_size=11.5, space_after=6)

    # ----------------------------------------------------
    # SLIDE 6: System Analysis
    # ----------------------------------------------------
    print("Updating Slide 6: System Analysis...")
    analysis_bullets = [
        ("Problems in Existing Systems", ""),
        ("• High Latency & Bottlenecks", "Manual employer HR correspondence introduces 2 to 4-week delays, stalling high-velocity recruitment pipelines."),
        ("• Vulnerability to Forgery", "PDF offer letters, experience certificates, and reference contacts are trivial to forge using modern digital editing tools."),
        ("• Lack of Cross-Employer Trust", "Verification performed by one firm cannot be cryptographically verified or reused by subsequent prospective employers."),
        ("Problem Statement", ""),
        ("• Engineering Formulation", "To design, implement, and validate a decentralized employment verification platform that registers tamper-proof cryptographic credentials on an Ethereum blockchain and integrates a machine learning NLP pipeline to detect resume fraud and tenure discrepancies in real-time."),
    ]
    apply_clean_bullets(pres.Slides(6), analysis_bullets, font_size=13, space_after=7)

    # ----------------------------------------------------
    # SLIDE 7: System Design (Objectives & Strategy)
    # ----------------------------------------------------
    print("Updating Slide 7: System Design...")
    design_bullets = [
        ("Core Objectives of the Work", ""),
        ("• Cryptographic Badges", "Develop an ERC-721 smart contract to mint tamper-proof non-transferable employment badges with role-based access control."),
        ("• Automated Discrepancy Scoring", "Build an NLP model combining TF-IDF bi-grams and logistic regression with an unverified claim penalty boost formula."),
        ("• Multi-Tier Architectural Decoupling", "Architect cleanly separated Presentation, API Gateway, AI Microservice, and Web3 Blockchain execution layers."),
        ("• End-to-End User Experience", "Provide a responsive Web3 dashboard allowing seamless PDF resume parsing, MetaMask signing, and instant audit verdict display."),
    ]
    apply_clean_bullets(pres.Slides(7), design_bullets, font_size=13.5, space_after=10)

    # ----------------------------------------------------
    # SLIDE 8: System Design - HLD
    # ----------------------------------------------------
    print("Updating Slide 8: System Design - HLD...")
    hld_img = os.path.join(ASSETS_DIR, "hld_architecture.png")
    setup_full_image_slide(pres.Slides(8), hld_img, "SYSTEM DESIGN - HIGH LEVEL DESIGN (HLD)")

    # ----------------------------------------------------
    # SLIDE 9: System Design - LLD
    # ----------------------------------------------------
    print("Updating Slide 9: System Design - LLD...")
    lld_img = os.path.join(ASSETS_DIR, "lld_architecture.png")
    setup_full_image_slide(pres.Slides(9), lld_img, "SYSTEM DESIGN - LOW LEVEL DESIGN (LLD)")

    # ----------------------------------------------------
    # SLIDE 10: Implementation (Modules)
    # ----------------------------------------------------
    print("Updating Slide 10: Implementation (Modules)...")
    impl_bullets = [
        ("Module 1: Blockchain & Smart Contract Tier", "Implemented in Solidity 0.8.24 using Hardhat & OpenZeppelin. Enforces AccessControl roles (DEFAULT_ADMIN_ROLE, EMPLOYER_ROLE), mints ERC-721 badges, and stores JobRecord mappings on Cancun EVM."),
        ("Module 2: AI Fraud Detection Microservice", "Engineered in Python with FastAPI & Scikit-learn. Implements TF-IDF vectorization (1-2 ngrams, 500 features), Logistic Regression classification, and dynamic mismatch risk calibration at /predict."),
        ("Module 3: REST API Gateway & Resume Parser", "Built in Node.js & Express with TypeScript. Integrates Multer for memory buffers, pdfjs-dist for text extraction, Ethers.js v6 for RPC communication, and rate limiting."),
        ("Module 4: Web3 Frontend Client Portal", "Crafted with Next.js 14, React 18, and TailwindCSS. Connects MetaMask via window.ethereum, provides reactive drag-and-drop PDF upload, and renders interactive risk meters."),
    ]
    apply_clean_bullets(pres.Slides(10), impl_bullets, font_size=13.5, space_after=10)

    # ----------------------------------------------------
    # SLIDE 11: Implementation - Flowchart
    # ----------------------------------------------------
    print("Updating Slide 11: Implementation - Flowchart...")
    flow_img = os.path.join(ASSETS_DIR, "project_flowchart.png")
    setup_full_image_slide(pres.Slides(11), flow_img, "IMPLEMENTATION - SYSTEM WORKFLOW & FLOWCHART")

    # ----------------------------------------------------
    # SLIDE 12: Testing
    # ----------------------------------------------------
    print("Updating Slide 12: Testing...")
    test_bullets = [
        ("Tier 1: Smart Contract Unit Tests (Hardhat)", "Validated admin delegation, employer authorization, date range bounds, empty details rejection, and ERC-721 minting (6/6 passing in 2.3s)."),
        ("Tier 2: Backend API Validation Tests (Node.js)", "Verified EVM wallet regex sanitization, input string trimming, and Unix timestamp integer bounds (6/6 passing)."),
        ("Tier 3: Machine Learning Model Evaluation", "Tested against 46 curated real-world resumes (25 legitimate software/finance/healthcare vs. 21 fraudulent impossible timeline/keyword stuffing resumes); achieved 100% test case classification accuracy."),
        ("Tier 4: Automated End-to-End Suite (Playwright)", "Executed 5 automated browser scenarios: UI render, PDF upload, multipart scan, on-chain employer verification, and updated scan verification (5/5 passed in 26.3s)."),
    ]
    apply_clean_bullets(pres.Slides(12), test_bullets, font_size=13.5, space_after=10)

    # ----------------------------------------------------
    # SLIDE 13: Conclusion
    # ----------------------------------------------------
    print("Updating Slide 13: Conclusion...")
    conc_bullets = [
        ("Advantages of Proposed System", ""),
        ("• Sub-Second Verification", "Reduces background verification latency from 21 days down to instantaneous cryptographic RPC queries."),
        ("• Mathematical Proof of Authenticity", "Cryptographically impossible for candidates to forge employer-signed smart contract records."),
        ("• Zero Intermediary Expenses", "Eliminates recurrent corporate subscriptions to third-party verification agencies."),
        ("Future Enhancements", ""),
        ("• Zero-Knowledge Proofs (ZK-SNARKs)", "Enable privacy-preserving verification (e.g. proof of minimum tenure without disclosing exact dates or confidential employer projects)."),
        ("• Decentralized Identifiers (W3C DID)", "Standardize credentials for interoperability across global sovereign identity networks."),
        ("• Layer-2 Rollup Deployment", "Deploy contracts onto Arbitrum or Polygon for near-zero transaction gas fees."),
    ]
    apply_clean_bullets(pres.Slides(13), conc_bullets, font_size=13, space_after=7)

    # ----------------------------------------------------
    # SLIDE 14: Project Overview & Trust Ecosystem (Photo)
    # ----------------------------------------------------
    print("Updating Slide 14: Project Overview (Photo)...")
    photo_img = os.path.join(ASSETS_DIR, "project_photo_ecosystem.png")
    setup_full_image_slide(pres.Slides(14), photo_img, "PROJECT OVERVIEW & TRUST ECOSYSTEM")

    # ----------------------------------------------------
    # SLIDE 15: Screenshots - Dashboard & Scanner
    # ----------------------------------------------------
    print("Updating Slide 15: Screenshots (Dashboard & Scanner)...")
    ss1_img = os.path.join(ASSETS_DIR, "01_homepage_dashboard.png")
    ss2_img = os.path.join(ASSETS_DIR, "02_resume_upload_form.png")
    setup_two_images_slide(
        pres.Slides(15),
        ss1_img,
        ss2_img,
        "Figure 1: BlockCredAI Main Web3 Dashboard & Wallet Connect",
        "Figure 2: Candidate Resume Upload & Claim Verification Interface",
        "SCREENSHOTS - DASHBOARD & RESUME SCANNER"
    )

    # ----------------------------------------------------
    # SLIDE 16: Screenshots - AI Verification & Results
    # ----------------------------------------------------
    print("Updating Slide 16: Screenshots (AI Verification & Results)...")
    ss3_img = os.path.join(ASSETS_DIR, "03_ai_scan_result.png")
    ss4_img = os.path.join(FIXTURES_DIR, "chrome-automation-success.png")
    setup_two_images_slide(
        pres.Slides(16),
        ss3_img,
        ss4_img,
        "Figure 3: AI Fraud Risk Gauge & Verified On-Chain Badges (0% Risk)",
        "Figure 4: Automated End-to-End Verification & Smart Contract State",
        "SCREENSHOTS - AI FRAUD DETECTION & VERIFICATION RESULTS"
    )

    # ----------------------------------------------------
    # SLIDE 17: Authors Publications
    # ----------------------------------------------------
    print("Updating Slide 17: Authors Publications...")
    pub_bullets = [
        ("1. Conference Paper", "Aditya Kumar, Rajeev Ranjan, Saurabh, Saurabh Kumar, 'BlockCredAI: A Dual-Layer Decentralized Framework Fusing EVM Smart Contracts and NLP for Automated Resume Fraud Detection', submitted to IEEE International Conference on Advances in Computing, Communication and Control (ICAC3), 2026."),
        ("2. Survey-Driven Novelty & Benchmarking", "Directly addresses research gaps identified in IEEE literature surveys: extends ElimuChain [1] and Cerberus [2] by introducing dynamic ERC-721 Soulbound employment records, resolves Sakib et al. [3] via automated PDF parsing, and unites Habib et al. [4] NLP classification with zero-trust blockchain verification."),
        ("3. Institutional Affiliation", "Department of Information Science & Engineering, M S Engineering College, Bengaluru - 562157, Affiliated to Visvesvaraya Technological University (VTU), Belagavi, Karnataka, India."),
        ("4. Open-Source Artifact & Reproducibility", "Full implementation codebase, Hardhat smart contracts, FastAPI AI microservice, Next.js frontend, and the 46-resume validation benchmark dataset released publicly at: https://github.com/SaurabhForge/BlockCredAI"),
    ]
    apply_clean_bullets(pres.Slides(17), pub_bullets, font_size=12.5, space_after=8)

    # ----------------------------------------------------
    # SLIDE 18: References
    # ----------------------------------------------------
    print("Updating Slide 18: References...")
    ref_bullets = [
        ("[1]", "S. H. Said, R. S. Sinde, E. M. Kosia, and M. A. Dida, 'A Comprehensive Blockchain-Based System for Educational Qualifications Management and Verification to Counter Forgery (ElimuChain),' IEEE Access, vol. 13, pp. 31562–31589, Feb. 2025."),
        ("[2]", "A. Tariq, H. B. Haq, and S. T. Ali, 'Cerberus: A Blockchain-Based Accreditation and Degree Verification System,' IEEE Transactions on Computational Social Systems, vol. 11, no. 1, pp. 1125–1136, Feb. 2024."),
        ("[3]", "S. A. Sakib, M. Rakib, M. M. Hossain, M. S. Islam, B. R. Khan, and M. S. Reza, 'Blockchain Based Certificate Verification for Employee Hiring & Admission System,' in Proc. 26th IEEE International Conference on Computer and Information Technology (ICCIT), 2023, pp. 1–6."),
        ("[4]", "A. K. M. N. Habib, M. S. Faruque, et al., 'Online Recruitment Fraud (ORF) Detection Using Machine Learning and Natural Language Processing Techniques,' IEEE Access, vol. 10, pp. 33120–33135, 2022."),
        ("[5]", "S. K. Han, S. K. Sharma, and S. K. Sood, 'A Secure Academic and Employment Certificate Management System Using Blockchain Technology,' IEEE Access, vol. 10, pp. 45120–45133, 2022."),
        ("[6]", "OpenZeppelin, 'ERC-721 Non-Fungible Token Standard Implementation v5.0,' OpenZeppelin Contracts, 2024."),
    ]
    apply_clean_bullets(pres.Slides(18), ref_bullets, font_size=11.5, space_after=6, show_bullet=False)

    # ----------------------------------------------------
    # SLIDE 19: Questions
    # ----------------------------------------------------
    print("Slide 19: Questions / Comments / Suggestions preserved.")

    # ----------------------------------------------------
    # SLIDE 20: Thank You Slide
    # ----------------------------------------------------
    print("Updating Slide 20: Thank You...")
    s20 = pres.Slides(20)
    for sh in s20.Shapes:
        if "Round Diagonal Corner Rectangle 11" in sh.Name or (sh.Type == 1 and sh.Top > 250):
            if sh.HasTextFrame and sh.TextFrame.HasText:
                student_text = (
                    "With Regards:\n"
                    "Aditya Kumar (1ME23IS003)\n"
                    "Rajeev Ranjan (1ME23IS032)\n"
                    "Saurabh (1ME23IS039)\n"
                    "Saurabh Kumar (1ME23IS040)\n"
                    "Dept. of Information Science & Engg, MSEC"
                )
                sh.TextFrame.TextRange.Text = student_text
                sh.TextFrame.TextRange.Font.Name = "Footlight MT Light"
                sh.TextFrame.TextRange.Font.Size = 16
                sh.TextFrame.TextRange.Font.Bold = -1
                sh.TextFrame.TextRange.Font.Color.RGB = COLOR_HEADER_TITLE

    # SAVE PRESENTATION
    print(f"Saving presentation as PPTX: {OUTPUT_PPTX} ...")
    pres.SaveAs(OUTPUT_PPTX, 24)

    # EXPORT AS PDF
    print(f"Exporting PDF Report: {OUTPUT_PDF} ...")
    pres.SaveAs(OUTPUT_PDF, 32)

    pres.Close()
    ppt.Quit()
    print("SUCCESS! Complete report generated and exported to PDF.")

if __name__ == '__main__':
    main()
