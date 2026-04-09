import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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

const SEARCH_HISTORY_KEY = 'gh_medicine_search_history';
const MAX_HISTORY = 8;

const saveToHistory = (query) => {
    if (!query.trim()) return;
    const existing = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
    const updated = [query, ...existing.filter((q) => q !== query)].slice(0, MAX_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
};

const getHistory = () =>
    JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');

const clearHistory = () => localStorage.removeItem(SEARCH_HISTORY_KEY);

const MedicineFinderPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        division: '', district: '', maxPrice: '', facilityType: '',
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const [searchHistory, setSearchHistory] = useState(getHistory());
    const [showHistory, setShowHistory] = useState(false);

    // Reserve modal
    const [reserveModal, setReserveModal] = useState(null);
    const [reserveForm, setReserveForm] = useState({ unitsReserved: 1, contactNumber: '' });
    const [reserveMsg, setReserveMsg] = useState('');
    const [reserveLoading, setReserveLoading] = useState(false);

    const handleSearch = async (queryOverride) => {
        const q = queryOverride !== undefined ? queryOverride : searchQuery;
        setError('');
        setLoading(true);
        setSearched(true);
        setShowHistory(false);
        if (q.trim()) saveToHistory(q.trim());
        setSearchHistory(getHistory());

        try {
            const params = { q };
            if (filters.division) params.division = filters.division;
            if (filters.district) params.district = filters.district;
            if (filters.facilityType) params.facilityType = filters.facilityType;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;

            const { data } = await axios.get('/api/medicines/search', { params });
            setResults(data.medicines);
        } catch {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReserve = async (e) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }
        setReserveLoading(true);
        setReserveMsg('');
        try {
            await axios.post(
                '/api/medicines/' + reserveModal._id + '/reserve',
                reserveForm,
                { headers: { Authorization: 'Bearer ' + user.token } }
            );
            setReserveMsg('✅ Reserved! Contact the facility to confirm pickup.');
            setTimeout(() => { setReserveModal(null); setReserveMsg(''); handleSearch(); }, 2500);
        } catch (err) {
            setReserveMsg('❌ ' + (err.response?.data?.message || 'Failed'));
        } finally {
            setReserveLoading(false);
        }
    };

    const getStockStyle = (med) => {
        if (!med.isAvailable || med.stockUnits === 0)
            return { bg: '#f5f5f5', color: '#aaa', label: 'Out of Stock' };
        if (med.stockUnits < 5)
            return { bg: '#fdecea', color: '#c0392b', label: `${med.stockUnits} left (Critical)` };
        if (med.stockUnits < 15)
            return { bg: '#FEF9E7', color: '#E67E22', label: `${med.stockUnits} units (Low)` };
        return { bg: '#C6EBC5', color: '#27AE60', label: `${med.stockUnits} units (Good)` };
    };

    const facilityIcon = (type) =>
        type === 'Hospital' ? '🏥' : type === 'Pharmacy' ? '💊' : '🏨';

    return (
        <div style={styles.wrapper}>
            <nav style={styles.navbar}>
                <div style={styles.navLogo}>
                    🏥 <span style={styles.navLogoText}>GoldenHour</span>
                </div>
                <div style={styles.navRight}>
                    <button style={styles.myListingsBtn} onClick={() => navigate('/medicines/manage')}>
                        ⚙️ Manage Listings
                    </button>
                    <button style={styles.myReservationsBtn} onClick={() => navigate('/medicines/reservations')}>
                        📋 My Reservations
                    </button>
                    <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
                </div>
            </nav>

            <div style={styles.container}>
                <div style={styles.header}>
                    <span style={{ fontSize: '40px' }}>💊</span>
                    <h1 style={styles.title}>Rare Medicine Finder</h1>
                    <p style={styles.subtitle}>
                        Search by medicine name, generic name, or disease across hospitals and pharmacies
                    </p>
                </div>

                {/* Search bar */}
                <div style={styles.searchSection}>
                    <div style={styles.searchRow}>
                        <div style={styles.searchInputWrapper}>
                            <input
                                style={styles.searchInput}
                                type="text"
                                placeholder="Search medicine name, generic name, or disease..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowHistory(true)}
                                onBlur={() => setTimeout(() => setShowHistory(false), 150)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            {showHistory && searchHistory.length > 0 && (
                                <div style={styles.historyDropdown}>
                                    <div style={styles.historyHeader}>
                                        <span style={styles.historyLabel}>🕐 Recent Searches</span>
                                        <button
                                            style={styles.clearHistoryBtn}
                                            onMouseDown={() => { clearHistory(); setSearchHistory([]); }}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    {searchHistory.map((q, i) => (
                                        <div
                                            key={i}
                                            style={styles.historyItem}
                                            onMouseDown={() => { setSearchQuery(q); handleSearch(q); }}
                                        >
                                            🔍 {q}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button style={styles.searchBtn} onClick={() => handleSearch()}>
                            🔍 Search
                        </button>
                    </div>

                    {/* Filters */}
                    <div style={styles.filtersRow}>
                        <select
                            style={styles.filterSelect}
                            value={filters.facilityType}
                            onChange={(e) => setFilters({ ...filters, facilityType: e.target.value })}
                        >
                            <option value="">All Facilities</option>
                            <option value="Hospital">🏥 Hospitals</option>
                            <option value="Pharmacy">💊 Pharmacies</option>
                            <option value="Clinic">🏨 Clinics</option>
                        </select>

                        <select
                            style={styles.filterSelect}
                            value={filters.division}
                            onChange={(e) => setFilters({ ...filters, division: e.target.value, district: '' })}
                        >
                            <option value="">All Divisions</option>
                            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>

                        <select
                            style={styles.filterSelect}
                            value={filters.district}
                            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                            disabled={!filters.division}
                        >
                            <option value="">All Districts</option>
                            {filters.division && districts[filters.division]?.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>

                        <div style={styles.priceFilter}>
                            <span style={styles.priceLabel}>Max Price (৳)</span>
                            <input
                                style={styles.priceInput}
                                type="number"
                                min="0"
                                placeholder="Any"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                        </div>

                        <button
                            style={styles.resetBtn}
                            onClick={() => {
                                setFilters({ division: '', district: '', maxPrice: '', facilityType: '' });
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Add listing CTA */}
                <div style={styles.addListingBanner}>
                    <span>🏥 Are you a hospital or pharmacy?</span>
                    <button style={styles.addListingBtn} onClick={() => navigate('/medicines/add')}>
                        + Add Medicine Listing
                    </button>
                </div>

                {/* Results */}
                {loading && <div style={styles.centerMsg}>Searching...</div>}
                {error && <div style={styles.errorMsg}>{error}</div>}

                {/* ── STEP 3: Empty-state now links to Alternatives page ── */}
                {!loading && searched && results.length === 0 && (
                    <div style={styles.emptyBox}>
                        <span style={{ fontSize: '48px' }}>💊</span>
                        <p style={{ color: '#888', marginTop: '12px', fontSize: '15px' }}>
                            No medicines found matching your search
                        </p>
                        <p style={{ color: '#aaa', fontSize: '13px', marginTop: '4px' }}>
                            Try a different name or broaden your filters
                        </p>

                        {/* ── ADDED: Alternatives CTA card ── */}
                        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#FEF9E7', borderRadius: '10px', border: '1px solid #fceab0' }}>
                            <p style={{ color: '#E67E22', fontWeight: 'bold', fontSize: '14px', margin: '0 0 8px' }}>
                                🔄 Can't find this medicine?
                            </p>
                            <p style={{ color: '#888', fontSize: '13px', margin: '0 0 12px' }}>
                                Check if a generic or alternative brand is available
                            </p>
                            <button
                                style={{ backgroundColor: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                                onClick={() => navigate('/medicines/alternatives')}
                            >
                                🔄 Find Alternatives
                            </button>
                        </div>
                        {/* ── END ADDED ── */}

                    </div>
                )}

                {!searched && (
                    <div style={styles.suggestionsGrid}>
                        {['Insulin', 'Vancomycin', 'Clozapine', 'Deferasirox',
                            'Imatinib', 'Tacrolimus', 'Rituximab', 'Amphotericin B'].map((s) => (
                                <button
                                    key={s}
                                    style={styles.suggestionChip}
                                    onClick={() => { setSearchQuery(s); handleSearch(s); }}
                                >
                                    🔍 {s}
                                </button>
                            ))}
                    </div>
                )}

                <div style={styles.resultsList}>
                    {results.map((med) => {
                        const stock = getStockStyle(med);
                        return (
                            <div key={med._id} style={styles.medicineCard}>
                                <div style={styles.cardTop}>
                                    <div style={styles.medicineInfo}>
                                        <div style={styles.medicineName}>{med.medicineName}</div>
                                        {med.genericName && (
                                            <div style={styles.genericName}>Generic: {med.genericName}</div>
                                        )}
                                        {med.manufacturer && (
                                            <div style={styles.manufacturer}>by {med.manufacturer}</div>
                                        )}
                                    </div>
                                    <div style={{ ...styles.stockBadge, backgroundColor: stock.bg, color: stock.color }}>
                                        {stock.label}
                                    </div>
                                </div>

                                <div style={styles.infoGrid}>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>
                                            {facilityIcon(med.facilityType)} Facility
                                        </span>
                                        <span style={styles.infoValue}>{med.facilityName} ({med.facilityType})</span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>📍 Location</span>
                                        <span style={styles.infoValue}>
                                            {med.location.district}, {med.location.division}
                                            {med.location.area && ` · ${med.location.area}`}
                                        </span>
                                    </div>
                                    {med.disease && (
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>🩺 For Disease</span>
                                            <span style={styles.infoValue}>{med.disease}</span>
                                        </div>
                                    )}
                                    {med.dosage && (
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>💉 Dosage</span>
                                            <span style={styles.infoValue}>{med.dosage}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={styles.cardFooter}>
                                    <div style={styles.priceTag}>
                                        ৳ {med.pricePerUnit.toLocaleString()} <span style={styles.perUnit}>/ unit</span>
                                    </div>
                                    <div style={styles.cardActions}>
                                        <a href={'tel:' + med.contactNumber} style={styles.callBtn}>
                                            📞 Call
                                        </a>
                                        {med.isAvailable && med.stockUnits > 0 && user && (
                                            <button
                                                style={styles.reserveBtn}
                                                onClick={() => {
                                                    setReserveModal(med);
                                                    setReserveForm({ unitsReserved: 1, contactNumber: '' });
                                                    setReserveMsg('');
                                                }}
                                            >
                                                📦 Reserve
                                            </button>
                                        )}
                                        {!user && med.isAvailable && (
                                            <button style={styles.reserveBtn} onClick={() => navigate('/login')}>
                                                📦 Reserve
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Reserve Modal */}
            {reserveModal && (
                <div style={styles.modalOverlay} onClick={() => setReserveModal(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>📦 Reserve Medicine</h3>
                        <p style={styles.modalMed}>{reserveModal.medicineName}</p>
                        <p style={styles.modalFacility}>
                            {reserveModal.facilityName} · ৳{reserveModal.pricePerUnit}/unit
                        </p>

                        {reserveMsg && (
                            <div style={reserveMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                                {reserveMsg}
                            </div>
                        )}

                        <form onSubmit={handleReserve}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Units to Reserve *</label>
                                <input
                                    style={styles.input}
                                    type="number" min="1" max={reserveModal.stockUnits}
                                    value={reserveForm.unitsReserved}
                                    onChange={(e) => setReserveForm({ ...reserveForm, unitsReserved: e.target.value })}
                                    required
                                />
                                <small style={styles.hint}>
                                    Max available: {reserveModal.stockUnits} units ·
                                    Total: ৳{(reserveForm.unitsReserved * reserveModal.pricePerUnit).toLocaleString()}
                                </small>
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Your Contact Number *</label>
                                <input
                                    style={styles.input}
                                    type="tel" placeholder="01XXXXXXXXX"
                                    value={reserveForm.contactNumber}
                                    onChange={(e) => setReserveForm({ ...reserveForm, contactNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={styles.modalBtns}>
                                <button type="button" style={styles.cancelBtn} onClick={() => setReserveModal(null)}>
                                    Cancel
                                </button>
                                <button type="submit" style={styles.confirmBtn} disabled={reserveLoading}>
                                    {reserveLoading ? 'Reserving...' : '✅ Confirm Reserve'}
                                </button>
                            </div>
                        </form>
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
    myListingsBtn: {
        backgroundColor: '#fff', color: '#FA7070', border: 'none',
        borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
    },
    myReservationsBtn: {
        backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
        borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
    },
    backBtn: {
        backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
        borderRadius: '8px', padding: '7px 12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
    },
    container: { maxWidth: '960px', margin: '0 auto', padding: '32px 20px' },
    header: { textAlign: 'center', marginBottom: '24px' },
    title: { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
    subtitle: { fontSize: '14px', color: '#888' },
    searchSection: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '20px 24px',
        border: '1px solid #C6EBC5', marginBottom: '16px',
    },
    searchRow: { display: 'flex', gap: '10px', marginBottom: '14px' },
    searchInputWrapper: { flex: 1, position: 'relative' },
    searchInput: {
        width: '100%', padding: '12px 16px', borderRadius: '10px',
        border: '1.5px solid #C6EBC5', fontSize: '14px', outline: 'none',
        backgroundColor: '#FEFDEC', color: '#333', boxSizing: 'border-box',
    },
    historyDropdown: {
        position: 'absolute', top: '100%', left: 0, right: 0,
        backgroundColor: '#fff', border: '1.5px solid #C6EBC5', borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
    },
    historyHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 14px', borderBottom: '1px solid #f0f0f0',
    },
    historyLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600' },
    clearHistoryBtn: {
        fontSize: '11px', color: '#FA7070', background: 'none',
        border: 'none', cursor: 'pointer', fontWeight: 'bold',
    },
    historyItem: {
        padding: '10px 14px', fontSize: '13px', color: '#555',
        cursor: 'pointer', borderBottom: '1px solid #f9f9f9',
    },
    searchBtn: {
        padding: '12px 24px', backgroundColor: '#FA7070', color: '#fff',
        border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
        whiteSpace: 'nowrap',
    },
    filtersRow: {
        display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
    },
    filterSelect: {
        padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
        fontSize: '12px', backgroundColor: '#FEFDEC', color: '#333', outline: 'none',
    },
    priceFilter: { display: 'flex', alignItems: 'center', gap: '6px' },
    priceLabel: { fontSize: '12px', color: '#888', whiteSpace: 'nowrap' },
    priceInput: {
        width: '80px', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
        fontSize: '12px', outline: 'none', backgroundColor: '#FEFDEC',
    },
    resetBtn: {
        padding: '8px 14px', backgroundColor: '#f5f5f5', color: '#888',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
    },
    addListingBanner: {
        backgroundColor: '#fff', border: '1px dashed #C6EBC5', borderRadius: '10px',
        padding: '12px 20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px',
        fontSize: '13px', color: '#888',
    },
    addListingBtn: {
        backgroundColor: '#FA7070', color: '#fff', border: 'none',
        borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold',
        cursor: 'pointer', fontSize: '13px',
    },
    centerMsg: { textAlign: 'center', color: '#888', padding: '40px' },
    errorMsg: {
        backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
        borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
    },
    successMsg: {
        backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
        borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
    },
    emptyBox: {
        textAlign: 'center', padding: '60px', backgroundColor: '#fff',
        borderRadius: '16px', border: '1px solid #C6EBC5',
    },
    suggestionsGrid: {
        display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px',
    },
    suggestionChip: {
        padding: '8px 16px', backgroundColor: '#fff', border: '1.5px solid #C6EBC5',
        borderRadius: '20px', fontSize: '13px', color: '#555', cursor: 'pointer',
        fontWeight: '500',
    },
    resultsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    medicineCard: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '22px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5',
    },
    cardTop: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px',
    },
    medicineInfo: {},
    medicineName: { fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '3px' },
    genericName: { fontSize: '12px', color: '#888' },
    manufacturer: { fontSize: '12px', color: '#aaa' },
    stockBadge: {
        borderRadius: '20px', padding: '5px 14px',
        fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap',
    },
    infoGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '10px', marginBottom: '14px',
    },
    infoItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
    infoLabel: { fontSize: '11px', color: '#aaa', fontWeight: '600' },
    infoValue: { fontSize: '13px', color: '#333', fontWeight: '500' },
    cardFooter: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '14px', borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px',
    },
    priceTag: { fontSize: '20px', fontWeight: 'bold', color: '#FA7070' },
    perUnit: { fontSize: '13px', color: '#aaa', fontWeight: 'normal' },
    cardActions: { display: 'flex', gap: '10px' },
    callBtn: {
        padding: '8px 16px', backgroundColor: '#C6EBC5', color: '#27AE60',
        borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none',
    },
    reserveBtn: {
        padding: '8px 16px', backgroundColor: '#FA7070', color: '#fff',
        border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
    },
    // Modal
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modal: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    },
    modalTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
    modalMed: { fontSize: '16px', fontWeight: '600', color: '#FA7070', margin: '0 0 2px' },
    modalFacility: { fontSize: '12px', color: '#888', marginBottom: '18px' },
    fieldGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
    input: {
        width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
        fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333',
    },
    hint: { fontSize: '11px', color: '#aaa', marginTop: '4px', display: 'block' },
    modalBtns: { display: 'flex', gap: '12px', marginTop: '8px' },
    cancelBtn: {
        flex: 1, padding: '12px', backgroundColor: '#f5f5f5', color: '#888',
        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
    },
    confirmBtn: {
        flex: 1, padding: '12px', backgroundColor: '#FA7070', color: '#fff',
        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
    },
};

export default MedicineFinderPage;