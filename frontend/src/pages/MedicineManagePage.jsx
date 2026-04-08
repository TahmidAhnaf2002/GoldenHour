import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MedicineManagePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ stockUnits: '', pricePerUnit: '' });
  const [activeTab, setActiveTab] = useState('listings');
  const [reservations, setReservations] = useState([]);
  const [resLoading, setResLoading] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (activeTab === 'reservations') fetchReservationsOnListings();
  }, [activeTab]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/medicines/mine', {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      setListings(data.medicines);
    } catch {
      setMsg('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservationsOnListings = async () => {
    setResLoading(true);
    try {
      const { data } = await axios.get('/api/medicines/mine', {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      const allRes = [];
      data.medicines.forEach((med) => {
        med.reservations.forEach((r) => {
          allRes.push({ ...r, medicineName: med.medicineName, medicineId: med._id });
        });
      });
      allRes.sort((a, b) => new Date(b.reservedAt) - new Date(a.reservedAt));
      setReservations(allRes);
    } catch {
      setMsg('Failed to load reservations');
    } finally {
      setResLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        '/api/medicines/' + id,
        { stockUnits: Number(editForm.stockUnits), pricePerUnit: Number(editForm.pricePerUnit) },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setMsg('✅ Updated!');
      setEditingId(null);
      fetchListings();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await axios.delete('/api/medicines/' + id, {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      setMsg('✅ Listing deleted');
      fetchListings();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Delete failed');
    }
  };

  const handleResStatus = async (medicineId, resId, status) => {
    try {
      await axios.put(
        '/api/medicines/' + medicineId + '/reservations/' + resId + '/status',
        { status },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      fetchReservationsOnListings();
      fetchListings();
    } catch {
      setMsg('❌ Failed to update reservation');
    }
  };

  const statusColor = (status) => {
    if (status === 'Pending') return { bg: '#FEF9E7', color: '#E67E22' };
    if (status === 'Confirmed') return { bg: '#C6EBC5', color: '#27AE60' };
    if (status === 'Picked Up') return { bg: '#e8f4fd', color: '#2980b9' };
    return { bg: '#f5f5f5', color: '#aaa' };
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.addBtn} onClick={() => navigate('/medicines/add')}>+ Add Medicine</button>
          <button style={styles.backBtn} onClick={() => navigate('/medicines')}>← Back</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>💊 Manage Listings</h1>
          <p style={styles.subtitle}>Update stock levels and handle reservations</p>
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        <div style={styles.tabs}>
          <button style={activeTab === 'listings' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('listings')}>
            📋 My Listings ({listings.length})
          </button>
          <button style={activeTab === 'reservations' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('reservations')}>
            📦 Reservations
          </button>
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            {loading && <div style={styles.centerMsg}>Loading...</div>}
            {!loading && listings.length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '40px' }}>💊</span>
                <p style={{ color: '#888', marginTop: '12px' }}>No listings yet</p>
                <button style={styles.addBtn2} onClick={() => navigate('/medicines/add')}>
                  + Add Your First Listing
                </button>
              </div>
            )}
            {listings.map((med) => (
              <div key={med._id} style={styles.listingCard}>
                <div style={styles.listingTop}>
                  <div>
                    <div style={styles.listingName}>{med.medicineName}</div>
                    {med.genericName && <div style={styles.listingGeneric}>{med.genericName}</div>}
                    <div style={styles.listingFacility}>{med.facilityName} · {med.facilityType}</div>
                  </div>
                  <div style={styles.listingRight}>
                    <div style={{
                      ...styles.availBadge,
                      backgroundColor: med.isAvailable ? '#C6EBC5' : '#f5f5f5',
                      color: med.isAvailable ? '#27AE60' : '#aaa',
                    }}>
                      {med.isAvailable ? '✅ Available' : '❌ Out of Stock'}
                    </div>
                  </div>
                </div>

                <div style={styles.listingStats}>
                  <span style={styles.statChip}>📦 {med.stockUnits} units</span>
                  <span style={styles.statChip}>৳ {med.pricePerUnit}/unit</span>
                  <span style={styles.statChip}>📋 {med.reservations.length} reservations</span>
                </div>

                {editingId === med._id ? (
                  <div style={styles.editRow}>
                    <div style={styles.editField}>
                      <label style={styles.editLabel}>Stock Units</label>
                      <input style={styles.editInput} type="number" min="0"
                        value={editForm.stockUnits}
                        onChange={(e) => setEditForm({ ...editForm, stockUnits: e.target.value })} />
                    </div>
                    <div style={styles.editField}>
                      <label style={styles.editLabel}>Price (৳)</label>
                      <input style={styles.editInput} type="number" min="0"
                        value={editForm.pricePerUnit}
                        onChange={(e) => setEditForm({ ...editForm, pricePerUnit: e.target.value })} />
                    </div>
                    <button style={styles.saveEditBtn} onClick={() => handleUpdate(med._id)}>
                      💾 Save
                    </button>
                    <button style={styles.cancelEditBtn} onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={styles.listingActions}>
                    <button style={styles.editBtn}
                      onClick={() => {
                        setEditingId(med._id);
                        setEditForm({ stockUnits: med.stockUnits, pricePerUnit: med.pricePerUnit });
                      }}>
                      ✏️ Edit
                    </button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(med._id)}>
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div>
            {resLoading && <div style={styles.centerMsg}>Loading...</div>}
            {!resLoading && reservations.length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '40px' }}>📦</span>
                <p style={{ color: '#888', marginTop: '12px' }}>No reservations yet</p>
              </div>
            )}
            {reservations.map((res) => {
              const sc = statusColor(res.status);
              return (
                <div key={res._id} style={styles.resCard}>
                  <div style={styles.resTop}>
                    <div>
                      <div style={styles.resMedName}>{res.medicineName}</div>
                      <div style={styles.resMeta}>
                        👤 {res.reservedByName} · 📞 {res.contactNumber} · {res.unitsReserved} unit(s)
                      </div>
                      <div style={styles.resDate}>
                        {new Date(res.reservedAt).toLocaleDateString('en-BD')}
                      </div>
                    </div>
                    <span style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color }}>
                      {res.status}
                    </span>
                  </div>
                  {res.status === 'Pending' && (
                    <div style={styles.resActions}>
                      <button style={styles.confirmResBtn}
                        onClick={() => handleResStatus(res.medicineId, res._id, 'Confirmed')}>
                        ✅ Confirm
                      </button>
                      <button style={styles.pickedUpBtn}
                        onClick={() => handleResStatus(res.medicineId, res._id, 'Picked Up')}>
                        📦 Picked Up
                      </button>
                      <button style={styles.cancelResBtn}
                        onClick={() => handleResStatus(res.medicineId, res._id, 'Cancelled')}>
                        ❌ Cancel
                      </button>
                    </div>
                  )}
                  {res.status === 'Confirmed' && (
                    <div style={styles.resActions}>
                      <button style={styles.pickedUpBtn}
                        onClick={() => handleResStatus(res.medicineId, res._id, 'Picked Up')}>
                        📦 Mark Picked Up
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
    textAlign: 'center', padding: '50px', backgroundColor: '#fff',
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
  listingTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' },
  listingName: { fontSize: '16px', fontWeight: 'bold', color: '#333' },
  listingGeneric: { fontSize: '12px', color: '#888' },
  listingFacility: { fontSize: '12px', color: '#aaa' },
  listingRight: {},
  availBadge: {
    borderRadius: '12px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold',
  },
  listingStats: { display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' },
  statChip: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '12px',
    padding: '3px 10px', fontSize: '12px', color: '#555',
  },
  editRow: { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' },
  editField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  editLabel: { fontSize: '11px', color: '#888', fontWeight: '600' },
  editInput: {
    width: '100px', padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', outline: 'none', backgroundColor: '#FEFDEC',
  },
  saveEditBtn: {
    padding: '8px 16px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  cancelEditBtn: {
    padding: '8px 14px', backgroundColor: '#f5f5f5', color: '#888',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
  listingActions: { display: 'flex', gap: '10px' },
  editBtn: {
    padding: '7px 16px', backgroundColor: '#FEFDEC', color: '#FA7070',
    border: '1.5px solid #FA7070', borderRadius: '8px', fontWeight: 'bold',
    cursor: 'pointer', fontSize: '12px',
  },
  deleteBtn: {
    padding: '7px 14px', backgroundColor: '#fdecea', color: '#c0392b',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  resCard: {
    backgroundColor: '#fff', borderRadius: '14px', padding: '18px 22px',
    border: '1px solid #C6EBC5', marginBottom: '12px',
  },
  resTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' },
  resMedName: { fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '3px' },
  resMeta: { fontSize: '12px', color: '#555' },
  resDate: { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  statusBadge: {
    borderRadius: '12px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold',
  },
  resActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  confirmResBtn: {
    padding: '6px 14px', backgroundColor: '#C6EBC5', color: '#27AE60',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
  pickedUpBtn: {
    padding: '6px 14px', backgroundColor: '#e8f4fd', color: '#2980b9',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
  cancelResBtn: {
    padding: '6px 14px', backgroundColor: '#fdecea', color: '#c0392b',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
};

export default MedicineManagePage;