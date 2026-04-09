import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Static alternatives database ──────────────────────────────────────────
const alternativesDB = [
  {
    id: 1,
    brandName: 'Napa',
    genericName: 'Paracetamol',
    activeIngredient: 'Paracetamol',
    dosage: '500mg tablet',
    category: 'Analgesic / Antipyretic',
    usedFor: ['Fever', 'Headache', 'Mild pain', 'Cold'],
    alternatives: [
      { name: 'ACE', type: 'Brand', manufacturer: 'Square', dosage: '500mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Renova', type: 'Brand', manufacturer: 'Renata', dosage: '500mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Tylenol', type: 'Brand', manufacturer: 'Johnson & Johnson', dosage: '500mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Paracetamol BP', type: 'Generic', manufacturer: 'Various', dosage: '500mg tablet', equivalency: '1:1 — exact generic equivalent' },
    ],
    warning: 'Do not exceed 4g (8 tablets) per day. Avoid in liver disease. Consult a doctor before switching.',
  },
  {
    id: 2,
    brandName: 'Napa Extra',
    genericName: 'Paracetamol + Caffeine',
    activeIngredient: 'Paracetamol 500mg + Caffeine 65mg',
    dosage: '500mg/65mg tablet',
    category: 'Analgesic / Antipyretic',
    usedFor: ['Migraine', 'Tension headache', 'Fever with fatigue'],
    alternatives: [
      { name: 'ACE Plus', type: 'Brand', manufacturer: 'Square', dosage: '500mg/65mg tablet', equivalency: '1:1 — same formulation' },
      { name: 'Panadol Extra', type: 'Brand', manufacturer: 'GSK', dosage: '500mg/65mg tablet', equivalency: '1:1 — same formulation' },
      { name: 'Napa (plain)', type: 'Brand', manufacturer: 'Beximco', dosage: '500mg tablet', equivalency: 'Without caffeine — may be less effective for migraines' },
    ],
    warning: 'Contains caffeine — avoid in heart conditions, anxiety, or insomnia. Consult a doctor before switching.',
  },
  {
    id: 3,
    brandName: 'Seclo',
    genericName: 'Omeprazole',
    activeIngredient: 'Omeprazole',
    dosage: '20mg capsule',
    category: 'Proton Pump Inhibitor',
    usedFor: ['Acid reflux', 'Peptic ulcer', 'GERD', 'Gastritis'],
    alternatives: [
      { name: 'Losectil', type: 'Brand', manufacturer: 'ACI', dosage: '20mg capsule', equivalency: '1:1 — same dose' },
      { name: 'Omep', type: 'Brand', manufacturer: 'Drug International', dosage: '20mg capsule', equivalency: '1:1 — same dose' },
      { name: 'Pantoprazole 40mg', type: 'Generic', manufacturer: 'Various', dosage: '40mg tablet', equivalency: 'Different PPI — 40mg pantoprazole ≈ 20mg omeprazole' },
      { name: 'Esomeprazole 20mg', type: 'Generic', manufacturer: 'Various', dosage: '20mg capsule', equivalency: 'Similar PPI — generally 1:1 substitution' },
    ],
    warning: 'PPIs vary in potency. Do not switch between PPIs without medical supervision, especially for ulcer treatment.',
  },
  {
    id: 4,
    brandName: 'Amodis',
    genericName: 'Metronidazole',
    activeIngredient: 'Metronidazole',
    dosage: '400mg tablet',
    category: 'Antibiotic / Antiprotozoal',
    usedFor: ['Bacterial infection', 'Amoebiasis', 'Giardiasis', 'Dental infection'],
    alternatives: [
      { name: 'Flagyl', type: 'Brand', manufacturer: 'Sanofi', dosage: '400mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Metro', type: 'Brand', manufacturer: 'Opsonin', dosage: '400mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Metronidazole BP', type: 'Generic', manufacturer: 'Various', dosage: '400mg tablet', equivalency: '1:1 — exact generic equivalent' },
    ],
    warning: 'Antibiotics must not be switched without a doctor\'s advice. Avoid alcohol during treatment. Complete the full course.',
  },
  {
    id: 5,
    brandName: 'Ciprocin',
    genericName: 'Ciprofloxacin',
    activeIngredient: 'Ciprofloxacin Hydrochloride',
    dosage: '500mg tablet',
    category: 'Antibiotic (Fluoroquinolone)',
    usedFor: ['UTI', 'Respiratory infection', 'Typhoid', 'Skin infection'],
    alternatives: [
      { name: 'Cipro', type: 'Brand', manufacturer: 'Bayer', dosage: '500mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Ciplox', type: 'Brand', manufacturer: 'Cipla', dosage: '500mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Ciprofloxacin BP', type: 'Generic', manufacturer: 'Various', dosage: '500mg tablet', equivalency: '1:1 — exact generic equivalent' },
      { name: 'Levofloxacin 500mg', type: 'Generic', manufacturer: 'Various', dosage: '500mg tablet', equivalency: 'Different fluoroquinolone — not always interchangeable, doctor approval needed' },
    ],
    warning: 'Never substitute antibiotics without a prescription. Fluoroquinolones can cause tendon damage. Consult your doctor.',
  },
  {
    id: 6,
    brandName: 'Fimoxyl',
    genericName: 'Amoxicillin',
    activeIngredient: 'Amoxicillin Trihydrate',
    dosage: '500mg capsule',
    category: 'Antibiotic (Penicillin)',
    usedFor: ['Respiratory infection', 'Ear infection', 'Dental infection', 'Tonsillitis'],
    alternatives: [
      { name: 'Moxacil', type: 'Brand', manufacturer: 'Square', dosage: '500mg capsule', equivalency: '1:1 — same dose' },
      { name: 'Amoxil', type: 'Brand', manufacturer: 'GSK', dosage: '500mg capsule', equivalency: '1:1 — same dose' },
      { name: 'Amoxicillin BP', type: 'Generic', manufacturer: 'Various', dosage: '500mg capsule', equivalency: '1:1 — exact generic equivalent' },
      { name: 'Co-amoxiclav 625mg', type: 'Brand', manufacturer: 'Various', dosage: '625mg tablet', equivalency: 'Stronger combination — amoxicillin + clavulanate, use only if prescribed' },
    ],
    warning: 'Penicillin allergy can be life-threatening. Never switch antibiotics without medical advice.',
  },
  {
    id: 7,
    brandName: 'Maxpro',
    genericName: 'Esomeprazole',
    activeIngredient: 'Esomeprazole Magnesium',
    dosage: '20mg capsule',
    category: 'Proton Pump Inhibitor',
    usedFor: ['GERD', 'Acid reflux', 'Peptic ulcer', 'H. pylori'],
    alternatives: [
      { name: 'Nexum', type: 'Brand', manufacturer: 'AstraZeneca', dosage: '20mg capsule', equivalency: '1:1 — same dose' },
      { name: 'Esoral', type: 'Brand', manufacturer: 'ACI', dosage: '20mg capsule', equivalency: '1:1 — same dose' },
      { name: 'Omeprazole 20mg', type: 'Generic', manufacturer: 'Various', dosage: '20mg capsule', equivalency: 'Similar PPI — slightly different potency, generally interchangeable' },
      { name: 'Pantoprazole 40mg', type: 'Generic', manufacturer: 'Various', dosage: '40mg tablet', equivalency: 'Different PPI — 40mg pantoprazole ≈ 20mg esomeprazole' },
    ],
    warning: 'PPIs require careful substitution. Do not switch during H. pylori treatment without consulting your doctor.',
  },
  {
    id: 8,
    brandName: 'Losartan',
    genericName: 'Losartan Potassium',
    activeIngredient: 'Losartan Potassium',
    dosage: '50mg tablet',
    category: 'Antihypertensive (ARB)',
    usedFor: ['High blood pressure', 'Heart failure', 'Diabetic kidney disease'],
    alternatives: [
      { name: 'Lozar', type: 'Brand', manufacturer: 'Square', dosage: '50mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Losar', type: 'Brand', manufacturer: 'Beximco', dosage: '50mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Valsartan 80mg', type: 'Generic', manufacturer: 'Various', dosage: '80mg tablet', equivalency: 'Different ARB — 80mg valsartan ≈ 50mg losartan, requires doctor adjustment' },
      { name: 'Amlodipine 5mg', type: 'Generic', manufacturer: 'Various', dosage: '5mg tablet', equivalency: 'Different class (CCB) — not direct substitute, requires medical supervision' },
    ],
    warning: 'Blood pressure medications must NEVER be switched without a doctor\'s approval. Abrupt changes can be dangerous.',
  },
  {
    id: 9,
    brandName: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    activeIngredient: 'Metformin HCl',
    dosage: '500mg tablet',
    category: 'Antidiabetic (Biguanide)',
    usedFor: ['Type 2 diabetes', 'Insulin resistance', 'PCOS'],
    alternatives: [
      { name: 'Glucophage', type: 'Brand', manufacturer: 'Merck', dosage: '500mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Dibex', type: 'Brand', manufacturer: 'Square', dosage: '500mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Iomet', type: 'Brand', manufacturer: 'ACI', dosage: '500mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Metformin XR 500mg', type: 'Brand', manufacturer: 'Various', dosage: '500mg extended release', equivalency: 'Same dose but extended release — fewer GI side effects, not always interchangeable' },
    ],
    warning: 'Diabetes medications require careful monitoring. Never switch without consulting your endocrinologist or doctor.',
  },
  {
    id: 10,
    brandName: 'Clopid',
    genericName: 'Clopidogrel',
    activeIngredient: 'Clopidogrel Bisulfate',
    dosage: '75mg tablet',
    category: 'Antiplatelet',
    usedFor: ['Heart attack prevention', 'Stroke prevention', 'Coronary stent'],
    alternatives: [
      { name: 'Plavix', type: 'Brand', manufacturer: 'Sanofi', dosage: '75mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Clopirel', type: 'Brand', manufacturer: 'Renata', dosage: '75mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Aspirin 100mg', type: 'Generic', manufacturer: 'Various', dosage: '100mg tablet', equivalency: 'Different antiplatelet — not a direct substitute, requires cardiologist approval' },
    ],
    warning: '⚠️ CRITICAL: Never stop or switch antiplatelet medications without immediate cardiologist advice. Risk of heart attack.',
  },
  {
    id: 11,
    brandName: 'Atorva',
    genericName: 'Atorvastatin',
    activeIngredient: 'Atorvastatin Calcium',
    dosage: '10mg tablet',
    category: 'Statin / Lipid-lowering',
    usedFor: ['High cholesterol', 'Heart disease prevention', 'Atherosclerosis'],
    alternatives: [
      { name: 'Lipitor', type: 'Brand', manufacturer: 'Pfizer', dosage: '10mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Torva', type: 'Brand', manufacturer: 'Square', dosage: '10mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Rosuvastatin 5mg', type: 'Generic', manufacturer: 'Various', dosage: '5mg tablet', equivalency: 'Different statin — 5mg rosuvastatin ≈ 10mg atorvastatin (higher potency)' },
      { name: 'Simvastatin 20mg', type: 'Generic', manufacturer: 'Various', dosage: '20mg tablet', equivalency: 'Different statin — 20mg simvastatin ≈ 10mg atorvastatin (lower potency)' },
    ],
    warning: 'Statins differ in potency. Switching requires dose adjustment and liver function monitoring. Consult your doctor.',
  },
  {
    id: 12,
    brandName: 'Insulin Mixtard',
    genericName: 'Biphasic Insulin',
    activeIngredient: 'Insulin (30% soluble + 70% isophane)',
    dosage: '100 IU/ml injection',
    category: 'Insulin / Antidiabetic',
    usedFor: ['Type 1 diabetes', 'Type 2 diabetes requiring insulin'],
    alternatives: [
      { name: 'Novomix 30', type: 'Brand', manufacturer: 'Novo Nordisk', dosage: '100 IU/ml', equivalency: 'Similar premix — dose adjustment may be required' },
      { name: 'Humulin 30/70', type: 'Brand', manufacturer: 'Eli Lilly', dosage: '100 IU/ml', equivalency: 'Similar premix — 1:1 switch often possible but monitor blood sugar' },
      { name: 'Insulin Glargine', type: 'Brand', manufacturer: 'Sanofi', dosage: '100 IU/ml', equivalency: 'Different type (basal) — NOT a direct substitute, full regimen change needed' },
    ],
    warning: '⚠️ CRITICAL: Insulin switches are extremely dangerous. Only switch insulin under direct medical supervision with close blood sugar monitoring.',
  },
  {
    id: 13,
    brandName: 'Azithro',
    genericName: 'Azithromycin',
    activeIngredient: 'Azithromycin Dihydrate',
    dosage: '500mg tablet',
    category: 'Antibiotic (Macrolide)',
    usedFor: ['Respiratory tract infection', 'Typhoid', 'STI', 'Skin infection'],
    alternatives: [
      { name: 'Zithromax', type: 'Brand', manufacturer: 'Pfizer', dosage: '500mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Azim', type: 'Brand', manufacturer: 'Square', dosage: '500mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Clarithromycin 500mg', type: 'Generic', manufacturer: 'Various', dosage: '500mg tablet', equivalency: 'Different macrolide — similar spectrum but different dosing schedule' },
    ],
    warning: 'Never substitute antibiotics without a prescription. Azithromycin has a unique 3–5 day course. Consult your doctor.',
  },
  {
    id: 14,
    brandName: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    activeIngredient: 'Cetirizine HCl',
    dosage: '10mg tablet',
    category: 'Antihistamine',
    usedFor: ['Allergic rhinitis', 'Urticaria', 'Hay fever', 'Itching'],
    alternatives: [
      { name: 'Zyrtec', type: 'Brand', manufacturer: 'UCB', dosage: '10mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Alatrol', type: 'Brand', manufacturer: 'Square', dosage: '10mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Fexofenadine 120mg', type: 'Generic', manufacturer: 'Various', dosage: '120mg tablet', equivalency: 'Different antihistamine — less sedating, good alternative' },
      { name: 'Loratadine 10mg', type: 'Generic', manufacturer: 'Various', dosage: '10mg tablet', equivalency: 'Different antihistamine — non-sedating, generally interchangeable' },
      { name: 'Levocetirizine 5mg', type: 'Generic', manufacturer: 'Various', dosage: '5mg tablet', equivalency: 'Active enantiomer — 5mg levocetirizine = 10mg cetirizine' },
    ],
    warning: 'Antihistamines may cause drowsiness. Differences between generations matter. Consult a pharmacist or doctor.',
  },
  {
    id: 15,
    brandName: 'Diclofenac',
    genericName: 'Diclofenac Sodium',
    activeIngredient: 'Diclofenac Sodium',
    dosage: '50mg tablet',
    category: 'NSAID / Anti-inflammatory',
    usedFor: ['Joint pain', 'Back pain', 'Arthritis', 'Post-operative pain'],
    alternatives: [
      { name: 'Voveran', type: 'Brand', manufacturer: 'Novartis', dosage: '50mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Voltaren', type: 'Brand', manufacturer: 'GSK', dosage: '50mg tablet', equivalency: '1:1 — same dose' },
      { name: 'Ibuprofen 400mg', type: 'Generic', manufacturer: 'Various', dosage: '400mg tablet', equivalency: 'Different NSAID — similar effect for mild-moderate pain' },
      { name: 'Naproxen 500mg', type: 'Generic', manufacturer: 'Various', dosage: '500mg tablet', equivalency: 'Different NSAID — longer acting, take twice daily' },
    ],
    warning: 'NSAIDs can cause stomach ulcers, kidney damage, and increase heart risk. Never switch without doctor advice, especially in elderly patients.',
  },
];

