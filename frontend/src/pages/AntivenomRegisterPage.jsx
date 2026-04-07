import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const antivenomTypes = [
  'Polyvalent Snake Antivenom',
  'King Cobra Antivenom',
  'Krait Antivenom',
  'Viper Antivenom',
  'Sea Snake Antivenom',
];

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

const AntivenomRegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [existing, setExisting] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const [formData, setFormData] = useState({
    hospital: '', contactNumber: '', division: '', district: '', area: '',
  });
  const [stockData, setStockData] = useState(
    Object.fromEntries(antivenomTypes.map((t) => [t, 0]))
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const { data } = await axios.get('/api/antivenom/me', {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      setExisting(data);
      setFormData({
        hospital: data.hospital,
        contactNumber: data.contactNumber,
        division: data.location.division,
        district: data.location.district,
        area: data.location.area || '',
      });
      const s = {};
      antivenomTypes.forEach((t) => {
        const match = data.stock.find((st) => st.antivenomType === t);
        s[t] = match ? match.units : 0;
      });
      setStockData(s);
    } catch {
      setExisting(null);
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const stock = antivenomTypes.map((t) => ({
      antivenomType: t,
      units: Number(stockData[t]),
    }));
    try {
      if (existing) {
        await axios.put(
          '/api/antivenom/update',
          { stock },
          { headers: { Authorization: 'Bearer ' + user.token } }
        );
        setMsg('✅ Stock updated successfully!');
      } else {
        await axios.post(
          '/api/antivenom/register',
          {
            hospital: formData.hospital,
            contactNumber: formData.contactNumber,
            location: {
              division: formData.division,
              district: formData.district,
              area: formData.area,
            },
            stock,
          },
          { headers: { Authorization: 'Bearer ' + user.token } }
        );
        setMsg('✅ Registered successfully!');
        fetchExisting();
      }
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingExisting) return <div style={styles.centerMsg}>Loading...</div>;

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <button style={styles.backBtn} onClick={() => navigate('/antivenom')}>← Back</button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '36px' }}>🏥</span>
          <h1 style={styles.title}>
            {existing ? 'Update Antivenom Stock' : 'Register Hospital Antivenom Stock'}
          </h1>
          <p style={styles.subtitle}>
            Help snake bite victims find the right antivenom near them
          </p>
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!existing && (
            <>
              <div style={styles.sectionTitle}>🏥 Hospital Details</div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Hospital Name *</label>
                <input style={styles.input} type="text" value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  placeholder="e.g. Dhaka Medical College Hospital" required />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Contact Number *</label>
                <input style={styles.input} type="tel" value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="01XXXXXXXXX" required />
              </div>
              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Division *</label>
                  <select style={styles.input} value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })} required>
                    <option value="">Select division</option>
                    {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>District *</label>
                  <select style={styles.input} value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required disabled={!formData.division}>
                    <option value="">Select district</option>
                    {formData.division && districts[formData.division]?.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {existing && (
            <div style={styles.existingInfo}>
              <strong>🏥 {existing.hospital}</strong>
              <span style={{ color: '#888', fontSize: '13px', marginLeft: '10px' }}>
                📍 {existing.location.district}, {existing.location.division}
              </span>
            </div>
          )}

          <div style={styles.sectionTitle}>💉 Antivenom Stock Levels</div>
          <div style={styles.stockGrid}>
            {antivenomTypes.map((type) => (
              <div key={type} style={styles.stockItem}>
                <label style={styles.stockLabel}>{type}</label>
                <input
                  style={styles.stockInput}
                  type="number" min="0" max="9999"
                  value={stockData[type]}
                  onChange={(e) => setStockData({ ...stockData, [type]: e.target.value })}
                />
                <span style={{
                  ...styles.stockStatus,
                  color: stockData[type] >= 10 ? '#27ae60' : stockData[type] >= 3 ? '#E67E22' : '#c0392b',
                }}>
                  {stockData[type] == 0 ? 'Empty' : stockData[type] < 3 ? 'Critical' : stockData[type] < 10 ? 'Low' : 'Good'}
                </span>
              </div>
            ))}
          </div>

          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Saving...' : existing ? '💾 Update Stock' : '🏥 Register Hospital'}
          </button>
        </form>
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
  backBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  container: { maxWidth: '680px', margin: '0 auto', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '28px' },
  title: { fontSize: '22px', fontWeight: 'bold', color: '#333', margin: '10px 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  centerMsg: { textAlign: 'center', padding: '80px', color: '#888', fontFamily: 'sans-serif' },
  form: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5',
  },
  sectionTitle: {
    fontSize: '14px', fontWeight: 'bold', color: '#FA7070', marginBottom: '14px',
    marginTop: '20px', paddingBottom: '6px', borderBottom: '1px solid #f0f0f0',
  },
  existingInfo: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '8px',
    padding: '12px 16px', marginBottom: '8px', fontSize: '14px', color: '#333',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333',
  },
  stockGrid: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' },
  stockItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  stockLabel: { flex: 1, fontSize: '13px', color: '#444', fontWeight: '500' },
  stockInput: {
    width: '80px', padding: '8px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', textAlign: 'center', outline: 'none', backgroundColor: '#FEFDEC',
  },
  stockStatus: { fontSize: '12px', fontWeight: 'bold', width: '50px' },
  submitBtn: {
    width: '100%', padding: '14px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold',
    cursor: 'pointer', marginTop: '24px',
  },
};

export default AntivenomRegisterPage;