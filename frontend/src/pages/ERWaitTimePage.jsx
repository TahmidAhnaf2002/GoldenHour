import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const districts = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Tangail'],
  Chittagong: ['Chittagong', "Cox's Bazar", 'Comilla', 'Noakhali', 'Feni', 'Brahmanbaria'],
  Rajshahi: ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Natore', 'Chapainawabganj'],
  Khulna: ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Narail', 'Magura'],
  Barisal: ['Barisal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrokona'],
};

const getWaitColor = (mins) => {
  if (mins === 0)   return { color: '#27AE60', bg: '#C6EBC5', label: 'No Wait' };
  if (mins <= 30)   return { color: '#27AE60', bg: '#C6EBC5', label: 'Low' };
  if (mins <= 60)   return { color: '#E67E22', bg: '#FEF9E7', label: 'Moderate' };
  if (mins <= 120)  return { color: '#e67e22', bg: '#FEF9E7', label: 'Busy' };
  return              { color: '#c0392b', bg: '#fdecea', label: 'Very Busy' };
};

const timeAgo = (date) => {
  if (!date) return 'Never updated';
  const mins = Math.floor((new Date() - new Date(date)) / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const ERWaitTimePage = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filters, setFilters]     = useState({ division: '', district: '' });
  const [expanded, setExpanded]   = useState(null);

  useEffect(() => { fetchWaitTimes(); }, []);

  const fetchWaitTimes = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/hospitals/waittime/all', { params });
      setHospitals(data.hospitals);
    } catch {
      setError('Failed to load wait times');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.division) params.division = filters.division;
    if (filters.district) params.district = filters.district;
    fetchWaitTimes(params);
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.dashBtn} onClick={() => navigate('/hospitals/dashboard')}>
            ⚙️ Dashboard
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🚨</span>
          <h1 style={styles.title}>ER Wait Time Tracker</h1>
          <p style={styles.subtitle}>
            Compare emergency department wait times at hospitals near you
          </p>
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          {[
            { label: 'No Wait / Low (≤30m)', color: '#27AE60' },
            { label: 'Moderate (≤60m)',       color: '#E67E22' },
            { label: 'Busy (≤2h)',            color: '#e67e22' },
            { label: 'Very Busy (2h+)',       color: '#c0392b' },
          ].map((l) => (
            <span key={l.label} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>

        {/* Filters */}
        <form onSubmit={handleFilter} style={styles.filterBar}>
          <select style={styles.filterInput} value={filters.division}
            onChange={(e) => setFilters({ ...filters, division: e.target.value, district: '' })}>
            <option value="">All Divisions</option>
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select style={styles.filterInput} value={filters.district}
            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
            disabled={!filters.division}>
            <option value="">All Districts</option>
            {filters.division && districts[filters.division]?.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <button style={styles.filterBtn} type="submit">🔍 Filter</button>
          <button style={styles.resetBtn} type="button" onClick={() => {
            setFilters({ division: '', district: '' });
            fetchWaitTimes();
          }}>Reset</button>
        </form>

        <div style={styles.resultCount}>
          {loading ? 'Loading...' : `${hospitals.length} ER(s) found`}
        </div>

        {error && <div style={styles.errorMsg}>{error}</div>}

        {!loading && hospitals.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: '48px' }}>🚨</span>
            <p style={{ color: '#888', marginTop: '12px' }}>No ERs found in this area</p>
          </div>
        )}

        <div style={styles.cardList}>
          {hospitals.map((h, i) => {
            const wc = getWaitColor(h.erWaitTime?.currentWait || 0);
            const isOpen = expanded === h._id;
            const avg = h.waitTimeHistory?.length > 0
              ? Math.round(h.waitTimeHistory.reduce((s, e) => s + e.waitMinutes, 0) / h.waitTimeHistory.length)
              : null;

            return (
              <div key={h._id} style={styles.card}>
                {/* Rank badge */}
                <div style={{ ...styles.rankBadge, backgroundColor: i === 0 ? '#C6EBC5' : i === 1 ? '#FEF9E7' : '#f5f5f5', color: i === 0 ? '#27AE60' : i === 1 ? '#E67E22' : '#aaa' }}>
                  #{i + 1}
                </div>

                <div style={styles.cardTop}>
                  <div style={styles.cardLeft}>
                    <div style={styles.hospitalName}>{h.name}</div>
                    <div style={styles.hospitalMeta}>
                      📍 {h.location.district}, {h.location.division}
                    </div>
                    {h.erWaitTime?.erSpecialties?.length > 0 && (
                      <div style={styles.specialtyRow}>
                        {h.erWaitTime.erSpecialties.map((s, idx) => (
                          <span key={idx} style={styles.specialtyChip}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ ...styles.waitBadge, backgroundColor: wc.bg, color: wc.color }}>
                    <div style={styles.waitMins}>
                      {h.erWaitTime?.currentWait || 0}
                      <span style={styles.waitUnit}>min</span>
                    </div>
                    <div style={styles.waitLabel}>{wc.label}</div>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.footerLeft}>
                    <a href={'tel:' + h.contactNumber} style={styles.callBtn}>
                      📞 {h.contactNumber}
                    </a>
                    <span style={styles.updatedText}>
                      Updated {timeAgo(h.erWaitTime?.lastUpdated)}
                    </span>
                  </div>
                  <button style={styles.detailBtn} onClick={() => setExpanded(isOpen ? null : h._id)}>
                    {isOpen ? '▲ Less' : '▼ History'}
                  </button>
                </div>

                {isOpen && (
                  <div style={styles.historySection}>
                    <div style={styles.historyTitle}>📈 Wait Time History (last {h.waitTimeHistory?.length || 0} updates)</div>
                    {avg !== null && (
                      <div style={styles.avgRow}>
                        Average wait: <strong style={{ color: getWaitColor(avg).color }}>{avg} min</strong>
                      </div>
                    )}
                    {(!h.waitTimeHistory || h.waitTimeHistory.length === 0) && (
                      <div style={styles.noHistory}>No history yet</div>
                    )}
                    <div style={styles.historyBars}>
                      {h.waitTimeHistory?.slice(-12).map((entry, idx) => {
                        const maxWait = Math.max(...h.waitTimeHistory.map((e) => e.waitMinutes), 1);
                        const heightPct = Math.max((entry.waitMinutes / maxWait) * 100, 4);
                        const hc = getWaitColor(entry.waitMinutes);
                        return (
                          <div key={idx} style={styles.barWrap} title={`${entry.waitMinutes} min`}>
                            <div style={{ ...styles.bar, height: `${heightPct}%`, backgroundColor: hc.color }} />
                            <div style={styles.barLabel}>{entry.waitMinutes}m</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper:      { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:       { backgroundColor: '#FA7070', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  navLogo:      { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:  { fontWeight: 'bold', color: '#fff' },
  navRight:     { display: 'flex', gap: '8px' },
  dashBtn:      { backgroundColor: '#fff', color: '#FA7070', border: 'none', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  backBtn:      { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:    { maxWidth: '900px', margin: '0 auto', padding: '32px 20px' },
  header:       { textAlign: 'center', marginBottom: '20px' },
  title:        { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle:     { fontSize: '14px', color: '#888' },
  legend:       { display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', fontSize: '12px', color: '#666' },
  legendItem:   { display: 'flex', alignItems: 'center', gap: '6px' },
  legendDot:    { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' },
  filterBar:    { display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #C6EBC5', marginBottom: '16px', flexWrap: 'wrap' },
  filterInput:  { padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '12px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none' },
  filterBtn:    { padding: '8px 18px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  resetBtn:     { padding: '8px 14px', backgroundColor: '#f5f5f5', color: '#888', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  resultCount:  { fontSize: '13px', color: '#888', marginBottom: '16px' },
  errorMsg:     { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  emptyBox:     { textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #C6EBC5' },
  cardList:     { display: 'flex', flexDirection: 'column', gap: '16px' },
  card:         { backgroundColor: '#fff', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5', position: 'relative' },
  rankBadge:    { position: 'absolute', top: '16px', right: '16px', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 'bold' },
  cardTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' },
  cardLeft:     {},
  hospitalName: { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  hospitalMeta: { fontSize: '12px', color: '#888', marginBottom: '6px' },
  specialtyRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  specialtyChip:{ backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', color: '#555' },
  waitBadge:    { borderRadius: '14px', padding: '12px 20px', textAlign: 'center', minWidth: '80px' },
  waitMins:     { fontSize: '24px', fontWeight: 'bold', lineHeight: 1 },
  waitUnit:     { fontSize: '12px', fontWeight: 'normal', marginLeft: '2px' },
  waitLabel:    { fontSize: '11px', fontWeight: '600', marginTop: '3px' },
  cardFooter:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px' },
  footerLeft:   { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  callBtn:      { padding: '7px 14px', backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none' },
  updatedText:  { fontSize: '11px', color: '#aaa' },
  detailBtn:    { padding: '7px 14px', backgroundColor: '#FEFDEC', color: '#FA7070', border: '1.5px solid #FA7070', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' },
  historySection: { marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f0f0f0' },
  historyTitle: { fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '8px' },
  avgRow:       { fontSize: '13px', color: '#555', marginBottom: '12px' },
  noHistory:    { fontSize: '12px', color: '#aaa', textAlign: 'center', padding: '12px' },
  historyBars:  { display: 'flex', gap: '6px', alignItems: 'flex-end', height: '80px' },
  barWrap:      { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: '4px' },
  bar:          { width: '100%', borderRadius: '3px 3px 0 0', minHeight: '4px', transition: 'height 0.3s' },
  barLabel:     { fontSize: '9px', color: '#aaa' },
};

export default ERWaitTimePage;