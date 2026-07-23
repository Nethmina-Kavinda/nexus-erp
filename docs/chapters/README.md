# Thesis Chapters — Context & Progress

**Thesis Title:** Design and Development of an Integrated ERP Portal with Employee Risk Scoring Using Synthetic Social Behaviour Signals
**Student:** Nethmina Kavinda Bandara — BSc (Hons) Computer Science, NSBM Green University
**Methodology:** Peffers' Design Science Research Methodology (DSRM)
**Supervisor note:** All ML metrics, architecture details, and code references in this folder are ground truth — derived directly from the running codebase, not estimated.

---

## Chapter Status

| Chapter | Title | Status | File |
|---|---|---|---|
| 1 | Introduction | **COMPLETE + humanized** | `chapter_1_introduction.md` |
| 2 | Literature Review (SLR) | **COMPLETE + humanized** | `research_docs/SLR.md` |
| 3 | Methodology | **COMPLETE + humanized** | `chapter_3_methodology.md` |
| 4 | Design & Implementation | **COMPLETE + humanized** | `chapter_4_design_implementation.md` |
| 5 | Evaluation & Results | **COMPLETE + humanized** | `chapter_5_evaluation_results.md` |
| 6 | Conclusion | **COMPLETE + humanized**, ⚠️ not yet template-aligned | `chapter_6_conclusion.md` |

**All 6 chapters are written.** As of 2026-07-14, every chapter (SLR = Ch2) was passed through a prose-humanizing edit: em-dashes rewritten as natural punctuation, AI stock phrases removed, all numbers/metrics/citations left untouched. A combined document was assembled at `docs/NEXUS_ERP_Thesis_Full.docx` via `docs/build_final_thesis.py`.

**Remaining work:** align Chapter 6 to the Dulanjali Wijesekara template structure (currently humanized prose but not template-restructured).

---

## What This Project Is (30-second version)

NEXUS ERP is a MERN-stack ERP for SMEs with an ML-powered employee attrition risk scoring engine. The research contribution is NOT the ERP itself — it is:

1. A **synthetic social behaviour signal** (Gaussian sub-score model as a formally documented LinkedIn/Facebook API proxy)
2. An **8-feature ML risk scoring pipeline** integrated inside a lightweight ERP
3. A **human-in-the-loop retraining loop** where HR accept/reject decisions improve the model over time

The ERP (payroll, attendance, inventory) exists to generate live operational data that feeds the ML pipeline. Write the ERP sections concisely. Write the ML/social score sections in depth.

---

## System Architecture (Quick Ref)

```
React 18 + Vite  (:3000)
      ↕ REST/HTTPS
Node.js + Express (:5001)
      ↕ Mongoose
   MongoDB        (:27017/nexus_erp)
      ↕ REST (Axios)
Python Flask ML   (:5000)
```

**9 MongoDB collections:** Employees, Attendance, Payroll, Inventory, InventoryTransactions, SocialScores, EmployeeFeatures, RiskScores, HRDecisions

**21 Node.js API endpoints + 3 Flask endpoints** (`/predict`, `/train`, `/health`)

---

## The Numbers — Never Guess, Always Use These

### ML Model Performance
| Metric | Stage 1 (formula labels) | Stage 2 (HR-corrected labels) |
|---|---|---|
| Test Accuracy | 88.0% | 83.0% |
| Validation Accuracy | 93.0% | 93.0% |
| F1 Macro | 0.592 | 0.836 |
| **F1 Improvement** | — | **+24.4 percentage points** |
| Training samples (post-SMOTE) | 720 | 582 |

**Key narrative:** Test accuracy *dropped* 5% from Stage 1 → 2 (normal — model now predicts more High-risk cases which look like "errors" against formula baseline). But F1 macro *jumped* +24.4 pts, proving HR feedback dramatically improved the model's ability to identify the critical minority classes (High/Critical). **F1 macro is the headline metric, not accuracy.**

### Dataset Scale
| Item | Value |
|---|---|
| Employees | 100 |
| Departments | 5 (Engineering, Marketing, Finance, Operations, HR) × 20 each |
| Months | 6 (Oct 2025 – Mar 2026) |
| Attendance records | ~13,000 |
| Payroll records | 600 |
| Feature vectors | 600 |
| Risk scores | 600 |
| HR decisions | 600 total (526 accepted, 74 corrected) |
| HR correction rate | 12.3% |
| Correction breakdown | 70× Medium→High, 2× Low→Medium, 2× Medium→Low |
| Risk class distribution | Low 40%, Medium 35%, High 18%, Critical 7% |

