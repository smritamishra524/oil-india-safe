import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Dna,
  Share2,
  GitFork,
  Cpu,
  Download,
  PlusCircle,
  Edit3,
  Check,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/translations';
import { ValidationStatus } from '../types';

interface ReportAnalyzerProps {
  onOpenUpload: () => void;
}

export const ReportAnalyzer: React.FC<ReportAnalyzerProps> = ({ onOpenUpload }) => {
  const {
    reports,
    selectedReport,
    selectReport,
    updateReportValidation,
    addCorrectiveAction,
    setActiveTab,
    language
  } = useApp();

  const t = TRANSLATIONS[language];

  const [validationNote, setValidationNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Corrective action form state
  const [actionTitle, setActionTitle] = useState('');
  const [actionOwner, setActionOwner] = useState('');
  const [actionTargetDate, setActionTargetDate] = useState('');
  const [actionPriority, setActionPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');

  if (!selectedReport) {
    return (
      <div className="p-8 text-center text-slate-500">
        <FileText className="w-12 h-12 mx-auto text-slate-400 mb-2" />
        <p>No safety report selected. Ingest a report file or select one from the repository.</p>
        <button
          onClick={onOpenUpload}
          className="mt-4 px-4 py-2 bg-oil-600 text-white rounded-lg text-xs font-bold"
        >
          {t.addReport}
        </button>
      </div>
    );
  }

  const handleValidation = (status: ValidationStatus) => {
    updateReportValidation(selectedReport.id, status, validationNote);
    setIsEditingNote(false);
  };

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim() || !actionOwner.trim()) return;

    addCorrectiveAction({
      reportId: selectedReport.id,
      title: actionTitle,
      description: `Action initiated from SIF Precursor Analysis on ${selectedReport.asset}: ${actionTitle}`,
      owner: actionOwner,
      targetDate: actionTargetDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: actionPriority,
      status: 'OPEN',
      verificationMethod: selectedReport.recommendedIntervention.verificationStep,
      barrierAddressed: selectedReport.barrier,
      installation: selectedReport.installation
    });

    setIsActionModalOpen(false);
    setActionTitle('');
    setActionOwner('');
  };

  const handleExportAnalysis = () => {
    const content = `
===================================================================
OIL INDIA LIMITED • HSE INTELLIGENCE ANALYSIS REPORT
SIF PRECURSOR MONITORING SUMMARY
===================================================================
Report ID: ${selectedReport.id}
Date: ${selectedReport.date}
Installation: ${selectedReport.installation}
Asset: ${selectedReport.asset}
Activity: ${selectedReport.activity}
Report Type: ${selectedReport.reportType}
Ingestion Source: ${selectedReport.extractedFrom || selectedReport.sourceType}

HAZARD & PRECURSOR CLASSIFICATION:
-------------------------------------------------------------------
Detected Hazard: ${selectedReport.hazard}
Exposure Envelope: ${selectedReport.exposure}
Safety Barrier: ${selectedReport.barrier}
Control Failure: ${selectedReport.controlFailure}
SIF Precursor: ${selectedReport.sifPrecursor}
IOGP Life-Saving Rule: ${selectedReport.iogpRule}

RISK EVALUATION:
-------------------------------------------------------------------
Risk Score: ${selectedReport.riskScore} / 100
SIF Potential: ${selectedReport.sifPotential}
Severity Level: ${selectedReport.severity}
Confidence: ${selectedReport.confidence}%

EXTRACTED NARRATIVE EVIDENCE:
-------------------------------------------------------------------
${selectedReport.evidence.map(e => `• "${e}"`).join('\n')}

RAW OBSERVATION TEXT:
-------------------------------------------------------------------
${selectedReport.narrative}

RECOMMENDED INTERVENTION:
-------------------------------------------------------------------
Primary: ${selectedReport.recommendedIntervention.primary}
Secondary: ${selectedReport.recommendedIntervention.secondary}
Verification Step: ${selectedReport.recommendedIntervention.verificationStep}
Responsible Role: ${selectedReport.recommendedIntervention.responsibleRole}
Priority: ${selectedReport.recommendedIntervention.priority}

HSE HUMAN VALIDATION:
-------------------------------------------------------------------
Status: ${selectedReport.validation.status}
Validated By: ${selectedReport.validation.validatedBy || 'Pending HSE Review'}
Validated At: ${selectedReport.validation.validatedAt || 'N/A'}
Notes: ${selectedReport.validation.notes || 'None'}

DISCLAIMER:
Prototype • Synthetic Safety Data. AI outputs are decision-support signals
and require qualified HSE validation. Not deterministic accident prediction.
===================================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OIL_HSE_Analysis_${selectedReport.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Action Bar & Report Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-oil-100 text-oil-700 flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Intelligence</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-xs font-bold text-oil-700">{selectedReport.id}</span>
              {selectedReport.sourceType === 'uploaded' && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-blue-100 text-blue-800 border border-blue-200">
                  Real File Extracted
                </span>
              )}
              {selectedReport.isMlGenerated && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  ML Model {selectedReport.modelVersion || 'v1.0.0'}
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-slate-900 truncate max-w-lg">
              {selectedReport.sifPrecursor} on {selectedReport.asset}
            </h1>
          </div>
        </div>

        {/* Switch Report Selector & Actions */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedReport.id}
            onChange={(e) => selectReport(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-oil-500 outline-none max-w-[220px] truncate"
          >
            {reports.slice(0, 20).map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} • {r.asset} ({r.sifPrecursor.slice(0, 20)}...)
              </option>
            ))}
          </select>

          <button
            onClick={onOpenUpload}
            className="px-3 py-2 bg-oil-600 hover:bg-oil-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </button>

          <button
            onClick={handleExportAnalysis}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            title="Download structured analysis summary"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Uncertainty & Manual Review Alert Banner */}
      {selectedReport.reviewNeeded && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 shadow-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-0.5">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <span>HSE Specialist Review Required</span>
              <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] rounded font-semibold uppercase">
                Uncertainty Flag
              </span>
            </div>
            <p className="text-amber-800 leading-normal">
              {selectedReport.uncertaintyReason || 'Model prediction confidence is below the operational reliability threshold or the report input requires manual safety verification.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Report Details, Evidence & DNA Preview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Narrative Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Safety Observation Narrative</h3>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                <span>{selectedReport.date}</span>
                <span>•</span>
                <span className="text-oil-700 font-semibold">{selectedReport.installation}</span>
              </div>
            </div>

            {/* Narrative text */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 font-mono text-xs text-slate-800 leading-relaxed">
              {selectedReport.narrative}
            </div>

            {/* Extracted Direct Evidence Highlights */}
            {selectedReport.evidence.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  {t.evidenceQuotes}:
                </span>
                <div className="space-y-1.5">
                  {selectedReport.evidence.map((quote, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-md text-xs text-amber-950 flex items-start gap-2 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>"{quote}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIF Precursor DNA Quick Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Dna className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">SIF Precursor DNA Chain</h3>
              </div>
              <button
                onClick={() => setActiveTab('sif-dna')}
                className="text-xs font-semibold text-oil-600 hover:text-oil-800 flex items-center gap-1"
              >
                Inspect Interactive DNA Node Graph <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal Step Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Activity</span>
                <span className="font-bold text-slate-800">{selectedReport.activity}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Hazard</span>
                <span className="font-bold text-amber-800">{selectedReport.hazard}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Barrier</span>
                <span className="font-bold text-rose-800">{selectedReport.barrier}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">SIF Precursor</span>
                <span className="font-bold text-rose-700">{selectedReport.sifPrecursor}</span>
              </div>

            </div>

            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-oil-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">IOGP Life-Saving Rule Mapped: </span>
                <span>{selectedReport.iogpRule}</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Consequence Envelope: {selectedReport.dna.potentialConsequence}
                </p>
              </div>
            </div>
          </div>

          {/* Missing Evidence & Contradictions (Section 20 & 21) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Missing Evidence Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Report Completeness: {selectedReport.completenessScore}%
                </span>
                <button
                  onClick={() => setActiveTab('missing-evidence')}
                  className="text-[11px] text-oil-600 font-semibold hover:underline"
                >
                  View Details
                </button>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    selectedReport.completenessScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${selectedReport.completenessScore}%` }}
                />
              </div>

              {selectedReport.missingEvidence.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {selectedReport.missingEvidence.map((me, i) => (
                    <div key={i} className="text-xs text-amber-900 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium truncate">{me.criticalItem}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => alert(`Additional evidence requested from field supervisor for report ${selectedReport.id}. Notification dispatched.`)}
                    className="mt-1 w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition-colors text-center"
                  >
                    Request Additional Evidence
                  </button>
                </div>
              ) : (
                <div className="text-xs text-emerald-700 font-medium flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All critical safety verification items documented.
                </div>
              )}
            </div>

            {/* Contradictions Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Contradiction Detector
                </span>
                <button
                  onClick={() => setActiveTab('contradiction-detection')}
                  className="text-[11px] text-oil-600 font-semibold hover:underline"
                >
                  Audit
                </button>
              </div>

              {selectedReport.contradictions.length > 0 ? (
                <div className="space-y-2">
                  {selectedReport.contradictions.map((c, idx) => (
                    <div key={idx} className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs space-y-1 text-rose-950">
                      <div className="font-bold flex items-center gap-1 text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Potential Contradiction Flagged
                      </div>
                      <p className="text-[11px] text-rose-900 leading-tight">
                        {c.analysis}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded text-xs text-slate-600">
                  No internal semantic contradictions detected in this report narrative.
                </div>
              )}
            </div>

          </div>

          {/* Recommended Intervention (Section 43) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Recommended Intervention Strategy</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                Priority: {selectedReport.recommendedIntervention.priority}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-oil-700 block mb-0.5">Primary Control:</span>
                <span className="text-slate-800">{selectedReport.recommendedIntervention.primary}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">Secondary Verification:</span>
                <span className="text-slate-800">{selectedReport.recommendedIntervention.secondary}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-0.5">Verification Sign-off:</span>
                  <span className="text-slate-800">{selectedReport.recommendedIntervention.verificationStep}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-0.5">Accountable Role:</span>
                  <span className="text-slate-800">{selectedReport.recommendedIntervention.responsibleRole}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                AI-assisted recommendation • Qualified HSE validation required
              </span>
              <button
                onClick={() => setIsActionModalOpen(true)}
                className="px-3 py-1.5 bg-oil-600 hover:bg-oil-700 text-white rounded text-xs font-bold transition-colors shadow-sm"
              >
                + Create Corrective Action
              </button>
            </div>
          </div>

        </div>

        {/* Right Col: Risk Score, SIF Potential & HSE Human Validation */}
        <div className="space-y-6">
          
          {/* Risk Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                SIF Risk Quantification
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                Index Scale: 0–100
              </span>
            </div>

            {/* Risk Gauge */}
            <div className="text-center py-4 border-b border-slate-100">
              <div className="text-5xl font-black text-rose-600 tracking-tight">
                {selectedReport.riskScore}
                <span className="text-lg text-slate-400 font-normal">/100</span>
              </div>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-rose-100 text-rose-800 border border-rose-200">
                {selectedReport.sifPotential}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 italic">
                Engineering Risk Consequence Index (non-probabilistic composite)
              </p>
              
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-left text-xs">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Severity Level</span>
                  <span className="font-bold text-slate-800">{selectedReport.severity}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Calibrated Confidence</span>
                  <span className="font-bold text-emerald-700">{selectedReport.confidence}% posterior</span>
                </div>
              </div>

              {/* Intelligence Source Indicator */}
              <div className="mt-2 text-left">
                <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between">
                  <span>Intelligence Pipeline:</span>
                  <span className={`font-semibold ${selectedReport.isMlGenerated ? 'text-emerald-700' : 'text-blue-700'}`}>
                    {selectedReport.isMlGenerated ? 'Real ML Microservice (v1.0.0)' : 'Deterministic Rules & Evidence'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Connected Intelligence Links */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Connected Intelligence Links:
              </span>

              <button
                onClick={() => setActiveTab('weak-signal-fusion')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Weak Signal Cluster Matrix</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('barrier-degradation')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Barrier Timeline ({selectedReport.barrier})</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('sif-pathway')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-amber-600" />
                  <span>SIF Escalation Pathway</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('counterfactual-sif')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <span>Counterfactual Simulator</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('historical-similarity')}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span>Find Historical Similar Patterns</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* HSE Human Validation Section (Section 30) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">HSE Officer Validation</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                selectedReport.validation.status === 'Validated' ? 'bg-emerald-100 text-emerald-800' :
                selectedReport.validation.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                selectedReport.validation.status === 'HSE Reviewed' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {selectedReport.validation.status}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              AI outputs are advisory signals. The HSE supervisor must review and formally validate the precursor classification before mandatory corrective action dispatch.
            </p>

            {selectedReport.validation.validatedBy && (
              <div className="p-2.5 bg-slate-50 rounded text-xs space-y-1 text-slate-700">
                <div><span className="font-semibold">Reviewer:</span> {selectedReport.validation.validatedBy}</div>
                <div><span className="font-semibold">Reviewed At:</span> {selectedReport.validation.validatedAt}</div>
                {selectedReport.validation.notes && (
                  <div><span className="font-semibold">Notes:</span> {selectedReport.validation.notes}</div>
                )}
              </div>
            )}

            {/* Validation Buttons: Accept / Edit / Reject */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleValidation('Validated')}
                  className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept
                </button>
                <button
                  onClick={() => {
                    setIsEditingNote(true);
                    handleValidation('HSE Reviewed');
                  }}
                  className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit / Note
                </button>
                <button
                  onClick={() => handleValidation('Rejected')}
                  className="py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>

              {isEditingNote && (
                <div className="pt-2 space-y-2">
                  <textarea
                    value={validationNote}
                    onChange={(e) => setValidationNote(e.target.value)}
                    placeholder="Enter HSE inspection findings or note modifications to AI detection..."
                    rows={2}
                    className="w-full text-xs p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-oil-500"
                  />
                  <button
                    onClick={() => handleValidation('HSE Reviewed')}
                    className="w-full py-1.5 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-900 transition-colors"
                  >
                    Save Validation Note
                  </button>
                </div>
              )}
            </div>

            {/* AI Feedback Loop Visualization (Section 44) */}
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-500 uppercase">AI Learning Feedback Loop:</div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                <span>AI Assessment</span>
                <span>→</span>
                <span>HSE Validation</span>
                <span>→</span>
                <span>Model Tuning</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Create Corrective Action Modal */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Create Corrective Action</h3>
              <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateAction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  placeholder={`e.g. Enforce zero-energy check on ${selectedReport.asset}`}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-oil-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Action Owner</label>
                  <input
                    type="text"
                    required
                    value={actionOwner}
                    onChange={(e) => setActionOwner(e.target.value)}
                    placeholder="e.g. Lead Maintenance Eng."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-oil-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Date</label>
                  <input
                    type="date"
                    value={actionTargetDate}
                    onChange={(e) => setActionTargetDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-oil-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
                <select
                  value={actionPriority}
                  onChange={(e) => setActionPriority(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-oil-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-oil-600 hover:bg-oil-700 rounded-lg shadow-sm"
                >
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
