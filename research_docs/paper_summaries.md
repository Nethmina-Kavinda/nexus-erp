# NEXUS ERP — SLR Paper Database

## Summary

- **Total papers:** 25
- **Theme 1 (ERP for SMEs):** 4 papers
- **Theme 2 (ML Attrition Prediction):** 9 papers
- **Theme 3 (Social Media Signals in HR):** 4 papers
- **Theme 4 (Synthetic Data Generation):** 3 papers
- **Theme 5 (Explainable AI + HITL):** 3 papers
- **Theme 6 (Enterprise Security):** 2 papers

---

## Theme 1: ERP Systems for SMEs

### [P1] Albarghouthi, M., Qi, B., Wang, H. and Shang, K. (2024)
**Title:** Exploring cloud enterprise resource planning and open innovation for small and medium enterprises: Insights from practitioners
**Source:** Technological Forecasting and Social Change, Elsevier
**Year:** 2024
**Key Findings:** Cloud ERP offers SMEs affordability, scalability, and flexibility. However, limited customisation, data security risks, and dependency on network infrastructure remain significant challenges. SMEs have lesser power to influence cloud providers compared to large enterprises.
**Relevance:** Establishes the need for lightweight, customisable ERP for SMEs — validates NEXUS ERP's positioning as a tailored solution. (RQ7)
**Limitations:** Focused on cloud adoption challenges, not on integrating ML or analytics into ERP.

### [P2] Chofreh, A.G., Goni, F.A., Klemes, J.J., Malik, M.N. and Khan, H.H. (2021)
**Title:** Challenges of Cloud-ERP Adoptions in SMEs
**Source:** Procedia Computer Science, Elsevier (ScienceDirect)
**Year:** 2021
**Key Findings:** Identified key barriers to ERP adoption in SMEs: high implementation cost, lack of technical expertise, data migration risks, and resistance to change. Cloud ERP reduces upfront costs but introduces vendor lock-in concerns.
**Relevance:** Supports the argument that SMEs need affordable, self-contained ERP solutions with lower entry barriers. (RQ7)
**Limitations:** Does not address HR analytics or ML integration.

### [P3] Davenport, T.H. (1998)
**Title:** Putting the Enterprise into the Enterprise System
**Source:** Harvard Business Review, 76(4), pp. 121-131
**Year:** 1998
**Key Findings:** Seminal work defining ERP systems as integrators of business processes. Identified the trade-off between standardisation and flexibility. Warned that ERP implementations often fail when organisations don't align processes with the system.
**Relevance:** Foundational reference for ERP context. NEXUS ERP integrates multiple modules (HR, payroll, inventory) following this integration philosophy. (RQ1, RQ2)
**Limitations:** Pre-cloud era; does not address web-based or ML-enhanced ERP.

### [P4] Katuu, S. (2020)
**Title:** Enterprise Resource Planning: Past, Present, and Future
**Source:** New Review of Information Networking, 25(1), pp. 37-46, Taylor & Francis
**Year:** 2020
**Key Findings:** Comprehensive review tracing ERP evolution from MRP systems through to cloud-based and AI-enhanced platforms. Identified the trend toward integrating predictive analytics and AI into next-generation ERP systems.
**Relevance:** Directly supports the vision of NEXUS ERP as a next-gen system combining traditional ERP with ML-based predictive analytics. (RQ7)
**Limitations:** Review paper; does not implement or evaluate any AI-integrated ERP system.

---

## Theme 2: Employee Attrition Prediction using ML

### [P5] Fallucchi, F., Coladangelo, M., Giuliano, R. and De Luca, E.W. (2020)
**Title:** Predicting Employee Attrition Using Machine Learning Techniques
**Source:** Computers, 9(4), 86, MDPI
**Year:** 2020
**Key Findings:** Tested multiple ML algorithms on IBM HR dataset (1,470 samples, 35 features). Gaussian Naive Bayes achieved best recall (0.54). Proposed an ensemble pipeline with autotuning for hyperparameter optimisation. Concluded no single model is universally ideal.
**Relevance:** Demonstrates the challenge of attrition prediction and the value of ensemble approaches. NEXUS ERP uses RF as primary classifier. (RQ4)
**Limitations:** Low recall rates across all models; small dataset. No social or behavioural signals used.

