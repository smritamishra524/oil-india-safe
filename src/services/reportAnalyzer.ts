import {
  SafetyReport,
  ActivityType,
  HazardType,
  ExposureType,
  BarrierType,
  ControlFailureType,
  SIFPrecursorType,
  IOPGLLifeSavingRule,
  SeverityLevel,
  SIFPotentialLevel,
  MissingEvidenceItem,
  ContradictionItem,
  RecommendedIntervention,
  SIFPrecursorDNA,
  ActionPlan,
  PreventRecurrenceData,
  WeakSignalItem,
  SIFPathwayNode,
  BarrierDegradationDetail
} from '../types';

interface PatternRule<T> {
  type: T;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
}

const ACTIVITY_PATTERNS: PatternRule<ActivityType>[] = [
  {
    type: 'Work at Height',
    keywords: ['height', 'scaffold', 'ladder', 'derrick', 'elevated', 'platform', 'harness', 'lanyard', 'fall arrest', 'monkey board', 'aerial', 'mast', 'man basket', 'grating', 'tie-off', 'fall protection'],
    patterns: [/work(?:ing)?\s+at\s+height/i, /overhead\s+work/i, /above\s+(?:2|3|4|5|10|20|25|30)\s*m/i, /elevated\s+platform/i, /monkey\s+board/i, /derrick\s+mast/i],
    weight: 15
  },
  {
    type: 'Workover',
    keywords: ['workover', 'rig', 'pulling', 'tubing', 'casing', 'wireline', 'snubbing', 'slickline', 'wellhead intervention', 'wor-07', 'wor-'],
    patterns: [/workover\s+(?:rig|operation|unit)/i, /servicing\s+well/i, /tripping\s+(?:pipe|tubing)/i, /wor-\d+/i],
    weight: 12
  },
  {
    type: 'Drilling',
    keywords: ['drilling', 'drill string', 'rotary', 'kelly', 'derrick', 'mud tank', 'drill bit', 'top drive', 'drawworks', 'bop', 'blowout preventer', 'shale shaker'],
    patterns: [/drill(?:ing)?\s+operation/i, /top\s+drive/i, /drawworks/i, /mud\s+pump/i],
    weight: 12
  },
  {
    type: 'Pipeline Maintenance',
    keywords: ['pipeline', 'pigging', 'trunkline', 'manifold', 'pipeline leak', 'flange', 'corrosion', 'right of way', 'row', 'excavation', 'trunk-a', 'flowline'],
    patterns: [/pipeline\s+(?:inspection|section|repair|corrosion)/i, /pig\s+launcher/i, /flowline\s+leak/i, /trunkline/i],
    weight: 12
  },
  {
    type: 'Confined Space Entry',
    keywords: ['confined space', 'vessel', 'tank entry', 'separator vessel', 'sump', 'pit', 'enclosed space', 'oxygen deficient', 'manhole', 'v-201', 'sep-'],
    patterns: [/confined\s+space/i, /tank\s+cleaning/i, /vessel\s+entry/i, /inside\s+separator/i, /manhole/i],
    weight: 14
  },
  {
    type: 'Hot Work & Welding',
    keywords: ['hot work', 'welding', 'grinding', 'torch', 'sparks', 'cutting', 'flame', 'fire watch', 'brazing', 'gas cutting'],
    patterns: [/hot\s+work/i, /welding\s+operation/i, /gas\s+cutting/i, /grinding\s+sparks/i],
    weight: 13
  },
  {
    type: 'Mechanical Lifting',
    keywords: ['crane', 'sling', 'shackle', 'hoisting', 'lifting', 'rigging', 'winch', 'suspended load', 'hook', 'tagline', 'boom'],
    patterns: [/crane\s+(?:lift|operation)/i, /suspended\s+load/i, /rigging\s+failure/i, /hoisting/i],
    weight: 12
  },
  {
    type: 'Electrical Maintenance',
    keywords: ['mcc', 'switchgear', 'transformer', 'arc flash', 'electrical', 'voltage', 'breaker', 'breaker panel', 'substation', 'motor'],
    patterns: [/electrical\s+(?:isolation|maintenance|panel)/i, /high\s+voltage/i, /lockout\s+tagout/i, /breaker/i],
    weight: 11
  },
  {
    type: 'Production Operations',
    keywords: ['production', 'manifold', 'separator', 'gathering station', 'gas lift', 'gcs', 'ocs', 'crude oil', 'flow station', 'compressor', 'c-2'],
    patterns: [/oil\s+collecting\s+station/i, /gas\s+compressor/i, /production\s+manifold/i, /compressor\s+station/i],
    weight: 10
  },
  {
    type: 'General Maintenance',
    keywords: ['maintenance', 'preventive', 'inspection', 'valve replacement', 'gasket', 'overhaul', 'pump servicing', 'servicing'],
    patterns: [/routine\s+maintenance/i, /servicing/i, /overhaul/i, /repairs?/i],
    weight: 6
  }
];

