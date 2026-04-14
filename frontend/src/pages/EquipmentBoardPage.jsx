import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const districts = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Tangail'],
  Chittagong: ['Chittagong', "Cox's Bazar", 'Comilla', 'Noakhali', 'Feni', 'Brahmanbaria'],
  Rajshahi: ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Natore', 'Chapainawabganj'],
  Khulna: ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Narail', 'Magura'],
  Barisal: ['Barisal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrokona'],
};

const equipmentTypes = [
  'Oxygen Cylinder',
  'Dialysis Machine',
  'NICU Bed',
  'Burn Unit Bed',
  'Wheelchair',
  'Hospital Bed',
  'Ventilator',
  'Suction Machine',
  'Infusion Pump',
  'ECG Machine',
];

const equipmentIcons = {
  'Oxygen Cylinder':  '🫁',
  'Dialysis Machine': '🩺',
  'NICU Bed':         '👶',
  'Burn Unit Bed':    '🔥',
  'Wheelchair':       '♿',
  'Hospital Bed':     '🛏️',
  'Ventilator':       '💨',
  'Suction Machine':  '⚕️',
  'Infusion Pump':    '💉',
  'ECG Machine':      '❤️',
};

const getStockStyle = (eq) => {
  if (!eq.isAvailable || eq.quantity === 0)
    return { bg: '#f5f5f5', color: '#aaa', label: 'Unavailable' };
  if (eq.quantity < 3)
    return { bg: '#fdecea', color: '#c0392b', label: `${eq.quantity} left (Critical)` };
  if (eq.quantity < 8)
    return { bg: '#FEF9E7', color: '#E67E22', label: `${eq.quantity} units (Low)` };
  return { bg: '#C6EBC5', color: '#27AE60', label: `${eq.quantity} units (Good)` };
};

const EquipmentBoardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    equipmentType: '', division: '', district: '', facilityType: '',
  });

  // Book modal
  const [bookModal, setBookModal] = useState(null);
  const [bookForm, setBookForm] = useState({ durationDays: 1, contactNumber: '', note: '' });
  const [bookMsg, setBookMsg] = useState('');
  const [bookLoading, setBookLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const params = {};
      if (filters.equipmentType) params.equipmentType = filters.equipmentType;
      if (filters.division)      params.division      = filters.division;
      if (filters.district)      params.district      = filters.district;
      if (filters.facilityType)  params.facilityType  = filters.facilityType;

      const { data } = await axios.get('/api/equipment/search', { params });
      setEquipment(data.equipment);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load all on mount
  useEffect(() => { handleSearch(); }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setBookLoading(true);
    setBookMsg('');
    try {
      await axios.post(
        '/api/equipment/' + bookModal._id + '/book',
        bookForm,
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setBookMsg('✅ Booked! The facility will confirm your booking.');
      setTimeout(() => {
        setBookModal(null);
        setBookMsg('');
        handleSearch();
      }, 2500);
    } catch (err) {
      setBookMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setBookLoading(false);
    }
  };

  const totalCost = bookModal
    ? (bookForm.durationDays * bookModal.pricePerDay).toLocaleString()
    : 0;

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.addBtn} onClick={() => navigate('/equipment/add')}>
            + List Equipment
          </button>
          <button style={styles.manageBtn} onClick={() => navigate('/equipment/manage')}>
            ⚙️ My Listings
          </button>
          <button style={styles.bookingsBtn} onClick={() => navigate('/equipment/bookings')}>
            📋 My Bookings
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>⚕️</span>
          <h1 style={styles.title}>Medical Equipment Finder</h1>
          <p style={styles.subtitle}>
            Find oxygen cylinders, dialysis machines, NICU beds and more near you
          </p>
        </div>

        {/* Equipment type quick picks */}
        <div style={styles.typeGrid}>
          {equipmentTypes.map((type) => (
            <button
              key={type}
              style={{
                ...styles.typeChip,
                ...(filters.equipmentType === type ? styles.typeChipActive : {}),
              }}
              onClick={() => {
                const newType = filters.equipmentType === type ? '' : type;
                setFilters({ ...filters, equipmentType: newType });
              }}
            >
              {equipmentIcons[type]} {type}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          <select style={styles.filterInput} value={filters.facilityType}
            onChange={(e) => setFilters({ ...filters, facilityType: e.target.value })}>
            <option value="">All Facilities</option>
            <option value="Hospital">🏥 Hospital</option>
            <option value="Vendor">🏪 Vendor</option>
            <option value="Clinic">🏨 Clinic</option>
            <option value="NGO">🏢 NGO</option>
          </select>

          <select style={styles.filterInput} value={filters.division}
            onChange={(e) => setFilters({ ...filters, division: e.target.value, district: '' })}>
            <option value="">All Divisions</option>
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select style={styles.filterInput} value={filters.district}
            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
            disabled={!filters.division}>
            <option value="">All Districts</option>
            {filters.division && districts[filters.division]?.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button style={styles.searchBtn} onClick={handleSearch}>
            🔍 Search
          </button>
          <button style={styles.resetBtn} onClick={() => {
            setFilters({ equipmentType: '', division: '', district: '', facilityType: '' });
            setTimeout(handleSearch, 100);
          }}>
            Reset
          </button>
        </div>

        {error && <div style={styles.errorMsg}>{error}</div>}
        {loading && <div style={styles.centerMsg}>Searching...</div>}

        {searched && !loading && equipment.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>⚕️</span>
            <p style={{ color: '#888', marginTop: '12px' }}>
              No equipment found matching your search
            </p>
            <p style={{ color: '#aaa', fontSize: '13px' }}>
              Try a different type or location
            </p>
          </div>
        )}

        <div style={styles.resultsList}>
          {equipment.map((eq) => {
            const stock = getStockStyle(eq);
            return (
              <div key={eq._id} style={styles.equipCard}>
                <div style={styles.cardTop}>
                  <div style={styles.equipLeft}>
                    <div style={styles.equipIcon}>
                      {equipmentIcons[eq.equipmentType]}
                    </div>
                    <div>
                      <div style={styles.equipType}>{eq.equipmentType}</div>
                      <div style={styles.equipFacility}>
                        {eq.facilityName} · {eq.facilityType}
                      </div>
                    </div>
                  </div>
                  <div style={{ ...styles.stockBadge, backgroundColor: stock.bg, color: stock.color }}>
                    {stock.label}
                  </div>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>📍 Location</span>
                    <span style={styles.infoValue}>
                      {eq.location.district}, {eq.location.division}
                      {eq.location.area && ` · ${eq.location.area}`}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>📦 Available Units</span>
                    <span style={{ ...styles.infoValue, color: stock.color, fontWeight: 'bold' }}>
                      {eq.quantity}
                    </span>
                  </div>
                  {eq.description && (
                    <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
                      <span style={styles.infoLabel}>📝 Details</span>
                      <span style={styles.infoValue}>{eq.description}</span>
                    </div>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.priceTag}>
                    ৳ {eq.pricePerDay.toLocaleString()}
                    <span style={styles.perDay}> / day</span>
                  </div>
                  <div style={styles.cardActions}>
                    <a href={'tel:' + eq.contactNumber} style={styles.callBtn}>
                      📞 Call
                    </a>
                    {eq.isAvailable && eq.quantity > 0 && user && (
                      <button
                        style={styles.bookBtn}
                        onClick={() => {
                          setBookModal(eq);
                          setBookForm({ durationDays: 1, contactNumber: '', note: '' });
                          setBookMsg('');
                        }}
                      >
                        📅 Book
                      </button>
                    )}
                    {!user && eq.isAvailable && (
                      <button style={styles.bookBtn} onClick={() => navigate('/login')}>
                        📅 Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Book Modal */}
      {bookModal && (
        <div style={styles.modalOverlay} onClick={() => setBookModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>📅 Book Equipment</h3>
            <p style={styles.modalEquip}>
              {equipmentIcons[bookModal.equipmentType]} {bookModal.equipmentType}
            </p>
            <p style={styles.modalFacility}>
              {bookModal.facilityName} · ৳{bookModal.pricePerDay.toLocaleString()}/day
            </p>

            {bookMsg && (
              <div style={bookMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                {bookMsg}
              </div>
            )}

            <form onSubmit={handleBook}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Duration (days) *</label>
                <input
                  style={styles.input}
                  type="number" min="1" max="365"
                  value={bookForm.durationDays}
                  onChange={(e) => setBookForm({ ...bookForm, durationDays: e.target.value })}
                  required
                />
                <small style={styles.hint}>
                  Total estimated cost: ৳{totalCost}
                </small>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Your Contact Number *</label>
                <input
                  style={styles.input}
                  type="tel" placeholder="01XXXXXXXXX"
                  value={bookForm.contactNumber}
                  onChange={(e) => setBookForm({ ...bookForm, contactNumber: e.target.value })}
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Note (optional)</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. for home use, patient details..."
                  value={bookForm.note}
                  onChange={(e) => setBookForm({ ...bookForm, note: e.target.value })}
                />
              </div>
              <div style={styles.modalBtns}>
                <button type="button" style={styles.cancelBtn}
                  onClick={() => setBookModal(null)}>
                  Cancel
                </button>
                <button type="submit" style={styles.confirmBtn} disabled={bookLoading}>
                  {bookLoading ? 'Booking...' : '✅ Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  navRight: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  addBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  manageBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  bookingsBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  backBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  container: { maxWidth: '960px', margin: '0 auto', padding: '32px 20px' },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
  typeGrid: {
    display: 'flex', flexWrap: 'wrap', gap: '8px',
    marginBottom: '16px',
  },
  typeChip: {
    padding: '8px 14px', backgroundColor: '#fff', border: '1.5px solid #C6EBC5',
    borderRadius: '20px', fontSize: '12px', color: '#555', cursor: 'pointer', fontWeight: '500',
  },
  typeChipActive: {
    backgroundColor: '#FA7070', border: '1.5px solid #FA7070',
    color: '#fff', fontWeight: 'bold',
  },
  filterBar: {
    display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#fff',
    padding: '16px 20px', borderRadius: '12px', border: '1px solid #C6EBC5',
    marginBottom: '20px', flexWrap: 'wrap',
  },
  filterInput: {
    padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '12px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none',
  },
  searchBtn: {
    padding: '8px 20px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  resetBtn: {
    padding: '8px 14px', backgroundColor: '#f5f5f5', color: '#888',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
  },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  centerMsg: { textAlign: 'center', color: '#888', padding: '40px' },
  emptyBox: {
    textAlign: 'center', padding: '60px', backgroundColor: '#fff',
    borderRadius: '16px', border: '1px solid #C6EBC5',
  },
  resultsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  equipCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '22px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5',
  },
  cardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px',
  },
  equipLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  equipIcon: { fontSize: '32px' },
  equipType: { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '3px' },
  equipFacility: { fontSize: '12px', color: '#888' },
  stockBadge: {
    borderRadius: '20px', padding: '5px 14px',
    fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap',
  },
  infoGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '10px', marginBottom: '14px',
  },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  infoLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600' },
  infoValue: { fontSize: '13px', color: '#333', fontWeight: '500' },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '14px', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px',
  },
  priceTag: { fontSize: '20px', fontWeight: 'bold', color: '#FA7070' },
  perDay: { fontSize: '13px', color: '#aaa', fontWeight: 'normal' },
  cardActions: { display: 'flex', gap: '10px' },
  callBtn: {
    padding: '8px 16px', backgroundColor: '#C6EBC5', color: '#27AE60',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none',
  },
  bookBtn: {
    padding: '8px 16px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
    width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  modalTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  modalEquip: { fontSize: '16px', fontWeight: '600', color: '#FA7070', margin: '0 0 2px' },
  modalFacility: { fontSize: '12px', color: '#888', marginBottom: '18px' },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333',
  },
  hint: { fontSize: '11px', color: '#aaa', marginTop: '4px', display: 'block' },
  modalBtns: { display: 'flex', gap: '12px', marginTop: '8px' },
  cancelBtn: {
    flex: 1, padding: '12px', backgroundColor: '#f5f5f5', color: '#888',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  confirmBtn: {
    flex: 1, padding: '12px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
};

export default EquipmentBoardPage;