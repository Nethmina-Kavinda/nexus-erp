# Chapter 1: Introduction

---

## 1.1 Chapter Overview

This chapter lays the contextual and conceptual foundation for the NEXUS ERP research project. It opens by establishing the problem background: the organisational cost of employee attrition and the limitations of existing ERP and predictive analytics tools for small-to-medium enterprises. The problem is then formally stated at two levels, a general high-level framing and a discipline-specific articulation of the research gap that this work addresses. The primary research question and its supporting sub-questions are defined next, followed by the motivation behind the investigation and a clear statement of the research aim. Research objectives are presented using the standard "To Identify / To Analyse / To Design and Develop / To Evaluate" framework. A rich picture of the proposed system illustrates the key stakeholder interactions and data workflows, and the chapter closes with a summary of hardware and software resource requirements, the project scope boundaries, and an overview of the dissertation structure.

---

## 1.2 Problem Background

Organisations have long recognised that their workforce is both their most valuable and most volatile asset. Employee attrition, meaning voluntary resignation, imposes a documented and substantial cost. Replacing a single employee typically consumes six to nine months of that employee's salary in recruitment advertising, interviewer time, onboarding, and the productivity gap while a successor reaches full competency (Fallucchi et al., 2020). Large enterprises absorb this cost through dedicated HR analytics departments equipped with specialised workforce intelligence platforms. For small-to-medium enterprises (SMEs), no equivalent infrastructure typically exists, so an SME losing three or four key employees in a quarter faces disproportionate operational disruption with no early-warning mechanism to anticipate or mitigate it.

Enterprise Resource Planning (ERP) systems were introduced to address precisely the kind of cross-functional data integration challenge that SMEs face. Davenport (1998) defined the ERP system as a software package that integrates the information flowing through an organisation (finance, operations, human resources, and supply chain) into a single unified system, eliminating redundant data entry and providing a single source of organisational truth. In the three decades since Davenport's foundational paper, ERP adoption has expanded from large multinationals to mid-market and small enterprises, driven by the emergence of cloud-hosted and open-source alternatives to legacy systems such as SAP and Oracle. Contemporary reviews of ERP evolution (Katuu, 2020) identify a clear trend: organisations are no longer satisfied with systems that merely record operational transactions. They now expect their ERP to generate forward-looking insights, predictive analytics that convert historical operational data into actionable intelligence about future risk.

Machine learning applied to employee attrition prediction has been an active research area for over a decade. The IBM HR Analytics dataset, itself a synthetic construct released as a benchmark by IBM researchers, has been used in dozens of peer-reviewed studies; Fallucchi et al. (2020) reviewed 25 such studies and identified Random Forest as the dominant algorithm, achieving accuracies above 84% across multiple experimental configurations. However, all of these studies share a critical architectural limitation: they are standalone predictive models operating on static, pre-collected HR datasets. They are not integrated into the operational systems that generate the HR data in the first place. An attrition model that runs on a data export from a payroll system is fundamentally different from one that runs inside the payroll system, with access to continuously updated attendance, salary, and behavioural signals.

A further gap in the literature concerns social behaviour signals. Research by Roth et al. (2016) and De Jesus, Junior, and Brandao (2018) establishes that an employee's digital behaviour on professional social platforms, specifically LinkedIn job-browsing frequency, posting activity, recruiter connection growth, and content sentiment, changes measurably in the period preceding voluntary attrition. These signals are potentially available through social media APIs but have not been formally integrated into any lightweight SME-targeted ERP system. The methodological and ethical barriers to live API integration (platform approval timelines, OAuth consent workflows, employee privacy) remain significant, and no prior work has proposed a formally documented synthetic proxy designed for zero-friction transition to a live data source when those barriers are resolved.

NEXUS ERP was developed to address these three gaps simultaneously: the absence of integrated predictive analytics in lightweight SME ERP systems, the architectural disconnection between ML attrition models and the operational systems that generate their input data, and the lack of a formally specified and statistically validated synthetic social behaviour signal with a documented production pathway.

---

