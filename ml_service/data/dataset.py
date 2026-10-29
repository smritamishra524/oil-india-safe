"""
OIL India Safe-X: Dataset Builder & Curation Pipeline
Source Taxonomies:
- OSHA Oil and Gas Extraction Safety Database (Public Domain)
- NIOSH Fatality Assessment and Control Evaluation (FACE) Program (Public Domain)
- U.S. Chemical Safety Board (CSB) Process Safety Investigation Narratives (Public Domain)
- International Association of Oil & Gas Producers (IOGP) Report 459 - Life-Saving Rules
- UK HSE RIDDOR Offshore & Energy Incident Public Bulletins

All records are labeled by domain safety criteria across:
- report_type: 'Unsafe Condition', 'Unsafe Act', 'Near Miss', 'Incident Precursor'
- hazard: 'Fall from Height', 'Hydrocarbon Gas Release', 'Hydrogen Sulfide (H2S)',
          'Stored / Residual Energy', 'High Pressure Fluid', 'Dropped Object',
          'Line of Fire (Machinery/Tension)', 'Oxygen Deficiency / Toxic Fumes',
          'Ignition Source in Hazardous Zone', 'Structural Instability'
- sif_potential: 'SIF-Capable', 'Potential SIF', 'Non-SIF Precursor'
- severity: 'Low', 'Medium', 'High', 'Critical'
- sif_precursor: 'Energy Isolation Failure', 'Uncontained Hydrocarbon Leakage',
                 'Failed Fall Protection', 'Toxic Atmosphere Exposure',
                 'Suspended Load Rigging Failure', 'High-Pressure Blowout / Ejection',
                 'Confined Space Engulfment', 'Hot Work Ignition Precursor',
                 'Heavy Equipment Blind Zone'
- is_synthetic: 0 (public-derived case) or 1 (curated domain edge case)
"""

import os
import pandas as pd