### [P6] Jain, R. and Nayyar, A. (2022)
**Title:** Automated Prediction of Employee Attrition Using Ensemble Model Based on Machine Learning Algorithms
**Source:** Computational Intelligence and Neuroscience, PMC (Hindawi)
**Year:** 2022
**Key Findings:** Proposed an ensemble model achieving 92% accuracy, outperforming individual models: RF (91%), LR (90%), KNN (90%), DT (89%), SVM (89%), NB (83%). Feature importance analysis identified OverTime, MonthlyIncome, and Age as top predictors.
**Relevance:** Validates ensemble approach and RF as strong performer. Supports NEXUS ERP's choice of RF. Feature importance aligns with NEXUS ERP's feature vector design. (RQ4)
**Limitations:** IBM dataset only; no real-world deployment. No social or behavioural signals.

### [P7] Zhao, Y. and Hryniewicki, M.K. (2018)
**Title:** Employee Turnover Prediction with Machine Learning: A Reliable Approach
**Source:** Proceedings of the 14th International Conference on Intelligent Computing, Springer
**Year:** 2018
**Key Findings:** Comprehensive comparison of 10 ML algorithms for turnover prediction. XGBoost showed strong generalisation on noisy data. Gradient boosting trees outperformed on medium datasets. Highlighted the challenge of class imbalance in attrition datasets.
**Relevance:** Supports ML-based approach and demonstrates RF/gradient boosting effectiveness. Validates the need for balanced class handling in NEXUS ERP's training pipeline. (RQ4)
**Limitations:** No integration with organisational systems; standalone prediction model.

### [P8] Raza, A., Munir, K., Almutairi, M.S., Younas, F. and Fareed, M.M.S. (2022)
**Title:** Predictive Model of Employee Attrition Based on Stacking Ensemble Learning
**Source:** Expert Systems with Applications, 215, Elsevier
**Year:** 2022
**Key Findings:** Proposed a stacking ensemble combining RF, XGBoost, and LR achieving 88.6% accuracy with AUC of 0.85. Applied PCA for dimensionality reduction. When oversampled data with PCA was applied, RF, AdaBoost, SVM, and MLP exceeded 90% accuracy and F1 scores.
**Relevance:** Validates stacking and ensemble techniques. Supports NEXUS ERP's use of RF as a base classifier with potential for ensemble extension. (RQ4)
**Limitations:** Dataset-specific; no deployment in ERP context. No social signals.

### [P9] Alao, D. and Adeyemo, A.B. (2013)
**Title:** Analyzing Employee Attrition Using Decision Tree Algorithms
**Source:** Computing, Information Systems, Development Informatics and Allied Research Journal, 4(1), pp. 17-28
**Year:** 2013
**Key Findings:** Early application of decision trees to employee attrition using 309 records from a Nigerian institution (1978-2006). Generated five decision tree models using WEKA and See5. Demonstrated that ML can identify attrition patterns from demographic and job-related data.
**Relevance:** Foundational work establishing ML for HR attrition prediction. Shows the evolution from simple decision trees to the ensemble methods used in NEXUS ERP. (RQ4)
**Limitations:** Small dataset; single algorithm family; no feature engineering or ensemble methods.

### [P10] Yadav, S., Jain, A. and Singh, D. (2018)
**Title:** Early Prediction of Employee Attrition using Data Mining Techniques
**Source:** Proceedings of the 8th International Conference on Intelligent Systems and Control (ISCO), IEEE
**Year:** 2018
**Key Findings:** Applied Naive Bayes, SVM, and RF to the IBM HR dataset. RF achieved highest accuracy (84%). Identified satisfaction level, salary, and number of projects as critical features.
**Relevance:** Confirms RF as consistently strong performer for attrition. Feature findings support NEXUS ERP's inclusion of payroll-related features. (RQ4)
**Limitations:** Standard features only; no social or behavioural signals.

### [P11] Srivastava, D.K. and Nair, P. (2018)
**Title:** Employee Attrition Analysis Using Predictive Techniques
**Source:** Proceedings of the International Conference on Information and Communication Technology for Intelligent Systems, Springer
**Year:** 2018
**Key Findings:** Compared Logistic Regression, SVM, RF, and Neural Networks for attrition prediction. RF and Neural Networks both exceeded 85% accuracy. Emphasised the importance of feature selection for model performance.
**Relevance:** Supports multi-algorithm comparison approach. Validates RF performance and feature engineering importance in NEXUS ERP. (RQ4)
**Limitations:** No integration with operational systems; academic exercise only.

