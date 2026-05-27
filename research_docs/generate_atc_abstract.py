"""
Generates the ATC 2026 conference abstract submission as a .docx file.

Conference: 33rd Annual Technical Conference (ATC 2026)
Organiser: IET Sri Lanka Network
Venue: Galadari Hotel, Colombo - 22 August 2026
Abstract deadline: 30 April 2026
Submission email: ietatc2026@gmail.com

Output format follows standard IET / IEEE-style abstract layout:
- A4, single column
- Times New Roman, 11pt body / 14pt title
- Title (bold, centered) -> Authors -> Affiliations -> Abstract -> Keywords
- ~500 words, no images, no tables, no bullet points
"""

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


TITLE = (
    "An Integrated MERN-Stack ERP with Explainable Machine-Learning-Based "
    "Employee Risk Scoring Using Synthetic Social Behaviour Signals"
)

AUTHORS = [
    {
        "name": "Nethmina Kavinda Bandara",
        "superscript": "1",
        "affiliation_idx": 0,
    },
    {
        "name": "[Co-Author Name]",
        "superscript": "2",
        "affiliation_idx": 1,
        "membership": "MIET",
    },
]

AFFILIATIONS = [
    {
        "marker": "1",
        "text": (
            "Faculty of Computing, NSBM Green University, "
            "Mahenwatta, Pitipana, Homagama, Sri Lanka"
        ),
        "email": "[author1.email@nsbm.ac.lk]",
    },
    {
        "marker": "2",
        "text": "[Co-Author Affiliation, City, Country]",
        "email": "[coauthor.email@example.com]",
    },
]

ABSTRACT_PARAGRAPHS = [
    (
        "Employee attrition imposes substantial operational and financial costs on "
        "small and medium enterprises (SMEs), where the loss of a single skilled "
        "worker can disrupt entire production lines, yet most operational Enterprise "
        "Resource Planning (ERP) platforms accessible to SMEs lack predictive "
        "workforce analytics and treat HR as a transactional record-keeping function "
        "rather than a strategic decision domain. Standalone machine-learning "
        "attrition models, while extensively studied on benchmark datasets such as "
        "the IBM HR Analytics dataset, remain disconnected from day-to-day human "
        "resource (HR) operations and rarely incorporate behavioural signals from "
        "social media due to platform application programming interface (API) "
        "restrictions, cost barriers, and emerging ethical concerns around "
        "surveillance. Enterprise-grade HR analytics suites address this divide "
        "but remain financially and technically inaccessible to SMEs. This paper "
        "presents NEXUS ERP, an integrated, lightweight MERN-stack (MongoDB, "
        "Express.js, React.js, Node.js) ERP portal that unifies HR, attendance, "
        "payroll, and inventory management with an explainable, machine-learning-"
        "powered employee risk scoring engine, addressing the gap between "
        "transactional ERP systems and predictive HR analytics for resource-"
        "constrained organisations."
    ),
    (
        "The proposed system contributes three novel artefacts. First, a synthetic "
        "social behaviour signal (social_score) is introduced as a formally "
        "documented proxy for live LinkedIn and Facebook API data, generated "
        "through a Gaussian sub-score model with controlled drift and statistically "
        "validated distributional properties; the schema is designed for "
        "zero-migration transition to live data through a dedicated source-tracking "
        "field, providing a replicable pathway for academic experimentation under "
        "data-scarcity conditions. Second, an eight-feature behavioural vector is "
        "constructed from cross-module ERP data, combining attendance variability, "
        "payroll variance, absenteeism patterns, tenure, and the synthetic social "
        "signal, and is processed through both a transparent weighted composite "
        "formula and a Random Forest classifier (200 estimators, balanced class "
        "weights) hosted as a Python Flask microservice. Predictions are stratified "
        "into four risk tiers (Low, Medium, High, and Critical) and aggregated "
        "into a Workforce Risk Level (WRL) index that reports organisation-level "
        "workforce health. Third, a human-in-the-loop retraining pipeline captures "
        "HR managers' accept and reject decisions on individual predictions; the "
        "accumulated decisions become ground truth for periodic retraining, "
        "allowing the model to converge towards organisation-specific judgement."
    ),
    (
        "The system is validated using a Design Science Research methodology "
        "following Peffers' Design Science Research Methodology (DSRM). The "
        "Random Forest classifier is evaluated on synthetic but distribution-"
        "validated data using stratified five-fold cross-validation, with "
        "per-class precision, recall, and F1-score reported. SHAP (SHapley "
        "Additive exPlanations) values are integrated to provide both global "
        "feature-importance insight and per-employee explanation panels, "
        "addressing the black-box critique commonly levelled against ensemble "
        "models in HR contexts. A before-and-after comparison quantifies the "
        "effect of HR feedback on classification accuracy, demonstrating "
        "measurable improvement after a single retraining cycle. The contribution "
        "of this work is threefold: a replicable framework for synthetic social-"
        "signal modelling that respects platform API constraints; an integrated "
        "SME-targeted ERP architecture that operationalises ML-based workforce "
        "risk analytics previously available only in enterprise-grade systems; "
        "and a documented human-in-the-loop pipeline that bridges automated "
        "prediction and responsible HR decision-making. Future work will extend "
        "the system to live social-API integration, evaluate the framework on "
        "real SME datasets, and assess fairness across demographic subgroups "
        "using counterfactual SHAP analysis."
    ),
]

