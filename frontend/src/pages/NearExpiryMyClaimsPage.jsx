import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  Pending:     { bg: '#FEF9E7', color: '#E67E22' },
  Confirmed:   { bg: '#C6EBC5', color: '#27AE60' },
  'Picked Up': { bg: '#e8f4fd', color: '#2980b9' },
  Cancelled:   { bg: '#f5f5f5', color: '#aaa' },
};

const NearExpiryMyClaimsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('/api/nearexpiry/claims/mine', {
          headers: { Authorization: 'Bearer ' + user.token },
        });
        setClaims(data.claims);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-BD', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <button style={styles.backBtn} onClick={() => navigate('/nearexpiry')}>← Back to Board</button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📋 My Claims</h1>
          <p style={styles.subtitle}>Track medicines you've claimed for pickup</p>
        </div>

        {loading && <div style={styles.centerMsg}>Loading...</div>}

        {!loading && claims.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>📋</span>
            <p style={{ color: '#888', marginTop: '12px' }}>No claims yet</p>
            <button style={styles.browseBtn} onClick={() => navigate('/nearexpiry')}>
              Browse Available Medicines
            </button>
          </div>
        )}

        {claims.map((c) => {
          const sc = statusColors[c.status] || statusColors.Pending;
          const total = (c.unitsRequested * c.listing.discountedPrice).toLocaleString();
          return (
            <div key={c.claimId} style={styles.claimCard}>
              <div style={styles.cardTop}>
                <div>
                  <div style={styles.medName}>{c.listing.medicineName}</div>
                  {c.listing.genericName && (
                    <div style={styles.generic}>{c.listing.genericName}</div>
                  )}
                </div>
                <span style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color }}>
                  {c.status}
                </span>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>🏥 Facility</span>
                  <span style={styles.infoValue}>{c.listing.facilityName}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📍 Location</span>
                  <span style={styles.infoValue}>
                    {c.listing.location.district}, {c.listing.location.division}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📦 Units Claimed</span>
                  <span style={styles.infoValue}>{c.unitsRequested}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📅 Expires</span>
                  <span style={{
                    ...styles.infoValue,
                    color: c.daysLeft <= 7 ? '#c0392b' : c.daysLeft <= 30 ? '#E67E22' : '#333',
                  }}>
                    {formatDate(c.listing.expiryDate)}
                    {c.daysLeft > 0 ? ` (${c.daysLeft}d left)` : ' (expired)'}
                  </span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <div>
                  <span style={styles.totalCost}>৳ {total}</span>
                  <span style={styles.totalLabel}> total</span>
                </div>
                <a href={'tel:' + c.listing.contactNumber} style={styles.callBtn}>
                  📞 Contact Facility
                </a>
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
  backBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  container: { maxWidth: '760px', margin: '0 auto', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '28px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
  centerMsg: { textAlign: 'center', color: '#888', padding: '40px' },
  emptyBox: {
    textAlign: 'center', padding: '60px', backgroundColor: '#fff',
    borderRadius: '16px', border: '1px solid #C6EBC5',
  },
  browseBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '12px',
  },
  claimCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '22px 24px',
    border: '1px solid #C6EBC5', marginBottom: '14px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  cardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px',
  },
  medName: { fontSize: '17px', fontWeight: 'bold', color: '#333' },
  generic: { fontSize: '12px', color: '#888', marginTop: '2px' },
  statusBadge: {
    borderRadius: '12px', padding: '4px 14px', fontSize: '12px', fontWeight: 'bold',
  },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  infoLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600' },
  infoValue: { fontSize: '13px', color: '#333', fontWeight: '500' },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '12px', borderTop: '1px solid #f0f0f0',
  },
  totalCost: { fontSize: '18px', fontWeight: 'bold', color: '#FA7070' },
  totalLabel: { fontSize: '13px', color: '#aaa' },
  callBtn: {
    padding: '8px 16px', backgroundColor: '#C6EBC5', color: '#27AE60',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none',
  },
};

export default NearExpiryMyClaimsPage;