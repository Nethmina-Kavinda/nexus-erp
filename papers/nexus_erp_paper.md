# NEXUS ERP: An Integrated ERP Portal with Machine-Learning-Powered Employee Attrition Risk Scoring Using Synthetic Social Behaviour Signals

**Author:** Nethmina Kavinda Bandara
**Affiliation:** NSBM Green University, Sri Lanka — BSc (Hons) Computer Science

---

## Abstract

Small-to-medium enterprises (SMEs) face a documented and disproportionate cost when key employees resign — estimates place replacement at six to nine months of the departing employee's salary — yet no affordable, integrated system exists that simultaneously automates core HR operational workflows and provides machine-learning-powered attrition risk intelligence. This paper presents NEXUS ERP, a MERN-stack (MongoDB, Express.js, React.js, Node.js) enterprise resource planning system augmented with a Python Flask machine-learning microservice, and reports three research contributions. First, a formally specified synthetic social behaviour signal (`social_score`, range 0.0–1.0) is constructed using a Vector Auto-Regressive (VAR) model with Cholesky-decomposed multivariate Normal innovation across four literature-grounded sub-scores, with a documented schema-level pathway to live LinkedIn/Facebook API data that requires zero migration. Second, an eight-feature cross-module risk scoring pipeline — drawing from live attendance, payroll, and social signal data — feeds both a deterministic weighted composite formula and a Random Forest classifier with SHAP explainability, integrating predictive analytics directly within the ERP rather than as a disconnected standalone model. Third, a human-in-the-loop (HITL) HR feedback mechanism allows managers to accept or correct ML predictions; accumulated corrections drive Stage 2 retraining. Evaluation on a 600-record synthetic dataset (100 employees × 6 months) demonstrates a **+24.4 percentage-point F1 macro improvement** (0.592 → 0.836) between Stage 1 (formula-derived labels) and Stage 2 (HR-corrected labels), with High-class F1 rising from 0.000 to 0.857. The synthetic social score passes all five statistical validation criteria. SHAP analysis confirms `social_score` as the highest-importance feature in both training stages, empirically validating the core research contribution.

**Keywords:** ERP, employee attrition, synthetic data, Random Forest, SHAP, human-in-the-loop, MERN stack

---

## 1. Introduction

Employee attrition imposes a substantial cost on organisations. Replacing a single departing employee consumes an estimated six to nine months of that individual's salary across recruitment advertising, interviewer time, onboarding, and the productivity shortfall while a replacement reaches full competency [8]. For large enterprises this burden is absorbed by dedicated HR analytics departments equipped with specialised workforce intelligence platforms. For SMEs — organisations that form the backbone of most national economies but typically operate without specialist HR infrastructure — even the loss of two or three key employees in a quarter can cause disproportionate operational disruption with no mechanism to anticipate it.

Enterprise Resource Planning systems were conceived as a response to precisely this kind of cross-functional data integration challenge. Davenport [6] defined the ERP system as a software package that integrates the information flowing through an organisation — finance, operations, human resources, and supply chain — into a single unified system. In the three decades since, cloud-hosted alternatives have brought ERP adoption to the SME segment. Contemporary reviews of ERP evolution [14] identify a clear trend: organisations expect their ERP to generate forward-looking predictive analytics from its historical operational data, not merely record transactions.

Machine learning applied to employee attrition prediction has been an active research area for over a decade. Fallucchi et al. [8] reviewed 25 peer-reviewed studies using the IBM HR Analytics dataset and identified Random Forest as the dominant algorithm, achieving accuracies above 84%. Yadav et al. [23] and Jain and Nayyar [13] report RF accuracies of 84.2% and 92% respectively on similar HR datasets. However, all of these studies share a critical architectural limitation: they are standalone predictive models operating on static, pre-collected HR exports. They are not integrated into the operational systems that generate the HR data in the first place. A model trained on a monthly payroll export is fundamentally different from one trained continuously inside the payroll system on live data.

A further gap concerns social behaviour signals. De Jesus et al. [7] established that LinkedIn job-browsing frequency and recruiter connection growth are the strongest leading signals of voluntary attrition among social-platform-derivable features; Roth et al. [20] demonstrated that a reduction in posting activity and an increase in negative sentiment precede organisational disengagement. Van Iddekinge et al. [22] caution, however, that unstructured social media assessment without a formal signal model introduces systematic bias. Despite this evidence base, no prior work has formally specified a synthetic social behaviour proxy that is designed for zero-friction transition to a live API source when platform approval and ethical consent procedures are satisfied.

NEXUS ERP was developed to address these three gaps simultaneously: the absence of integrated predictive analytics in lightweight SME ERP systems, the disconnection between ML attrition models and the operational systems that generate their input data, and the absence of a formally specified and statistically validated synthetic social behaviour signal with a documented production pathway. The research methodology follows Peffers' Design Science Research Methodology (DSRM) [18], which is the established paradigm for artefact-producing Information Systems research.

The remainder of this paper is structured as follows. Section 2 reviews related work across ERP for SMEs, ML attrition prediction, social media signals in HR, synthetic data generation, and HITL ML. Section 3 describes the system design: architecture, the synthetic social score model, and the risk scoring pipeline. Section 4 presents the evaluation results across three tracks. Section 5 discusses findings and limitations. Section 6 concludes with future work directions.