const HAZARD_PATTERNS: PatternRule<HazardType>[] = [
  {
    type: 'Fall from Height',
    keywords: ['fall', 'height', 'unprotected edge', 'slipping', 'scaffolding gap', 'open hatch', 'guardrail missing', 'unhooked', 'without harness', 'no tie-off', 'lanyard', 'mast sway', 'monkey board', '28 meters', '22 meters'],
    patterns: [/fall\s+from\s+height/i, /risk\s+of\s+falling/i, /unprotected\s+edge/i, /without\s+(?:proper\s+)?fall\s+protection/i, /without\s+(?:dual\s+)?(?:safety\s+)?harness/i, /zero\s+tie[- ]off/i],
    weight: 16
  },
  {
    type: 'Hydrocarbon Gas Release',
    keywords: ['gas leak', 'gas smell', 'methane', 'hydrocarbon', 'flammable gas', 'vapor cloud', 'gas release', 'condensate', 'lel', 'gas detector', 'compressor leak'],
    patterns: [/gas\s+(?:leak|release|cloud|escape|smell)/i, /hydrocarbon\s+release/i, /lel\s+alarm/i, /gas\s+detector/i],
    weight: 16
  },
  {
    type: 'Hydrogen Sulfide (H2S)',
    keywords: ['h2s', 'hydrogen sulfide', 'sour gas', 'rotten egg', 'toxic gas', 'detector alarm', 'breathing apparatus', 'ppm'],
    patterns: [/h2s\s+(?:alarm|exposure|leak|concentration)/i, /hydrogen\s+sulfide/i, /sour\s+(?:gas|crude)/i],
    weight: 16
  },
  {
    type: 'Stored / Residual Energy',
    keywords: ['pressure', 'residual pressure', 'hydraulic', 'stored energy', 'pneumatic', 'pressurized', 'bleed off', 'trapped pressure', 'valve not holding', 'psi', 'depressuriz'],
    patterns: [/residual\s+pressure/i, /stored\s+(?:energy|pressure)/i, /trapped\s+pressure/i, /line\s+pressur/i, /\d+\s*psi/i],
    weight: 15
  },
  {
    type: 'High Pressure Fluid',
    keywords: ['high pressure', 'mud line', 'injection line', 'pinhole leak', 'washout', 'whipcheck', 'choke manifold', 'fluid ejection', 'cracked casing', 'discharge pulsation'],
    patterns: [/high\s+pressure\s+(?:fluid|jet|line)/i, /pinhole\s+leak/i, /flange\s+spray/i, /casing\s+crack/i, /discharge\s+pulsation/i],
    weight: 14
  },
  {
    type: 'Line of Fire (Machinery/Tension)',
    keywords: ['line of fire', 'pinch point', 'rotating equipment', 'winch line', 'snubbing line', 'tong', 'swivel', 'recoil', 'whip'],
    patterns: [/line\s+of\s+fire/i, /pinch\s+point/i, /rotating\s+(?:part|shaft)/i, /high\s+tension\s+cable/i],
    weight: 13
  },
  {
    type: 'Dropped Object',
    keywords: ['dropped object', 'falling tool', 'unsecured shackle', 'overhead load', 'snagged', 'dropped pipe', 'derrick floor'],
    patterns: [/dropped\s+object/i, /falling\s+(?:pipe|tool|material)/i, /overhead\s+hazard/i],
    weight: 12
  },
  {
    type: 'Oxygen Deficiency / Toxic Fumes',
    keywords: ['oxygen deficiency', 'suffocation', 'nitrogen purge', 'inert atmosphere', 'toxic fume', 'co poisoning', 'anoxia', 'gas test omitted'],
    patterns: [/oxygen\s+(?:deficien|level|low)/i, /nitrogen\s+purge/i, /toxic\s+vapors/i, /respiratory/i],
    weight: 14
  },
  {
    type: 'Ignition Source in Hazardous Zone',
    keywords: ['spark', 'hot surface', 'unrated electrical', 'static', 'flame', 'non-intrinsically safe', 'smoking', 'ex zone 1', 'hot work permit'],
    patterns: [/ignition\s+source/i, /zone\s+[01]/i, /hot\s+surface\s+near\s+leak/i, /sparking/i],
    weight: 13
  },
  {
    type: 'Structural Instability',
    keywords: ['scaffold collapse', 'structural integrity', 'foundation settling', 'corroded support', 'rig sub-base', 'mast sway'],
    patterns: [/structural\s+(?:damage|defect|instability)/i, /weakened\s+support/i, /mast\s+sway/i],
    weight: 11
  }
];

