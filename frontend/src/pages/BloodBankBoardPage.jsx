import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];


const allBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];


const stockKeyMap = {
  'A+': 'Apos', 'A-': 'Aneg', 'B+': 'Bpos', 'B-': 'Bneg',
  'AB+': 'ABpos', 'AB-': 'ABneg', 'O+': 'Opos', 'O-': 'Oneg',
};


const getStockColor = (units) => {
  if (units === 0) return { bg: '#f5f5f5', color: '#aaa', label: '—' };
  if (units < 5)  return { bg: '#fdecea', color: '#c0392b', label: units + ' u' };
  if (units < 10) return { bg: '#FEF9E7', color: '#E67E22', label: units + ' u' };
  return { bg: '#C6EBC5', color: '#27AE60', label: units + ' u' };
};


const BloodBankBoardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();


  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');


  // Transfer request modal
  const [transferModal, setTransferModal] = useState(null); // { bankId, bankName }
  const [transferForm, setTransferForm] = useState({ bloodType: '', unitsRequested: 1 });
  const [transferMsg, setTransferMsg] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);


  useEffect(() => {
    fetchBanks();
  }, []);


  const fetchBanks = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/bloodbanks', { params });
      setBanks(data.bloodBanks);
    } catch {
      setError('Failed to load blood banks');
    } finally {
      setLoading(false);
    }
  };


  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (divisionFilter) params.division = divisionFilter;
    if (bloodTypeFilter) params.bloodType = bloodTypeFilter;
    fetchBanks(params);
  };


  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setTransferLoading(true);
    setTransferMsg('');
    try {
      await axios.post(
        '/api/bloodbanks/' + transferModal.bankId + '/transfer-request',
        transferForm,
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setTransferMsg('✅ Transfer request sent!');
      setTimeout(() => { setTransferModal(null); setTransferMsg(''); }, 2000);
    } catch (err) {
      setTransferMsg('❌ ' + (err.response?.data?.message || 'Failed to send request'));
    } finally {
      setTransferLoading(false);
    }
  };


  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  };


  const hasCriticalStock = (stock) =>
    Object.values(stock).some((v) => v > 0 && v < 5);


  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.createBtn} onClick={() => navigate('/bloodbank/register')}>
            🏦 Register Blood Bank
          </button>
          <button style={styles.createBtn2} onClick={() => navigate('/bloodbank/dashboard')}>
            ⚙️ My Dashboard
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>


      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '36px' }}>🏦</span>
          <h1 style={styles.title}>Blood Bank Inventory</h1>
          <p style={styles.subtitle}>Real-time blood stock levels across registered blood banks</p>
        </div>


        {/* Legend */}
        <div style={styles.legend}>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#27AE60' }} /> 10+ units (Good)
          </span>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#E67E22' }} /> 5–9 units (Low)
          </span>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#c0392b' }} /> 1–4 units (Critical)
          </span>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#aaa' }} /> 0 units (Empty)
          </span>
        </div>


        <form onSubmit={handleFilter} style={styles.filterBar}>
          <select style={styles.filterInput} value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}>
            <option value="">All Divisions</option>
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select style={styles.filterInput} value={bloodTypeFilter}
            onChange={(e) => setBloodTypeFilter(e.target.value)}>
            <option value="">All Blood Types</option>
            {allBloodTypes.map((bt) => <option key={bt} value={bt}>{bt} available</option>)}
          </select>
          <button style={styles.filterBtn} type="submit">🔍 Filter</button>
          <button style={styles.resetBtn} type="button"
            onClick={() => { setDivisionFilter(''); setBloodTypeFilter(''); fetchBanks(); }}>
            Reset
          </button>
        </form>


        {loading && <div style={styles.centerMsg}>Loading blood banks...</div>}
        {error && <div style={styles.errorMsg}>{error}</div>}


        {!loading && banks.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>🏦</span>
            <p style={{ color: '#888', marginTop: '12px' }}>No blood banks found</p>
          </div>
        )}


        <div style={styles.bankList}>
          {banks.map((bank) => (
            <div key={bank._id} style={styles.bankCard}>


              <div style={styles.cardTop}>
                <div>
                  <div style={styles.bankName}>
                    {bank.name}
                    {bank.isVerified && <span style={styles.verifiedBadge}>✅ Verified</span>}
                    {!bank.isVerified && <span style={styles.pendingBadge}>⏳ Pending</span>}
                  </div>
                  <div style={styles.bankMeta}>
                    📍 {bank.location.district}, {bank.location.division}
                    {bank.address && ` · ${bank.address}`}
                  </div>
                </div>
                <div style={styles.cardTopRight}>
                  {hasCriticalStock(bank.stock) && (
                    <span style={styles.alertBadge}>🚨 Critical Stock</span>
                  )}
                  <div style={styles.lastUpdated}>
                    Updated {timeAgo(bank.stockLastUpdated)}
                  </div>
                </div>
              </div>


              {/* Stock grid */}
              <div style={styles.stockGrid}>
                {allBloodTypes.map((bt) => {
                  const key = stockKeyMap[bt];
                  const units = bank.stock[key] || 0;
                  const s = getStockColor(units);
                  return (
                    <div key={bt} style={{ ...styles.stockCell, backgroundColor: s.bg }}>
                      <div style={styles.stockType}>{bt}</div>
                      <div style={{ ...styles.stockUnits, color: s.color }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>


              <div style={styles.cardFooter}>
                <a href={'tel:' + bank.contactNumber} style={styles.callBtn}>
                  📞 {bank.contactNumber}
                </a>
                {user && (
                  <button
                    style={styles.transferBtn}
                    onClick={() => {
                      setTransferModal({ bankId: bank._id, bankName: bank.name });
                      setTransferForm({ bloodType: '', unitsRequested: 1 });
                      setTransferMsg('');
                    }}
                  >
                    🔄 Request Transfer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Transfer Request Modal */}
      {transferModal && (
        <div style={styles.modalOverlay} onClick={() => setTransferModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>🔄 Request Transfer</h3>
            <p style={styles.modalSub}>From: {transferModal.bankName}</p>


            {transferMsg && (
              <div style={transferMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                {transferMsg}
              </div>
            )}


            <form onSubmit={handleTransferSubmit}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Blood Type Needed *</label>
                <select style={styles.input} value={transferForm.bloodType}
                  onChange={(e) => setTransferForm({ ...transferForm, bloodType: e.target.value })}
                  required>
                  <option value="">Select blood type</option>
                  {allBloodTypes.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Units Requested *</label>
                <input style={styles.input} type="number" min="1" max="50"
                  value={transferForm.unitsRequested}
                  onChange={(e) => setTransferForm({ ...transferForm, unitsRequested: e.target.value })}
                  required />
              </div>
              <div style={styles.modalButtons}>
                <button type="button" style={styles.cancelBtn}
                  onClick={() => setTransferModal(null)}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn} disabled={transferLoading}>
                  {transferLoading ? 'Sending...' : '📨 Send Request'}
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
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText: { fontWeight: 'bold', color: '#fff' },
  navRight: { display: 'flex', gap: '10px', alignItems: 'center' },
  createBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  createBtn2: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  backBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  container: { maxWidth: '960px', margin: '0 auto', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '10px 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
  legend: {
    display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap',
    marginBottom: '20px', fontSize: '12px', color: '#666',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' },
  filterBar: {
    display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#fff',
    padding: '16px 20px', borderRadius: '12px', border: '1px solid #C6EBC5',
    marginBottom: '24px', flexWrap: 'wrap',
  },
  filterInput: {
    padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '13px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none',
  },
  filterBtn: {
    padding: '8px 20px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  resetBtn: {
    padding: '8px 16px', backgroundColor: '#f5f5f5', color: '#888',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
  centerMsg: { textAlign: 'center', color: '#888', padding: '40px' },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  emptyBox: {
    textAlign: 'center', padding: '60px', backgroundColor: '#fff',
    borderRadius: '16px', border: '1px solid #C6EBC5',
  },
  bankList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  bankCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5',
  },
  cardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px',
  },
  bankName: { fontSize: '17px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  verifiedBadge: {
    backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '12px',
    padding: '2px 10px', fontSize: '11px', fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#FEF9E7', color: '#E67E22', borderRadius: '12px',
    padding: '2px 10px', fontSize: '11px', fontWeight: 'bold',
  },
  bankMeta: { fontSize: '12px', color: '#888', marginTop: '4px' },
  cardTopRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  alertBadge: {
    backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '12px',
    padding: '3px 10px', fontSize: '11px', fontWeight: 'bold',
  },
  lastUpdated: { fontSize: '11px', color: '#aaa' },
  stockGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '8px', marginBottom: '16px',
  },
  stockCell: {
    borderRadius: '8px', padding: '10px 6px',
    textAlign: 'center', border: '1px solid #f0f0f0',
  },
  stockType: { fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '4px' },
  stockUnits: { fontSize: '13px', fontWeight: 'bold' },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '14px', borderTop: '1px solid #f0f0f0',
  },
  callBtn: {
    padding: '8px 16px', backgroundColor: '#C6EBC5', color: '#27AE60',
    borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none',
  },
  transferBtn: {
    padding: '8px 16px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
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
  modalSub: { fontSize: '13px', color: '#888', marginBottom: '20px' },
  modalButtons: { display: 'flex', gap: '12px', marginTop: '20px' },
  cancelBtn: {
    flex: 1, padding: '12px', backgroundColor: '#f5f5f5', color: '#888',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  saveBtn: {
    flex: 1, padding: '12px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333',
  },
};


export default BloodBankBoardPage;
