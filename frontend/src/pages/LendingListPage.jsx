import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const divisions = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna',
  'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh',
];

const districts = {
  Dhaka:      ['Dhaka', 'Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Tangail'],
  Chittagong: ['Chittagong', "Cox's Bazar", 'Comilla', 'Noakhali', 'Feni', 'Brahmanbaria'],
  Rajshahi:   ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Natore', 'Chapainawabganj'],
  Khulna:     ['Khulna', 'Jessore', 'Satkhira', 'Bagerhat', 'Narail', 'Magura'],
  Barisal:    ['Barisal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna'],
  Sylhet:     ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur:    ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrokona'],
};

const equipmentTypes = [
  'Wheelchair', 'Hospital Bed', 'Oxygen Cylinder', 'Crutches',
  'Walker / Zimmer Frame', 'Nebulizer', 'Blood Pressure Monitor',
  'Pulse Oximeter', 'Thermometer', 'Suction Machine',
  'Infusion Pump', 'ECG Machine', 'Other',
];

const LendingListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    equipmentType: '', equipmentName: '', description: '',
    condition: 'Good', depositAmount: '', maxDurationDays: 30,
    lenderPhone: '',
    location: { division: '', district: '', area: '' },
  });
  const [msg, setMsg]         = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipmentType)          { setMsg('❌ Select equipment type'); return; }
    if (!form.equipmentName.trim())   { setMsg('❌ Enter equipment name'); return; }
    if (!form.lenderPhone.trim())     { setMsg('❌ Enter your phone number'); return; }
    if (!form.location.division)      { setMsg('❌ Select division'); return; }
    if (!form.location.district)      { setMsg('❌ Select district'); return; }

    setLoading(true);
    setMsg('');
    try {
      await axios.post('/api/lending/list', form, {
        headers: { Authorization: 'Bearer ' + user.token },
      });
      setMsg('✅ Equipment listed successfully! Redirecting...');
      setTimeout(() => navigate('/lending'), 1500);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏥 <span style={styles.navLogoText}>GoldenHour</span></div>
        <button style={styles.backBtn} onClick={() => navigate('/lending')}>← Back</button>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🤝</span>
          <h1 style={styles.title}>List Equipment for Lending</h1>
          <p style={styles.subtitle}>Share your medical equipment with community members in need</p>
        </div>

        {msg && (
          <div style={msg.includes('✅') ? styles.successMsg : styles.errorMsg}>{msg}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🏥 Equipment Details</h2>
            <div style={styles.formRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Equipment Type *</label>
                <select style={styles.input} value={form.equipmentType}
                  onChange={(e) => setForm({ ...form, equipmentType: e.target.value })}>
                  <option value="">Select Type</option>
                  {equipmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Equipment Name *</label>
                <input style={styles.input} type="text"
                  placeholder="e.g. Lightweight Folding Wheelchair"
                  value={form.equipmentName}
                  onChange={(e) => setForm({ ...form, equipmentName: e.target.value })} />
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Description (optional)</label>
              <input style={styles.input} type="text"
                placeholder="e.g. Barely used, foldable, suitable for adults"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={styles.formRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Condition *</label>
                <div style={styles.conditionRow}>
                  {['Excellent', 'Good', 'Fair'].map((c) => (
                    <div key={c}
                      style={{ ...styles.conditionChip, ...(form.condition === c ? styles.conditionChipActive : {}) }}
                      onClick={() => setForm({ ...form, condition: c })}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>💰 Lending Terms</h2>
            <div style={styles.formRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Refundable Deposit (৳)</label>
                <input style={styles.input} type="number" min="0"
                  placeholder="0 for free lending"
                  value={form.depositAmount}
                  onChange={(e) => setForm({ ...form, depositAmount: e.target.value })} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Max Duration: <strong style={{ color: '#FA7070' }}>{form.maxDurationDays} days</strong>
                </label>
                <input type="range" min="1" max="90" value={form.maxDurationDays}
                  style={styles.slider}
                  onChange={(e) => setForm({ ...form, maxDurationDays: Number(e.target.value) })} />
                <div style={styles.sliderLabels}>
                  <span>1 day</span><span>45 days</span><span>90 days</span>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📍 Your Location & Contact</h2>
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
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Area (optional)</label>
                <input style={styles.input} type="text" placeholder="e.g. Mirpur"
                  value={form.location.area}
                  onChange={(e) => setForm({ ...form, location: { ...form.location, area: e.target.value } })} />
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Your Phone Number *</label>
              <input style={styles.input} type="tel" placeholder="01XXXXXXXXX"
                value={form.lenderPhone}
                onChange={(e) => setForm({ ...form, lenderPhone: e.target.value })} />
            </div>
          </div>

          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Listing...' : '🤝 List for Lending'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrapper:        { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:         { backgroundColor: '#FA7070', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLogo:        { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:    { fontWeight: 'bold', color: '#fff' },
  backBtn:        { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:      { maxWidth: '800px', margin: '0 auto', padding: '32px 20px' },
  header:         { textAlign: 'center', marginBottom: '24px' },
  title:          { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle:       { fontSize: '14px', color: '#888' },
  successMsg:     { backgroundColor: '#C6EBC5', color: '#27AE60', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  errorMsg:       { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  card:           { backgroundColor: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #C6EBC5', marginBottom: '20px' },
  cardTitle:      { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '16px' },
  formRow:        { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  fieldGroup:     { flex: 1, minWidth: '180px', marginBottom: '16px' },
  label:          { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  input:          { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #C6EBC5', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FEFDEC', color: '#333' },
  conditionRow:   { display: 'flex', gap: '10px' },
  conditionChip:  { flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #C6EBC5', backgroundColor: '#FEFDEC', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#555', cursor: 'pointer' },
  conditionChipActive: { backgroundColor: '#FA7070', color: '#fff', borderColor: '#FA7070' },
  slider:         { width: '100%', accentColor: '#FA7070' },
  sliderLabels:   { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginTop: '4px' },
  submitBtn:      { width: '100%', padding: '14px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
};

export default LendingListPage;