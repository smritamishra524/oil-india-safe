import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  Dna,
  History,
  FileQuestion,
  AlertOctagon,
  Share2,
  ShieldAlert,
  TrendingUp,
  GitFork,
  Cpu,
  CheckSquare,
  AlertTriangle,
  MapPin,
  Layers,
  ClipboardList,
  GitPullRequest,
  Bot,
  BookOpen,
  Send,
  Mic,
  Settings,
  Flame,
  ChevronDown,
  ChevronRight,
  FileText,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/translations';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, language, reports, correctiveActions, barrierHealth } = useApp();
  const t = TRANSLATIONS[language];

  const openActionsCount = correctiveActions.filter(a => a.status !== 'CLOSED').length;
  const criticalBarriersCount = barrierHealth.filter(b => b.currentStatus === 'Critical' || b.currentStatus === 'Degrading').length;

  // The 5 Primary Destinations mandated by User Requirements
  const PRIMARY_DESTINATIONS: NavItem[] = [
    { id: 'command-center', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'report-analyzer', label: 'Reports', icon: FileText, badge: reports.length },
    { id: 'voice-reporting', label: 'Voice Intelligence', icon: Mic, badge: 'Voice AI', badgeColor: 'bg-purple-900/60 text-purple-300 border border-purple-700/50' },
    { id: 'installation-map', label: 'Spatial Risk Intelligence', icon: MapPin },
    { id: 'oil-safety-ai', label: 'Safety Copilot', icon: Bot, badge: 'AI', badgeColor: 'bg-oil-800 text-oil-200 border border-oil-600' }
  ];

  // Secondary / Detailed Intelligence Sub-pages (Preserving all existing functionality)
  const DETAILED_GROUPS: { groupName: string; items: NavItem[] }[] = [
    {
      groupName: 'CORE INTELLIGENCE ENGINES',
      items: [
        { id: 'sif-dna', label: 'Incident DNA Intelligence', icon: Dna },
        { id: 'sif-pathway', label: 'SIF Escalation Pathway', icon: GitFork },
        { id: 'weak-signal-fusion', label: 'Weak Signal Fusion', icon: Share2 },
        { id: 'barrier-degradation', label: 'Barrier Degradation', icon: ShieldAlert, badge: criticalBarriersCount > 0 ? `${criticalBarriersCount} Degraded` : undefined, badgeColor: 'bg-rose-900/60 text-rose-300 border border-rose-700/50' },
        { id: 'precursor-velocity', label: 'Precursor Velocity', icon: TrendingUp },
        { id: 'counterfactual-sif', label: 'Counterfactual Simulator', icon: Cpu }
      ]
    },
    {
      groupName: 'INVESTIGATION & ACTIONS',
      items: [
        { id: 'corrective-actions', label: 'Alerts & Actions', icon: ClipboardList, badge: openActionsCount, badgeColor: 'bg-amber-900/60 text-amber-300 border border-amber-700/50' },
        { id: 'early-warning', label: 'Early Warning Center', icon: AlertTriangle },
        { id: 'rca', label: 'Root Cause Analysis', icon: GitPullRequest },
        { id: 'historical-similarity', label: 'Historical Similarity', icon: History },
        { id: 'missing-evidence', label: 'Missing Evidence Analysis', icon: FileQuestion },
        { id: 'contradiction-detection', label: 'Contradiction Detection', icon: AlertOctagon },
        { id: 'asset-intelligence', label: 'Asset Intelligence', icon: Layers },
        { id: 'frontline-report', label: 'Frontline Hazard Report', icon: Send },
        { id: 'knowledge-base', label: 'Safety Knowledge Base', icon: BookOpen },
        { id: 'settings', label: 'System Settings', icon: Settings }
      ]
    }
  ];

  // Auto-expand detailed section if the active tab is inside one of the detailed groups
  const isDetailedActive = DETAILED_GROUPS.some(g => g.items.some(i => i.id === activeTab));
  const [isDetailedExpanded, setIsDetailedExpanded] = useState<boolean>(isDetailedActive);

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex-shrink-0 flex flex-col h-[calc(100vh-69px)] border-r border-slate-800 select-none overflow-hidden">
      
      {/* Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        
        {/* PRIMARY NAVIGATION (5 CORE DESTINATIONS) */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Primary Navigation
          </div>
          {PRIMARY_DESTINATIONS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`nav-${item.id}`}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-oil-600 text-white shadow-md font-bold border border-oil-500'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-oil-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      item.badgeColor || (isActive ? 'bg-oil-800 text-oil-200' : 'bg-slate-800 text-slate-400')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SECONDARY / DETAILED INTELLIGENCE DRAWER */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setIsDetailedExpanded(!isDetailedExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors text-[11px] font-bold uppercase tracking-wider"
          >
            <span>Detailed Intelligence</span>
            {isDetailedExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {isDetailedExpanded && (
            <div className="mt-1 space-y-3 pl-1 animate-fade-in">
              {DETAILED_GROUPS.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <div className="px-2.5 pt-1.5 pb-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                    {group.groupName}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        id={`nav-${item.id}`}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all group ${
                          isActive
                            ? 'bg-slate-800 text-oil-300 font-bold border border-slate-700'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-oil-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                          <span className="truncate text-[11px]">{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full flex-shrink-0 ${
                              item.badgeColor || (isActive ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-400')
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Safety Debt Metric Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Safety Debt Index
          </span>
          <span className="font-mono font-bold text-amber-400">68 / 100</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '68%' }} />
        </div>
        <div className="text-[9px] text-slate-400 mt-1 font-mono">
          OISD Precursor Cumulative Exposure
        </div>
      </div>

    </aside>
  );
};
