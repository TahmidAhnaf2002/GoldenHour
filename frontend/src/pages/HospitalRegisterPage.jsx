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

const commonSpecialties = [
  'Cardiology', 'Neurology', 'Oncology', 'Orthopedics',
  'Pediatrics', 'Gynecology', 'Nephrology', 'Pulmonology',
  'Gastroenterology', 'Urology', 'Ophthalmology', 'ENT',
  'Psychiatry', 'Dermatology', 'Burns Unit', 'Trauma',
];

const HospitalRegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', hospitalType: 'Government', address: '',
    division: '', district: '', area: '',
    contactNumber: '', emergencyNumber: '',
  });
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleSpecialty = (s) => {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(
        '/api/hospitals/register',
        {
          name: form.name,
          hospitalType: form.hospitalType,
          address: form.address,
          location: { division: form.division, district: form.district, area: form.area },
          contactNumber: form.contactNumber,
          emergencyNumber: form.emergencyNumber,
          specialties: selectedSpecialties,
        },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setSuccess(true);
      setTimeout(() => navigate('/hospitals/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.successBox}>
          <span style={{ fontSize: '50px' }}>🏥</span>
          <h2 style={{ color: '#FA7070', margin: '16px 0 8px' }}>Hospital Registered!</h2>
          <p style={{ color: '#666' }}>You can now update your capacity data from the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <button style={styles.backBtn} onClick={() => navigate('/hospitals')}>← Back</button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '36px' }}>🏥</span>
          <h1 style={styles.title}>Register Your Hospital</h1>
          <p style={styles.subtitle}>
            Add your hospital to the network and update capacity data in real-time
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.sectionTitle}>🏥 Hospital Details</div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Hospital Name *</label>
            <input style={styles.input} type="text" name="name"
              placeholder="e.g. Dhaka Medical College Hospital"
              value={form.name} onChange={handleChange} required />
          </div>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Hospital Type *</label>
              <select style={styles.input} name="hospitalType"
                value={form.hospitalType} onChange={handleChange}>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Clinic">Clinic</option>
                <option value="Specialized">Specialized</option>
                <option value="NGO">NGO</option>
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Contact Number *</label>
              <input style={styles.input} type="tel" name="contactNumber"
                placeholder="01XXXXXXXXX"
                value={form.contactNumber} onChange={handleChange} required />
            </div>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Emergency Number (optional)</label>
            <input style={styles.input} type="tel" name="emergencyNumber"
              placeholder="Emergency hotline if different"
              value={form.emergencyNumber} onChange={handleChange} />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Address *</label>
            <input style={styles.input} type="text" name="address"
              placeholder="Street address"
              value={form.address} onChange={handleChange} required />
          </div>

          <div style={styles.sectionTitle}>📍 Location</div>
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

          <div style={styles.sectionTitle}>🩺 Specialties (select all that apply)</div>
          <div style={styles.specialtiesGrid}>
            {commonSpecialties.map((s) => (
              <button
                key={s} type="button"
                style={selectedSpecialties.includes(s) ? styles.specActive : styles.specBtn}
                onClick={() => toggleSpecialty(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Registering...' : '🏥 Register Hospital'}
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
  container: { maxWidth: '700px', margin: '0 auto', padding: '40px 20px' },
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
  specialtiesGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' },
  specBtn: {
    padding: '6px 14px', backgroundColor: '#fff', border: '1.5px solid #C6EBC5',
    borderRadius: '20px', fontSize: '12px', color: '#555', cursor: 'pointer',
  },
  specActive: {
    padding: '6px 14px', backgroundColor: '#FA7070', border: '1.5px solid #FA7070',
    borderRadius: '20px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontWeight: 'bold',
  },
  submitBtn: {
    width: '100%', padding: '14px', backgroundColor: '#FA7070', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold',
    cursor: 'pointer', marginTop: '24px',
  },
};

export default HospitalRegisterPage;