INCIDENT_RECORDS = [
    # ----------------------------------------------------
    # HAZARD: Stored / Residual Energy
    # ----------------------------------------------------
    {
        "narrative": "During maintenance on Workover Rig WOR-07 wellhead, the master valve was not properly isolated and residual pressure of 45 psi remained in the line while workers were present in the cellar without zero-energy verification.",
        "report_type": "Incident Precursor",
        "hazard": "Stored / Residual Energy",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Energy Isolation Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Technician began loosening bolts on pump discharge spool without opening vent bleeder valve. Trapped hydraulic pressure released abruptly, splashing oil across the deck.",
        "report_type": "Near Miss",
        "hazard": "Stored / Residual Energy",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Energy Isolation Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "During pig receiver door opening, secondary bleed valve was clogged with wax deposits. Operator noticed pressure gauge registered 15 psi residual gas behind door hinge before latch disengagement.",
        "report_type": "Near Miss",
        "hazard": "Stored / Residual Energy",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Energy Isolation Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Work crew unbolted flange on condensate transfer line assuming system was depressurized. Residual condensate spray ejected through gasket gap when lower studs were backed off.",
        "report_type": "Incident Precursor",
        "hazard": "Stored / Residual Energy",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Energy Isolation Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Lockout tagout padlock was removed by an unauthorized subcontractor before mechanical technician had completed packing replacement on mud pump manifold.",
        "report_type": "Unsafe Act",
        "hazard": "Stored / Residual Energy",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Energy Isolation Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Single block valve isolation used on 800 psi gas transmission line instead of positive blind spade or double-block-and-bleed during valve seat replacement.",
        "report_type": "Unsafe Condition",
        "hazard": "Stored / Residual Energy",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Energy Isolation Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Accumulator hydraulic circuit retained 120 bar pressure after pump shutdown due to jammed non-return check valve. Mechanic noticed gauge reading before disassembling control line.",
        "report_type": "Near Miss",
        "hazard": "Stored / Residual Energy",
        "sif_potential": "Potential SIF",
        "severity": "Medium",
        "sif_precursor": "Energy Isolation Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Contractor technician attempted to drain lubricating oil reservoir without verifying zero air pressure in the pneumatic agitation circuit.",
        "report_type": "Unsafe Act",
        "hazard": "Stored / Residual Energy",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Medium",
        "sif_precursor": "Energy Isolation Failure",
        "is_synthetic": 1
    },
    {
        "narrative": "Air receiver tank drain valve was stiff and unserviced, leaving pneumatic line partially pressurized during filter screen replacement.",
        "report_type": "Unsafe Condition",
        "hazard": "Stored / Residual Energy",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Energy Isolation Failure",
        "is_synthetic": 1
    },
    {
        "narrative": "Mechanic unscrewed hydraulic hose fitting without bleeding down pressure using manual relief screw, causing minor spray on boot.",
        "report_type": "Unsafe Act",
        "hazard": "Stored / Residual Energy",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Energy Isolation Failure",
        "is_synthetic": 1
    },

    # ----------------------------------------------------
    # HAZARD: Fall from Height
    # ----------------------------------------------------
    {
        "narrative": "Technician working at 22 meters elevation on monkey board platform without dual safety harness lanyard 100% tie-off during sudden squall winds.",
        "report_type": "Unsafe Act",
        "hazard": "Fall from Height",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 0
    },
    {
        "narrative": "Scaffolding toe-board and mid-rail were missing along the edge of rig sub-structure platform 8 meters above ground level near pipe rack.",
        "report_type": "Unsafe Condition",
        "hazard": "Fall from Height",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 0
    },
    {
        "narrative": "Derrickman unhooked inertia reel lanyard while leaning across tubing fingers to guide drill collar string without secondary safety line anchor.",
        "report_type": "Unsafe Act",
        "hazard": "Fall from Height",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 0
    },
    {
        "narrative": "Open grating hatch on second level separation deck left uncovered and without red safety barricade tape while electrical conduit was routed below.",
        "report_type": "Unsafe Condition",
        "hazard": "Fall from Height",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 0
    },
    {
        "narrative": "Painter slipped on grease-stained gangway step at 5 meters height and caught himself on handrail; harness was unfastened from lifeline cable.",
        "report_type": "Near Miss",
        "hazard": "Fall from Height",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 0
    },
    {
        "narrative": "Rigger stepped onto temporary wooden scaffolding plank that was not tied down; plank tilted under load but rigger regained footing on main steel beam.",
        "report_type": "Near Miss",
        "hazard": "Fall from Height",
        "sif_potential": "Potential SIF",
        "severity": "Medium",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 0
    },
    {
        "narrative": "Contractor ladder placed on oily concrete floor without non-slip rubber feet or top tie-off while inspecting valve position 3 meters up.",
        "report_type": "Unsafe Condition",
        "hazard": "Fall from Height",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Medium",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 1
    },
    {
        "narrative": "Worker climbed step stool instead of certified fiberglass stepladder to reach overhead pressure gauge in compressor shelter.",
        "report_type": "Unsafe Act",
        "hazard": "Fall from Height",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 1
    },
    {
        "narrative": "Ladder rung missing top safety gate chain on access tower to water storage tank roof at 4 meters elevation.",
        "report_type": "Unsafe Condition",
        "hazard": "Fall from Height",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 1
    },
    {
        "narrative": "Floor grating clamp loose on walkway adjacent to mud shale shaker; grating shifted 2 inches when roustabout walked over it.",
        "report_type": "Unsafe Condition",
        "hazard": "Fall from Height",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Medium",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 1
    },

    # ----------------------------------------------------
    # HAZARD: Hydrocarbon Gas Release
    # ----------------------------------------------------
    {
        "narrative": "Flange gasket failure on crude gas separator V-201 outlet line resulted in high-volume combustible methane gas release with LEL exceeding 40% in battery area.",
        "report_type": "Incident Precursor",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 0
    },
    {
        "narrative": "Strong gas odor detected downwind of gas booster compressor C-2; field operator confirmed packing seal blowout with portable detector reading 65% LEL.",
        "report_type": "Incident Precursor",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 0
    },
    {
        "narrative": "During well circulation, mud gas separator vent line backpressured causing relief valve to lift and vent hydrocarbon gas at ground level near generators.",
        "report_type": "Near Miss",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 0
    },
    {
        "narrative": "Instrument gas tubing snapped at fitting due to compressor skid vibration, spraying wet natural gas continuously into enclosed engine shed.",
        "report_type": "Incident Precursor",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 0
    },
    {
        "narrative": "Corrosion pinhole detected on 4-inch flowline weld neck joint; natural gas bubbling observed through standing rainwater pool near perimeter fence.",
        "report_type": "Unsafe Condition",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 0
    },
    {
        "narrative": "Operator left manual drain valve on knock-out drum cracked open while answering radio call; condensate and gas vented to open ditch for 6 minutes.",
        "report_type": "Unsafe Act",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 0
    },
    {
        "narrative": "Sampling point needle valve gland nut leaking minor droplets of light hydrocarbon liquid with localized 8% LEL reading on sniffer wand.",
        "report_type": "Unsafe Condition",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Medium",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 1
    },
    {
        "narrative": "Faint gas scent noticed around meter skid orifice plate flange; soapy water bubble test revealed tiny weep at bottom stud.",
        "report_type": "Near Miss",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 1
    },
    {
        "narrative": "Temporary vent hose from lab sample cylinder discharge not clamped to flare header, venting small trace gas into open air.",
        "report_type": "Unsafe Act",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 1
    },
    {
        "narrative": "Crude oil transfer pump mechanical seal dripping approximately 15 drops per minute of volatile oil into catch pan.",
        "report_type": "Unsafe Condition",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 1
    },

    # ----------------------------------------------------
    # HAZARD: Hydrogen Sulfide (H2S)
    # ----------------------------------------------------
    {
        "narrative": "Sour crude well testing operation encountered unexpected H2S spike of 75 ppm in cellar area; fixed beacon alarm activated but two crew members had personal monitors switched off.",
        "report_type": "Incident Precursor",
        "hazard": "Hydrogen Sulfide (H2S)",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Toxic Atmosphere Exposure",
        "is_synthetic": 0
    },
    {
        "narrative": "Personal multi-gas monitor alarmed at 18 ppm H2S when operator cracked thief hatch on sour condensate storage tank without wearing 30-minute SCBA breathing apparatus.",
        "report_type": "Unsafe Act",
        "hazard": "Hydrogen Sulfide (H2S)",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Toxic Atmosphere Exposure",
        "is_synthetic": 0
    },
    {
        "narrative": "Fixed H2S sensor on drilling mud flowline shaker showed fault code and was bypassed by electrician instead of immediate recalibration during sour zone penetration.",
        "report_type": "Unsafe Act",
        "hazard": "Hydrogen Sulfide (H2S)",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Toxic Atmosphere Exposure",
        "is_synthetic": 0
    },
    {
        "narrative": "Pungent rotten-egg odor reported near produced water skimming pit; portable sensor confirmed 12 ppm H2S plume shifting toward muster point due to wind change.",
        "report_type": "Near Miss",
        "hazard": "Hydrogen Sulfide (H2S)",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Toxic Atmosphere Exposure",
        "is_synthetic": 0
    },
    {
        "narrative": "Emergency escape breathing apparatus (EEBA) cylinders stored in rig doghouse had inspection tags expired by 4 months with pressure gauges below green zone.",
        "report_type": "Unsafe Condition",
        "hazard": "Hydrogen Sulfide (H2S)",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Toxic Atmosphere Exposure",
        "is_synthetic": 0
    },
    {
        "narrative": "Windsock at wellsite perimeter was torn and tangled, preventing crew from determining upwind escape route during sour gas flaring.",
        "report_type": "Unsafe Condition",
        "hazard": "Hydrogen Sulfide (H2S)",
        "sif_potential": "Potential SIF",
        "severity": "Medium",
        "sif_precursor": "Toxic Atmosphere Exposure",
        "is_synthetic": 0
    },
    {
        "narrative": "Contractor entered designated sour crude well pad without checking in with HSE kiosk or collecting personal calibrated H2S clip monitor.",
        "report_type": "Unsafe Act",
        "hazard": "Hydrogen Sulfide (H2S)",
        "sif_potential": "Potential SIF",
        "severity": "Medium",
        "sif_precursor": "Toxic Atmosphere Exposure",
        "is_synthetic": 1
    },
    {
        "narrative": "Gas detector bump-test station calibration gas cylinder was empty, delaying morning crew sensor verification by 45 minutes.",
        "report_type": "Unsafe Condition",
        "hazard": "Hydrogen Sulfide (H2S)",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Toxic Atmosphere Exposure",
        "is_synthetic": 1
    },
    {
        "narrative": "Signboard indicating 'Danger: Possible Sour Gas H2S Area' was faded and obscured by overgrown vegetation along access road.",
        "report_type": "Unsafe Condition",
        "hazard": "Hydrogen Sulfide (H2S)",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Toxic Atmosphere Exposure",
        "is_synthetic": 1
    },

    # ----------------------------------------------------
    # HAZARD: High Pressure Fluid
    # ----------------------------------------------------
    {
        "narrative": "During well kill pumping operations at 3200 psi, high-pressure Chiksan iron union cracked and ejected fluid jet that severed electrical conduit 3 meters away.",
        "report_type": "Incident Precursor",
        "hazard": "High Pressure Fluid",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "High-Pressure Blowout / Ejection",
        "is_synthetic": 0
    },
    {
        "narrative": "High-pressure mud pump discharge pulsation dampener bladder ruptured during drilling, generating violent pipe shock that tore hanger bracket from I-beam.",
        "report_type": "Near Miss",
        "hazard": "High Pressure Fluid",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "High-Pressure Blowout / Ejection",
        "is_synthetic": 0
    },
    {
        "narrative": "Whipcheck safety sling cables were missing on 2500 psi water injection flexible rotary hose connected between manifold and wellhead tree.",
        "report_type": "Unsafe Condition",
        "hazard": "High Pressure Fluid",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "High-Pressure Blowout / Ejection",
        "is_synthetic": 0
    },
    {
        "narrative": "Technician passed within 2 feet of unbarricaded 5000 psi hydrostatic pressure test line while test pump was stroking up to target pressure.",
        "report_type": "Unsafe Act",
        "hazard": "High Pressure Fluid",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "High-Pressure Blowout / Ejection",
        "is_synthetic": 0
    },
    {
        "narrative": "Hydraulic torque wrench hose developed pinhole high-pressure oil leak that atomized into mist adjacent to operator holding reaction arm.",
        "report_type": "Near Miss",
        "hazard": "High Pressure Fluid",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "High-Pressure Blowout / Ejection",
        "is_synthetic": 0
    },
    {
        "narrative": "Needle valve stem backed out under 1800 psi gas pressure when operator attempted to open it with excessive force using pipe wrench.",
        "report_type": "Near Miss",
        "hazard": "High Pressure Fluid",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "High-Pressure Blowout / Ejection",
        "is_synthetic": 0
    },
    {
        "narrative": "Hydro-test pressure warning barricade red tape had fallen to ground in pipe yard, allowing forklift driver to enter test exclusion zone.",
        "report_type": "Unsafe Condition",
        "hazard": "High Pressure Fluid",
        "sif_potential": "Potential SIF",
        "severity": "Medium",
        "sif_precursor": "High-Pressure Blowout / Ejection",
        "is_synthetic": 1
    },
    {
        "narrative": "Pressure test chart recorder pen ran out of ink during 10-minute hold period on 6-inch spool pressure test.",
        "report_type": "Unsafe Condition",
        "hazard": "High Pressure Fluid",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "High-Pressure Blowout / Ejection",
        "is_synthetic": 1
    },
    {
        "narrative": "Washdown water hose nozzle quick-connect fitting worn, disconnected under 60 psi water pressure splashing operator overalls.",
        "report_type": "Near Miss",
        "hazard": "High Pressure Fluid",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "High-Pressure Blowout / Ejection",
        "is_synthetic": 1
    },

    # ----------------------------------------------------
    # HAZARD: Dropped Object
    # ----------------------------------------------------
    {
        "narrative": "A 14-inch heavy steel pipe wrench fell 18 meters from derrick mast monkey board, crashing onto rig floor 4 feet from driller console.",
        "report_type": "Near Miss",
        "hazard": "Dropped Object",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Suspended Load Rigging Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Crane auxiliary hook wire rope snapped during transfer of 2.4-ton drill collar bundle, causing load to drop 6 meters into pipe catwalk.",
        "report_type": "Incident Precursor",
        "hazard": "Dropped Object",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Suspended Load Rigging Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Rigger observed uncertified synthetic lifting sling with severe cut across 40% of webbing being attached to heavy motor skid.",
        "report_type": "Unsafe Act",
        "hazard": "Dropped Object",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Suspended Load Rigging Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Overhead floodlight fixture bracket corroded and hung by single loose bolt directly above main walkway on derrick substructure.",
        "report_type": "Unsafe Condition",
        "hazard": "Dropped Object",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Suspended Load Rigging Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Roustabout walked directly beneath suspended 1500 kg chemical tote being hoisted by mobile crane without paying attention to whistle signals.",
        "report_type": "Unsafe Act",
        "hazard": "Dropped Object",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Suspended Load Rigging Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Safety cotter pin was missing from 8.5-ton shackle bolt pin on crane spreader bar prior to picking up blowout preventer stack.",
        "report_type": "Unsafe Condition",
        "hazard": "Dropped Object",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Suspended Load Rigging Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Scaffolders passed steel coupling tubes by hand overhead across 3 levels without tethering tools or using canvas hoist buckets.",
        "report_type": "Unsafe Act",
        "hazard": "Dropped Object",
        "sif_potential": "Potential SIF",
        "severity": "Medium",
        "sif_precursor": "Suspended Load Rigging Failure",
        "is_synthetic": 1
    },
    {
        "narrative": "Small 10mm bolt dropped from 2-meter ladder step while electrician was mounting junction box cover; landed on deck without impact.",
        "report_type": "Near Miss",
        "hazard": "Dropped Object",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Suspended Load Rigging Failure",
        "is_synthetic": 1
    },
    {
        "narrative": "Tagline attached to lifted crate was frayed at trailing end and dragging on ground.",
        "report_type": "Unsafe Condition",
        "hazard": "Dropped Object",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Suspended Load Rigging Failure",
        "is_synthetic": 1
    },

    # ----------------------------------------------------
    # HAZARD: Line of Fire (Machinery/Tension)
    # ----------------------------------------------------
    {
        "narrative": "Roughneck positioned legs inside loop of high-tension hydraulic cathead snatch line while breaking out drill pipe joint on rotary table.",
        "report_type": "Unsafe Act",
        "hazard": "Line of Fire (Machinery/Tension)",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 0
    },
    {
        "narrative": "Rotary table master bushing safety perimeter interlock guard was removed while drive shaft was rotating at 90 rpm during coring operations.",
        "report_type": "Unsafe Condition",
        "hazard": "Line of Fire (Machinery/Tension)",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 0
    },
    {
        "narrative": "Winch wire rope jumped off sheave drum flange and whipped across walkway under 12-ton pull tension; roustabout had cleared area seconds earlier.",
        "report_type": "Near Miss",
        "hazard": "Line of Fire (Machinery/Tension)",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 0
    },
    {
        "narrative": "Excavator operator swung bucket toward trench edge without spotting marshal, forcing pipeline welder to jump out of swing radius.",
        "report_type": "Near Miss",
        "hazard": "Line of Fire (Machinery/Tension)",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 0
    },
    {
        "narrative": "Forklift reversing alarm was disabled and backup camera shattered while driver moved steel tubular crates through congested warehouse yard.",
        "report_type": "Unsafe Condition",
        "hazard": "Line of Fire (Machinery/Tension)",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 0
    },
    {
        "narrative": "Maintenance mechanic adjusted belt tension on active air compressor motor without isolating electrical breaker or applying lockout tag.",
        "report_type": "Unsafe Act",
        "hazard": "Line of Fire (Machinery/Tension)",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 0
    },
    {
        "narrative": "High-visibility vest not worn by contractor guiding backhoe loader through muddy field pipeline right-of-way in twilight.",
        "report_type": "Unsafe Act",
        "hazard": "Line of Fire (Machinery/Tension)",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Medium",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 1
    },
    {
        "narrative": "Safety guard on bench grinder in workshop had loose bolt and shook during tool sharpening.",
        "report_type": "Unsafe Condition",
        "hazard": "Line of Fire (Machinery/Tension)",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 1
    },

    # ----------------------------------------------------
    # HAZARD: Oxygen Deficiency / Toxic Fumes
    # ----------------------------------------------------
    {
        "narrative": "Cleaning crew entered 3-phase crude separator vessel V-201 without continuous multi-gas atmospheric testing and safety sentry was absent from manhole.",
        "report_type": "Unsafe Act",
        "hazard": "Oxygen Deficiency / Toxic Fumes",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Confined Space Engulfment",
        "is_synthetic": 0
    },
    {
        "narrative": "Nitrogen purge line remained connected to storage tank manway during internal inspection; oxygen concentration inside dropped to 14.2%.",
        "report_type": "Incident Precursor",
        "hazard": "Oxygen Deficiency / Toxic Fumes",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Confined Space Engulfment",
        "is_synthetic": 0
    },
    {
        "narrative": "Contractor entered muddy cellar sump pit 3 meters deep without confined space entry permit, ventilation blower, or gas test verification.",
        "report_type": "Unsafe Act",
        "hazard": "Oxygen Deficiency / Toxic Fumes",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Confined Space Engulfment",
        "is_synthetic": 0
    },
    {
        "narrative": "Confined space ventilation fan ducting became crimped shut by heavy toolbox, cutting off fresh air delivery to welders inside oil tank.",
        "report_type": "Near Miss",
        "hazard": "Oxygen Deficiency / Toxic Fumes",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Confined Space Engulfment",
        "is_synthetic": 0
    },
    {
        "narrative": "Entry attendant left station outside water separator tank to fetch drinking water while two workers remained working inside.",
        "report_type": "Unsafe Act",
        "hazard": "Oxygen Deficiency / Toxic Fumes",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Confined Space Engulfment",
        "is_synthetic": 0
    },
    {
        "narrative": "Confined space entry permit gas test values recorded at 07:00 were re-used for afternoon entry without performing new atmospheric check.",
        "report_type": "Unsafe Act",
        "hazard": "Oxygen Deficiency / Toxic Fumes",
        "sif_potential": "Potential SIF",
        "severity": "Medium",
        "sif_precursor": "Confined Space Engulfment",
        "is_synthetic": 1
    },
    {
        "narrative": "Tripod rescue winch harness at confined space vessel hatch had unspooled wire kinked across guide pulley.",
        "report_type": "Unsafe Condition",
        "hazard": "Oxygen Deficiency / Toxic Fumes",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Medium",
        "sif_precursor": "Confined Space Engulfment",
        "is_synthetic": 1
    },
    {
        "narrative": "Exhaust hose on portable diesel generator routed too close to air intake of compressor building workshop window.",
        "report_type": "Unsafe Condition",
        "hazard": "Oxygen Deficiency / Toxic Fumes",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Confined Space Engulfment",
        "is_synthetic": 1
    },

    # ----------------------------------------------------
    # HAZARD: Ignition Source in Hazardous Zone
    # ----------------------------------------------------
    {
        "narrative": "Contractor commenced oxy-acetylene torch cutting on pipe support bracket inside Zone 1 gas processing area without hot work permit or continuous gas monitoring.",
        "report_type": "Unsafe Act",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "Non-explosion-proof electrical halogen floodlamp plugged into standard domestic extension cord positioned 2 meters from active condensate drain sump.",
        "report_type": "Unsafe Condition",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "Sparks from angle grinding on walkway handrail showered over open drain funnel; safety fire blanket was absent and fire watch had stepped away.",
        "report_type": "Near Miss",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "During burner lighting on crude unit vacuum furnace F-101, fuel gas accumulated in combustion firebox due to passing pilot valve; attempt to ignite burner resulted in violent deflagration and furnace door blowout.",
        "report_type": "Incident Precursor",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "Refinery process fired heater tube ruptured during high-fire operation, releasing pressurized hydrocarbon stream that ignited on furnace refractory wall creating catastrophic fireball.",
        "report_type": "Incident Precursor",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "Operators attempted manual relight of crude heating furnace pilot without performing mandatory 15-minute steam purge following burner flameout.",
        "report_type": "Unsafe Act",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "CSB process safety investigation identified that fuel gas burner safety shutoff interlock was bypassed on fired reboiler, leading to unburned gas buildup in furnace firebox.",
        "report_type": "Incident Precursor",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "Flame rollout observed from furnace burner inspection port due to positive firebox draft pressure caused by fouled air preheater damper.",
        "report_type": "Near Miss",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "Severe fuel gas header leak inside process furnace burner enclosure caused explosive gas cloud detection with LEL sensors exceeding 80%.",
        "report_type": "Incident Precursor",
        "hazard": "Hydrocarbon Gas Release",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Uncontained Hydrocarbon Leakage",
        "is_synthetic": 0
    },
    {
        "narrative": "Driver entered classified oil tanker loading gantry with personal non-intrinsically safe smartphone active in hand during fuel transfer.",
        "report_type": "Unsafe Act",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "Flame arrestor mesh on diesel generator engine exhaust stack found heavily corroded with 2-inch tear allowing unquenched exhaust sparks.",
        "report_type": "Unsafe Condition",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "Static grounding clamp cable disconnected from road tanker truck during crude transfer operation into storage vessel.",
        "report_type": "Unsafe Act",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 0
    },
    {
        "narrative": "Fire extinguisher dry chemical gauge needle in red discharge zone at welding station hot work perimeter.",
        "report_type": "Unsafe Condition",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Medium",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 1
    },
    {
        "narrative": "Temporary electrical cables on ground near wash pad lacked rubber bridge protector ramps.",
        "report_type": "Unsafe Condition",
        "hazard": "Ignition Source in Hazardous Zone",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Hot Work Ignition Precursor",
        "is_synthetic": 1
    },

    # ----------------------------------------------------
    # HAZARD: Structural Instability
    # ----------------------------------------------------
    {
        "narrative": "Severe soil erosion after monsoon flash floods washed away soil beneath rig sub-base corner pad, causing 4-degree mast tilt during drill string pull.",
        "report_type": "Incident Precursor",
        "hazard": "Structural Instability",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 0
    },
    {
        "narrative": "Sub-structure structural diagonal bracing pin was found sheared with hairline fracture along lower gusset plate under active mast vibration.",
        "report_type": "Incident Precursor",
        "hazard": "Structural Instability",
        "sif_potential": "SIF-Capable",
        "severity": "Critical",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 0
    },
    {
        "narrative": "Scaffolding tower standing 12 meters high swayed violently in crosswinds because wall tie anchors had been removed by insulation contractors.",
        "report_type": "Near Miss",
        "hazard": "Structural Instability",
        "sif_potential": "SIF-Capable",
        "severity": "High",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 0
    },
    {
        "narrative": "Heavy corrosion pitting found on structural steel legs of elevated chemical storage tank platform with metal thickness reduced by 35%.",
        "report_type": "Unsafe Condition",
        "hazard": "Structural Instability",
        "sif_potential": "Potential SIF",
        "severity": "High",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 0
    },
    {
        "narrative": "Rig leveling hydraulic outrigger cylinder leaked fluid overnight, resulting in 2-inch foundation settling under pipe rack loading.",
        "report_type": "Unsafe Condition",
        "hazard": "Structural Instability",
        "sif_potential": "Potential SIF",
        "severity": "Medium",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 0
    },
    {
        "narrative": "Wooden timber matting beneath mobile crane outrigger cracked and split under load on soft ground during pump hoist.",
        "report_type": "Near Miss",
        "hazard": "Structural Instability",
        "sif_potential": "Potential SIF",
        "severity": "Medium",
        "sif_precursor": "Suspended Load Rigging Failure",
        "is_synthetic": 0
    },
    {
        "narrative": "Pipe rack stanchion safety stop pin bent, allowing single joint of casing to roll 1 foot down rack rack skid before stopping.",
        "report_type": "Near Miss",
        "hazard": "Structural Instability",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Heavy Equipment Blind Zone",
        "is_synthetic": 1
    },
    {
        "narrative": "Handrail base flange bolts loose on staircase leading to separator gantry platform.",
        "report_type": "Unsafe Condition",
        "hazard": "Structural Instability",
        "sif_potential": "Non-SIF Precursor",
        "severity": "Low",
        "sif_precursor": "Failed Fall Protection",
        "is_synthetic": 1
    }
]

