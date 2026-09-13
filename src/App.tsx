import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ReportUploadModal } from './components/ReportUploadModal';
import { LoginModal } from './components/LoginModal';

// Pages
import { CommandCenter } from './pages/CommandCenter';
import { ReportAnalyzer } from './pages/ReportAnalyzer';
import { SIFPrecursorDNA } from './pages/SIFPrecursorDNA';
import { WeakSignalFusion } from './pages/WeakSignalFusion';
import { BarrierDegradation } from './pages/BarrierDegradation';
import { SIFPathway } from './pages/SIFPathway';
import { CounterfactualSIF } from './pages/CounterfactualSIF';
import { HistoricalSimilarity } from './pages/HistoricalSimilarity';
import { MissingEvidenceView } from './pages/MissingEvidenceView';
import { ContradictionDetectionView } from './pages/ContradictionDetectionView';
import { PrecursorVelocity } from './pages/PrecursorVelocity';
import { EarlyWarningCenter } from './pages/EarlyWarningCenter';
import { InstallationRiskMap } from './pages/InstallationRiskMap';
import { AssetIntelligence } from './pages/AssetIntelligence';
import { CorrectiveActionsView } from './pages/CorrectiveActionsView';
import { RCAView } from './pages/RCAView';
import { OILSafetyAI } from './pages/OILSafetyAI';
import { KnowledgeBaseView } from './pages/KnowledgeBaseView';
import { FrontlineReporting } from './pages/FrontlineReporting';
import { VoiceReporting } from './pages/VoiceReporting';
import { SettingsView } from './pages/SettingsView';

import { Loader2, Shield } from 'lucide-react';
import { AuthPage } from './pages/AuthPage';

export const App: React.FC = () => {
  const { activeTab, user, authLoading } = useApp();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // 1. Loading state while checking persistent session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-oil-600 flex items-center justify-center font-black text-2xl shadow-xl border border-oil-500 animate-pulse">
          OIL
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-oil-400" />
          <span>Restoring Industrial Safety Intelligence Session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Gatekeeper: Must show AuthPage first
  if (!user) {
    return <AuthPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'command-center':
        return <CommandCenter />;
      case 'report-analyzer':
      case 'recommended-intervention':
        return <ReportAnalyzer onOpenUpload={() => setIsUploadOpen(true)} />;
      case 'sif-dna':
        return <SIFPrecursorDNA />;
      case 'historical-similarity':
        return <HistoricalSimilarity />;
      case 'missing-evidence':
        return <MissingEvidenceView />;
      case 'contradiction-detection':
        return <ContradictionDetectionView />;
      case 'weak-signal-fusion':
        return <WeakSignalFusion />;
      case 'barrier-degradation':
        return <BarrierDegradation />;
      case 'precursor-velocity':
        return <PrecursorVelocity />;
      case 'sif-pathway':
        return <SIFPathway />;
      case 'counterfactual-sif':
        return <CounterfactualSIF />;
      case 'early-warning':
        return <EarlyWarningCenter />;
      case 'installation-map':
        return <InstallationRiskMap />;
      case 'asset-intelligence':
        return <AssetIntelligence />;
      case 'corrective-actions':
        return <CorrectiveActionsView />;
      case 'rca':
        return <RCAView />;
      case 'oil-safety-ai':
        return <OILSafetyAI />;
      case 'knowledge-base':
        return <KnowledgeBaseView />;
      case 'frontline-report':
        return <FrontlineReporting />;
      case 'voice-reporting':
        return <VoiceReporting />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 font-sans text-slate-900">
      
      {/* Top Application Header */}
      <Header onOpenUpload={() => setIsUploadOpen(true)} />

      {/* Body: Fixed Sidebar + Main Scrollable Canvas */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-69px)]">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals */}
      <ReportUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

    </div>
  );
};

export default App;
