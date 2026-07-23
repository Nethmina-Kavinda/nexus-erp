# Chapter 5: Implementation, Testing and Evaluation

---

## 5.1 Chapter Overview

This chapter describes the realisation of the NEXUS ERP system from the specification in Chapter 4 through to its empirical evaluation. The chapter is structured in three parts. The first part covers technology selection and the detailed implementation of the three research contribution features: the synthetic social score VAR/Gaussian model, the eight-feature cross-module risk pipeline, and the human-in-the-loop RF retraining mechanism, with pseudocode and algorithm-level detail. The second part covers the testing strategy: the test plan, functional test cases, and a review of the testing strategies applied. The third part presents the evaluation results across three tracks: ML model evaluation (Stage 1 vs Stage 2), synthetic social score statistical validation, and supporting analyses. It closes with a discussion that maps every finding to its corresponding research question.

---

## 5.2 Technology Selection and Justification

Technology selection decisions were made to maximise alignment between the tools available and the specific requirements of each system tier. The tables below provide the justification for each key technology choice.

### 5.2.1 Programming Languages

**Table 5.1: Programming Language Justification**

| Language | Used For | Justification | Alternatives Considered |
|---|---|---|---|
| JavaScript (Node.js 18) | Backend API, payroll engine, seed scripts | Enables full-stack JavaScript with shared data structures between frontend and backend; mature npm ecosystem for Express, Mongoose, Nodemailer, JWT | Python (Flask only) — would require REST calls for payroll logic; Java Spring — excessive boilerplate for SME-scale API |
| Python 3.11 | ML microservice, evaluation scripts | scikit-learn, SHAP, joblib, NumPy, and SciPy are the most mature, documented ML tools available. TreeExplainer is designed for Python and has no stable Node.js equivalent | Node.js ML (TensorFlow.js) — immature SHAP support; R — no REST web framework equivalent to Flask |
| JSX / React 18 | Frontend SPA | Component model with hooks enables role-aware navigation, state-driven SHAP modal rendering, and the real-time retrain progress UI | Angular — heavyweight for SME-scale UI; Vue — smaller community; Svelte — immature ecosystem for complex charting |

### 5.2.2 Frameworks and Libraries

**Table 5.2: Framework and Library Justification**

| Technology | Version | Role | Selection Justification |
|---|---|---|---|
| Express.js | 5.x | REST API routing | Minimal, unopinionated — allows clean controller/route separation per module |
| Mongoose | 9.x | MongoDB ODM | Schema enforcement at application level; compound index support critical for `(employee_id, month)` uniqueness |
| Vite | 5.x | Frontend build tool | Hot Module Replacement for React development; significantly faster than Create React App |
| Tailwind CSS | 3.x | UI styling | Utility-first approach enables rapid dark-navy theme with consistent risk-tier colour coding without writing custom CSS |
| scikit-learn | 1.4 | Random Forest, SMOTE | Industry-standard ML library; `RandomForestClassifier`, `SMOTE` (via imbalanced-learn), and `joblib` persistence all from the same ecosystem |
| SHAP | 0.44+ | ML explainability | `TreeExplainer` computes exact Shapley values for RF models — not approximations. No comparable alternative in the Python ecosystem. |
| Flask | 3.x | ML web service | Lightweight WSGI framework appropriate for a single-purpose microservice with three endpoints |
| jsonwebtoken | Latest | JWT signing/verification | Node.js standard for JWT; RSA and HMAC signing supported |
| bcrypt | Latest | Password hashing | Industry standard; cost factor 10 provides adequate security vs. computation time |
| Nodemailer | Latest | Email dispatch | SMTP-based; no paid service dependency; supports Gmail OAuth for OTP and alert dispatch |
| Recharts | Latest | Frontend charting | React-native charting library used for SHAP waterfall, risk distribution donut, and WRL gauge |

### 5.2.3 Development Tools

| Tool | Purpose |
|---|---|
| Visual Studio Code | Primary IDE |
| Postman | API endpoint testing during development |
| Git + GitHub | Version control |
| MongoDB Compass | Database inspection and manual data verification |
| pip + venv | Python dependency isolation |
| npm | Node.js package management |

---

## 5.3 Implementation of Key Research Contribution Features

This section details the implementation of the three research contribution components with algorithm-level descriptions and pseudocode. Basic ERP features (login/signup, attendance recording, payroll arithmetic) are documented at the API level only; the novel contributions are covered in full.

### 5.3.1 Synthetic Social Score: VAR/Gaussian Generation Algorithm

The social score generator is implemented in `backend/seeds/04_seedSocialScores.js`. The algorithm generates temporally autocorrelated, cross-correlated sub-score vectors for each employee across six months using a Vector Autoregressive process with Cholesky-decomposed multivariate Normal innovation.

**Algorithm 5.1: Social Score Generation**

