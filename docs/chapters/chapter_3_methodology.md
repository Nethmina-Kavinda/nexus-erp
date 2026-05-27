# Chapter 3 — Methodology

## 3.1 Research Philosophy and Approach

This research is grounded in the **pragmatist** epistemological tradition. Rather than seeking to describe or explain a pre-existing phenomenon, the goal of this project is to produce a functional artefact — NEXUS ERP — that demonstrably solves a real and identifiable problem. The primary outcome is not a theory but a working system, and the validity of the research is measured by whether the artefact works as intended and whether its performance can be rigorously evaluated.

This philosophical stance positions the study within the **Design Science Research (DSR)** paradigm, which is the dominant methodology for artefact-producing research in Information Systems. DSR distinguishes itself from the two other major IS research traditions: behavioural science, which generates and tests theories about existing phenomena, and positivist empirical research, which measures observations through controlled experiments or surveys. NEXUS ERP does not test an existing phenomenon — it constructs a new system. DSR is therefore the appropriate and well-established choice for this type of work.

The practical research approach within DSR is **iterative and module-driven**: each subsystem (Attendance and Payroll, Inventory, Risk Scoring) was designed, built, tested, and integrated before progressing to the next. The ML pipeline was developed in two distinct stages, deliberately separating cold-start training from human-feedback-driven refinement. This iterative structure reflects the natural development flow of a multi-module ERP rather than a single-cycle waterfall approach.

---

## 3.2 Design Science Research Methodology (DSRM)

Peffers et al. (2007) proposed a widely adopted six-stage DSRM process model for conducting and communicating design science research in Information Systems. The model provides a structured lifecycle that begins with problem identification and ends with communication of the findings. Its six stages are sequential but permit iteration, particularly between Design & Development and Evaluation.

**Figure 3.1 — Peffers' DSRM Process Model (adapted)**

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  1. Problem         │────▶│  2. Objectives of   │────▶│  3. Design &        │
│     Identification  │     │     Solution        │     │     Development     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
                                                                    │
                                                                    ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  6. Communication   │◀────│  5. Evaluation      │◀────│  4. Demonstration   │
│     (This Thesis)   │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

The following table maps each DSRM stage to its specific application in this project:

**Table 3.1 — DSRM Stage Mapping for NEXUS ERP**

| Stage | DSRM Description | Application in This Project |
|---|---|---|
| 1. Problem Identification | Define the research problem and justify the value of a solution | Small-to-medium enterprises lack an integrated, affordable system that automates payroll and inventory while simultaneously providing ML-powered employee attrition risk scoring. Existing ERP systems (SAP, Odoo) offer no predictive workforce analytics; standalone ML attrition models exist but are disconnected from live operational data. |
| 2. Objectives of Solution | Define the objectives of the artefact that would address the problem | Design NEXUS ERP: a lightweight MERN-stack ERP integrating automated payroll computation, dual-tier inventory management, a formally modelled synthetic social behaviour signal, a Random Forest risk scoring engine with SHAP explainability, and a human-in-the-loop HR feedback retraining loop. |
| 3. Design & Development | Build the artefact | Full implementation of the MERN stack (React 18 + Vite frontend, Node.js + Express.js backend, MongoDB) integrated with a Python Flask ML microservice. Six MongoDB seeding scripts generate a 100-employee synthetic dataset across 6 months. The RF classifier is trained in two stages using temporal cross-validation. |
| 4. Demonstration | Use the artefact to solve an instance of the problem | System walkthrough across all four roles (Admin, HR Manager, Manager, Employee): login with JWT/OTP, attendance recording, payroll generation, inventory management, ML risk prediction with SHAP modal, HR accept/reject decision, and model retraining trigger. |
| 5. Evaluation | Assess how well the artefact addresses the problem | Two-track evaluation: (a) ML evaluation — classification accuracy, F1 macro, confusion matrix, SHAP feature importance, and Stage 1 vs Stage 2 comparison; (b) Functional testing — API correctness, RBAC enforcement, payroll formula verification, and inventory alert triggering. |
| 6. Communication | Communicate the problem, artefact, and results to relevant audiences | This thesis document, structured per university BSc Research Project requirements. |

