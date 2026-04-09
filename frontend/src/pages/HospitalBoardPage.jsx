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

const resourceLabels = {
    generalBeds: { label: 'General Beds', icon: '🛏️' },
    icuBeds: { label: 'ICU', icon: '🏥' },
    ccuBeds: { label: 'CCU', icon: '❤️' },
    ventilators: { label: 'Ventilators', icon: '💨' },
    oxygenBeds: { label: 'Oxygen', icon: '🫁' },
};

const typeColors = {
    Government: { bg: '#e8f4fd', color: '#2980b9' },
    Private: { bg: '#C6EBC5', color: '#27AE60' },
    Clinic: { bg: '#FEF9E7', color: '#E67E22' },
    Specialized: { bg: '#f3e5f5', color: '#8e44ad' },
    NGO: { bg: '#fdecea', color: '#c0392b' },
};

// Availability color based on percentage
const getAvailColor = (available, total) => {
    if (total === 0) return { bg: '#f5f5f5', color: '#aaa', bar: '#ddd' };
    const pct = (available / total) * 100;
    if (available === 0) return { bg: '#fdecea', color: '#c0392b', bar: '#FA7070' };
    if (pct <= 20) return { bg: '#fdecea', color: '#c0392b', bar: '#FA7070' };
    if (pct <= 50) return { bg: '#FEF9E7', color: '#E67E22', bar: '#E67E22' };
    return { bg: '#C6EBC5', color: '#27AE60', bar: '#27AE60' };
};

