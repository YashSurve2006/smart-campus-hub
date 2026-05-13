/**
 * AI Moderation Engine
 * ────────────────────
 * Faculty mark moderation system:
 *   1. Detects subjects needing moderation (failure rate thresholds)
 *   2. Suggests grace marks and normalization ranges
 *   3. Generates moderation reports with subject-level analysis
 *   4. Calculates post-moderation score projections
 *
 * Pure statistical computation — no external API.
 */

import { query } from '../config/db.js';

/* ------------------------------------------------------------------ */
/* MODERATION ANALYSIS                                                  */
/* ------------------------------------------------------------------ */

/**
 * Returns subjects that need moderation based on failure thresholds.
 * Standard thresholds: failure rate > 30% triggers moderation review.
 */
export async function getModerationCandidates(departmentId, semester) {
  const subjects = await query(
    `SELECT
       sub.id                                                                 AS subject_id,
       sub.code,
       sub.name,
       sub.credits,
       sub.total_marks,
       sub.passing_marks,
       COUNT(r.id)                                                            AS total_entries,
       SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END)                      AS fail_count,
       SUM(CASE WHEN r.status='pass' THEN 1 ELSE 0 END)                      AS pass_count,
       ROUND(AVG(r.marks_obtained), 2)                                        AS avg_marks,
       ROUND(MIN(r.marks_obtained), 2)                                        AS min_marks,
       ROUND(MAX(r.marks_obtained), 2)                                        AS max_marks,
       ROUND(STD(r.marks_obtained), 2)                                        AS std_marks,
       ROUND(AVG(r.percentage), 2)                                            AS avg_percentage
     FROM subjects sub
     JOIN results r ON r.subject_id = sub.id
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY sub.id, sub.code, sub.name, sub.credits, sub.total_marks, sub.passing_marks
     HAVING total_entries >= 3`,
    [departmentId, semester]
  );

  return subjects.map((sub) => {
    const failRate = (Number(sub.fail_count) / Number(sub.total_entries)) * 100;
    const needsModeration = failRate >= 30;

    // Calculate grace marks suggestion
    const graceSuggestion = computeGraceSuggestion({
      avgMarks: Number(sub.avg_marks),
      totalMarks: Number(sub.total_marks),
      passingMarks: Number(sub.passing_marks),
      stdMarks: Number(sub.std_marks),
      failRate,
    });

    // Calculate normalized marks range
    const normalization = computeNormalization({
      avgMarks: Number(sub.avg_marks),
      totalMarks: Number(sub.total_marks),
      targetAvgPct: 55, // target class average after normalization
    });

    return {
      subject_id: sub.subject_id,
      code: sub.code,
      name: sub.name,
      credits: sub.credits,
      totalEntries: Number(sub.total_entries),
      failCount: Number(sub.fail_count),
      passCount: Number(sub.pass_count),
      failRate: Number(failRate.toFixed(2)),
      avgMarks: Number(sub.avg_marks),
      minMarks: Number(sub.min_marks),
      maxMarks: Number(sub.max_marks),
      stdMarks: Number(sub.std_marks),
      avgPercentage: Number(sub.avg_percentage),
      totalMarks: Number(sub.total_marks),
      passingMarks: Number(sub.passing_marks),
      needsModeration,
      moderationUrgency: failRate >= 60 ? 'urgent' : failRate >= 30 ? 'recommended' : 'none',
      graceSuggestion,
      normalization,
      projectedPassRateAfterModeration: computeProjectedPassRate(sub, graceSuggestion.graceMarks),
    };
  }).sort((a, b) => b.failRate - a.failRate);
}

/* ------------------------------------------------------------------ */
/* SUBJECT DIFFICULTY ANALYSIS                                          */
/* ------------------------------------------------------------------ */

/**
 * Ranks subjects by difficulty based on historical performance.
 */
export async function getSubjectDifficultyAnalysis(departmentId, semester) {
  const subjects = await query(
    `SELECT
       sub.id                                                                 AS subject_id,
       sub.code,
       sub.name,
       sub.credits,
       COUNT(r.id)                                                            AS total_entries,
       ROUND(AVG(r.percentage), 2)                                            AS avg_percentage,
       ROUND(STD(r.percentage), 2)                                            AS std_percentage,
       SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END)                      AS fail_count,
       SUM(CASE WHEN r.grade IN ('O','A+') THEN 1 ELSE 0 END)               AS top_grades,
       ROUND(
         SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END) * 100.0
         / NULLIF(COUNT(*),0), 2
       )                                                                      AS fail_rate
     FROM subjects sub
     JOIN results r ON r.subject_id = sub.id
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY sub.id, sub.code, sub.name, sub.credits
     HAVING total_entries >= 3
     ORDER BY avg_percentage ASC`,
    [departmentId, semester]
  );

  return subjects.map((sub, idx) => ({
    ...sub,
    difficultyRank: idx + 1,       // 1 = hardest
    difficultyScore: computeDifficultyScore(Number(sub.avg_percentage), Number(sub.fail_rate)),
    difficultyLabel: classifyDifficulty(Number(sub.avg_percentage), Number(sub.fail_rate)),
    topGradeRate: Number(
      (Number(sub.top_grades) / Number(sub.total_entries) * 100).toFixed(1)
    ),
  }));
}

/* ------------------------------------------------------------------ */
/* FAILURE RATE ANALYSIS                                                */
/* ------------------------------------------------------------------ */