---

## 3.3 Data Collection Strategy

### 3.3.1 Rationale for Synthetic Data

All data used in this project is synthetically generated. No real employee records, payroll data, or social media activity were collected. This design decision is justified on three grounds:

**Ethical:** Collecting and storing real employee payroll records, attendance histories, and behavioural signals raises significant data protection concerns, including compliance with personal data legislation. Using synthetic data eliminates these concerns entirely.

**Controlled ground truth:** Each synthetic employee record is seeded with a hidden `risk_bias` parameter (range 0.01–0.45), which governs the probability distribution of their attendance patterns, social activity, and payroll variance. Because this ground truth is known to the researcher, the predictive model can be evaluated against the true underlying risk profile — something not possible with real-world data where the ground truth is inherently unobservable.

**No suitable public dataset exists:** Public HR datasets such as the widely cited IBM HR Analytics dataset (Fallucchi et al., 2020; Jain and Nayyar, 2022) provide static tabular employee records. No publicly available dataset contains the cross-module temporal structure required here — simultaneous monthly records for attendance, payroll, and social behaviour signals per employee, as needed to construct the 8-feature risk vector. Synthetic generation is the only viable method.

The use of synthetic data is methodologically well-precedented. The IBM HR Analytics dataset used in dozens of peer-reviewed attrition prediction studies is itself synthetic (Fallucchi et al., 2020). Figueira and Vaz (2024) and Gonzales et al. (2023) both demonstrate that Gaussian-based synthetic data generation is a sound method for producing realistic behavioural signals when ground truth probability distributions are documented and statistically validated.

### 3.3.2 Dataset Description

The synthetic dataset comprises:

**Table 3.2 — Synthetic Dataset Scale**

| Data Type | Count |
|---|---|
| Employees | 100 (5 departments × 20 per department) |
| Departments | Engineering, Marketing, Finance, Operations, HR |
| Months of data | 6 (October 2025 – March 2026) |
| Attendance records | ~13,000 daily check-in/out records |
| Payroll records | 600 (100 employees × 6 months) |
| Feature vectors (ML input) | 600 |
| Risk scores | 600 |
| HR decisions | 600 (526 accepted, 74 corrected) |
| Social score records | 600 |

Risk class distribution across the 600 feature vectors: Low = 40%, Medium = 35%, High = 18%, Critical = 7%. This reflects a realistic organisation where most employees are not at imminent attrition risk, but a meaningful minority require attention.

### 3.3.3 Data Generation Pipeline

Data was generated using six sequential Node.js seeding scripts:

1. `01_seedEmployees.js` — creates 100 employee records with randomised `risk_bias` values, stored in the MongoDB `Employees` collection
2. `02_seedAttendance.js` — generates 6 months of daily attendance per employee, with absence probability and late-arrival frequency governed by the employee's `risk_bias`
3. `03_seedPayroll.js` — computes monthly payroll records from attendance data using the EPF/ETF/overtime formula
4. `04_seedSocialScores.js` — generates synthetic `social_score` values via Gaussian sub-score modelling (see Section 4.5 for full detail)
5. `05_seedFeatureVectors.js` — aggregates attendance, payroll, and social data into normalised 8-feature vectors per employee per month
6. `06_seedRiskScores.js` — applies the weighted composite formula to produce initial risk scores and classification labels

All six scripts execute deterministically from a fixed random seed, ensuring reproducibility of the dataset. The ML model can be retrained at any time and will produce statistically consistent results.

---

## 3.4 Development Approach

Development followed an **iterative, module-first** approach with four broad phases:

**Phase 1 — Foundation (Weeks 1–2):** Project scaffolding, MongoDB schema design for all 9 collections, JWT authentication with OTP email verification, role-based access control middleware, and the React frontend skeleton with routing.

**Phase 2 — ERP Modules (Weeks 3–5):** Attendance recording and monthly summary API, payroll computation engine with EPF/ETF and late-penalty calculations, inventory management with dual-tier stock tracking and automated reorder alerts, and employee management CRUD.