## 1.3 Problem Statement

### 1.3.1 General Problem

The broader problem addressed by this research is the inability of most small-to-medium enterprises to obtain timely, actionable insight into workforce stability. While large organisations invest in enterprise HR analytics platforms that surface attrition risk signals early enough for management intervention, SMEs operate without this capability. The consequences are reactive rather than proactive: an organisation discovers employee disengagement only when a resignation is submitted, at which point recruitment costs, onboarding burdens, and productivity losses are unavoidable. This information deficit is not caused by a lack of data. SMEs generate plenty of HR data through daily attendance, monthly payroll computation, and routine operational activity, but they lack systems that are simultaneously affordable, operationally integrated, and analytically capable.

### 1.3.2 Specific Problem

Within the information systems and human resources management disciplines, the specific shortcoming is the architectural disconnect between operational ERP systems and machine learning-powered workforce analytics. Existing ERP platforms for SMEs (Odoo, ERPNext, cloud variants of SAP) provide operational automation but do not incorporate predictive workforce risk scoring. Existing ML attrition prediction models (Fallucchi et al., 2020; Jain and Nayyar, 2022; Osman, 2025) operate on static, pre-collected datasets and are not integrated into live operational data pipelines. Beyond this, no published system has formally specified a synthetic social behaviour signal with a structured production pathway to live social media API data, leaving a gap between the theoretical potential of social signals in attrition prediction (Roth et al., 2016; De Jesus et al., 2018) and practical implementation.

The specific research gap being addressed is: **no lightweight, affordable, integrated ERP system exists that simultaneously automates core HR operational workflows and delivers ML-powered, explainable, continuously improving employee attrition risk scoring, incorporating a formally documented social behaviour signal with a documented pathway to live API data.**

---

## 1.4 Research Question

The primary research question guiding this study is:

> **"How can an integrated ERP system be designed to automate payroll processing and inventory management, incorporate synthetic social behaviour signals as a documented proxy for real-world API-sourced data, and generate machine-learning-powered employee risk scores, while ensuring accuracy, scalability, and data security for enterprise use?"**

The following sub-questions decompose the primary question into evaluable components that are addressed across the design, implementation, and evaluation chapters:

| Sub-RQ | Question | Research Weight |
|---|---|---|
| RQ1 | How can attendance data be accurately converted into automated payroll calculations incorporating overtime, allowances, and statutory deductions? | Medium |
| RQ2 | How can inventory stock levels be monitored in real time with automated alert mechanisms based on a reorder-level model? | Low |
| RQ3 | How can a synthetic `social_score` (0.0–1.0) be formally defined, statistically validated, and documented as a proxy for LinkedIn/Facebook API integration? | **High** |
| RQ4 | How can workforce behavioural features drawn from cross-module ERP data be combined into a weighted composite risk score and augmented with a Random Forest ML classifier and SHAP explainability? | **High** |
| RQ5 | How can HR decision feedback be incorporated into a machine learning retraining loop that demonstrably improves risk prediction accuracy over time? | **High** |
| RQ6 | How can secure authentication and role-based session management be enforced across four organisational roles? | Low |
| RQ7 | How effective is the MERN stack combined with a Python Flask ML microservice in delivering a scalable, integrated ERP platform for SMEs? | Medium |

RQ3, RQ4, and RQ5 carry the highest research weight as they correspond directly to the three novelty contributions of this work.

---

## 1.5 Research Motivation

The motivation for undertaking this research arose from three converging observations. First, the real and measurable economic burden of employee attrition on SMEs is disproportionate relative to their operational capacity, particularly in developing economies such as Sri Lanka. Fallucchi et al. (2020) estimate direct replacement costs at six to nine months of an employee's salary. For an SME operating with a small workforce and limited HR infrastructure, losing even two or three key employees in a quarter can threaten operational continuity, yet no affordable, integrated system exists to provide an early warning.

