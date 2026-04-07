import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CampManagePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [checkingIn, setCheckingIn] = useState(null);

  useEffect(() => {
    fetchCamp();
  }, []);

  const fetchCamp = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/camps/' + id);
      setCamp(data);
    } catch {
      setMsg('Failed to load camp');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (donorId) => {
    setCheckingIn(donorId);
    setMsg('');
    try {
      await axios.put(
        '/api/camps/' + id + '/checkin/' + donorId,
        {},
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setMsg('Donor checked in!');
      fetchCamp();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(null);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await axios.put(
        '/api/camps/' + id + '/status',
        { status },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setMsg('Status updated to ' + status);
      fetchCamp();
    } catch {
      setMsg('Failed to update status');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-BD', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  if (loading) return <div style={styles.centerMsg}>Loading...</div>;
  if (!camp) return <div style={styles.centerMsg}>Camp not found</div>;

  const checkedInCount = camp.registrations.filter((r) => r.checkedIn).length;

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <button style={styles.backBtn} onClick={() => navigate('/camps')}>
          ← Back to Camps
        </button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>⚙️ Manage Camp</h1>
          <p style={styles.campName}>{camp.campName}</p>
          <p style={styles.subtitle}>📅 {formatDate(camp.date)} — {camp.venue}</p>
        </div>

        {msg && (
          <div style={msg.includes('Failed') ? styles.errorMsg : styles.successMsg}>
            {msg}
          </div>
        )}

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{camp.registrations.length}</div>
            <div style={styles.statLabel}>Registered</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: '#27AE60' }}>{checkedInCount}</div>
            <div style={styles.statLabel}>Checked In</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{camp.targetDonors}</div>
            <div style={styles.statLabel}>Target</div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>📋 Camp Status</div>
          <div style={styles.statusRow}>
            {['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((s) => (
              <button
                key={s}
                style={camp.status === s ? styles.statusBtnActive : styles.statusBtn}
                onClick={() => handleStatusChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            👥 Registered Donors ({camp.registrations.length})
          </div>

          {camp.registrations.length === 0 && (
            <div style={styles.emptyNote}>No donors registered yet</div>
          )}

          {camp.registrations.map((r) => (
            <div key={r._id} style={styles.donorRow}>
              <div style={styles.donorInfo}>
                <div style={styles.donorName}>{r.donorName}</div>
                <div style={styles.donorMeta}>
                  {r.bloodType} · {r.phone}
                </div>
              </div>
              {r.checkedIn ? (
                <span style={styles.checkedInBadge}>✅ Checked In</span>
              ) : (
                <button
                  style={styles.checkInBtn}
                  onClick={() => handleCheckIn(r.donor)}
                  disabled={checkingIn === r.donor}
                >
                  {checkingIn === r.donor ? '...' : 'Check In'}
                </button>
              )}
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
  backBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  container: { maxWidth: '760px', margin: '0 auto', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 6px' },
  campName: { fontSize: '16px', fontWeight: '600', color: '#FA7070', margin: '0 0 4px' },
  subtitle: { fontSize: '13px', color: '#888' },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  centerMsg: { textAlign: 'center', padding: '80px', color: '#888', fontFamily: 'sans-serif' },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' },
  statCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '20px',
    textAlign: 'center', border: '1px solid #C6EBC5',
  },
  statNum: { fontSize: '28px', fontWeight: 'bold', color: '#FA7070' },
  statLabel: { fontSize: '12px', color: '#aaa', marginTop: '4px' },
  section: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '24px',
    border: '1px solid #C6EBC5', marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '14px', fontWeight: 'bold', color: '#FA7070',
    marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0',
  },
  statusRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  statusBtn: {
    padding: '8px 20px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  statusBtnActive: {
    padding: '8px 20px', borderRadius: '8px', border: 'none',
    backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  donorRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid #f0f0f0',
  },
  donorInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  donorName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  donorMeta: { fontSize: '12px', color: '#aaa' },
  checkedInBadge: {
    backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '20px',
    padding: '4px 14px', fontWeight: 'bold', fontSize: '12px',
  },
  checkInBtn: {
    padding: '7px 16px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
  emptyNote: { color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '20px' },
};

export default CampManagePage;