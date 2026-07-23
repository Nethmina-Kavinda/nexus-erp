# Chapter 3: Methodology

---

## 3.1 Research Paradigm

This research is grounded in the **pragmatist** epistemological tradition. Pragmatism holds that the value of a concept or theory is determined by its practical consequences: what it achieves in the real world, rather than its correspondence to an abstract truth. A pragmatist research orientation is appropriate when the primary goal of a study is to construct a practical solution to a real and identifiable problem, rather than to describe or explain a pre-existing phenomenon.

This philosophical stance directly positions the study within the **Design Science Research (DSR)** paradigm, the established and well-validated methodology for artefact-producing research in Information Systems. DSR is grounded in pragmatism: it demands that a new artefact be designed to solve a real problem, developed according to well-reasoned principles, evaluated against measurable criteria, and communicated in a way that advances knowledge (Peffers et al., 2007). The primary outcome of this research is not a theory, a survey finding, or an empirical observation. It is a working software system, NEXUS ERP, whose validity is measured by whether it solves the identified problem and whether its performance can be rigorously evaluated.

Design Science Research contrasts with two other major IS research traditions. Behavioural science research seeks to generate and test theories about existing phenomena (what is). Positivist empirical research measures observable outcomes through controlled experiments or surveys. NEXUS ERP does not test an existing phenomenon; it constructs a new system. DSR is therefore not only appropriate but the only paradigm that is epistemologically aligned with this type of artefact-building research.

---

## 3.2 Research Approach

Following the pragmatist paradigm, this research adopts an **abductive reasoning approach**, moving iteratively between observed gaps in the literature and the world (what does not exist) and the proposed solution (what should be built and why). This distinguishes the approach from purely deductive reasoning (testing a hypothesis derived from theory) and purely inductive reasoning (generalising from a set of observations).

In practice, the research approach is:

- **Inductive** at the problem identification stage: patterns observed in the literature (standalone ML models, disconnected ERP systems, unexplored social signals) are generalised into a stated research gap.
- **Deductive** at the design and evaluation stage: the artefact is designed according to theoretical principles (Gaussian generation, Random Forest, SHAP Shapley values, DSRM lifecycle) and evaluated against a priori criteria (F1 macro, distribution shape tests, functional test pass/fail).
- **Pragmatic** overall: the research is driven by what works, by what produces a functional, evaluable, and useful system, rather than by adherence to a single epistemological framework.

This combined abductive/pragmatic approach is standard in Design Science Research (Peffers et al., 2007) and is reflected in the iterative, module-first development workflow described in Section 3.5.

---

## 3.3 Research Strategy

The governing research strategy is **Design Science Research** as formalised by Peffers et al. (2007). DSRM provides a six-stage lifecycle (problem identification, objectives definition, design and development, demonstration, evaluation, and communication) that structures every phase of this project from initial gap identification to thesis submission.

Within DSRM, the specific research strategy applied to system development is **iterative, module-first construction**: each subsystem (Attendance and Payroll, Inventory, Risk Scoring) was designed, built, and tested in isolation before integration into the full ERP. This iterative strategy minimises the propagation of defects across modules and ensures each component is independently verifiable before it is integrated. The ML pipeline was developed in two distinct stages, cold-start formula-label training (Stage 1) and human-feedback retraining (Stage 2), which mirrors the iterative nature of the broader development strategy.

The research also adopts a **mono-method quantitative evaluation strategy** for the ML components (accuracy, F1 macro, SHAP values) and a **structured functional testing strategy** for the ERP components (test case pass/fail verification). Together, these two tracks cover both the artefact's technical performance and its operational correctness.

---

## 3.4 Fact Collection Mechanisms

### 3.4.1 Rationale for Synthetic Data

All data used in this project is synthetically generated. No real employee records, payroll data, or social media activity were collected. This design decision is justified on three grounds:

**Ethical:** Collecting and storing real employee payroll records, attendance histories, and behavioural signals raises significant data protection concerns, including compliance with personal data legislation. Using synthetic data eliminates these concerns entirely and places the research in the lowest-risk category for ethics review.

