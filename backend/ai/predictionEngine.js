/**
 * AI Prediction Engine
 * ────────────────────
 * Statistical pass/fail risk scoring, GPA trajectory prediction,
 * and rank estimation using historical cgpa_records data.
 * Algorithms: weighted moving averages, linear regression (2–6 points).
 * No external API — fully offline deterministic computation.
 */

import { query, queryOne } from '../config/db.js';

/* ------------------------------------------------------------------ */
/* STUDENT PERFORMANCE PREDICTION                                       */
/* ------------------------------------------------------------------ */

/**
 * Predicts a student's next-semester SGPA using linear regression
 * on their historical SGPA values.
 */
export async function predictNextSgpa(studentId) {
  const history = await query(
    `SELECT semester, sgpa, total_credits
     FROM cgpa_records
     WHERE student_id = ?
     ORDER BY semester`,
    [studentId]
  );

  if (!history.length) return { predictedSgpa: null, trend: 'unknown', confidence: 0 };

  if (history.length === 1) {
    return {
      predictedSgpa: Number(history[0].sgpa),
      trend: 'stable',
      confidence: 30,
      note: 'Single semester — prediction accuracy low',
    };
  }

  const n = history.length;
  const xs = history.map((_, i) => i + 1);            // x = semester index (1, 2, 3…)
  const ys = history.map((h) => Number(h.sgpa));       // y = sgpa

  const { slope, intercept } = linearRegression(xs, ys);
  const predictedSgpa = Math.max(0, Math.min(10, intercept + slope * (n + 1)));
  const trend = slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable';

  // Confidence = based on R² of the regression
  const rSquared = computeRSquared(xs, ys, slope, intercept);
  const confidence = Math.round(Math.min(95, Math.max(30, rSquared * 100)));

  return {
    predictedSgpa: Number(predictedSgpa.toFixed(2)),
    trend,
    confidence,
    slope: Number(slope.toFixed(3)),
    historicalSemesters: n,
  };
}

/**
 * Predicts whether a student will pass their current semester
 * based on current avg percentage and historical pass patterns.
 */
