import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#FA7070', '#27AE60', '#2980b9', '#E67E22', '#8e44ad', '#c0392b', '#16a085', '#f39c12'];

const severityColors = {
  Critical: '#c0392b', High: '#e67e22', Medium: '#E67E22',
  Low: '#27AE60', Info: '#2980b9',
};

const AnalyticsDashboardPage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const printRef  = useRef();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.get('/api/analytics', authHeader);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // ── CSV Export ──
  const exportCSV = (rows, filename) => {
    if (!rows || rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const csv  = [keys.join(','), ...rows.map((r) => keys.map((k) => r[k]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  // ── PDF Export ──
  const exportPDF = () => { window.print(); };

  if (loading) return <div style={styles.centerMsg}>Loading analytics...</div>;
  if (error)   return <div style={styles.centerMsg} dangerouslySetInnerHTML={{ __html: `❌ ${error}` }} />;
  if (!data)   return null;

  const { summary, emergencyOverTime, bloodTypeRequests, emergencyByDivision,
          capacityStats, topMedicines, sosTypeBreakdown, sosByDivision,
          donorsByBloodType, alertsBySeverity } = data;

  // Format data for charts
  const bloodTypeData   = bloodTypeRequests.map((b) => ({ name: b._id || 'Unknown', value: b.count }));
  const divisionData    = emergencyByDivision.map((d) => ({ name: d._id || 'Unknown', requests: d.count }));
  const medicineData    = topMedicines.map((m) => ({ name: m._id, count: m.count }));
  const sosTypeData     = sosTypeBreakdown.map((s) => ({ name: s._id, value: s.count }));
  const sosDivData      = sosByDivision.map((s) => ({ name: s._id, count: s.count }));
  const donorData       = donorsByBloodType.map((d) => ({ name: d._id, donors: d.count }));
  const alertSevData    = alertsBySeverity.map((a) => ({ name: a._id, count: a.count }));
  const timeData        = emergencyOverTime.map((e) => ({ date: e._id.slice(5), requests: e.count }));

  const capacityChartData = [
    { name: 'General Beds', total: capacityStats.totalGeneralBeds, available: capacityStats.availGeneralBeds },
    { name: 'ICU',          total: capacityStats.totalICU,         available: capacityStats.availICU },
    { name: 'CCU',          total: capacityStats.totalCCU,         available: capacityStats.availCCU },
    { name: 'Ventilators',  total: capacityStats.totalVentilators, available: capacityStats.availVentilators },
    { name: 'Oxygen Beds',  total: capacityStats.totalOxygenBeds,  available: capacityStats.availOxygenBeds },
  ];

  const maxHeat = sosDivData.length > 0 ? Math.max(...sosDivData.map((s) => s.count)) : 1;

  return (
    <div style={styles.wrapper} ref={printRef}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>📊 <span style={styles.navLogoText}>GoldenHour Analytics</span></div>
        <div style={styles.navRight}>
          <button style={styles.exportBtn} onClick={exportPDF}>🖨️ Print / PDF</button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📊 Emergency Analytics Dashboard</h1>
          <p style={styles.subtitle}>Platform-wide data visualization and trends</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'overview',   label: '📋 Overview' },
            { key: 'emergency',  label: '🚨 Emergency' },
            { key: 'hospitals',  label: '🏥 Hospitals' },
            { key: 'medicines',  label: '💊 Medicines' },
            { key: 'heatmap',   label: '🗺️ Heatmap' },
          ].map((t) => (
            <button key={t.key}
              style={activeTab === t.key ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Summary cards */}
            <div style={styles.summaryGrid}>
              {[
                { label: 'Total Users',       value: summary.totalUsers,       icon: '👥', color: '#FA7070' },
                { label: 'Blood Donors',       value: summary.totalDonors,      icon: '🩸', color: '#c0392b' },
                { label: 'Hospitals',          value: summary.totalHospitals,   icon: '🏥', color: '#27AE60' },
                { label: 'Emergency Requests', value: summary.totalEmergencies, icon: '🚨', color: '#E67E22' },
                { label: 'SOS Broadcasts',     value: summary.totalSOS,         icon: '🆘', color: '#8e44ad' },
                { label: 'Active Alerts',      value: summary.totalAlerts,      icon: '🦠', color: '#2980b9' },
              ].map((s) => (
                <div key={s.label} style={styles.summaryCard}>
                  <div style={styles.summaryIcon}>{s.icon}</div>
                  <div style={{ ...styles.summaryNum, color: s.color }}>{s.value}</div>
                  <div style={styles.summaryLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Donors by blood type */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h2 style={styles.chartTitle}>🩸 Registered Donors by Blood Type</h2>
                <button style={styles.csvBtn}
                  onClick={() => exportCSV(donorData.map((d) => ({ blood_type: d.name, donors: d.donors })), 'donors_by_bloodtype.csv')}>
                  ⬇️ CSV
                </button>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={donorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="donors" fill="#FA7070" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Alert severity pie */}
            {alertSevData.length > 0 && (
              <div style={styles.chartCard}>
                <h2 style={styles.chartTitle}>🦠 Health Alerts by Severity</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={alertSevData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {alertSevData.map((entry, i) => (
                        <Cell key={i} fill={severityColors[entry.name] || COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ── EMERGENCY TAB ── */}
        {activeTab === 'emergency' && (
          <div>
            {/* Emergency requests over time */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h2 style={styles.chartTitle}>📈 Emergency Requests (Last 30 Days)</h2>
                <button style={styles.csvBtn}
                  onClick={() => exportCSV(timeData.map((d) => ({ date: d.date, requests: d.requests })), 'emergency_over_time.csv')}>
                  ⬇️ CSV
                </button>
              </div>
              {timeData.length === 0 ? (
                <div style={styles.emptyNote}>No emergency data in the last 30 days</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="requests" stroke="#FA7070" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Blood type requests */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h2 style={styles.chartTitle}>🩸 Most Requested Blood Types</h2>
                <button style={styles.csvBtn}
                  onClick={() => exportCSV(bloodTypeData.map((d) => ({ blood_type: d.name, requests: d.value })), 'blood_type_requests.csv')}>
                  ⬇️ CSV
                </button>
              </div>
              {bloodTypeData.length === 0 ? (
                <div style={styles.emptyNote}>No blood request data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={bloodTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {bloodTypeData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Emergency by division */}
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h2 style={styles.chartTitle}>📍 Emergency Requests by Division</h2>
                <button style={styles.csvBtn}
                  onClick={() => exportCSV(divisionData.map((d) => ({ division: d.name, requests: d.requests })), 'emergency_by_division.csv')}>
                  ⬇️ CSV
                </button>
              </div>
              {divisionData.length === 0 ? (
                <div style={styles.emptyNote}>No division data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={divisionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={90} />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#E67E22" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* SOS type breakdown */}
            {sosTypeData.length > 0 && (
              <div style={styles.chartCard}>
                <div style={styles.chartHeader}>
                  <h2 style={styles.chartTitle}>🆘 SOS Emergency Types</h2>
                  <button style={styles.csvBtn}
                    onClick={() => exportCSV(sosTypeData.map((d) => ({ type: d.name, count: d.value })), 'sos_types.csv')}>
                    ⬇️ CSV
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={sosTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {sosTypeData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ── HOSPITALS TAB ── */}
        {activeTab === 'hospitals' && (
          <div>
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h2 style={styles.chartTitle}>🏥 Platform-Wide Hospital Capacity</h2>
                <button style={styles.csvBtn}
                  onClick={() => exportCSV(capacityChartData.map((d) => ({ resource: d.name, total: d.total, available: d.available })), 'hospital_capacity.csv')}>
                  ⬇️ CSV
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={capacityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total"     name="Total"     fill="#C6EBC5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="available" name="Available" fill="#27AE60" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Capacity utilization cards */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>📊 Capacity Utilization</h2>
              <div style={styles.utilizationGrid}>
                {capacityChartData.map((item) => {
                  const pct  = item.total > 0 ? Math.round((item.available / item.total) * 100) : 0;
                  const color = pct <= 20 ? '#c0392b' : pct <= 50 ? '#E67E22' : '#27AE60';
                  return (
                    <div key={item.name} style={styles.utilizationCard}>
                      <div style={styles.utilizationName}>{item.name}</div>
                      <div style={{ ...styles.utilizationPct, color }}>{pct}%</div>
                      <div style={styles.utilizationBar}>
                        <div style={{ ...styles.utilizationFill, width: `${pct}%`, backgroundColor: color }} />
                      </div>
                      <div style={styles.utilizationSub}>
                        {item.available} / {item.total} available
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── MEDICINES TAB ── */}
        {activeTab === 'medicines' && (
          <div>
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h2 style={styles.chartTitle}>💊 Most Listed Medicines</h2>
                <button style={styles.csvBtn}
                  onClick={() => exportCSV(medicineData.map((d) => ({ medicine: d.name, listings: d.count })), 'top_medicines.csv')}>
                  ⬇️ CSV
                </button>
              </div>
              {medicineData.length === 0 ? (
                <div style={styles.emptyNote}>No medicine data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={medicineData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Listings" fill="#8e44ad" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* ── HEATMAP TAB ── */}
        {activeTab === 'heatmap' && (
          <div>
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <h2 style={styles.chartTitle}>🗺️ SOS Emergency Frequency by Division</h2>
                <button style={styles.csvBtn}
                  onClick={() => exportCSV(sosDivData.map((d) => ({ division: d.name, sos_count: d.count })), 'sos_heatmap.csv')}>
                  ⬇️ CSV
                </button>
              </div>
              {sosDivData.length === 0 ? (
                <div style={styles.emptyNote}>No SOS data yet</div>
              ) : (
                <>
                  <div style={styles.heatmapGrid}>
                    {sosDivData.map(({ name, count }) => {
                      const intensity = count / maxHeat;
                      const r   = Math.round(192 + 63 * intensity);
                      const bg  = `rgba(${r}, ${Math.round(60 * (1 - intensity))}, ${Math.round(60 * (1 - intensity))}, ${0.15 + intensity * 0.6})`;
                      const color = intensity > 0.5 ? '#c0392b' : intensity > 0.2 ? '#E67E22' : '#555';
                      return (
                        <div key={name} style={{ ...styles.heatCell, backgroundColor: bg }}>
                          <div style={{ ...styles.heatName, color }}>{name}</div>
                          <div style={{ ...styles.heatCount, color }}>{count}</div>
                          <div style={styles.heatBarWrap}>
                            <div style={{ ...styles.heatBarFill, width: `${Math.round(intensity * 100)}%`, backgroundColor: color }} />
                          </div>
                          <div style={styles.heatLabel}>SOS broadcasts</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Also show as bar chart */}
                  <div style={{ marginTop: '24px' }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={sosDivData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="SOS Count" fill="#c0392b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>

            {/* Emergency by division heatmap */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>🚨 Blood Emergency Frequency by Division</h2>
              {divisionData.length === 0 ? (
                <div style={styles.emptyNote}>No emergency data yet</div>
              ) : (
                <div style={styles.heatmapGrid}>
                  {divisionData.map(({ name, requests }) => {
                    const maxReq    = Math.max(...divisionData.map((d) => d.requests));
                    const intensity = requests / (maxReq || 1);
                    const color     = intensity > 0.5 ? '#c0392b' : intensity > 0.2 ? '#E67E22' : '#555';
                    return (
                      <div key={name} style={{ ...styles.heatCell, backgroundColor: `rgba(250, 112, 112, ${0.1 + intensity * 0.5})` }}>
                        <div style={{ ...styles.heatName, color }}>{name}</div>
                        <div style={{ ...styles.heatCount, color }}>{requests}</div>
                        <div style={styles.heatBarWrap}>
                          <div style={{ ...styles.heatBarFill, width: `${Math.round(intensity * 100)}%`, backgroundColor: color }} />
                        </div>
                        <div style={styles.heatLabel}>blood requests</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper:          { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:           { backgroundColor: '#2c3e50', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  navLogo:          { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:      { fontWeight: 'bold', color: '#fff' },
  navRight:         { display: 'flex', gap: '8px' },
  exportBtn:        { backgroundColor: '#fff', color: '#2c3e50', border: 'none', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  backBtn:          { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:        { maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' },
  header:           { textAlign: 'center', marginBottom: '20px' },
  title:            { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '0 0 6px' },
  subtitle:         { fontSize: '14px', color: '#888' },
  tabs:             { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab:              { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #C6EBC5', backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  tabActive:        { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #2c3e50', backgroundColor: '#2c3e50', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  summaryGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' },
  summaryCard:      { backgroundColor: '#fff', borderRadius: '14px', padding: '20px', textAlign: 'center', border: '1px solid #C6EBC5', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  summaryIcon:      { fontSize: '28px', marginBottom: '8px' },
  summaryNum:       { fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' },
  summaryLabel:     { fontSize: '11px', color: '#aaa' },
  chartCard:        { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #C6EBC5', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' },
  chartHeader:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  chartTitle:       { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: 0 },
  csvBtn:           { padding: '6px 14px', backgroundColor: '#FEFDEC', color: '#27AE60', border: '1.5px solid #27AE60', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  emptyNote:        { fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '30px' },
  utilizationGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginTop: '8px' },
  utilizationCard:  { backgroundColor: '#FEFDEC', borderRadius: '12px', padding: '16px', border: '1px solid #C6EBC5', textAlign: 'center' },
  utilizationName:  { fontSize: '12px', color: '#555', fontWeight: '600', marginBottom: '6px' },
  utilizationPct:   { fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' },
  utilizationBar:   { height: '6px', backgroundColor: '#f0f0f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' },
  utilizationFill:  { height: '100%', borderRadius: '3px', transition: 'width 0.3s' },
  utilizationSub:   { fontSize: '11px', color: '#aaa' },
  heatmapGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' },
  heatCell:         { borderRadius: '12px', padding: '16px', border: '1px solid #f0f0f0' },
  heatName:         { fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' },
  heatCount:        { fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' },
  heatBarWrap:      { height: '4px', backgroundColor: '#f0f0f0', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' },
  heatBarFill:      { height: '100%', borderRadius: '2px' },
  heatLabel:        { fontSize: '10px', color: '#aaa' },
  centerMsg:        { textAlign: 'center', padding: '80px', color: '#888', fontFamily: 'sans-serif' },
};

export default AnalyticsDashboardPage;