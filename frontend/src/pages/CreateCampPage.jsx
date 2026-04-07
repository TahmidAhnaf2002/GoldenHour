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

const CreateCampPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    campName: '', date: '', venue: '', division: '', district: '',
    area: '', targetDonors: 20, contactNumber: '', description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(
        '/api/camps/create',
        {
          campName: formData.campName,
          date: formData.date,
          venue: formData.venue,
          location: {
            division: formData.division,
            district: formData.district,
            area: formData.area,
          },
          targetDonors: Number(formData.targetDonors),
          contactNumber: formData.contactNumber,
          description: formData.description,
        },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setSuccess(true);
      setTimeout(() => navigate('/camps'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create camp');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.successBox}>
          <span style={{ fontSize: '50px' }}>🩸</span>
          <h2 style={{ color: '#FA7070', margin: '16px 0 8px' }}>Camp Created!</h2>
          <p style={{ color: '#666' }}>Donors can now register for your camp.</p>
          <p style={{ color: '#aaa', fontSize: '13px', marginTop: '8px' }}>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <button style={styles.backBtn} onClick={() => navigate('/camps')}>
          ← Back to Camps
        </button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '36px' }}>🩸</span>
          <h1 style={styles.title}>Organize a Donation Camp</h1>
          <p style={styles.subtitle}>Set up your camp and let donors find and register</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.sectionTitle}>🏕️ Camp Details</div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Camp Name *</label>
            <input style={styles.input} type="text" name="campName"
              placeholder="e.g. Eid Blood Drive 2025"
              value={formData.campName} onChange={handleChange} required />
          </div>

          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Camp Date *</label>
              <input style={styles.input} type="date" name="date"
                value={formData.date} onChange={handleChange} required />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Target Donors *</label>
              <input style={styles.input} type="number" name="targetDonors"
                min="1" max="500" value={formData.targetDonors} onChange={handleChange} required />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Venue *</label>
            <input style={styles.input} type="text" name="venue"
              placeholder="e.g. Dhaka University TSC"
              value={formData.venue} onChange={handleChange} required />
          </div>

          <div style={styles.sectionTitle}>📍 Location</div>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Division *</label>
              <select style={styles.input} name="division"
                value={formData.division} onChange={handleChange} required>
                <option value="">Select division</option>
                {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>District *</label>
              <select style={styles.input} name="district"
                value={formData.district} onChange={handleChange}
                required disabled={!formData.division}>
                <option value="">Select district</option>
                {formData.division &&
                  districts[formData.division].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Area (optional)</label>
            <input style={styles.input} type="text" name="area"
              placeholder="e.g. Nilkhet, Shahbag"
              value={formData.area} onChange={handleChange} />
          </div>

          <div style={styles.sectionTitle}>📞 Contact</div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Contact Number *</label>
            <input style={styles.input} type="tel" name="contactNumber"
              placeholder="01XXXXXXXXX"
              value={formData.contactNumber} onChange={handleChange} required />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Description (optional)</label>
            <textarea
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              name="description"
              placeholder="Any additional info about the camp..."
              value={formData.description} onChange={handleChange}
            />
          </div>

          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Creating Camp...' : '🩸 Create Camp'}
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
  header: { textAlign: 'center', marginBottom: '32px' },
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
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1.5px solid #C6EBC5', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333',
  },
  submitBtn: {
    width: '100%', padding: '14px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold',
    cursor: 'pointer', marginTop: '24px',
  },
};

export default CreateCampPage;