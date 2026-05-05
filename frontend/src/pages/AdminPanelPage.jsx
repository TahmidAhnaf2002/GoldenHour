import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const roleColors = {
  user:       { bg: '#f5f5f5',  color: '#aaa' },
  admin:      { bg: '#fdecea',  color: '#c0392b' },
  donor:      { bg: '#fdecea',  color: '#c0392b' },
  responder:  { bg: '#e8f4fd',  color: '#2980b9' },
  hospital:   { bg: '#C6EBC5',  color: '#27AE60' },
  bloodbank:  { bg: '#f3e5f5',  color: '#8e44ad' },
  moderator:  { bg: '#FEF9E7',  color: '#E67E22' },
};

const severityConfig = {
  Critical: { color: '#c0392b', bg: '#fdecea', icon: '🔴' },
  High:     { color: '#e67e22', bg: '#FEF9E7', icon: '🟠' },
  Medium:   { color: '#E67E22', bg: '#FEF9E7', icon: '🟡' },
  Low:      { color: '#27AE60', bg: '#C6EBC5', icon: '🟢' },
  Info:     { color: '#2980b9', bg: '#e8f4fd', icon: '🔵' },
};

const timeAgo = (date) => {
  const mins = Math.floor((new Date() - new Date(date)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const AdminPanelPage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [responders, setResponders] = useState([]);
  const [alerts, setAlerts]       = useState([]);
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [roleEditId, setRoleEditId]   = useState(null);
  const [roleEditVal, setRoleEditVal] = useState('');

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };

  useEffect(() => {
    if (activeTab === 'stats')     fetchStats();
    if (activeTab === 'users')     fetchUsers();
    if (activeTab === 'verify')    { fetchHospitals(); fetchResponders(); }
    if (activeTab === 'alerts')    fetchAlerts();
    if (activeTab === 'reports')   fetchReports();
  }, [activeTab]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const fetchStats     = async () => { try { const { data } = await axios.get('/api/admin/stats', authHeader); setStats(data); } catch { showMsg('❌ Failed to load stats'); } };
  const fetchUsers     = async () => { setLoading(true); try { const { data } = await axios.get('/api/admin/users', authHeader); setUsers(data.users); } catch { showMsg('❌ Failed'); } finally { setLoading(false); } };
  const fetchHospitals = async () => { try { const { data } = await axios.get('/api/admin/verify/hospitals', authHeader); setHospitals(data.hospitals); } catch { showMsg('❌ Failed'); } };
  const fetchResponders= async () => { try { const { data } = await axios.get('/api/admin/verify/responders', authHeader); setResponders(data.responders); } catch { showMsg('❌ Failed'); } };
  const fetchAlerts    = async () => { setLoading(true); try { const { data } = await axios.get('/api/admin/alerts/pending', authHeader); setAlerts(data.alerts); } catch { showMsg('❌ Failed'); } finally { setLoading(false); } };
  const fetchReports   = async () => { setLoading(true); try { const { data } = await axios.get('/api/admin/hospitals/reports', authHeader); setReports(data.reports); } catch { showMsg('❌ Failed'); } finally { setLoading(false); } };

  const handleRoleUpdate = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: roleEditVal }, authHeader);
      showMsg('✅ Role updated');
      setRoleEditId(null);
      fetchUsers();
    } catch { showMsg('❌ Failed'); }
  };

  const handleSuspend = async (userId) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${userId}/suspend`, {}, authHeader);
      showMsg('✅ ' + data.message);
      fetchUsers();
    } catch { showMsg('❌ Failed'); }
  };

  const handleVerifyHospital = async (id, approve) => {
    try {
      await axios.put(`/api/admin/verify/hospitals/${id}`, { approve }, authHeader);
      showMsg(`✅ Hospital ${approve ? 'verified' : 'rejected'}`);
      fetchHospitals();
    } catch { showMsg('❌ Failed'); }
  };

  const handleVerifyResponder = async (id, approve) => {
    try {
      await axios.put(`/api/admin/verify/responders/${id}`, { approve }, authHeader);
      showMsg(`✅ Responder ${approve ? 'verified' : 'rejected'}`);
      fetchResponders();
    } catch { showMsg('❌ Failed'); }
  };

  const handleModerateAlert = async (id, status) => {
    try {
      await axios.put(`/api/admin/alerts/${id}/moderate`, { status }, authHeader);
      showMsg(`✅ Alert ${status.toLowerCase()}`);
      fetchAlerts();
    } catch { showMsg('❌ Failed'); }
  };

  const handleResolveReport = async (hospitalId, reportId) => {
    try {
      await axios.put(`/api/admin/hospitals/${hospitalId}/reports/${reportId}/resolve`, {}, authHeader);
      showMsg('✅ Report resolved');
      fetchReports();
    } catch { showMsg('❌ Failed'); }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole   = !userRoleFilter || u.role === userRoleFilter;
    const matchSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  // Guard — only admin can see this page
  if (!user || user.role !== 'admin') {
    return (
      <div style={styles.wrapper}>
        <nav style={styles.navbar}>
          <div style={styles.navLogo}>🛡️ <span style={styles.navLogoText}>GoldenHour Admin</span></div>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </nav>
        <div style={styles.container}>
          <div style={styles.accessDenied}>
            <span style={{ fontSize: '48px' }}>🚫</span>
            <h2 style={{ color: '#c0392b', margin: '16px 0 8px' }}>Access Denied</h2>
            <p style={{ color: '#888' }}>Admin accounts only. Contact a super admin to get access.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🛡️ <span style={styles.navLogoText}>GoldenHour Admin</span></div>
        <div style={styles.navRight}>
          <div style={styles.adminBadge}>👤 {user.name}</div>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🛡️ Admin Control Panel</h1>
          <p style={styles.subtitle}>Manage users, verifications, alerts, and platform data</p>
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'stats',   label: '📊 Overview' },
            { key: 'users',   label: '👥 Users' },
            { key: 'verify',  label: '✅ Verify Queue' },
            { key: 'alerts',  label: '🦠 Alert Moderation' },
            { key: 'reports', label: '🚩 Reports' },
          ].map((t) => (
            <button key={t.key}
              style={activeTab === t.key ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── STATS ── */}
        {activeTab === 'stats' && stats && (
          <div>
            <div style={styles.statsGrid}>
              {[
                { label: 'Total Users',        value: stats.totalUsers,             color: '#FA7070' },
                { label: 'Hospitals',          value: stats.totalHospitals,         color: '#27AE60' },
                { label: 'Verified Hospitals', value: stats.verifiedHospitals,      color: '#27AE60' },
                { label: 'Unverified',         value: stats.unverifiedHospitals,    color: '#E67E22' },
                { label: 'Responders',         value: stats.totalResponders,        color: '#2980b9' },
                { label: 'Verified Resp.',     value: stats.verifiedResponders,     color: '#2980b9' },
                { label: 'Pending Alerts',     value: stats.pendingAlerts,          color: '#c0392b' },
                { label: 'Active Alerts',      value: stats.totalAlerts,            color: '#8e44ad' },
              ].map((s) => (
                <div key={s.label} style={styles.statCard}>
                  <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>👥 Users by Role</h2>
              <div style={styles.roleBreakdown}>
                {stats.roleBreakdown?.map((r) => {
                  const rc = roleColors[r._id] || roleColors.user;
                  return (
                    <div key={r._id} style={{ ...styles.roleChip, backgroundColor: rc.bg, color: rc.color }}>
                      {r._id}: <strong>{r.count}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div>
            {/* Search & filter */}
            <div style={styles.searchRow}>
              <input style={styles.searchInput}
                type="text" placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)} />
              <select style={styles.filterSelect} value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                {Object.keys(roleColors).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <span style={styles.userCount}>{filteredUsers.length} user(s)</span>
            </div>

            {loading && <div style={styles.centerMsg}>Loading...</div>}

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const rc = roleColors[u.role] || roleColors.user;
                    return (
                      <tr key={u._id} style={{ ...styles.tr, opacity: u.isSuspended ? 0.5 : 1 }}>
                        <td style={styles.td}>
                          <div style={styles.userName}>{u.name}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.userEmail}>{u.email}</div>
                        </td>
                        <td style={styles.td}>
                          {roleEditId === u._id ? (
                            <div style={styles.roleEditRow}>
                              <select style={styles.roleSelect} value={roleEditVal}
                                onChange={(e) => setRoleEditVal(e.target.value)}>
                                {Object.keys(roleColors).map((r) => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <button style={styles.saveRoleBtn} onClick={() => handleRoleUpdate(u._id)}>✓</button>
                              <button style={styles.cancelRoleBtn} onClick={() => setRoleEditId(null)}>✕</button>
                            </div>
                          ) : (
                            <span style={{ ...styles.roleBadge, backgroundColor: rc.bg, color: rc.color }}>
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <div style={styles.dateText}>{timeAgo(u.createdAt)}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontSize: '12px', color: u.isSuspended ? '#c0392b' : '#27AE60', fontWeight: '600' }}>
                            {u.isSuspended ? '🔴 Suspended' : '🟢 Active'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionRow}>
                            <button style={styles.editRoleBtn}
                              onClick={() => { setRoleEditId(u._id); setRoleEditVal(u.role); }}>
                              ✏️ Role
                            </button>
                            <button style={{ ...styles.suspendBtn, backgroundColor: u.isSuspended ? '#C6EBC5' : '#fdecea', color: u.isSuspended ? '#27AE60' : '#c0392b' }}
                              onClick={() => handleSuspend(u._id)}>
                              {u.isSuspended ? '✅ Restore' : '🚫 Suspend'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VERIFY QUEUE ── */}
        {activeTab === 'verify' && (
          <div>
            {/* Hospitals */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🏥 Unverified Hospitals ({hospitals.length})</h2>
              {hospitals.length === 0 && (
                <div style={styles.emptyNote}>✅ No hospitals pending verification</div>
              )}
              {hospitals.map((h) => (
                <div key={h._id} style={styles.verifyRow}>
                  <div style={styles.verifyLeft}>
                    <div style={styles.verifyName}>{h.name}</div>
                    <div style={styles.verifyMeta}>
                      {h.hospitalType} · 📍 {h.location.district}, {h.location.division}
                    </div>
                    {h.verificationDocuments?.length > 0 && (
                      <div style={styles.docsList}>
                        📄 Docs: {h.verificationDocuments.map((d) => d.docName).join(', ')}
                      </div>
                    )}
                    <div style={styles.verifyMeta}>Registered {timeAgo(h.createdAt)}</div>
                  </div>
                  <div style={styles.verifyActions}>
                    <button style={styles.approveBtn} onClick={() => handleVerifyHospital(h._id, true)}>
                      ✅ Verify
                    </button>
                    <button style={styles.rejectBtn} onClick={() => handleVerifyHospital(h._id, false)}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Responders */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🚑 Unverified Responders ({responders.length})</h2>
              {responders.length === 0 && (
                <div style={styles.emptyNote}>✅ No responders pending verification</div>
              )}
              {responders.map((r) => (
                <div key={r._id} style={styles.verifyRow}>
                  <div style={styles.verifyLeft}>
                    <div style={styles.verifyName}>{r.name}</div>
                    <div style={styles.verifyMeta}>
                      {r.responderType} · 📍 {r.location.district}, {r.location.division}
                    </div>
                    {r.skills?.length > 0 && (
                      <div style={styles.verifyMeta}>Skills: {r.skills.join(', ')}</div>
                    )}
                    {r.verificationDocuments?.length > 0 && (
                      <div style={styles.docsList}>
                        📄 Docs: {r.verificationDocuments.map((d) => d.docName).join(', ')}
                      </div>
                    )}
                    <div style={styles.verifyMeta}>Registered {timeAgo(r.createdAt)}</div>
                  </div>
                  <div style={styles.verifyActions}>
                    <button style={styles.approveBtn} onClick={() => handleVerifyResponder(r._id, true)}>
                      ✅ Verify
                    </button>
                    <button style={styles.rejectBtn} onClick={() => handleVerifyResponder(r._id, false)}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ALERT MODERATION ── */}
        {activeTab === 'alerts' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🦠 Pending Alert Submissions ({alerts.length})</h2>
            <p style={styles.cardSub}>Review and approve or reject community-submitted health alerts</p>
            {loading && <div style={styles.centerMsg}>Loading...</div>}
            {!loading && alerts.length === 0 && (
              <div style={styles.emptyNote}>✅ No alerts pending moderation</div>
            )}
            {alerts.map((a) => {
              const sc = severityConfig[a.severity] || severityConfig.Medium;
              return (
                <div key={a._id} style={{ ...styles.alertRow, borderLeft: `4px solid ${sc.color}` }}>
                  <div style={styles.alertLeft}>
                    <div style={styles.alertTitle}>{a.title}</div>
                    <div style={styles.alertMeta}>
                      {a.type} · <span style={{ ...styles.severityTag, backgroundColor: sc.bg, color: sc.color }}>{sc.icon} {a.severity}</span>
                    </div>
                    <div style={styles.alertMeta}>
                      📍 {a.location.district}, {a.location.division}
                      {' · '}By {a.postedByName} · {timeAgo(a.createdAt)}
                    </div>
                    {a.disease && <div style={styles.alertMeta}>🦠 {a.disease}</div>}
                    <div style={styles.alertDesc}>{a.description}</div>
                  </div>
                  <div style={styles.verifyActions}>
                    <button style={styles.approveBtn} onClick={() => handleModerateAlert(a._id, 'Approved')}>
                      ✅ Approve
                    </button>
                    <button style={styles.rejectBtn} onClick={() => handleModerateAlert(a._id, 'Rejected')}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── REPORTS ── */}
        {activeTab === 'reports' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🚩 Hospital Data Reports ({reports.length})</h2>
            <p style={styles.cardSub}>User-submitted reports of incorrect hospital data</p>
            {loading && <div style={styles.centerMsg}>Loading...</div>}
            {!loading && reports.length === 0 && (
              <div style={styles.emptyNote}>✅ No unresolved reports</div>
            )}
            {reports.map((r) => (
              <div key={r.reportId}
                style={{ ...styles.reportRow, borderLeft: `4px solid ${r.resolved ? '#27AE60' : '#c0392b'}` }}>
                <div style={styles.reportLeft}>
                  <div style={styles.reportHospital}>🏥 {r.hospitalName}</div>
                  <div style={styles.reportMeta}>
                    📍 {r.location.district}, {r.location.division}
                  </div>
                  <div style={styles.reportIssue}>{r.issue}</div>
                  <div style={styles.reportMeta}>
                    Resource: {r.resourceType} · By {r.reporterName} · {timeAgo(r.createdAt)}
                  </div>
                </div>
                <div style={styles.verifyActions}>
                  {!r.resolved ? (
                    <button style={styles.approveBtn}
                      onClick={() => handleResolveReport(r.hospitalId, r.reportId)}>
                      ✅ Resolve
                    </button>
                  ) : (
                    <span style={styles.resolvedBadge}>✅ Resolved</span>
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
  wrapper:       { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:        { backgroundColor: '#2c3e50', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  navLogo:       { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:   { fontWeight: 'bold', color: '#fff' },
  navRight:      { display: 'flex', gap: '10px', alignItems: 'center' },
  adminBadge:    { fontSize: '12px', color: '#aaa' },
  backBtn:       { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:     { maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' },
  header:        { textAlign: 'center', marginBottom: '20px' },
  title:         { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '0 0 6px' },
  subtitle:      { fontSize: '14px', color: '#888' },
  successMsg:    { backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  errorMsg:      { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  tabs:          { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab:           { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #C6EBC5', backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  tabActive:     { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #2c3e50', backgroundColor: '#2c3e50', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' },
  statCard:      { backgroundColor: '#fff', borderRadius: '14px', padding: '20px', textAlign: 'center', border: '1px solid #C6EBC5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statNum:       { fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' },
  statLabel:     { fontSize: '12px', color: '#aaa' },
  card:          { backgroundColor: '#fff', borderRadius: '16px', padding: '24px 28px', border: '1px solid #C6EBC5', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' },
  cardTitle:     { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub:       { fontSize: '13px', color: '#888', marginBottom: '20px' },
  roleBreakdown: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' },
  roleChip:      { borderRadius: '10px', padding: '6px 14px', fontSize: '13px' },
  // Users table
  searchRow:     { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' },
  searchInput:   { flex: 1, minWidth: '200px', padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '13px', outline: 'none', backgroundColor: '#fff' },
  filterSelect:  { padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '13px', backgroundColor: '#fff', outline: 'none' },
  userCount:     { fontSize: '13px', color: '#888' },
  tableWrapper:  { overflowX: 'auto' },
  table:         { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #C6EBC5' },
  th:            { padding: '12px 14px', backgroundColor: '#f9f9f9', fontSize: '12px', fontWeight: 'bold', color: '#555', textAlign: 'left', borderBottom: '1px solid #f0f0f0' },
  tr:            { borderBottom: '1px solid #f9f9f9' },
  td:            { padding: '12px 14px', fontSize: '13px', verticalAlign: 'middle' },
  userName:      { fontWeight: '600', color: '#333' },
  userEmail:     { color: '#888', fontSize: '12px' },
  roleBadge:     { borderRadius: '10px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold' },
  roleEditRow:   { display: 'flex', gap: '4px', alignItems: 'center' },
  roleSelect:    { padding: '5px 8px', borderRadius: '6px', border: '1.5px solid #C6EBC5', fontSize: '12px', outline: 'none' },
  saveRoleBtn:   { padding: '5px 8px', backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  cancelRoleBtn: { padding: '5px 8px', backgroundColor: '#f5f5f5', color: '#888', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  dateText:      { fontSize: '12px', color: '#aaa' },
  actionRow:     { display: 'flex', gap: '6px' },
  editRoleBtn:   { padding: '5px 10px', backgroundColor: '#e8f4fd', color: '#2980b9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },
  suspendBtn:    { padding: '5px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },
  // Verify queue
  verifyRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '10px' },
  verifyLeft:    {},
  verifyName:    { fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  verifyMeta:    { fontSize: '12px', color: '#888', marginBottom: '2px' },
  docsList:      { fontSize: '12px', color: '#27AE60', marginBottom: '2px' },
  verifyActions: { display: 'flex', gap: '8px', flexShrink: 0 },
  approveBtn:    { padding: '7px 16px', backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  rejectBtn:     { padding: '7px 14px', backgroundColor: '#fdecea', color: '#c0392b', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  emptyNote:     { fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '20px' },
  // Alerts
  alertRow:      { backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' },
  alertLeft:     { flex: 1 },
  alertTitle:    { fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  alertMeta:     { fontSize: '12px', color: '#888', marginBottom: '3px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' },
  alertDesc:     { fontSize: '12px', color: '#555', marginTop: '6px', fontStyle: 'italic' },
  severityTag:   { borderRadius: '8px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' },
  // Reports
  reportRow:     { backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' },
  reportLeft:    { flex: 1 },
  reportHospital:{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '3px' },
  reportMeta:    { fontSize: '12px', color: '#888', marginBottom: '2px' },
  reportIssue:   { fontSize: '13px', color: '#c0392b', marginBottom: '3px', fontWeight: '500' },
  resolvedBadge: { fontSize: '12px', color: '#27AE60', fontWeight: 'bold' },
  accessDenied:  { textAlign: 'center', padding: '80px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #fdecea' },
  centerMsg:     { textAlign: 'center', padding: '30px', color: '#888' },
};

export default AdminPanelPage;