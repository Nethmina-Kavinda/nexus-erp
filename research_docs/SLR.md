Index: 28271
Name: Bandara NK

# Chapter 2: Literature Review

---

## 2.1 Chapter Overview

This chapter presents a Systematic Literature Review (SLR) examining existing research across the six thematic domains that underpin the design and development of NEXUS ERP, an integrated Enterprise Resource Planning portal with machine-learning-powered employee risk scoring using synthetic social behaviour signals. The review critically examines current knowledge, establishes the theoretical foundation for the proposed system, and identifies the specific research gaps that NEXUS ERP addresses.

The chapter is structured in five main sections, following the template prescribed for MIS/CS/SE research at this institution. Section 2.3 describes the systematic search methodology (PRISMA-guided). Section 2.4 provides a **Domain Overview** of ERP systems and the SME analytics context. Section 2.5 presents a **comparative assessment of existing systems, frameworks, and designs** across the three operationally relevant themes: ERP systems, ML attrition prediction models, and social media HR signal frameworks. Section 2.6 provides a **technological analysis** covering algorithmic approaches, synthetic data design methods, and explainable AI/HITL workflow models. Section 2.8 provides the **Reflection**, which synthesises the findings into a formalised research gap justification. A detailed comparison table (Section 2.7) maps all 25 reviewed papers against the research questions.

The six themes are: (1) ERP systems for SMEs, (2) employee attrition prediction using ML, (3) social media signals in HR analytics, (4) synthetic data generation and validation, (5) explainable AI and human-in-the-loop ML, and (6) enterprise security. These themes were selected to align directly with the seven research sub-questions defined in Chapter 1, ensuring that every component of NEXUS ERP is grounded in prior work. A total of 25 peer-reviewed papers, journal articles, conference proceedings, and seminal texts were identified and analysed through a PRISMA-guided search process.

---

## 2.2 Conceptual Map of the Literature

The following map illustrates how the six reviewed themes relate to each other, to the research questions, and to the three novelty contributions of NEXUS ERP. Reading the map from left to right traces the journey from existing knowledge gaps to the proposed system design.

```
EXISTING LITERATURE THEMES             RESEARCH QUESTIONS      NEXUS ERP CONTRIBUTION
───────────────────────────────        ──────────────────      ──────────────────────

Theme 1: ERP Systems for SMEs   ──────▶ RQ1, RQ2, RQ7  ──────▶ Payroll + Inventory
  (Domain Overview)                                              Automation (ERP Core)
  Davenport, Katuu,                                              [O5, O8]
  Albarghouthi, Chofreh
                                                                        │
                                                                        │
Theme 2: ML Attrition Prediction  ────▶ RQ4            ──────▶ Random Forest         ◀──┐
  (Existing Systems +                                            Risk Classifier           │
   Algorithmic Analysis)                                         [O7]                      │
  Fallucchi, Jain & Nayyar,                                                               │
  Yadav, Raza, Osman                                                    │                  │
                                                                        │                  │
Theme 3: Social Media HR Signals  ────▶ RQ3            ──────▶ Synthetic social_score  │
  (Existing Systems)                                             (Gaussian VAR model)    │
  Roth, Van Iddekinge,                                           [O2, O6]                │
  De Jesus, Gupta                                                       │                  │
                                                                        │                  │
Theme 4: Synthetic Data           ────▶ RQ3            ──────▶ Statistical             │
  Generation (Tech Analysis)                                     Validation              │
  Figueira, Gonzales, Dahmen                                     [O4, O10]               │
                                                                        │                  │
                                                                        ▼                  │
Theme 5: XAI + HITL ML            ────▶ RQ4, RQ5       ──────▶ SHAP Explainability      │
  (Workflow Analysis)                                            + HR Feedback Loop       │
  Lundberg, Adadi, Mosqueira-Rey                                 Stage 2 Retraining   ───┘
                                                                 [O7, O9]
                                                                        │
Theme 6: Enterprise Security      ────▶ RQ6            ──────▶ JWT + OTP + RBAC
  (Framework Analysis)                                           [O5]
  Ferraiolo, Ahmed
```

The map reveals the core architectural logic of NEXUS ERP: Themes 1–3 identify the three silos that the system bridges (ERP, ML, social signals), while Themes 4–6 provide the technical foundations for how each bridge is built (synthetic data methodology, explainability/HITL, security). All six themes converge into a single integrated system rather than remaining parallel isolated contributions.

---

## 2.3 Search Methodology

### 2.3.1 Databases and Sources

The literature search was conducted across four major academic databases:

1. **Google Scholar**: broad coverage of multidisciplinary research
2. **IEEE Xplore**: primary source for computing, engineering, and AI research
3. **ACM Digital Library**: computing and information systems research
4. **Springer Link / Elsevier ScienceDirect**: journal articles and conference proceedings

Additional references were identified through backward citation tracking from key papers.

### 2.3.2 Search Keywords

**Table 2.1: Search Keywords by Theme**

