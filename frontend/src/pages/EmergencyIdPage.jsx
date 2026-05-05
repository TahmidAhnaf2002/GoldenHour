import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// ✅ FIXED: was `import QRCode from 'qrcode.react'` — broken in v3+
import { QRCodeCanvas } from 'qrcode.react';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const commonAllergies = [
  'Penicillin', 'Aspirin', 'Ibuprofen', 'Sulfa Drugs', 'Codeine',
  'Latex', 'Peanuts', 'Shellfish', 'Bee Stings', 'Contrast Dye',
];
const commonConditions = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Epilepsy',
  'Kidney Disease', 'Liver Disease', 'Stroke History', 'Cancer',
  'Blood Disorder', 'Thyroid Disorder', 'Mental Health Condition',
];

const EmergencyIdPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    dateOfBirth: '', bloodType: '', gender: '', weight: '', address: '',
    allergies: [], chronicConditions: [],
    currentMedications: [{ name: '', dose: '', note: '' }],
    emergencyContacts: [{ name: '', phone: '', relation: '' }],
    organDonor: false, dnrOrder: false,
    publicFields: {
      bloodType: true, allergies: true, chronicConditions: true,
      currentMedications: true, emergencyContacts: true,
      dateOfBirth: false, weight: false, address: false,
    },
  });

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };
  const QR_URL = `${window.location.origin}/emergency-id/scan/${profile?.emergencyId}`;

  useEffect(() => { fetchProfile(); }, []);

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/emergency-id/me', authHeader);
      setProfile(data);
      setForm({
        name: data.name,
        dateOfBirth: data.dateOfBirth || '',
        bloodType: data.bloodType || '',
        gender: data.gender || '',
        weight: data.weight || '',
        address: data.address || '',
        allergies: data.allergies || [],
        chronicConditions: data.chronicConditions || [],
        currentMedications: data.currentMedications?.length > 0 ? data.currentMedications : [{ name: '', dose: '', note: '' }],
        emergencyContacts: data.emergencyContacts?.length > 0 ? data.emergencyContacts : [{ name: '', phone: '', relation: '' }],
        organDonor: data.organDonor || false,
        dnrOrder: data.dnrOrder || false,
        publicFields: data.publicFields || {},
      });
    } catch { setProfile(null); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showMsg('❌ Name is required'); return; }
    setSaving(true); setMsg('');
    try {
      const payload = {
        ...form,
        currentMedications: form.currentMedications.filter((m) => m.name.trim()),
        emergencyContacts: form.emergencyContacts.filter((c) => c.name.trim() && c.phone.trim()),
      };
      const { data } = await axios.post('/api/emergency-id/save', payload, authHeader);
      setProfile(data);
      showMsg('✅ Emergency ID saved successfully!');
      setActiveTab('card');
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Failed to save'));
    } finally { setSaving(false); }
  };

  const handleToggle = async () => {
    try {
      const { data } = await axios.put('/api/emergency-id/toggle', {}, authHeader);
      showMsg(`✅ Profile ${data.isActive ? 'activated' : 'deactivated'}`);
      fetchProfile();
    } catch { showMsg('❌ Failed'); }
  };

  const toggleAllergy = (a) => setForm((prev) => ({
    ...prev,
    allergies: prev.allergies.includes(a) ? prev.allergies.filter((x) => x !== a) : [...prev.allergies, a],
  }));

  const toggleCondition = (c) => setForm((prev) => ({
    ...prev,
    chronicConditions: prev.chronicConditions.includes(c) ? prev.chronicConditions.filter((x) => x !== c) : [...prev.chronicConditions, c],
  }));

  const downloadQR = () => {
    const canvas = document.getElementById('emergency-qr-canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `GoldenHour-EmergencyID-${profile?.emergencyId}.png`;
    a.click();
  };

  if (loading) return <div style={styles.centerMsg}>Loading...</div>;

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🆔 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🆔</span>
          <h1 style={styles.title}>Personal Medical Emergency ID</h1>
          <p style={styles.subtitle}>Your QR code gives first responders instant access to your critical medical info</p>
        </div>
        {msg && <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>}

        <div style={styles.tabs}>
          {[
            { key: 'profile', label: '✏️ My Info' },
            { key: 'card', label: '🪪 My ID Card', hide: !profile },
            { key: 'privacy', label: '🔒 Privacy', hide: !profile },
          ].filter((t) => !t.hide).map((t) => (
            <button key={t.key} style={activeTab === t.key ? styles.tabActive : styles.tab} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>👤 Basic Information</h2>
              <div style={styles.formRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input style={styles.input} type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Date of Birth</label>
                  <input style={styles.input} type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Blood Type</label>
                  <select style={styles.input} value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })}>
                    <option value="">Select Blood Type</option>
                    {bloodTypes.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Gender</label>
                  <select style={styles.input} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Weight (kg)</label>
                  <input style={styles.input} type="text" placeholder="e.g. 65" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Address</label>
                <input style={styles.input} type="text" placeholder="Your home address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>⚠️ Allergies</h2>
              <p style={styles.cardSub}>Select all that apply — shown to first responders</p>
              <div style={styles.chipGrid}>
                {commonAllergies.map((a) => (
                  <div key={a} style={{ ...styles.chip, ...(form.allergies.includes(a) ? styles.chipActive : {}) }} onClick={() => toggleAllergy(a)}>
                    {form.allergies.includes(a) && '✓ '}{a}
                  </div>
                ))}
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Other allergies (comma separated)</label>
                <input style={styles.input} type="text" placeholder="e.g. Mango, Dust, Cat hair"
                  value={form.allergies.filter((a) => !commonAllergies.includes(a)).join(', ')}
                  onChange={(e) => {
                    const custom = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    const common = form.allergies.filter((a) => commonAllergies.includes(a));
                    setForm({ ...form, allergies: [...common, ...custom] });
                  }} />
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🏥 Chronic Conditions</h2>
              <p style={styles.cardSub}>Select all conditions you have been diagnosed with</p>
              <div style={styles.chipGrid}>
                {commonConditions.map((c) => (
                  <div key={c} style={{ ...styles.chip, ...(form.chronicConditions.includes(c) ? styles.chipActiveRed : {}) }} onClick={() => toggleCondition(c)}>
                    {form.chronicConditions.includes(c) && '✓ '}{c}
                  </div>
                ))}
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Other conditions (comma separated)</label>
                <input style={styles.input} type="text" placeholder="e.g. Hemophilia, Lupus"
                  value={form.chronicConditions.filter((c) => !commonConditions.includes(c)).join(', ')}
                  onChange={(e) => {
                    const custom = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    const common = form.chronicConditions.filter((c) => commonConditions.includes(c));
                    setForm({ ...form, chronicConditions: [...common, ...custom] });
                  }} />
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>💊 Current Medications</h2>
              <p style={styles.cardSub}>List medications you are currently taking</p>
              {form.currentMedications.map((med, i) => (
                <div key={i} style={styles.medRow}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Medicine Name</label>
                    <input style={styles.input} type="text" placeholder="e.g. Metformin" value={med.name}
                      onChange={(e) => { const updated = [...form.currentMedications]; updated[i].name = e.target.value; setForm({ ...form, currentMedications: updated }); }} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Dose</label>
                    <input style={styles.input} type="text" placeholder="e.g. 500mg twice daily" value={med.dose}
                      onChange={(e) => { const updated = [...form.currentMedications]; updated[i].dose = e.target.value; setForm({ ...form, currentMedications: updated }); }} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Note</label>
                    <input style={styles.input} type="text" placeholder="e.g. For diabetes" value={med.note}
                      onChange={(e) => { const updated = [...form.currentMedications]; updated[i].note = e.target.value; setForm({ ...form, currentMedications: updated }); }} />
                  </div>
                  {form.currentMedications.length > 1 && (
                    <button type="button" style={styles.removeBtn} onClick={() => setForm({ ...form, currentMedications: form.currentMedications.filter((_, idx) => idx !== i) })}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" style={styles.addBtn} onClick={() => setForm({ ...form, currentMedications: [...form.currentMedications, { name: '', dose: '', note: '' }] })}>+ Add Medication</button>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📞 Emergency Contacts</h2>
              {form.emergencyContacts.map((contact, i) => (
                <div key={i} style={styles.medRow}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Name</label>
                    <input style={styles.input} type="text" placeholder="Full name" value={contact.name}
                      onChange={(e) => { const updated = [...form.emergencyContacts]; updated[i].name = e.target.value; setForm({ ...form, emergencyContacts: updated }); }} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Phone</label>
                    <input style={styles.input} type="tel" placeholder="01XXXXXXXXX" value={contact.phone}
                      onChange={(e) => { const updated = [...form.emergencyContacts]; updated[i].phone = e.target.value; setForm({ ...form, emergencyContacts: updated }); }} />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Relation</label>
                    <input style={styles.input} type="text" placeholder="e.g. Spouse" value={contact.relation}
                      onChange={(e) => { const updated = [...form.emergencyContacts]; updated[i].relation = e.target.value; setForm({ ...form, emergencyContacts: updated }); }} />
                  </div>
                  {form.emergencyContacts.length > 1 && (
                    <button type="button" style={styles.removeBtn} onClick={() => setForm({ ...form, emergencyContacts: form.emergencyContacts.filter((_, idx) => idx !== i) })}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" style={styles.addBtn} onClick={() => setForm({ ...form, emergencyContacts: [...form.emergencyContacts, { name: '', phone: '', relation: '' }] })}>+ Add Contact</button>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📋 Medical Declarations</h2>
              <div style={styles.checkRow}>
                <input type="checkbox" id="organDonor" checked={form.organDonor} onChange={(e) => setForm({ ...form, organDonor: e.target.checked })} />
                <label htmlFor="organDonor" style={styles.checkLabel}>🫀 I am a registered organ donor</label>
              </div>
              <div style={styles.checkRow}>
                <input type="checkbox" id="dnrOrder" checked={form.dnrOrder} onChange={(e) => setForm({ ...form, dnrOrder: e.target.checked })} />
                <label htmlFor="dnrOrder" style={styles.checkLabel}>📋 I have a Do Not Resuscitate (DNR) order</label>
              </div>
            </div>

            <button style={styles.submitBtn} type="submit" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save & Generate QR Code'}
            </button>
          </form>
        )}

        {/* ── ID CARD TAB ── */}
        {activeTab === 'card' && profile && (
          <div>
            <div style={{ ...styles.statusBar, backgroundColor: profile.isActive ? '#C6EBC5' : '#fdecea', color: profile.isActive ? '#27AE60' : '#c0392b' }}>
              {profile.isActive ? '✅ Your Emergency ID is Active' : '❌ Your Emergency ID is Inactive'}
              <button style={styles.toggleStatusBtn} onClick={handleToggle}>{profile.isActive ? 'Deactivate' : 'Activate'}</button>
            </div>

            <div style={styles.idCard}>
              <div style={styles.idCardHeader}>
                <div>
                  <div style={styles.idCardLogo}>🆔 GoldenHour Medical ID</div>
                  <div style={styles.idCardId}>ID: {profile.emergencyId}</div>
                </div>
                <div style={styles.idCardScans}>👁️ {profile.scanCount} scan(s)</div>
              </div>
              <div style={styles.idCardBody}>
                <div style={styles.idCardLeft}>
                  <div style={styles.idCardName}>{profile.name}</div>
                  {profile.gender && <div style={styles.idCardDetail}>👤 {profile.gender}</div>}
                  {profile.bloodType && <div style={styles.idCardBloodType}>🩸 {profile.bloodType}</div>}
                  {profile.dateOfBirth && profile.publicFields?.dateOfBirth && (
                    <div style={styles.idCardDetail}>📅 {new Date(profile.dateOfBirth).toLocaleDateString('en-BD')}</div>
                  )}
                  {profile.organDonor && <div style={styles.idCardBadge}>🫀 Organ Donor</div>}
                  {profile.dnrOrder && <div style={{ ...styles.idCardBadge, backgroundColor: '#fdecea', color: '#c0392b' }}>📋 DNR Order</div>}
                  {profile.allergies?.length > 0 && profile.publicFields?.allergies && (
                    <div style={styles.idCardSection}>
                      <div style={styles.idCardSectionTitle}>⚠️ Allergies</div>
                      <div style={styles.idCardTags}>
                        {profile.allergies.map((a) => <span key={a} style={{ ...styles.idCardTag, backgroundColor: '#fdecea', color: '#c0392b' }}>{a}</span>)}
                      </div>
                    </div>
                  )}
                  {profile.chronicConditions?.length > 0 && profile.publicFields?.chronicConditions && (
                    <div style={styles.idCardSection}>
                      <div style={styles.idCardSectionTitle}>🏥 Conditions</div>
                      <div style={styles.idCardTags}>
                        {profile.chronicConditions.map((c) => <span key={c} style={{ ...styles.idCardTag, backgroundColor: '#FEF9E7', color: '#E67E22' }}>{c}</span>)}
                      </div>
                    </div>
                  )}
                </div>
                {/* ✅ FIXED: was <QRCode renderAs="canvas" /> — broken in qrcode.react v3+ */}
                <div style={styles.qrSection}>
                  <QRCodeCanvas
                    id="emergency-qr-canvas"
                    value={QR_URL}
                    size={140}
                    level="H"
                    includeMargin={true}
                    fgColor="#c0392b"
                  />
                  <div style={styles.qrLabel}>Scan for medical info</div>
                </div>
              </div>

              {profile.emergencyContacts?.length > 0 && profile.publicFields?.emergencyContacts && (
                <div style={styles.idCardContactsSection}>
                  <div style={styles.idCardSectionTitle}>📞 Emergency Contacts</div>
                  {profile.emergencyContacts.map((c, i) => (
                    <div key={i} style={styles.idCardContact}><strong>{c.name}</strong> ({c.relation}) — {c.phone}</div>
                  ))}
                </div>
              )}

              <div style={styles.idCardFooter}>
                <div style={styles.idCardFooterNote}>Powered by GoldenHour · Scan QR for full medical profile</div>
                <div style={styles.idCardFooterDate}>Updated: {new Date(profile.updatedAt).toLocaleDateString('en-BD')}</div>
              </div>
            </div>

            <div style={styles.cardActions}>
              <button style={styles.downloadBtn} onClick={downloadQR}>⬇️ Download QR Code</button>
              <button style={styles.printBtn} onClick={() => window.print()}>🖨️ Print ID Card</button>
              <button style={styles.editBtn} onClick={() => setActiveTab('profile')}>✏️ Edit Info</button>
            </div>

            <div style={styles.scanUrlBox}>
              <div style={styles.scanUrlTitle}>🔗 Public Scan URL</div>
              <div style={styles.scanUrl}>{QR_URL}</div>
              <p style={styles.scanUrlNote}>Anyone who scans your QR code will be taken to this URL — no login required.</p>
            </div>
          </div>
        )}

        {/* ── PRIVACY TAB ── */}
        {activeTab === 'privacy' && profile && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🔒 Privacy Settings</h2>
            <p style={styles.cardSub}>Control which fields are visible when someone scans your QR code without logging in.</p>
            {[
              { key: 'bloodType', label: '🩸 Blood Type' },
              { key: 'allergies', label: '⚠️ Allergies' },
              { key: 'chronicConditions', label: '🏥 Chronic Conditions' },
              { key: 'currentMedications', label: '💊 Current Medications' },
              { key: 'emergencyContacts', label: '📞 Emergency Contacts' },
              { key: 'dateOfBirth', label: '📅 Date of Birth' },
              { key: 'weight', label: '⚖️ Weight' },
              { key: 'address', label: '📍 Home Address' },
            ].map((field) => (
              <div key={field.key} style={styles.privacyRow}>
                <div style={styles.privacyLeft}>
                  <div style={styles.privacyLabel}>{field.label}</div>
                  <div style={styles.privacyStatus}>{form.publicFields[field.key] ? '🌐 Visible to anyone who scans' : '🔒 Hidden — only visible when logged in'}</div>
                </div>
                <div style={{ ...styles.toggleSwitch, backgroundColor: form.publicFields[field.key] ? '#27AE60' : '#ccc' }}
                  onClick={() => setForm({ ...form, publicFields: { ...form.publicFields, [field.key]: !form.publicFields[field.key] } })}>
                  <div style={{ ...styles.toggleKnob, transform: form.publicFields[field.key] ? 'translateX(22px)' : 'translateX(2px)' }} />
                </div>
              </div>
            ))}
            <button style={styles.submitBtn} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '💾 Save Privacy Settings'}</button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar: { backgroundColor: '#c0392b', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLogo: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText: { fontWeight: 'bold', color: '#fff' },
  navRight: { display: 'flex', gap: '8px' },
  backBtn: { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container: { maxWidth: '900px', margin: '0 auto', padding: '32px 20px' },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle: { fontSize: '14px', color: '#888' },
  successMsg: { backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  errorMsg: { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #C6EBC5', backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  tabActive: { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #c0392b', backgroundColor: '#c0392b', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #C6EBC5', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub: { fontSize: '13px', color: '#888', marginBottom: '16px' },
  formRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  fieldGroup: { flex: 1, minWidth: '180px', marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333' },
  chipGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' },
  chip: { padding: '7px 14px', borderRadius: '20px', border: '1.5px solid #C6EBC5', backgroundColor: '#FEFDEC', fontSize: '12px', fontWeight: '600', color: '#555', cursor: 'pointer' },
  chipActive: { backgroundColor: '#FEF9E7', borderColor: '#E67E22', color: '#E67E22' },
  chipActiveRed: { backgroundColor: '#fdecea', borderColor: '#c0392b', color: '#c0392b' },
  medRow: { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '12px' },
  removeBtn: { padding: '8px 10px', backgroundColor: '#fdecea', color: '#c0392b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' },
  addBtn: { padding: '8px 16px', backgroundColor: '#FEFDEC', color: '#FA7070', border: '1.5px dashed #FA7070', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'block', marginBottom: '4px' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  checkLabel: { fontSize: '13px', color: '#555', fontWeight: '500' },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#c0392b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  statusBar: { borderRadius: '10px', padding: '12px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', fontSize: '14px' },
  toggleStatusBtn: { padding: '6px 14px', backgroundColor: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', color: 'inherit' },
  idCard: { background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', borderRadius: '20px', padding: '28px', color: '#fff', marginBottom: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  idCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)' },
  idCardLogo: { fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' },
  idCardId: { fontSize: '11px', opacity: 0.7, fontFamily: 'monospace' },
  idCardScans: { fontSize: '12px', opacity: 0.7 },
  idCardBody: { display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' },
  idCardLeft: { flex: 1 },
  idCardName: { fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' },
  idCardDetail: { fontSize: '13px', opacity: 0.85, marginBottom: '3px' },
  idCardBloodType: { fontSize: '18px', fontWeight: 'bold', color: '#FA7070', marginBottom: '6px' },
  idCardBadge: { display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', marginRight: '6px' },
  idCardSection: { marginTop: '10px' },
  idCardSectionTitle: { fontSize: '11px', opacity: 0.7, fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  idCardTags: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
  idCardTag: { borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '600' },
  qrSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  qrLabel: { fontSize: '11px', opacity: 0.7, textAlign: 'center' },
  idCardContactsSection: { paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)', marginBottom: '14px' },
  idCardContact: { fontSize: '13px', opacity: 0.85, marginBottom: '3px' },
  idCardFooter: { display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.2)', flexWrap: 'wrap', gap: '4px' },
  idCardFooterNote: { fontSize: '10px', opacity: 0.6 },
  idCardFooterDate: { fontSize: '10px', opacity: 0.6 },
  cardActions: { display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' },
  downloadBtn: { padding: '10px 20px', backgroundColor: '#27AE60', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  printBtn: { padding: '10px 20px', backgroundColor: '#2c3e50', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  editBtn: { padding: '10px 20px', backgroundColor: '#FEFDEC', color: '#FA7070', border: '1.5px solid #FA7070', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  scanUrlBox: { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #C6EBC5' },
  scanUrlTitle: { fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '6px' },
  scanUrl: { fontSize: '12px', color: '#2980b9', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '8px', backgroundColor: '#FEFDEC', padding: '8px', borderRadius: '6px' },
  scanUrlNote: { fontSize: '12px', color: '#888', margin: 0 },
  privacyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f0f0f0' },
  privacyLeft: {},
  privacyLabel: { fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '3px' },
  privacyStatus: { fontSize: '12px', color: '#888' },
  toggleSwitch: { width: '46px', height: '24px', borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s', flexShrink: 0 },
  toggleKnob: { position: 'absolute', top: '2px', width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  centerMsg: { textAlign: 'center', padding: '80px', color: '#888', fontFamily: 'sans-serif' },
};

export default EmergencyIdPage;