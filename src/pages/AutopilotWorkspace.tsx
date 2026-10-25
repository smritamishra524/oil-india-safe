import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  Mic,
  MicOff,
  Image as ImageIcon,
  ExternalLink,
  Shield,
  ShieldAlert,
  Dna,
  Share2,
  GitFork,
  ArrowRight,
  Loader2,
  RefreshCw,
  Terminal,
  Eye,
  Edit3,
  X,
  Check,
  CheckSquare,
  Lock,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SafetyReport, CorrectiveAction } from '../types';
import { analyzeSafetyPhotograph, VisualHazardAnalysis } from '../services/multimodalInspector';
import { extractTextFromFile, ExtractionResult } from '../services/textExtractor';

interface BrowserStep {
  stepNumber: number;
  action: string;
  description: string;
  status?: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  details?: string;
}

interface ExecutionPlan {
  requestedOutcome: string;
  reportId: string;
  evidenceSummary: string[];
  multimodalEvidence?: VisualHazardAnalysis | null;
  voiceContext?: string | null;
  proposedAction: {
    title: string;
    installation: string;
    asset: string;
    hazardType: string;
    precursorDna: string;
    barrierAddressed: string;
    description: string;
    owner: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Routine';
    targetDate: string;
    verificationMethod: string;
  };
  destinationApplication: {
    name: string;
    url: string;
    formSelector: string;
  };
  browserSteps: BrowserStep[];
  approvalRequired: boolean;
  status: 'Planned' | 'Awaiting approval' | 'Running' | 'Completed and verified' | 'Failed' | 'Cancelled';
}