**Controlled ground truth:** Each synthetic employee record is seeded with a hidden `risk_bias` parameter (range 0.01–0.45), which governs the probability distributions of their attendance patterns, social activity, and payroll variance. Because this ground truth is known to the researcher, the predictive model can be evaluated against the true underlying risk profile, something not possible with real-world data where true attrition propensity is inherently unobservable.

**No suitable public dataset exists:** Public HR datasets such as the widely cited IBM HR Analytics dataset (Fallucchi et al., 2020; Jain and Nayyar, 2022) provide static tabular records. No publicly available dataset contains the cross-module temporal structure required here: simultaneous monthly records for attendance, payroll, and social behaviour signals per employee, as needed to construct the 8-feature risk input vector.

The use of synthetic data in HR research is methodologically precedented. The IBM HR Analytics dataset used across dozens of peer-reviewed attrition prediction studies is itself synthetic (Fallucchi et al., 2020). Figueira and Vaz (2024) and Gonzales et al. (2023) both demonstrate that Gaussian-based synthetic data generation is a sound method for producing realistic behavioural signals when ground truth probability distributions are documented and statistically validated.

### 3.4.2 Synthetic Dataset Description

**Table 3.1: Synthetic Dataset Scale**

| Data Type | Scale |
|---|---|
| Employees | 100 (5 departments × 20 per department) |
| Departments | Engineering, Marketing, Finance, Operations, HR |
| Months of data | 6 (October 2025 – March 2026) |
| Daily attendance records | ~13,000 |
| Monthly payroll records | 600 (100 × 6) |
| Social score records | 600 |
| Feature vectors (ML input) | 600 |
| Risk score records | 600 |
| HR decision records | 600 (526 accepted, 74 corrected) |

Risk class distribution across the 600 feature vectors: Low = 40%, Medium = 35%, High = 18%, Critical = 7%. This distribution reflects a realistic organisation where most employees are not at imminent attrition risk, but a meaningful minority warrant HR attention.

### 3.4.3 Data Generation Pipeline

Data was generated using eight sequential Node.js seeding scripts executed in a fixed order:

1. `01_seedEmployees.js`: creates 100 employee profiles with randomised `risk_bias` values
2. `02_seedAttendance.js`: generates 6 months of daily attendance; absence probability governed by `risk_bias`
3. `03_seedPayroll.js`: computes monthly payroll from attendance using the EPF/ETF/overtime formula
4. `04_seedSocialScores.js`: generates synthetic `social_score` values via Gaussian sub-score modelling
5. `05_seedFeatureVectors.js`: aggregates attendance, payroll, and social data into normalised 8-feature vectors
6. `06_seedRiskScores.js`: applies the weighted composite formula to produce initial risk scores
7. `07_seedHRDecisions.js`: generates 600 HR decision records (526 accepted, 74 corrected) simulating HITL feedback
8. `08_seedInventory.js`: seeds 15 inventory items (8 raw materials, 7 finished goods) with 69 transactions

All scripts execute deterministically from a fixed random seed, ensuring the dataset is fully reproducible.

---

## 3.5 Research Methodology Execution Workflow

The following table maps the DSRM six-stage lifecycle to the specific activities carried out in this project. This constitutes the operational execution of the research methodology from problem identification through to communication.

**Table 3.2: DSRM Execution Workflow Applied to NEXUS ERP**

