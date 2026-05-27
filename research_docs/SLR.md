Index: 28271
Name: Bandara NK

# Chapter 2: Literature Review

## 2.1 Introduction

This chapter presents a Systematic Literature Review (SLR) of existing research relevant to the design and development of NEXUS ERP — an integrated Enterprise Resource Planning portal with machine-learning-powered employee risk scoring using synthetic social behaviour signals. The purpose of this review is to critically examine current knowledge across the key domains that underpin this research, identify gaps in the existing body of work, and establish the theoretical foundation for the proposed system.

The scope of this review encompasses five primary thematic areas: (1) ERP systems for small and medium enterprises, (2) employee attrition prediction using machine learning, (3) social media signals in HR analytics, (4) synthetic data generation and validation, and (5) explainable artificial intelligence and human-in-the-loop machine learning. A sixth, supporting theme on enterprise security is briefly addressed. These themes were selected to align directly with the seven research questions defined in Chapter 1, ensuring that each aspect of the proposed system is grounded in prior work.

The review follows a systematic approach, with a documented search strategy, explicit inclusion and exclusion criteria, and thematic synthesis of findings. A total of 25 peer-reviewed papers, journal articles, conference proceedings, and seminal texts were identified and analysed. The chapter concludes with a comprehensive comparison table mapping all reviewed works to the research questions, followed by a gap analysis that establishes the research contribution of NEXUS ERP.

The structure of this chapter is as follows: Section 2.2 describes the search methodology; Sections 2.3 through 2.8 present the thematic review; Section 2.9 provides the comparison table; Section 2.10 presents the research gap analysis; and Section 2.11 summarises the key findings.

---

## 2.2 Search Methodology

### 2.2.1 Databases and Sources

The literature search was conducted across four major academic databases:

1. **Google Scholar** — broad coverage of multidisciplinary research
2. **IEEE Xplore** — primary source for computing, engineering, and AI research
3. **ACM Digital Library** — computing and information systems research
4. **Springer Link / Elsevier ScienceDirect** — journal articles and conference proceedings

Additional references were identified through backward citation tracking from key papers.

### 2.2.2 Search Keywords

Table 2.1 presents the search keywords used for each thematic area.

**Table 2.1: Search Keywords by Theme**

| Theme | Keywords |
|---|---|
| ERP for SMEs | "ERP system" AND "SME"; "web-based ERP"; "cloud ERP small enterprise"; "open source ERP" |
| ML Attrition Prediction | "employee attrition prediction" AND "machine learning"; "Random Forest employee turnover"; "ensemble methods HR analytics" |
| Social Media Signals | "social media" AND "employee turnover"; "LinkedIn turnover prediction"; "social behaviour signals HR" |
| Synthetic Data | "synthetic data generation" AND "machine learning"; "Gaussian data simulation"; "synthetic HR data" |
| Explainable AI / HITL | "SHAP explainable AI"; "human-in-the-loop machine learning"; "explainable AI human resources" |
| Enterprise Security | "JWT authentication web application"; "role-based access control ERP" |

### 2.2.3 Inclusion and Exclusion Criteria

**Table 2.2: Inclusion and Exclusion Criteria**

| Criterion | Include | Exclude |
|---|---|---|
| Publication year | 2015-2026 (exceptions for seminal works) | Before 2015 (unless foundational) |
| Publication type | Peer-reviewed journals, conference papers, books | Blog posts, white papers, vendor documentation |
| Language | English | Non-English |
| Relevance | Directly addresses at least one research question | Tangentially related, no clear RQ connection |
| Quality | Published by IEEE, ACM, Springer, Elsevier, SAGE, MDPI, or equivalent | Predatory or non-indexed journals |

### 2.2.4 Selection Process

The search process followed a three-stage screening approach based on the PRISMA guidelines (Moher et al., 2009), as illustrated in Figure 2.1.

1. **Identification:** Initial keyword searches returned approximately 180 results across all databases.
2. **Screening:** Titles and abstracts were reviewed for relevance to the six themes, reducing the pool to 52 candidate papers.
3. **Eligibility and inclusion:** Full texts or extended abstracts were examined for quality, relevance, and contribution. The final set comprised 25 papers.

**Figure 2.1: PRISMA Selection Flow**