Second, a review of the literature revealed that machine learning for attrition prediction is methodologically mature. Random Forest and ensemble methods consistently achieve accuracy above 84% (Fallucchi et al., 2020; Jain and Nayyar, 2022), but the research community has not connected these models to the operational ERP systems that generate the underlying data. The models sit as analytical islands, disconnected from the systems that could feed them in real time. Closing that loop, by integrating predictive analytics directly into the system that produces attendance and payroll data, was a compelling and tractable research problem.

Third, the theoretical potential of social behaviour signals remained unrealised in any practical ERP system. Professional network activity on platforms such as LinkedIn has been proposed as an early indicator of employee disengagement (Roth et al., 2016; De Jesus et al., 2018), yet the challenge of live API integration in a research context is well-documented, and no prior work had proposed a formally modelled synthetic proxy as a methodologically valid substitute. Designing such a proxy, complete with a schema-level zero-migration pathway to future live data, presented an original contribution addressing the gap between what the literature proposes and what operational HR systems actually implement.

Finally, the responsible AI dimension of the project was a motivating factor: an automated system that classifies employees as "high risk" without HR oversight is ethically inappropriate. The human-in-the-loop design, where HR managers review, accept, and correct every prediction, and where those corrections systematically improve the model, aligns this research with responsible AI practice as described by Mosqueira-Rey et al. (2023) and Adadi and Berrada (2018).

---

## 1.6 Research Aim

The aim of this research is to **design, develop, and evaluate NEXUS ERP**, an integrated enterprise resource planning portal built on the MERN stack (MongoDB, Express.js, React.js, Node.js) and augmented by a Python Flask machine learning microservice. The system is intended to simultaneously automate payroll processing and inventory management for SMEs, incorporate a formally specified and statistically validated synthetic social behaviour signal with a documented production pathway to live API data, and deliver machine-learning-powered employee attrition risk scoring with SHAP explainability and a human-in-the-loop HR feedback retraining loop.

---

## 1.7 Research Objectives

The research objectives are structured across the standard phases of a design science research project: identifying the gap and its information requirements, analysing existing systems and the proposed approach, designing and developing the artefact, and evaluating its performance.

### 1.7.1 To Identify

**O1.** To identify the functional requirements, data integration needs, and analytical capabilities that an SME-targeted ERP system must possess in order to support both operational HR automation and ML-powered employee attrition risk scoring.

**O2.** To identify the behavioural dimensions of professional social media activity (job-search frequency, posting activity drop, recruiter network growth, and content sentiment) that serve as validated predictors of employee attrition risk, and to determine the statistical parameters necessary to model them synthetically using a Gaussian sub-score framework.

### 1.7.2 To Analyse

**O3.** To analyse existing ERP systems, standalone ML attrition prediction models, and social behaviour signal approaches, identifying their individual limitations, the architectural disconnection between them, and the specific gap that NEXUS ERP is designed to address.

**O4.** To analyse the statistical properties of the synthetically generated `social_score` signal in order to confirm that the Gaussian generation model produces coherent, temporally realistic, and statistically valid behavioural data that satisfies established synthetic data evaluation criteria.

### 1.7.3 To Design, Implement, and Develop

**O5.** To design and develop a full-stack MERN ERP system encompassing employee management, automated attendance-to-payroll computation with Sri Lankan statutory deductions (EPF 8% / ETF 3%), dual-tier inventory management with automated reorder alerts, and a JWT/OTP/RBAC security layer supporting four organisational roles.

**O6.** To design and implement a formally specified synthetic `social_score` model using Gaussian sub-score generation across four behavioural dimensions (job search, posting drop, network growth, sentiment), incorporating a `social_data_source` schema field that provides a zero-migration pathway to live LinkedIn/Facebook API data.

**O7.** To develop an eight-feature cross-module risk scoring pipeline that combines a deterministic weighted composite formula with a Python Flask Random Forest classifier augmented by SHAP explainability and a two-stage HR-feedback-driven retraining mechanism.

**O8.** To implement workforce and inventory analytics dashboards providing ten KPI metrics, including a portfolio-level Workforce Risk Level (WRL) metric with automated email alert dispatch when the WRL threshold is exceeded.

