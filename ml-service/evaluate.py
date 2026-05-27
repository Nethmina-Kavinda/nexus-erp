"""
NEXUS ERP — ML Evaluation Script
Generates all Chapter 5 artifacts: confusion matrices, SHAP plots,
stage comparison table, social score validation, n_estimators tuning.

Usage: python evaluate.py
Output: evaluation_output/ directory with PNGs and JSON
"""

import os
import json
import numpy as np
import pandas as pd
from pymongo import MongoClient
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    precision_recall_fscore_support, f1_score
)
from imblearn.over_sampling import SMOTE
import shap
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from config import MONGO_URI, FEATURE_NAMES, CLASS_NAMES

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'evaluation_output')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Dark theme for plots matching NEXUS UI
plt.rcParams.update({
    'figure.facecolor': '#0A0E1A',
    'axes.facecolor': '#111827',
    'axes.edgecolor': '#1E2D45',
    'axes.labelcolor': '#94A3B8',
    'text.color': '#F1F5F9',
    'xtick.color': '#94A3B8',
    'ytick.color': '#94A3B8',
    'grid.color': '#1E2D45',
    'font.family': 'sans-serif',
    'font.size': 10,
})

RISK_COLORS = {'Low': '#14B8A6', 'Medium': '#F59E0B', 'High': '#3B82F6', 'Critical': '#EF4444'}


def load_data():
    """Load feature vectors and labels from MongoDB."""
    client = MongoClient(MONGO_URI)
    db = client['nexus_erp']

    features_df = pd.DataFrame(list(db.employeefeatures.find({})))
    risk_scores = {(str(r['employee_id']), r['month']): r['risk_class']
                   for r in db.riskscores.find({})}

    decisions = {}
    for d in db.hrdecisions.find({}):
        key = (str(d['employee_id']), d['month'])
        decisions[key] = d['corrected_class'] or d['original_class']

    social_scores = pd.DataFrame(list(db.socialscores.find({})))
    employees = pd.DataFrame(list(db.employees.find({}).sort('name', 1)))

    client.close()

    # Assign labels
    features_df['label_stage1'] = features_df.apply(
        lambda r: risk_scores.get((str(r['employee_id']), r['month'])), axis=1)

    features_df['label_stage2'] = features_df.apply(
        lambda r: decisions.get((str(r['employee_id']), r['month']),
                                risk_scores.get((str(r['employee_id']), r['month']))), axis=1)

    return features_df, social_scores, employees


def temporal_split(df):
    """Split data into train (months 1-4), val (month 5), test (month 6)."""
    months = sorted(df['month'].unique())
    train = df[df['month'].isin(months[:4])]
    val = df[df['month'] == months[4]] if len(months) > 4 else pd.DataFrame()
    test = df[df['month'] == months[5]] if len(months) > 5 else pd.DataFrame()
    return train, val, test


def train_model(X_train, y_train, n_estimators=200):
    """Train RF with SMOTE."""
    class_counts = pd.Series(y_train).value_counts()
    min_size = class_counts.min()
    k = min(5, min_size - 1) if min_size > 1 else 1

    try:
        smote = SMOTE(random_state=42, k_neighbors=k)
        X_res, y_res = smote.fit_resample(X_train, y_train)
    except Exception:
        X_res, y_res = X_train, y_train

    rf = RandomForestClassifier(
        n_estimators=n_estimators, class_weight='balanced',
        random_state=42, max_depth=None
    )
    rf.fit(X_res, y_res)
    return rf


