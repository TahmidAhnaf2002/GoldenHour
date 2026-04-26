import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const resourceTypes = [
  'General Bed', 'ICU', 'CCU', 'Ventilator', 'Oxygen Bed',
];

const resourceIcons = {
  'General Bed': '🛏️',
  'ICU':         '🏥',
  'CCU':         '❤️',
  'Ventilator':  '💨',
  'Oxygen Bed':  '🫁',
};

const urgencyConfig = {
  Critical: { bg: '#fdecea', color: '#c0392b', icon: '🚨' },
  Urgent:   { bg: '#FEF9E7', color: '#E67E22', icon: '⚠️' },
  Normal:   { bg: '#C6EBC5', color: '#27AE60', icon: '🔔' },
};

const statusConfig = {
  Waiting:   { bg: '#e8f4fd', color: '#2980b9' },
  Notified:  { bg: '#FEF9E7', color: '#E67E22' },
  Admitted:  { bg: '#C6EBC5', color: '#27AE60' },
  Cancelled: { bg: '#f5f5f5', color: '#aaa'    },
};

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const WaitlistPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myWaitlist, setMyWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('mine'); // 'mine' | 'join'

  // Hospital search for join form
  const [hospitals, setHospitals] = useState([]);
  const [hospSearchDiv, setHospSearchDiv] = useState('');
  const [hospLoading, setHospLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Join form
  const [joinForm, setJoinForm] = useState({
    resourceType: '',
    urgency: 'Urgent',
    patientName: '',
    patientAge: '',
    contactNumber: '',
    note: '',
  });
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };

  useEffect(() => {
    if (user) fetchMyWaitlist();
  }, []);

  const fetchMyWaitlist = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/waitlist/mine', authHeader);
      setMyWaitlist(data.waitlist);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const searchHospitals = async () => {
    setHospLoading(true);
    try {
      const params = {};
      if (hospSearchDiv) params.division = hospSearchDiv;
      const { data } = await axios.get('/api/hospitals', { params });
      setHospitals(data.hospitals);
    } catch { /* silent */ }
    finally { setHospLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'join') searchHospitals();
  }, [activeTab, hospSearchDiv]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!selectedHospital) {
      setJoinMsg('❌ Please select a hospital first');
      return;
    }
    setJoinLoading(true);
    setJoinMsg('');
    try {
      await axios.post(
        '/api/waitlist/join',
        {
          hospitalId: selectedHospital._id,
          resourceType: joinForm.resourceType,
          urgency: joinForm.urgency,
          patientName: joinForm.patientName,
          patientAge: joinForm.patientAge || undefined,
          contactNumber: joinForm.contactNumber,
          note: joinForm.note,
        },
        authHeader
      );
      setJoinMsg('✅ Added to waitlist!');
      setSelectedHospital(null);
      setJoinForm({
        resourceType: '', urgency: 'Urgent',
        patientName: '', patientAge: '', contactNumber: '', note: '',
      });
      fetchMyWaitlist();
      setTimeout(() => {
        setJoinMsg('');
        setActiveTab('mine');
      }, 2000);
    } catch (err) {
      setJoinMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Remove yourself from this waitlist?')) return;
    try {
      await axios.put('/api/waitlist/' + id + '/cancel', {}, authHeader);
      setMsg('✅ Removed from waitlist');
      fetchMyWaitlist();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed'); }
  };

  const handleAdmit = async (id) => {
    try {
      await axios.put('/api/waitlist/' + id + '/admit', {}, authHeader);
      setMsg('✅ Marked as admitted — congratulations!');
      fetchMyWaitlist();
      setTimeout(() => setMsg(''), 4000);
    } catch { setMsg('❌ Failed'); }
  };

  const hasNotifications = myWaitlist.some((e) => e.status === 'Notified');

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.hospitalsBtn} onClick={() => navigate('/hospitals')}>
            🏥 Hospital Board
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>📋</span>
          <h1 style={styles.title}>ICU & Bed Waitlist</h1>
          <p style={styles.subtitle}>
            Join a digital queue when hospital resources are full — get notified when available
          </p>
        </div>

        {/* Notification banner */}
        {hasNotifications && (
          <div style={styles.notifBanner}>
            🔔 <strong>You have a bed notification!</strong> A bed has become available for you.
            Check your waitlist entries below and contact the hospital immediately.
          </div>
        )}

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        <div style={styles.tabs}>
          <button
            style={activeTab === 'mine' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('mine')}
          >
            📋 My Waitlist ({myWaitlist.length})
          </button>
          <button
            style={activeTab === 'join' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('join')}
          >
            ➕ Join a Waitlist
          </button>
        </div>

        {/* ── My Waitlist Tab ── */}
        {activeTab === 'mine' && (
          <div>
            {loading && <div style={styles.centerMsg}>Loading your waitlist...</div>}

            {!loading && myWaitlist.length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '48px' }}>📋</span>
                <p style={{ color: '#888', marginTop: '12px', fontSize: '15px' }}>
                  You are not on any waitlist
                </p>
                <button style={styles.joinBtn} onClick={() => setActiveTab('join')}>
                  ➕ Join a Waitlist
                </button>
              </div>
            )}

            {myWaitlist.map((entry) => {
              const uc = urgencyConfig[entry.urgency] || urgencyConfig.Normal;
              const sc = statusConfig[entry.status] || statusConfig.Waiting;
              const isNotified = entry.status === 'Notified';

              return (
                <div
                  key={entry._id}
                  style={{
                    ...styles.entryCard,
                    ...(isNotified ? styles.entryCardNotified : {}),
                  }}
                >
                  {isNotified && (
                    <div style={styles.notifTag}>
                      🔔 BED AVAILABLE — Contact hospital NOW
                    </div>
                  )}

                  <div style={styles.entryTop}>
                    <div style={styles.entryLeft}>
                      <div style={styles.resourceRow}>
                        <span style={styles.resourceIcon}>
                          {resourceIcons[entry.resourceType]}
                        </span>
                        <span style={styles.resourceType}>{entry.resourceType}</span>
                      </div>
                      <div style={styles.hospitalName}>{entry.hospitalName}</div>
                      <div style={styles.hospitalLoc}>
                        📍 {entry.hospitalLocation?.district}, {entry.hospitalLocation?.division}
                      </div>
                    </div>

                    <div style={styles.entryRight}>
                      <div style={styles.positionBadge}>
                        <div style={styles.positionNum}>#{entry.position}</div>
                        <div style={styles.positionLabel}>in queue</div>
                        <div style={styles.queueTotal}>of {entry.totalInQueue}</div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.entryMeta}>
                    <span style={{ ...styles.urgencyBadge, backgroundColor: uc.bg, color: uc.color }}>
                      {uc.icon} {entry.urgency}
                    </span>
                    <span style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color }}>
                      {entry.status}
                    </span>
                    <span style={styles.metaChip}>👤 {entry.patientName}</span>
                    {entry.patientAge && (
                      <span style={styles.metaChip}>Age: {entry.patientAge}</span>
                    )}
                  </div>

                  {entry.note && (
                    <div style={styles.noteBox}>💬 {entry.note}</div>
                  )}

                  <div style={styles.entryFooter}>
                    <span style={styles.waitingSince}>
                      Waiting since {new Date(entry.createdAt).toLocaleDateString('en-BD')}
                    </span>
                    <div style={styles.entryActions}>
                      {isNotified && (
                        <button style={styles.admitBtn} onClick={() => handleAdmit(entry._id)}>
                          ✅ Mark Admitted
                        </button>
                      )}
                      <button style={styles.cancelBtn} onClick={() => handleCancel(entry._id)}>
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Join Waitlist Tab ── */}
        {activeTab === 'join' && (
          <div>
            {joinMsg && (
              <div style={joinMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                {joinMsg}
              </div>
            )}

            {/* Step 1 — Select hospital */}
            <div style={styles.stepCard}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNum}>1</span>
                <span style={styles.stepTitle}>Select a Hospital</span>
              </div>

              <div style={styles.hospSearchRow}>
                <select
                  style={styles.filterInput}
                  value={hospSearchDiv}
                  onChange={(e) => setHospSearchDiv(e.target.value)}
                >
                  <option value="">All Divisions</option>
                  {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <span style={styles.hospCount}>
                  {hospLoading ? 'Loading...' : `${hospitals.length} hospital(s)`}
                </span>
              </div>

              <div style={styles.hospList}>
                {hospitals.map((h) => (
                  <div
                    key={h._id}
                    style={{
                      ...styles.hospRow,
                      ...(selectedHospital?._id === h._id ? styles.hospRowSelected : {}),
                    }}
                    onClick={() => setSelectedHospital(h)}
                  >
                    <div style={styles.hospInfo}>
                      <div style={styles.hospName}>{h.name}</div>
                      <div style={styles.hospMeta}>
                        {h.hospitalType} · 📍 {h.location.district}, {h.location.division}
                      </div>
                    </div>
                    <div style={styles.hospResourceDots}>
                      {Object.entries(h.capacity).map(([key, val]) => (
                        <div key={key} style={{
                          ...styles.dot,
                          backgroundColor: val.available === 0 ? '#c0392b' : '#27AE60',
                        }}
                          title={`${key}: ${val.available}/${val.total}`}
                        />
                      ))}
                    </div>
                    {selectedHospital?._id === h._id && (
                      <span style={styles.selectedTick}>✅</span>
                    )}
                  </div>
                ))}
              </div>

              {selectedHospital && (
                <div style={styles.selectedHospBanner}>
                  ✅ Selected: <strong>{selectedHospital.name}</strong>
                </div>
              )}
            </div>

            {/* Step 2 — Fill form */}
            <div style={styles.stepCard}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNum}>2</span>
                <span style={styles.stepTitle}>Fill in Details</span>
              </div>

              <form onSubmit={handleJoin}>
                <div style={styles.sectionLabel}>Resource & Priority</div>
                <div style={styles.row}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Resource Needed *</label>
                    <select style={styles.input} value={joinForm.resourceType}
                      onChange={(e) => setJoinForm({ ...joinForm, resourceType: e.target.value })}
                      required>
                      <option value="">Select resource</option>
                      {resourceTypes.map((r) => (
                        <option key={r} value={r}>{resourceIcons[r]} {r}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Urgency Level *</label>
                    <div style={styles.urgencyRow}>
                      {['Critical', 'Urgent', 'Normal'].map((u) => {
                        const uc = urgencyConfig[u];
                        return (
                          <button
                            key={u} type="button"
                            style={{
                              ...styles.urgencyBtn,
                              ...(joinForm.urgency === u ? {
                                backgroundColor: uc.color,
                                color: '#fff',
                                border: `1.5px solid ${uc.color}`,
                              } : {}),
                            }}
                            onClick={() => setJoinForm({ ...joinForm, urgency: u })}
                          >
                            {uc.icon} {u}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={styles.sectionLabel}>Patient Information</div>
                <div style={styles.row}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Patient Name *</label>
                    <input style={styles.input} type="text"
                      placeholder="Name of the patient"
                      value={joinForm.patientName}
                      onChange={(e) => setJoinForm({ ...joinForm, patientName: e.target.value })}
                      required />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Patient Age</label>
                    <input style={styles.input} type="number" min="0" max="120"
                      placeholder="Age (optional)"
                      value={joinForm.patientAge}
                      onChange={(e) => setJoinForm({ ...joinForm, patientAge: e.target.value })} />
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Contact Number *</label>
                  <input style={styles.input} type="tel"
                    placeholder="01XXXXXXXXX"
                    value={joinForm.contactNumber}
                    onChange={(e) => setJoinForm({ ...joinForm, contactNumber: e.target.value })}
                    required />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Additional Note (optional)</label>
                  <textarea
                    style={{ ...styles.input, height: '70px', resize: 'vertical' }}
                    placeholder="e.g. post-surgery patient, requires ventilator support..."
                    value={joinForm.note}
                    onChange={(e) => setJoinForm({ ...joinForm, note: e.target.value })}
                  />
                </div>

                <div style={styles.priorityNote}>
                  ℹ️ <strong>Critical</strong> patients are placed first in queue regardless of when they joined.
                  Equal urgency entries are sorted by join time.
                </div>

                <button style={styles.submitBtn} type="submit" disabled={joinLoading}>
                  {joinLoading ? 'Joining...' : '📋 Join Waitlist'}
                </button>
              </form>
            </div>
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
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText: { fontWeight: 'bold', color: '#fff' },
  navRight: { display: 'flex', gap: '8px', alignItems: 'center' },
  hospitalsBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  backBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  container: { maxWidth: '800px', margin: '0 auto', padding: '32px 20px' },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
  notifBanner: {
    backgroundColor: '#FEF9E7', border: '2px solid #E67E22', borderRadius: '12px',
    padding: '14px 20px', fontSize: '14px', color: '#E67E22',
    fontWeight: '500', marginBottom: '20px', textAlign: 'center',
  },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  tabs: { display: 'flex', gap: '12px', marginBottom: '24px' },
  tab: {
    padding: '10px 24px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  tabActive: {
    padding: '10px 24px', borderRadius: '8px', border: '1.5px solid #FA7070',
    backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  centerMsg: { textAlign: 'center', color: '#888', padding: '40px' },
  emptyBox: {
    textAlign: 'center', padding: '60px', backgroundColor: '#fff',
    borderRadius: '16px', border: '1px solid #C6EBC5',
  },
  joinBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '12px',
  },
  entryCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '20px 24px',
    border: '1px solid #C6EBC5', marginBottom: '14px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  entryCardNotified: {
    border: '2px solid #E67E22',
    boxShadow: '0 4px 16px rgba(230,126,34,0.2)',
  },
  notifTag: {
    backgroundColor: '#FEF9E7', color: '#E67E22', borderRadius: '8px',
    padding: '8px 14px', fontSize: '13px', fontWeight: 'bold',
    marginBottom: '14px', textAlign: 'center',
  },
  entryTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '12px',
  },
  entryLeft: {},
  resourceRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  resourceIcon: { fontSize: '20px' },
  resourceType: { fontSize: '16px', fontWeight: 'bold', color: '#333' },
  hospitalName: { fontSize: '14px', fontWeight: '600', color: '#555' },
  hospitalLoc: { fontSize: '12px', color: '#aaa' },
  entryRight: { flexShrink: 0 },
  positionBadge: {
    backgroundColor: '#FA7070', borderRadius: '12px', padding: '10px 16px',
    textAlign: 'center', minWidth: '60px',
  },
  positionNum: { fontSize: '22px', fontWeight: 'bold', color: '#fff' },
  positionLabel: { fontSize: '10px', color: 'rgba(255,255,255,0.8)' },
  queueTotal: { fontSize: '10px', color: 'rgba(255,255,255,0.7)' },
  entryMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' },
  urgencyBadge: {
    borderRadius: '12px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: '12px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold',
  },
  metaChip: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '12px',
    padding: '3px 10px', fontSize: '12px', color: '#555',
  },
  noteBox: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '8px',
    padding: '8px 12px', fontSize: '12px', color: '#666', marginBottom: '10px',
  },
  entryFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '12px', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px',
  },
  waitingSince: { fontSize: '12px', color: '#aaa' },
  entryActions: { display: 'flex', gap: '8px' },
  admitBtn: {
    padding: '7px 14px', backgroundColor: '#C6EBC5', color: '#27AE60',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
  cancelBtn: {
    padding: '7px 14px', backgroundColor: '#fdecea', color: '#c0392b',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
  // Join form styles
  stepCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '24px',
    border: '1px solid #C6EBC5', marginBottom: '20px',
  },
  stepHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  stepNum: {
    backgroundColor: '#FA7070', color: '#fff', borderRadius: '50%',
    width: '28px', height: '28px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0,
  },
  stepTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333' },
  hospSearchRow: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' },
  filterInput: {
    padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '13px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none',
  },
  hospCount: { fontSize: '12px', color: '#aaa' },
  hospList: {
    display: 'flex', flexDirection: 'column', gap: '8px',
    maxHeight: '260px', overflowY: 'auto',
  },
  hospRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 14px', borderRadius: '10px',
    border: '1.5px solid #C6EBC5', cursor: 'pointer',
    backgroundColor: '#FEFDEC',
  },
  hospRowSelected: {
    border: '1.5px solid #FA7070',
    backgroundColor: '#fff5f5',
  },
  hospInfo: { flex: 1 },
  hospName: { fontSize: '13px', fontWeight: '600', color: '#333' },
  hospMeta: { fontSize: '11px', color: '#aaa' },
  hospResourceDots: { display: 'flex', gap: '3px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%' },
  selectedTick: { fontSize: '16px' },
  selectedHospBanner: {
    backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '8px',
    padding: '8px 14px', fontSize: '13px', marginTop: '12px',
  },
  sectionLabel: {
    fontSize: '13px', fontWeight: 'bold', color: '#FA7070',
    marginBottom: '12px', marginTop: '16px',
    paddingBottom: '6px', borderBottom: '1px solid #f0f0f0',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333',
  },
  urgencyRow: { display: 'flex', gap: '8px' },
  urgencyBtn: {
    flex: 1, padding: '8px 6px', borderRadius: '8px',
    border: '1.5px solid #C6EBC5', backgroundColor: '#fff',
    color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px',
  },
  priorityNote: {
    backgroundColor: '#e8f4fd', border: '1px solid #bee3f8', borderRadius: '8px',
    padding: '10px 14px', fontSize: '12px', color: '#2980b9',
    marginBottom: '16px',
  },
  submitBtn: {
    width: '100%', padding: '14px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default WaitlistPage;