import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ── Static snake database ──────────────────────────────────────────────────
const snakeDatabase = [
  {
    id: 1,
    name: 'King Cobra',
    localName: 'রাজ গোখরা',
    scientificName: 'Ophiophagus hannah',
    antivenomType: 'King Cobra Antivenom',
    venomType: 'Neurotoxic',
    dangerous: true,
    markings: 'Olive/yellow-green body, cream crossbands, large head, can raise 1/3 of body upright',
    habitat: 'Dense forests, hill districts (Sylhet, Chittagong)',
    emoji: '🐍',
    color: '#c0392b',
    firstAid: [
      'Keep the victim calm and still — movement spreads venom faster',
      'Immobilize the bitten limb below heart level',
      'Remove rings, watches, tight clothing near the bite',
      'Mark the edge of swelling with a pen every 15 minutes',
      'Rush to hospital IMMEDIATELY — King Cobra bites are life-threatening',
      'Do NOT cut the wound, suck out venom, or apply a tourniquet',
      'Do NOT apply ice or any home remedy',
    ],
    doNot: [
      'Do NOT cut or suck the wound',
      'Do NOT apply tourniquet — it causes tissue death',
      'Do NOT give alcohol or painkillers',
      'Do NOT let the victim walk if avoidable',
    ],
    symptoms: 'Drooping eyelids, difficulty breathing, paralysis, swelling at bite site',
  },
  {
    id: 2,
    name: 'Indian Cobra',
    localName: 'গোখরা সাপ',
    scientificName: 'Naja naja',
    antivenomType: 'Polyvalent Snake Antivenom',
    venomType: 'Neurotoxic + Cytotoxic',
    dangerous: true,
    markings: 'Hood with spectacle marking on back, brown to black body, 1.5–2m long',
    habitat: 'Agricultural land, villages, rice fields across Bangladesh',
    emoji: '🐍',
    color: '#c0392b',
    firstAid: [
      'Keep the victim calm — panic accelerates venom spread',
      'Immobilize the bitten arm/leg completely',
      'Lay the victim flat with bitten limb below heart level',
      'Remove jewelry and tight items near the bite',
      'Get to a hospital with ICU within 1 hour if possible',
      'Monitor breathing closely — respiratory failure can occur',
    ],
    doNot: [
      'Do NOT apply a tourniquet',
      'Do NOT cut or suck the wound',
      'Do NOT give anything by mouth',
    ],
    symptoms: 'Local pain and swelling, drooping eyelids (ptosis), breathing difficulty, blurred vision',
  },
  {
    id: 3,
    name: 'Common Krait',
    localName: 'কালাচ সাপ',
    scientificName: 'Bungarus caeruleus',
    antivenomType: 'Krait Antivenom',
    venomType: 'Neurotoxic',
    dangerous: true,
    markings: 'Shiny black/dark blue with narrow white crossbands, small head, thin body',
    habitat: 'Rice fields, bushes, inside houses at night — very common across Bangladesh',
    emoji: '🐍',
    color: '#8e44ad',
    firstAid: [
      'Krait bites are often painless — do NOT assume the bite is harmless',
      'Symptoms may appear hours later — hospitalize immediately',
      'Immobilize the limb and keep victim lying down',
      'Keep the victim awake and watch breathing carefully',
      'Antivenom must be given in hospital — do not delay',
    ],
    doNot: [
      'Do NOT dismiss a bite as "dry" or painless',
      'Do NOT wait for symptoms to appear before going to hospital',
      'Do NOT apply tourniquet or cut the wound',
    ],
    symptoms: 'Painless bite, abdominal pain, progressive paralysis, respiratory arrest (can occur during sleep)',
  },
  {
    id: 4,
    name: 'Russell\'s Viper',
    localName: 'চন্দ্রবোড়া সাপ',
    scientificName: 'Daboia russelii',
    antivenomType: 'Viper Antivenom',
    venomType: 'Hemotoxic',
    dangerous: true,
    markings: 'Brown body with three rows of dark oval spots, triangular head, very loud hiss',
    habitat: 'Open grasslands, farmlands, common in Rajshahi and Khulna divisions',
    emoji: '🐍',
    color: '#e67e22',
    firstAid: [
      'Severe local pain and swelling begins within minutes',
      'Immobilize the limb immediately — splint it like a fracture',
      'Keep the victim lying flat',
      'Transport carefully — jolting increases bleeding',
      'Viper bites cause massive internal bleeding — ICU care is essential',
      'Mark the swelling border every 15 minutes',
    ],
    doNot: [
      'Do NOT apply tourniquet — causes severe tissue damage',
      'Do NOT cut or burn the wound',
      'Do NOT give aspirin — worsens bleeding',
    ],
    symptoms: 'Severe swelling, blistering, internal bleeding, kidney failure, blood in urine',
  },
  {
    id: 5,
    name: 'Banded Krait',
    localName: 'শঙ্খিনী সাপ',
    scientificName: 'Bungarus fasciatus',
    antivenomType: 'Krait Antivenom',
    venomType: 'Neurotoxic',
    dangerous: true,
    markings: 'Bold black and yellow alternating bands of equal width, triangular cross-section body',
    habitat: 'Forests, wetlands, hill areas — Sylhet and Chittagong hill tracts',
    emoji: '🐍',
    color: '#f1c40f',
    firstAid: [
      'Bite may be painless or mildly painful — do not underestimate',
      'Immobilize the bitten limb below heart level',
      'Rush to hospital — paralysis can develop within hours',
      'Monitor breathing continuously',
      'Antivenom is the only effective treatment',
    ],
    doNot: [
      'Do NOT assume bite is harmless because it is painless',
      'Do NOT apply tourniquet or incise the wound',
    ],
    symptoms: 'Weakness, drooping eyelids, difficulty swallowing, respiratory paralysis',
  },
  {
    id: 6,
    name: 'Green Pit Viper',
    localName: 'সবুজ বোড়া',
    scientificName: 'Trimeresurus albolabris',
    antivenomType: 'Viper Antivenom',
    venomType: 'Hemotoxic',
    dangerous: true,
    markings: 'Bright green body, white or yellowish lip scales, heat-sensing pit between eye and nostril',
    habitat: 'Trees, bushes, tea gardens — Sylhet and Chittagong regions',
    emoji: '🐍',
    color: '#27ae60',
    firstAid: [
      'Immobilize the bitten area immediately',
      'Keep the victim calm and still',
      'Remove any constricting items near the bite',
      'Seek hospital care — antivenom may be required for severe bites',
      'Monitor for signs of bleeding',
    ],
    doNot: [
      'Do NOT apply tourniquet',
      'Do NOT cut or suck the wound',
    ],
    symptoms: 'Local pain and swelling, bruising, mild bleeding tendency',
  },
  {
    id: 7,
    name: 'Checkered Keelback',
    localName: 'ঢোড়া সাপ',
    scientificName: 'Fowlea piscator',
    antivenomType: null,
    venomType: 'Non-venomous / Mildly venomous (rear-fanged)',
    dangerous: false,
    markings: 'Checkered black and olive pattern, keeled scales, found near water',
    habitat: 'Near ponds, rivers, wetlands — very common across Bangladesh',
    emoji: '🐍',
    color: '#27ae60',
    firstAid: [
      'Wash the bite site with soap and water for 10–15 minutes',
      'Apply antiseptic to prevent infection',
      'Watch for signs of allergic reaction',
      'Medical attention recommended but not an emergency',
    ],
    doNot: [
      'Do NOT panic — this snake is generally harmless',
    ],
    symptoms: 'Minor puncture wounds, possible local swelling, no systemic effects',
  },
  {
    id: 8,
    name: 'Indian Rock Python',
    localName: 'অজগর সাপ',
    scientificName: 'Python molurus',
    antivenomType: null,
    venomType: 'Non-venomous (constrictor)',
    dangerous: false,
    markings: 'Tan/brown with dark brown blotches, very large — can exceed 4m, heat pits on lips',
    habitat: 'Forests and wetlands — Sundarbans, Sylhet, Chittagong hill tracts',
    emoji: '🐍',
    color: '#795548',
    firstAid: [
      'If constricting — do NOT pull the snake, unwind from tail end',
      'Pythons are not venomous — no antivenom needed',
      'Clean bite wounds thoroughly with soap and water',
      'Seek tetanus shot and wound care at hospital',
      'Bite wounds can be deep — may need stitches',
    ],
    doNot: [
      'Do NOT pull the snake by the head if it is constricting',
      'Do NOT assume all large snakes are venomous',
    ],
    symptoms: 'Deep puncture/laceration wounds, no venom symptoms',
  },
];

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const venomColors = {
  'Neurotoxic': { bg: '#fdecea', color: '#c0392b' },
  'Hemotoxic': { bg: '#FEF9E7', color: '#E67E22' },
  'Neurotoxic + Cytotoxic': { bg: '#fdecea', color: '#8e44ad' },
  'Non-venomous (constrictor)': { bg: '#C6EBC5', color: '#27ae60' },
  'Non-venomous / Mildly venomous (rear-fanged)': { bg: '#C6EBC5', color: '#27ae60' },
};

