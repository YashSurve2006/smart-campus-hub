/**
 * AI Feedback Generator
 * ─────────────────────
 * Generates human-readable AI feedback strings for:
 *   - Students: personalized academic feedback
 *   - Faculty: class performance summaries
 *   - Admin: university-level intelligence alerts
 *
 * Template-based with dynamic variable injection.
 * No external LLM — all text is deterministic and production-safe.
 * Design: Future-proof — swap templates for LLM calls without
 * changing the consumer interface.
 */

/* ------------------------------------------------------------------ */
/* STUDENT FEEDBACK                                                     */
/* ------------------------------------------------------------------ */

/**
 * Generates a personalized AI feedback message for a student.
 * @param {object} params - { cgpa, avgPct, failCount, strongCount, trend, semester }
 * @returns {string} feedback message
 */
export function generateStudentFeedback({ cgpa, avgPct, failCount, strongCount, trend, semester }) {
  const tier = classifyTier(cgpa, avgPct);
  const trendMsg = trend === 'improving'
    ? 'Your performance trajectory is upward — keep this momentum!'
    : trend === 'declining'
    ? 'There\'s a downward trend in your scores. Early intervention will help reverse this.'
    : 'Your performance has been consistent across semesters.';

  const tierMsg = {
    Distinction: `Exceptional academic record! CGPA ${cgpa} places you in the top tier. You\'re on track for distinction honors.`,
    'First Class': `Strong academic performance. CGPA ${cgpa} reflects your dedication. A push for 80%+ in remaining subjects can elevate you further.`,
    'Second Class': `Solid foundation with CGPA ${cgpa}. Targeted revision in weaker subjects can help you cross the First Class threshold.`,
    Pass: `CGPA ${cgpa} indicates you\'re passing, but there\'s significant room for growth. Consistent effort and focused study can transform your results.`,
    'At Risk': `CGPA ${cgpa} requires immediate attention. Please consult your academic advisor and utilize all available academic support resources.`,
  }[tier] || `Academic progress is being tracked for Semester ${semester}.`;

  const failMsg = failCount > 0
    ? ` You have ${failCount} subject(s) to address urgently.`
    : ' No failures — great consistency!';

  const strengthMsg = strongCount > 0
    ? ` You excel in ${strongCount} subject area(s) — leverage these strengths.`
    : '';

  return `${tierMsg}${failMsg}${strengthMsg} ${trendMsg}`;
}

/**
 * Generates short subject-level feedback cards.
 */
export function generateSubjectFeedback(subjectName, percentage, grade) {
  const templates = {
    O: [
      `Outstanding achievement in ${subjectName}! ${percentage}% — you have mastered this subject.`,
      `Excellent work in ${subjectName}. Grade O reflects exceptional understanding.`,
    ],
    'A+': [
      `Superb performance in ${subjectName} (${percentage}%). You\'re among the top scorers.`,
      `Near-perfect score in ${subjectName}. Minimal gaps in this subject.`,
    ],
    A: [
      `Great performance in ${subjectName} (${percentage}%). Small refinements can push you to A+.`,
      `Strong grasp of ${subjectName} demonstrated. Review edge-case topics to reach the next level.`,
    ],
    'B+': [
      `Good score in ${subjectName} (${percentage}%). Focus on advanced problem-solving to improve further.`,
      `Comfortable performance in ${subjectName}. Consistent practice will elevate this grade.`,
    ],
    B: [
      `Satisfactory in ${subjectName} (${percentage}%). Dedicate extra hours to strengthen this area.`,
      `${subjectName} shows room for improvement. Identify and address concept gaps.`,
    ],
    C: [
      `Borderline pass in ${subjectName} (${percentage}%). This subject needs immediate focused study.`,
      `${subjectName} requires attention. Seek faculty guidance and practice exercises.`,
    ],
    F: [
      `${subjectName} needs urgent remediation (${percentage}%). Enroll in supplementary sessions immediately.`,
      `Failed ${subjectName}. Connect with your faculty for a remedial plan and study resources.`,
    ],
  };

  const options = templates[grade] || [`${subjectName}: ${percentage}% — ${grade}`];
  return options[Math.floor(Math.random() * options.length)];
}

/* ------------------------------------------------------------------ */
/* FACULTY FEEDBACK                                                     */
/* ------------------------------------------------------------------ */

/**
 * Generates a class performance summary for faculty.
 */
export function generateClassFeedback({ avgPct, passRate, topperPct, weakestPct, totalStudents }) {
  let summary = '';

  if (passRate >= 90) {
    summary = `Excellent class performance! ${passRate}% pass rate with a ${avgPct}% class average. The instructional approach is clearly effective.`;
  } else if (passRate >= 70) {
    summary = `Good overall class performance. ${passRate}% pass rate — ${Math.round(100 - passRate)}% of students may need additional support.`;
  } else if (passRate >= 50) {
    summary = `Mixed results for this batch. Only ${passRate}% passed. Recommend targeted remedial intervention for lower-performing students.`;
  } else {
    summary = `Challenging semester for the class. ${passRate}% pass rate suggests systemic difficulty. Review exam calibration and teaching methodology.`;
  }

  const spread = Number(topperPct) - Number(weakestPct);
  if (spread > 60) {
    summary += ` Wide performance gap (${weakestPct}% – ${topperPct}%) across ${totalStudents} students — consider differentiated teaching strategies.`;
  }

  return summary;
}

/**
 * Generates an alert message for an anomaly.
 */
export function generateAnomalyAlert(anomaly) {
  const prefixes = {
    critical: '🚨 CRITICAL:',
    warning: '⚠️ WARNING:',
    info: 'ℹ️ INFO:',
  };

  const prefix = prefixes[anomaly.severity] || 'ALERT:';
  return `${prefix} [${anomaly.subject}] ${anomaly.detail}`;
}

/* ------------------------------------------------------------------ */
/* ADMIN FEEDBACK                                                        */
/* ------------------------------------------------------------------ */

/**
 * Generates university-level intelligence summary for admin.
 */
export function generateUniversityInsight({ totalStudents, avgCgpa, passRate, atRiskCount, topDept }) {
  const healthScore = Math.round(passRate * 0.5 + avgCgpa * 10 * 0.3 + (1 - atRiskCount / totalStudents) * 100 * 0.2);

  let insight = '';
  if (healthScore >= 80) {
    insight = `University academic health is EXCELLENT (score: ${healthScore}/100). Overall CGPA ${avgCgpa} with ${passRate}% pass rate.`;
  } else if (healthScore >= 60) {
    insight = `University academic health is GOOD (score: ${healthScore}/100). Targeted support in underperforming departments recommended.`;
  } else if (healthScore >= 40) {
    insight = `University academic health requires ATTENTION (score: ${healthScore}/100). ${atRiskCount} at-risk students need intervention.`;
  } else {
    insight = `University academic health is CRITICAL (score: ${healthScore}/100). Systemic academic support measures should be initiated immediately.`;
  }

  if (topDept) {
    insight += ` Best performing department: ${topDept}.`;
  }

  return { insight, healthScore };
}

/* ------------------------------------------------------------------ */
/* UTILITY                                                              */
/* ------------------------------------------------------------------ */

function classifyTier(cgpa, avgPct) {
  if (cgpa >= 9 || avgPct >= 85) return 'Distinction';
  if (cgpa >= 7.5 || avgPct >= 70) return 'First Class';
  if (cgpa >= 6 || avgPct >= 55) return 'Second Class';
  if (cgpa >= 5 || avgPct >= 40) return 'Pass';
  return 'At Risk';
}
