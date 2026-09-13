import React, { useState } from 'react';
import {
  Search,
  Bell,
  PlusCircle,
  Sparkles,
  Globe,
  User,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Check,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/translations';

interface HeaderProps {
  onOpenUpload: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUpload }) => {
  const {
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationRead,
    setActiveTab,
    selectReport,
    preloadFlagshipJudgeDemo,
    user,
    logout
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const unreadNotifs = notifications.filter(n => !n.read);

  const handleNotifClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    if (notif.targetReportId) {
      selectReport(notif.targetReportId);
    }
    setActiveTab(notif.targetTab);
    setIsNotifOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Enterprise Compliance Banner */}
      <div className="bg-charcoal-900 text-slate-300 px-6 py-1 text-[11px] flex flex-wrap items-center justify-between border-b border-charcoal-800">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {t.prototypeBanner}
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-300 font-medium">
            Oil India Limited • Corporate HSE Directorate
          </span>
          <span className="text-slate-400 hidden md:inline">•</span>
          <span className="text-slate-400 hidden md:inline">
            {t.aiDecisionSupport}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-oil-400" />
            <span className="font-semibold">{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[10px]">ISO 45001 / OISD-145 Compliant</span>
          </div>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Brand & Organization */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-oil-600 flex items-center justify-center text-white font-black text-xl shadow-md border border-oil-700">
            OIL
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black tracking-tight text-slate-900">
                OIL HSE INTELLIGENCE
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-oil-100 text-oil-800 border border-oil-200">
                SIF Radar 2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm sm:max-w-md">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-oil-500 focus:border-oil-500 outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* JUDGE DEMO MODE BUTTON */}
          <button
            onClick={preloadFlagshipJudgeDemo}
            className="bg-amber-500 hover:bg-amber-600 text-charcoal-950 font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 border border-amber-600 active:scale-95"
            title="Preload flagship Workover + Energy Isolation Precursor flow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-extrabold">{t.judgeDemoMode}</span>
          </button>

          {/* ADD REPORT BUTTON */}
          <button
            onClick={onOpenUpload}
            id="add-report-button"
            className="bg-oil-600 hover:bg-oil-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 border border-oil-700 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.addReport}</span>
          </button>

          {/* Notification Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-800">Early Warning Alerts</span>
                  <span className="text-[10px] text-slate-400 font-mono">{unreadNotifs.length} unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-amber-50/40' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${n.type === 'critical' ? 'text-rose-600' : 'text-amber-700'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile display & Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center pl-2 sm:pl-3 border-l border-slate-200 space-x-2 text-left hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-oil-600 border border-oil-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'OI'}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'HSE Officer'}</div>
                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">{user?.role || 'Safety Assessor'}</div>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="font-bold text-slate-900">{user?.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email || 'officer@oilindia.in'}</div>
                  <div className="text-[10px] font-semibold text-oil-700 mt-1 bg-oil-50 px-2 py-0.5 rounded inline-block">
                    {user?.organization}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setActiveTab('settings');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      await logout();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-rose-50 text-rose-700 flex items-center gap-2 transition-colors font-semibold border-t border-slate-100"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
