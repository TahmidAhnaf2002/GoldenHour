import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const districts = {
  Dhaka:       ['Dhaka', 'Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Tangail'],
  Chittagong:  ['Chittagong', "Cox's Bazar", 'Comilla', 'Noakhali', 'Feni', 'Brahmanbaria'],
  Rajshahi:    ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Natore', 'Chapainawabganj'],
  Khulna:      ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Narail', 'Magura'],
  Barisal:     ['Barisal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna'],
  Sylhet:      ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur:     ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari'],
  Mymensingh:  ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrokona'],
};

const skillOptions = [
  'CPR', 'First Aid', 'Wound Care', 'Fracture Management',
  'Burn Treatment', 'Choking Response', 'Snake Bite First Aid',
  'Childbirth Assistance', 'Cardiac Care', 'Trauma Response',
];

const ResponderRegisterPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '', phone: '', responderType: '',
    location: { division: '', district: '', area: '' },
    responseRadius: 5,
    skills: [],
  });
  const [certifications, setCertifications] = useState([{ certName: '', certNote: '', issuedYear: '' }]);
  const [msg, setMsg]         = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const updateCert = (i, field, val) => {
    const updated = [...certifications];
    updated[i][field] = val;
    setCertifications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.responderType) { setMsg('❌ Please select your responder type'); return; }
    if (!form.location.division) { setMsg('❌ Please select your division'); return; }
    if (!form.location.district) { setMsg('❌ Please select your district'); return; }

    setLoading(true);
    setMsg('');
    try {
      await axios.post(
        '/api/responders/register',
        { ...form, certifications: certifications.filter((c) => c.certName.trim()) },
        { headers: { Authorization: 'Bearer ' + user.token } }
      );
      setMsg('✅ Registered successfully! Redirecting...');
      setTimeout(() => navigate('/responder/dashboard'), 1500);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🚑 <span style={styles.navLogoText}>GoldenHour</span></div>
        <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🚑</span>
          <h1 style={styles.title}>Register as First Responder</h1>
          <p style={styles.subtitle}>
            Join the network of trained volunteers and medical professionals
          </p>
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Basic Info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>👤 Basic Information</h2>
            <div style={styles.formRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name *</label>
                <input style={styles.input} type="text" required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input style={styles.input} type="tel" required
                  placeholder="01XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Responder Type *</label>
              <div style={styles.typeGrid}>
                {['Doctor', 'Nurse', 'Paramedic', 'First Aid Volunteer', 'Medical Student', 'Other'].map((t) => (
                  <div key={t}
                    style={{ ...styles.typeCard, ...(form.responderType === t ? styles.typeCardActive : {}) }}
                    onClick={() => setForm({ ...form, responderType: t })}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location & Radius */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📍 Location & Response Radius</h2>
            <div style={styles.formRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Division *</label>
                <select style={styles.input}
                  value={form.location.division}
                  onChange={(e) => setForm({ ...form, location: { ...form.location, division: e.target.value, district: '' } })}>
                  <option value="">Select Division</option>
                  {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>District *</label>
                <select style={styles.input}
                  value={form.location.district}
                  disabled={!form.location.division}
                  onChange={(e) => setForm({ ...form, location: { ...form.location, district: e.target.value } })}>
                  <option value="">Select District</option>
                  {form.location.division && districts[form.location.division]?.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Area (optional)</label>
                <input style={styles.input} type="text" placeholder="e.g. Mirpur"
                  value={form.location.area}
                  onChange={(e) => setForm({ ...form, location: { ...form.location, area: e.target.value } })} />
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Response Radius: <strong style={{ color: '#FA7070' }}>{form.responseRadius} km</strong>
              </label>
              <input type="range" min="1" max="50" value={form.responseRadius}
                style={styles.slider}
                onChange={(e) => setForm({ ...form, responseRadius: Number(e.target.value) })} />
              <div style={styles.sliderLabels}>
                <span>1 km</span><span>25 km</span><span>50 km</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🩺 Skills</h2>
            <p style={styles.cardSub}>Select all skills that apply to you</p>
            <div style={styles.skillsGrid}>
              {skillOptions.map((skill) => (
                <div key={skill}
                  style={{ ...styles.skillChip, ...(form.skills.includes(skill) ? styles.skillChipActive : {}) }}
                  onClick={() => toggleSkill(skill)}>
                  {form.skills.includes(skill) ? '✅ ' : ''}{skill}
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📄 Certifications (optional)</h2>
            <p style={styles.cardSub}>List any relevant certifications you hold</p>
            {certifications.map((cert, i) => (
              <div key={i} style={styles.certRow}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Certification Name</label>
                  <input style={styles.input} type="text"
                    placeholder="e.g. BLS Certification"
                    value={cert.certName}
                    onChange={(e) => updateCert(i, 'certName', e.target.value)} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Issued Year</label>
                  <input style={styles.input} type="text"
                    placeholder="e.g. 2023"
                    value={cert.issuedYear}
                    onChange={(e) => updateCert(i, 'issuedYear', e.target.value)} />
                </div>
                <div style={{ ...styles.fieldGroup, flex: 2 }}>
                  <label style={styles.label}>Note (optional)</label>
                  <input style={styles.input} type="text"
                    placeholder="e.g. Issued by Red Crescent"
                    value={cert.certNote}
                    onChange={(e) => updateCert(i, 'certNote', e.target.value)} />
                </div>
                {certifications.length > 1 && (
                  <button type="button" style={styles.removeBtn}
                    onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))}>
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" style={styles.addBtn}
              onClick={() => setCertifications([...certifications, { certName: '', certNote: '', issuedYear: '' }])}>
              + Add Another Certification
            </button>
          </div>

          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Registering...' : '🚑 Register as First Responder'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrapper:     { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:      { backgroundColor: '#FA7070', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLogo:     { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText: { fontWeight: 'bold', color: '#fff' },
  backBtn:     { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:   { maxWidth: '800px', margin: '0 auto', padding: '32px 20px' },
  header:      { textAlign: 'center', marginBottom: '24px' },
  title:       { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle:    { fontSize: '14px', color: '#888' },
  successMsg:  { backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  errorMsg:    { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  card:        { backgroundColor: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5', marginBottom: '20px' },
  cardTitle:   { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub:     { fontSize: '13px', color: '#888', marginBottom: '16px' },
  formRow:     { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  fieldGroup:  { flex: 1, minWidth: '180px', marginBottom: '16px' },
  label:       { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input:       { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333' },
  typeGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' },
  typeCard:    { padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #C6EBC5', backgroundColor: '#FEFDEC', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#555', cursor: 'pointer' },
  typeCardActive: { backgroundColor: '#FA7070', color: '#fff', borderColor: '#FA7070' },
  slider:      { width: '100%', accentColor: '#FA7070' },
  sliderLabels:{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginTop: '4px' },
  skillsGrid:  { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  skillChip:   { padding: '8px 14px', borderRadius: '20px', border: '1.5px solid #C6EBC5', backgroundColor: '#FEFDEC', fontSize: '12px', fontWeight: '600', color: '#555', cursor: 'pointer' },
  skillChipActive: { backgroundColor: '#C6EBC5', color: '#27AE60', borderColor: '#27AE60' },
  certRow:     { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '12px' },
  removeBtn:   { padding: '8px 10px', backgroundColor: '#fdecea', color: '#c0392b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' },
  addBtn:      { padding: '8px 16px', backgroundColor: '#FEFDEC', color: '#FA7070', border: '1.5px dashed #FA7070', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginBottom: '4px', display: 'block' },
  submitBtn:   { width: '100%', padding: '14px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '8px' },
};

export default ResponderRegisterPage;