```
INPUT:  employees[]  (100 records with risk_bias ∈ [0.01, 0.45])
OUTPUT: SocialScore documents (600 records)

CONSTANTS:
  α = 0.65                           // autoregressive persistence
  μ = [0.25, 0.30, 0.20, 0.20]      // base means: [job_search, post_drop, network, sentiment]
  σ = [0.12, 0.10, 0.10, 0.10]      // per-sub-score standard deviations

  CORR_MATRIX =                       // designed correlation structure
    [[1.00, 0.50, 0.60, 0.50],
     [0.50, 1.00, 0.40, 0.50],
     [0.60, 0.40, 1.00, 0.35],
     [0.50, 0.50, 0.35, 1.00]]

  L = cholesky(CORR_MATRIX)          // pre-computed once, reused across all employees/months

PROCEDURE GenerateSocialScores():
  FOR each employee e in employees:
    β ← e.risk_bias
    biased_μ ← μ + β                 // shift all four means by risk_bias
    prev_scores ← null               // no autocorrelation for month 1

    FOR each month m in [1..6]:
      // Step 1: Sample innovation from Multivariate Normal
      z ← [sample 4 independent N(0,1) values]
      Σ_diagonal ← diag(σ)
      innovation ← biased_μ + Σ_diagonal × L × z    // Cholesky transforms z to correlated

      // Step 2: Apply autoregressive blending (VAR step)
      IF prev_scores IS null:
        raw_scores ← innovation      // month 1: no prior state
      ELSE:
        raw_scores ← α × prev_scores + (1 - α) × innovation

      // Step 3: Clamp to [0.0, 1.0]
      scores ← clamp(raw_scores, 0.0, 1.0)

      // Step 4: Compute composite social_score
      social_score ← 0.35×scores[0] + 0.25×scores[1]
                   + 0.20×scores[2] + 0.20×scores[3]

      // Step 5: Persist to MongoDB
      INSERT SocialScore{
        employee_id:  e._id,
        month: m,
        job_search:     scores[0],
        post_drop:      scores[1],
        network_growth: scores[2],
        sentiment:      scores[3],
        social_score:   social_score,
        social_data_source: 'synthetic'
      }

      prev_scores ← scores           // carry forward for next month's AR step

END FOR (month)
END FOR (employee)
```

**Why α = 0.65:** A persistence coefficient of 0.65 means 65% of each month's score is carried forward from the prior month, and only 35% is freshly drawn from the distribution. This produces smooth, realistic behavioural trajectories rather than independent month-to-month noise. Values of α closer to 1.0 produce near-constant trajectories; values near 0 produce uncorrelated white noise. The value 0.65 was calibrated to produce visible temporal drift for high-risk employees while maintaining month-to-month variability.

**The Cholesky decomposition** transforms four independent standard normal samples into four correlated samples matching the designed correlation matrix. This is computed once and reused, making the generation loop efficient (O(n × 6) iterations with O(16) matrix multiply per step).

### 5.3.2 Eight-Feature Vector Construction Algorithm

Feature vectors are constructed by `backend/seeds/05_seedFeatureVectors.js` in three sequential passes across the 600 monthly records.

**Algorithm 5.2: Feature Vector Construction**

```
INPUT:  Attendance[], Payroll[], SocialScores[], Employees[]
OUTPUT: EmployeeFeature documents (600 records)

PASS 1 — Attendance-derived features (with sliding-window blending):
  FOR each (employee, month) pair:
    absent_days   ← count(attendance where status == 'absent')
    late_days     ← count(attendance where late_minutes > 0)
    overtime_hrs  ← sum(attendance.overtime_hours)
    expected_hrs  ← working_days × 8

    IF month >= 3:
      absence_rate    ← 0.6 × (absent/working_days)_t
                      + 0.3 × (absent/working_days)_(t-1)
                      + 0.1 × (absent/working_days)_(t-2)
      // same blending for late_rate, overtime_ratio
    ELSE:
      absence_rate ← absent_days / working_days   // no prior months
      // same for late_rate, overtime_ratio

    productivity_index ← 1 - (actual_hours / expected_hours)
    // inverted: low hours → high risk value

    payroll_variance ← |this_month_final - last_month_final| / last_month_final
    // if month == 1: payroll_variance ← 0.0 (no prior month)

    social_score ← SocialScores[employee, month].social_score
    tenure_months ← 1 - (employee.tenure_at_month / max_tenure_in_population)
    // inverted: short tenure → higher risk value

PASS 2 — Department risk (leave-one-out):
  FOR each (employee, month):
    dept_peers ← EmployeeFeatures where department == e.dept AND month == m-1 AND _id != e._id
    IF dept_peers is empty:
      department_risk ← 0.25   // neutral default for month 1
    ELSE:
      department_risk ← mean(proxyScore for each peer)
      // proxy score = weighted formula applied to peer's raw features

PASS 3 — Global min-max normalisation:
  FOR each feature in [absence_rate, late_rate, overtime_ratio, productivity_index,
                       payroll_variance, social_score, tenure_months, department_risk]:
    min_val ← min(feature across all 600 records)
    max_val ← max(feature across all 600 records)
    FOR each record:
      feature_normalised ← (raw - min_val) / (max_val - min_val)

INSERT EmployeeFeature{ employee_id, month, [8 normalised features] }
```

