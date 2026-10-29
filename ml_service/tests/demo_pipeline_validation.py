"""
OIL India Safe-X: Multi-Report Pipeline Validation Script
Demonstrates that ML predictions, confidence levels, and verbatim evidence
change dynamically based on the input narrative. Also tests empty, short, and ambiguous inputs.
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from ml_service.inference import SafetyMLInferenceEngine

def run_validation():
    engine = SafetyMLInferenceEngine()
    print("================================================================================")
    print("OIL INDIA SAFE-X: DIVERSE REPORT VALIDATION & PREDICTION DEMONSTRATION")
    print(f"Model Version: {engine.version}")
    print("================================================================================\n")

    test_cases = [
        {
            "case_id": "TEST-01",
            "name": "Work at Height (Monkey Board)",
            "narrative": "During mast inspection at 26 meters, derrickman was observed unhooking dual safety harness lanyard while reaching across monkey board fingers in 35 knot gusting winds.",
            "installation": "Jorhat Exploration Rig 4",
            "asset": "Derrick Mast DM-02"
        },
        {
            "case_id": "TEST-02",
            "name": "Hydrocarbon Gas Leak (Separator Flange)",
            "narrative": "Strong gas odor detected downwind of gas booster compressor C-2; field operator confirmed packing seal blowout with portable detector reading 65% LEL.",
            "installation": "Duliajan Central Field",
            "asset": "Booster Compressor C-2"
        },
        {
            "case_id": "TEST-03",
            "name": "High Pressure Fluid Ejection Precursor",
            "narrative": "During well kill pumping operations at 3200 psi, high-pressure Chiksan iron union cracked and ejected fluid jet that severed electrical conduit 3 meters away.",
            "installation": "Moran Oil Field",
            "asset": "High Pressure Choke Manifold"
        },
        {
            "case_id": "TEST-04",
            "name": "Toxic Hydrogen Sulfide (H2S) Exposure",
            "narrative": "Sour crude well testing operation encountered unexpected H2S spike of 75 ppm in cellar area; fixed beacon alarm activated but two crew members had personal monitors switched off.",
            "installation": "Bagjan Wellsite Operations",
            "asset": "Sour Production Wellhead WH-09"
        },
        {
            "case_id": "TEST-05",
            "name": "Line of Fire (Rotating Machinery)",
            "narrative": "Roughneck positioned legs inside loop of high-tension hydraulic cathead snatch line while breaking out drill pipe joint on rotary table.",
            "installation": "Duliajan Central Field",
            "asset": "Drilling Rotary Table RT-01"
        },
        {
            "case_id": "TEST-06",
            "name": "Empty Narrative (Uncertainty Test)",
            "narrative": "   \n\t ",
            "installation": "Digboi Refinery Area",
            "asset": "General Area"
        },
        {
            "case_id": "TEST-07",
            "name": "Short / Insufficient Context (Uncertainty Test)",
            "narrative": "Valve broken leak.",
            "installation": "Digboi Refinery Area",
            "asset": "General Area"
        },
        {
            "case_id": "TEST-08",
            "name": "Ambiguous Observation (Threshold Test)",
            "narrative": "Someone mentioned that routine equipment checks were conducted around the perimeter yesterday afternoon.",
            "installation": "Duliajan Central Field",
            "asset": "Facility Perimeter"
        }
    ]

    for tc in test_cases:
        print(f"--------------------------------------------------------------------------------")
        print(f"[{tc['case_id']}] {tc['name'].upper()}")
        print(f"Narrative: \"{tc['narrative'].strip()}\"")
        
        report = engine.analyze_report(
            tc["narrative"],
            installation=tc["installation"],
            asset=tc["asset"]
        )

        print(f"• Predicted Hazard:       {report['hazard']}")
        print(f"• Predicted Report Type:   {report['reportType']}")
        print(f"• Predicted SIF Precursor: {report['sifPrecursor']}")
        print(f"• Predicted SIF Potential: {report['sifPotential']}")
        print(f"• Predicted Severity:      {report['severity']}")
        print(f"• Barrier Mapped:          {report['barrier']}")
        print(f"• Risk Score:              {report['riskScore']} / 100")
        print(f"• Model Confidence:        {report['confidence']}%")
        print(f"• Review Needed:           {report['reviewNeeded']}")
        if report.get('uncertaintyReason'):
            print(f"• Uncertainty Reason:      {report['uncertaintyReason']}")
        print(f"• Extracted Evidence:      {report['evidence']}")
        print()

if __name__ == "__main__":
    run_validation()