### 1.7.4 To Evaluate

**O9.** To evaluate the ML risk scoring pipeline through classification accuracy, per-class precision/recall/F1, F1 macro score, confusion matrix analysis, and SHAP feature importance, comparing Stage 1 (formula-derived labels) against Stage 2 (HR-corrected labels) to quantify the measurable F1 improvement delivered by the human-in-the-loop retraining mechanism.

**O10.** To evaluate the synthetic social score model against its intended statistical properties: Gaussian distribution shape, sub-score mean and standard deviation compliance, value range constraints, cross-sub-score correlation structure, and temporal drift patterns across the six-month synthetic dataset.

---

## 1.8 Rich Picture of the Proposed Solution

The diagram below illustrates the key stakeholders, data flows, and system workflows within NEXUS ERP. It emphasises the integration pathways between the operational ERP modules and the ML risk scoring pipeline, and highlights the three feedback loops that make the system self-improving.

```
╔══════════════════════════════════════════════════════════════════════╗
║                        NEXUS ERP - RICH PICTURE                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  STAKEHOLDERS           OPERATIONAL MODULES          DATA FLOWS       ║
║  ────────────           ──────────────────          ──────────        ║
║                                                                       ║
║  [Employee]  ──────▶  ATTENDANCE MODULE                               ║
║  (clocks in)          Daily check-in/check-out                        ║
║                        Absence & late tracking                        ║
║                               │                                       ║
║                               ▼                                       ║
║                        PAYROLL ENGINE              Attendance         ║
║  [Admin]     ──────▶  Gross → EPF(8%) → ETF(3%)   records ──┐        ║
║  (approves)           Overtime → Late penalty                │        ║
║                        → Net / Final Salary                  │        ║
║                               │                              │        ║
║                               ▼                              │        ║
║                                                              │        ║
║  [Manager]   ──────▶  INVENTORY MODULE                       │        ║
║  (monitors)           Stock tracking (dual-tier)             │        ║
║                        Reorder alert → Email dispatch        │        ║
║                                                              │        ║
╠══════════════════════════════════════════════════════════════╪════════╣
║                                                              │        ║
║               ML RISK SCORING PIPELINE                       │        ║
║               ────────────────────────                       │        ║
║                                                              ▼        ║
║  Synthetic Social Score (Gaussian sub-score model)           │        ║
║  job_search, post_drop, network_growth, sentiment ───────────┤        ║
║                     social_score ∈ [0.0, 1.0]               │        ║
║                               │                              │        ║
║                               ▼                              │        ║
║         8-FEATURE VECTOR (normalised, per employee/month)    │        ║
║         absence_rate, late_rate, overtime_ratio,             │        ║
║         productivity_index, payroll_variance,   ◀───────────┘        ║
║         social_score, tenure_months, dept_risk                        ║
║                               │                                       ║
║                               ▼                                       ║
║         DETERMINISTIC FORMULA SCORE (always available)                ║
║         Weighted composite → Risk Tier                                ║
║                               │                                       ║
║                               ▼                                       ║
║         FLASK ML SERVICE - Random Forest Classifier                   ║
║         + SHAP TreeExplainer                                          ║
║         → Risk Class: Low / Medium / High / Critical                  ║
║         → 8 SHAP values (feature attributions per prediction)         ║
║                               │                                       ║
║                               ▼                                       ║
║  [HR Manager] ◀──── PREDICTION REVIEW (with SHAP waterfall)          ║
║  (reviews)                    │                                       ║
║                    ACCEPT ────┤──── REJECT + CORRECT                  ║
║                               │                                       ║
║                               ▼                                       ║
║                    HR DECISIONS stored (HRDecisions collection)       ║
║                               │                                       ║
║                               ▼                                       ║
║               STAGE 2 RETRAINING → Improved RF Model                 ║
║               (HR-corrected labels replace formula labels)            ║
╠══════════════════════════════════════════════════════════════════════╣
║  ANALYTICS DASHBOARD                                                  ║
║  WRL (Workforce Risk Level) • Risk Distribution Donut                ║
║  Payroll Summary • Inventory Alert Count • 10 KPIs                   ║
╚══════════════════════════════════════════════════════════════════════╝
```

