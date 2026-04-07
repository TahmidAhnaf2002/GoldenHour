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

  const [userName, setUserName] = useState(user?.name || '');
  const [userBloodType, setUserBloodType] = useState(user?.bloodType || '');
  const [profileMsg, setProfileMsg] = useState('');

  const [donorEdit, setDonorEdit] = useState({
    weight: '', age: '', phone: '', division: '', district: '',
    area: '', lastDonationDate: '', medicalConditions: '',
  });
  const [donorMsg, setDonorMsg] = useState('');
  const [availMsg, setAvailMsg] = useState('');

  // Log donation form
  const [logForm, setLogForm] = useState({
    date: '', hospital: '', division: '', district: '',
  });
  const [logMsg, setLogMsg] = useState('');
  const [logLoading, setLogLoading] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);

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

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleToggleAvailability = async () => {
    try {
      const { data } = await axios.put(
        '/api/donors/availability',
        { isAvailable: !donorProfile.isAvailable },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setDonorProfile({ ...donorProfile, isAvailable: data.isAvailable });
      setAvailMsg(data.isAvailable ? '✅ You are now available' : '🔴 Set as unavailable');
      setTimeout(() => setAvailMsg(''), 3000);
    } catch { setAvailMsg('Failed to update availability'); }
  };

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
    } catch { setProfileMsg('❌ Failed to update profile'); }
  };

  const handleUpdateDonor = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        '/api/donors/update',
        {
          weight: Number(donorEdit.weight),
          age: Number(donorEdit.age),
          phone: donorEdit.phone,
          location: { division: donorEdit.division, district: donorEdit.district, area: donorEdit.area },
          lastDonationDate: donorEdit.lastDonationDate || null,
          medicalConditions: donorEdit.medicalConditions,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setDonorMsg('✅ Donor profile updated successfully!');
      fetchDonorProfile();
      setTimeout(() => setDonorMsg(''), 3000);
    } catch { setDonorMsg('❌ Failed to update donor profile'); }
  };

  const handleLogDonation = async (e) => {
    e.preventDefault();
    setLogLoading(true);
    setLogMsg('');
    try {
      const { data } = await axios.post(
        '/api/donors/log-donation',
        logForm,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setLogMsg('✅ Donation logged! Total: ' + data.totalDonations);
      setLogForm({ date: '', hospital: '', division: '', district: '' });
      setShowLogForm(false);
      fetchDonorProfile();
      setTimeout(() => setLogMsg(''), 4000);
    } catch (err) {
      setLogMsg('❌ ' + (err.response?.data?.message || 'Failed to log donation'));
    } finally {
      setLogLoading(false);
    }
  };

  // --- Badge logic ---
  const badges = [
    { id: 'first',    icon: '🩸', label: 'First Drop',     desc: 'Made your first donation',      required: 1  },
    { id: 'lifesaver',icon: '💪', label: 'Life Saver',      desc: 'Donated 5 times',               required: 5  },
    { id: 'hero',     icon: '🦸', label: 'Hero',            desc: 'Donated 10 times',              required: 10 },
    { id: 'champion', icon: '🏆', label: 'Champion',        desc: 'Donated 25 times',              required: 25 },
    { id: 'legend',   icon: '⭐', label: 'Legend',          desc: 'Donated 50 times',              required: 50 },
  ];

  const getEarnedBadges = (total) =>
    badges.filter((b) => total >= b.required);

  const getNextBadge = (total) =>
    badges.find((b) => total < b.required);

  // --- Streak logic ---
  const calcStreak = (history) => {
    if (!history || history.length === 0) return 0;
    const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = (new Date(sorted[i].date) - new Date(sorted[i + 1].date))
        / (1000 * 60 * 60 * 24);
      if (diff <= 180) streak++;
      else break;
    }
    return streak;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-BD', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          🏥 <span style={styles.navLogoText}>GoldenHour</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.homeBtn} onClick={() => navigate('/home')}>🏠 Home</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>👤 My Dashboard</h1>
          <p style={styles.pageSubtitle}>Manage your profile and donor information</p>
        </div>

        <div style={styles.tabs}>
          {['profile', 'donor', 'achievements'].map((tab) => (
            <button
              key={tab}
              style={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'profile' && '👤 My Profile'}
              {tab === 'donor' && '🩸 Donor Profile'}
              {tab === 'achievements' && '🏆 Achievements'}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
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
                <input style={styles.input} type="text" value={userName}
                  onChange={(e) => setUserName(e.target.value)} required />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <input style={{ ...styles.input, backgroundColor: '#f5f5f5', color: '#999' }}
                  type="email" value={user?.email} disabled />
                <small style={styles.hint}>Email cannot be changed</small>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Blood Type</label>
                <select style={styles.input} value={userBloodType}
                  onChange={(e) => setUserBloodType(e.target.value)}>
                  <option value="">Select blood type</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <button style={styles.saveBtn} type="submit">💾 Save Changes</button>
            </form>
          </div>
        )}

        {/* ── Donor Tab ── */}
        {activeTab === 'donor' && (
          <div>
            {donorLoading ? (
              <div style={styles.card}>
                <p style={{ textAlign: 'center', color: '#888' }}>Loading donor profile...</p>
              </div>
            ) : donorProfile ? (
              <div>
                <div style={styles.availCard}>
                  <div>
                    <h3 style={styles.availTitle}>Donation Availability</h3>
                    <p style={styles.availSubtitle}>
                      {donorProfile.isAvailable
                        ? 'You are currently visible to people searching for donors'
                        : 'You are currently hidden from donor search results'}
                    </p>
                    {availMsg && <p style={{ fontSize: '13px', color: '#27AE60', marginTop: '4px' }}>{availMsg}</p>}
                  </div>
                  <button
                    style={donorProfile.isAvailable ? styles.toggleBtnOn : styles.toggleBtnOff}
                    onClick={handleToggleAvailability}
                  >
                    {donorProfile.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                  </button>
                </div>

                <div style={styles.eligibilityCard}>
                  <div>
                    <h3 style={styles.availTitle}>Donation Eligibility</h3>
                    <p style={styles.availSubtitle}>
                      {donorProfile.isEligible
                        ? 'You are eligible to donate blood right now!'
                        : `You can donate again in ${donorProfile.daysUntilEligible} days`}
                    </p>
                  </div>
                  <div style={donorProfile.isEligible ? styles.eligibleBadge : styles.notEligibleBadge}>
                    {donorProfile.isEligible ? '✅ Eligible' : '⏳ Not Yet'}
                  </div>
                </div>

                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>Edit Donor Information</h2>
                  {donorMsg && (
                    <div style={donorMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                      {donorMsg}
                    </div>
                  )}
                  <form onSubmit={handleUpdateDonor}>
                    <div style={styles.row}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Age</label>
                        <input style={styles.input} type="number" value={donorEdit.age}
                          onChange={(e) => setDonorEdit({ ...donorEdit, age: e.target.value })}
                          min="18" max="65" required />
                      </div>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Weight (kg)</label>
                        <input style={styles.input} type="number" value={donorEdit.weight}
                          onChange={(e) => setDonorEdit({ ...donorEdit, weight: e.target.value })}
                          min="45" required />
                      </div>
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Phone Number</label>
                      <input style={styles.input} type="tel" value={donorEdit.phone}
                        onChange={(e) => setDonorEdit({ ...donorEdit, phone: e.target.value })} required />
                    </div>
                    <div style={styles.row}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Division</label>
                        <select style={styles.input} value={donorEdit.division}
                          onChange={(e) => setDonorEdit({ ...donorEdit, division: e.target.value })}>
                          {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>District</label>
                        <select style={styles.input} value={donorEdit.district}
                          onChange={(e) => setDonorEdit({ ...donorEdit, district: e.target.value })}>
                          {donorEdit.division && districts[donorEdit.division]?.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Area / Thana</label>
                      <input style={styles.input} type="text" value={donorEdit.area}
                        onChange={(e) => setDonorEdit({ ...donorEdit, area: e.target.value })}
                        placeholder="e.g. Mirpur, Dhanmondi" />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Last Donation Date</label>
                      <input style={styles.input} type="date" value={donorEdit.lastDonationDate}
                        onChange={(e) => setDonorEdit({ ...donorEdit, lastDonationDate: e.target.value })} />
                    </div>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Medical Conditions</label>
                      <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                        value={donorEdit.medicalConditions}
                        onChange={(e) => setDonorEdit({ ...donorEdit, medicalConditions: e.target.value })}
                        placeholder="e.g. none" />
                    </div>
                    <button style={styles.saveBtn} type="submit">💾 Save Donor Profile</button>
                  </form>
                </div>
              </div>
            ) : (
              <div style={styles.card}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <span style={{ fontSize: '48px' }}>🩸</span>
                  <h3 style={{ color: '#333', margin: '16px 0 8px' }}>Not registered as a donor yet</h3>
                  <p style={{ color: '#888', marginBottom: '20px' }}>Register as a blood donor to start saving lives</p>
                  <button style={styles.saveBtn} onClick={() => navigate('/donor/register')}>
                    Register as Donor
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Achievements Tab ── */}
        {activeTab === 'achievements' && (
          <div>
            {donorLoading ? (
              <div style={styles.card}>
                <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>
              </div>
            ) : !donorProfile ? (
              <div style={styles.card}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <span style={{ fontSize: '48px' }}>🏆</span>
                  <h3 style={{ color: '#333', margin: '16px 0 8px' }}>Register as a donor first</h3>
                  <p style={{ color: '#888', marginBottom: '20px' }}>Achievements are unlocked as you donate</p>
                  <button style={styles.saveBtn} onClick={() => navigate('/donor/register')}>
                    Register as Donor
                  </button>
                </div>
              </div>
            ) : (
              <div>

                {/* Stats row */}
                <div style={styles.statsRow}>
                  <div style={styles.statCard}>
                    <div style={styles.statNum}>{donorProfile.totalDonations || 0}</div>
                    <div style={styles.statLabel}>Total Donations</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statNum, color: '#27AE60' }}>
                      {calcStreak(donorProfile.donationHistory)}
                    </div>
                    <div style={styles.statLabel}>Current Streak</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={{ ...styles.statNum, color: '#E67E22' }}>
                      {getEarnedBadges(donorProfile.totalDonations || 0).length}
                    </div>
                    <div style={styles.statLabel}>Badges Earned</div>
                  </div>
                </div>

                {/* Eligibility countdown */}
                <div style={styles.countdownCard}>
                  <div style={styles.countdownLeft}>
                    <div style={styles.countdownTitle}>
                      {donorProfile.isEligible ? '✅ Ready to Donate!' : '⏳ Next Donation Countdown'}
                    </div>
                    <div style={styles.countdownSub}>
                      {donorProfile.isEligible
                        ? 'You are currently eligible to donate blood'
                        : `${donorProfile.daysUntilEligible} days until you can donate again`}
                    </div>
                  </div>
                  {!donorProfile.isEligible && (
                    <div style={styles.countdownBadge}>
                      {donorProfile.daysUntilEligible}d
                    </div>
                  )}
                </div>

                {/* Next badge progress */}
                {getNextBadge(donorProfile.totalDonations || 0) && (() => {
                  const next = getNextBadge(donorProfile.totalDonations || 0);
                  const total = donorProfile.totalDonations || 0;
                  const prev = badges[badges.indexOf(next) - 1];
                  const from = prev ? prev.required : 0;
                  const pct = Math.round(((total - from) / (next.required - from)) * 100);
                  return (
                    <div style={styles.nextBadgeCard}>
                      <div style={styles.nextBadgeTop}>
                        <span style={{ fontSize: '24px' }}>{next.icon}</span>
                        <div>
                          <div style={styles.nextBadgeTitle}>Next: {next.label}</div>
                          <div style={styles.nextBadgeSub}>{next.desc} ({total}/{next.required})</div>
                        </div>
                      </div>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: pct + '%' }} />
                      </div>
                      <div style={styles.progressLabel}>{pct}% there</div>
                    </div>
                  );
                })()}

                {/* Badges */}
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>🏅 Badges</h2>
                  <div style={styles.badgesGrid}>
                    {badges.map((badge) => {
                      const earned = (donorProfile.totalDonations || 0) >= badge.required;
                      return (
                        <div key={badge.id} style={earned ? styles.badgeEarned : styles.badgeLocked}>
                          <div style={styles.badgeIcon}>{earned ? badge.icon : '🔒'}</div>
                          <div style={styles.badgeName}>{badge.label}</div>
                          <div style={styles.badgeDesc}>{badge.desc}</div>
                          {!earned && (
                            <div style={styles.badgeRequires}>
                              {badge.required} donations needed
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Log donation */}
                <div style={styles.card}>
                  <div style={styles.logHeader}>
                    <h2 style={styles.cardTitle}>📋 Donation History</h2>
                    <button
                      style={styles.logBtn}
                      onClick={() => setShowLogForm(!showLogForm)}
                    >
                      {showLogForm ? 'Cancel' : '+ Log Donation'}
                    </button>
                  </div>

                  {logMsg && (
                    <div style={logMsg.includes('✅') ? styles.successMsg : styles.errorMsg}>
                      {logMsg}
                    </div>
                  )}

                  {showLogForm && (
                    <form onSubmit={handleLogDonation} style={styles.logForm}>
                      <div style={styles.row}>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>Donation Date *</label>
                          <input style={styles.input} type="date" value={logForm.date}
                            onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                            required />
                        </div>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>Hospital (optional)</label>
                          <input style={styles.input} type="text" value={logForm.hospital}
                            placeholder="e.g. DMCH"
                            onChange={(e) => setLogForm({ ...logForm, hospital: e.target.value })} />
                        </div>
                      </div>
                      <div style={styles.row}>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>Division</label>
                          <select style={styles.input} value={logForm.division}
                            onChange={(e) => setLogForm({ ...logForm, division: e.target.value })}>
                            <option value="">Select division</option>
                            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div style={styles.fieldGroup}>
                          <label style={styles.label}>District</label>
                          <select style={styles.input} value={logForm.district}
                            onChange={(e) => setLogForm({ ...logForm, district: e.target.value })}
                            disabled={!logForm.division}>
                            <option value="">Select district</option>
                            {logForm.division && districts[logForm.division]?.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button style={styles.saveBtn} type="submit" disabled={logLoading}>
                        {logLoading ? 'Saving...' : '💾 Save Donation'}
                      </button>
                    </form>
                  )}

                  {/* History list */}
                  {(!donorProfile.donationHistory || donorProfile.donationHistory.length === 0) ? (
                    <div style={styles.emptyHistory}>
                      <span style={{ fontSize: '32px' }}>📋</span>
                      <p style={{ color: '#aaa', marginTop: '8px', fontSize: '13px' }}>
                        No donations logged yet. Log your first donation above!
                      </p>
                    </div>
                  ) : (
                    <div style={styles.historyList}>
                      {[...donorProfile.donationHistory]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((entry, i) => (
                          <div key={i} style={styles.historyRow}>
                            <div style={styles.historyDot} />
                            <div style={styles.historyContent}>
                              <div style={styles.historyDate}>{formatDate(entry.date)}</div>
                              <div style={styles.historyMeta}>
                                {entry.hospital && `🏥 ${entry.hospital}`}
                                {entry.location?.district && ` · 📍 ${entry.location.district}, ${entry.location.division}`}
                              </div>
                            </div>
                            <div style={styles.historyBadge}>#{donorProfile.donationHistory.length - i}</div>
                          </div>
                        ))}
                    </div>
                  )}
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
  wrapper: { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar: {
    backgroundColor: '#FA7070', padding: '14px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText: { fontWeight: 'bold', color: '#fff' },
  navRight: { display: 'flex', gap: '12px' },
  homeBtn: {
    backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff',
    borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  logoutBtn: {
    backgroundColor: '#fff', color: '#FA7070', border: 'none',
    borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  container: { maxWidth: '750px', margin: '0 auto', padding: '40px 20px' },
  pageHeader: { textAlign: 'center', marginBottom: '32px' },
  pageTitle: { fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  pageSubtitle: { fontSize: '14px', color: '#888' },
  tabs: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: {
    padding: '10px 24px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  tabActive: {
    padding: '10px 24px', borderRadius: '8px', border: '1.5px solid #FA7070',
    backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  card: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5', marginBottom: '20px',
  },
  cardTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '20px' },
  availCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '24px 32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5', marginBottom: '20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  eligibilityCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '24px 32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5', marginBottom: '20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  availTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  availSubtitle: { fontSize: '13px', color: '#888' },
  toggleBtnOn: {
    backgroundColor: '#C6EBC5', color: '#27AE60', border: 'none', borderRadius: '20px',
    padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap',
  },
  toggleBtnOff: {
    backgroundColor: '#fdecea', color: '#c0392b', border: 'none', borderRadius: '20px',
    padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap',
  },
  eligibleBadge: {
    backgroundColor: '#C6EBC5', color: '#27AE60', borderRadius: '20px',
    padding: '8px 20px', fontWeight: 'bold', fontSize: '14px',
  },
  notEligibleBadge: {
    backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '20px',
    padding: '8px 20px', fontWeight: 'bold', fontSize: '14px',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333',
  },
  hint: { fontSize: '11px', color: '#aaa', marginTop: '4px', display: 'block' },
  saveBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '12px 28px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px',
  },
  successMsg: {
    backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  errorMsg: {
    backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px',
    borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
  },
  // Achievements styles
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' },
  statCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '20px',
    textAlign: 'center', border: '1px solid #C6EBC5',
  },
  statNum: { fontSize: '28px', fontWeight: 'bold', color: '#FA7070' },
  statLabel: { fontSize: '12px', color: '#aaa', marginTop: '4px' },
  countdownCard: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '24px 32px',
    border: '1px solid #C6EBC5', marginBottom: '20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  countdownLeft: {},
  countdownTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  countdownSub: { fontSize: '13px', color: '#888' },
  countdownBadge: {
    backgroundColor: '#FA7070', color: '#fff', borderRadius: '50%',
    width: '60px', height: '60px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 'bold', fontSize: '16px',
  },
  nextBadgeCard: {
    backgroundColor: '#FEFDEC', borderRadius: '16px', padding: '20px 24px',
    border: '1px solid #C6EBC5', marginBottom: '20px',
  },
  nextBadgeTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  nextBadgeTitle: { fontSize: '15px', fontWeight: 'bold', color: '#333' },
  nextBadgeSub: { fontSize: '12px', color: '#888' },
  progressBar: {
    height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px',
    overflow: 'hidden', marginBottom: '4px',
  },
  progressFill: { height: '100%', backgroundColor: '#FA7070', borderRadius: '4px' },
  progressLabel: { fontSize: '12px', color: '#aaa' },
  badgesGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px',
  },
  badgeEarned: {
    backgroundColor: '#FEFDEC', border: '2px solid #FA7070', borderRadius: '12px',
    padding: '16px', textAlign: 'center',
  },
  badgeLocked: {
    backgroundColor: '#f9f9f9', border: '1.5px solid #e0e0e0', borderRadius: '12px',
    padding: '16px', textAlign: 'center', opacity: '0.6',
  },
  badgeIcon: { fontSize: '28px', marginBottom: '6px' },
  badgeName: { fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  badgeDesc: { fontSize: '11px', color: '#888' },
  badgeRequires: { fontSize: '10px', color: '#aaa', marginTop: '4px' },
  logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  logBtn: {
    backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px',
  },
  logForm: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', borderRadius: '12px',
    padding: '20px', marginBottom: '20px',
  },
  emptyHistory: { textAlign: 'center', padding: '30px', color: '#aaa' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '0' },
  historyRow: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 0', borderBottom: '1px solid #f0f0f0',
  },
  historyDot: {
    width: '10px', height: '10px', borderRadius: '50%',
    backgroundColor: '#FA7070', flexShrink: 0,
  },
  historyContent: { flex: 1 },
  historyDate: { fontSize: '14px', fontWeight: '600', color: '#333' },
  historyMeta: { fontSize: '12px', color: '#aaa', marginTop: '2px' },
  historyBadge: {
    backgroundColor: '#FEFDEC', border: '1px solid #C6EBC5', color: '#FA7070',
    borderRadius: '12px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold',
  },
};

export default DashboardPage;