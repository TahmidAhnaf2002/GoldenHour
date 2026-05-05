import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];
const districts = {
  Dhaka:      ['Dhaka','Gazipur','Narayanganj','Manikganj','Munshiganj','Narsingdi','Tangail'],
  Chittagong: ['Chittagong',"Cox's Bazar",'Comilla','Noakhali','Feni','Brahmanbaria'],
  Rajshahi:   ['Rajshahi','Bogura','Pabna','Sirajganj','Natore','Chapainawabganj'],
  Khulna:     ['Khulna','Jessore','Satkhira','Bagerhat','Narail','Magura'],
  Barisal:    ['Barisal','Bhola','Patuakhali','Pirojpur','Jhalokati','Barguna'],
  Sylhet:     ['Sylhet','Moulvibazar','Habiganj','Sunamganj'],
  Rangpur:    ['Rangpur','Dinajpur','Gaibandha','Kurigram','Lalmonirhat','Nilphamari'],
  Mymensingh: ['Mymensingh','Jamalpur','Sherpur','Netrokona'],
};

const allOrgans = [
  'Heart','Kidneys','Liver','Lungs','Pancreas',
  'Intestines','Corneas','Skin','Bone Marrow',
  'Heart Valves','Blood Vessels',
];

const organIcons = {
  Heart: '❤️', Kidneys: '🫘', Liver: '🫀', Lungs: '🫁',
  Pancreas: '🧬', Intestines: '🔬', Corneas: '👁️',
  Skin: '🩹', 'Bone Marrow': '🦴', 'Heart Valves': '💗', 'Blood Vessels': '🩸',
};

const educationContent = [
  {
    icon: '❓',
    title: 'Why donate organs?',
    content: 'One organ donor can save up to 8 lives and improve the lives of up to 75 people through tissue donation. In Bangladesh, thousands wait for life-saving transplants each year.',
  },
  {
    icon: '🩺',
    title: 'How does it work?',
    content: 'When a registered donor passes away, medical teams check the registry. Family consent is essential. Organs are matched to recipients based on blood type, tissue compatibility, and medical urgency.',
  },
  {
    icon: '🕌',
    title: 'Religious perspective',
    content: 'Most Islamic scholars in Bangladesh support organ donation as an act of saving lives. Consult your religious advisor for personal guidance.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Family consent matters',
    content: 'Even with a registered pledge, doctors will consult your family. Talk to your family about your decision so they can honor your wishes.',
  },
  {
    icon: '🔒',
    title: 'Your privacy',
    content: 'Your donor information is only shared with verified transplant hospitals when medically necessary. Your data is never sold or shared publicly.',
  },
  {
    icon: '🔄',
    title: 'Can I change my mind?',
    content: 'Yes  you can update your organ choices or revoke your pledge at any time from your dashboard. There is no penalty for changing your decision.',
  },
];

