import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const resourceTypes = [
  'General Bed', 'ICU', 'CCU', 'Ventilator', 'Oxygen Bed',
];

const resourceIcons = {
  'General Bed': '🛏️', 'ICU': '🏥', 'CCU': '❤️',
  'Ventilator': '💨', 'Oxygen Bed': '🫁',
};

const urgencyConfig = {
  Critical: { bg: '#fdecea', color: '#c0392b', icon: '🚨' },
  Urgent:   { bg: '#FEF9E7', color: '#E67E22', icon: '⚠️' },
  Normal:   { bg: '#C6EBC5', color: '#27AE60', icon: '🔔' },
};

const HospitalWaitlistPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState('ICU');
  const [waitlist, setWaitlist] = useState([]);
  const [stats, setStats] = useState([]);
  const [msg, setMsg] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };

  useEffect(() => {
    fetchMyHospital();
  }, []);

  useEffect(() => {
    if (hospital) {
      fetchWaitlist();
      fetchStats();
    }
  }, [hospital, selectedResource]);

  const fetchMyHospital = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/hospitals/user/me', authHeader);
      setHospital(data);
    } catch {
      setHospital(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaitlist = async () => {
    try {
      const { data } = await axios.get(
        '/api/waitlist/hospital/' + hospital._id,
        { ...authHeader, params: { resourceType: selectedResource } }
      );
      setWaitlist(data.waitlist);
    } catch { /* silent */ }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/waitlist/stats/' + hospital._id);
      setStats(data.stats);
    } catch { /* silent */ }
  };

  const handleNotify = async () => {
    setNotifyLoading(true);
    setMsg('');
    try {
      const { data } = await axios.put(
        '/api/waitlist/notify',
        { hospitalId: hospital._id, resourceType: selectedResource },
        authHeader
      );
      setMsg('✅ ' + data.message);
      fetchWaitlist();
      fetchStats();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setNotifyLoading(false);
    }
  };

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

  const currentStat = stats.find((s) => s.resourceType === selectedResource);

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.dashBtn} onClick={() => navigate('/hospitals/dashboard')}>
            ⚙️ Hospital Dashboard
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📋 Waitlist Manager</h1>
          <p style={styles.hospName}>{hospital.name}</p>
        </div>

        {/* Stats overview */}
        <div style={styles.statsRow}>
          {stats.map((s) => (
            <div
              key={s.resourceType}
              style={{
                ...styles.statCard,
                ...(selectedResource === s.resourceType ? styles.statCardActive : {}),
              }}
              onClick={() => setSelectedResource(s.resourceType)}
            >
              <div style={styles.statIcon}>{resourceIcons[s.resourceType]}</div>
              <div style={{ ...styles.statNum, color: s.waiting > 0 ? '#FA7070' : '#27AE60' }}>
                {s.waiting}
              </div>
              <div style={styles.statLabel}>{s.resourceType}</div>
            </div>
          ))}
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        {/* Resource tabs */}
        <div style={styles.resourceTabs}>
          {resourceTypes.map((rt) => (
            <button
              key={rt}
              style={selectedResource === rt ? styles.resTabActive : styles.resTab}
              onClick={() => setSelectedResource(rt)}
            >
              {resourceIcons[rt]} {rt}
              {stats.find((s) => s.resourceType === rt)?.waiting > 0 && (
                <span style={styles.countBadge}>
                  {stats.find((s) => s.resourceType === rt)?.waiting}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notify button */}
        <div style={styles.notifyBar}>
          <div>
            <div style={styles.notifyTitle}>
              {resourceIcons[selectedResource]} {selectedResource} Queue
            </div>
            <div style={styles.notifySubtitle}>
              {currentStat?.waiting || 0} patient(s) waiting
            </div>
          </div>
          <button
            style={styles.notifyBtn}
            onClick={handleNotify}
            disabled={notifyLoading || (currentStat?.waiting || 0) === 0}
          >
            {notifyLoading ? 'Notifying...' : '🔔 Notify Next Patient'}
          </button>
        </div>

        {/* Waitlist entries */}
        {waitlist.length === 0 && (
          <div style={styles.emptyQueue}>
            <span style={{ fontSize: '32px' }}>✅</span>
            <p style={{ color: '#888', marginTop: '8px', fontSize: '13px' }}>
              No one waiting for {selectedResource}
            </p>
          </div>
        )}

        {waitlist.map((entry) => {
          const uc = urgencyConfig[entry.urgency] || urgencyConfig.Normal;
          return (
            <div key={entry._id} style={styles.queueRow}>
              <div style={styles.posNum}>#{entry.position}</div>
              <div style={styles.queueInfo}>
                <div style={styles.queuePatient}>{entry.patientName}</div>
                <div style={styles.queueMeta}>
                  👤 {entry.userName} · 📞 {entry.contactNumber}
                  {entry.patientAge && ` · Age: ${entry.patientAge}`}
                </div>
                {entry.note && (
                  <div style={styles.queueNote}>💬 {entry.note}</div>
                )}
              </div>
              <div style={styles.queueRight}>
                <span style={{ ...styles.urgencyBadge, backgroundColor: uc.bg, color: uc.color }}>
                  {uc.icon} {entry.urgency}
                </span>
                <div style={styles.queueDate}>
                  {new Date(entry.createdAt).toLocaleDateString('en-BD')}
                </div>
                {entry.status === 'Notified' && (
                  <span style={styles.notifiedBadge}>🔔 Notified</span>
                )}
              </div>
            </div>
          );
        })}
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
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 4px' },
  hospName: { fontSize: '14px', color: '#FA7070', fontWeight: '600' },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '10px', marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#fff', borderRadius: '10px', padding: '12px 8px',
    textAlign: 'center', border: '1px solid #C6EBC5', cursor: 'pointer',
  },
  statCardActive: {
    border: '2px solid #FA7070', backgroundColor: '#fff5f5',
  },
  statIcon: { fontSize: '20px', marginBottom: '4px' },
  statNum: { fontSize: '22px', fontWeight: 'bold' },
  statLabel: { fontSize: '10px', color: '#aaa', marginTop: '2px' },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  resourceTabs: {
    display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px',
  },
  resTab: {
    padding: '7px 14px', borderRadius: '20px', border: '1.5px solid #C6EBC5',
    backgroundColor: '#fff', color: '#888', fontWeight: '600',
    cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
  },
  resTabActive: {
    padding: '7px 14px', borderRadius: '20px', border: '1.5px solid #FA7070',
    backgroundColor: '#FA7070', color: '#fff', fontWeight: '600',
    cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '10px',
    padding: '1px 6px', fontSize: '10px',
  },
  notifyBar: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px',
    border: '1px solid #C6EBC5', marginBottom: '16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  notifyTitle: { fontSize: '15px', fontWeight: 'bold', color: '#333' },
  notifySubtitle: { fontSize: '12px', color: '#888' },
  notifyBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold',
    cursor: 'pointer', fontSize: '13px',
  },
  emptyQueue: {
    textAlign: 'center', padding: '40px', backgroundColor: '#fff',
    borderRadius: '12px', border: '1px solid #C6EBC5',
  },
  queueRow: {
    display: 'flex', alignItems: 'flex-start', gap: '14px',
    backgroundColor: '#fff', borderRadius: '12px', padding: '16px',
    border: '1px solid #C6EBC5', marginBottom: '10px',
  },
  posNum: {
    backgroundColor: '#FA7070', color: '#fff', borderRadius: '8px',
    padding: '6px 10px', fontWeight: 'bold', fontSize: '14px', flexShrink: 0,
  },
  queueInfo: { flex: 1 },
  queuePatient: { fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '3px' },
  queueMeta: { fontSize: '12px', color: '#888' },
  queueNote: { fontSize: '11px', color: '#aaa', marginTop: '4px', fontStyle: 'italic' },
  queueRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  urgencyBadge: {
    borderRadius: '10px', padding: '3px 10px', fontSize: '11px', fontWeight: 'bold',
  },
  queueDate: { fontSize: '11px', color: '#aaa' },
  notifiedBadge: {
    backgroundColor: '#FEF9E7', color: '#E67E22', borderRadius: '10px',
    padding: '3px 8px', fontSize: '11px', fontWeight: 'bold',
  },
  emptyBox: {
    textAlign: 'center', padding: '60px', backgroundColor: '#fff',
    borderRadius: '16px', border: '1px solid #C6EBC5',
  },
  regBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '12px',
  },
  centerMsg: { textAlign: 'center', padding: '80px', color: '#888', fontFamily: 'sans-serif' },
};

export default HospitalWaitlistPage;