def plot_confusion_matrix(y_true, y_pred, title, filename):
    """Plot and save confusion matrix."""
    labels = sorted(set(y_true) | set(y_pred))
    cm = confusion_matrix(y_true, y_pred, labels=labels)

    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, interpolation='nearest', cmap='Blues', alpha=0.8)

    ax.set_xticks(range(len(labels)))
    ax.set_yticks(range(len(labels)))
    ax.set_xticklabels(labels, fontsize=9)
    ax.set_yticklabels(labels, fontsize=9)
    ax.set_xlabel('Predicted', fontsize=11)
    ax.set_ylabel('Actual', fontsize=11)
    ax.set_title(title, fontsize=13, fontweight='bold', pad=12)

    for i in range(len(labels)):
        for j in range(len(labels)):
            color = '#F1F5F9' if cm[i, j] > cm.max() / 2 else '#94A3B8'
            ax.text(j, i, str(cm[i, j]), ha='center', va='center',
                    fontsize=14, fontweight='bold', color=color)

    fig.colorbar(im, ax=ax, shrink=0.8)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, filename), dpi=150, bbox_inches='tight')
    plt.close()
    print(f'  Saved {filename}')


def plot_feature_importance(model, title, filename):
    """Plot RF feature importance bar chart."""
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]

    fig, ax = plt.subplots(figsize=(8, 5))
    colors = ['#3B82F6' if i != indices[0] else '#8B5CF6' for i in range(len(FEATURE_NAMES))]
    sorted_colors = [colors[i] for i in indices]

    bars = ax.barh(
        [FEATURE_NAMES[i] for i in indices[::-1]],
        importances[indices[::-1]],
        color=sorted_colors[::-1],
        edgecolor='none',
        height=0.6
    )

    ax.set_xlabel('Importance', fontsize=11)
    ax.set_title(title, fontsize=13, fontweight='bold', pad=12)
    ax.grid(axis='x', alpha=0.3)

    for bar, val in zip(bars, importances[indices[::-1]]):
        ax.text(val + 0.005, bar.get_y() + bar.get_height() / 2,
                f'{val:.3f}', va='center', fontsize=9, color='#94A3B8',
                fontfamily='monospace')

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, filename), dpi=150, bbox_inches='tight')
    plt.close()
    print(f'  Saved {filename}')


def plot_shap_summary(model, X, feature_names, title, filename):
    """Plot the SHAP mean-|value| bar (Stage 2).

    This is the headline Explainability artifact for thesis Chapter 5: it
    shows which of the 8 features the trained model actually relies on and
    is the visual proof of Research Pillar 2 (XAI for HR decisions).
    """
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    # For multi-class, average absolute SHAP across classes
    if isinstance(shap_values, list):
        shap_mean = np.mean([np.abs(sv) for sv in shap_values], axis=0)
    elif shap_values.ndim == 3:
        shap_mean = np.mean(np.abs(shap_values), axis=2)
    else:
        shap_mean = np.abs(shap_values)

    mean_importance = shap_mean.mean(axis=0)
    indices = np.argsort(mean_importance)[::-1]

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.barh(
        [feature_names[i] for i in indices[::-1]],
        mean_importance[indices[::-1]],
        color='#8B5CF6',
        edgecolor='none',
        height=0.6
    )
    ax.set_xlabel('Mean |SHAP Value|', fontsize=11)
    ax.set_title(title, fontsize=13, fontweight='bold', pad=12)
    ax.grid(axis='x', alpha=0.3)

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, filename), dpi=150, bbox_inches='tight')
    plt.close()
    print(f'  Saved {filename}')


