# Chapter 4: System Requirement Specification

---

## 4.1 Chapter Overview

This chapter presents the complete system requirement specification for NEXUS ERP, translating the research objectives defined in Chapter 1 into a formal technical blueprint for implementation. The chapter proceeds in four stages. It opens with a stakeholder analysis that identifies the actors who interact with the system and documents their functional needs. From there, an operationalization process maps each research objective to a concrete system feature or data strategy, demonstrating that every design decision is traceable to a stated research goal. The system/model analysis that follows provides the artefact's structural and behavioural specification through a proposed four-tier architecture, use case descriptions, a class/data model covering all nine MongoDB collections, activity diagrams for the three primary workflows, and sequence diagrams for the three most critical system interactions. Finally, the functional and non-functional requirements are stated as numbered, verifiable specifications. The chapter concludes with a summary that bridges specification into the implementation and evaluation activities covered in Chapter 5.

---

## 4.2 Stakeholder Analysis

Four stakeholder roles interact with NEXUS ERP. Each role carries distinct responsibilities, data access privileges, and functional requirements that shaped the system design.

**Table 4.1: Stakeholder Analysis**

| Stakeholder | Role in Organisation | Primary Needs from System | Access Level |
|---|---|---|---|
| **Admin** | System administrator; typically an HR director or IT lead | Manage all user accounts, configure payroll parameters, trigger model retraining, monitor full system KPIs, receive WRL and inventory alert emails | Full access to all modules and configurations |
| **HR Manager** | Human resources manager responsible for workforce analytics | View and interpret employee risk predictions, review SHAP explanations, accept or reject ML predictions, trigger Stage 2 retraining, access full payroll and attendance data | Full HR data access; risk scoring and HITL decision authority |
| **Manager** | Department-level line manager | Monitor attendance for their department, view inventory levels and manage stock updates, receive inventory reorder alerts, view department-level risk summary | Restricted to own department data; no individual employee payroll; no risk score editing |
| **Employee** | Individual contributor | View own attendance records, view own monthly payslip, update own contact details | Own records only; no visibility of other employees' data, risk scores, or payroll |

**Stakeholder Interests by Research Contribution:**

- **HR Manager** is the primary stakeholder for the research contribution. They interact directly with the synthetic social score outputs (via the risk scoring table), the SHAP modal (Contribution 2), and the accept/reject HITL mechanism (Contribution 3). The quality of the HR Manager's experience drives the design of the SHAP waterfall display and the correction workflow.
- **Admin** is the secondary stakeholder, overseeing model retraining triggers and receiving portfolio-level WRL alerts.
- **Manager** and **Employee** interact only with supporting ERP modules (attendance, inventory, payroll) and do not participate in the research contribution features.

---

## 4.3 Operationalization Process

The operationalization process defines how each research objective is concretely realised through a specific system component, data mechanism, or design decision. This section provides the traceability link between the abstract research goals (Chapter 1, Section 1.7) and the tangible system artefacts documented in the remainder of this chapter.

**Table 4.2: Operationalization: Research Objectives to System Features**

