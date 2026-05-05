import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ResponderDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [responder, setResponder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [msg, setMsg] = useState('');
  const [radiusInput, setRadiusInput] = useState(5);
  const [docs, setDocs] = useState([{ docName: '', docNote: '' }]);
  const [docLoading, setDocLoading] = useState(false);

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/responders/me', authHeader);
      setResponder(data);
      setRadiusInput(data.responseRadius);
    } catch {
      setResponder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      const { data } = await axios.put('/api/responders/availability', {}, authHeader);
      setMsg(data.message);
      fetchProfile();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Failed to update availability');
    }
  };

  const handleRadiusUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/responders/radius', { responseRadius: radiusInput }, authHeader);
      setMsg('✅ Response radius updated');
      fetchProfile();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Failed to update radius');
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    const valid = docs.filter((d) => d.docName.trim());
    if (!valid.length) { setMsg('❌ Add at least one document'); return; }
    setDocLoading(true);
    try {
      await axios.post('/api/responders/documents', { documents: valid }, authHeader);
      setMsg('✅ Documents submitted for review');
      setDocs([{ docName: '', docNote: '' }]);
      fetchProfile();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setDocLoading(false);
    }
  };

  if (loading) return <div style={styles.centerMsg}>Loading...</div>;

  if (!responder) {
    return (
      <div style={styles.wrapper}>
        <nav style={styles.navbar}>
          <div style={styles.navLogo}>🚑 <span style={styles.navLogoText}>GoldenHour</span></div>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </nav>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span style={{ fontSize: '48px' }}>🚑</span>
              <h3 style={{ color: '#333', margin: '16px 0 8px' }}>Not registered as a responder</h3>
              <p style={{ color: '#888', marginBottom: '20px' }}>
                Register to join the first responder network
              </p>
              <button style={styles.submitBtn} onClick={() => navigate('/responder/register')}>
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🚑 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.boardBtn} onClick={() => navigate('/sos')}>
            🆘 SOS Board
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🚑 {responder.name}</h1>
          <div style={styles.headerMeta}>
            <span style={styles.typeBadge}>{responder.responderType}</span>
            <span style={styles.locationText}>
              📍 {responder.location.district}, {responder.location.division}
            </span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: responder.isAvailable ? '#C6EBC5' : '#fdecea',
              color: responder.isAvailable ? '#27AE60' : '#c0392b',
            }}>
              {responder.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
            </span>
          </div>
        </div>

        {msg && (
          <div style={msg.includes('✅') || msg.includes('now available') ? styles.successMsg : styles.errorMsg}>
            {msg}
          </div>
        )}

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: '#FA7070' }}>{responder.totalResponses}</div>
            <div style={styles.statLabel}>🚑 Total Responses</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: '#27AE60' }}>{responder.successfulResponses}</div>
            <div style={styles.statLabel}>✅ Successful</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: '#2980b9' }}>{responder.responseRadius} km</div>
            <div style={styles.statLabel}>📡 Response Radius</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: '#8e44ad' }}>
              {responder.isVerified ? '✅' : '⏳'}
            </div>
            <div style={styles.statLabel}>Verification</div>
          </div>
        </div>

        {/* Toggle availability button */}
        <div style={styles.toggleRow}>
          <button
            style={{ ...styles.toggleBtn, backgroundColor: responder.isAvailable ? '#fdecea' : '#C6EBC5', color: responder.isAvailable ? '#c0392b' : '#27AE60', border: `1.5px solid ${responder.isAvailable ? '#c0392b' : '#27AE60'}` }}
            onClick={handleToggle}>
            {responder.isAvailable ? '🔴 Set Unavailable' : '🟢 Set Available'}
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['profile', 'radius', 'documents'].map((tab) => (
            <button key={tab}
              style={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}>
              {tab === 'profile' && '👤 My Profile'}
              {tab === 'radius' && '📡 Response Radius'}
              {tab === 'documents' && `📄 Documents (${responder.verificationDocuments?.length || 0})`}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>👤 Profile Details</h2>

            <div style={styles.infoReadOnly}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Phone</span>
                <span style={styles.infoValue}>{responder.phone}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Type</span>
                <span style={styles.infoValue}>{responder.responderType}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Location</span>
                <span style={styles.infoValue}>
                  {responder.location.area && `${responder.location.area}, `}
                  {responder.location.district}, {responder.location.division}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Member Since</span>
                <span style={styles.infoValue}>
                  {new Date(responder.createdAt).toLocaleDateString('en-BD')}
                </span>
              </div>
            </div>

            {responder.skills?.length > 0 && (
              <>
                <div style={styles.sectionLabel}>🩺 Skills</div>
                <div style={styles.chipRow}>
                  {responder.skills.map((s, i) => (
                    <span key={i} style={styles.chip}>{s}</span>
                  ))}
                </div>
              </>
            )}

            {responder.certifications?.length > 0 && (
              <>
                <div style={styles.sectionLabel}>📄 Certifications</div>
                {responder.certifications.map((c, i) => (
                  <div key={i} style={styles.certCard}>
                    <div style={styles.certName}>📜 {c.certName}</div>
                    {c.issuedYear && <div style={styles.certMeta}>Issued: {c.issuedYear}</div>}
                    {c.certNote && <div style={styles.certMeta}>{c.certNote}</div>}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Radius Tab ── */}
        {activeTab === 'radius' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📡 Response Radius</h2>
            <p style={styles.cardSub}>
              Set how far you are willing to travel to respond to emergencies.
            </p>
            <form onSubmit={handleRadiusUpdate}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Radius: <strong style={{ color: '#FA7070' }}>{radiusInput} km</strong>
                </label>
                <input type="range" min="1" max="50" value={radiusInput}
                  style={styles.slider}
                  onChange={(e) => setRadiusInput(Number(e.target.value))} />
                <div style={styles.sliderLabels}>
                  <span>1 km</span><span>25 km</span><span>50 km</span>
                </div>
              </div>
              <button style={styles.submitBtn} type="submit">💾 Save Radius</button>
            </form>
          </div>
        )}

        {/* ── Documents Tab ── */}
        {activeTab === 'documents' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📄 Verification Documents</h2>
            <p style={styles.cardSub}>
              Submit your ID, certifications, or any proof of medical training for admin verification.
            </p>

            {responder.verificationDocuments?.length > 0 && (
              <div style={styles.prevDocs}>
                <div style={styles.prevDocsTitle}>
                  Previously submitted ({responder.verificationDocuments.length})
                </div>
                {responder.verificationDocuments.map((d, i) => (
                  <div key={i} style={styles.prevDocRow}>
                    <span style={styles.prevDocName}>📄 {d.docName}</span>
                    {d.docNote && <span style={styles.prevDocNote}>{d.docNote}</span>}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleDocSubmit}>
              {docs.map((doc, i) => (
                <div key={i} style={styles.docRow}>
                  <div style={{ flex: 2 }}>
                    <label style={styles.label}>Document Name *</label>
                    <input style={styles.input} type="text"
                      placeholder="e.g. National ID / BLS Certificate"
                      value={doc.docName}
                      onChange={(e) => {
                        const updated = [...docs];
                        updated[i].docName = e.target.value;
                        setDocs(updated);
                      }} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={styles.label}>Note (optional)</label>
                    <input style={styles.input} type="text"
                      placeholder="e.g. Issued by Red Crescent"
                      value={doc.docNote}
                      onChange={(e) => {
                        const updated = [...docs];
                        updated[i].docNote = e.target.value;
                        setDocs(updated);
                      }} />
                  </div>
                  {docs.length > 1 && (
                    <button type="button" style={styles.removeBtn}
                      onClick={() => setDocs(docs.filter((_, idx) => idx !== i))}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" style={styles.addBtn}
                onClick={() => setDocs([...docs, { docName: '', docNote: '' }])}>
                + Add Another Document
              </button>
              <button style={styles.submitBtn} type="submit" disabled={docLoading}>
                {docLoading ? 'Submitting...' : '📤 Submit Documents'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar: { backgroundColor: '#FA7070', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLogo: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText: { fontWeight: 'bold', color: '#fff' },
  navRight: { display: 'flex', gap: '8px' },
  boardBtn: { backgroundColor: '#fff', color: '#FA7070', border: 'none', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  backBtn: { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container: { maxWidth: '800px', margin: '0 auto', padding: '32px 20px' },
  header: { textAlign: 'center', marginBottom: '16px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 8px' },
  headerMeta: { display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  typeBadge: { backgroundColor: '#e8f4fd', color: '#2980b9', borderRadius: '12px', padding: '3px 12px', fontSize: '12px', fontWeight: 'bold' },
  locationText: { fontSize: '13px', color: '#888' },
  statusBadge: { borderRadius: '12px', padding: '3px 12px', fontSize: '12px', fontWeight: 'bold' },
  successMsg: { backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  errorMsg: { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' },
  statCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #C6EBC5' },
  statNum: { fontSize: '24px', fontWeight: 'bold' },
  statLabel: { fontSize: '11px', color: '#aaa', marginTop: '4px' },
  toggleRow: { marginBottom: '20px', display: 'flex', justifyContent: 'center' },
  toggleBtn: { padding: '10px 28px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #C6EBC5', backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  tabActive: { padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #FA7070', backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5', marginBottom: '20px' },
  cardTitle: { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub: { fontSize: '13px', color: '#888', marginBottom: '20px' },
  infoReadOnly: { backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '16px', border: '1px solid #C6EBC5', marginBottom: '20px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '4px' },
  infoLabel: { fontSize: '12px', color: '#aaa', fontWeight: '600' },
  infoValue: { fontSize: '13px', color: '#333', fontWeight: '500' },
  sectionLabel: { fontSize: '13px', fontWeight: 'bold', color: '#555', margin: '16px 0 10px' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: { backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '600' },
  certCard: { backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '12px 14px', border: '1px solid #C6EBC5', marginBottom: '8px' },
  certName: { fontSize: '13px', fontWeight: '600', color: '#333' },
  certMeta: { fontSize: '12px', color: '#888', marginTop: '2px' },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333' },
  slider: { width: '100%', accentColor: '#FA7070' },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginTop: '4px' },
  prevDocs: { backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '14px', border: '1px solid #C6EBC5', marginBottom: '20px' },
  prevDocsTitle: { fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '8px' },
  prevDocRow: { display: 'flex', gap: '12px', padding: '4px 0' },
  prevDocName: { fontSize: '13px', color: '#333', fontWeight: '500' },
  prevDocNote: { fontSize: '12px', color: '#888' },
  docRow: { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '12px' },
  removeBtn: { padding: '8px 10px', backgroundColor: '#fdecea', color: '#c0392b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' },
  addBtn: { padding: '8px 16px', backgroundColor: '#FEFDEC', color: '#FA7070', border: '1.5px dashed #FA7070', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginBottom: '16px', display: 'block' },
  submitBtn: { padding: '11px 28px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  centerMsg: { textAlign: 'center', padding: '80px', color: '#888', fontFamily: 'sans-serif' },
};

export default ResponderDashboardPage;