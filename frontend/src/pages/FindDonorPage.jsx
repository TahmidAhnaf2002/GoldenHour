import { useState } from 'react';
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

const bloodTypes = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
  'A1+', 'A1-', 'A2+', 'A2-', 'Bombay O',
];

const FindDonorPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    bloodType: '',
    division: '',
    district: '',
  });
  const [donors, setDonors] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const params = {};
      if (filters.bloodType) params.bloodType = filters.bloodType;
      if (filters.division) params.division = filters.division;
      if (filters.district) params.district = filters.district;

      const { data } = await axios.get('/api/donors/find', { params });
      setDonors(data.donors);
      setSearched(true);
    } catch (err) {
      setError('Failed to fetch donors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <button style={styles.backBtn} onClick={() => navigate('/home')}>
          Back to Home
        </button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '36px' }}>🔍</span>
          <h1 style={styles.title}>Find Blood Donors</h1>
          <p style={styles.subtitle}>
            Search for available and eligible donors near you
          </p>
        </div>

        <form onSubmit={handleSearch} style={styles.searchBox}>
          <div style={styles.searchRow}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Blood Type</label>
              <select
                style={styles.input}
                name="bloodType"
                value={filters.bloodType}
                onChange={handleChange}
              >
                <option value="">All blood types</option>
                {bloodTypes.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Division</label>
              <select
                style={styles.input}
                name="division"
                value={filters.division}
                onChange={handleChange}
              >
                <option value="">All divisions</option>
                {divisions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>District</label>
              <select
                style={styles.input}
                name="district"
                value={filters.district}
                onChange={handleChange}
                disabled={!filters.division}
              >
                <option value="">All districts</option>
                {filters.division &&
                  districts[filters.division].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
              </select>
            </div>

            <button style={styles.searchBtn} type="submit" disabled={loading}>
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </div>
        </form>

        {error && <div style={styles.errorBox}>{error}</div>}

        {searched && (
          <div style={styles.results}>
            <h2 style={styles.resultsTitle}>
              {donors.length > 0
                ? `Found ${donors.length} eligible donor(s)`
                : 'No eligible donors found for your search'}
            </h2>

            {donors.length === 0 && (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: '48px' }}>😔</span>
                <p style={{ color: '#888', marginTop: '12px' }}>
                  No donors found. Try different filters.
                </p>
              </div>
            )}

            <div style={styles.donorGrid}>
              {donors.map((donor) => (
                <div key={donor._id} style={styles.donorCard}>
                  <div style={styles.cardTop}>
                    <div style={styles.bloodBadge}>{donor.bloodType}</div>
                    <div style={styles.availBadge}>
                      {donor.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                    </div>
                  </div>

                  <h3 style={styles.donorName}>{donor.name}</h3>

                  <div style={styles.donorInfo}>
                    <p>📍 {donor.location.district}, {donor.location.division}</p>
                    {donor.location.area && (
                      <p>🏘️ {donor.location.area}</p>
                    )}
                    <p>📞 {donor.phone}</p>
                    <p>🩸 Total Donations: {donor.totalDonations}</p>
                    {donor.lastDonationDate && (
                      <p>
                        📅 Last Donated:{' '}
                        {new Date(donor.lastDonationDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    {donor.isEligible ? (
                      <span style={styles.badgeGreen}>✅ Eligible to Donate</span>
                    ) : (
                      <span style={styles.badgeRed}>⏳ Not Yet Eligible</span>
                    )}
                  </div>

                  <a href={'tel:' + donor.phone} style={styles.callBtn}>
                    📞 Call Donor
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#FEFDEC',
    fontFamily: 'sans-serif',
  },
  navbar: {
    backgroundColor: '#FA7070',
    padding: '14px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    color: '#fff',
  },
  navLogoText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  backBtn: {
    backgroundColor: '#fff',
    color: '#FA7070',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#333',
    margin: '10px 0 6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #C6EBC5',
    marginBottom: '24px',
  },
  searchRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr auto',
    gap: '16px',
    alignItems: 'flex-end',
  },
  fieldGroup: {
    marginBottom: '0',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #C6EBC5',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FEFDEC',
    color: '#333',
  },
  searchBtn: {
    padding: '10px 24px',
    backgroundColor: '#FA7070',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  errorBox: {
    backgroundColor: '#fdecea',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  results: {
    marginTop: '8px',
  },
  resultsTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid #C6EBC5',
  },
  donorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  donorCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #C6EBC5',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  bloodBadge: {
    backgroundColor: '#FA7070',
    color: '#fff',
    borderRadius: '20px',
    padding: '4px 14px',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  availBadge: {
    fontSize: '12px',
    color: '#666',
  },
  donorName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  donorInfo: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.8',
  },
  badgeGreen: {
    backgroundColor: '#C6EBC5',
    color: '#27AE60',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  badgeRed: {
    backgroundColor: '#fdecea',
    color: '#c0392b',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  callBtn: {
    display: 'block',
    textAlign: 'center',
    marginTop: '14px',
    padding: '10px',
    backgroundColor: '#C6EBC5',
    color: '#27AE60',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '13px',
    textDecoration: 'none',
  },
};

export default FindDonorPage;