| Objective | Research Question | Operationalization Method | System Artefact / Data Source |
|---|---|---|---|
| O1: Identify ERP functional requirements | RQ1, RQ2 | Literature review (Chapter 2) establishes minimum viable ERP capabilities for SMEs; gap analysis identifies what automated payroll and inventory require | Functional requirements FR01–FR08 (Section 4.5.1); MongoDB Attendance, Payroll, Inventory collections |
| O2: Identify social behaviour dimensions | RQ3 | Four sub-dimensions derived from Roth et al. (2016) and De Jesus et al. (2018); weights assigned proportional to effect sizes in cited literature | Social score sub-score design; SocialScores collection; `04_seedSocialScores.js` seed script |
| O3: Analyse existing ERP and ML systems | RQ4 | Comparative assessment in Chapter 2 Section 2.5; Gap Table 2.5 | Literature review; design decision to integrate ML within ERP rather than as a standalone model |
| O4: Analyse synthetic social score validity | RQ3 | Five statistical validation criteria (distribution shape, mean, range, correlation, drift) applied to generated data | `evaluate.py` script; `social_score_histograms.png`, `social_score_correlation.png`, `social_score_drift.png` |
| O5: Design and develop MERN ERP | RQ1, RQ2, RQ6 | MERN stack with JWT/OTP/RBAC implemented iteratively across Phases 1–2 of development | Node.js controllers, Express routes, React pages, MongoDB collections (Employees, Attendance, Payroll, Inventory) |
| O6: Design synthetic social score model | RQ3 | VAR/Gaussian generation with Cholesky-decomposed multivariate Normal innovation; `social_data_source` schema field for production pathway | `04_seedSocialScores.js`; SocialScores MongoDB schema; `social_data_source = 'synthetic'` |
| O7: Develop risk scoring pipeline | RQ4, RQ5 | Eight-feature cross-module vector, weighted formula, Flask RF microservice, SHAP TreeExplainer, two-stage retraining | `05_seedFeatureVectors.js`; `ml-service/model.py`; EmployeeFeatures, RiskScores, HRDecisions collections |
| O8: Implement analytics dashboards | RQ7 | Ten-KPI dashboard with WRL metric; automated alert dispatch via Nodemailer | `dashboardController.js`; Dashboard and Risk Scoring React pages |
| O9: Evaluate ML pipeline | RQ4, RQ5 | Classification metrics (accuracy, F1 macro, confusion matrix) computed on month 6 test split; Stage 1 vs Stage 2 comparison | `evaluate.py`; `evaluation_output/evaluation_results.json` |
| O10: Evaluate social score | RQ3 | Five-criterion statistical validation comparing observed statistics to designed generation parameters | `evaluate.py` validation module; all `social_score_*.png` artefacts |

**Justification of Data Gathering Validity:**

Since no real employee data was collected, the validity of system requirements rests on three foundations: (1) the synthetic data generation parameters are directly derived from literature-cited behavioural research (Roth et al., 2016; De Jesus et al., 2018), providing theoretical grounding for the feature design; (2) the IBM HR Analytics precedent (Fallucchi et al., 2020) validates synthetic datasets for HR prediction research; and (3) the statistical validation in Chapter 5 empirically confirms that the generated data conforms to its intended statistical properties, satisfying the evaluation criteria of Figueira and Vaz (2024) for representativeness, realism, and coherence.

---

## 4.4 System / Model Analysis

### 4.4.1 Proposed System Architecture

NEXUS ERP is built on a **four-tier architecture** separating the browser client, Node.js API layer, MongoDB document store, and Python Flask ML microservice. Communication between tiers uses REST over HTTPS, with Mongoose ODM managing schema enforcement between Node.js and MongoDB, and Axios managing inter-service calls between Node.js and Flask.

**Figure 4.1: Four-Tier System Architecture**

```
┌──────────────────────────────────────────────────────────┐
│         TIER 1: PRESENTATION                             │
│   Browser: React 18 + Vite + Tailwind CSS  (port 3000)  │
│   SPA — 8 pages — role-aware navigation                  │
└────────────────────────┬─────────────────────────────────┘
                         │  HTTPS / REST + JWT Bearer Token
┌────────────────────────▼─────────────────────────────────┐
│         TIER 2: APPLICATION                              │
│   Node.js 18 + Express.js 5  (port 5001)                │
│   Controllers · Payroll Engine · RBAC · OTP              │
│   22 REST endpoints across 8 route modules               │
└──────────┬──────────────────────────┬────────────────────┘
           │ Mongoose ODM             │  HTTP (Axios)
           │                          │  Internal REST calls
┌──────────▼──────────┐   ┌──────────▼────────────────────┐
│  TIER 3: DATA       │   │  TIER 4: ML MICROSERVICE       │
│  MongoDB 8          │   │  Python + Flask 3  (port 5000) │
│  nexus_erp DB       │   │  Random Forest + SHAP          │
│  9 collections      │   │  Endpoints: /train  /predict   │
│  ~14,000+ documents │   │  /health                       │
└─────────────────────┘   └───────────────────────────────┘
```

