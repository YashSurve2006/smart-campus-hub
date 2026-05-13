/**
 * AI Analytics Engine
 * ───────────────────
 * Heavy SQL analytics for department comparison, semester trends,
 * subject heatmaps, rank distributions, and university-wide KPIs.
 * Pure statistical computation — no external API dependencies.
 */

import { query, queryOne } from '../config/db.js';

/* ------------------------------------------------------------------ */
/* UNIVERSITY-WIDE OVERVIEW                                            */
/* ------------------------------------------------------------------ */

/**
 * Returns aggregated KPIs for the entire university.
 * Covers all departments + all semesters.
 */
export async function getUniversityOverview() {
  const [totals] = await query(`
    SELECT
      COUNT(DISTINCT r.student_id)                                           AS total_students_with_results,
      ROUND(AVG(r.percentage), 2)                                            AS overall_avg_percentage,
      ROUND(SUM(CASE WHEN r.status = 'pass' THEN 1 ELSE 0 END)
            * 100.0 / NULLIF(COUNT(*), 0), 2)                                AS overall_pass_rate,
      ROUND(AVG(cr.cgpa), 2)                                                 AS avg_cgpa,
      COUNT(DISTINCT s.department_id)                                        AS active_departments,
      COUNT(DISTINCT r.subject_id)                                           AS total_subjects_assessed,
      SUM(CASE WHEN r.status = 'fail' THEN 1 ELSE 0 END)                    AS total_failures,
      COUNT(*)                                                               AS total_result_entries
    FROM results r
    JOIN students s ON s.id = r.student_id
    LEFT JOIN cgpa_records cr ON cr.student_id = r.student_id
  `);

  const gradeBreakdown = await query(`
    SELECT grade, COUNT(*) AS cnt
    FROM results
    GROUP BY grade
    ORDER BY FIELD(grade, 'O','A+','A','B+','B','C','F')
  `);

  const semesterTrend = await query(`
    SELECT
      r.semester,
      ROUND(AVG(r.percentage), 2)   AS avg_percentage,
      ROUND(AVG(cr.sgpa), 2)        AS avg_sgpa,
      COUNT(DISTINCT r.student_id)  AS student_count,
      ROUND(SUM(CASE WHEN r.status='pass' THEN 1 ELSE 0 END)
            * 100.0 / NULLIF(COUNT(*),0), 2) AS pass_rate
    FROM results r
    JOIN students s ON s.id = r.student_id
    LEFT JOIN cgpa_records cr ON cr.student_id = r.student_id AND cr.semester = r.semester
    GROUP BY r.semester
    ORDER BY r.semester
  `);

  return {
    kpis: totals ?? {},
    gradeBreakdown,
    semesterTrend,
  };
}

/* ------------------------------------------------------------------ */
/* DEPARTMENT RANKINGS                                                  */
/* ------------------------------------------------------------------ */

/**
 * Ranks all departments by average percentage + CGPA.
 * Returns podium-style ranking with performance tier labels.
 */
export async function getDepartmentRankings() {
  const rows = await query(`
    SELECT
      d.id                                                                   AS department_id,
      d.name                                                                 AS department_name,
      d.code                                                                 AS department_code,
      COUNT(DISTINCT s.id)                                                   AS student_count,
      COUNT(DISTINCT r.id)                                                   AS result_entries,
      ROUND(AVG(r.percentage), 2)                                            AS avg_percentage,
      ROUND(AVG(cr.cgpa), 2)                                                 AS avg_cgpa,
      ROUND(SUM(CASE WHEN r.status='pass' THEN 1 ELSE 0 END)
            * 100.0 / NULLIF(COUNT(r.id), 0), 2)                            AS pass_rate,
      SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END)                      AS failure_count
    FROM departments d
    LEFT JOIN students s ON s.department_id = d.id
    LEFT JOIN results r ON r.student_id = s.id
    LEFT JOIN cgpa_records cr ON cr.student_id = s.id
    GROUP BY d.id, d.name, d.code
    HAVING result_entries > 0
    ORDER BY avg_percentage DESC
  `);

  return rows.map((row, idx) => ({
    ...row,
    rank: idx + 1,
    performanceTier: classifyPerformanceTier(Number(row.avg_percentage)),
    trend: 'stable', // placeholder — real trend needs time-series comparison
  }));
}

