import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Flame,
  Activity,
  FileCheck2,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Share2,
  Dna,
  GitFork,
  Cpu,
  Clock,
  CheckCircle2,
  Layers,
  Bot,
  Mic,
  FileText,
  UploadCloud,
  ArrowRight,
  CheckSquare,
  ClipboardList,
  ShieldCheck,
  History,
  X,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/translations';

export const CommandCenter: React.FC = () => {
  const {
    reports,
    selectedReport,
    barrierHealth,
    correctiveActions,
    weakSignalClusters,
    precursorVelocity,
    safetyDebtScore,
    language,
    setActiveTab,
    selectReport,
    preloadFlagshipJudgeDemo
  } = useApp();

  const t = TRANSLATIONS[language];
  const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);

  // Dynamic Metrics from real shared state
  const totalReportsCount = reports.length;
  const sifPotentialCount = reports.filter(r => r.sifPotential === 'SIF-Capable' || r.sifPotential === 'Potential SIF').length;
  const criticalPrecursorsCount = reports.filter(r => r.severity === 'Critical').length;
  const degradingBarriersCount = barrierHealth.filter(b => b.currentStatus === 'Critical' || b.currentStatus === 'Degrading').length;
  const openActionsCount = correctiveActions.filter(a => a.status !== 'CLOSED').length;
  const primaryWeakCluster = weakSignalClusters[0];

  // Lowest barrier health calculation
  const lowestBarrier = [...barrierHealth].sort((a, b) => a.healthScore - b.healthScore)[0] || barrierHealth[0];
  
  // Fastest accelerating precursor
  const fastestPrecursor = [...precursorVelocity].sort((a, b) => b.velocityMultiplier - a.velocityMultiplier)[0] || precursorVelocity[0];

  // 7-Day SIF Risk Trend data
  const trendData = [
    { day: 'Day -6', sifRisk: 74, weakSignals: 8 },
    { day: 'Day -5', sifRisk: 78, weakSignals: 12 },
    { day: 'Day -4', sifRisk: 76, weakSignals: 11 },
    { day: 'Day -3', sifRisk: 82, weakSignals: 15 },
    { day: 'Day -2', sifRisk: 85, weakSignals: 18 },
    { day: 'Day -1', sifRisk: 89, weakSignals: 22 },
    { day: 'Today', sifRisk: 92, weakSignals: 25 },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* Top Welcome Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-oil-100 text-oil-800 uppercase tracking-wider border border-oil-200">
              Operational Safety Overview
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">Oil India Limited HSE Intelligence</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            Safety Intelligence Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={preloadFlagshipJudgeDemo}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 border border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Workover Incident Precursor</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SAFETY INTELLIGENCE OVERVIEW (Clean, compact summary information)      */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Safety Intelligence Overview
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Real-time composite telemetry</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          
          {/* 1. Overall Risk Index */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-oil-500 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
              <span>OVERALL RISK INDEX</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 font-mono">78</span>
              <span className="text-xs font-bold text-amber-600">/ 100 High</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              Trailing 7-day velocity acceleration
            </div>
          </div>

          {/* 2. Critical Alerts */}
          <div
            onClick={() => setActiveTab('early-warning')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-rose-500 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
              <span>CRITICAL ALERTS</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-rose-600 font-mono">{criticalPrecursorsCount}</span>
              <span className="text-[10px] font-bold text-rose-600 uppercase">Active</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              Direct intervention required
            </div>
          </div>

          {/* 3. SIF Precursors */}
          <div
            onClick={() => setActiveTab('sif-pathway')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-oil-500 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
              <span>SIF PRECURSORS</span>
              <Dna className="w-4 h-4 text-oil-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{sifPotentialCount}</span>
              <span className="text-[10px] font-bold text-slate-500">of {totalReportsCount}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              {Math.round((sifPotentialCount / (totalReportsCount || 1)) * 100)}% severe potential rate
            </div>
          </div>

          {/* 4. Emerging Risks */}
          <div
            onClick={() => setActiveTab('weak-signal-fusion')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-500 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
              <span>EMERGING RISKS</span>
              <Share2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-blue-700 font-mono">{weakSignalClusters.length}</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase">Clusters</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              {primaryWeakCluster?.dominantPrecursor || 'Valve isolation focus'}
            </div>
          </div>

          {/* 5. Degraded Barriers */}
          <div
            onClick={() => setActiveTab('barrier-degradation')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-rose-500 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
              <span>DEGRADED BARRIERS</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-rose-600 font-mono">{degradingBarriersCount}</span>
              <span className="text-[10px] font-bold text-slate-500">/ {barrierHealth.length} Total</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              Lowest: {lowestBarrier?.healthScore}% ({lowestBarrier?.barrier.split(' ')[0]})
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE INTELLIGENCE ENGINE (The Hero Section: 4 Large 2×2 Cards)         */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-oil-600 inline-block" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Core Intelligence Engines
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Four primary analytical models turning unstructured safety data into explainable, proactive defense.
          </p>
        </div>

        {/* Grid: 4 Engines on Left (7 cols) + Action Layer on Side (5 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (7 Cols): Core Detection Engines */}
          <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* HERO CARD 1: INCIDENT DNA INTELLIGENCE */}
            <div className="bg-white border border-slate-300/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-600 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shadow-sm">
                    <Dna className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Causal DNA Analysis
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Incident DNA Intelligence
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Deconstructs unstructured safety reports into structured causal sequences from activity to consequence.
                  </p>
                </div>

                {/* Real Report DNA Insight */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-700 uppercase">Active Report DNA:</span>
                    <span className="font-mono text-slate-500 font-semibold">{selectedReport?.id}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {selectedReport?.asset} • <span className="text-rose-600">{selectedReport?.sifPrecursor}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[9px] font-bold rounded">
                      {selectedReport?.activity}
                    </span>
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                      {selectedReport?.hazard}
                    </span>
                    <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">
                      {selectedReport?.barrier}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {reports.length} verified DNA sequences
                </span>
                <button
                  onClick={() => setActiveTab('sif-dna')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>View DNA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* HERO CARD 2: SIF INTELLIGENCE */}
            <div className="bg-white border border-slate-300/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-oil-600 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-oil-50 text-oil-700 border border-oil-200/80 flex items-center justify-center shadow-sm">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-oil-100 text-oil-900 border border-oil-200">
                    Precursor Velocity
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">
                    SIF Intelligence
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Evaluates Serious Injury &amp; Fatality potential pathways and precursor velocity multipliers.
                  </p>
                </div>

                {/* Real SIF Insight */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-700 uppercase">Top Accelerating Precursor:</span>
                    <span className="font-mono text-rose-600 font-bold">{fastestPrecursor?.velocityMultiplier}× Velocity</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {fastestPrecursor?.precursor} ({fastestPrecursor?.classification})
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    Observed {fastestPrecursor?.countCurrent30Days} times in past 30 days vs {fastestPrecursor?.countPrevious90Days} baseline.
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {sifPotentialCount} SIF Precursors tracked
                </span>
                <button
                  onClick={() => setActiveTab('sif-pathway')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>View Pathway</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* HERO CARD 3: WEAK SIGNAL FUSION */}
            <div className="bg-white border border-slate-300/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-600 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center shadow-sm">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                    Cross-Signal Fusion
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Weak Signal Fusion
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Correlates subtle operational anomalies into early emerging hazard clusters.
                  </p>
                </div>

                {/* Real Cluster Insight */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-700 uppercase">Primary Active Cluster:</span>
                    <span className="font-mono text-blue-700 font-bold">{primaryWeakCluster?.clusterRisk}/100 Risk</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {primaryWeakCluster?.title}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    {primaryWeakCluster?.reportIds?.length || 4} linked signals across {primaryWeakCluster?.asset}.
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {weakSignalClusters.length} active spatial clusters
                </span>
                <button
                  onClick={() => setActiveTab('weak-signal-fusion')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>View Fusion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* HERO CARD 4: BARRIER DEGRADATION INTELLIGENCE */}
            <div className="bg-white border border-slate-300/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-rose-600 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center justify-center shadow-sm">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-200">
                    Barrier Health
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Barrier Degradation
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    Tracks continuous temporal erosion and health status of defensive barriers.
                  </p>
                </div>

                {/* Real Barrier Insight */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-700 uppercase">Most Degraded Defense:</span>
                    <span className="font-mono text-rose-600 font-bold">{lowestBarrier?.healthScore}% (CRITICAL)</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {lowestBarrier?.barrier} • {lowestBarrier?.failureCount} failures
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    {lowestBarrier?.degradationDriver}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {barrierHealth.length} defense systems tracked
                </span>
                <button
                  onClick={() => setActiveTab('barrier-degradation')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>View Barriers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column (5 Cols): Compact, Premium Action Layer Side Section */}
          <div className="xl:col-span-5 space-y-4">
            
            {/* Action Layer Section Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-oil-600 inline-block" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-oil-600" />
                  Action Layer: Response &amp; Closure
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-oil-100 text-oil-800 rounded-full border border-oil-200">
                Report-Driven
              </span>
            </div>

            {/* CARD 1: ACTION INTELLIGENCE */}
            <div className="bg-white border-2 border-oil-600/30 rounded-2xl p-5 shadow-sm space-y-3.5 hover:border-oil-600 transition-all bg-gradient-to-br from-white via-white to-oil-50/20">
              <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-oil-100 text-oil-800 border border-oil-200">
                      Action Intelligence
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      selectedReport?.actionPlan?.priority === 'Immediate' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedReport?.actionPlan?.priority || 'Immediate'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-1">
                    "From detected risk to corrective action"
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                    Status: {selectedReport?.actionPlan?.status || 'OPEN'}
                  </span>
                </div>
              </div>

              {/* Detected Issue */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Detected Issue:
                </span>
                <div className="text-xs font-bold text-slate-900">
                  {selectedReport?.actionPlan?.detectedIssue || `${selectedReport?.hazard} on ${selectedReport?.asset}`}
                </div>
              </div>

              {/* Reason / Evidence */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Reason / Evidence:
                </span>
                <div className="p-2.5 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-lg text-xs font-medium text-amber-950 italic">
                  "{selectedReport?.actionPlan?.reasonEvidence || selectedReport?.evidence?.[0] || 'Unsafe operational condition noted in report narrative.'}"
                </div>
              </div>

              {/* Recommended Corrective Action */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Recommended Corrective Actions:
                </span>
                <div className="space-y-1">
                  {(selectedReport?.actionPlan?.correctiveActions || [
                    selectedReport?.recommendedIntervention?.primary,
                    selectedReport?.recommendedIntervention?.secondary
                  ]).slice(0, 3).map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                      <span className="w-4 h-4 rounded-full bg-oil-100 text-oil-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role & Footer Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px]">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Responsible Role / Team:</span>
                  <span className="font-bold text-slate-700">
                    {selectedReport?.actionPlan?.responsibleRole || selectedReport?.recommendedIntervention?.responsibleRole}
                  </span>
                </div>

                <button
                  onClick={() => setIsActionPlanModalOpen(true)}
                  className="px-3.5 py-2 bg-oil-600 hover:bg-oil-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>View Action Plan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CARD 2: PREVENT RECURRENCE */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5 hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                      Prevent Recurrence
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-1">
                    "Track corrective action to verified closure"
                  </h4>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800">
                  {selectedReport?.preventRecurrence?.closureTracker?.verificationState || 'Pending Verification'}
                </span>
              </div>

              {/* Visual 5-Step Lifecycle Progress Tracker */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Action Lifecycle Stage:
                </span>
                
                {/* Horizontal Step Stepper */}
                <div className="grid grid-cols-5 gap-1 text-center font-mono">
                  {(['OPEN', 'ASSIGNED', 'IN PROGRESS', 'VERIFIED', 'CLOSED'] as const).map((stepName, sIdx) => {
                    const currentStatus = selectedReport?.preventRecurrence?.closureTracker?.status || 'OPEN';
                    const stepOrder = ['OPEN', 'ASSIGNED', 'IN PROGRESS', 'ACTION TAKEN', 'AWAITING VERIFICATION', 'VERIFIED', 'CLOSED'];
                    const currentRank = stepOrder.indexOf(currentStatus);
                    const thisStepRank = stepOrder.indexOf(stepName);
                    const isCompleted = currentRank >= thisStepRank;
                    const isCurrent = currentStatus === stepName;

                    return (
                      <div
                        key={stepName}
                        className={`py-1 px-0.5 rounded text-[8px] font-extrabold transition-all border ${
                          isCurrent
                            ? 'bg-oil-600 text-white border-oil-700 shadow-xs'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {stepName}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recurrence Analysis Status (Never Invent Recurrence) */}
              <div className="p-2.5 rounded-xl border text-xs space-y-1 bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase text-slate-400">Recurrence Check:</span>
                  <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                    selectedReport?.preventRecurrence?.isRecurring ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedReport?.preventRecurrence?.isRecurring ? 'Precursor Pattern Flagged' : 'Unique Observation'}
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] font-medium leading-tight">
                  {selectedReport?.preventRecurrence?.recurrenceReason || 'No confirmed recurrence found in available data.'}
                </p>
              </div>

              {/* Issue, Role, Priority, Target Deadline Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Responsible Role:</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {selectedReport?.preventRecurrence?.closureTracker?.assignedRole || selectedReport?.actionPlan?.responsibleRole}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Target Deadline:</span>
                  <span className="font-semibold text-slate-800 font-mono block">
                    {selectedReport?.preventRecurrence?.closureTracker?.deadline || '2026-09-24'}
                  </span>
                </div>
              </div>

              {/* Footer Button: Open Action Tracker */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Dual witness verification required
                </span>
                <button
                  onClick={() => setActiveTab('corrective-actions')}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>Open Action Tracker</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTELLIGENCE SOURCES (Reports & Voice Intelligence)                    */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Intelligence Sources &amp; Ingestion
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Source 1: Report Intelligence */}
          <div
            onClick={() => setActiveTab('report-analyzer')}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-oil-500 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-oil-50 group-hover:text-oil-700 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Safety Reports &amp; Field Logs</h4>
                <p className="text-xs text-slate-500">
                  Upload PDF, DOCX, CSV, TXT for automated extraction, SIF precursor detection, and audit trail.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-oil-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Source 2: Voice Intelligence */}
          <div
            onClick={() => setActiveTab('voice-reporting')}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-purple-500 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900">Voice Hazard Intelligence</h4>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-purple-100 text-purple-800 rounded">Multilingual</span>
                </div>
                <p className="text-xs text-slate-500">
                  Direct speech-to-text recording in English, Hindi, and Hinglish with automated safety structuring.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SUPPORTING INTELLIGENCE (Spatial, Copilot, Alerts, Risk Trend)          */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Supporting Intelligence &amp; Field Response
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Spatial Risk Intelligence */}
          <div
            onClick={() => setActiveTab('installation-map')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-oil-500 cursor-pointer transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-oil-600" />
                  Spatial Risk
                </span>
                <span className="text-[10px] text-oil-700 font-bold bg-oil-50 px-1.5 py-0.5 rounded">8 Sectors</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Field asset concentration map across Assam, Arunachal, and Rajasthan sectors.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-oil-700 flex items-center gap-1">
              <span>Open Risk Map</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* 2. Safety Copilot */}
          <div
            onClick={() => setActiveTab('oil-safety-ai')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-oil-500 cursor-pointer transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-oil-600" />
                  Safety Copilot
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Grounded AI</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Conversational assistant querying active reports, barrier erosion, and precursor velocities.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-oil-700 flex items-center gap-1">
              <span>Ask Copilot</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* 3. Alerts & Actions */}
          <div
            onClick={() => setActiveTab('corrective-actions')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-amber-500 cursor-pointer transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  Alerts &amp; Actions
                </span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded font-mono">
                  {openActionsCount} Open
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Verified corrective mitigations, ownership assignments, and OISD audit sign-offs.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
              <span>Review Mitigations</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* 4. Risk Trend / Velocity */}
          <div
            onClick={() => setActiveTab('precursor-velocity')}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-400 cursor-pointer transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
                  Precursor Velocity
                </span>
                <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                  +18% Accel.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                30-day reporting acceleration ratios compared against 90-day baseline operations.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <span>Inspect Velocity</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

        </div>
      </section>

      {/* Trailing 7-day Risk Index Trend (Purposeful, clean visualization) */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              7-Day SIF Risk Escalation &amp; Signal Concentration Trend
            </h3>
            <p className="text-xs text-slate-500">
              Daily precursor trajectory tracking potential SIF indicators across Oil India operational sectors.
            </p>
          </div>
          <span className="text-xs font-bold text-oil-700 bg-oil-50 px-2.5 py-1 rounded-lg border border-oil-200">
            Field Composite Index
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRiskClean" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006837" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#006837" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="sifRisk"
                stroke="#006837"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRiskClean)"
                name="SIF Risk Index"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Action Plan Deep-Dive Modal */}
      {isActionPlanModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-oil-100 text-oil-700 flex items-center justify-center font-bold">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Corrective Action Plan</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedReport.id} • {selectedReport.asset}</p>
                </div>
              </div>
              <button
                onClick={() => setIsActionPlanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Detected Operational Issue:</span>
                <div className="text-sm font-bold text-slate-900">
                  {selectedReport.actionPlan?.detectedIssue || `${selectedReport.hazard} on ${selectedReport.asset}`}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Report Evidence Basis:</span>
                <div className="p-3 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-lg text-xs font-medium text-amber-950">
                  "{selectedReport.actionPlan?.reasonEvidence || selectedReport.evidence[0]}"
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Prescribed Corrective Actions (Sequential Execution):
                </span>
                <div className="space-y-2">
                  {(selectedReport.actionPlan?.correctiveActions || [selectedReport.recommendedIntervention.primary]).map((act, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-oil-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800">{act}</span>
                        <div className="text-[10px] text-slate-400 font-mono">Status: Pending Verification</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Role:</span>
                  <span className="font-semibold text-slate-800">{selectedReport.actionPlan?.responsibleRole}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Priority Level:</span>
                  <span className="font-semibold text-rose-600">{selectedReport.actionPlan?.priority}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                OIL HSE Directive 2026-04 • Mandatory Closure Rule
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsActionPlanModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsActionPlanModalOpen(false);
                    setActiveTab('corrective-actions');
                  }}
                  className="px-4 py-2 bg-oil-600 hover:bg-oil-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                >
                  Manage in Action Tracker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