```
Records identified through          Additional records identified
database searching (n = 168)        through citation tracking (n = 12)
            |                                   |
            +-----------------------------------+
                            |
              Records after duplicates removed (n = 152)
                            |
              Records screened by title/abstract (n = 152)
                            |                       |
              Records excluded (n = 100)     Potentially relevant (n = 52)
                                                    |
                                      Full-text articles assessed
                                      for eligibility (n = 52)
                                                    |                       |
                                      Articles excluded (n = 27)     Studies included in
                                      - Not peer-reviewed (8)        thematic synthesis
                                      - Insufficient RQ relevance (11)   (n = 25)
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

### 2.2.5 Limitations of the Search Strategy

Several limitations of this search process should be acknowledged. First, the restriction to English-language publications may exclude relevant research published in other languages, particularly studies on ERP adoption in non-English-speaking SME markets. Second, the reliance on four academic databases, while comprehensive, may not capture all relevant grey literature, industry reports, or regional conference proceedings. Third, the inclusion of seminal works published before 2015 (Davenport, 1998; Ferraiolo et al., 2007) introduces potential temporal inconsistency, though these works remain foundational to the field. Finally, publication bias may favour studies reporting positive or significant results, potentially underrepresenting negative findings or failed approaches in ML-based attrition prediction.

---

## 2.3 Theme 1: ERP Systems for Small and Medium Enterprises

Enterprise Resource Planning (ERP) systems have become fundamental to organisational operations, integrating business processes such as human resources, payroll, inventory, and finance into unified platforms. This section reviews the evolution of ERP systems, their adoption challenges for small and medium enterprises (SMEs), and the gap between traditional ERP functionality and modern analytical capabilities.

### 2.3.1 Evolution of ERP Systems

Davenport (1998) provided the seminal definition of ERP systems as integrators of business processes across functional boundaries, identifying the critical trade-off between standardisation and organisational flexibility. While the original ERP paradigm focused on large enterprises with on-premise deployments, the landscape has shifted dramatically over the past two decades.

Katuu (2020) traced the evolution of ERP from Material Requirements Planning (MRP) systems through on-premise monolithic platforms to modern cloud-based and AI-enhanced solutions. The author identified a clear trend toward integrating predictive analytics and artificial intelligence into next-generation ERP systems, noting that "the future of ERP lies in intelligent automation and data-driven decision support." However, while the trajectory toward AI-enhanced ERP is clear, Katuu's review remains descriptive and does not propose or evaluate any concrete implementation of ML-integrated ERP.

### 2.3.2 Cloud ERP Adoption in SMEs

The transition to cloud-based ERP has been particularly significant for SMEs. Albarghouthi et al. (2024) explored cloud ERP adoption among SME practitioners and found that cloud solutions offer critical advantages including affordability, scalability, and flexibility. However, their study also identified persistent challenges: limited customisation options, data security risks arising from third-party cloud providers, regulatory compliance concerns, and dependency on network infrastructure. Critically, the authors noted that SMEs have "lesser power to influence and monitor cloud providers' services" compared to large enterprises.

Chofreh et al. (2021) reinforced these findings, identifying high implementation costs, lack of technical expertise, data migration risks, and organisational resistance to change as key barriers to ERP adoption in SMEs. Their work highlighted the need for affordable, self-contained ERP solutions that lower the entry barrier for smaller organisations.

### 2.3.3 Discussion

A consistent pattern emerges from the reviewed ERP literature: while the technological trajectory clearly points toward AI-enhanced platforms (Katuu, 2020), the practical reality for SMEs remains constrained by cost, complexity, and limited customisation (Albarghouthi et al., 2024; Chofreh et al., 2021). The existing ERP landscape, dominated by platforms such as SAP, Oracle, and Odoo, focuses on operational process automation — payroll computation, inventory tracking, and financial reporting. No reviewed ERP system for SMEs integrates machine learning-powered workforce analytics or employee risk scoring. Existing solutions either require expensive enterprise-grade add-ons or lack predictive capabilities entirely. This gap suggests an opportunity for lightweight, integrated ERP systems that combine operational automation with ML-based decision support.

The question of whether ML-based prediction models can be effectively integrated into enterprise systems depends, in part, on the maturity of those predictive models. The following theme examines the current state of machine learning for employee attrition prediction.

---

## 2.4 Theme 2: Employee Attrition Prediction Using Machine Learning

Employee attrition — the voluntary or involuntary departure of employees — is a costly challenge for organisations. Machine learning techniques have been increasingly applied to predict attrition risk, enabling proactive retention strategies. This section reviews the evolution of ML-based attrition prediction, algorithm performance comparisons, feature importance findings, and the limitations of existing approaches.

### 2.4.1 Early Approaches

Alao and Adeyemo (2013) were among the earliest researchers to apply machine learning to employee attrition. Using 309 employee records from a Nigerian higher education institution spanning 1978 to 2006, they generated five decision tree models using WEKA and See5. While the dataset was small and the algorithmic approach limited to a single family of classifiers, their work demonstrated the feasibility of using demographic and job-related features to classify attrition patterns — establishing the foundation for subsequent, more sophisticated approaches.

### 2.4.2 Algorithm Performance Comparisons

A substantial body of research has compared machine learning algorithms for attrition prediction, with ensemble methods consistently outperforming individual classifiers.

Yadav, Jain, and Singh (2018) applied Naive Bayes, Support Vector Machine (SVM), and Random Forest to the IBM HR Analytics dataset, finding that Random Forest achieved the highest accuracy at 84%. They identified satisfaction level, salary, and number of projects as critical predictive features. Srivastava and Nair (2018) compared Logistic Regression, SVM, Random Forest, and Neural Networks, with both Random Forest and Neural Networks exceeding 85% accuracy, and emphasised the importance of feature selection for model performance.

Zhao and Hryniewicki (2018) conducted a comprehensive comparison of ten ML algorithms, including the novel application of Extreme Gradient Boosting (XGBoost) to employee turnover prediction. Their findings showed that gradient boosting trees offered strong generalisation on noisy, real-world data, and highlighted the persistent challenge of class imbalance in attrition datasets — where the number of employees who stay far exceeds those who leave.

A cross-study comparison of these early works reveals an important trend: while reported accuracy figures vary (84% in Yadav et al., 85%+ in Srivastava and Nair), Random Forest consistently ranks among the top-performing algorithms across different experimental setups and evaluation criteria. This convergence across independent studies strengthens confidence in tree-based ensemble methods for this problem domain.

### 2.4.3 Ensemble Methods and Advanced Approaches

The recognition that no single algorithm is universally optimal led to research on ensemble approaches. Fallucchi et al. (2020) tested multiple algorithms on the IBM HR dataset with an autotuning pipeline for hyperparameter optimisation, concluding that "no model up until now could be considered ideal and perfect for each case of business context." Despite this, their ensemble approach achieved competitive results.

Jain and Nayyar (2022) proposed an ensemble model that achieved 92% accuracy, outperforming Random Forest (91%), Logistic Regression (90%), K-Nearest Neighbours (90%), Decision Tree (89%), SVM (89%), and Naive Bayes (83%). Their feature importance analysis identified OverTime, MonthlyIncome, and Age as the top predictors of attrition.

Raza et al. (2022) advanced the ensemble approach further with a stacking model combining Random Forest, XGBoost, and Logistic Regression, achieving 88.6% accuracy with an AUC of 0.85. When combined with SMOTE oversampling and PCA dimensionality reduction, accuracy and F1 scores exceeded 90% across multiple algorithms.

Most recently, Osman (2025) compared five models on the IBM HR dataset, with a hybrid model integrating multiple algorithms achieving the highest accuracy at 95.0%. This study confirmed the trend toward hybrid and ensemble approaches, demonstrating that "combining different algorithms effectively harnesses their strengths while mitigating individual weaknesses."

It is worth noting a discrepancy: Raza et al.'s more complex stacking model (88.6%) underperformed Jain and Nayyar's simpler ensemble (92%) and Osman's hybrid (95.0%). This suggests that model architecture complexity does not guarantee superior performance, and that preprocessing decisions (class balancing, feature selection) may matter as much as algorithmic sophistication. Furthermore, the steady increase in reported accuracy over time — from 84% (Yadav et al., 2018) to 95% (Osman, 2025) — likely reflects improvements in data handling and hyperparameter tuning rather than fundamental algorithmic breakthroughs, given that most studies use the same IBM HR dataset.

### 2.4.4 Feature Engineering and Novel Predictors

Beyond algorithm selection, the quality and novelty of input features significantly impact prediction accuracy. Sajjadiani et al. (2019) demonstrated this by applying ML to 16,071 job applicants' work histories, developing interpretable features from unstructured application data. They found that derived features — work experience relevance, tenure history, and patterns of job-changing behaviour — were stronger predictors than raw demographic variables alone. This finding underscores a broader principle: feature engineering from domain-specific data sources can yield more predictive power than algorithmic complexity alone.

### 2.4.5 The IBM HR Analytics Dataset

A notable observation across the reviewed studies is the heavy reliance on the IBM HR Analytics Employee Attrition and Performance dataset. This dataset, created by IBM data scientists, contains 1,470 records with 35 features and is explicitly described as fictional (IBM, n.d.). Despite its synthetic nature, it has become the de facto benchmark for attrition prediction research, cited in the majority of studies reviewed (Fallucchi et al., 2020; Jain and Nayyar, 2022; Yadav et al., 2018; Osman, 2025). This heavy reliance on a single synthetic dataset raises two concerns. First, reported accuracy figures may not generalise to real-world organisational data, where feature distributions and class imbalance patterns differ. Second, the widespread acceptance of synthetic data in HR analytics research establishes an important precedent: the research community considers well-modelled synthetic data a valid basis for developing and evaluating attrition prediction methods.

### 2.4.6 Synthesis and Limitations

While the reviewed studies demonstrate strong and improving algorithmic performance for attrition prediction, they share two common limitations. First, all models operate as standalone analytical tools, disconnected from operational enterprise systems. No reviewed study integrates ML-based attrition prediction within a functional ERP system where attendance, payroll, and behavioural data are generated and managed. The models receive pre-processed features as input but do not participate in data collection or operational workflows. Second, all reviewed models rely exclusively on standard HR features (demographics, job satisfaction, salary). None incorporate external behavioural signals — such as social media activity — that might capture leading indicators of disengagement before they manifest in traditional HR metrics. This raises the question of whether alternative data sources could enhance prediction, which the following theme explores.

---

## 2.5 Theme 3: Social Media Signals in HR Analytics

The increasing digitisation of professional and social interactions has generated interest in using social media data as a signal for employee behaviour and attrition risk. This section reviews research on social media in HR assessment, LinkedIn-based prediction, and the challenges of incorporating social signals into organisational systems.

### 2.5.1 Social Media in Employee Assessment

Roth et al. (2016) presented a comprehensive research agenda for social media in employee-selection-related decisions, identifying it as "uncharted territory" where organisational practice had significantly outpaced scientific study. They established that social media data contains potentially relevant constructs including online behaviour patterns, network connections, and content sentiment. The authors called for formal research frameworks to evaluate the validity and utility of social media signals in HR contexts.

Van Iddekinge et al. (2016) conducted one of the most rigorous empirical studies on social media in HR. They examined recruiter ratings of applicants' Facebook profiles for predicting job performance and turnover, finding that these subjective ratings were "unrelated to supervisor ratings of job performance, turnover intentions, and actual turnover." This seemingly negative finding is significant: it demonstrates that unstructured, subjective social media assessment is ineffective. Taken together with Roth et al.'s call for formal research frameworks, these findings suggest that structured, quantified approaches to social signal extraction are needed before social media data can reliably contribute to HR decision-making.

### 2.5.2 LinkedIn-Based Turnover Prediction

De Jesus, Junior, and Brandao (2018) directly addressed the use of LinkedIn data for turnover prediction. Their study collected professional profiles from LinkedIn and used them as features — including profile completeness, connection count, endorsement activity, and recent updates — to predict resignation likelihood. They demonstrated that LinkedIn data contains meaningful predictive signals for employee turnover. Notably, their feature set (connection count, endorsement activity, recent profile updates) maps closely to the behavioural constructs identified by Roth et al. (2016), suggesting convergence across the literature on which social dimensions are most predictive.

However, their study also exposed practical limitations: privacy concerns, ethical considerations around profile scraping, and LinkedIn's API access restrictions significantly limit the reproducibility and deployment of such approaches.

### 2.5.3 Enterprise Social Media and HR Analytics

Gupta and Sharma (2022) reviewed the use of enterprise social media (platforms such as Slack, Microsoft Teams, and internal communication tools) combined with HR analytics for turnover prediction. They identified a progression from descriptive analytics (what happened) through predictive analytics (what might happen) to prescriptive analytics (what should be done), and found increasing research interest in incorporating social and communication data into turnover models.

### 2.5.4 Synthesis

The reviewed literature establishes that social media behaviour contains signals relevant to employee attrition, but exposes three critical challenges: (1) live API integration is impractical in research contexts due to platform restrictions, approval timelines, and ethical barriers (De Jesus et al., 2018); (2) subjective, unstructured assessment of social media profiles is ineffective (Van Iddekinge et al., 2016); and (3) no formal framework exists for quantifying social behaviour signals into structured features suitable for machine learning pipelines. The gap between the demonstrated predictive potential of social signals and the practical barriers to using them raises an important methodological question: can synthetic data generation techniques provide a viable proxy for social media signals in research contexts? The following theme explores the state of synthetic data generation.

---

## 2.6 Theme 4: Synthetic Data Generation and Validation

The use of synthetic data in machine learning research has grown significantly, driven by privacy constraints, data scarcity, and the need for controlled experimental conditions. This section reviews synthetic data generation methods, validation approaches, and their applicability to HR analytics research.

### 2.6.1 Synthetic Data Generation Techniques

Figueira and Vaz (2024) conducted a systematic review of synthetic data generation techniques, categorising approaches into statistical methods (Gaussian copulas, Bayesian networks), deep learning methods (Generative Adversarial Networks, Variational Autoencoders), and hybrid approaches. For tabular data — the format most relevant to ERP systems — Gaussian copula models were identified as particularly effective because they "model marginal dependencies well" and can generate realistic multi-dimensional data that preserves the statistical properties of the original distribution.

The review also established evaluation criteria for synthetic data quality: representativeness (statistical similarity to real data), novelty (ability to generate unseen but plausible records), realism (adherence to domain constraints), diversity (coverage of the data space), and coherence (logical consistency across features). These criteria provide a reusable evaluation framework applicable to any synthetic data generation effort in sensitive domains.

### 2.6.2 Gaussian-Based Generation for Sensitive Domains

Gonzales, Guruswamy, and Smith (2023) presented a narrative review of synthetic data generation in healthcare — a domain that shares privacy constraints with HR data. Their review identified Gaussian Mixture Models (GMMs) as a particularly promising approach for tabular data generation, noting their advantages in modelling complex, non-linear distributions. The authors also outlined validation protocols commonly used in synthetic data research — statistical similarity tests, utility metrics (downstream ML task performance), and privacy guarantees — which provide a transferable framework for validating synthetic data in other sensitive domains, including HR.

Dahmen and Cook (2019) developed SynSys, a system for generating realistic synthetic sensor data using Gaussian statistical distributions. Their validation approach — comparing generated data against real data using statistical property checks (mean, variance, distribution shape) — demonstrates a practical and transferable methodology for verifying that Gaussian-generated synthetic data preserves the statistical properties required for downstream analytical tasks.

### 2.6.3 Precedent: Synthetic Data in HR Research

As noted in Section 2.4.5, the IBM HR Analytics dataset — the most widely cited benchmark in employee attrition research — is itself synthetic. IBM explicitly describes it as "fictional" data created by their data scientists, yet it has been used in dozens of peer-reviewed studies (Fallucchi et al., 2020; Jain and Nayyar, 2022; Osman, 2025). This establishes a clear precedent: synthetic data is acceptable in HR analytics research, provided it is statistically well-modelled and transparently documented.

### 2.6.4 Discussion

Across the three reviewed works, a consistent finding emerges: Gaussian-based methods are effective for generating statistically realistic synthetic data in privacy-sensitive domains (Figueira and Vaz, 2024; Gonzales et al., 2023; Dahmen and Cook, 2019). The validation methodologies are also well-established — statistical property comparison, downstream task evaluation, and distribution analysis. However, existing synthetic data research focuses on replicating or augmenting existing datasets. No prior work has applied these techniques to generate novel behavioural signals — such as social media activity proxies — for domains where live data collection is infeasible. This gap is particularly relevant given the challenges identified in Theme 3, where social media signals show predictive potential but face severe practical barriers to collection.

The use of ML-based risk scoring in high-stakes HR decisions also raises questions of transparency and accountability, which the following theme addresses.

---

## 2.7 Theme 5: Explainable AI and Human-in-the-Loop Machine Learning

As machine learning models are increasingly deployed in high-stakes domains such as human resources, the need for model transparency and human oversight has become critical. This section reviews explainable AI (XAI) methods and human-in-the-loop (HITL) approaches relevant to ML-based risk scoring in HR contexts.

### 2.7.1 SHAP: A Unified Framework for Model Explainability

Lundberg and Lee (2017) introduced SHAP (SHapley Additive exPlanations), a unified framework for interpreting model predictions based on Shapley values from cooperative game theory. SHAP provides two levels of explanation: local explanations (why did the model make this specific prediction for this specific employee?) and global explanations (which features are most important across all predictions?). The framework unified six existing interpretability methods and provided theoretical guarantees — specifically, that SHAP values are the unique solution satisfying local accuracy, missingness, and consistency properties.

SHAP has become the dominant explainability method in ML research due to its model-agnostic nature — it can be applied to any machine learning model, including ensemble classifiers such as Random Forest. For HR applications, SHAP's ability to explain individual predictions is particularly valuable: rather than simply labelling an employee as "high risk," the system can explain which specific features drove that prediction and by how much, enabling HR managers to evaluate the reasoning behind each classification.

### 2.7.2 The Case for Explainability in HR

Adadi and Berrada (2018) surveyed the broader field of Explainable AI, classifying approaches along multiple dimensions: intrinsic versus post-hoc, model-specific versus model-agnostic, and local versus global explanations. Critically, they identified trust, transparency, and fairness as the primary drivers for XAI adoption in high-stakes domains. In HR contexts, explainability serves multiple purposes: (1) building HR managers' trust in ML predictions, (2) ensuring compliance with emerging AI regulations that require algorithmic transparency, (3) preventing discriminatory outcomes by making feature contributions visible, and (4) enabling informed human decision-making rather than blind reliance on automated predictions.

### 2.7.3 Human-in-the-Loop Machine Learning

Mosqueira-Rey et al. (2023) provided a comprehensive review of human-in-the-loop (HITL) machine learning, classifying approaches by the level of human involvement: active learning (model queries humans for labels on uncertain cases), interactive ML (humans iteratively guide model behaviour), and machine teaching (humans design training curricula for models). Their review found that HITL systems "improve model accuracy through iterative human feedback" and identified trust, control, and accountability as key benefits of keeping humans in the decision loop.

In the context of HR-based risk scoring, this is directly relevant: an active learning cycle where HR managers accept or reject ML predictions would generate ground truth for model retraining, improving prediction accuracy over time while ensuring that no automated adverse action is taken against employees without human review.

### 2.7.4 Synthesis

The reviewed literature establishes that the technical foundations for transparent, human-supervised ML systems are mature: SHAP provides robust model-agnostic explainability (Lundberg and Lee, 2017), the case for XAI in high-stakes HR decisions is well-established (Adadi and Berrada, 2018), and HITL systems demonstrate measurable accuracy improvements through iterative human feedback (Mosqueira-Rey et al., 2023). However, these three components — prediction, explanation, and feedback — remain disconnected in the literature. No reviewed system combines ML-based employee risk scoring with SHAP explainability and a structured HR feedback loop within an integrated ERP environment. Most XAI research remains theoretical or limited to experimental settings, with no deployment in operational HR contexts.

---

## 2.8 Theme 6: Enterprise Security

Security is a supporting but essential component of any enterprise system handling sensitive employee and financial data.

Ferraiolo, Kuhn, and Chandramouli (2007) established the definitive framework for Role-Based Access Control (RBAC), defining roles, permissions, role hierarchies, and constraints. The NIST RBAC standard has been widely adopted in enterprise systems and remains the primary approach for managing access control in multi-user environments with hierarchical permission structures.

Ahmed and Mahmood (2019) proposed an authentication scheme for web applications using JSON Web Tokens (JWT), demonstrating JWT as an efficient mechanism for stateless web application authentication. Their approach regenerates tokens on each client request using timestamp-based validation, enhancing session security. Combined with OTP-based verification as a second factor for sensitive operations, their work supports a layered security approach combining authentication, authorisation, and encryption — a pattern widely adopted in modern web-based enterprise systems.

Enterprise security is well-established in the literature, and no novelty is claimed in this domain. The reviewed works provide a mature foundation of established best practices — JWT for stateless authentication, RBAC for granular access control, and OTP for multi-factor verification — that any enterprise system handling sensitive employee and financial data should implement.

---

## 2.9 Comparison Table

Table 2.4 presents a comprehensive mapping of all reviewed works to the research questions, ML methods used, datasets employed, and key limitations.

**Table 2.4: Comparison of Reviewed Literature**

| # | Author(s) | Year | Focus Area | ML Method / Approach | Dataset / Context | Key Findings | RQs | Key Limitation |
|---|---|---|---|---|---|---|---|---|
| 1 | Albarghouthi et al. | 2024 | Cloud ERP for SMEs | Qualitative analysis | SME practitioners | Cloud ERP offers scalability but limited customisation | RQ7 | No ML or analytics integration |
| 2 | Chofreh et al. | 2021 | ERP adoption barriers | Literature review | SME context | Cost, expertise, and migration are key barriers | RQ7 | No predictive analytics component |
| 3 | Davenport | 1998 | ERP integration | Conceptual | Large enterprises | ERP as business process integrator | RQ1, RQ2 | Pre-cloud; no ML capabilities |
| 4 | Katuu | 2020 | ERP evolution | Literature review | Historical analysis | Trend toward AI-enhanced ERP | RQ7 | No implementation or evaluation |
| 5 | Fallucchi et al. | 2020 | Attrition prediction | Ensemble (GNB best) | IBM HR (1,470) | No single model is universally optimal | RQ4 | Low recall; no social signals |
| 6 | Jain & Nayyar | 2022 | Attrition prediction | Ensemble (92%) | IBM HR | Ensemble outperforms individual models | RQ4 | IBM dataset only; no ERP integration |
| 7 | Zhao & Hryniewicki | 2018 | Turnover prediction | XGBoost, RF, 10 algos | Multiple datasets | XGBoost generalises on noisy data | RQ4 | Standalone model; no deployment |
| 8 | Raza et al. | 2022 | Attrition prediction | Stacking (RF+XGB+LR) | IBM HR | SMOTE+PCA pushes accuracy >90% | RQ4 | No social or behavioural signals |
| 9 | Alao & Adeyemo | 2013 | Attrition analysis | Decision trees | 309 records (Nigeria) | ML can classify attrition patterns | RQ4 | Small dataset; single algorithm |
| 10 | Yadav et al. | 2018 | Attrition prediction | NB, SVM, RF (84%) | IBM HR | RF highest accuracy; salary key feature | RQ4 | Standard features only |
| 11 | Srivastava & Nair | 2018 | Attrition prediction | LR, SVM, RF, NN (>85%) | IBM HR | Feature selection critical for performance | RQ4 | Academic exercise; no deployment |
| 12 | Osman | 2025 | Attrition prediction | Hybrid model (95%) | IBM HR | Hybrid combining algorithms is most effective | RQ4 | Synthetic dataset; no novel features |
| 13 | Sajjadiani et al. | 2019 | Turnover prediction | ML on work histories | 16,071 applicants | Novel features from unstructured data | RQ4, RQ5 | Pre-hire only; not post-hire monitoring |
| 14 | Van Iddekinge et al. | 2016 | Social media assessment | Recruiter evaluation | Facebook profiles | Subjective SM ratings unrelated to outcomes | RQ3 | Subjective ratings, not structured signals |
| 15 | Roth et al. | 2016 | Social media in HR | Research agenda | Literature | Practice outpaces research in SM-HR | RQ3 | Agenda, not empirical study |
| 16 | De Jesus et al. | 2018 | LinkedIn prediction | Feature extraction | LinkedIn profiles | LinkedIn data predicts resignation | RQ3 | Privacy/API access limitations |
| 17 | Gupta & Sharma | 2022 | Enterprise SM + HR | Literature review | Enterprise SM | Social media data increasingly used in HR analytics | RQ3, RQ4 | Review; no implementation |
| 18 | Figueira & Vaz | 2024 | Synthetic data methods | Survey (GANs, Gaussian) | Multi-domain | Gaussian copulas effective for tabular data | RQ3 | General; not HR-specific |
| 19 | Gonzales et al. | 2023 | Synthetic data (health) | GMMs, statistical | Healthcare | GMMs outperform for tabular data; validation protocols | RQ3 | Healthcare domain only |
| 20 | Dahmen & Cook | 2019 | Synthetic sensor data | Gaussian generation | Sensor data | Statistical validation of Gaussian-generated data | RQ3 | Sensor domain; not social behaviour |
| 21 | Lundberg & Lee | 2017 | Model explainability | SHAP (Shapley values) | Multiple models | Unified explainability framework; theoretical guarantees | RQ5 | Computational cost for large models |
| 22 | Adadi & Berrada | 2018 | XAI survey | Survey | Multi-domain | Trust, transparency, fairness drive XAI adoption | RQ5 | No HR-specific implementation |
| 23 | Mosqueira-Rey et al. | 2023 | Human-in-the-loop ML | Survey (active learning) | Multi-domain | HITL improves accuracy via iterative feedback | RQ5 | General; no HR/ERP implementation |
| 24 | Ahmed & Mahmood | 2019 | Web authentication | JWT scheme | Web applications | JWT with timestamp-based regeneration for secure auth | RQ6 | Single authentication mechanism |
| 25 | Ferraiolo et al. | 2007 | Access control | RBAC model | Enterprise systems | NIST RBAC standard for enterprise access control | RQ6 | Pre-dates modern web auth |

---

## 2.10 Research Gap Analysis

The systematic review of 25 works across six thematic areas reveals a clear and consistent pattern: the three domains that NEXUS ERP aims to integrate — ERP operational automation, ML-based attrition prediction, and social behaviour signal analysis — exist in isolation in the current literature.

### 2.10.1 Three Isolated Silos

**Silo 1: ERP Systems Without ML.** The reviewed ERP literature (Davenport, 1998; Katuu, 2020; Albarghouthi et al., 2024; Chofreh et al., 2021) describes systems focused on operational automation — payroll, inventory, and process integration. While Katuu (2020) identifies a trend toward AI-enhanced ERP, no reviewed system implements ML-based workforce analytics within a functional ERP platform. Existing solutions like SAP and Odoo offer analytics modules, but these are expensive add-ons designed for large enterprises, not integrated components accessible to SMEs.

**Silo 2: ML Attrition Prediction Without ERP Integration.** The nine ML attrition studies reviewed (Alao and Adeyemo, 2013; Yadav et al., 2018; Srivastava and Nair, 2018; Zhao and Hryniewicki, 2018; Fallucchi et al., 2020; Jain and Nayyar, 2022; Raza et al., 2022; Osman, 2025; Sajjadiani et al., 2019) all operate on static datasets — primarily the IBM HR Analytics dataset. None of these models are integrated into operational systems where attendance, payroll, and behavioural data are actively generated and managed. The models receive features as input but do not participate in the data collection or operational workflow.

**Silo 3: Social Media Signals Without Formal Integration.** Research on social media in HR (Van Iddekinge et al., 2016; Roth et al., 2016; De Jesus et al., 2018; Gupta and Sharma, 2022) establishes that social behaviour contains predictive signals but does not provide a formal framework for quantifying these signals and integrating them into risk scoring. Van Iddekinge et al. (2016) demonstrated that subjective social media assessment is ineffective, underscoring the need for structured, quantified approaches.

### 2.10.2 The NEXUS ERP Contribution

NEXUS ERP bridges these three silos through three distinct contributions:

**Gap 1: Synthetic Social Behaviour Signals.** No prior work has formally defined a synthetic social behaviour signal using Gaussian sub-score modelling with a documented production pathway for future live API integration. While synthetic data generation techniques are well-established for tabular and healthcare data (Figueira and Vaz, 2024; Gonzales et al., 2023; Dahmen and Cook, 2019), and the IBM HR dataset precedent validates synthetic data use in HR research, these approaches focus on replicating existing datasets rather than generating novel proxy signals for data sources that are infeasible to access directly.

**Gap 2: ML-Integrated Lightweight ERP.** No reviewed system combines operational ERP data (attendance, payroll) with social behaviour signals into a unified risk scoring pipeline within a lightweight platform accessible to SMEs. Existing ERP systems lack ML capabilities (Theme 1), and existing ML attrition models lack ERP integration (Theme 2). This fragmentation means organisations must either invest in expensive enterprise solutions or operate ML models as disconnected tools.

**Gap 3: HITL ML Retraining in Operational HR Context.** While HITL approaches are well-studied (Mosqueira-Rey et al., 2023), and SHAP provides robust explainability (Lundberg and Lee, 2017), their combination within an operational HR system remains unexplored. No reviewed system implements a structured feedback loop where HR managers accept or reject ML predictions, and accumulated decisions become ground truth for model retraining — within an ERP environment that generates the underlying data. This gap represents a missed opportunity to bridge automated prediction and responsible HR decision-making, as identified by Adadi and Berrada (2018).

### 2.10.3 Gap Summary

Table 2.5 summarises the identified gap by showing which capabilities are present (Yes) or absent (No) in existing work compared to NEXUS ERP.

**Table 2.5: Gap Analysis — Existing Systems vs. NEXUS ERP**

| Capability | ERP Systems (SAP, Odoo) | ML Attrition Models | Social Media HR Research | NEXUS ERP |
|---|---|---|---|---|
| Payroll automation | Yes | No | No | Yes |
| Inventory management | Yes | No | No | Yes |
| ML-based attrition prediction | No | Yes | No | Yes |
| Social behaviour signals | No | No | Partial | Yes |
| Formal synthetic signal model | No | No | No | Yes |
| SHAP explainability | No | Rare | No | Yes |
| HR feedback loop for retraining | No | No | No | Yes |
| Integrated in single platform | Yes (operational only) | No (standalone) | No (research only) | Yes |
| Affordable for SMEs | No (expensive) | N/A | N/A | Yes |

---

## 2.11 Summary

This systematic literature review examined 25 works across six thematic areas relevant to the development of NEXUS ERP. The key findings from each theme are:

1. **ERP systems for SMEs** are evolving toward cloud-based and AI-enhanced platforms, but existing solutions lack integrated ML-based workforce analytics accessible to smaller organisations.

2. **Machine learning for attrition prediction** has achieved strong results, with ensemble methods and Random Forest consistently performing well (accuracy exceeding 90% in multiple studies). However, all reviewed models operate on static datasets disconnected from operational systems.

3. **Social media signals** contain meaningful predictive information for employee behaviour, but subjective assessment methods are ineffective, live API integration faces practical barriers, and no formal framework exists for quantifying and integrating these signals into enterprise systems.

4. **Synthetic data generation** using Gaussian-based methods is well-established and validated, with the IBM HR dataset providing a precedent for synthetic data in HR research. However, no prior work has formally documented a synthetic social behaviour signal with a production pathway.

5. **Explainable AI and HITL approaches** are individually mature, with SHAP providing robust model interpretability and HITL systems demonstrating improved accuracy through human feedback. Their integration into operational HR systems within an ERP context remains unexplored.

6. **Enterprise security** patterns (JWT, RBAC, OTP) are well-established and provide the foundational security architecture for NEXUS ERP.

The identified research gap — the absence of a system that integrates ERP operational automation, ML-powered risk scoring with social behaviour signals, SHAP explainability, and HR-driven feedback loops in a single lightweight platform for SMEs — establishes the research justification for NEXUS ERP. The following chapter describes the methodology adopted to design, develop, and evaluate this system.

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

[17] S.M. Lundberg and S.I. Lee, "A Unified Approach to Interpreting Model Predictions," in *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 30, 2017.

[18] D. Moher, A. Liberati, J. Tetzlaff, and D.G. Altman, "Preferred Reporting Items for Systematic Reviews and Meta-Analyses: The PRISMA Statement," *PLoS Medicine*, vol. 6, no. 7, Art. no. e1000097, 2009. doi: 10.1371/journal.pmed.1000097.

[19] E. Mosqueira-Rey, E. Hernandez-Pereira, D. Alonso-Rios, J. Bobes-Bascaran, and A. Fernandez-Leal, "Human-in-the-Loop Machine Learning: A State of the Art," *Artificial Intelligence Review*, vol. 56, pp. 3005–3054, 2023. doi: 10.1007/s10462-022-10246-w.

[20] M.H. Osman, "Predicting Employee Attrition: A Comparative Analysis of Machine Learning Models Using the IBM Human Resource Analytics Dataset," *Procedia Computer Science*, Elsevier, 2025.

[21] A. Raza, K. Munir, M.S. Almutairi, F. Younas, and M.M.S. Fareed, "Predictive Model of Employee Attrition Based on Stacking Ensemble Learning," *Expert Systems with Applications*, vol. 215, Art. no. 119364, 2023. doi: 10.1016/j.eswa.2022.119364.

[22] P.L. Roth, P. Bobko, C.H. Van Iddekinge, and J.B. Thatcher, "Social Media in Employee-Selection-Related Decisions: A Research Agenda for Uncharted Territory," *Journal of Management*, vol. 42, no. 1, pp. 269–298, 2016. doi: 10.1177/0149206313503018.

[23] S. Sajjadiani, A.J. Sojourner, J.D. Kammeyer-Mueller, and E. Mykerezi, "Using Machine Learning to Translate Applicant Work History into Predictors of Performance and Turnover," *Journal of Applied Psychology*, vol. 104, no. 10, pp. 1207–1225, 2019. doi: 10.1037/apl0000405.

[24] D.K. Srivastava and P. Nair, "Employee Attrition Analysis Using Predictive Techniques," in *Proc. Int. Conf. Information and Communication Technology for Intelligent Systems*, Springer, 2018.

[25] C.H. Van Iddekinge, S.E. Lanivich, P.L. Roth, and E. Junco, "Social Media for Selection? Validity and Adverse Impact Potential of a Facebook-Based Assessment," *Journal of Management*, vol. 42, no. 7, pp. 1811–1835, 2016. doi: 10.1177/0149206313515524.

[26] S. Yadav, A. Jain, and D. Singh, "Early Prediction of Employee Attrition using Data Mining Techniques," in *Proc. 8th Int. Conf. Intelligent Systems and Control (ISCO)*, IEEE, 2018.

[27] Y. Zhao and M.K. Hryniewicki, "Employee Turnover Prediction with Machine Learning: A Reliable Approach," in *Proc. 14th Int. Conf. Intelligent Computing*, Springer, 2018.
