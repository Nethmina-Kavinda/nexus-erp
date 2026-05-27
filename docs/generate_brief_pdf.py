from fpdf import FPDF


class BriefPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(128, 128, 128)
            self.cell(0, 8, "NEXUS ERP - Supervisor Meeting Brief | 2 April 2026", align="C")
            self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def check_space(self, needed=40):
        """Add page only if not enough space remaining."""
        if self.get_y() + needed > self.h - 20:
            self.add_page()

    def section_title(self, title):
        self.check_space(30)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(25, 60, 120)
        self.ln(6)
        self.cell(0, 8, title)
        self.ln(9)
        self.set_draw_color(25, 60, 120)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def sub_title(self, title):
        self.check_space(20)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(50, 50, 50)
        self.ln(2)
        self.cell(0, 7, title)
        self.ln(8)

    def body_text(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bold_text(self, text):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def bullet(self, text, indent=10):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.cell(indent)
        self.set_font("Helvetica", "B", 10)
        self.cell(5, 5.5, "-")
        self.set_font("Helvetica", "", 10)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def simple_table(self, headers, rows, col_widths=None):
        """Simple table using single-line cells to avoid alignment issues."""
        if col_widths is None:
            col_widths = [190 / len(headers)] * len(headers)

        row_height = 7

        # Check if entire table fits, if not start new page
        total_height = row_height * (len(rows) + 1) + 5
        self.check_space(min(total_height, 60))

        # Header row
        self.set_font("Helvetica", "B", 9)
        self.set_fill_color(25, 60, 120)
        self.set_text_color(255, 255, 255)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], row_height, h, border=1, fill=True, align="C")
        self.ln()

        # Data rows
        self.set_font("Helvetica", "", 9)
        fill = False
        for row in rows:
            if fill:
                self.set_fill_color(240, 245, 255)
            else:
                self.set_fill_color(255, 255, 255)
            self.set_text_color(40, 40, 40)

            # Check if we need a new page mid-table
            if self.get_y() + row_height > self.h - 20:
                self.add_page()

            for i, cell_text in enumerate(row):
                align = "L"
                if i > 0 and len(cell_text) < 20:
                    align = "C"
                self.cell(col_widths[i], row_height, cell_text, border=1, fill=True, align=align)
            self.ln()
            fill = not fill

        self.ln(4)


pdf = BriefPDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=20)

# ============ COVER / TITLE ============
pdf.add_page()
pdf.ln(30)
pdf.set_font("Helvetica", "B", 26)
pdf.set_text_color(25, 60, 120)
pdf.cell(0, 12, "NEXUS ERP", align="C")
pdf.ln(14)
pdf.set_font("Helvetica", "", 14)
pdf.set_text_color(80, 80, 80)
pdf.cell(0, 8, "Supervisor Meeting Brief", align="C")
pdf.ln(20)

pdf.set_draw_color(25, 60, 120)
pdf.line(60, pdf.get_y(), 150, pdf.get_y())
pdf.ln(15)

info = [
    ("Student", "Nethmina Kavinda Bandara"),
    ("Programme", "BSc (Hons) Computer Science"),
    ("University", "NSBM Green University"),
    ("Methodology", "Design Science Research (Peffers' DSRM)"),
    ("Date", "2 April 2026"),
]
for label, value in info:
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(25, 60, 120)
    pdf.cell(45, 7, f"{label}:", align="R")
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 7, f"  {value}")
    pdf.ln(8)

pdf.ln(15)
pdf.set_font("Helvetica", "I", 10)
pdf.set_text_color(100, 100, 100)
pdf.multi_cell(0, 6, "Project Title: Design and Development of an Integrated ERP Portal with Employee Risk Scoring Using Synthetic Social Behaviour Signals", align="C")
pdf.ln(8)
pdf.set_font("Helvetica", "", 10)
pdf.set_text_color(100, 100, 100)
pdf.multi_cell(0, 6, "Tech Stack: MERN (MongoDB, Express.js, React.js, Node.js) + Python Flask ML Microservice", align="C")


# ============ PROJECT OVERVIEW ============
pdf.add_page()
pdf.section_title("1. Project Overview")
pdf.body_text("NEXUS ERP is a web-based Enterprise Resource Planning system for SMEs that integrates four core modules into a single platform:")
pdf.bullet("HR / Employee Management - employee profiles, roles, CRUD operations")
pdf.bullet("Attendance + Automated Payroll - salary computation from check-in/out data (EPF/ETF, overtime, late penalties)")
pdf.bullet("Inventory Management - dual-tier stock tracking with automated reorder alerts")
pdf.bullet("ML-Powered Employee Risk Scoring Engine - the core research contribution")
pdf.ln(2)
pdf.body_text("The system is not just an ERP. It is a decision-support artefact - the ERP collects operational data, and the ML engine transforms that data into actionable workforce risk insights.")