| Theme | Keywords |
|---|---|
| ERP for SMEs | "ERP system" AND "SME"; "web-based ERP"; "cloud ERP small enterprise"; "open source ERP" |
| ML Attrition Prediction | "employee attrition prediction" AND "machine learning"; "Random Forest employee turnover"; "ensemble methods HR analytics" |
| Social Media Signals | "social media" AND "employee turnover"; "LinkedIn turnover prediction"; "social behaviour signals HR" |
| Synthetic Data | "synthetic data generation" AND "machine learning"; "Gaussian data simulation"; "synthetic HR data" |
| Explainable AI / HITL | "SHAP explainable AI"; "human-in-the-loop machine learning"; "explainable AI human resources" |
| Enterprise Security | "JWT authentication web application"; "role-based access control ERP" |

### 2.3.3 Inclusion and Exclusion Criteria

**Table 2.2: Inclusion and Exclusion Criteria**

| Criterion | Include | Exclude |
|---|---|---|
| Publication year | 2015–2026 (exceptions for seminal works) | Before 2015 unless foundational |
| Publication type | Peer-reviewed journals, conference papers, books | Blog posts, white papers, vendor documentation |
| Language | English | Non-English |
| Relevance | Directly addresses at least one research question | Tangentially related with no clear RQ connection |
| Quality | IEEE, ACM, Springer, Elsevier, SAGE, MDPI, or equivalent | Predatory or non-indexed journals |

### 2.3.4 Selection Process

The PRISMA-guided three-stage process:

1. **Identification:** Initial keyword searches returned approximately 180 results.
2. **Screening:** Titles and abstracts reviewed for relevance; the pool was reduced to 52 candidates.
3. **Eligibility:** Full texts examined for quality, relevance, and contribution, leaving 25 papers included.

**Figure 2.1: PRISMA Selection Flow**
```
Records identified (n = 168) + Citation tracking (n = 12)
                         │
        Records after duplicates removed (n = 152)
                         │
        Screened by title/abstract (n = 152)
                         │                         │
        Excluded (n = 100)          Potentially relevant (n = 52)
                                                   │
                                    Full-text assessed (n = 52)
                                                   │                  │
                                    Excluded (n = 27)   Included (n = 25)
                                    - Not peer-reviewed (8)
                                    - Insufficient RQ relevance (11)
                                    - Low-quality venue (5)
                                    - Duplicated findings (3)
```

**Table 2.3: Final Paper Distribution by Theme**

| Theme | Papers Included |
|---|---|
| ERP systems for SMEs | 4 |
| Employee attrition prediction using ML | 9 |
| Social media signals in HR analytics | 4 |
| Synthetic data generation | 3 |
| Explainable AI and human-in-the-loop ML | 3 |
| Enterprise security | 2 |
| **Total** | **25** |

### 2.3.5 Limitations of the Search Strategy

Several limitations should be acknowledged. The restriction to English-language publications may exclude relevant research in other languages. Reliance on four databases, while broad, may not capture all grey literature or regional conference proceedings. The inclusion of seminal works published before 2015 (Davenport, 1998; Ferraiolo et al., 2007) introduces a temporal inconsistency, though these works remain foundational and are cited in contemporary literature. Publication bias may favour studies reporting positive ML results, potentially underrepresenting failed or negative approaches.

---

## 2.4 Domain Overview: ERP Systems and the SME Analytics Gap

*This section provides a surface-level but significant contextual overview of the domain, representing approximately 10% of the literature review coverage.*

Enterprise Resource Planning (ERP) systems have become fundamental to organisational operations, integrating business processes such as human resources, payroll, inventory, and finance into unified platforms. Understanding the evolution of ERP systems and their current limitations for SMEs is essential context for the gap that NEXUS ERP addresses.

### 2.4.1 Origins and Evolution

Davenport (1998) provided the seminal definition of ERP systems as integrators of business processes across functional boundaries, identifying the critical trade-off between standardisation and organisational flexibility. The original ERP paradigm focused on large enterprises with on-premise deployments, but deployment models have shifted considerably since then. Katuu (2020) traced the evolution from Material Requirements Planning (MRP) systems through on-premise monolithic platforms to modern cloud-based and AI-enhanced solutions, identifying a clear trend toward integrating predictive analytics and artificial intelligence into next-generation ERP systems. Katuu's review remains descriptive, however: it identifies the trajectory toward AI-enhanced ERP but does not propose or evaluate any concrete ML-integrated implementation.

### 2.4.2 SME Adoption Challenges

The transition to cloud-based ERP has been significant for SMEs. Albarghouthi et al. (2024) found that cloud ERP offers affordability, scalability, and flexibility but identified persistent challenges: limited customisation, data security risks arising from third-party providers, regulatory compliance concerns, and infrastructure dependency. Critically, SMEs have "lesser power to influence and monitor cloud providers' services" compared to large enterprises.

Chofreh et al. (2021) identified high implementation costs, lack of technical expertise, data migration risks, and organisational resistance as key barriers to ERP adoption in SMEs. Both studies highlight the need for affordable, self-contained ERP solutions that lower the entry barrier.

### 2.4.3 The Analytics Gap

