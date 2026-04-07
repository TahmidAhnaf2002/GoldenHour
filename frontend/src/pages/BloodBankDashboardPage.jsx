import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';


const allBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];


const stockKeyMap = {
  'A+': 'Apos', 'A-': 'Aneg', 'B+': 'Bpos', 'B-': 'Bneg',
  'AB+': 'ABpos', 'AB-': 'ABneg', 'O+': 'Opos', 'O-': 'Oneg',
};


const getStockColor = (units) => {
  if (units === 0) return { bg: '#f5f5f5', color: '#aaa' };
  if (units < 5)  return { bg: '#fdecea', color: '#c0392b' };
  if (units < 10) return { bg: '#FEF9E7', color: '#E67E22' };
  return { bg: '#C6EBC5', color: '#27AE60' };
};


const BloodBankDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();


  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock');
  const [stockEdit, setStockEdit] = useState({});
  const [stockMsg, setStockMsg] = useState('');
  const [stockLoading, setStockLoading] = useState(false);


  useEffect(() => {
    fetchMyBank();
  }, []);


  const fetchMyBank = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/bloodbanks/user/me', {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      setBank(data);
      // init stock edit form
      const init = {};
      allBloodTypes.forEach((bt) => {
        init[bt] = data.stock[stockKeyMap[bt]] || 0;
      });
      setStockEdit(init);
    } catch {
      setBank(null);
    } finally {
      setLoading(false);
    }
  };


  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setStockLoading(true);
    setStockMsg('');
    try {
      await axios.put(
        '/api/bloodbanks/stock/update',
        { stock: stockEdit },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setStockMsg('✅ Stock updated successfully!');
      fetchMyBank();
      setTimeout(() => setStockMsg(''), 3000);
    } catch (err) {
      setStockMsg('❌ ' + (err.response?.data?.message || 'Failed to update stock'));
    } finally {
      setStockLoading(false);
    }
  };


  const handleTransferRespond = async (requestId, status) => {
    try {
      await axios.put(
        '/api/bloodbanks/transfer/' + requestId + '/respond',
        { status },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      fetchMyBank();
    } catch {
      alert('Failed to update request');
    }
  };


  const pendingRequests = bank?.transferRequests?.filter((r) => r.status === 'Pending') || [];
  const criticalTypes = allBloodTypes.filter((bt) => {
    const units = bank?.stock[stockKeyMap[bt]] || 0;
    return units > 0 && units < 5;
  });


  if (loading) return <div style={styles.centerMsg}>Loading...</div>;


  if (!bank) {
    return (
      <div style={styles.wrapper}>
        <nav style={styles.navbar}>
          <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </nav>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <span style={{ fontSize: '48px' }}>🏦</span>
              <h3 style={{ color: '#333', margin: '16px 0 8px' }}>No blood bank registered</h3>
              <p style={{ color: '#888', marginBottom: '20px' }}>Register your blood bank to manage inventory</p>
              <button style={styles.saveBtn} onClick={() => navigate('/bloodbank/register')}>
                Register Blood Bank
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.viewBtn} onClick={() => navigate('/bloodbanks')}>🏦 Public Board</button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>


      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏦 {bank.name}</h1>
          <div style={styles.headerMeta}>
            <span style={bank.isVerified ? styles.verifiedBadge : styles.pendingBadge}>
              {bank.isVerified ? '✅ Verified' : '⏳ Pending Verification'}
            </span>
            <span style={styles.locationText}>
              📍 {bank.location.district}, {bank.location.division}
            </span>
          </div>
        </div>


        {/* Critical stock alert */}
        {criticalTypes.length > 0 && (
          <div style={styles.alertBox}>
            🚨 Critical stock levels: {criticalTypes.join(', ')} — update your inventory now!
          </div>
        )}


        {/* Pending transfer alert */}
        {pendingRequests.length > 0 && (
          <div style={styles.transferAlertBox}>
            🔄 You have {pendingRequests.length} pending transfer request(s)
          </div>
        )}


        <div style={styles.tabs}>
          {['stock', 'transfers'].map((tab) => (
            <button key={tab}
              style={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}>
              {tab === 'stock' && '🩸 Manage Stock'}
              {tab === 'transfers' && `🔄 Transfer Requests ${pendingRequests.length > 0 ? '(' + pendingRequests.length + ')' : ''}`}
            </button>
          ))}
        </div>


        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Update Blood Stock</h2>
            <p style={styles.cardSub}>Enter the current number of units available for each blood type</p>


            {stockMsg && (
              <div style={stockMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                {stockMsg}
              </div>
            )}


            <form onSubmit={handleStockUpdate}>
              <div style={styles.stockEditGrid}>
                {allBloodTypes.map((bt) => {
                  const units = stockEdit[bt] || 0;
                  const s = getStockColor(units);
                  return (
                    <div key={bt} style={{ ...styles.stockEditCell, backgroundColor: s.bg }}>
                      <div style={{ ...styles.stockEditType, color: s.color }}>{bt}</div>
                      <input
                        style={{ ...styles.stockEditInput, borderColor: s.color }}
                        type="number" min="0" max="9999"
                        value={stockEdit[bt] ?? 0}
                        onChange={(e) =>
                          setStockEdit({ ...stockEdit, [bt]: Number(e.target.value) })
                        }
                      />
                      <div style={{ ...styles.stockEditLabel, color: s.color }}>
                        {units === 0 ? 'Empty' : units < 5 ? 'Critical' : units < 10 ? 'Low' : 'Good'}
                      </div>
                    </div>
                  );
                })}
              </div>


              <button style={styles.saveBtn} type="submit" disabled={stockLoading}>
                {stockLoading ? 'Updating...' : '💾 Save Stock Levels'}
              </button>
            </form>
          </div>
        )}


        {/* Transfers Tab */}
        {activeTab === 'transfers' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Transfer Requests</h2>


            {bank.transferRequests.length === 0 && (
              <div style={styles.emptyNote}>No transfer requests yet</div>
            )}


            {bank.transferRequests
              .slice().reverse()
              .map((req) => (
                <div key={req._id} style={styles.transferRow}>
                  <div style={styles.transferInfo}>
                    <div style={styles.transferTitle}>
                      <span style={styles.bloodTypePill}>{req.bloodType}</span>
                      {req.unitsRequested} units from {req.fromBankName}
                    </div>
                    <div style={styles.transferMeta}>
                      {new Date(req.requestedAt).toLocaleDateString('en-BD')}
                    </div>
                  </div>
                  <div style={styles.transferActions}>
                    {req.status === 'Pending' ? (
                      <>
                        <button style={styles.acceptBtn}
                          onClick={() => handleTransferRespond(req._id, 'Accepted')}>
                          ✅ Accept
                        </button>
                        <button style={styles.declineBtn}
                          onClick={() => handleTransferRespond(req._id, 'Declined')}>
                          ❌ Decline
                        </button>
                      </>
                    ) : (
                      <span style={req.status === 'Accepted' ? styles.acceptedBadge : styles.declinedBadge}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
  viewBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  backBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  container: { maxWidth: '800px', margin: '0 auto', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '8px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 8px' },
  headerMeta: { display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' },
  verifiedBadge: {
    backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '12px',
    padding: '3px 12px', fontSize: '12px', fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#FEF9E7', color: '#E67E22', borderRadius: '12px',
    padding: '3px 12px', fontSize: '12px', fontWeight: 'bold',
  },
  locationText: { fontSize: '13px', color: '#888' },
  alertBox: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '12px 16px',
    borderRadius: '10px', fontSize: '13px', fontWeight: '500', marginBottom: '12px',
    border: '1px solid #f5c6cb',
  },
  transferAlertBox: {
    backgroundColor: '#FEF9E7', color: '#E67E22', padding: '12px 16px',
    borderRadius: '10px', fontSize: '13px', fontWeight: '500', marginBottom: '16px',
    border: '1px solid #fceab0',
  },
  tabs: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: {
    padding: '10px 24px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  tabActive: {
    padding: '10px 24px', borderRadius: '8px', border: '1.5px solid #FA7070',
    backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  card: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5', marginBottom: '20px',
  },
  cardTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub: { fontSize: '13px', color: '#888', marginBottom: '20px' },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  stockEditGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px',
  },
  stockEditCell: {
    borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #f0f0f0',
  },
  stockEditType: { fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' },
  stockEditInput: {
    width: '70px', padding: '6px', borderRadius: '6px', border: '1.5px solid',
    fontSize: '15px', textAlign: 'center', outline: 'none',
    backgroundColor: '#fff', fontWeight: 'bold',
  },
  stockEditLabel: { fontSize: '11px', fontWeight: 'bold', marginTop: '6px' },
  saveBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '12px 28px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  emptyNote: { color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '30px' },
  transferRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '10px',
  },
  transferInfo: {},
  transferTitle: {
    fontSize: '14px', fontWeight: '600', color: '#333',
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  bloodTypePill: {
    backgroundColor: '#FA7070', color: '#fff', borderRadius: '12px',
    padding: '2px 10px', fontSize: '12px', fontWeight: 'bold',
  },
  transferMeta: { fontSize: '12px', color: '#aaa', marginTop: '4px' },
  transferActions: { display: 'flex', gap: '8px', alignItems: 'center' },
  acceptBtn: {
    padding: '6px 14px', backgroundColor: '#C6EBC5', color: '#27AE60',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
  declineBtn: {
    padding: '6px 14px', backgroundColor: '#fdecea', color: '#c0392b',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
  acceptedBadge: {
    backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '12px',
    padding: '4px 12px', fontSize: '12px', fontWeight: 'bold',
  },
  declinedBadge: {
    backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '12px',
    padding: '4px 12px', fontSize: '12px', fontWeight: 'bold',
  },
  centerMsg: { textAlign: 'center', padding: '80px', color: '#888', fontFamily: 'sans-serif' },
};


export default BloodBankDashboardPage;
