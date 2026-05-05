import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const tierStyles = {
  Bronze:   { color: '#cd7f32', bg: '#fdf3e7', border: '#cd7f32', icon: '🥉' },
  Silver:   { color: '#888',    bg: '#f5f5f5', border: '#aaa',    icon: '🥈' },
  Gold:     { color: '#d4a017', bg: '#fffbe6', border: '#f1c40f', icon: '🥇' },
  Platinum: { color: '#2980b9', bg: '#e8f4fd', border: '#2980b9', icon: '💎' },
};

const PreparednesScorePage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const badgeRef  = useRef();

  const [scoreData, setScoreData]         = useState(null);
  const [leaderboard, setLeaderboard]     = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [activeTab, setActiveTab]         = useState('score');
  const [loading, setLoading]             = useState(true);
  const [lbLoading, setLbLoading]         = useState(false);

  const authHeader = { headers: { Authorization: 'Bearer ' + user?.token } };

  useEffect(() => {
    fetchScore();
    fetchPlatformStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'leaderboard') fetchLeaderboard();
  }, [activeTab]);

  const fetchScore = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/preparedness/me', authHeader);
      setScoreData(data);
    } catch { setScoreData(null); }
    finally  { setLoading(false); }
  };

  const fetchLeaderboard = async () => {
    setLbLoading(true);
    try {
      const { data } = await axios.get('/api/preparedness/leaderboard', authHeader);
      setLeaderboard(data);
    } catch { setLeaderboard(null); }
    finally  { setLbLoading(false); }
  };

  const fetchPlatformStats = async () => {
    try {
      const { data } = await axios.get('/api/preparedness/stats');
      setPlatformStats(data);
    } catch { /* silent */ }
  };

  const shareBadge = () => {
    const text = `I scored ${scoreData?.score} points on GoldenHour Emergency Preparedness! Tier: ${scoreData?.tier?.icon} ${scoreData?.tier?.name}. Join me in being prepared for emergencies!`;
    if (navigator.share) {
      navigator.share({ title: 'My GoldenHour Preparedness Score', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Score badge text copied to clipboard!');
    }
  };

  const actionRoutes = {
    blood_donor:         '/donor/register',
    first_responder:     '/responder/register',
    organ_donor:         '/organ-donor',
    hospital_registered: '/hospitals/register',
    blood_type_set:      '/dashboard',
    sos_sent:            '/sos',
    sos_responded:       '/sos',
    alert_reported:      '/health-alerts',
    equipment_lent:      '/lending/list',
    camp_registered:     '/camps',
    responder_verified:  '/responder/dashboard',
    organ_family_consent:'/organ-donor',
  };

  const tier    = scoreData?.tier;
  const tierSt  = tier ? tierStyles[tier.name] || tierStyles.Bronze : tierStyles.Bronze;

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>🏅 <span style={styles.navLogoText}>GoldenHour</span></div>
        <div style={styles.navRight}>
          <button style={styles.backBtn} onClick={() => navigate('/home')}>← Home</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '40px' }}>🏅</span>
          <h1 style={styles.title}>Emergency Preparedness Score</h1>
          <p style={styles.subtitle}>
            Earn points by taking real preparedness actions in your community
          </p>
        </div>

        {/* Platform stats bar */}
        {platformStats && (
          <div style={styles.statsBar}>
            {[
              { label: 'Users',         value: platformStats.totalUsers,       icon: '👥' },
              { label: 'Blood Donors',  value: platformStats.totalDonors,      icon: '🩸' },
              { label: 'Responders',    value: platformStats.totalResponders,  icon: '🚑' },
              { label: 'Organ Donors',  value: platformStats.totalOrganDonors, icon: '🫀' },
            ].map((s) => (
              <div key={s.label} style={styles.statItem}>
                <div style={styles.statIcon}>{s.icon}</div>
                <div style={styles.statNum}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'score',       label: '🏅 My Score' },
            { key: 'actions',     label: '✅ Actions' },
            { key: 'leaderboard', label: '🏆 Leaderboard' },
            { key: 'tiers',       label: '🎖️ Tiers' },
          ].map((t) => (
            <button key={t.key}
              style={activeTab === t.key ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div style={styles.centerMsg}>Calculating your score...</div>}

        {/* ── SCORE TAB ── */}
        {activeTab === 'score' && !loading && scoreData && (
          <div>
            {/* Score badge */}
            <div ref={badgeRef} style={{ ...styles.badgeCard, borderColor: tierSt.border, backgroundColor: tierSt.bg }}>
              <div style={styles.badgeTop}>
                <div style={styles.badgeTierIcon}>{tierSt.icon}</div>
                <div style={styles.badgeCenter}>
                  <div style={{ ...styles.badgeScore, color: tierSt.color }}>
                    {scoreData.score}
                  </div>
                  <div style={styles.badgeMaxScore}>/ {scoreData.maxPossible} points</div>
                  <div style={{ ...styles.badgeTierName, color: tierSt.color }}>
                    {tier?.name} Tier
                  </div>
                </div>
                <div style={styles.badgeRight}>
                  <div style={styles.badgeCompleted}>
                    {scoreData.completed.length}/{scoreData.actions.length}
                  </div>
                  <div style={styles.badgeCompletedLabel}>actions done</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={styles.progressBarWrap}>
                <div style={{
                  ...styles.progressBarFill,
                  width: `${scoreData.percentage}%`,
                  backgroundColor: tierSt.color,
                }} />
              </div>
              <div style={{ ...styles.progressPct, color: tierSt.color }}>
                {scoreData.percentage}% complete
              </div>
            </div>

            {/* Share button */}
            <div style={styles.shareRow}>
              <button style={{ ...styles.shareBtn, backgroundColor: tierSt.color }} onClick={shareBadge}>
                📤 Share My Badge
              </button>
              <button style={styles.refreshBtn} onClick={fetchScore}>
                🔄 Refresh Score
              </button>
            </div>

            {/* Next tier progress */}
            {tier?.name !== 'Platinum' && (
              <div style={styles.nextTierCard}>
                {(() => {
                  const tiers    = [
                    { name: 'Bronze', minScore: 0 }, { name: 'Silver', minScore: 30 },
                    { name: 'Gold', minScore: 60 },  { name: 'Platinum', minScore: 90 },
                  ];
                  const tierIdx  = tiers.findIndex((t) => t.name === tier?.name);
                  const nextTier = tiers[tierIdx + 1];
                  if (!nextTier) return null;
                  const needed = nextTier.minScore - scoreData.score;
                  const nt     = tierStyles[nextTier.name];
                  return (
                    <>
                      <div style={styles.nextTierTitle}>
                        {nt.icon} <strong>{needed} more points</strong> to reach {nextTier.name} tier
                      </div>
                      <div style={styles.nextTierHint}>
                        Complete any unchecked action below to earn more points
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {tier?.name === 'Platinum' && (
              <div style={styles.platinumBox}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💎</div>
                <div style={styles.platinumTitle}>Maximum Preparedness Achieved!</div>
                <div style={styles.platinumSub}>
                  You have reached Platinum tier — you are a GoldenHour Emergency Champion!
                </div>
              </div>
            )}

            {/* Quick action cards for incomplete actions */}
            <div style={styles.quickActionsTitle}>🎯 Your Next Actions</div>
            <div style={styles.quickActionsGrid}>
              {scoreData.actions.filter((a) => !a.completed).slice(0, 4).map((action) => (
                <div key={action.id} style={styles.quickActionCard}
                  onClick={() => navigate(actionRoutes[action.id] || '/home')}>
                  <div style={styles.quickActionIcon}>{action.icon}</div>
                  <div style={styles.quickActionLabel}>{action.label}</div>
                  <div style={styles.quickActionPoints}>+{action.points} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTIONS TAB ── */}
        {activeTab === 'actions' && !loading && scoreData && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>✅ All Preparedness Actions</h2>
            <p style={styles.cardSub}>
              Complete these actions to increase your preparedness score
            </p>
            {scoreData.actions.map((action) => (
              <div key={action.id}
                style={{
                  ...styles.actionRow,
                  opacity: action.completed ? 1 : 0.7,
                  borderLeft: `4px solid ${action.completed ? '#27AE60' : '#ddd'}`,
                }}
                onClick={() => !action.completed && navigate(actionRoutes[action.id] || '/home')}>
                <div style={styles.actionLeft}>
                  <span style={styles.actionIcon}>{action.icon}</span>
                  <div>
                    <div style={styles.actionLabel}>{action.label}</div>
                    {!action.completed && (
                      <div style={styles.actionHint}>
                        Click to complete →
                      </div>
                    )}
                  </div>
                </div>
                <div style={styles.actionRight}>
                  <span style={{
                    ...styles.actionPoints,
                    color: action.completed ? '#27AE60' : '#aaa',
                  }}>
                    {action.completed ? '✅' : `+${action.points}`}
                  </span>
                  <span style={styles.actionPtLabel}>
                    {action.completed ? 'Done' : 'pts'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {activeTab === 'leaderboard' && (
          <div>
            {lbLoading && <div style={styles.centerMsg}>Loading leaderboard...</div>}
            {leaderboard && !lbLoading && (
              <>
                {leaderboard.myRank > 0 && (
                  <div style={styles.myRankCard}>
                    🏆 Your rank: <strong>#{leaderboard.myRank}</strong> out of{' '}
                    <strong>{leaderboard.totalParticipants}</strong> participants
                  </div>
                )}
                <div style={styles.card}>
                  <h2 style={styles.cardTitle}>🏆 Top 20 Community Leaders</h2>
                  {leaderboard.leaderboard.map((entry, i) => {
                    const ts  = tierStyles[entry.tier?.name] || tierStyles.Bronze;
                    const isMe = entry.userId === user?._id;
                    return (
                      <div key={entry.userId}
                        style={{
                          ...styles.lbRow,
                          backgroundColor: isMe ? '#FEFDEC' : '#fff',
                          border: isMe ? '1.5px solid #FA7070' : '1px solid #f0f0f0',
                        }}>
                        <div style={styles.lbRank}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </div>
                        <div style={styles.lbName}>
                          {entry.name}
                          {isMe && <span style={styles.youBadge}>You</span>}
                        </div>
                        <div style={styles.lbMid}>
                          <span style={{ ...styles.lbTier, color: ts.color, backgroundColor: ts.bg }}>
                            {ts.icon} {entry.tier?.name}
                          </span>
                          <span style={styles.lbActions}>
                            {entry.completed} actions
                          </span>
                        </div>
                        <div style={{ ...styles.lbScore, color: ts.color }}>
                          {entry.score} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TIERS TAB ── */}
        {activeTab === 'tiers' && (
          <div>
            <div style={styles.tiersGrid}>
              {[
                { name: 'Bronze',   range: '0–29 pts',   desc: 'You have taken your first steps in emergency preparedness.',          icon: '🥉', color: '#cd7f32', bg: '#fdf3e7' },
                { name: 'Silver',   range: '30–59 pts',  desc: 'You are actively contributing to the community health network.',      icon: '🥈', color: '#888',    bg: '#f5f5f5' },
                { name: 'Gold',     range: '60–89 pts',  desc: 'You are a committed emergency preparedness leader in your area.',     icon: '🥇', color: '#d4a017', bg: '#fffbe6' },
                { name: 'Platinum', range: '90+ pts',    desc: 'You are a GoldenHour Emergency Champion — maximum preparedness!',    icon: '💎', color: '#2980b9', bg: '#e8f4fd' },
              ].map((t) => {
                const isCurrentTier = scoreData?.tier?.name === t.name;
                return (
                  <div key={t.name} style={{
                    ...styles.tierCard,
                    backgroundColor: t.bg,
                    border: isCurrentTier ? `2.5px solid ${t.color}` : '1.5px solid #f0f0f0',
                  }}>
                    {isCurrentTier && (
                      <div style={{ ...styles.currentTierBadge, backgroundColor: t.color }}>
                        Your Tier
                      </div>
                    )}
                    <div style={styles.tierIcon}>{t.icon}</div>
                    <div style={{ ...styles.tierName, color: t.color }}>{t.name}</div>
                    <div style={styles.tierRange}>{t.range}</div>
                    <div style={styles.tierDesc}>{t.desc}</div>
                  </div>
                );
              })}
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📋 All Point Actions</h2>
              <div style={styles.allActionsTable}>
                {ACTIONS_INFO.map((a) => (
                  <div key={a.id} style={styles.actionTableRow}>
                    <span style={styles.actionTableIcon}>{a.icon}</span>
                    <span style={styles.actionTableLabel}>{a.label}</span>
                    <span style={styles.actionTablePoints}>+{a.points} pts</span>
                  </div>
                ))}
                <div style={{ ...styles.actionTableRow, borderTop: '2px solid #f0f0f0', marginTop: '8px', paddingTop: '8px' }}>
                  <span style={styles.actionTableIcon}>💯</span>
                  <span style={{ ...styles.actionTableLabel, fontWeight: 'bold' }}>Maximum Possible Score</span>
                  <span style={{ ...styles.actionTablePoints, color: '#FA7070', fontWeight: 'bold' }}>
                    {ACTIONS_INFO.reduce((s, a) => s + a.points, 0)} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Static actions list for display ───────────────────────────────────────
const ACTIONS_INFO = [
  { id: 'blood_donor',         label: 'Register as Blood Donor',            points: 20,  icon: '🩸' },
  { id: 'first_responder',     label: 'Register as First Responder',         points: 25,  icon: '🚑' },
  { id: 'organ_donor',         label: 'Register as Organ Donor',             points: 20,  icon: '🫀' },
  { id: 'hospital_registered', label: 'Register a Hospital',                 points: 15,  icon: '🏥' },
  { id: 'blood_type_set',      label: 'Set Blood Type in Profile',           points: 5,   icon: '🩸' },
  { id: 'sos_sent',            label: 'Use Emergency SOS',                   points: 10,  icon: '🆘' },
  { id: 'sos_responded',       label: 'Respond to an SOS Emergency',         points: 15,  icon: '🚑' },
  { id: 'alert_reported',      label: 'Report a Health Alert',               points: 10,  icon: '🦠' },
  { id: 'equipment_lent',      label: 'List Equipment for Lending',          points: 10,  icon: '🤝' },
  { id: 'camp_registered',     label: 'Register for Vaccination Camp',       points: 5,   icon: '💉' },
  { id: 'responder_verified',  label: 'Get Verified as First Responder',     points: 10,  icon: '✅' },
  { id: 'organ_family_consent',label: 'Record Family Consent for Organ Donation', points: 10, icon: '👨‍👩‍👧' },
];

const styles = {
  wrapper:            { minHeight: '100vh', backgroundColor: '#FEFDEC', fontFamily: 'sans-serif' },
  navbar:             { backgroundColor: '#FA7070', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
  navLogo:            { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: '#fff' },
  navLogoText:        { fontWeight: 'bold', color: '#fff' },
  navRight:           { display: 'flex', gap: '8px' },
  backBtn:            { backgroundColor: 'transparent', color: '#fff', border: '1.5px solid #fff', borderRadius: '8px', padding: '7px 14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },
  container:          { maxWidth: '900px', margin: '0 auto', padding: '32px 20px' },
  header:             { textAlign: 'center', marginBottom: '20px' },
  title:              { fontSize: '26px', fontWeight: 'bold', color: '#333', margin: '8px 0 6px' },
  subtitle:           { fontSize: '14px', color: '#888' },
  statsBar:           { display: 'flex', gap: '0', backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #C6EBC5', marginBottom: '20px', overflow: 'hidden' },
  statItem:           { flex: 1, textAlign: 'center', padding: '16px 8px', borderRight: '1px solid #f0f0f0' },
  statIcon:           { fontSize: '22px', marginBottom: '4px' },
  statNum:            { fontSize: '20px', fontWeight: 'bold', color: '#FA7070' },
  statLabel:          { fontSize: '10px', color: '#aaa' },
  tabs:               { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab:                { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #C6EBC5', backgroundColor: '#fff', color: '#888', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  tabActive:          { padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #FA7070', backgroundColor: '#FA7070', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  badgeCard:          { borderRadius: '20px', padding: '28px', border: '2px solid', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  badgeTop:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  badgeTierIcon:      { fontSize: '52px' },
  badgeCenter:        { textAlign: 'center', flex: 1 },
  badgeScore:         { fontSize: '56px', fontWeight: 'bold', lineHeight: 1 },
  badgeMaxScore:      { fontSize: '14px', color: '#aaa', marginBottom: '4px' },
  badgeTierName:      { fontSize: '18px', fontWeight: 'bold' },
  badgeRight:         { textAlign: 'center' },
  badgeCompleted:     { fontSize: '28px', fontWeight: 'bold', color: '#333' },
  badgeCompletedLabel:{ fontSize: '11px', color: '#aaa' },
  progressBarWrap:    { height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' },
  progressBarFill:    { height: '100%', borderRadius: '4px', transition: 'width 0.5s' },
  progressPct:        { fontSize: '12px', fontWeight: '600', textAlign: 'right' },
  shareRow:           { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  shareBtn:           { padding: '10px 22px', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  refreshBtn:         { padding: '10px 18px', backgroundColor: '#FEFDEC', color: '#555', border: '1.5px solid #C6EBC5', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  nextTierCard:       { backgroundColor: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #C6EBC5', marginBottom: '20px' },
  nextTierTitle:      { fontSize: '14px', color: '#333', marginBottom: '4px' },
  nextTierHint:       { fontSize: '12px', color: '#888' },
  platinumBox:        { backgroundColor: '#e8f4fd', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '2px solid #2980b9', marginBottom: '20px' },
  platinumTitle:      { fontSize: '18px', fontWeight: 'bold', color: '#2980b9', marginBottom: '6px' },
  platinumSub:        { fontSize: '13px', color: '#555' },
  quickActionsTitle:  { fontSize: '14px', fontWeight: 'bold', color: '#555', marginBottom: '12px' },
  quickActionsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' },
  quickActionCard:    { backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #C6EBC5', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  quickActionIcon:    { fontSize: '28px', marginBottom: '6px' },
  quickActionLabel:   { fontSize: '12px', color: '#333', fontWeight: '600', marginBottom: '6px' },
  quickActionPoints:  { fontSize: '13px', color: '#FA7070', fontWeight: 'bold' },
  card:               { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #C6EBC5', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  cardTitle:          { fontSize: '17px', fontWeight: 'bold', color: '#333', marginBottom: '6px' },
  cardSub:            { fontSize: '13px', color: '#888', marginBottom: '20px' },
  actionRow:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', marginBottom: '8px', borderRadius: '10px', cursor: 'pointer', backgroundColor: '#FEFDEC' },
  actionLeft:         { display: 'flex', gap: '12px', alignItems: 'center' },
  actionIcon:         { fontSize: '22px' },
  actionLabel:        { fontSize: '14px', fontWeight: '600', color: '#333' },
  actionHint:         { fontSize: '11px', color: '#FA7070' },
  actionRight:        { textAlign: 'center' },
  actionPoints:       { display: 'block', fontSize: '16px', fontWeight: 'bold' },
  actionPtLabel:      { fontSize: '10px', color: '#aaa' },
  myRankCard:         { backgroundColor: '#FEFDEC', borderRadius: '12px', padding: '14px 20px', border: '1.5px solid #FA7070', marginBottom: '16px', fontSize: '14px', color: '#333', textAlign: 'center' },
  lbRow:              { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', marginBottom: '8px', flexWrap: 'wrap' },
  lbRank:             { fontSize: '18px', fontWeight: 'bold', minWidth: '36px', textAlign: 'center' },
  lbName:             { flex: 1, fontSize: '14px', fontWeight: '600', color: '#333', display: 'flex', gap: '8px', alignItems: 'center' },
  youBadge:           { backgroundColor: '#FA7070', color: '#fff', borderRadius: '8px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold' },
  lbMid:              { display: 'flex', gap: '8px', alignItems: 'center' },
  lbTier:             { borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: 'bold' },
  lbActions:          { fontSize: '11px', color: '#aaa' },
  lbScore:            { fontSize: '16px', fontWeight: 'bold', minWidth: '60px', textAlign: 'right' },
  tiersGrid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  tierCard:           { borderRadius: '16px', padding: '24px', textAlign: 'center', position: 'relative' },
  currentTierBadge:   { position: 'absolute', top: '12px', right: '12px', color: '#fff', borderRadius: '8px', padding: '3px 8px', fontSize: '10px', fontWeight: 'bold' },
  tierIcon:           { fontSize: '40px', marginBottom: '8px' },
  tierName:           { fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' },
  tierRange:          { fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: '600' },
  tierDesc:           { fontSize: '12px', color: '#666', lineHeight: '1.5' },
  allActionsTable:    { display: 'flex', flexDirection: 'column', gap: '0' },
  actionTableRow:     { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f9f9f9' },
  actionTableIcon:    { fontSize: '18px', width: '28px', textAlign: 'center' },
  actionTableLabel:   { flex: 1, fontSize: '13px', color: '#555' },
  actionTablePoints:  { fontSize: '13px', fontWeight: 'bold', color: '#27AE60' },
  centerMsg:          { textAlign: 'center', padding: '60px', color: '#888' },
};

export default PreparednesScorePage;