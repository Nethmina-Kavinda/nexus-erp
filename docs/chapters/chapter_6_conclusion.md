# Chapter 6: Conclusion

## 6.1 Summary of Contributions

This thesis set out to address three interconnected gaps in SME-targeted HR technology: the absence of predictive workforce analytics in lightweight ERP systems, the disconnection between standalone ML attrition models and the operational systems that generate their input data, and the lack of a formally specified synthetic social behaviour signal with a documented pathway to live API data. NEXUS ERP was designed and developed as a unified response to all three gaps, producing three distinct research contributions.

**Contribution 1: Formally modelled synthetic social behaviour signal (RQ3).** A composite `social_score` (0.0–1.0) was designed using a Vector Auto-Regressive (VAR) model with Cholesky-decomposed multivariate Normal innovation across four behavioural sub-scores: `job_search` (weight 0.35), `post_drop` (0.25), `network_growth` (0.20), and `sentiment` (0.20). The weights and sub-score definitions are grounded in the literature reviewed in Chapter 2 (De Jesus et al., 2018; Roth et al., 2016). The model preserves temporal autocorrelation (α = 0.65) and cross-sub-score correlation (a 4×4 Cholesky-decomposed correlation matrix), producing signals that are statistically distinguishable from arbitrary noise. Chapter 5 validated the signal against five criteria: Gaussian-shaped sub-score distributions, observed means within the expected baseline range, all values bounded in [0.0, 1.0], moderate cross-sub-score Pearson correlations, and a measurable upward temporal drift for high-risk employees across six months. All five criteria were confirmed. The MongoDB `SocialScore` schema includes a `social_data_source` field defaulted to `'synthetic'` that transitions to `'linkedin_api'` when live integration is implemented, requiring no schema migration and providing a formally documented production pathway unique to this work.

**Contribution 2: ML-powered risk scoring integrated within a lightweight SME ERP (RQ4).** An eight-feature cross-module input vector, drawn from attendance, payroll, and social signal data, was constructed using a three-pass pipeline (sliding-window smoothing, leave-one-out department risk, global min-max normalisation) and fed into both a deterministic weighted composite formula and a Random Forest classifier deployed as a Python Flask microservice. The formula provides an always-available, interpretable score (0–100) mapped to four risk tiers. The Random Forest (200 trees, `class_weight='balanced'`, SMOTE oversampling, temporal train/val/test split) augments every prediction with SHAP feature-level explanations rendered as a waterfall chart in the HR interface, enabling HR managers to see not only a risk classification but the specific behavioural factors driving it. The Stage 2 model achieves a test accuracy of 83.0% and an F1 macro of 0.836, with SHAP analysis confirming `social_score` as the highest-importance feature (mean |SHAP| = 0.190), which empirically validates the core research signal.

**Contribution 3: Human-in-the-loop retraining with demonstrated measurable improvement (RQ5).** A structured HR feedback mechanism was implemented in which HR managers accept or override ML risk predictions; accumulated corrections are stored in the `HRDecisions` collection and become the ground truth for Stage 2 retraining. In the seeded evaluation dataset, 74 corrections were recorded (12.3% correction rate), of which 70 were Medium → High reclassifications representing employees the weighted formula underclassified due to social and behavioural patterns that exceeded the formula's threshold sensitivity. Stage 2 retraining on these corrected labels produced a +24.4-percentage-point improvement in F1 macro (0.592 → 0.836) and elevated the High-class F1 from 0.000 to 0.857. This demonstrates that HR domain expertise, when systematically captured as labelled corrections, produces a measurably better classifier on the most decision-relevant risk tier.

---

## 6.2 Research Questions Answered

Table 6.1 maps each of the seven research questions to the specific finding that answers it.

**Table 6.1: Research questions and findings**

| RQ | Question (abbreviated) | Finding |
|---|---|---|
| RQ1 | Automated attendance-to-payroll with statutory deductions | Implemented: EPF (8%), ETF (3%), overtime at 1.5×, late penalty at LKR 50/min, salary floored at zero. All 13 functional test cases including payroll correctness pass. |
| RQ2 | Real-time inventory monitoring with reorder alerts | Implemented: dual-tier (raw materials / finished goods), automated multi-recipient email alert triggered when `quantity ≤ reorder_level`. Alert confirmed in functional testing. |
| RQ3 | Formal synthetic `social_score` with validated statistical properties and documented API pathway | Confirmed: VAR model with Cholesky-MVN passes all five validation criteria (distribution shape, mean range, bounds, correlation structure, temporal drift). `social_data_source` field provides zero-migration pathway. |
| RQ4 | 8-feature cross-module risk scoring with RF classifier and SHAP explainability | Confirmed: Stage 2 test accuracy 83.0%, F1 macro 0.836, High-class F1 0.857. `social_score` is the top SHAP-ranked feature in both stages. SHAP waterfall chart rendered per prediction in HR interface. |
| RQ5 | HR feedback loop that demonstrably improves risk prediction accuracy | Confirmed: +24.4 pt F1 macro improvement (0.592 → 0.836) between Stage 1 (formula labels) and Stage 2 (HR-corrected labels). High-class F1 increases from 0.000 to 0.857. |
| RQ6 | Secure authentication and role-based session management | Confirmed: JWT with bcrypt, OTP two-factor verification, four-role RBAC middleware (Admin / HR Manager / Manager / Employee). Invalid and expired tokens correctly return 401; role violations return 403. |
| RQ7 | MERN stack effectiveness for integrated SME ERP with ML microservice | Confirmed: 22 Node.js REST endpoints, 3 Flask ML endpoints, 9 MongoDB collections, 8-page React SPA, all operational. Microservice separation provides language-optimal ML tooling (scikit-learn, SHAP) without compromising the Node.js layer. |