**Key Architectural Decisions:**

| Decision | Rationale |
|---|---|
| Flask ML microservice separate from Node.js | Python's scikit-learn, SHAP, and joblib ecosystem is substantially more mature than Node.js ML equivalents. Separation also allows the ML service to fail or restart independently without taking down the ERP |
| Deterministic formula fallback | If Flask is unavailable, Node.js computes and returns a weighted formula score, ensuring system continuity without dependency on the ML service |
| MongoDB over relational DB | Document model accommodates heterogeneous SHAP value dictionaries and evolving schema during research without migration scripts |
| JWT stateless authentication | Eliminates server-side session storage, enabling the architecture to scale horizontally |

### 4.4.2 Use Case Descriptions

The five use cases below represent the most significant interactions, including all three research contribution scenarios. Additional use cases (employee profile management, payroll viewing, inventory stock update) are documented in the Appendix.

---

**Use Case UC01: Employee Login with OTP**

| Field | Description |
|---|---|
| **UC ID** | UC01 |
| **Name** | Employee Login with OTP Two-Factor Authentication |
| **Primary Actor** | Any authenticated role (Admin, HR Manager, Manager, Employee) |
| **Precondition** | User account exists in the Employees collection; email SMTP service active |
| **Main Flow** | 1. Actor submits email and password via login form. 2. Node.js verifies bcrypt hash. 3. System generates a 6-digit OTP and dispatches it via Nodemailer. 4. Actor submits OTP on the verification screen. 5. System validates OTP (10-minute expiry window). 6. Signed JWT is returned and stored in browser local storage. 7. Actor is redirected to role-appropriate dashboard. |
| **Postcondition** | JWT stored; role-based navigation active for the session |
| **Exception Flows** | E1: Incorrect password → 401 Unauthorized, login attempt logged. E2: Incorrect OTP → OTP rejected, new OTP may be requested. E3: Expired OTP (>10 min) → 401, actor must restart login flow. |

---

**Use Case UC02: Generate Employee Risk Prediction with SHAP**

| Field | Description |
|---|---|
| **UC ID** | UC02 |
| **Name** | Generate ML Risk Prediction with SHAP Explanation |
| **Primary Actor** | HR Manager, Admin |
| **Precondition** | Employee feature vectors exist for the requested month; Flask ML service is running and a trained model is loaded |
| **Main Flow** | 1. Actor navigates to Risk Scoring page. 2. Node.js fetches EmployeeFeatures for the current month. 3. Node.js calls Flask `POST /predict` with the 8-feature vector. 4. Flask runs the RF classifier and SHAP TreeExplainer. 5. Flask returns: risk_class, risk_score, confidence, shap_values[8]. 6. Node.js maps SHAP keys to human-readable top-driver text and saves RiskScore document. 7. React renders risk tier badge, SHAP waterfall chart, and top-3 HR narrative. |
| **Postcondition** | Risk prediction visible in table; RiskScore document persisted in MongoDB |
| **Alternative Flow** | A1: Flask unavailable → Node.js computes and returns formula-based score with no SHAP values; UI indicates "Formula Score (ML service offline)" |

---

**Use Case UC03: HR Accept/Reject Prediction (HITL Loop)**

