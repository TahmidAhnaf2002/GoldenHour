import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmergencyIdScanPage = () => {
  const { emergencyId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      // ✅ FIXED: was `const { res } = await axios.get(...)` — wrong destructuring
      const { data: res } = await axios.get(`/api/emergency-id/scan/${emergencyId}`);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Emergency ID not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={scanStyles.wrapper}>
      <div style={scanStyles.centerMsg}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
        Loading emergency profile...
      </div>
    </div>
  );

  if (error) return (
    <div style={scanStyles.wrapper}>
      <div style={scanStyles.centerMsg}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>❌</div>
        <div style={{ color: '#c0392b', fontWeight: 'bold', marginBottom: '8px' }}>{error}</div>
        <div style={{ fontSize: '13px', color: '#888' }}>This Emergency ID may be inactive or invalid.</div>
      </div>
    </div>
  );

  return (
    <div style={scanStyles.wrapper}>
      <div style={scanStyles.emergencyBanner}>🚨 MEDICAL EMERGENCY ID — FOR FIRST RESPONDERS</div>
      <div style={scanStyles.container}>
        <div style={scanStyles.nameCard}>
          <div style={scanStyles.patientName}>{data.name}</div>
          <div style={scanStyles.idBadge}>ID: {data.emergencyId}</div>
          <div style={scanStyles.infoRow}>
            {data.bloodType && <div style={scanStyles.bloodTypeBadge}>🩸 {data.bloodType}</div>}
            {data.gender && <div style={scanStyles.infoBadge}>👤 {data.gender}</div>}
            {data.dateOfBirth && <div style={scanStyles.infoBadge}>📅 {new Date(data.dateOfBirth).toLocaleDateString('en-BD')}</div>}
            {data.weight && <div style={scanStyles.infoBadge}>⚖️ {data.weight} kg</div>}
          </div>
          {data.organDonor && <div style={scanStyles.donorBadge}>🫀 ORGAN DONOR</div>}
          {data.dnrOrder && <div style={{ ...scanStyles.donorBadge, backgroundColor: '#c0392b' }}>📋 DNR ORDER IN EFFECT</div>}
        </div>

        {data.allergies?.length > 0 && (
          <div style={{ ...scanStyles.section, borderLeft: '5px solid #c0392b' }}>
            <div style={scanStyles.sectionTitle}>⚠️ ALLERGIES — DO NOT ADMINISTER</div>
            <div style={scanStyles.tagRow}>{data.allergies.map((a) => <span key={a} style={scanStyles.allergyTag}>{a}</span>)}</div>
          </div>
        )}

        {data.chronicConditions?.length > 0 && (
          <div style={{ ...scanStyles.section, borderLeft: '5px solid #E67E22' }}>
            <div style={scanStyles.sectionTitle}>🏥 CHRONIC CONDITIONS</div>
            <div style={scanStyles.tagRow}>{data.chronicConditions.map((c) => <span key={c} style={scanStyles.conditionTag}>{c}</span>)}</div>
          </div>
        )}

        {data.currentMedications?.length > 0 && (
          <div style={{ ...scanStyles.section, borderLeft: '5px solid #2980b9' }}>
            <div style={scanStyles.sectionTitle}>💊 CURRENT MEDICATIONS</div>
            {data.currentMedications.map((med, i) => (
              <div key={i} style={scanStyles.medItem}>
                <strong>{med.name}</strong>{med.dose && ` — ${med.dose}`}
                {med.note && <span style={{ color: '#888' }}> ({med.note})</span>}
              </div>
            ))}
          </div>
        )}

        {data.emergencyContacts?.length > 0 && (
          <div style={{ ...scanStyles.section, borderLeft: '5px solid #27AE60' }}>
            <div style={scanStyles.sectionTitle}>📞 EMERGENCY CONTACTS</div>
            {data.emergencyContacts.map((c, i) => (
              <div key={i} style={scanStyles.contactItem}>
                <div style={scanStyles.contactName}>{c.name} ({c.relation})</div>
                <a href={`tel:${c.phone}`} style={scanStyles.callBtn}>📞 Call {c.phone}</a>
              </div>
            ))}
          </div>
        )}

        {data.address && (
          <div style={scanStyles.section}>
            <div style={scanStyles.sectionTitle}>📍 ADDRESS</div>
            <div style={scanStyles.addressText}>{data.address}</div>
          </div>
        )}

        <div style={scanStyles.footer}>
          <div style={scanStyles.footerNote}>Powered by GoldenHour Emergency Network</div>
          <div style={scanStyles.footerUpdated}>Last updated: {new Date(data.lastUpdated).toLocaleString('en-BD')}</div>
          <button style={scanStyles.findHospitalBtn} onClick={() => navigate('/hospitals')}>🏥 Find Nearest Hospital</button>
        </div>
      </div>
    </div>
  );
};

const scanStyles = {
  wrapper: { minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'sans-serif' },
  emergencyBanner: { backgroundColor: '#c0392b', color: '#fff', textAlign: 'center', padding: '14px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' },
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px 16px' },
  centerMsg: { textAlign: 'center', padding: '80px 20px', color: '#888' },
  nameCard: { backgroundColor: '#2c3e50', borderRadius: '16px', padding: '24px', color: '#fff', marginBottom: '16px', textAlign: 'center' },
  patientName: { fontSize: '28px', fontWeight: 'bold', marginBottom: '6px' },
  idBadge: { fontSize: '12px', opacity: 0.6, fontFamily: 'monospace', marginBottom: '14px' },
  infoRow: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '10px' },
  bloodTypeBadge: { backgroundColor: '#c0392b', borderRadius: '10px', padding: '6px 16px', fontSize: '16px', fontWeight: 'bold' },
  infoBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '5px 12px', fontSize: '13px' },
  donorBadge: { backgroundColor: '#27AE60', borderRadius: '8px', padding: '6px 16px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block', marginTop: '8px' },
  section: { backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid #f0f0f0' },
  sectionTitle: { fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '10px', letterSpacing: '0.5px', textTransform: 'uppercase' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  allergyTag: { backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: 'bold' },
  conditionTag: { backgroundColor: '#FEF9E7', color: '#E67E22', borderRadius: '8px', padding: '4px 12px', fontSize: '13px', fontWeight: '600' },
  medItem: { fontSize: '14px', color: '#333', marginBottom: '6px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' },
  contactItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px' },
  contactName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  callBtn: { padding: '8px 16px', backgroundColor: '#27AE60', color: '#fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', textDecoration: 'none' },
  addressText: { fontSize: '14px', color: '#333' },
  footer: { textAlign: 'center', padding: '20px 0', borderTop: '1px solid #f0f0f0', marginTop: '16px' },
  footerNote: { fontSize: '12px', color: '#aaa', marginBottom: '4px' },
  footerUpdated: { fontSize: '11px', color: '#ccc', marginBottom: '14px' },
  findHospitalBtn: { padding: '10px 24px', backgroundColor: '#FA7070', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
};

export default EmergencyIdScanPage;