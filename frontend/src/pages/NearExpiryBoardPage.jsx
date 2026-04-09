import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const categoryConfig = {
  Critical: { bg: '#fdecea', color: '#c0392b', label: '🚨 Expires in ≤7 days', border: '#f5c6cb' },
  Urgent:   { bg: '#FEF9E7', color: '#E67E22', label: '⚠️ Expires in ≤30 days', border: '#fceab0' },
  Soon:     { bg: '#C6EBC5', color: '#27AE60', label: '🟢 Expires in ≤90 days', border: '#b2dfb0' },
};

const NearExpiryBoardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [divisionFilter, setDivisionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [msg, setMsg] = useState('');

  // Claim modal
  const [claimModal, setClaimModal] = useState(null);
  const [claimForm, setClaimForm] = useState({
    claimerType: 'Patient', contactNumber: '', unitsRequested: 1, note: '',
  });
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');

  useEffect(() => {
    fetchListings();
    fetchStats();
  }, []);

  const fetchListings = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/nearexpiry', { params });
      setListings(data.listings);
    } catch {
      setMsg('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/nearexpiry/stats');
      setStats(data);
    } catch { /* silent */ }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (divisionFilter) params.division = divisionFilter;
    if (categoryFilter) params.category = categoryFilter;
    fetchListings(params);
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setClaimLoading(true);
    setClaimMsg('');
    try {
      await axios.post(
        '/api/nearexpiry/' + claimModal._id + '/claim',
        claimForm,
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setClaimMsg('✅ Claim submitted! The facility will confirm your pickup.');
      setTimeout(() => {
        setClaimModal(null);
        setClaimMsg('');
        fetchListings();
        fetchStats();
      }, 2500);
    } catch (err) {
      setClaimMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setClaimLoading(false);
    }
  };

  const discountPct = (original, discounted) =>
    original > 0 ? Math.round(((original - discounted) / original) * 100) : 0;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-BD', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.postBtn} onClick={() => navigate('/nearexpiry/post')}>
            + Post Medicine
          </button>
          <button style={styles.manageBtn} onClick={() => navigate('/nearexpiry/manage')}>
            ⚙️ My Posts
          </button>
          <button style={styles.claimsBtn} onClick={() => navigate('/nearexpiry/myclaims')}>
            📋 My Claims
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>♻️</span>
          <h1 style={styles.title}>Near-Expiry Medicine Board</h1>
          <p style={styles.subtitle}>
            Claim discounted medicines before they expire — reduce waste, help patients
          </p>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{stats.totalSaved}</div>
              <div style={styles.statLabel}>💊 Units Saved from Waste</div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statNum, color: '#27AE60' }}>{stats.activeListings}</div>
              <div style={styles.statLabel}>✅ Active Listings</div>
            </div>
            <div style={styles.statCard}>
              <div style={{ ...styles.statNum, color: '#E67E22' }}>{stats.totalListings}</div>
              <div style={styles.statLabel}>📦 Total Posted</div>
            </div>
          </div>
        )}

        {/* Category legend */}
        <div style={styles.legendRow}>
          {Object.entries(categoryConfig).map(([key, val]) => (
            <div key={key} style={{ ...styles.legendChip, backgroundColor: val.bg, color: val.color, border: `1px solid ${val.border}` }}>
              {val.label}
            </div>
          ))}
        </div>

        {/* Filters */}
        <form onSubmit={handleFilter} style={styles.filterBar}>
          <select style={styles.filterInput} value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Critical">🚨 Critical (≤7 days)</option>
            <option value="Urgent">⚠️ Urgent (≤30 days)</option>
            <option value="Soon">🟢 Soon (≤90 days)</option>
          </select>
          <select style={styles.filterInput} value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}>
            <option value="">All Divisions</option>
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button style={styles.filterBtn} type="submit">🔍 Filter</button>
          <button style={styles.resetBtn} type="button"
            onClick={() => { setDivisionFilter(''); setCategoryFilter(''); fetchListings(); }}>
            Reset
          </button>
        </form>

        {msg && <div style={styles.errorMsg}>{msg}</div>}
        {loading && <div style={styles.centerMsg}>Loading listings...</div>}

        {!loading && listings.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>♻️</span>
            <p style={{ color: '#888', marginTop: '12px' }}>No listings found</p>
          </div>
        )}

        <div style={styles.listingsGrid}>
          {listings.map((item) => {
            const cat = categoryConfig[item.category] || categoryConfig.Soon;
            const pct = discountPct(item.originalPrice, item.discountedPrice);
            return (
              <div key={item._id} style={{ ...styles.listingCard, borderTop: `4px solid ${cat.color}` }}>

                <div style={styles.cardHeader}>
                  <span style={{ ...styles.categoryBadge, backgroundColor: cat.bg, color: cat.color }}>
                    {item.category === 'Critical' && '🚨'}
                    {item.category === 'Urgent' && '⚠️'}
                    {item.category === 'Soon' && '🟢'}
                    {' '}{item.daysLeft} day{item.daysLeft !== 1 ? 's' : ''} left
                  </span>
                  {pct > 0 && (
                    <span style={styles.discountBadge}>-{pct}% OFF</span>
                  )}
                </div>

                <h3 style={styles.medName}>{item.medicineName}</h3>
                {item.genericName && (
                  <div style={styles.genericName}>{item.genericName}</div>
                )}

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>🏥 Facility</span>
                    <span style={styles.infoValue}>{item.facilityName}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>📍 Location</span>
                    <span style={styles.infoValue}>
                      {item.location.district}, {item.location.division}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>📦 Quantity</span>
                    <span style={styles.infoValue}>{item.quantity} units</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>📅 Expires</span>
                    <span style={{ ...styles.infoValue, color: cat.color }}>
                      {formatDate(item.expiryDate)}
                    </span>
                  </div>
                </div>

                {item.description && (
                  <div style={styles.descBox}>💬 {item.description}</div>
                )}

                <div style={styles.priceRow}>
                  {item.originalPrice > item.discountedPrice && (
                    <span style={styles.originalPrice}>৳{item.originalPrice.toLocaleString()}</span>
                  )}
                  <span style={styles.discountedPrice}>
                    ৳{item.discountedPrice.toLocaleString()}
                    <span style={styles.perUnit}>/unit</span>
                  </span>
                </div>

                <div style={styles.cardFooter}>
                  <a href={'tel:' + item.contactNumber} style={styles.callBtn}>
                    📞 Call
                  </a>
                  {item.status === 'Available' && user && (
                    <button
                      style={styles.claimBtn}
                      onClick={() => {
                        setClaimModal(item);
                        setClaimForm({ claimerType: 'Patient', contactNumber: '', unitsRequested: 1, note: '' });
                        setClaimMsg('');
                      }}
                    >
                      🙋 Claim
                    </button>
                  )}
                  {item.status === 'Claimed' && (
                    <span style={styles.claimedTag}>📋 Claimed</span>
                  )}
                  {!user && item.status === 'Available' && (
                    <button style={styles.claimBtn} onClick={() => navigate('/login')}>
                      🙋 Claim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claim Modal */}
      {claimModal && (
        <div style={styles.modalOverlay} onClick={() => setClaimModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>🙋 Claim Medicine</h3>
            <p style={styles.modalMed}>{claimModal.medicineName}</p>
            <p style={styles.modalFacility}>
              {claimModal.facilityName} ·
              ৳{claimModal.discountedPrice.toLocaleString()}/unit ·
              {claimModal.quantity} available
            </p>

            {claimMsg && (
              <div style={claimMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                {claimMsg}
              </div>
            )}

            <form onSubmit={handleClaim}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>I am a *</label>
                <select style={styles.input} value={claimForm.claimerType}
                  onChange={(e) => setClaimForm({ ...claimForm, claimerType: e.target.value })}>
                  <option value="Patient">🧑 Patient / Individual</option>
                  <option value="NGO">🏢 NGO / Organization</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Units Requested *</label>
                <input style={styles.input} type="number" min="1" max={claimModal.quantity}
                  value={claimForm.unitsRequested}
                  onChange={(e) => setClaimForm({ ...claimForm, unitsRequested: e.target.value })}
                  required />
                <small style={styles.hint}>
                  Total cost: ৳{(claimForm.unitsRequested * claimModal.discountedPrice).toLocaleString()}
                </small>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Contact Number *</label>
                <input style={styles.input} type="tel" placeholder="01XXXXXXXXX"
                  value={claimForm.contactNumber}
                  onChange={(e) => setClaimForm({ ...claimForm, contactNumber: e.target.value })}
                  required />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Note (optional)</label>
                <input style={styles.input} type="text"
                  placeholder="e.g. for cancer patient, urgent need"
                  value={claimForm.note}
                  onChange={(e) => setClaimForm({ ...claimForm, note: e.target.value })} />
              </div>
              <div style={styles.modalBtns}>
                <button type="button" style={styles.cancelBtn} onClick={() => setClaimModal(null)}>
                  Cancel
                </button>
                <button type="submit" style={styles.confirmBtn} disabled={claimLoading}>
                  {claimLoading ? 'Submitting...' : '✅ Submit Claim'}
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
  postBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  manageBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  claimsBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  backBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' },
  statCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '18px',
    textAlign: 'center', border: '1px solid #C6EBC5',
  },
  statNum: { fontSize: '28px', fontWeight: 'bold', color: '#FA7070' },
  statLabel: { fontSize: '12px', color: '#aaa', marginTop: '4px' },
  legendRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' },
  legendChip: {
    borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '600',
  },
  filterBar: {
    display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#fff',
    padding: '16px 20px', borderRadius: '12px', border: '1px solid #C6EBC5',
    marginBottom: '24px', flexWrap: 'wrap',
  },
  filterInput: {
    padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '13px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none',
  },
  filterBtn: {
    padding: '8px 20px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  resetBtn: {
    padding: '8px 14px', backgroundColor: '#f5f5f5', color: '#888',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
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
  listingsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px',
  },
  listingCard: {
    backgroundColor: '#fff', borderRadius: '14px', padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  categoryBadge: {
    borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold',
  },
  discountBadge: {
    backgroundColor: '#FA7070', color: '#fff', borderRadius: '12px',
    padding: '3px 10px', fontSize: '12px', fontWeight: 'bold',
  },
  medName: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 3px' },
  genericName: { fontSize: '12px', color: '#888', marginBottom: '12px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  infoLabel: { fontSize: '10px', color: '#aaa', fontWeight: '600' },
  infoValue: { fontSize: '12px', color: '#333', fontWeight: '500' },
  descBox: {
    backgroundColor: '#FEFDEC', borderRadius: '8px', padding: '8px 10px',
    fontSize: '12px', color: '#666', marginBottom: '10px', border: '1px solid #C6EBC5',
  },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' },
  originalPrice: {
    fontSize: '14px', color: '#aaa', textDecoration: 'line-through',
  },
  discountedPrice: { fontSize: '20px', fontWeight: 'bold', color: '#FA7070' },
  perUnit: { fontSize: '12px', color: '#aaa', fontWeight: 'normal' },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '12px', borderTop: '1px solid #f0f0f0',
  },
  callBtn: {
    padding: '7px 14px', backgroundColor: '#C6EBC5', color: '#27AE60',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none',
  },
  claimBtn: {
    padding: '7px 16px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
  claimedTag: {
    backgroundColor: '#FEF9E7', color: '#E67E22', borderRadius: '8px',
    padding: '7px 12px', fontWeight: 'bold', fontSize: '12px',
  },
  // Modal
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
  modalMed: { fontSize: '15px', fontWeight: '600', color: '#FA7070', margin: '0 0 2px' },
  modalFacility: { fontSize: '12px', color: '#888', marginBottom: '18px' },
  fieldGroup: { marginBottom: '14px' },
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

export default NearExpiryBoardPage;