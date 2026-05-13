/**
 * AI Anomaly Detector
 * ───────────────────
 * Detects statistical anomalies in result data:
 *   1. Duplicate/identical marks patterns (copy detection)
 *   2. Z-score outliers per subject (extreme high/low)
 *   3. Abnormal class distributions (too many passes/fails)
 *   4. Sudden CGPA spikes or drops per student
 *
 * All computations are pure statistics — no external API.
 * Returns flagged entries with severity levels and descriptions.
 */

import { query } from '../config/db.js';

/* ------------------------------------------------------------------ */
/* MAIN ANOMALY SCAN                                                    */
/* ------------------------------------------------------------------ */

/**
 * Runs all anomaly detectors for a given department + semester.
 * Returns a combined report with severity-ranked anomalies.
 */
export async function scanForAnomalies(departmentId, semester) {
  const [duplicates, outliers, distributionAnomalies] = await Promise.all([
    detectDuplicateMarks(departmentId, semester),
    detectOutlierMarks(departmentId, semester),
    detectAbnormalDistributions(departmentId, semester),
  ]);

  const allAnomalies = [
    ...duplicates,
    ...outliers,
    ...distributionAnomalies,
  ].sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));

  return {
    totalAnomalies: allAnomalies.length,
    critical: allAnomalies.filter((a) => a.severity === 'critical').length,
    warning: allAnomalies.filter((a) => a.severity === 'warning').length,
    info: allAnomalies.filter((a) => a.severity === 'info').length,
    anomalies: allAnomalies,
    scannedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* DETECTOR 1 — DUPLICATE / IDENTICAL MARKS                            */
/* ------------------------------------------------------------------ */

/**
 * Flags subjects where many students received exactly the same marks.
 * Threshold: if ≥ 30% of students share the same score → suspicious.
 */
async function detectDuplicateMarks(departmentId, semester) {
  const subjectResults = await query(
    `SELECT
       sub.code, sub.name, r.subject_id,
       r.marks_obtained,
       COUNT(*) AS occurrence_count,
       COUNT(*) * 100.0 / NULLIF(
         (SELECT COUNT(*) FROM results r2
          JOIN students s2 ON s2.id = r2.student_id
          WHERE r2.subject_id = r.subject_id AND r2.semester = r.semester
            AND s2.department_id = ?), 0
       )                                                                     AS occurrence_pct
     FROM results r
     JOIN subjects sub ON sub.id = r.subject_id
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY r.subject_id, r.marks_obtained, sub.code, sub.name
     HAVING occurrence_count >= 3 AND occurrence_pct >= 30
     ORDER BY occurrence_pct DESC`,
    [departmentId, departmentId, semester]
  );

  return subjectResults.map((row) => ({
    type: 'duplicate_marks',
    severity: row.occurrence_pct >= 60 ? 'critical' : 'warning',
    subject: row.code,
    subjectName: row.name,
    detail: `${row.occurrence_count} students scored exactly ${row.marks_obtained} marks (${Number(row.occurrence_pct).toFixed(1)}% of class).`,
    affectedCount: row.occurrence_count,
    value: row.marks_obtained,
    recommendation: 'Review mark entry for possible copy/paste errors. Cross-check answer scripts.',
  }));
}

/* ------------------------------------------------------------------ */
/* DETECTOR 2 — Z-SCORE OUTLIERS                                        */
/* ------------------------------------------------------------------ */

/**
 * Detects marks that are statistically anomalous (Z-score > 2.5 or < -2.5).
 * Returns entries significantly above/below the subject mean.
 */
async function detectOutlierMarks(departmentId, semester) {
  // Get per-subject stats
  const subjectStats = await query(
    `SELECT
       r.subject_id,
       sub.code, sub.name,
       ROUND(AVG(r.marks_obtained), 2)  AS mean_marks,
       ROUND(STD(r.marks_obtained), 2)  AS std_marks,
       COUNT(*)                          AS count
     FROM results r
     JOIN subjects sub ON sub.id = r.subject_id
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY r.subject_id, sub.code, sub.name
     HAVING count >= 5 AND std_marks > 0`,
    [departmentId, semester]
  );

  const outliers = [];

  for (const subj of subjectStats) {
    const mean = Number(subj.mean_marks);
    const std = Number(subj.std_marks);
    if (!std) continue;

    // Get individual entries
    const entries = await query(
      `SELECT r.id, r.student_id, r.marks_obtained, u.first_name, u.last_name, s.student_code
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN users u ON u.id = s.user_id
       WHERE r.subject_id = ? AND r.semester = ? AND s.department_id = ?`,
      [subj.subject_id, semester, departmentId]
    );

    for (const entry of entries) {
      const zScore = (Number(entry.marks_obtained) - mean) / std;
      if (Math.abs(zScore) > 2.5) {
        outliers.push({
          type: 'statistical_outlier',
          severity: Math.abs(zScore) > 3.5 ? 'critical' : 'warning',
          subject: subj.code,
          subjectName: subj.name,
          detail: `${entry.first_name} ${entry.last_name} (${entry.student_code}): ${entry.marks_obtained} marks (Z=${zScore.toFixed(2)}, mean=${mean}).`,
          studentName: `${entry.first_name} ${entry.last_name}`,
          studentCode: entry.student_code,
          marksObtained: entry.marks_obtained,
          zScore: Number(zScore.toFixed(2)),
          direction: zScore > 0 ? 'above_average' : 'below_average',
          recommendation: zScore > 0
            ? 'Verify this unusually high score against the answer script.'
            : 'Verify this unusually low score — possible marking error.',
        });
      }
    }
  }

  return outliers.slice(0, 30); // cap to avoid overwhelming reports
}

/* ------------------------------------------------------------------ */
/* DETECTOR 3 — ABNORMAL DISTRIBUTIONS                                  */
/* ------------------------------------------------------------------ */

/**
 * Flags subjects with abnormal pass/fail distributions.
 */
async function detectAbnormalDistributions(departmentId, semester) {
  const subjects = await query(
    `SELECT
       sub.code, sub.name, r.subject_id,
       COUNT(*) AS total,
       SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END)  AS failures,
       SUM(CASE WHEN r.grade='O' THEN 1 ELSE 0 END)       AS outstanding,
       ROUND(AVG(r.percentage), 2)                         AS avg_pct,
       ROUND(STD(r.percentage), 2)                         AS std_pct
     FROM results r
     JOIN subjects sub ON sub.id = r.subject_id
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY r.subject_id, sub.code, sub.name
     HAVING total >= 3`,
    [departmentId, semester]
  );

  const anomalies = [];

  for (const sub of subjects) {
    const failRate = (Number(sub.failures) / Number(sub.total)) * 100;
    const outstandingRate = (Number(sub.outstanding) / Number(sub.total)) * 100;

    // Mass failure
    if (failRate >= 60) {
      anomalies.push({
        type: 'mass_failure',
        severity: failRate >= 80 ? 'critical' : 'warning',
        subject: sub.code,
        subjectName: sub.name,
        detail: `${failRate.toFixed(0)}% failure rate (${sub.failures}/${sub.total} students failed).`,
        metric: failRate,
        recommendation: 'Consider grace marks policy or moderation. Review exam difficulty level.',
      });
    }

    // Suspicious mass outstanding
    if (outstandingRate >= 70 && sub.avg_pct >= 90) {
      anomalies.push({
        type: 'inflated_scores',
        severity: 'warning',
        subject: sub.code,
        subjectName: sub.name,
        detail: `${outstandingRate.toFixed(0)}% of students scored Outstanding grade. Average: ${sub.avg_pct}%.`,
        metric: outstandingRate,
        recommendation: 'Verify marking scheme — unusually high scores across the class.',
      });
    }

    // Very low standard deviation (everyone got same-ish marks)
    if (Number(sub.std_pct) < 3 && Number(sub.total) >= 10) {
      anomalies.push({
        type: 'low_variance',
        severity: 'info',
        subject: sub.code,
        subjectName: sub.name,
        detail: `Standard deviation: ${sub.std_pct}%. Very low score variance across ${sub.total} students.`,
        metric: sub.std_pct,
        recommendation: 'Low variance may indicate bulk entry. Verify individual answer scripts.',
      });
    }
  }

  return anomalies;
}

/* ------------------------------------------------------------------ */
/* CGPA SPIKE DETECTION (per student, admin view)                       */
/* ------------------------------------------------------------------ */

/**
 * Detects students with sudden CGPA changes between semesters.
 * Returns list of students with spike/drop beyond 1.5 points.
 */
export async function detectCgpaSpikes(departmentId, threshold = 1.5) {
  const history = await query(
    `SELECT
       cr.student_id,
       cr.semester,
       cr.sgpa,
       s.student_code,
       u.first_name,
       u.last_name
     FROM cgpa_records cr
     JOIN students s ON s.id = cr.student_id
     JOIN users u ON u.id = s.user_id
     WHERE s.department_id = ?
     ORDER BY cr.student_id, cr.semester`,
    [departmentId]
  );

  // Group by student
  const studentMap = {};
  for (const row of history) {
    if (!studentMap[row.student_id]) {
      studentMap[row.student_id] = {
        student_id: row.student_id,
        student_code: row.student_code,
        name: `${row.first_name} ${row.last_name}`,
        semesters: [],
      };
    }
    studentMap[row.student_id].semesters.push({ semester: row.semester, sgpa: Number(row.sgpa) });
  }

  const spikes = [];
  for (const student of Object.values(studentMap)) {
    const sems = student.semesters;
    for (let i = 1; i < sems.length; i++) {
      const delta = sems[i].sgpa - sems[i - 1].sgpa;
      if (Math.abs(delta) >= threshold) {
        spikes.push({
          ...student,
          fromSemester: sems[i - 1].semester,
          toSemester: sems[i].semester,
          fromSgpa: sems[i - 1].sgpa,
          toSgpa: sems[i].sgpa,
          delta: Number(delta.toFixed(2)),
          type: delta > 0 ? 'spike_up' : 'spike_down',
          severity: Math.abs(delta) >= 3 ? 'critical' : Math.abs(delta) >= 2 ? 'warning' : 'info',
        });
      }
    }
  }

  return spikes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

/* ------------------------------------------------------------------ */
/* UTILITY                                                              */
/* ------------------------------------------------------------------ */

function severityWeight(severity) {
  return severity === 'critical' ? 3 : severity === 'warning' ? 2 : 1;
}
