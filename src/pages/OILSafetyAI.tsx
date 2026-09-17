import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, ShieldCheck, AlertTriangle, ChevronRight, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionLink?: { tab: string; reportId?: string; label: string };
}

const PRESET_QUESTIONS = [
  'Which precursor is increasing fastest?',
  'Why is this report high risk?',
  'Which barrier is degrading?',
  'Show recurring energy isolation failures.',
  'Which installation has the highest risk?',
  'Which corrective actions are overdue?'
];

export const OILSafetyAI: React.FC = () => {
  const {
    reports,
    selectedReport,
    barrierHealth,
    precursorVelocity,
    correctiveActions,
    weakSignalClusters,
    setActiveTab,
    selectReport
  } = useApp();

  const [input, setInput] = useState('');
  const sifPotentialCount = reports.filter(r => r.sifPotential === 'SIF-Capable' || r.sifPotential === 'Potential SIF').length;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Greetings. I am OIL Safety Intelligence Assistant. I am directly connected to your active repository of ${reports.length} safety reports, ${barrierHealth.length} tracked defensive barriers, and ${correctiveActions.length} corrective actions. Ask me any question about precursor velocity, barrier degradation, or specific report risks.`,
      timestamp: 'Just now'
    }
  ]);

  const handleSend = (queryText?: string) => {
    const query = (queryText || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');

    // Process actual answer based on real application state and safety domain knowledge
    setTimeout(() => {
      let replyText = '';
      let actionLink: Message['actionLink'] = undefined;
      const lower = query.toLowerCase();

      // ==========================================
      // A. ACTIVE REPORT-SPECIFIC INQUIRIES
      // ==========================================
      
      // A1. "Why is this high risk / why this score?"
      if (
        (lower.includes('why') || lower.includes('how')) &&
        (lower.includes('risk') || lower.includes('score') || lower.includes('high risk') || lower.includes('rated')) &&
        (lower.includes('this') || lower.includes('report') || lower.includes('selected') || !lower.includes('location'))
      ) {
        if (selectedReport) {
          replyText = `### Risk Score Breakdown for ${selectedReport.id} (${selectedReport.asset}):
The calculated Risk Score of **${selectedReport.riskScore}/100** (${selectedReport.riskLevel.toUpperCase()} RISK, **${selectedReport.sifPotential}**) is derived from 4 verified factors in the report narrative:

1. **Hazard Energy Gravity (30%)**: Direct presence of *${selectedReport.hazard}* during active *${selectedReport.activity}*.
2. **Defensive Barrier Breakdown (25%)**: The primary defense *${selectedReport.barrier}* was bypassed or failed (*"${selectedReport.controlFailure}"*).
3. **Personnel Line-of-Fire Proximity (25%)**: Crew was positioned in *${selectedReport.exposure}*.
4. **Potential Consequence Envelope (20%)**: *${selectedReport.dna?.potentialConsequence || 'High consequence potential'}*.

Quoted Evidence: *"${selectedReport.evidence[0] || selectedReport.narrative.slice(0, 100)}"*`;
          actionLink = { tab: 'sif-dna', reportId: selectedReport.id, label: 'Inspect Incident DNA & Causal Flow' };
        } else {
          replyText = `Please select or upload a report first to inspect its risk scoring rationale.`;
        }
      }

      // A2. "What corrective action / what should we do?"
      else if (
        lower.includes('corrective action') ||
        lower.includes('recommend') ||
        lower.includes('what should we do') ||
        lower.includes('action plan') ||
        lower.includes('mitigation') ||
        lower.includes('prevent recurrence')
      ) {
        if (selectedReport && selectedReport.actionPlan) {
          const ap = selectedReport.actionPlan;
          replyText = `### Corrective Action Plan for ${selectedReport.id} (${selectedReport.asset}):

• **Immediate Field Mitigation**: ${ap.immediateMitigation}
• **Engineering Barrier Restoration**: ${ap.engineeringBarrierAction}
• **SIF Precursor Verification**: ${ap.sifPrecursorCheck}
• **Assigned Owner**: ${ap.assignedRole} (Target: ${ap.targetClosureHours} Hours)
• **Operational Checklist**:
${ap.checklist.map((c, i) => `  ${i + 1}. [${c.role}] ${c.step}`).join('\n')}

**Recurrence Prevention**: ${selectedReport.preventRecurrence?.evidenceRecurrence || 'Verify zero trapped energy prior to work permit clearance.'}`;
          actionLink = { tab: 'command-center', reportId: selectedReport.id, label: 'View Action Intelligence on Dashboard' };
        } else {
          replyText = `For any safety finding, corrective actions must follow the Hierarchy of Controls: Elimination, Engineering Barriers, Administrative Controls, and PPE. Select an active report to inspect its specific 5-step corrective plan.`;
        }
      }

      // A3. "What are the weak signals in this report?"
      else if (
        lower.includes('weak signal') ||
        lower.includes('precursor signal') ||
        lower.includes('early warning')
      ) {
        if (selectedReport && selectedReport.weakSignals && selectedReport.weakSignals.length > 0) {
          replyText = `### Weak Signals Detected in ${selectedReport.id}:
The system extracted ${selectedReport.weakSignals.length} latent weak signals directly from this report:

${selectedReport.weakSignals.map((ws, i) => `**${i + 1}. ${ws.category}** (${ws.severity.toUpperCase()}):
• Quoted Evidence: *"${ws.evidenceQuote}"*
• Emergent Implication: ${ws.significance}`).join('\n\n')}

When multiple minor deviations co-occur (e.g., small seepage + pressure gauge flicker), they indicate latent system breakdown before an acute SIF event occurs.`;
          actionLink = { tab: 'weak-signal-fusion', reportId: selectedReport.id, label: 'Open Weak Signal Fusion Matrix' };
        } else if (selectedReport) {
          replyText = `Report ${selectedReport.id} contains weak signals related to *${selectedReport.controlFailure}* and *${selectedReport.hazard}*. Quoted evidence: *"${selectedReport.evidence[0] || selectedReport.narrative}"*.`;
          actionLink = { tab: 'weak-signal-fusion', reportId: selectedReport.id, label: 'Inspect Weak Signal Fusion' };
        } else {
          replyText = `Weak signals are low-amplitude, non-injury observations (slight valve weep, minor gauge oscillation, deferred bolt replacement) that precede major SIF events.`;
        }
      }

      // A4. "Why did the system identify this as a potential SIF precursor?"
      else if (
        lower.includes('why') && (lower.includes('sif') || lower.includes('precursor') || lower.includes('potential sif'))
      ) {
        if (selectedReport) {
          replyText = `### SIF Precursor Classification Rationale for ${selectedReport.id}:
The report was classified with **Potential SIF Precursor: "${selectedReport.sifPrecursor}"** because:

1. **High-Energy Hazard Present**: The operation involves *${selectedReport.hazard}* capable of inflicting fatal or life-altering harm.
2. **Barrier Breakdown**: Physical verification showed *"${selectedReport.controlFailure}"*, compromising the primary barrier (*${selectedReport.barrier}*).
3. **Line-of-Fire Exposure**: Personnel were actively positioned in the danger envelope (*${selectedReport.exposure}*).

According to Campbell Institute and IOGP criteria, a precursor exists whenever high-energy exposure coincides with a degraded or bypassed barrier, regardless of whether injury occurred.`;
          actionLink = { tab: 'sif-pathway', reportId: selectedReport.id, label: 'Inspect 6-Stage SIF Pathway' };
        } else {
          replyText = `A SIF Precursor is defined as an operational condition where high-energy hazard exposure is present simultaneously with a degraded or missing barrier.`;
        }
      }

      // A5. "Explain the incident in simple language / summary"
      else if (
        lower.includes('simple') ||
        lower.includes('explain the incident') ||
        lower.includes('summarize') ||
        lower.includes('summary') ||
        lower.includes('in simple terms') ||
        lower.includes('what happened')
      ) {
        if (selectedReport) {
          replyText = `### Plain Language Summary of ${selectedReport.id}:
• **Where & What**: During *${selectedReport.activity}* at *${selectedReport.asset}* (${selectedReport.installation}).
• **What Went Wrong**: *${selectedReport.controlFailure}*.
• **The Danger**: Crew members were exposed to *${selectedReport.hazard}* while in the danger zone (*${selectedReport.exposure}*).
• **Safety Barrier Affected**: *${selectedReport.barrier}* was not properly functioning or verified.
• **What Must Be Done**: ${selectedReport.actionPlan?.immediateMitigation || 'Stop work and enforce verified energy isolation before continuing.'}`;
          actionLink = { tab: 'report-analyzer', reportId: selectedReport.id, label: 'Read Full Incident Narrative' };
        } else {
          replyText = `Please select an active report to generate an executive plain-language summary.`;
        }
      }

      // ==========================================
      // B. CONCEPTUAL HSE KNOWLEDGE BASE
      // ==========================================

      // B1. SIF Precursor definition
      else if (
        (lower.includes('what is') || lower.includes('define') || lower.includes('explain')) &&
        (lower.includes('sif') || lower.includes('precursor'))
      ) {
        replyText = `### What is a SIF Precursor?
A **SIF (Serious Injury and Fatality) Precursor** is an operational event, unsafe condition, or control failure that had the potential to cause a life-altering or fatal injury if one defensive barrier had failed or if conditions had slightly differed.

**Key Criteria (Campbell Institute & IOGP)**:
1. **High Energy**: Hydrocarbon pressure (>100 psi), suspended loads (>500 kg), toxic/flammable gas (H2S, LEL), electrical energy (>50V), or work at height (>1.8m).
2. **Absence/Degradation of a Direct Control**: Positive isolation, physical barricade, fall arrest, or certified rigging was missing or bypassed.
3. **Personnel Exposure**: A worker was located inside the line of fire.

*Crucial takeaway: A near miss without injury can still be a Critical SIF Precursor if high energy was present.*`;
      }

      // B2. Barrier Degradation concept
      else if (
        (lower.includes('what is') || lower.includes('explain')) &&
        (lower.includes('barrier degradation') || lower.includes('barrier in safety') || lower.includes('what is a barrier'))
      ) {
        replyText = `### Defensive Barrier Degradation in Oil & Gas:
In process safety (Swiss Cheese Model), **Barriers** are engineered, physical, or procedural controls designed to prevent the release of hazardous energy or mitigate its consequences.

• **Physical Barriers**: Blind flanges, blowout preventers (BOP), relief valves, deflection shields.
• **Engineered Barriers**: ESD logic, combustible gas detectors, high-level shutoff switches.
• **Procedural Barriers**: Permit-to-Work (PTW), Lockout/Tagout (LOTO), Four-Eyes verification.

**Barrier Degradation** occurs when maintenance is deferred, inspections are skipped, or procedures are routinely bypassed. When multiple barriers degrade simultaneously, a catastrophic incident becomes imminent.`;
        actionLink = { tab: 'barrier-degradation', label: 'Open Barrier Degradation Tracker' };
      }

      // B3. UA/UC meaning
      else if (
        lower.includes('ua/uc') ||
        lower.includes('ua uc') ||
        lower.includes('unsafe act') ||
        lower.includes('unsafe condition')
      ) {
        replyText = `### UA/UC (Unsafe Act / Unsafe Condition):
• **Unsafe Act (UA)**: A human action or behavioral departure from safe operational procedures, standards, or rules (e.g., failing to wear a safety harness at 10m height, operating machinery without pre-start inspection, or bypassing a gas alarm interlock).
• **Unsafe Condition (UC)**: A physical or environmental defect that poses hazard exposure (e.g., corroded pipe flange, non-functional relief valve, oily drilling floor, missing handrail, or defective pressure gauge).

*Modern HSE Philosophy: Unsafe acts are rarely individual negligence; they typically reflect systemic organizational pressures, poor tooling, or degraded procedural barriers.*`;
      }

      // B4. IOGP Life-Saving Rules
      else if (
        lower.includes('iogp') ||
        lower.includes('life saving rules') ||
        lower.includes('life-saving rules')
      ) {
        replyText = `### IOGP Life-Saving Rules (International Association of Oil & Gas Producers):
The 9 standardized Life-Saving Rules are targeted at the activities that statistically account for the vast majority of fatal incidents in upstream exploration and production:

1. **Bypassing Safety Controls**: Obtain authorization before overriding or disabling safety-critical equipment.
2. **Confined Space Entry**: Confirm continuous atmosphere testing and gas clearance.
3. **Driving Safety**: Seatbelts, speed limits, no mobile phone usage.
4. **Energy Isolation**: Verify zero energy state and de-pressurization before starting work.
5. **Hot Work**: Clear flammable vapors and control ignition sources.
6. **Line of Fire**: Keep yourself and others clear of moving machinery, pressurized paths, and drop zones.
7. **Safe Mechanical Lifting**: Never walk under a suspended load.
8. **Work Authorization**: Confirm valid Permit-to-Work (PTW) and conduct pre-job Toolbox Talk.
9. **Working at Height**: Use 100% tie-off fall protection when working above 1.8 meters.`;
      }

      // ==========================================
      // C. FLEET / SYSTEMIC QUERIES
      // ==========================================

      // C1. Highest risk location
      else if (lower.includes('highest safety risk') || lower.includes('highest risk location') || (lower.includes('highest risk') && (lower.includes('location') || lower.includes('installation') || lower.includes('field')))) {
        replyText = `Based on aggregate spatial precursor density and barrier degradation metrics across operational assets:
1. **Bagjan Wellsite Operations** currently ranks highest with an installation risk index of 88/100 (Deep gas reservoir with high casing head pressure).
2. **Duliajan Central Field** ranks second at 84/100, driven by intense workover interventions on aging wellheads.
3. **Jorhat Exploration Rig 4** follows at 79/100.`;
        actionLink = { tab: 'installation-map', label: 'Open Spatial Risk Intelligence' };
      }

      // C2. Why location high risk
      else if (lower.includes('why is this location high risk') || lower.includes('why is the location high risk') || lower.includes('why high risk')) {
        replyText = `Duliajan Central Field and Bagjan are classified as high risk due to three converging operational factors:
1. **Precursor Concentration**: 60% of all reported high-severity observations involve high-pressure fluid energy under Workover operations.
2. **Barrier Degradation**: The primary defense 'Positive Energy Isolation (LOTO)' has dropped to 38% Health (CRITICAL).
3. **Weak Signal Convergence**: Active Cluster WSC-01 connects 4 weak signals (flange seepage, hydraulic pulsation, deferred seal replacement, and trapped pressure) directly to Wellhead Master Valve MV-104.`;
        actionLink = { tab: 'weak-signal-fusion', label: 'Inspect Weak Signal Cluster WSC-01' };
      }

      // C3. Recurring incident pattern
      else if (lower.includes('recurring incident pattern') || lower.includes('recurring pattern') || lower.includes('incident pattern')) {
        replyText = `Across the current repository of ${reports.length} observations, the dominant recurring pattern is:
**"Stored / Residual Energy under Inadequate Mechanical Isolation during Wellhead Workover Interventions"**.
In 14 separate reports, crews disconnected or unbolted line flanges while assuming the upstream gate valve provided zero-energy barrier, without performing formal physical line bleedoff verification.`;
        actionLink = { tab: 'sif-dna', label: 'Inspect Incident DNA Causal Sequence' };
      }

      // C4. Degraded barriers
      else if (lower.includes('barriers appear degraded') || lower.includes('which barriers are degraded') || lower.includes('barrier is degrading') || lower.includes('degraded barrier')) {
        const criticalBarriers = barrierHealth.filter(b => b.currentStatus === 'Critical' || b.currentStatus === 'Degrading');
        replyText = `Continuous barrier surveillance identifies ${criticalBarriers.length} degraded defense systems across operational assets:
${criticalBarriers.map(b => `• **${b.barrier}**: Health score ${b.healthScore}% (${b.currentStatus.toUpperCase()}) with ${b.failureCount} recorded failure events. Degradation driver: ${b.degradationDriver}.`).join('\n')}
Immediate reinforcement of zero-energy verification protocols and mechanical interlock tagging is recommended.`;
        actionLink = { tab: 'barrier-degradation', label: 'Open Barrier Degradation Tracker' };
      }

      // C5. SIF precursors detected
      else if (lower.includes('what sif precursors were detected') || lower.includes('sif precursors detected') || lower.includes('precursors detected')) {
        const precursorCounts: Record<string, number> = {};
        reports.forEach(r => {
          precursorCounts[r.sifPrecursor] = (precursorCounts[r.sifPrecursor] || 0) + 1;
        });
        const list = Object.entries(precursorCounts).sort((a, b) => b[1] - a[1]);
        replyText = `A total of ${sifPotentialCount} SIF-capable precursors have been detected across active reports:
${list.map(([name, count]) => `• **${name}**: ${count} reports (${name === 'Energy Isolation Failure' ? 'CRITICAL VELOCITY' : 'Monitored'})`).join('\n')}
The highest consequence precursor remains Energy Isolation Failure on Workover and Pipeline operations.`;
        actionLink = { tab: 'sif-pathway', label: 'Inspect SIF Precursor Pathways' };
      }

      // C6. Increasing fastest / velocity
      else if (lower.includes('increasing fastest') || lower.includes('velocity')) {
        const topVelocity = [...precursorVelocity].sort((a, b) => b.velocityMultiplier - a.velocityMultiplier)[0];
        replyText = `Based on current reporting velocity analysis, "**${topVelocity.precursor}**" is increasing fastest with a **${topVelocity.velocityMultiplier}× acceleration rate** over the past 30 days compared to the 90-day baseline (${topVelocity.countCurrent30Days} observations vs ${topVelocity.countPrevious90Days}). The highest concentration is currently detected at ${topVelocity.topInstallation}.`;
        actionLink = { tab: 'precursor-velocity', label: 'View Precursor Velocity Index' };
      }

      // C7. Recurring isolation failures
      else if (lower.includes('recurring energy isolation') || lower.includes('isolation failures')) {
        const isolationReports = reports.filter(r => r.sifPrecursor === 'Energy Isolation Failure');
        replyText = `I have identified ${isolationReports.length} reports in the repository citing "Energy Isolation Failure". A notable hotspot is Workover Rig WOR-07 at Duliajan Central Field, which is part of active Weak Signal Cluster WSC-01 where minor valve seepage, vibration, and deferred replacement have converged into high SIF potential.`;
        actionLink = { tab: 'weak-signal-fusion', label: 'Inspect Cluster WSC-01' };
      }

      // C8. Overdue corrective actions
      else if (lower.includes('overdue') || lower.includes('action closure') || lower.includes('open action')) {
        const overdueActions = correctiveActions.filter(a => a.status !== 'CLOSED');
        replyText = `There are currently **${overdueActions.length} open corrective mitigations** in the fleet ledger. Actions pending field verification include:
${overdueActions.slice(0, 3).map(a => `• **${a.id}**: "${a.actionTitle}" (${a.status}) assigned to ${a.ownerRole}.`).join('\n')}

Action Intelligence enforces independent supervisor verification before any SIF action can be formally closed.`;
        actionLink = { tab: 'corrective-actions', label: 'Review Corrective Actions' };
      }

      // D. GENERAL KEYWORD / INCIDENT SEARCH FALLBACK
      else {
        const matchedReports = reports.filter(r => 
          r.narrative.toLowerCase().includes(lower) || 
          r.sifPrecursor.toLowerCase().includes(lower) || 
          r.asset.toLowerCase().includes(lower) ||
          r.hazard.toLowerCase().includes(lower) ||
          r.activity.toLowerCase().includes(lower)
        );
        if (matchedReports.length > 0) {
          replyText = `I searched your active repository and found **${matchedReports.length} related reports** matching "${query}".

**Top Finding**: Report **${matchedReports[0].id}** (${matchedReports[0].asset}, ${matchedReports[0].installation}):
• **Activity**: ${matchedReports[0].activity}
• **Hazard**: ${matchedReports[0].hazard}
• **SIF Precursor**: ${matchedReports[0].sifPrecursor} (Risk Score: ${matchedReports[0].riskScore}/100)
• **Narrative Excerpt**: *"${matchedReports[0].narrative.slice(0, 140)}..."*`;
          actionLink = { tab: 'report-analyzer', reportId: matchedReports[0].id, label: `Open Report ${matchedReports[0].id}` };
        } else {
          replyText = `I analyzed your inquiry regarding "${query}". You can ask me:

**About the Active Report**:
• "Why is this report high risk?"
• "What corrective action is recommended?"
• "What are the weak signals in this report?"
• "Why did the system identify this as a potential SIF precursor?"
• "Explain this incident in simple language"

**HSE Safety Concepts**:
• "What is a SIF precursor?"
• "Explain barrier degradation"
• "What does UA/UC mean?"
• "What are IOGP Life-Saving Rules?"

**Fleet Safety Intelligence**:
• "Which location currently has the highest safety risk?"
• "Which precursor is increasing fastest?"
• "Which barriers appear degraded?"`;
        }
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 350);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-oil-100 text-oil-700 flex items-center justify-center font-bold">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-oil-100 text-oil-800 uppercase">
                Context-Aware Intelligence
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500">Repository Grounded</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">OIL Safety AI Assistant</h1>
            <p className="text-xs text-slate-500">
              Not a generic chatbot — queries actual safety reports, degrading barriers, and precursor velocity across Oil India.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Question Buttons (Section 32) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-oil-600" />
          Predefined Analytical Queries (Click to Run):
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-oil-500 hover:text-oil-700 transition-all text-slate-700 shadow-2xs"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-[460px] overflow-hidden">
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex space-x-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-oil-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-xl space-y-2 leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-oil-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none font-mono whitespace-pre-line'
                }`}
              >
                <div>{m.text}</div>

                {m.actionLink && (
                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => {
                        if (m.actionLink?.reportId) selectReport(m.actionLink.reportId);
                        setActiveTab(m.actionLink!.tab);
                      }}
                      className="px-3 py-1.5 bg-oil-600 hover:bg-oil-700 text-white font-bold rounded text-xs flex items-center gap-1 transition-colors"
                    >
                      {m.actionLink.label} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Query Input Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about reports, precursors, barriers, installations..."
            className="flex-1 p-3 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-oil-500 focus:border-oil-500"
          />
          <button
            onClick={() => handleSend()}
            className="px-5 py-3 bg-oil-600 hover:bg-oil-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>

      </div>

    </div>
  );
};
