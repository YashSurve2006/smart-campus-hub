/**
 * AI Recommendation Engine
 * ────────────────────────
 * Rule-based academic recommendations for students and faculty.
 * Identifies weak subjects, suggests improvement areas, generates
 * performance tier labels and personalized study guidance.
 * No external API — fully deterministic rule engine.
 */

import { query } from '../config/db.js';

/* ------------------------------------------------------------------ */
/* STUDENT RECOMMENDATIONS                                              */
/* ------------------------------------------------------------------ */

/**
 * Generates personalized recommendations for a student
 * based on their full result history.
 */
export async function generateStudentRecommendations(studentId) {
  const results = await query(
    `SELECT r.semester, r.exam_type, r.percentage, r.grade, r.status,
            sub.code, sub.name, sub.credits
     FROM results r
     JOIN subjects sub ON sub.id = r.subject_id
     WHERE r.student_id = ?
     ORDER BY r.semester, sub.code`,
    [studentId]
  );

  const cgpaRow = await query(
    `SELECT semester, sgpa, cgpa FROM cgpa_records WHERE student_id = ? ORDER BY semester`,
    [studentId]
  );

  if (!results.length) {
    return {
      recommendations: [
        {
          category: 'general',
          priority: 'medium',
          icon: 'info',
          title: 'No Results Available',
          description: 'Your academic results have not been published yet. Check back after examinations.',
        },
      ],
      weakSubjects: [],
      strongSubjects: [],
      performanceTier: 'N/A',
      aiSummary: 'Insufficient data to generate recommendations.',
    };
  }

  const weakSubjects = results.filter((r) => Number(r.percentage) < 50);
  const criticalSubjects = results.filter((r) => Number(r.percentage) < 35);
  const strongSubjects = results.filter((r) => Number(r.percentage) >= 80);
  const failedSubjects = results.filter((r) => r.status === 'fail');

  const latestCgpa = cgpaRow.length ? Number(cgpaRow[cgpaRow.length - 1].cgpa) : 0;
  const avgPct = results.reduce((sum, r) => sum + Number(r.percentage), 0) / results.length;

  const recommendations = [];

  // Critical failures
  if (criticalSubjects.length > 0) {
    recommendations.push({
      category: 'urgent',
      priority: 'high',
      icon: 'alert-triangle',
      title: 'Critical Performance Alert',
      description: `You scored below 35% in ${criticalSubjects.length} subject(s): ${criticalSubjects.map((s) => s.name).join(', ')}. Immediate remedial action is recommended.`,
    });
  }

  // Supplementary/re-exam needed
  if (failedSubjects.length > 0) {
    recommendations.push({
      category: 'academics',
      priority: 'high',
      icon: 'book-x',
      title: 'Subjects Requiring Attention',
      description: `Failed ${failedSubjects.length} subject(s). Consider consulting faculty for supplementary exam eligibility and study materials.`,
    });
  }

  // Weak subjects (35–50%)
  const midWeakSubjects = weakSubjects.filter((r) => Number(r.percentage) >= 35 && Number(r.percentage) < 50);
  if (midWeakSubjects.length > 0) {
    recommendations.push({
      category: 'academics',
      priority: 'medium',
      icon: 'trending-down',
      title: 'Improvement Areas Identified',
      description: `${midWeakSubjects.length} subject(s) need attention (35–50% range): ${midWeakSubjects.map((s) => s.code).join(', ')}. Focus on practice problems and revision.`,
    });
  }

  // CGPA-based recommendation
  if (latestCgpa > 0 && latestCgpa < 6.0) {
    recommendations.push({
      category: 'gpa',
      priority: 'medium',
      icon: 'target',
      title: 'CGPA Improvement Strategy',
      description: `Current CGPA: ${latestCgpa}. To reach First Class (7.5+), aim for 80%+ in upcoming exams. Focus on high-credit subjects.`,
    });
  } else if (latestCgpa >= 7.5 && latestCgpa < 9.0) {
    recommendations.push({
      category: 'gpa',
      priority: 'low',
      icon: 'star',
      title: 'Distinction Within Reach',
      description: `Excellent! CGPA ${latestCgpa} — you need ${(9.0 - latestCgpa).toFixed(2)} more points to reach Distinction (9.0). Maintain consistency.`,
    });
  }

  // Strong subjects — leverage them
  if (strongSubjects.length > 0) {
    recommendations.push({
      category: 'strength',
      priority: 'low',
      icon: 'award',
      title: 'Your Academic Strengths',
      description: `Outstanding performance in ${strongSubjects.slice(0, 3).map((s) => s.name).join(', ')}. Consider leadership roles or peer tutoring in these areas.`,
    });
  }

  // Study consistency recommendation
  if (avgPct >= 40 && avgPct < 60) {
    recommendations.push({
      category: 'strategy',
      priority: 'medium',
      icon: 'calendar',
      title: 'Study Schedule Optimization',
      description: 'Create a structured daily study schedule. Allocate more time to subjects below 50%. Attend all extra sessions offered by faculty.',
    });
  }

  // Trend-based recommendation
  if (cgpaRow.length >= 2) {
    const trend = Number(cgpaRow[cgpaRow.length - 1].sgpa) - Number(cgpaRow[cgpaRow.length - 2].sgpa);
    if (trend < -0.5) {
      recommendations.push({
        category: 'trend',
        priority: 'high',
        icon: 'trending-down',
        title: 'Declining Performance Detected',
        description: `SGPA dropped by ${Math.abs(trend).toFixed(2)} points this semester. Identify and address root causes — consider counseling support.`,
      });
    } else if (trend > 0.5) {
      recommendations.push({
        category: 'trend',
        priority: 'low',
        icon: 'trending-up',
        title: 'Great Academic Progress!',
        description: `SGPA improved by ${trend.toFixed(2)} points. Your hard work is showing. Keep this momentum going!`,
      });
    }
  }

  return {
    recommendations: recommendations.slice(0, 6), // max 6 recommendations
    weakSubjects: weakSubjects.map((s) => ({ code: s.code, name: s.name, percentage: s.percentage })),
    strongSubjects: strongSubjects.map((s) => ({ code: s.code, name: s.name, percentage: s.percentage })),
    performanceTier: classifyStudentTier(avgPct, latestCgpa),
    aiSummary: generateSummary(avgPct, latestCgpa, failedSubjects.length, strongSubjects.length),
  };
}