| DSRM Stage | Activity | How Addressed in This Research |
|---|---|---|
| **1. Problem Identification** | Define the research problem and justify why a solution has value | Systematic Literature Review across 25 papers (Chapter 2) established three isolated silos: ERP systems without ML analytics, ML models without ERP integration, and social signals without formal specification. The research gap was formally stated and supported by citation evidence. |
| **2. Relevance Justification** | Confirm the problem is real and the proposed solution is relevant | The documented cost of employee attrition (Fallucchi et al., 2020), the demonstrable predictive potential of Random Forest (Jain and Nayyar, 2022), and the theoretical basis for social behaviour signals (Roth et al., 2016) all confirm relevance. Gap Table 2.5 in Chapter 2 summarises the capability comparison against existing systems. |
| **3. Comparative Analysis and Gap Justification** | Analyse existing solutions and formalise the gap | Comparative assessment of 25 reviewed papers. No existing system was found that combines operational ERP automation, ML risk scoring with SHAP explainability, and a formally documented synthetic social behaviour signal in a single lightweight platform accessible to SMEs. |
| **4. Define and Finalise Objectives** | Specify the objectives of the artefact | Ten research objectives were defined across four categories (Identify, Analyse, Design/Develop, Evaluate) as documented in Chapter 1 Section 1.7. Objectives map directly to the seven research sub-questions. |
| **5. Design, Development, and Data Management** | Build the artefact; manage data | Full MERN stack + Flask ML microservice implementation across 12 development weeks. Eight seeding scripts generated a reproducible 100-employee × 6-month synthetic dataset. MongoDB stores all data across 9 collections with Mongoose schema enforcement. The ML pipeline uses temporal cross-validation (months 1–4 train, month 5 validate, month 6 test). |
| **6. Evaluation and Communication** | Evaluate performance; communicate findings | Two-track evaluation: (a) ML evaluation, Stage 1 vs Stage 2 comparison on accuracy, F1 macro, confusion matrix, and SHAP; (b) Social score statistical validation; (c) Functional testing of API endpoints. Results presented in Chapter 5. Communication is this thesis document, structured per NSBM BSc Research Project guidelines. |

**Figure 3.1: Peffers' DSRM Process Model Applied to NEXUS ERP**

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│  1. Problem             │────▶│  2. Objectives          │────▶│  3. Design &            │
│     Identification      │     │     of Solution         │     │     Development         │
│  (SLR → 3 silos)        │     │  (10 objectives)        │     │  (MERN + Flask + Seeds) │
└─────────────────────────┘     └─────────────────────────┘     └────────────┬────────────┘
                                                                              │
                                                                              ▼
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│  6. Communication       │◀────│  5. Evaluation          │◀────│  4. Demonstration       │
│  (This thesis)          │     │  (ML + Stats + Func.)   │     │  (System walkthrough)   │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

---

## 3.6 Project Management Methodology

### 3.6.1 Methodology Selection

This project adopted an **Agile iterative development methodology**, adapted from the Scrum framework for a solo research project context. The selection was justified on three grounds:

**Nature of the problem:** NEXUS ERP comprises four interdependent but architecturally separable modules (Authentication, ERP Modules, ML Pipeline, Frontend/Integration). An iterative approach in which each module is designed, implemented, tested, and integrated before the next begins is structurally aligned with Agile's sprint model. It allows defects to be localised to individual modules and prevents cascading failures during integration.

**Research uncertainty:** The ML pipeline's performance (accuracy, F1, SHAP importance distribution) could not be predetermined before implementation. An iterative approach allows the pipeline to be built, evaluated, and adjusted, mirroring the DSRM's allowance for iteration between Design/Development and Evaluation stages (Peffers et al., 2007).

**Solo development context:** Formal SCRUM is designed for cross-functional teams with daily standups, product owners, and scrum masters. A solo research project does not require this overhead. An adapted Agile approach, with clearly defined sprint-like phases, a backlog of features mapped to research objectives, and definition-of-done criteria, provides the organisational benefit of iterative delivery without unnecessary process overhead.

**Why not Waterfall or PRINCE2:** A waterfall methodology would require complete requirements specification before development begins and does not accommodate the feedback between building and evaluating the ML pipeline. PRINCE2 is a heavyweight governance framework designed for large, multi-stakeholder projects, which does not fit a 12-week solo research prototype.

### 3.6.2 Development Phases

Development was structured into four sprint-like phases:

| Phase | Duration | Key Deliverables |
|---|---|---|
| Phase 1: Foundation | Weeks 1–2 | MongoDB schema design, JWT/OTP auth, RBAC middleware, React routing skeleton |
| Phase 2: ERP Modules | Weeks 3–5 | Attendance API, payroll computation engine, inventory management, employee CRUD |
| Phase 3: ML Pipeline | Weeks 6–9 | Flask microservice, Random Forest with SMOTE + temporal split, SHAP integration, Stage 1 training, HR decision endpoints, Stage 2 retraining |
| Phase 4: Frontend & Evaluation | Weeks 10–12 | Risk Scoring dashboard, SHAP modal, WRL banner, retrain UI, evaluation scripts, screenshot documentation |

Each phase followed the Agile principle of incremental delivery: at the end of each phase, a testable, independently verifiable set of features was complete.

---

## 3.7 Project Timeline

**Table 3.3: Project Timeline (12-Week Development Schedule)**

| Week | Phase | Key Activities | Milestone |
|---|---|---|---|
| 1 | Foundation | Project scaffolding; MongoDB schema design for 9 collections; Mongoose model definitions | All 9 schemas defined |
| 2 | Foundation | JWT authentication middleware; bcrypt password hashing; OTP email verification; React routing | Auth system functional |
| 3 | ERP Modules | Employee management CRUD API; search/filter endpoints; RBAC enforcement | Employee module complete |
| 4 | ERP Modules | Attendance check-in/check-out API; daily summary aggregation; monthly attendance summary | Attendance module complete |
| 5 | ERP Modules | Payroll computation engine (EPF/ETF/overtime/late penalty); inventory dual-tier tracking; reorder alert emails | ERP modules complete |
| 6 | ML Pipeline | Python Flask microservice scaffolding; feature engineering review; `05_seedFeatureVectors.js` seeding | Feature vectors seeded |
| 7 | ML Pipeline | Random Forest implementation; SMOTE oversampling; temporal cross-validation split; Stage 1 training | Stage 1 model trained |
| 8 | ML Pipeline | SHAP TreeExplainer integration; `/predict` endpoint returning risk class + 8 SHAP values | SHAP predictions live |
| 9 | ML Pipeline | HR decision collection endpoints; `07_seedHRDecisions.js`; Stage 2 retraining with HR-corrected labels | Stage 2 model trained |
| 10 | Frontend & Eval | Risk Scoring dashboard; WRL banner; SHAP waterfall modal; HR accept/reject UI | Risk UI complete |
| 11 | Frontend & Eval | `evaluate.py` execution; evaluation_output artifacts generated; functional test cases completed | Evaluation data ready |
| 12 | Frontend & Eval | Screenshot documentation; thesis chapter writing; final integration testing | System ready for submission |

**Figure 3.2: Simplified Gantt Chart**

```
Week:    1    2    3    4    5    6    7    8    9   10   11   12
Phase 1: ████ ████
Phase 2:           ████ ████ ████
Phase 3:                          ████ ████ ████ ████
Phase 4:                                              ████ ████ ████
```

---

## 3.8 Ethical Considerations

This research was conducted in accordance with the ethical principles applicable to computational and data-driven research. The following specific measures were implemented:

1. **All data is synthetic.** No data corresponding to any real individual, whether employee, manager, or otherwise, was collected, stored, or analysed. The 100 employee profiles, their attendance histories, payroll records, and social score signals are entirely computer-generated.

2. **Social data is explicitly labelled as synthetic.** The MongoDB `SocialScore` collection includes a `social_data_source` field set to `'synthetic'` throughout this research. This field ensures that any future system using the codebase can distinguish synthetic signals from real API-sourced data and prevents accidental use of synthetic scores as real social media evidence in HR decisions.

3. **Informed consent framework for production deployment.** The system architecture documentation specifies that if the `social_data_source` field is transitioned to `'linkedin_api'` in a production deployment, employee consent must be obtained before any social media data is collected. The design does not presuppose consent; it requires an explicit schema change associated with a consent workflow.

