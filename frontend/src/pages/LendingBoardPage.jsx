import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const districts = {
  Dhaka:      ['Dhaka', 'Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Tangail'],
  Chittagong: ['Chittagong', "Cox's Bazar", 'Comilla', 'Noakhali', 'Feni', 'Brahmanbaria'],
  Rajshahi:   ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Natore', 'Chapainawabganj'],
  Khulna:     ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Narail', 'Magura'],
  Barisal:    ['Barisal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna'],
  Sylhet:     ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur:    ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrokona'],
};

const equipmentTypes = [
  'Wheelchair', 'Hospital Bed', 'Oxygen Cylinder', 'Crutches',
  'Walker / Zimmer Frame', 'Nebulizer', 'Blood Pressure Monitor',
  'Pulse Oximeter', 'Thermometer', 'Suction Machine',
  'Infusion Pump', 'ECG Machine', 'Other',
];

const equipmentIcons = {
  'Wheelchair':               '♿',
  'Hospital Bed':             '🛏️',
  'Oxygen Cylinder':          '🫁',
  'Crutches':                 '🩼',
  'Walker / Zimmer Frame':    '🚶',
  'Nebulizer':                '💨',
  'Blood Pressure Monitor':   '🩺',
  'Pulse Oximeter':           '🩸',
  'Thermometer':              '🌡️',
  'Suction Machine':          '⚕️',
  'Infusion Pump':            '💉',
  'ECG Machine':              '❤️',
  'Other':                    '🏥',
};

const conditionColors = {
  Excellent: { bg: '#C6EBC5', color: '#27AE60' },
  Good:      { bg: '#FEF9E7', color: '#E67E22' },
  Fair:      { bg: '#fdecea', color: '#c0392b' },
};