| Field | Description |
|---|---|
| **UC ID** | UC03 |
| **Name** | HR Accept or Reject ML Risk Prediction |
| **Primary Actor** | HR Manager |
| **Precondition** | Risk prediction exists for employee/month (UC02 complete); HR Manager authenticated |
| **Main Flow** | 1. HR Manager clicks employee row in Risk Scoring table; SHAP modal opens. 2. HR Manager reviews risk tier, SHAP waterfall chart, and top-3 driver text. 3a. If Accept: HR Manager clicks Accept; system stores HRDecision {decision: 'accept', original_class: X, corrected_class: X}. 3b. If Reject: HR Manager selects corrected risk tier from dropdown; clicks Confirm Correction; system stores HRDecision {decision: 'reject', original_class: X, corrected_class: Y}. 4. UI confirmation toast displayed; modal closes. |
| **Postcondition** | HRDecision document persisted; correction count displayed on Retrain button badge |
| **Exception** | E1: HR Manager closes modal without deciding → no HRDecision created; prediction remains unreviewed |

---

**Use Case UC04: Trigger Stage 2 Model Retraining**

| Field | Description |
|---|---|
| **UC ID** | UC04 |
| **Name** | Trigger Stage 2 Human-in-the-Loop Model Retraining |
| **Primary Actor** | HR Manager, Admin |
| **Precondition** | At least one HRDecision document exists; Flask ML service running |
| **Main Flow** | 1. Actor clicks "Retrain Model (Stage 2)" button on Risk Scoring page. 2. Node.js `POST /api/risk/train` proxies request to Flask `POST /train?stage=2`. 3. Flask reads EmployeeFeatures and HRDecisions from MongoDB. 4. Flask merges HR-corrected labels with formula labels; applies temporal split; runs SMOTE. 5. RF trains on merged label set; SHAP TreeExplainer re-instantiated. 6. Model saved via `joblib.dump`. 7. Flask returns training metrics (accuracy, F1 macro, class report). 8. Node.js returns metrics to frontend; UI displays Stage 2 performance summary. |
| **Postcondition** | Updated RF model persisted; Stage 2 metrics displayed; future predictions use the new model |
| **Exception** | E1: Insufficient minority class samples → SMOTE skipped; model trained without oversampling; warning returned in response |

---

**Use Case UC05: Generate Monthly Payroll**

| Field | Description |
|---|---|
| **UC ID** | UC05 |
| **Name** | Generate Monthly Payroll for All Employees |
| **Primary Actor** | Admin, HR Manager |
| **Precondition** | Attendance records exist for the requested month; employee hourly_rate and allowances configured |
| **Main Flow** | 1. Actor submits `POST /api/payroll/generate` with target month/year. 2. Node.js payroll engine aggregates attendance: present days, overtime hours, late minutes. 3. Formula applied: GrossSalary → EPF (8%) → ETF (3%) → LatePenalty → FinalSalary. 4. FinalSalary floored at zero. 5. Payroll documents written to MongoDB Payroll collection. 6. Response returns payroll summary table. |
| **Postcondition** | Payroll records persisted; visible in Payroll page table |
| **Exception** | E1: Duplicate generation for same month → existing record overwritten after confirmation prompt |

---

### 4.4.3 Class / Data Model

The nine MongoDB collections and their key fields are represented below using a UML-style class notation. Arrows indicate reference relationships (by ObjectId).

**Figure 4.2: Data Model (MongoDB Collections as Classes)**