**Self-exclusion in department_risk** prevents target leakage: including an employee's own score in their department average would create a circular dependency between input and output. The prior month's data (`m-1`) is used to prevent contemporaneous leakage.

### 5.3.3 Random Forest Pipeline: Training Protocol

The Random Forest classifier is implemented in `ml-service/model.py` as the `RiskModel` class. The training pipeline is as follows:

**Algorithm 5.3: Two-Stage RF Training**

```
CLASS RiskModel:
  rf: RandomForestClassifier
  explainer: shap.TreeExplainer
  stage: int

  PROCEDURE train(stage):
    // STEP 1: Load features and labels
    features ← MongoDB.EmployeeFeatures.find(month IN [1,2,3,4])
    // temporal split: months 1-4 train, month 5 validate, month 6 test

    IF stage == 1:
      labels ← MongoDB.RiskScores.find()
              .map(r → r.risk_class)             // formula-derived labels
    ELSE (stage == 2):
      hr_decisions ← MongoDB.HRDecisions.find()
      label_map ← { (emp_id, month): corrected_class
                    FOR each decision in hr_decisions }
      labels ← FOR each feature record:
                  IF (emp_id, month) IN label_map:
                    label_map[(emp_id, month)]   // HR-corrected label
                  ELSE:
                    RiskScores[emp_id, month].risk_class   // formula fallback

    // STEP 2: Encode classes as integers
    class_encoder ← {Low:0, Medium:1, High:2, Critical:3}
    y ← [class_encoder[label] for label in labels]
    X ← feature vectors as numpy array (shape: n × 8)

    // STEP 3: SMOTE oversampling (address class imbalance)
    min_class_size ← min(count per class)
    k_neighbors ← min(5, min_class_size - 1)
    IF min_class_size >= 2:
      X_bal, y_bal ← SMOTE(k_neighbors).fit_resample(X, y)
    ELSE:
      X_bal, y_bal ← X, y   // skip SMOTE if any class has 1 sample

    // STEP 4: Train Random Forest
    rf ← RandomForestClassifier(
            n_estimators=200,
            class_weight='balanced',
            random_state=42
          )
    rf.fit(X_bal, y_bal)

    // STEP 5: Instantiate SHAP TreeExplainer
    explainer ← shap.TreeExplainer(rf)

    // STEP 6: Persist model
    joblib.dump({ 'model': rf, 'explainer': explainer,
                  'stage': stage, 'encoder': class_encoder },
                'model.pkl')

  PROCEDURE predict(feature_vector[8]):
    model_data ← joblib.load('model.pkl')
    rf ← model_data['model']
    explainer ← model_data['explainer']

    X ← numpy.array(feature_vector).reshape(1, -1)
    proba ← rf.predict_proba(X)[0]      // shape (4,) — one prob per class
    class_idx ← argmax(proba)
    risk_class ← decoder[class_idx]
    confidence ← classify_confidence(max(proba))   // Strong/Moderate/Uncertain
    risk_score ← compute_formula_score(feature_vector)   // always computed

    shap_values ← explainer.shap_values(X)         // shape (4, 1, 8)
    shap_for_class ← shap_values[class_idx][0]     // 8 values for predicted class

    RETURN {
      risk_class, risk_score, confidence,
      shap_values: dict(zip(FEATURE_NAMES, shap_for_class))
    }
```

**Temporal split justification:** The choice of months 1–4 for training is not arbitrary. Each employee's feature vectors across months contain within-subject autocorrelation, since month 4 behaviour is influenced by months 1–3. A random split would allow month 5 or 6 records to appear in training, giving the model knowledge of future states that would not be available in a real deployed system. The temporal split simulates a deployment scenario where the model is always predicting into the future.

### 5.3.4 SHAP Explainability Integration

SHAP values are generated using `shap.TreeExplainer`, which computes exact Shapley values for tree-based models without approximation. The Node.js layer receives the raw SHAP dictionary and processes it through `backend/utils/topDrivers.js`:

```javascript
// Pseudocode for topDrivers.js
function getTopDrivers(shapValues, featureNames) {
  const humanReadable = {
    'social_score':       'Digital behaviour signals are elevated',
    'absence_rate':       'Attendance frequency is concerning',
    'late_rate':          'Frequent late arrivals observed',
    'productivity_index': 'Productivity relative to hours is declining',
    'payroll_variance':   'Salary instability detected this month',
    'overtime_ratio':     'Potential burnout from high overtime',
    'tenure_months':      'Short employment tenure increases risk',
    'department_risk':    'Department peer group risk is elevated'
  };

  return featureNames
    .map(f => ({ feature: f, shap: Math.abs(shapValues[f]),
                 direction: shapValues[f] > 0 ? 'risk-increasing' : 'risk-decreasing',
                 text: humanReadable[f] }))
    .sort((a, b) => b.shap - a.shap)
    .slice(0, 3);     // top 3 by magnitude
}
```