const LendingBoardPage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ equipmentType: '', division: '', district: '' });
  const [expanded, setExpanded]   = useState(null);
  const [requestForm, setRequestForm] = useState({ borrowerPhone: '', purpose: '', durationDays: 1 });
  const [requestMsg, setRequestMsg]   = useState({});
  const [requestLoading, setRequestLoading] = useState({});

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/lending', { params });
      setListings(data.listings);
    } catch { setListings([]); }
    finally  { setLoading(false); }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.equipmentType) params.equipmentType = filters.equipmentType;
    if (filters.division)      params.division      = filters.division;
    if (filters.district)      params.district      = filters.district;
    fetchListings(params);
  };

  const handleRequest = async (listingId) => {
    if (!user) { navigate('/login'); return; }
    if (!requestForm.borrowerPhone.trim()) {
      setRequestMsg({ [listingId]: '❌ Please enter your phone number' });
      return;
    }
    setRequestLoading({ [listingId]: true });
    try {
      await axios.post(
        `/api/lending/${listingId}/request`,
        requestForm,
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setRequestMsg({ [listingId]: '✅ Request sent! The lender will contact you.' });
      setRequestForm({ borrowerPhone: '', purpose: '', durationDays: 1 });
      setTimeout(() => setRequestMsg({}), 4000);
    } catch (err) {
      setRequestMsg({ [listingId]: '❌ ' + (err.response?.data?.message || 'Failed') });
    } finally {
      setRequestLoading({ [listingId]: false });
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    return '⭐'.repeat(Math.round(rating)) + ` (${rating})`;
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.listBtn} onClick={() => navigate('/lending/list')}>
            + List Equipment
          </button>
          <button style={styles.dashBtn} onClick={() => navigate('/lending/dashboard')}>
            📦 My Lending
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🤝</span>
          <h1 style={styles.title}>Community Lending Library</h1>
          <p style={styles.subtitle}>
            Borrow medical equipment from community members near you
          </p>
        </div>

        {/* Filters */}
        <form onSubmit={handleFilter} style={styles.filterBar}>
          <select style={styles.filterInput} value={filters.equipmentType}
            onChange={(e) => setFilters({ ...filters, equipmentType: e.target.value })}>
            <option value="">All Equipment</option>
            {equipmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select style={styles.filterInput} value={filters.division}
            onChange={(e) => setFilters({ ...filters, division: e.target.value, district: '' })}>
            <option value="">All Divisions</option>
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select style={styles.filterInput} value={filters.district}
            disabled={!filters.division}
            onChange={(e) => setFilters({ ...filters, district: e.target.value })}>
            <option value="">All Districts</option>
            {filters.division && districts[filters.division]?.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <button style={styles.filterBtn} type="submit">🔍 Filter</button>
          <button style={styles.resetBtn} type="button" onClick={() => {
            setFilters({ equipmentType: '', division: '', district: '' });
            fetchListings();
          }}>Reset</button>
        </form>

        <div style={styles.resultCount}>
          {loading ? 'Loading...' : `${listings.length} item(s) available`}
        </div>

        {!loading && listings.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>🤝</span>
            <p style={{ color: '#888', marginTop: '12px' }}>No equipment available in this area</p>
            <button style={styles.listBtn2} onClick={() => navigate('/lending/list')}>
              Be the first to list equipment
            </button>
          </div>
        )}

        <div style={styles.cardList}>
          {listings.map((item) => {
            const cc   = conditionColors[item.condition] || conditionColors.Good;
            const icon = equipmentIcons[item.equipmentType] || '🏥';
            const isOpen = expanded === item._id;

            return (
              <div key={item._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.cardLeft}>
                    <div style={styles.equipIcon}>{icon}</div>
                    <div>
                      <div style={styles.equipName}>{item.equipmentName}</div>
                      <div style={styles.equipType}>{item.equipmentType}</div>
                      <div style={styles.equipMeta}>
                        📍 {item.location.area && `${item.location.area}, `}
                        {item.location.district}, {item.location.division}
                      </div>
                    </div>
                  </div>
                  <div style={styles.cardRight}>
                    <span style={{ ...styles.conditionBadge, backgroundColor: cc.bg, color: cc.color }}>
                      {item.condition}
                    </span>
                    {item.averageRating && (
                      <div style={styles.ratingText}>{renderStars(item.averageRating)}</div>
                    )}
                    <div style={styles.lendCount}>{item.totalLends} lend(s)</div>
                  </div>
                </div>

                <div style={styles.metaRow}>
                  <span style={styles.metaBadge}>
                    💰 Deposit: ৳{item.depositAmount > 0 ? item.depositAmount : 'Free'}
                  </span>
                  <span style={styles.metaBadge}>
                    📅 Max {item.maxDurationDays} days
                  </span>
                  <span style={styles.metaBadge}>
                    👤 {item.lenderName}
                  </span>
                </div>

                {item.description && (
                  <div style={styles.description}>{item.description}</div>
                )}

                <div style={styles.cardFooter}>
                  <a href={'tel:' + item.lenderPhone} style={styles.callBtn}>
                    📞 {item.lenderPhone}
                  </a>
                  <button style={styles.borrowBtn} onClick={() => setExpanded(isOpen ? null : item._id)}>
                    {isOpen ? '▲ Close' : '📋 Borrow This'}
                  </button>
                </div>

                {/* Borrow request form */}
                {isOpen && (
                  <div style={styles.requestSection}>
                    <div style={styles.requestTitle}>📋 Send Borrow Request</div>
                    {requestMsg[item._id] && (
                      <div style={requestMsg[item._id].includes('✅') ? styles.successMsg : styles.errorMsg}>
                        {requestMsg[item._id]}
                      </div>
                    )}
                    <div style={styles.requestRow}>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>Your Phone *</label>
                        <input style={styles.input} type="tel" placeholder="01XXXXXXXXX"
                          value={requestForm.borrowerPhone}
                          onChange={(e) => setRequestForm({ ...requestForm, borrowerPhone: e.target.value })} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>Duration (days)</label>
                        <input style={styles.input} type="number" min="1" max={item.maxDurationDays}
                          value={requestForm.durationDays}
                          onChange={(e) => setRequestForm({ ...requestForm, durationDays: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label style={styles.label}>Purpose / Reason</label>
                      <input style={styles.input} type="text"
                        placeholder="e.g. Post-surgery recovery at home"
                        value={requestForm.purpose}
                        onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })} />
                    </div>
                    {item.depositAmount > 0 && (
                      <div style={styles.depositNote}>
                        💰 Refundable deposit of ৳{item.depositAmount} required — arrange directly with the lender
                      </div>
                    )}
                    <button style={styles.sendRequestBtn}
                      disabled={requestLoading[item._id]}
                      onClick={() => handleRequest(item._id)}>
                      {requestLoading[item._id] ? 'Sending...' : '📤 Send Request'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper:        { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:         { backgroundColor: '#FA7070', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  navLogo:        { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:    { fontWeight: 'bold', color: '#fff' },
  navRight:       { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  listBtn:        { backgroundColor: '#fff', color: '#FA7070', border: 'none', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  dashBtn:        { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  backBtn:        { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:      { maxWidth: '900px', margin: '0 auto', padding: '32px 20px' },
  header:         { textAlign: 'center', marginBottom: '20px' },
  title:          { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle:       { fontSize: '14px', color: '#888' },
  filterBar:      { display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #C6EBC5', marginBottom: '16px', flexWrap: 'wrap' },
  filterInput:    { padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '12px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none' },
  filterBtn:      { padding: '8px 18px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  resetBtn:       { padding: '8px 14px', backgroundColor: '#f5f5f5', color: '#888', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  resultCount:    { fontSize: '13px', color: '#888', marginBottom: '16px' },
  emptyBox:       { textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #C6EBC5' },
  listBtn2:       { marginTop: '14px', padding: '10px 20px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  cardList:       { display: 'flex', flexDirection: 'column', gap: '16px' },
  card:           { backgroundColor: '#fff', borderRadius: '16px', padding: '22px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5' },
  cardTop:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' },
  cardLeft:       { display: 'flex', gap: '14px', alignItems: 'flex-start' },
  equipIcon:      { fontSize: '32px' },
  equipName:      { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '2px' },
  equipType:      { fontSize: '12px', color: '#888', marginBottom: '3px' },
  equipMeta:      { fontSize: '12px', color: '#aaa' },
  cardRight:      { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  conditionBadge: { borderRadius: '10px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold' },
  ratingText:     { fontSize: '12px', color: '#E67E22' },
  lendCount:      { fontSize: '11px', color: '#aaa' },
  metaRow:        { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' },
  metaBadge:      { backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '10px', padding: '3px 10px', fontSize: '12px', color: '#555' },
  description:    { fontSize: '13px', color: '#666', fontStyle: 'italic', marginBottom: '12px' },
  cardFooter:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px' },
  callBtn:        { padding: '7px 14px', backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none' },
  borrowBtn:      { padding: '7px 16px', backgroundColor: '#FEFDEC', color: '#FA7070', border: '1.5px solid #FA7070', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' },
  requestSection: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' },
  requestTitle:   { fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '12px' },
  successMsg:     { backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' },
  errorMsg:       { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' },
  requestRow:     { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' },
  label:          { display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '5px' },
  input:          { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333' },
  depositNote:    { backgroundColor: '#FEF9E7', border: '1px solid #fceab0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#E67E22', margin: '12px 0' },
  sendRequestBtn: { padding: '10px 22px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '4px' },
};

export default LendingBoardPage;