```
┌────────────────────────┐         ┌─────────────────────────────────────────┐
│      Employees          │         │              Attendance                  │
├────────────────────────┤         ├─────────────────────────────────────────┤
│ _id: ObjectId          │──────┐  │ _id: ObjectId                           │
│ name: String           │      │  │ employee_id: ObjectId  ──────────────── │──┐
│ email: String (unique) │      │  │ date: Date                              │  │
│ password: String(hash) │      │  │ check_in: String                        │  │
│ role: Enum[4]          │      │  │ check_out: String                       │  │
│ department: Enum[5]    │      │  │ overtime_hours: Number                  │  │
│ hourly_rate: Number    │      │  │ late_minutes: Number                    │  │
│ allowances: Number     │      │  │ status: Enum[present/late/absent]       │  │
│ hire_date: Date        │      │  └─────────────────────────────────────────┘  │
│ risk_bias: Float(hid.) │      │                                               │
└────────────────────────┘      │  ┌─────────────────────────────────────────┐  │
                                │  │              Payroll                     │  │
                                │  ├─────────────────────────────────────────┤  │
                                └──│ employee_id: ObjectId                   │──┘
                                   │ month: Number, year: Number             │
                                   │ gross_salary: Number                    │
                                   │ epf_deduction: Number                   │
                                   │ etf_deduction: Number                   │
                                   │ late_penalty: Number                    │
                                   │ final_salary: Number                    │
                                   │ [Unique index: (employee_id, month)]    │
                                   └─────────────────────────────────────────┘

┌─────────────────────────────────────────┐   ┌────────────────────────────────────┐
│              SocialScores               │   │         EmployeeFeatures           │
├─────────────────────────────────────────┤   ├────────────────────────────────────┤
│ employee_id: ObjectId                   │   │ employee_id: ObjectId              │
│ month: Number, year: Number             │   │ month: Number, year: Number        │
│ job_search: Float[0,1]                  │   │ absence_rate: Float[0,1]           │
│ post_drop: Float[0,1]                   │   │ late_rate: Float[0,1]              │
│ network_growth: Float[0,1]              │   │ overtime_ratio: Float[0,1]         │
│ sentiment: Float[0,1]                   │   │ productivity_index: Float[0,1]     │
│ social_score: Float[0,1]               │   │ payroll_variance: Float[0,1]       │
│ social_data_source: String              │   │ social_score: Float[0,1]           │
│ [Unique index: (employee_id, month)]    │   │ tenure_months: Float[0,1]          │
└─────────────────────────────────────────┘   │ department_risk: Float[0,1]        │
                                              │ [Unique index: (employee_id,month)]│
                                              └────────────────────────────────────┘

┌─────────────────────────────────────────┐   ┌────────────────────────────────────┐
│              RiskScores                 │   │           HRDecisions              │
├─────────────────────────────────────────┤   ├────────────────────────────────────┤
│ employee_id: ObjectId                   │   │ employee_id: ObjectId              │
│ month: Number, year: Number             │   │ month: Number, year: Number        │
│ risk_score: Float[0,100]               │   │ decision: Enum[accept/reject]      │
│ risk_class: Enum[Low/Med/High/Crit]    │   │ original_class: Enum[4]            │
│ shap_values: Object{8 keys}            │   │ corrected_class: Enum[4]           │
│ top_drivers: Array[String]             │   │ reviewed_by: ObjectId              │
│ confidence: Enum[Strong/Mod/Uncert.]   │   │ reviewed_at: Date                  │
│ model_stage: Enum[1/2]                 │   │ [Unique: (employee_id, month)]     │
│ [Unique index: (employee_id, month)]   │   └────────────────────────────────────┘
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐   ┌────────────────────────────────────┐
│              Inventory                  │   │        InventoryTransactions       │
├─────────────────────────────────────────┤   ├────────────────────────────────────┤
│ _id: ObjectId                           │   │ inventory_id: ObjectId             │
│ name: String                            │   │ type: Enum[in/out]                 │
│ category: Enum[raw/finished]            │   │ quantity: Number                   │
│ quantity: Number                        │   │ date: Date                         │
│ reorder_level: Number                   │   │ note: String                       │
│ unit_price: Number                      │   └────────────────────────────────────┘
└─────────────────────────────────────────┘
```

### 4.4.4 Activity Diagrams

**Activity Diagram 4.1: Risk Score Generation and HITL Decision Flow**