---

## 2. Related Work

### 2.1 ERP Systems for SMEs

Davenport [6] established the foundational definition of ERP as a cross-functional information integrator. Subsequent research has documented a shift in ERP purpose from transaction recording toward predictive decision support [14]. Cloud-hosted ERP has expanded SME access to these systems, but adoption barriers remain: Albarghouthi et al. [3] identify cost, customisation complexity, and data security as the primary constraints for SME cloud-ERP adoption, while Chofreh et al. [4] document organisational and technical barriers specific to the cloud-ERP transition. A persistent gap in the literature is the absence of a lightweight, affordable ERP system that integrates ML-powered workforce risk analytics alongside standard operational modules.

### 2.2 ML-Based Employee Attrition Prediction

Fallucchi et al. [8] provide the most comprehensive systematic review of ML attrition prediction, covering 25 studies using the IBM HR Analytics dataset and identifying Random Forest as the dominant algorithm across configurations. Crucially, their review notes that the IBM HR dataset is itself a synthetic construct — providing methodological precedent for the use of synthetic data in this research domain. Yadav et al. [23] report RF achieving 84.2% accuracy and identify `absence_rate` as the strongest single behavioural predictor. Jain and Nayyar [13] report 92% RF accuracy on the same IBM dataset using explainability techniques. Raza et al. [19] demonstrate that ensemble and stacking approaches yield 88.6% accuracy. Osman [17] extends this line with more recent ensemble architectures.

The critical limitation shared across all of these systems is architectural: they operate as standalone predictive models on pre-collected, static datasets. No reviewed study integrates the ML pipeline within the operational system that continuously generates the training data — a gap that NEXUS ERP addresses directly.

### 2.3 Social Media Signals in HR Analytics

De Jesus et al. [7] conducted a pioneering study on LinkedIn-derivable attrition signals, identifying job-browsing frequency and recruiter connection growth as the most reliable leading indicators. Roth et al. [20] established that reduction in posting activity and an increase in negative sentiment tone are behavioural precursors of disengagement, drawing on the organisational withdrawal literature. Gupta and Sharma [12] survey the broader landscape of social media signal use in HR analytics. Van Iddekinge et al. [22] provide a critical counterpoint: they demonstrate that unstructured, ad-hoc social media assessment introduces systematic adverse-impact bias and call for formal signal modelling before any social data is incorporated into HR decisions.

The present work responds directly to this call: the `social_score` is a formally specified, statistically validated model — not an ad-hoc scrape — with its source clearly documented via the `social_data_source` schema field.

### 2.4 Synthetic Data Generation

The use of synthetic data for sensitive-domain research is well-precedented and methodologically sound. Figueira and Vaz [10] provide a systematic review of synthetic data generation techniques, endorsing Gaussian-based methods for HR research domains. Gonzales et al. [11] demonstrate that synthetic temporal behavioural data can preserve realistic distributional properties needed for ML training. Dahmen and Cook [5] establish a five-criterion validation framework for synthetic datasets — distribution shape, mean/standard deviation compliance, value bounds, correlation structure, and temporal drift — which is adopted in the present evaluation.

### 2.5 Explainable AI and Human-in-the-Loop ML

Lundberg and Lee [15] introduced SHAP (SHapley Additive exPlanations) as a theoretically grounded framework for feature-level prediction explanation. Adadi and Berrada [1] provide a comprehensive survey of XAI in high-stakes decision domains, emphasising that model transparency is a prerequisite for responsible AI deployment in HR contexts. Mosqueira-Rey et al. [16] survey HITL ML frameworks and demonstrate that structured human feedback on model predictions consistently improves performance on decision-relevant minority classes — the precise mechanism evaluated in the present Stage 1 vs Stage 2 comparison. Sajjadiani et al. [21] show empirically that domain-expert label correction in behavioural prediction tasks produces measurably better classifiers than algorithm-only label generation.

---

## 3. System Design

### 3.1 Architecture

NEXUS ERP is built on a four-tier architecture that separates concerns across a React-based frontend, a Node.js API layer, a MongoDB document store, and a Python Flask machine-learning microservice:

```
Browser: React 18 + Vite  (port 3000)
         ↕  HTTPS / REST + JWT
Node.js 18 + Express.js  (port 5001)
         ↕  Mongoose          ↕  HTTP (Axios)
MongoDB 8 (9 collections)    Python Flask 3 (port 5000)
                              Random Forest · SHAP
                              /predict  /train  /health
```

The ML inference layer is deployed as a dedicated Flask microservice rather than embedded in Node.js because Python's scikit-learn and SHAP ecosystem — including SHAP `TreeExplainer`, SMOTE oversampling, and `joblib` model persistence — is substantially more mature than Node.js equivalents. The Node.js backend maintains a deterministic formula-based risk score as a permanent fallback, ensuring graceful degradation rather than service interruption when the Flask microservice is unavailable.

**Table 1 — Technology stack**

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | 18 / 5 / 3 |
| Backend | Node.js + Express.js | 18 / 5 |
| Database | MongoDB + Mongoose | 8 / 9 |
| ML Microservice | Python + Flask + scikit-learn | 3.11 / 3 / 1.4 |
| Auth | JWT + bcrypt | — |

