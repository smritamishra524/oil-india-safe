import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Activity,
  Calendar,
  FileText,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BarrierDegradation: React.FC = () => {
  const { barrierHealth, reports, selectedReport, selectReport, setActiveTab } = useApp();

  const [selectedBarrierName, setSelectedBarrierName] = useState<string>(
    selectedReport?.barrier || barrierHealth[0]?.barrier || 'Energy Isolation (LOTO)'
  );

  const selectedBarrier = barrierHealth.find(b => b.barrier === selectedBarrierName) || barrierHealth[0];

  const relatedReports = reports.filter(r => r.barrier === selectedBarrier?.barrier).slice(0, 10);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                Hero Innovation #3
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500">Defensive Barrier Integrity</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">Barrier Degradation Intelligence</h1>
            <p className="text-xs text-slate-500">
              Continuous temporal health monitoring of physical and procedural safety barriers across all operational fields.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-600">Tracked Barriers:</span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-full font-mono">
            {barrierHealth.length} Primary Systems
          </span>
        </div>
      </div>

      {/* Active Report Barrier Diagnostics */}
      {selectedReport && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-md border border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                Active Report Barrier Diagnostic
              </span>
              <span className="text-xs font-mono text-slate-300">
                {selectedReport.id} • {selectedReport.asset}
              </span>
            </div>
            <button
              onClick={() => setSelectedBarrierName(selectedReport.barrier)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
            >
              Focus on {selectedReport.barrier} below →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Primary Barrier Evaluated</span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {selectedReport.barrier}
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  selectedReport.barrierDegraded ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {selectedReport.barrierDegraded ? 'DEGRADED / COMPROMISED' : 'INTACT'}
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                Failure Mode: <strong className="text-rose-300">{selectedReport.controlFailure}</strong>
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Quoted Report Evidence of Barrier Breakdown</span>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-700 text-amber-200 text-xs italic">
                "{selectedReport.barrierDegradationDetails?.evidence || selectedReport.evidence[0] || selectedReport.narrative}"
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                Reinforcement Mandate: {selectedReport.barrierDegradationDetails?.reinforcementAction || selectedReport.actionPlan?.immediateMitigation || 'Enforce physical verification prior to recommencing work.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barrier Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {barrierHealth.map((b) => {
          const isSelected = b.barrier === selectedBarrierName;
          const isCritical = b.currentStatus === 'Critical';
          const isDegrading = b.currentStatus === 'Degrading';
          const isWarning = b.currentStatus === 'Warning';

          return (
            <div
              key={b.barrier}
              onClick={() => setSelectedBarrierName(b.barrier)}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-rose-600 bg-rose-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  isCritical ? 'bg-rose-100 text-rose-800' :
                  isDegrading ? 'bg-amber-100 text-amber-800' :
                  isWarning ? 'bg-yellow-100 text-yellow-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {b.currentStatus}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">{b.healthScore}%</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">{b.barrier}</h4>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{b.failureCount} Failures</span>
                <span className="text-rose-600 font-semibold">{b.openActionCount} Actions</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Barrier Deep-Dive */}
      {selectedBarrier && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (7 Cols): Degradation Driver & 5-Month Trajectory */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Health Overview Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedBarrier.barrier}</h3>
                  <p className="text-xs text-slate-500">Systemic health trajectory based on field reports and control bypasses</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-rose-600 font-mono">{selectedBarrier.healthScore}/100</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Current Health Index</div>
                </div>
              </div>

              {/* Degradation Driver Banner */}
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Primary Degradation Driver:
                </div>
                <p className="text-rose-900 leading-relaxed font-medium">
                  {selectedBarrier.degradationDriver}
                </p>
              </div>

              {/* 5-Month Temporal Degradation Pipeline (Direct from prompt!) */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                  5-Month Health Trajectory
                </span>
                
                <div className="grid grid-cols-5 gap-2 text-center">
                  {selectedBarrier.monthlyHistory.map((m, idx) => {
                    const statusColor = 
                      m.status === 'HEALTHY' ? 'bg-emerald-500 text-white' :
                      m.status === 'WARNING' ? 'bg-amber-500 text-white' :
                      m.status === 'DEGRADING' ? 'bg-orange-500 text-white' :
                      'bg-rose-600 text-white';

                    return (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-between space-y-1">
                        <span className="text-[10px] font-bold text-slate-500">{m.month.split(' ')[0]}</span>
                        <div className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${statusColor}`}>
                          {m.status}
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-800">{m.score}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Degradation Metrics & Actions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Total Failure Ingestions</span>
                <div className="text-2xl font-black text-slate-900 font-mono">{selectedBarrier.failureCount}</div>
                <p className="text-[10px] text-slate-400 mt-1">Observed across reports & inspections</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Open Corrective Mitigations</span>
                <div className="text-2xl font-black text-rose-600 font-mono">{selectedBarrier.openActionCount}</div>
                <p className="text-[10px] text-slate-400 mt-1">Active barrier restoration tasks</p>
              </div>
            </div>

          </div>

          {/* Right Column (5 Cols): Contributing Reports */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Contributing Reports ({relatedReports.length})
                </h3>
                <span className="text-[11px] text-slate-400">Click to examine</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {relatedReports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      selectReport(r.id);
                      setActiveTab('report-analyzer');
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer text-xs space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{r.id}</span>
                      <span className="text-[10px] text-slate-400">{r.date}</span>
                    </div>
                    <div className="text-slate-700 font-medium line-clamp-2">
                      {r.narrative}
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="text-oil-700 font-semibold">{r.installation}</span>
                      <span className="font-bold text-rose-600">{r.sifPrecursor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