# ============ CURRENT PROGRESS ============
pdf.section_title("2. Current Progress")
pdf.simple_table(
    ["Item", "Status"],
    [
        ["Research proposal", "Completed and submitted"],
        ["Source of Truth document (full project spec)", "Completed"],
        ["Project plan with day-by-day schedule", "Completed"],
        ["Technology stack finalised", "Completed"],
        ["Research objectives & questions defined", "Completed (8 objectives, 7 RQs)"],
        ["Database schema design (9 collections)", "Designed and documented"],
        ["API endpoint architecture (~21 endpoints)", "Designed and documented"],
        ["System architecture and data flow", "Fully designed"],
        ["SLR paper search", "Started - identifying 20-25 papers"],
    ],
    [110, 80]
)


# ============ SLR IN PROGRESS ============
pdf.section_title("3. Current Phase: Systematic Literature Review")
pdf.body_text("The SLR is in active progress, targeting submission by 10 April 2026. It covers 5 thematic areas:")

pdf.simple_table(
    ["Theme", "Papers", "Covers RQs"],
    [
        ["ERP systems for SMEs (MERN/web-based)", "3-4", "RQ1, RQ2, RQ7"],
        ["Employee attrition prediction using ML", "8-10", "RQ4"],
        ["Social media signals in HR analytics", "3-4", "RQ3"],
        ["Synthetic data generation (Gaussian)", "2-3", "RQ3"],
        ["Explainable AI + Human-in-the-Loop ML", "2-3", "RQ5"],
    ],
    [100, 25, 65]
)

pdf.bold_text("SLR Timeline:")
pdf.simple_table(
    ["Date", "Task"],
    [
        ["Apr 1-3", "Paper search and summarisation"],
        ["Apr 4-6", "Draft SLR - introduction, search strategy, thematic review"],
        ["Apr 7-8", "Comparison table, gap analysis, research gap justification"],
        ["Apr 9-10", "Review, IEEE formatting, final proofread and submission"],
    ],
    [30, 160]
)


# ============ RESEARCH CONTRIBUTION ============
pdf.section_title("4. Research Contribution")

pdf.sub_title("The Research Gap")
pdf.body_text("Existing systems fall into three silos:")
pdf.bullet("ERP only (SAP, Odoo) - no ML-based employee risk scoring")
pdf.bullet("ML attrition prediction only - standalone models, not integrated into ERP")
pdf.bullet("Enterprise HR analytics - expensive, not tailored for SMEs")
pdf.ln(2)
pdf.bold_text("No lightweight ERP system currently combines payroll automation, a formally documented synthetic social behaviour signal, and ML-powered employee risk scoring with a human-in-the-loop feedback mechanism.")

pdf.ln(4)
pdf.sub_title("Three Pillars of Novelty")

pdf.bold_text("Pillar 1: Synthetic Social Score as API Proxy")
pdf.bullet("Composite signal (0.0-1.0) using Gaussian sub-score modelling (Box-Muller transform)")
pdf.bullet("4 sub-scores: job search (0.35), post drop (0.25), network growth (0.20), sentiment (0.20)")
pdf.bullet("Formally documented as a placeholder for LinkedIn/Facebook API data")
pdf.bullet("Schema designed for zero-migration transition to live data")

pdf.ln(2)
pdf.bold_text("Pillar 2: Integrated Risk Scoring in Lightweight ERP")
pdf.bullet("8-feature vector from cross-module ERP data (attendance + payroll + social)")
pdf.bullet("Dual scoring: weighted composite formula (Node.js) + Random Forest classifier (Flask)")
pdf.bullet("Risk tiers: Low / Medium / High / Critical")

pdf.ln(2)
pdf.bold_text("Pillar 3: Human-in-the-Loop ML Retraining")
pdf.bullet("HR managers accept/reject ML predictions")
pdf.bullet("Accumulated decisions become ground truth for model retraining")
pdf.bullet("Bridges gap between automated prediction and responsible HR decision-making")


# ============ METHODOLOGY ============
pdf.section_title("5. Methodology - Design Science Research")
pdf.body_text("Design Science Research (Peffers' DSRM) was chosen because the primary outcome is an IT artefact that solves a real-world problem.")

pdf.simple_table(
    ["DSRM Stage", "Application in This Project"],
    [
        ["1. Problem Identification", "SMEs lack integrated ERP with predictive workforce analytics"],
        ["2. Objectives", "Build NEXUS ERP with automated payroll, inventory, ML risk scoring"],
        ["3. Design & Development", "MERN stack implementation + Flask ML microservice"],
        ["4. Demonstration", "System walkthrough with role-based use cases"],
        ["5. Evaluation", "Functional testing + ML evaluation (accuracy, SHAP, confusion matrix)"],
        ["6. Communication", "The thesis document itself"],
    ],
    [55, 135]
)


# ============ FULL TIMELINE ============
pdf.section_title("6. Full Project Timeline")