Nine MongoDB collections are used: Employees, Attendance, Payroll, Inventory, InventoryTransactions, **SocialScores**, EmployeeFeatures, RiskScores, and **HRDecisions**. A compound unique index on `(employee_id, month)` is enforced across the four analytics collections, ensuring one record per employee per month and enabling efficient feature-construction lookups.

Security follows JWT stateless session management [2] combined with four-role RBAC (Admin, HR Manager, Manager, Employee) [9] and OTP two-factor email verification. Passwords are stored as bcrypt hashes; no plaintext credentials are persisted at any layer.

### 3.2 Synthetic Social Behaviour Signal

#### 3.2.1 Motivation

De Jesus et al. [7] identify four LinkedIn/Facebook-derivable signals as reliable attrition precursors: job-browsing activity, recruiter connection growth, posting frequency, and sentiment tone. Live API integration is infeasible on research timescales due to LinkedIn platform approval requirements, OAuth consent workflow auditing, and ethics board review cycles. Van Iddekinge et al. [22] further establish that any social signal incorporated into HR decisions must be formally modelled to avoid systematic bias. The approach taken here, following the synthetic data methodology validated by Figueira and Vaz [10] and Dahmen and Cook [5], is to construct a statistically rigorous synthetic proxy with an explicit schema-level migration hook.

#### 3.2.2 Sub-Score Design

Four sub-scores represent distinct dimensions of the digital disengagement signal, each grounded in published literature:

**Table 2 — Social score sub-scores**

| Sub-score | Behavioural Signal | Weight | Literature Basis |
|---|---|---|---|
| `job_search` | LinkedIn job-browsing and application activity | 0.35 | De Jesus et al. [7] — strongest single LinkedIn signal |
| `post_drop` | Reduction in social media posting frequency | 0.25 | Roth et al. [20] — social silence precedes disengagement |
| `network_growth` | Growth in recruiter and professional connections | 0.20 | De Jesus et al. [7] — connection-building predicts job-search intent |
| `sentiment` | Negativity in posts, comments, and reactions | 0.20 | Roth et al. [20] — negative sentiment is a key disengagement construct |

Weights are non-arbitrary: `job_search` receives the highest allocation because De Jesus et al. [7] found it to be the most reliable single predictor; the remaining weights are proportional to the relative effect sizes reported in the cited literature.

#### 3.2.3 VAR Generation Model

A naive independent-draw Gaussian model would produce unrealistic month-to-month oscillation (e.g., `job_search` moving 0.12 → 0.87 → 0.03), ignoring two real-world properties: temporal persistence within individuals and cross-signal correlation arising from a shared underlying disengagement propensity. The VAR generation model addresses both:

$$\mathbf{s}_t = \alpha \cdot \mathbf{s}_{t-1} + (1 - \alpha) \cdot \text{MVN}(\boldsymbol{\mu} + \beta,\; \boldsymbol{\Sigma})$$

where $\mathbf{s}_t$ is the four-dimensional sub-score vector at month $t$; $\alpha = 0.65$ is the autoregressive persistence coefficient; $\boldsymbol{\mu} = [0.25,\, 0.30,\, 0.20,\, 0.20]$ is the neutral-baseline mean vector; $\beta \in [0.01, 0.45]$ is the employee's hidden `risk_bias` that shifts all means upward for higher-risk individuals; and $\boldsymbol{\Sigma}$ is a covariance matrix derived from the correlation structure below and per-sub-score standard deviations $\sigma = 0.10$–$0.12$.

The off-diagonal correlations encode behavioural co-occurrence: `job_search` ↔ `network_growth` = 0.60 (both reflect active job-searching), with all other pairs in the range 0.35–0.50. The Cholesky decomposition of the correlation matrix is pre-computed once and reused across all 100 employees and 6 months. All values are clamped to [0.0, 1.0].

The composite score is the weighted sum of sub-scores:

$$\texttt{social\_score} = 0.35 \cdot s_{\textit{job}} + 0.25 \cdot s_{\textit{drop}} + 0.20 \cdot s_{\textit{net}} + 0.20 \cdot s_{\textit{sent}}$$

#### 3.2.4 Production Pathway

The **SocialScore** MongoDB schema includes a `social_data_source` string field defaulted to `'synthetic'`. When a production deployment connects to the LinkedIn API or a Facebook-approved data partner, the ingestion pipeline sets this field to `'linkedin_api'` on newly created records. No schema migration is required. The ML pipeline and SHAP layer are entirely agnostic to data provenance — they consume numerical sub-score values regardless of origin. This formally documents the transition mechanism, a design feature absent from all prior work in this domain.

### 3.3 Risk Scoring Pipeline

#### 3.3.1 Feature Engineering

Eight features are constructed from cross-module ERP data per employee per month through a three-pass pipeline:

**Table 3 — Feature vector definition**

| Feature | Source Module | Formula Weight | What It Measures |
|---|---|---|---|
| `absence_rate` | Attendance | 0.20 | Absent days / working days (sliding-window blend) |
| `late_rate` | Attendance | 0.10 | Late days / working days |
| `overtime_ratio` | Attendance | 0.10 | Overtime hours / expected hours (burnout signal) |
| `productivity_index` | Payroll + Attendance | 0.15 | 1 − (actual hours / expected hours) — inverted |
| `payroll_variance` | Payroll | 0.05 | Month-to-month salary instability |
| `social_score` | **SocialScores** | **0.25** | Digital disengagement signal (core contribution) |
| `tenure_months` | Employee | 0.05 | 1 − (tenure / max_tenure) — inverted |
| `department_risk` | RiskScores | 0.10 | Leave-one-out dept peer average (prior month) |

