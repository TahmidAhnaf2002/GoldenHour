import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  Available: { bg: '#C6EBC5', color: '#27AE60' },
  Claimed:   { bg: '#FEF9E7', color: '#E67E22' },
  'Picked Up': { bg: '#e8f4fd', color: '#2980b9' },
  Expired:   { bg: '#f5f5f5', color: '#aaa' },
  Removed:   { bg: '#f5f5f5', color: '#aaa' },
};

const claimStatusColors = {
  Pending:    { bg: '#FEF9E7', color: '#E67E22' },
  Confirmed:  { bg: '#C6EBC5', color: '#27AE60' },
  'Picked Up':{ bg: '#e8f4fd', color: '#2980b9' },
  Cancelled:  { bg: '#f5f5f5', color: '#aaa' },
};

const NearExpiryManagePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/nearexpiry/mine', {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      setListings(data.listings);
    } catch {
      setMsg('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    try {
      await axios.put('/api/nearexpiry/' + id + '/remove', {},
        { headers: { Authorization: 'Bearer ' + user.token } });
      setMsg('✅ Listing removed');
      fetchListings();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Failed to remove');
    }
  };

  const handleClaimStatus = async (listingId, claimId, status) => {
    try {
      await axios.put(
        '/api/nearexpiry/' + listingId + '/claims/' + claimId + '/status',
        { status },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      fetchListings();
    } catch {
      setMsg('❌ Failed to update claim');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-BD', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.postBtn} onClick={() => navigate('/nearexpiry/post')}>
            + Post Medicine
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/nearexpiry')}>← Back</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>♻️ My Near-Expiry Posts</h1>
          <p style={styles.subtitle}>Manage your listings and confirm pickups</p>
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        {loading && <div style={styles.centerMsg}>Loading...</div>}

        {!loading && listings.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>♻️</span>
            <p style={{ color: '#888', marginTop: '12px' }}>No listings yet</p>
            <button style={styles.postBtn2} onClick={() => navigate('/nearexpiry/post')}>
              + Post Your First Medicine
            </button>
          </div>
        )}

        {listings.map((item) => {
          const sc = statusColors[item.status] || statusColors.Available;
          const pendingClaims = item.claims?.filter((c) => c.status === 'Pending').length || 0;
          const isExpanded = expandedId === item._id;

          return (
            <div key={item._id} style={styles.listingCard}>
              <div style={styles.cardTop}>
                <div style={styles.cardLeft}>
                  <div style={styles.medName}>{item.medicineName}</div>
                  {item.genericName && <div style={styles.generic}>{item.genericName}</div>}
                  <div style={styles.metaRow}>
                    <span style={styles.metaChip}>📦 {item.quantity} units</span>
                    <span style={styles.metaChip}>📅 Expires {formatDate(item.expiryDate)}</span>
                    <span style={styles.metaChip}>
                      ⏳ {item.daysLeft > 0 ? `${item.daysLeft} days left` : 'Expired'}
                    </span>
                  </div>
                </div>
                <div style={styles.cardRight}>
                  <span style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color }}>
                    {item.status}
                  </span>
                  {pendingClaims > 0 && (
                    <span style={styles.pendingBadge}>{pendingClaims} pending</span>
                  )}
                </div>
              </div>

              <div style={styles.priceRow}>
                <span style={styles.discPrice}>৳{item.discountedPrice.toLocaleString()}/unit</span>
                {item.originalPrice > item.discountedPrice && (
                  <span style={styles.origPrice}>৳{item.originalPrice.toLocaleString()}</span>
                )}
              </div>

              <div style={styles.cardActions}>
                <button
                  style={styles.expandBtn}
                  onClick={() => setExpandedId(isExpanded ? null : item._id)}
                >
                  {isExpanded ? '▲ Hide Claims' : `▼ View Claims (${item.claims?.length || 0})`}
                </button>
                {['Available', 'Claimed'].includes(item.status) && (
                  <button style={styles.removeBtn} onClick={() => handleRemove(item._id)}>
                    🗑️ Remove
                  </button>
                )}
              </div>

              {/* Claims section */}
              {isExpanded && (
                <div style={styles.claimsSection}>
                  {(!item.claims || item.claims.length === 0) && (
                    <div style={styles.noClaimsText}>No claims yet</div>
                  )}
                  {item.claims?.map((claim) => {
                    const csc = claimStatusColors[claim.status] || claimStatusColors.Pending;
                    return (
                      <div key={claim._id} style={styles.claimRow}>
                        <div style={styles.claimInfo}>
                          <div style={styles.claimName}>
                            {claim.claimedByName}
                            <span style={styles.claimerType}> ({claim.claimerType})</span>
                          </div>
                          <div style={styles.claimMeta}>
                            📞 {claim.contactNumber} · {claim.unitsRequested} unit(s) ·
                            {new Date(claim.claimedAt).toLocaleDateString('en-BD')}
                          </div>
                          {claim.note && (
                            <div style={styles.claimNote}>💬 {claim.note}</div>
                          )}
                        </div>
                        <div style={styles.claimRight}>
                          <span style={{ ...styles.claimStatus, backgroundColor: csc.bg, color: csc.color }}>
                            {claim.status}
                          </span>
                          {claim.status === 'Pending' && (
                            <div style={styles.claimBtns}>
                              <button style={styles.confirmBtn}
                                onClick={() => handleClaimStatus(item._id, claim._id, 'Confirmed')}>
                                ✅
                              </button>
                              <button style={styles.pickedBtn}
                                onClick={() => handleClaimStatus(item._id, claim._id, 'Picked Up')}>
                                📦
                              </button>
                              <button style={styles.cancelClaimBtn}
                                onClick={() => handleClaimStatus(item._id, claim._id, 'Cancelled')}>
                                ❌
                              </button>
                            </div>
                          )}
                          {claim.status === 'Confirmed' && (
                            <button style={styles.pickedBtn2}
                              onClick={() => handleClaimStatus(item._id, claim._id, 'Picked Up')}>
                              📦 Picked Up
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
  postBtn: {
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
  postBtn2: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '12px',
  },
  listingCard: {
    backgroundColor: '#fff', borderRadius: '14px', padding: '20px 24px',
    border: '1px solid #C6EBC5', marginBottom: '14px',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' },
  cardLeft: {},
  medName: { fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '2px' },
  generic: { fontSize: '12px', color: '#888', marginBottom: '6px' },
  metaRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  metaChip: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5',
    borderRadius: '12px', padding: '2px 8px', fontSize: '11px', color: '#555',
  },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  statusBadge: {
    borderRadius: '12px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '12px',
    padding: '3px 10px', fontSize: '11px', fontWeight: 'bold',
  },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' },
  discPrice: { fontSize: '18px', fontWeight: 'bold', color: '#FA7070' },
  origPrice: { fontSize: '13px', color: '#aaa', textDecoration: 'line-through' },
  cardActions: { display: 'flex', gap: '10px' },
  expandBtn: {
    padding: '7px 16px', backgroundColor: '#FEFDEC', color: '#FA7070',
    border: '1.5px solid #FA7070', borderRadius: '8px', fontWeight: 'bold',
    cursor: 'pointer', fontSize: '12px',
  },
  removeBtn: {
    padding: '7px 14px', backgroundColor: '#fdecea', color: '#c0392b',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
  },
  claimsSection: {
    marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0',
  },
  noClaimsText: { fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '12px' },
  claimRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '12px 0', borderBottom: '1px solid #f9f9f9', flexWrap: 'wrap', gap: '8px',
  },
  claimInfo: {},
  claimName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  claimerType: { fontSize: '12px', color: '#888', fontWeight: 'normal' },
  claimMeta: { fontSize: '12px', color: '#888', marginTop: '2px' },
  claimNote: { fontSize: '11px', color: '#aaa', marginTop: '3px', fontStyle: 'italic' },
  claimRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  claimStatus: {
    borderRadius: '10px', padding: '3px 10px', fontSize: '11px', fontWeight: 'bold',
  },
  claimBtns: { display: 'flex', gap: '6px' },
  confirmBtn: {
    padding: '5px 10px', backgroundColor: '#C6EBC5', color: '#27AE60',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  pickedBtn: {
    padding: '5px 10px', backgroundColor: '#e8f4fd', color: '#2980b9',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  cancelClaimBtn: {
    padding: '5px 10px', backgroundColor: '#fdecea', color: '#c0392b',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  pickedBtn2: {
    padding: '6px 12px', backgroundColor: '#e8f4fd', color: '#2980b9',
    border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
  },
};

export default NearExpiryManagePage;