def plot_n_estimators_curve(X_train, y_train, X_val, y_val):
    """Plot validation accuracy across n_estimators ∈ {50, 100, 150, 200, 300, 500}.

    The curve is the empirical justification for the production choice of
    `n_estimators=200` in RiskModel.train. The plateau visible in the chart
    is the figure cited in thesis Chapter 5 to argue that doubling tree
    count past 200 buys negligible accuracy at meaningful compute cost.
    """
    n_values = [50, 100, 150, 200, 300, 500]
    accuracies = []

    for n in n_values:
        rf = train_model(X_train, y_train, n_estimators=n)
        acc = accuracy_score(y_val, rf.predict(X_val))
        accuracies.append(acc)

    fig, ax = plt.subplots(figsize=(7, 4))
    ax.plot(n_values, accuracies, 'o-', color='#3B82F6', linewidth=2, markersize=8)
    ax.fill_between(n_values, accuracies, alpha=0.1, color='#3B82F6')
    ax.set_xlabel('Number of Trees (n_estimators)', fontsize=11)
    ax.set_ylabel('Validation Accuracy', fontsize=11)
    ax.set_title('n_estimators Tuning Curve', fontsize=13, fontweight='bold', pad=12)
    ax.grid(alpha=0.3)

    for n, acc in zip(n_values, accuracies):
        ax.annotate(f'{acc:.2f}', (n, acc), textcoords='offset points',
                    xytext=(0, 10), ha='center', fontsize=9, color='#94A3B8',
                    fontfamily='monospace')

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'n_estimators_curve.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print('  Saved n_estimators_curve.png')

    return dict(zip(n_values, [round(a, 4) for a in accuracies]))