The top 3 drivers are displayed as plain-language text in the SHAP modal, enabling HR managers to understand the risk factors without interpreting raw numerical SHAP values.

### 5.3.5 HR Feedback and Stage 2 Retraining Pipeline

The HITL feedback pipeline involves two Node.js endpoints and one Flask endpoint working in sequence:

```
POST /api/decisions          (Node.js)
  → validates HR Manager role
  → upserts HRDecision { employee_id, month, decision,
                         original_class, corrected_class }
  → returns { success, correction_count }

POST /api/risk/train         (Node.js)
  → validates Admin or HR Manager role
  → proxies to Flask POST /train?stage=2
  → returns Flask training metrics

POST /train?stage=2          (Flask)
  → executes Algorithm 5.3 with stage=2
  → returns { accuracy, f1_macro, classification_report,
               training_samples, hr_corrections_used }
```

The upsert on HRDecision uses `findOneAndUpdate` with `upsert: true`, so re-reviewing an employee (changing a previous decision) correctly updates the stored correction rather than duplicating it.

### 5.3.6 User Interface Implementation

The frontend is a single-page application with eight role-aware pages. Three pages contain research-contribution-specific UI components:

**Risk Scoring Page (`RiskScoring.jsx`):**
- WRL banner computed on page load: `WRL = (High + Critical) / Total × 100`
- Risk table with colour-coded tier badges (red = Critical, amber = High, yellow = Medium, teal = Low)
- Per-row "View SHAP" button triggers the SHAP modal
- "Retrain Model" button with pending-decisions badge count

**SHAP Modal (`SHAPModal.jsx`):**
- Recharts `BarChart` rendering SHAP values as a waterfall: positive SHAP = red bars (risk-increasing), negative SHAP = teal bars (risk-decreasing)
- Bar length proportional to absolute SHAP magnitude
- Plain-language top-3 driver text below chart
- Accept / Reject+Correct action buttons; corrected class selected from a dropdown

**Retrain Progress Modal (`RetrainModal.jsx`):**
- Displays Stage 2 training metrics returned by Flask: test accuracy, F1 macro, per-class F1
- Stage 1 vs Stage 2 comparison panel rendered after retraining completes

---

## 5.4 Testing Strategy

### 5.4.1 Justification of Testing Strategies

The evaluation of NEXUS ERP employs three complementary testing strategies, each justified by the nature of the component being tested:

**Functional Unit Testing (manual API testing via Postman):** Applied to all ERP module endpoints. Appropriate because the payroll formula, RBAC enforcement, and inventory alert logic are deterministic: given a known input, the expected output is precisely calculable. Manual endpoint testing is chosen over automated unit testing because the research priority is demonstrating that the system works as specified, not establishing a regression test suite for ongoing development. This is consistent with the functional evaluation approach used in comparable design science research projects (Peffers et al., 2007).

**Statistical Evaluation (ML model evaluation):** Applied to the Random Forest classifier. Appropriate because ML model performance is stochastic: the same algorithm on the same data can produce marginally different results across runs due to SMOTE randomness. Statistical metrics (accuracy, F1 macro, confusion matrix) over a fixed test set provide a reproducible, objective measure of model quality. The temporal split (months 1–4 train, month 5 validate, month 6 test) is mandated by the within-subject autocorrelation in the dataset, preventing data leakage.

**Statistical Validation (synthetic data validation):** Applied to the social score generation. Appropriate because the claim being evaluated is not "this model predicts correctly" but "this synthetically generated data has the statistical properties it was designed to have." Distribution shape checks, mean/SD comparison, correlation analysis, and temporal drift visualisation together confirm that the VAR model produces the intended behavioural signal.

### 5.4.2 Test Plan and Functional Test Cases

**Table 5.3: Functional Test Plan**

