import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const resourceTypes = [
  'General Beds', 'ICU', 'CCU', 'Ventilators',
  'Oxygen Beds', 'General Info',
];

const HospitalVerificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hospital, setHospital]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('score');
  const [msg, setMsg]               = useState('');

  // Document form
  const [docs, setDocs]           = useState([{ docName: '', docNote: '' }]);
  const [docLoading, setDocLoading] = useState(false);

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };

  useEffect(() => { fetchHospital(); }, []);

  const fetchHospital = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/hospitals/user/me', authHeader);
      setHospital(data);
    } catch { setHospital(null); }
    finally { setLoading(false); }
  };

  const addDocRow    = () => setDocs([...docs, { docName: '', docNote: '' }]);
  const removeDocRow = (i) => setDocs(docs.filter((_, idx) => idx !== i));
  const updateDoc    = (i, field, val) => {
    const updated = [...docs];
    updated[i][field] = val;
    setDocs(updated);
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    const valid = docs.filter((d) => d.docName.trim());
    if (!valid.length) { setMsg('❌ Add at least one document'); return; }
    setDocLoading(true);
    setMsg('');
    try {
      await axios.post('/api/hospitals/documents/submit', { documents: valid }, authHeader);
      setMsg('✅ Documents submitted for admin review');
      fetchHospital();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally { setDocLoading(false); }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#27AE60';
    if (score >= 50) return '#E67E22';
    return '#c0392b';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Reliable';
    if (score >= 50) return 'Moderate';
    return 'Unreliable';
  };

  const hoursSinceUpdate = hospital
    ? Math.floor((new Date() - new Date(hospital.lastUpdated)) / (1000 * 60 * 60))
    : 0;

  if (loading) return <div style={styles.centerMsg}>Loading...</div>;

  if (!hospital) {
    return (
      <div style={styles.wrapper}>
        <nav style={styles.navbar}>
          <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </nav>
        <div style={styles.container}>
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>🏥</span>
            <p style={{ color: '#888', marginTop: '12px' }}>No hospital registered</p>
            <button style={styles.regBtn} onClick={() => navigate('/hospitals/register')}>
              Register Hospital
            </button>
          </div>
        </div>
      </div>
    );
  }

  const score = hospital.reliabilityScore ?? 100;

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.dashBtn} onClick={() => navigate('/hospitals/dashboard')}>
            ⚙️ Dashboard
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏅 {hospital.name}</h1>
          <p style={styles.subtitle}>Verification & Reliability Management</p>
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        {/* Score overview */}
        <div style={styles.scoreCard}>
          <div style={styles.scoreLeft}>
            <div style={styles.scoreCircle}>
              <div style={{ ...styles.scoreNum, color: getScoreColor(score) }}>{score}</div>
              <div style={styles.scoreLabel}>/ 100</div>
            </div>
            <div>
              <div style={{ ...styles.scoreStatus, color: getScoreColor(score) }}>
                {getScoreLabel(score)}
              </div>
              <div style={styles.scoreSub}>Reliability Score</div>
            </div>
          </div>
          <div style={styles.scoreRight}>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Verification</span>
              <span style={{
                ...styles.verBadge,
                backgroundColor: hospital.isVerified ? '#C6EBC5' : '#FEF9E7',
                color:           hospital.isVerified ? '#27AE60' : '#E67E22',
              }}>
                {hospital.isVerified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Last Updated</span>
              <span style={{
                ...styles.updateAge,
                color: hoursSinceUpdate > 48 ? '#c0392b' : hoursSinceUpdate > 24 ? '#E67E22' : '#27AE60',
              }}>
                {hoursSinceUpdate === 0 ? 'Just now' : `${hoursSinceUpdate}h ago`}
              </span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Status</span>
              <span style={{
                ...styles.flagBadge,
                backgroundColor: hospital.isFlagged ? '#fdecea' : '#C6EBC5',
                color:           hospital.isFlagged ? '#c0392b' : '#27AE60',
              }}>
                {hospital.isFlagged ? '🚩 Flagged' : '✅ Active'}
              </span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Reports</span>
              <span style={styles.reportCount}>
                {hospital.reports?.filter((r) => !r.resolved).length || 0} unresolved
              </span>
            </div>
          </div>
        </div>

        {hospital.isFlagged && (
          <div style={styles.flagWarning}>
            🚩 Your hospital is flagged for not updating data in over 48 hours.
            Update your capacity data to restore active status.
          </div>
        )}

        {/* Score breakdown */}
        <div style={styles.breakdown}>
          <div style={styles.breakdownTitle}>📊 How your score is calculated</div>
          {[
            { label: 'Updated within 12 hours',   points: '+100', active: hoursSinceUpdate <= 12 },
            { label: 'Updated within 24 hours',   points: '-10',  active: hoursSinceUpdate > 12 && hoursSinceUpdate <= 24 },
            { label: 'Updated within 48 hours',   points: '-20',  active: hoursSinceUpdate > 24 && hoursSinceUpdate <= 48 },
            { label: 'Not updated in 48+ hours',  points: '-40',  active: hoursSinceUpdate > 48 },
            { label: 'Per unresolved report',      points: '-5',   active: (hospital.reports?.filter((r) => !r.resolved).length || 0) > 0 },
            { label: '20+ lifetime updates bonus', points: '+5',   active: (hospital.updateCount || 0) >= 20 },
          ].map((item, i) => (
            <div key={i} style={{ ...styles.breakdownRow, opacity: item.active ? 1 : 0.4 }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: item.active ? '#27AE60' : '#ddd',
              }} />
              <span style={styles.breakdownLabel}>{item.label}</span>
              <span style={{ ...styles.breakdownPts, color: item.points.startsWith('+') ? '#27AE60' : '#c0392b' }}>
                {item.points}
              </span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['score', 'documents', 'reports'].map((tab) => (
            <button key={tab}
              style={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}>
              {tab === 'score'     && '📊 Score Details'}
              {tab === 'documents' && '📄 Submit Documents'}
              {tab === 'reports'   && `📋 Reports (${hospital.reports?.filter((r) => !r.resolved).length || 0})`}
            </button>
          ))}
        </div>

        {/* ── Score Tab ── */}
        {activeTab === 'score' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📈 Reliability Tips</h2>
            <p style={styles.cardSub}>Total updates made: <strong>{hospital.updateCount || 0}</strong></p>
            <div style={styles.tipsGrid}>
              {[
                { icon: '🕐', tip: 'Update capacity at least once every 12 hours' },
                { icon: '✅', tip: 'Get verified by admin to boost patient trust' },
                { icon: '📋', tip: 'Resolve user reports quickly to protect your score' },
                { icon: '🚩', tip: 'Hospitals not updated in 48h are flagged and hidden' },
              ].map((t, i) => (
                <div key={i} style={styles.tipCard}>
                  <span style={{ fontSize: '20px' }}>{t.icon}</span>
                  <span style={styles.tipText}>{t.tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Documents Tab ── */}
        {activeTab === 'documents' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📄 Submit Verification Documents</h2>
            <p style={styles.cardSub}>
              Submit your hospital registration certificate, license, and any other
              documents for admin review.
            </p>

            {hospital.verificationDocuments?.length > 0 && (
              <div style={styles.prevDocs}>
                <div style={styles.prevDocsTitle}>
                  Previously submitted ({hospital.verificationDocuments.length})
                </div>
                {hospital.verificationDocuments.map((d, i) => (
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
                      placeholder="e.g. Hospital Registration Certificate"
                      value={doc.docName}
                      onChange={(e) => updateDoc(i, 'docName', e.target.value)} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={styles.label}>Note (optional)</label>
                    <input style={styles.input} type="text"
                      placeholder="e.g. Issued by DGHS 2024"
                      value={doc.docNote}
                      onChange={(e) => updateDoc(i, 'docNote', e.target.value)} />
                  </div>
                  {docs.length > 1 && (
                    <button type="button" style={styles.removeBtn}
                      onClick={() => removeDocRow(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" style={styles.addDocBtn} onClick={addDocRow}>
                + Add Another Document
              </button>
              <button style={styles.saveBtn} type="submit" disabled={docLoading}>
                {docLoading ? 'Submitting...' : '📤 Submit Documents'}
              </button>
            </form>
          </div>
        )}

        {/* ── Reports Tab ── */}
        {activeTab === 'reports' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📋 User Reports</h2>
            <p style={styles.cardSub}>
              Each unresolved report reduces your reliability score by 5 points.
            </p>
            {(!hospital.reports || hospital.reports.length === 0) && (
              <div style={styles.emptyNote}>No reports — keep up the great work! ✅</div>
            )}
            {hospital.reports?.map((r, i) => (
              <div key={i} style={{
                ...styles.reportRow,
                borderLeft: `4px solid ${r.resolved ? '#27AE60' : '#c0392b'}`,
              }}>
                <div style={styles.reportTop}>
                  <div>
                    <div style={styles.reportIssue}>{r.issue}</div>
                    <div style={styles.reportMeta}>
                      By {r.reporterName} · {r.resourceType} ·
                      {new Date(r.createdAt).toLocaleDateString('en-BD')}
                    </div>
                  </div>
                  <span style={{
                    ...styles.resolvedBadge,
                    backgroundColor: r.resolved ? '#C6EBC5' : '#fdecea',
                    color:           r.resolved ? '#27AE60' : '#c0392b',
                  }}>
                    {r.resolved ? '✅ Resolved' : '⚠️ Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
  navRight: { display: 'flex', gap: '10px' },
  dashBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  backBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  container: { maxWidth: '800px', margin: '0 auto', padding: '32px 20px' },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#888' },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  scoreCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '24px',
    border: '1px solid #C6EBC5', marginBottom: '16px',
    display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px',
  },
  scoreLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  scoreCircle: {
    backgroundColor: '#FEFDEC', border: '3px solid #C6EBC5', borderRadius: '50%',
    width: '70px', height: '70px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum:    { fontSize: '22px', fontWeight: 'bold', lineHeight: 1 },
  scoreLabel:  { fontSize: '10px', color: '#aaa' },
  scoreStatus: { fontSize: '16px', fontWeight: 'bold', marginBottom: '2px' },
  scoreSub:    { fontSize: '12px', color: '#888' },
  scoreRight:  { display: 'flex', flexDirection: 'column', gap: '8px' },
  metaRow:     { display: 'flex', alignItems: 'center', gap: '10px' },
  metaLabel:   { fontSize: '12px', color: '#aaa', width: '90px' },
  verBadge:    { borderRadius: '10px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold' },
  updateAge:   { fontSize: '13px', fontWeight: 'bold' },
  flagBadge:   { borderRadius: '10px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold' },
  reportCount: { fontSize: '13px', color: '#555', fontWeight: '600' },
  flagWarning: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '12px 16px',
    borderRadius: '10px', fontSize: '13px', fontWeight: '500', marginBottom: '16px',
    border: '1px solid #f5c6cb',
  },
  breakdown: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px',
    border: '1px solid #C6EBC5', marginBottom: '20px',
  },
  breakdownTitle: { fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '12px' },
  breakdownRow:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #f9f9f9' },
  breakdownLabel: { flex: 1, fontSize: '12px', color: '#555' },
  breakdownPts:   { fontSize: '12px', fontWeight: 'bold', width: '35px', textAlign: 'right' },
  tabs: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  tab: {
    padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  tabActive: {
    padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #FA7070',
    backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  card: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '28px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5',
  },
  cardTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub:   { fontSize: '13px', color: '#888', marginBottom: '20px' },
  tipsGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  tipCard: {
    backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '14px',
    border: '1px solid #C6EBC5', display: 'flex', alignItems: 'flex-start', gap: '10px',
  },
  tipText: { fontSize: '12px', color: '#555', lineHeight: '1.5' },
  prevDocs:      { backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '14px', border: '1px solid #C6EBC5', marginBottom: '20px' },
  prevDocsTitle: { fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '8px' },
  prevDocRow:    { display: 'flex', gap: '12px', padding: '4px 0' },
  prevDocName:   { fontSize: '13px', color: '#333', fontWeight: '500' },
  prevDocNote:   { fontSize: '12px', color: '#888' },
  docRow: { display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '12px', flexWrap: 'wrap' },
  addDocBtn: {
    padding: '8px 16px', backgroundColor: '#FEFDEC', color: '#FA7070',
    border: '1.5px dashed #FA7070', borderRadius: '8px', fontWeight: 'bold',
    cursor: 'pointer', fontSize: '13px', marginBottom: '16px', display: 'block',
  },
  removeBtn: {
    padding: '8px 10px', backgroundColor: '#fdecea', color: '#c0392b',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', alignSelf: 'flex-end',
  },
  saveBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '12px 28px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  emptyNote: { fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '20px' },
  reportRow: {
    backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '14px 16px',
    marginBottom: '10px', border: '1px solid #f0f0f0',
  },
  reportTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' },
  reportIssue:   { fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  reportMeta:    { fontSize: '12px', color: '#888' },
  resolvedBadge: { borderRadius: '10px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold' },
  emptyBox: { textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #C6EBC5' },
  regBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '12px',
  },
  centerMsg: { textAlign: 'center', padding: '80px', color: '#888', fontFamily: 'sans-serif' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333',
  },
};

export default HospitalVerificationPage;