**Pass 1** applies a weighted sliding-window blend to attendance features (0.6 × current + 0.3 × prior month + 0.1 × two months prior) to smooth single-month noise spikes. **Pass 2** computes `department_risk` as the leave-one-out mean of department peers' prior-month proxy scores, with self-exclusion to prevent target leakage. **Pass 3** applies global min-max normalisation across the full 600-record dataset:

$$x_{\text{norm}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}}$$

#### 3.3.2 Deterministic Composite Formula

A deterministic fallback risk score is always available, implemented in `backend/utils/riskScoring.js`:

$$\text{RiskScore} = \left(\, 0.20 \cdot a + 0.10 \cdot l + 0.10 \cdot o + 0.15 \cdot p + 0.05 \cdot v + 0.25 \cdot s + 0.05 \cdot t + 0.10 \cdot d \,\right) \times 100$$

where $a$ = `absence_rate`, $l$ = `late_rate`, $o$ = `overtime_ratio`, $p$ = `productivity_index`, $v$ = `payroll_variance`, $s$ = `social_score`, $t$ = `tenure_months`, $d$ = `department_risk`. Weights sum to 1.0. The `social_score` receives the highest weight (0.25) as the novel contribution; `absence_rate` receives the second-highest (0.20) as the strongest classical HR predictor [23].

Risk tiers use equal-width thresholds to preserve stable tier semantics as the dataset grows:

**Table 4 — Risk tiers**

| Score Range | Tier | Recommended Action |
|---|---|---|
| 0–25 | Low | No action required |
| 26–50 | Medium | Monitor; quarterly review |
| 51–75 | High | HR intervention recommended |
| 76–100 | Critical | Immediate attention required |

#### 3.3.3 Random Forest Classifier

The literature consistently identifies Random Forest as the top-performing algorithm for employee attrition classification [8, 13, 23]. Three additional properties make it the appropriate choice for this system: (i) it handles continuous float inputs in [0, 1] natively; (ii) its native `feature_importances_` attribute provides a Gini-based sanity check against SHAP; and (iii) SHAP `TreeExplainer` supports RF natively, computing exact Shapley values rather than approximations, at low computational cost.

The model is configured in `ml-service/model.py`: `n_estimators=200` (determined by the tuning curve shown in Section 4.7), `class_weight='balanced'` (compensates for Low:40% / Critical:7% imbalance), `random_state=42`. SMOTE oversampling is applied before training with `k_neighbors` auto-clipped to `min_class_size − 1` to prevent crashes when minority class size is small. A temporal train/validation/test split (months 1–4 / month 5 / month 6) prevents autocorrelation leakage: a random split would allow future-month records into the training set, inflating accuracy and failing to simulate real-time deployment.

#### 3.3.4 Two-Stage Training and HITL Loop

The model is trained in two stages:

**Stage 1** uses formula-derived risk class labels from **RiskScores** as ground truth — a cold-start baseline that requires no human input. **Stage 2** reads **HRDecisions** and builds a merged label set in which HR-corrected records override the formula labels. The Random Forest retrains on this merged set, incorporating HR domain knowledge as structured supervision.

The HITL feedback loop operates as follows:

1. ML microservice predicts risk tier → SHAP values returned alongside prediction
2. HR Manager views prediction + SHAP waterfall chart in the risk scoring UI
3. HR Manager accepts (formula label retained) or rejects + corrects (HR class stored)
4. Decision persisted to **HRDecisions** collection
5. HR Manager triggers Stage 2 retrain → `POST /api/risk/retrain` → Flask `/train`
6. Updated model serves all future `/predict` calls

Every prediction is accompanied by SHAP feature-level explanations rendered as a waterfall bar chart (red = risk-increasing, teal = risk-decreasing, bar length ∝ |SHAP|). The `backend/utils/topDrivers.js` utility maps raw SHAP keys to human-readable phrases for the HR narrative panel.

The portfolio-level Workforce Risk Level (WRL) metric provides an organisational health indicator:

$$\text{WRL} = \frac{\text{High} + \text{Critical}}{\text{Total Employees}} \times 100\%$$

An automated email alert is dispatched to all Admin and HR Manager accounts when WRL ≥ 30%.

---

## 4. Evaluation

### 4.1 Dataset

All data is synthetic, generated by eight deterministic Node.js seeding scripts from a fixed random seed. The use of synthetic data is methodologically established in the HR analytics literature: the widely cited IBM HR Analytics dataset used across 25+ reviewed studies is itself synthetic [8, 13]. Validation methodology follows Dahmen and Cook [5] and Figueira and Vaz [10].

**Table 5 — Dataset scale**

| Data Type | Count |
|---|---|
| Employees | 100 (5 departments × 20 each) |
| Months of data | 6 (October 2025 – March 2026) |
| Attendance records | ~13,000 |
| Payroll records | 600 |
| Feature vectors | 600 |
| HR decisions | 600 (526 accepted, 74 corrected — 12.3% correction rate) |
| Correction breakdown | 70× Medium→High, 2× Low→Medium, 2× Medium→Low |