```
[START]
   │
   ▼
HR Manager opens Risk Scoring Page
   │
   ▼
Node.js fetches EmployeeFeatures (current month)
   │
   ▼
[Flask ML service available?]
   │ YES                          │ NO
   ▼                              ▼
Call POST /predict on Flask    Compute formula-based score
   │                              │ (Node.js fallback)
   ▼                              │
Receive risk_class + SHAP values  │
   │                              │
   ▼◀─────────────────────────────┘
Save RiskScore to MongoDB
   │
   ▼
Display Risk Table (tier badge + SHAP modal button)
   │
   ▼
HR Manager clicks employee row
   │
   ▼
SHAP Waterfall Modal opens
(tier, SHAP chart, top-3 drivers)
   │
   ▼
[HR Manager Decision?]
   │ ACCEPT              │ REJECT + CORRECT
   ▼                     ▼
Store HRDecision       Select corrected tier
{accept, same class}   Store HRDecision
   │                   {reject, corrected class}
   ▼◀──────────────────┘
Modal closes; UI updates decision badge
   │
   ▼
[Retrain triggered?]
   │ YES
   ▼
POST /api/risk/train?stage=2
Flask retrains RF on HR-corrected labels
Returns Stage 2 metrics
   │
   ▼
[END]
```

**Activity Diagram 4.2: Payroll Computation Flow**

```
[START]
   │
   ▼
Admin/HR Manager requests payroll for target month
   │
   ▼
For each employee:
   │
   ├─▶ Fetch attendance records for month
   │      │
   │      ▼
   │   Compute: present_days, overtime_hours, late_minutes
   │      │
   │      ▼
   │   GrossSalary = (present_days × 8 × hourly_rate)
   │               + (overtime × hourly_rate × 1.5)
   │               + allowances
   │      │
   │      ▼
   │   EPF = Gross × 0.08;  ETF = Gross × 0.03
   │   NetSalary = Gross − EPF − ETF
   │      │
   │      ▼
   │   LatePenalty = late_minutes × LKR 50
   │      │
   │      ▼
   │   FinalSalary = max(0, NetSalary − LatePenalty)
   │      │
   │      ▼
   │   Save Payroll document to MongoDB
   │
   ▼
Return payroll table to frontend
   │
   ▼
[END]
```

### 4.4.5 Sequence Diagrams

The three most critical interactions in the system are represented below using UML sequence notation adapted for text.

---

**Sequence Diagram 4.1: Login with OTP**

```
  Client         Node.js         MongoDB        Nodemailer
    │               │               │                │
    │─POST /login──▶│               │                │
    │               │─findEmployee─▶│                │
    │               │◀─employee────-│                │
    │               │─bcrypt.compare│                │
    │               │─generate OTP──────────────────▶│
    │               │               │         dispatch email
    │◀─200 + OTP sent──────────────│                │
    │               │               │                │
    │─POST /verify-otp─────────────▶│                │
    │               │─validate OTP  │                │
    │               │─jwt.sign()    │                │
    │◀─200 + {token, user}──────────│                │
    │               │               │                │
```

---

**Sequence Diagram 4.2: ML Risk Prediction with SHAP**

```
  React         Node.js         Flask           MongoDB
    │               │               │               │
    │─GET /risk/scores─────────────▶│               │
    │               │─fetch features─────────────── ▶│
    │               │◀─EmployeeFeatures[8]───────────│
    │               │               │               │
    │               │─POST /predict▶│               │
    │               │         RF.predict(features)  │
    │               │         TreeExplainer(model)  │
    │               │◀─{risk_class, shap_values[8]}─│
    │               │               │               │
    │               │─topDrivers.js(shap_values)    │
    │               │─save RiskScore─────────────── ▶│
    │               │◀─saved─────────────────────────│
    │◀─{scores + SHAP}──────────────│               │
    │   render table + modal        │               │
```

---

**Sequence Diagram 4.3: Stage 2 Retraining**

```
  HR Manager    Node.js         Flask             MongoDB
    │               │               │                │
    │─POST /retrain▶│               │                │
    │               │─POST /train?stage=2───────────▶│
    │               │               │─fetch features──▶│
    │               │               │◀─EmployeeFeatures│
    │               │               │─fetch HR decisions▶│
    │               │               │◀─HRDecisions[74]──│
    │               │               │                │
    │               │         merge labels (HR > formula)
    │               │         temporal split (1-4/5/6)
    │               │         SMOTE balance
    │               │         RF.fit(X_train, y_merged)
    │               │         TreeExplainer(rf_model)
    │               │         joblib.dump(model)
    │               │               │                │
    │               │◀─{accuracy, f1_macro, report}──│
    │◀─Stage 2 metrics displayed────│               │
```