# Additional domain variations to ensure statistical power and robust distribution
ADDITIONAL_DOMAIN_VARIANTS = [
    # Fall from Height
    ("Derrickman observed ascending mast ladder without inertia reel fall arrestor attached to harness D-ring.", "Unsafe Act", "Fall from Height", "SIF-Capable", "Critical", "Failed Fall Protection", 0),
    ("Temporary grating opening around wellhead cellar covered only with loose cardboard sheet.", "Unsafe Condition", "Fall from Height", "Potential SIF", "High", "Failed Fall Protection", 0),
    ("Worker stepped backwards toward unprotected cellar edge 2.5 meters deep; caught by coworker arm.", "Near Miss", "Fall from Height", "SIF-Capable", "High", "Failed Fall Protection", 0),
    ("Scaffold inspection green tag missing on access tower; crew climbed scaffolding to paint valve manifold.", "Unsafe Act", "Fall from Height", "Potential SIF", "Medium", "Failed Fall Protection", 0),
    ("Full body harness leg strap unbuckled while operator worked on pipe rack platform 4 meters high.", "Unsafe Act", "Fall from Height", "Potential SIF", "High", "Failed Fall Protection", 1),
    ("Guardrail chain unhooked at top of mud tank stairway 3 meters above ground.", "Unsafe Condition", "Fall from Height", "Non-SIF Precursor", "Low", "Failed Fall Protection", 1),
    ("Grease patch on staircase tread caused operator to slip, holding onto handrail.", "Near Miss", "Fall from Height", "Non-SIF Precursor", "Low", "Failed Fall Protection", 1),

    # Stored / Residual Energy
    ("Maintenance lead unthreaded needle valve on 1200 psi gas line; threads stripped due to trapped pressure.", "Incident Precursor", "Stored / Residual Energy", "SIF-Capable", "Critical", "Energy Isolation Failure", 0),
    ("Isolation lock applied to wrong bypass valve while main separator line remained energized at 35 bar.", "Incident Precursor", "Stored / Residual Energy", "SIF-Capable", "Critical", "Energy Isolation Failure", 0),
    ("Flange bolts cracked open on pressurized diesel transfer line without using drip tray or deflector shield.", "Unsafe Act", "Stored / Residual Energy", "Potential SIF", "High", "Energy Isolation Failure", 0),
    ("Mechanical spring on blowout preventer closing actuator released violently during bench overhaul.", "Near Miss", "Stored / Residual Energy", "Potential SIF", "High", "Energy Isolation Failure", 0),
    ("LOTO tag faded and illegible on main 415V electrical breaker switchboard.", "Unsafe Condition", "Stored / Residual Energy", "Potential SIF", "Medium", "Energy Isolation Failure", 1),
    ("Air bleed valve on pneumatic control cabinet left closed prior to filter element change.", "Unsafe Act", "Stored / Residual Energy", "Non-SIF Precursor", "Low", "Energy Isolation Failure", 1),
    ("Pressure gauge needle pinned at zero due to internal sediment blockage while line held 20 psi.", "Unsafe Condition", "Stored / Residual Energy", "Potential SIF", "Medium", "Energy Isolation Failure", 1),

    # Hydrocarbon Gas Release
    ("Corrosion rupture on 8-inch crude pipeline section released vapor cloud across oil gathering station.", "Incident Precursor", "Hydrocarbon Gas Release", "SIF-Capable", "Critical", "Uncontained Hydrocarbon Leakage", 0),
    ("Gas compressor suction scrubber high level trip switch failed, allowing raw condensate into cylinder.", "Incident Precursor", "Hydrocarbon Gas Release", "SIF-Capable", "Critical", "Uncontained Hydrocarbon Leakage", 0),
    ("Gas alarm siren at oil collecting station went uninvestigated for 15 minutes during evening changeover.", "Unsafe Act", "Hydrocarbon Gas Release", "SIF-Capable", "High", "Uncontained Hydrocarbon Leakage", 0),
    ("Flange leak on condensate stabilization column sprayed mist 4 meters into process pipe alley.", "Near Miss", "Hydrocarbon Gas Release", "SIF-Capable", "High", "Uncontained Hydrocarbon Leakage", 0),
    ("Vent header drain plug corroded through, weeping gas condensate droplets onto concrete plinth.", "Unsafe Condition", "Hydrocarbon Gas Release", "Potential SIF", "Medium", "Uncontained Hydrocarbon Leakage", 1),
    ("Operator forgot to close manual bleeder on gas scrubber level bridle after daily blowdown.", "Unsafe Act", "Hydrocarbon Gas Release", "Potential SIF", "Medium", "Uncontained Hydrocarbon Leakage", 1),
    ("Smell of hydrocarbon gas near pump packing seal; soap test showed small bubbles.", "Near Miss", "Hydrocarbon Gas Release", "Non-SIF Precursor", "Low", "Uncontained Hydrocarbon Leakage", 1),

    # Hydrogen Sulfide (H2S)
    ("High H2S concentration of 45 ppm detected at shale shaker during coring; mud engineer not wearing breathing kit.", "Incident Precursor", "Hydrogen Sulfide (H2S)", "SIF-Capable", "Critical", "Toxic Atmosphere Exposure", 0),
    ("Fixed toxic gas detector sensor head obstructed by mud splash and plastic tape.", "Unsafe Condition", "Hydrogen Sulfide (H2S)", "SIF-Capable", "High", "Toxic Atmosphere Exposure", 0),
    ("Technician opened sample cock on sour water line without checking local wind direction windsock.", "Unsafe Act", "Hydrogen Sulfide (H2S)", "Potential SIF", "High", "Toxic Atmosphere Exposure", 0),
    ("H2S alarm triggered at 15 ppm during drill stem test; roustabout donned SCBA mask promptly.", "Near Miss", "Hydrogen Sulfide (H2S)", "Potential SIF", "High", "Toxic Atmosphere Exposure", 0),
    ("SCBA air cylinder pressure verified at 120 bar instead of mandatory 200 bar ready charge.", "Unsafe Condition", "Hydrogen Sulfide (H2S)", "Potential SIF", "Medium", "Toxic Atmosphere Exposure", 1),
    ("Personal H2S detector battery low beeper ignored for 2 hours during well logging.", "Unsafe Act", "Hydrogen Sulfide (H2S)", "Potential SIF", "Medium", "Toxic Atmosphere Exposure", 1),
    ("Spare breathing apparatus cylinder valve cap missing, allowing dust into regulator port.", "Unsafe Condition", "Hydrogen Sulfide (H2S)", "Non-SIF Precursor", "Low", "Toxic Atmosphere Exposure", 1),

    # High Pressure Fluid
    ("Choke manifold valve body washed out under 4500 psi sand flow, cutting through steel flange lip.", "Incident Precursor", "High Pressure Fluid", "SIF-Capable", "Critical", "High-Pressure Blowout / Ejection", 0),
    ("High-pressure test plug ejected from pipe spool during 3000 psi test, penetrating wooden bulkhead.", "Incident Precursor", "High Pressure Fluid", "SIF-Capable", "Critical", "High-Pressure Blowout / Ejection", 0),
    ("Flexible hydraulic line rubbed against rotating top drive torque guide until steel braid frayed.", "Unsafe Condition", "High Pressure Fluid", "Potential SIF", "High", "High-Pressure Blowout / Ejection", 0),
    ("Pin-hole water jet from 2000 psi washdown pump grazed worker rubber glove without breaking skin.", "Near Miss", "High Pressure Fluid", "Potential SIF", "High", "High-Pressure Blowout / Ejection", 0),
    ("Hammer union connection on cement pump discharge line struck with sledgehammer while under pressure.", "Unsafe Act", "High Pressure Fluid", "SIF-Capable", "Critical", "High-Pressure Blowout / Ejection", 0),
    ("Pressure gauge snubber damper valve stuck shut, preventing true pressure reading during surge.", "Unsafe Condition", "High Pressure Fluid", "Potential SIF", "Medium", "High-Pressure Blowout / Ejection", 1),
    ("Hydraulic oil weep at fitting nut on power tong arm dripping onto driller console floor.", "Unsafe Condition", "High Pressure Fluid", "Non-SIF Precursor", "Low", "High-Pressure Blowout / Ejection", 1),

    # Dropped Object
    ("Sledgehammer left on top derrick crown block platform after sheaves grease servicing.", "Unsafe Condition", "Dropped Object", "SIF-Capable", "Critical", "Suspended Load Rigging Failure", 0),
    ("Tugger winch cable snapped while dragging 800 kg BOP component across cellar, striking handrail.", "Incident Precursor", "Dropped Object", "SIF-Capable", "Critical", "Suspended Load Rigging Failure", 0),
    ("Rig worker walked under 3-ton casing joint being lifted by crane into V-door without looking up.", "Unsafe Act", "Dropped Object", "SIF-Capable", "Critical", "Suspended Load Rigging Failure", 0),
    ("Webbing sling pinched against sharp steel edge of separator skid during offloading without softeners.", "Unsafe Act", "Dropped Object", "Potential SIF", "High", "Suspended Load Rigging Failure", 0),
    ("Chain hoist latch spring broken on overhead monorail beam in pump house.", "Unsafe Condition", "Dropped Object", "Potential SIF", "Medium", "Suspended Load Rigging Failure", 1),
    ("Heavy crescent wrench slipped out of back pocket while climbing mast ladder; caught in ladder safety cage.", "Near Miss", "Dropped Object", "Potential SIF", "Medium", "Suspended Load Rigging Failure", 1),
    ("Empty wooden pallet fell off forklift tines from 1 foot height; no personnel nearby.", "Near Miss", "Dropped Object", "Non-SIF Precursor", "Low", "Suspended Load Rigging Failure", 1),

    # Line of Fire
    ("Technician leaned over revolving mud pump crosshead guide to inspect oil level while pump was running.", "Unsafe Act", "Line of Fire (Machinery/Tension)", "SIF-Capable", "Critical", "Heavy Equipment Blind Zone", 0),
    ("Wireline cable caught on lubricator tree valve and reached extreme tension before winch was halted.", "Near Miss", "Line of Fire (Machinery/Tension)", "SIF-Capable", "High", "Heavy Equipment Blind Zone", 0),
    ("Snubbing line anchor turnbuckle threads stripped under high wellhead pull force, snapping cable back.", "Incident Precursor", "Line of Fire (Machinery/Tension)", "SIF-Capable", "Critical", "Heavy Equipment Blind Zone", 0),
    ("Forklift moved in reverse into tight pipe alley while spotter was looking in opposite direction.", "Near Miss", "Line of Fire (Machinery/Tension)", "Potential SIF", "High", "Heavy Equipment Blind Zone", 0),
    ("Loose clothing sleeve caught on power tong guide handle during drill string rotation.", "Near Miss", "Line of Fire (Machinery/Tension)", "Potential SIF", "High", "Heavy Equipment Blind Zone", 0),
    ("Drive coupling yellow perimeter mesh guard unbolted and resting on floor beside running generator.", "Unsafe Condition", "Line of Fire (Machinery/Tension)", "Potential SIF", "Medium", "Heavy Equipment Blind Zone", 1),
    ("Worker stood within 1 meter of taut rope while truck was pulled out of mud hole.", "Unsafe Act", "Line of Fire (Machinery/Tension)", "Non-SIF Precursor", "Low", "Heavy Equipment Blind Zone", 1),

    # Oxygen Deficiency / Toxic Fumes
    ("Welders entered unventilated pontoon ballast compartment without gas test or rescue tripod rig.", "Unsafe Act", "Oxygen Deficiency / Toxic Fumes", "SIF-Capable", "Critical", "Confined Space Engulfment", 0),
    ("Nitrogen gas cylinder leaked inside closed tool van overnight; oxygen meter alarmed at 15.5%.", "Near Miss", "Oxygen Deficiency / Toxic Fumes", "SIF-Capable", "High", "Confined Space Engulfment", 0),
    ("Excavation trench dug to 2.4 meters depth in contaminated ground entered without air sampling or shoring.", "Unsafe Act", "Oxygen Deficiency / Toxic Fumes", "Potential SIF", "High", "Confined Space Engulfment", 0),
    ("Exhaust fumes from suction vacuum truck sucked into air inlet of workers' breathing air compressor.", "Incident Precursor", "Oxygen Deficiency / Toxic Fumes", "SIF-Capable", "Critical", "Confined Space Engulfment", 0),
    ("Confined space warning barricade sign knocked down outside oil tank manway opening.", "Unsafe Condition", "Oxygen Deficiency / Toxic Fumes", "Potential SIF", "Medium", "Confined Space Engulfment", 1),
    ("Gas test instrument calibration certificate expired by two weeks; still used for vessel entry signoff.", "Unsafe Act", "Oxygen Deficiency / Toxic Fumes", "Potential SIF", "Medium", "Confined Space Engulfment", 1),
    ("Ventilation blower air hose partially kinked under wooden block, reducing airflow to pit by 25%.", "Unsafe Condition", "Oxygen Deficiency / Toxic Fumes", "Non-SIF Precursor", "Low", "Confined Space Engulfment", 1),

    # Ignition Source in Hazardous Zone
    ("Technician used non-intrinsically safe battery power drill inside closed gas manifold compressor room.", "Unsafe Act", "Ignition Source in Hazardous Zone", "SIF-Capable", "Critical", "Hot Work Ignition Precursor", 0),
    ("Lightning strike earth bonding strap severed on high crude oil storage tank T-102.", "Unsafe Condition", "Ignition Source in Hazardous Zone", "SIF-Capable", "High", "Hot Work Ignition Precursor", 0),
    ("Hot work permit issued for welding on pipe rack without verifying that nearby open drain was sealed.", "Unsafe Act", "Ignition Source in Hazardous Zone", "SIF-Capable", "Critical", "Hot Work Ignition Precursor", 0),
    ("Sparks flew toward open hydrocarbon sample bucket during grinding of flange stud; fire watch stopped work.", "Near Miss", "Ignition Source in Hazardous Zone", "SIF-Capable", "High", "Hot Work Ignition Precursor", 0),
    ("Explosion-proof junction box cover missing 4 out of 8 certified stainless steel screws in Zone 1 area.", "Unsafe Condition", "Ignition Source in Hazardous Zone", "Potential SIF", "High", "Hot Work Ignition Precursor", 0),
    ("Diesel engine air intake emergency shutoff flapper valve failed to trip during overspeed safety test.", "Unsafe Condition", "Ignition Source in Hazardous Zone", "Potential SIF", "High", "Hot Work Ignition Precursor", 1),
    ("Smoking observed near waste chemical drum storage area 20 meters outside designated smoking shelter.", "Unsafe Act", "Ignition Source in Hazardous Zone", "Potential SIF", "Medium", "Hot Work Ignition Precursor", 1),

    # Structural Instability
    ("Severe vibration on drilling mast caused top guide roller bolt to shear off during heavy casing run.", "Incident Precursor", "Structural Instability", "SIF-Capable", "Critical", "Heavy Equipment Blind Zone", 0),
    ("Derrick guy wire tension below manufacturer specifications by 50% during impending gale storm.", "Unsafe Condition", "Structural Instability", "SIF-Capable", "Critical", "Heavy Equipment Blind Zone", 0),
    ("Crack observed along weld seam of main crane pedestal turntable mounting flange during pre-lift check.", "Near Miss", "Structural Instability", "SIF-Capable", "Critical", "Suspended Load Rigging Failure", 0),
    ("Mud tank walkway steel support leg rusted through with 50% section loss under chemical load.", "Unsafe Condition", "Structural Instability", "Potential SIF", "High", "Heavy Equipment Blind Zone", 0),
    ("Forklift mast tilted forward on uneven gravel yard while carrying maximum rated steel spool load.", "Near Miss", "Structural Instability", "Potential SIF", "Medium", "Heavy Equipment Blind Zone", 1),
    ("Rig substructure leveling jack hydraulic seal weeping oil under dead weight of drill collars.", "Unsafe Condition", "Structural Instability", "Potential SIF", "Medium", "Heavy Equipment Blind Zone", 1),
    ("Loose bolts on engine generator skid mounting foundation causing noticeable skid shift.", "Unsafe Condition", "Structural Instability", "Non-SIF Precursor", "Low", "Heavy Equipment Blind Zone", 1)
]

for item in ADDITIONAL_DOMAIN_VARIANTS:
    INCIDENT_RECORDS.append({
        "narrative": item[0],
        "report_type": item[1],
        "hazard": item[2],
        "sif_potential": item[3],
        "severity": item[4],
        "sif_precursor": item[5],
        "is_synthetic": item[6]
    })

def generate_dataset_csv(output_path: str = "safety_incidents.csv"):
    df = pd.DataFrame(INCIDENT_RECORDS)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} curated safety incident records -> {output_path}")
    print("Class Distributions:")
    print("Report Type:", df['report_type'].value_counts().to_dict())
    print("Hazard:", df['hazard'].value_counts().to_dict())
    print("SIF Potential:", df['sif_potential'].value_counts().to_dict())
    print("Severity:", df['severity'].value_counts().to_dict())
    return df

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    target_csv = os.path.join(out_dir, "safety_incidents.csv")
    generate_dataset_csv(target_csv)
