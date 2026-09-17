export type ActivityType = 
  | 'Workover'
  | 'Drilling'
  | 'Production Operations'
  | 'Pipeline Maintenance'
  | 'Well Testing'
  | 'Confined Space Entry'
  | 'Work at Height'
  | 'Hot Work & Welding'
  | 'Mechanical Lifting'
  | 'Electrical Maintenance'
  | 'General Maintenance';

export type HazardType = 
  | 'Stored / Residual Energy'
  | 'Hydrocarbon Gas Release'
  | 'Fall from Height'
  | 'Hydrogen Sulfide (H2S)'
  | 'High Pressure Fluid'
  | 'Dropped Object'
  | 'Line of Fire (Machinery/Tension)'
  | 'Oxygen Deficiency / Toxic Fumes'
  | 'Ignition Source in Hazardous Zone'
  | 'Structural Instability';

export type ExposureType = 
  | 'Personnel in Direct Line-of-Fire'
  | 'Workers within Unisolated Work Zone'
  | 'Elevated Technician without Fall Restraint'
  | 'Entry Team in Enclosed Vessel'
  | 'Nearby Operators Exposed to Gas Plume'
  | 'Ground Crew beneath Suspended Load';

export type BarrierType = 
  | 'Energy Isolation (LOTO)'
  | 'Gas Detection & Monitoring'
  | 'Fall Protection System'
  | 'Pressure Relief & Bleedoff System'
  | 'Exclusion Zone & Barricading'
  | 'Permit to Work (PTW) & JSA'
  | 'Certified Lifting Rigging & Plan'
  | 'Ventilation & Air Monitoring'
  | 'Hot Work Isolation & Fire Watch'
  | 'Emergency Shutdown (ESD)';

export type ControlFailureType = 
  | 'Isolation Not Verified / Zero-Energy Unchecked'
  | 'Bypassed Interlock / Safeguard Overridden'
  | 'Inadequate Gas Testing Before Entry'
  | 'Missing / Improper 100% Tie-Off'
  | 'Uncertified Rigging Hardware / Exceeded WLL'
  | 'Unauthorized Line Entry under Residual Pressure'
  | 'Permit Issued Without On-Site Verification'
  | 'Failure to Barricade Line-of-Fire Trajectory';

export type SIFPrecursorType = 
  | 'Energy Isolation Failure'
  | 'Uncontained Hydrocarbon Leakage'
  | 'Failed Fall Protection'
  | 'Toxic Atmosphere Exposure'
  | 'Suspended Load Rigging Failure'
  | 'High-Pressure Blowout / Ejection'
  | 'Confined Space Engulfment'
  | 'Hot Work Ignition Precursor'
  | 'Heavy Equipment Blind Zone';

export type IOPGLLifeSavingRule = 
  | 'Energy Isolation'
  | 'Work at Height'
  | 'Confined Space'
  | 'Hot Work'
  | 'Line of Fire'
  | 'Safe Mechanical Lifting'
  | 'Driving'
  | 'Bypassing Safety Controls'
  | 'Work Authorisation';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type SIFPotentialLevel = 'SIF-Capable' | 'Potential SIF' | 'Non-SIF Precursor';
export type ValidationStatus = 'AI Suggested' | 'HSE Reviewed' | 'Validated' | 'Rejected';

export interface SIFPrecursorDNA {
  activity: string;
  hazard: string;
  exposure: string;
  barrier: string;
  controlFailure: string;
  sifPrecursor: string;
  iogpRule: IOPGLLifeSavingRule;
  potentialConsequence: string;
  riskContribution: {
    factor: string;
    percentage: number;
    description: string;
  }[];
}

export interface MissingEvidenceItem {
  id: string;
  category: string;
  criticalItem: string;
  whyCritical: string;
  severity: 'High' | 'Medium' | 'Low';
  suggestedPrompt: string;
}

export interface ContradictionItem {
  id: string;
  statementA: string;
  statementB: string;
  analysis: string;
  riskImplication: string;
}

export interface RecommendedIntervention {
  primary: string;
  secondary: string;
  verificationStep: string;
  responsibleRole: string;
  priority: 'Immediate' | 'High' | 'Routine';
  barrierReinforced: string;
}

export interface HSEValidation {
  status: ValidationStatus;
  validatedBy?: string;
  validatedAt?: string;
  notes?: string;
  modifications?: {
    field: string;
    from: string;
    to: string;
  }[];
}

export type ActionStatus = 'OPEN' | 'ASSIGNED' | 'IN PROGRESS' | 'ACTION TAKEN' | 'AWAITING VERIFICATION' | 'VERIFIED' | 'CLOSED';

export interface ActionPlan {
  detectedIssue: string;
  reasonEvidence: string;
  correctiveActions: string[];
  priority: 'Immediate' | 'High' | 'Medium' | 'Routine';
  responsibleRole: string;
  status: ActionStatus;
}

export interface PreventRecurrenceData {
  isRecurring: boolean;
  recurrenceReason: string;
  similarPrecursorsCount: number;
  similarHistoricalReports: Array<{
    id: string;
    asset: string;
    similarityReason: string;
    date: string;
    sifPrecursor: string;
  }>;
  closureTracker: {
    status: ActionStatus;
    assignedRole: string;
    priority: string;
    deadline?: string;
    verificationState: 'Pending Verification' | 'Under Review' | 'Witnessed & Verified' | 'Closed';
    actionsTaken?: string[];
  };
}