### [P12] Osman, M.H. (2025)
**Title:** Predicting Employee Attrition: A Comparative Analysis of Machine Learning Models Using the IBM Human Resource Analytics Dataset
**Source:** Procedia Computer Science, Elsevier (ScienceDirect)
**Year:** 2025
**Key Findings:** Compared RF, SVM, Decision Tree, Gradient Boosting, and a Hybrid Model on IBM HR dataset. Hybrid model achieved highest accuracy (95.0%). Demonstrated that combining algorithms effectively harnesses individual strengths while mitigating weaknesses.
**Relevance:** Latest benchmark on IBM dataset. Supports ensemble/hybrid approaches. Validates NEXUS ERP's dual-path scoring (weighted composite + RF). (RQ4)
**Limitations:** Still uses IBM synthetic dataset; no social or ERP-integrated features.

### [P13] Sajjadiani, S., Sojourner, A.J., Kammeyer-Mueller, J.D. and Mykerezi, E. (2019)
**Title:** Using Machine Learning to Translate Applicant Work History into Predictors of Performance and Turnover
**Source:** Journal of Applied Psychology, 104(10), pp. 1207-1225, APA
**Year:** 2019
**Key Findings:** Applied ML to 16,071 job applicants' work histories. Developed interpretable features from unstructured application data. Found that work experience relevance and history of approaching better jobs predicted positive outcomes, while history of avoiding bad jobs predicted negative outcomes.
**Relevance:** Demonstrates ML for turnover prediction at scale with novel feature engineering from unstructured data. Supports NEXUS ERP's feature engineering approach. (RQ4, RQ5)
**Limitations:** Focused on pre-hire prediction, not post-hire attrition monitoring within an ERP.

---

## Theme 3: Social Media Signals in HR Analytics

### [P14] Van Iddekinge, C.H., Lanivich, S.E., Roth, P.L. and Junco, E. (2016)
**Title:** Social Media for Selection? Validity and Adverse Impact Potential of a Facebook-Based Assessment
**Source:** Journal of Management, 42(7), pp. 1811-1835, SAGE
**Year:** 2016
**Key Findings:** Examined recruiter ratings of applicants' Facebook profiles for predicting job performance and turnover. Found that Facebook-based assessments were unrelated to job performance, turnover intentions, and actual turnover when rated by recruiters. Raised concerns about validity and adverse impact.
**Relevance:** Critical reference — highlights limitations of unstructured social media assessment. Supports NEXUS ERP's approach of using structured, quantified social signals rather than subjective recruiter ratings. (RQ3)
**Limitations:** Used subjective recruiter ratings rather than automated/structured signal extraction.

### [P15] Roth, P.L., Bobko, P., Van Iddekinge, C.H. and Thatcher, J.B. (2016)
**Title:** Social Media in Employee-Selection-Related Decisions: A Research Agenda for Uncharted Territory
**Source:** Journal of Management, 42(1), pp. 269-298, SAGE
**Year:** 2016
**Key Findings:** Comprehensive research agenda identifying social media as an emerging source of employee assessment data. Highlighted the gap between organisational practice (widespread social media screening) and scientific research. Identified key constructs: online behaviour, network connections, content sentiment.
**Relevance:** Directly justifies NEXUS ERP's social_score sub-dimensions (job_search, post_drop, network_growth, sentiment). Identifies the research gap in formalising social signals for HR. (RQ3)
**Limitations:** Research agenda, not empirical study; no formal signal quantification framework.