A consistent pattern emerges: while the technological trajectory clearly points toward AI-enhanced platforms (Katuu, 2020), the practical reality for SMEs remains constrained by cost and complexity. The existing ERP field is dominated by SAP, Oracle, and Odoo, and it focuses on operational automation: payroll, inventory tracking, and financial reporting. No reviewed ERP system for SMEs integrates machine-learning-powered workforce analytics or employee risk scoring. This gap establishes the domain context for NEXUS ERP: the need for a lightweight, affordable ERP system that bridges operational automation and predictive workforce analytics.

---

## 2.5 Existing Systems, Frameworks, and Designs

*This section provides a comparative assessment of existing systems reviewed across three operationally relevant areas, representing approximately 30% of the literature review coverage. For each area, relevance to the current research problem is justified and limitations are identified.*

### 2.5.1 ERP Systems: Comparative Assessment

The four ERP papers reviewed collectively describe a domain in transition. Davenport (1998) characterises the ERP paradigm as transaction-focused: it records what happened rather than predicting what will happen. Katuu (2020) represents the most optimistic view, pointing to AI-enhanced next-generation ERP, but provides no implementation evidence. Albarghouthi et al. (2024) and Chofreh et al. (2021) represent the practical SME perspective: cloud ERP is accessible but remains constrained in customisation, analytics capability, and cost-effectiveness.

**Suitability for the current problem:** None of the reviewed ERP systems or frameworks are suitable for the specific problem being investigated. The closest system, modern cloud ERP (Albarghouthi et al., 2024), provides operational automation but explicitly lacks ML-based workforce analytics. The research gap is therefore not one of gradual improvement to existing systems but of integration across disconnected paradigms.

**Justification of unsuitability:** SAP and Odoo, the dominant SME ERP platforms, offer analytics add-ons, but these are expensive enterprise-tier features, not integrated components. They operate on structured HR data (salary, job role, tenure) and do not incorporate social behaviour signals or explainable ML predictions. No reviewed ERP system provides an HR feedback loop for ML model improvement.

### 2.5.2 ML-Based Attrition Prediction Models: Comparative Assessment

Nine ML attrition studies were reviewed. A cross-study comparison reveals an important pattern: while reported accuracy figures improve over time (Yadav et al. (2018): 84% → Jain and Nayyar (2022): 92% → Osman (2025): 95%), all models share two critical limitations.

**Limitation 1 (ERP disconnection):** All models operate as standalone analytical tools. They receive pre-processed features as input but are not integrated into operational systems that generate HR data. Fallucchi et al. (2020) explicitly note that "no model could be considered ideal for each business context," and their review of 25 studies found no implementation within a functional enterprise system. The disconnect means that an HR manager using these models must manually export data from their payroll system, run a prediction model in isolation, and manually interpret results, a workflow that is impractical for SME operations.

**Limitation 2 (Feature set constraints):** All reviewed models rely on standard demographic and job satisfaction features (salary, satisfaction level, job role, tenure). No reviewed model incorporates external behavioural signals such as social media activity. Sajjadiani et al. (2019) demonstrated that novel derived features (work experience patterns) improve predictive accuracy, suggesting untapped potential in alternative data sources.

**Relevance to current research:** The ML literature establishes Random Forest as the appropriate algorithm (consistent top performance across Yadav et al., 2018; Fallucchi et al., 2020; Jain and Nayyar, 2022), validates SMOTE oversampling for class imbalance (Raza et al., 2022), and confirms that temporal cross-validation is necessary for time-series HR data. These methodological findings directly inform the NEXUS ERP ML pipeline design. What is absent from all reviewed works, namely integration within a live ERP, social behaviour signals, and HITL retraining, defines the contribution of this research.

### 2.5.3 Social Media Signal Frameworks: Comparative Assessment

Four social media HR papers were reviewed. Roth et al. (2016) established the research framework, identifying that social media behaviour contains constructs relevant to employee assessment but noting that practice had significantly outpaced scientific study. Van Iddekinge et al. (2016) tested the hypothesis empirically and found that subjective recruiter ratings of Facebook profiles were "unrelated to supervisor ratings of job performance, turnover intentions, and actual turnover," a finding that rules out unstructured social media assessment. De Jesus et al. (2018) provided the most operationally relevant work: LinkedIn-derived features (connection count, endorsement activity, recent updates) were used to predict resignation likelihood with meaningful predictive accuracy, confirming that structured social signals do carry predictive value.

**Suitability assessment:** No reviewed social media framework is directly suitable for implementation within an ERP system. The De Jesus et al. (2018) framework is the closest analogue, but its reliance on live LinkedIn API access makes it infeasible in a research context. Van Iddekinge et al.'s (2016) negative finding is significant: it rules out qualitative assessment and validates the need for structured, quantified approaches. Gupta and Sharma (2022) reviewed enterprise social media use in HR analytics but found no formal integration model within ERP operational data pipelines.

**Critical gap identified:** No reviewed framework proposes a formally specified synthetic proxy for social behaviour signals: one that is statistically well-modelled, designed for downstream ML integration, and documented with a clear pathway to live API data when ethical and technical barriers are resolved. This gap is the primary technical contribution of the synthetic `social_score` component of NEXUS ERP.

---

## 2.6 Technological Analysis

*This section provides an in-depth analysis of the technologies and methods applied in the research, representing approximately 60% of the literature review coverage. The analysis is structured into four components: algorithmic, design, workflow, and security.*