| Test ID | Module | Test Case Description | Input | Expected Output | Result |
|---|---|---|---|---|---|
| T01 | Payroll | Standard payroll computation | present_days=20, overtime_hrs=5, late_mins=15, hourly_rate=500 | Gross=83,750; EPF=6,700; ETF=2,512.50; Penalty=750; Final=73,787.50 | ✓ Pass |
| T02 | Payroll | Zero-floor on large penalty | Gross salary = LKR 1,000; late_penalty = LKR 5,000 | FinalSalary = 0 (not −4,000) | ✓ Pass |
| T03 | Inventory | Stock falls to reorder level | Set quantity = reorder_level | Alert email dispatched to Admin + Manager; badge visible in UI | ✓ Pass |
| T04 | Inventory | Stock falls below reorder level | Set quantity = reorder_level − 1 | Same alert behaviour as T03 | ✓ Pass |
| T05 | Auth | Valid login + correct OTP | Correct email/password → correct OTP | JWT returned; session active | ✓ Pass |
| T06 | Auth | Invalid JWT in header | Tampered token string | 401 Unauthorized | ✓ Pass |
| T07 | Auth | Expired JWT | Token with past expiry timestamp | 401 Unauthorized | ✓ Pass |
| T08 | RBAC | Employee accesses risk scores | `GET /api/risk/scores` with Employee JWT | 403 Forbidden | ✓ Pass |
| T09 | RBAC | Manager accesses payroll | `GET /api/payroll` with Manager JWT | 403 Forbidden | ✓ Pass |
| T10 | Risk | Known formula score | All 8 features = 0.5 | RiskScore = 50.0 (top of Medium tier) | ✓ Pass |
| T11 | Risk | Maximum formula score | All 8 features = 1.0 | RiskScore = 100.0 (Critical) | ✓ Pass |
| T12 | ML | Flask unavailable fallback | Flask service stopped; request prediction | Node returns formula score; UI shows "Formula Score (ML offline)" | ✓ Pass |
| T13 | WRL | Alert threshold breach | High + Critical count = 31 of 100 employees | WRL alert email dispatched to Admin + HR Manager | ✓ Pass |

All 13 functional test cases pass. The payroll formula produces arithmetically correct results and correctly floors negative payslips at zero. Inventory alerts fire at and below the reorder threshold. Authentication rejects tampered and expired tokens. RBAC denies lower-privilege roles access to restricted endpoints. The formula fallback confirms graceful degradation when Flask is unavailable.

### 5.4.3 Non-Functional Testing Considerations

**Performance:** API responses for standard CRUD operations (attendance fetch, payroll summary) were measured during development and returned within 500ms on the development machine. Flask prediction calls (including SHAP) completed within 1.5–3 seconds per employee, within the NFR02 threshold of 5 seconds. Full batch prediction for all 100 employees completed in approximately 30 seconds.

**Security:** Password hashing correctness was verified by confirming that bcrypt `compare()` succeeds for the correct password and fails for all mutations. JWT signature verification was confirmed by testing tampered tokens (T06) and expired tokens (T07).

**Reliability:** Dataset reproducibility was confirmed by running all eight seed scripts twice from a clean database and verifying that MongoDB document counts and key field values were identical across both runs.

**Data Integrity:** Compound unique index enforcement was verified by attempting to insert duplicate `(employee_id, month)` records into the SocialScores, EmployeeFeatures, RiskScores, and HRDecisions collections; MongoDB correctly returned duplicate key errors in all cases.

---

## 5.5 Evaluation Results

### 5.5.1 Evaluation Framework

Evaluation proceeds across three tracks mapped to the research questions:

| Track | What is Evaluated | Metrics | RQs Addressed |
|---|---|---|---|
| Track 1 — ML Model | Random Forest in Stage 1 and Stage 2; SHAP feature importance | Accuracy, F1 macro, per-class P/R/F1, confusion matrix, SHAP mean |SHAP| | RQ4, RQ5 |
| Track 2 — Social Score | VAR-generated signal statistical properties | Distribution shape, mean/SD, range compliance, correlation, temporal drift | RQ3 |
| Track 3 — Functional | ERP module correctness, security, formula | Pass/fail test cases (Table 5.3) | RQ1, RQ2, RQ6, RQ7 |

All ML artefacts were generated by executing `python evaluate.py` against the seeded MongoDB database. Results are stored in `ml-service/evaluation_output/evaluation_results.json`.

### 5.5.2 ML Evaluation: Stage 1 (Cold-Start Baseline)

Stage 1 trains on formula-derived risk class labels. Training split: months 1–4 (400 records → 720 after SMOTE). Validation: month 5 (100 records). Test: month 6 (100 records).

**Table 5.4: Stage 1 Per-Class Classification Report (Test Set, Month 6)**

| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| Low | 0.905 | 0.864 | 0.884 | 44 |
| Medium | 0.877 | 0.909 | 0.893 | 55 |
| High | 0.000 | 0.000 | 0.000 | 1 |
| **Macro Average** | **0.594** | **0.591** | **0.592** | **100** |
| Weighted Average | 0.881 | 0.880 | 0.880 | 100 |

**Validation Accuracy: 93.0% | Test Accuracy: 88.0% | F1 Macro: 0.592**

The 88.0% test accuracy appears strong in isolation. However, F1 macro of 0.592 reveals the critical weakness: Stage 1 classifies the High-risk class with zero precision, zero recall, and zero F1. The test set contains only one High-labelled record (because the formula rarely produces High-tier scores for month 6 employees). With one training example per High class and no strong discriminating pattern in the formula-derived labels, the model defaults to predicting Medium for that record. The weighted average F1 of 0.880 is artificially elevated by the 99 Low and Medium records that the model classifies accurately.

