import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzeReportNarrative, analyzeReportNarrativeAsync } from '../services/reportAnalyzer';

export const FrontlineReporting: React.FC = () => {
  const { addReport, selectReport, setActiveTab } = useApp();

  const [installation, setInstallation] = useState('Duliajan Central Field');
  const [asset, setAsset] = useState('Workover Rig WOR-07');
  const [activity, setActivity] = useState('Workover');
  const [hazard, setHazard] = useState('Stored / Residual Energy');
  const [narrative, setNarrative] = useState('');
  const [immediateAction, setImmediateAction] = useState('');
  const [languageOption, setLanguageOption] = useState('English');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) return;

    setIsSubmitting(true);

    try {
      const fullText = `${narrative}. Immediate Action Taken: ${immediateAction || 'None reported'}.`;
      const analyzed = await analyzeReportNarrativeAsync(fullText, {
        installation,
        asset,
        reportType: 'Unsafe Condition'
      });

      analyzed.extractedFrom = 'Frontline Hazard App Form';
      analyzed.sourceType = 'frontline';

      addReport(analyzed);
      selectReport(analyzed.id);
      setIsSubmitting(false);
      setActiveTab('report-analyzer');
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-oil-100 text-oil-700 flex items-center justify-center font-bold">
          <Send className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-oil-100 text-oil-800 uppercase">
              Field Worker App
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-semibold text-slate-500">Fast Ingestion</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">Frontline Hazard Reporting Form</h1>
          <p className="text-xs text-slate-500">
            Submit on-site observations. Submitted hazards immediately enter the unified SIF Precursor NLP pipeline.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">OIL Field / Installation</label>
            <select
              value={installation}
              onChange={(e) => setInstallation(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500 bg-white"
            >
              <option value="Duliajan Central Field">Duliajan Central Field</option>
              <option value="Moran Oil Field">Moran Oil Field</option>
              <option value="Digboi Refinery Area & Fields">Digboi Refinery Area & Fields</option>
              <option value="Jorhat Exploration Rig 4">Jorhat Exploration Rig 4</option>
              <option value="Bagjan Wellsite Operations">Bagjan Wellsite Operations</option>
              <option value="Rajasthan Block-RJ (Jaisalmer)">Rajasthan Block-RJ (Jaisalmer)</option>
              <option value="Dandewala Gas Plant">Dandewala Gas Plant</option>
              <option value="Kumchai Field (Arunachal)">Kumchai Field (Arunachal)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Asset / Equipment Unit</label>
            <input
              type="text"
              required
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="e.g. Separation Unit SEP-04 or Mast Drawworks"
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Operational Activity</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500 bg-white"
            >
              <option value="Workover">Workover Operations</option>
              <option value="Drilling">Drilling & Mud Circulation</option>
              <option value="Pipeline Maintenance">Pipeline Maintenance & Pigging</option>
              <option value="Work at Height">Work at Height</option>
              <option value="Confined Space Entry">Confined Space Entry</option>
              <option value="Hot Work & Welding">Hot Work & Welding</option>
              <option value="Mechanical Lifting">Mechanical Lifting</option>
              <option value="General Maintenance">General Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Primary Perceived Hazard</label>
            <select
              value={hazard}
              onChange={(e) => setHazard(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500 bg-white"
            >
              <option value="Stored / Residual Energy">Stored / Residual Energy</option>
              <option value="Hydrocarbon Gas Release">Hydrocarbon Gas Release</option>
              <option value="Fall from Height">Fall from Height</option>
              <option value="Hydrogen Sulfide (H2S)">Hydrogen Sulfide (H2S)</option>
              <option value="Line of Fire (Machinery/Tension)">Line of Fire (Machinery/Tension)</option>
              <option value="Dropped Object">Dropped Object</option>
              <option value="Ignition Source in Hazardous Zone">Ignition Source in Hazardous Zone</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Reporting Language</label>
            <select
              value={languageOption}
              onChange={(e) => setLanguageOption(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500 bg-white"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Assamese">অসমীয়া (Assamese)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">
            Hazard Description / Observation Narrative *
          </label>
          <textarea
            required
            rows={5}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Describe exactly what you observed (e.g. During valve replacement, residual pressure was noticed in line while technicians were working in cellar without zero-energy check...)"
            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-oil-500 font-mono text-xs"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">
            Immediate Action Taken on Site
          </label>
          <input
            type="text"
            value={immediateAction}
            onChange={(e) => setImmediateAction(e.target.value)}
            placeholder="e.g. Stopped work immediately, evacuated cellar, notified area supervisor"
            className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">
            Directly ingested into the Unified SIF Precursor Intelligence Layer.
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !narrative.trim()}
            className="px-6 py-2.5 bg-oil-600 hover:bg-oil-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <span>{isSubmitting ? 'Analyzing Precursor...' : 'Submit to HSE Intelligence'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
};