Three feedback loops drive continuous improvement:

1. **Attendance → Payroll**: daily records are automatically aggregated into monthly salary computations without manual data entry.
2. **ERP Data → Risk Score**: attendance patterns, salary variance, and synthetic social signals are continuously fed into the ML pipeline each month.
3. **HR Decision → Retraining**: HR accept/reject corrections accumulate as labelled ground truth, driving Stage 2 model improvement with each retraining cycle.

---

## 1.9 Resource Requirements

### 1.9.1 Hardware

| Component | Minimum Specification | Purpose |
|---|---|---|
| Development Workstation | Intel Core i5 (8th gen+) or equivalent; 8 GB RAM; 256 GB SSD | Code development, simultaneous service hosting |
| Local Server (Development) | Same as workstation | Running Node.js (:5001), Flask (:5000), and MongoDB (:27017) concurrently |
| Network | Standard broadband | Package installation (npm/pip), email alert dispatch (SMTP) |

No specialised hardware is required. All three services run concurrently on a standard development laptop. Production deployment would require a cloud virtual machine (e.g., AWS EC2 t3.medium or equivalent), which is identified as future work.

### 1.9.2 Software

| Category | Tool / Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Node.js | 18.x LTS | Backend API and business logic execution |
| Runtime | Python | 3.10+ | ML microservice and evaluation scripts |
| Database | MongoDB Community | 8.x | Document store for all 9 collections |
| Frontend Framework | React + Vite | 18 + 5.x | Interactive dashboards and risk visualisation UI |
| CSS Framework | Tailwind CSS | 3.x | Responsive dark-navy application theme |
| Backend Framework | Express.js | 5.x | REST API routing and middleware layer |
| ODM | Mongoose | 9.x | MongoDB schema definition and enforcement |
| ML Framework | scikit-learn | 1.x | Random Forest classifier and SMOTE oversampling |
| Explainability Library | SHAP | 0.44+ | TreeExplainer for per-prediction feature attribution |
| Web Framework (ML) | Flask | 3.x | ML microservice HTTP endpoints (/predict, /train) |
| Authentication | jsonwebtoken + bcrypt | Latest | Stateless JWT tokens and password hashing |
| Email | Nodemailer | Latest | OTP dispatch and inventory alert emails |
| IDE | Visual Studio Code | Latest | Primary development environment |
| API Testing | Postman | Latest | API endpoint verification |
| Version Control | Git + GitHub | Latest | Source code management and collaboration |
| Package Managers | npm + pip | Latest | JavaScript and Python dependency management |

---

## 1.10 Project Scope

### In Scope

The following are within the boundaries of this research project:

- Full MERN-stack ERP encompassing employee management, attendance and payroll computation, and inventory management
- Synthetic `social_score` generation using a Gaussian sub-score model across four behavioural dimensions, formally documented as a proxy for future live API data
- ML-powered employee risk scoring via a Python Flask microservice implementing Random Forest classification with SHAP explainability
- Two-stage HR feedback loop: Stage 1 (formula-derived labels, cold-start baseline) and Stage 2 (HR-corrected labels, human-in-the-loop retraining)
- JWT stateless authentication with bcrypt password hashing, OTP two-factor email verification, and four-role RBAC (Admin, HR Manager, Manager, Employee)
- Automated multi-recipient email alerts for inventory reorder events and Workforce Risk Level threshold breaches
- Analytics dashboard with ten KPIs including the WRL portfolio metric
- ML evaluation covering confusion matrices, per-class precision/recall/F1 scores, SHAP feature importance, and Stage 1 vs Stage 2 comparison
- Social score statistical validation: distribution shape, mean/standard deviation checks, correlation structure, and temporal drift analysis
- Functional testing of all ERP API endpoints

### Out of Scope

The following are explicitly excluded from this research, with rationale:

| Item | Rationale |
|---|---|
| Live LinkedIn / Facebook API integration | Documented as the primary future-work item; the `social_data_source` field provides the schema-level zero-migration pathway |
| Mobile application (React Native) | Identified as future work; out of scope for prototype evaluation |
| Payment gateway integration | Payroll calculation is in scope; actual fund disbursement is not |
| Multi-tenancy architecture | System is designed for single-organisation deployment |
| Real-time internal messaging | Beyond the core ERP operational scope |
| Recruitment pipeline, performance reviews, training management | Advanced HR modules outside the research objectives |
| Cloud deployment and CI/CD pipeline | Future work; gunicorn + MongoDB Atlas identified as the production pathway |
| Multi-jurisdiction payroll rules | EPF/ETF deduction rates are specific to Sri Lankan labour law |
| Multi-language localisation | English-only interface for this prototype |

---

## 1.11 Chapter Summary

This chapter set out the motivation for NEXUS ERP by identifying three interconnected gaps in the current state of SME-targeted HR systems: the absence of integrated predictive analytics within ERP platforms, the architectural disconnection of existing ML attrition models from operational data sources, and the lack of a formally specified synthetic social behaviour signal with a documented production pathway to live API data.

The main research problem was decomposed into seven sub-research questions. RQ3 (synthetic social signal), RQ4 (ML risk scoring pipeline), and RQ5 (HITL retraining improvement) were designated high-priority because they contribute most directly to the novelty of this work. The research motivation drew on the real economic cost of attrition for SMEs, the theoretical potential of social signals, and responsible AI considerations for HR decision-making, and the research aim was framed as the design, development, and evaluation of NEXUS ERP. Ten objectives, covering identification, analysis, design and development, and evaluation, were mapped to the research questions. A rich picture then illustrated the key stakeholders, operational data flows, ML pipeline stages, and feedback loops, before the chapter closed with hardware and software resource requirements and defined scope boundaries.

Chapter 2 reviews the literature across six thematic areas that contextualise and underpin the research: ERP systems for SMEs, ML-based employee attrition prediction, social media signals in HR analytics, synthetic data generation and validation, explainable AI and human-in-the-loop ML, and enterprise security. The review identifies the specific research gaps that motivate each of the three novelty contributions of NEXUS ERP.

---

**References cited in this chapter:**
- Davenport, T.H. (1998). Putting the enterprise into the enterprise system. *Harvard Business Review*, 76(4), 121–131.
- Fallucchi, F., Coladangelo, M., Giuliano, R., and De Luca, E.W. (2020). Predicting employee attrition using machine learning techniques. *Computers*, 9(4), 86.
- Jain, P.K. and Nayyar, A. (2022). Automated prediction of employee attrition using ensemble model based on machine learning algorithms. *Computational Intelligence and Neuroscience*, 2022, Art. no. 7728363.
- Katuu, S. (2020). Enterprise resource planning: Past, present, and future. *New Review of Information Networking*, 25(1), 37–46.
- Roth, P.L., Bobko, P., Van Iddekinge, C.H., and Thatcher, J.B. (2016). Social media in employee-selection-related decisions: A research agenda for uncharted territory. *Journal of Management*, 42(1), 269–298.
- De Jesus, A.C., Junior, M.E.G.D., and Brandao, W.C. (2018). Exploiting LinkedIn to predict employee resignation likelihood. In *Proc. 33rd Annual ACM Symposium on Applied Computing*, pp. 1212–1219.
- Osman, A.H. (2025). Prediction of employee attrition using different machine learning models. *Applied Sciences*, 15(3), 1183.
- Mosqueira-Rey, E., Hernández-Pereira, E., Alonso-Ríos, D., Bobes-Bascarán, J., and Fernández-Leal, Á. (2023). Human-in-the-loop machine learning: A state of the art. *Artificial Intelligence Review*, 56, 3005–3054.
- Adadi, A. and Berrada, M. (2018). Peeking inside the black-box: A survey on explainable artificial intelligence (XAI). *IEEE Access*, 6, 52138–52160.
