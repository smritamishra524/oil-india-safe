/**
 * OIL India Safe-X: Machine Learning Service Client
 * Connects frontend report ingestion to the Python FastAPI ML microservice.
 * Reads API URL from import.meta.env.VITE_ML_API_URL with localhost fallback.
 */

export interface MlPredictionResponse {
  success: boolean;
  review_needed: boolean;
  uncertainty_reason?: string | null;
  confidence: number;
  model_version: string;
  predictions: {
    hazard: string;
    report_type: string;
    sif_potential: string;
    severity: string;
    sif_precursor: string;
  } | null;
  probabilities?: Record<string, Record<string, number>>;
  confidence_scores?: Record<string, number>;
  evidence: string[];
}

export interface MlAnalyzeResponse {
  id: string;
  date: string;
  installation: string;
  asset: string;
  activity: string;
  reportType: 'Unsafe Condition' | 'Unsafe Act' | 'Near Miss' | 'Incident Precursor';
  narrative: string;
  hazard: any;
  exposure: any;
  barrier: any;
  controlFailure: any;
  sifPrecursor: any;
  iogpRule: any;
  severity: any;
  sifPotential: any;
  riskScore: number;
  confidence: number;
  evidence: string[];
  reviewNeeded: boolean;
  uncertaintyReason?: string | null;
  probabilities?: Record<string, Record<string, number>>;
  modelVersion: string;
  isMlGenerated: boolean;
  sourceType: string;
}

const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_ML_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.replace(/\/+$/, '');
  }
  // When running in production on the unified domain (Render single URL), use relative path
  if (typeof window !== 'undefined' && window.location.origin) {
    const isLocalDevVite = window.location.port === '5173';
    if (!isLocalDevVite) {
      return '';
    }
  }
  return 'http://localhost:8000';
};

/**
 * Checks connectivity and model health of the ML service.
 */
export async function checkMlServiceHealth(): Promise<{ available: boolean; version?: string; error?: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { available: true, version: data.model_version };
    }
    return { available: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { available: false, error: err.message || 'Service offline' };
  }
}

/**
 * Invokes ML model prediction directly for text classification, probabilities, and verbatim evidence.
 */
export async function predictWithML(text: string, minConfidenceThreshold = 0.35): Promise<MlPredictionResponse | null> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text,
        min_confidence_threshold: minConfidenceThreshold
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Calls ML backend for end-to-end report intelligence analysis.
 */
export async function analyzeReportWithML(
  text: string,
  metadata?: { installation?: string; asset?: string; reportType?: string }
): Promise<MlAnalyzeResponse | null> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(`${baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text,
        installation: metadata?.installation || 'Duliajan Central Field',
        asset: metadata?.asset || null,
        report_type: metadata?.reportType || null
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    return null;
  }
}