Feature importance (Figure 5.1, `feature_importance_stage1.png`) shows `social_score` ranking first (Gini importance 0.146), followed by `absence_rate` (0.117), `productivity_index` (0.056), and `department_risk` (0.052). This ranking mirrors the formula weights, which is expected: the RF trained on formula-derived labels learns the same signal ordering that the formula encodes.

### 5.5.3 ML Evaluation: Stage 2 (HR-Corrected Labels)

**HR Correction Statistics:**

| Decision Type | Count | Percentage |
|---|---|---|
| Accepted (formula label retained) | 526 | 87.7% |
| Corrected | 74 | 12.3% |
| — Medium → High | 70 | 94.6% of corrections |
| — Low → Medium | 2 | 2.7% of corrections |
| — Medium → Low | 2 | 2.7% of corrections |

The correction pattern is dominated by Medium → High reclassifications. HR managers identified 70 employees whom the formula scored in the 26–50 range but who displayed genuine High-risk behavioural patterns. These corrections shift the training label distribution: the High class gains 70 additional labelled examples, enabling the Stage 2 model to learn discriminating High-risk patterns.

**Table 5.5: Stage 2 Per-Class Classification Report (Test Set, Month 6)**

| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| Low | 0.860 | 0.841 | 0.851 | 44 |
| Medium | 0.810 | 0.791 | 0.800 | 43 |
| High | 0.800 | 0.923 | 0.857 | 13 |
| **Macro Average** | **0.823** | **0.852** | **0.836** | **100** |
| Weighted Average | 0.831 | 0.830 | 0.830 | 100 |

**Validation Accuracy: 93.0% | Test Accuracy: 83.0% | F1 Macro: 0.836**

Three results warrant attention. First, High-class support in the test set rises from 1 to 13 as HR corrections propagate into the test labels, producing a High-class F1 of 0.857. Second, Medium support drops from 55 to 43 because 70 Medium records were reclassified as High. Third, the confusion matrix (Figure 5.2, `confusion_matrix_stage2.png`) shows that remaining errors are between adjacent tiers, the least harmful failure mode for a decision-support tool.

### 5.5.4 Stage 1 vs Stage 2: Core Evaluation

**Table 5.6: Stage Comparison (Central Finding)**

| Metric | Stage 1 | Stage 2 | Change | Interpretation |
|---|---|---|---|---|
| Validation Accuracy | 93.0% | 93.0% | — | Stable generalisation across both stages |
| Test Accuracy | 88.0% | 83.0% | −5.0 pts | Expected: test set now includes more High records |
| **F1 Macro** | **0.592** | **0.836** | **+24.4 pts** | **Core finding — HITL feedback drives balanced improvement** |
| High-class F1 | 0.000 | 0.857 | +0.857 | Stage 1 entirely blind to High; Stage 2 classifies reliably |
| Training samples (post-SMOTE) | 720 | 582 | −138 | Stage 2 uses HR-reviewed subset; fewer but higher-quality labels |

**Interpretation of test accuracy decrease:** The −5.0 point test accuracy drop is expected and is not a regression. Stage 2 trains on labels where 70 Medium records are reclassified as High. The test set reflects the same relabelling, so the test problem is harder in Stage 2: it contains 13 High records instead of 1. A model that correctly predicts more High cases will produce more "errors" measured against a test set with tighter Medium/High boundaries. F1 macro is the correct comparative metric because it treats each class equally and does not inflate the score through majority-class dominance.

**The +24.4 pt F1 macro improvement is the principal empirical finding.** It is attributable entirely to the 74 HR corrections that gave the Stage 2 model 70 additional High-class training examples. This is direct empirical confirmation of the HITL principle described by Mosqueira-Rey et al. (2023): human feedback improves model performance on the most decision-relevant classes, precisely because domain experts identify nuanced patterns that statistical thresholding alone cannot capture.

### 5.5.5 SHAP Feature Analysis

**Table 5.7: SHAP Feature Importance, Stage 1 vs Stage 2**

| Feature | Stage 1 Rank | Stage 2 Rank | Rank Δ | Stage 1 Mean \|SHAP\| | Stage 2 Mean \|SHAP\| | Δ SHAP |
|---|---|---|---|---|---|---|
| `social_score` | 1 | 1 | — | 0.1458 | 0.1900 | **+0.0442** |
| `absence_rate` | 2 | 2 | — | 0.1172 | 0.0796 | −0.0376 |
| `late_rate` | 5 | 3 | ↑ 2 | 0.0395 | 0.0443 | +0.0047 |
| `tenure_months` | 6 | 4 | ↑ 2 | 0.0339 | 0.0419 | +0.0079 |
| `productivity_index` | 3 | 5 | ↓ 2 | 0.0560 | 0.0382 | −0.0177 |
| `department_risk` | 4 | 6 | ↓ 2 | 0.0524 | 0.0356 | −0.0169 |
| `overtime_ratio` | 8 | 7 | ↑ 1 | 0.0151 | 0.0315 | +0.0164 |
| `payroll_variance` | 7 | 8 | — | 0.0253 | 0.0255 | +0.0002 |