### 2.6.1 Algorithmic Analysis: Machine Learning for Employee Attrition Prediction

**Algorithm Selection: Why Random Forest**
Across nine reviewed studies, Random Forest consistently achieves top-tier performance for employee attrition prediction. Yadav et al. (2018) tested Naive Bayes, SVM, and Random Forest on the IBM HR dataset. RF achieved 84%, the highest accuracy of the three, and satisfaction level, salary, and number of projects were identified as critical features. Srivastava and Nair (2018) found both RF and Neural Networks exceeding 85%, with feature selection identified as critical for performance.

Zhao and Hryniewicki (2018) conducted a 10-algorithm comparison and found that ensemble methods (RF, XGBoost) offered superior generalisation on noisy data. Jain and Nayyar (2022) achieved 92% with an ensemble approach but found RF (91%) competitive as a standalone model. Raza et al. (2022) extended this with a stacking model (RF + XGBoost + LR), achieving 88.6%. Osman (2025) achieved 95% with a hybrid multi-algorithm model.

A notable observation: model complexity does not guarantee superior performance. Raza et al.'s stacking model (88.6%) underperformed Jain and Nayyar's simpler ensemble (92%). This suggests preprocessing quality (SMOTE, feature engineering, temporal splitting) matters as much as architectural complexity. For NEXUS ERP, Random Forest was selected as the primary classifier because: (a) it achieves consistently competitive accuracy across all reviewed studies, (b) it supports SHAP TreeExplainer for efficient per-prediction explanation, (c) it handles class imbalance well when combined with SMOTE, and (d) it requires no complex hyperparameter tuning to achieve baseline performance.

**Class Imbalance Handling:**
Zhao and Hryniewicki (2018) identified class imbalance as a persistent challenge: employees who leave are always a minority class. Raza et al. (2022) demonstrated that SMOTE (Synthetic Minority Over-sampling Technique) combined with PCA dimensionality reduction can push F1 scores above 90% on previously imbalanced datasets. NEXUS ERP implements SMOTE pre-training with `k_neighbors` auto-clipped to `min_class_size − 1` to prevent the error that occurs when k exceeds the smallest class size.

**Temporal Cross-Validation:**
The IBM HR dataset used in most reviewed studies is static and cross-sectional; it has no temporal structure. NEXUS ERP's synthetic dataset has an explicit temporal structure (6 months of sequential data per employee), which introduces within-employee autocorrelation. A random train/test split would allow future months to leak into training, artificially inflating accuracy. The temporal split (months 1–4 train, month 5 validate, month 6 test) adopted in this research is not found in any reviewed paper but is methodologically necessary for datasets with this structure.

**Feature Engineering:**
Sajjadiani et al. (2019) demonstrated that derived features from domain-specific data (work history patterns) outperform raw demographic variables. This finding supports the NEXUS ERP approach of constructing an 8-feature cross-module vector (combining attendance, payroll, social, and departmental signals) rather than relying on standard IBM-style demographic features.

### 2.6.2 Design Analysis: Synthetic Data Generation Methods

**Statistical Generation Techniques:**
Figueira and Vaz (2024) conducted a systematic review of synthetic data generation, categorising approaches into statistical methods (Gaussian copulas, Bayesian networks), deep learning methods (GANs, VAEs), and hybrid approaches. For tabular data, the format most relevant to ERP systems, Gaussian copula models were identified as particularly effective because they "model marginal dependencies well" and can generate realistic multi-dimensional data preserving the statistical properties of the original distribution. Their evaluation criteria (representativeness, novelty, realism, diversity, coherence) provide the framework used to validate the NEXUS ERP synthetic social score in Chapter 5.

**Gaussian Generation in Sensitive Domains:**
Gonzales et al. (2023) reviewed synthetic data generation in healthcare, a domain sharing privacy constraints with HR data. Gaussian Mixture Models (GMMs) were identified as the most promising approach for tabular data, and the authors outlined validation protocols: statistical similarity tests, utility metrics (downstream ML task performance), and privacy guarantees. Dahmen and Cook (2019) demonstrated practical Gaussian synthetic data generation via SynSys, a system that validates generated data by comparing statistical properties (mean, variance, distribution shape) against expected distributions.

**Precedent for Synthetic Data in HR Research:**
The IBM HR Analytics dataset, the benchmark used in nine of the reviewed ML studies, is explicitly described by IBM as "fictional" synthetic data. This establishes a clear community precedent: synthetic data is acceptable in HR analytics research provided it is well-modelled and transparently documented. This precedent directly validates the NEXUS ERP synthetic dataset design.

**Design Gap:**
All reviewed synthetic data methods focus on replicating or augmenting existing datasets. No prior work applies Gaussian synthetic generation to create novel behavioural proxy signals for domains where live data collection is infeasible. The NEXUS ERP `social_score` VAR/Gaussian model fills this specific gap by generating synthetic social behaviour signals with a documented production pathway to live API data.

### 2.6.3 Workflow Analysis: Explainable AI and Human-in-the-Loop ML

