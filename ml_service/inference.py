"""
OIL India Safe-X: Machine Learning Inference Engine
Loads trained model bundle, validates inputs, evaluates uncertainty,
and performs multi-target classification with verbatim evidence extraction.
"""

import os
import re
import joblib
import numpy as np
from typing import Dict, List, Any, Optional

DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "latest.joblib")

# Knowledge mapping for barrier, exposure, and control failure correlation
HAZARD_TO_BARRIER = {
    "Fall from Height": "Fall Protection System",
    "Hydrocarbon Gas Release": "Gas Detection & Monitoring",
    "Hydrogen Sulfide (H2S)": "Gas Detection & Monitoring",
    "Stored / Residual Energy": "Energy Isolation (LOTO)",
    "High Pressure Fluid": "Pressure Relief & Bleedoff System",
    "Dropped Object": "Certified Lifting Rigging & Plan",
    "Line of Fire (Machinery/Tension)": "Exclusion Zone & Barricading",
    "Oxygen Deficiency / Toxic Fumes": "Ventilation & Air Monitoring",
    "Ignition Source in Hazardous Zone": "Hot Work Isolation & Fire Watch",
    "Structural Instability": "Exclusion Zone & Barricading"
}

HAZARD_TO_IOGP = {
    "Fall from Height": "Work at Height",
    "Hydrocarbon Gas Release": "Bypassing Safety Controls",
    "Hydrogen Sulfide (H2S)": "Bypassing Safety Controls",
    "Stored / Residual Energy": "Energy Isolation",
    "High Pressure Fluid": "Energy Isolation",
    "Dropped Object": "Safe Mechanical Lifting",
    "Line of Fire (Machinery/Tension)": "Line of Fire",
    "Oxygen Deficiency / Toxic Fumes": "Confined Space",
    "Ignition Source in Hazardous Zone": "Hot Work",
    "Structural Instability": "Line of Fire"
}

HAZARD_TO_EXPOSURE = {
    "Fall from Height": "Elevated Technician without Fall Restraint",
    "Hydrocarbon Gas Release": "Nearby Operators Exposed to Gas Plume",
    "Hydrogen Sulfide (H2S)": "Nearby Operators Exposed to Gas Plume",
    "Stored / Residual Energy": "Workers within Unisolated Work Zone",
    "High Pressure Fluid": "Personnel in Direct Line-of-Fire",
    "Dropped Object": "Ground Crew beneath Suspended Load",
    "Line of Fire (Machinery/Tension)": "Personnel in Direct Line-of-Fire",
    "Oxygen Deficiency / Toxic Fumes": "Entry Team in Enclosed Vessel",
    "Ignition Source in Hazardous Zone": "Personnel in Direct Line-of-Fire",
    "Structural Instability": "Workers within Unisolated Work Zone"
}