export async function predictPassFail(studentId, semester) {
  // Current semester interim results
  const current = await query(
    `SELECT r.percentage, r.status, sub.credits
     FROM results r
     JOIN subjects sub ON sub.id = r.subject_id
     WHERE r.student_id = ? AND r.semester = ?`,
    [studentId, semester]
  );

  if (!current.length) return { prediction: 'insufficient_data', probability: null };

  const avgPct = current.reduce((sum, r) => sum + Number(r.percentage), 0) / current.length;
  const failRatio = current.filter((r) => r.status === 'fail').length / current.length;
  const weightedPct = computeWeightedAverage(current.map((r) => ({ value: r.percentage, weight: r.credits })));

  // Historical fail rate for this student
  const historical = await queryOne(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN status='fail' THEN 1 ELSE 0 END) AS fails
     FROM results WHERE student_id = ? AND semester < ?`,
    [studentId, semester]
  );
  const historicalFailRate = historical?.total > 0
    ? Number(historical.fails) / Number(historical.total)
    : 0;

  // Combine signals: current + historical
  const passProbability = Math.min(
    99,
    Math.max(
      1,
      Math.round(
        (weightedPct * 0.6 + (1 - failRatio) * 100 * 0.25 + (1 - historicalFailRate) * 100 * 0.15)
      )
    )
  );

  return {
    prediction: passProbability >= 55 ? 'pass' : 'at_risk',
    probability: passProbability,
    currentAvgPct: Number(avgPct.toFixed(2)),
    currentFailRatio: Number((failRatio * 100).toFixed(1)),
    weightedAvgPct: Number(weightedPct.toFixed(2)),
    dataPoints: current.length,
  };
}

/**
 * Estimates rank range for a student within their department + semester.
 */
export async function estimateRank(studentId, departmentId, semester) {
  const allStudents = await query(
    `SELECT r.student_id, ROUND(AVG(r.percentage), 2) AS avg_pct
     FROM results r
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY r.student_id
     ORDER BY avg_pct DESC`,
    [departmentId, semester]
  );

  if (!allStudents.length) return { rank: null, totalStudents: 0, percentile: null };

  const totalStudents = allStudents.length;
  const myIndex = allStudents.findIndex((s) => s.student_id === studentId);
  const rank = myIndex >= 0 ? myIndex + 1 : null;
  const percentile = rank ? Math.round((1 - rank / totalStudents) * 100) : null;

  return {
    rank,
    totalStudents,
    percentile,
    myAvgPct: myIndex >= 0 ? Number(allStudents[myIndex].avg_pct) : null,
    topStudentPct: Number(allStudents[0]?.avg_pct ?? 0),
  };
}

/* ------------------------------------------------------------------ */
/* SUBJECT-LEVEL PERFORMANCE FORECAST                                   */
/* ------------------------------------------------------------------ */

/**
 * Returns predicted difficulty / class average for upcoming subjects
 * based on the same subject's historical averages across semesters.
 */
export async function getSubjectForecast(subjectId) {
  const history = await query(
    `SELECT r.semester, ROUND(AVG(r.percentage), 2) AS avg_pct, COUNT(*) AS entry_count
     FROM results r
     WHERE r.subject_id = ?
     GROUP BY r.semester
     ORDER BY r.semester`,
    [subjectId]
  );

  if (!history.length) return { forecast: null };

  const avgHist = history.reduce((sum, h) => sum + Number(h.avg_pct), 0) / history.length;

  return {
    historicalAvg: Number(avgHist.toFixed(2)),
    dataPoints: history.length,
    trend: history.length >= 2 ? detectTrend(history.map((h) => Number(h.avg_pct))) : 'stable',
    history,
  };
}

/* ------------------------------------------------------------------ */
/* BULK STUDENT PREDICTION (for admin/faculty views)                    */
/* ------------------------------------------------------------------ */

/**
 * Returns pass/fail risk classification for all students in a dept+sem.
 * Used by faculty AI assistant for at-risk flagging.
 */
export async function bulkPredictRisk(departmentId, semester) {
  const students = await query(
    `SELECT
       s.id AS student_id,
       s.student_code,
       u.first_name,
       u.last_name,
       COALESCE(cr.cgpa, 0)                                                  AS cgpa,
       ROUND(AVG(r.percentage), 2)                                           AS avg_pct,
       SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END)                     AS fail_count,
       COUNT(r.id)                                                           AS result_count
     FROM students s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN results r ON r.student_id = s.id AND r.semester = ?
     LEFT JOIN cgpa_records cr ON cr.student_id = s.id
       AND cr.semester = (SELECT MAX(cr2.semester) FROM cgpa_records cr2 WHERE cr2.student_id = s.id)
     WHERE s.department_id = ?
     GROUP BY s.id, s.student_code, u.first_name, u.last_name, cr.cgpa
     HAVING result_count > 0`,
    [semester, departmentId]
  );

  return students.map((st) => {
    const cgpa = Number(st.cgpa);
    const avgPct = Number(st.avg_pct);
    const failCount = Number(st.fail_count);

    const passProbability = Math.min(
      99,
      Math.max(
        1,
        Math.round(
          avgPct * 0.55 +
          (1 - failCount / Math.max(st.result_count, 1)) * 100 * 0.25 +
          cgpa * 10 * 0.2
        )
      )
    );

    return {
      ...st,
      passProbability,
      riskLevel:
        passProbability < 40 ? 'critical' :
        passProbability < 60 ? 'high' :
        passProbability < 75 ? 'medium' : 'low',
    };
  });
}

/* ------------------------------------------------------------------ */
/* MATH UTILITIES                                                       */
/* ------------------------------------------------------------------ */

function linearRegression(xs, ys) {
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function computeRSquared(xs, ys, slope, intercept) {
  const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
  const ssTot = ys.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
  const ssRes = xs.reduce((sum, x, i) => sum + (ys[i] - (intercept + slope * x)) ** 2, 0);
  if (ssTot === 0) return 1;
  return 1 - ssRes / ssTot;
}

function computeWeightedAverage(items) {
  const totalWeight = items.reduce((sum, i) => sum + Number(i.weight || 1), 0);
  if (!totalWeight) return 0;
  return items.reduce((sum, i) => sum + Number(i.value) * Number(i.weight || 1), 0) / totalWeight;
}

function detectTrend(values) {
  if (values.length < 2) return 'stable';
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  if (delta > 3) return 'improving';
  if (delta < -3) return 'declining';
  return 'stable';
}
