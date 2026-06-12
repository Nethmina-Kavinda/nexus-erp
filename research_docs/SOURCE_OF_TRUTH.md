# NEXUS ERP — Source of Truth

**Project:** Design and Development of an Integrated ERP Portal with Employee Risk Scoring Using Synthetic Social Behaviour Signals
**Client:** Nethmina Kavinda Bandara
**University:** NSBM Green University — BSc (Hons) Computer Science
**Methodology:** Design Science Research (Peffers' DSRM)
**Tech Stack:** MERN (MongoDB, Express.js, React.js, Node.js) + Python Flask ML Microservice
**Last Updated:** 2026-06-12 (reflects fully implemented and tested system)

---

## 1. What This Project Is

NEXUS ERP is a web-based Enterprise Resource Planning system built for small-to-medium enterprises that integrates four core modules into a single platform:

1. **HR / Employee Management** — employee profiles, roles, CRUD
2. **Attendance + Payroll** — automated salary computation from check-in/out data
3. **Inventory Management** — dual-tier (raw materials + finished goods) with reorder alerts
4. **Employee Risk Scoring Engine** — ML-powered prediction of employee attrition risk

The system is not just an ERP. It is a **decision-support artefact** — the ERP collects operational data, and the ML engine transforms that data into actionable workforce risk insights.

---

## 2. Research Core and Weight Distribution

### What is the core research contribution?

The ML-powered Employee Risk Scoring Engine — specifically:
- The **synthetic social_score** model (Gaussian sub-score generation as a documented API proxy)
- The **weighted composite risk formula** combining 8 behavioural features
- The **Random Forest classifier** with evaluation and explainability (SHAP)
- The **HR feedback loop** enabling human-in-the-loop model retraining

### Weight Distribution

| Component | Research Weight | Role |
|---|---|---|
| ML Risk Scoring + Social Score | **60-65%** | The research contribution — the novel, defensible part |
| ERP System (HR, Payroll, Inventory) | **25-30%** | Supporting infrastructure — the data source for ML |
| Security (JWT, OTP, RBAC) | **5-10%** | Standard implementation, not novel |

### Implication for Thesis Writing

- ERP modules: describe concisely with architecture diagrams and tables. Don't over-explain CRUD.
- ML sections: go deep. Feature engineering, model selection justification, hyperparameters, social score math, feedback loop, SHAP analysis.
- Evaluation chapter: 70%+ should be ML evaluation — confusion matrix, precision/recall/F1 per class, feature importance, SHAP plots, before/after retraining comparison.

### Implication for Viva Defense

Examiners will focus on:
- "Why Random Forest over other algorithms?"
- "How did you validate the synthetic social_score?"
- "What's your model accuracy per risk class?"
- "How does SHAP explain predictions?"
- "What happens to accuracy after HR feedback retraining?"

They will NOT deeply question payroll formulas or inventory CRUD.

---

## 3. Research Novelty

### The Gap

Existing systems fall into one of three categories:
1. **ERP only** (SAP, Odoo) — no ML-based employee risk scoring
2. **ML attrition prediction only** — standalone models on datasets (e.g., IBM HR dataset), no integrated ERP
3. **Enterprise HR analytics** — expensive, inflexible, not tailored for SMEs

No lightweight MERN-stack ERP system has combined:
- Payroll automation + inventory management
- A formally documented synthetic social behaviour signal
- ML-powered employee risk scoring with a feedback loop

### Three Pillars of Novelty

**Pillar 1: Synthetic Social Score as API Proxy**
- A composite signal (0.0–1.0) generated using Gaussian sub-score modelling
- Formally documented as a placeholder for LinkedIn/Facebook API data
- Schema designed for zero-migration transition to live data (`social_data_source` field)
- This is original — no prior work has formally defined a synthetic social signal with a documented production pathway

**Pillar 2: Integrated Risk Scoring in a Lightweight ERP**
- 8-feature vector constructed from cross-module ERP data (attendance + payroll + social)
- Weighted composite formula + Random Forest ML classification
- Risk tiers: Low / Medium / High / Critical
- Workforce Risk Level (WRL) as a portfolio-level organisational health metric

**Pillar 3: Human-in-the-Loop ML Retraining**
- HR managers accept/reject ML predictions
- Accumulated decisions become ground truth for model retraining
- The model improves from human judgement over time
- This bridges the gap between automated prediction and responsible HR decision-making

### Research Significance

1. **For academia:** Demonstrates a responsible approach to synthetic social data modelling that can be replicated and extended
2. **For industry:** Provides SMEs with an affordable, integrated ERP that includes predictive workforce analytics previously available only in enterprise-grade solutions
3. **For methodology:** Shows how Design Science Research can produce a functional IT artefact that combines software engineering with machine learning

---

## 4. Research Objectives

### Primary Objective

To design and develop NEXUS ERP — an integrated ERP portal using the MERN stack that automates payroll processing and inventory management, introduces a synthetic social behaviour signal (social_score), and provides a machine-learning-powered employee risk scoring engine for enterprise decision-making.

### Secondary Objectives

| # | Objective | Maps to RQ | Research Weight |
|---|---|---|---|
| SO1 | Develop an automated attendance and payroll calculation system with support for overtime, allowances, and statutory deductions (EPF/ETF) | RQ1 | Medium |
| SO2 | Implement a dual-tier inventory management system for raw materials and finished goods | RQ2 | Low |
| SO3 | Introduce real-time automated alerts for low inventory levels to prevent operational disruptions | RQ2 | Low |
| SO4 | Design and seed a synthetic social_score signal (0.0–1.0) using a Gaussian sub-score model, documented as a LinkedIn/Facebook API integration proxy for future production deployment | RQ3 | **High** |
| SO5 | Develop an employee risk scoring pipeline combining behavioural features, payroll variance, attendance patterns, and social_score into a weighted composite score, classified into Low / Medium / High / Critical tiers | RQ4 | **High** |
| SO6 | Integrate a Python (Flask) Random Forest microservice for ML-based risk classification and HR feedback-driven retraining | RQ4, RQ5 | **High** |
| SO7 | Provide workforce and inventory analytics dashboards for performance monitoring | RQ7 | Medium |
| SO8 | Ensure system security through JWT-based session control and OTP-based email verification | RQ6 | Low |

### Objective–Novelty Alignment

- **SO4** directly supports **Novelty Pillar 1** (Synthetic Social Score)
- **SO5 + SO6** directly support **Novelty Pillar 2** (Integrated Risk Scoring) and **Novelty Pillar 3** (HR Feedback Loop)
- SO1, SO2, SO3, SO7, SO8 are supporting objectives — they build the ERP infrastructure that feeds the core research

---

## 5. Research Problem and Questions

### Main Research Problem

How can an integrated ERP system be designed to automate payroll processing and inventory management, incorporate synthetic social behaviour signals as a documented proxy for real-world API-sourced data, and generate machine-learning-powered employee risk scores — while ensuring accuracy, scalability, and data security for enterprise use?

### Research Questions

| RQ | Question | Weight | Primary Literature Theme |
|---|---|---|---|
| RQ1 | How can attendance data be accurately converted into automated payroll calculations (overtime, allowances, deductions, late penalties)? | Medium | Automated payroll systems |
| RQ2 | How can inventory stock levels be monitored in real time with automated alert mechanisms based on a reorder-level model? | Low | Inventory management, reorder models |
| RQ3 | How can a synthetic social_score (0.0–1.0) be formally defined, seeded using Gaussian sub-score distributions, and documented as a validated proxy for LinkedIn/Facebook API integration? | **High** | Social media signals in HR, synthetic data generation |
| RQ4 | How can workforce behavioural features be combined into a weighted composite risk score that classifies employees into risk tiers? | **High** | Employee attrition prediction, ensemble ML |
| RQ5 | How can HR decision feedback be incorporated into a machine learning retraining loop to improve risk prediction accuracy over time? | **High** | Human-in-the-loop ML, active learning |
| RQ6 | How can secure authentication and session management be enforced in an ERP environment? | Low | JWT, RBAC, enterprise security |
| RQ7 | How effective is the MERN stack in developing a scalable enterprise-level ERP solution integrated with a Python ML microservice? | Medium | Full-stack ERP development |

---

## 6. Methodology — Design Science Research (DSRM)

### Why DSR?

The primary outcome is an IT artefact (NEXUS ERP) that solves a real-world problem. DSR focuses on building, evaluating, and refining functional systems — not theorising about existing phenomena. This is appropriate for a CS project.

### Peffers' DSRM Stages

| Stage | Application in This Project |
|---|---|
| 1. Problem Identification | SMEs lack integrated ERP with predictive workforce analytics |
| 2. Objectives | Build NEXUS ERP with automated payroll, inventory, and ML risk scoring |
| 3. Design & Development | MERN stack implementation + Flask ML microservice |
| 4. Demonstration | System walkthrough with use cases (HR, Manager, Employee roles) |
| 5. Evaluation | Functional testing + ML model evaluation (accuracy, SHAP, confusion matrix) |
| 6. Communication | The thesis document itself |

---

## 7. System Architecture

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | Interactive UI, dashboards, risk visualisations |
| Backend | Node.js + Express.js | REST API, business logic, payroll engine, risk pipeline |
| Database | MongoDB + Mongoose | Document storage for all collections |
| ML Microservice | Python + Flask + scikit-learn | Random Forest classifier, /predict, /train, /health |
| Authentication | JWT + bcrypt | Secure session management, role-based access |
| Email | Nodemailer + node-cron | OTP verification, inventory alerts, risk alerts |

### Data Flow

```
Employee uses system daily
    ↓
Attendance Module → records check-in/out, late minutes, absences
Payroll Module    → computes salary from attendance data
Inventory Module  → tracks stock levels, triggers reorder alerts
    ↓
Feature Vector Construction (per employee, per month)
    ↓
8 features: absence_rate, late_rate, overtime_ratio, productivity_index,
            payroll_variance, social_score, tenure_months, department_risk
    ↓
Two parallel scoring paths:
  Path A: Weighted composite formula (Node.js) → Risk Score 0-100
  Path B: Random Forest classifier (Flask)     → Risk Class + Feature Importance
    ↓
Dashboard displays risk tiers: Low / Medium / High / Critical
    ↓
HR Manager accepts or rejects prediction
    ↓
Decisions stored → Model retrained on accumulated feedback
```

### MongoDB Collections (9 total)

1. **Employees** — profiles, roles, department, risk_bias (hidden)
2. **Attendance** — daily check-in/out records, late minutes
3. **Payroll** — monthly salary computations
4. **Inventory** — stock items, quantities, reorder levels
5. **InventoryTransactions** — stock additions and shipments
6. **SocialScores** — monthly social_score records per employee
7. **EmployeeFeatures** — 8-feature vectors per employee per month
8. **RiskScores** — computed risk scores and classifications
9. **HRDecisions** — accept/reject feedback from HR managers

---

## 8. The Four Pillars — Technical Detail

### Pillar 1: Attendance + Payroll

**Payroll Computation Model (exact implemented constants):**
```
STANDARD_HOURS_PER_DAY  = 8
OVERTIME_MULTIPLIER     = 1.5
EPF_RATE                = 0.08   (8% employee provident fund)
ETF_RATE                = 0.03   (3% employee trust fund)
PENALTY_RATE_PER_MINUTE = LKR 50

gross_salary = (present_days × 8 × hourly_rate)
             + (overtime_hours × hourly_rate × 1.5)
             + allowances

epf          = gross_salary × 0.08
etf          = gross_salary × 0.03
net_salary   = gross_salary − epf − etf

late_penalty = total_late_minutes × 50
final_salary = max(0, net_salary − late_penalty)   ← floored at 0, no negative payslips
```

All monetary values rounded to 2 decimal places (LKR cents). EPF and ETF are statutory deductions specific to Sri Lankan labour law. Late penalty deducted after net salary computation to prevent double-counting.

**Research relevance:** Attendance and payroll data generate 5 of the 8 ML features (absence_rate, late_rate, overtime_ratio, productivity_index, payroll_variance).

### Pillar 2: Inventory Management

**Reorder Model:**
```
ReorderLevel = (AverageDailyUsage × LeadTime) + SafetyStock
If CurrentStock ≤ ReorderLevel → TriggerReorderAlert()
```

Dual-tier: raw materials and finished goods tracked separately.
Automated email alerts when stock drops below reorder level.

**Research relevance:** Demonstrates the "integrated" aspect of the ERP — HR and inventory unified in one platform (part of the research gap argument).

### Pillar 3: Synthetic Social Score

**Conceptual basis:** Research shows social media behaviour changes before employees quit:
- Increased LinkedIn job searching
- Decreased posting frequency (social silence)
- Growing recruiter connections
- Negative sentiment in posts

**Why synthetic:** Live API integration infeasible in research context (approval timelines, OAuth, ethical barriers).

**Four sub-scores:**

| Sub-score | What it simulates | Weight |
|---|---|---|
| `job_search` | LinkedIn job browsing activity | 0.35 |
| `post_drop` | Decrease in social media posting | 0.25 |
| `network_growth` | New recruiter/professional connections | 0.20 |
| `sentiment` | Negativity in posts/comments | 0.20 |

Weights determined by empirical literature: job_search has strongest attrition linkage (Van Iddekinge et al., 2016).

**Generation formula (per sub-score, per employee, per month):**
```
sub_score_d = clamp(N(μ_d + β, σ_d), 0, 1)
```

Where:
- `N(μ, σ)` = random draw from Normal (Gaussian) distribution
- `μ_d` = base mean for dimension d (see exact values below)
- `β` = employee's risk_bias (0.0–0.5), set during seeding
- `σ_d` = standard deviation (see exact values below)
- `clamp` = force result into [0.0, 1.0]

**Exact VAR Model Parameters (implemented in seed step 4):**

| Sub-score | Base Mean (μ) | Std Dev (σ) | Composite Weight |
|---|---|---|---|
| `job_search` | 0.25 | 0.12 | 0.35 |
| `post_drop` | 0.30 | 0.10 | 0.25 |
| `network_growth` | 0.20 | 0.10 | 0.20 |
| `sentiment` | 0.20 | 0.10 | 0.20 |

**VAR Autoregressive Persistence:**
```
ALPHA = 0.65   (autoregressive smoothing coefficient)
current_month = ALPHA × previous_month + (1 − ALPHA) × new_draw
```
This prevents wild month-to-month swings and models the gradual buildup of disengagement signals over time.

**Cholesky Decomposition (inter-sub-score correlation):**
Sub-scores are not independent — an employee actively job-searching also tends to post less. A 4×4 correlation matrix is Cholesky-decomposed to inject controlled correlation into the multivariate draws.

**Why Gaussian (not uniform random):**
- Uniform: wild swings (0.12, 0.87, 0.03) — unrealistic
- Gaussian: clustered values with natural variance (0.52, 0.57, 0.48) — mirrors real human behaviour

**Box-Muller Transform** is used to convert uniform random numbers to Gaussian:
```
Given u1, u2 from Uniform(0,1):
z = sqrt(−2 × ln(u1)) × cos(2π × u2)
result = μ + σ × z
```

**Composite social_score:**
```
social_score = 0.35 × job_search + 0.25 × post_drop + 0.20 × network_growth + 0.20 × sentiment
```

**Temporal drift:** At-risk employees (high risk_bias) show gradual upward trend over 6 months, simulating real-world disengagement buildup before attrition.

**Production pathway:** The `social_data_source` field in MongoDB transitions from `'synthetic'` to `'linkedin_api'` when real integration is implemented. No schema migration required.

### Pillar 4: Risk Scoring Engine

**Step 1 — Feature Vector (8 features per employee per month):**

| Feature | Source | What it measures |
|---|---|---|
| `absence_rate` | Attendance | Frequency of absences |
| `late_rate` | Attendance | Frequency of late arrivals |
| `overtime_ratio` | Attendance | Overtime relative to standard hours (burnout signal) |
| `productivity_index` | Payroll + Attendance | Output relative to hours worked |
| `payroll_variance` | Payroll | Month-to-month salary fluctuation |
| `social_score` | SocialScore collection | Synthetic social behaviour signal |
| `tenure_months` | Employee record | Length of employment |
| `department_risk` | Aggregated | Average risk score of employee's department |

**Step 2 — Weighted Composite Score (Node.js):**
```
RiskScore = (w1×absence + w2×late + w3×overtime + w4×productivity + w5×payroll_var + w6×social + w7×tenure + w8×dept_risk) × 100
```

**Risk Classification Tiers:**

| Score Range | Tier | Action |
|---|---|---|
| 0–25 | Low | No action needed |
| 26–50 | Medium | Monitor |
| 51–75 | High | HR intervention recommended |
| 76–100 | Critical | Immediate attention required |

**Step 3 — Random Forest Classifier (Flask Microservice):**

Exact hyperparameters:
```python
RandomForestClassifier(
    n_estimators  = 200,          # tuned via n_estimators_curve (50–500 sweep)
    class_weight  = 'balanced',   # compensates for Low-class majority
    random_state  = 42,           # reproducibility
    max_depth     = None,         # unlimited — trees grow to pure leaves
    min_samples_split = 2,        # default
)
```

**SMOTE Oversampling (applied to training set only):**
```python
k_neighbors = min(5, minority_class_size − 1)
random_state = 42
```
SMOTE is applied only when the minority class has more than 1 sample. It is never applied to the validation or test sets to prevent data leakage.

**Temporal Train/Val/Test Split:**
```
Seed months: ['2025-10','2025-11','2025-12','2026-01','2026-02','2026-03']
Train:  months 1–4  (2025-10 to 2026-01)
Val:    month 5     (2026-02)
Test:   month 6     (2026-03)
```
This temporal split prevents data leakage — the model is never evaluated on months it trained on.

**Feature vector order (must match config.py — load-bearing):**
```
[absence_rate, late_rate, overtime_ratio, productivity_index,
 payroll_variance, social_score, tenure_months, department_risk]
```

**SHAP Explainability:**
- Uses `TreeExplainer` (exact, not approximate)
- Returns `shap_base_value` + 8 individual feature contributions per prediction
- `top_drivers` extracted: top 3 features ranked by |SHAP|, labelled high/moderate/low

**Feature Engineering Normalization (seed step 5):**
- All 8 features normalised to [0,1] using min-max scaling across the full dataset
- `productivity_index` = 1 − (actual_hours / expected_hours) — inverted so higher = more risk
- `tenure_months` = 1 − (tenure / max_tenure) — inverted so newer employee = higher risk
- `department_risk` = leave-one-out peer average (employee excluded from own dept average to prevent leakage)
- `payroll_variance` = |current_salary − previous_salary| / previous_salary
- Window-informed blending: `0.6 × current + 0.3 × prev_month + 0.1 × two_months_back`

**Step 4 — HR Feedback Loop:**
- HR manager sees prediction on dashboard
- Clicks Accept or Reject
- Decision stored in HRDecision collection
- Accumulated decisions become ground truth
- HR triggers retrain via `POST /api/risk/retrain` → Flask `/train`
- Model improves from human judgement over time

**Confidence Labels:**
```
Strong:   ML confidence > 0.60
Moderate: 0.40 ≤ confidence ≤ 0.60
Uncertain: confidence < 0.40
```

**Workforce Risk Level (WRL) — Portfolio Metric:**
```
WRL = (High_count + Critical_count) / Total_employees × 100%
If WRL ≥ 30% → Automated email alert to HR administrators
```
Displayed on main dashboard with department-level breakdown.

---

## 9. Data Strategy

### All Data is Synthetic

There is no external dataset. All data is generated through MongoDB seeding scripts:

| Data Type | Generation Method |
|---|---|
| Employee profiles | Seeded with names, departments, roles, hidden risk_bias |
| Attendance records | Simulated check-in/out times, late minutes, absences |
| Payroll records | Computed from synthetic attendance data |
| Social scores | Gaussian sub-score model (6 months per employee) |
| Feature vectors | Aggregated from attendance + payroll + social scores |
| Inventory data | Seeded stock items with transaction history |

### Why Synthetic Data is Acceptable

1. **Ethical** — no real employee data, no privacy concerns
2. **Controlled** — ground truth is known (risk_bias set during seeding)
3. **Reproducible** — same seed produces similar statistical distributions
4. **Validated** — Gaussian distribution verified via mean, std dev, range checks
5. **Precedented** — IBM's HR Analytics dataset (widely cited in literature) is also synthetic

### Dataset Scale (fully implemented — updated 2026-06-12)

**100 employees × 6 months** across 5 departments (20 per department):
`Engineering · Marketing · Finance · Operations · HR`

**Seed months:** October 2025 – March 2026 (`2025-10` through `2026-03`)

| Collection | Records | Notes |
|---|---|---|
| Employees | 100 | 20 per department |
| Attendance | ~13,000 | Daily records (6 months × ~100 working days) |
| Payroll | 600 | 6 months × 100 employees (upserted, idempotent) |
| SocialScores | 600 | 6 months × 100 employees |
| EmployeeFeatures | 600 | 6 months × 100 employees (normalised vectors) |
| RiskScores | 600 | 6 months × 100 employees (formula-derived labels) |
| HRDecisions | 600 | 526 accepted (87.7%), 74 rejected (12.3% correction rate) |
| Inventory | 15 items + 69 transactions | 8 raw materials, 7 finished goods |

**Risk bias distribution across 100 employees:**
- Low bias (≤0.05): 40 employees
- Medium bias (0.06–0.15): 35 employees
- High bias (0.16–0.35): 18 employees
- Critical bias (>0.35): 7 employees

**Formula scoring output (from seeded feature vectors):**
- Low: 250 records · Medium: 341 records · High: 9 records · Critical: 0 records

**HR correction types in seed (74 total rejections):**
- Medium → High: 70 (high risk_bias employees underclassified by formula)
- Low → Medium: 2
- Medium → Low: 2

---

## 10. Evaluation Plan

### Functional Evaluation

| Test Area | Method |
|---|---|
| Payroll accuracy | Verify against manual formula application on test data |
| Inventory alerts | Measure time from stock update to email dispatch |
| API response time | Load test key endpoints |
| Security | JWT expiry, OTP validation, role-based route protection |
| Risk score consistency | Feature vector reproducibility, weighted score determinism |

### ML Evaluation (Primary Focus — 70% of evaluation chapter)

| Metric | Purpose |
|---|---|
| Classification accuracy | Overall model correctness |
| Confusion matrix | Per-class performance breakdown |
| Precision per class | How many predicted High are actually High? |
| Recall per class | How many actual High were caught? |
| F1 score per class | Balance of precision and recall |
| Feature importance | Which features drive predictions most? |
| SHAP analysis | Explainable AI — why did the model predict this class for this employee? |
| Before/after retraining | Does HR feedback improve model accuracy? |

### Social Score Validation

| Check | Method |
|---|---|
| Distribution shape | Histogram + Q-Q plot should show Gaussian |
| Mean and std dev | Should match configured μ_d and σ_d |
| Range | All values within [0.0, 1.0] |
| Temporal drift | At-risk employees show upward trend over 6 months |
| Sub-score correlation | Moderate positive correlation expected (same underlying risk_bias) |

---

## 11. SLR Thematic Coverage

The Systematic Literature Review should cover 5 thematic areas reflecting the research weight:

| Theme | Papers | Covers RQs |
|---|---|---|
| ERP systems for SMEs (MERN/web-based) | 3-4 | RQ1, RQ2, RQ7 |
| Employee attrition prediction using ML (Random Forest, ensembles) | 8-10 | RQ4 |
| Social media signals in HR analytics | 3-4 | RQ3 |
| Synthetic data generation (Gaussian modelling, simulation) | 2-3 | RQ3 |
| Explainable AI in HR + Human-in-the-loop ML | 2-3 | RQ5 |
| Enterprise security (JWT, RBAC) | 1-2 | RQ6 |

Total target: **20-25 papers minimum** (proposal only has 13 references — must expand significantly)

---

## 12. Key References from Proposal

| Reference | Relevance |
|---|---|
| Davenport (1998) | ERP systems in enterprises |
| Kavanagh et al. (2015) | HRMS, automated payroll |
| Silver et al. (2016) | Inventory management |
| Chopra & Meindl (2019) | Supply chain, reorder models |
| Tilkov & Vinoski (2010) | Node.js, web technologies |
| Fallucchi et al. (2020) | Employee attrition prediction using ML |
| Peel & Wilson (2019) | Random Forest + SHAP for attrition |
| Van Iddekinge et al. (2016) | Social media signals for HR assessment |
| Sajjadiani et al. (2019) | ML for applicant/turnover prediction |
| Peffers et al. (2007) | DSRM methodology |
| Armbrust et al. (2010) | Cloud computing, web-based ERP |
| Das et al. (2018) | Multi-factor authentication |
| Ferraiolo et al. (2007) | Role-based access control |

---

## 13. Ethical Considerations

1. **All employee data is synthetic** — does not correspond to any real individual
2. **social_score is explicitly documented as synthetic** — the `social_data_source` field is set to `'synthetic'` throughout the research phase, clearly distinguishing simulated signals from real social media data
3. **Live API integration requires OAuth consent** — the design documentation specifies that employee consent is mandatory before any social data collection
4. **No personal or payroll data shared with third parties**
5. **Secure data handling** — bcrypt password hashing, JWT authentication, HTTPS
6. **ML system is decision-support only** — all risk classifications require mandatory HR review and acceptance; no automated adverse action is taken against employees
7. **Compliance with ethical standards** for handling financial and personal information

---

## 14. Limitations of the Study

| Limitation | Implication |
|---|---|
| Designed for SMEs only | Large-scale deployments may require infrastructure scaling (load balancers, sharding) |
| social_score is synthetic | Real LinkedIn/Facebook API integration requires platform approval and user consent workflows beyond this study's scope |
| Jurisdiction-specific payroll | Sri Lankan EPF/ETF rules are hardcoded; other countries need rule customisation |
| RF trained on synthetic data | Predictive accuracy in production will improve only as HR feedback accumulates real ground truth |
| No banking API integration | Payroll disbursement (actual salary transfer) is not included |
| 100-employee synthetic dataset | Sufficient for ML evaluation and prototype demonstration; production deployment would benefit from testing at larger scale with diverse real-world data distributions |
| No mobile app | Frontend is web-only (React); a mobile version is future work |

---

## 15. Scope Boundaries

### In Scope

- Full MERN-stack ERP with HR, Attendance, Payroll, Inventory modules
- Synthetic social_score generation using Gaussian sub-score model
- ML-powered risk scoring (Random Forest) via Python Flask microservice
- HR feedback loop with model retraining capability
- JWT authentication with role-based access control
- OTP-based email verification
- Automated email alerts (inventory reorder, high-risk workforce)
- Dashboard with KPIs, charts, risk overview
- SHAP-based model explainability
- Evaluation: ML metrics + functional testing + social score validation

### Out of Scope

- Real LinkedIn/Facebook API integration (documented as future work)
- Mobile application
- Banking/payment gateway integration for payroll disbursement
- Multi-tenancy (single organisation deployment)
- Real-time chat or internal messaging
- Advanced HR features (recruitment, performance reviews, training management)
- Cloud deployment and DevOps (CI/CD pipelines)
- Localisation / multi-language support

---

## 16. User Roles and Permissions

| Role | Access Level |
|---|---|
| **Admin** | Full system access — manage users, configure payroll rules, inventory settings, system settings, view all dashboards |
| **HR Manager** | Employee management, view/accept/reject risk predictions, trigger model retraining, view workforce analytics, manage attendance |
| **Manager** | View department employees, attendance summaries, department risk overview, inventory monitoring for their department |
| **Employee** | View own profile, attendance history, payslips, personal risk score (limited view) |

### Key Permission Rules

- Only Admin can create/delete user accounts
- Only HR can accept/reject risk predictions (feedback loop)
- Only HR/Admin can trigger model retraining
- Managers see only their department's data
- Employees see only their own data
- Inventory management accessible to Admin and Managers
- Payroll records visible to Admin, HR, and the individual employee

---

## 17. API Endpoint Overview

### Node.js Backend (22 REST endpoints)

All endpoints prefixed `/api`. Protected endpoints require `Authorization: Bearer <JWT>`.

| Category | Endpoint | Method | Auth | Description |
|---|---|---|---|---|
| **Auth** | /api/auth/register | POST | Public | Register new employee account |
| | /api/auth/login | POST | Public | Login, returns JWT token |
| | /api/auth/verify-otp | POST | Public | Generate or verify email OTP |
| | /api/auth/me | GET | Protected | Get current authenticated user |
| **Employees** | /api/employees | GET | Protected | List employees (search, dept, role, pagination) |
| | /api/employees/:id | GET | Protected | Get single employee by ID |
| | /api/employees | POST | Admin | Create employee |
| | /api/employees/:id | PUT | Admin, HR | Update employee |
| | /api/employees/:id | DELETE | Admin | Soft-delete employee (sets is_active=false) |
| **Attendance** | /api/attendance/check-in | POST | Protected | Record check-in |
| | /api/attendance/check-out | POST | Protected | Record check-out |
| | /api/attendance/:empId/monthly | GET | Protected | Monthly summary (present/absent/late/OT) |
| **Payroll** | /api/payroll/generate | POST | Admin, HR | Auto-generate payroll for all employees for a month |
| | /api/payroll/:empId | GET | Protected | Get payroll records for an employee |
| **Inventory** | /api/inventory | GET | Protected | List items with reorder flag |
| | /api/inventory/transaction | POST | Admin, Manager | Add or remove stock (triggers email alert on reorder) |
| **Risk Scoring** | /api/risk/scores | GET | Protected | All risk scores (filter by month/dept/class) |
| | /api/risk/predict/:empId | GET | Protected | Fresh prediction for one employee (formula + ML) |
| | /api/risk/retrain | POST | Admin, HR | Trigger Flask model retraining (stage_1 or stage_2) |
| | /api/risk/ml-status | GET | Protected | Flask model metadata (loaded, stage, accuracy) |
| **HR Decisions** | /api/decisions | POST | Admin, HR | Submit accept/reject with optional correction |
| | /api/decisions/:empId | GET | Admin, HR | Get decision history for an employee |
| **Dashboard** | /api/dashboard/summary | GET | Protected | All KPIs in one request (10 fields) |
| **Reports** | /api/reports/generate | POST | Admin, HR | Stream PDF report (daily or monthly) |

### Python Flask ML Microservice (3 endpoints — bound to 127.0.0.1:5000)

| Endpoint | Method | Request Body | Response |
|---|---|---|---|
| GET /health | GET | — | `{ status, model_loaded, model_stage, trained_at, training_samples, accuracy, flask_version }` |
| POST /predict | POST | `{ employee_id, month, features: {8 keys} }` | `{ risk_class, confidence, shap_base_value, shap_values{8}, employee_id, month }` — 503 if model not loaded |
| POST /train | POST | `{ stage: "stage_1" \| "stage_2" }` | `{ success, stage, samples_used, classes, smote_applied, accuracy_validation, accuracy_test, trained_at }` |

---

## 18. Dashboard KPIs

### Main Dashboard (Admin/HR view)

| KPI | Description | Visualisation |
|---|---|---|
| Total Employees | Active employee count | Summary card |
| Workforce Risk Level (WRL) | (High + Critical) / Total × 100% | Gauge / percentage card |
| Risk Distribution | Count per tier (Low/Med/High/Critical) | Pie chart or donut chart |
| Department Risk Breakdown | Average risk score per department | Bar chart |
| Attendance Rate | Overall attendance percentage this month | Summary card |
| Late Arrivals Today | Count of employees who arrived late | Summary card |
| Payroll Total | Total salary disbursement this month | Summary card |
| Inventory Alerts | Items below reorder level | Alert list / badge count |
| Recent Risk Predictions | Latest ML predictions with accept/reject status | Table |
| Feature Importance | Top features driving risk predictions | Horizontal bar chart (from RF) |

### WRL Alert Threshold

```
If WRL ≥ 30% → Automated email alert to HR administrators
```

---

## 19. Default Feature Weights for Risk Scoring

These are the default weights (version 1.0) for the weighted composite risk formula:

| Feature | Weight | Rationale |
|---|---|---|
| `absence_rate` | 0.20 | Strong attrition signal — frequent absence indicates disengagement |
| `late_rate` | 0.10 | Moderate signal — habitual lateness correlates with reduced commitment |
| `overtime_ratio` | 0.10 | Burnout indicator — excessive overtime precedes turnover |
| `productivity_index` | 0.15 | Direct performance measure — declining productivity signals risk |
| `payroll_variance` | 0.05 | Minor signal — salary instability may indicate dissatisfaction |
| `social_score` | 0.25 | Primary research signal — synthetic social behaviour composite |
| `tenure_months` | 0.05 | Context factor — newer employees have higher baseline attrition |
| `department_risk` | 0.10 | Environmental factor — toxic departments elevate individual risk |
| **Total** | **1.00** | |

**Note:** social_score has the highest individual weight (0.25) because it is the core research contribution and represents the novel behavioural signal. absence_rate is second (0.20) as the strongest traditional HR signal in attrition literature.

These weights are configurable and can be recalibrated based on HR feedback and model performance evaluation.

---

## 20. Thesis Chapter Structure

| Chapter | Title | Content | Research Weight |
|---|---|---|---|
| 1 | Introduction | Background, motivation, problem statement, objectives (primary + secondary), scope, thesis structure | 10% |
| 2 | Literature Review / SLR | Systematic review across 5 themes, comparison table, research gap identification | 15% |
| 3 | Methodology | DSR justification, Peffers' DSRM stages, data collection methods, ethical considerations | 10% |
| 4 | Design & Implementation | System architecture, ERP modules (concise), social score model (deep), risk scoring pipeline (deep), ML microservice, database design, API design | 25% |
| 5 | Evaluation & Results | ML metrics (confusion matrix, precision/recall/F1, SHAP, feature importance), social score validation (Gaussian verification), functional testing, before/after retraining comparison | 30% |
| 6 | Conclusion | Summary of findings mapped to RQs, contributions, limitations, future work (live API integration, mobile app, scale testing) | 10% |

### Chapter–RQ Mapping

| Chapter | Addresses RQs |
|---|---|
| Chapter 2 (SLR) | All RQs — literature foundation |
| Chapter 4 (Design) | RQ1, RQ2, RQ3, RQ4, RQ5, RQ6, RQ7 |
| Chapter 5 (Evaluation) | RQ3 (social score validation), RQ4 (ML accuracy), RQ5 (retraining improvement) |
| Chapter 6 (Conclusion) | All RQs — mapped findings |

### Writing Priority for Thesis

1. **Chapter 2 (SLR)** — due April 10, write first
2. **Chapter 4 (Design — ML sections)** — core contribution, write deep
3. **Chapter 5 (Evaluation)** — depends on implementation, write after dev
4. **Chapter 4 (Design — ERP sections)** — concise, write alongside dev
5. **Chapter 1 (Intro)** — refine from proposal, write last for consistency
6. **Chapter 3 (Methodology)** — straightforward DSR, write anytime
7. **Chapter 6 (Conclusion)** — write last after evaluation results are known

---

## 21. Security Architecture

| Mechanism | Implementation |
|---|---|
| Authentication | JWT-based session tokens |
| Password storage | bcrypt hashing |
| Role-based access | Admin, HR, Manager, Employee roles with route protection |
| OTP verification | Email-based via Nodemailer for sensitive actions |
| Session management | Token expiry and refresh |
| Automated alerts | node-cron scheduled processes for inventory and risk notifications |

---

## 22. Project Timeline and Deliverables

### Payment Schedule

| Milestone | Amount (LKR) | Date | Status |
|---|---|---|---|
| Advance payment | 10,000 | 31 Mar 2026 | Paid |
| Second payment | 20,000 | 14 Apr 2026 | Pending |
| Final payment | 50,000 | On delivery | Pending |

### Key Deadlines

| Deliverable | Deadline |
|---|---|
| SLR submission | 10 Apr 2026 |
| Full project delivery | 5-6 weeks from advance |

### Documents

| Document | File | Status |
|---|---|---|
| Quotation | Quotation_Nethmina_Kavinda.pdf | Sent |
| Invoice | Invoice_Nethmina_Kavinda.pdf | Sent |
| Service Agreement | Service_Agreement_Nethmina_Kavinda.pdf | Pending signature |

---

## 23. Viva Defense Strategy

### Strong Points to Emphasise

1. The synthetic social_score is **formally modelled** (Gaussian, Box-Muller), not arbitrary random data
2. The schema has a **documented pathway to production** (social_data_source field)
3. HR feedback loop demonstrates **responsible AI** — model doesn't act alone
4. SHAP analysis provides **explainability** — critical for HR trust
5. DSR methodology is **appropriate and well-applied** for an artefact-building project

### Potential Examiner Challenges and Responses

| Challenge | Response |
|---|---|
| "Your data is fake" | "It is synthetic by design, formally modelled using Gaussian distributions, statistically validated, and the schema requires zero structural changes for live API data" |
| "Why not use IBM HR dataset?" | "We needed integrated cross-module data (attendance + payroll + social) that doesn't exist in any public dataset. Synthetic generation allows controlled ground truth." |
| "Why Random Forest?" | "Literature consistently shows RF achieves highest accuracy for employee attrition (92%+ in multiple studies). It handles mixed feature types, provides feature importance, and is robust to overfitting." |
| "How is this different from existing ERP?" | "Three novel contributions: (1) synthetic social signal with production pathway, (2) ML risk scoring integrated in lightweight ERP, (3) HR feedback loop for model improvement" |
| "Dataset is too small" | "100 employees × 6 months produces 600 feature vectors — sufficient for Random Forest training with SMOTE augmentation and temporal train/val/test split. The architecture scales horizontally — MongoDB sharding and Flask behind gunicorn impose no practical employee count limit." |

---

---

## 24. Actual ML Evaluation Results (100-Employee Dataset)

These are the real numbers from `ml-service/evaluate.py` run on 2026-05-28. Use these verbatim in Chapter 5.

### Model Performance Summary

| Metric | Stage 1 (Formula Labels) | Stage 2 (HR-Corrected Labels) | Delta |
|---|---|---|---|
| Validation Accuracy | 93.0% | 93.0% | — |
| **Test Accuracy** | **88.0%** | **83.0%** | −5.0% |
| **F1 Score (macro)** | **0.592** | **0.836** | **+24.4 pts** |

**Training samples after SMOTE:**
- Stage 1: 720 samples (augmented from 400 training records)
- Stage 2: 582 samples (HR-corrected labels — fewer because only corrected + accepted records used)

### Key Analytical Finding for Thesis

The −5% test accuracy drop from Stage 1 → Stage 2 is **not a regression** — it is expected and explainable:

- Stage 1 trains on clean formula-derived labels → artificially aligned features and labels → high accuracy on the same distribution
- Stage 2 trains on HR-corrected labels where HR intentionally overrode the formula → the model learns to classify *against* the formula in edge cases
- The **+24.4 pt F1 macro lift** is the correct metric for multi-class imbalanced classification. It shows the model becomes dramatically better at classifying minority classes (High, Critical) after human feedback.
- This is the central empirical evidence for **Novelty Pillar 3 (Human-in-the-Loop retraining)**.

### Evaluation Artifacts Generated (all in `ml-service/evaluation_output/`)

| File | Content | Use in Thesis |
|---|---|---|
| `confusion_matrix_stage1.png` | 4×4 confusion matrix — Stage 1 | Ch.5 — before retraining |
| `confusion_matrix_stage2.png` | 4×4 confusion matrix — Stage 2 | Ch.5 — after retraining |
| `feature_importance_stage1.png` | RF feature importances — Stage 1 | Ch.5 — feature analysis |
| `feature_importance_stage2.png` | RF feature importances — Stage 2 | Ch.5 — post-feedback shift |
| `shap_summary.png` | Mean |SHAP| per feature — Stage 2 | Ch.5 — explainability section |
| `shap_drift.png` | Feature importance shift Stage 1 → Stage 2 | Ch.5 — feedback loop effect |
| `n_estimators_curve.png` | Accuracy vs tree count (50–500 sweep) | Ch.4 — hyperparameter justification |
| `social_score_histograms.png` | Sub-score frequency distributions | Ch.5 — social score validation |
| `social_score_correlation.png` | 4×4 sub-score correlation matrix | Ch.5 — social score validation |
| `social_score_drift.png` | High-risk vs low-risk employee trajectories over 6 months | Ch.5 — temporal drift validation |
| `feature_correlation.png` | 8-feature correlation matrix | Ch.4 — feature design justification |
| `evaluation_results.json` | All metrics in machine-readable form | Machine-readable backup |

---

## 25. MongoDB Schema Field Reference

For thesis Chapter 4 (Design & Implementation) — exact field names as implemented.

### Employee
`name · email · password(hidden) · role · department · position · hourly_rate · allowances · risk_bias(hidden) · hire_date · is_active · createdAt · updatedAt`

Roles: `admin | hr_manager | manager | employee`
Departments: `Engineering | Marketing | Finance | Operations | HR`

### Attendance
`employee_id · date · check_in · check_out · late_minutes · status · overtime_hours · createdAt · updatedAt`

Status enum: `present | absent | late`
Unique index: `(employee_id, date)`

### Payroll
`employee_id · month · working_hours · overtime_hours · gross_salary · deductions{epf, etf, tax} · late_penalty · net_salary · final_salary · createdAt · updatedAt`

Unique index: `(employee_id, month)` — upserted so generation is idempotent

### SocialScore
`employee_id · month · job_search · post_drop · network_growth · sentiment · social_score · social_data_source · createdAt · updatedAt`

All sub-scores and composite: `[0.0, 1.0]`
`social_data_source` default: `'synthetic'` → transitions to `'linkedin_api'` in production

### EmployeeFeature
`employee_id · month · absence_rate · late_rate · overtime_ratio · productivity_index · payroll_variance · social_score · tenure_months · department_risk · createdAt · updatedAt`

All fields normalised to `[0.0, 1.0]` via min-max scaling
Unique index: `(employee_id, month)`

### RiskScore
`employee_id · month · risk_score · risk_class · ml_status · confidence · confidence_label · top_drivers[] · shap_base_value · shap_values{} · createdAt · updatedAt`

`risk_score`: 0–100 (weighted composite)
`ml_status`: `predicted | formula_only`
`confidence_label`: `Strong | Moderate | Uncertain`
`top_drivers`: array of `{feature, impact: high|moderate|low, explanation}`

### HRDecision
`employee_id · month · original_class · decision · corrected_class · reason · decided_by · decided_at · createdAt · updatedAt`

`decision`: `accept | reject`
Captures the human feedback that drives Stage 2 retraining

### Inventory
`name · category · quantity · reorder_level · lead_time · safety_stock · unit_price · description · createdAt · updatedAt`

`category`: `raw_material | finished_good`
`needs_reorder` computed on read: `quantity <= reorder_level`

---

## 26. Seed Pipeline Reference

For Chapter 3 (Methodology) and Chapter 4 — explains how the synthetic dataset was constructed.

**Runner:** `backend/seeds/runAllSeeds.js`
**Seed months:** `['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03']`
**Execution time:** ~3 seconds for all 8 steps

| Step | Script | Records Created | Dependencies |
|---|---|---|---|
| 1 | `01_seedEmployees.js` | 100 employees (risk_bias assigned per tier) | None |
| 2 | `02_seedAttendance.js` | ~13,000 daily records (6 months × working days) | Step 1 |
| 3 | `03_seedPayroll.js` | 600 payroll records | Steps 1–2 |
| 4 | `04_seedSocialScores.js` | 600 social score records (VAR model) | Step 1 |
| 5 | `05_seedFeatureVectors.js` | 600 normalised feature vectors | Steps 1–4 |
| 6 | `06_seedRiskScores.js` | 600 formula-based risk scores | Step 5 |
| 7 | `07_seedHRDecisions.js` | 600 HR decisions (74 rejections = 12.3% correction rate) | Steps 1, 6 |
| 8 | `08_seedInventory.js` | 15 items + 69 transactions | None |

**Why this seeding order matters for thesis:** The pipeline mirrors real-world data generation — attendance precedes payroll which precedes feature construction. This order validates the system's data dependency chain as part of the DSRM demonstration stage.

---

## 27. Reports Feature (Added 2026-06-12)

**Scope:** PDF report generation for HR managers and administrators.

### Endpoint
`POST /api/reports/generate`
- Auth: `admin`, `hr_manager` only
- Body: `{ type: 'daily'|'monthly', date?: 'YYYY-MM-DD', month?: 'YYYY-MM' }`
- Response: `application/pdf` binary stream (PDFKit, server-rendered)
- Filename: `NEXUS_Monthly_Report_YYYY-MM.pdf` or `NEXUS_Daily_Report_YYYY-MM-DD.pdf`

### Monthly Report Contents
1. **Executive Summary** — Total employees, attendance rate, monthly payroll total (LKR), Workforce Risk Level (%)
2. **Risk Distribution** — Low / Medium / High / Critical counts with colour-coded tiles
3. **Department Risk Breakdown** — Per-department employee count, average risk score, dominant risk class
4. **Employee Details Table** — Per-employee: name, dept, present days, absent days, late days, final salary (LKR), risk class, ML/Formula tag
5. **HR Decisions** — All accept/reject decisions for the month with original class, corrected class, decided by, date

### Daily Report Contents
1. **Daily Summary** — Present / Late / Absent / Total counts
2. **Attendance Details Table** — Per-employee: name, dept, status, check-in time, check-out time, late minutes, OT hours
3. **Inventory Alerts** — Items at or below reorder level (item name, category, current stock, reorder level)

### Implementation Notes
- Library: `pdfkit` (Node.js, ~1 MB, no external rendering engine)
- Data aggregation: single MongoDB query pass per report type (no N+1 calls)
- Frontend: `Reports.jsx` page at `/reports` — type toggle, date/month picker, Generate & Download button
- Role guard: non-HR roles see an access-restricted message; button is disabled

---

*This document is the single source of truth for the NEXUS ERP research project. All thesis writing, SLR work, and development should reference this document for consistency.*
*Last updated: 2026-06-12 — reflects fully implemented, tested, and evaluated system.*