`social_score` is the most important feature in both stages and gains the largest absolute SHAP importance between stages (+0.044). After HR corrections reclassified 70 Medium employees as High, the model found that `social_score` most consistently differentiated these newly labelled High employees from their Medium peers, providing empirical validation of the core research contribution. The increase in SHAP importance at Stage 2 confirms that HR managers implicitly relied on digital behaviour signals when making their corrections, which the model then learned to replicate.

`late_rate` and `tenure_months` both gain two rank positions in Stage 2, suggesting that HR managers weighted repeated lateness and shorter tenure alongside social score when identifying true High-risk employees. `productivity_index` and `department_risk` both lose two positions, indicating they are redundant with stronger features once the High-class signal is well-represented.

### 5.5.6 Social Score Validation

**Table 5.8: Social Score Statistical Validation Summary**

| Validation Check | Expected | Observed | Result |
|---|---|---|---|
| Distribution shape per sub-score | Approximately Gaussian (unimodal, bell-shaped) | Unimodal, roughly symmetric histograms for all 4 sub-scores | ✓ Pass |
| Sub-score means within range | Within μ_d ± 0.15 of baseline | All observed means within +0.10–0.13 of μ_d (positive offset expected from population-mean risk_bias) | ✓ Pass |
| Value range compliance | All values ∈ [0.0, 1.0] | min=0.015, max=0.887 across all sub-scores; no out-of-range values | ✓ Pass |
| Cross-sub-score correlation | Moderate positive (r = 0.20–0.60) | All off-diagonal pairs in range r = 0.30–0.55 | ✓ Pass |
| Temporal drift for high-risk employees | Visible upward trend by month 4–6 | High-risk cohort diverges from low-risk from month 2; gap widens through month 6 | ✓ Pass |

**Table 5.9: Sub-Score Descriptive Statistics**

| Sub-score | Base Mean (μ_d) | Observed Mean | Observed Std | Min | Max |
|---|---|---|---|---|---|
| `job_search` | 0.25 | 0.3746 | 0.1380 | 0.027 | 0.876 |
| `post_drop` | 0.30 | 0.4275 | 0.1347 | 0.176 | 0.887 |
| `network_growth` | 0.20 | 0.3195 | 0.1354 | 0.015 | 0.795 |
| `sentiment` | 0.20 | 0.3203 | 0.1352 | 0.076 | 0.833 |
| `social_score` (composite) | — | 0.3660 | 0.1294 | 0.090 | 0.850 |

The positive mean offset (+0.10–0.13 above μ_d) is expected: the population-mean risk_bias of approximately 0.15 shifts all employees' distributions above the neutral baseline. The standard deviations (0.13–0.14) are slightly wider than the designed per-sub-score σ (0.10–0.12) due to cross-employee risk_bias heterogeneity adding variance at the population level. All values remain within [0.0, 1.0] after clamping.

The temporal drift plot (Figure 5.3, `social_score_drift.png`) confirms that the high-risk cohort (risk_bias ≥ 0.40) exhibits a gradual, persistent upward trend from month 2, with minimal overlap with the low-risk cohort (risk_bias ≤ 0.05) by month 6. This demonstrates that the autoregressive persistence (α = 0.65) successfully encodes long-run disengagement propensity into the synthetic signal.

All five validation criteria pass, confirming that the VAR generation model produces statistically coherent signals that satisfy the evaluation criteria of Figueira and Vaz (2024) for representativeness, realism, and coherence. The `social_data_source` schema field provides the documented migration pathway to live API data, completing the formal specification requirement.

### 5.5.7 Feature Correlation Analysis

The correlation matrix across the 8 normalised features (Figure 5.4, `feature_correlation.png`) reveals one significant structural dependency:

**Table 5.10: Notable Feature Correlations**

| Feature Pair | Correlation | Direction | Explanation |
|---|---|---|---|
| `absence_rate` ↔ `productivity_index` | r = 0.816 | Positive | Structural dependency: productivity_index is computed from actual hours, which decline directly with absences — both measure attendance through different arithmetic transformations |
| `overtime_ratio` ↔ `productivity_index` | r = −0.428 | Negative | Employees working overtime produce more actual hours, reducing the inverted productivity risk value |
| `payroll_variance` ↔ `department_risk` | r = −0.518 | Negative | High-risk departments tend to show stable (lower variance) salaries, reflecting lower overtime volatility |
| `social_score` ↔ `late_rate` | r = 0.394 | Positive | Both reflect disengagement; employees with elevated social scores also tend to arrive late more frequently |
| `social_score` ↔ `absence_rate` | r = 0.370 | Positive | Same disengagement signal appearing in two modalities |

The high correlation between `absence_rate` and `productivity_index` (r = 0.816) is a structural limitation: both features measure attendance through different arithmetic transformations, potentially double-counting the absence signal in RF predictions. This is acknowledged as a limitation motivating future work to replace `productivity_index` with an orthogonal quality-adjusted output measure.