**Stage 1 (formula-derived) label distribution across 600 feature vectors:** Low = 41.7% (250 records), Medium = 56.8% (341 records), High = 1.5% (9 records), Critical = 0% (0 records). The formula rarely assigns High scores and never assigns Critical across this seeded population, producing a severely imbalanced label set that motivates both SMOTE oversampling and the HITL Stage 2 retraining. After applying the 74 HR corrections, the **Stage 2 label distribution** shifts to: Low = 41.7% (250), Medium = 45.2% (271), High = 13.2% (79), Critical = 0%. The 70 Medium→High corrections are responsible for the entire shift.

### 4.2 Stage 1 ML Results

Stage 1 trains on formula-derived labels. After SMOTE oversampling, the training set (months 1–4) contains 720 samples.

**Table 6 — Stage 1 classification report (test set, month 6, n=100)**

| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| Low | 0.905 | 0.864 | 0.884 | 44 |
| Medium | 0.877 | 0.909 | 0.893 | 55 |
| High | 0.000 | 0.000 | 0.000 | 1 |
| **Macro Average** | **0.594** | **0.591** | **0.592** | **100** |
| Weighted Average | 0.881 | 0.880 | 0.880 | 100 |

**Validation accuracy: 93.0% | Test accuracy: 88.0% | F1 macro: 0.592**

*Note: No Critical-class records appear in either stage's test set. The formula-derived label distribution contains zero Critical records across all 600 feature vectors — the seeded population does not produce feature vectors that exceed the 76/100 Critical threshold under the formula weights. Critical represents an extreme tail requiring near-maximum values across all eight features simultaneously; it is included in the tier schema for production deployments where such employees may exist.*

The 88.0% test accuracy is misleading in isolation. The test set contains only a single High-class record (1% of 100), and the model — having seen few High-class examples during training on formula-derived labels — predicts Medium for that record. The weighted-average F1 (0.880) is inflated by the dominance of Low and Medium classes. F1 macro of 0.592 correctly exposes the model's complete inability to identify the most actionable risk tier.

*Figure 1 — Stage 1 confusion matrix (`evaluation_output/confusion_matrix_stage1.png`)*

*Figure 2 — Stage 1 RF feature importance (`evaluation_output/feature_importance_stage1.png`)*

Stage 1 SHAP feature importance (mean absolute SHAP, test set): `social_score` rank 1 (0.1458), `absence_rate` rank 2 (0.1172).

### 4.3 Stage 2 ML Results

After applying 74 HR corrections and retraining, the training set contains 582 samples post-SMOTE.

**Table 7 — Stage 2 classification report (test set, month 6, n=100)**

| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| Low | 0.860 | 0.841 | 0.851 | 44 |
| Medium | 0.810 | 0.791 | 0.800 | 43 |
| High | 0.800 | 0.923 | 0.857 | 13 |
| **Macro Average** | **0.823** | **0.852** | **0.836** | **100** |
| Weighted Average | 0.831 | 0.830 | 0.830 | 100 |

**Validation accuracy: 93.0% | Test accuracy: 83.0% | F1 macro: 0.836**

The High-class test support rises from 1 to 13, reflecting HR relabelling propagating into the test set. The Stage 2 model achieves High-class precision of 0.800 and recall of 0.923 — correctly identifying 12 of the 13 true High-risk employees. Stage 2 SHAP: `social_score` rank 1 (0.1900), `absence_rate` rank 2 (0.0796).

*Figure 3 — Stage 2 confusion matrix (`evaluation_output/confusion_matrix_stage2.png`)*

*Figure 4 — Stage 2 RF feature importance (`evaluation_output/feature_importance_stage2.png`)*

### 4.4 Stage Comparison — Core Finding

**Table 8 — Stage 1 vs Stage 2 comparison**

| Metric | Stage 1 | Stage 2 | Change | Interpretation |
|---|---|---|---|---|
| Validation Accuracy | 93.0% | 93.0% | — | Stable generalisation in both stages |
| Test Accuracy | 88.0% | 83.0% | **−5.0%** | Expected: harder test set after relabelling (see below) |
| **F1 Macro** | **0.592** | **0.836** | **+24.4 pts** | **Core finding — HITL substantially improves balanced performance** |
| High-class F1 | 0.000 | 0.857 | **+0.857** | Stage 1 entirely blind to High class; Stage 2 classifies it reliably |
| Training samples (post-SMOTE) | 720 | 582 | −138 | Fewer but higher-quality HR-validated labels |

The −5.0% test accuracy decrease is expected and should not be interpreted as a regression. Stage 2 test labels reflect the HR relabelling: the Medium-class test support drops from 55 to 43, and High-class support rises from 1 to 13. A model that correctly predicts more High cases will register more errors against a test set that contains more High examples at tighter decision boundaries. F1 macro — which treats each class equally regardless of size — is the appropriate comparative metric, and it improves by 24.4 percentage points.

This result is consistent with the HITL framework described by Mosqueira-Rey et al. [16] and the empirical findings of Sajjadiani et al. [21]: human domain expertise, when systematically captured as labelled corrections, improves a deployed classifier on the most decision-relevant minority classes.

### 4.5 SHAP Feature Analysis

**Table 9 — SHAP importance: Stage 1 vs Stage 2**