const BARRIER_PATTERNS: PatternRule<BarrierType>[] = [
  {
    type: 'Fall Protection System',
    keywords: ['fall protection', 'safety harness', 'lanyard', 'lifeline', 'guardrail', 'safety net', 'inertia reel', 'anchor point', 'tie-off'],
    patterns: [/fall\s+protection/i, /safety\s+harness/i, /100%\s+tie[- ]off/i, /life\s*line/i, /anchor\s+point/i],
    weight: 16
  },
  {
    type: 'Gas Detection & Monitoring',
    keywords: ['gas detector', 'lel monitor', 'fixed detector', 'portable detector', 'gas test', 'explosimeter', 'gas calibration', 'detector malfunctioning', 'battery discharged'],
    patterns: [/gas\s+detect/i, /atmospheric\s+test/i, /lel\s+monitor/i, /gas\s+survey/i, /fixed\s+detector/i],
    weight: 15
  },
  {
    type: 'Energy Isolation (LOTO)',
    keywords: ['isolation', 'loto', 'lockout', 'tagout', 'bleed', 'depressurize', 'blind flange', 'spade', 'positive isolation', 'valve closed', 'master valve'],
    patterns: [/energy\s+isolation/i, /lockout\s+tagout/i, /blind\s+inserted/i, /valve\s+isolation/i, /loto/i, /not\s+isolated/i],
    weight: 15
  },
  {
    type: 'Pressure Relief & Bleedoff System',
    keywords: ['psv', 'pressure relief valve', 'bleed valve', 'blowdown', 'vent line', 'flare line', 'rupture disc', 'pop-off', 'pop off'],
    patterns: [/pressure\s+relief/i, /psv/i, /bleed\s+off\s+valve/i, /depressuriz/i, /pop[- ]off/i],
    weight: 14
  },
  {
    type: 'Permit to Work (PTW) & JSA',
    keywords: ['permit to work', 'ptw', 'jsa', 'job safety analysis', 'risk assessment', 'toolbox talk', 'tbt', 'work clearance', 'sign-off', 'signature'],
    patterns: [/permit\s+to\s+work/i, /ptw/i, /job\s+safety\s+analysis/i, /toolbox\s+talk/i, /work\s+clearance/i],
    weight: 13
  },
  {
    type: 'Certified Lifting Rigging & Plan',
    keywords: ['lifting plan', 'crane inspection', 'rigger certification', 'tag line', 'sling inspection', 'wll rating'],
    patterns: [/lifting\s+plan/i, /rigging\s+inspection/i, /crane\s+limit\s+switch/i],
    weight: 12
  },
  {
    type: 'Exclusion Zone & Barricading',
    keywords: ['barricade', 'exclusion zone', 'warning tape', 'restricted area', 'red tape', 'barrier tape', 'standoff'],
    patterns: [/exclusion\s+zone/i, /barricad/i, /restricted\s+perimeter/i, /red[- ]tape/i],
    weight: 11
  },
  {
    type: 'Emergency Shutdown (ESD)',
    keywords: ['esd', 'emergency shutdown', 'deluge', 'quick closing valve', 'remote shutoff', 'safety trip'],
    patterns: [/emergency\s+shutdown/i, /esd\s+valve/i, /trip\s+system/i],
    weight: 12
  }
];