### ML Model Config
| Parameter | Value | Why |
|---|---|---|
| n_estimators | 200 | Empirical tuning curve plateau at ~150–200 |
| class_weight | 'balanced' | Compensates for Low/Medium dominance |
| SMOTE k_neighbors | auto-clipped to min_class − 1 | Avoids error when minority class is tiny |
| Temporal split | Train: months 1–4, Val: month 5, Test: month 6 | Prevents autocorrelation leakage |

---

## The 8-Feature Risk Vector

| Feature | Source Module | Weight in Formula |
|---|---|---|
| `absence_rate` | Attendance | **0.20** (2nd highest — strongest classical HR signal) |
| `late_rate` | Attendance | 0.10 |
| `overtime_ratio` | Attendance | 0.10 (burnout indicator) |
| `productivity_index` | Payroll + Attendance | 0.15 |
| `payroll_variance` | Payroll | 0.05 |
| `social_score` | SocialScores | **0.25** (highest — core research contribution) |
| `tenure_months` | Employee | 0.05 |
| `department_risk` | RiskScores (leave-one-out dept avg) | 0.10 |

All features are **min-max normalised to [0, 1]** using a 6-month sliding window.

**Formula:**
```
RiskScore = (0.20×absence + 0.10×late + 0.10×overtime + 0.15×productivity +
             0.05×payroll_var + 0.25×social + 0.05×tenure + 0.10×dept_risk) × 100
```

**Risk tiers:** 0–25 = Low | 26–50 = Medium | 51–75 = High | 76–100 = Critical

---

## The Synthetic Social Score

Four sub-scores, each from a Gaussian distribution shifted by the employee's hidden `risk_bias` (0.01–0.45):

```
sub_score_d = clamp(N(μ_d + β, σ_d), 0.0, 1.0)
social_score = 0.35×job_search + 0.25×post_drop + 0.20×network_growth + 0.20×sentiment
```

| Sub-score | What it simulates | Weight | Literature basis |
|---|---|---|---|
| `job_search` | LinkedIn job browsing | 0.35 | De Jesus et al. (2018) — strongest signal |
| `post_drop` | Social media silence | 0.25 | Roth et al. (2016) |
| `network_growth` | New recruiter connections | 0.20 | De Jesus et al. (2018) |
| `sentiment` | Negative post tone | 0.20 | Roth et al. (2016) |

**Why Gaussian not uniform:** Uniform produces unrealistic wild swings (0.12 → 0.87 → 0.03). Gaussian produces naturally clustered values (0.52, 0.57, 0.48) mirroring real human behaviour patterns.

**Box-Muller transform** used to convert uniform RNG to Gaussian.

**Production pathway:** `social_data_source` field in MongoDB SocialScore documents is set to `'synthetic'` during research. When live LinkedIn/Facebook API is connected, this field changes to `'linkedin_api'`. Zero schema migration required.

---

## Two-Stage Training Loop (HITL)

```
Stage 1: Formula labels → RF trains on formula-derived risk tiers (cold start baseline)
                ↓
Stage 2: HR-corrected labels → RF retrains using HRDecisions collection
         (HR corrections override formula labels where decisions were made)
                ↓
Result: +24.4 pt F1 macro improvement
```

HR feedback flow:
```
ML predicts risk class
    ↓
HR Manager sees prediction in dashboard
    ↓ Accept or Reject+Correct
HRDecisions collection updated
    ↓
HR triggers "Retrain Model" (POST /api/ml/retrain → Flask /train stage_2)
    ↓
Stage 2 model serves all future /predict calls
```

---

## Payroll Formula

```
GrossSalary  = (WorkingHours × HourlyRate) + (OvertimeHours × HourlyRate × 1.5) + Allowances
NetSalary    = GrossSalary − (EPF 8% + ETF 3%)
LatePenalty  = LateMinutes × PenaltyRate
FinalSalary  = NetSalary − LatePenalty
```

Sri Lankan EPF/ETF rules are hardcoded. This is documented as a limitation.

---

## RBAC (4 roles)

| Role | Key Permissions |
|---|---|
| Admin | Full access — user management, system config, all modules |
| HR Manager | Employee mgmt, accept/reject risk predictions, trigger retrain, workforce analytics |
| Manager | Department employees, attendance summaries, dept risk overview, inventory monitoring |
| Employee | Own profile, own attendance, own payslips, own risk score (limited) |

---

## WRL — Workforce Risk Level

```
WRL = (High_count + Critical_count) / Total_employees × 100%
```

If WRL ≥ 30% → automated email alert dispatched to Admin and HR Manager accounts via Nodemailer.

Displayed on main dashboard and Risk Scoring page banner.

---

## Key Codebase Files (for each chapter section)

