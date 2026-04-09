import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const resourceLabels = {
  generalBeds: { label: 'General Beds', icon: '🛏️', desc: 'Standard ward beds' },
  icuBeds:     { label: 'ICU Beds',     icon: '🏥', desc: 'Intensive care unit' },
  ccuBeds:     { label: 'CCU Beds',     icon: '❤️', desc: 'Coronary care unit' },
  ventilators: { label: 'Ventilators',  icon: '💨', desc: 'Mechanical ventilators' },
  oxygenBeds:  { label: 'Oxygen Beds',  icon: '🫁', desc: 'Beds with oxygen supply' },
};

const getAvailColor = (available, total) => {
  if (total === 0) return { color: '#aaa' };
  const pct = (available / total) * 100;
  if (available === 0) return { color: '#c0392b' };
  if (pct <= 20)       return { color: '#c0392b' };
  if (pct <= 50)       return { color: '#E67E22' };
  return                      { color: '#27AE60' };
};

const HospitalDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('capacity');
  const [capacityEdit, setCapacityEdit] = useState({});
  const [capacityMsg, setCapacityMsg] = useState('');
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [infoEdit, setInfoEdit] = useState({ contactNumber: '', emergencyNumber: '', address: '' });
  const [infoMsg, setInfoMsg] = useState('');

  useEffect(() => { fetchHospital(); }, []);

  const fetchHospital = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/hospitals/user/me', {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      setHospital(data);
      // Init capacity edit form
      const init = {};
      Object.entries(data.capacity).forEach(([key, val]) => {
        init[key] = { total: val.total, available: val.available };
      });
      setCapacityEdit(init);
      setInfoEdit({
        contactNumber: data.contactNumber,
        emergencyNumber: data.emergencyNumber || '',
        address: data.address,
      });
    } catch {
      setHospital(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCapacityUpdate = async (e) => {
    e.preventDefault();
    setCapacityLoading(true);
    setCapacityMsg('');
    try {
      await axios.put(
        '/api/hospitals/capacity/update',
        { capacity: capacityEdit },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setCapacityMsg('✅ Capacity updated successfully!');
      fetchHospital();
      setTimeout(() => setCapacityMsg(''), 3000);
    } catch (err) {
      setCapacityMsg('❌ ' + (err.response?.data?.message || 'Update failed'));
    } finally {
      setCapacityLoading(false);
    }
  };

  const handleInfoUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        '/api/hospitals/info/update',
        infoEdit,
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setInfoMsg('✅ Info updated!');
      fetchHospital();
      setTimeout(() => setInfoMsg(''), 3000);
    } catch {
      setInfoMsg('❌ Update failed');
    }
  };

  const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) return <div style={styles.centerMsg}>Loading...</div>;

  if (!hospital) {
    return (
      <div style={styles.wrapper}>
        <nav style={styles.navbar}>
          <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </nav>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <span style={{ fontSize: '48px' }}>🏥</span>
              <h3 style={{ color: '#333', margin: '16px 0 8px' }}>No hospital registered</h3>
              <p style={{ color: '#888', marginBottom: '20px' }}>
                Register your hospital to start updating capacity data
              </p>
              <button style={styles.saveBtn} onClick={() => navigate('/hospitals/register')}>
                Register Hospital
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Summary stats
  const totalAvailBeds = hospital.capacity.generalBeds.available;
  const totalICU = hospital.capacity.icuBeds.available;
  const totalVent = hospital.capacity.ventilators.available;
  const criticalResources = Object.entries(hospital.capacity).filter(([, v]) => {
    if (v.total === 0) return false;
    return (v.available / v.total) <= 0.2;
  });

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.viewBtn} onClick={() => navigate('/hospitals')}>🏥 Public Board</button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏥 {hospital.name}</h1>
          <div style={styles.headerMeta}>
            <span style={styles.typeBadge}>{hospital.hospitalType}</span>
            <span style={styles.locationText}>
              📍 {hospital.location.district}, {hospital.location.division}
            </span>
            <span style={styles.updatedText}>Last updated: {timeAgo(hospital.lastUpdated)}</span>
          </div>
        </div>

        {/* Critical alerts */}
        {criticalResources.length > 0 && (
          <div style={styles.alertBox}>
            🚨 Critical capacity: {criticalResources.map(([k]) => resourceLabels[k]?.label).join(', ')}
            {' '}— please update your data
          </div>
        )}

        {/* Quick stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: totalAvailBeds === 0 ? '#c0392b' : '#27AE60' }}>
              {totalAvailBeds}
            </div>
            <div style={styles.statLabel}>🛏️ General Beds</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: totalICU === 0 ? '#c0392b' : '#27AE60' }}>
              {totalICU}
            </div>
            <div style={styles.statLabel}>🏥 ICU Available</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: totalVent === 0 ? '#c0392b' : '#27AE60' }}>
              {totalVent}
            </div>
            <div style={styles.statLabel}>💨 Ventilators</div>
          </div>
        </div>

        <div style={styles.tabs}>
          {['capacity', 'info'].map((tab) => (
            <button key={tab}
              style={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}>
              {tab === 'capacity' && '📊 Update Capacity'}
              {tab === 'info'     && '📋 Hospital Info'}
            </button>
          ))}
        </div>

        {/* ── Capacity Tab ── */}
        {activeTab === 'capacity' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Update Resource Availability</h2>
            <p style={styles.cardSub}>
              Enter current availability for each resource. Update frequently to keep data accurate.
            </p>

            {capacityMsg && (
              <div style={capacityMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                {capacityMsg}
              </div>
            )}

            <form onSubmit={handleCapacityUpdate}>
              <div style={styles.capacityGrid}>
                {Object.entries(resourceLabels).map(([key, info]) => {
                  const val = capacityEdit[key] || { total: 0, available: 0 };
                  const c = getAvailColor(Number(val.available), Number(val.total));
                  const pct = val.total > 0
                    ? Math.round((val.available / val.total) * 100)
                    : 0;
                  return (
                    <div key={key} style={styles.capacityCell}>
                      <div style={styles.capacityCellHeader}>
                        <span style={styles.capacityIcon}>{info.icon}</span>
                        <div>
                          <div style={styles.capacityLabel}>{info.label}</div>
                          <div style={styles.capacityDesc}>{info.desc}</div>
                        </div>
                      </div>

                      <div style={styles.capacityInputRow}>
                        <div style={styles.capacityInputGroup}>
                          <label style={styles.inputMiniLabel}>Total</label>
                          <input
                            style={styles.capacityInput}
                            type="number" min="0" max="9999"
                            value={val.total}
                            onChange={(e) => setCapacityEdit({
                              ...capacityEdit,
                              [key]: { ...val, total: e.target.value },
                            })}
                          />
                        </div>
                        <div style={styles.capacityDivider}>/</div>
                        <div style={styles.capacityInputGroup}>
                          <label style={styles.inputMiniLabel}>Available</label>
                          <input
                            style={{ ...styles.capacityInput, borderColor: c.color, color: c.color }}
                            type="number" min="0" max={val.total || 9999}
                            value={val.available}
                            onChange={(e) => setCapacityEdit({
                              ...capacityEdit,
                              [key]: { ...val, available: e.target.value },
                            })}
                          />
                        </div>
                      </div>

                      {Number(val.total) > 0 && (
                        <>
                          <div style={styles.capacityBar}>
                            <div style={{
                              ...styles.capacityBarFill,
                              width: `${pct}%`,
                              backgroundColor: c.color,
                            }} />
                          </div>
                          <div style={{ ...styles.capacityPct, color: c.color }}>
                            {pct}% available
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <button style={styles.saveBtn} type="submit" disabled={capacityLoading}>
                {capacityLoading ? 'Updating...' : '💾 Save Capacity Data'}
              </button>
            </form>
          </div>
        )}

        {/* ── Info Tab ── */}
        {activeTab === 'info' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Hospital Contact Information</h2>

            {infoMsg && (
              <div style={infoMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                {infoMsg}
              </div>
            )}

            <form onSubmit={handleInfoUpdate}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Contact Number *</label>
                <input style={styles.input} type="tel"
                  value={infoEdit.contactNumber}
                  onChange={(e) => setInfoEdit({ ...infoEdit, contactNumber: e.target.value })}
                  required />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Emergency Number (optional)</label>
                <input style={styles.input} type="tel"
                  placeholder="Emergency hotline"
                  value={infoEdit.emergencyNumber}
                  onChange={(e) => setInfoEdit({ ...infoEdit, emergencyNumber: e.target.value })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Address</label>
                <input style={styles.input} type="text"
                  value={infoEdit.address}
                  onChange={(e) => setInfoEdit({ ...infoEdit, address: e.target.value })} />
              </div>

              <div style={styles.infoReadOnly}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Hospital Name</span>
                  <span style={styles.infoValue}>{hospital.name}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Type</span>
                  <span style={styles.infoValue}>{hospital.hospitalType}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Location</span>
                  <span style={styles.infoValue}>
                    {hospital.location.area && `${hospital.location.area}, `}
                    {hospital.location.district}, {hospital.location.division}
                  </span>
                </div>
                {hospital.specialties?.length > 0 && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Specialties</span>
                    <span style={styles.infoValue}>{hospital.specialties.join(', ')}</span>
                  </div>
                )}
              </div>

              <button style={styles.saveBtn} type="submit">💾 Update Info</button>
            </form>
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
  header: { textAlign: 'center', marginBottom: '12px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 8px' },
  headerMeta: {
    display: 'flex', justifyContent: 'center', gap: '12px',
    alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px',
  },
  typeBadge: {
    backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '12px',
    padding: '3px 12px', fontSize: '12px', fontWeight: 'bold',
  },
  locationText: { fontSize: '13px', color: '#888' },
  updatedText: { fontSize: '12px', color: '#aaa' },
  alertBox: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '12px 16px',
    borderRadius: '10px', fontSize: '13px', fontWeight: '500', marginBottom: '16px',
    border: '1px solid #f5c6cb',
  },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' },
  statCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '18px',
    textAlign: 'center', border: '1px solid #C6EBC5',
  },
  statNum: { fontSize: '28px', fontWeight: 'bold' },
  statLabel: { fontSize: '12px', color: '#aaa', marginTop: '4px' },
  tabs: { display: 'flex', gap: '12px', marginBottom: '24px' },
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
  cardSub: { fontSize: '13px', color: '#888', marginBottom: '24px' },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  capacityGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px', marginBottom: '24px',
  },
  capacityCell: {
    backgroundColor: '#FEFDEC', borderRadius: '12px', padding: '16px',
    border: '1px solid #C6EBC5',
  },
  capacityCellHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  capacityIcon: { fontSize: '22px' },
  capacityLabel: { fontSize: '13px', fontWeight: 'bold', color: '#333' },
  capacityDesc: { fontSize: '10px', color: '#aaa' },
  capacityInputRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' },
  capacityInputGroup: { display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 },
  inputMiniLabel: { fontSize: '10px', color: '#aaa', fontWeight: '600' },
  capacityInput: {
    width: '100%', padding: '8px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '15px', textAlign: 'center', outline: 'none',
    backgroundColor: '#fff', fontWeight: 'bold', boxSizing: 'border-box',
  },
  capacityDivider: { fontSize: '18px', color: '#aaa', paddingTop: '14px' },
  capacityBar: {
    height: '6px', backgroundColor: '#f0f0f0',
    borderRadius: '3px', overflow: 'hidden', marginBottom: '4px',
  },
  capacityBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  capacityPct: { fontSize: '11px', fontWeight: 'bold', textAlign: 'right' },
  saveBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '12px 28px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333',
  },
  infoReadOnly: {
    backgroundColor: '#FEFDEC', borderRadius: '10px', padding: '16px',
    border: '1px solid #C6EBC5', marginBottom: '20px',
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', padding: '6px 0',
    borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '4px',
  },
  infoLabel: { fontSize: '12px', color: '#aaa', fontWeight: '600' },
  infoValue: { fontSize: '13px', color: '#333', fontWeight: '500' },
  centerMsg: { textAlign: 'center', padding: '80px', color: '#888', fontFamily: 'sans-serif' },
};

export default HospitalDashboardPage;