import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodType: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        bloodType: formData.bloodType,
      });
      login(data);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoBox}>
          <span style={styles.logoIcon}>🏥</span>
          <h1 style={styles.logoText}>GoldenHour</h1>
          <p style={styles.tagline}>Every second counts</p>
        </div>

        <h2 style={styles.heading}>Create Account</h2>
        <p style={styles.subheading}>Join the emergency network today</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Blood Type</label>
            <select
              style={styles.input}
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
            >
              <option value="">Select blood type (optional)</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={styles.bottomText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#FEFDEC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    border: '1px solid #C6EBC5',
  },
  logoBox: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoIcon: {
    fontSize: '40px',
  },
  logoText: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#FA7070',
    margin: '4px 0',
  },
  tagline: {
    fontSize: '12px',
    color: '#A1C398',
    margin: 0,
  },
  heading: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '4px',
    textAlign: 'center',
  },
  subheading: {
    fontSize: '13px',
    color: '#888',
    textAlign: 'center',
    marginBottom: '24px',
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
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#FA7070',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
  },
  bottomText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888',
    marginTop: '20px',
  },
  link: {
    color: '#FA7070',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
};

export default RegisterPage;