/* ------------------------------------------------------------------ */
/* FACULTY RECOMMENDATIONS                                              */
/* ------------------------------------------------------------------ */

/**
 * Generates subject-level teaching recommendations for faculty
 * based on class performance patterns.
 */
export async function generateFacultyRecommendations(departmentId, semester) {
  const subjectStats = await query(
    `SELECT
       sub.code, sub.name, sub.credits,
       COUNT(r.id)                                                           AS entries,
       ROUND(AVG(r.percentage), 2)                                           AS avg_pct,
       ROUND(MIN(r.percentage), 2)                                           AS min_pct,
       ROUND(MAX(r.percentage), 2)                                           AS max_pct,
       SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END)                     AS failures,
       COUNT(DISTINCT r.student_id)                                          AS student_count
     FROM subjects sub
     JOIN results r ON r.subject_id = sub.id
     JOIN students s ON s.id = r.student_id
     WHERE s.department_id = ? AND r.semester = ?
     GROUP BY sub.id, sub.code, sub.name, sub.credits`,
    [departmentId, semester]
  );

  const recommendations = [];

  for (const sub of subjectStats) {
    const passRate = ((sub.student_count - sub.failures) / sub.student_count) * 100;
    const spreadScore = sub.max_pct - sub.min_pct;

    if (passRate < 30) {
      recommendations.push({
        subject: sub.code,
        subjectName: sub.name,
        category: 'moderation',
        priority: 'high',
        recommendation: `Only ${passRate.toFixed(0)}% pass rate. Consider grace marks or supplementary revision sessions.`,
        action: 'Review examination difficulty and consider moderation.',
      });
    } else if (passRate < 50) {
      recommendations.push({
        subject: sub.code,
        subjectName: sub.name,
        category: 'intervention',
        priority: 'medium',
        recommendation: `${passRate.toFixed(0)}% pass rate — below department benchmark. Targeted remedial classes recommended.`,
        action: 'Schedule doubt-clearing sessions and provide additional study material.',
      });
    }

    if (spreadScore > 60 && sub.entries >= 5) {
      recommendations.push({
        subject: sub.code,
        subjectName: sub.name,
        category: 'distribution',
        priority: 'low',
        recommendation: `Wide score spread (${sub.min_pct}–${sub.max_pct}%). High variability suggests uneven concept understanding.`,
        action: 'Consider differentiated teaching strategies.',
      });
    }
  }

  return recommendations;
}

/* ------------------------------------------------------------------ */
/* CLASSIFIERS                                                          */
/* ------------------------------------------------------------------ */

function classifyStudentTier(avgPct, cgpa) {
  if (avgPct >= 85 || cgpa >= 9) return 'Distinction';
  if (avgPct >= 70 || cgpa >= 7.5) return 'First Class';
  if (avgPct >= 55 || cgpa >= 6) return 'Second Class';
  if (avgPct >= 40 || cgpa >= 5) return 'Pass';
  return 'At Risk';
}

function generateSummary(avgPct, cgpa, failCount, strongCount) {
  const tier = classifyStudentTier(avgPct, cgpa);
  let summary = `Performance tier: ${tier}. `;

  if (failCount > 0) {
    summary += `${failCount} subject(s) still need attention. `;
  }
  if (strongCount > 0) {
    summary += `Showing strength in ${strongCount} subject(s). `;
  }
  if (cgpa > 0) {
    summary += `Current CGPA: ${cgpa}.`;
  }
  return summary;
}