const timeAgo = (date) => {
    const mins = Math.floor((new Date() - new Date(date)) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const HospitalBoardPage = () => {
    const navigate = useNavigate();

    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
    const [filters, setFilters] = useState({
        division: '', district: '', hospitalType: '', resource: '',
    });

    useEffect(() => { fetchHospitals(); }, []);

    const fetchHospitals = async (params = {}) => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/hospitals', { params });
            setHospitals(data.hospitals);
        } catch {
            setError('Failed to load hospitals');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        const params = {};
        if (filters.division) params.division = filters.division;
        if (filters.district) params.district = filters.district;
        if (filters.hospitalType) params.hospitalType = filters.hospitalType;
        if (filters.resource) params.resource = filters.resource;
        fetchHospitals(params);
    };

    // Group hospitals by division for map view
    const byDivision = divisions.reduce((acc, div) => {
        acc[div] = hospitals.filter((h) => h.location.division === div);
        return acc;
    }, {});

    const totalAvailable = (h) =>
        Object.values(h.capacity).reduce((sum, r) => sum + (r.available || 0), 0);

    return (
        <div style={styles.wrapper}>
            <nav style={styles.navbar}>
                <div style={styles.navLogo}>
                    🏥 <span style={styles.navLogoText}>GoldenHour</span>
                </div>
                <div style={styles.navRight}>
                    <button style={styles.registerBtn} onClick={() => navigate('/hospitals/register')}>
                        🏥 Register Hospital
                    </button>
                    <button style={styles.dashBtn} onClick={() => navigate('/hospitals/dashboard')}>
                        ⚙️ Dashboard
                    </button>
                    <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
                </div>
            </nav>

            <div style={styles.container}>
                <div style={styles.header}>
                    <span style={{ fontSize: '40px' }}>🏥</span>
                    <h1 style={styles.title}>Hospital Resource Tracker</h1>
                    <p style={styles.subtitle}>
                        Real-time bed and resource availability across registered hospitals
                    </p>
                </div>

                {/* Legend */}
                <div style={styles.legend}>
                    <span style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, backgroundColor: '#27AE60' }} /> Good (&gt;50%)
                    </span>
                    <span style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, backgroundColor: '#E67E22' }} /> Low (≤50%)
                    </span>
                    <span style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, backgroundColor: '#c0392b' }} /> Critical (≤20%)
                    </span>
                    <span style={styles.legendItem}>
                        <span style={{ ...styles.legendDot, backgroundColor: '#aaa' }} /> Not Available
                    </span>
                </div>

                {/* Filters */}
                <form onSubmit={handleFilter} style={styles.filterBar}>
                    <select style={styles.filterInput} value={filters.hospitalType}
                        onChange={(e) => setFilters({ ...filters, hospitalType: e.target.value })}>
                        <option value="">All Types</option>
                        <option value="Government">Government</option>
                        <option value="Private">Private</option>
                        <option value="Clinic">Clinic</option>
                        <option value="Specialized">Specialized</option>
                        <option value="NGO">NGO</option>
                    </select>

                    <select style={styles.filterInput} value={filters.resource}
                        onChange={(e) => setFilters({ ...filters, resource: e.target.value })}>
                        <option value="">All Resources</option>
                        <option value="generalBeds">🛏️ General Beds</option>
                        <option value="icuBeds">🏥 ICU Available</option>
                        <option value="ccuBeds">❤️ CCU Available</option>
                        <option value="ventilators">💨 Ventilators</option>
                        <option value="oxygenBeds">🫁 Oxygen Beds</option>
                    </select>

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
                        setFilters({ division: '', district: '', hospitalType: '', resource: '' });
                        fetchHospitals();
                    }}>Reset</button>
                </form>

                {/* View toggle + count */}
                <div style={styles.viewToggleRow}>
                    <span style={styles.resultCount}>
                        {loading ? 'Loading...' : `${hospitals.length} hospital(s) found`}
                    </span>
                    <div style={styles.viewToggle}>
                        <button
                            style={viewMode === 'list' ? styles.viewBtnActive : styles.viewBtn}
                            onClick={() => setViewMode('list')}
                        >
                            ☰ List
                        </button>
                        <button
                            style={viewMode === 'map' ? styles.viewBtnActive : styles.viewBtn}
                            onClick={() => setViewMode('map')}
                        >
                            🗺️ By Division
                        </button>
                    </div>
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}

                {!loading && hospitals.length === 0 && (
                    <div style={styles.emptyBox}>
                        <span style={{ fontSize: '48px' }}>🏥</span>
                        <p style={{ color: '#888', marginTop: '12px' }}>No hospitals found</p>
                    </div>
                )}

                {/* ── List View ── */}
                {viewMode === 'list' && (
                    <div style={styles.hospitalList}>
                        {hospitals.map((h) => (
                            <HospitalCard key={h._id} hospital={h} navigate={navigate} />
                        ))}
                    </div>
                )}

                {/* ── Division View ── */}
                {viewMode === 'map' && (
                    <div style={styles.divisionGrid}>
                        {divisions.map((div) => {
                            const divHospitals = byDivision[div];
                            if (divHospitals.length === 0) return null;
                            return (
                                <div key={div} style={styles.divisionCard}>
                                    <div style={styles.divisionHeader}>
                                        <span style={styles.divisionName}>{div}</span>
                                        <span style={styles.divisionCount}>{divHospitals.length} hospital(s)</span>
                                    </div>
                                    {divHospitals.map((h) => (
                                        <div key={h._id} style={styles.divisionHospitalRow}>
                                            <div style={styles.divisionHospitalInfo}>
                                                <div style={styles.divisionHospitalName}>{h.name}</div>
                                                <div style={styles.divisionHospitalType}>{h.hospitalType}</div>
                                            </div>
                                            <div style={styles.divisionResourceDots}>
                                                {Object.entries(h.capacity).map(([key, val]) => {
                                                    const c = getAvailColor(val.available, val.total);
                                                    return (
                                                        <div
                                                            key={key}
                                                            title={`${resourceLabels[key]?.label}: ${val.available}/${val.total}`}
                                                            style={{ ...styles.resourceDot, backgroundColor: c.bar }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <a href={'tel:' + h.contactNumber} style={styles.miniCallBtn}>📞</a>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Hospital Card Component ────────────────────────────────────────────────
const HospitalCard = ({ hospital: h, navigate }) => {
    const [expanded, setExpanded] = useState(false);
    const tc = typeColors[h.hospitalType] || typeColors.Private;

    return (
        <div style={cardStyles.card}>
            <div style={cardStyles.cardTop}>
                <div style={cardStyles.cardLeft}>
                    <div style={cardStyles.hospitalName}>{h.name}</div>
                    <div style={cardStyles.hospitalMeta}>
                        📍 {h.location.area && `${h.location.area}, `}
                        {h.location.district}, {h.location.division}
                    </div>
                    {h.address && (
                        <div style={cardStyles.hospitalAddress}>🏢 {h.address}</div>
                    )}
                </div>
                <div style={cardStyles.cardRight}>
                    <span style={{ ...cardStyles.typeBadge, backgroundColor: tc.bg, color: tc.color }}>
                        {h.hospitalType}
                    </span>
                    <div style={cardStyles.lastUpdated}>
                        Updated {timeAgo(h.lastUpdated)}
                    </div>
                </div>
            </div>

            {/* Resource grid */}
            <div style={cardStyles.resourceGrid}>
                {Object.entries(h.capacity).map(([key, val]) => {
                    const c = getAvailColor(val.available, val.total);
                    const pct = val.total > 0 ? Math.round((val.available / val.total) * 100) : 0;
                    const info = resourceLabels[key];
                    return (
                        <div key={key} style={{ ...cardStyles.resourceCell, backgroundColor: c.bg }}>
                            <div style={cardStyles.resourceIcon}>{info?.icon}</div>
                            <div style={cardStyles.resourceLabel}>{info?.label}</div>
                            <div style={{ ...cardStyles.resourceValue, color: c.color }}>
                                {val.total === 0 ? '—' : `${val.available}/${val.total}`}
                            </div>
                            {val.total > 0 && (
                                <div style={cardStyles.miniBar}>
                                    <div style={{
                                        ...cardStyles.miniBarFill,
                                        width: `${pct}%`,
                                        backgroundColor: c.bar,
                                    }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Specialties */}
            {h.specialties?.length > 0 && (
                <div style={cardStyles.specialtiesRow}>
                    {h.specialties.map((s, i) => (
                        <span key={i} style={cardStyles.specialtyChip}>{s}</span>
                    ))}
                </div>
            )}

            <div style={cardStyles.cardFooter}>
                <div style={cardStyles.footerLeft}>
                    <a href={'tel:' + h.contactNumber} style={cardStyles.callBtn}>
                        📞 {h.contactNumber}
                    </a>
                    {h.emergencyNumber && (
                        <a href={'tel:' + h.emergencyNumber} style={cardStyles.emergencyBtn}>
                            🚨 Emergency: {h.emergencyNumber}
                        </a>
                    )}
                </div>
                <button
                    style={cardStyles.detailBtn}
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? '▲ Less' : '▼ Details'}
                </button>
            </div>

            {expanded && (
                <div style={cardStyles.expandedSection}>
                    <div style={cardStyles.expandedGrid}>
                        {Object.entries(h.capacity).map(([key, val]) => {
                            const c = getAvailColor(val.available, val.total);
                            const pct = val.total > 0 ? Math.round((val.available / val.total) * 100) : 0;
                            const info = resourceLabels[key];
                            return (
                                <div key={key} style={cardStyles.expandedRow}>
                                    <span style={cardStyles.expandedLabel}>
                                        {info?.icon} {info?.label}
                                    </span>
                                    <div style={cardStyles.expandedRight}>
                                        <div style={cardStyles.expandedBar}>
                                            <div style={{
                                                ...cardStyles.expandedBarFill,
                                                width: val.total > 0 ? `${pct}%` : '0%',
                                                backgroundColor: c.bar,
                                            }} />
                                        </div>
                                        <span style={{ ...cardStyles.expandedVal, color: c.color }}>
                                            {val.total === 0 ? 'N/A' : `${val.available} of ${val.total} available`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
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
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
    },
    navLogo: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
    navLogoText: { fontWeight: 'bold', color: '#fff' },
    navRight: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
    registerBtn: {
        backgroundColor: '#fff', color: '#FA7070', border: 'none',
        borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
    },
    dashBtn: {
        backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
        borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
    },
    backBtn: {
        backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
        borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
    },
    container: { maxWidth: '1000px', margin: '0 auto', padding: '32px 20px' },
    header: { textAlign: 'center', marginBottom: '20px' },
    title: { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
    subtitle: { fontSize: '14px', color: '#888' },
    legend: {
        display: 'flex', gap: '20px', justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: '20px', fontSize: '12px', color: '#666',
    },
    legendItem: { display: 'flex', alignItems: 'center', gap: '6px' },
    legendDot: { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' },
    filterBar: {
        display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#fff',
        padding: '16px 20px', borderRadius: '12px', border: '1px solid #C6EBC5',
        marginBottom: '16px', flexWrap: 'wrap',
    },
    filterInput: {
        padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
        fontSize: '12px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none',
    },
    filterBtn: {
        padding: '8px 18px', backgroundColor: '#FA7070', color: '#fff',
        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
    },
    resetBtn: {
        padding: '8px 14px', backgroundColor: '#f5f5f5', color: '#888',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
    },
    viewToggleRow: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '16px',
    },
    resultCount: { fontSize: '13px', color: '#888' },
    viewToggle: { display: 'flex', gap: '0', border: '1.5px solid #C6EBC5', borderRadius: '8px', overflow: 'hidden' },
    viewBtn: {
        padding: '7px 16px', backgroundColor: '#fff', color: '#888',
        border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
    },
    viewBtnActive: {
        padding: '7px 16px', backgroundColor: '#FA7070', color: '#fff',
        border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
    },
    errorMsg: {
        backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
        borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
    },
    emptyBox: {
        textAlign: 'center', padding: '60px', backgroundColor: '#fff',
        borderRadius: '16px', border: '1px solid #C6EBC5',
    },
    hospitalList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    divisionGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px',
    },
    divisionCard: {
        backgroundColor: '#fff', borderRadius: '14px', padding: '16px',
        border: '1px solid #C6EBC5',
    },
    divisionHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0',
    },
    divisionName: { fontSize: '15px', fontWeight: 'bold', color: '#FA7070' },
    divisionCount: { fontSize: '11px', color: '#aaa' },
    divisionHospitalRow: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 0', borderBottom: '1px solid #f9f9f9',
    },
    divisionHospitalInfo: { flex: 1, minWidth: 0 },
    divisionHospitalName: {
        fontSize: '13px', fontWeight: '600', color: '#333',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    divisionHospitalType: { fontSize: '10px', color: '#aaa' },
    divisionResourceDots: { display: 'flex', gap: '3px' },
    resourceDot: { width: '10px', height: '10px', borderRadius: '50%' },
    miniCallBtn: {
        backgroundColor: '#C6EBC5', borderRadius: '6px', padding: '4px 8px',
        textDecoration: 'none', fontSize: '12px',
    },
};

const cardStyles = {
    card: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '22px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5',
    },
    cardTop: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px',
    },
    cardLeft: {},
    hospitalName: { fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
    hospitalMeta: { fontSize: '12px', color: '#888' },
    hospitalAddress: { fontSize: '12px', color: '#aaa', marginTop: '2px' },
    cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
    typeBadge: {
        borderRadius: '12px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold',
    },
    lastUpdated: { fontSize: '11px', color: '#aaa' },
    resourceGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px', marginBottom: '14px',
    },
    resourceCell: {
        borderRadius: '10px', padding: '12px 8px',
        textAlign: 'center', border: '1px solid #f0f0f0',
    },
    resourceIcon: { fontSize: '18px', marginBottom: '4px' },
    resourceLabel: { fontSize: '10px', color: '#666', fontWeight: '600', marginBottom: '4px' },
    resourceValue: { fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' },
    miniBar: {
        height: '4px', backgroundColor: '#f0f0f0',
        borderRadius: '2px', overflow: 'hidden',
    },
    miniBarFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s' },
    specialtiesRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' },
    specialtyChip: {
        backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '12px',
        padding: '3px 10px', fontSize: '11px', color: '#555',
    },
    cardFooter: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '12px', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px',
    },
    footerLeft: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
    callBtn: {
        padding: '7px 14px', backgroundColor: '#C6EBC5', color: '#27AE60',
        borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none',
    },
    emergencyBtn: {
        padding: '7px 14px', backgroundColor: '#fdecea', color: '#c0392b',
        borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', textDecoration: 'none',
    },
    detailBtn: {
        padding: '7px 14px', backgroundColor: '#FEFDEC', color: '#FA7070',
        border: '1.5px solid #FA7070', borderRadius: '8px', fontWeight: 'bold',
        fontSize: '12px', cursor: 'pointer',
    },
    expandedSection: {
        marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f0f0f0',
    },
    expandedGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
    expandedRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    expandedLabel: { fontSize: '13px', color: '#555', fontWeight: '600', width: '110px', flexShrink: 0 },
    expandedRight: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px' },
    expandedBar: {
        flex: 1, height: '8px', backgroundColor: '#f0f0f0',
        borderRadius: '4px', overflow: 'hidden',
    },
    expandedBarFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
    expandedVal: { fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },
};

export default HospitalBoardPage;