KEYWORDS = [
    "Employee Risk Scoring",
    "Random Forest",
    "Explainable AI",
    "Human-in-the-Loop Machine Learning",
    "Synthetic Data",
    "ERP",
]

CONFERENCE_NOTE = (
    "Submitted to: 33rd Annual Technical Conference (ATC 2026), "
    "IET Sri Lanka Network, 22 August 2026, Galadari Hotel, Colombo."
)


def set_run_font(run, size_pt, bold=False, italic=False, font="Times New Roman"):
    run.font.name = font
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.italic = italic
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    rfonts.set(qn("w:ascii"), font)
    rfonts.set(qn("w:hAnsi"), font)
    rfonts.set(qn("w:cs"), font)


def add_paragraph(doc, alignment=WD_ALIGN_PARAGRAPH.LEFT, space_after=0):
    p = doc.add_paragraph()
    p.alignment = alignment
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
    return p


def build_document():
    doc = Document()

    # A4 page setup with reasonable margins
    section = doc.sections[0]
    section.page_height = Cm(29.7)
    section.page_width = Cm(21.0)
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)

    # Default style
    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(11)

    # Conference note (small, centered, italic at top)
    p = add_paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    r = p.add_run(CONFERENCE_NOTE)
    set_run_font(r, 9, italic=True)

    # Title
    p = add_paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    r = p.add_run(TITLE)
    set_run_font(r, 14, bold=True)

    # Authors (centered, single line)
    p = add_paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, space_after=6)
    for i, a in enumerate(AUTHORS):
        if i > 0:
            r = p.add_run(", ")
            set_run_font(r, 11)
        r = p.add_run(a["name"])
        set_run_font(r, 11)
        r = p.add_run(a["superscript"])
        set_run_font(r, 11)
        r.font.superscript = True
        if a.get("membership"):
            r = p.add_run(f" ({a['membership']})")
            set_run_font(r, 11)

    # Affiliations (centered, italic, smaller)
    for aff in AFFILIATIONS:
        p = add_paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
        r = p.add_run(aff["marker"])
        set_run_font(r, 10, italic=True)
        r.font.superscript = True
        r = p.add_run(aff["text"])
        set_run_font(r, 10, italic=True)

    # Emails (centered, smaller)
    p = add_paragraph(doc, WD_ALIGN_PARAGRAPH.CENTER, space_after=18)
    email_parts = []
    for aff in AFFILIATIONS:
        email_parts.append(f"{aff['marker']}{aff['email']}")
    r = p.add_run("; ".join(email_parts))
    set_run_font(r, 10)

    # Abstract heading
    p = add_paragraph(doc, WD_ALIGN_PARAGRAPH.LEFT, space_after=6)
    r = p.add_run("Abstract")
    set_run_font(r, 11, bold=True)

    # Abstract body
    for para in ABSTRACT_PARAGRAPHS:
        p = add_paragraph(doc, WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=6)
        p.paragraph_format.first_line_indent = Cm(0.5)
        r = p.add_run(para)
        set_run_font(r, 11)

    # Keywords
    p = add_paragraph(doc, WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=0)
    r = p.add_run("Keywords: ")
    set_run_font(r, 11, bold=True)
    r = p.add_run("; ".join(KEYWORDS) + ".")
    set_run_font(r, 11, italic=True)

    return doc


def main():
    doc = build_document()
    output_path = (
        r"C:\Users\Dulhara\Desktop\fr\nethmina\system\research_docs"
        r"\NEXUS_ERP_ATC2026_Abstract.docx"
    )
    doc.save(output_path)

    word_count = sum(len(p.split()) for p in ABSTRACT_PARAGRAPHS)
    print(f"Generated: {output_path}")
    print(f"Abstract body word count: {word_count} words")
    print(f"Target: ~500 words (per ATC 2026 call)")


if __name__ == "__main__":
    main()
