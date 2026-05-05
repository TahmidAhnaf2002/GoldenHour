import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const districts = {
  Dhaka:      ['Dhaka', 'Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Tangail'],
  Chittagong: ['Chittagong', "Cox's Bazar", 'Comilla', 'Noakhali', 'Feni', 'Brahmanbaria'],
  Rajshahi:   ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Natore', 'Chapainawabganj'],
  Khulna:     ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Narail', 'Magura'],
  Barisal:    ['Barisal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna'],
  Sylhet:     ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur:    ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrokona'],
};

const emergencyTypes = [
  { type: 'Cardiac Arrest',       icon: '❤️' },
  { type: 'Accident / Trauma',    icon: '🚗' },
  { type: 'Choking',              icon: '😮' },
  { type: 'Unconscious Person',   icon: '😵' },
  { type: 'Snake Bite',           icon: '🐍' },
  { type: 'Burns',                icon: '🔥' },
  { type: 'Childbirth',           icon: '👶' },
  { type: 'Seizure',              icon: '⚡' },
  { type: 'Other',                icon: '🆘' },
];

const timeAgo = (date) => {
  const mins = Math.floor((new Date() - new Date(date)) / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const statusColor = (status) => {
  if (status === 'Active')    return { bg: '#fdecea', color: '#c0392b' };
  if (status === 'Responded') return { bg: '#FEF9E7', color: '#E67E22' };
  if (status === 'Resolved')  return { bg: '#C6EBC5', color: '#27AE60' };
  return                             { bg: '#f5f5f5', color: '#aaa' };
};

const SOSPage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [view, setView]         = useState('send');
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState({
    emergencyType: '', description: '', requesterPhone: '',
    location: { division: '', district: '', area: '', address: '' },
  });
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');
  const [mySOSList, setMySOSList]   = useState([]);
  const [activeList, setActiveList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  // ✅ Fixed — moved out of .map()
  const [etaInputs, setEtaInputs] = useState({});

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };

  useEffect(() => {
    if (view === 'mine')   fetchMySOS();
    if (view === 'active') fetchActiveList();
  }, [view]);

  const fetchMySOS = async () => {
    setListLoading(true);
    try {
      const { data } = await axios.get('/api/sos/mine', authHeader);
      setMySOSList(data);
    } catch { setMySOSList([]); }
    finally  { setListLoading(false); }
  };

  const fetchActiveList = async () => {
    setListLoading(true);
    try {
      const { data } = await axios.get('/api/sos/active', authHeader);
      setActiveList(data.sosList);
    } catch { setActiveList([]); }
    finally  { setListLoading(false); }
  };

  const handleSend = async () => {
    if (!form.requesterPhone.trim()) { setMsg('❌ Please enter your phone number'); return; }
    setLoading(true);
    setMsg('');
    try {
      const { data } = await axios.post('/api/sos/create', form, authHeader);
      setResult(data);
      setStep(4);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed to send SOS'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.put(`/api/sos/${id}/cancel`, {}, authHeader);
      fetchMySOS();
    } catch { alert('Failed to cancel'); }
  };

  const handleRespond = async (id, status, etaMinutes) => {
    try {
      await axios.post(`/api/sos/${id}/respond`, { status, etaMinutes }, authHeader);
      fetchActiveList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const resetForm = () => {
    setStep(1);
    setForm({ emergencyType: '', description: '', requesterPhone: '', location: { division: '', district: '', area: '', address: '' } });
    setResult(null);
    setMsg('');
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🆘 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.responderBtn} onClick={() => navigate('/responder/dashboard')}>
            🚑 Responder Dashboard
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '48px' }}>🆘</span>
          <h1 style={styles.title}>Emergency SOS Broadcast</h1>
          <p style={styles.subtitle}>
            Send an instant alert to all nearby first responders
          </p>
        </div>

        {/* View Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'send',   label: '🆘 Send SOS' },
            { key: 'mine',   label: '📋 My SOS History' },
            { key: 'active', label: '📡 Active Broadcasts' },
          ].map((t) => (
            <button key={t.key}
              style={view === t.key ? styles.tabActive : styles.tab}
              onClick={() => { setView(t.key); resetForm(); }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── SEND SOS VIEW ── */}
        {view === 'send' && (
          <div style={styles.card}>
            {msg && <div style={styles.errorMsg}>{msg}</div>}

            {step === 1 && (
              <>
                <h2 style={styles.cardTitle}>Step 1 — What is the emergency?</h2>
                <p style={styles.cardSub}>Select the type of emergency</p>
                <div style={styles.typeGrid}>
                  {emergencyTypes.map(({ type, icon }) => (
                    <div key={type}
                      style={{ ...styles.typeCard, ...(form.emergencyType === type ? styles.typeCardActive : {}) }}
                      onClick={() => setForm({ ...form, emergencyType: type })}>
                      <span style={{ fontSize: '28px' }}>{icon}</span>
                      <span style={styles.typeLabel}>{type}</span>
                    </div>
                  ))}
                </div>
                <button style={{ ...styles.nextBtn, opacity: form.emergencyType ? 1 : 0.4 }}
                  disabled={!form.emergencyType}
                  onClick={() => setStep(2)}>
                  Next →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={styles.cardTitle}>Step 2 — Where is the emergency?</h2>
                <p style={styles.cardSub}>Provide your location so responders can find you</p>
                <div style={styles.formRow}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Division *</label>
                    <select style={styles.input}
                      value={form.location.division}
                      onChange={(e) => setForm({ ...form, location: { ...form.location, division: e.target.value, district: '' } })}>
                      <option value="">Select Division</option>
                      {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>District *</label>
                    <select style={styles.input}
                      value={form.location.district}
                      disabled={!form.location.division}
                      onChange={(e) => setForm({ ...form, location: { ...form.location, district: e.target.value } })}>
                      <option value="">Select District</option>
                      {form.location.division && districts[form.location.division]?.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Area (optional)</label>
                  <input style={styles.input} type="text" placeholder="e.g. Mirpur 10"
                    value={form.location.area}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, area: e.target.value } })} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Address / Landmark (optional)</label>
                  <input style={styles.input} type="text" placeholder="e.g. Near Mirpur DOHS Gate 2"
                    value={form.location.address}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })} />
                </div>
                <div style={styles.stepBtns}>
                  <button style={styles.backStepBtn} onClick={() => setStep(1)}>← Back</button>
                  <button style={{ ...styles.nextBtn, opacity: form.location.district ? 1 : 0.4 }}
                    disabled={!form.location.district}
                    onClick={() => setStep(3)}>
                    Next →
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 style={styles.cardTitle}>Step 3 — Confirm & Broadcast</h2>
                <p style={styles.cardSub}>Review the details and send the SOS alert</p>
                <div style={styles.confirmBox}>
                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Emergency Type</span>
                    <span style={styles.confirmValue}>
                      {emergencyTypes.find((e) => e.type === form.emergencyType)?.icon} {form.emergencyType}
                    </span>
                  </div>
                  <div style={styles.confirmRow}>
                    <span style={styles.confirmLabel}>Location</span>
                    <span style={styles.confirmValue}>
                      {form.location.area && `${form.location.area}, `}
                      {form.location.district}, {form.location.division}
                    </span>
                  </div>
                  {form.location.address && (
                    <div style={styles.confirmRow}>
                      <span style={styles.confirmLabel}>Address</span>
                      <span style={styles.confirmValue}>{form.location.address}</span>
                    </div>
                  )}
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Your Phone Number * (so responders can call you)</label>
                  <input style={styles.input} type="tel" placeholder="01XXXXXXXXX"
                    value={form.requesterPhone}
                    onChange={(e) => setForm({ ...form, requesterPhone: e.target.value })} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Additional Details (optional)</label>
                  <input style={styles.input} type="text"
                    placeholder="e.g. 45-year-old male, not breathing"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={styles.stepBtns}>
                  <button style={styles.backStepBtn} onClick={() => setStep(2)}>← Back</button>
                  <button style={styles.sosBtn} onClick={handleSend} disabled={loading}>
                    {loading ? 'Broadcasting...' : '🆘 SEND SOS NOW'}
                  </button>
                </div>
              </>
            )}

            {step === 4 && result && (
              <div style={styles.successBox}>
                <div style={{ fontSize: '52px', marginBottom: '12px' }}>✅</div>
                <h2 style={styles.successTitle}>SOS Broadcast Sent!</h2>
                <p style={styles.successSub}>{result.message}</p>
                <div style={styles.broadcastCount}>
                  📡 <strong>{result.broadcastCount}</strong> responder(s) notified in your area
                </div>
                <div style={styles.sosIdBox}>
                  SOS ID: <strong>#{result.sos._id.slice(-6).toUpperCase()}</strong>
                </div>
                <p style={{ fontSize: '13px', color: '#888', marginTop: '12px' }}>
                  Responders who accept will appear in your SOS history below.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                  <button style={styles.nextBtn} onClick={() => { setView('mine'); resetForm(); }}>
                    📋 View My SOS
                  </button>
                  <button style={styles.backStepBtn} onClick={resetForm}>
                    Send Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MY SOS VIEW ── */}
        {view === 'mine' && (
          <div>
            {listLoading && <div style={styles.centerMsg}>Loading...</div>}
            {!listLoading && mySOSList.length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '40px' }}>🆘</span>
                <p style={{ color: '#888', marginTop: '12px' }}>No SOS requests yet</p>
              </div>
            )}
            {mySOSList.map((sos) => {
              const sc = statusColor(sos.status);
              const eInfo = emergencyTypes.find((e) => e.type === sos.emergencyType);
              return (
                <div key={sos._id} style={styles.sosCard}>
                  <div style={styles.sosCardTop}>
                    <div>
                      <div style={styles.sosType}>{eInfo?.icon} {sos.emergencyType}</div>
                      <div style={styles.sosMeta}>
                        📍 {sos.location.area && `${sos.location.area}, `}
                        {sos.location.district}, {sos.location.division}
                        {' · '}{timeAgo(sos.createdAt)}
                      </div>
                    </div>
                    <span style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color }}>
                      {sos.status}
                    </span>
                  </div>

                  {sos.responses?.length > 0 && (
                    <div style={styles.respondersList}>
                      <div style={styles.respondersTitle}>
                        🚑 {sos.responses.length} Responder(s) Coming
                      </div>
                      {sos.responses.map((r, i) => (
                        <div key={i} style={styles.responderRow}>
                          <div>
                            <div style={styles.responderName}>{r.responderName}</div>
                            <div style={styles.responderMeta}>{r.responderType}</div>
                          </div>
                          <div style={styles.responderRight}>
                            {r.etaMinutes && (
                              <span style={styles.etaBadge}>⏱ {r.etaMinutes} min ETA</span>
                            )}
                            <a href={'tel:' + r.phone} style={styles.callBtn}>📞 Call</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sos.status === 'Active' && (
                    <button style={styles.cancelBtn} onClick={() => handleCancel(sos._id)}>
                      Cancel SOS
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── ACTIVE BROADCASTS VIEW ── */}
        {view === 'active' && (
          <div>
            <div style={styles.activeHeader}>
              📡 Active SOS broadcasts near you — accept to notify the requester
            </div>
            {listLoading && <div style={styles.centerMsg}>Loading...</div>}
            {!listLoading && activeList.length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '40px' }}>📡</span>
                <p style={{ color: '#888', marginTop: '12px' }}>No active SOS broadcasts</p>
              </div>
            )}
            {/* ✅ No useState inside map anymore */}
            {activeList.map((sos) => {
              const sc    = statusColor(sos.status);
              const eInfo = emergencyTypes.find((e) => e.type === sos.emergencyType);
              return (
                <div key={sos._id} style={styles.sosCard}>
                  <div style={styles.sosCardTop}>
                    <div>
                      <div style={styles.sosType}>{eInfo?.icon} {sos.emergencyType}</div>
                      <div style={styles.sosMeta}>
                        👤 {sos.requesterName} · 📞 {sos.requesterPhone}
                      </div>
                      <div style={styles.sosMeta}>
                        📍 {sos.location.area && `${sos.location.area}, `}
                        {sos.location.district}, {sos.location.division}
                        {sos.location.address && ` · ${sos.location.address}`}
                      </div>
                      {sos.description && (
                        <div style={styles.sosDesc}>📝 {sos.description}</div>
                      )}
                      <div style={styles.sosMeta}>{timeAgo(sos.createdAt)}</div>
                    </div>
                    <span style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color }}>
                      {sos.status}
                    </span>
                  </div>

                  {sos.responses?.length > 0 && (
                    <div style={styles.respondersTitle}>
                      ✅ {sos.responses.length} responder(s) already responding
                    </div>
                  )}

                  <div style={styles.respondActionRow}>
                    {/* ✅ Uses etaInputs[sos._id] instead of local useState */}
                    <input style={{ ...styles.input, maxWidth: '120px' }}
                      type="number" min="1" placeholder="ETA (min)"
                      value={etaInputs[sos._id] || ''}
                      onChange={(e) => setEtaInputs({ ...etaInputs, [sos._id]: e.target.value })} />
                    <button style={styles.acceptBtn}
                      onClick={() => handleRespond(sos._id, 'Accepted', Number(etaInputs[sos._id]) || null)}>
                      ✅ Accept
                    </button>
                    <button style={styles.declineBtn}
                      onClick={() => handleRespond(sos._id, 'Declined', null)}>
                      ✕ Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper:       { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:        { backgroundColor: '#c0392b', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  navLogo:       { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:   { fontWeight: 'bold', color: '#fff' },
  navRight:      { display: 'flex', gap: '8px' },
  responderBtn:  { backgroundColor: '#fff', color: '#c0392b', border: 'none', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  backBtn:       { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:     { maxWidth: '800px', margin: '0 auto', padding: '32px 20px' },
  header:        { textAlign: 'center', marginBottom: '24px' },
  title:         { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle:      { fontSize: '14px', color: '#888' },
  tabs:          { display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' },
  tab:           { padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #C6EBC5', backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  tabActive:     { padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #c0392b', backgroundColor: '#c0392b', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  card:          { backgroundColor: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5' },
  cardTitle:     { fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub:       { fontSize: '13px', color: '#888', marginBottom: '20px' },
  errorMsg:      { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  typeGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '20px' },
  typeCard:      { padding: '16px 10px', borderRadius: '12px', border: '1.5px solid #C6EBC5', backgroundColor: '#FEFDEC', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  typeCardActive:{ backgroundColor: '#fdecea', borderColor: '#c0392b' },
  typeLabel:     { fontSize: '12px', fontWeight: '600', color: '#333' },
  formRow:       { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  fieldGroup:    { flex: 1, minWidth: '180px', marginBottom: '16px' },
  label:         { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input:         { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333' },
  stepBtns:      { display: 'flex', gap: '12px', marginTop: '8px' },
  nextBtn:       { padding: '11px 28px', backgroundColor: '#c0392b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  backStepBtn:   { padding: '11px 20px', backgroundColor: '#f5f5f5', color: '#555', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  sosBtn:        { padding: '12px 32px', backgroundColor: '#c0392b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', letterSpacing: '0.5px' },
  confirmBox:    { backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '16px', border: '1px solid #C6EBC5', marginBottom: '20px' },
  confirmRow:    { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' },
  confirmLabel:  { fontSize: '12px', color: '#aaa', fontWeight: '600' },
  confirmValue:  { fontSize: '13px', color: '#333', fontWeight: '500' },
  successBox:    { textAlign: 'center', padding: '20px 0' },
  successTitle:  { fontSize: '22px', fontWeight: 'bold', color: '#27AE60', marginBottom: '8px' },
  successSub:    { fontSize: '14px', color: '#555', marginBottom: '16px' },
  broadcastCount:{ backgroundColor: '#C6EBC5', color: '#27AE60', display: 'inline-block', borderRadius: '10px', padding: '8px 20px', fontSize: '14px', fontWeight: '600', marginBottom: '10px' },
  sosIdBox:      { fontSize: '13px', color: '#888', marginTop: '8px' },
  sosCard:       { backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #C6EBC5', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  sosCardTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' },
  sosType:       { fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  sosMeta:       { fontSize: '12px', color: '#888', marginBottom: '2px' },
  sosDesc:       { fontSize: '12px', color: '#555', fontStyle: 'italic', marginBottom: '2px' },
  statusBadge:   { borderRadius: '12px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold' },
  respondersList:{ backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '12px', border: '1px solid #C6EBC5', marginBottom: '10px' },
  respondersTitle:{ fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '8px' },
  responderRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '6px' },
  responderName: { fontSize: '13px', fontWeight: '600', color: '#333' },
  responderMeta: { fontSize: '11px', color: '#888' },
  responderRight:{ display: 'flex', gap: '8px', alignItems: 'center' },
  etaBadge:      { backgroundColor: '#FEF9E7', color: '#E67E22', borderRadius: '10px', padding: '3px 10px', fontSize: '11px', fontWeight: 'bold' },
  callBtn:       { backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' },
  cancelBtn:     { padding: '7px 16px', backgroundColor: '#fdecea', color: '#c0392b', border: '1px solid #c0392b', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  activeHeader:  { backgroundColor: '#FEF9E7', border: '1px solid #fceab0', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#E67E22', fontWeight: '500', marginBottom: '16px' },
  respondActionRow: { display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' },
  acceptBtn:     { padding: '8px 18px', backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  declineBtn:    { padding: '8px 18px', backgroundColor: '#f5f5f5', color: '#888', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  emptyBox:      { textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #C6EBC5' },
  centerMsg:     { textAlign: 'center', padding: '40px', color: '#888' },
};

export default SOSPage;