const AntivenomFinderPage = () => {
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [selectedSnake, setSelectedSnake] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [hospitalError, setHospitalError] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [activeGuideTab, setActiveGuideTab] = useState('firstaid');
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);

  const filteredSnakes = snakeDatabase.filter((s) => {
    const q = searchText.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.localName.includes(q) ||
      s.scientificName.toLowerCase().includes(q)
    );
  });

  const handleSelectSnake = async (snake) => {
    setSelectedSnake(snake);
    setHospitals([]);
    setHospitalError('');
    setActiveGuideTab('firstaid');

    if (!snake.antivenomType) return;

    setHospitalLoading(true);
    try {
      const params = { antivenomType: snake.antivenomType };
      if (divisionFilter) params.division = divisionFilter;
      const { data } = await axios.get('/api/antivenom/search', { params });
      setHospitals(data.hospitals);
    } catch {
      setHospitalError('Failed to load hospital data');
    } finally {
      setHospitalLoading(false);
    }
  };

  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.registerBtn} onClick={() => navigate('/antivenom/register')}>
            🏥 Register Hospital Stock
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🐍</span>
          <h1 style={styles.title}>Antivenom Finder</h1>
          <p style={styles.subtitle}>
            Identify the snake, find the correct antivenom, locate the nearest hospital
          </p>
        </div>

        {/* Emergency banner */}
        <div style={styles.emergencyBanner}>
          🚨 <strong>Snake bite emergency?</strong> Call 999 immediately.
          Keep the victim still and get to the nearest hospital with ICU facilities.
        </div>

        <div style={styles.mainLayout}>
          {/* Left panel — snake list */}
          <div style={styles.leftPanel}>
            <div style={styles.searchBox}>
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Search snake name (English or বাংলা)..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div style={styles.snakeListHeader}>
              <span style={styles.snakeListTitle}>
                {searchText ? `${filteredSnakes.length} results` : 'Common Snakes in Bangladesh'}
              </span>
              <button
                style={styles.photoGuideBtn}
                onClick={() => setShowPhotoGuide(!showPhotoGuide)}
              >
                📷 {showPhotoGuide ? 'Hide' : 'Photo'} Guide
              </button>
            </div>

            <div style={styles.snakeList}>
              {filteredSnakes.map((snake) => (
                <div
                  key={snake.id}
                  style={{
                    ...styles.snakeCard,
                    ...(selectedSnake?.id === snake.id ? styles.snakeCardActive : {}),
                    borderLeft: `4px solid ${snake.color}`,
                  }}
                  onClick={() => handleSelectSnake(snake)}
                >
                  <div style={styles.snakeCardTop}>
                    <span style={{ fontSize: '20px' }}>{snake.emoji}</span>
                    <div style={styles.snakeCardInfo}>
                      <div style={styles.snakeName}>{snake.name}</div>
                      <div style={styles.snakeLocalName}>{snake.localName}</div>
                    </div>
                    {snake.dangerous && <span style={styles.dangerBadge}>⚠️</span>}
                  </div>

                  {showPhotoGuide && (
                    <div style={styles.photoGuideBox}>
                      <div style={styles.photoGuideLabel}>🔍 Identification</div>
                      <p style={styles.photoGuideText}>{snake.markings}</p>
                      <div style={styles.habitatText}>📍 {snake.habitat}</div>
                    </div>
                  )}

                  <div style={styles.snakeCardBottom}>
                    <span style={{
                      ...styles.venomBadge,
                      ...(venomColors[snake.venomType] || { bg: '#f5f5f5', color: '#888' }),
                      backgroundColor: (venomColors[snake.venomType] || {}).bg || '#f5f5f5',
                    }}>
                      {snake.venomType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — details */}
          <div style={styles.rightPanel}>
            {!selectedSnake ? (
              <div style={styles.emptyRight}>
                <span style={{ fontSize: '48px' }}>🐍</span>
                <p style={{ color: '#888', marginTop: '12px', fontSize: '14px' }}>
                  Select a snake from the list to see first aid instructions and find nearby antivenom
                </p>
              </div>
            ) : (
              <div>
                {/* Snake info header */}
                <div style={{ ...styles.snakeDetailHeader, borderLeft: `5px solid ${selectedSnake.color}` }}>
                  <div style={styles.snakeDetailTop}>
                    <div>
                      <h2 style={styles.snakeDetailName}>{selectedSnake.name}</h2>
                      <div style={styles.snakeDetailLocal}>{selectedSnake.localName} · <em>{selectedSnake.scientificName}</em></div>
                    </div>
                    {selectedSnake.dangerous && (
                      <div style={styles.dangerAlert}>⚠️ VENOMOUS</div>
                    )}
                  </div>

                  <div style={styles.snakeDetailMeta}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Venom Type</span>
                      <span style={{
                        ...styles.metaValue,
                        color: (venomColors[selectedSnake.venomType] || {}).color || '#333',
                      }}>
                        {selectedSnake.venomType}
                      </span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Antivenom</span>
                      <span style={styles.metaValue}>
                        {selectedSnake.antivenomType || 'Not required'}
                      </span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Habitat</span>
                      <span style={styles.metaValue}>{selectedSnake.habitat}</span>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div style={styles.symptomsBox}>
                    <strong style={{ fontSize: '12px', color: '#c0392b' }}>⚡ Symptoms: </strong>
                    <span style={{ fontSize: '12px', color: '#555' }}>{selectedSnake.symptoms}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div style={styles.guideTabs}>
                  <button
                    style={activeGuideTab === 'firstaid' ? styles.guideTabActive : styles.guideTab}
                    onClick={() => setActiveGuideTab('firstaid')}
                  >
                    🩹 First Aid
                  </button>
                  <button
                    style={activeGuideTab === 'donot' ? styles.guideTabActive : styles.guideTab}
                    onClick={() => setActiveGuideTab('donot')}
                  >
                    🚫 Do NOT
                  </button>
                  {selectedSnake.antivenomType && (
                    <button
                      style={activeGuideTab === 'hospitals' ? styles.guideTabActive : styles.guideTab}
                      onClick={() => setActiveGuideTab('hospitals')}
                    >
                      🏥 Hospitals ({hospitals.length})
                    </button>
                  )}
                </div>

                {/* First aid tab */}
                {activeGuideTab === 'firstaid' && (
                  <div style={styles.guideCard}>
                    <h3 style={styles.guideTitle}>🩹 First Aid Steps</h3>
                    <ol style={styles.stepList}>
                      {selectedSnake.firstAid.map((step, i) => (
                        <li key={i} style={styles.stepItem}>
                          <span style={styles.stepNum}>{i + 1}</span>
                          <span style={styles.stepText}>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Do NOT tab */}
                {activeGuideTab === 'donot' && (
                  <div style={{ ...styles.guideCard, border: '1.5px solid #fdecea' }}>
                    <h3 style={{ ...styles.guideTitle, color: '#c0392b' }}>🚫 What NOT to Do</h3>
                    <div style={styles.doNotList}>
                      {selectedSnake.doNot.map((item, i) => (
                        <div key={i} style={styles.doNotItem}>
                          <span style={styles.doNotIcon}>✕</span>
                          <span style={styles.doNotText}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hospitals tab */}
                {activeGuideTab === 'hospitals' && selectedSnake.antivenomType && (
                  <div style={styles.guideCard}>
                    <div style={styles.hospitalHeader}>
                      <h3 style={styles.guideTitle}>
                        🏥 Hospitals with {selectedSnake.antivenomType}
                      </h3>
                      <select
                        style={styles.divisionSelect}
                        value={divisionFilter}
                        onChange={(e) => {
                          setDivisionFilter(e.target.value);
                          handleSelectSnake({ ...selectedSnake });
                        }}
                      >
                        <option value="">All Divisions</option>
                        {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    {hospitalLoading && (
                      <div style={styles.centerMsg}>Searching hospitals...</div>
                    )}
                    {hospitalError && (
                      <div style={styles.errorMsg}>{hospitalError}</div>
                    )}

                    {!hospitalLoading && hospitals.length === 0 && (
                      <div style={styles.emptyHospitals}>
                        <span style={{ fontSize: '32px' }}>🏥</span>
                        <p style={{ color: '#888', marginTop: '8px', fontSize: '13px' }}>
                          No registered hospitals found with this antivenom.
                          Call 999 or go to the nearest government hospital.
                        </p>
                      </div>
                    )}

                    {hospitals.map((h) => {
                      const matched = h.matchedStock || h.stock?.find(
                        (s) => s.antivenomType === selectedSnake.antivenomType
                      );
                      const units = matched?.units || 0;
                      return (
                        <div key={h._id} style={styles.hospitalCard}>
                          <div style={styles.hospitalTop}>
                            <div>
                              <div style={styles.hospitalName}>{h.hospital}</div>
                              <div style={styles.hospitalLocation}>
                                📍 {h.location.district}, {h.location.division}
                                {h.location.area && ` · ${h.location.area}`}
                              </div>
                            </div>
                            <div style={{
                              ...styles.stockBadge,
                              backgroundColor: units >= 10 ? '#C6EBC5' : units >= 3 ? '#FEF9E7' : '#fdecea',
                              color: units >= 10 ? '#27ae60' : units >= 3 ? '#E67E22' : '#c0392b',
                            }}>
                              {units} units
                            </div>
                          </div>
                          <div style={styles.hospitalFooter}>
                            <span style={styles.updatedText}>
                              Updated {timeAgo(h.lastUpdated)}
                            </span>
                            <a href={'tel:' + h.contactNumber} style={styles.callBtn}>
                              📞 {h.contactNumber}
                            </a>
                          </div>
                        </div>
                      );
                    })}
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
  registerBtn: {
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
  emergencyBanner: {
    backgroundColor: '#fdecea', border: '1.5px solid #f5c6cb', color: '#c0392b',
    borderRadius: '10px', padding: '12px 20px', fontSize: '13px',
    marginBottom: '24px', textAlign: 'center',
  },
  mainLayout: {
    display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start',
  },
  leftPanel: {},
  searchBox: { marginBottom: '12px' },
  searchInput: {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1.5px solid #C6EBC5', fontSize: '13px', outline: 'none',
    backgroundColor: '#fff', color: '#333', boxSizing: 'border-box',
  },
  snakeListHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px',
  },
  snakeListTitle: { fontSize: '12px', color: '#aaa', fontWeight: '600' },
  photoGuideBtn: {
    backgroundColor: '#FEFDEC', color: '#FA7070', border: '1px solid #FA7070',
    borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold',
  },
  snakeList: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '70vh', overflowY: 'auto' },
  snakeCard: {
    backgroundColor: '#fff', borderRadius: '10px', padding: '12px 14px',
    border: '1px solid #C6EBC5', cursor: 'pointer', transition: 'all 0.15s',
  },
  snakeCardActive: {
    backgroundColor: '#fff5f5', border: '1px solid #FA7070',
    boxShadow: '0 2px 10px rgba(250,112,112,0.2)',
  },
  snakeCardTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  snakeCardInfo: { flex: 1 },
  snakeName: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
  snakeLocalName: { fontSize: '11px', color: '#888' },
  dangerBadge: { fontSize: '16px' },
  photoGuideBox: {
    backgroundColor: '#FEFDEC', borderRadius: '6px', padding: '8px 10px',
    marginTop: '8px', marginBottom: '6px',
  },
  photoGuideLabel: { fontSize: '10px', fontWeight: 'bold', color: '#FA7070', marginBottom: '3px' },
  photoGuideText: { fontSize: '11px', color: '#555', margin: '0 0 4px' },
  habitatText: { fontSize: '10px', color: '#888' },
  snakeCardBottom: { display: 'flex' },
  venomBadge: {
    borderRadius: '10px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold',
  },
  rightPanel: {},
  emptyRight: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '60px 30px',
    border: '1px solid #C6EBC5', textAlign: 'center',
  },
  snakeDetailHeader: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px',
    border: '1px solid #C6EBC5', marginBottom: '16px',
  },
  snakeDetailTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  snakeDetailName: { fontSize: '20px', fontWeight: 'bold', color: '#333', margin: '0 0 4px' },
  snakeDetailLocal: { fontSize: '13px', color: '#888' },
  dangerAlert: {
    backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '8px',
    padding: '6px 14px', fontWeight: 'bold', fontSize: '12px',
  },
  snakeDetailMeta: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' },
  metaItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  metaLabel: { fontSize: '10px', color: '#aaa', fontWeight: '600', textTransform: 'uppercase' },
  metaValue: { fontSize: '12px', fontWeight: '600', color: '#333' },
  symptomsBox: {
    backgroundColor: '#FEFDEC', borderRadius: '8px', padding: '8px 12px',
    border: '1px solid #f5c6cb',
  },
  guideTabs: { display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' },
  guideTab: {
    padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  guideTabActive: {
    padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #FA7070',
    backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  guideCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px',
    border: '1px solid #C6EBC5',
  },
  guideTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '16px' },
  stepList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  stepItem: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  stepNum: {
    backgroundColor: '#FA7070', color: '#fff', borderRadius: '50%',
    width: '22px', height: '22px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', flexShrink: 0,
  },
  stepText: { fontSize: '13px', color: '#444', lineHeight: '1.5' },
  doNotList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  doNotItem: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  doNotIcon: {
    backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '50%',
    width: '22px', height: '22px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0,
  },
  doNotText: { fontSize: '13px', color: '#444', lineHeight: '1.5' },
  hospitalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px',
  },
  divisionSelect: {
    padding: '6px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '12px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none',
  },
  centerMsg: { textAlign: 'center', color: '#888', padding: '20px' },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '12px',
  },
  emptyHospitals: {
    textAlign: 'center', padding: '30px', backgroundColor: '#FEFDEC',
    borderRadius: '10px', border: '1px solid #C6EBC5',
  },
  hospitalCard: {
    backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '14px 16px',
    border: '1px solid #C6EBC5', marginBottom: '10px',
  },
  hospitalTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  hospitalName: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
  hospitalLocation: { fontSize: '12px', color: '#888', marginTop: '2px' },
  stockBadge: {
    borderRadius: '12px', padding: '4px 12px',
    fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap',
  },
  hospitalFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  updatedText: { fontSize: '11px', color: '#aaa' },
  callBtn: {
    padding: '6px 14px', backgroundColor: '#C6EBC5', color: '#27ae60',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none',
  },
};

export default AntivenomFinderPage;