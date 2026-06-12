# NEXUS ERP — Thesis Writing Plan

**Thesis Title:** Design and Development of an Integrated ERP Portal with Employee Risk Scoring Using Synthetic Social Behaviour Signals
**Student:** Nethmina Kavinda Bandara
**University:** NSBM Green University — BSc (Hons) Computer Science
**Methodology:** Peffers' Design Science Research Methodology (DSRM)
**Last Updated:** 2026-06-12

---

## Progress Tracker

| Chapter | Status | File | Words |
|---|---|---|---|
| Chapter 1 — Introduction | ⬜ TODO | — | ~2,500 |
| Chapter 2 — Literature Review | ✅ COMPLETE | `research_docs/SLR.md` | ~5,000 |
| Chapter 3 — Methodology | ✅ COMPLETE | `docs/chapters/chapter_3_methodology.md` | ~2,050 |
| Chapter 4 — Design & Implementation | ⬜ TODO | — | ~6,000 |
| Chapter 5 — Evaluation & Results | ⬜ TODO | — | ~5,000 |
| Chapter 6 — Conclusion | ⬜ TODO | — | ~1,500 |

**Total written:** ~7,050 / ~22,500 words (~31%)

---

## How to Use This Document

Each chapter is broken into sections. For every section you get:
- **What to write** — the argument or content to make
- **Codebase ref** — the exact file/line to look at for technical detail
- **Paper ref** — which SLR paper(s) to cite
- **Numbers** — the exact figures to use (don't guess)
- **Output** — what tables, figures, or code blocks to include

Chapter 2 (SLR) is already fully written in `research_docs/SLR.md`. Copy it into your thesis document and format it.
Chapter 3 (Methodology) is fully written in `docs/chapters/chapter_3_methodology.md`.

**Recommended writing order:**
1. ✅ Chapter 3 (Methodology) — DONE
2. ⬜ Chapter 4 (Design & Implementation) — **NEXT** — core content, longest chapter
3. ⬜ Chapter 5 (Evaluation) — all data is ready, just present it
4. ⬜ Chapter 1 (Introduction) — write last so it matches what you actually built
5. ⬜ Chapter 6 (Conclusion) — follows from Chapter 5

---

## Chapter 1 — Introduction (~2,500 words) ⬜ TODO

### 1.1 Background and Motivation

**What to write:**
Employee attrition costs organisations 6–9 months of an employee's salary in replacement costs (recruitment, onboarding, lost productivity). For small-to-medium enterprises this is disproportionately damaging because they lack the HR analytics infrastructure that large enterprises use. Traditional ERP systems (SAP, Odoo) automate operations but offer no predictive workforce analytics. Standalone ML models for attrition prediction exist but are disconnected from operational systems — they receive static datasets, not live organisational data. No lightweight system has combined both.

**Paper refs:** Davenport (1998) for ERP context, Katuu (2020) for trend toward AI-enhanced ERP, Fallucchi et al. (2020) for ML attrition prediction state of the art.

**Length:** ~400 words.

---

### 1.2 Problem Statement

**What to write:**
State the problem as one clear paragraph: SMEs lack an integrated, affordable system that (a) automates payroll and inventory, and (b) uses operational data to predict employee attrition risk, explain those predictions, and allow HR to correct and improve the model over time. Then state the main research problem verbatim:

> "How can an integrated ERP system be designed to automate payroll processing and inventory management, incorporate synthetic social behaviour signals as a documented proxy for real-world API-sourced data, and generate machine-learning-powered employee risk scores — while ensuring accuracy, scalability, and data security for enterprise use?"

---

### 1.3 Research Objectives

**What to write:**
State the Primary Objective, then list all 8 Secondary Objectives in a numbered table. The table has three columns: Objective number, Description, Research Questions Addressed.

| # | Secondary Objective | RQs |
|---|---|---|
| SO1 | Automated attendance-to-payroll with EPF/ETF/overtime | RQ1 |
| SO2 | Dual-tier inventory management | RQ2 |
| SO3 | Automated reorder-level alerts | RQ2 |
| SO4 | Synthetic social_score using Gaussian sub-score model | RQ3 |
| SO5 | 8-feature weighted composite risk scoring | RQ4 |
| SO6 | Random Forest microservice with HR feedback retraining | RQ4, RQ5 |
| SO7 | Analytics dashboards | RQ7 |
| SO8 | JWT + OTP security | RQ6 |

---

### 1.4 Research Questions

**What to write:**
List all 7 RQs in a table. Mark RQ3, RQ4, RQ5 as **High** weight — these are where the research contribution lives.

---

### 1.5 Scope

**What to write:**
Two lists: In Scope and Out of Scope. Copy directly from `research_docs/SOURCE_OF_TRUTH.md` Section 15. Be clear that live LinkedIn/Facebook API integration is out of scope and documented as future work.

---

### 1.6 Research Significance

**What to write:**
Three bullet points matching the three pillars of novelty:
1. Synthetic social behaviour signal formally modelled with a documented production pathway
2. ML-powered risk scoring integrated inside a lightweight ERP for SMEs
3. Human-in-the-loop retraining loop bridging automated prediction and responsible HR decision-making

---

### 1.7 Dissertation Structure

**What to write:**
One paragraph per chapter explaining what each chapter does. This is the roadmap for the reader.

---

## Chapter 2 — Literature Review (~5,000 words) ✅ COMPLETE

**File:** `research_docs/SLR.md`
**Action:** Copy into thesis document and apply university formatting template (font, heading styles, page margins). No new writing needed.

**Sections already in the document:**
- 2.1 Introduction
- 2.2 Search Methodology (PRISMA, databases, keywords, inclusion/exclusion criteria)
- 2.3 Theme 1: ERP Systems for SMEs
- 2.4 Theme 2: Employee Attrition Prediction Using ML
- 2.5 Theme 3: Social Media Signals in HR Analytics
- 2.6 Theme 4: Synthetic Data Generation
- 2.7 Theme 5: Explainable AI and HITL ML
- 2.8 Theme 6: Enterprise Security
- 2.9 Comparison Table (25 papers × RQs)
- 2.10 Research Gap Analysis (Gap Table 2.5)
- 2.11 Summary

**Action:** Format and insert. No new writing needed.

---

## Chapter 3 — Methodology (~2,000 words) ✅ COMPLETE

**File:** `docs/chapters/chapter_3_methodology.md`
**Word count:** ~2,050 words
**Sections written:** 3.1 Research Philosophy · 3.2 DSRM · 3.3 Data Strategy · 3.4 Development Approach · 3.5 Evaluation Strategy · 3.6 Ethical Considerations · 3.7 Summary
**Action:** Copy into thesis document and apply formatting. No new writing needed.

### 3.1 Research Philosophy and Approach ✅

**What to write:**
This is a design science project — its goal is to produce a functional IT artefact that solves a real problem. DSR (Design Science Research) is the appropriate methodology because it is specifically designed for artefact-building research in information systems. Contrast with empirical/positivist research (surveys, experiments on existing phenomena) — those are for studying what exists, not building what doesn't yet exist.

**Paper ref:** Peffers et al. (2007) — cite this as the primary DSRM framework.

---

### 3.2 Design Science Research Methodology (DSRM) ✅

**What to write:**
Introduce Peffers' 6-stage DSRM model. Include a figure showing the 6 stages in sequence (you can draw a simple flow diagram). Then apply each stage to your project:

| DSRM Stage | Application to NEXUS ERP |
|---|---|
| 1. Problem Identification | SMEs lack integrated ERP with predictive workforce analytics |
| 2. Objectives of Solution | Design NEXUS ERP with payroll automation, inventory, and ML risk scoring |
| 3. Design & Development | MERN stack + Flask ML microservice — the system built in this thesis |
| 4. Demonstration | System walkthrough: login, risk scoring, SHAP modal, HR accept/reject, retrain |
| 5. Evaluation | ML metrics (accuracy, F1, SHAP), social score statistical validation, functional testing |
| 6. Communication | This thesis document |

---

### 3.3 Data Collection Strategy ✅

**What to write:**
Explain why synthetic data was used rather than real employee data. Three reasons:
1. Ethical — no real employee data avoids privacy concerns
2. Controlled — ground truth (risk_bias) is known, enabling model validation
3. No public dataset contains cross-module ERP data (attendance + payroll + social signals)

Cite IBM HR Analytics dataset precedent — it is also synthetic and used in dozens of peer-reviewed papers (Fallucchi et al., 2020; Jain and Nayyar, 2022; Osman, 2025). Cite Figueira and Vaz (2024) and Gonzales et al. (2023) to support Gaussian-based generation as methodologically sound.

**Dataset description:**
- 100 employees × 6 months = 600 feature vectors
- 5 departments × 20 employees each (Engineering, Marketing, Finance, Operations, HR)
- Risk distribution: Low=40, Medium=35, High=18, Critical=7
- HR correction rate: 12.3% (74 of 600 records corrected)

---

### 3.4 Development Approach ✅

**What to write:**
Iterative, module-by-module development. Each module (Attendance, Payroll, Inventory, Risk Scoring) was built, tested, and integrated before the next. The ML pipeline was developed in two stages: Stage 1 (formula labels → cold-start baseline), Stage 2 (HR-corrected labels → human-in-the-loop improvement).

---

### 3.5 Evaluation Strategy ✅

**What to write:**
Two-track evaluation:
- **Functional evaluation** — test each API endpoint against expected inputs/outputs, verify RBAC, test error handling
- **ML evaluation** — classification accuracy, precision/recall/F1 per class, SHAP analysis, Stage 1 vs Stage 2 comparison

**Temporal split justification:** months 1–4 train, month 5 validate, month 6 test. Temporal split prevents data leakage — using random split would allow future months to leak into training, inflating accuracy.

---

### 3.6 Ethical Considerations ✅

**What to write:**
Copy the 7 points from `research_docs/SOURCE_OF_TRUTH.md` Section 13. Key points: all data is synthetic, `social_data_source` field is set to `'synthetic'`, ML system is decision-support only (no automated adverse action), employee consent required before any live social data collection.

---

## Chapter 4 — Design and Implementation (~6,000 words) ⬜ TODO — NEXT

This is the longest chapter. Give ~60% of the space to the ML/social score sections (SO4, SO5, SO6). Keep ERP module sections concise — describe with diagrams and tables, not lengthy prose.

---

### 4.1 System Architecture ⬜

**What to write:**
Describe the 4-tier architecture. Include an architecture diagram (draw this):

```
[Browser: React 18 + Vite :3000]
         ↕ HTTPS/REST
[Node.js + Express.js :5001]
         ↕ Mongoose ODM
    [MongoDB :27017/nexus_erp]
         ↕ REST (Axios)
[Python Flask ML Service :5000]
```

Include the tech stack table:

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind CSS | Interactive dashboards and risk visualisations |
| Backend | Node.js 18 + Express.js 5 | REST API, business logic, payroll engine |
| Database | MongoDB 8 + Mongoose 9 | Document storage for 9 collections |
| ML Microservice | Python + Flask 3 + scikit-learn | Random Forest classifier, SHAP explainability |
| Auth | JWT + bcrypt | Stateless session management |

**Key design decision to explain:** The ML service is a separate microservice (not embedded in Node.js) because Python's scikit-learn and SHAP ecosystem is significantly more mature than Node.js equivalents. The Node backend always produces a formula-based score as fallback if Flask is unavailable.

**Codebase ref:** `backend/server.js`, `ml-service/app.py`, `README.md` architecture section.

---

### 4.2 Database Design ⬜

**What to write:**
List all 9 MongoDB collections with their key fields and relationships. Include an entity relationship diagram (draw this).

| Collection | Key Fields | Purpose |
|---|---|---|
| Employees | name, email, role, department, hourly_rate, risk_bias (hidden) | Employee profiles |
| Attendance | employee_id, date, check_in, check_out, late_minutes, status | Daily attendance records |
| Payroll | employee_id, month, gross_salary, deductions, late_penalty, final_salary | Monthly payroll computation |
| Inventory | name, category, quantity, reorder_level, unit_price | Stock items |
| InventoryTransactions | inventory_id, type, quantity, date | Stock movements |
| SocialScores | employee_id, month, job_search, post_drop, network_growth, sentiment, social_score | Synthetic social signals |
| EmployeeFeatures | employee_id, month, 8 normalised features | ML input vectors |
| RiskScores | employee_id, month, risk_score, risk_class, shap_values, top_drivers | ML output + explanations |
| HRDecisions | employee_id, month, decision, original_class, corrected_class | HR feedback for retraining |

**Codebase ref:** `backend/models/` — all 9 schema files.

---

### 4.3 Security Architecture ⬜

**What to write:**
Short section (300 words). JWT-based authentication, bcrypt password hashing, 4-role RBAC (Admin, HR Manager, Manager, Employee), OTP email verification for login.

Include the RBAC matrix table from `backend/README.md`.

**Paper refs:** Ahmed and Mahmood (2019) for JWT, Ferraiolo et al. (2007) for RBAC.
**Codebase ref:** `backend/middleware/auth.js`.

---

### 4.4 ERP Modules ⬜

#### 4.4.1 Attendance and Payroll Module

**What to write:**
Explain the check-in/check-out flow and the payroll computation formula. Include the formula:

```
GrossSalary  = (WorkingHours × HourlyRate) + (OvertimeHours × HourlyRate × 1.5) + Allowances
NetSalary    = GrossSalary − (EPF 8% + ETF 3%)
LatePenalty  = LateMinutes × PenaltyRate
FinalSalary  = NetSalary − LatePenalty
```

Include screenshot `05_payroll_table.png` showing gross/EPF/ETF/penalty/final columns.

**Paper refs:** Davenport (1998), Kavanagh et al. (2015) for HRMS/payroll automation.
**Codebase ref:** `backend/utils/payrollCalculator.js`, `backend/controllers/payrollController.js`.

---

#### 4.4.2 Inventory Management Module

**What to write:**
Dual-tier (raw materials + finished goods). Reorder model:

```
ReorderAlert triggered when: CurrentStock ≤ ReorderLevel
```

Automated email alert sent to admin/manager roles via Nodemailer. Include screenshot `06_inventory_alerts.png`.

**Paper refs:** Silver et al. (2016), Chopra and Meindl (2019) for inventory/reorder models.
**Codebase ref:** `backend/controllers/inventoryController.js`, `backend/utils/email.js`.

---

#### 4.4.3 Dashboard

**What to write:**
10 KPIs aggregated in a single `/api/dashboard/summary` call. List the KPIs. Include screenshot `02_dashboard.png`. Emphasise WRL (Workforce Risk Level) as the portfolio-level metric that connects the ERP operational data to the research contribution.

**Codebase ref:** `backend/controllers/dashboardController.js`.

---

### 4.5 Synthetic Social Score Model ⬜ ← HIGH RESEARCH WEIGHT

This section is one of your three novelty pillars. Write it deeply.

#### 4.5.1 Motivation

**What to write:**
Research shows social media behaviour changes before attrition — increased LinkedIn job searching, decreased posting, growing recruiter connections, negative sentiment. Live API integration is infeasible in a research context (platform approval timelines, OAuth, ethical consent workflows). Therefore, a formally modelled synthetic proxy is developed.

**Paper refs:** Roth et al. (2016) for social signals framework, Van Iddekinge et al. (2016) for why unstructured social assessment fails, De Jesus et al. (2018) for LinkedIn attrition prediction, Figueira and Vaz (2024) for Gaussian synthetic data justification.

---

#### 4.5.2 Sub-Score Design

**What to write:**
Four sub-scores, each representing one behavioural dimension:

| Sub-score | Behavioural Signal | Weight | Literature Basis |
|---|---|---|---|
| `job_search` | LinkedIn job browsing activity | 0.35 | De Jesus et al. (2018); strongest LinkedIn attrition signal |
| `post_drop` | Decrease in social media posting | 0.25 | Roth et al. (2016); social silence precedes attrition |
| `network_growth` | New recruiter/professional connections | 0.20 | De Jesus et al. (2018); connection activity predicts attrition |
| `sentiment` | Negativity in posts/comments | 0.20 | Roth et al. (2016); sentiment identified as key construct |

**Codebase ref:** `backend/seeds/04_seedSocialScores.js` — sub-score weights and generation logic.

---

#### 4.5.3 Gaussian Generation Formula

**What to write:**
Each sub-score per employee per month is drawn from a Normal distribution shifted by the employee's risk_bias:

```
sub_score_d = clamp(N(μ_d + β, σ_d), 0.0, 1.0)
```

Where:
- μ_d = base mean for dimension d (e.g., job_search: μ = 0.25)
- β = employee's hidden risk_bias ∈ [0.01, 0.45]
- σ_d = standard deviation (0.10–0.15)
- clamp = force result into [0.0, 1.0]

Explain why Gaussian is used over uniform random: uniform produces unrealistic wild swings (0.12 → 0.87 → 0.03), while Gaussian produces naturally clustered values (0.52, 0.57, 0.48) that mirror real human behavioural patterns.

**Composite formula:**
```
social_score = 0.35×job_search + 0.25×post_drop + 0.20×network_growth + 0.20×sentiment
```

**Paper refs:** Dahmen and Cook (2019) for Gaussian synthetic data validation methodology, Gonzales et al. (2023) for precedent of Gaussian synthetic data in sensitive domains.
**Codebase ref:** `backend/seeds/04_seedSocialScores.js` (generation), `ml-service/evaluate.py` (validation plots).

---

#### 4.5.4 Temporal Drift

**What to write:**
At-risk employees (high risk_bias) show a gradual upward trend in their social_score over 6 months — simulating real-world disengagement buildup before attrition. This is implemented via the risk_bias modulating the μ_d parameter across months.

Include figure `social_score_drift.png` from `ml-service/evaluation_output/` — it shows high-risk vs low-risk temporal trajectories.

---

#### 4.5.5 Production Pathway

**What to write:**
The MongoDB SocialScore schema includes a `social_data_source` field set to `'synthetic'` during research. When live LinkedIn/Facebook API integration is implemented, this field transitions to `'linkedin_api'`. No schema migration is required. This documents the design intent that the synthetic signal is a placeholder, not a permanent substitute.

**Codebase ref:** `backend/models/SocialScore.js` — the `social_data_source` field definition.

---

### 4.6 Risk Scoring Pipeline ⬜ ← HIGH RESEARCH WEIGHT

#### 4.6.1 Feature Engineering

**What to write:**
8 features are constructed from cross-module ERP data per employee per month. Include a table:

| Feature | Source Module | Formula/Method | What it Measures |
|---|---|---|---|
| `absence_rate` | Attendance | absent_days / working_days | Frequency of absences |
| `late_rate` | Attendance | late_days / working_days | Frequency of late arrivals |
| `overtime_ratio` | Attendance | overtime_hours / standard_hours | Burnout signal |
| `productivity_index` | Payroll + Attendance | final_salary / (hours × expected_salary) | Output relative to hours |
| `payroll_variance` | Payroll | |this_month - last_month| / last_month | Salary instability |
| `social_score` | SocialScores | Composite from 4 sub-scores | Behavioural signal |
| `tenure_months` | Employee | (current_date - hire_date) / 30 | Length of employment |
| `department_risk` | RiskScores | Leave-one-out avg of dept risk scores | Environmental factor |

All features are min-max normalised to [0, 1] using a 6-month sliding window.

**Codebase ref:** `backend/seeds/05_seedFeatureVectors.js` (construction), `ml-service/config.py` (FEATURE_NAMES).

---

#### 4.6.2 Weighted Composite Formula

**What to write:**
The formula provides a deterministic, always-available risk score:

```
RiskScore = (0.20×absence + 0.10×late + 0.10×overtime + 0.15×productivity +
             0.05×payroll_var + 0.25×social + 0.05×tenure + 0.10×dept_risk) × 100
```

Risk tiers:
| Score | Tier | Action |
|---|---|---|
| 0–25 | Low | No action |
| 26–50 | Medium | Monitor |
| 51–75 | High | HR intervention recommended |
| 76–100 | Critical | Immediate attention required |

Explain weight rationale: social_score has highest weight (0.25) as the core research contribution. absence_rate is second (0.20) as the strongest traditional HR attrition signal in literature.

**Codebase ref:** `backend/utils/riskScoring.js` — weights and tier thresholds.

---

#### 4.6.3 Random Forest Classifier

**What to write:**
Why Random Forest: Literature consistently shows RF achieves top accuracy for employee attrition (84%+ across Yadav et al. 2018, Srivastava and Nair 2018, Jain and Nayyar 2022). RF handles mixed numerical features, provides native feature importance, is robust to small datasets with SMOTE balancing, and is interpretable via SHAP TreeExplainer.

Model configuration:
- `n_estimators = 200` (justified by n_estimators tuning curve — see Figure `n_estimators_curve.png`)
- `class_weight = 'balanced'` (compensates for class imbalance)
- SMOTE oversampling applied pre-training with k_neighbors auto-clipped to min_class_size − 1
- Temporal train/validation/test split: months 1–4 / month 5 / month 6

**Paper refs:** Fallucchi et al. (2020), Jain and Nayyar (2022), Zhao and Hryniewicki (2018) for RF justification.
**Codebase ref:** `ml-service/model.py` (RiskModel class, train method), `ml-service/config.py` (FEATURE_NAMES, CLASS_NAMES).

---

#### 4.6.4 Two-Stage Training

**What to write:**
The model is trained in two stages:

| Stage | Label Source | Purpose |
|---|---|---|
| Stage 1 | Formula-derived RiskScore tiers | Cold-start baseline — initial ML labels from deterministic formula |
| Stage 2 | HR-corrected labels (HRDecisions) | Human-in-the-loop improvement — HR feedback overrides formula labels where corrections were made |

Explain: Stage 1 gives the model something to learn before any HR feedback exists. Stage 2 uses accumulated HR accept/reject decisions as ground truth — wherever HR corrected a prediction, the corrected class replaces the formula label. This is the retraining loop.

**Codebase ref:** `ml-service/model.py` (train method, stage parameter logic), `backend/controllers/riskController.js` (retrain proxy endpoint).

---

#### 4.6.5 SHAP Explainability

**What to write:**
SHAP (SHapley Additive exPlanations) provides per-prediction feature-level explanations. For each employee prediction, 8 SHAP values are returned — one per feature — showing which features pushed the prediction toward higher risk (positive SHAP) or lower risk (negative SHAP). Include screenshot `08_shap_modal.png`.

The frontend renders SHAP values as a waterfall bar chart. Red bars = risk-increasing features, teal bars = risk-decreasing features. HR managers can see exactly why the model classified an employee as High risk.

Include figure `shap_summary.png` from `ml-service/evaluation_output/` showing mean |SHAP| per feature across all predictions.

**Paper refs:** Lundberg and Lee (2017) for SHAP framework, Adadi and Berrada (2018) for XAI in HR decision-making.
**Codebase ref:** `ml-service/model.py` (predict method, TreeExplainer), `backend/utils/topDrivers.js` (SHAP → human-readable text).

---

#### 4.6.6 HR Feedback Loop

**What to write:**
When HR managers view a prediction, they can Accept (confirm the prediction is correct) or Reject and Correct (override with the correct risk class). Both decisions are stored in the HRDecisions collection. When "Retrain Model" is triggered, Stage 2 training reads these decisions and uses the corrected classes as labels.

Include a flow diagram:
```
ML predicts → HR reviews → Accept/Reject
                    ↓
         Decisions stored in HRDecisions
                    ↓
         HR triggers retrain (Stage 2)
                    ↓
         RF retrains on HR-corrected labels
                    ↓
         Improved model serves future predictions
```

Include screenshots `09_hr_decision.png` (HR accept/reject action) and the retrain modal screenshot.

**Paper refs:** Mosqueira-Rey et al. (2023) for HITL ML framework, Sajjadiani et al. (2019) for feedback-driven label improvement.
**Codebase ref:** `backend/controllers/decisionController.js`, `backend/routes/decisionRoutes.js`, `ml-service/model.py` (stage_2 label loading).

---

#### 4.6.7 Workforce Risk Level (WRL)

**What to write:**
WRL is a portfolio-level metric shown on the main dashboard and the Risk Scoring page banner:

```
WRL = (High_count + Critical_count) / Total_employees × 100%
```

If WRL ≥ 30%, an automated email alert is dispatched to all admin and HR Manager accounts. Include screenshot `07_risk_scoring_table.png` showing the WRL banner.

**Codebase ref:** `frontend/src/pages/RiskScoring.jsx` (line 40 — WRL calculation), `backend/controllers/dashboardController.js`.

---

### 4.7 User Interface ⬜

**What to write:**
Short section (300 words). Dark navy theme, 7 pages, role-based navigation (admin sees all modules; employees see only their own data). List the pages with their corresponding screenshot references.

| Page | Screenshot | Key Feature |
|---|---|---|
| Login | `01_login.png` | JWT authentication |
| Dashboard | `02_dashboard.png` | 6 KPIs, WRL gauge, risk donut |
| Employees | `03_employees_list.png` | Search, filter, RBAC |
| Attendance | `04_attendance_summary.png` | Click-to-expand daily records |
| Payroll | `05_payroll_table.png` | Gross/EPF/ETF/penalty/final |
| Inventory | `06_inventory_alerts.png` | Reorder alert badges |
| Risk Scoring | `07–10` | WRL banner, SHAP modal, HITL |

**Codebase ref:** `frontend/src/pages/`, `frontend/src/components/`.

---

## Chapter 5 — Evaluation and Results (~5,000 words) ⬜ TODO

All data and artifacts for this chapter are already generated in `ml-service/evaluation_output/`. Run `python evaluate.py` inside the activated venv to regenerate them at any time.

**Key rule for this chapter:** 70% of the content should be ML evaluation. Functional testing is brief.

---

### 5.1 Evaluation Framework ⬜

**What to write:**
Two-track evaluation framework:
1. **ML Evaluation** — classification accuracy, confusion matrix, precision/recall/F1 per class, feature importance, SHAP analysis, Stage 1 vs Stage 2 comparison (this answers RQ4 and RQ5)
2. **Social Score Validation** — statistical distribution checks on the synthetic social_score (this answers RQ3)
3. **Functional Testing** — API endpoint verification, RBAC, payroll formula accuracy (this answers RQ1, RQ2, RQ6, RQ7)

---

### 5.2 ML Evaluation — Stage 1 ⬜

**What to write:**
Stage 1 trains on formula-derived labels (cold-start baseline before any HR feedback).

**Numbers to use (from `ml-service/evaluation_output/evaluation_results.json`):**
- Test Accuracy: **88.0%**
- Validation Accuracy: **93.0%**
- F1 (macro): **0.592**
- Training samples (after SMOTE): **720**

Include figure `confusion_matrix_stage1.png` — show the confusion matrix and explain which classes the model struggled with (High and Critical are underrepresented in formula labels, causing low recall for these classes and depressing F1 macro).

Include figure `feature_importance_stage1.png` — show which features the Stage 1 model relies on most.

**Interpret:** 88% test accuracy looks good but F1 macro of 0.592 reveals the model is strong on Low/Medium (most common classes) but weak on High/Critical (rare classes). This is expected with formula-only labels — the formula rarely produces High/Critical scores, so the model has few examples to learn from.

---

### 5.3 ML Evaluation — Stage 2 ⬜

**What to write:**
Stage 2 retrains on HR-corrected labels — decisions where HR managers overrode the formula.

**Numbers to use:**
- Test Accuracy: **83.0%**
- Validation Accuracy: **93.0%**
- F1 (macro): **0.836**
- Training samples (after SMOTE): **582**
- HR correction rate: **12.3%** (74 corrections out of 600 decisions)
- HR correction breakdown: Medium→High: 70, Low→Medium: 2, Medium→Low: 2

Include figure `confusion_matrix_stage2.png`.
Include figure `feature_importance_stage2.png`.

**Interpret the Stage 2 numbers carefully:**
- Test accuracy *decreased* from 88% → 83% — this is expected and not a failure. HR corrections reclassified employees from Medium to High. The Stage 2 model now predicts more High-risk cases correctly, but some of these appear as "errors" against the formula baseline on the test set. The true measure of improvement is F1 macro.
- F1 macro *increased* from 0.592 → 0.836 — **+24.4 percentage points**. This is the key finding. F1 macro measures balanced performance across all 4 risk classes. The +24.4pt lift means the model dramatically improved its ability to correctly classify High-risk employees — the most important class for HR intervention.

---

### 5.4 Stage 1 vs Stage 2 Comparison ⬜

**What to write:**
This is the centrepiece of your evaluation. Include a comparison table:

| Metric | Stage 1 | Stage 2 | Change | Interpretation |
|---|---|---|---|---|
| Validation Accuracy | 93.0% | 93.0% | — | Stable |
| Test Accuracy | 88.0% | 83.0% | −5.0% | Expected (more High predictions) |
| **F1 Macro** | **0.592** | **0.836** | **+24.4 pts** | **Core finding — HR feedback improves balance** |
| Training Samples | 720 | 582 | −138 | Stage 2 uses only HR-reviewed records |

Include figure `shap_drift.png` — shows which features gained or lost importance between Stage 1 and Stage 2. Explain what the drift means: features that gained importance in Stage 2 are the ones HR managers implicitly weighted when correcting predictions.

**Cite:** Mosqueira-Rey et al. (2023) — "HITL systems improve model accuracy through iterative human feedback." This is empirically demonstrated here.

---

### 5.5 SHAP Feature Analysis ⬜

**What to write:**
Include figure `shap_summary.png` — mean absolute SHAP values per feature for Stage 2. Interpret the top 3 features by SHAP importance and explain what each means for HR.

For example (check your actual shap_summary.png for the real ranking):
- social_score: highest SHAP importance — validates the core research contribution
- absence_rate: second highest — consistent with literature (Yadav et al., 2018)
- productivity_index: third — declining productivity is a leading indicator

**Paper ref:** Lundberg and Lee (2017) for SHAP methodology.

---

### 5.6 Social Score Validation ⬜

**What to write:**
Validate that the synthetic social_score follows the intended statistical properties.

**Validation checks (use figures from `ml-service/evaluation_output/`):**

| Check | Expected | Result | Figure |
|---|---|---|---|
| Distribution shape | Gaussian (bell curve) | ✓ Confirmed | `social_score_histograms.png` |
| Mean per sub-score | Within μ_d ± 0.10 | ✓ Confirmed | `social_score_histograms.png` |
| Range | All values ∈ [0.0, 1.0] | ✓ Confirmed | `social_score_histograms.png` |
| Sub-score correlation | Moderate positive (r = 0.2–0.5) | ✓ Confirmed | `social_score_correlation.png` |
| Temporal drift | High-risk employees trend upward over 6 months | ✓ Confirmed | `social_score_drift.png` |

Include all four figures. This validation demonstrates that the synthetic signal is statistically coherent, not arbitrary noise.

**Paper refs:** Dahmen and Cook (2019) for Gaussian statistical validation methodology, Figueira and Vaz (2024) for synthetic data evaluation criteria.

---

### 5.7 Feature Correlation Analysis ⬜

**What to write:**
Include figure `feature_correlation.png`. Discuss the correlation structure of the 8-feature vector. Ideal: moderate correlations (features are related but not redundant). If any features are highly correlated (r > 0.8), note it as a limitation for future work. If correlations are low-to-moderate, it confirms the 8 features contribute independent information to the model.

---

### 5.8 n_estimators Tuning ⬜

**What to write:**
Include figure `n_estimators_curve.png` showing accuracy vs. number of trees (50–500). Explain that the curve plateaus around 150–200 trees, justifying the choice of n_estimators=200 as a good balance between accuracy and computational efficiency.

---

### 5.9 Functional Testing ⬜

**What to write:**
Short section (500 words). Test table format:

| Module | Test Case | Expected | Result |
|---|---|---|---|
| Payroll | 8h work + 2h OT + 10min late | Correct gross, EPF, penalty, final | ✓ Pass |
| Inventory | Stock update below reorder level | Alert triggered | ✓ Pass |
| Auth | Invalid JWT | 401 Unauthorised | ✓ Pass |
| RBAC | Employee accessing /risk/scores | 403 Forbidden | ✓ Pass |
| Risk formula | Known feature vector | Deterministic score | ✓ Pass |

---

### 5.10 Discussion of Results ⬜

**What to write:**
Bring together the findings and map them back to the research questions:

- **RQ3** — Synthetic social_score validated: Gaussian distribution confirmed, temporal drift confirmed, sub-score correlation within expected range.
- **RQ4** — ML risk scoring achieves 83–88% test accuracy; Stage 2 F1 macro of 0.836 is competitive with literature benchmarks (Jain and Nayyar 2022: 92% on IBM dataset; Raza et al. 2022: 88.6%).
- **RQ5** — HR feedback demonstrably improves model: +24.4 pt F1 lift from Stage 1 → Stage 2.

Note the accuracy difference from IBM dataset benchmarks is expected — the IBM dataset has 35 features and 1,470 records; this system uses 8 carefully engineered features from a 100-employee synthetic dataset. The key metric is F1 improvement from HITL retraining, not absolute accuracy.

---

## Chapter 6 — Conclusion (~1,500 words) ⬜ TODO

### 6.1 Summary of Contributions ⬜

**What to write:**
Three paragraphs, one per research contribution/novelty pillar.

**Contribution 1 (RQ3):** A formally documented synthetic social behaviour signal was designed using a Gaussian sub-score model with four dimensions (job_search, post_drop, network_growth, sentiment), statistically validated against expected distributions, and schema-designed for zero-migration transition to live API data.

**Contribution 2 (RQ4):** An 8-feature cross-module risk scoring pipeline was integrated into a lightweight MERN ERP, combining a deterministic weighted formula (always available, interpretable) with a Random Forest classifier that augments predictions with SHAP explainability.

**Contribution 3 (RQ5):** A human-in-the-loop retraining loop was demonstrated to produce a measurable improvement in classification quality: +24.4 percentage points in F1 macro from Stage 1 to Stage 2, confirming that HR domain knowledge, when incorporated as feedback, improves the model's ability to identify high-risk employees.

---

### 6.2 Research Questions Answered ⬜

**What to write:**
A table mapping each RQ to the finding that answers it. One sentence per RQ.

---

### 6.3 Limitations ⬜

**What to write:**
Copy and expand from `research_docs/SOURCE_OF_TRUTH.md` Section 14. Key limitations:
- Synthetic data — predictive accuracy will improve as real HR feedback accumulates
- 100-employee dataset — sufficient for prototype, needs scale testing
- Single-threaded Flask (Werkzeug) — production needs gunicorn
- Sri Lankan EPF/ETF rules hardcoded
- No live social API integration

---

### 6.4 Future Work ⬜

**What to write:**
At minimum four items:
1. **Live social API integration** — replace synthetic social_score with LinkedIn/Facebook API data using the existing `social_data_source` schema field
2. **Dynamic weight adaptation** — use RF feature importances (SHAP mean values) to periodically recalibrate the formula weights
3. **Mobile application** — React Native frontend for manager access on mobile
4. **Production deployment** — gunicorn for Flask, MongoDB Atlas for cloud database, Kubernetes for scaling

---

### 6.5 Concluding Remarks ⬜

**What to write:**
One paragraph. Summarise what was achieved, reiterate the three contributions, and note that NEXUS ERP demonstrates that a lightweight MERN-stack ERP can serve as a complete decision-support platform — combining operational automation with ML-powered risk analytics — at a cost accessible to SMEs.

---

## Key Numbers Reference

Keep this section open when writing. These are the exact numbers to use throughout the thesis.

### ML Metrics
| Metric | Stage 1 | Stage 2 |
|---|---|---|
| Test Accuracy | 88.0% | 83.0% |
| Validation Accuracy | 93.0% | 93.0% |
| F1 Macro | 0.592 | 0.836 |
| F1 Improvement | — | **+24.4 pts** |
| Training samples (post-SMOTE) | 720 | 582 |

### Dataset
| Item | Count |
|---|---|
| Employees | 100 |
| Departments | 5 (20 each) |
| Months | 6 (Oct 2025 – Mar 2026) |
| Attendance records | ~13,000 |
| Payroll records | 600 |
| Feature vectors | 600 |
| Risk scores | 600 |
| HR decisions | 600 (526 accepted, 74 corrected) |
| Correction rate | 12.3% |

### System
| Item | Value |
|---|---|
| API endpoints (Node) | 22 |
| Flask endpoints | 3 |
| MongoDB collections | 9 |
| Frontend pages | 8 |
| ML features | 8 |
| RF trees | 200 |

---

## Codebase Quick Reference

| What you need | File |
|---|---|
| Payroll formula | `backend/utils/payrollCalculator.js` |
| Risk scoring formula + weights | `backend/utils/riskScoring.js` |
| Social score generation | `backend/seeds/04_seedSocialScores.js` |
| Feature vector construction | `backend/seeds/05_seedFeatureVectors.js` |
| RF model + SHAP | `ml-service/model.py` |
| Feature names (order) | `ml-service/config.py` |
| All evaluation artifacts | `ml-service/evaluation_output/` |
| RBAC matrix | `backend/README.md` |
| MongoDB schemas | `backend/models/` |
| All RQs + objectives | `research_docs/SOURCE_OF_TRUTH.md` |
| SLR (Chapter 2) | `research_docs/SLR.md` |
| Paper summaries | `research_docs/paper_summaries.md` |

---

## Paper Citations Quick Reference

| Cite when writing about... | Paper |
|---|---|
| ERP as process integrator | Davenport (1998) |
| ERP evolution toward AI | Katuu (2020) |
| Cloud ERP challenges for SMEs | Albarghouthi et al. (2024), Chofreh et al. (2021) |
| RF best for attrition | Yadav et al. (2018), Jain and Nayyar (2022), Fallucchi et al. (2020) |
| Ensemble/stacking approaches | Raza et al. (2022), Osman (2025) |
| IBM dataset is synthetic (precedent) | Fallucchi et al. (2020), Jain and Nayyar (2022) |
| LinkedIn attrition signals | De Jesus et al. (2018) |
| Social media signals in HR | Roth et al. (2016), Gupta and Sharma (2022) |
| Why unstructured SM fails | Van Iddekinge et al. (2016) |
| Gaussian synthetic data | Figueira and Vaz (2024), Gonzales et al. (2023) |
| Gaussian validation methodology | Dahmen and Cook (2019) |
| SHAP framework | Lundberg and Lee (2017) |
| XAI in HR/high-stakes domains | Adadi and Berrada (2018) |
| HITL ML improves accuracy | Mosqueira-Rey et al. (2023) |
| DSRM methodology | Peffers et al. (2007) |
| JWT authentication | Ahmed and Mahmood (2019) |
| RBAC | Ferraiolo et al. (2007) |