/**
 * Returns a failure heatmap dataset for a department.
 * Groups by subject × exam_type for granular analysis.
 */
export async function getFailureRateMatrix(departmentId, semester) {
  return query(
    `SELECT
       sub.code                                                               AS subject_code,
       sub.name                                                               AS subject_name,
       r.exam_type,
       COUNT(*) AS total,
       SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END)                      AS failures,
       ROUND(
         SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END) * 100.0
         / NULLIF(COUNT(*), 0), 2
       )                                                                      AS fail_rate,
       ROUND(AVG(r.percentage), 2)                                            AS avg_pct
     FROM results r
     JOIN subjects sub ON sub.id = r.subject_id
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY sub.id, sub.code, sub.name, r.exam_type
     ORDER BY fail_rate DESC`,
    [departmentId, semester]
  );
}

/* ------------------------------------------------------------------ */
/* REPORT DATA GENERATION                                               */
/* ------------------------------------------------------------------ */

/**
 * Generates a comprehensive moderation report for a department.
 */
export async function generateModerationReport(departmentId, semester) {
  const [candidates, difficultyAnalysis, failureMatrix] = await Promise.all([
    getModerationCandidates(departmentId, semester),
    getSubjectDifficultyAnalysis(departmentId, semester),
    getFailureRateMatrix(departmentId, semester),
  ]);

  const moderationNeeded = candidates.filter((c) => c.needsModeration);
  const urgentCases = candidates.filter((c) => c.moderationUrgency === 'urgent');

  return {
    reportGeneratedAt: new Date().toISOString(),
    departmentId,
    semester,
    summary: {
      totalSubjects: candidates.length,
      subjectsNeedingModeration: moderationNeeded.length,
      urgentCases: urgentCases.length,
      recommendedGraceRange: urgentCases.length > 0
        ? `${Math.min(...urgentCases.map((c) => c.graceSuggestion.graceMarks))}–${Math.max(...urgentCases.map((c) => c.graceSuggestion.graceMarks))} marks`
        : 'No urgent moderation required',
    },
    moderationCandidates: candidates,
    difficultyRanking: difficultyAnalysis,
    failureMatrix,
  };
}

/* ------------------------------------------------------------------ */
/* MATH UTILITIES                                                       */
/* ------------------------------------------------------------------ */

function computeGraceSuggestion({ avgMarks, totalMarks, passingMarks, stdMarks, failRate }) {
  // Grace = enough to lift the class average 5–10% above passing threshold
  const currentPassPct = (avgMarks / totalMarks) * 100;
  const deficit = Math.max(0, passingMarks - avgMarks);

  let graceMarks = 0;
  if (failRate >= 60) graceMarks = Math.min(Math.ceil(deficit * 0.7 + stdMarks * 0.3), 10);
  else if (failRate >= 40) graceMarks = Math.min(Math.ceil(deficit * 0.5), 7);
  else if (failRate >= 30) graceMarks = Math.min(Math.ceil(deficit * 0.3), 5);

  return {
    graceMarks,
    suggestion: graceMarks > 0
      ? `Add ${graceMarks} grace mark(s) per student to achieve ~${Math.round(currentPassPct + (graceMarks / totalMarks) * 100)}% class average.`
      : 'No grace marks recommended for this subject.',
    approved: graceMarks <= 5, // auto-approve up to 5 grace marks
  };
}

function computeNormalization({ avgMarks, totalMarks, targetAvgPct }) {
  const currentAvgPct = (avgMarks / totalMarks) * 100;
  const scaleFactor = targetAvgPct / (currentAvgPct || 1);
  const cappedScale = Math.min(scaleFactor, 1.25); // max 25% boost

  return {
    scaleFactor: Number(cappedScale.toFixed(3)),
    currentAvgPct: Number(currentAvgPct.toFixed(1)),
    projectedAvgPct: Number(Math.min(targetAvgPct, currentAvgPct * cappedScale).toFixed(1)),
    recommendation: cappedScale > 1.1
      ? `Apply ${((cappedScale - 1) * 100).toFixed(0)}% score scaling to lift class average to ~${targetAvgPct}%.`
      : 'No normalization required.',
  };
}

function computeProjectedPassRate(sub, graceMarks) {
  // Rough projection: how many students would pass with added grace marks
  // This is a heuristic — actual computation would require full distribution
  const liftPct = (graceMarks / Number(sub.total_marks)) * 100;
  const projectedAvgPct = Number(sub.avg_percentage) + liftPct;
  const projectedPassRate = Math.min(
    100,
    Number(
      ((Number(sub.pass_count) + Math.round((graceMarks / 5) * Number(sub.fail_count) * 0.6))
        / Number(sub.total_entries) * 100).toFixed(1)
    )
  );
  return projectedPassRate;
}

function computeDifficultyScore(avgPct, failRate) {
  // Higher score = harder (0–100)
  return Number(Math.min(100, (100 - avgPct) * 0.6 + failRate * 0.4).toFixed(1));
}

function classifyDifficulty(avgPct, failRate) {
  if (failRate >= 50 || avgPct < 40) return 'Very Hard';
  if (failRate >= 30 || avgPct < 55) return 'Hard';
  if (failRate >= 15 || avgPct < 65) return 'Moderate';
  if (failRate >= 5 || avgPct < 75) return 'Easy';
  return 'Very Easy';
}
