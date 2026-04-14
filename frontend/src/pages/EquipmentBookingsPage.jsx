import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const equipmentIcons = {
  'Oxygen Cylinder': '🫁', 'Dialysis Machine': '🩺', 'NICU Bed': '👶',
  'Burn Unit Bed': '🔥', 'Wheelchair': '♿', 'Hospital Bed': '🛏️',
  'Ventilator': '💨', 'Suction Machine': '⚕️', 'Infusion Pump': '💉', 'ECG Machine': '❤️',
};

const statusColors = {
  Pending:   { bg: '#FEF9E7', color: '#E67E22' },
  Confirmed: { bg: '#C6EBC5', color: '#27AE60' },
  Active:    { bg: '#e8f4fd', color: '#2980b9' },
  Returned:  { bg: '#f3e5f5', color: '#8e44ad' },
  Cancelled: { bg: '#f5f5f5', color: '#aaa' },
};

const EquipmentBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('/api/equipment/bookings/mine', {
          headers: { Authorization: 'Bearer ' + user.token },
        });
        setBookings(data.bookings);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <button style={styles.backBtn} onClick={() => navigate('/equipment')}>← Back to Search</button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📋 My Equipment Bookings</h1>
          <p style={styles.subtitle}>Track equipment you've booked</p>
        </div>

        {loading && <div style={styles.centerMsg}>Loading...</div>}

        {!loading && bookings.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>📋</span>
            <p style={{ color: '#888', marginTop: '12px' }}>No bookings yet</p>
            <button style={styles.searchBtn} onClick={() => navigate('/equipment')}>
              Find Equipment
            </button>
          </div>
        )}

        {bookings.map((b) => {
          const sc = statusColors[b.status] || statusColors.Pending;
          const total = (b.durationDays * b.equipment.pricePerDay).toLocaleString();
          return (
            <div key={b.bookingId} style={styles.bookingCard}>
              <div style={styles.cardTop}>
                <div style={styles.equipLeft}>
                  <span style={styles.equipIcon}>
                    {equipmentIcons[b.equipment.equipmentType]}
                  </span>
                  <div>
                    <div style={styles.equipType}>{b.equipment.equipmentType}</div>
                    <div style={styles.facilityName}>{b.equipment.facilityName}</div>
                  </div>
                </div>
                <span style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color }}>
                  {b.status}
                </span>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📍 Location</span>
                  <span style={styles.infoValue}>
                    {b.equipment.location.district}, {b.equipment.location.division}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>⏱️ Duration</span>
                  <span style={styles.infoValue}>{b.durationDays} day(s)</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>💰 Total Cost</span>
                  <span style={{ ...styles.infoValue, color: '#FA7070', fontWeight: 'bold' }}>
                    ৳ {total}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📅 Booked On</span>
                  <span style={styles.infoValue}>
                    {new Date(b.bookedAt).toLocaleDateString('en-BD')}
                  </span>
                </div>
              </div>

              {b.note && (
                <div style={styles.noteBox}>💬 {b.note}</div>
              )}

              <div style={styles.cardFooter}>
                <a href={'tel:' + b.equipment.contactNumber} style={styles.callBtn}>
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
  searchBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '12px',
  },
  bookingCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '22px 24px',
    border: '1px solid #C6EBC5', marginBottom: '14px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  cardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px',
  },
  equipLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  equipIcon: { fontSize: '28px' },
  equipType: { fontSize: '17px', fontWeight: 'bold', color: '#333' },
  facilityName: { fontSize: '12px', color: '#888', marginTop: '2px' },
  statusBadge: {
    borderRadius: '12px', padding: '4px 14px', fontSize: '12px', fontWeight: 'bold',
  },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  infoLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600' },
  infoValue: { fontSize: '13px', color: '#333', fontWeight: '500' },
  noteBox: {
    backgroundColor: '#FEFDEC', borderRadius: '8px', padding: '8px 12px',
    fontSize: '12px', color: '#666', marginBottom: '12px', border: '1px solid #C6EBC5',
  },
  cardFooter: {
    paddingTop: '12px', borderTop: '1px solid #f0f0f0',
  },
  callBtn: {
    padding: '8px 16px', backgroundColor: '#C6EBC5', color: '#27AE60',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none',
  },
};

export default EquipmentBookingsPage;