export interface WeakSignalItem {
  id: string;
  type: string;
  name: string;
  evidence: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface SIFPathwayNode {
  step: number;
  title: string;
  desc: string;
  evidence: string;
  barrier: string;
  riskContribution: string;
  intervention: string;
}

export interface BarrierDegradationDetail {
  primaryDegradedBarrier: string;
  category: 'PPE' | 'Engineering Controls' | 'Procedures' | 'Supervision' | 'Maintenance' | 'Monitoring/Detection' | 'Isolation' | 'Emergency Controls';
  failureMode: string;
  evidence: string;
  degradationLevel: 'Critical' | 'Severe' | 'Moderate' | 'Minor';
  reinforcementAction: string;
}

export interface SafetyReport {
  id: string;
  date: string;
  installation: string; // e.g., 'Duliajan Central Field', 'Moran Oil Field', 'Digboi Refinery Area', 'Jorhat Exploration Rig 4', 'Bagjan Wellsite', 'Rajasthan Block-RJ', 'Dandewala Gas Plant'
  asset: string;        // e.g., 'Wellhead WH-12B', 'Separation Unit SEP-04', 'Compressor Station C-2', 'Mud Pump MP-01', 'Workover Rig WOR-07', 'Crude Pipeline Trunk-A'
  activity: ActivityType;
  reportType: 'Unsafe Condition' | 'Unsafe Act' | 'Near Miss' | 'Incident Precursor';
  narrative: string;
  extractedFrom?: string; // filename or 'Manual Entry' / 'Frontline Voice'
  
  hazard: HazardType;
  exposure: ExposureType;
  barrier: BarrierType;
  controlFailure: ControlFailureType;
  sifPrecursor: SIFPrecursorType;
  iogpRule: IOPGLLifeSavingRule;
  
  severity: SeverityLevel;
  sifPotential: SIFPotentialLevel;
  riskScore: number; // 0 - 100
  confidence: number; // 0 - 100%
  
  evidence: string[]; // Actual quotes extracted from the report text
  missingEvidence: MissingEvidenceItem[];
  completenessScore: number; // 0 - 100%
  contradictions: ContradictionItem[];
  
  dna: SIFPrecursorDNA;
  recommendedIntervention: RecommendedIntervention;
  validation: HSEValidation;
  
  sourceType: 'synthetic' | 'uploaded' | 'voice' | 'frontline';

  // Upgraded Intelligence & Action Layer Fields
  actionPlan: ActionPlan;
  preventRecurrence: PreventRecurrenceData;
  weakSignals: WeakSignalItem[];
  sifPathway: SIFPathwayNode[];
  barrierDegradationDetails: BarrierDegradationDetail;
}

export interface CorrectiveAction {
  id: string;
  reportId: string;
  title: string;
  description: string;
  owner: string;
  targetDate: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: ActionStatus;
  verificationMethod: string;
  verifiedBy?: string;
  verifiedAt?: string;
  barrierAddressed: string;
  installation: string;
  createdAt: string;
  actionTakenNotes?: string;
  isRecurringPrecursor?: boolean;
  recurrenceNote?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  reportId?: string;
  actionId?: string;
  eventType: 'REPORT_RECEIVED' | 'AI_ANALYSIS_COMPLETED' | 'PRECURSOR_DETECTED' | 'HSE_REVIEWED' | 'ACTION_CREATED' | 'ACTION_VERIFIED' | 'ACTION_CLOSED' | 'BARRIER_DEGRADED' | 'DATA_RESET';
  user: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface WeakSignalCluster {
  id: string;
  title: string;
  installation: string;
  asset: string;
  reportIds: string[];
  commonFactors: string[];
  timeline: { date: string; event: string; reportId: string }[];
  clusterRisk: number; // 0 - 100
  confidence: number;
  dominantPrecursor: string;
  recommendedIntervention: string;
  status: 'Active Warning' | 'Investigating' | 'Mitigated';
}

export interface BarrierHealth {
  barrier: BarrierType;
  currentStatus: 'Healthy' | 'Warning' | 'Degrading' | 'Critical';
  healthScore: number; // 0 - 100
  failureCount: number;
  trend: 'improving' | 'stable' | 'degrading';
  monthlyHistory: { month: string; status: 'HEALTHY' | 'WARNING' | 'DEGRADING' | 'CRITICAL'; score: number }[];
  degradationDriver: string;
  relatedReportIds: string[];
  openActionCount: number;
}

export interface PrecursorVelocityItem {
  precursor: SIFPrecursorType;
  countPrevious90Days: number;
  countCurrent30Days: number;
  velocityMultiplier: number;
  classification: 'INCREASING' | 'STABLE' | 'DECLINING';
  riskCategory: 'High' | 'Medium' | 'Low';
  topInstallation: string;
}

export interface CounterfactualScenario {
  id: string;
  title: string;
  baseReportId: string;
  currentCondition: string;
  currentBarrier: string;
  barrierStatus: 'Active' | 'Weakened' | 'Failed';
  controlEffectiveness: number; // 0 - 100
  interventionType: string;
  escalationOutcome: string;
  simulatedSifProbability: number; // 0 - 100%
  pathwaySteps: string[];
}