| What you're writing about | Exact file to reference |
|---|---|
| Payroll formula | `backend/utils/payrollCalculator.js` |
| Risk scoring formula + weights | `backend/utils/riskScoring.js` |
| Social score generation (Gaussian) | `backend/seeds/04_seedSocialScores.js` |
| Feature vector construction | `backend/seeds/05_seedFeatureVectors.js` |
| RF model, SHAP, temporal split, SMOTE | `ml-service/model.py` |
| Feature names array, class names array | `ml-service/config.py` |
| All evaluation plots + JSON results | `ml-service/evaluation_output/` |
| SHAP → human-readable top drivers | `backend/utils/topDrivers.js` |
| JWT + RBAC middleware | `backend/middleware/auth.js` |
| All MongoDB schemas (9 files) | `backend/models/` |
| HR decision accept/reject logic | `backend/controllers/decisionController.js` |
| WRL calculation + dashboard KPIs | `backend/controllers/dashboardController.js` |
| Retrain proxy endpoint | `backend/controllers/riskController.js` |
| SHAP modal + risk table UI | `frontend/src/pages/RiskScoring.jsx` |
| All screenshots (10 PNGs) | `docs/screenshots/` |
| Full project truth document | `research_docs/SOURCE_OF_TRUTH.md` |
| SLR (complete Chapter 2) | `research_docs/SLR.md` |
| 25 paper summaries | `research_docs/paper_summaries.md` |

---

## Screenshots Available

| File | What it shows |
|---|---|
| `01_login.png` | Login page with JWT/OTP flow |
| `02_dashboard.png` | Main KPI dashboard with WRL gauge |
| `03_employees_list.png` | Employee list with search/filter |
| `04_attendance_summary.png` | Attendance with click-to-expand daily records |
| `05_payroll_table.png` | Payroll — gross/EPF+ETF/penalty/final columns |
| `06_inventory_alerts.png` | Inventory with reorder alert badge |
| `07_risk_scoring_table.png` | Risk scoring table with WRL banner |
| `08_shap_modal.png` | SHAP waterfall explanation modal |
| `09_hr_decision.png` | HR accept/reject decision panel |
| `10_retrain_model.png` | Retrain progress modal with animated steps + results |

All in `docs/screenshots/`.

---

## Chapter 4 — What to Write (Design & Implementation)

~6,000 words. Spend 60% on sections 4.5 and 4.6 (social score + risk pipeline). Keep 4.4 (ERP modules) concise — use tables and diagrams, not prose.

| Section | Topic | Depth |
|---|---|---|
| 4.1 | System architecture — 4-tier diagram, tech stack table, microservice separation rationale | Medium |
| 4.2 | Database design — 9 collections table, ERD | Medium |
| 4.3 | Security — JWT, bcrypt, RBAC matrix, OTP | Short |
| 4.4 | ERP modules — Attendance/Payroll formula, Inventory reorder model, Dashboard KPIs | Concise |
| **4.5** | **Synthetic social score** — motivation, 4 sub-scores, Gaussian formula, Box-Muller, temporal drift, production pathway | **DEEP** |
| **4.6** | **Risk scoring pipeline** — feature table, composite formula, RF config, two-stage training, SHAP, HR feedback loop, WRL | **DEEP** |
| 4.7 | UI — 7 pages table with screenshot refs, theme/nav overview | Short |

---

## Chapter 5 — What to Write (Evaluation & Results)

~5,000 words. 70% ML evaluation. All figures already exist in `ml-service/evaluation_output/`.

| Section | Topic | Key artifact |
|---|---|---|
| 5.1 | Evaluation framework — 2-track overview | — |
| 5.2 | Stage 1 ML results | `confusion_matrix_stage1.png`, `feature_importance_stage1.png` |
| 5.3 | Stage 2 ML results | `confusion_matrix_stage2.png`, `feature_importance_stage2.png` |
| 5.4 | Stage 1 vs 2 comparison | `shap_drift.png` — **headline: +24.4 pt F1** |
| 5.5 | SHAP feature analysis | `shap_summary.png` |
| 5.6 | Social score validation | `social_score_histograms.png`, `social_score_correlation.png`, `social_score_drift.png` |
| 5.7 | Feature correlation | `feature_correlation.png` |
| 5.8 | n_estimators tuning | `n_estimators_curve.png` |
| 5.9 | Functional testing | Test case table (payroll, inventory, auth, RBAC, risk formula) |
| 5.10 | Discussion — map findings to RQ3/RQ4/RQ5 | — |

---

## Chapter 1 — What to Write (Introduction)

~2,500 words. Write this AFTER chapters 3, 4, 5 are done so it accurately reflects what was built.

