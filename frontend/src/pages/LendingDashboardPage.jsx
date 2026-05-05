import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  Pending:         { bg: '#FEF9E7', color: '#E67E22' },
  Approved:        { bg: '#C6EBC5', color: '#27AE60' },
  Active:          { bg: '#e8f4fd', color: '#2980b9' },
  ReturnRequested: { bg: '#f3e5f5', color: '#8e44ad' },
  Returned:        { bg: '#C6EBC5', color: '#27AE60' },
  Rejected:        { bg: '#fdecea', color: '#c0392b' },
  Cancelled:       { bg: '#f5f5f5', color: '#aaa' },
};

const timeAgo = (date) => {
  if (!date) return '—';
  const mins = Math.floor((new Date() - new Date(date)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const LendingDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]   = useState('mylisting');
  const [myListings, setMyListings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState('');

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };

  useEffect(() => {
    if (activeTab === 'mylisting') fetchMyListings();
    if (activeTab === 'myborrow')  fetchMyRequests();
  }, [activeTab]);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/lending/mine', authHeader);
      setMyListings(data.listings);
    } catch { setMyListings([]); }
    finally  { setLoading(false); }
  };

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/lending/requests/mine', authHeader);
      setMyRequests(data.requests);
    } catch { setMyRequests([]); }
    finally  { setLoading(false); }
  };

  const handleRequestStatus = async (listingId, requestId, status) => {
    try {
      await axios.put(
        `/api/lending/${listingId}/requests/${requestId}/status`,
        { status },
        authHeader
      );
      setMsg(`✅ Request ${status.toLowerCase()}`);
      fetchMyListings();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed'); }
  };

  const handleConfirmReturn = async (listingId, requestId, rating) => {
    try {
      await axios.put(
        `/api/lending/${listingId}/requests/${requestId}/confirm-return`,
        { rating },
        authHeader
      );
      setMsg('✅ Return confirmed!');
      fetchMyListings();
      fetchMyRequests();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed to confirm return'); }
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.boardBtn} onClick={() => navigate('/lending')}>🤝 Browse</button>
          <button style={styles.listBtn} onClick={() => navigate('/lending/list')}>+ List Equipment</button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📦 My Lending Dashboard</h1>
          <p style={styles.subtitle}>Manage your listings and borrow requests</p>
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        <div style={styles.tabs}>
          {[
            { key: 'mylisting', label: '📋 My Listings' },
            { key: 'myborrow',  label: '📦 My Borrows' },
          ].map((t) => (
            <button key={t.key}
              style={activeTab === t.key ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div style={styles.centerMsg}>Loading...</div>}

        {/* ── My Listings ── */}
        {activeTab === 'mylisting' && !loading && (
          <div>
            {myListings.length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '40px' }}>📦</span>
                <p style={{ color: '#888', marginTop: '12px' }}>No listings yet</p>
                <button style={styles.listBtn2} onClick={() => navigate('/lending/list')}>
                  List Your First Item
                </button>
              </div>
            )}
            {myListings.map((item) => (
              <div key={item._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTitle}>{item.equipmentName}</div>
                    <div style={styles.cardMeta}>{item.equipmentType} · {item.condition} · ৳{item.depositAmount} deposit</div>
                  </div>
                  <span style={{
                    ...styles.availBadge,
                    backgroundColor: item.isAvailable ? '#C6EBC5' : '#fdecea',
                    color: item.isAvailable ? '#27AE60' : '#c0392b',
                  }}>
                    {item.isAvailable ? '✅ Available' : '🔒 Lent Out'}
                  </span>
                </div>

                {/* Pending requests */}
                {item.requests?.filter((r) => r.status === 'Pending').length > 0 && (
                  <div style={styles.requestsBlock}>
                    <div style={styles.blockTitle}>
                      📬 {item.requests.filter((r) => r.status === 'Pending').length} Pending Request(s)
                    </div>
                    {item.requests.filter((r) => r.status === 'Pending').map((r) => (
                      <div key={r._id} style={styles.requestRow}>
                        <div>
                          <div style={styles.requesterName}>{r.borrowerName}</div>
                          <div style={styles.requesterMeta}>
                            📞 {r.borrowerPhone} · {r.durationDays} days
                            {r.purpose && ` · "${r.purpose}"`}
                          </div>
                        </div>
                        <div style={styles.actionBtns}>
                          <button style={styles.approveBtn}
                            onClick={() => handleRequestStatus(item._id, r._id, 'Approved')}>
                            ✅ Approve
                          </button>
                          <button style={styles.rejectBtn}
                            onClick={() => handleRequestStatus(item._id, r._id, 'Rejected')}>
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active / Return confirmation */}
                {item.requests?.filter((r) => ['Approved', 'Active'].includes(r.status)).map((r) => (
                  <div key={r._id} style={styles.activeBlock}>
                    <div style={styles.blockTitle}>🚚 Currently with: {r.borrowerName}</div>
                    <div style={styles.requesterMeta}>📞 {r.borrowerPhone} · {r.durationDays} days</div>
                    {!r.lenderConfirmed && (
                      <div style={styles.returnConfirmRow}>
                        <span style={styles.requesterMeta}>Rate borrower:</span>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} style={styles.starBtn}
                            onClick={() => handleConfirmReturn(item._id, r._id, s)}>
                            {'⭐'.repeat(s)}
                          </button>
                        ))}
                      </div>
                    )}
                    {r.lenderConfirmed && (
                      <div style={{ fontSize: '12px', color: '#27AE60' }}>
                        ✅ You confirmed return — waiting for borrower
                      </div>
                    )}
                  </div>
                ))}

                {/* Stats */}
                <div style={styles.statsRow}>
                  <span style={styles.statChip}>🔄 {item.totalLends} lend(s)</span>
                  {item.averageRating && (
                    <span style={styles.statChip}>⭐ {item.averageRating} avg rating</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── My Borrows ── */}
        {activeTab === 'myborrow' && !loading && (
          <div>
            {myRequests.length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '40px' }}>📦</span>
                <p style={{ color: '#888', marginTop: '12px' }}>No borrow requests yet</p>
                <button style={styles.listBtn2} onClick={() => navigate('/lending')}>
                  Browse Equipment
                </button>
              </div>
            )}
            {myRequests.map((req) => {
              const sc = statusColors[req.status] || statusColors.Pending;
              return (
                <div key={req.requestId} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <div style={styles.cardTitle}>{req.listing.equipmentName}</div>
                      <div style={styles.cardMeta}>
                        {req.listing.equipmentType} · from {req.listing.lenderName}
                        · {req.durationDays} days · ৳{req.listing.depositAmount} deposit
                      </div>
                      <div style={styles.cardMeta}>
                        📍 {req.listing.location.district}, {req.listing.location.division}
                      </div>
                    </div>
                    <span style={{ ...styles.availBadge, backgroundColor: sc.bg, color: sc.color }}>
                      {req.status}
                    </span>
                  </div>

                  {req.status === 'Approved' && (
                    <div style={styles.depositNote}>
                      💰 Pay deposit of ৳{req.listing.depositAmount} to lender and confirm pickup.
                      Call: {req.listing.lenderPhone}
                    </div>
                  )}

                  {/* Confirm return */}
                  {['Approved', 'Active'].includes(req.status) && !req.borrowerConfirmed && (
                    <div style={styles.returnConfirmRow}>
                      <span style={styles.requesterMeta}>Rate lender & confirm return:</span>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} style={styles.starBtn}
                          onClick={() => handleConfirmReturn(req.listing.id, req.requestId, s)}>
                          {'⭐'.repeat(s)}
                        </button>
                      ))}
                    </div>
                  )}

                  {req.borrowerConfirmed && req.status !== 'Returned' && (
                    <div style={{ fontSize: '12px', color: '#27AE60' }}>
                      ✅ You confirmed return — waiting for lender
                    </div>
                  )}

                  {req.status === 'Returned' && (
                    <div style={{ fontSize: '12px', color: '#27AE60', marginTop: '8px' }}>
                      ✅ Returned on {new Date(req.returnedAt).toLocaleDateString('en-BD')}
                    </div>
                  )}

                  <div style={styles.cardMeta}>Requested {timeAgo(req.requestedAt)}</div>
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
  wrapper:      { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:       { backgroundColor: '#FA7070', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  navLogo:      { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:  { fontWeight: 'bold', color: '#fff' },
  navRight:     { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  boardBtn:     { backgroundColor: '#fff', color: '#FA7070', border: 'none', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  listBtn:      { backgroundColor: '#fff', color: '#FA7070', border: 'none', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  backBtn:      { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:    { maxWidth: '800px', margin: '0 auto', padding: '32px 20px' },
  header:       { textAlign: 'center', marginBottom: '20px' },
  title:        { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 6px' },
  subtitle:     { fontSize: '14px', color: '#888' },
  successMsg:   { backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  errorMsg:     { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  tabs:         { display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' },
  tab:          { padding: '9px 22px', borderRadius: '8px', border: '1.5px solid #C6EBC5', backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  tabActive:    { padding: '9px 22px', borderRadius: '8px', border: '1.5px solid #FA7070', backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  emptyBox:     { textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #C6EBC5' },
  listBtn2:     { marginTop: '14px', padding: '10px 20px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  card:         { backgroundColor: '#fff', borderRadius: '14px', padding: '20px 24px', border: '1px solid #C6EBC5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '14px' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' },
  cardTitle:    { fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  cardMeta:     { fontSize: '12px', color: '#888', marginBottom: '2px' },
  availBadge:   { borderRadius: '10px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold' },
  requestsBlock:{ backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '12px', border: '1px solid #C6EBC5', marginBottom: '10px' },
  activeBlock:  { backgroundColor: '#e8f4fd', borderRadius: '10px', padding: '12px', border: '1px solid #aed6f1', marginBottom: '10px' },
  blockTitle:   { fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '8px' },
  requestRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px' },
  requesterName:{ fontSize: '13px', fontWeight: '600', color: '#333' },
  requesterMeta:{ fontSize: '12px', color: '#888', marginTop: '2px' },
  actionBtns:   { display: 'flex', gap: '8px' },
  approveBtn:   { padding: '6px 14px', backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  rejectBtn:    { padding: '6px 12px', backgroundColor: '#fdecea', color: '#c0392b', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  returnConfirmRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' },
  starBtn:      { padding: '4px 8px', backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },
  statsRow:     { display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' },
  statChip:     { backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '10px', padding: '3px 10px', fontSize: '12px', color: '#555' },
  depositNote:  { backgroundColor: '#FEF9E7', border: '1px solid #fceab0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#E67E22', margin: '10px 0' },
  centerMsg:    { textAlign: 'center', padding: '40px', color: '#888' },
};

export default LendingDashboardPage;