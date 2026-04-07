import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const CampBoardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondMsg, setRespondMsg] = useState('');
  const [registeringId, setRegisteringId] = useState(null);
  const [divisionFilter, setDivisionFilter] = useState('');

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/camps', { params });
      setCamps(data.camps);
    } catch (err) {
      setError('Failed to load camps');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (divisionFilter) params.division = divisionFilter;
    fetchCamps(params);
  };

  const handleRegister = async (campId) => {
    if (!user) { navigate('/login'); return; }
    setRegisteringId(campId);
    setRespondMsg('');
    try {
      const { data } = await axios.post(
        '/api/camps/' + campId + '/register',
        {},
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setRespondMsg('Registered! Total: ' + data.totalRegistrations + ' donor(s)');
      fetchCamps();
    } catch (err) {
      setRespondMsg(err.response?.data?.message || 'Failed to register');
    } finally {
      setRegisteringId(null);
    }
  };

  const isRegistered = (camp) => {
    if (!user) return false;
    return camp.registrations.some((r) => r.donor === user._id);
  };

  const isOrganizer = (camp) => {
    if (!user) return false;
    return camp.organizer === user._id;
  };

  const isFull = (camp) => camp.registrations.length >= camp.targetDonors;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-BD', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const daysUntil = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today!';
    if (diff < 0) return 'Past';
    return 'In ' + diff + ' day' + (diff > 1 ? 's' : '');
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.createBtn} onClick={() => navigate('/camps/create')}>
            🩸 Organize a Camp
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>
            ← Home
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '36px' }}>🩸</span>
          <h1 style={styles.title}>Blood Donation Camps</h1>
          <p style={styles.subtitle}>Browse upcoming camps and register to donate</p>
        </div>

        <form onSubmit={handleFilter} style={styles.filterBar}>
          <select
            style={styles.filterInput}
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
          >
            <option value="">All Divisions</option>
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button style={styles.filterBtn} type="submit">🔍 Filter</button>
          <button
            style={styles.resetBtn}
            type="button"
            onClick={() => { setDivisionFilter(''); fetchCamps(); }}
          >
            Reset
          </button>
        </form>

        {respondMsg && (
          <div style={respondMsg.includes('Registered') ? styles.successMsg : styles.errorMsg}>
            {respondMsg}
          </div>
        )}

        {loading && <div style={styles.centerMsg}>Loading camps...</div>}
        {error && <div style={styles.errorMsg}>{error}</div>}

        {!loading && camps.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>📋</span>
            <p style={{ color: '#888', marginTop: '12px', fontSize: '15px' }}>
              No upcoming camps found
            </p>
          </div>
        )}

        <div style={styles.campList}>
          {camps.map((camp) => (
            <div key={camp._id} style={styles.campCard}>
              <div style={styles.cardTop}>
                <div style={styles.campName}>{camp.campName}</div>
                <div style={isFull(camp) ? styles.fullBadge : styles.spotsBadge}>
                  {isFull(camp)
                    ? 'Full'
                    : (camp.targetDonors - camp.registrations.length) + ' spots left'}
                </div>
              </div>

              <div style={styles.dateRow}>
                <span style={styles.dateText}>📅 {formatDate(camp.date)}</span>
                <span style={styles.daysUntil}>{daysUntil(camp.date)}</span>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📍 Venue</span>
                  <span style={styles.infoValue}>{camp.venue}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>🗺️ Location</span>
                  <span style={styles.infoValue}>
                    {camp.location.district}, {camp.location.division}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>🎯 Target</span>
                  <span style={styles.infoValue}>{camp.targetDonors} donors</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>👤 Organizer</span>
                  <span style={styles.infoValue}>{camp.organizerName}</span>
                </div>
              </div>

              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: Math.min(
                      (camp.registrations.length / camp.targetDonors) * 100, 100
                    ) + '%',
                    backgroundColor: isFull(camp) ? '#FA7070' : '#C6EBC5',
                  }}
                />
              </div>
              <div style={styles.progressLabel}>
                {camp.registrations.length} / {camp.targetDonors} registered
              </div>

              {camp.description && (
                <div style={styles.noteBox}>💬 {camp.description}</div>
              )}

              <div style={styles.cardFooter}>
                <a href={'tel:' + camp.contactNumber} style={styles.callBtn}>
                  📞 Call
                </a>
                {isRegistered(camp) && (
                  <button style={styles.registeredBtn} disabled>✅ Registered</button>
                )}
                {!isRegistered(camp) && !isOrganizer(camp) && !isFull(camp) && user && (
                  <button
                    style={styles.registerBtn}
                    onClick={() => handleRegister(camp._id)}
                    disabled={registeringId === camp._id}
                  >
                    {registeringId === camp._id ? 'Registering...' : '🩸 Register'}
                  </button>
                )}
                {isOrganizer(camp) && (
                  <button
                    style={styles.manageBtn}
                    onClick={() => navigate('/camps/' + camp._id + '/manage')}
                  >
                    ⚙️ Manage
                  </button>
                )}
              </div>
            </div>
          ))}
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
  navRight: { display: 'flex', gap: '12px', alignItems: 'center' },
  createBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  backBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  container: { maxWidth: '900px', margin: '0 auto', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '10px 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
  filterBar: {
    display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#fff',
    padding: '16px 20px', borderRadius: '12px', border: '1px solid #C6EBC5',
    marginBottom: '24px', flexWrap: 'wrap',
  },
  filterInput: {
    padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '13px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none',
  },
  filterBtn: {
    padding: '8px 20px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  resetBtn: {
    padding: '8px 16px', backgroundColor: '#f5f5f5', color: '#888',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  centerMsg: { textAlign: 'center', color: '#888', padding: '40px' },
  emptyBox: {
    textAlign: 'center', padding: '60px', backgroundColor: '#fff',
    borderRadius: '16px', border: '1px solid #C6EBC5',
  },
  campList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  campCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5',
  },
  cardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '10px',
  },
  campName: { fontSize: '17px', fontWeight: 'bold', color: '#333' },
  spotsBadge: {
    backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '20px',
    padding: '4px 14px', fontWeight: 'bold', fontSize: '12px',
  },
  fullBadge: {
    backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '20px',
    padding: '4px 14px', fontWeight: 'bold', fontSize: '12px',
  },
  dateRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '14px',
  },
  dateText: { fontSize: '13px', color: '#555', fontWeight: '500' },
  daysUntil: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', color: '#FA7070',
    borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: 'bold',
  },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  infoLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600' },
  infoValue: { fontSize: '13px', color: '#333', fontWeight: '500' },
  progressBar: {
    height: '8px', backgroundColor: '#f0f0f0',
    borderRadius: '4px', overflow: 'hidden', marginBottom: '4px',
  },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' },
  progressLabel: { fontSize: '12px', color: '#aaa', marginBottom: '12px' },
  noteBox: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '8px',
    padding: '10px 14px', fontSize: '13px', color: '#666', marginBottom: '12px',
  },
  cardFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0',
  },
  callBtn: {
    padding: '8px 16px', backgroundColor: '#C6EBC5', color: '#27AE60',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none',
  },
  registerBtn: {
    padding: '8px 16px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
  },
  registeredBtn: {
    padding: '8px 16px', backgroundColor: '#f5f5f5', color: '#aaa',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'not-allowed',
  },
  manageBtn: {
    padding: '8px 16px', backgroundColor: '#FEFDEC', color: '#FA7070',
    border: '1.5px solid #FA7070', borderRadius: '8px', fontWeight: 'bold',
    fontSize: '13px', cursor: 'pointer',
  },
};

export default CampBoardPage;