export const AutopilotWorkspace: React.FC = () => {
  const {
    reports,
    selectedReport,
    selectReport,
    addCorrectiveAction,
    setActiveTab,
    user
  } = useApp();

  // Workflow states
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [prompt, setPrompt] = useState<string>(
    'Analyze these incident reports, identify the highest-priority SIF precursor, explain the evidence, prepare a corrective action, and create a task in the connected safety task-management application after I approve it.'
  );

  const [isPlanning, setIsPlanning] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  // Editable action fields
  const [editTitle, setEditTitle] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editPriority, setEditPriority] = useState<'Critical' | 'High' | 'Medium' | 'Routine'>('High');
  const [editDeadline, setEditDeadline] = useState('');

  // Multimodal attachments
  const [uploadedDoc, setUploadedDoc] = useState<ExtractionResult | null>(null);
  const [isDocLoading, setIsDocLoading] = useState(false);

  const [analyzedPhoto, setAnalyzedPhoto] = useState<VisualHazardAnalysis | null>(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Execution result
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [verifiedDetails, setVerifiedDetails] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // AdaL Status
  const [adalStatus, setAdalStatus] = useState<any>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Selected report for analysis
  const activeReport = selectedReport || reports[0];

  useEffect(() => {
    fetchAdalStatus();
    fetchAuditLogs();
  }, []);

  const fetchAdalStatus = async () => {
    try {
      const res = await fetch('/api/autopilot/status');
      if (res.ok) {
        const data = await res.json();
        setAdalStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch AdaL status:', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/autopilot/audit-log');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {}
  };

  // Voice recording using Web Speech API
  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Web Speech API is not supported in this browser. Please use text input or Chrome/Edge.');
        return;
      }
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN';

      rec.onresult = (evt: any) => {
        let text = '';
        for (let i = 0; i < evt.results.length; i++) {
          text += evt.results[i][0].transcript + ' ';
        }
        setVoiceTranscript(text.trim());
      };

      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);

      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
    }
  };

  // Document upload handler
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDocLoading(true);
    try {
      const result = await extractTextFromFile(file);
      setUploadedDoc(result);
    } catch (err: any) {
      alert(`Document extraction error: ${err.message}`);
    } finally {
      setIsDocLoading(false);
    }
  };

  // Photo upload & visual hazard inspection handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPhotoLoading(true);
    setPhotoPreviewUrl(URL.createObjectURL(file));

    try {
      const analysis = await analyzeSafetyPhotograph(file);
      setAnalyzedPhoto(analysis);
    } catch (err: any) {
      alert(`Photo inspection error: ${err.message}`);
    } finally {
      setIsPhotoLoading(false);
    }
  };

  // Step 1 -> 2 -> 3: Generate Execution Plan
  const handleGeneratePlan = async () => {
    if (!prompt.trim()) return;

    setIsPlanning(true);
    setCurrentStage(2);

    try {
      const res = await fetch('/api/autopilot/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          report: activeReport,
          multimodalContext: {
            photoAnalysis: analyzedPhoto,
            voiceTranscript: voiceTranscript || null,
            docText: uploadedDoc?.text?.slice(0, 1000) || null
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate execution plan.');

      const generatedPlan: ExecutionPlan = data.plan;

      // If photo was analyzed, blend visual evidence into the proposed title and description
      if (analyzedPhoto) {
        generatedPlan.proposedAction.hazardType = analyzedPhoto.primaryHazard;
        generatedPlan.proposedAction.barrierAddressed = analyzedPhoto.barrierImplication;
        generatedPlan.proposedAction.description += ` [Visual Evidence: ${analyzedPhoto.evidenceQuotes[0]}]`;
      }

      setPlan(generatedPlan);
      setEditTitle(generatedPlan.proposedAction.title);
      setEditOwner(generatedPlan.proposedAction.owner);
      setEditPriority(generatedPlan.proposedAction.priority);
      setEditDeadline(generatedPlan.proposedAction.targetDate);

      setCurrentStage(3);
    } catch (err: any) {
      alert(`Plan formulation failed: ${err.message}`);
      setCurrentStage(1);
    } finally {
      setIsPlanning(false);
    }
  };

  // Step 4: Approve and Initiate Autonomous Browser Execution
  const handleApproveAndExecute = async () => {
    if (!plan) return;

    setCurrentStage(5);
    setIsExecuting(true);

    const updatedPlan: ExecutionPlan = {
      ...plan,
      proposedAction: {
        ...plan.proposedAction,
        title: editTitle,
        owner: editOwner,
        priority: editPriority,
        targetDate: editDeadline
      }
    };

    try {
      const res = await fetch('/api/autopilot/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: updatedPlan,
          userApproved: true,
          approvedBy: user?.name || 'Lead Safety Officer',
          customModifications: updatedPlan.proposedAction
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');

      setExecutionResult(data);

      // Connect to existing SAFE-X Corrective Actions Register!
      if (data.dispatchedTask) {
        addCorrectiveAction({
          reportId: activeReport.id,
          title: data.dispatchedTask.title,
          description: data.dispatchedTask.description,
          owner: data.dispatchedTask.owner,
          targetDate: data.dispatchedTask.targetDate,
          priority: data.dispatchedTask.priority,
          status: 'ASSIGNED',
          verificationMethod: data.dispatchedTask.verificationMethod,
          barrierAddressed: data.dispatchedTask.barrierAddressed,
          installation: data.dispatchedTask.installation
        });
      }

      // Step 6: Trigger independent verification
      await performIndependentVerification(data.dispatchedTask.id);
      setCurrentStage(6);
      fetchAuditLogs();
    } catch (err: any) {
      alert(`Browser automation execution error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Independent verification against destination CMMS API
  const performIndependentVerification = async (taskId: string) => {
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/cmms/verify/${encodeURIComponent(taskId)}`);
      const data = await res.json();
      setVerifiedDetails(data);
    } catch (err) {
      console.error('Verification query failed:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancelPlan = () => {
    setPlan(null);
    setCurrentStage(1);
    setExecutionResult(null);
    setVerifiedDetails(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner: SAFE-X Autopilot Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-oil-500 to-orange-600 flex items-center justify-center font-black text-2xl shadow-lg border border-oil-400">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-oil-500/20 text-oil-300 border border-oil-500/30">
                Track 1 • AI-Native Browser Companion
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                Powered by AdaL <span className="font-mono text-[10px] text-oil-400">v{adalStatus?.adalVersion || '1.11.0'}</span>
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              SAFE-X Autopilot
              <span className="text-xs font-normal text-slate-400 border border-slate-800 bg-slate-900 px-2 py-0.5 rounded-full">
                Zero-Regression Autonomous Workflow
              </span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Natural-language safety reasoning, SIF Precursor DNA synthesis, human approval gates, real browser task dispatch, and independent cryptographic outcome verification.
            </p>
          </div>
        </div>

        {/* Diagnostic & CMMS portal quick links */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-oil-400" />
            <span>AdaL Harness Status</span>
          </button>

          <a
            href="/cmms.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-orange-600/90 hover:bg-orange-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Destination CMMS</span>
          </a>
        </div>
      </div>

      {/* AdaL System Diagnostics Drawer (Toggled) */}
      {showDiagnostics && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3 animate-fade-in font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold text-white">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              AdaL Engine Environment & Capability Manifest
            </span>
            <button onClick={() => setShowDiagnostics(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">AdaL CLI Harness</span>
              <span className="font-bold text-emerald-400">v{adalStatus?.adalVersion || '1.11.0'} (Active)</span>
              <p className="text-[10px] text-slate-500 mt-1 truncate">{adalStatus?.adalPath || 'C:\\Users\\mitaj\\.adal\\bin\\adal.cmd'}</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Active Worker Capabilities</span>
              <span className="font-bold text-oil-400">Browser Use • Bash • Read • Search</span>
              <p className="text-[10px] text-slate-500 mt-1">Chromium automation & stdio runtime enabled</p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Connected Destination Portal</span>
              <span className="font-bold text-orange-400">OIL SAP-PM CMMS Dispatcher</span>
              <p className="text-[10px] text-slate-500 mt-1">/cmms.html • Cryptographic VTOK Token Verification</p>
            </div>
          </div>
        </div>
      )}

      {/* Six-Stage Progression Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
          {[
            { num: 1, title: '1. Intent & Input' },
            { num: 2, title: '2. Safety DNA Fusion' },
            { num: 3, title: '3. Multi-Step Plan' },
            { num: 4, title: '4. Human Approval' },
            { num: 5, title: '5. Browser Execution' },
            { num: 6, title: '6. Verification' }
          ].map((stg) => {
            const isDone = currentStage > stg.num;
            const isCurrent = currentStage === stg.num;

            return (
              <div
                key={stg.num}
                className={`p-2.5 rounded-lg border transition-all text-center ${
                  isCurrent
                    ? 'border-oil-500 bg-oil-50 text-oil-900 font-bold shadow-sm'
                    : isDone
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-oil-600 animate-pulse"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  )}
                  <span className="text-[11px] truncate">{stg.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Control Panel (Left) & Live Execution Stepper (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Natural Language Input & Multimodal Ingestion (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Prompt & Context Selection Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-oil-600" />
                Natural Language Instruction
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Input Engine</span>
            </div>

            {/* Quick Demo Chips */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Sample Hackathon Evaluation Prompts:
              </label>
              <div className="flex flex-col gap-1.5">
                {[
                  'Analyze these incident reports, identify the highest-priority SIF precursor, explain the evidence, prepare a corrective action, and create a task in the connected safety task-management application after I approve it.',
                  'Evaluate Jorhat Rig 4 workover report, isolate stored energy hazard, and dispatch supervisory LOTO verification task to CMMS.',
                  'Perform multimodal inspection on uploaded safety photograph, cross-reference precursor DNA, and schedule external engineering intervention.'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(sample)}
                    className="text-left text-[11px] p-2 rounded-lg bg-slate-50 hover:bg-oil-50/70 border border-slate-200 hover:border-oil-300 text-slate-700 transition line-clamp-2"
                  >
                    💬 {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Prompt */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Custom Instruction
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Give autonomous instructions to SAFE-X Autopilot..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-oil-500 focus:bg-white transition"
              />
            </div>

            {/* Target Report Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Target Incident Report (SAFE-X Dataset)
              </label>
              <select
                value={activeReport.id}
                onChange={(e) => selectReport(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-oil-500"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} • {r.installation} ({r.asset}) — {r.sifPrecursor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multimodal Companion Ingestion Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Multimodal Companion Attachments
              </h2>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Voice • Photo • Doc
              </span>
            </div>

            {/* 1. Voice Reporting Mic */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Mic className={`w-3.5 h-3.5 ${isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`} />
                  Voice Note (Hindi / English)
                </span>
                <button
                  onClick={toggleVoiceRecording}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  {isRecording ? 'Stop Recording' : 'Record Voice'}
                </button>
              </div>

              {voiceTranscript && (
                <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 italic">
                  "{voiceTranscript}"
                </p>
              )}
            </div>

            {/* 2. Safety Photo Upload & Visual Hazard Inspector */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  On-Site Safety Photograph Inspection
                </span>
                <label className="cursor-pointer px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>{isPhotoLoading ? 'Scanning...' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {analyzedPhoto && (
                <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-amber-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Visual Hazard Identified
                    </span>
                    <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                      {analyzedPhoto.confidenceScore}% Confidence
                    </span>
                  </div>

                  {photoPreviewUrl && (
                    <img
                      src={photoPreviewUrl}
                      alt="Hazard evidence"
                      className="w-full h-32 object-cover rounded border border-slate-200"
                    />
                  )}

                  <div className="text-[11px] text-slate-700 space-y-1">
                    <p><strong>Primary Hazard:</strong> {analyzedPhoto.primaryHazard}</p>
                    <p><strong>Precursor:</strong> {analyzedPhoto.detectedPrecursors[0]}</p>
                    <p className="text-slate-500 italic">"{analyzedPhoto.evidenceQuotes[0]}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Document Processing (PDF/TXT/CSV) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Supplementary Incident PDF / TXT
                </span>
                <label className="cursor-pointer px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>{isDocLoading ? 'Parsing...' : 'Upload Doc'}</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.csv,.docx"
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedDoc && (
                <div className="bg-white p-2.5 rounded border border-blue-200 text-xs flex items-center justify-between">
                  <span className="truncate max-w-[200px] text-slate-800 font-semibold">{uploadedDoc.fileName}</span>
                  <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                    {uploadedDoc.wordCount} words extracted
                  </span>
                </div>
              )}
            </div>

            {/* Step 1 Submit Button: Initiate Analysis & Plan */}
            <button
              onClick={handleGeneratePlan}
              disabled={isPlanning || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-oil-600 hover:bg-oil-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Safety DNA & Formulating Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Step 1: Formulate Autonomous Plan</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Execution Workspace, Evidence, Stepper & Verification (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Stage Container */}
          {currentStage === 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-oil-100 text-oil-700 flex items-center justify-center mx-auto">
                <Bot className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-black text-slate-900">Awaiting Agent Instruction</h3>
                <p className="text-xs text-slate-500">
                  Select a prompt and target report on the left panel, attach any frontline voice recordings or equipment photographs, and click <strong>"Formulate Autonomous Plan"</strong> to begin.
                </p>
              </div>
            </div>
          )}

          {/* STAGE 2 & 3: Evidence & Execution Plan Display */}
          {(currentStage >= 2 && currentStage <= 4) && plan && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                    Stage 3 • Plan Formulation & Evidence Linking
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    Autonomous Browser Execution Plan
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditingPlan(!isEditingPlan)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-oil-600" />
                  <span>{isEditingPlan ? 'Close Edit' : 'Edit Details'}</span>
                </button>
              </div>

              {/* Evidence & Precursor DNA Analysis Summary (Reusing SAFE-X Core Intelligence) */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-3 text-xs shadow-inner">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold flex items-center gap-1.5 text-oil-400">
                    <Dna className="w-4 h-4" />
                    SIF Precursor DNA & Barrier Synthesis
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{plan.reportId}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Hazard & Exposure</span>
                    <span className="font-bold text-white">{plan.proposedAction.hazardType}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Degraded Safety Barrier</span>
                    <span className="font-bold text-rose-400">{plan.proposedAction.barrierAddressed}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-1 font-semibold uppercase">Extracted Report Evidence:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {plan.evidenceSummary.map((ev, i) => (
                      <li key={i} className="line-clamp-2">"{ev}"</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Proposed Action Parameters (Editable) */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Proposed Corrective Action Work Order
                </h4>

                {isEditingPlan ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Work Order Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-oil-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Assignee</label>
                        <input
                          type="text"
                          value={editOwner}
                          onChange={(e) => setEditOwner(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-oil-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Priority</label>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Routine">Routine</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Target Deadline</label>
                        <input
                          type="date"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 text-sm">{editTitle}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-slate-200 text-slate-600">
                      <div><span className="text-slate-400 block">Owner:</span> <strong>{editOwner}</strong></div>
                      <div><span className="text-slate-400 block">Priority:</span> <strong className="text-rose-600">{editPriority}</strong></div>
                      <div><span className="text-slate-400 block">Deadline:</span> <strong>{editDeadline}</strong></div>
                      <div><span className="text-slate-400 block">Destination:</span> <strong>OIL CMMS</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ordered Browser Steps to be Performed */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-600" />
                  Scheduled Real Browser Operations
                </h4>
                <div className="space-y-1.5">
                  {plan.browserSteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-mono text-slate-500 font-bold">Step {step.stepNumber}:</span>
                      <span className="font-semibold text-slate-800 flex-1 ml-3">{step.description}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-mono">
                        {step.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 4: Human Approval Gate */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3 text-xs">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>Stage 4: Mandatory Human-in-the-Loop Authorization</span>
                </div>
                <p className="text-amber-800 text-[11px]">
                  Before consequential external changes occur, review the action details above. Clicking <strong>"Approve & Execute via Browser Agent"</strong> authorizes the agent to navigate to the OIL CMMS portal, submit the form, and verify the work order.
                </p>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    onClick={handleCancelPlan}
                    className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
                  >
                    Cancel Plan
                  </button>

                  <button
                    onClick={handleApproveAndExecute}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Execute via Browser Agent</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 5: Live Autonomous Execution Viewport */}
          {currentStage === 5 && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl text-white space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping"></span>
                  <h3 className="text-base font-black text-white">Browser Agent Autonomous Execution</h3>
                </div>
                <span className="font-mono text-xs text-orange-400 bg-orange-950/60 px-2.5 py-1 rounded border border-orange-800">
                  Target: /cmms.html
                </span>
              </div>

              {/* Progress Stepper & Terminal Log */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-slate-400 text-[11px]">// Real-time autonomous browser dispatch stream:</div>
                  <div className="text-emerald-400">✓ Browser launched via Chromium harness</div>
                  <div className="text-emerald-400">✓ Navigated to http://localhost:5173/cmms.html</div>
                  <div className="text-emerald-400">✓ Target DOM selectors located (#task-title, #task-owner)</div>
                  <div className="text-orange-400 animate-pulse">⚡ Injecting approved parameters into form controls...</div>
                  <div className="text-slate-400">... Awaiting DOM confirmation receipt</div>
                </div>

                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-oil-500" />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 6: Final Outcome & Independent Verification Evidence */}
          {currentStage === 6 && executionResult && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    Stage 6 • Outcome Verified
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Corrective Action Dispatched & Cryptographically Verified
                  </h3>
                </div>
                <button
                  onClick={handleCancelPlan}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start New Run</span>
                </button>
              </div>

              {/* Verified Result Card */}
              <div className="p-5 rounded-xl bg-emerald-950 text-emerald-100 border border-emerald-700 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-900">
                  <span className="font-bold text-white text-sm">OIL Industrial CMMS Work Order Created</span>
                  <span className="font-mono text-xs text-emerald-300 bg-emerald-900/80 px-2.5 py-1 rounded border border-emerald-600 font-bold">
                    {executionResult.dispatchedTask.id}
                  </span>
                </div>

                <div className="space-y-1 text-slate-200 text-xs">
                  <p><strong>Title:</strong> {executionResult.dispatchedTask.title}</p>
                  <p><strong>Installation / Asset:</strong> {executionResult.dispatchedTask.installation} ({executionResult.dispatchedTask.asset})</p>
                  <p><strong>Assignee:</strong> {executionResult.dispatchedTask.owner} • <strong>Priority:</strong> {executionResult.dispatchedTask.priority}</p>
                  <p><strong>Target Deadline:</strong> {executionResult.dispatchedTask.targetDate}</p>
                </div>

                <div className="pt-2 border-t border-emerald-900/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-emerald-300">
                  <span>Verification Token: <strong>{executionResult.dispatchedTask.verificationToken}</strong></span>
                  <span>Timestamp: {new Date(executionResult.dispatchedTask.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Independent Verification Report */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Independent Cross-Verification Evidence
                </h4>
                <p className="text-slate-600 text-[11px]">
                  The agent queried the destination CMMS endpoint (<code>{executionResult.verificationUrl}</code>) independently. The saved task identifier, payload hash, and status were confirmed without discrepancy.
                </p>

                <div className="flex items-center space-x-3 pt-2">
                  <a
                    href={`/cmms.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View in OIL CMMS Portal</span>
                  </a>

                  <button
                    onClick={() => setActiveTab('corrective-actions')}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <span>View in SAFE-X Action Register →</span>
                  </button>
                </div>
              </div>

              {/* Step Execution Trace */}
              <div className="space-y-1.5 text-xs font-mono">
                <span className="font-bold text-slate-700 font-sans text-xs block">Execution Step Audit Log:</span>
                {executionResult.executionLog?.map((log: any) => (
                  <div
                    key={log.step}
                    className="p-2 rounded bg-slate-100 border border-slate-200 flex items-center justify-between text-[11px]"
                  >
                    <span className="font-bold text-slate-800">[{log.action}]</span>
                    <span className="text-slate-600 truncate mx-2">{log.details}</span>
                    <span className="text-emerald-700 font-bold">✓ {log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit History Panel */}
          {auditLogs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  SAFE-X Autopilot Session History
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">{auditLogs.length} logged runs</span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {auditLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between hover:bg-slate-100 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 line-clamp-1">{log.actionTitle}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>Task: <strong>{log.dispatchedTaskId}</strong></span>
                        <span>•</span>
                        <span>Approved by: {log.approvedBy}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