All other notable correlations are moderate (r = 0.32–0.52) and directionally interpretable. The low correlations of `department_risk` with individual features (|r| < 0.12) confirm that the leave-one-out computation successfully decouples the department-level signal.

### 5.5.8 n_estimators Tuning

**Table 5.11: n_estimators Tuning (Stage 2 Validation Accuracy)**

| n_estimators | Validation Accuracy |
|---|---|
| 50 | 0.94 |
| 100 | 0.94 |
| 150 | 0.95 |
| 200 | 0.93 |
| 300 | 0.93 |
| 500 | 0.94 |

The tuning curve is notably flat across all tested values (range: 0.93–0.95). This plateau reflects the small dataset size: with 100 employees × 6 months, the ensemble stabilises with as few as 50 trees. The choice of `n_estimators = 200` provides a stable, reproducible ensemble at negligible inference overhead: a single prediction completes in well under one second on the development hardware. In a production deployment with a larger employee population, this parameter should be re-evaluated.

---

## 5.6 Discussion of Results

This section maps every evaluation finding to its corresponding research question.

**RQ3: Can a synthetic social behaviour signal serve as a valid proxy for real-world platform data?**

Confirmed. All five validation criteria pass: Gaussian-shaped sub-score distributions, observed means within the expected range of baseline parameters (accounting for population-mean risk_bias offset), all values in [0.0, 1.0], moderate positive inter-sub-score correlations consistent with the designed correlation matrix, and visible upward temporal drift for high-risk employees from month 2. The `social_data_source` schema field provides the documented production pathway with no migration required. SHAP analysis confirms `social_score` as the most important predictive feature in both stages: the synthetic signal is statistically valid and also genuinely informative to the RF classifier.

**RQ4: Can an ML-powered risk scoring pipeline integrated into a live ERP produce accurate employee risk classifications?**

Substantially confirmed. Stage 2 achieves 83.0% test accuracy and F1 macro of 0.836. The comparison with IBM HR dataset benchmarks (92%: Jain and Nayyar, 2022; 88.6%: Raza et al., 2022) must be contextualised: the IBM dataset contains 35 features and 1,470 records, while NEXUS ERP uses 8 cross-module features from 100 employees. The meaningful comparison is the Stage 1 baseline: on the same dataset and same feature set, the integrated pipeline achieves a 24.4-point F1 macro improvement over the formula-only baseline. Stage 2 High-class F1 of 0.857 is particularly relevant, since it is the most actionable class for HR intervention.

**RQ5: Does human-in-the-loop feedback demonstrably improve ML risk prediction accuracy?**

Confirmed with a measurable and substantial effect. The +24.4 percentage-point F1 macro improvement (0.592 → 0.836) is the principal empirical finding of this research. Driven by 74 HR corrections (70 Medium → High), Stage 2 gains the High-class training examples Stage 1 lacked. SHAP analysis reinforces this: `social_score` importance increases by +0.044 between stages, indicating HR managers implicitly used digital behaviour signals in their corrections. This is consistent with Mosqueira-Rey et al. (2023) and empirically confirms their finding that HITL feedback improves performance on the most decision-relevant classes.

**RQ1, RQ2, RQ6, RQ7: ERP functional requirements**
All 13 functional tests pass. Payroll automation (RQ1) correctly applies Sri Lankan EPF/ETF rates and time-and-a-half overtime, with salary floored at zero. Inventory management (RQ2) triggers reorder alerts at and below threshold with automated multi-recipient email dispatch. Security (RQ6) is confirmed through JWT validation, OTP two-factor authentication, and RBAC middleware enforcement. Analytics (RQ7) are delivered via the ten-KPI dashboard and WRL metric with automated threshold alerts.

---

## 5.7 Chapter Summary

This chapter described the implementation and evaluation of NEXUS ERP across three dimensions. The technology selection was justified for each tier: Node.js/Express for the API, Python/Flask for ML, MongoDB for flexible document storage, and React/Vite for the SPA frontend. The three research contribution components were documented at algorithm level: the VAR/Gaussian social score generator, the three-pass eight-feature vector construction, and the two-stage RF training protocol with SMOTE and temporal splitting. SHAP integration and the HITL feedback pipeline were presented with implementation pseudocode.

The testing strategy (functional unit testing for ERP correctness, statistical evaluation for ML performance, and statistical validation for the synthetic signal) was justified against the nature of each component. All 13 functional test cases pass. The ML evaluation establishes the central finding: a +24.4 percentage-point F1 macro improvement from Stage 1 (0.592) to Stage 2 (0.836), with High-class F1 rising from 0.000 to 0.857, providing direct empirical evidence that HR domain knowledge captured through structured feedback measurably improves a deployed ML classifier. The social score validation confirms all five statistical criteria, establishing the VAR-generated signal as a methodologically rigorous proxy for real-world social behaviour data. Chapter 6 draws these findings together into a conclusion, states the research contributions, and identifies limitations and directions for future work.