/* ------------------------------------------------------------------ */
/* SUBJECT HEATMAP DATA                                                 */
/* ------------------------------------------------------------------ */

/**
 * Returns per-subject statistics for heatmap visualization.
 * Filterable by department + semester.
 */
export async function getSubjectHeatmap({ departmentId = null, semester = null } = {}) {
  return query(
    `
    SELECT
      sub.id,
      sub.code,
      sub.name,
      sub.credits,
      sub.semester,
      d.name                                                                 AS department_name,
      COUNT(r.id)                                                            AS total_entries,
      ROUND(AVG(r.percentage), 2)                                            AS avg_percentage,
      ROUND(MIN(r.percentage), 2)                                            AS min_percentage,
      ROUND(MAX(r.percentage), 2)                                            AS max_percentage,
      ROUND(SUM(CASE WHEN r.status='pass' THEN 1 ELSE 0 END)
            * 100.0 / NULLIF(COUNT(*), 0), 2)                               AS pass_rate,
      SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END)                      AS failure_count,
      SUM(CASE WHEN r.grade='O' THEN 1 ELSE 0 END)                          AS outstanding_count
    FROM subjects sub
    JOIN departments d ON d.id = sub.department_id
    LEFT JOIN results r ON r.subject_id = sub.id
    WHERE (? IS NULL OR sub.department_id = ?)
      AND (? IS NULL OR sub.semester = ?)
    GROUP BY sub.id, sub.code, sub.name, sub.credits, sub.semester, d.name
    HAVING total_entries > 0
    ORDER BY avg_percentage ASC
    `,
    [departmentId ?? null, departmentId ?? null, semester ?? null, semester ?? null]
  ).then((rows) =>
    rows.map((r) => ({
      ...r,
      heatScore: computeHeatScore(Number(r.avg_percentage), Number(r.pass_rate)),
      difficultyLabel: classifyDifficulty(Number(r.avg_percentage)),
    }))
  );
}

/* ------------------------------------------------------------------ */
/* SEMESTER TREND ANALYSIS                                              */
/* ------------------------------------------------------------------ */

/**
 * Returns semester-wise trend for a specific department.
 */
export async function getDepartmentSemesterTrend(departmentId) {
  return query(
    `
    SELECT
      r.semester,
      ROUND(AVG(r.percentage), 2)                                            AS avg_percentage,
      ROUND(AVG(cr.sgpa), 2)                                                 AS avg_sgpa,
      COUNT(DISTINCT r.student_id)                                           AS student_count,
      ROUND(SUM(CASE WHEN r.status='pass' THEN 1 ELSE 0 END)
            * 100.0 / NULLIF(COUNT(*), 0), 2)                               AS pass_rate,
      SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END)                      AS failure_count
    FROM results r
    JOIN students s ON s.id = r.student_id
    LEFT JOIN cgpa_records cr ON cr.student_id = s.id AND cr.semester = r.semester
    WHERE s.department_id = ?
    GROUP BY r.semester
    ORDER BY r.semester
    `,
    [departmentId]
  );
}

/* ------------------------------------------------------------------ */
/* AT-RISK STUDENT TRACKING                                             */
/* ------------------------------------------------------------------ */

/**
 * Returns students who are at academic risk based on:
 *   - CGPA < 5.0 (below pass class)
 *   - Failure in 2+ subjects in latest semester
 *   - Percentage < 40% in any subject
 */
