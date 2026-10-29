# Dataset Documentation & Provenance

## Provenance and Legal Licensing
The dataset used to train the OIL India Safe-X text intelligence models is constructed from credible, publicly available occupational and process safety incident reports and taxonomies.

### Primary Public Sources:
1. **OSHA Oil and Gas Extraction Safety Database**:
   - Agency: Occupational Safety and Health Administration (U.S. Department of Labor)
   - License / Status: U.S. Public Domain (U.S. Government Works)
   - Scope: Well servicing, drilling rigs, pipeline maintenance, fall protection, confined space incidents.
2. **NIOSH Fatality Assessment and Control Evaluation (FACE) Reports**:
   - Agency: National Institute for Occupational Safety and Health (CDC)
   - License / Status: U.S. Public Domain
   - Scope: Fatality and severe injury investigations in oilfield extraction and transport.
3. **U.S. Chemical Safety and Hazard Investigation Board (CSB) Case Studies**:
   - Agency: U.S. CSB (Independent Federal Agency)
   - License / Status: U.S. Public Domain
   - Scope: Hydrocarbon releases, explosion hazards, pressure vessel failures, energy isolation failures.
4. **IOGP Report 459 - Life-Saving Rules Guidance**:
   - Organization: International Association of Oil & Gas Producers
   - Scope: High-risk barrier categories, energy isolation, work at height, confined space entry, line of fire, mechanical lifting.

### Label Taxonomy:
- **`report_type`** (4 classes): `Unsafe Condition`, `Unsafe Act`, `Near Miss`, `Incident Precursor`
- **`hazard`** (10 classes): `Fall from Height`, `Hydrocarbon Gas Release`, `Hydrogen Sulfide (H2S)`, `Stored / Residual Energy`, `High Pressure Fluid`, `Dropped Object`, `Line of Fire (Machinery/Tension)`, `Oxygen Deficiency / Toxic Fumes`, `Ignition Source in Hazardous Zone`, `Structural Instability`
- **`sif_potential`** (3 classes): `SIF-Capable`, `Potential SIF`, `Non-SIF Precursor`
- **`severity`** (4 classes): `Low`, `Medium`, `High`, `Critical`
- **`sif_precursor`** (9 classes): `Energy Isolation Failure`, `Uncontained Hydrocarbon Leakage`, `Failed Fall Protection`, `Toxic Atmosphere Exposure`, `Suspended Load Rigging Failure`, `High-Pressure Blowout / Ejection`, `Confined Space Engulfment`, `Hot Work Ignition Precursor`, `Heavy Equipment Blind Zone`

### Confidentiality Notice:
No proprietary or confidential Oil India Limited internal communications or restricted databases were extracted or utilized. The dataset consists strictly of public taxonomy-derived incident records and curated domain safety observations.
Each record contains an `is_synthetic` flag (0 = public-derived incident narrative, 1 = curated domain edge case).

### Train / Test Methodology:
- **Split Ratio**: 80% Training (127 samples), 20% Held-out Testing (32 samples).
- **Stratification**: Stratified by hazard class and SIF potential to guarantee representative class distribution in both splits without data leakage.
- **Random State**: 42 (fixed for full reproducibility).
