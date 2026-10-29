"""
OIL India Safe-X: Reproducible ML Training & Evaluation Pipeline
Baseline: TF-IDF with Calibrated Multinomial Logistic Regression Classifiers.

Multi-Target Prediction:
1. hazard (10 classes)
2. report_type (4 classes)
3. sif_potential (3 classes)
4. severity (4 classes)
5. sif_precursor (9 classes)

Leakage Prevention:
- Stratified 80/20 train/test split.
- Vectorizer is fitted strictly on the training set.
- Test set is evaluated independently.
- Evaluation scores are saved verbatim to metrics.json without fabrication.
"""

import os
import json
import re
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support

MODEL_VERSION = "v1.0.0"

def clean_text(text: str) -> str:
    """Preprocess text while preserving domain-critical numbers and symbols."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def train_pipeline(data_path: str, output_dir: str):
    print("=" * 70)
    print("OIL INDIA SAFE-X: MODEL TRAINING & RIGOROUS EVALUATION")
    print(f"Version: {MODEL_VERSION} | Timestamp: {datetime.utcnow().isoformat()}Z")
    print("=" * 70)

    # 1. Load Data
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} records from {data_path}")

    df['cleaned_narrative'] = df['narrative'].apply(clean_text)

    # 2. Stratified Train/Test Split (Prevent Data Leakage)
    train_df, test_df = train_test_split(
        df,
        test_size=0.20,
        random_state=42,
        stratify=df['hazard']
    )

    print(f"Train samples: {len(train_df)} (80%) | Test samples: {len(test_df)} (20%)")

    # 3. Fit Vectorizer Strictly on Training Set
    vectorizer = TfidfVectorizer(
        sublinear_tf=True,
        ngram_range=(1, 2),
        max_features=2500,
        min_df=1,
        stop_words='english'
    )

    X_train = vectorizer.fit_transform(train_df['cleaned_narrative'])
    X_test = vectorizer.transform(test_df['cleaned_narrative'])

    print(f"TF-IDF Vocabulary Size: {len(vectorizer.vocabulary_)} features")

    # Targets to train
    targets = {
        'hazard': LogisticRegression(C=2.5, max_iter=1000, class_weight='balanced', random_state=42),
        'report_type': LogisticRegression(C=2.0, max_iter=1000, class_weight='balanced', random_state=42),
        'sif_potential': LogisticRegression(C=2.0, max_iter=1000, class_weight='balanced', random_state=42),
        'severity': LogisticRegression(C=2.0, max_iter=1000, class_weight='balanced', random_state=42),
        'sif_precursor': LogisticRegression(C=2.5, max_iter=1000, class_weight='balanced', random_state=42),
    }

    models = {}
    evaluation_metrics = {
        "version": MODEL_VERSION,
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "dataset_total": len(df),
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "targets": {}
    }

    feature_names = vectorizer.get_feature_names_out()

    for target_name, classifier in targets.items():
        print(f"\n--- Training Target: {target_name.upper()} ---")
        y_train = train_df[target_name]
        y_test = test_df[target_name]

        classifier.fit(X_train, y_train)
        models[target_name] = classifier

        # Predictions on held-out test set
        y_pred = classifier.predict(X_test)
        y_prob = classifier.predict_proba(X_test)

        acc = accuracy_score(y_test, y_pred)
        p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average='macro', zero_division=0)
        p_wt, r_wt, f1_wt, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted', zero_division=0)

        clf_report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

        print(f"Accuracy: {acc:.4f} | Weighted F1: {f1_wt:.4f} | Macro F1: {f1_macro:.4f}")

        # Top predictive keywords per class for explainability & evidence extraction
        top_features_per_class = {}
        if hasattr(classifier, 'coef_') and hasattr(classifier, 'classes_'):
            for idx, cls_name in enumerate(classifier.classes_):
                coef = classifier.coef_[idx]
                top_idx = np.argsort(coef)[-10:]
                top_features_per_class[str(cls_name)] = [feature_names[i] for i in reversed(top_idx)]

        evaluation_metrics["targets"][target_name] = {
            "accuracy": round(float(acc), 4),
            "macro_f1": round(float(f1_macro), 4),
            "weighted_f1": round(float(f1_wt), 4),
            "macro_precision": round(float(p_macro), 4),
            "macro_recall": round(float(r_macro), 4),
            "classes": [str(c) for c in classifier.classes_],
            "classification_report": clf_report,
            "top_features": top_features_per_class
        }

    # 4. Save Model Bundle
    version_dir = os.path.join(output_dir, MODEL_VERSION)
    os.makedirs(version_dir, exist_ok=True)

    bundle = {
        "version": MODEL_VERSION,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "vectorizer": vectorizer,
        "models": models,
        "metrics": evaluation_metrics,
        "classes": {k: [str(c) for c in m.classes_] for k, m in models.items()}
    }

    model_filepath = os.path.join(version_dir, f"safety_classifier_{MODEL_VERSION}.joblib")
    joblib.dump(bundle, model_filepath)
    print(f"\n[OK] Model bundle saved to: {model_filepath}")

    # Save latest pointer
    latest_filepath = os.path.join(output_dir, "latest.joblib")
    joblib.dump(bundle, latest_filepath)
    print(f"[OK] Latest model pointer updated: {latest_filepath}")

    # Save evaluation report JSON
    metrics_path = os.path.join(version_dir, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(evaluation_metrics, f, indent=2)
    print(f"[OK] Evaluation metrics exported to: {metrics_path}")

    return bundle, evaluation_metrics

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(base_dir, "data", "safety_incidents.csv")
    models_dir = os.path.join(base_dir, "models")
    train_pipeline(data_file, models_dir)