**SHAP as the Explainability Standard:**
Lundberg and Lee (2017) introduced SHAP (SHapley Additive exPlanations), unifying six existing interpretability methods under the Shapley value framework from cooperative game theory. SHAP provides two kinds of explanation: (a) **local explanations**, which show why the model made this specific prediction for this specific employee, and (b) **global explanations**, which show which features matter most across all predictions. The framework guarantees local accuracy, missingness, and consistency properties. For Random Forest models, SHAP TreeExplainer provides computationally efficient exact Shapley values.

Adadi and Berrada (2018) surveyed the XAI field and identified trust, transparency, and fairness as the primary drivers for adoption in high-stakes domains. In HR contexts, explainability serves four purposes: (1) building HR managers' trust in ML predictions, (2) ensuring compliance with algorithmic transparency requirements, (3) preventing discriminatory outcomes by making feature contributions visible, and (4) enabling informed human decision-making rather than blind automation.

**Human-in-the-Loop Retraining Workflow:**
Mosqueira-Rey et al. (2023) reviewed HITL ML broadly, classifying approaches by human involvement level: active learning (model queries humans), interactive ML (humans guide model iteratively), and machine teaching (humans design training). Their finding that HITL systems "improve model accuracy through iterative human feedback" directly motivates the NEXUS ERP Stage 2 retraining design.

In the NEXUS ERP HITL workflow: the RF model predicts → SHAP explains → HR manager accepts or rejects with correction → corrections accumulate in HRDecisions collection → Stage 2 retraining uses corrected labels as ground truth → improved model serves future predictions. This workflow closes the loop between automated prediction and human domain knowledge, operationalising the HITL framework described by Mosqueira-Rey et al. (2023) in a concrete ERP context.

**Workflow Gap:**
No reviewed system combines prediction, SHAP explainability, and structured HR feedback retraining within an operational ERP environment. The three components exist independently in the literature but have not been integrated into a system where HR managers use them in their daily operational workflow. This integration constitutes the third novelty contribution of NEXUS ERP.

### 2.6.4 Enterprise Security Framework Analysis

**Role-Based Access Control:**
Ferraiolo, Kuhn, and Chandramouli (2007) established the NIST RBAC framework, defining roles, permissions, role hierarchies, and constraints. RBAC is the dominant enterprise access control model, separating permission management from individual users through intermediate role definitions. NEXUS ERP implements a four-role RBAC hierarchy: Admin (full system access), HR Manager (employee data + risk scoring + decisions), Manager (attendance and inventory), Employee (own records only). This structure directly instantiates the NIST RBAC model.

**JWT-Based Authentication:**
Ahmed and Mahmood (2019) proposed a JWT-based authentication scheme for web applications, demonstrating JWT as an efficient mechanism for stateless session management. Their approach uses timestamp-based token regeneration to enhance session security. NEXUS ERP implements JWT with bcrypt password hashing (cost factor 10) and OTP two-factor email verification, a layered security approach that combines authentication (JWT), authorisation (RBAC), and verification (OTP). No novelty is claimed in the security domain; the reviewed works provide a mature foundation of established best practices directly implemented in the system.

---

## 2.7 Comparison Table

Table 2.4 maps all 25 reviewed works to research questions, methods, datasets, key findings, and limitations.

**Table 2.4: Comparison of Reviewed Literature**

