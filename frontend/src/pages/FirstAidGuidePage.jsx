import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Guide Data ─────────────────────────────────────────────────────────────
const guides = [
  {
    id: 'snake-bite',
    title: 'Snake Bite',
    titleBn: 'সাপের কামড়',
    icon: '🐍',
    color: '#27AE60',
    bg: '#C6EBC5',
    hospitalSpecialty: 'Antivenom / Toxicology',
    steps: [
      { en: 'Stay calm and keep the victim still. Movement speeds venom spread.', bn: 'শান্ত থাকুন এবং আক্রান্তকে স্থির রাখুন। নড়াচড়া বিষ ছড়িয়ে দেয়।' },
      { en: 'Remove any tight clothing, watches, or rings near the bite site.', bn: 'কামড়ের স্থানের কাছ থেকে শক্ত পোশাক, ঘড়ি বা আংটি সরিয়ে নিন।' },
      { en: 'Immobilize the bitten limb below the level of the heart.', bn: 'কামড়ের অঙ্গকে হৃদয়ের নিচে স্থির রাখুন।' },
      { en: 'Mark the edge of swelling with a pen and note the time.', bn: 'ফোলার কিনারায় কলম দিয়ে দাগ দিন এবং সময় লিখুন।' },
      { en: 'Transport to nearest hospital with antivenom immediately.', bn: 'অবিলম্বে অ্যান্টিভেনম সহ নিকটতম হাসপাতালে নিয়ে যান।' },
    ],
    donts: [
      { en: 'Do NOT cut, suck, or squeeze the wound.', bn: 'ক্ষতস্থান কাটবেন না, চুষবেন না বা চাপ দেবেন না।' },
      { en: 'Do NOT apply a tourniquet or ice.', bn: 'টুর্নিকেট বা বরফ লাগাবেন না।' },
      { en: 'Do NOT give food, water, or alcohol.', bn: 'খাবার, পানি বা মদ দেবেন না।' },
      { en: 'Do NOT let the victim walk if avoidable.', bn: 'সম্ভব হলে আক্রান্তকে হাঁটতে দেবেন না।' },
    ],
  },
  {
    id: 'heart-attack',
    title: 'Heart Attack',
    titleBn: 'হার্ট অ্যাটাক',
    icon: '❤️',
    color: '#c0392b',
    bg: '#fdecea',
    hospitalSpecialty: 'Cardiac Care',
    steps: [
      { en: 'Call emergency services immediately. Note the time symptoms started.', bn: 'অবিলম্বে জরুরি সেবায় কল করুন। লক্ষণ শুরুর সময় নোট করুন।' },
      { en: 'Have the person sit or lie down in a comfortable position.', bn: 'ব্যক্তিকে আরামদায়ক অবস্থায় বসতে বা শুতে দিন।' },
      { en: 'Loosen any tight clothing around the chest and neck.', bn: 'বুক ও গলার চারপাশে শক্ত পোশাক আলগা করুন।' },
      { en: 'If the person is conscious, give one aspirin (325mg) if available and not allergic.', bn: 'ব্যক্তি সচেতন থাকলে এবং অ্যালার্জি না থাকলে একটি অ্যাসপিরিন দিন।' },
      { en: 'If the person becomes unconscious and stops breathing, begin CPR.', bn: 'ব্যক্তি অজ্ঞান হয়ে শ্বাস বন্ধ হলে CPR শুরু করুন।' },
      { en: 'CPR: Push hard and fast in the center of the chest — 30 compressions, then 2 breaths.', bn: 'CPR: বুকের মাঝখানে শক্তভাবে ও দ্রুত চাপুন — ৩০ বার চাপ, তারপর ২টি শ্বাস।' },
    ],
    donts: [
      { en: 'Do NOT leave the person alone.', bn: 'ব্যক্তিকে একা রাখবেন না।' },
      { en: 'Do NOT give water or food.', bn: 'পানি বা খাবার দেবেন না।' },
      { en: 'Do NOT let them deny symptoms and refuse help.', bn: 'লক্ষণ অস্বীকার করে সাহায্য প্রত্যাখ্যান করতে দেবেন না।' },
    ],
  },
  {
    id: 'choking',
    title: 'Choking',
    titleBn: 'গলায় কিছু আটকে যাওয়া',
    icon: '😮',
    color: '#E67E22',
    bg: '#FEF9E7',
    hospitalSpecialty: 'Emergency / ENT',
    steps: [
      { en: 'Ask "Are you choking?" If they can cough or speak, encourage them to keep coughing.', bn: 'জিজ্ঞেস করুন "আপনার কি শ্বাস আটকে গেছে?" কাশি বা কথা বলতে পারলে কাশি দিতে উৎসাহিত করুন।' },
      { en: 'If they cannot cough, speak, or breathe — stand behind them and give 5 firm back blows between shoulder blades.', bn: 'কাশি, কথা বা শ্বাস না নিতে পারলে — পিছনে দাঁড়িয়ে কাঁধের মাঝখানে ৫টি শক্ত থাপ্পড় দিন।' },
      { en: 'If back blows fail, perform 5 abdominal thrusts (Heimlich maneuver): stand behind, make a fist above the navel, pull sharply inward and upward.', bn: 'থাপ্পড়ে কাজ না হলে ৫টি পেটের ধাক্কা দিন: পিছনে দাঁড়িয়ে নাভির উপরে মুষ্টি রেখে ভিতরে-উপরে টানুন।' },
      { en: 'Alternate 5 back blows and 5 abdominal thrusts until the object is dislodged or the person becomes unconscious.', bn: 'বস্তু বের না হওয়া বা ব্যক্তি অজ্ঞান না হওয়া পর্যন্ত পর্যায়ক্রমে চালিয়ে যান।' },
      { en: 'If the person loses consciousness, call emergency services and begin CPR.', bn: 'অজ্ঞান হলে জরুরি সেবায় কল করুন এবং CPR শুরু করুন।' },
    ],
    donts: [
      { en: 'Do NOT perform abdominal thrusts on infants under 1 year — use back blows only.', bn: '১ বছরের কম শিশুর পেটে ধাক্কা দেবেন না — শুধু পিঠে থাপ্পড় দিন।' },
      { en: 'Do NOT do a blind finger sweep in the mouth.', bn: 'মুখে অন্ধভাবে আঙুল দেবেন না।' },
    ],
  },
  {
    id: 'burns',
    title: 'Burns',
    titleBn: 'পোড়া',
    icon: '🔥',
    color: '#E67E22',
    bg: '#FEF9E7',
    hospitalSpecialty: 'Burn Unit',
    steps: [
      { en: 'Remove the person from the source of heat immediately.', bn: 'ব্যক্তিকে তাপের উৎস থেকে অবিলম্বে সরান।' },
      { en: 'Cool the burn under cool (not cold) running water for at least 20 minutes.', bn: 'পোড়া স্থান কমপক্ষে ২০ মিনিট ঠান্ডা (বরফ নয়) প্রবাহমান পানির নিচে রাখুন।' },
      { en: 'Remove jewellery, watches, or tight clothing near the burn — do this before swelling starts.', bn: 'ফুলে যাওয়ার আগে পোড়ার কাছ থেকে গহনা, ঘড়ি বা শক্ত পোশাক সরান।' },
      { en: 'Cover loosely with a clean, non-fluffy material (cling film or clean plastic bag works well).', bn: 'পরিষ্কার, নরম কাপড় বা প্লাস্টিক র‍্যাপ দিয়ে হালকাভাবে ঢাকুন।' },
      { en: 'Seek medical attention for burns larger than 3cm, on the face/hands/genitals, or in children.', bn: '৩ সেমির বড় পোড়া, মুখ/হাত/গোপনাঙ্গে বা শিশুর ক্ষেত্রে চিকিৎসা নিন।' },
    ],
    donts: [
      { en: 'Do NOT use ice, iced water, butter, toothpaste or any cream.', bn: 'বরফ, বরফ পানি, মাখন, টুথপেস্ট বা কোনো ক্রিম ব্যবহার করবেন না।' },
      { en: 'Do NOT burst any blisters.', bn: 'ফোসকা ফাটাবেন না।' },
      { en: 'Do NOT remove clothing stuck to the burn.', bn: 'পোড়ায় লাগানো পোশাক টেনে সরাবেন না।' },
    ],
  },
  {
    id: 'fracture',
    title: 'Fracture',
    titleBn: 'হাড় ভাঙা',
    icon: '🦴',
    color: '#2980b9',
    bg: '#e8f4fd',
    hospitalSpecialty: 'Orthopedics',
    steps: [
      { en: 'Keep the injured area still. Do not attempt to straighten the bone.', bn: 'আহত অংশ স্থির রাখুন। হাড় সোজা করার চেষ্টা করবেন না।' },
      { en: 'Immobilize the fracture using a splint — use a rigid object (board, rolled newspaper) padded with cloth.', bn: 'স্প্লিন্ট দিয়ে ভাঙা স্থান স্থির করুন — শক্ত বস্তু (বোর্ড, গোল করা কাগজ) কাপড় দিয়ে মুড়িয়ে ব্যবহার করুন।' },
      { en: 'Tie the splint above and below the fracture — not over it.', bn: 'স্প্লিন্ট ভাঙার উপরে ও নিচে বাঁধুন — সরাসরি উপরে নয়।' },
      { en: 'Elevate the injured limb if possible to reduce swelling.', bn: 'সম্ভব হলে আহত অঙ্গ উপরে তুলে রাখুন।' },
      { en: 'Apply ice pack wrapped in cloth for 20 minutes to reduce pain and swelling.', bn: 'ব্যথা ও ফোলা কমাতে কাপড়ে মোড়া বরফ ২০ মিনিট লাগান।' },
      { en: 'Transport to hospital for X-ray and proper treatment.', bn: 'এক্স-রে ও সঠিক চিকিৎসার জন্য হাসপাতালে নিয়ে যান।' },
    ],
    donts: [
      { en: 'Do NOT try to realign the bone.', bn: 'হাড় সারিবদ্ধ করার চেষ্টা করবেন না।' },
      { en: 'Do NOT move the person unnecessarily, especially if spine injury is suspected.', bn: 'অপ্রয়োজনে ব্যক্তিকে নাড়াবেন না, বিশেষত মেরুদণ্ডে আঘাত সন্দেহ হলে।' },
    ],
  },
  {
    id: 'poisoning',
    title: 'Poisoning',
    titleBn: 'বিষক্রিয়া',
    icon: '☠️',
    color: '#8e44ad',
    bg: '#f3e5f5',
    hospitalSpecialty: 'Toxicology / ICU',
    steps: [
      { en: 'Identify the poison if possible — keep the container or note the substance name.', bn: 'সম্ভব হলে বিষ চিহ্নিত করুন — পাত্র রাখুন বা বস্তুর নাম লিখুন।' },
      { en: 'Call emergency services immediately. Report the substance and amount if known.', bn: 'অবিলম্বে জরুরি সেবায় কল করুন। বস্তু ও পরিমাণ জানালে জানান।' },
      { en: 'If the person is unconscious but breathing, place in the recovery position (on their side).', bn: 'অজ্ঞান কিন্তু শ্বাস নিচ্ছেন, তাহলে রিকভারি পজিশনে রাখুন।' },
      { en: 'If skin or eyes are exposed, flush with large amounts of water for 15-20 minutes.', bn: 'ত্বক বা চোখে লাগলে ১৫-২০ মিনিট প্রচুর পানি দিয়ে ধুয়ে নিন।' },
      { en: 'Transport to hospital immediately with the poison container.', bn: 'বিষের পাত্র সহ অবিলম্বে হাসপাতালে নিয়ে যান।' },
    ],
    donts: [
      { en: 'Do NOT induce vomiting unless specifically told to by a medical professional.', bn: 'চিকিৎসকের নির্দেশ ছাড়া বমি করাবেন না।' },
      { en: 'Do NOT give milk, water, or food to a poisoning victim without medical advice.', bn: 'চিকিৎসার পরামর্শ ছাড়া দুধ, পানি বা খাবার দেবেন না।' },
      { en: 'Do NOT leave the person alone.', bn: 'ব্যক্তিকে একা রাখবেন না।' },
    ],
  },
  {
    id: 'childbirth',
    title: 'Emergency Childbirth',
    titleBn: 'জরুরি প্রসব',
    icon: '👶',
    color: '#FA7070',
    bg: '#FEFDEC',
    hospitalSpecialty: 'Obstetrics / NICU',
    steps: [
      { en: 'Call emergency services immediately. Stay on the line for guidance.', bn: 'অবিলম্বে জরুরি সেবায় কল করুন। নির্দেশনার জন্য লাইনে থাকুন।' },
      { en: 'Have the mother lie on her back with knees bent, or in whatever position is most comfortable.', bn: 'মাকে হাঁটু ভাঁজ করে পিঠের উপর শুইয়ে দিন বা যেভাবে আরামদায়ক।' },
      { en: 'Wash hands thoroughly. Gather clean towels, blankets, and string or shoelace.', bn: 'হাত ভালো করে ধুন। পরিষ্কার তোয়ালে, কম্বল এবং সুতা বা ফিতা সংগ্রহ করুন।' },
      { en: 'Encourage the mother to breathe through contractions. Do not push until fully dilated.', bn: 'সংকোচনের সময় মাকে শ্বাস নিতে উৎসাহিত করুন। সম্পূর্ণ প্রসারিত না হওয়া পর্যন্ত চাপ দেবেন না।' },
      { en: 'Support the baby\'s head as it emerges. Gently guide — do not pull.', bn: 'শিশুর মাথা বের হওয়ার সময় ধরুন। আলতোভাবে গাইড করুন — টানবেন না।' },
      { en: 'Once delivered, place baby on mother\'s chest skin-to-skin. Keep warm.', bn: 'প্রসবের পরে শিশুকে মায়ের বুকে ত্বক-থেকে-ত্বক রাখুন। উষ্ণ রাখুন।' },
      { en: 'Tie and cut the cord only after it stops pulsating — use clean string tied firmly 4cm from baby.', bn: 'কর্ড স্পন্দন বন্ধ হওয়ার পরেই কাটুন — শিশু থেকে ৪ সেমি দূরে শক্তভাবে বাঁধুন।' },
    ],
    donts: [
      { en: 'Do NOT pull on the baby or the umbilical cord.', bn: 'শিশু বা নাভিরজ্জু টানবেন না।' },
      { en: 'Do NOT cut the cord unless medical help is hours away.', bn: 'চিকিৎসা সাহায্য ঘণ্টার দূরে না হলে কর্ড কাটবেন না।' },
      { en: 'Do NOT give the mother food or water during active labor.', bn: 'সক্রিয় প্রসব বেদনার সময় মাকে খাবার বা পানি দেবেন না।' },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────
const FirstAidGuidePage = () => {
  const navigate = useNavigate();

  const [selected, setSelected]   = useState(null);
  const [lang, setLang]           = useState('en');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [search, setSearch]       = useState('');
  const [cachedGuides, setCachedGuides] = useState([]);

  // Cache guides to localStorage on first load
  useEffect(() => {
    try {
      localStorage.setItem('gh_firstaid_guides', JSON.stringify(guides));
      localStorage.setItem('gh_firstaid_cached_at', new Date().toISOString());
    } catch { /* storage full */ }

    const handleOffline = () => setIsOffline(true);
    const handleOnline  = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
    };
  }, []);

  // On mount, load from cache if offline
  useEffect(() => {
    if (isOffline) {
      try {
        const cached = localStorage.getItem('gh_firstaid_guides');
        if (cached) setCachedGuides(JSON.parse(cached));
      } catch { setCachedGuides(guides); }
    }
  }, [isOffline]);

  const activeGuides = (isOffline && cachedGuides.length > 0 ? cachedGuides : guides)
    .filter((g) =>
      search.trim() === '' ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.titleBn.includes(search)
    );

  const guide = selected ? activeGuides.find((g) => g.id === selected) || guides.find((g) => g.id === selected) : null;

  // ── Detail View ──
  if (guide) {
    return (
      <div style={styles.wrapper}>
        <nav style={styles.navbar}>
          <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
          <div style={styles.navRight}>
            <button
              style={{ ...styles.langBtn, backgroundColor: lang === 'en' ? '#fff' : 'transparent', color: lang === 'en' ? '#FA7070' : '#fff' }}
              onClick={() => setLang('en')}>EN</button>
            <button
              style={{ ...styles.langBtn, backgroundColor: lang === 'bn' ? '#fff' : 'transparent', color: lang === 'bn' ? '#FA7070' : '#fff' }}
              onClick={() => setLang('bn')}>বাং</button>
            <button style={styles.backBtn} onClick={() => setSelected(null)}>← Back</button>
          </div>
        </nav>

        <div style={styles.container}>
          {isOffline && (
            <div style={styles.offlineBanner}>
              📴 You are offline — showing cached guide
            </div>
          )}

          {/* Guide header */}
          <div style={{ ...styles.guideHeader, backgroundColor: guide.bg, borderColor: guide.color + '44' }}>
            <div style={styles.guideHeaderIcon}>{guide.icon}</div>
            <div>
              <h1 style={{ ...styles.guideTitle, color: guide.color }}>
                {lang === 'bn' ? guide.titleBn : guide.title}
              </h1>
              <div style={styles.guideHospital}>
                🏥 Go to hospital with: <strong>{guide.hospitalSpecialty}</strong>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>✅ What To Do</h2>
            {guide.steps.map((step, i) => (
              <div key={i} style={styles.stepRow}>
                <div style={{ ...styles.stepNum, backgroundColor: guide.color }}>
                  {i + 1}
                </div>
                <div style={styles.stepText}>
                  {lang === 'bn' ? step.bn : step.en}
                </div>
              </div>
            ))}
          </div>

          {/* Donts */}
          <div style={styles.dontsCard}>
            <h2 style={styles.sectionTitleRed}>⚠️ What NOT To Do</h2>
            {guide.donts.map((dont, i) => (
              <div key={i} style={styles.dontRow}>
                <span style={styles.dontIcon}>🚫</span>
                <span style={styles.dontText}>
                  {lang === 'bn' ? dont.bn : dont.en}
                </span>
              </div>
            ))}
          </div>

          {/* Hospital button */}
          <div style={styles.hospitalBox}>
            <div style={styles.hospitalBoxTitle}>🏥 Need a hospital?</div>
            <p style={styles.hospitalBoxSub}>
              Find the nearest hospital with <strong>{guide.hospitalSpecialty}</strong> capability
            </p>
            <button style={styles.hospitalBtn} onClick={() => navigate('/hospitals')}>
              Find Nearby Hospital →
            </button>
          </div>

          {/* Emergency numbers */}
          <div style={styles.emergencyBox}>
            <div style={styles.emergencyTitle}>🆘 Emergency Numbers (Bangladesh)</div>
            <div style={styles.emergencyRow}>
              <a href="tel:999" style={styles.emergencyCallBtn}>📞 999 — National Emergency</a>
              <a href="tel:16430" style={styles.emergencyCallBtn}>📞 16430 — Ambulance</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Guide List View ──
  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button
            style={{ ...styles.langBtn, backgroundColor: lang === 'en' ? '#fff' : 'transparent', color: lang === 'en' ? '#FA7070' : '#fff' }}
            onClick={() => setLang('en')}>EN</button>
          <button
            style={{ ...styles.langBtn, backgroundColor: lang === 'bn' ? '#fff' : 'transparent', color: lang === 'bn' ? '#FA7070' : '#fff' }}
            onClick={() => setLang('bn')}>বাং</button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🩺</span>
          <h1 style={styles.title}>
            {lang === 'bn' ? 'প্রাথমিক চিকিৎসা নির্দেশিকা' : 'Emergency First Aid Guide'}
          </h1>
          <p style={styles.subtitle}>
            {lang === 'bn'
              ? 'ধাপে ধাপে নির্দেশাবলী — অফলাইনেও কাজ করে'
              : 'Step-by-step emergency instructions — works offline'}
          </p>
        </div>

        {isOffline && (
          <div style={styles.offlineBanner}>
            📴 You are offline — showing cached guides
          </div>
        )}

        {!isOffline && (
          <div style={styles.onlineBanner}>
            ✅ Guides cached for offline use
          </div>
        )}

        {/* Search */}
        <div style={styles.searchBar}>
          <input style={styles.searchInput}
            type="text"
            placeholder={lang === 'bn' ? 'গাইড খুঁজুন...' : 'Search guides...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Guide grid */}
        <div style={styles.guideGrid}>
          {activeGuides.map((g) => (
            <div key={g.id}
              style={{ ...styles.guideCard, borderColor: g.color + '55' }}
              onClick={() => setSelected(g.id)}>
              <div style={{ ...styles.guideCardIcon, backgroundColor: g.bg }}>
                {g.icon}
              </div>
              <div style={styles.guideCardTitle}>
                {lang === 'bn' ? g.titleBn : g.title}
              </div>
              <div style={styles.guideCardSteps}>
                {g.steps.length} steps · {g.donts.length} warnings
              </div>
              <div style={{ ...styles.guideCardTag, backgroundColor: g.bg, color: g.color }}>
                🏥 {g.hospitalSpecialty}
              </div>
              <div style={{ ...styles.guideCardArrow, color: g.color }}>→</div>
            </div>
          ))}
        </div>

        {/* Emergency numbers */}
        <div style={styles.emergencyBox}>
          <div style={styles.emergencyTitle}>🆘 Emergency Numbers (Bangladesh)</div>
          <div style={styles.emergencyRow}>
            <a href="tel:999"   style={styles.emergencyCallBtn}>📞 999 — National Emergency</a>
            <a href="tel:16430" style={styles.emergencyCallBtn}>📞 16430 — Ambulance</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper:          { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:           { backgroundColor: '#FA7070', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  navLogo:          { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:      { fontWeight: 'bold', color: '#fff' },
  navRight:         { display: 'flex', gap: '8px', alignItems: 'center' },
  langBtn:          { border: '1.5px solid #fff', borderRadius: '8px', padding: '5px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  backBtn:          { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:        { maxWidth: '900px', margin: '0 auto', padding: '32px 20px' },
  header:           { textAlign: 'center', marginBottom: '20px' },
  title:            { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle:         { fontSize: '14px', color: '#888' },
  offlineBanner:    { backgroundColor: '#FEF9E7', border: '1px solid #fceab0', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', color: '#E67E22', marginBottom: '16px', textAlign: 'center' },
  onlineBanner:     { backgroundColor: '#C6EBC5', border: '1px solid #aed6a0', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', color: '#27AE60', marginBottom: '16px', textAlign: 'center' },
  searchBar:        { marginBottom: '20px' },
  searchInput:      { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #C6EBC5', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' },
  guideGrid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' },
  guideCard:        { backgroundColor: '#fff', borderRadius: '16px', padding: '22px 18px', border: '1.5px solid', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'transform 0.1s', display: 'flex', flexDirection: 'column', gap: '8px' },
  guideCardIcon:    { fontSize: '36px', borderRadius: '12px', padding: '10px', textAlign: 'center', marginBottom: '4px' },
  guideCardTitle:   { fontSize: '16px', fontWeight: 'bold', color: '#333' },
  guideCardSteps:   { fontSize: '11px', color: '#aaa' },
  guideCardTag:     { borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', display: 'inline-block' },
  guideCardArrow:   { fontSize: '18px', fontWeight: 'bold', alignSelf: 'flex-end', marginTop: 'auto' },
  // Detail view
  guideHeader:      { borderRadius: '16px', padding: '24px', border: '1.5px solid', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  guideHeaderIcon:  { fontSize: '48px' },
  guideTitle:       { fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px' },
  guideHospital:    { fontSize: '13px', color: '#555' },
  card:             { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #C6EBC5', marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  dontsCard:        { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1.5px solid #FA7070', marginBottom: '16px' },
  sectionTitle:     { fontSize: '16px', fontWeight: 'bold', color: '#27AE60', marginBottom: '16px' },
  sectionTitleRed:  { fontSize: '16px', fontWeight: 'bold', color: '#c0392b', marginBottom: '16px' },
  stepRow:          { display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' },
  stepNum:          { minWidth: '28px', height: '28px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: 0 },
  stepText:         { fontSize: '14px', color: '#333', lineHeight: '1.6', paddingTop: '4px' },
  dontRow:          { display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' },
  dontIcon:         { fontSize: '16px', flexShrink: 0 },
  dontText:         { fontSize: '14px', color: '#c0392b', lineHeight: '1.6' },
  hospitalBox:      { backgroundColor: '#fff', borderRadius: '14px', padding: '20px 24px', border: '1px solid #C6EBC5', marginBottom: '16px', textAlign: 'center' },
  hospitalBoxTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  hospitalBoxSub:   { fontSize: '13px', color: '#888', marginBottom: '14px' },
  hospitalBtn:      { padding: '10px 24px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  emergencyBox:     { backgroundColor: '#fdecea', borderRadius: '14px', padding: '18px 20px', border: '1px solid #f5c6cb', marginBottom: '20px' },
  emergencyTitle:   { fontSize: '14px', fontWeight: 'bold', color: '#c0392b', marginBottom: '12px' },
  emergencyRow:     { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  emergencyCallBtn: { padding: '10px 18px', backgroundColor: '#c0392b', color: '#fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none' },
};

export default FirstAidGuidePage;