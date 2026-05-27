# NEXUS ERP — Source of Truth

**Project:** Design and Development of an Integrated ERP Portal with Employee Risk Scoring Using Synthetic Social Behaviour Signals
**Client:** Nethmina Kavinda Bandara
**University:** NSBM Green University — BSc (Hons) Computer Science
**Methodology:** Design Science Research (Peffers' DSRM)
**Tech Stack:** MERN (MongoDB, Express.js, React.js, Node.js) + Python Flask ML Microservice

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

**Payroll Computation Model:**
```
GrossSalary = (WorkingHours × HourlyRate) + (OvertimeHours × HourlyRate × 1.5) + Allowances
NetSalary   = GrossSalary − Deductions (EPF 8%, ETF 3%, tax)
LatePenalty  = LateMinutes × PenaltyRate
FinalSalary  = NetSalary − LatePenalty
```

Payroll rules (overtime multiplier, deduction percentages, penalty rates) are parameterised for enterprise-specific customisation.

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
- `μ_d` = base mean for dimension d (e.g., job_search μ = 0.25)
- `β` = employee's risk_bias (0.0–0.5), set during seeding
- `σ_d` = standard deviation (typically 0.10–0.15)
- `clamp` = force result into [0.0, 1.0]

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
- 200 decision trees, balanced class weights
- Input: 8-feature vector
- Output: predicted risk class + per-feature importance values
- Endpoints: `/predict`, `/train`, `/health`
- Connected to Node.js backend via REST

**Step 4 — HR Feedback Loop:**
- HR manager sees prediction on dashboard
- Clicks Accept or Reject
- Decision stored in HRDecision collection
- Accumulated decisions become ground truth
- HR triggers retrain via POST /api/ml/retrain → Flask /train
- Model improves from human judgement over time

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

### Dataset Scale

- 20 employees (sufficient for research prototype)
- 6 months of records per employee
- ~120 social score records total
- ~120 feature vectors total
- ~120 attendance records per employee (daily)

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
| 20 employees only | Sufficient for prototype; production deployment needs testing at scale |
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

### Node.js Backend (~15-18 REST endpoints)

| Category | Endpoint | Method | Description |
|---|---|---|---|
| **Auth** | /api/auth/register | POST | Register new user |
| | /api/auth/login | POST | Login, receive JWT |
| | /api/auth/verify-otp | POST | Verify email OTP |
| **Employees** | /api/employees | GET | List all employees |
| | /api/employees/:id | GET | Get employee by ID |
| | /api/employees | POST | Create employee |
| | /api/employees/:id | PUT | Update employee |
| | /api/employees/:id | DELETE | Delete employee |
| **Attendance** | /api/attendance/check-in | POST | Record check-in |
| | /api/attendance/check-out | POST | Record check-out |
| | /api/attendance/:empId/monthly | GET | Monthly attendance summary |
| **Payroll** | /api/payroll/generate | POST | Generate monthly payroll |
| | /api/payroll/:empId | GET | Get payroll records |
| **Inventory** | /api/inventory | GET | List all stock items |
| | /api/inventory/transaction | POST | Add/remove stock |
| **Risk Scoring** | /api/risk/scores | GET | Get all risk scores |
| | /api/risk/predict/:empId | GET | Get risk prediction for employee |
| | /api/ml/retrain | POST | Trigger ML model retraining |
| **HR Decisions** | /api/decisions | POST | Submit accept/reject decision |
| | /api/decisions/:empId | GET | Get decision history |
| **Dashboard** | /api/dashboard/summary | GET | KPI summary data |

### Python Flask ML Microservice (3 endpoints)

| Endpoint | Method | Description |
|---|---|---|
| /predict | POST | Receive 8-feature vector, return risk class + feature importance |
| /train | POST | Retrain model with accumulated HR decision ground truth |
| /health | GET | Health check — model loaded, version, last trained timestamp |

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
| "20 employees is too small" | "Sufficient for research prototype and feasibility demonstration. The architecture scales — MongoDB and the ML pipeline impose no employee count limits." |

---

*This document is the single source of truth for the NEXUS ERP research project. All thesis writing, SLR work, and development should reference this document for consistency.*