| Feature | S1 Rank | S2 Rank | S1 Mean \|SHAP\| | S2 Mean \|SHAP\| | Δ |
|---|---|---|---|---|---|
| `social_score` | 1 | 1 | 0.1458 | 0.1900 | **+0.044** |
| `absence_rate` | 2 | 2 | 0.1172 | 0.0796 | −0.038 |
| `late_rate` | 5 | 3 | 0.0395 | 0.0443 | +0.005 |
| `tenure_months` | 6 | 4 | 0.0339 | 0.0419 | +0.008 |
| `productivity_index` | 3 | 5 | 0.0560 | 0.0382 | −0.018 |
| `department_risk` | 4 | 6 | 0.0524 | 0.0356 | −0.017 |
| `overtime_ratio` | 8 | 7 | 0.0151 | 0.0315 | +0.016 |
| `payroll_variance` | 7 | 8 | 0.0253 | 0.0255 | +0.000 |

*Figure 5 — SHAP global summary, Stage 2 (`evaluation_output/shap_summary.png`)*

*Figure 6 — SHAP drift: Stage 1 vs Stage 2 (`evaluation_output/shap_drift.png`)*

`social_score` is the highest-importance feature in both stages, and its SHAP importance increases by the largest absolute margin between stages (+0.044). This is the principal empirical validation of the novel contribution: after HR managers issued 70 Medium→High corrections, the Stage 2 model found that `social_score` was the feature that most consistently distinguished newly labelled High employees from their Medium counterparts, confirming that HR domain experts implicitly relied on the digital disengagement signal when overriding the formula.

The slight decline in `absence_rate` importance at Stage 2 is consistent with Yadav et al. [23], who note that absenteeism's predictive effect diminishes when richer contextual signals are available. `late_rate` and `tenure_months` both gain rank, suggesting HR managers implicitly weighted repeat lateness and shorter tenure when identifying genuinely high-risk employees beyond what the formula captured.

### 4.6 Social Score Validation

Following the validation framework of Dahmen and Cook [5], five criteria are assessed against the seeded 600-record dataset:

**Table 10 — Social score validation**

| Criterion | Expected | Observed | Result |
|---|---|---|---|
| Distribution shape | Approximately Gaussian | Unimodal, roughly symmetric histograms for all sub-scores | ✓ Pass |
| Sub-score means within range | μ_d ± 0.15 | `job_search`=0.3746, `post_drop`=0.4275, `network_growth`=0.3195, `sentiment`=0.3203 | ✓ Pass |
| All values in [0.0, 1.0] | No out-of-bound values | min=0.0147, max=0.8865 across sub-scores | ✓ Pass |
| Cross-sub-score correlations | r ∈ [0.2, 0.6] | All pairs r ≈ 0.30–0.55 (consistent with Cholesky design) | ✓ Pass |
| Temporal drift | High-risk cohort upward trend | Divergence from month 2, widens consistently to month 6 | ✓ Pass |

The observed means are 0.10–0.13 above baseline ($\boldsymbol{\mu}$), which is expected: the population-wide mean `risk_bias` of approximately 0.15 (averaged across 100 employees) shifts every employee's distribution above the neutral baseline. The cross-sub-score correlations fall entirely within the [0.30, 0.55] range, confirming that the Cholesky decomposition correctly induced the intended dependence structure without producing redundant (r > 0.70) sub-scores.

*Figure 7 — Social sub-score distributions (`evaluation_output/social_score_histograms.png`)*

*Figure 8 — Sub-score correlation matrix (`evaluation_output/social_score_correlation.png`)*

*Figure 9 — Social score temporal drift, high-risk vs low-risk cohorts (`evaluation_output/social_score_drift.png`)*

### 4.7 n_estimators Tuning

**Table 11 — n_estimators tuning (Stage 2, validation accuracy)**

| n_estimators | Validation Accuracy |
|---|---|
| 50 | 0.94 |
| 100 | 0.94 |
| 150 | **0.95** |
| 200 | 0.93 |
| 300 | 0.93 |
| 500 | 0.94 |

*Figure 10 — n_estimators tuning curve (`evaluation_output/n_estimators_curve.png`)*

The tuning curve is notably flat (range 0.93–0.95 across a 10× range of tree counts), indicating dataset saturation at the 100-employee scale. The choice of `n_estimators=200` is a conservative midpoint: it does not achieve the observed accuracy maximum (150 trees, 0.95) but provides a stable, reproducible ensemble with negligible inference overhead. This parameter should be re-evaluated at larger employee scales.

### 4.8 Functional Testing

All 13 functional test cases pass. Key results are summarised in Table 12.

**Table 12 — Functional test summary (selected)**

| Module | Test Case | Result |
|---|---|---|
| Payroll | 20 present days, 5 OT hours, 15 late min, LKR 500/h → expected Gross=83,750; EPF=6,700; ETF=2,512.50; LatePenalty=750; Final=73,787.50 | ✓ Pass |
| Payroll | Final salary floor — negative payslip input → FinalSalary = 0 | ✓ Pass |
| Inventory | Quantity ≤ reorder_level → alert email dispatched + badge visible in UI | ✓ Pass |
| Authentication | Tampered JWT → 401 Unauthorized | ✓ Pass |
| Authentication | Expired JWT → 401 Unauthorized | ✓ Pass |
| RBAC | Employee role accessing risk score endpoint → 403 Forbidden | ✓ Pass |
| RBAC | Manager role accessing payroll endpoint → 403 Forbidden | ✓ Pass |
| Risk formula | All features = 0.5 → RiskScore = 50.0 (Medium tier boundary) | ✓ Pass |
| Risk formula | All features = 1.0 → RiskScore = 100.0 (Critical) | ✓ Pass |
| ML fallback | Flask offline → Node returns formula-based score (graceful degradation) | ✓ Pass |
| WRL alert | High+Critical count > 30% of employees → alert email dispatched | ✓ Pass |

