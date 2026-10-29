import httpx
import json

cases = [
    (
        "Furnace Explosion / Burner Deflagration",
        "During re-lighting sequence on process fired furnace H-101, fuel gas accumulated in the combustion firebox due to passing fuel gas valve. Burner ignition resulted in deflagration and casing door blowout.",
        "Workover Rig WOR-07" # Test default override
    ),
    (
        "Work at Height (Monkey Board)",
        "Derrickman unhooked safety lanyard on monkey board at 28 meters elevation during pipe racking. High wind gust caused worker to slip onto perimeter grating without tie-off.",
        "Jorhat Exploration Rig 4"
    ),
    (
        "Confined Space Vessel Entry",
        "Contractor entered test separator V-201 for sand removal without atmospheric testing after portable gas detector battery discharged.",
        "High-Pressure 3-Phase Test Separator V-201"
    )
]

print("="*70)
print("LIVE FASTAPI INFERENCE TEST (http://127.0.0.1:8000/analyze)")
print("="*70)

for title, text, default_asset in cases:
    res = httpx.post("http://127.0.0.1:8000/analyze", json={
        "text": text,
        "asset": default_asset,
        "installation": "Duliajan Central Field"
    }, timeout=10.0)
    
    assert res.status_code == 200, f"Failed with {res.status_code}: {res.text}"
    d = res.json()
    print(f"\n[{title}]")
    print(f"  Input Narrative:      {text[:75]}...")
    print(f"  Resolved Asset:       {d.get('asset')}")
    print(f"  Resolved Installation:{d.get('installation')}")
    print(f"  Predicted Hazard:     {d.get('hazard')}")
    print(f"  SIF Precursor:        {d.get('sifPrecursor')}")
    print(f"  Risk Index:           {d.get('riskScore')} / 100")
    print(f"  Posterior Confidence: {d.get('confidence')}%")
    print(f"  Review Needed:        {d.get('reviewNeeded')}")
    print(f"  Verbatim Evidence:    {d.get('evidence')}")

print("\n" + "="*70)
print("ALL LIVE INFERENCE TESTS PASSED CLEANLY")
print("="*70)