const categoryColors = {
  'Analgesic / Antipyretic':      { bg: '#C6EBC5', color: '#27AE60' },
  'Antibiotic (Fluoroquinolone)': { bg: '#fdecea', color: '#c0392b' },
  'Antibiotic (Penicillin)':      { bg: '#fdecea', color: '#c0392b' },
  'Antibiotic / Antiprotozoal':   { bg: '#fdecea', color: '#c0392b' },
  'Antibiotic (Macrolide)':       { bg: '#fdecea', color: '#c0392b' },
  'Proton Pump Inhibitor':        { bg: '#FEF9E7', color: '#E67E22' },
  'Antihypertensive (ARB)':       { bg: '#e8f4fd', color: '#2980b9' },
  'Antidiabetic (Biguanide)':     { bg: '#e8f4fd', color: '#2980b9' },
  'Antiplatelet':                 { bg: '#fdecea', color: '#c0392b' },
  'Statin / Lipid-lowering':      { bg: '#FEF9E7', color: '#E67E22' },
  'Insulin / Antidiabetic':       { bg: '#fdecea', color: '#c0392b' },
  'Antihistamine':                { bg: '#C6EBC5', color: '#27AE60' },
  'NSAID / Anti-inflammatory':    { bg: '#FEF9E7', color: '#E67E22' },
};

const MedicineAlternativePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [activeTab, setActiveTab] = useState('alternatives');

  const filtered = alternativesDB.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.activeIngredient.toLowerCase().includes(q) ||
      m.usedFor.some((u) => u.toLowerCase().includes(q))
    );
  });

  const isCritical = (med) =>
    med.category.includes('Antibiotic') ||
    med.category.includes('Insulin') ||
    med.category.includes('Antiplatelet') ||
    med.category.includes('Antihypertensive');

  const altTypeColor = (type) =>
    type === 'Generic'
      ? { bg: '#C6EBC5', color: '#27AE60' }
      : { bg: '#e8f4fd', color: '#2980b9' };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.searchBtn} onClick={() => navigate('/medicines')}>
            🔍 Find Medicine
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🔄</span>
          <h1 style={styles.title}>Medicine Alternative Suggester</h1>
          <p style={styles.subtitle}>
            Find generic equivalents and alternate brands when your medicine is unavailable
          </p>
        </div>

        {/* Safety warning banner */}
        <div style={styles.warningBanner}>
          <span style={styles.warningIcon}>⚕️</span>
          <div>
            <div style={styles.warningTitle}>Always consult your doctor before switching medicines</div>
            <div style={styles.warningText}>
              Alternatives shown here are for reference only. Dosage, efficacy, and safety
              may vary. Never self-medicate with substitutes — especially for antibiotics,
              cardiac, or diabetic medicines.
            </div>
          </div>
        </div>

        <div style={styles.mainLayout}>
          {/* Left — search + list */}
          <div style={styles.leftPanel}>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search brand name, generic name, or disease..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedMed(null);
              }}
            />

            <div style={styles.listLabel}>
              {searchQuery
                ? `${filtered.length} result(s) for "${searchQuery}"`
                : `${alternativesDB.length} medicines in database`}
            </div>

            <div style={styles.medList}>
              {filtered.length === 0 && (
                <div style={styles.emptyList}>
                  <span style={{ fontSize: '32px' }}>💊</span>
                  <p style={{ color: '#888', fontSize: '13px', marginTop: '8px' }}>
                    No medicine found. Try a generic name or disease name.
                  </p>
                </div>
              )}
              {filtered.map((med) => {
                const cat = categoryColors[med.category] || { bg: '#f5f5f5', color: '#888' };
                const selected = selectedMed?.id === med.id;
                return (
                  <div
                    key={med.id}
                    style={{
                      ...styles.medCard,
                      ...(selected ? styles.medCardActive : {}),
                    }}
                    onClick={() => { setSelectedMed(med); setActiveTab('alternatives'); }}
                  >
                    <div style={styles.medCardTop}>
                      <div>
                        <div style={styles.medCardName}>{med.brandName}</div>
                        <div style={styles.medCardGeneric}>{med.genericName}</div>
                      </div>
                      {isCritical(med) && <span style={styles.criticalDot}>⚠️</span>}
                    </div>
                    <div style={styles.medCardBottom}>
                      <span style={{ ...styles.catBadge, backgroundColor: cat.bg, color: cat.color }}>
                        {med.category}
                      </span>
                      <span style={styles.altCount}>{med.alternatives.length} alternatives</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — detail panel */}
          <div style={styles.rightPanel}>
            {!selectedMed ? (
              <div style={styles.emptyRight}>
                <span style={{ fontSize: '48px' }}>🔄</span>
                <p style={{ color: '#888', marginTop: '12px', fontSize: '14px' }}>
                  Select a medicine to see alternatives, dosage equivalency, and safety information
                </p>
                <div style={styles.quickPicks}>
                  <div style={styles.quickPickLabel}>Quick picks:</div>
                  {['Napa', 'Seclo', 'Ciprocin', 'Cetirizine', 'Metformin'].map((name) => (
                    <button
                      key={name}
                      style={styles.quickPickBtn}
                      onClick={() => {
                        const found = alternativesDB.find((m) =>
                          m.brandName.toLowerCase() === name.toLowerCase()
                        );
                        if (found) { setSelectedMed(found); setSearchQuery(name); }
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div style={styles.detailHeader}>
                  <div style={styles.detailHeaderTop}>
                    <div>
                      <h2 style={styles.detailName}>{selectedMed.brandName}</h2>
                      <div style={styles.detailGeneric}>{selectedMed.genericName}</div>
                    </div>
                    {isCritical(selectedMed) && (
                      <div style={styles.criticalTag}>⚠️ Critical Medicine</div>
                    )}
                  </div>

                  <div style={styles.detailMetaGrid}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Active Ingredient</span>
                      <span style={styles.metaValue}>{selectedMed.activeIngredient}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Dosage / Form</span>
                      <span style={styles.metaValue}>{selectedMed.dosage}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Category</span>
                      <span style={styles.metaValue}>{selectedMed.category}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Used For</span>
                      <span style={styles.metaValue}>{selectedMed.usedFor.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                  <button
                    style={activeTab === 'alternatives' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('alternatives')}
                  >
                    🔄 Alternatives ({selectedMed.alternatives.length})
                  </button>
                  <button
                    style={activeTab === 'warning' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('warning')}
                  >
                    ⚠️ Safety Warning
                  </button>
                </div>

                {/* Alternatives tab */}
                {activeTab === 'alternatives' && (
                  <div style={styles.altCard}>
                    <div style={styles.altCardTitle}>
                      Available alternatives for {selectedMed.brandName}
                    </div>

                    {selectedMed.alternatives.map((alt, i) => {
                      const tc = altTypeColor(alt.type);
                      return (
                        <div key={i} style={styles.altRow}>
                          <div style={styles.altLeft}>
                            <div style={styles.altTop}>
                              <span style={styles.altName}>{alt.name}</span>
                              <span style={{ ...styles.altTypeBadge, backgroundColor: tc.bg, color: tc.color }}>
                                {alt.type}
                              </span>
                            </div>
                            <div style={styles.altMfr}>by {alt.manufacturer} · {alt.dosage}</div>
                            <div style={styles.equivalencyBox}>
                              <span style={styles.equivIcon}>⚖️</span>
                              <span style={styles.equivText}>{alt.equivalency}</span>
                            </div>
                          </div>
                          <button
                            style={styles.findBtn}
                            onClick={() => navigate('/medicines?q=' + encodeURIComponent(alt.name))}
                          >
                            🔍 Find
                          </button>
                        </div>
                      );
                    })}

                    <div style={styles.altFooterNote}>
                      💡 Click <strong>Find</strong> to search for availability at hospitals and pharmacies
                    </div>
                  </div>
                )}

                {/* Warning tab */}
                {activeTab === 'warning' && (
                  <div style={styles.warningCard}>
                    <div style={styles.warningCardIcon}>⚕️</div>
                    <h3 style={styles.warningCardTitle}>Safety Warning</h3>
                    <p style={styles.warningCardText}>{selectedMed.warning}</p>

                    <div style={styles.warningRules}>
                      <div style={styles.warningRule}>
                        <span style={styles.ruleIcon}>🚫</span>
                        Do not switch medicines without medical advice
                      </div>
                      <div style={styles.warningRule}>
                        <span style={styles.ruleIcon}>💊</span>
                        Dosage may need adjustment when switching brands
                      </div>
                      <div style={styles.warningRule}>
                        <span style={styles.ruleIcon}>🏥</span>
                        For chronic conditions, always inform your doctor
                      </div>
                      <div style={styles.warningRule}>
                        <span style={styles.ruleIcon}>⚗️</span>
                        Generic = same active ingredient, may differ in inactive components
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar: {
    backgroundColor: '#FA7070', padding: '14px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText: { fontWeight: 'bold', color: '#fff' },
  navRight: { display: 'flex', gap: '10px', alignItems: 'center' },
  searchBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  backBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
  warningBanner: {
    backgroundColor: '#FEF9E7', border: '1.5px solid #fceab0', borderRadius: '12px',
    padding: '14px 20px', marginBottom: '24px', display: 'flex', gap: '14px', alignItems: 'flex-start',
  },
  warningIcon: { fontSize: '24px', flexShrink: 0 },
  warningTitle: { fontSize: '14px', fontWeight: 'bold', color: '#E67E22', marginBottom: '4px' },
  warningText: { fontSize: '12px', color: '#8a6d00', lineHeight: '1.5' },
  mainLayout: {
    display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start',
  },
  leftPanel: {},
  searchInput: {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1.5px solid #C6EBC5', fontSize: '13px', outline: 'none',
    backgroundColor: '#fff', color: '#333', boxSizing: 'border-box', marginBottom: '10px',
  },
  listLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600', marginBottom: '8px' },
  medList: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    maxHeight: '72vh', overflowY: 'auto',
  },
  emptyList: { textAlign: 'center', padding: '30px', color: '#888' },
  medCard: {
    backgroundColor: '#fff', borderRadius: '10px', padding: '12px 14px',
    border: '1px solid #C6EBC5', cursor: 'pointer',
  },
  medCardActive: {
    backgroundColor: '#fff5f5', border: '1.5px solid #FA7070',
    boxShadow: '0 2px 10px rgba(250,112,112,0.15)',
  },
  medCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' },
  medCardName: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
  medCardGeneric: { fontSize: '11px', color: '#888' },
  criticalDot: { fontSize: '14px' },
  medCardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catBadge: {
    borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold',
  },
  altCount: { fontSize: '11px', color: '#aaa' },
  rightPanel: {},
  emptyRight: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '50px 30px',
    border: '1px solid #C6EBC5', textAlign: 'center',
  },
  quickPicks: { marginTop: '20px' },
  quickPickLabel: { fontSize: '12px', color: '#aaa', marginBottom: '10px' },
  quickPickBtn: {
    margin: '4px', padding: '6px 14px', backgroundColor: '#fff',
    border: '1.5px solid #C6EBC5', borderRadius: '20px',
    fontSize: '13px', color: '#555', cursor: 'pointer', fontWeight: '500',
  },
  detailHeader: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px',
    border: '1px solid #C6EBC5', marginBottom: '14px',
  },
  detailHeaderTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '14px',
  },
  detailName: { fontSize: '20px', fontWeight: 'bold', color: '#333', margin: '0 0 3px' },
  detailGeneric: { fontSize: '13px', color: '#888' },
  criticalTag: {
    backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '8px',
    padding: '6px 12px', fontWeight: 'bold', fontSize: '12px',
  },
  detailMetaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  metaItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  metaLabel: { fontSize: '10px', color: '#aaa', fontWeight: '600', textTransform: 'uppercase' },
  metaValue: { fontSize: '12px', fontWeight: '600', color: '#333' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '14px' },
  tab: {
    padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  tabActive: {
    padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #FA7070',
    backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  altCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px',
    border: '1px solid #C6EBC5',
  },
  altCardTitle: { fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '16px' },
  altRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '14px 0', borderBottom: '1px solid #f0f0f0', gap: '10px',
  },
  altLeft: { flex: 1 },
  altTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' },
  altName: { fontSize: '15px', fontWeight: 'bold', color: '#333' },
  altTypeBadge: {
    borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold',
  },
  altMfr: { fontSize: '11px', color: '#888', marginBottom: '6px' },
  equivalencyBox: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '8px',
    padding: '6px 10px', display: 'flex', alignItems: 'flex-start', gap: '6px',
  },
  equivIcon: { fontSize: '13px', flexShrink: 0 },
  equivText: { fontSize: '12px', color: '#555', lineHeight: '1.4' },
  findBtn: {
    padding: '7px 14px', backgroundColor: '#FEFDEC', color: '#FA7070',
    border: '1.5px solid #FA7070', borderRadius: '8px', fontWeight: 'bold',
    fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  },
  altFooterNote: {
    marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f0f0f0',
    fontSize: '12px', color: '#888',
  },
  warningCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '28px 24px',
    border: '1.5px solid #fceab0',
  },
  warningCardIcon: { fontSize: '36px', textAlign: 'center', marginBottom: '12px' },
  warningCardTitle: {
    fontSize: '18px', fontWeight: 'bold', color: '#E67E22',
    textAlign: 'center', marginBottom: '14px',
  },
  warningCardText: {
    fontSize: '14px', color: '#555', lineHeight: '1.7',
    backgroundColor: '#FEF9E7', borderRadius: '10px', padding: '14px 16px',
    border: '1px solid #fceab0', marginBottom: '20px',
  },
  warningRules: { display: 'flex', flexDirection: 'column', gap: '10px' },
  warningRule: {
    display: 'flex', alignItems: 'center', gap: '10px',
    fontSize: '13px', color: '#555',
  },
  ruleIcon: { fontSize: '16px', flexShrink: 0 },
};

export default MedicineAlternativePage;