const OrganDonorPage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const cardRef   = useRef();

  const [view, setView]         = useState('info');
  const [donor, setDonor]       = useState(null);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevoke, setShowRevoke]     = useState(false);

  // Registration form
  const [form, setForm] = useState({
    name: user?.name || '', dateOfBirth: '', bloodType: '',
    phone: '', address: '',
    location: { division: '', district: '' },
    organs: [],
    familyConsent: { given: false, contactName: '', contactPhone: '', docName: '' },
    emergencyContact: { name: '', phone: '', relation: '' },
  });
  const [postLoading, setPostLoading] = useState(false);

  // Edit form
  const [editOrgans, setEditOrgans] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [showEdit, setShowEdit]       = useState(false);

  const authHeader = user ? { headers: { Authorization: 'Bearer ' + user.token } } : {};

  useEffect(() => {
    fetchStats();
    if (user) fetchMyProfile();
  }, []);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/organ-donors/stats');
      setStats(data);
    } catch { /* silent */ }
  };

  const fetchMyProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/organ-donors/me', authHeader);
      setDonor(data);
      setEditOrgans(data.organs || []);
    } catch { setDonor(null); }
    finally  { setLoading(false); }
  };

  const toggleOrgan = (organ, target) => {
    if (target === 'form') {
      setForm((prev) => ({
        ...prev,
        organs: prev.organs.includes(organ)
          ? prev.organs.filter((o) => o !== organ)
          : [...prev.organs, organ],
      }));
    } else {
      setEditOrgans((prev) =>
        prev.includes(organ) ? prev.filter((o) => o !== organ) : [...prev, organ]
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.organs.length)        { showMsg('❌ Select at least one organ'); return; }
    if (!form.location.division)    { showMsg('❌ Select division'); return; }
    if (!form.location.district)    { showMsg('❌ Select district'); return; }
    if (!form.dateOfBirth)          { showMsg('❌ Enter date of birth'); return; }
    if (!form.phone.trim())         { showMsg('❌ Enter phone number'); return; }

    setPostLoading(true);
    setMsg('');
    try {
      const { data } = await axios.post('/api/organ-donors/register', form, authHeader);
      setDonor(data);
      showMsg('✅ Registered as organ donor!');
      setView('card');
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setPostLoading(false);
    }
  };

  const handleUpdateOrgans = async () => {
    if (!editOrgans.length) { showMsg('❌ Select at least one organ'); return; }
    setEditLoading(true);
    try {
      await axios.put('/api/organ-donors/update', { organs: editOrgans }, authHeader);
      showMsg('✅ Organs updated');
      setShowEdit(false);
      fetchMyProfile();
    } catch { showMsg('❌ Failed'); }
    finally  { setEditLoading(false); }
  };

  const handleRevoke = async () => {
    try {
      await axios.put('/api/organ-donors/revoke', { reason: revokeReason }, authHeader);
      showMsg('✅ Pledge revoked');
      setShowRevoke(false);
      fetchMyProfile();
    } catch { showMsg('❌ Failed'); }
  };

  const handleRestore = async () => {
    try {
      await axios.put('/api/organ-donors/restore', {}, authHeader);
      showMsg('✅ Pledge restored');
      fetchMyProfile();
    } catch { showMsg('❌ Failed'); }
  };

  const printCard = () => { window.print(); };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🫀 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🫀</span>
          <h1 style={styles.title}>Organ Donor Registry</h1>
          <p style={styles.subtitle}>
            Pledge your organs and help save lives in Bangladesh
          </p>
        </div>

        {/* Stats bar */}
        {stats && (
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statNum}>{stats.total}</span>
              <span style={styles.statLabel}>Registered Donors</span>
            </div>
            {stats.byOrgan?.slice(0, 3).map((o) => (
              <div key={o._id} style={styles.statItem}>
                <span style={styles.statNum}>{o.count}</span>
                <span style={styles.statLabel}>{organIcons[o._id]} {o._id}</span>
              </div>
            ))}
          </div>
        )}

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'info',     label: '📚 About' },
            { key: 'register', label: '✍️ Register', hide: !!donor },
            { key: 'card',     label: '🪪 My Donor Card', hide: !donor },
            { key: 'manage',   label: '⚙️ Manage Pledge', hide: !donor },
          ].filter((t) => !t.hide).map((t) => (
            <button key={t.key}
              style={view === t.key ? styles.tabActive : styles.tab}
              onClick={() => setView(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── INFO TAB ── */}
        {view === 'info' && (
          <div>
            <div style={styles.educationGrid}>
              {educationContent.map((item, i) => (
                <div key={i} style={styles.eduCard}>
                  <div style={styles.eduIcon}>{item.icon}</div>
                  <h3 style={styles.eduTitle}>{item.title}</h3>
                  <p style={styles.eduContent}>{item.content}</p>
                </div>
              ))}
            </div>

            <div style={styles.organListCard}>
              <h2 style={styles.cardTitle}>🫀 Organs You Can Donate</h2>
              <div style={styles.organInfoGrid}>
                {allOrgans.map((organ) => (
                  <div key={organ} style={styles.organInfoItem}>
                    <span style={styles.organInfoIcon}>{organIcons[organ]}</span>
                    <span style={styles.organInfoName}>{organ}</span>
                  </div>
                ))}
              </div>
            </div>

            {!donor && user && (
              <div style={styles.ctaBox}>
                <h2 style={styles.ctaTitle}>Ready to save lives?</h2>
                <p style={styles.ctaSub}>Register as an organ donor in 2 minutes</p>
                <button style={styles.ctaBtn} onClick={() => setView('register')}>
                  🫀 Register as Organ Donor
                </button>
              </div>
            )}
            {!user && (
              <div style={styles.ctaBox}>
                <h2 style={styles.ctaTitle}>Join the registry</h2>
                <p style={styles.ctaSub}>Log in to register as an organ donor</p>
                <button style={styles.ctaBtn} onClick={() => navigate('/login')}>
                  Log In to Register
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── REGISTER TAB ── */}
        {view === 'register' && !donor && (
          <form onSubmit={handleRegister}>
            {/* Personal info */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>👤 Personal Information</h2>
              <div style={styles.formRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input style={styles.input} type="text" required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Date of Birth *</label>
                  <input style={styles.input} type="date" required
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Phone Number *</label>
                  <input style={styles.input} type="tel" placeholder="01XXXXXXXXX" required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Blood Type</label>
                  <select style={styles.input} value={form.bloodType}
                    onChange={(e) => setForm({ ...form, bloodType: e.target.value })}>
                    <option value="">Select Blood Type</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Division *</label>
                  <select style={styles.input} value={form.location.division}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, division: e.target.value, district: '' } })}>
                    <option value="">Select Division</option>
                    {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>District *</label>
                  <select style={styles.input} value={form.location.district}
                    disabled={!form.location.division}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, district: e.target.value } })}>
                    <option value="">Select District</option>
                    {form.location.division && districts[form.location.division]?.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Address (optional)</label>
                <input style={styles.input} type="text" placeholder="Your home address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>

            {/* Organ selection */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🫀 Select Organs to Donate *</h2>
              <p style={styles.cardSub}>Choose all organs you wish to donate</p>
              <div style={styles.organGrid}>
                {allOrgans.map((organ) => (
                  <div key={organ}
                    style={{ ...styles.organChip, ...(form.organs.includes(organ) ? styles.organChipActive : {}) }}
                    onClick={() => toggleOrgan(organ, 'form')}>
                    <span style={{ fontSize: '20px' }}>{organIcons[organ]}</span>
                    <span style={styles.organChipLabel}>{organ}</span>
                    {form.organs.includes(organ) && <span style={styles.organCheck}>✓</span>}
                  </div>
                ))}
              </div>
              <div style={styles.selectedCount}>
                {form.organs.length > 0
                  ? `${form.organs.length} organ(s) selected`
                  : 'No organs selected yet'}
              </div>
            </div>

            {/* Family consent */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>👨‍👩‍👧 Family Consent (Recommended)</h2>
              <p style={styles.cardSub}>
                Inform your family and record their consent to ensure your wishes are honored
              </p>
              <div style={styles.checkRow}>
                <input type="checkbox" id="familyConsent" checked={form.familyConsent.given}
                  onChange={(e) => setForm({ ...form, familyConsent: { ...form.familyConsent, given: e.target.checked } })} />
                <label htmlFor="familyConsent" style={styles.checkLabel}>
                  My family is aware of and supports my decision to donate organs
                </label>
              </div>
              {form.familyConsent.given && (
                <div style={styles.formRow}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Family Contact Name</label>
                    <input style={styles.input} type="text" placeholder="Next of kin name"
                      value={form.familyConsent.contactName}
                      onChange={(e) => setForm({ ...form, familyConsent: { ...form.familyConsent, contactName: e.target.value } })} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Family Contact Phone</label>
                    <input style={styles.input} type="tel" placeholder="01XXXXXXXXX"
                      value={form.familyConsent.contactPhone}
                      onChange={(e) => setForm({ ...form, familyConsent: { ...form.familyConsent, contactPhone: e.target.value } })} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Consent Document Name (optional)</label>
                    <input style={styles.input} type="text" placeholder="e.g. Signed consent letter"
                      value={form.familyConsent.docName}
                      onChange={(e) => setForm({ ...form, familyConsent: { ...form.familyConsent, docName: e.target.value } })} />
                  </div>
                </div>
              )}
            </div>

            {/* Emergency contact */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📞 Emergency Contact</h2>
              <div style={styles.formRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Name</label>
                  <input style={styles.input} type="text"
                    value={form.emergencyContact.name}
                    onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Phone</label>
                  <input style={styles.input} type="tel"
                    value={form.emergencyContact.phone}
                    onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Relation</label>
                  <input style={styles.input} type="text" placeholder="e.g. Spouse, Parent"
                    value={form.emergencyContact.relation}
                    onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relation: e.target.value } })} />
                </div>
              </div>
            </div>

            <button style={styles.submitBtn} type="submit" disabled={postLoading}>
              {postLoading ? 'Registering...' : '🫀 Complete Registration'}
            </button>
          </form>
        )}

        {/* ── DONOR CARD TAB ── */}
        {view === 'card' && donor && (
          <div>
            <div style={{ textAlign: 'right', marginBottom: '12px' }}>
              <button style={styles.printCardBtn} onClick={printCard}>🖨️ Print Card</button>
            </div>

            {/* Digital donor card */}
            <div ref={cardRef} style={styles.donorCard}>
              <div style={styles.donorCardHeader}>
                <div style={styles.donorCardLogo}>🫀 GoldenHour</div>
                <div style={styles.donorCardLabel}>ORGAN DONOR CARD</div>
              </div>

              <div style={styles.donorCardBody}>
                <div style={styles.donorCardLeft}>
                  <div style={styles.donorCardName}>{donor.name}</div>
                  <div style={styles.donorCardDetail}>
                    📅 DOB: {new Date(donor.dateOfBirth).toLocaleDateString('en-BD')}
                  </div>
                  {donor.bloodType && (
                    <div style={styles.donorCardDetail}>🩸 Blood Type: {donor.bloodType}</div>
                  )}
                  <div style={styles.donorCardDetail}>
                    📍 {donor.location.district}, {donor.location.division}
                  </div>
                  <div style={styles.donorCardDetail}>📞 {donor.phone}</div>
                  {donor.familyConsent?.given && (
                    <div style={{ ...styles.donorCardDetail, color: '#27AE60' }}>
                      ✅ Family Consent Given
                    </div>
                  )}
                </div>
                <div style={styles.donorCardRight}>
                  <div style={styles.donorCardOrgansTitle}>Pledged Organs:</div>
                  <div style={styles.donorCardOrgans}>
                    {donor.organs.map((o) => (
                      <span key={o} style={styles.donorCardOrganChip}>
                        {organIcons[o]} {o}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.donorCardFooter}>
                <div style={styles.donorCardId}>ID: {donor.donorCardId}</div>
                <div style={styles.donorCardDate}>
                  Pledged: {new Date(donor.pledgedAt).toLocaleDateString('en-BD')}
                </div>
                <div style={{
                  ...styles.donorCardStatus,
                  backgroundColor: donor.isActive ? '#27AE60' : '#c0392b',
                }}>
                  {donor.isActive ? '✅ ACTIVE' : '❌ REVOKED'}
                </div>
              </div>
            </div>

            {/* Emergency contact on card */}
            {donor.emergencyContact?.name && (
              <div style={styles.emergencyContactCard}>
                <div style={styles.emergencyContactTitle}>📞 Emergency Contact</div>
                <div style={styles.emergencyContactInfo}>
                  {donor.emergencyContact.name} ({donor.emergencyContact.relation}) — {donor.emergencyContact.phone}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MANAGE TAB ── */}
        {view === 'manage' && donor && (
          <div>
            {/* Status */}
            <div style={{ ...styles.card, borderLeft: `5px solid ${donor.isActive ? '#27AE60' : '#c0392b'}` }}>
              <div style={styles.manageStatus}>
                <div>
                  <div style={styles.manageStatusTitle}>
                    {donor.isActive ? '✅ Your pledge is active' : '❌ Your pledge is revoked'}
                  </div>
                  <div style={styles.manageStatusSub}>
                    Donor ID: {donor.donorCardId} · Registered {new Date(donor.pledgedAt).toLocaleDateString('en-BD')}
                  </div>
                  {!donor.isActive && donor.revokeReason && (
                    <div style={styles.revokeReasonText}>Reason: {donor.revokeReason}</div>
                  )}
                </div>
                <div>
                  {donor.isActive ? (
                    <button style={styles.revokeBtn} onClick={() => setShowRevoke(!showRevoke)}>
                      Revoke Pledge
                    </button>
                  ) : (
                    <button style={styles.restoreBtn} onClick={handleRestore}>
                      ✅ Restore Pledge
                    </button>
                  )}
                </div>
              </div>

              {showRevoke && (
                <div style={styles.revokeBox}>
                  <label style={styles.label}>Reason for revoking (optional)</label>
                  <input style={styles.input} type="text"
                    placeholder="e.g. Medical condition, personal decision"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)} />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button style={styles.confirmRevokeBtn} onClick={handleRevoke}>
                      Confirm Revoke
                    </button>
                    <button style={styles.cancelBtn} onClick={() => setShowRevoke(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Edit organs */}
            <div style={styles.card}>
              <div style={styles.editHeader}>
                <h2 style={styles.cardTitle}>🫀 Your Pledged Organs</h2>
                <button style={styles.editToggleBtn} onClick={() => setShowEdit(!showEdit)}>
                  {showEdit ? 'Cancel' : '✏️ Edit'}
                </button>
              </div>

              {!showEdit ? (
                <div style={styles.organGrid}>
                  {donor.organs.map((o) => (
                    <div key={o} style={{ ...styles.organChip, ...styles.organChipActive }}>
                      <span style={{ fontSize: '20px' }}>{organIcons[o]}</span>
                      <span style={styles.organChipLabel}>{o}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={styles.organGrid}>
                    {allOrgans.map((organ) => (
                      <div key={organ}
                        style={{ ...styles.organChip, ...(editOrgans.includes(organ) ? styles.organChipActive : {}) }}
                        onClick={() => toggleOrgan(organ, 'edit')}>
                        <span style={{ fontSize: '20px' }}>{organIcons[organ]}</span>
                        <span style={styles.organChipLabel}>{organ}</span>
                        {editOrgans.includes(organ) && <span style={styles.organCheck}>✓</span>}
                      </div>
                    ))}
                  </div>
                  <button style={styles.saveBtn} onClick={handleUpdateOrgans} disabled={editLoading}>
                    {editLoading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </>
              )}
            </div>

            {/* Family consent info */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>👨‍👩‍👧 Family Consent Status</h2>
              <div style={{
                ...styles.consentBadge,
                backgroundColor: donor.familyConsent?.given ? '#C6EBC5' : '#FEF9E7',
                color: donor.familyConsent?.given ? '#27AE60' : '#E67E22',
              }}>
                {donor.familyConsent?.given ? '✅ Family consent recorded' : '⚠️ Family consent not recorded'}
              </div>
              {donor.familyConsent?.given && donor.familyConsent?.contactName && (
                <div style={styles.consentDetails}>
                  <div>Contact: <strong>{donor.familyConsent.contactName}</strong></div>
                  <div>Phone: <strong>{donor.familyConsent.contactPhone}</strong></div>
                  {donor.familyConsent.docName && (
                    <div>Document: <strong>{donor.familyConsent.docName}</strong></div>
                  )}
                </div>
              )}
              {!donor.familyConsent?.given && (
                <p style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>
                  Consider talking to your family about your decision and updating your consent information.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper:           { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:            { backgroundColor: '#FA7070', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLogo:           { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:       { fontWeight: 'bold', color: '#fff' },
  navRight:          { display: 'flex', gap: '8px' },
  backBtn:           { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:         { maxWidth: '900px', margin: '0 auto', padding: '32px 20px' },
  header:            { textAlign: 'center', marginBottom: '20px' },
  title:             { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle:          { fontSize: '14px', color: '#888' },
  statsBar:          { display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #C6EBC5', marginBottom: '20px' },
  statItem:          { textAlign: 'center' },
  statNum:           { display: 'block', fontSize: '22px', fontWeight: 'bold', color: '#FA7070' },
  statLabel:         { fontSize: '11px', color: '#aaa' },
  successMsg:        { backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  errorMsg:          { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  tabs:              { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab:               { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #C6EBC5', backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  tabActive:         { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #FA7070', backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  educationGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' },
  eduCard:           { backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #C6EBC5' },
  eduIcon:           { fontSize: '28px', marginBottom: '8px' },
  eduTitle:          { fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  eduContent:        { fontSize: '13px', color: '#666', lineHeight: '1.6' },
  organListCard:     { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #C6EBC5', marginBottom: '20px' },
  organInfoGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '12px' },
  organInfoItem:     { display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#FEFDEC', borderRadius: '8px', padding: '8px 12px', border: '1px solid #C6EBC5' },
  organInfoIcon:     { fontSize: '18px' },
  organInfoName:     { fontSize: '12px', fontWeight: '600', color: '#333' },
  ctaBox:            { backgroundColor: '#FA7070', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#fff' },
  ctaTitle:          { fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' },
  ctaSub:            { fontSize: '14px', opacity: 0.9, marginBottom: '20px' },
  ctaBtn:            { padding: '12px 32px', backgroundColor: '#fff', color: '#FA7070', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' },
  card:              { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #C6EBC5', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  cardTitle:         { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub:           { fontSize: '13px', color: '#888', marginBottom: '16px' },
  formRow:           { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  fieldGroup:        { flex: 1, minWidth: '180px', marginBottom: '16px' },
  label:             { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input:             { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333' },
  organGrid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' },
  organChip:         { padding: '12px 10px', borderRadius: '12px', border: '1.5px solid #C6EBC5', backgroundColor: '#FEFDEC', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative' },
  organChipActive:   { backgroundColor: '#C6EBC5', borderColor: '#27AE60' },
  organChipLabel:    { fontSize: '11px', fontWeight: '600', color: '#333' },
  organCheck:        { position: 'absolute', top: '6px', right: '8px', color: '#27AE60', fontWeight: 'bold', fontSize: '12px' },
  selectedCount:     { fontSize: '13px', color: '#888', marginTop: '4px' },
  checkRow:          { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  checkLabel:        { fontSize: '13px', color: '#555', fontWeight: '500' },
  submitBtn:         { width: '100%', padding: '14px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  // Donor card
  printCardBtn:      { padding: '8px 16px', backgroundColor: '#2c3e50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  donorCard:         { background: 'linear-gradient(135deg, #FA7070 0%, #c0392b 100%)', borderRadius: '20px', padding: '28px', color: '#fff', marginBottom: '16px', boxShadow: '0 8px 32px rgba(192,57,43,0.3)' },
  donorCardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.3)' },
  donorCardLogo:     { fontSize: '18px', fontWeight: 'bold' },
  donorCardLabel:    { fontSize: '12px', letterSpacing: '2px', opacity: 0.9, fontWeight: 'bold' },
  donorCardBody:     { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' },
  donorCardLeft:     {},
  donorCardName:     { fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' },
  donorCardDetail:   { fontSize: '13px', opacity: 0.9, marginBottom: '3px' },
  donorCardRight:    { maxWidth: '220px' },
  donorCardOrgansTitle: { fontSize: '12px', opacity: 0.8, marginBottom: '6px', fontWeight: 'bold' },
  donorCardOrgans:   { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  donorCardOrganChip:{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '3px 8px', fontSize: '11px', fontWeight: '600' },
  donorCardFooter:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.3)', flexWrap: 'wrap', gap: '8px' },
  donorCardId:       { fontSize: '12px', opacity: 0.8, fontFamily: 'monospace' },
  donorCardDate:     { fontSize: '12px', opacity: 0.8 },
  donorCardStatus:   { borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', color: '#fff' },
  emergencyContactCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #C6EBC5' },
  emergencyContactTitle: { fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '4px' },
  emergencyContactInfo: { fontSize: '13px', color: '#333' },
  // Manage tab
  manageStatus:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' },
  manageStatusTitle: { fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '4px' },
  manageStatusSub:   { fontSize: '12px', color: '#888' },
  revokeReasonText:  { fontSize: '12px', color: '#c0392b', marginTop: '4px' },
  revokeBtn:         { padding: '8px 16px', backgroundColor: '#fdecea', color: '#c0392b', border: '1.5px solid #c0392b', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  restoreBtn:        { padding: '8px 16px', backgroundColor: '#C6EBC5', color: '#27AE60', border: '1.5px solid #27AE60', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  revokeBox:         { backgroundColor: '#fdecea', borderRadius: '10px', padding: '14px', marginTop: '14px', border: '1px solid #f5c6cb' },
  confirmRevokeBtn:  { padding: '8px 16px', backgroundColor: '#c0392b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  cancelBtn:         { padding: '8px 14px', backgroundColor: '#f5f5f5', color: '#555', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  editHeader:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  editToggleBtn:     { padding: '7px 14px', backgroundColor: '#FEFDEC', color: '#FA7070', border: '1.5px solid #FA7070', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  saveBtn:           { padding: '10px 24px', backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '8px' },
  consentBadge:      { borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px' },
  consentDetails:    { fontSize: '13px', color: '#555', display: 'flex', flexDirection: 'column', gap: '4px' },
};

export default OrganDonorPage;