| # | Author(s) | Year | Focus Area | Method / Approach | Dataset / Context | Key Findings | RQs Addressed | Key Limitation |
|---|---|---|---|---|---|---|---|---|
| 1 | Albarghouthi et al. | 2024 | Cloud ERP for SMEs | Qualitative | SME practitioners | Cloud ERP offers scalability but limited customisation | RQ7 | No ML or analytics integration |
| 2 | Chofreh et al. | 2021 | ERP adoption barriers | Literature review | SME context | Cost, expertise, and migration are key barriers | RQ7 | No predictive analytics |
| 3 | Davenport | 1998 | ERP integration | Conceptual | Large enterprises | ERP as business process integrator | RQ1, RQ2 | Pre-cloud; no ML capabilities |
| 4 | Katuu | 2020 | ERP evolution | Literature review | Historical | Trend toward AI-enhanced ERP | RQ7 | No implementation or evaluation |
| 5 | Fallucchi et al. | 2020 | Attrition prediction | Ensemble (GNB best) | IBM HR (1,470) | No single model universally optimal | RQ4 | Low recall; no social signals |
| 6 | Jain & Nayyar | 2022 | Attrition prediction | Ensemble (92%) | IBM HR | Ensemble outperforms individual models | RQ4 | IBM dataset only; no ERP integration |
| 7 | Zhao & Hryniewicki | 2018 | Turnover prediction | XGBoost, RF, 10 algos | Multiple datasets | XGBoost generalises on noisy data | RQ4 | Standalone; no deployment |
| 8 | Raza et al. | 2022 | Attrition prediction | Stacking (RF+XGB+LR) | IBM HR | SMOTE+PCA pushes accuracy >90% | RQ4 | No social or behavioural signals |
| 9 | Alao & Adeyemo | 2013 | Attrition analysis | Decision trees | 309 records | ML can classify attrition patterns | RQ4 | Small dataset; single algorithm |
| 10 | Yadav et al. | 2018 | Attrition prediction | NB, SVM, RF (84%) | IBM HR | RF highest accuracy; salary key feature | RQ4 | Standard features only |
| 11 | Srivastava & Nair | 2018 | Attrition prediction | LR, SVM, RF, NN (>85%) | IBM HR | Feature selection critical | RQ4 | Academic only; no deployment |
| 12 | Osman | 2025 | Attrition prediction | Hybrid model (95%) | IBM HR | Hybrid is most effective | RQ4 | Synthetic dataset; no novel features |
| 13 | Sajjadiani et al. | 2019 | Turnover prediction | ML on work histories | 16,071 applicants | Derived features outperform raw variables | RQ4, RQ5 | Pre-hire only |
| 14 | Van Iddekinge et al. | 2016 | SM in HR assessment | Recruiter evaluation | Facebook profiles | Subjective SM ratings unrelated to outcomes | RQ3 | Subjective; not structured |
| 15 | Roth et al. | 2016 | SM research agenda | Research agenda | Literature | Practice outpaces research in SM-HR | RQ3 | Agenda; not empirical |
| 16 | De Jesus et al. | 2018 | LinkedIn prediction | Feature extraction | LinkedIn profiles | LinkedIn data predicts resignation | RQ3 | Privacy/API limitations |
| 17 | Gupta & Sharma | 2022 | Enterprise SM + HR | Literature review | Enterprise SM | Social data increasingly used in HR | RQ3, RQ4 | Review; no implementation |
| 18 | Figueira & Vaz | 2024 | Synthetic data methods | Survey (GANs, Gaussian) | Multi-domain | Gaussian copulas effective for tabular data | RQ3 | General; not HR-specific |
| 19 | Gonzales et al. | 2023 | Synthetic data (health) | GMMs, statistical | Healthcare | GMMs outperform; validation protocols | RQ3 | Healthcare domain only |
| 20 | Dahmen & Cook | 2019 | Synthetic sensor data | Gaussian generation | Sensor data | Statistical validation methodology | RQ3 | Sensor domain; not social behaviour |
| 21 | Lundberg & Lee | 2017 | Model explainability | SHAP (Shapley) | Multiple models | Unified explainability; theoretical guarantees | RQ5 | Computational cost for large models |
| 22 | Adadi & Berrada | 2018 | XAI survey | Survey | Multi-domain | Trust, transparency, fairness drive XAI | RQ5 | No HR-specific implementation |
| 23 | Mosqueira-Rey et al. | 2023 | HITL ML | Survey (active learning) | Multi-domain | HITL improves accuracy via iterative feedback | RQ5 | General; no HR/ERP implementation |
| 24 | Ahmed & Mahmood | 2019 | Web authentication | JWT scheme | Web applications | JWT with timestamp-based regeneration | RQ6 | Single authentication mechanism |
| 25 | Ferraiolo et al. | 2007 | Access control | RBAC model | Enterprise systems | NIST RBAC standard | RQ6 | Pre-dates modern web authentication |

---

## 2.8 Reflection

This section synthesises the findings from all six thematic areas into a formalised justification of the research gap, linking the literature to the specific contributions of NEXUS ERP. The reflection is structured around the three isolated silos identified in the review, followed by the gap summary that defines the research contribution.

### 2.8.1 The Three Isolated Silos

The systematic review of 25 works across six themes reveals a consistent and significant pattern: the three domains that NEXUS ERP aims to integrate, namely ERP operational automation, ML-based attrition prediction, and social behaviour signal analysis, exist in complete isolation in the current literature.

**Silo 1 (ERP Systems Without ML):** The four reviewed ERP works (Davenport, 1998; Katuu, 2020; Albarghouthi et al., 2024; Chofreh et al., 2021) describe systems focused on operational automation. While Katuu (2020) identifies a trajectory toward AI-enhanced ERP, no reviewed system implements ML-based workforce analytics within a functional ERP. Existing platforms (SAP, Odoo) offer analytics modules as expensive enterprise add-ons designed for large organisations, not as affordable integrated components for SMEs.

**Silo 2 (ML Attrition Models Without ERP Integration):** All nine ML attrition studies operate on static, pre-collected datasets, primarily the IBM HR Analytics dataset. None are integrated into operational systems where attendance, payroll, and behavioural data are actively generated. The models receive feature vectors as input but do not participate in data collection or operational workflow; they require manual data export and offline analysis, a workflow impractical for the SME context.

**Silo 3 (Social Media Signals Without Formal Integration):** Research (Van Iddekinge et al., 2016; Roth et al., 2016; De Jesus et al., 2018; Gupta and Sharma, 2022) establishes that social media behaviour contains predictive signals for attrition but does not provide a formal framework for quantifying these signals and integrating them into a risk scoring pipeline. Van Iddekinge et al. (2016) demonstrated that subjective social media assessment is ineffective, which points to the need for structured, quantified approaches instead. No reviewed work proposes a formally documented synthetic proxy for social signals with a schema-level pathway to live API data.

### 2.8.2 The Research Gap and NEXUS ERP's Contribution

By linking the findings from the six thematic areas, three specific gaps are identified that collectively motivate NEXUS ERP:

**Gap 1 (Synthetic Social Behaviour Signal):** No prior work has formally defined a synthetic social behaviour signal using Gaussian sub-score modelling with an explicit, schema-level documented pathway for future live API integration. Synthetic data generation techniques are well-established (Figueira and Vaz, 2024; Gonzales et al., 2023; Dahmen and Cook, 2019) and the IBM HR dataset precedent validates synthetic data in HR research, but these approaches focus on replicating existing data rather than generating novel proxy signals for data sources that are currently infeasible to access directly.

**Gap 2 (ML-Integrated Lightweight ERP):** No reviewed system combines operational ERP data (attendance, payroll) with social behaviour signals into a unified risk scoring pipeline within a lightweight platform accessible to SMEs. ERP systems lack ML capabilities; ML models lack ERP integration. This fragmentation means organisations must either invest in expensive enterprise solutions or operate ML models as disconnected tools.

**Gap 3 (HITL ML Retraining in Operational HR Context):** HITL approaches are individually mature (Mosqueira-Rey et al., 2023) and SHAP provides reliable explainability (Lundberg and Lee, 2017), but their combination within an operational HR system, where HR managers accept or reject ML predictions and accumulated decisions drive model retraining, remains unexplored. This gap represents a missed opportunity to bridge automated prediction and responsible HR decision-making, as emphasised by Adadi and Berrada (2018).

### 2.8.3 Gap Summary Table

**Table 2.5: Gap Analysis: Existing Systems vs. NEXUS ERP**

| Capability | ERP Systems (SAP, Odoo) | ML Attrition Models | Social Media HR Research | NEXUS ERP |
|---|---|---|---|---|
| Payroll automation | Yes | No | No | Yes |
| Inventory management | Yes | No | No | Yes |
| ML-based attrition prediction | No | Yes | No | Yes |
| Social behaviour signals | No | No | Partial (unstructured) | Yes (formal synthetic model) |
| Formal synthetic signal specification | No | No | No | Yes |
| SHAP explainability | No | Rare | No | Yes |
| HR feedback loop for retraining | No | No | No | Yes |
| Integrated in single platform | Yes (operational only) | No (standalone) | No (research only) | Yes |
| Affordable for SMEs | No (expensive) | N/A | N/A | Yes |

---

## 2.9 Chapter Summary

This systematic literature review examined 25 peer-reviewed works across six thematic areas. The key findings from each theme are:

1. **ERP systems for SMEs** are evolving toward AI-enhanced platforms but remain operationally focused. No reviewed SME ERP system integrates ML-based workforce analytics.

2. **ML attrition prediction** achieves strong results (84%–95% accuracy) with ensemble methods and Random Forest consistently performing best. However, all reviewed models operate on static datasets disconnected from operational ERP systems.

3. **Social media signals** contain meaningful predictive information for employee behaviour, but subjective assessment is ineffective, live API integration faces practical barriers, and no formal framework exists for quantifying these signals within enterprise operational systems.

4. **Synthetic data generation** using Gaussian-based methods is well-established and validated. The IBM HR Analytics dataset precedent validates synthetic data in HR research. No prior work has formally documented a synthetic social behaviour signal with a production pathway to live API data.

5. **Explainable AI and HITL approaches** are individually mature: SHAP provides per-prediction feature attribution, and HITL systems demonstrably improve accuracy through human feedback. Their integration within an operational HR system within an ERP context, however, remains unexplored.

6. **Enterprise security** patterns (JWT, RBAC, OTP) are well-established and provide the foundational security architecture for NEXUS ERP.

The research gap is clear: no system integrates ERP operational automation, ML risk scoring with social behaviour signals, SHAP explainability, and HR-driven retraining loops in a single lightweight platform for SMEs. This absence establishes the justification for NEXUS ERP. Chapter 3 describes the Design Science Research Methodology adopted to design, develop, and evaluate the system.

---

## References

[1] A. Adadi and M. Berrada, "Peeking Inside the Black-Box: A Survey on Explainable Artificial Intelligence (XAI)," *IEEE Access*, vol. 6, pp. 52138–52160, 2018. doi: 10.1109/ACCESS.2018.2870052.

[2] S. Ahmed and Q. Mahmood, "An Authentication Based Scheme for Applications Using JSON Web Token," in *Proc. 22nd Int. Multitopic Conf. (INMIC)*, IEEE, 2019. doi: 10.1109/INMIC48123.2019.9022766.

[3] D. Alao and A.B. Adeyemo, "Analyzing Employee Attrition Using Decision Tree Algorithms," *Computing, Information Systems, Development Informatics and Allied Research Journal*, vol. 4, no. 1, pp. 17–28, 2013.

[4] M. Albarghouthi, B. Qi, H. Wang, and K. Shang, "Exploring cloud enterprise resource planning and open innovation for small and medium enterprises: Insights from practitioners," *Technological Forecasting and Social Change*, vol. 200, Art. no. 123152, Elsevier, 2024.

[5] A.G. Chofreh, F.A. Goni, J.J. Klemes, M.N. Malik, and H.H. Khan, "Challenges of Cloud-ERP Adoptions in SMEs," *Procedia Computer Science*, vol. 196, pp. 973–981, 2021.

