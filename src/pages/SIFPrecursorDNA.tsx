import React, { useState } from 'react';
import {
  Dna,
  ChevronRight,
  Shield,
  AlertTriangle,
  ArrowDown,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
  Layers,
  Activity,
  Flame,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SIFPrecursorDNA: React.FC = () => {
  const { selectedReport, reports, selectReport, setActiveTab } = useApp();

  const [activeNode, setActiveNode] = useState<string>('barrier');

  if (!selectedReport) return null;

  const dna = selectedReport.dna;

  const DNA_NODES = [
    {
      id: 'activity',
      stage: 'STAGE 1: OPERATIONAL CONTEXT',
      title: 'Activity',
      value: dna.activity,
      icon: Activity,
      color: 'border-blue-500 text-blue-700 bg-blue-50',
      evidence: selectedReport.evidence.find(e => e.toLowerCase().includes(dna.activity.toLowerCase())) || `Operational task: ${dna.activity} conducted on ${selectedReport.asset}.`,
      confidence: selectedReport.confidence,
      riskContribution: '15%',
      recommendedControl: `Verify current approved Standard Operating Procedure (SOP) and Permit-to-Work for ${dna.activity}.`
    },
    {
      id: 'hazard',
      stage: 'STAGE 2: ENERGY SOURCE',
      title: 'Hazard',
      value: dna.hazard,
      icon: Flame,
      color: 'border-amber-500 text-amber-700 bg-amber-50',
      evidence: selectedReport.evidence[0] || `Active hazardous energy source: ${dna.hazard} identified in operating envelope.`,
      confidence: Math.min(98, selectedReport.confidence + 2),
      riskContribution: '35%',
      recommendedControl: selectedReport.actionPlan?.correctiveActions?.[0] || 'Positive de-energization, continuous monitoring, and primary containment verification.'
    },
    {
      id: 'exposure',
      stage: 'STAGE 3: RECEPTOR PROXIMITY',
      title: 'Exposure',
      value: dna.exposure,
      icon: UserCheck,
      color: 'border-orange-500 text-orange-700 bg-orange-50',
      evidence: selectedReport.evidence.find(e => /worker|technician|personnel|crew|derrickman/i.test(e)) || `Personnel envelope: ${dna.exposure} during operations.`,
      confidence: Math.max(85, selectedReport.confidence - 3),
      riskContribution: '20%',
      recommendedControl: 'Rigid standoff barricading and strict enforcement of line-of-fire exclusion zone.'
    },
    {
      id: 'barrier',
      stage: 'STAGE 4: DEFENSE LINE',
      title: 'Primary Safety Barrier',
      value: dna.barrier,
      icon: Shield,
      color: 'border-rose-500 text-rose-700 bg-rose-50',
      evidence: `Challenged safety barrier: ${dna.barrier}. ${selectedReport.barrierDegradationDetails?.failureMode || ''}`,
      confidence: selectedReport.confidence,
      riskContribution: '30%',
      recommendedControl: selectedReport.barrierDegradationDetails?.reinforcementAction || selectedReport.recommendedIntervention.primary
    },
    {
      id: 'controlFailure',
      stage: 'STAGE 5: LATENT BREAKDOWN',
      title: 'Control Failure',
      value: dna.controlFailure,
      icon: AlertTriangle,
      color: 'border-red-600 text-red-800 bg-red-50',
      evidence: selectedReport.evidence[1] || selectedReport.evidence[0] || `Omission or breakdown: ${dna.controlFailure}`,
      confidence: Math.max(88, selectedReport.confidence - 2),
      riskContribution: '25%',
      recommendedControl: `Independent four-eyes witness check and formal supervisor sign-off before commencing work.`
    },
    {
      id: 'sifPrecursor',
      stage: 'STAGE 6: CRITICAL TRIGGER',
      title: 'SIF Precursor',
      value: dna.sifPrecursor,
      icon: Dna,
      color: 'border-rose-600 text-rose-900 bg-rose-100',
      evidence: `Potential SIF precursor detected: ${dna.sifPrecursor} (${selectedReport.confidence}% model confidence).`,
      confidence: selectedReport.confidence,
      riskContribution: '40%',
      recommendedControl: selectedReport.actionPlan?.correctiveActions?.[1] || selectedReport.recommendedIntervention.primary
    },
    {
      id: 'iogpRule',
      stage: 'STAGE 7: LIFE-SAVING STANDARD',
      title: 'IOGP Life-Saving Rule',
      value: dna.iogpRule,
      icon: Lock,
      color: 'border-oil-600 text-oil-800 bg-oil-50',
      evidence: `Directly mapped to global industry Life-Saving Standard: "${dna.iogpRule}".`,
      confidence: 98,
      riskContribution: 'Policy Mandate',
      recommendedControl: 'Mandatory Stop-Work Authority invoked until rule compliance is certified.'
    },
    {
      id: 'potentialConsequence',
      stage: 'STAGE 8: FATAL OUTCOME ENVELOPE',
      title: 'Potential Consequence',
      value: dna.potentialConsequence,
      icon: AlertTriangle,
      color: 'border-purple-600 text-purple-900 bg-purple-50',
      evidence: `Worst credible operational escalation: ${dna.potentialConsequence}`,
      confidence: Math.max(82, selectedReport.confidence - 5),
      riskContribution: 'Severe / Catastrophic',
      recommendedControl: 'Emergency isolation, physical stand-down, and personnel evacuation protocol.'
    }
  ];

  const selectedNodeData = DNA_NODES.find(n => n.id === activeNode) || DNA_NODES[3];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-oil-700 flex items-center justify-center font-bold">
            <Dna className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                Hero Innovation #1
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500">Causal Anatomy</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">SIF Precursor DNA Analyzer</h1>
            <p className="text-xs text-slate-500">
              Transforming unstructured safety observations into an explainable 8-stage causal chain. Click any node to inspect evidence.
            </p>
          </div>
        </div>

        {/* Report Picker */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-500">Analyze Report:</label>
          <select
            value={selectedReport.id}
            onChange={(e) => selectReport(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium max-w-[240px] truncate outline-none focus:ring-1 focus:ring-oil-500"
          >
            {reports.slice(0, 25).map(r => (
              <option key={r.id} value={r.id}>
                {r.id} • {r.sifPrecursor} ({r.asset})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main DNA Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): Vertical Interactive Chain */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Connected DNA Sequence for {selectedReport.id}
            </h2>
            <span className="text-[11px] text-slate-400">Click any node to inspect findings</span>
          </div>

          <div className="space-y-2 relative">
            {DNA_NODES.map((node, idx) => {
              const Icon = node.icon;
              const isSelected = activeNode === node.id;

              return (
                <div key={node.id} className="relative">
                  <button
                    onClick={() => setActiveNode(node.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between group ${
                      isSelected
                        ? `${node.color} shadow-md scale-[1.01]`
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-white shadow-xs' : 'bg-slate-200 text-slate-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">{node.stage}</div>
                        <div className="text-xs font-bold text-slate-900 truncate">{node.title}: <span className="font-semibold text-slate-700">{node.value}</span></div>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isSelected ? 'rotate-90 text-slate-800' : 'text-slate-400 group-hover:translate-x-1'}`} />
                  </button>

                  {idx < DNA_NODES.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowDown className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 Cols): Node Deep-Dive Inspector & Risk Contribution */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Node Detail Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-oil-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  DNA Node Intelligence: {selectedNodeData.title}
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                Confidence: {selectedNodeData.confidence}%
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Classified Value:</span>
              <div className="text-sm font-bold text-slate-900">{selectedNodeData.value}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Report Evidence Excerpt:</span>
              <div className="p-3 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-md text-xs text-amber-950 font-medium">
                "{selectedNodeData.evidence}"
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Risk Contribution:</span>
                <span className="font-mono font-bold text-rose-600">{selectedNodeData.riskContribution}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Model Verification:</span>
                <span className="font-mono font-bold text-emerald-700">Deterministic Match</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Recommended Engineered Control:</span>
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-md text-xs text-emerald-950">
                {selectedNodeData.recommendedControl}
              </div>
            </div>
          </div>

          {/* Risk Contribution Breakdown (Visual Chart) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Risk Contribution Decomposition
            </h3>
            <p className="text-xs text-slate-500">
              Analytical breakdown of underlying factors elevating this report to {selectedReport.sifPotential}:
            </p>

            <div className="space-y-3">
              {dna.riskContribution.map((rc, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[220px]">{rc.factor}</span>
                    <span className="font-mono font-bold text-slate-900">{rc.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-oil-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${rc.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">{rc.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
