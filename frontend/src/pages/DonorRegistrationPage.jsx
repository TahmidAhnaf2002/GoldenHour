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
  Chittagong: ['Chittagong', 'Cox\'s Bazar', 'Comilla', 'Noakhali', 'Feni', 'Brahmanbaria'],
  Rajshahi: ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Natore', 'Chapainawabganj'],
  Khulna: ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Narail', 'Magura'],
  Barisal: ['Barisal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrokona'],
};

const DonorRegistrationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    bloodType: '',
    rhFactor: '',
    weight: '',
    age: '',
    phone: '',
    division: '',
    district: '',
    area: '',
    lastDonationDate: '',
    medicalConditions: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.weight < 45) {
      return setError('Minimum weight to donate blood is 45kg');
    }
    if (formData.age < 18 || formData.age > 65) {
      return setError('Age must be between 18 and 65 to donate blood');
    }

    setLoading(true);
    try {
      await axios.post(
        '/api/donors/register',
        {
          bloodType: formData.bloodType,
          rhFactor: formData.rhFactor,
          weight: Number(formData.weight),
          age: Number(formData.age),
          phone: formData.phone,
          location: {
            division: formData.division,
            district: formData.district,
            area: formData.area,
          },
          lastDonationDate: formData.lastDonationDate || null,
          medicalConditions: formData.medicalConditions,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setSuccess(true);
      setTimeout(() => navigate('/home'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.successBox}>
          <span style={{ fontSize: '50px' }}>🎉</span>
          <h2 style={{ color: '#27AE60', margin: '16px 0 8px' }}>
            Registered as Donor!
          </h2>
          <p style={{ color: '#666' }}>
            Thank you for joining the GoldenHour donor network.
          </p>
          <p style={{ color: '#aaa', fontSize: '13px', marginTop: '8px' }}>
            Redirecting to home...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <button style={styles.backBtn} onClick={() => navigate('/home')}>
          ← Back to Home
        </button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '36px' }}>🩸</span>
          <h1 style={styles.title}>Register as Blood Donor</h1>
          <p style={styles.subtitle}>
            Fill in your health details to join the donor network
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Blood Info */}
          <div style={styles.sectionTitle}>🔴 Blood Information</div>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Blood Type *</label>
              <select
                style={styles.input}
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                required
              >
                <option value="">Select blood type</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-',
                  'A1+','A1-','A2+','A2-','Bombay O'].map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Rh Factor *</label>
              <select
                style={styles.input}
                name="rhFactor"
                value={formData.rhFactor}
                onChange={handleChange}
                required
              >
                <option value="">Select Rh factor</option>
                <option value="Positive">Positive (+)</option>
                <option value="Negative">Negative (-)</option>
              </select>
            </div>
          </div>

          {/* Personal Info */}
          <div style={styles.sectionTitle}>👤 Personal Information</div>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Age * (18-65)</label>
              <input
                style={styles.input}
                type="number"
                name="age"
                placeholder="Your age"
                value={formData.age}
                onChange={handleChange}
                min="18"
                max="65"
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Weight * (min 45kg)</label>
              <input
                style={styles.input}
                type="number"
                name="weight"
                placeholder="Weight in kg"
                value={formData.weight}
                onChange={handleChange}
                min="45"
                required
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              style={styles.input}
              type="tel"
              name="phone"
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location */}
          <div style={styles.sectionTitle}>📍 Location</div>
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Division *</label>
              <select
                style={styles.input}
                name="division"
                value={formData.division}
                onChange={handleChange}
                required
              >
                <option value="">Select division</option>
                {divisions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>District *</label>
              <select
                style={styles.input}
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                disabled={!formData.division}
              >
                <option value="">Select district</option>
                {formData.division &&
                  districts[formData.division].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
              </select>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Area / Thana (optional)</label>
            <input
              style={styles.input}
              type="text"
              name="area"
              placeholder="e.g. Mirpur, Dhanmondi"
              value={formData.area}
              onChange={handleChange}
            />
          </div>

          {/* Donation History */}
          <div style={styles.sectionTitle}>📅 Donation History</div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Last Donation Date (if any)</label>
            <input
              style={styles.input}
              type="date"
              name="lastDonationDate"
              value={formData.lastDonationDate}
              onChange={handleChange}
            />
            <small style={styles.hint}>
              ℹ️ System will automatically check your 3-month eligibility
            </small>
          </div>

          {/* Medical */}
          <div style={styles.sectionTitle}>🏥 Medical Information</div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Any Medical Conditions (optional)</label>
            <textarea
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              name="medicalConditions"
              placeholder="e.g. diabetes, hypertension, none"
              value={formData.medicalConditions}
              onChange={handleChange}
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Registering...' : '🩸 Register as Donor'}
          </button>
        </form>
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
    maxWidth: '680px',
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
  errorBox: {
    backgroundColor: '#fdecea',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
    border: '1px solid #f5c6cb',
  },
  successBox: {
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '60px 40px',
    maxWidth: '400px',
    margin: '100px auto',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #C6EBC5',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#FA7070',
    marginBottom: '12px',
    marginTop: '20px',
    paddingBottom: '6px',
    borderBottom: '1px solid #f0f0f0',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  fieldGroup: {
    marginBottom: '16px',
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
  hint: {
    fontSize: '11px',
    color: '#A1C398',
    marginTop: '4px',
    display: 'block',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#FA7070',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '24px',
  },
};

export default DonorRegistrationPage;