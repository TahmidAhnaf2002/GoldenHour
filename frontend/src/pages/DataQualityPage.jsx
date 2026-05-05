import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  Good:    { color: '#27AE60', bg: '#C6EBC5', icon: '✅' },
  Warning: { color: '#E67E22', bg: '#FEF9E7', icon: '⚠️' },
  Flagged: { color: '#c0392b', bg: '#fdecea', icon: '🚩' },
  Hidden:  { color: '#aaa',    bg: '#f5f5f5', icon: '👁️' },
};

const timeAgo = (date) => {
  const mins = Math.floor((new Date() - new Date(date)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const DataQualityPage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [activeTab, setActiveTab]     = useState('overview');
  const [overview, setOverview]       = useState(null);
  const [report, setReport]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [msg, setMsg]                 = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch]           = useState('');

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };
  const isAdmin    = user?.role === 'admin';

  useEffect(() => {
    if (activeTab === 'overview')  fetchOverview();
    if (activeTab === 'report')    fetchReport();
  }, [activeTab]);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/quality/overview', authHeader);
      setOverview(data);
    } catch { showMsg('❌ Failed to load overview'); }
    finally  { setLoading(false); }
  };

  const fetchReport = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const { data } = await axios.get('/api/quality/compliance-report', authHeader);
      setReport(data);
    } catch { showMsg('❌ Failed to load report'); }
    finally  { setLoading(false); }
  };

  const handleRunCheck = async () => {
    if (!isAdmin) return;
    setCheckLoading(true);
    try {
      const { data } = await axios.post('/api/quality/run-check', {}, authHeader);
      showMsg(`✅ ${data.message} — Flagged: ${data.result?.flaggedCount || 0}`);
      fetchOverview();
    } catch { showMsg('❌ Failed to run check'); }
    finally  { setCheckLoading(false); }
  };

  const exportCSV = () => {
    if (!overview?.hospitals) return;
    const rows = overview.hospitals.map((h) => ({
      name:              h.name,
      district:          h.district,
      division:          h.division,
      status:            h.status,
      reliability_score: h.reliabilityScore,
      hours_since_update:h.hoursSinceUpdate,
      update_count:      h.updateCount,
      unresolved_reports:h.unresolvedReports,
      is_verified:       h.isVerified,
    }));
    const keys = Object.keys(rows[0]);
    const csv  = [keys.join(','), ...rows.map((r) => keys.map((k) => r[k]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'data_quality_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = overview?.hospitals?.filter((h) => {
    const matchStatus = !filterStatus || h.status === filterStatus;
    const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) ||
                        h.district.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  }) || [];

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🛡️ <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          {isAdmin && (
            <button style={styles.runBtn} onClick={handleRunCheck} disabled={checkLoading}>
              {checkLoading ? 'Running...' : '▶ Run Check Now'}
            </button>
          )}
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🛡️</span>
          <h1 style={styles.title}>Data Quality Enforcement</h1>
          <p style={styles.subtitle}>
            Automated monitoring of hospital data freshness and accuracy
          </p>
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'report',   label: '📋 Compliance Report', adminOnly: true },
          ].filter((t) => !t.adminOnly || isAdmin).map((t) => (
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
            {loading && <div style={styles.centerMsg}>Loading...</div>}

            {overview && (
              <>
                {/* Stats row */}
                <div style={styles.statsGrid}>
                  {[
                    { label: 'Total Hospitals', value: overview.stats.total,   color: '#333' },
                    { label: '✅ Good',          value: overview.stats.good,    color: '#27AE60' },
                    { label: '⚠️ Warning',       value: overview.stats.warning, color: '#E67E22' },
                    { label: '🚩 Flagged',       value: overview.stats.flagged, color: '#c0392b' },
                    { label: '👁️ Hidden',        value: overview.stats.hidden,  color: '#aaa' },
                    { label: 'Avg Score',        value: overview.stats.avgScore + '%', color: '#2980b9' },
                  ].map((s) => (
                    <div key={s.label} style={styles.statCard}>
                      <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
                      <div style={styles.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Rules info box */}
                <div style={styles.rulesBox}>
                  <div style={styles.rulesTitle}>📋 Enforcement Rules</div>
                  <div style={styles.rulesGrid}>
                    {[
                      { icon: '✅', label: 'Good',    rule: 'Updated within 12 hours — full score' },
                      { icon: '⚠️', label: 'Warning', rule: 'Not updated in 12–24 hours — score -10' },
                      { icon: '🚩', label: 'Flagged', rule: 'Not updated in 24–48 hours — score -20' },
                      { icon: '👁️', label: 'Hidden',  rule: 'Not updated in 48+ hours — removed from listings, score -40' },
                    ].map((r) => (
                      <div key={r.label} style={styles.ruleRow}>
                        <span style={{ fontSize: '16px' }}>{r.icon}</span>
                        <div>
                          <div style={styles.ruleLabel}>{r.label}</div>
                          <div style={styles.ruleDesc}>{r.rule}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search & Filter */}
                <div style={styles.filterRow}>
                  <input style={styles.searchInput}
                    type="text" placeholder="Search hospital name or district..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                  <select style={styles.filterSelect} value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    {['Good', 'Warning', 'Flagged', 'Hidden'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button style={styles.csvBtn} onClick={exportCSV}>⬇️ Export CSV</button>
                </div>

                <div style={styles.resultCount}>{filtered.length} hospital(s)</div>

                {/* Hospital list */}
                {filtered.length === 0 && (
                  <div style={styles.emptyBox}>
                    <span style={{ fontSize: '40px' }}>🏥</span>
                    <p style={{ color: '#888', marginTop: '12px' }}>No hospitals found</p>
                  </div>
                )}

                {filtered.map((h) => {
                  const sc = statusConfig[h.status] || statusConfig.Good;
                  return (
                    <div key={h._id} style={{ ...styles.hospitalCard, borderLeft: `5px solid ${sc.color}` }}>
                      <div style={styles.hospitalTop}>
                        <div style={styles.hospitalLeft}>
                          <div style={styles.hospitalName}>{h.name}</div>
                          <div style={styles.hospitalMeta}>
                            📍 {h.district}, {h.division}
                            {h.isVerified && <span style={styles.verifiedBadge}>✅ Verified</span>}
                          </div>
                        </div>
                        <div style={styles.hospitalRight}>
                          <span style={{ ...styles.statusBadge, backgroundColor: sc.bg, color: sc.color }}>
                            {sc.icon} {h.status}
                          </span>
                        </div>
                      </div>

                      <div style={styles.metricsRow}>
                        <div style={styles.metricItem}>
                          <div style={styles.metricLabel}>Last Updated</div>
                          <div style={{ ...styles.metricValue, color: h.hoursSinceUpdate > 48 ? '#c0392b' : h.hoursSinceUpdate > 24 ? '#E67E22' : '#27AE60' }}>
                            {timeAgo(h.lastUpdated)}
                          </div>
                        </div>
                        <div style={styles.metricItem}>
                          <div style={styles.metricLabel}>Reliability</div>
                          <div style={{ ...styles.metricValue, color: h.reliabilityScore >= 80 ? '#27AE60' : h.reliabilityScore >= 50 ? '#E67E22' : '#c0392b' }}>
                            {h.reliabilityScore}/100
                          </div>
                        </div>
                        <div style={styles.metricItem}>
                          <div style={styles.metricLabel}>Total Updates</div>
                          <div style={styles.metricValue}>{h.updateCount}</div>
                        </div>
                        <div style={styles.metricItem}>
                          <div style={styles.metricLabel}>Unresolved Reports</div>
                          <div style={{ ...styles.metricValue, color: h.unresolvedReports > 0 ? '#c0392b' : '#27AE60' }}>
                            {h.unresolvedReports}
                          </div>
                        </div>
                      </div>

                      {/* Reliability bar */}
                      <div style={styles.reliabilityBar}>
                        <div style={{
                          ...styles.reliabilityFill,
                          width: `${h.reliabilityScore}%`,
                          backgroundColor: h.reliabilityScore >= 80 ? '#27AE60' : h.reliabilityScore >= 50 ? '#E67E22' : '#c0392b',
                        }} />
                      </div>

                      {h.status === 'Hidden' && (
                        <div style={styles.hiddenWarning}>
                          👁️ This hospital is hidden from public listings until data is updated
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── COMPLIANCE REPORT TAB ── */}
        {activeTab === 'report' && isAdmin && (
          <div>
            {loading && <div style={styles.centerMsg}>Loading report...</div>}
            {report && (
              <>
                <div style={styles.reportHeader}>
                  <div style={styles.reportGenerated}>
                    📋 Report generated: {new Date(report.generatedAt).toLocaleString('en-BD')}
                  </div>
                  <button style={styles.printBtn} onClick={() => window.print()}>
                    🖨️ Print Report
                  </button>
                </div>

                {/* Report summary */}
                <div style={styles.reportGrid}>
                  {[
                    { label: 'Total Hospitals',      value: report.totalHospitals },
                    { label: 'Verified',             value: report.verified },
                    { label: 'Flagged',              value: report.flagged,          color: '#c0392b' },
                    { label: 'High Reliability (80+)',value: report.highReliability,  color: '#27AE60' },
                    { label: 'Medium Reliability',    value: report.mediumReliability, color: '#E67E22' },
                    { label: 'Low Reliability (<50)', value: report.lowReliability,   color: '#c0392b' },
                    { label: 'Total Reports',         value: report.totalReports },
                    { label: 'Unresolved Reports',    value: report.unresolvedReports, color: '#c0392b' },
                    { label: 'Avg Reliability Score', value: report.avgReliabilityScore + '/100', color: '#2980b9' },
                  ].map((item) => (
                    <div key={item.label} style={styles.reportStatCard}>
                      <div style={{ ...styles.reportStatNum, color: item.color || '#333' }}>
                        {item.value}
                      </div>
                      <div style={styles.reportStatLabel}>{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Worst performers */}
                {report.worstPerformers?.length > 0 && (
                  <div style={styles.card}>
                    <h2 style={styles.cardTitle}>⚠️ Worst Performers (Reliability &lt; 50)</h2>
                    <p style={styles.cardSub}>
                      These hospitals need immediate attention to restore their listings
                    </p>
                    {report.worstPerformers.map((h, i) => (
                      <div key={i} style={styles.worstRow}>
                        <div style={styles.worstLeft}>
                          <div style={styles.worstName}>{h.name}</div>
                          <div style={styles.worstMeta}>
                            📍 {h.district}
                            {' · '}Last updated {timeAgo(h.lastUpdated)}
                            {' · '}{h.unresolvedReports} unresolved report(s)
                          </div>
                        </div>
                        <div style={styles.worstRight}>
                          <span style={{ ...styles.scoreBadge, color: '#c0392b', backgroundColor: '#fdecea' }}>
                            {h.reliabilityScore}/100
                          </span>
                          {h.isFlagged && (
                            <span style={styles.flaggedBadge}>🚩 Flagged</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {report.worstPerformers?.length === 0 && (
                  <div style={styles.allGoodBox}>
                    <span style={{ fontSize: '40px' }}>🎉</span>
                    <p style={{ color: '#27AE60', fontWeight: 'bold', marginTop: '12px' }}>
                      All hospitals have reliability score above 50!
                    </p>
                  </div>
                )}
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
  navbar:         { backgroundColor: '#2c3e50', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  navLogo:        { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:    { fontWeight: 'bold', color: '#fff' },
  navRight:       { display: 'flex', gap: '8px' },
  runBtn:         { backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  backBtn:        { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:      { maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' },
  header:         { textAlign: 'center', marginBottom: '20px' },
  title:          { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle:       { fontSize: '14px', color: '#888' },
  successMsg:     { backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  errorMsg:       { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  tabs:           { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab:            { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #C6EBC5', backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  tabActive:      { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #2c3e50', backgroundColor: '#2c3e50', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  statsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' },
  statCard:       { backgroundColor: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #C6EBC5' },
  statNum:        { fontSize: '26px', fontWeight: 'bold', marginBottom: '4px' },
  statLabel:      { fontSize: '11px', color: '#aaa' },
  rulesBox:       { backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #C6EBC5', marginBottom: '20px' },
  rulesTitle:     { fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '12px' },
  rulesGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' },
  ruleRow:        { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  ruleLabel:      { fontSize: '13px', fontWeight: '600', color: '#333' },
  ruleDesc:       { fontSize: '12px', color: '#888' },
  filterRow:      { display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' },
  searchInput:    { flex: 1, minWidth: '200px', padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '13px', outline: 'none', backgroundColor: '#fff' },
  filterSelect:   { padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '13px', backgroundColor: '#fff', outline: 'none' },
  csvBtn:         { padding: '9px 16px', backgroundColor: '#FEFDEC', color: '#27AE60', border: '1.5px solid #27AE60', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  resultCount:    { fontSize: '13px', color: '#888', marginBottom: '14px' },
  emptyBox:       { textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #C6EBC5' },
  hospitalCard:   { backgroundColor: '#fff', borderRadius: '14px', padding: '18px 20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' },
  hospitalTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' },
  hospitalLeft:   {},
  hospitalName:   { fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '3px' },
  hospitalMeta:   { fontSize: '12px', color: '#888', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  verifiedBadge:  { backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '8px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold' },
  hospitalRight:  {},
  statusBadge:    { borderRadius: '10px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold' },
  metricsRow:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' },
  metricItem:     { textAlign: 'center' },
  metricLabel:    { fontSize: '10px', color: '#aaa', marginBottom: '2px' },
  metricValue:    { fontSize: '14px', fontWeight: 'bold', color: '#333' },
  reliabilityBar: { height: '4px', backgroundColor: '#f0f0f0', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' },
  reliabilityFill:{ height: '100%', borderRadius: '2px', transition: 'width 0.3s' },
  hiddenWarning:  { backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#aaa', marginTop: '4px' },
  // Report tab
  reportHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' },
  reportGenerated:{ fontSize: '13px', color: '#888' },
  printBtn:       { padding: '8px 16px', backgroundColor: '#2c3e50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  reportGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' },
  reportStatCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #C6EBC5' },
  reportStatNum:  { fontSize: '22px', fontWeight: 'bold', marginBottom: '4px' },
  reportStatLabel:{ fontSize: '11px', color: '#aaa' },
  card:           { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #C6EBC5', marginBottom: '20px' },
  cardTitle:      { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub:        { fontSize: '13px', color: '#888', marginBottom: '20px' },
  worstRow:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px' },
  worstLeft:      {},
  worstName:      { fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '3px' },
  worstMeta:      { fontSize: '12px', color: '#888' },
  worstRight:     { display: 'flex', gap: '8px', alignItems: 'center' },
  scoreBadge:     { borderRadius: '10px', padding: '4px 12px', fontSize: '13px', fontWeight: 'bold' },
  flaggedBadge:   { backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '10px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold' },
  allGoodBox:     { textAlign: 'center', padding: '40px', backgroundColor: '#C6EBC5', borderRadius: '16px' },
  centerMsg:      { textAlign: 'center', padding: '40px', color: '#888' },
};

export default DataQualityPage;