class SafetyMLInferenceEngine:
    def __init__(self, model_path: str = DEFAULT_MODEL_PATH):
        self.model_path = model_path
        self.bundle = None
        self.vectorizer = None
        self.models = {}
        self.version = "unknown"
        self.metrics = {}
        self.load_model()

    def load_model(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at {self.model_path}. Run train.py first.")
        
        self.bundle = joblib.load(self.model_path)
        self.version = self.bundle.get("version", "v1.0.0")
        self.vectorizer = self.bundle["vectorizer"]
        self.models = self.bundle["models"]
        self.metrics = self.bundle.get("metrics", {})
        print(f"[InferenceEngine] Successfully loaded model bundle version: {self.version}")

    def clean_text(self, text: str) -> str:
        if not isinstance(text, str):
            return ""
        text = text.lower()
        text = re.sub(r'[\r\n\t]+', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def split_sentences(self, text: str) -> List[str]:
        """Split text into distinct sentences of meaningful length."""
        raw_sentences = re.split(r'(?<=[.!?\n])\s+', text)
        sentences = [s.strip() for s in raw_sentences if len(s.strip()) > 15]
        if not sentences and text.strip():
            sentences = [text.strip()]
        return sentences

    def extract_evidence(self, text: str, predicted_hazard: str, predicted_precursor: str) -> List[str]:
        """
        Extract verbatim evidence sentences from the input report text
        using TF-IDF feature attribution to the predicted classes.
        """
        sentences = self.split_sentences(text)
        if not sentences:
            return ["No sufficient narrative text available for evidence extraction."]

        if len(sentences) == 1:
            return [sentences[0]]

        # Use top features for the predicted hazard and precursor
        hazard_clf = self.models.get("hazard")
        precursor_clf = self.models.get("sif_precursor")
        feature_names = self.vectorizer.get_feature_names_out()

        target_features = set()
        for clf, target_class in [(hazard_clf, predicted_hazard), (precursor_clf, predicted_precursor)]:
            if clf and hasattr(clf, "classes_") and hasattr(clf, "coef_"):
                if target_class in clf.classes_:
                    cls_idx = list(clf.classes_).index(target_class)
                    top_indices = np.argsort(clf.coef_[cls_idx])[-15:]
                    for idx in top_indices:
                        target_features.add(feature_names[idx].lower())

        # Score sentences based on matching predictive features
        scored_sentences = []
        for s in sentences:
            s_clean = s.lower()
            score = sum(1 for feat in target_features if feat in s_clean)
            scored_sentences.append((score, s))

        scored_sentences.sort(key=lambda x: x[0], reverse=True)

        # Select up to 3 highest scoring sentences
        selected = [s for score, s in scored_sentences if score > 0][:3]
        if not selected:
            selected = sentences[:2]

        return selected

    def predict(self, text: str, min_confidence_threshold: float = 0.35) -> Dict[str, Any]:
        """
        Runs complete ML inference on raw narrative text with uncertainty handling.
        """
        # 1. Validation & Out-Of-Scope / Empty checks
        if not text or not text.strip():
            return {
                "success": False,
                "review_needed": True,
                "uncertainty_reason": "Input narrative is empty or contains whitespace only.",
                "confidence": 0,
                "model_version": self.version,
                "predictions": None,
                "evidence": []
            }

        cleaned = self.clean_text(text)
        words = cleaned.split()
        if len(cleaned) < 20 or len(words) < 4:
            return {
                "success": False,
                "review_needed": True,
                "uncertainty_reason": f"Narrative text is too short ({len(words)} words) for reliable ML classification. Minimum 4 words / 20 characters required. Manual HSE review required.",
                "confidence": 15,
                "model_version": self.version,
                "predictions": None,
                "evidence": [text.strip()] if text.strip() else []
            }

        # 2. Vectorize input
        X = self.vectorizer.transform([cleaned])

        # 3. Model Inference across all targets
        predictions = {}
        probabilities = {}
        confidence_scores = {}

        for target_name, clf in self.models.items():
            probs = clf.predict_proba(X)[0]
            pred_idx = np.argmax(probs)
            pred_class = clf.classes_[pred_idx]
            max_prob = float(probs[pred_idx])

            predictions[target_name] = str(pred_class)
            confidence_scores[target_name] = round(max_prob, 4)

            # Store top 3 probability distribution
            top3_idx = np.argsort(probs)[-3:][::-1]
            probabilities[target_name] = {
                str(clf.classes_[i]): round(float(probs[i]), 4) for i in top3_idx
            }

        # 4. Uncertainty & Reliability Evaluation
        hazard_conf = confidence_scores.get("hazard", 0.0)
        precursor_conf = confidence_scores.get("sif_precursor", 0.0)
        overall_conf_float = (hazard_conf * 0.45) + (precursor_conf * 0.35) + (confidence_scores.get("report_type", 0.0) * 0.20)
        overall_conf_pct = int(min(98, max(25, round(overall_conf_float * 100))))

        review_needed = False
        uncertainty_reason = None

        if hazard_conf < min_confidence_threshold:
            review_needed = True
            uncertainty_reason = f"Primary hazard prediction confidence ({int(hazard_conf * 100)}%) is below operational reliability threshold ({int(min_confidence_threshold * 100)}%). Manual HSE review required."
        elif precursor_conf < min_confidence_threshold:
            review_needed = True
            uncertainty_reason = f"SIF precursor classification confidence ({int(precursor_conf * 100)}%) requires safety specialist verification."

        # 5. Extract Verbatim Evidence Sentences
        evidence = self.extract_evidence(
            text,
            predictions.get("hazard", ""),
            predictions.get("sif_precursor", "")
        )

        return {
            "success": True,
            "review_needed": review_needed,
            "uncertainty_reason": uncertainty_reason,
            "confidence": overall_conf_pct,
            "model_version": self.version,
            "predictions": predictions,
            "probabilities": probabilities,
            "confidence_scores": confidence_scores,
            "evidence": evidence
        }

    def analyze_report(self, text: str, installation: Optional[str] = None, asset: Optional[str] = None, report_type_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes full report intelligence synthesis for integration with frontend SafetyReport schema.
        """
        pred_res = self.predict(text)
        
        if not pred_res["success"] or not pred_res["predictions"]:
            # Fallback for empty/invalid inputs
            return {
                "id": f"OIL-ML-{np.random.randint(1000, 9999)}",
                "narrative": text or "",
                "installation": installation or "Duliajan Central Field",
                "asset": asset or "Production Facility",
                "activity": "General Maintenance",
                "reportType": report_type_hint or "Unsafe Condition",
                "hazard": "Stored / Residual Energy",
                "exposure": "Workers within Unisolated Work Zone",
                "barrier": "Energy Isolation (LOTO)",
                "controlFailure": "Isolation Not Verified / Zero-Energy Unchecked",
                "sifPrecursor": "Energy Isolation Failure",
                "iogpRule": "Energy Isolation",
                "severity": "Low",
                "sifPotential": "Non-SIF Precursor",
                "riskScore": 25,
                "confidence": pred_res["confidence"],
                "evidence": pred_res["evidence"],
                "reviewNeeded": True,
                "uncertaintyReason": pred_res["uncertainty_reason"],
                "modelVersion": self.version,
                "isMlGenerated": True
            }

        preds = pred_res["predictions"]
        hazard = preds.get("hazard", "Stored / Residual Energy")
        sif_precursor = preds.get("sif_precursor", "Energy Isolation Failure")
        sif_potential = preds.get("sif_potential", "Potential SIF")
        severity = preds.get("severity", "High")
        report_type = report_type_hint if report_type_hint in ["Unsafe Condition", "Unsafe Act", "Near Miss", "Incident Precursor"] else preds.get("report_type", "Unsafe Condition")

        barrier = HAZARD_TO_BARRIER.get(hazard, "Energy Isolation (LOTO)")
        exposure = HAZARD_TO_EXPOSURE.get(hazard, "Workers within Unisolated Work Zone")
        iogp_rule = HAZARD_TO_IOGP.get(hazard, "Energy Isolation")

        # Dynamic risk score calculation based on predicted severity and SIF potential
        base_risk = 70
        if severity == "Critical": base_risk += 20
        elif severity == "High": base_risk += 10
        elif severity == "Low": base_risk -= 30

        if sif_potential == "SIF-Capable": base_risk += 8
        elif sif_potential == "Non-SIF Precursor": base_risk -= 20

        risk_score = max(15, min(98, base_risk))

        # Control failure description
        control_failure = "Isolation Not Verified / Zero-Energy Unchecked"
        if hazard == "Fall from Height":
            control_failure = "Missing / Improper 100% Tie-Off"
        elif hazard in ["Hydrocarbon Gas Release", "Hydrogen Sulfide (H2S)"]:
            control_failure = "Bypassed Interlock / Safeguard Overridden"
        elif hazard == "Ignition Source in Hazardous Zone":
            control_failure = "Bypassed Interlock / Safeguard Overridden"
        elif hazard == "Dropped Object":
            control_failure = "Uncertified Rigging Hardware / Exceeded WLL"
        elif hazard == "Oxygen Deficiency / Toxic Fumes":
            control_failure = "Inadequate Gas Testing Before Entry"
        elif hazard == "Line of Fire (Machinery/Tension)":
            control_failure = "Failure to Barricade Line-of-Fire Trajectory"

        # Intelligent asset and installation inference from narrative text
        text_lower = text.lower()
        inferred_asset = asset
        inferred_installation = installation

        # Only override if asset is missing or is the default generic "Workover Rig WOR-07" but text does not mention workover/rig WOR-07
        is_default_workover = (not asset) or (asset == "Workover Rig WOR-07" and not any(k in text_lower for k in ["wor-07", "wor", "workover", "tubing", "cellar"]))

        if is_default_workover:
            if any(k in text_lower for k in ["furnace", "fired heater", "reboiler", "firebox", "burner", "boiler", "combustion chamber"]):
                inferred_asset = "Process Fired Furnace / Heater H-101"
                inferred_installation = "Digboi Refinery Area & Fields"
            elif any(k in text_lower for k in ["monkey board", "derrick", "mast", "racking", "28 meters", "22 meters", "drill collar"]):
                inferred_asset = "Jorhat Exploration Rig 4"
                inferred_installation = "Jorhat Exploration Rig 4"
            elif any(k in text_lower for k in ["separator", "v-201", "vessel cleanout", "knockout drum", "slug catcher"]):
                inferred_asset = "High-Pressure 3-Phase Test Separator V-201"
                inferred_installation = "Bagjan Wellsite Operations"
            elif any(k in text_lower for k in ["trunkline", "pipeline", "flowline", "pig launcher", "pigging"]):
                inferred_asset = "Crude Pipeline Trunk-A"
                inferred_installation = "Moran Oil Field"
            elif any(k in text_lower for k in ["crane", "lifting sling", "shackle", "suspended load", "tagline"]):
                inferred_asset = "Mobile Crane MC-05 / Heavy Rigging Unit"
                inferred_installation = "Duliajan Central Field"
            elif any(k in text_lower for k in ["compressor", "c-2", "gas booster", "gas lift"]):
                inferred_asset = "Booster Compressor Skid C-2"
                inferred_installation = "Duliajan Central Field"
            elif any(k in text_lower for k in ["storage tank", "tank t-", "thief hatch"]):
                inferred_asset = "Crude Storage Tank T-102"
                inferred_installation = "Moran Oil Field"
            else:
                inferred_asset = asset or "Duliajan Production Station"
                inferred_installation = installation or "Duliajan Central Field"

        activity = "General Maintenance"
        if any(k in text_lower for k in ["furnace", "fired heater", "burner", "boiler", "combustion"]):
            activity = "Production Operations"
        elif any(k in text_lower for k in ["workover", "tubing", "wor-07", "snubbing"]):
            activity = "Workover"
        elif any(k in text_lower for k in ["drilling", "derrick", "rotary", "bop"]):
            activity = "Drilling"
        elif any(k in text_lower for k in ["height", "monkey board", "scaffold", "ladder", "tie-off"]) or hazard == "Fall from Height":
            activity = "Work at Height"
        elif any(k in text_lower for k in ["confined space", "vessel entry", "separator v-201", "manway"]) or hazard == "Oxygen Deficiency / Toxic Fumes":
            activity = "Confined Space Entry"
        elif any(k in text_lower for k in ["welding", "hot work", "cutting", "grinding"]):
            activity = "Hot Work & Welding"
        elif any(k in text_lower for k in ["crane", "lifting", "rigging", "sling"]) or hazard == "Dropped Object":
            activity = "Mechanical Lifting"
        elif any(k in text_lower for k in ["pipeline", "pigging", "trunkline"]):
            activity = "Pipeline Maintenance"

        report_id = f"OIL-ML-{np.random.randint(1000, 9999)}"

        return {
            "id": report_id,
            "date": np.datetime64('today').astype(str),
            "installation": inferred_installation or "Duliajan Central Field",
            "asset": inferred_asset or "Production Facility",
            "activity": activity,
            "reportType": report_type,
            "narrative": text,
            "hazard": hazard,
            "exposure": exposure,
            "barrier": barrier,
            "controlFailure": control_failure,
            "sifPrecursor": sif_precursor,
            "iogpRule": iogp_rule,
            "severity": severity,
            "sifPotential": sif_potential,
            "riskScore": risk_score,
            "confidence": pred_res["confidence"],
            "evidence": pred_res["evidence"],
            "reviewNeeded": pred_res["review_needed"],
            "uncertaintyReason": pred_res["uncertainty_reason"],
            "probabilities": pred_res["probabilities"],
            "modelVersion": self.version,
            "isMlGenerated": True,
            "sourceType": "uploaded"
        }