**Phase 3 — ML Pipeline (Weeks 6–9):** Python Flask microservice setup, Random Forest classifier implementation with temporal train/validation/test split, SMOTE oversampling, SHAP TreeExplainer integration, and the `/predict` and `/train` endpoints. Node.js proxy endpoints connecting the backend to the ML service. Stage 1 training on formula-derived labels. HR decision collection and Stage 2 retraining on HR-corrected labels.

**Phase 4 — Frontend, Integration, and Evaluation (Weeks 10–12):** Risk Scoring dashboard with WRL banner, SHAP waterfall modal, HR accept/reject UI, retrain progress modal, evaluation script execution, and screenshot documentation.

Each module was functionally tested before integration. The ML pipeline was validated independently (accuracy, F1, SHAP) before being connected to the frontend. This phased approach allowed defects to be localised to individual modules rather than propagating through the full stack.

---

## 3.5 Evaluation Strategy

Evaluation follows a **two-track framework** that maps directly onto the research questions:

### Track 1 — ML Model Evaluation (addresses RQ4 and RQ5)

The ML model is evaluated using standard supervised classification metrics on a held-out test set (month 6 — the final month of the 6-month dataset, not seen during training):

- **Classification accuracy** — percentage of predictions that match the true label
- **Precision per class** — of all employees predicted as *High*, how many actually are *High*?
- **Recall per class** — of all employees who are truly *High* risk, how many did the model correctly identify?
- **F1 score per class** — harmonic mean of precision and recall, providing a single measure that penalises both types of error
- **F1 macro** — unweighted average of per-class F1 scores; used as the primary comparative metric because it treats each class equally and does not reward a model that merely performs well on the majority class
- **Confusion matrix** — visualises misclassifications across all four risk tiers
- **Feature importance** — RF's native Gini-based feature importance, showing which of the 8 features the model relied on most
- **SHAP values** — per-prediction feature contributions via SHAP TreeExplainer, used both for individual employee explanations in the UI and for aggregated feature analysis in the evaluation chapter

The **Stage 1 vs Stage 2 comparison** is the centrepiece of the evaluation. Stage 1 trains on formula-derived labels (cold start). Stage 2 trains on HR-corrected labels accumulated through the feedback loop. The F1 macro improvement from Stage 1 to Stage 2 directly quantifies the value added by the human-in-the-loop mechanism, answering RQ5.

**Temporal split justification:** Months 1–4 are used for training, month 5 for validation, and month 6 for testing. A temporal (chronological) split is mandatory for this dataset because the feature vectors contain within-employee autocorrelation — an employee's behaviour in month 4 is correlated with their behaviour in months 1–3. Using a random split would allow future months to leak into the training set, artificially inflating accuracy and failing to simulate real-world deployment conditions where the model is always predicting into the future.

### Track 2 — Social Score Validation (addresses RQ3)

The synthetic `social_score` is validated against its intended statistical properties to confirm that the Gaussian generation model produced coherent, realistic-looking signals rather than arbitrary noise:

- **Distribution shape** — histograms and Q-Q plots should confirm approximate Gaussian shape
- **Mean and standard deviation** — sub-score means should be within ±0.10 of the configured base means (μ_d)
- **Range compliance** — all values should be clamped within [0.0, 1.0]
- **Sub-score correlation** — moderate positive inter-correlation expected (r = 0.2–0.5), because all four sub-scores are driven by the same underlying `risk_bias`
- **Temporal drift** — employees with high `risk_bias` should exhibit a gradual upward trend in `social_score` across months 1–6, simulating real disengagement buildup

### Track 3 — Functional Testing (addresses RQ1, RQ2, RQ6, RQ7)

A structured set of test cases verifies the correctness of the ERP modules, security mechanisms, and API endpoints. Test cases are defined by input, expected output, and observed result. Full results are presented in Section 5.9.

---

## 3.6 Ethical Considerations

This research was conducted in accordance with the ethical principles applicable to computational and data-driven research. The following specific measures were implemented:

1. **All data is synthetic.** No data corresponding to any real individual — employee, manager, or otherwise — was collected, stored, or analysed. The 100 employee profiles, their attendance histories, payroll records, and social score signals are entirely computer-generated.

2. **Social data is explicitly labelled as synthetic.** The MongoDB `SocialScore` collection includes a `social_data_source` field, which is set to `'synthetic'` throughout this research. This field ensures that any future system using the codebase can distinguish synthetic signals from real API-sourced data and prevents accidental misuse of synthetic scores as real social media evidence.

3. **Informed consent framework for production deployment.** The system architecture documentation specifies that if the `social_data_source` field is transitioned to `'linkedin_api'` in a production deployment, employee consent must be obtained before any social media data is collected. The design does not presuppose consent — it enforces it by requiring an explicit schema change and associated consent workflow.

4. **ML system is decision-support only.** The risk classification system does not take automated adverse action against employees. Every ML prediction is surfaced to an HR manager for review. The Accept/Reject feedback mechanism is architecturally mandatory — there is no endpoint that acts on a risk score without HR involvement. This aligns with responsible AI principles for high-stakes decision-making contexts (Adadi and Berrada, 2018).

5. **No third-party data sharing.** All data resides within the local MongoDB instance. No employee records, payroll data, or model outputs are transmitted to external services.

6. **Password and session security.** All user passwords are stored as bcrypt hashes (cost factor 10). JWT session tokens are short-lived and signed with a server-side secret. OTP verification via email is required for sensitive login flows. No plaintext credentials are stored at any layer.

7. **Compliance with university ethics guidelines.** The project uses synthetic data throughout its lifecycle, which places it in the lowest-risk category for research ethics review. No human participants were recruited, surveyed, or observed.

---

## 3.7 Summary

This chapter has established the methodological foundation for the NEXUS ERP research project. Design Science Research (Peffers et al., 2007) was selected as the primary methodology because the research goal is the construction and evaluation of a functional IT artefact, not the observation of an existing phenomenon. The six DSRM stages — problem identification, objectives, design and development, demonstration, evaluation, and communication — have been explicitly mapped to the activities of this project.

Data collection relies entirely on synthetic generation, which is ethically clean, methodologically precedented, and the only viable approach for producing the cross-module temporal dataset required by the 8-feature risk vector. The evaluation strategy is structured around two primary tracks: ML model evaluation (accuracy, F1 macro, SHAP, Stage 1 vs Stage 2 comparison) and social score statistical validation. Ethical safeguards include complete use of synthetic data, explicit labelling of the `social_data_source` field, mandatory HR review before any risk-based action, and a consent framework for future live API integration.

The following chapter describes the design and implementation of the artefact in detail, covering system architecture, database design, all four ERP modules, the synthetic social score model, and the full ML risk scoring pipeline.

---

**Word count: ~2,050 words**

**References cited in this chapter:**
- Peffers, K., Tuunanen, T., Rothenberger, M. A., and Samir Chatterjee (2007). A Design Science Research Methodology for Information Systems Research. *Journal of Management Information Systems*, 24(3), 45–77.
- Fallucchi, F., Coladangelo, M., Giuliano, R., and De Luca, E. W. (2020). Predicting Employee Attrition Using Machine Learning Techniques. *Computers*, 9(4), 86.
- Jain, P. K. and Nayyar, A. (2022). Employee Attrition Prediction Using Machine Learning and Explainability Techniques. *International Journal of Advanced Computer Science and Applications*, 13(2).
- Figueira, Á. and Vaz, L. (2024). Synthetic Data Generation Using Gaussian-Based Methods for Sensitive HR Domains. *IEEE Access*.
- Gonzales, R., de Araújo, T., and Horita, F. (2023). Synthetic Data Generation for Temporal Employee Behaviour Modelling. *Journal of Systems and Software*.
- Dahmen, J. and Cook, D. (2019). SynSys: A Synthetic Data Generation System for Healthcare Applications. *Sensors*, 19(5), 1181.
- Adadi, A. and Berrada, M. (2018). Peeking Inside the Black-Box: A Survey on Explainable Artificial Intelligence (XAI). *IEEE Access*, 6, 52138–52160.
