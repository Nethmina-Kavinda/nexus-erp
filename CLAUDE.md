# NEXUS ERP — Project Context for Claude

## What this project is

NEXUS ERP is a full-stack enterprise resource planning web application built as a research artefact for:
- **Student:** Nethmina Kavinda Bandara | Index: 28271
- **Institution:** NSBM Green University, BSc (Hons) Management Information Systems
- **Supervisor context:** Dulanjali Wijesekara (Lecturer) provided the thesis chapter template

The system is both a working software product and the empirical subject of a thesis. Dulhara is assisting Nethmina with development and thesis writing.

---

## Stack

| Layer | Technology | Port |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind CSS | :3000 |
| Backend API | Node.js 18 + Express.js 5 + Mongoose 9 | :5001 |
| ML Microservice | Python 3.11 + Flask 3 + scikit-learn + SHAP | :5000 |
| Database | MongoDB 8 (db: `nexus_erp`) | :27017 |

**Fallback:** If Flask (:5000) is down, the backend computes the deterministic formula score and returns `ml_status: 'formula_only'`. The frontend still renders — no crash.

---

## Canonical Technical Parameters

**Always use these numbers — do not invent alternatives:**

- **Dataset:** 100 employees × 6 months = 600 records (Oct 2025 – Mar 2026)
- **ML results:** Stage 1 Test Acc 88%, F1 Macro 0.592, High-class F1 0.000 → Stage 2 Test Acc 83%, F1 Macro 0.836, High-class F1 0.857 (**+24.4 pt F1 macro = headline finding**)
- **HR corrections:** 74 total (70 Medium→High, 2 Low→Medium, 2 Medium→Low)
- **8 features:** absence_rate(0.20), late_rate(0.10), overtime_ratio(0.10), productivity_index(0.15), payroll_variance(0.05), social_score(0.25), tenure_months(0.05), department_risk(0.10)
- **Risk tiers:** Low 0–25, Medium 26–50, High 51–75, Critical 76–100
- **WRL alert:** ≥30% of workforce in High+Critical tiers
- **VAR model:** α=0.65, Cholesky Multivariate Normal, 4 sub-scores (job_search 0.35, post_drop 0.25, network_growth 0.20, sentiment 0.20)
- **RF config:** n_estimators=200, class_weight='balanced', random_state=42, SMOTE oversampling
- **Temporal split:** months 1–4 train, month 5 validate, month 6 test
- **Payroll:** EPF 8% employee / ETF 3% employer, overtime at 1.5×, late penalty deducted, salary floored at LKR 0
- **Auth:** bcrypt cost factor 10, 6-digit OTP, 10-min expiry, JWT stateless, 4-role RBAC

---

## Thesis Chapter Status (as of June 2026)

All chapters follow the **Dulanjali Wijesekara template** (`C:\Users\Dulhara\Desktop\fr\Detailed and Elaboratory Thesis chapter breakdown v1.1 (4).docx`).

| Chapter | File | Status |
|---|---|---|
| Ch 1 — Introduction | `docs/chapters/chapter_1_introduction.md` | ✅ Complete |
| Ch 2 — Literature Review | `research_docs/SLR.md` | ✅ Complete |
| Ch 3 — Methodology | `docs/chapters/chapter_3_methodology.md` | ✅ Complete |
| Ch 4 — System Requirement Specification | `docs/chapters/chapter_4_design_implementation.md` | ✅ Complete |
| Ch 5 — Implementation, Testing & Evaluation | `docs/chapters/chapter_5_evaluation_results.md` | ✅ Complete |
| Ch 6 — Conclusion | `docs/chapters/chapter_6_conclusion.md` | ⚠️ Not yet template-aligned |

---

## Submission Documents

| Document | Path | Contents |
|---|---|---|
| Supervisor scope briefing | `docs/Scope_and_Method_Supervisor_Briefing.docx` | ML/churn scope only (not ERP ops); VAR model, 8-feature vector, RF pipeline, evaluation results |
| Student submission Ch 1–3 | `docs/Chapters_1_to_3_Submission.docx` | Cover page + Ch 1 + Ch 2 + Ch 3, formatted for submission |

---

## Key Existing Documents (check before regenerating)

- `docs/CLIENT_WALKTHROUGH.md` — client teaching plan with demo script and Q&A
- `docs/PROJECT_STATUS.md` — delivery phase status
- `research_docs/SOURCE_OF_TRUTH.md` — research proposal / DSRM methodology

---

## Research Methodology

- **Paradigm:** Pragmatism → Design Science Research Methodology (Peffers et al., 2007)
- **Data:** 100% synthetic; 8 sequential Node.js seed scripts; `social_data_source: 'synthetic'`
- **HITL loop:** HR Manager accept/reject predictions → HRDecisions collection → Stage 2 retrain
- **SHAP:** TreeExplainer (exact values, not approximations); top-3 drivers shown as plain-language text
- **Two-stage training:** Stage 1 = formula-derived labels (cold start); Stage 2 = HR-corrected labels

---

## RBAC Roles

| Role | Access |
|---|---|
| Admin | Full system |
| HR Manager | Employee data, risk scoring, HITL decisions, retrain |
| Manager | Attendance, inventory |
| Employee | Own records only |