[6] J. Dahmen and D.J. Cook, "SynSys: A Synthetic Data Generation System for Healthcare Applications," *Sensors*, vol. 19, no. 5, Art. no. 1181, 2019. doi: 10.3390/s19051181.

[7] T.H. Davenport, "Putting the Enterprise into the Enterprise System," *Harvard Business Review*, vol. 76, no. 4, pp. 121–131, 1998.

[8] A.C. De Jesus, M.E.G.D. Junior, and W.C. Brandao, "Exploiting LinkedIn to Predict Employee Resignation Likelihood," in *Proc. 33rd Annual ACM Symp. Applied Computing (SAC '18)*, pp. 1212–1219, ACM, 2018. doi: 10.1145/3167132.3167320.

[9] F. Fallucchi, M. Coladangelo, R. Giuliano, and E.W. De Luca, "Predicting Employee Attrition Using Machine Learning Techniques," *Computers*, vol. 9, no. 4, Art. no. 86, 2020. doi: 10.3390/computers9040086.

[10] D.F. Ferraiolo, D.R. Kuhn, and R. Chandramouli, *Role-Based Access Control*, 2nd ed. Norwood, MA: Artech House, 2007.

[11] A. Figueira and B. Vaz, "A Systematic Review of Synthetic Data Generation Techniques Using Generative AI," *Electronics*, vol. 13, no. 17, Art. no. 3509, 2024. doi: 10.3390/electronics13173509.

[12] A. Gonzales, G. Guruswamy, and S.R. Smith, "Synthetic Data in Health Care: A Narrative Review," *PLOS Digital Health*, vol. 2, no. 1, Art. no. e0000082, 2023. doi: 10.1371/journal.pdig.0000082.

[13] S. Gupta and R.R.K. Sharma, "Types of HR Analytics Used for the Prediction of Employee Turnover in Different Strategic Firms with the Use of Enterprise Social Media," in *Proc. 5th European Int. Conf. Industrial Engineering and Operations Management*, Rome, Italy, IEOM Society, 2022.

[14] IBM, "IBM HR Analytics Employee Attrition & Performance," Kaggle, n.d. [Online]. Available: https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset.

[15] R. Jain and A. Nayyar, "Automated Prediction of Employee Attrition Using Ensemble Model Based on Machine Learning Algorithms," *Computational Intelligence and Neuroscience*, vol. 2022, Art. no. 7728363, 2022. doi: 10.1155/2022/7728363.

[16] S. Katuu, "Enterprise Resource Planning: Past, Present, and Future," *New Review of Information Networking*, vol. 25, no. 1, pp. 37–46, 2020. doi: 10.1080/13614576.2020.1742770.

[17] S.M. Lundberg and S.-I. Lee, "A Unified Approach to Interpreting Model Predictions," in *Proc. 31st Int. Conf. Neural Information Processing Systems (NIPS 2017)*, pp. 4768–4777, 2017.

[18] E. Mosqueira-Rey, E. Hernández-Pereira, D. Alonso-Ríos, J. Bobes-Bascarán, and Á. Fernández-Leal, "Human-in-the-loop machine learning: A state of the art," *Artificial Intelligence Review*, vol. 56, pp. 3005–3054, 2023.

[19] A.H. Osman, "Prediction of Employee Attrition Using Different Machine Learning Models," *Applied Sciences*, vol. 15, no. 3, Art. no. 1183, 2025. doi: 10.3390/app15031183.

[20] S. Raza, S. Singh, A. Maheshwari, and K. Jangid, "Machine Learning for Employee Attrition Prediction: An Analysis," *Int. Journal of Advanced Research in Computer Science*, 2022.

[21] P.L. Roth, P. Bobko, C.H. Van Iddekinge, and J.B. Thatcher, "Social Media in Employee-Selection-Related Decisions: A Research Agenda for Uncharted Territory," *Journal of Management*, vol. 42, no. 1, pp. 269–298, 2016.

[22] S. Sajjadiani, A.J. Sojourner, J.R. Kammeyer-Mueller, and E. Mykerezi, "Using Machine Learning to Translate Applicant Work History into Predictors of Performance and Turnover," *Journal of Applied Psychology*, vol. 104, no. 10, pp. 1207–1225, 2019.

[23] S.K. Srivastava and P.K. Nair, "Employee Attrition: An Analytics Approach," *Int. Journal of Recent Technology and Engineering*, vol. 7, pp. 2277–3878, 2018.

[24] C.H. Van Iddekinge, S.E. Lanivich, P.L. Roth, and E. Junco, "Social Media for Selection? Validity and Adverse Impact Potential of a Facebook-Based Assessment," *Journal of Management*, vol. 42, no. 7, pp. 1811–1835, 2016.

[25] R. Yadav, A. Jain, and D. Singh, "Prediction of Employee Attrition Using Machine Learning," *Int. Journal on Recent and Innovation Trends in Computing and Communication*, vol. 6, no. 2, pp. 113–116, 2018.

[26] Y. Zhao and M.K. Hryniewicki, "Employee Turnover Prediction with Machine Learning: A Reliable Approach," in *Proc. Intelligent Systems and Applications*, Springer, Cham, 2019, pp. 737–758.
