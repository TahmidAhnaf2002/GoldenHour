import { useState } from 'react';
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

const NearExpiryPostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    facilityName: '', facilityType: 'Hospital', contactNumber: '',
    division: '', district: '', area: '',
    medicineName: '', genericName: '', quantity: '',
    originalPrice: '', discountedPrice: '', expiryDate: '', description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const daysLeft = form.expiryDate
    ? Math.ceil((new Date(form.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const getExpiryWarning = () => {
    if (daysLeft === null) return null;
    if (daysLeft <= 0) return { color: '#c0392b', text: 'Already expired — cannot post' };
    if (daysLeft <= 7) return { color: '#c0392b', text: `🚨 Critical — expires in ${daysLeft} day(s)` };
    if (daysLeft <= 30) return { color: '#E67E22', text: `⚠️ Urgent — expires in ${daysLeft} day(s)` };
    return { color: '#27AE60', text: `🟢 Soon — expires in ${daysLeft} day(s)` };
  };

  const discountPct = form.originalPrice && form.discountedPrice
    ? Math.round(((form.originalPrice - form.discountedPrice) / form.originalPrice) * 100)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (daysLeft !== null && daysLeft <= 0) {
      setError('Cannot post already expired medicine');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(
        '/api/nearexpiry/post',
        {
          facilityName: form.facilityName,
          facilityType: form.facilityType,
          contactNumber: form.contactNumber,
          location: { division: form.division, district: form.district, area: form.area },
          medicineName: form.medicineName,
          genericName: form.genericName,
          quantity: Number(form.quantity),
          originalPrice: Number(form.originalPrice),
          discountedPrice: Number(form.discountedPrice),
          expiryDate: form.expiryDate,
          description: form.description,
        },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setSuccess(true);
      setTimeout(() => navigate('/nearexpiry/manage'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.successBox}>
          <span style={{ fontSize: '50px' }}>♻️</span>
          <h2 style={{ color: '#FA7070', margin: '16px 0 8px' }}>Medicine Posted!</h2>
          <p style={{ color: '#666' }}>Patients and NGOs can now claim this medicine.</p>
        </div>
      </div>
    );
  }

  const warning = getExpiryWarning();

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <button style={styles.backBtn} onClick={() => navigate('/nearexpiry')}>← Back</button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '36px' }}>♻️</span>
          <h1 style={styles.title}>Post Near-Expiry Medicine</h1>
          <p style={styles.subtitle}>List medicines nearing expiry at a reduced price to reduce waste</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.sectionTitle}>🏥 Facility Details</div>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Facility Name *</label>
              <input style={styles.input} type="text" name="facilityName"
                placeholder="e.g. Dhaka Medical College Hospital"
                value={form.facilityName} onChange={handleChange} required />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Facility Type *</label>
              <select style={styles.input} name="facilityType"
                value={form.facilityType} onChange={handleChange}>
                <option value="Hospital">🏥 Hospital</option>
                <option value="Pharmacy">💊 Pharmacy</option>
                <option value="Clinic">🏨 Clinic</option>
                <option value="NGO">🏢 NGO</option>
              </select>
            </div>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Contact Number *</label>
            <input style={styles.input} type="tel" name="contactNumber"
              placeholder="01XXXXXXXXX"
              value={form.contactNumber} onChange={handleChange} required />
          </div>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Division *</label>
              <select style={styles.input} name="division"
                value={form.division} onChange={handleChange} required>
                <option value="">Select division</option>
                {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>District *</label>
              <select style={styles.input} name="district"
                value={form.district} onChange={handleChange}
                required disabled={!form.division}>
                <option value="">Select district</option>
                {form.division && districts[form.division]?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Area (optional)</label>
            <input style={styles.input} type="text" name="area"
              placeholder="e.g. Mirpur, Gulshan"
              value={form.area} onChange={handleChange} />
          </div>

          <div style={styles.sectionTitle}>💊 Medicine Details</div>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Medicine Name *</label>
              <input style={styles.input} type="text" name="medicineName"
                placeholder="e.g. Amoxicillin 500mg"
                value={form.medicineName} onChange={handleChange} required />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Generic Name</label>
              <input style={styles.input} type="text" name="genericName"
                placeholder="e.g. Amoxicillin"
                value={form.genericName} onChange={handleChange} />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Quantity (units) *</label>
              <input style={styles.input} type="number" name="quantity"
                min="1" placeholder="e.g. 50"
                value={form.quantity} onChange={handleChange} required />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Expiry Date *</label>
              <input style={styles.input} type="date" name="expiryDate"
                value={form.expiryDate} onChange={handleChange} required />
              {warning && (
                <small style={{ fontSize: '12px', color: warning.color, marginTop: '4px', display: 'block' }}>
                  {warning.text}
                </small>
              )}
            </div>
          </div>

          <div style={styles.sectionTitle}>💰 Pricing</div>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Original Price (৳/unit) *</label>
              <input style={styles.input} type="number" name="originalPrice"
                min="0" placeholder="e.g. 500"
                value={form.originalPrice} onChange={handleChange} required />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Discounted Price (৳/unit) *</label>
              <input style={styles.input} type="number" name="discountedPrice"
                min="0" placeholder="e.g. 200"
                value={form.discountedPrice} onChange={handleChange} required />
              {discountPct > 0 && (
                <small style={{ fontSize: '12px', color: '#27AE60', marginTop: '4px', display: 'block' }}>
                  🎉 {discountPct}% discount applied
                </small>
              )}
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Additional Notes (optional)</label>
            <textarea
              style={{ ...styles.input, height: '70px', resize: 'vertical' }}
              name="description"
              placeholder="e.g. Sealed box, storage conditions, restrictions..."
              value={form.description} onChange={handleChange}
            />
          </div>

          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Posting...' : '♻️ Post Medicine'}
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
  title: { fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '10px 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
  errorBox: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid #f5c6cb',
  },
  successBox: {
    textAlign: 'center', backgroundColor: '#fff', borderRadius: '16px',
    padding: '60px 40px', maxWidth: '400px', margin: '100px auto',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
  },
  form: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5',
  },
  sectionTitle: {
    fontSize: '14px', fontWeight: 'bold', color: '#FA7070', marginBottom: '12px',
    marginTop: '20px', paddingBottom: '6px', borderBottom: '1px solid #f0f0f0',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333',
  },
  submitBtn: {
    width: '100%', padding: '14px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold',
    cursor: 'pointer', marginTop: '24px',
  },
};

export default NearExpiryPostPage;