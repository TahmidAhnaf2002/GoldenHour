import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [donorProfile, setDonorProfile] = useState(null);
  const [donorLoading, setDonorLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Edit user profile
  const [userName, setUserName] = useState(user?.name || '');
  const [userBloodType, setUserBloodType] = useState(user?.bloodType || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Edit donor profile
  const [donorEdit, setDonorEdit] = useState({
    weight: '',
    age: '',
    phone: '',
    division: '',
    district: '',
    area: '',
    lastDonationDate: '',
    medicalConditions: '',
  });
  const [donorMsg, setDonorMsg] = useState('');
  const [availMsg, setAvailMsg] = useState('');

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

  useEffect(() => {
    fetchDonorProfile();
  }, []);

  const fetchDonorProfile = async () => {
    try {
      const { data } = await axios.get('/api/donors/me', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDonorProfile(data);
      setDonorEdit({
        weight: data.weight,
        age: data.age,
        phone: data.phone,
        division: data.location.division,
        district: data.location.district,
        area: data.location.area || '',
        lastDonationDate: data.lastDonationDate
          ? new Date(data.lastDonationDate).toISOString().split('T')[0]
          : '',
        medicalConditions: data.medicalConditions || '',
      });
    } catch (err) {
      setDonorProfile(null);
    } finally {
      setDonorLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle availability
  const handleToggleAvailability = async () => {
    try {
      const { data } = await axios.put(
        '/api/donors/availability',
        { isAvailable: !donorProfile.isAvailable },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setDonorProfile({ ...donorProfile, isAvailable: data.isAvailable });
      setAvailMsg(
        data.isAvailable
          ? '✅ You are now available for donation'
          : '🔴 You are now set as unavailable'
      );
      setTimeout(() => setAvailMsg(''), 3000);
    } catch (err) {
      setAvailMsg('Failed to update availability');
    }
  };

  // Update user profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        '/api/auth/profile',
        { name: userName, bloodType: userBloodType },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      login({ ...user, name: data.name, bloodType: data.bloodType });
      setProfileMsg('✅ Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg('❌ Failed to update profile');
    }
  };

  // Update donor profile
  const handleUpdateDonor = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        '/api/donors/update',
        {
          weight: Number(donorEdit.weight),
          age: Number(donorEdit.age),
          phone: donorEdit.phone,
          location: {
            division: donorEdit.division,
            district: donorEdit.district,
            area: donorEdit.area,
          },
          lastDonationDate: donorEdit.lastDonationDate || null,
          medicalConditions: donorEdit.medicalConditions,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setDonorMsg('✅ Donor profile updated successfully!');
      fetchDonorProfile();
      setTimeout(() => setDonorMsg(''), 3000);
    } catch (err) {
      setDonorMsg('❌ Failed to update donor profile');
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.homeBtn} onClick={() => navigate('/home')}>
            🏠 Home
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>👤 My Dashboard</h1>
          <p style={styles.pageSubtitle}>
            Manage your profile and donor information
          </p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={activeTab === 'profile' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('profile')}
          >
            👤 My Profile
          </button>
          <button
            style={activeTab === 'donor' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('donor')}
          >
            🩸 Donor Profile
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Edit Account Information</h2>
            {profileMsg && (
              <div style={profileMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                {profileMsg}
              </div>
            )}
            <form onSubmit={handleUpdateProfile}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  style={{ ...styles.input, backgroundColor: '#f5f5f5', color: '#999' }}
                  type="email"
                  value={user?.email}
                  disabled
                />
                <small style={styles.hint}>Email cannot be changed</small>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Blood Type</label>
                <select
                  style={styles.input}
                  value={userBloodType}
                  onChange={(e) => setUserBloodType(e.target.value)}
                >
                  <option value="">Select blood type</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <button style={styles.saveBtn} type="submit">
                💾 Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Donor Tab */}
        {activeTab === 'donor' && (
          <div>
            {donorLoading ? (
              <div style={styles.card}>
                <p style={{ textAlign: 'center', color: '#888' }}>
                  Loading donor profile...
                </p>
              </div>
            ) : donorProfile ? (
              <div>
                {/* Availability Toggle Card */}
                <div style={styles.availCard}>
                  <div>
                    <h3 style={styles.availTitle}>Donation Availability</h3>
                    <p style={styles.availSubtitle}>
                      {donorProfile.isAvailable
                        ? 'You are currently visible to people searching for donors'
                        : 'You are currently hidden from donor search results'}
                    </p>
                    {availMsg && (
                      <p style={{ fontSize: '13px', color: '#27AE60', marginTop: '4px' }}>
                        {availMsg}
                      </p>
                    )}
                  </div>
                  <button
                    style={
                      donorProfile.isAvailable
                        ? styles.toggleBtnOn
                        : styles.toggleBtnOff
                    }
                    onClick={handleToggleAvailability}
                  >
                    {donorProfile.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                  </button>
                </div>

                {/* Eligibility Card */}
                <div style={styles.eligibilityCard}>
                  <div style={styles.eligibilityLeft}>
                    <h3 style={styles.availTitle}>Donation Eligibility</h3>
                    <p style={styles.availSubtitle}>
                      {donorProfile.isEligible
                        ? 'You are eligible to donate blood right now!'
                        : `You can donate again in ${donorProfile.daysUntilEligible} days`}
                    </p>
                  </div>
                  <div
                    style={
                      donorProfile.isEligible
                        ? styles.eligibleBadge
                        : styles.notEligibleBadge
                    }
                  >
                    {donorProfile.isEligible ? '✅ Eligible' : '⏳ Not Yet'}
                  </div>
                </div>

                {/* Edit Donor Profile */}
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>Edit Donor Information</h2>
                  {donorMsg && (
                    <div
                      style={
                        donorMsg.includes('✅') ? styles.successMsg : styles.errorMsg
                      }
                    >
                      {donorMsg}
                    </div>
                  )}
                  <form onSubmit={handleUpdateDonor}>
                    <div style={styles.row}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Age</label>
                        <input
                          style={styles.input}
                          type="number"
                          value={donorEdit.age}
                          onChange={(e) =>
                            setDonorEdit({ ...donorEdit, age: e.target.value })
                          }
                          min="18"
                          max="65"
                          required
                        />
                      </div>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Weight (kg)</label>
                        <input
                          style={styles.input}
                          type="number"
                          value={donorEdit.weight}
                          onChange={(e) =>
                            setDonorEdit({ ...donorEdit, weight: e.target.value })
                          }
                          min="45"
                          required
                        />
                      </div>
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Phone Number</label>
                      <input
                        style={styles.input}
                        type="tel"
                        value={donorEdit.phone}
                        onChange={(e) =>
                          setDonorEdit({ ...donorEdit, phone: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div style={styles.row}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Division</label>
                        <select
                          style={styles.input}
                          value={donorEdit.division}
                          onChange={(e) =>
                            setDonorEdit({ ...donorEdit, division: e.target.value })
                          }
                        >
                          {divisions.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>District</label>
                        <select
                          style={styles.input}
                          value={donorEdit.district}
                          onChange={(e) =>
                            setDonorEdit({ ...donorEdit, district: e.target.value })
                          }
                        >
                          {donorEdit.division &&
                            districts[donorEdit.division]?.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Area / Thana</label>
                      <input
                        style={styles.input}
                        type="text"
                        value={donorEdit.area}
                        onChange={(e) =>
                          setDonorEdit({ ...donorEdit, area: e.target.value })
                        }
                        placeholder="e.g. Mirpur, Dhanmondi"
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Last Donation Date</label>
                      <input
                        style={styles.input}
                        type="date"
                        value={donorEdit.lastDonationDate}
                        onChange={(e) =>
                          setDonorEdit({
                            ...donorEdit,
                            lastDonationDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Medical Conditions</label>
                      <textarea
                        style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                        value={donorEdit.medicalConditions}
                        onChange={(e) =>
                          setDonorEdit({
                            ...donorEdit,
                            medicalConditions: e.target.value,
                          })
                        }
                        placeholder="e.g. none"
                      />
                    </div>

                    <button style={styles.saveBtn} type="submit">
                      💾 Save Donor Profile
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div style={styles.card}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <span style={{ fontSize: '48px' }}>🩸</span>
                  <h3 style={{ color: '#333', margin: '16px 0 8px' }}>
                    Not registered as a donor yet
                  </h3>
                  <p style={{ color: '#888', marginBottom: '20px' }}>
                    Register as a blood donor to start saving lives
                  </p>
                  <button
                    style={styles.saveBtn}
                    onClick={() => navigate('/donor/register')}
                  >
                    Register as Donor
                  </button>
                </div>
              </div>
            )}
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
  navRight: {
    display: 'flex',
    gap: '12px',
  },
  homeBtn: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1.5px solid #fff',
    borderRadius: '8px',
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
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
  container: {
    maxWidth: '750px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  pageHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '6px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#888',
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  tab: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: '1.5px solid #C6EBC5',
    backgroundColor: '#fff',
    color: '#888',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
  },
  tabActive: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: '1.5px solid #FA7070',
    backgroundColor: '#FA7070',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #C6EBC5',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  },
  availCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px 32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #C6EBC5',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eligibilityCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px 32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #C6EBC5',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eligibilityLeft: {},
  availTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '4px',
  },
  availSubtitle: {
    fontSize: '13px',
    color: '#888',
  },
  toggleBtnOn: {
    backgroundColor: '#C6EBC5',
    color: '#27AE60',
    border: 'none',
    borderRadius: '20px',
    padding: '10px 24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  toggleBtnOff: {
    backgroundColor: '#fdecea',
    color: '#c0392b',
    border: 'none',
    borderRadius: '20px',
    padding: '10px 24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  eligibleBadge: {
    backgroundColor: '#C6EBC5',
    color: '#27AE60',
    borderRadius: '20px',
    padding: '8px 20px',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  notEligibleBadge: {
    backgroundColor: '#fdecea',
    color: '#c0392b',
    borderRadius: '20px',
    padding: '8px 20px',
    fontWeight: 'bold',
    fontSize: '14px',
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
    color: '#aaa',
    marginTop: '4px',
    display: 'block',
  },
  saveBtn: {
    backgroundColor: '#FA7070',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 28px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
  },
  successMsg: {
    backgroundColor: '#C6EBC5',
    color: '#27AE60',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },
};

export default DashboardPage;