### 4.4.6 Deployment Architecture

NEXUS ERP runs as three co-located services on a single development machine. The deployment diagram below represents the process boundaries:

```
┌─────────────────────────── Developer Machine ──────────────────────────────┐
│                                                                              │
│  ┌─────────────────────────┐   ┌──────────────────────────────────────────┐│
│  │   Browser               │   │  Node Process  (node server.js :5001)    ││
│  │   React SPA (:3000)     │◀──│  Express routes, RBAC, payroll engine    ││
│  │   Vite dev server       │──▶│  Mongoose ODM → MongoDB                  ││
│  └─────────────────────────┘   │  Axios → Flask                           ││
│                                 └──────────────────┬─────────────────────-─┘│
│                                                    │                         │
│  ┌─────────────────────────┐   ┌──────────────────▼──────────────────────┐ │
│  │   MongoDB (:27017)      │◀──│  Python Process  (flask run :5000)      │ │
│  │   nexus_erp database    │   │  RandomForestClassifier, SHAP           │ │
│  │   9 collections         │   │  joblib model persistence               │ │
│  └─────────────────────────┘   └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

Production deployment (identified as future work) would separate MongoDB to MongoDB Atlas, Flask to a gunicorn WSGI server, and the Node.js backend to a cloud VM, with a CDN for static React assets.

---

## 4.5 Functional and Non-Functional Requirements

### 4.5.1 Functional Requirements

| ID | Requirement | Priority | RQ |
|---|---|---|---|
| FR01 | The system shall authenticate users via email/password with bcrypt verification and issue JWT tokens | Must Have | RQ6 |
| FR02 | The system shall require OTP email verification as a second factor before issuing a JWT | Must Have | RQ6 |
| FR03 | The system shall enforce RBAC across four roles (Admin, HR Manager, Manager, Employee) with a configurable permission matrix | Must Have | RQ6 |
| FR04 | The system shall record daily employee attendance (check-in, check-out, overtime, late minutes) | Must Have | RQ1 |
| FR05 | The system shall compute monthly payroll applying EPF (8%), ETF (3%), overtime multiplier (1.5×), and late penalty, with a zero floor on final salary | Must Have | RQ1 |
| FR06 | The system shall manage dual-tier (raw materials / finished goods) inventory with configurable reorder thresholds | Must Have | RQ2 |
| FR07 | The system shall dispatch automated email alerts to Admin and Manager roles when an inventory item's quantity reaches or falls below its reorder level | Must Have | RQ2 |
| FR08 | The system shall generate synthetic social behaviour sub-scores (job_search, post_drop, network_growth, sentiment) using a VAR/Gaussian model for each employee each month | Must Have | RQ3 |
| FR09 | The system shall construct a normalised 8-feature risk vector per employee per month from attendance, payroll, and social score data | Must Have | RQ4 |
| FR10 | The system shall compute a deterministic weighted composite formula risk score (0–100) and tier classification as a fallback available at all times | Must Have | RQ4 |
| FR11 | The system shall call the Flask ML microservice to generate a Random Forest risk prediction and SHAP explanation for each employee feature vector | Must Have | RQ4 |
| FR12 | The system shall allow HR Managers to accept or correct each ML risk prediction and persist the decision as an HRDecision document | Must Have | RQ5 |
| FR13 | The system shall retrain the Random Forest model using HR-corrected labels (Stage 2) when triggered by an authorised user | Must Have | RQ5 |
| FR14 | The system shall compute and display the Workforce Risk Level (WRL) metric and dispatch email alerts when WRL ≥ 30% | Must Have | RQ7 |
| FR15 | The system shall provide an analytics dashboard aggregating ten KPIs in a single API call | Should Have | RQ7 |

### 4.5.2 Non-Functional Requirements

| ID | Requirement | Category |
|---|---|---|
| NFR01 | API endpoints shall return responses within 2 seconds under standard single-user load | Performance |
| NFR02 | ML risk prediction (Flask call + SHAP) shall complete within 5 seconds per employee | Performance |
| NFR03 | The system shall degrade gracefully to formula-based scoring when the Flask microservice is unavailable | Availability |
| NFR04 | All user passwords shall be stored as bcrypt hashes with minimum cost factor 10; no plaintext credentials shall be stored at any tier | Security |
| NFR05 | JWT tokens shall expire after 24 hours; OTP codes shall expire after 10 minutes | Security |
| NFR06 | All eight seeding scripts shall execute deterministically from a fixed random seed, ensuring dataset reproducibility | Reliability |
| NFR07 | The system architecture shall support horizontal scaling by separating the ML microservice from the Node.js API | Scalability |
| NFR08 | Role-based navigation shall prevent restricted UI elements from rendering for unauthorised roles at the frontend layer | Usability |
| NFR09 | Compound unique indexes shall be applied on `(employee_id, month)` across all per-employee monthly collections to enforce data integrity | Data Integrity |
| NFR10 | The `social_data_source` field on SocialScore documents shall be set to `'synthetic'` throughout research; no live API data shall be mixed with synthetic records without explicit schema update | Auditability |

---

## 4.6 User Interface Screenshots

This section presents the implemented NEXUS ERP user interface, captured from the running system logged in as an Admin/HR Manager user, illustrating how the requirements and use cases specified above were realised in the frontend.

![Figure 4.3: Login page with OTP two-factor authentication](screenshots/01_login.png)

![Figure 4.4: Dashboard showing the ten-KPI overview and Workforce Risk Level (WRL) summary](screenshots/02_dashboard.png)

![Figure 4.5: Employees module, filtered by department](screenshots/03_employees_list.png)

![Figure 4.6: Attendance module, monthly summary for a selected employee](screenshots/04_attendance_summary.png)

![Figure 4.7: Payroll table showing gross salary, EPF, ETF, late penalty, and final salary](screenshots/05_payroll_table.png)

![Figure 4.8: Inventory module with reorder-level alerts](screenshots/06_inventory_alerts.png)

![Figure 4.9: Risk Scoring page — WRL banner and filterable employee risk table](screenshots/07_risk_scoring_table.png)

![Figure 4.10: SHAP explanation modal showing the top feature contributions for an individual risk prediction](screenshots/08_shap_modal.png)

![Figure 4.11: HR Manager accept/reject decision on an ML risk prediction (HITL feedback loop)](screenshots/09_hr_decision.png)

![Figure 4.12: Stage 2 retraining trigger, incorporating HR-corrected labels](screenshots/10_retrain_model.png)

---

## 4.7 Chapter Summary

This chapter provided the complete system requirement specification for NEXUS ERP. The stakeholder analysis identified four roles (Admin, HR Manager, Manager, and Employee), each with distinct access privileges and functional needs, and positioned the HR Manager as the primary stakeholder for the research contribution. The operationalization process then traced each of the ten research objectives to a concrete system component, data mechanism, or design decision, demonstrating full traceability from research question to artefact.

The system/model analysis documented the four-tier MERN + Flask architecture and five prioritised use cases covering the HITL loop, ML prediction, and payroll workflows. It also set out the nine-collection MongoDB data model, two activity diagrams capturing the risk scoring and payroll flows, three sequence diagrams for login, ML prediction, and Stage 2 retraining, and the development/production deployment architecture. Fifteen functional requirements and ten non-functional requirements were specified as numbered, verifiable statements.

Chapter 5 describes how these specifications were realised in implementation, presents the technology selection justification, details the algorithms and pseudocode for the three research contribution components, and reports the results of functional testing and ML evaluation.