def plot_social_score_validation(social_df, employees_df):
    """Validate social score distributions (Gaussian shape, temporal drift)."""
    if social_df.empty:
        print('  No social score data found')
        return

    sub_scores = ['job_search', 'post_drop', 'network_growth', 'sentiment']

    # 1. Histograms of sub-score distributions
    fig, axes = plt.subplots(2, 2, figsize=(10, 8))
    for idx, (ax, score) in enumerate(zip(axes.flat, sub_scores)):
        values = social_df[score].dropna()
        ax.hist(values, bins=20, color='#8B5CF6', alpha=0.7, edgecolor='#1E2D45')
        ax.set_title(score.replace('_', ' ').title(), fontsize=11, fontweight='bold')
        ax.set_xlabel('Value')
        ax.set_ylabel('Count')
        ax.axvline(values.mean(), color='#EF4444', linestyle='--', linewidth=1.5, label=f'mean={values.mean():.3f}')
        ax.legend(fontsize=8)

    fig.suptitle('Social Sub-Score Distributions', fontsize=14, fontweight='bold', y=1.02)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'social_score_histograms.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print('  Saved social_score_histograms.png')

    # 2. Correlation matrix of sub-scores
    corr = social_df[sub_scores].corr()
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(corr.values, cmap='RdBu_r', vmin=-1, vmax=1)

    ax.set_xticks(range(len(sub_scores)))
    ax.set_yticks(range(len(sub_scores)))
    ax.set_xticklabels([s.replace('_', '\n') for s in sub_scores], fontsize=9)
    ax.set_yticklabels([s.replace('_', '\n') for s in sub_scores], fontsize=9)

    for i in range(len(sub_scores)):
        for j in range(len(sub_scores)):
            ax.text(j, i, f'{corr.values[i, j]:.2f}', ha='center', va='center',
                    fontsize=11, fontweight='bold', color='#F1F5F9')

    fig.colorbar(im, ax=ax, shrink=0.8)
    ax.set_title('Sub-Score Correlation Matrix', fontsize=13, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'social_score_correlation.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print('  Saved social_score_correlation.png')

    # 3. Temporal drift plots (high-risk vs low-risk trajectories)
    if not employees_df.empty and 'risk_bias' in employees_df.columns:
        fig, ax = plt.subplots(figsize=(8, 5))
        months_sorted = sorted(social_df['month'].unique())

        # Find high-risk and low-risk employees
        high_risk = employees_df.nlargest(2, 'risk_bias')
        low_risk = employees_df.nsmallest(2, 'risk_bias')

        for _, emp in high_risk.iterrows():
            emp_scores = social_df[social_df['employee_id'] == emp['_id']].sort_values('month')
            if not emp_scores.empty:
                ax.plot(range(len(emp_scores)), emp_scores['social_score'].values,
                        'o-', color='#EF4444', linewidth=2, markersize=6,
                        label=f'{emp["name"]} (bias={emp["risk_bias"]:.2f})', alpha=0.8)

        for _, emp in low_risk.iterrows():
            emp_scores = social_df[social_df['employee_id'] == emp['_id']].sort_values('month')
            if not emp_scores.empty:
                ax.plot(range(len(emp_scores)), emp_scores['social_score'].values,
                        'o-', color='#14B8A6', linewidth=2, markersize=6,
                        label=f'{emp["name"]} (bias={emp["risk_bias"]:.2f})', alpha=0.8)

        ax.set_xlabel('Month', fontsize=11)
        ax.set_ylabel('Social Score', fontsize=11)
        ax.set_title('Social Score Temporal Drift', fontsize=13, fontweight='bold', pad=12)
        ax.set_xticks(range(len(months_sorted)))
        ax.set_xticklabels(months_sorted, fontsize=9)
        ax.legend(fontsize=8, loc='upper left')
        ax.grid(alpha=0.3)

        plt.tight_layout()
        plt.savefig(os.path.join(OUTPUT_DIR, 'social_score_drift.png'), dpi=150, bbox_inches='tight')
        plt.close()
        print('  Saved social_score_drift.png')

    # 4. Mean/Std table
    stats = {}
    for score in sub_scores + ['social_score']:
        values = social_df[score].dropna()
        stats[score] = {'mean': round(values.mean(), 4), 'std': round(values.std(), 4),
                        'min': round(values.min(), 4), 'max': round(values.max(), 4)}

    return stats


def run_evaluation():
    """Main evaluation pipeline."""
    print('\n' + '=' * 50)
    print(' NEXUS ERP - ML Evaluation Pipeline')
    print('=' * 50 + '\n')

    features_df, social_df, employees_df = load_data()
    train_df, val_df, test_df = temporal_split(features_df)

    X_train = train_df[FEATURE_NAMES].values
    X_val = val_df[FEATURE_NAMES].values if len(val_df) > 0 else np.array([])
    X_test = test_df[FEATURE_NAMES].values if len(test_df) > 0 else np.array([])

    results = {}

    # ========== Stage 1 ==========
    print('[1/7] Training Stage 1 (formula labels)...')
    y_train_s1 = train_df['label_stage1'].values
    y_val_s1 = val_df['label_stage1'].values if len(val_df) > 0 else np.array([])
    y_test_s1 = test_df['label_stage1'].values if len(test_df) > 0 else np.array([])

    model_s1 = train_model(X_train, y_train_s1)

    if len(X_val) > 0:
        y_pred_val_s1 = model_s1.predict(X_val)
        results['stage1_val_accuracy'] = round(accuracy_score(y_val_s1, y_pred_val_s1), 4)

    if len(X_test) > 0:
        y_pred_test_s1 = model_s1.predict(X_test)
        results['stage1_test_accuracy'] = round(accuracy_score(y_test_s1, y_pred_test_s1), 4)
        results['stage1_f1_macro'] = round(f1_score(y_test_s1, y_pred_test_s1, average='macro', zero_division=0), 4)
        results['stage1_report'] = classification_report(y_test_s1, y_pred_test_s1, zero_division=0, output_dict=True)

        plot_confusion_matrix(y_test_s1, y_pred_test_s1,
                              'Stage 1 Confusion Matrix (Formula Labels)',
                              'confusion_matrix_stage1.png')

    plot_feature_importance(model_s1, 'Feature Importance - Stage 1', 'feature_importance_stage1.png')

    # ========== Stage 2 ==========
    print('[2/7] Training Stage 2 (HR-corrected labels)...')
    y_train_s2 = train_df['label_stage2'].values
    y_val_s2 = val_df['label_stage2'].values if len(val_df) > 0 else np.array([])
    y_test_s2 = test_df['label_stage2'].values if len(test_df) > 0 else np.array([])

    model_s2 = train_model(X_train, y_train_s2)

    if len(X_val) > 0:
        y_pred_val_s2 = model_s2.predict(X_val)
        results['stage2_val_accuracy'] = round(accuracy_score(y_val_s2, y_pred_val_s2), 4)

    if len(X_test) > 0:
        y_pred_test_s2 = model_s2.predict(X_test)
        results['stage2_test_accuracy'] = round(accuracy_score(y_test_s2, y_pred_test_s2), 4)
        results['stage2_f1_macro'] = round(f1_score(y_test_s2, y_pred_test_s2, average='macro', zero_division=0), 4)
        results['stage2_report'] = classification_report(y_test_s2, y_pred_test_s2, zero_division=0, output_dict=True)

        plot_confusion_matrix(y_test_s2, y_pred_test_s2,
                              'Stage 2 Confusion Matrix (HR-Corrected Labels)',
                              'confusion_matrix_stage2.png')

    plot_feature_importance(model_s2, 'Feature Importance - Stage 2', 'feature_importance_stage2.png')

    # ========== SHAP Analysis ==========
    print('[3/7] SHAP analysis...')
    X_all = features_df[FEATURE_NAMES].values
    plot_shap_summary(model_s2, X_all, FEATURE_NAMES,
                      'SHAP Feature Importance (Stage 2)', 'shap_summary.png')

    # ========== SHAP Drift (Stage 1 vs Stage 2) ==========
    print('[4/7] SHAP drift analysis...')
    explainer_s1 = shap.TreeExplainer(model_s1)
    explainer_s2 = shap.TreeExplainer(model_s2)
    shap_s1 = explainer_s1.shap_values(X_all)
    shap_s2 = explainer_s2.shap_values(X_all)

    def mean_abs_shap(sv):
        if isinstance(sv, list):
            return np.mean([np.abs(s).mean(axis=0) for s in sv], axis=0)
        elif sv.ndim == 3:
            return np.mean(np.abs(sv), axis=(0, 2))
        return np.abs(sv).mean(axis=0)

    importance_s1 = mean_abs_shap(shap_s1)
    importance_s2 = mean_abs_shap(shap_s2)

    rank_s1 = np.argsort(-importance_s1)
    rank_s2 = np.argsort(-importance_s2)

    drift_table = []
    for i, feat in enumerate(FEATURE_NAMES):
        r1 = int(np.where(rank_s1 == i)[0][0]) + 1
        r2 = int(np.where(rank_s2 == i)[0][0]) + 1
        delta = round(float(importance_s2[i] - importance_s1[i]), 6)
        drift_table.append({
            'feature': feat, 'stage1_rank': r1, 'stage2_rank': r2,
            'stage1_importance': round(float(importance_s1[i]), 6),
            'stage2_importance': round(float(importance_s2[i]), 6),
            'delta': delta
        })

    drift_table.sort(key=lambda x: x['stage2_rank'])
    results['shap_drift'] = drift_table

    # Plot drift comparison
    fig, ax = plt.subplots(figsize=(9, 5))
    x = np.arange(len(FEATURE_NAMES))
    w = 0.35
    sorted_feats = [d['feature'] for d in drift_table]
    s1_vals = [d['stage1_importance'] for d in drift_table]
    s2_vals = [d['stage2_importance'] for d in drift_table]

    ax.barh(x - w/2, s1_vals, w, label='Stage 1', color='#3B82F6', alpha=0.7)
    ax.barh(x + w/2, s2_vals, w, label='Stage 2', color='#8B5CF6', alpha=0.7)
    ax.set_yticks(x)
    ax.set_yticklabels(sorted_feats, fontsize=9)
    ax.set_xlabel('Mean |SHAP Value|', fontsize=11)
    ax.set_title('SHAP Drift: Stage 1 vs Stage 2', fontsize=13, fontweight='bold', pad=12)
    ax.legend(fontsize=9)
    ax.grid(axis='x', alpha=0.3)
    ax.invert_yaxis()

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'shap_drift.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print('  Saved shap_drift.png')

    # ========== n_estimators Tuning ==========
    print('[5/7] n_estimators tuning curve...')
    if len(X_val) > 0:
        tuning = plot_n_estimators_curve(X_train, y_train_s2, X_val, y_val_s2)
        results['n_estimators_tuning'] = tuning

    # ========== Social Score Validation ==========
    print('[6/7] Social score validation...')
    # Load employees with risk_bias for drift plots
    client = MongoClient(MONGO_URI)
    db = client['nexus_erp']
    emps_with_bias = pd.DataFrame(list(db.employees.find({}).sort('name', 1)))
    client.close()

    social_stats = plot_social_score_validation(social_df, emps_with_bias)
    if social_stats:
        results['social_score_stats'] = social_stats

    # ========== Feature Correlation Matrix ==========
    print('[7/7] Feature correlation matrix...')
    corr = features_df[FEATURE_NAMES].corr()
    fig, ax = plt.subplots(figsize=(8, 7))
    im = ax.imshow(corr.values, cmap='RdBu_r', vmin=-1, vmax=1)

    ax.set_xticks(range(len(FEATURE_NAMES)))
    ax.set_yticks(range(len(FEATURE_NAMES)))
    ax.set_xticklabels([f.replace('_', '\n') for f in FEATURE_NAMES], fontsize=8)
    ax.set_yticklabels([f.replace('_', '\n') for f in FEATURE_NAMES], fontsize=8)

    for i in range(len(FEATURE_NAMES)):
        for j in range(len(FEATURE_NAMES)):
            ax.text(j, i, f'{corr.values[i, j]:.2f}', ha='center', va='center',
                    fontsize=8, color='#F1F5F9')

    fig.colorbar(im, ax=ax, shrink=0.8)
    ax.set_title('Feature Correlation Matrix', fontsize=13, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'feature_correlation.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print('  Saved feature_correlation.png')

    results['feature_correlation'] = {
        f1: {f2: round(corr.loc[f1, f2], 4) for f2 in FEATURE_NAMES}
        for f1 in FEATURE_NAMES
    }

    # ========== Stage Comparison Summary ==========
    print('\n' + '=' * 50)
    print(' STAGE COMPARISON TABLE (Chapter 5)')
    print('=' * 50)
    print(f'{"Metric":<25} {"Stage 1":>10} {"Stage 2":>10} {"Delta":>10}')
    print('-' * 55)

    metrics = [
        ('Val Accuracy', 'val_accuracy'),
        ('Test Accuracy', 'test_accuracy'),
        ('F1 (macro)', 'f1_macro'),
    ]
    for label, key in metrics:
        s1 = results.get(f'stage1_{key}', 0)
        s2 = results.get(f'stage2_{key}', 0)
        delta = s2 - s1
        sign = '+' if delta >= 0 else ''
        print(f'{label:<25} {s1:>10.4f} {s2:>10.4f} {sign}{delta:>9.4f}')

    results['stage_comparison'] = {
        'stage1': {k: results.get(f'stage1_{k}', None) for k in ['val_accuracy', 'test_accuracy', 'f1_macro']},
        'stage2': {k: results.get(f'stage2_{k}', None) for k in ['val_accuracy', 'test_accuracy', 'f1_macro']},
    }

    # Save all results as JSON
    json_path = os.path.join(OUTPUT_DIR, 'evaluation_results.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    print(f'\nAll results saved to {json_path}')

    # List all generated files
    print(f'\nGenerated files in {OUTPUT_DIR}/:')
    for fname in sorted(os.listdir(OUTPUT_DIR)):
        fpath = os.path.join(OUTPUT_DIR, fname)
        size = os.path.getsize(fpath)
        print(f'  {fname:<45} {size:>8,} bytes')

    print('\nEvaluation complete.')


if __name__ == '__main__':
    run_evaluation()
