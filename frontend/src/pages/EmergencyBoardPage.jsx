import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const bloodTypes = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
  'A1+', 'A1-', 'A2+', 'A2-', 'Bombay O',
];

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const EmergencyBoardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondMsg, setRespondMsg] = useState('');
  const [respondingId, setRespondingId] = useState(null);

  const [filters, setFilters] = useState({
    bloodType: '',
    division: '',
  });

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/emergency', { params });
      setEmergencies(data.emergencies);
    } catch (err) {
      setError('Failed to load emergency requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.bloodType) params.bloodType = filters.bloodType;
    if (filters.division) params.division = filters.division;
    fetchEmergencies(params);
  };

  const handleRespond = async (emergencyId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setRespondingId(emergencyId);
    setRespondMsg('');
    try {
      const { data } = await axios.post(
        '/api/emergency/' + emergencyId + '/respond',
        {},
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setRespondMsg('Successfully responded. Total responses: ' + data.totalResponses);
      fetchEmergencies();
    } catch (err) {
      setRespondMsg(err.response?.data?.message || 'Failed to respond');
    } finally {
      setRespondingId(null);
    }
  };

  const getUrgencyStyle = (level) => {
    if (level === 'Critical') return styles.urgencyCritical;
    if (level === 'Urgent') return styles.urgencyUrgent;
    return styles.urgencyNormal;
  };

  const getUrgencyIcon = (level) => {
    if (level === 'Critical') return '🚨';
    if (level === 'Urgent') return '⚠️';
    return '🔔';
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    return days + 'd ago';
  };

  const hasUserResponded = (em) => {
    if (!user) return false;
    return em.responses.some((r) => r.donor === user._id);
  };

  const isRequester = (em) => {
    if (!user) return false;
    return em.requester === user._id;
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <button
            style={styles.createBtn}
            onClick={() => navigate('/emergency/create')}
          >
            🚨 Create Emergency Request
          </button>
          <button
            style={styles.backBtn}
            onClick={() => navigate('/home')}
          >
            ← Home
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '36px' }}>🚨</span>
          <h1 style={styles.title}>Emergency Blood Board</h1>
          <p style={styles.subtitle}>
            Active emergency blood requests — respond if you can help
          </p>
        </div>

        <form onSubmit={handleFilter} style={styles.filterBar}>
          <select
            style={styles.filterInput}
            value={filters.bloodType}
            onChange={(e) => setFilters({ ...filters, bloodType: e.target.value })}
          >
            <option value="">All Blood Types</option>
            {bloodTypes.map((bt) => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>

          <select
            style={styles.filterInput}
            value={filters.division}
            onChange={(e) => setFilters({ ...filters, division: e.target.value })}
          >
            <option value="">All Divisions</option>
            {divisions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button style={styles.filterBtn} type="submit">
            🔍 Filter
          </button>
          <button
            style={styles.resetBtn}
            type="button"
            onClick={() => {
              setFilters({ bloodType: '', division: '' });
              fetchEmergencies();
            }}
          >
            Reset
          </button>
        </form>

        {respondMsg && (
          <div style={respondMsg.includes('Successfully') ? styles.successMsg : styles.errorMsg}>
            {respondMsg}
          </div>
        )}

        {loading && (
          <div style={styles.centerMsg}>Loading emergency requests...</div>
        )}

        {error && (
          <div style={styles.errorMsg}>{error}</div>
        )}

        {!loading && emergencies.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>✅</span>
            <p style={{ color: '#888', marginTop: '12px', fontSize: '15px' }}>
              No active emergency requests right now
            </p>
          </div>
        )}

        <div style={styles.emergencyList}>
          {emergencies.map((em) => (
            <div key={em._id} style={styles.emergencyCard}>

              <div style={styles.cardTop}>
                <div style={styles.leftTop}>
                  <span style={getUrgencyStyle(em.urgencyLevel)}>
                    {getUrgencyIcon(em.urgencyLevel)} {em.urgencyLevel}
                  </span>
                  <span style={styles.timeAgo}>{timeAgo(em.createdAt)}</span>
                </div>
                <div style={styles.bloodTypeBadge}>{em.bloodType}</div>
              </div>

              <h3 style={styles.patientName}>Patient: {em.patientName}</h3>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>🏥 Hospital</span>
                  <span style={styles.infoValue}>{em.hospital}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📍 Location</span>
                  <span style={styles.infoValue}>
                    {em.location.district}, {em.location.division}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>🩸 Units Needed</span>
                  <span style={styles.infoValue}>{em.unitsNeeded} unit(s)</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📞 Contact</span>
                  <span style={styles.infoValue}>{em.contactNumber}</span>
                </div>
              </div>

              {em.note && (
                <div style={styles.noteBox}>
                  💬 {em.note}
                </div>
              )}

              <div style={styles.cardFooter}>
                <div style={styles.responseCount}>
                  👥 {em.responses.length} donor(s) responded
                </div>
                <div style={styles.cardActions}>
                  <a href={'tel:' + em.contactNumber} style={styles.callBtn}>
                    📞 Call
                  </a>

                  {hasUserResponded(em) && (
                    <button style={styles.respondedBtn} disabled>
                      ✅ Responded
                    </button>
                  )}

                  {!hasUserResponded(em) && !isRequester(em) && user && (
                    <button
                      style={styles.respondBtn}
                      onClick={() => handleRespond(em._id)}
                      disabled={respondingId === em._id}
                    >
                      {respondingId === em._id ? 'Responding...' : '🩸 I Can Donate'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#FEFDEC',
    fontFamily: 'sans-serif',
  },
  navbar: {
    backgroundColor: '#FA7070',
    padding: '14px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    color: '#fff',
  },
  navLogoText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  navRight: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  createBtn: {
    backgroundColor: '#fff',
    color: '#FA7070',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
  },
  backBtn: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1.5px solid #fff',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#333',
    margin: '10px 0 6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid #C6EBC5',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  filterInput: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1.5px solid #C6EBC5',
    fontSize: '13px',
    backgroundColor: '#FEFDEC',
    color: '#333',
    outline: 'none',
  },
  filterBtn: {
    padding: '8px 20px',
    backgroundColor: '#FA7070',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
  },
  resetBtn: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    color: '#888',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  successMsg: {
    backgroundColor: '#C6EBC5',
    color: '#27AE60',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  centerMsg: {
    textAlign: 'center',
    color: '#888',
    padding: '40px',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #C6EBC5',
  },
  emergencyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  emergencyCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #C6EBC5',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  leftTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  urgencyCritical: {
    backgroundColor: '#fdecea',
    color: '#c0392b',
    borderRadius: '20px',
    padding: '4px 14px',
    fontWeight: 'bold',
    fontSize: '13px',
  },
  urgencyUrgent: {
    backgroundColor: '#FEF9E7',
    color: '#E67E22',
    borderRadius: '20px',
    padding: '4px 14px',
    fontWeight: 'bold',
    fontSize: '13px',
  },
  urgencyNormal: {
    backgroundColor: '#C6EBC5',
    color: '#27AE60',
    borderRadius: '20px',
    padding: '4px 14px',
    fontWeight: 'bold',
    fontSize: '13px',
  },
  timeAgo: {
    fontSize: '12px',
    color: '#aaa',
  },
  bloodTypeBadge: {
    backgroundColor: '#FA7070',
    color: '#fff',
    borderRadius: '20px',
    padding: '4px 16px',
    fontWeight: 'bold',
    fontSize: '15px',
  },
  patientName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '14px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '12px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  infoLabel: {
    fontSize: '11px',
    color: '#aaa',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '500',
  },
  noteBox: {
    backgroundColor: '#FEFDEC',
    border: '1px solid #C6EBC5',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#666',
    marginBottom: '12px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0',
  },
  responseCount: {
    fontSize: '13px',
    color: '#888',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
  },
  callBtn: {
    padding: '8px 16px',
    backgroundColor: '#C6EBC5',
    color: '#27AE60',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '13px',
    textDecoration: 'none',
  },
  respondBtn: {
    padding: '8px 16px',
    backgroundColor: '#FA7070',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'pointer',
  },
  respondedBtn: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    color: '#aaa',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'not-allowed',
  },
};

export default EmergencyBoardPage;