4. **ML system is decision-support only.** The risk classification system does not take automated adverse action against employees. Every ML prediction is surfaced to an HR manager for review. The Accept/Reject feedback mechanism is architecturally mandatory: no endpoint acts on a risk score without HR involvement. This aligns with responsible AI principles for high-stakes decision-making (Adadi and Berrada, 2018; Mosqueira-Rey et al., 2023).

5. **No third-party data sharing.** All data resides within the local MongoDB instance. No employee records, payroll data, or model outputs are transmitted to external services beyond SMTP email alerts (which contain only aggregate KPI information, not individual employee data).

6. **Password and session security.** All user passwords are stored as bcrypt hashes (cost factor 10). JWT session tokens are short-lived and signed with a server-side secret. OTP verification via email is required for login. No plaintext credentials are stored at any layer of the system.

7. **Compliance with university ethics guidelines.** The project uses synthetic data throughout its entire lifecycle, placing it in the lowest-risk category for research ethics review. No human participants were recruited, surveyed, interviewed, or observed.

---

## 3.9 Chapter Summary

This chapter established the methodological foundation for the NEXUS ERP research project. The pragmatist epistemological paradigm was selected to reflect the research's primary goal of artefact construction rather than theory testing. The research approach combines inductive gap identification (literature → research problem) with deductive evaluation (theoretical criteria → measured outcomes), and is abductive overall. Design Science Research Methodology (Peffers et al., 2007) was selected as the governing research strategy, with its six stages explicitly mapped to NEXUS ERP activities in Table 3.2.

Data collection relies entirely on synthetic generation via eight sequential seeding scripts, producing a 100-employee × 6-month dataset that is ethically clean, fully reproducible, and the only viable approach for the cross-module temporal structure required by the 8-feature risk vector. An Agile iterative project management methodology was adopted over Waterfall or PRINCE2, justified by the nature of the multi-module system, the research uncertainty in ML pipeline performance, and the solo development context. A 12-week project timeline structured development into four phases: Foundation, ERP Modules, ML Pipeline, and Frontend/Evaluation. Ethical safeguards include complete reliance on synthetic data, explicit `social_data_source` labelling, mandatory HR review before any risk-based action, and a documented consent framework for future live API integration.

Chapter 4 describes the design and implementation of the artefact in detail, covering system architecture, database design, security architecture, all ERP modules, the synthetic social score VAR/Gaussian model, and the full ML risk scoring pipeline including feature engineering, the weighted composite formula, the Random Forest classifier, SHAP explainability, the two-stage training protocol, and the HR feedback retraining loop.

---

**References cited in this chapter:**
- Peffers, K., Tuunanen, T., Rothenberger, M.A., and Chatterjee, S. (2007). A design science research methodology for information systems research. *Journal of Management Information Systems*, 24(3), 45–77.
- Fallucchi, F., Coladangelo, M., Giuliano, R., and De Luca, E.W. (2020). Predicting employee attrition using machine learning techniques. *Computers*, 9(4), 86.
- Jain, P.K. and Nayyar, A. (2022). Automated prediction of employee attrition using ensemble model. *Computational Intelligence and Neuroscience*, 2022, 7728363.
- Figueira, Á. and Vaz, L. (2024). A systematic review of synthetic data generation techniques using generative AI. *Electronics*, 13(17), 3509.
- Gonzales, A., Guruswamy, G., and Smith, S.R. (2023). Synthetic data in health care: A narrative review. *PLOS Digital Health*, 2(1), e0000082.
- Dahmen, J. and Cook, D. (2019). SynSys: A synthetic data generation system for healthcare applications. *Sensors*, 19(5), 1181.
- Roth, P.L., Bobko, P., Van Iddekinge, C.H., and Thatcher, J.B. (2016). Social media in employee-selection-related decisions. *Journal of Management*, 42(1), 269–298.
- Adadi, A. and Berrada, M. (2018). Peeking inside the black-box: A survey on XAI. *IEEE Access*, 6, 52138–52160.
- Mosqueira-Rey, E. et al. (2023). Human-in-the-loop machine learning: A state of the art. *Artificial Intelligence Review*, 56, 3005–3054.