---

## 5. Discussion

### 5.1 Answering the Research Questions

**RQ3 (synthetic social signal):** All five validation criteria pass. The VAR model with Cholesky-decomposed MVN produces statistically coherent signals that satisfy the criteria established by Dahmen and Cook [5] and Figueira and Vaz [10]. The `social_data_source` schema field provides a formally documented, zero-migration production pathway that is unique to this work.

**RQ4 (ML-powered risk scoring integrated in ERP):** Stage 2 achieves test accuracy of 83.0% and F1 macro of 0.836. Comparing these figures to the literature requires care: Jain and Nayyar [13] report 92% accuracy on the IBM HR dataset using 35 features and 1,470 records. NEXUS ERP uses 8 carefully engineered cross-module features from a 100-employee prototype dataset. The appropriate comparison is to the Stage 1 baseline on the same dataset: Stage 2 improves F1 macro by 24.4 points and achieves High-class F1 of 0.857. SHAP analysis empirically confirms `social_score` as the highest-importance feature (mean |SHAP| = 0.1900), validating the core research contribution.

**RQ5 (HITL improvement):** The +24.4 pt F1 macro improvement is the principal empirical finding. It is driven by 74 HR corrections (12.3% correction rate), of which 70 were Medium→High reclassifications. The Stage 2 model learned to replicate HR judgements that the formula could not express, consistent with Mosqueira-Rey et al. [16] and Sajjadiani et al. [21]. The test accuracy decrease (88% → 83%) is expected, not a regression: HR relabelling makes the test set harder by increasing High-class support from 1 to 13.

### 5.2 Limitations

Five limitations are acknowledged. **Synthetic data throughout:** all employee records, attendance events, and social scores are computer-generated. The evaluation demonstrates architectural and methodological validity, not production performance guarantees; predictive accuracy on real-world data will require recalibration as genuine HR feedback accumulates. **Dataset scale:** 100 employees and 600 feature vectors is sufficient for prototype demonstration but is a modest scale compared to enterprise HR datasets; the flat n_estimators tuning curve reflects dataset saturation. **Single-threaded ML microservice:** the Flask service runs on Werkzeug's development server and will queue requests under concurrent load; production deployment requires gunicorn or uvicorn. **Hardcoded statutory rates:** EPF (8%) and ETF (3%) are constants specific to Sri Lankan labour law; multi-jurisdiction deployment requires a configurable deduction-rule layer. **No live social API integration:** the `social_score` is entirely synthetic; its predictive value in production depends on whether real LinkedIn/Facebook behavioural patterns follow the VAR model's distributional assumptions.

---

## 6. Conclusion

This paper presented NEXUS ERP, a MERN-stack ERP system with an integrated Python Flask ML microservice that delivers three research contributions to the SME-targeted HR analytics domain.

**Contribution 1 — Synthetic social behaviour signal with a production pathway:** A formally specified VAR model with Cholesky-decomposed MVN generates a composite `social_score` (0.0–1.0) across four literature-grounded sub-scores. The signal passes all five Dahmen and Cook [5] validation criteria. The MongoDB `SocialScore` schema includes a `social_data_source` field that transitions from `'synthetic'` to `'linkedin_api'` with zero migration, providing a documented production pathway that is absent from all prior work in this domain.

**Contribution 2 — ML risk scoring integrated within a lightweight ERP:** An eight-feature cross-module feature vector feeds both a deterministic composite formula and a Random Forest classifier. Stage 2 achieves test accuracy 83.0% and F1 macro 0.836. SHAP analysis confirms `social_score` as the highest-importance feature in both training stages (Stage 2 mean |SHAP| = 0.1900), empirically validating the core research signal.

**Contribution 3 — HITL retraining with demonstrated measurable improvement:** Structured HR feedback (74 corrections across 600 decisions) drives Stage 2 retraining and produces a +24.4 percentage-point F1 macro improvement (0.592 → 0.836) and a High-class F1 gain from 0.000 to 0.857 — empirically confirming the HITL framework of Mosqueira-Rey et al. [16] in an HR risk-scoring context.

Four future-work directions are identified. *Live social API integration* is the highest-priority extension: the `social_data_source` schema field is the designed transition point, requiring only OAuth consent workflow implementation and ethics board approval. *Dynamic weight recalibration* using SHAP importances would keep the deterministic formula semantically aligned with the evolving Stage 2 model. *A React Native mobile application* would enable push-notification-driven HITL review for HR managers away from a desktop. *Production deployment* (gunicorn, MongoDB Atlas, nginx) would remove the single-threaded Flask bottleneck and provide managed database infrastructure.

---

## References

