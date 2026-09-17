import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SafetyReport,
  CorrectiveAction,
  AuditEvent,
  WeakSignalCluster,
  BarrierHealth,
  PrecursorVelocityItem,
  ValidationStatus,
  ActionStatus,
  ActionPlan,
  PreventRecurrenceData
} from '../types';
import {
  generateInterconnectedReports,
  INITIAL_CORRECTIVE_ACTIONS,
  INITIAL_AUDIT_TRAIL,
  INITIAL_WEAK_SIGNAL_CLUSTERS,
  INITIAL_BARRIER_HEALTH,
  INITIAL_PRECURSOR_VELOCITY
} from '../data/reports';

import { authService, AuthUser } from '../services/authService';
import { enrichReportWithIntelligence } from '../services/reportAnalyzer';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'critical' | 'warning' | 'info';
  targetTab: string;
  targetReportId?: string;
  read: boolean;
}

interface AppContextType {
  reports: SafetyReport[];
  selectedReport: SafetyReport | null;
  selectedReportId: string;
  correctiveActions: CorrectiveAction[];
  auditTrail: AuditEvent[];
  weakSignalClusters: WeakSignalCluster[];
  barrierHealth: BarrierHealth[];
  precursorVelocity: PrecursorVelocityItem[];
  language: 'en' | 'hi';
  searchQuery: string;
  activeTab: string;
  notifications: AppNotification[];
  user: AuthUser | null;
  authLoading: boolean;
  authError: string | null;
  safetyDebtScore: number;

  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  selectReport: (id: string) => void;
  addReport: (report: SafetyReport) => void;
  updateReportValidation: (reportId: string, status: ValidationStatus, notes?: string) => void;
  updateReportActionPlan: (reportId: string, updates: Partial<ActionPlan>) => void;
  updatePreventRecurrenceStatus: (reportId: string, status: ActionStatus, notes?: string) => void;
  addCorrectiveAction: (action: Omit<CorrectiveAction, 'id' | 'createdAt'>) => void;
  updateActionStatus: (actionId: string, status: CorrectiveAction['status'], verifiedBy?: string) => void;
  resetToDemo: () => void;
  preloadFlagshipJudgeDemo: () => void;
  markNotificationRead: (id: string) => void;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (payload: { name: string; email: string; password: string; role: string; organization: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; resetCode?: string }>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  login: (name: string, role: string, org: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  REPORTS: 'oil_hse_reports_v2',
  ACTIONS: 'oil_hse_actions_v2',
  AUDIT: 'oil_hse_audit_v2',
  CLUSTERS: 'oil_hse_clusters_v2',
  BARRIERS: 'oil_hse_barriers_v2',
  LANG: 'oil_hse_language_v2',
  USER: 'oil_hse_user_v2',
  SELECTED_ID: 'oil_hse_selected_id_v2'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with local storage or defaults
  const [reports, setReports] = useState<SafetyReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (saved) {
        const parsed: SafetyReport[] = JSON.parse(saved);
        return parsed.map(r => enrichReportWithIntelligence(r, parsed));
      }
    } catch (e) {
      console.error(e);
    }
    const initialList = generateInterconnectedReports();
    return initialList.map(r => enrichReportWithIntelligence(r, initialList));
  });

  const [selectedReportId, setSelectedReportId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_ID);
      if (saved) return saved;
    } catch (e) {}
    return 'OIL-REP-2026-1001';
  });

  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CORRECTIVE_ACTIONS;
  });

  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_AUDIT_TRAIL;
  });

  const [weakSignalClusters, setWeakSignalClusters] = useState<WeakSignalCluster[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLUSTERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_WEAK_SIGNAL_CLUSTERS;
  });

  const [barrierHealth, setBarrierHealth] = useState<BarrierHealth[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BARRIERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_BARRIER_HEALTH;
  });

  const [language, setLanguageState] = useState<'en' | 'hi'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG);
      if (saved === 'en' || saved === 'hi') return saved;
    } catch (e) {}
    return 'en';
  });

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Restore authenticated session on mount
  useEffect(() => {
    let isMounted = true;
    authService.getSession()
      .then(activeUser => {
        if (isMounted) {
          setUser(activeUser);
          setAuthLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setAuthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [activeTab, setActiveTab] = useState<string>('command-center');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Critical Precursor Detected',
      message: 'Energy Isolation Failure flagged on Workover Rig WOR-07 (Duliajan Field).',
      timestamp: '10m ago',
      type: 'critical',
      targetTab: 'report-analyzer',
      targetReportId: 'OIL-REP-2026-1001',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Barrier Degradation Alert',
      message: 'Energy Isolation barrier entered CRITICAL degradation status (38% Health).',
      timestamp: '25m ago',
      type: 'critical',
      targetTab: 'barrier-degradation',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Weak Signal Cluster Emerging',
      message: '4 related weak signals linked to Wellhead Master Valve MV-104.',
      timestamp: '1h ago',
      type: 'warning',
      targetTab: 'weak-signal-fusion',
      read: false
    }
  ]);

  // Persist state updates to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch (e) {}
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(correctiveActions));
    } catch (e) {}
  }, [correctiveActions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditTrail));
    } catch (e) {}
  }, [auditTrail]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLUSTERS, JSON.stringify(weakSignalClusters));
    } catch (e) {}
  }, [weakSignalClusters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BARRIERS, JSON.stringify(barrierHealth));
    } catch (e) {}
  }, [barrierHealth]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, language);
    } catch (e) {}
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_ID, selectedReportId);
    } catch (e) {}
  }, [selectedReportId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {}
  }, [user]);

  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0] || null;

  // Calculate Precursor Velocity dynamically based on reports dataset
  const precursorVelocity: PrecursorVelocityItem[] = React.useMemo(() => {
    const counts: Record<string, { current30: number; prev90: number; topInst: Record<string, number> }> = {};
    
    reports.forEach(r => {
      const p = r.sifPrecursor;
      if (!counts[p]) {
        counts[p] = { current30: 0, prev90: 0, topInst: {} };
      }
      counts[p].current30 += 1;
      counts[p].prev90 += 2; // ratio baseline
      counts[p].topInst[r.installation] = (counts[p].topInst[r.installation] || 0) + 1;
    });

    return Object.entries(counts).map(([precursor, data]) => {
      const topInstallation = Object.entries(data.topInst).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Duliajan Central Field';
      const velocity = Number(((data.current30 / (data.prev90 / 3 || 1))).toFixed(2));
      const classification: 'INCREASING' | 'STABLE' | 'DECLINING' = velocity >= 1.2 ? 'INCREASING' : velocity <= 0.85 ? 'DECLINING' : 'STABLE';
      const riskCategory: 'High' | 'Medium' | 'Low' = velocity >= 1.3 ? 'High' : velocity >= 0.9 ? 'Medium' : 'Low';

      return {
        precursor: precursor as any,
        countPrevious90Days: data.prev90,
        countCurrent30Days: data.current30,
        velocityMultiplier: velocity,
        classification,
        riskCategory,
        topInstallation
      };
    });
  }, [reports]);

  // Calculate Proposed Safety Debt Metric
  const safetyDebtScore = React.useMemo(() => {
    let score = 42; // baseline
    const openCriticalActions = correctiveActions.filter(a => a.status !== 'CLOSED' && a.priority === 'Critical').length;
    const degradingBarriers = barrierHealth.filter(b => b.currentStatus === 'Critical' || b.currentStatus === 'Degrading').length;
    const repeatedPrecursorCount = reports.filter(r => r.sifPrecursor === 'Energy Isolation Failure').length;
    
    score += (openCriticalActions * 8) + (degradingBarriers * 6) + Math.min(25, repeatedPrecursorCount * 2);
    return Math.min(99, Math.max(15, score));
  }, [correctiveActions, barrierHealth, reports]);

  const selectReport = (id: string) => {
    setSelectedReportId(id);
  };

  const addReport = (newReport: SafetyReport) => {
    // Enrich with historical comparison against current repository
    const enriched = enrichReportWithIntelligence(newReport, reports);

    // Add to reports list at top
    setReports(prev => [enriched, ...prev]);
    setSelectedReportId(enriched.id);

    // Auto-create connected Corrective Action in Action Register
    const newActionId = `CA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const autoAction: CorrectiveAction = {
      id: newActionId,
      reportId: enriched.id,
      title: enriched.actionPlan?.detectedIssue || `${enriched.sifPrecursor} Remediation`,
      description: enriched.actionPlan?.correctiveActions?.join(' • ') || enriched.recommendedIntervention.primary,
      owner: enriched.actionPlan?.responsibleRole || enriched.recommendedIntervention.responsibleRole,
      targetDate: enriched.preventRecurrence?.closureTracker?.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: enriched.actionPlan?.priority === 'Immediate' ? 'Critical' : 'High',
      status: 'OPEN',
      verificationMethod: enriched.recommendedIntervention.verificationStep,
      barrierAddressed: enriched.barrier,
      installation: enriched.installation,
      createdAt: new Date().toLocaleString(),
      isRecurringPrecursor: enriched.preventRecurrence?.isRecurring,
      recurrenceNote: enriched.preventRecurrence?.recurrenceReason
    };
    setCorrectiveActions(prev => [autoAction, ...prev]);

    // Update Audit Trail
    const newAuditEvents: AuditEvent[] = [
      {
        id: `AUD-${Date.now()}-1`,
        timestamp: new Date().toLocaleString(),
        reportId: enriched.id,
        eventType: 'REPORT_RECEIVED',
        user: user?.name || 'Field Operator',
        details: `Report received via ${enriched.extractedFrom || enriched.sourceType} for ${enriched.installation} (${enriched.asset}).`,
        severity: 'info'
      },
      {
        id: `AUD-${Date.now()}-2`,
        timestamp: new Date().toLocaleString(),
        reportId: enriched.id,
        eventType: 'AI_ANALYSIS_COMPLETED',
        user: 'OIL HSE Intelligence Engine',
        details: `Extracted Precursor: "${enriched.sifPrecursor}" | Risk Score: ${enriched.riskScore} (${enriched.sifPotential}) | Barrier: "${enriched.barrier}". Action Plan generated with ${enriched.actionPlan?.correctiveActions?.length || 0} corrective steps.`,
        severity: enriched.sifPotential === 'SIF-Capable' ? 'critical' : 'warning'
      }
    ];

    setAuditTrail(prev => [...newAuditEvents, ...prev]);

    // Update Barrier Health dynamically if barrier matches
    setBarrierHealth(prev => {
      return prev.map(bh => {
        if (bh.barrier === enriched.barrier) {
          const newFailureCount = bh.failureCount + 1;
          const newScore = Math.max(15, bh.healthScore - 6);
          const newStatus = newScore < 45 ? 'Critical' : newScore < 65 ? 'Degrading' : 'Warning';
          return {
            ...bh,
            failureCount: newFailureCount,
            healthScore: newScore,
            currentStatus: newStatus as any,
            trend: 'degrading' as const,
            relatedReportIds: [enriched.id, ...bh.relatedReportIds]
          };
        }
        return bh;
      });
    });

    // Check if report integrates into Weak Signal Clusters
    setWeakSignalClusters(prev => {
      return prev.map(cluster => {
        if (cluster.installation === enriched.installation || cluster.asset === enriched.asset || cluster.dominantPrecursor === enriched.sifPrecursor) {
          return {
            ...cluster,
            reportIds: [enriched.id, ...cluster.reportIds],
            timeline: [
              { date: enriched.date, event: `New signal: ${enriched.sifPrecursor} on ${enriched.asset}`, reportId: enriched.id },
              ...cluster.timeline
            ],
            clusterRisk: Math.min(98, cluster.clusterRisk + 3)
          };
        }
        return cluster;
      });
    });

    // Add Notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Report Analyzed',
        message: `${enriched.sifPrecursor} detected on ${enriched.asset} (${enriched.installation}). Action plan generated.`,
        timestamp: 'Just now',
        type: enriched.sifPotential === 'SIF-Capable' ? 'critical' : 'warning',
        targetTab: 'command-center',
        targetReportId: enriched.id,
        read: false
      },
      ...prev
    ]);
  };

  const updateReportActionPlan = (reportId: string, updates: Partial<ActionPlan>) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          actionPlan: { ...r.actionPlan, ...updates }
        };
      }
      return r;
    }));
  };

  const updatePreventRecurrenceStatus = (reportId: string, status: ActionStatus, notes?: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const currentTracker = r.preventRecurrence?.closureTracker || {
          status: 'OPEN',
          assignedRole: r.actionPlan?.responsibleRole || 'HSE Supervisor',
          priority: r.actionPlan?.priority || 'High',
          verificationState: 'Pending Verification',
          actionsTaken: []
        };
        const verificationState = 
          status === 'CLOSED' ? 'Closed' :
          status === 'VERIFIED' ? 'Witnessed & Verified' :
          status === 'ACTION TAKEN' || status === 'AWAITING VERIFICATION' ? 'Under Review' :
          'Pending Verification';
        const updatedActionsTaken = notes 
          ? [...(currentTracker.actionsTaken || []), notes] 
          : (currentTracker.actionsTaken || []);

        return {
          ...r,
          actionPlan: { ...r.actionPlan, status },
          preventRecurrence: {
            ...r.preventRecurrence,
            closureTracker: {
              ...currentTracker,
              status,
              verificationState,
              actionsTaken: updatedActionsTaken
            }
          }
        };
      }
      return r;
    }));

    // Sync with correctiveActions register
    setCorrectiveActions(prev => prev.map(a => {
      if (a.reportId === reportId) {
        return {
          ...a,
          status,
          actionTakenNotes: notes || a.actionTakenNotes,
          verifiedBy: (status === 'CLOSED' || status === 'VERIFIED') ? (user?.name || 'HSE Inspector') : a.verifiedBy,
          verifiedAt: (status === 'CLOSED' || status === 'VERIFIED') ? new Date().toLocaleString() : a.verifiedAt
        };
      }
      return a;
    }));

    // Add audit event
    const auditEvent: AuditEvent = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      reportId,
      eventType: status === 'CLOSED' ? 'ACTION_CLOSED' : 'ACTION_VERIFIED',
      user: user?.name || 'HSE Officer',
      details: `Action closure tracker for report ${reportId} updated to "${status}". ${notes ? `Note: ${notes}` : ''}`,
      severity: 'info'
    };
    setAuditTrail(prev => [auditEvent, ...prev]);
  };

  const updateReportValidation = (reportId: string, status: ValidationStatus, notes?: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          validation: {
            status,
            validatedBy: user?.name || 'HSE Inspector',
            validatedAt: new Date().toLocaleString(),
            notes: notes || r.validation.notes
          }
        };
      }
      return r;
    }));

    // Add audit event
    const auditEvent: AuditEvent = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      reportId,
      eventType: 'HSE_REVIEWED',
      user: user?.name || 'HSE Validator',
      details: `HSE Validation status updated to "${status}". Notes: ${notes || 'Status confirmed by inspector.'}`,
      severity: status === 'Rejected' ? 'warning' : 'info'
    };
    setAuditTrail(prev => [auditEvent, ...prev]);
  };

  const addCorrectiveAction = (actionData: Omit<CorrectiveAction, 'id' | 'createdAt'>) => {
    const newId = `CA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newAction: CorrectiveAction = {
      ...actionData,
      id: newId,
      createdAt: new Date().toLocaleString()
    };

    setCorrectiveActions(prev => [newAction, ...prev]);

    // Add audit event
    const auditEvent: AuditEvent = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      reportId: actionData.reportId,
      actionId: newId,
      eventType: 'ACTION_CREATED',
      user: user?.name || 'HSE Officer',
      details: `Created Corrective Action "${newAction.title}" assigned to ${newAction.owner} (Target: ${newAction.targetDate}).`,
      severity: 'info'
    };
    setAuditTrail(prev => [auditEvent, ...prev]);
  };

  const updateActionStatus = (actionId: string, status: CorrectiveAction['status'], verifiedBy?: string) => {
    setCorrectiveActions(prev => prev.map(a => {
      if (a.id === actionId) {
        return {
          ...a,
          status,
          verifiedBy: verifiedBy || (status === 'CLOSED' || status === 'AWAITING VERIFICATION' ? user?.name : a.verifiedBy),
          verifiedAt: status === 'CLOSED' ? new Date().toLocaleString() : a.verifiedAt
        };
      }
      return a;
    }));

    const auditEvent: AuditEvent = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actionId,
      eventType: status === 'CLOSED' ? 'ACTION_CLOSED' : 'ACTION_VERIFIED',
      user: verifiedBy || user?.name || 'HSE Officer',
      details: `Action ${actionId} transitioned to status "${status}".`,
      severity: 'info'
    };
    setAuditTrail(prev => [auditEvent, ...prev]);
  };

  const resetToDemo = () => {
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.CLUSTERS);
    localStorage.removeItem(STORAGE_KEYS.BARRIERS);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ID);

    setReports(generateInterconnectedReports());
    setSelectedReportId('OIL-REP-2026-1001');
    setCorrectiveActions(INITIAL_CORRECTIVE_ACTIONS);
    setAuditTrail(INITIAL_AUDIT_TRAIL);
    setWeakSignalClusters(INITIAL_WEAK_SIGNAL_CLUSTERS);
    setBarrierHealth(INITIAL_BARRIER_HEALTH);
    setActiveTab('command-center');
  };

  const preloadFlagshipJudgeDemo = () => {
    setSelectedReportId('OIL-REP-2026-1001');
    setActiveTab('report-analyzer');
  };

  const setLanguage = (lang: 'en' | 'hi') => {
    setLanguageState(lang);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const signIn = async (email: string, pass: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await authService.signIn(email, pass);
      setUser(res.user);
    } catch (err: any) {
      setAuthError(err.message || 'Sign in failed');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (payload: { name: string; email: string; password: string; role: string; organization: string }) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await authService.signUp(payload);
      setUser(res.user);
    } catch (err: any) {
      setAuthError(err.message || 'Sign up failed');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    return authService.forgotPassword(email);
  };

  const resetPassword = async (email: string, resetCode: string, newPass: string) => {
    return authService.resetPassword(email, resetCode, newPass);
  };

  const login = (name: string, role: string, org: string) => {
    setUser({ id: 'usr-demo', name, role, organization: org, email: 'demo@oilindia.in' });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        reports,
        selectedReport,
        selectedReportId,
        correctiveActions,
        auditTrail,
        weakSignalClusters,
        barrierHealth,
        precursorVelocity,
        language,
        searchQuery,
        activeTab,
        notifications,
        user,
        authLoading,
        authError,
        safetyDebtScore,

        setSearchQuery,
        setActiveTab,
        setLanguage,
        selectReport,
        addReport,
        updateReportValidation,
        updateReportActionPlan,
        updatePreventRecurrenceStatus,
        addCorrectiveAction,
        updateActionStatus,
        resetToDemo,
        preloadFlagshipJudgeDemo,
        markNotificationRead,
        signIn,
        signUp,
        forgotPassword,
        resetPassword,
        login,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
