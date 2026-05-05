const cron     = require('node-cron');
const Hospital = require('../models/hospitalModel');

// ── Helpers ────────────────────────────────────────────────────────────────
const hoursSince = (date) => (new Date() - new Date(date)) / (1000 * 60 * 60);

const computeReliability = (hospital) => {
  const hrs = hoursSince(hospital.lastUpdated);
  let score = 100;
  if (hrs > 48)      score -= 40;
  else if (hrs > 24) score -= 20;
  else if (hrs > 12) score -= 10;

  const unresolvedReports = hospital.reports.filter((r) => !r.resolved).length;
  score -= unresolvedReports * 5;
  if (hospital.updateCount > 20) score = Math.min(score + 5, 100);
  return Math.max(score, 0);
};

// ── Main quality check ─────────────────────────────────────────────────────
const runDataQualityCheck = async () => {
  try {
    const hospitals = await Hospital.find({});
    let flaggedCount = 0;
    let hiddenCount  = 0;
    let warnedCount  = 0;

    for (const hospital of hospitals) {
      const hrs   = hoursSince(hospital.lastUpdated);
      let changed = false;

      // Recalculate reliability score
      const newScore = computeReliability(hospital);
      if (hospital.reliabilityScore !== newScore) {
        hospital.reliabilityScore = newScore;
        changed = true;
      }

      // Flag hospitals not updated in 48+ hours
      if (hrs > 48 && !hospital.isFlagged) {
        hospital.isFlagged  = true;
        hospital.flaggedAt  = new Date();
        flaggedCount++;
        changed = true;
      }

      // Warn hospitals between 12-24 hours
      if (hrs > 12 && hrs <= 24) {
        warnedCount++;
      }

      // Hide hospitals not updated in 48+ hours (already flagged)
      if (hrs > 48 && hospital.isFlagged) {
        hiddenCount++;
      }

      // Restore flag if recently updated
      if (hrs <= 12 && hospital.isFlagged) {
        hospital.isFlagged = false;
        hospital.flaggedAt = null;
        changed = true;
      }

      if (changed) await hospital.save();
    }

    console.log(`[DataQuality] Check complete — Flagged: ${flaggedCount}, Hidden: ${hiddenCount}, Warned: ${warnedCount}, Total: ${hospitals.length}`);
    return { flaggedCount, hiddenCount, warnedCount, total: hospitals.length };
  } catch (error) {
    console.error('[DataQuality] Error:', error.message);
  }
};

// ── Monthly compliance report ──────────────────────────────────────────────
const generateComplianceReport = async () => {
  try {
    const hospitals  = await Hospital.find({});
    const now        = new Date();
    const report = {
      generatedAt:   now,
      totalHospitals: hospitals.length,
      verified:       hospitals.filter((h) => h.isVerified).length,
      flagged:        hospitals.filter((h) => h.isFlagged).length,
      highReliability:   hospitals.filter((h) => (h.reliabilityScore ?? 100) >= 80).length,
      mediumReliability: hospitals.filter((h) => (h.reliabilityScore ?? 100) >= 50 && (h.reliabilityScore ?? 100) < 80).length,
      lowReliability:    hospitals.filter((h) => (h.reliabilityScore ?? 100) < 50).length,
      totalReports:   hospitals.reduce((sum, h) => sum + (h.reports?.length || 0), 0),
      unresolvedReports: hospitals.reduce((sum, h) => sum + (h.reports?.filter((r) => !r.resolved).length || 0), 0),
      avgReliabilityScore: hospitals.length > 0
        ? Math.round(hospitals.reduce((sum, h) => sum + (h.reliabilityScore ?? 100), 0) / hospitals.length)
        : 100,
      worstPerformers: hospitals
        .filter((h) => (h.reliabilityScore ?? 100) < 50)
        .map((h) => ({
          name:             h.name,
          district:         h.location.district,
          reliabilityScore: h.reliabilityScore ?? 100,
          isFlagged:        h.isFlagged,
          lastUpdated:      h.lastUpdated,
          unresolvedReports: h.reports?.filter((r) => !r.resolved).length || 0,
        }))
        .sort((a, b) => a.reliabilityScore - b.reliabilityScore)
        .slice(0, 10),
    };

    console.log('[DataQuality] Monthly compliance report generated');
    return report;
  } catch (error) {
    console.error('[DataQuality] Report error:', error.message);
  }
};

// ── Cron jobs ──────────────────────────────────────────────────────────────
const startScheduledJobs = () => {
  // Run data quality check every hour
  cron.schedule('0 * * * *', () => {
    console.log('[DataQuality] Running hourly check...');
    runDataQualityCheck();
  });

  // Run monthly compliance report on the 1st of each month at midnight
  cron.schedule('0 0 1 * *', () => {
    console.log('[DataQuality] Generating monthly compliance report...');
    generateComplianceReport();
  });

  console.log('[DataQuality] Scheduled jobs started — hourly check + monthly report');
};

module.exports = { startScheduledJobs, runDataQualityCheck, generateComplianceReport };