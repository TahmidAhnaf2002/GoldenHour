import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  Waiting:  { bg: '#fff8e1', color: '#e65100', label: '⏳ Waiting' },
  Notified: { bg: '#e3f2fd', color: '#1565c0', label: '🔔 Bed Available!' },
  Admitted: { bg: '#f0fdf4', color: '#2e7d32', label: '✅ Admitted' },
  Cancelled:{ bg: '#f5f5f5', color: '#aaa',    label: '✕ Cancelled' },
};

const urgencyColors = {
  Critical: { bg: '#fdecea', color: '#c0392b' },
  High:     { bg: '#fff8e1', color: '#e65100' },
  Medium:   { bg: '#e3f2fd', color: '#1565c0' },
};

const MyWaitlistPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const prevStatuses = useRef({});
  const pollRef = useRef(null);

  const fetchEntries = async (isPolling = false) => {
    try {
      const { data } = await axios.get('/api/beds/waitlist/mine', {
        headers: { Authorization: 'Bearer ' + user.token },
      });

      // Detect newly-notified entries for in-app notification
      data.entries.forEach((e) => {
        const prev = prevStatuses.current[e.entryId];
        if (prev && prev !== 'Notified' && e.status === 'Notified') {
          setNotification(
            `🔔 A ${e.listing.bedType} bed is now available at ${e.listing.hospitalName}! Please contact them at ${e.listing.contactNumber}.`
          );
        }
        prevStatuses.current[e.entryId] = e.status;
      });

      setEntries(data.entries);
    } catch {
      /* silently fail on polling errors */
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const cancelEntry = async (listingId) => {
    if (!window.confirm('Cancel your waitlist entry? You will lose your current position.')) return;
    try {
      await axios.put(`/api/beds/${listingId}/waitlist/cancel`, {}, {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      fetchEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  useEffect(() => {
    fetchEntries();
    // Poll every 30 seconds for position updates
    pollRef.current = setInterval(() => fetchEntries(true), 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  const activeEntries = entries.filter((e) => ['Waiting', 'Notified'].includes(e.status));
  const pastEntries = entries.filter((e) => ['Admitted', 'Cancelled'].includes(e.status));

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <button style={styles.navBtn} onClick={() => navigate('/beds')}>← Browse Beds</button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '36px' }}>⏳</span>
          <h1 style={styles.title}>My Waitlists</h1>
          <p style={styles.subtitle}>
            Your position updates automatically every 30 seconds. You will see a notification here when a bed becomes available.
          </p>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div style={styles.notifBanner}>
            {notification}
            <button style={styles.notifClose} onClick={() => setNotification('')}>✕</button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>
        ) : entries.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '48px' }}>📋</span>
            <p style={{ color: '#888', marginTop: '12px' }}>
              You are not on any waitlists. When a hospital's bed type is full, you can join the waitlist from the bed board.
            </p>
            <button style={styles.browseBtn} onClick={() => navigate('/beds')}>Browse Hospital Beds</button>
          </div>
        ) : (
          <>
            {/* Active Waitlists */}
            {activeEntries.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Active Waitlists ({activeEntries.length})</h2>
                {activeEntries.map((entry) => {
                  const ss = statusStyles[entry.status];
                  const uc = urgencyColors[entry.urgencyLevel] || urgencyColors.Medium;
                  const isNotified = entry.status === 'Notified';
                  return (
                    <div key={entry.entryId}
                      style={{ ...styles.card, border: isNotified ? '2px solid #1565c0' : '1px solid #C6EBC5' }}>
                      {isNotified && (
                        <div style={styles.notifiedAlert}>
                          🔔 A bed is now available for you! Contact the hospital immediately.
                        </div>
                      )}
                      <div style={styles.cardTop}>
                        <div>
                          <h3 style={styles.hospitalName}>{entry.listing.hospitalName}</h3>
                          <p style={styles.bedType}>{entry.listing.bedType} Bed</p>
                          <p style={styles.location}>📍 {entry.listing.location.district}, {entry.listing.location.division}</p>
                        </div>
                        <div style={styles.positionBox}>
                          <span style={styles.positionNumber}>#{entry.position}</span>
                          <span style={styles.positionLabel}>in queue</span>
                          <span style={styles.queueOf}>of {entry.totalInQueue}</span>
                        </div>
                      </div>

                      <div style={styles.infoRow}>
                        <span style={{ ...styles.tag, backgroundColor: ss.bg, color: ss.color }}>{ss.label}</span>
                        <span style={{ ...styles.tag, backgroundColor: uc.bg, color: uc.color }}>{entry.urgencyLevel} Priority</span>
                        <span style={{ ...styles.tag, backgroundColor: '#f5f5f5', color: '#888' }}>
                          Joined {new Date(entry.joinedAt).toLocaleDateString('en-BD')}
                        </span>
                      </div>

                      <div style={styles.detailRow}>
                        <span>📞 Hospital: <b>{entry.listing.contactNumber}</b></span>
                        {entry.listing.pricePerDay > 0 && <span>৳ {entry.listing.pricePerDay}/day</span>}
                        {isNotified && entry.notifiedAt && (
                          <span style={{ color: '#1565c0' }}>
                            Notified at {new Date(entry.notifiedAt).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {entry.patientCondition && (
                        <p style={styles.condition}>Condition: {entry.patientCondition}</p>
                      )}

                      <div style={styles.cardActions}>
                        <a href={`tel:${entry.listing.contactNumber}`} style={styles.callBtn}>📞 Call Hospital</a>
                        <button style={styles.cancelBtn} onClick={() => cancelEntry(entry.listing.id)}>
                          ✕ Cancel — Admitted Elsewhere
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Past Waitlists */}
            {pastEntries.length > 0 && (
              <div style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: '#aaa' }}>Past Entries</h2>
                {pastEntries.map((entry) => {
                  const ss = statusStyles[entry.status];
                  return (
                    <div key={entry.entryId} style={{ ...styles.card, opacity: 0.7 }}>
                      <div style={styles.cardTop}>
                        <div>
                          <h3 style={styles.hospitalName}>{entry.listing.hospitalName}</h3>
                          <p style={styles.bedType}>{entry.listing.bedType} Bed</p>
                        </div>
                        <span style={{ ...styles.tag, backgroundColor: ss.bg, color: ss.color }}>{ss.label}</span>
                      </div>
                      <p style={styles.location}>
                        📍 {entry.listing.location.district} · Joined {new Date(entry.joinedAt).toLocaleDateString('en-BD')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
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
  navBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  container: { maxWidth: '760px', margin: '0 auto', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '28px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '10px 0 6px' },
  subtitle: { fontSize: '14px', color: '#888', maxWidth: '520px', margin: '0 auto' },
  notifBanner: {
    backgroundColor: '#1565c0', color: '#fff', padding: '14px 18px', borderRadius: '10px',
    marginBottom: '20px', fontSize: '14px', fontWeight: '600',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px',
  },
  notifClose: {
    background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
    fontSize: '16px', fontWeight: 'bold', flexShrink: 0,
  },
  emptyState: { textAlign: 'center', padding: '60px 0' },
  browseBtn: {
    marginTop: '16px', padding: '12px 28px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  section: { marginBottom: '32px' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '16px' },
  card: {
    backgroundColor: '#fff', borderRadius: '14px', padding: '20px 22px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '14px',
  },
  notifiedAlert: {
    backgroundColor: '#1565c0', color: '#fff', padding: '10px 14px',
    borderRadius: '8px', marginBottom: '14px', fontSize: '13px', fontWeight: '600',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' },
  hospitalName: { fontSize: '17px', fontWeight: 'bold', color: '#333', margin: '0 0 4px' },
  bedType: { fontSize: '13px', color: '#FA7070', fontWeight: '600', margin: '0 0 2px' },
  location: { fontSize: '12px', color: '#888', margin: 0 },
  positionBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    backgroundColor: '#FEFDEC', border: '2px solid #FA7070', borderRadius: '12px',
    padding: '10px 18px', minWidth: '80px',
  },
  positionNumber: { fontSize: '26px', fontWeight: 'bold', color: '#FA7070', lineHeight: 1 },
  positionLabel: { fontSize: '11px', color: '#FA7070', fontWeight: '600' },
  queueOf: { fontSize: '11px', color: '#aaa' },
  infoRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' },
  tag: { fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' },
  detailRow: { display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#555', marginBottom: '8px' },
  condition: { fontSize: '13px', color: '#888', fontStyle: 'italic', margin: '0 0 8px' },
  cardActions: { display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' },
  callBtn: {
    display: 'inline-block', padding: '9px 20px', backgroundColor: '#C6EBC5', color: '#2e7d32',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none',
  },
  cancelBtn: {
    padding: '9px 16px', backgroundColor: '#f5f5f5', color: '#888',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
};

export default MyWaitlistPage;