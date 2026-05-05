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

const severityConfig = {
  Critical:  { color: '#c0392b', bg: '#fdecea', icon: '🔴' },
  High:      { color: '#e67e22', bg: '#FEF9E7', icon: '🟠' },
  Medium:    { color: '#E67E22', bg: '#FEF9E7', icon: '🟡' },
  Low:       { color: '#27AE60', bg: '#C6EBC5', icon: '🟢' },
  Info:      { color: '#2980b9', bg: '#e8f4fd', icon: '🔵' },
};

const typeConfig = {
  'Official Alert':    { icon: '📢', color: '#c0392b' },
  'Outbreak Report':   { icon: '🦠', color: '#8e44ad' },
  'Vaccination Camp':  { icon: '💉', color: '#27AE60' },
  'Health Advisory':   { icon: '📋', color: '#2980b9' },
};

const timeAgo = (date) => {
  const mins = Math.floor((new Date() - new Date(date)) / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const HealthAlertPage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [view, setView]           = useState('alerts');
  const [alerts, setAlerts]       = useState([]);
  const [heatmap, setHeatmap]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ division: '', district: '', severity: '', type: '' });
  const [msg, setMsg]             = useState('');
  const [subMsg, setSubMsg]       = useState('');
  const [subForm, setSubForm]     = useState({ division: '', district: '' });
  const [regMsg, setRegMsg]       = useState({});
  const [regPhone, setRegPhone]   = useState({});

  // Post alert form
  const [form, setForm] = useState({
    type: 'Outbreak Report', title: '', description: '', severity: 'Medium',
    disease: '', campDate: '', campVenue: '', campCapacity: '',
    location: { division: '', district: '', area: '' },
  });
  const [postLoading, setPostLoading] = useState(false);

  const authHeader = user ? { headers: { Authorization: 'Bearer ' + user.token } } : {};

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/alerts', { params });
      setAlerts(data.alerts);
      setHeatmap(data.heatmap || {});
    } catch { setAlerts([]); }
    finally  { setLoading(false); }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.division) params.division = filters.division;
    if (filters.district) params.district = filters.district;
    if (filters.severity) params.severity = filters.severity;
    if (filters.type)     params.type     = filters.type;
    fetchAlerts(params);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title.trim())              { setMsg('❌ Enter a title'); return; }
    if (!form.description.trim())        { setMsg('❌ Enter a description'); return; }
    if (!form.location.division)         { setMsg('❌ Select division'); return; }
    if (!form.location.district)         { setMsg('❌ Select district'); return; }

    setPostLoading(true);
    setMsg('');
    try {
      await axios.post('/api/alerts/create', form, authHeader);
      setMsg('✅ Alert submitted! It will appear after admin review.');
      setForm({
        type: 'Outbreak Report', title: '', description: '', severity: 'Medium',
        disease: '', campDate: '', campVenue: '', campCapacity: '',
        location: { division: '', district: '', area: '' },
      });
      setTimeout(() => { setMsg(''); setView('alerts'); fetchAlerts(); }, 3000);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setPostLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subForm.division || !subForm.district) {
      setSubMsg('❌ Select both division and district'); return;
    }
    try {
      const { data } = await axios.post('/api/alerts/subscribe', subForm, authHeader);
      setSubMsg('✅ ' + data.message);
      setTimeout(() => setSubMsg(''), 4000);
    } catch (err) {
      setSubMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    }
  };

  const handleRegister = async (alertId) => {
    if (!user) { navigate('/login'); return; }
    const phone = regPhone[alertId] || '';
    try {
      await axios.post(`/api/alerts/${alertId}/register`, { userPhone: phone }, authHeader);
      setRegMsg({ ...regMsg, [alertId]: '✅ Registered!' });
      fetchAlerts();
      setTimeout(() => setRegMsg((p) => ({ ...p, [alertId]: '' })), 3000);
    } catch (err) {
      setRegMsg({ ...regMsg, [alertId]: '❌ ' + (err.response?.data?.message || 'Failed') });
    }
  };

  // Build heatmap rows from data
  const heatmapRows = Object.entries(heatmap)
    .map(([key, count]) => {
      const [division, district] = key.split('__');
      return { division, district, count };
    })
    .sort((a, b) => b.count - a.count);

  const maxHeat = heatmapRows.length > 0 ? heatmapRows[0].count : 1;

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🦠</span>
          <h1 style={styles.title}>Community Health Alert Tracker</h1>
          <p style={styles.subtitle}>
            Disease outbreaks, health alerts, and vaccination camps in your area
          </p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'alerts',    label: '📢 Alerts' },
            { key: 'heatmap',   label: '🗺️ Outbreak Map' },
            { key: 'camps',     label: '💉 Vaccination Camps' },
            { key: 'subscribe', label: '🔔 Subscribe' },
            { key: 'report',    label: '🦠 Report Outbreak' },
          ].map((t) => (
            <button key={t.key}
              style={view === t.key ? styles.tabActive : styles.tab}
              onClick={() => setView(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ALERTS VIEW ── */}
        {view === 'alerts' && (
          <div>
            {/* Filters */}
            <form onSubmit={handleFilter} style={styles.filterBar}>
              <select style={styles.filterInput} value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All Types</option>
                {Object.keys(typeConfig).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select style={styles.filterInput} value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}>
                <option value="">All Severities</option>
                {Object.keys(severityConfig).map((s) => <option key={s} value={s}>{s}</option>)}
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
                setFilters({ division: '', district: '', severity: '', type: '' });
                fetchAlerts();
              }}>Reset</button>
            </form>

            <div style={styles.resultCount}>
              {loading ? 'Loading...' : `${alerts.length} alert(s) found`}
            </div>

            {!loading && alerts.filter((a) => a.type !== 'Vaccination Camp').length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '40px' }}>✅</span>
                <p style={{ color: '#888', marginTop: '12px' }}>No active alerts in this area</p>
              </div>
            )}

            {alerts.filter((a) => a.type !== 'Vaccination Camp').map((alert) => {
              const sc = severityConfig[alert.severity] || severityConfig.Medium;
              const tc = typeConfig[alert.type] || typeConfig['Health Advisory'];
              return (
                <div key={alert._id} style={{ ...styles.alertCard, borderLeft: `5px solid ${sc.color}` }}>
                  <div style={styles.alertTop}>
                    <div style={styles.alertLeft}>
                      <div style={styles.alertTitleRow}>
                        <span style={styles.alertTypeIcon}>{tc.icon}</span>
                        <span style={styles.alertTitle}>{alert.title}</span>
                      </div>
                      <div style={styles.alertMeta}>
                        📍 {alert.location.area && `${alert.location.area}, `}
                        {alert.location.district}, {alert.location.division}
                        {' · '}{timeAgo(alert.createdAt)}
                        {' · '}By {alert.postedByName}
                      </div>
                      {alert.disease && (
                        <div style={styles.diseaseTag}>🦠 {alert.disease}</div>
                      )}
                    </div>
                    <div style={styles.alertRight}>
                      <span style={{ ...styles.severityBadge, backgroundColor: sc.bg, color: sc.color }}>
                        {sc.icon} {alert.severity}
                      </span>
                      <span style={{ ...styles.typeBadge, color: tc.color }}>
                        {alert.type}
                      </span>
                    </div>
                  </div>
                  <p style={styles.alertDesc}>{alert.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── HEATMAP VIEW ── */}
        {view === 'heatmap' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🗺️ Outbreak Concentration by District</h2>
            <p style={styles.cardSub}>
              Districts with more active outbreak reports are shown with higher intensity
            </p>
            {heatmapRows.length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '40px' }}>🗺️</span>
                <p style={{ color: '#888', marginTop: '12px' }}>No outbreak data yet</p>
              </div>
            )}
            <div style={styles.heatmapGrid}>
              {heatmapRows.map(({ division, district, count }, i) => {
                const intensity = count / maxHeat;
                const red = Math.round(255 * intensity);
                const bg  = `rgba(${red}, ${Math.round(50 * (1 - intensity))}, ${Math.round(50 * (1 - intensity))}, ${0.15 + intensity * 0.5})`;
                const color = intensity > 0.5 ? '#c0392b' : intensity > 0.2 ? '#E67E22' : '#555';
                return (
                  <div key={i} style={{ ...styles.heatCell, backgroundColor: bg }}>
                    <div style={{ ...styles.heatDistrict, color }}>{district}</div>
                    <div style={styles.heatDivision}>{division}</div>
                    <div style={{ ...styles.heatCount, color }}>
                      {count} report{count > 1 ? 's' : ''}
                    </div>
                    <div style={{ ...styles.heatBar, width: '100%', backgroundColor: '#f0f0f0', height: '4px', borderRadius: '2px', marginTop: '6px' }}>
                      <div style={{ width: `${Math.round(intensity * 100)}%`, height: '100%', backgroundColor: color, borderRadius: '2px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── VACCINATION CAMPS VIEW ── */}
        {view === 'camps' && (
          <div>
            <div style={styles.resultCount}>
              {loading ? 'Loading...' : `${alerts.filter((a) => a.type === 'Vaccination Camp').length} camp(s) listed`}
            </div>
            {alerts.filter((a) => a.type === 'Vaccination Camp').length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '40px' }}>💉</span>
                <p style={{ color: '#888', marginTop: '12px' }}>No vaccination camps listed</p>
              </div>
            )}
            {alerts.filter((a) => a.type === 'Vaccination Camp').map((camp) => {
              const spotsLeft = camp.campCapacity > 0
                ? camp.campCapacity - camp.registrations.length
                : null;
              const alreadyReg = user && camp.registrations.some(
                (r) => r.user?.toString() === user._id
              );
              return (
                <div key={camp._id} style={styles.campCard}>
                  <div style={styles.campTop}>
                    <div>
                      <div style={styles.campTitle}>💉 {camp.title}</div>
                      <div style={styles.campMeta}>
                        📍 {camp.location.area && `${camp.location.area}, `}
                        {camp.location.district}, {camp.location.division}
                      </div>
                      {camp.campVenue && (
                        <div style={styles.campMeta}>🏢 {camp.campVenue}</div>
                      )}
                      {camp.campDate && (
                        <div style={styles.campDate}>
                          📅 {new Date(camp.campDate).toLocaleDateString('en-BD', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                    <div style={styles.campRight}>
                      {spotsLeft !== null && (
                        <div style={{ ...styles.spotsBadge, backgroundColor: spotsLeft <= 5 ? '#fdecea' : '#C6EBC5', color: spotsLeft <= 5 ? '#c0392b' : '#27AE60' }}>
                          {spotsLeft} spots left
                        </div>
                      )}
                      <div style={styles.regCount}>
                        {camp.registrations.length} registered
                      </div>
                    </div>
                  </div>
                  <p style={styles.campDesc}>{camp.description}</p>

                  {regMsg[camp._id] && (
                    <div style={regMsg[camp._id].includes('✅') ? styles.successMsg : styles.errorMsg}>
                      {regMsg[camp._id]}
                    </div>
                  )}

                  {!alreadyReg ? (
                    <div style={styles.regRow}>
                      <input style={{ ...styles.input, maxWidth: '200px' }}
                        type="tel" placeholder="Your phone (optional)"
                        value={regPhone[camp._id] || ''}
                        onChange={(e) => setRegPhone({ ...regPhone, [camp._id]: e.target.value })} />
                      <button style={styles.regBtn}
                        onClick={() => handleRegister(camp._id)}
                        disabled={spotsLeft === 0}>
                        {spotsLeft === 0 ? 'Full' : '💉 Register'}
                      </button>
                    </div>
                  ) : (
                    <div style={styles.alreadyReg}>✅ You are registered</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── SUBSCRIBE VIEW ── */}
        {view === 'subscribe' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🔔 Subscribe to Area Alerts</h2>
            <p style={styles.cardSub}>
              Get notified about health alerts and outbreaks in your selected area
            </p>
            {!user && (
              <div style={styles.loginPrompt}>
                <p>Please <button style={styles.loginLink} onClick={() => navigate('/login')}>log in</button> to subscribe to alerts</p>
              </div>
            )}
            {user && (
              <>
                {subMsg && (
                  <div style={subMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>{subMsg}</div>
                )}
                <form onSubmit={handleSubscribe}>
                  <div style={styles.formRow}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Division *</label>
                      <select style={styles.input} value={subForm.division}
                        onChange={(e) => setSubForm({ ...subForm, division: e.target.value, district: '' })}>
                        <option value="">Select Division</option>
                        {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>District *</label>
                      <select style={styles.input} value={subForm.district}
                        disabled={!subForm.division}
                        onChange={(e) => setSubForm({ ...subForm, district: e.target.value })}>
                        <option value="">Select District</option>
                        {subForm.division && districts[subForm.division]?.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button style={styles.submitBtn} type="submit">🔔 Subscribe</button>
                </form>
              </>
            )}
          </div>
        )}

        {/* ── REPORT OUTBREAK VIEW ── */}
        {view === 'report' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🦠 Report Health Alert / Outbreak</h2>
            <p style={styles.cardSub}>
              All submissions are reviewed by admins before appearing publicly
            </p>
            {!user && (
              <div style={styles.loginPrompt}>
                <p>Please <button style={styles.loginLink} onClick={() => navigate('/login')}>log in</button> to submit a report</p>
              </div>
            )}
            {user && (
              <>
                {msg && (
                  <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
                )}
                <form onSubmit={handlePost}>
                  <div style={styles.formRow}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Alert Type *</label>
                      <select style={styles.input} value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        {Object.keys(typeConfig).map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Severity *</label>
                      <select style={styles.input} value={form.severity}
                        onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                        {Object.keys(severityConfig).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Title *</label>
                    <input style={styles.input} type="text"
                      placeholder="e.g. Dengue Fever Spreading in Mirpur"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Description *</label>
                    <textarea style={{ ...styles.input, height: '90px', resize: 'vertical' }}
                      placeholder="Describe the situation, symptoms, and any precautions..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Disease Name (optional)</label>
                    <input style={styles.input} type="text"
                      placeholder="e.g. Dengue, Cholera, COVID-19"
                      value={form.disease}
                      onChange={(e) => setForm({ ...form, disease: e.target.value })} />
                  </div>

                  {form.type === 'Vaccination Camp' && (
                    <div style={styles.campFormSection}>
                      <div style={styles.formRow}>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>Camp Date</label>
                          <input style={styles.input} type="date"
                            value={form.campDate}
                            onChange={(e) => setForm({ ...form, campDate: e.target.value })} />
                        </div>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>Capacity (0 = unlimited)</label>
                          <input style={styles.input} type="number" min="0"
                            value={form.campCapacity}
                            onChange={(e) => setForm({ ...form, campCapacity: e.target.value })} />
                        </div>
                      </div>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Venue / Address</label>
                        <input style={styles.input} type="text"
                          placeholder="e.g. Mirpur Community Center, Hall 2"
                          value={form.campVenue}
                          onChange={(e) => setForm({ ...form, campVenue: e.target.value })} />
                      </div>
                    </div>
                  )}

                  <div style={styles.formRow}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Division *</label>
                      <select style={styles.input} value={form.location.division}
                        onChange={(e) => setForm({ ...form, location: { ...form.location, division: e.target.value, district: '' } })}>
                        <option value="">Select Division</option>
                        {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>District *</label>
                      <select style={styles.input} value={form.location.district}
                        disabled={!form.location.division}
                        onChange={(e) => setForm({ ...form, location: { ...form.location, district: e.target.value } })}>
                        <option value="">Select District</option>
                        {form.location.division && districts[form.location.division]?.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Area (optional)</label>
                      <input style={styles.input} type="text" placeholder="e.g. Mirpur 10"
                        value={form.location.area}
                        onChange={(e) => setForm({ ...form, location: { ...form.location, area: e.target.value } })} />
                    </div>
                  </div>

                  <div style={styles.moderationNote}>
                    ℹ️ Your submission will be reviewed before appearing publicly
                  </div>

                  <button style={styles.submitBtn} type="submit" disabled={postLoading}>
                    {postLoading ? 'Submitting...' : '📤 Submit Report'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper:        { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:         { backgroundColor: '#FA7070', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  navLogo:        { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:    { fontWeight: 'bold', color: '#fff' },
  navRight:       { display: 'flex', gap: '8px' },
  backBtn:        { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:      { maxWidth: '900px', margin: '0 auto', padding: '32px 20px' },
  header:         { textAlign: 'center', marginBottom: '20px' },
  title:          { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle:       { fontSize: '14px', color: '#888' },
  tabs:           { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab:            { padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #C6EBC5', backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  tabActive:      { padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #FA7070', backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  filterBar:      { display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#fff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #C6EBC5', marginBottom: '16px', flexWrap: 'wrap' },
  filterInput:    { padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '12px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none' },
  filterBtn:      { padding: '8px 16px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  resetBtn:       { padding: '8px 12px', backgroundColor: '#f5f5f5', color: '#888', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  resultCount:    { fontSize: '13px', color: '#888', marginBottom: '14px' },
  emptyBox:       { textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #C6EBC5' },
  alertCard:      { backgroundColor: '#fff', borderRadius: '12px', padding: '18px 20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' },
  alertTop:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' },
  alertLeft:      {},
  alertTitleRow:  { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' },
  alertTypeIcon:  { fontSize: '18px' },
  alertTitle:     { fontSize: '16px', fontWeight: 'bold', color: '#333' },
  alertMeta:      { fontSize: '12px', color: '#888', marginBottom: '4px' },
  diseaseTag:     { display: 'inline-block', backgroundColor: '#f3e5f5', color: '#8e44ad', borderRadius: '10px', padding: '2px 10px', fontSize: '11px', fontWeight: '600' },
  alertRight:     { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  severityBadge:  { borderRadius: '10px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold' },
  typeBadge:      { fontSize: '11px', fontWeight: '600' },
  alertDesc:      { fontSize: '13px', color: '#555', lineHeight: '1.6', margin: '8px 0 0' },
  // Heatmap
  card:           { backgroundColor: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #C6EBC5', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  cardTitle:      { fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub:        { fontSize: '13px', color: '#888', marginBottom: '20px' },
  heatmapGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' },
  heatCell:       { borderRadius: '12px', padding: '14px', border: '1px solid #f0f0f0' },
  heatDistrict:   { fontSize: '14px', fontWeight: 'bold', marginBottom: '2px' },
  heatDivision:   { fontSize: '11px', color: '#aaa', marginBottom: '4px' },
  heatCount:      { fontSize: '13px', fontWeight: '600' },
  // Camps
  campCard:       { backgroundColor: '#fff', borderRadius: '14px', padding: '20px 22px', marginBottom: '14px', border: '1px solid #C6EBC5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  campTop:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' },
  campTitle:      { fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  campMeta:       { fontSize: '12px', color: '#888', marginBottom: '2px' },
  campDate:       { fontSize: '13px', color: '#27AE60', fontWeight: '600', marginTop: '4px' },
  campRight:      { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  spotsBadge:     { borderRadius: '10px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold' },
  regCount:       { fontSize: '11px', color: '#aaa' },
  campDesc:       { fontSize: '13px', color: '#555', marginBottom: '12px' },
  regRow:         { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  regBtn:         { padding: '9px 20px', backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  alreadyReg:     { fontSize: '13px', color: '#27AE60', fontWeight: '600' },
  // Subscribe & Report forms
  formRow:        { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  fieldGroup:     { flex: 1, minWidth: '180px', marginBottom: '16px' },
  label:          { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input:          { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333' },
  campFormSection:{ backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '16px', border: '1px solid #C6EBC5', marginBottom: '16px' },
  moderationNote: { backgroundColor: '#e8f4fd', border: '1px solid #aed6f1', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#2980b9', marginBottom: '16px' },
  submitBtn:      { padding: '11px 28px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  successMsg:     { backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' },
  errorMsg:       { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' },
  loginPrompt:    { textAlign: 'center', padding: '30px', color: '#888' },
  loginLink:      { backgroundColor: 'transparent', border: 'none', color: '#FA7070', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' },
};

export default HealthAlertPage;