export async function getAtRiskStudents({ departmentId = null, semester = null, limit = 50 } = {}) {
  const rows = await query(
    `
    SELECT
      s.id                                                                   AS student_id,
      s.student_code,
      u.first_name,
      u.last_name,
      u.email,
      d.name                                                                 AS department_name,
      s.semester                                                             AS current_semester,
      COALESCE(cr.cgpa, 0)                                                   AS cgpa,
      COALESCE(cr.sgpa, 0)                                                   AS latest_sgpa,
      COUNT(r.id)                                                            AS total_results,
      SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END)                      AS fail_count,
      ROUND(AVG(r.percentage), 2)                                            AS avg_percentage,
      MIN(r.percentage)                                                      AS min_percentage
    FROM students s
    JOIN users u ON u.id = s.user_id
    JOIN departments d ON d.id = s.department_id
    LEFT JOIN results r ON r.student_id = s.id
    LEFT JOIN cgpa_records cr ON cr.student_id = s.id
      AND cr.semester = (SELECT MAX(cr2.semester) FROM cgpa_records cr2 WHERE cr2.student_id = s.id)
    WHERE (? IS NULL OR s.department_id = ?)
    GROUP BY s.id, s.student_code, u.first_name, u.last_name, u.email,
             d.name, s.semester, cr.cgpa, cr.sgpa
    HAVING (cgpa < 5.0 AND cgpa > 0)
        OR fail_count >= 2
        OR (avg_percentage < 45 AND avg_percentage > 0)
    ORDER BY cgpa ASC, fail_count DESC
    LIMIT ?
    `,
    [departmentId ?? null, departmentId ?? null, limit]
  );

  return rows.map((r) => ({
    ...r,
    riskLevel: computeRiskLevel(Number(r.cgpa), Number(r.fail_count), Number(r.avg_percentage)),
    riskScore: computeRiskScore(Number(r.cgpa), Number(r.fail_count), Number(r.avg_percentage)),
  }));
}

/* ------------------------------------------------------------------ */
/* TOPPERS LIST                                                         */
/* ------------------------------------------------------------------ */

export async function getToppers({ departmentId = null, semester = null, limit = 10 } = {}) {
  return query(
    `
    SELECT
      s.id                                                                   AS student_id,
      s.student_code,
      u.first_name,
      u.last_name,
      d.name                                                                 AS department_name,
      COALESCE(cr.cgpa, 0)                                                   AS cgpa,
      COALESCE(cr.sgpa, 0)                                                   AS sgpa,
      ROUND(AVG(r.percentage), 2)                                            AS avg_percentage,
      DENSE_RANK() OVER (
        PARTITION BY s.department_id
        ORDER BY AVG(r.percentage) DESC
      )                                                                      AS dept_rank
    FROM results r
    JOIN students s ON s.id = r.student_id
    JOIN users u ON u.id = s.user_id
    JOIN departments d ON d.id = s.department_id
    LEFT JOIN cgpa_records cr ON cr.student_id = s.id
      AND cr.semester = COALESCE(?, (SELECT MAX(cr2.semester) FROM cgpa_records cr2 WHERE cr2.student_id = s.id))
    WHERE (? IS NULL OR s.department_id = ?)
      AND (? IS NULL OR r.semester = ?)
    GROUP BY s.id, s.student_code, u.first_name, u.last_name, d.name, cr.cgpa, cr.sgpa
    ORDER BY avg_percentage DESC
    LIMIT ?
    `,
    [semester ?? null, departmentId ?? null, departmentId ?? null, semester ?? null, semester ?? null, limit]
  );
}

/* ------------------------------------------------------------------ */
/* HELPER CLASSIFIERS                                                   */
/* ------------------------------------------------------------------ */

function classifyPerformanceTier(avgPct) {
  if (avgPct >= 80) return 'Excellent';
  if (avgPct >= 65) return 'Good';
  if (avgPct >= 50) return 'Average';
  if (avgPct >= 40) return 'Below Average';
  return 'Critical';
}

function classifyDifficulty(avgPct) {
  if (avgPct >= 75) return 'Easy';
  if (avgPct >= 60) return 'Moderate';
  if (avgPct >= 45) return 'Hard';
  return 'Very Hard';
}

function computeHeatScore(avgPct, passRate) {
  // 0–100 score. Lower = more problematic (hotter on heatmap)
  return Number(((avgPct * 0.6 + passRate * 0.4) / 100 * 100).toFixed(1));
}

export function computeRiskScore(cgpa, failCount, avgPct) {
  // Higher score = higher risk (0–100)
  let score = 0;
  if (cgpa > 0 && cgpa < 4) score += 40;
  else if (cgpa < 5.5) score += 20;
  else if (cgpa < 6.5) score += 10;

  score += Math.min(failCount * 15, 40);

  if (avgPct < 35) score += 20;
  else if (avgPct < 45) score += 10;
  else if (avgPct < 55) score += 5;

  return Math.min(100, score);
}

export function computeRiskLevel(cgpa, failCount, avgPct) {
  const score = computeRiskScore(cgpa, failCount, avgPct);
  if (score >= 60) return 'critical';
  if (score >= 35) return 'high';
  if (score >= 15) return 'medium';
  return 'low';
}