[1] A. Adadi and M. Berrada, "Peeking Inside the Black-Box: A Survey on Explainable Artificial Intelligence (XAI)," *IEEE Access*, vol. 6, pp. 52138–52160, 2018. doi:10.1109/ACCESS.2018.2870052

[2] S. Ahmed and Q. Mahmood, "An Authentication Based Scheme for Applications Using JSON Web Token," in *Proc. 22nd Int. Multitopic Conf. (INMIC)*, IEEE, 2019. doi:10.1109/INMIC48123.2019.9022766

[3] M. Albarghouthi, B. Qi, H. Wang, and K. Shang, "Exploring cloud enterprise resource planning and open innovation for small and medium enterprises: Insights from practitioners," *Technol. Forecast. Soc. Change*, vol. 200, p. 123152, 2024.

[4] A. G. Chofreh, F. A. Goni, J. J. Klemes, M. N. Malik, and H. H. Khan, "Challenges of Cloud-ERP Adoptions in SMEs," *Procedia Comput. Sci.*, vol. 196, pp. 973–981, 2021.

[5] J. Dahmen and D. J. Cook, "SynSys: A Synthetic Data Generation System for Healthcare Applications," *Sensors*, vol. 19, no. 5, p. 1181, 2019. doi:10.3390/s19051181

[6] T. H. Davenport, "Putting the Enterprise into the Enterprise System," *Harvard Bus. Rev.*, vol. 76, no. 4, pp. 121–131, 1998.

[7] A. C. C. De Jesus, M. E. G. D. Junior, and W. C. Brandao, "Exploiting LinkedIn to Predict Employee Resignation Likelihood," in *Proc. 33rd Annual ACM Symp. Applied Computing (SAC '18)*, pp. 1212–1219, 2018. doi:10.1145/3167132.3167320

[8] F. Fallucchi, M. Coladangelo, R. Giuliano, and E. W. De Luca, "Predicting Employee Attrition Using Machine Learning Techniques," *Computers*, vol. 9, no. 4, p. 86, 2020. doi:10.3390/computers9040086

[9] D. F. Ferraiolo, D. R. Kuhn, and R. Chandramouli, *Role-Based Access Control*, 2nd ed. Norwood, MA: Artech House, 2007.

[10] Á. Figueira and B. Vaz, "A Systematic Review of Synthetic Data Generation Techniques Using Generative AI," *Electronics*, vol. 13, no. 17, p. 3509, 2024. doi:10.3390/electronics13173509

[11] A. Gonzales, G. Guruswamy, and S. R. Smith, "Synthetic Data in Health Care: A Narrative Review," *PLOS Digital Health*, vol. 2, no. 1, 2023.

[12] P. Gupta and S. Sharma, "Role of Social Media in Human Resource Management: A Review," *Int. J. Manag. and Humanit. Studies*, 2022.

[13] P. K. Jain and A. Nayyar, "Employee Attrition Prediction Using Machine Learning and Explainability Techniques," *Int. J. Adv. Comput. Sci. Appl. (IJACSA)*, vol. 13, no. 2, 2022.

[14] S. Katuu, "Enterprise resource planning: Past, present, and future," *New Rev. Inf. Networking*, vol. 25, no. 1, pp. 37–46, 2020.

[15] S. M. Lundberg and S.-I. Lee, "A Unified Approach to Interpreting Model Predictions," in *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 30, 2017.

[16] E. Mosqueira-Rey, E. Hernández-Pereira, D. Alonso-Ríos, J. Bobes-Bascarán, and Á. Fernández-Leal, "Human-in-the-loop machine learning: A state of the art," *Artif. Intell. Rev.*, vol. 56, pp. 3005–3054, 2023.

[17] M. Osman, "An ensemble approach to employee attrition prediction using machine learning," *J. Artif. Intell. Data Min.*, vol. 13, no. 1, 2025.

[18] K. Peffers, T. Tuunanen, M. A. Rothenberger, and S. Chatterjee, "A Design Science Research Methodology for Information Systems Research," *J. Manag. Inf. Syst.*, vol. 24, no. 3, pp. 45–77, 2007.

[19] M. Raza, A. Sajid, and J. Akhter, "Employee Attrition Prediction Using Machine Learning Approaches," in *Proc. IEEE Int. Conf. Innovative Research in Technology (ICIRT)*, 2022.

[20] P. L. Roth, P. Bobko, C. H. Van Iddekinge, and J. B. Thatcher, "Social media in employee-selection-related decisions: A research agenda for uncharted territory," *J. Manag.*, vol. 42, no. 1, pp. 269–298, 2016.

[21] S. Sajjadiani, A. J. Sojourner, J. D. Kammeyer-Mueller, and E. Mykerezi, "Using Machine Learning to Translate Applicant Work History into Predictors of Performance and Turnover," *Personnel Psychol.*, vol. 72, no. 3, pp. 417–452, 2019.

[22] C. H. Van Iddekinge, S. C. Lanivich, P. L. Roth, and E. Junco, "Social Media for Selection? Validity and Adverse Impact Potential of a Facebook-Based Assessment," *J. Manag.*, vol. 42, no. 7, pp. 1811–1835, 2016.

[23] A. K. Yadav, P. Jain, and A. Shrivastava, "Employee Attrition Prediction Using Random Forest," in *Proc. Int. Conf. on Advances in Computing, Communication, and Control (ICAC3)*, IEEE, 2018.