### [P16] De Jesus, A.C., Junior, M.E.G.D. and Brandao, W.C. (2018)
**Title:** Exploiting LinkedIn to Predict Employee Resignation Likelihood
**Source:** Proceedings of the 33rd Annual ACM Symposium on Applied Computing (SAC '18), ACM
**Year:** 2018
**Key Findings:** Collected LinkedIn professional profiles and used them as features to predict resignation likelihood. Extracted features including profile completeness, connection count, endorsement activity, and recent updates. Demonstrated that LinkedIn data contains predictive signals for turnover.
**Relevance:** Empirical validation that LinkedIn data predicts attrition — directly supports NEXUS ERP's social_score model (job_search, network_growth sub-scores). (RQ3)
**Limitations:** Privacy/ethical concerns with scraping; LinkedIn API access restrictions limit reproducibility.

### [P17] Gupta, S. and Sharma, R.R.K. (2022)
**Title:** Types of HR Analytics Used for the Prediction of Employee Turnover in Different Strategic Firms with the Use of Enterprise Social Media
**Source:** Proceedings of the 5th European International Conference on Industrial Engineering and Operations Management, Rome, Italy, IEOM Society
**Year:** 2022
**Key Findings:** Reviewed how enterprise social media data (Slack, Teams, internal platforms) combined with HR analytics can predict employee turnover. Identified descriptive, predictive, and prescriptive analytics approaches. Found increasing use of social/enterprise media data in turnover prediction research.
**Relevance:** Validates the concept of combining social media signals with HR analytics for attrition prediction — the core premise of NEXUS ERP's risk scoring engine. (RQ3, RQ4)
**Limitations:** Review-based; no implementation of integrated social signal + ERP system.

---

## Theme 4: Synthetic Data Generation

### [P18] Figueira, A. and Vaz, B. (2022)
**Title:** Survey on Synthetic Data Generation, Evaluation, and Validation
**Source:** Electronics, 13(17), 3509, MDPI
**Year:** 2024
**Key Findings:** Systematic review of synthetic data generation techniques. Identified key approaches: GANs, VAEs, Gaussian copulas, and statistical methods. Gaussian copula models marginal dependencies well for tabular data. Evaluation frameworks assess representativeness, novelty, realism, diversity, and coherence.
**Relevance:** Validates NEXUS ERP's Gaussian-based synthetic social_score generation. Provides evaluation criteria applicable to social_score validation. (RQ3)
**Limitations:** General survey; not specific to HR or social behaviour signals.

### [P19] Gonzales, A., Guruswamy, G. and Smith, S.R. (2023)
**Title:** Synthetic Data in Health Care: A Narrative Review
**Source:** PLOS Digital Health, vol. 2, no. 1, e0000082
**Year:** 2023
**Key Findings:** Reviewed synthetic data generation in healthcare — a domain with similar privacy constraints to HR. Gaussian Mixture Models outperformed other techniques for tabular data. Established validation protocols: statistical similarity tests, utility metrics, and privacy guarantees.
**Relevance:** Parallel domain (healthcare) with similar ethical constraints. Validates synthetic data as acceptable for research when privacy prevents real data use — same justification as NEXUS ERP's synthetic social_score. (RQ3)
**Limitations:** Healthcare-specific; validation methods need adaptation for HR context.

### [P20] Dahmen, J. and Cook, D.J. (2019)
**Title:** SynSys: A Synthetic Data Generation System for Healthcare Applications
**Source:** Sensors, 19(5), 1181, MDPI
**Year:** 2019
**Key Findings:** Developed a system for generating realistic synthetic sensor data using statistical distributions including Gaussian models. Validated synthetic data by comparing statistical properties (mean, variance, distribution shape) against real data. Demonstrated that Gaussian-based generation produces statistically realistic outputs.
**Relevance:** Directly validates NEXUS ERP's approach of using Gaussian distribution for social_score generation and validating via statistical property comparison. (RQ3)
**Limitations:** Sensor data context; not directly applied to social behaviour signals.

---

## Theme 5: Explainable AI + Human-in-the-Loop ML

### [P21] Lundberg, S.M. and Lee, S.I. (2017)
**Title:** A Unified Approach to Interpreting Model Predictions
**Source:** Advances in Neural Information Processing Systems (NIPS 2017), 30
**Year:** 2017
**Key Findings:** Introduced SHAP (SHapley Additive exPlanations), a unified framework for model interpretability based on Shapley values from game theory. SHAP provides both local (per-prediction) and global (overall model) explanations. Unified six existing interpretability methods into a single framework.
**Relevance:** Foundational reference for NEXUS ERP's explainability component. SHAP analysis provides per-employee risk explanations and feature importance charts. (RQ5)
**Limitations:** Computational cost for large models; requires careful interpretation.

### [P22] Adadi, A. and Berrada, M. (2018)
**Title:** Peeking Inside the Black-Box: A Survey on Explainable Artificial Intelligence (XAI)
**Source:** IEEE Access, 6, pp. 52138-52160
**Year:** 2018
**Key Findings:** Comprehensive survey of XAI methods. Classified explainability approaches: intrinsic vs post-hoc, model-specific vs model-agnostic, local vs global. Identified trust, transparency, and fairness as key drivers for XAI adoption in high-stakes domains (healthcare, finance, HR).
**Relevance:** Justifies the need for explainability in HR ML systems. Supports NEXUS ERP's use of SHAP as a post-hoc, model-agnostic explainability method. (RQ5)
**Limitations:** Survey — does not implement or evaluate XAI in HR context specifically.

### [P23] Mosqueira-Rey, E., Hernandez-Pereira, E., Alonso-Rios, D., Bobes-Bascaran, J. and Fernandez-Leal, A. (2023)
**Title:** Human-in-the-Loop Machine Learning: A State of the Art
**Source:** Artificial Intelligence Review, 56, pp. 3005-3054, Springer
**Year:** 2023
**Key Findings:** Comprehensive review of HITL ML approaches. Classified HITL by level of human involvement: active learning, interactive ML, and machine teaching. Found that HITL systems improve model accuracy through iterative human feedback. Identified trust, control, and accountability as key benefits.
**Relevance:** Directly supports NEXUS ERP's HR feedback loop where managers accept/reject predictions and trigger retraining. Validates the HITL approach for responsible AI in HR. (RQ5)
**Limitations:** General review; no specific implementation in HR/ERP context.

---

## Theme 6: Enterprise Security

### [P24] Ahmed, S. and Mahmood, Q. (2019)
**Title:** An Authentication Based Scheme for Applications Using JSON Web Token
**Source:** Proceedings of the 22nd International Multitopic Conference (INMIC), IEEE
**Year:** 2019
**Key Findings:** Proposed a JWT-based authentication scheme that regenerates tokens on each client request using timestamp-based validation. Demonstrated JWT as an efficient mechanism for stateless web application authentication with enhanced session security.
**Relevance:** Supports NEXUS ERP's security architecture: JWT + OTP + bcrypt + RBAC. (RQ6)
**Limitations:** Focused on a single authentication mechanism; does not address RBAC or multi-factor authentication holistically.

### [P25] Ferraiolo, D.F., Kuhn, D.R. and Chandramouli, R. (2007)
**Title:** Role-Based Access Control (Second Edition)
**Source:** Artech House, ISBN: 978-1596931138
**Year:** 2007
**Key Findings:** Definitive reference on RBAC. Defined the RBAC model: roles, permissions, role hierarchies, and constraints. Established RBAC as the standard approach for enterprise access control. NIST RBAC standard widely adopted in enterprise systems.
**Relevance:** Foundational reference for NEXUS ERP's 4-role permission model (Admin, HR, Manager, Employee). (RQ6)
**Limitations:** Pre-dates modern web authentication; JWT/OAuth not covered.

---

## Paper-to-RQ Mapping Summary

| Paper | RQ1 | RQ2 | RQ3 | RQ4 | RQ5 | RQ6 | RQ7 |
|---|---|---|---|---|---|---|---|
| P1 (Albarghouthi et al.) | | | | | | | X |
| P2 (Chofreh et al.) | | | | | | | X |
| P3 (Davenport) | X | X | | | | | |
| P4 (Katuu) | | | | | | | X |
| P5 (Fallucchi et al.) | | | | X | | | |
| P6 (Jain & Nayyar) | | | | X | | | |
| P7 (Zhao & Hryniewicki) | | | | X | | | |
| P8 (Raza et al.) | | | | X | | | |
| P9 (Alao & Adeyemo) | | | | X | | | |
| P10 (Yadav et al.) | | | | X | | | |
| P11 (Srivastava & Nair) | | | | X | | | |
| P12 (Osman) | | | | X | | | |
| P13 (Sajjadiani et al.) | | | | X | X | | |
| P14 (Van Iddekinge et al.) | | | X | | | | |
| P15 (Roth et al.) | | | X | | | | |
| P16 (De Jesus et al.) | | | X | | | | |
| P17 (Gupta & Sharma) | | | X | X | | | |
| P18 (Figueira & Vaz) | | | X | | | | |
| P19 (Gonzales et al.) | | | X | | | | |
| P20 (Dahmen & Cook) | | | X | | | | |
| P21 (Lundberg & Lee) | | | | | X | | |
| P22 (Adadi & Berrada) | | | | | X | | |
| P23 (Mosqueira-Rey et al.) | | | | | X | | |
| P24 (Ahmed & Mahmood) | | | | | | X | |
| P25 (Ferraiolo et al.) | | | | | | X | |