export function analyzeReportNarrative(
  text: string, 
  existingMetadata?: { installation?: string; asset?: string; reportType?: string },
  historicalReports?: SafetyReport[]
): SafetyReport {
  const normalizedText = text.toLowerCase();

  // 1. Identify Activity
  let matchedActivity: ActivityType = 'General Maintenance';
  let highestActivityScore = 0;
  for (const rule of ACTIVITY_PATTERNS) {
    let score = 0;
    rule.keywords.forEach(kw => {
      if (normalizedText.includes(kw)) score += rule.weight;
    });
    rule.patterns.forEach(pat => {
      if (pat.test(text)) score += rule.weight * 1.5;
    });
    if (score > highestActivityScore) {
      highestActivityScore = score;
      matchedActivity = rule.type;
    }
  }

  // 2. Identify Hazard
  let matchedHazard: HazardType = 'Stored / Residual Energy';
  let highestHazardScore = 0;
  for (const rule of HAZARD_PATTERNS) {
    let score = 0;
    rule.keywords.forEach(kw => {
      if (normalizedText.includes(kw)) score += rule.weight;
    });
    rule.patterns.forEach(pat => {
      if (pat.test(text)) score += rule.weight * 1.5;
    });
    if (score > highestHazardScore) {
      highestHazardScore = score;
      matchedHazard = rule.type;
    }
  }

  // 3. Identify Barrier
  let matchedBarrier: BarrierType = 'Energy Isolation (LOTO)';
  let highestBarrierScore = 0;
  for (const rule of BARRIER_PATTERNS) {
    let score = 0;
    rule.keywords.forEach(kw => {
      if (normalizedText.includes(kw)) score += rule.weight;
    });
    rule.patterns.forEach(pat => {
      if (pat.test(text)) score += rule.weight * 1.5;
    });
    if (score > highestBarrierScore) {
      highestBarrierScore = score;
      matchedBarrier = rule.type;
    }
  }

  // Alignment corrections based on strong hazard keywords
  if (matchedHazard === 'Fall from Height' || matchedActivity === 'Work at Height') {
    matchedBarrier = 'Fall Protection System';
    matchedActivity = 'Work at Height';
  } else if (matchedHazard === 'Hydrocarbon Gas Release') {
    if (normalizedText.includes('detector') || normalizedText.includes('gas test') || normalizedText.includes('monitor')) {
      matchedBarrier = 'Gas Detection & Monitoring';
    } else if (normalizedText.includes('isolate') || normalizedText.includes('valve')) {
      matchedBarrier = 'Energy Isolation (LOTO)';
    } else {
      matchedBarrier = 'Gas Detection & Monitoring';
    }
  } else if (normalizedText.includes('relief valve') || normalizedText.includes('pop-off') || normalizedText.includes('psv')) {
    matchedBarrier = 'Pressure Relief & Bleedoff System';
  }

  // 4. Control Failure & SIF Precursor
  let matchedControlFailure: ControlFailureType = 'Isolation Not Verified / Zero-Energy Unchecked';
  let matchedPrecursor: SIFPrecursorType = 'Energy Isolation Failure';
  let matchedRule: IOPGLLifeSavingRule = 'Energy Isolation';
  let matchedExposure: ExposureType = 'Workers within Unisolated Work Zone';
  let potentialConsequence = 'High Pressure Fluid Ejection / Direct Personnel Contact';

  if (matchedHazard === 'Fall from Height' || matchedActivity === 'Work at Height') {
    matchedControlFailure = 'Missing / Improper 100% Tie-Off';
    matchedPrecursor = 'Failed Fall Protection';
    matchedRule = 'Work at Height';
    matchedExposure = 'Elevated Technician without Fall Restraint';
    potentialConsequence = 'Catastrophic Fall from Elevated Derrick/Platform leading to Fatal Impact';
  } else if (matchedHazard === 'Hydrocarbon Gas Release' || matchedHazard === 'Hydrogen Sulfide (H2S)') {
    matchedControlFailure = 'Inadequate Gas Testing Before Entry';
    matchedPrecursor = 'Uncontained Hydrocarbon Leakage';
    matchedRule = 'Bypassing Safety Controls';
    matchedExposure = 'Nearby Operators Exposed to Gas Plume';
    potentialConsequence = 'Vapor Cloud Explosion (VCE) or Acute Toxic Asphyxiation';
  } else if (matchedActivity === 'Confined Space Entry' || matchedHazard === 'Oxygen Deficiency / Toxic Fumes') {
    matchedControlFailure = 'Inadequate Gas Testing Before Entry';
    matchedPrecursor = 'Confined Space Engulfment';
    matchedRule = 'Confined Space';
    matchedExposure = 'Entry Team in Enclosed Vessel';
    potentialConsequence = 'Rapid Anoxia / Irreversible Asphyxiation inside Enclosed Vessel';
  } else if (matchedActivity === 'Mechanical Lifting' || matchedHazard === 'Dropped Object') {
    matchedControlFailure = 'Uncertified Rigging Hardware / Exceeded WLL';
    matchedPrecursor = 'Suspended Load Rigging Failure';
    matchedRule = 'Safe Mechanical Lifting';
    matchedExposure = 'Ground Crew beneath Suspended Load';
    potentialConsequence = 'Crushing Fatality from Structural Rigging Collapse';
  } else if (matchedActivity === 'Hot Work & Welding' || matchedHazard === 'Ignition Source in Hazardous Zone') {
    matchedControlFailure = 'Bypassed Interlock / Safeguard Overridden';
    matchedPrecursor = 'Hot Work Ignition Precursor';
    matchedRule = 'Hot Work';
    matchedExposure = 'Personnel in Direct Line-of-Fire';
    potentialConsequence = 'Hydrocarbon Deflagration / Flash Fire in Classified Area';
  } else if (matchedHazard === 'High Pressure Fluid' || matchedHazard === 'Stored / Residual Energy') {
    if (normalizedText.includes('relief') || normalizedText.includes('pop-off')) {
      matchedControlFailure = 'Bypassed Interlock / Safeguard Overridden';
      matchedPrecursor = 'High-Pressure Blowout / Ejection';
      matchedRule = 'Energy Isolation';
      matchedExposure = 'Personnel in Direct Line-of-Fire';
      potentialConsequence = 'High-Pressure Casing Rupture / Shrapnel Impact Ejection';
    } else {
      matchedControlFailure = 'Isolation Not Verified / Zero-Energy Unchecked';
      matchedPrecursor = 'Energy Isolation Failure';
      matchedRule = 'Energy Isolation';
      matchedExposure = 'Workers within Unisolated Work Zone';
      potentialConsequence = 'Uncontrolled High Pressure Fluid Discharge / Blunt Force Impact';
    }
  } else {
    matchedControlFailure = 'Failure to Barricade Line-of-Fire Trajectory';
    matchedPrecursor = 'Heavy Equipment Blind Zone';
    matchedRule = 'Line of Fire';
    matchedExposure = 'Personnel in Direct Line-of-Fire';
    potentialConsequence = 'Severe Impact / Line-of-Fire Trajectory Injury';
  }

  // 5. Extract Evidence Quotes (Real sentences from the report)
  const sentences = text
    .split(/(?<=[.!?\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const evidence: string[] = [];
  const importantTerms = [
    'valve', 'pressure', 'isolate', 'isolated', 'harness', 'lanyard', 'tie-off', 'fall', 'gas', 
    'leak', 'smell', 'detector', 'malfunction', 'supervisor', 'absent', 'permit', 'bleed', 
    'cellar', 'monkey board', 'wind', 'separator', 'sentry', 'pump', 'pulsation', 'relief', 'casing'
  ];

  sentences.forEach(s => {
    const sLower = s.toLowerCase();
    const hitCount = importantTerms.filter(term => sLower.includes(term)).length;
    if (hitCount >= 1 && evidence.length < 4 && !evidence.includes(s)) {
      evidence.push(s);
    }
  });

  if (evidence.length === 0 && sentences.length > 0) {
    evidence.push(sentences[0]);
  }

  // 6. Dynamic Weak Signals Extraction
  const weakSignals: WeakSignalItem[] = [];

  // Check PPE
  if (/harness|lanyard|tie[- ]off|ppe|safety net/i.test(text) && /without|no|unhooked|missing|omitted|zero/i.test(text)) {
    const quote = sentences.find(s => /harness|lanyard|tie[- ]off/i.test(s)) || 'Missing dual lanyard 100% tie-off';
    weakSignals.push({
      id: 'WS-PPE',
      type: 'PPE Non-Compliance',
      name: 'Fall Protection Tie-Off Omission',
      evidence: quote,
      severity: 'High'
    });
  }

  // Check Supervision Gap
  if (/supervisor|supervision|lead|foreman|sentry|watch/i.test(text) && /absent|lacked|missing|omitted|without/i.test(text)) {
    const quote = sentences.find(s => /supervisor|sentry|watch/i.test(s)) || 'Supervisory presence / verification omitted';
    weakSignals.push({
      id: 'WS-SUP',
      type: 'Supervision Gap',
      name: 'Unsupervised Critical Activity',
      evidence: quote,
      severity: 'High'
    });
  }

  // Check Monitoring / Detection
  if (/detector|detection|alarm|monitor|gas test|gauge/i.test(text) && /malfunction|discharged|dead|battery|omitted|no gas test|flicker/i.test(text)) {
    const quote = sentences.find(s => /detector|gas test|gauge/i.test(s)) || 'Monitoring or detection system challenge';
    weakSignals.push({
      id: 'WS-MON',
      type: 'Monitoring Failure',
      name: 'Atmospheric / Sensor Instrumentation Failure',
      evidence: quote,
      severity: 'High'
    });
  }

  // Check Equipment Abnormality
  if (/vibration|pulsation|cracked|leak|seepage|passing|weep|abnormal|pressure of/i.test(text)) {
    const quote = sentences.find(s => /vibration|pulsation|cracked|leak|seepage|pressure/i.test(s)) || 'Mechanical abnormality observed';
    weakSignals.push({
      id: 'WS-EQP',
      type: 'Equipment Abnormality',
      name: 'Mechanical Wear or Integrity Defect',
      evidence: quote,
      severity: 'Medium'
    });
  }

  // Check Maintenance Issue
  if (/defer|deferred|overdue|temporary|packing|drip pan|patch|worn/i.test(text)) {
    const quote = sentences.find(s => /defer|temporary|packing|drip pan/i.test(s)) || 'Temporary fix or deferred maintenance';
    weakSignals.push({
      id: 'WS-MNT',
      type: 'Maintenance Issue',
      name: 'Maintenance Deferral / Temporary Containment',
      evidence: quote,
      severity: 'Medium'
    });
  }

  // Check Environmental Hazard
  if (/wind|gust|rain|squall|wet|grating|heat|dark|night shift/i.test(text)) {
    const quote = sentences.find(s => /wind|gust|squall|wet|night/i.test(s)) || 'Adverse operating / environmental condition';
    weakSignals.push({
      id: 'WS-ENV',
      type: 'Environmental Hazard',
      name: 'Adverse Environmental Influencer',
      evidence: quote,
      severity: 'Medium'
    });
  }

  // Fallback weak signal if none specifically matched
  if (weakSignals.length === 0) {
    weakSignals.push({
      id: 'WS-GEN',
      type: 'Operational Deviation',
      name: `${matchedHazard} Control Gap`,
      evidence: evidence[0] || 'Unsafe operational condition noted in field log',
      severity: 'Medium'
    });
  }

  // 7. Dynamic Barrier Degradation Details
  let barrierCategory: BarrierDegradationDetail['category'] = 'Isolation';
  let failureMode = 'Isolation barrier not independently verified';
  let degradationLevel: BarrierDegradationDetail['degradationLevel'] = 'Critical';
  let reinforcementAction = 'Enforce physical double-block-bleed with digital gauge witness sign-off.';

  if (matchedBarrier === 'Fall Protection System') {
    barrierCategory = 'PPE';
    failureMode = '100% continuous tie-off not practiced; harness unhooked in elevated mast';
    degradationLevel = 'Critical';
    reinforcementAction = 'Immediate stand-down and recertification of inertia reels, harnesses, and certified anchor points.';
  } else if (matchedBarrier === 'Gas Detection & Monitoring') {
    barrierCategory = 'Monitoring/Detection';
    failureMode = 'Fixed or portable gas detection inoperative or test omitted prior to entry';
    degradationLevel = 'Critical';
    reinforcementAction = 'Mandatory bump-test calibration of all multi-gas monitors and continuous LEL logging.';
  } else if (matchedBarrier === 'Pressure Relief & Bleedoff System') {
    barrierCategory = 'Engineering Controls';
    failureMode = 'Pressure relief valve inoperative, fouled, or pop-off failed to relieve surge';
    degradationLevel = 'Severe';
    reinforcementAction = 'Bench test and recalibrate relief valve; inspect vent line headers for blockage.';
  } else if (matchedBarrier === 'Permit to Work (PTW) & JSA') {
    barrierCategory = 'Procedures';
    failureMode = 'Work authorized without on-site physical verification of field controls';
    degradationLevel = 'Severe';
    reinforcementAction = 'Require mandatory on-site physical walkdown by designated HSE authority prior to sign-off.';
  }

  const barrierDegradationDetails: BarrierDegradationDetail = {
    primaryDegradedBarrier: matchedBarrier,
    category: barrierCategory,
    failureMode,
    evidence: evidence[0] || 'Primary safety barrier challenged in operating envelope',
    degradationLevel,
    reinforcementAction
  };

  // 8. Dynamic SIF Escalation Pathway (6 Steps derived from report)
  const sifPathway: SIFPathwayNode[] = [
    {
      step: 1,
      title: 'Unsafe Condition / Act',
      desc: text.slice(0, 85) + '...',
      evidence: evidence[0] || 'Initial condition recorded during field activity.',
      barrier: matchedBarrier,
      riskContribution: '15%',
      intervention: 'Enforce pre-task Toolbox Talk (TBT) and verify Permit-to-Work clearance.'
    },
    {
      step: 2,
      title: 'Failed / Bypassed Defensive Control',
      desc: matchedControlFailure,
      evidence: evidence[1] || evidence[0] || 'Safeguard omitted or not independently verified.',
      barrier: matchedBarrier,
      riskContribution: '25%',
      intervention: reinforcementAction
    },
    {
      step: 3,
      title: 'Active Hazardous Energy Source',
      desc: matchedHazard,
      evidence: `Active energy source: ${matchedHazard} present in operational zone.`,
      barrier: matchedBarrier === 'Fall Protection System' ? 'Engineered Guardrail / Anchor' : 'Positive Physical Containment',
      riskContribution: '30%',
      intervention: 'Positive isolation, zero-energy bleed, or physical fall restraint certification.'
    },
    {
      step: 4,
      title: 'Personnel Exposure Proximity',
      desc: matchedExposure,
      evidence: `Personnel envelope: ${matchedExposure} exposed to direct hazard trajectory.`,
      barrier: 'Exclusion Zone & Barricading',
      riskContribution: '15%',
      intervention: 'Enforce rigid standoff perimeter barricade and line-of-fire exclusion boundary.'
    },
    {
      step: 5,
      title: 'Escalation / Line of Fire Mechanism',
      desc: `Escalation mechanism: ${matchedHazard} propagating toward personnel contact without secondary defense.`,
      evidence: evidence[evidence.length - 1] || 'Escalation trajectory unmitigated by redundant barrier.',
      barrier: 'Secondary Containment / Emergency Controls',
      riskContribution: '15%',
      intervention: 'Install secondary physical arrestor, blast deflector, or remote shutdown interlock.'
    },
    {
      step: 6,
      title: 'SIF Escalation Potential',
      desc: `Potential SIF precursor detected: ${potentialConsequence}`,
      evidence: 'Worst credible operational escalation envelope identified by deterministic model.',
      barrier: 'Emergency Shutdown (ESD) & Evacuation',
      riskContribution: 'Critical Consequence',
      intervention: 'Invoke formal Stop-Work Authority until 100% barrier verification is confirmed.'
    }
  ];

  // 9. Risk Scoring
  let riskScore = 60;
  if (matchedPrecursor === 'Energy Isolation Failure' || matchedPrecursor === 'Uncontained Hydrocarbon Leakage' || matchedPrecursor === 'Confined Space Engulfment') {
    riskScore = 84 + Math.min(12, weakSignals.length * 3);
  } else if (matchedPrecursor === 'Failed Fall Protection' || matchedPrecursor === 'Suspended Load Rigging Failure' || matchedPrecursor === 'High-Pressure Blowout / Ejection') {
    riskScore = 80 + Math.min(10, weakSignals.length * 3);
  } else {
    riskScore = 65 + Math.min(12, weakSignals.length * 2);
  }

  let sifPotential: SIFPotentialLevel = 'Potential SIF';
  let severity: SeverityLevel = 'High';
  if (riskScore >= 82) {
    sifPotential = 'SIF-Capable';
    severity = 'Critical';
  } else if (riskScore >= 65) {
    sifPotential = 'Potential SIF';
    severity = 'High';
  } else {
    sifPotential = 'Non-SIF Precursor';
    severity = 'Medium';
  }

  const confidence = Math.min(96, Math.max(74, 75 + evidence.length * 5));

  // 10. Incident DNA
  const dna: SIFPrecursorDNA = {
    activity: matchedActivity,
    hazard: matchedHazard,
    exposure: matchedExposure,
    barrier: matchedBarrier,
    controlFailure: matchedControlFailure,
    sifPrecursor: matchedPrecursor,
    iogpRule: matchedRule,
    potentialConsequence: potentialConsequence,
    riskContribution: [
      { 
        factor: `${matchedHazard} Energy Magnitude`, 
        percentage: 35, 
        description: 'Physical energy or elevation magnitude exceeds biological tolerance thresholds.' 
      },
      { 
        factor: `${matchedBarrier} Breakdown`, 
        percentage: 30, 
        description: failureMode 
      },
      { 
        factor: 'Personnel Line-of-Fire Envelope', 
        percentage: 20, 
        description: `Workers positioned directly in ${matchedExposure}.` 
      },
      { 
        factor: 'Supervisory & Independent Sign-off Gap', 
        percentage: 15, 
        description: 'Verification step omitted or authorized without on-site physical walkdown.' 
      }
    ]
  };

  // 11. Action Intelligence (Derived from the actual report)
  let actionDetectedIssue = '';
  let correctiveActionsList: string[] = [];
  let actionResponsibleRole = 'Site HSE Officer & Operations Supervisor';
  let actionPriority: ActionPlan['priority'] = 'Immediate';

  if (matchedHazard === 'Fall from Height' || matchedActivity === 'Work at Height') {
    actionDetectedIssue = 'Work-at-Height Fall Risk with Tie-Off / Supervision Gap';
    correctiveActionsList = [
      'Immediately halt elevated operations and stand down work at height.',
      'Audit and provide certified 100% dual-lanyard fall protection harnesses and inertia reels.',
      'Inspect physical integrity of derrick platforms, gratings, and 5,000 lbs anchorage points.',
      'Conduct emergency safety stand-down briefing on IOGP Work at Height Rule.',
      'Require mandatory dedicated supervisor presence before any elevated work restarts.'
    ];
    actionResponsibleRole = 'Rig Superintendent & Site HSE Lead';
    actionPriority = 'Immediate';
  } else if (matchedHazard === 'Hydrocarbon Gas Release' || matchedHazard === 'Hydrogen Sulfide (H2S)') {
    actionDetectedIssue = 'Hydrocarbon Gas Release / Gas Detection System Degradation';
    correctiveActionsList = [
      'Immediately isolate process line, secure perimeter, and restrict ignition sources.',
      'Deploy calibrated portable multi-gas detectors to delineate LEL boundaries and gas dispersion.',
      'Investigate source of gas seepage and depressurize affected manifold section.',
      'Repair, recalibrate, and bench-test fixed and portable gas detection instrumentation.',
      'Conduct 4-gas atmospheric survey and obtain dual HSE sign-off before permitting restart.'
    ];
    actionResponsibleRole = 'Area Production In-Charge & Instrumentation Lead';
    actionPriority = 'Immediate';
  } else if (matchedHazard === 'High Pressure Fluid' || matchedPrecursor === 'High-Pressure Blowout / Ejection') {
    actionDetectedIssue = 'High-Pressure Fluid Integrity Challenge / Relief Valve Malfunction';
    correctiveActionsList = [
      'Halt high-pressure pumping, isolate fluid discharge manifold, and vent stored pressure.',
      'Conduct ultrasonic thickness testing and NDT casing crack inspection on pump casing.',
      'Remove, bench-test, and recertify pressure relief valve (PSV) to specified burst rating.',
      'Clear preventive maintenance deferral tickets and replace worn fluid end liners and valves.',
      'Verify zero-energy state with calibrated gauge before recommissioning pump unit.'
    ];
    actionResponsibleRole = 'Chief Maintenance Engineer & Production In-Charge';
    actionPriority = 'Immediate';
  } else if (matchedActivity === 'Confined Space Entry') {
    actionDetectedIssue = 'Confined Space Atmospheric Testing Omission';
    correctiveActionsList = [
      'Cease vessel entry immediately; evacuate personnel from separator interior.',
      'Conduct stratified 4-gas testing (O2, LEL, H2S, CO) at top, middle, and bottom levels.',
      'Install forced pneumatic air ventilation eductor and verify safe oxygen levels (>19.5%).',
      'Assign dedicated, trained sentry equipped with emergency SCBA at vessel manhole.',
      'Re-issue Confined Space Entry Certificate with on-site gas tester signature.'
    ];
    actionResponsibleRole = 'Installation Manager & Certified Gas Tester';
    actionPriority = 'Immediate';
  } else {
    // Stored Energy / Energy Isolation
    actionDetectedIssue = 'Stored Residual Energy under Incomplete Isolation Verification';
    correctiveActionsList = [
      'Halt mechanical unbolting and secure danger zone around pressurized valve assembly.',
      'Open flare bleed-off valve to completely vent residual trapped volume to zero pressure.',
      'Install positive physical blind spade with dual lockout/tagout (LOTO) car-seals.',
      'Mandate four-eyes independent verification signature on Zero-Energy Isolation Permit.',
      'Conduct crew toolbox talk on line-of-fire avoidance during wellhead interventions.'
    ];
    actionResponsibleRole = 'Field Maintenance Superintendent & Rig Toolpusher';
    actionPriority = 'Immediate';
  }

  const actionPlan: ActionPlan = {
    detectedIssue: actionDetectedIssue,
    reasonEvidence: evidence[0] || 'Unsafe operational hazard documented in field observation',
    correctiveActions: correctiveActionsList,
    priority: actionPriority,
    responsibleRole: actionResponsibleRole,
    status: 'OPEN'
  };

  // 12. Prevent Recurrence & Recurrence Comparison
  // Compare against historical records
  let isRecurring = false;
  let recurrenceReason = 'No confirmed recurrence found in available data.';
  let similarPrecursorsCount = 0;
  const similarHistoricalReports: PreventRecurrenceData['similarHistoricalReports'] = [];

  if (historicalReports && historicalReports.length > 0) {
    historicalReports.forEach(hr => {
      let isMatch = false;
      let reason = '';

      if (hr.sifPrecursor === matchedPrecursor) {
        isMatch = true;
        reason = `Same SIF Precursor (${matchedPrecursor})`;
      } else if (hr.barrier === matchedBarrier && hr.hazard === matchedHazard) {
        isMatch = true;
        reason = `Identical Barrier (${matchedBarrier}) and Hazard (${matchedHazard})`;
      } else if (hr.activity === matchedActivity && hr.hazard === matchedHazard) {
        isMatch = true;
        reason = `Similar Operational Task (${matchedActivity}) and Energy Source (${matchedHazard})`;
      }

      if (isMatch && similarHistoricalReports.length < 4) {
        similarHistoricalReports.push({
          id: hr.id,
          asset: hr.asset,
          similarityReason: reason,
          date: hr.date,
          sifPrecursor: hr.sifPrecursor
        });
      }
    });

    if (similarHistoricalReports.length > 0) {
      isRecurring = true;
      similarPrecursorsCount = similarHistoricalReports.length;
      recurrenceReason = `Potential recurring precursor detected: Similar ${similarHistoricalReports[0].similarityReason} previously documented on ${similarHistoricalReports[0].asset} (${similarHistoricalReports[0].date}).`;
    }
  }

  const preventRecurrence: PreventRecurrenceData = {
    isRecurring,
    recurrenceReason,
    similarPrecursorsCount,
    similarHistoricalReports,
    closureTracker: {
      status: 'OPEN',
      assignedRole: actionResponsibleRole,
      priority: actionPriority,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verificationState: 'Pending Verification',
      actionsTaken: []
    }
  };

  // Contradictions and Missing Evidence
  const contradictions: ContradictionItem[] = [];
  if (/permit\s+(?:issued|approved|signed)/i.test(text) && /without|omitted|no\s+gas|not\s+verified|absent/i.test(text)) {
    contradictions.push({
      id: 'CONT-01',
      statementA: 'Permit-to-work formally documented as issued or authorized.',
      statementB: 'Mandatory field verification check or supervision recorded as absent/omitted.',
      analysis: 'Procedural disconnect: Administrative clearance granted prior to physical control verification.',
      riskImplication: 'Exposes frontline workers to unmonitored line-of-fire under false sense of authorization.'
    });
  }

  const missingEvidence: MissingEvidenceItem[] = [];
  let completenessScore = 88;
  if (!/gauge|zero|bleed|depressuriz|anchor|certif|test\s+log/i.test(text)) {
    missingEvidence.push({
      id: 'ME-01',
      category: 'Physical Control Verification',
      criticalItem: 'Instrumented Verification Log / Witnessed Sign-Off',
      whyCritical: 'Without instrumented verification logs, field control effectiveness remains unconfirmed.',
      severity: 'High',
      suggestedPrompt: 'Did the maintenance lead verify zero-energy or test readings prior to commencement?'
    });
    completenessScore -= 18;
  }

  // Generate ID and synthesis metadata
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const reportId = `OIL-REP-${new Date().getFullYear()}-${randomSuffix}`;
  const currentDate = new Date().toISOString().split('T')[0];

  const assetName = existingMetadata?.asset || 
    (matchedActivity === 'Work at Height' ? 'Jorhat Exploration Rig 4' :
     matchedActivity === 'Workover' ? 'Workover Rig WOR-07' :
     matchedActivity === 'Pipeline Maintenance' ? 'Crude Pipeline Trunk-A' :
     'Duliajan Production Station');

  const installationName = existingMetadata?.installation || 
    (matchedActivity === 'Work at Height' ? 'Jorhat Exploration Rig 4' :
     'Duliajan Central Field');

  return {
    id: reportId,
    date: currentDate,
    installation: installationName,
    asset: assetName,
    activity: matchedActivity,
    reportType: (existingMetadata?.reportType as any) || (riskScore > 75 ? 'Incident Precursor' : 'Unsafe Condition'),
    narrative: text,
    hazard: matchedHazard,
    exposure: matchedExposure,
    barrier: matchedBarrier,
    controlFailure: matchedControlFailure,
    sifPrecursor: matchedPrecursor,
    iogpRule: matchedRule,
    severity: severity,
    sifPotential: sifPotential,
    riskScore: riskScore,
    confidence: confidence,
    evidence: evidence,
    missingEvidence: missingEvidence,
    completenessScore: completenessScore,
    contradictions: contradictions,
    dna: dna,
    recommendedIntervention: {
      primary: correctiveActionsList[0],
      secondary: correctiveActionsList[1] || correctiveActionsList[0],
      verificationStep: `HSE and Area In-Charge dual witness test for ${matchedBarrier}.`,
      responsibleRole: actionResponsibleRole,
      priority: actionPriority === 'Immediate' ? 'Immediate' : 'High',
      barrierReinforced: matchedBarrier
    },
    validation: {
      status: 'AI Suggested'
    },
    sourceType: 'uploaded',
    actionPlan,
    preventRecurrence,
    weakSignals,
    sifPathway,
    barrierDegradationDetails
  };
}

/**
 * Enriches any existing report with Action Intelligence, Prevent Recurrence,
 * SIF Pathway, and Weak Signals if they are missing.
 */
export function enrichReportWithIntelligence(report: SafetyReport, allReports?: SafetyReport[]): SafetyReport {
  if (report.actionPlan && report.preventRecurrence && report.sifPathway && report.weakSignals && report.barrierDegradationDetails) {
    return report;
  }

  // Re-run lightweight analyzer to generate missing action & intelligence dimensions
  const analyzed = analyzeReportNarrative(
    report.narrative, 
    { installation: report.installation, asset: report.asset, reportType: report.reportType },
    (allReports || []).filter(r => r.id !== report.id)
  );

  return {
    ...report,
    actionPlan: report.actionPlan || analyzed.actionPlan,
    preventRecurrence: report.preventRecurrence || analyzed.preventRecurrence,
    weakSignals: report.weakSignals || analyzed.weakSignals,
    sifPathway: report.sifPathway || analyzed.sifPathway,
    barrierDegradationDetails: report.barrierDegradationDetails || analyzed.barrierDegradationDetails
  };
}