pdf.simple_table(
    ["Phase", "Dates", "Deliverable"],
    [
        ["Phase 1: SLR + Research", "Apr 1-10", "SLR document ready for submission"],
        ["Phase 2: Backend Dev", "Apr 11-20", "Full backend API with seed data"],
        ["Phase 3: ML Microservice", "Apr 21-25", "ML pipeline - predict, train, retrain, explain"],
        ["Phase 4: Frontend Dev", "Apr 26-May 2", "Full frontend with dashboard and risk UI"],
        ["Phase 5: Evaluation", "May 3-5", "All evaluation metrics and charts"],
        ["Phase 6: Thesis Writing", "May 5-10", "Complete thesis (Chapters 1-6)"],
        ["Phase 7: Testing", "May 11-12", "Fully tested codebase + documentation"],
        ["Phase 8: Delivery", "May 13-16", "Final handover + mentorship sessions"],
    ],
    [55, 35, 100]
)


# ============ EVALUATION STRATEGY ============
pdf.section_title("7. Evaluation Strategy")

pdf.sub_title("ML Evaluation (70% of evaluation chapter)")
pdf.bullet("Classification accuracy and confusion matrix")
pdf.bullet("Precision / Recall / F1 score per risk class")
pdf.bullet("Feature importance analysis")
pdf.bullet("SHAP explainability plots")
pdf.bullet("Before/after retraining comparison")

pdf.ln(2)
pdf.sub_title("Social Score Validation")
pdf.bullet("Gaussian distribution verification (histograms, Q-Q plots)")
pdf.bullet("Mean/std dev checks against configured parameters")
pdf.bullet("Temporal drift analysis for at-risk employees")

pdf.ln(2)
pdf.sub_title("Functional Testing")
pdf.bullet("Payroll accuracy verification")
pdf.bullet("Inventory alert response time")
pdf.bullet("API performance and security testing (JWT, OTP, RBAC)")


# ============ THESIS STRUCTURE ============
pdf.section_title("8. Thesis Chapter Structure")

pdf.simple_table(
    ["Chapter", "Title", "Weight"],
    [
        ["1", "Introduction", "10%"],
        ["2", "Literature Review (SLR)", "15%"],
        ["3", "Methodology (DSR)", "10%"],
        ["4", "Design & Implementation", "25%"],
        ["5", "Evaluation & Results", "30%"],
        ["6", "Conclusion & Future Work", "10%"],
    ],
    [25, 110, 55]
)
pdf.body_text("Chapters 4 and 5 carry 55% of the thesis weight, with heavy focus on the ML risk scoring engine, social score model, and SHAP-based evaluation.")


# ============ QUESTIONS FOR SUPERVISOR ============
pdf.section_title("9. Suggested Questions for Supervisor")

questions = [
    "Are you satisfied with the SLR thematic structure covering 5 areas? Should I add or merge any themes?",
    "For the evaluation chapter, is the planned ML metrics set (confusion matrix, SHAP, F1, retraining comparison) sufficient?",
    "Do you have any concerns about using synthetic data with Gaussian modelling instead of a real dataset?",
    "Should I prioritise any particular chapter or section for early draft review?",
    "What formatting standard should I follow - IEEE or university-specific template?",
    "Are there any additional papers or references you'd recommend for the literature review?",
]
for i, q in enumerate(questions, 1):
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(25, 60, 120)
    pdf.cell(8, 6, f"{i}.")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(0, 6, q)
    pdf.ln(3)


# ============ KEY CONFIDENCE POINTS ============
pdf.section_title("10. Key Points to Communicate")

points = [
    "The project is well-planned with a detailed day-by-day schedule covering all 8 phases.",
    "The research gap is clearly identified - no existing system combines all three novelty pillars.",
    "The methodology (DSR) is appropriate for building and evaluating an IT artefact.",
    "The SLR is actively in progress and on track for April 10 submission.",
    "All data is synthetic by design - formally modelled, statistically validated, with a documented production pathway.",
    "The ML component uses SHAP for explainability - aligning with responsible AI practices.",
    "The system includes a human-in-the-loop feedback mechanism - no automated adverse HR actions.",
]
for p in points:
    pdf.bullet(p)

pdf.ln(8)
pdf.set_draw_color(25, 60, 120)
pdf.line(60, pdf.get_y(), 150, pdf.get_y())
pdf.ln(6)
pdf.set_font("Helvetica", "I", 10)
pdf.set_text_color(100, 100, 100)
pdf.cell(0, 6, "Prepared for supervisor meeting on 2 April 2026.", align="C")


# ============ SAVE ============
output_path = r"C:\Users\Dulhara\Desktop\fr\nethmina\system\Supervisor_Meeting_Brief_Apr2.pdf"
pdf.output(output_path)
print(f"PDF saved to: {output_path}")
print(f"Total pages: {pdf.page_no()}")