| Section | Key point |
|---|---|
| 1.1 Background | ERP + ML gap for SMEs. Attrition costs 6–9 months salary. |
| 1.2 Problem statement | State the exact research problem from SOURCE_OF_TRUTH.md §5 |
| 1.3 Objectives | Primary + 8 secondary objectives table (from SOURCE_OF_TRUTH.md §4) |
| 1.4 Research questions | 7 RQs table, mark RQ3/RQ4/RQ5 as High weight |
| 1.5 Scope | In Scope / Out of Scope lists (from SOURCE_OF_TRUTH.md §15) |
| 1.6 Significance | 3 novelty pillars |
| 1.7 Structure | One paragraph per chapter |

---

## Chapter 6 — What to Write (Conclusion)

~1,500 words. Write after Chapter 5.

| Section | Key point |
|---|---|
| 6.1 Contributions | 3 paragraphs — one per novelty pillar |
| 6.2 RQs answered | Table: each RQ → one-sentence finding |
| 6.3 Limitations | Synthetic data, 100-employee scale, single-threaded Flask, EPF/ETF hardcoded |
| 6.4 Future work | Live social API, dynamic weights, mobile app, production deployment |
| 6.5 Concluding remarks | One paragraph, reiterate 3 contributions |

---

## Paper Citations Quick Reference

| Writing about... | Cite |
|---|---|
| ERP as process integrator | Davenport (1998) |
| ERP evolution toward AI/analytics | Katuu (2020) |
| Cloud ERP for SMEs challenges | Albarghouthi et al. (2024), Chofreh et al. (2021) |
| Random Forest best for attrition | Yadav et al. (2018), Jain and Nayyar (2022), Fallucchi et al. (2020) |
| Ensemble/stacking attrition | Raza et al. (2022), Osman (2025) |
| IBM dataset is synthetic (precedent) | Fallucchi et al. (2020), Jain and Nayyar (2022) |
| LinkedIn signals for attrition | De Jesus et al. (2018) |
| Social media signals in HR | Roth et al. (2016), Gupta and Sharma (2022) |
| Why unstructured social fails | Van Iddekinge et al. (2016) |
| Gaussian synthetic data | Figueira and Vaz (2024), Gonzales et al. (2023) |
| Gaussian statistical validation | Dahmen and Cook (2019) |
| SHAP methodology | Lundberg and Lee (2017) |
| XAI in HR / high-stakes AI | Adadi and Berrada (2018) |
| HITL ML improves accuracy | Mosqueira-Rey et al. (2023) |
| HITL feedback label improvement | Sajjadiani et al. (2019) |
| DSRM methodology | Peffers et al. (2007) |
| JWT authentication | Ahmed and Mahmood (2019) |
| RBAC | Ferraiolo et al. (2007) |
| Payroll/HRMS automation | Kavanagh et al. (2015) |
| Inventory / reorder models | Silver et al. (2016), Chopra and Meindl (2019) |

---

## Writing Conventions (used in Chapter 3 — keep consistent)

- Past tense for what was built ("was implemented", "was trained", "was validated")
- Present tense for the system as it currently exists ("the formula produces", "the modal displays")
- Feature names in backtick code style: `social_score`, `absence_rate`, `risk_bias`
- MongoDB collection names in bold: **HRDecisions**, **SocialScores**
- File references as inline code paths: `ml-service/model.py`, `backend/utils/riskScoring.js`
- Numbers: always spell out the exact figure from the Key Numbers section above — never approximate
- Tables preferred over bullet lists for structured data
- Diagram/figure captions as "**Figure X.Y — Title**" and table captions as "**Table X.Y — Title**"
- No first-person ("I built") — use passive or third-person ("the system was developed", "NEXUS ERP implements")

---

## Files in This Folder

```
docs/chapters/
├── README.md                            ← this file — context for continuing thesis work
├── chapter_1_introduction.md            ← COMPLETE + humanized (~2,600 words)
├── chapter_3_methodology.md             ← COMPLETE + humanized (~2,050 words)
├── chapter_4_design_implementation.md   ← COMPLETE + humanized (~6,200 words)
├── chapter_5_evaluation_results.md      ← COMPLETE + humanized (~5,200 words)
└── chapter_6_conclusion.md              ← COMPLETE + humanized (~1,600 words), not template-aligned
```

Full thesis plan with section-level detail: `docs/THESIS_WRITING_PLAN.md`
Full project truth: `research_docs/SOURCE_OF_TRUTH.md`
Complete Chapter 2 (SLR): `research_docs/SLR.md`
Combined final document: `docs/NEXUS_ERP_Thesis_Full.docx` (built via `docs/build_final_thesis.py`)
