import React, { useState } from 'react';
import {
  Share2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Activity,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WeakSignalFusion: React.FC = () => {
  const { weakSignalClusters, reports, selectedReport, selectReport, setActiveTab } = useApp();

  const [viewMode, setViewMode] = useState<'report' | 'cluster'>('report');
  const [selectedClusterId, setSelectedClusterId] = useState<string>(weakSignalClusters[0]?.id || 'WSC-01');

  const currentCluster = weakSignalClusters.find(c => c.id === selectedClusterId) || weakSignalClusters[0];
  const clusterReports = reports.filter(r => currentCluster?.reportIds.includes(r.id));

  // Determine signals to show in the 4-step fusion formula
  const activeSignals = selectedReport?.weakSignals && selectedReport.weakSignals.length > 0
    ? selectedReport.weakSignals
    : [
        { id: 'ws-1', type: 'Equipment', name: 'Minor Mechanical Anomaly', evidence: selectedReport?.evidence[0] || 'Minor anomaly noted', severity: 'Medium' as const },
        { id: 'ws-2', type: 'Supervision', name: 'Verification Gap', evidence: 'Omission of four-eyes verification', severity: 'High' as const }
      ];

  const fusionSignalsText = activeSignals.map(s => `[ ${s.name} ]`).join(' + ');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                Hero Innovation #2
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500">Multi-Signal Pattern Synthesis</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">Weak Signal Fusion Engine</h1>
            <p className="text-xs text-slate-500">
              Correlating multiple subtle operational signals (PPE gap, supervision, abnormal vibration, passing valve, delayed maintenance) into emergent precursor patterns.
            </p>
          </div>
        </div>

        {/* Report Selector */}
        <div className="flex items-center space-x-2 text-xs">
          <label className="font-bold text-slate-500">Report:</label>
          <select
            value={selectedReport?.id}
            onChange={(e) => selectReport(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium max-w-[220px] truncate outline-none"
          >
            {reports.slice(0, 20).map(r => (
              <option key={r.id} value={r.id}>
                {r.id} • {r.asset} ({r.sifPrecursor.slice(0, 18)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Switcher: Active Report Signals vs Multi-Report Clusters */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setViewMode('report')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'report'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Active Report Weak Signals ({selectedReport?.id})
        </button>
        <button
          onClick={() => setViewMode('cluster')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'cluster'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Spatial Asset Clusters ({weakSignalClusters.length} Discovered)
        </button>
      </div>

      {/* Cluster Cards (when in cluster mode) */}
      {viewMode === 'cluster' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weakSignalClusters.map((cluster) => {
            const isSelected = cluster.id === selectedClusterId;
            return (
              <div
                key={cluster.id}
                onClick={() => setSelectedClusterId(cluster.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-bold text-slate-500">{cluster.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    Risk: {cluster.clusterRisk}/100
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{cluster.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Installation: <span className="font-semibold text-slate-700">{cluster.installation}</span>
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">{cluster.reportIds.length} Linked Signals</span>
                  <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deep-Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Fusion Concept & Timeline */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Emergent Precursor Fusion Logic Card (Dynamically Generated from Report) */}
          <div className="bg-gradient-to-br from-charcoal-900 to-slate-900 text-white rounded-xl p-5 shadow-sm space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Emergent Signal Interaction Formula
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Deterministic Corroboration</span>
            </div>

            {/* Visual formula dynamically reflects actual signals */}
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/80 text-xs font-mono text-center space-y-1.5">
              <div className="text-blue-300 font-semibold">
                {viewMode === 'report' ? fusionSignalsText : currentCluster.commonFactors.map(f => `[ ${f} ]`).join(' + ')}
              </div>
              <div className="text-slate-400 text-[10px]">↓ FUSION CORRELATION ↓</div>
              <div className="text-amber-400 font-bold">
                {viewMode === 'report' ? `${selectedReport?.sifPrecursor} Emergent Signal Cluster` : `CLUSTER ${currentCluster.id}: ${currentCluster.dominantPrecursor}`}
              </div>
              <div className="text-slate-400 text-[10px]">↓ ROOT BARRIER CHALLENGE ↓</div>
              <div className="text-rose-400 font-bold">
                COMMON BARRIER DEGRADATION: {viewMode === 'report' ? selectedReport?.barrier : 'Energy Isolation & Pressure Boundary'}
              </div>
              <div className="text-slate-400 text-[10px]">↓ ESCALATION POTENTIAL ↓</div>
              <div className="text-red-500 font-extrabold text-sm">
                {viewMode === 'report' ? `${selectedReport?.sifPotential} (${selectedReport?.dna.potentialConsequence})` : `HIGH SIF POTENTIAL (${currentCluster.title})`}
              </div>
            </div>
          </div>

          {/* Weak Signals Details (When in Report mode) */}
          {viewMode === 'report' ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Weak Signals Detected in Report {selectedReport?.id}
                  </h3>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {activeSignals.length} Signals Identified
                </span>
              </div>

              <div className="space-y-3">
                {activeSignals.map((sig, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{sig.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded uppercase ${
                        sig.severity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sig.severity} Severity
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium pl-7">
                      Category: <span className="text-slate-700 font-semibold">{sig.type}</span>
                    </div>

                    <div className="p-2.5 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-md text-xs font-medium text-amber-950 italic ml-7">
                      "{sig.evidence}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Fusion Chronological Timeline (When in cluster mode) */
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Temporal Signal Escalation Timeline
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Click signal to open report</span>
              </div>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {currentCluster.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      selectReport(item.reportId);
                      setActiveTab('report-analyzer');
                    }}
                    className="relative pl-8 cursor-pointer group"
                  >
                    <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 group-hover:scale-125 transition-transform" />
                    <div className="p-3 bg-slate-50 group-hover:bg-blue-50/50 rounded-lg border border-slate-200 group-hover:border-blue-300 transition-all text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[11px] font-bold text-slate-500">{item.date}</span>
                        <span className="font-mono text-[10px] text-blue-700 font-bold">{item.reportId}</span>
                      </div>
                      <p className="font-semibold text-slate-800 group-hover:text-blue-900">
                        {item.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          </div>

          {/* Right 5 Cols: Common Factors & Linked Reports List */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Common Factors Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Common Underlying Factors
              </h3>
              <p className="text-xs text-slate-500">
                Interconnected patterns discovered across multiple reports on this asset:
              </p>

              <div className="space-y-2">
                {currentCluster.commonFactors.map((factor, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 flex items-start gap-2 font-medium">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Cluster Intervention */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Cluster-Level Remediation
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  Strategic Action
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {currentCluster.recommendedIntervention}
              </p>
              <button
                onClick={() => setActiveTab('corrective-actions')}
                className="w-full py-2 bg-oil-600 hover:bg-oil-700 text-white rounded-lg text-xs font-bold transition-colors text-center shadow-sm"
              >
                Dispatch Asset Overhaul Action
              </button>
            </div>

            {/* Participating Reports in this Cluster */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Participating Reports ({clusterReports.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {clusterReports.map((cr) => (
                  <div
                    key={cr.id}
                    onClick={() => {
                      selectReport(cr.id);
                      setActiveTab('report-analyzer');
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 font-mono">{cr.id}</span>
                      <span className="text-[10px] text-slate-400">{cr.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{cr.narrative}</p>
                  </div>
                ))}
              </div>
          </div>

        </div>

      </div>
    </div>
  );
};
