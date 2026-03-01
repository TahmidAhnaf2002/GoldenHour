import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          <span>🏥</span>
          <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.welcomeText}>👋 Hello, {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Welcome to <span style={styles.highlight}>GoldenHour</span>
        </h1>
        <p style={styles.heroSub}>
          A Community-Powered Emergency Medical Resource Network
        </p>
        {user?.bloodType && (
          <div style={styles.bloodBadge}>
            🩸 Your Blood Type: <strong>{user.bloodType}</strong>
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div style={styles.grid}>
        {features.map((f, i) => (
          <div key={i} style={styles.card}>
            <span style={styles.cardIcon}>{f.icon}</span>
            <h3 style={styles.cardTitle}>{f.title}</h3>
            <p style={styles.cardDesc}>{f.desc}</p>
            <button style={styles.cardBtn}>Coming Soon</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const features = [
  {
    icon: '🩸',
    title: 'Blood Donation Network',
    desc: 'Connect with blood donors and find compatible blood types nearby in emergencies.',
  },
  {
    icon: '💊',
    title: 'Rare Medicine Finder',
    desc: 'Locate hard-to-find medicines and antivenom across hospitals and pharmacies.',
  },
  {
    icon: '🏨',
    title: 'Hospital Resource Tracker',
    desc: 'Check real-time availability of beds, ICU, oxygen and critical equipment.',
  },
  {
    icon: '🚑',
    title: 'First Responder Network',
    desc: 'Connect trained volunteers with people in immediate medical emergencies.',
  },
];

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
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '20px',
  },
  navLogoText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '20px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  welcomeText: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#fff',
    color: '#FA7070',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
  },
  hero: {
    textAlign: 'center',
    padding: '60px 20px 40px',
  },
  heroTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  highlight: {
    color: '#FA7070',
  },
  heroSub: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  bloodBadge: {
    display: 'inline-block',
    backgroundColor: '#fff',
    border: '1.5px solid #FA7070',
    borderRadius: '20px',
    padding: '6px 18px',
    fontSize: '14px',
    color: '#FA7070',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    padding: '20px 40px 60px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '28px 20px',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #C6EBC5',
  },
  cardIcon: {
    fontSize: '36px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#333',
    margin: '12px 0 8px',
  },
  cardDesc: {
    fontSize: '12px',
    color: '#888',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  cardBtn: {
    backgroundColor: '#C6EBC5',
    color: '#3a7a38',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default HomePage;