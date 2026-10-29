# OIL India Safe-X: Machine Learning Text Intelligence Microservice

This microservice provides real-time natural language processing and machine learning classification for the OIL India Safe-X incident analysis pipeline.

## 1. Capabilities
- **Multi-target Classification**:
  - `hazard`: 10 process safety and occupational hazard categories.
  - `sif_precursor`: 9 Serious Injury & Fatality precursor categories.
  - `report_type`: Unsafe Act, Unsafe Condition, Near Miss, Incident Precursor.
  - `sif_potential`: SIF-Capable, Potential SIF, Non-SIF Precursor.
  - `severity`: Low, Medium, High, Critical.
- **Verbatim Evidence Attribution**: Extracts exact sentences from report narratives matching the model's top feature coefficients for predicted classes.
- **Uncertainty & Out-of-Scope Handling**: Automatically flags low-confidence (<35%), empty, or short narratives (<4 words) for manual HSE specialist review instead of producing false confidence.
- **Explainability**: Returns probability distributions across top candidates and per-class top predictive features.

## 2. Directory Structure
```
ml_service/
├── app.py                     # FastAPI application endpoints (/predict, /analyze, /health, /metrics)
├── inference.py               # ML inference engine & uncertainty evaluator
├── train.py                   # Reproducible model training & held-out evaluation script
├── requirements.txt           # Python package requirements
├── Dockerfile                 # Production Docker container definition
├── render.yaml                # Render 1-click cloud deployment spec
├── data/
│   ├── dataset.py             # Dataset generation & curation script
│   ├── safety_incidents.csv   # Documented 159-record safety incident dataset
│   └── DATASET_METADATA.md    # Dataset provenance, public sources, and licensing
├── models/
│   ├── latest.joblib          # Pointer to latest active production model bundle
│   └── v1.0.0/
│       ├── safety_classifier_v1.0.0.joblib
│       └── metrics.json       # Exact held-out test evaluation metrics
└── tests/
    ├── test_ml_service.py     # Automated pytest suite (14 passing tests)
    └── demo_pipeline_validation.py # Dynamic report demonstration script
```

## 3. Quickstart & Local Execution

### Install Dependencies
```bash
pip install -r ml_service/requirements.txt
```

### Reproduce Training & Evaluation
```bash
python ml_service/train.py
```
This fits a TF-IDF vectorizer strictly on an 80% stratified training split, evaluates against the held-out 20% test set, outputs per-class metrics, and saves the versioned model bundle to `ml_service/models/v1.0.0/`.

### Run Automated Tests
```bash
pytest ml_service/tests/test_ml_service.py -v
```

### Run Demonstration Validation
```bash
python ml_service/tests/demo_pipeline_validation.py
```

### Start the FastAPI Inference Server
```bash
python ml_service/app.py
# Or with uvicorn directly:
uvicorn ml_service.app:app --host 0.0.0.0 --port 8000 --reload
```
Swagger UI will be available at `http://localhost:8000/docs`.

## 4. Frontend Integration
The React frontend in `src/services/mlClient.ts` communicates with this service via `VITE_ML_API_URL`.
- Default: `http://localhost:8000`
- Set in your `.env` or deployment settings:
  ```env
  VITE_ML_API_URL=https://your-ml-api-domain.com
  ```
- If the ML service is temporarily unreachable, the frontend gracefully falls back to deterministic rule analysis while explicitly indicating `(ML Service Offline)` in the validation metadata.

## 5. Deployment Guide

### Deploying the Backend on Render / Railway / Cloud Run:
1. Push the repository to GitHub.
2. In Render, create a **New Web Service** connected to your repository.
3. Configure:
   - **Root Directory**: `.`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r ml_service/requirements.txt && python ml_service/train.py`
   - **Start Command**: `uvicorn ml_service.app:app --host 0.0.0.0 --port $PORT`
4. Copy your service URL (e.g., `https://oil-india-safex-ml.onrender.com`).

### Deploying the Frontend on Vercel:
1. In your Vercel Project Settings, navigate to **Environment Variables**.
2. Add:
   - **Key**: `VITE_ML_API_URL`
   - **Value**: `https://oil-india-safex-ml.onrender.com`
3. Trigger a redeploy. All uploaded, voice, or frontline reports will now run through your real ML model in production!
