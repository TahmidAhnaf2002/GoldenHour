import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const equipmentIcons = {
  'Oxygen Cylinder': '🫁', 'Dialysis Machine': '🩺', 'NICU Bed': '👶',
  'Burn Unit Bed': '🔥', 'Wheelchair': '♿', 'Hospital Bed': '🛏️',
  'Ventilator': '💨', 'Suction Machine': '⚕️', 'Infusion Pump': '💉', 'ECG Machine': '❤️',
};

const bookingStatusColors = {
  Pending:   { bg: '#FEF9E7', color: '#E67E22' },
  Confirmed: { bg: '#C6EBC5', color: '#27AE60' },
  Active:    { bg: '#e8f4fd', color: '#2980b9' },
  Returned:  { bg: '#f3e5f5', color: '#8e44ad' },
  Cancelled: { bg: '#f5f5f5', color: '#aaa' },
};

const EquipmentManagePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: '', pricePerDay: '' });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/equipment/mine', {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      setListings(data.equipment);
    } catch {
      setMsg('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put('/api/equipment/' + id,
        { quantity: Number(editForm.quantity), pricePerDay: Number(editForm.pricePerDay) },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setMsg('✅ Updated!');
      setEditingId(null);
      fetchListings();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await axios.delete('/api/equipment/' + id, {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      setMsg('✅ Deleted');
      fetchListings();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Delete failed'); }
  };

  const handleBookingStatus = async (equipId, bookingId, status) => {
    try {
      await axios.put(
        '/api/equipment/' + equipId + '/bookings/' + bookingId + '/status',
        { status },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      fetchListings();
    } catch { setMsg('❌ Failed to update booking'); }
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.addBtn} onClick={() => navigate('/equipment/add')}>+ Add Equipment</button>
          <button style={styles.backBtn} onClick={() => navigate('/equipment')}>← Back</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>⚕️ My Equipment Listings</h1>
          <p style={styles.subtitle}>Manage your listings and handle bookings</p>
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        {loading && <div style={styles.centerMsg}>Loading...</div>}

        {!loading && listings.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>⚕️</span>
            <p style={{ color: '#888', marginTop: '12px' }}>No listings yet</p>
            <button style={styles.addBtn2} onClick={() => navigate('/equipment/add')}>
              + Add Your First Listing
            </button>
          </div>
        )}

        {listings.map((eq) => {
          const pendingCount = eq.bookings?.filter((b) => b.status === 'Pending').length || 0;
          const isExpanded = expandedId === eq._id;

          return (
            <div key={eq._id} style={styles.listingCard}>
              <div style={styles.cardTop}>
                <div style={styles.cardLeft}>
                  <span style={styles.equipIcon}>{equipmentIcons[eq.equipmentType]}</span>
                  <div>
                    <div style={styles.equipType}>{eq.equipmentType}</div>
                    <div style={styles.facilityName}>{eq.facilityName}</div>
                  </div>
                </div>
                <div style={styles.cardRight}>
                  <span style={{
                    ...styles.availBadge,
                    backgroundColor: eq.isAvailable ? '#C6EBC5' : '#f5f5f5',
                    color: eq.isAvailable ? '#27AE60' : '#aaa',
                  }}>
                    {eq.isAvailable ? '✅ Available' : '❌ Unavailable'}
                  </span>
                  {pendingCount > 0 && (
                    <span style={styles.pendingBadge}>{pendingCount} pending</span>
                  )}
                </div>
              </div>

              <div style={styles.statsRow}>
                <span style={styles.statChip}>📦 {eq.quantity} units</span>
                <span style={styles.statChip}>৳ {eq.pricePerDay}/day</span>
                <span style={styles.statChip}>📋 {eq.bookings?.length || 0} bookings</span>
              </div>

              {editingId === eq._id ? (
                <div style={styles.editRow}>
                  <div style={styles.editField}>
                    <label style={styles.editLabel}>Quantity</label>
                    <input style={styles.editInput} type="number" min="0"
                      value={editForm.quantity}
                      onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} />
                  </div>
                  <div style={styles.editField}>
                    <label style={styles.editLabel}>Price/day (৳)</label>
                    <input style={styles.editInput} type="number" min="0"
                      value={editForm.pricePerDay}
                      onChange={(e) => setEditForm({ ...editForm, pricePerDay: e.target.value })} />
                  </div>
                  <button style={styles.saveBtn} onClick={() => handleUpdate(eq._id)}>💾 Save</button>
                  <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <div style={styles.actionRow}>
                  <button style={styles.editBtn}
                    onClick={() => {
                      setEditingId(eq._id);
                      setEditForm({ quantity: eq.quantity, pricePerDay: eq.pricePerDay });
                    }}>
                    ✏️ Edit
                  </button>
                  <button style={styles.expandBtn}
                    onClick={() => setExpandedId(isExpanded ? null : eq._id)}>
                    {isExpanded ? '▲ Hide Bookings' : `▼ Bookings (${eq.bookings?.length || 0})`}
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(eq._id)}>
                    🗑️ Delete
                  </button>
                </div>
              )}

              {isExpanded && (
                <div style={styles.bookingsSection}>
                  {(!eq.bookings || eq.bookings.length === 0) && (
                    <div style={styles.noBookings}>No bookings yet</div>
                  )}
                  {eq.bookings?.map((b) => {
                    const sc = bookingStatusColors[b.status] || bookingStatusColors.Pending;
                    return (
                      <div key={b._id} style={styles.bookingRow}>
                        <div style={styles.bookingInfo}>
                          <div style={styles.bookingName}>{b.bookedByName}</div>
                          <div style={styles.bookingMeta}>
                            📞 {b.contactNumber} · {b.durationDays} day(s) ·
                            {new Date(b.bookedAt).toLocaleDateString('en-BD')}
                          </div>
                          {b.note && <div style={styles.bookingNote}>💬 {b.note}</div>}
                        </div>
                        <div style={styles.bookingRight}>
                          <span style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color }}>
                            {b.status}
                          </span>
                          {b.status === 'Pending' && (
                            <div style={styles.bookingBtns}>
                              <button style={styles.confirmBtn}
                                onClick={() => handleBookingStatus(eq._id, b._id, 'Confirmed')}>
                                ✅
                              </button>
                              <button style={styles.activeBtn}
                                onClick={() => handleBookingStatus(eq._id, b._id, 'Active')}>
                                🔄
                              </button>
                              <button style={styles.cancelBookBtn}
                                onClick={() => handleBookingStatus(eq._id, b._id, 'Cancelled')}>
                                ❌
                              </button>
                            </div>
                          )}
                          {b.status === 'Active' && (
                            <button style={styles.returnBtn}
                              onClick={() => handleBookingStatus(eq._id, b._id, 'Returned')}>
                              📦 Returned
                            </button>
                          )}
                          {b.status === 'Confirmed' && (
                            <button style={styles.activeBtn2}
                              onClick={() => handleBookingStatus(eq._id, b._id, 'Active')}>
                              🔄 Mark Active
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
  addBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  backBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  container: { maxWidth: '800px', margin: '0 auto', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '28px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
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
  addBtn2: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '12px',
  },
  listingCard: {
    backgroundColor: '#fff', borderRadius: '14px', padding: '20px 24px',
    border: '1px solid #C6EBC5', marginBottom: '14px',
  },
  cardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px',
  },
  cardLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  equipIcon: { fontSize: '28px' },
  equipType: { fontSize: '16px', fontWeight: 'bold', color: '#333' },
  facilityName: { fontSize: '12px', color: '#888' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  availBadge: {
    borderRadius: '12px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '12px',
    padding: '3px 10px', fontSize: '11px', fontWeight: 'bold',
  },
  statsRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
  statChip: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '12px',
    padding: '3px 10px', fontSize: '12px', color: '#555',
  },
  editRow: { display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' },
  editField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  editLabel: { fontSize: '11px', color: '#888', fontWeight: '600' },
  editInput: {
    width: '110px', padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', outline: 'none', backgroundColor: '#FEFDEC',
  },
  saveBtn: {
    padding: '8px 16px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  cancelBtn: {
    padding: '8px 14px', backgroundColor: '#f5f5f5', color: '#888',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
  actionRow: { display: 'flex', gap: '10px' },
  editBtn: {
    padding: '7px 16px', backgroundColor: '#FEFDEC', color: '#FA7070',
    border: '1.5px solid #FA7070', borderRadius: '8px', fontWeight: 'bold',
    cursor: 'pointer', fontSize: '12px',
  },
  expandBtn: {
    padding: '7px 14px', backgroundColor: '#f5f5f5', color: '#555',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
  },
  deleteBtn: {
    padding: '7px 14px', backgroundColor: '#fdecea', color: '#c0392b',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  bookingsSection: {
    marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f0f0f0',
  },
  noBookings: { fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '12px' },
  bookingRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '12px 0', borderBottom: '1px solid #f9f9f9', flexWrap: 'wrap', gap: '8px',
  },
  bookingInfo: {},
  bookingName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  bookingMeta: { fontSize: '12px', color: '#888', marginTop: '2px' },
  bookingNote: { fontSize: '11px', color: '#aaa', marginTop: '3px', fontStyle: 'italic' },
  bookingRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  statusBadge: {
    borderRadius: '10px', padding: '3px 10px', fontSize: '11px', fontWeight: 'bold',
  },
  bookingBtns: { display: 'flex', gap: '6px' },
  confirmBtn: {
    padding: '5px 10px', backgroundColor: '#C6EBC5', color: '#27AE60',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  activeBtn: {
    padding: '5px 10px', backgroundColor: '#e8f4fd', color: '#2980b9',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  cancelBookBtn: {
    padding: '5px 10px', backgroundColor: '#fdecea', color: '#c0392b',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  returnBtn: {
    padding: '6px 12px', backgroundColor: '#f3e5f5', color: '#8e44ad',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
  activeBtn2: {
    padding: '6px 12px', backgroundColor: '#e8f4fd', color: '#2980b9',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
};

export default EquipmentManagePage;