---

## 6.3 Limitations

Five limitations of the current study are acknowledged, each with implications for interpreting the results and for future deployment.

**Synthetic data throughout.** All employee records, attendance events, payroll figures, and social scores are computer-generated. The risk_bias parameter encodes ground-truth attrition propensity into the synthetic population, which enables rigorous ML evaluation; but the behavioural distributions in a real organisation will differ from those produced by the VAR model. Predictive accuracy on real-world data will require recalibration as genuine HR feedback accumulates. The evaluation results in Chapter 5 should be interpreted as demonstrating architectural and methodological validity, not as production performance guarantees.

**Dataset scale.** One hundred employees across six months produces 600 feature vectors, sufficient for prototype demonstration and Random Forest training with SMOTE augmentation, but a modest scale compared to enterprise HR datasets. The n_estimators tuning curve is flat at 0.93–0.95 across all tested tree counts, which reflects dataset saturation rather than genuine hyperparameter sensitivity. At larger employee populations, both the feature space and the class distribution will behave differently, and the temporal split will span more months, potentially revealing drift patterns not visible at this scale.

**Single-threaded ML microservice.** The Flask ML service runs on Werkzeug's single-threaded development server. Under concurrent load, such as multiple HR managers triggering predictions or retraining at the same time, requests will queue rather than execute in parallel. Production deployment requires replacing Werkzeug with gunicorn (multiple worker processes) or uvicorn (async).

**Sri Lankan statutory rates hardcoded.** The EPF rate (8%) and ETF rate (3%) are constants in `backend/utils/payrollCalculator.js` specific to Sri Lankan labour law. Deploying the system in another jurisdiction requires a configurable deduction-rule layer rather than hardcoded constants.

**No live social API integration.** The `social_score` is entirely synthetic. While the signal is formally modelled and statistically validated, its predictive value in a production setting depends on whether real LinkedIn and Facebook behavioural patterns follow the distributional assumptions of the VAR model. This remains an empirical question to be addressed when live API integration is implemented.

---

## 6.4 Future Work

Four directions are identified as the most impactful extensions of this work.

**1. Live social API integration.** The highest-priority extension is replacing the synthetic `social_score` with data sourced from the LinkedIn API or a Facebook-approved data partner. The `social_data_source` field in the `SocialScores` schema is the designed transition point: the ingestion pipeline sets it to `'linkedin_api'` on newly created records, and no schema migration is required. The ML pipeline, SHAP explainability layer, and HR interface are entirely agnostic to data provenance. The primary work required is OAuth consent workflow design, ethical review board approval for employee data collection, and LinkedIn/Facebook developer programme application. None of these are engineering obstacles; they are procedural ones.

**2. Dynamic weight recalibration using SHAP importances.** The weighted composite formula uses static weights calibrated from the literature at system design time. As the Stage 2 model accumulates HR feedback and the `social_score` SHAP importance grows (it increased by 0.044 between Stage 1 and Stage 2 in the current evaluation), the formula weights become progressively misaligned with the model's learned feature importance. A scheduled recalibration process, triggered after each retraining cycle, could read the current mean absolute SHAP values from the Stage 2 model and update the formula weights proportionally. This would keep the deterministic fallback path semantically aligned with the ML path and reduce the gap between formula-based and model-based risk scores.

**3. Mobile application.** The current frontend is a React web SPA. HR managers frequently need to review employee risk alerts and approve or reject predictions while away from a desktop workstation. A React Native mobile application sharing the same REST API would enable push-notification-driven HITL review. An HR manager could respond to a WRL breach alert from a mobile notification in under a minute instead of waiting until they are at a desktop. The Node.js backend requires no changes; only the frontend layer would be extended.

**4. Production deployment and scaling.** The development-mode configuration (Werkzeug dev server, local MongoDB instance, Vite development server) is unsuitable for production. The recommended production stack is: gunicorn with four workers for the Flask microservice; MongoDB Atlas for managed cloud database with replica sets and automated backups; a reverse proxy (nginx) serving the Vite-built React SPA as static files; and environment-specific configuration injected via a secrets manager rather than `.env` files. Horizontal scaling of the Node.js backend behind a load balancer would be straightforward given the stateless JWT architecture; no session affinity is required.

---

## 6.5 Concluding Remarks

NEXUS ERP demonstrates that a lightweight MERN-stack ERP system can serve as a complete decision-support platform, combining automated payroll and inventory operations with ML-powered workforce risk analytics, at a cost and complexity level accessible to small-to-medium enterprises. The three research contributions collectively close a gap that neither standalone ERP systems nor standalone ML attrition models have addressed: the integration of live operational data, formally modelled behavioural signals, machine-learned risk classifications, and human domain expertise into a single, coherent feedback loop.

The central empirical result is a 24.4-percentage-point F1 macro improvement from human-in-the-loop retraining, driven by 74 HR corrections that the model used to learn what the weighted formula could not express. It illustrates a broader principle: the most valuable component of an HR analytics system is not the algorithm, but the structured mechanism that allows human judgement to continuously improve it. NEXUS ERP provides that mechanism. Future work to integrate live social API data and deploy the system at scale will determine how well the architecture generalises beyond its synthetic prototype; the evaluation results in Chapter 5 establish that the architecture itself is sound.
