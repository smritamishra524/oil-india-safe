import React from 'react';
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
  ArrowRight
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

        {/* 2x2 Hero Cards Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* HERO CARD 1: INCIDENT DNA INTELLIGENCE */}
          <div className="bg-white border border-slate-300/80 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-emerald-600 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shadow-sm">
                  <Dna className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Causal DNA Analysis
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Incident DNA Intelligence
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Deconstructs unstructured safety reports into structured causal sequences from activity initiation to potential consequence envelope.
                </p>
              </div>

              {/* Meaningful Real Insight */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 uppercase">Active Report DNA:</span>
                  <span className="font-mono text-slate-500 font-semibold">{selectedReport?.id}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {selectedReport?.asset} • <span className="text-rose-600">{selectedReport?.sifPrecursor}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                    {selectedReport?.activity}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                    {selectedReport?.hazard}
                  </span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                    {selectedReport?.barrier}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {reports.length} verified DNA sequences indexed
              </span>
              <button
                onClick={() => setActiveTab('sif-dna')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>View Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* HERO CARD 2: SIF INTELLIGENCE */}
          <div className="bg-white border border-slate-300/80 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-oil-600 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-oil-50 text-oil-700 border border-oil-200/80 flex items-center justify-center shadow-sm">
                  <GitFork className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-oil-100 text-oil-900 border border-oil-200">
                  Precursor Velocity &amp; Pathways
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  SIF Intelligence
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Evaluates Serious Injury &amp; Fatality potential pathways and precursor velocity multipliers before catastrophic events escalate.
                </p>
              </div>

              {/* Meaningful Real Insight */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 uppercase">Top Accelerating Precursor:</span>
                  <span className="font-mono text-rose-600 font-bold">{fastestPrecursor?.velocityMultiplier}× Velocity</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {fastestPrecursor?.precursor} ({fastestPrecursor?.classification})
                </div>
                <div className="text-[11px] text-slate-500">
                  Observed {fastestPrecursor?.countCurrent30Days} times in past 30 days vs {fastestPrecursor?.countPrevious90Days} baseline. Concentrated at {fastestPrecursor?.topInstallation}.
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {sifPotentialCount} SIF-Capable precursors monitored
              </span>
              <button
                onClick={() => setActiveTab('sif-pathway')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>View Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* HERO CARD 3: WEAK SIGNAL FUSION */}
          <div className="bg-white border border-slate-300/80 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-blue-600 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center shadow-sm">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                  Cross-Source Correlation
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Weak Signal Fusion
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Correlates subtle, seemingly unrelated operational anomalies (minor leaks, vibration, delays) into early emerging hazard clusters.
                </p>
              </div>

              {/* Meaningful Real Insight */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 uppercase">Primary Active Cluster:</span>
                  <span className="font-mono text-blue-700 font-bold">{primaryWeakCluster?.clusterRisk}/100 Cluster Risk</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {primaryWeakCluster?.title} ({primaryWeakCluster?.installation})
                </div>
                <div className="text-[11px] text-slate-500">
                  {primaryWeakCluster?.reportIds.length || 4} correlated signals connected across {primaryWeakCluster?.asset}. Dominant precursor: {primaryWeakCluster?.dominantPrecursor}.
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {weakSignalClusters.length} active spatial clusters discovered
              </span>
              <button
                onClick={() => setActiveTab('weak-signal-fusion')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>View Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* HERO CARD 4: BARRIER DEGRADATION INTELLIGENCE */}
          <div className="bg-white border border-slate-300/80 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-rose-600 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center justify-center shadow-sm">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-200">
                  Defense System Integrity
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Barrier Degradation Intelligence
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Tracks continuous temporal erosion and health status of physical, engineered, and administrative safety barriers across all assets.
                </p>
              </div>

              {/* Meaningful Real Insight */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 uppercase">Most Degraded Defense:</span>
                  <span className="font-mono text-rose-600 font-bold">{lowestBarrier?.healthScore}% Health (CRITICAL)</span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {lowestBarrier?.barrier} • {lowestBarrier?.failureCount} failures recorded
                </div>
                <div className="text-[11px] text-slate-500">
                  Primary degradation driver: {lowestBarrier?.degradationDriver}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {barrierHealth.length} engineered defense systems under active surveillance
              </span>
              <button
                onClick={() => setActiveTab('barrier-degradation')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>View Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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

    </div>
  );
};
