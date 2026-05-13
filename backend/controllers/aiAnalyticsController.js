/**
 * AI Analytics Controller
 * ───────────────────────
 * Thin controller layer — validates input, delegates to AI engine
 * modules, and serializes responses. Keeps all business logic in
 * the engine modules (analyticsEngine, predictionEngine, etc.).
 *
 * Routes:
 *   GET  /api/ai-analytics/student/insights          (student)
 *   GET  /api/ai-analytics/faculty/moderation        (faculty, admin)
 *   GET  /api/ai-analytics/faculty/anomalies         (faculty, admin)
 *   GET  /api/ai-analytics/faculty/subject-difficulty(faculty, admin)
 *   GET  /api/ai-analytics/faculty/failure-matrix    (faculty, admin)
 *   GET  /api/ai-analytics/admin/overview            (admin)
 *   GET  /api/ai-analytics/admin/department-rankings (admin)
 *   GET  /api/ai-analytics/admin/risk-students       (admin)
 *   GET  /api/ai-analytics/admin/heatmap             (admin)
 *   GET  /api/ai-analytics/admin/toppers             (admin)
 *   POST /api/ai-analytics/report/generate           (faculty, admin)
 */

import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query, queryOne } from '../config/db.js';

// AI Engines
import {
  getUniversityOverview,
  getDepartmentRankings,
  getSubjectHeatmap,
  getDepartmentSemesterTrend,
  getAtRiskStudents,
  getToppers,
} from '../ai/analyticsEngine.js';

import {
  predictNextSgpa,
  predictPassFail,
  estimateRank,
  bulkPredictRisk,
} from '../ai/predictionEngine.js';

import {
  generateStudentRecommendations,
  generateFacultyRecommendations,
} from '../ai/recommendationEngine.js';

import {
  scanForAnomalies,
  detectCgpaSpikes,
} from '../ai/anomalyDetector.js';

import {
  generateStudentFeedback,
  generateClassFeedback,
  generateUniversityInsight,
  generateAnomalyAlert,
} from '../ai/feedbackGenerator.js';

import {
  getModerationCandidates,
  getSubjectDifficultyAnalysis,
  getFailureRateMatrix,
  generateModerationReport,
} from '../ai/moderationEngine.js';

/* ------------------------------------------------------------------ */
/* STUDENT ENDPOINTS                                                     */
/* ------------------------------------------------------------------ */

/**
 * GET /api/ai-analytics/student/insights
 * Returns AI insights, predictions, and recommendations for the
 * authenticated student.
 */
export const studentInsights = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const student = await queryOne(
    `SELECT s.id, s.department_id, s.semester, s.student_code,
            u.first_name, u.last_name, d.name AS department_name
     FROM students s
     JOIN users u ON u.id = s.user_id
     JOIN departments d ON d.id = s.department_id
     WHERE s.user_id = ?`,
    [userId]
  );

  if (!student) throw new AppError('Student profile not found', 404);

  const cgpaHistory = await query(
    `SELECT semester, sgpa, cgpa, total_credits
     FROM cgpa_records WHERE student_id = ? ORDER BY semester`,
    [student.id]
  );

  const latestSem = cgpaHistory.length
    ? cgpaHistory[cgpaHistory.length - 1]
    : null;

  const [
    prediction,
    passFail,
    rankData,
    recommendations,
  ] = await Promise.all([
    predictNextSgpa(student.id),
    latestSem
      ? predictPassFail(student.id, latestSem.semester)
      : Promise.resolve(null),
    latestSem
      ? estimateRank(student.id, student.department_id, latestSem.semester)
      : Promise.resolve(null),
    generateStudentRecommendations(student.id),
  ]);

  const feedback = generateStudentFeedback({
    cgpa: latestSem ? Number(latestSem.cgpa) : 0,
    avgPct: recommendations.weakSubjects.length > 0 ? 45 : 70,
    failCount: recommendations.weakSubjects.length,
    strongCount: recommendations.strongSubjects.length,
    trend: prediction.trend,
    semester: student.semester,
  });

  res.json({
    success: true,
    student,
    cgpaHistory,
    prediction,
    passFail,
    rankData,
    recommendations: recommendations.recommendations,
    weakSubjects: recommendations.weakSubjects,
    strongSubjects: recommendations.strongSubjects,
    performanceTier: recommendations.performanceTier,
    aiSummary: recommendations.aiSummary,
    aiFeedback: feedback,
  });
});

/* ------------------------------------------------------------------ */
/* FACULTY ENDPOINTS                                                     */
/* ------------------------------------------------------------------ */

/**
 * GET /api/ai-analytics/faculty/moderation?departmentId=&semester=
 */
export const facultyModeration = asyncHandler(async (req, res) => {
  const departmentId = Number(req.query.departmentId);
  const semester = Number(req.query.semester);

  if (!departmentId || !semester) {
    throw new AppError('departmentId and semester are required', 400);
  }

  const [candidates, facultyRecs] = await Promise.all([
    getModerationCandidates(departmentId, semester),
    generateFacultyRecommendations(departmentId, semester),
  ]);

  // Generate class-level feedback for top failing subject
  const topFailSubject = candidates.find((c) => c.needsModeration);
  const classFeedback = topFailSubject
    ? generateClassFeedback({
        avgPct: topFailSubject.avgPercentage,
        passRate: 100 - topFailSubject.failRate,
        topperPct: topFailSubject.maxMarks / topFailSubject.totalMarks * 100,
        weakestPct: topFailSubject.minMarks / topFailSubject.totalMarks * 100,
        totalStudents: topFailSubject.totalEntries,
      })
    : null;

  res.json({
    success: true,
    moderationCandidates: candidates,
    facultyRecommendations: facultyRecs,
    classFeedback,
    summary: {
      totalSubjects: candidates.length,
      moderationNeeded: candidates.filter((c) => c.needsModeration).length,
      urgentCases: candidates.filter((c) => c.moderationUrgency === 'urgent').length,
    },
  });
});

/**
 * GET /api/ai-analytics/faculty/anomalies?departmentId=&semester=
 */
export const facultyAnomalies = asyncHandler(async (req, res) => {
  const departmentId = Number(req.query.departmentId);
  const semester = Number(req.query.semester);

  if (!departmentId || !semester) {
    throw new AppError('departmentId and semester are required', 400);
  }

  const report = await scanForAnomalies(departmentId, semester);

  // Add human-readable alert messages
  const anomaliesWithAlerts = report.anomalies.map((a) => ({
    ...a,
    alertMessage: generateAnomalyAlert(a),
  }));

  res.json({
    success: true,
    ...report,
    anomalies: anomaliesWithAlerts,
  });
});

/**
 * GET /api/ai-analytics/faculty/subject-difficulty?departmentId=&semester=
 */
export const subjectDifficulty = asyncHandler(async (req, res) => {
  const departmentId = Number(req.query.departmentId);
  const semester = Number(req.query.semester);

  if (!departmentId || !semester) {
    throw new AppError('departmentId and semester are required', 400);
  }

  const analysis = await getSubjectDifficultyAnalysis(departmentId, semester);

  res.json({ success: true, subjectDifficulty: analysis });
});

/**
 * GET /api/ai-analytics/faculty/failure-matrix?departmentId=&semester=
 */
export const failureMatrix = asyncHandler(async (req, res) => {
  const departmentId = Number(req.query.departmentId);
  const semester = Number(req.query.semester);

  if (!departmentId || !semester) {
    throw new AppError('departmentId and semester are required', 400);
  }

  const matrix = await getFailureRateMatrix(departmentId, semester);
  const bulkRisk = await bulkPredictRisk(departmentId, semester);

  res.json({ success: true, failureMatrix: matrix, studentRisk: bulkRisk });
});

/* ------------------------------------------------------------------ */
/* ADMIN ENDPOINTS                                                       */
/* ------------------------------------------------------------------ */

/**
 * GET /api/ai-analytics/admin/overview
 */
export const adminOverview = asyncHandler(async (req, res) => {
  const overview = await getUniversityOverview();
  const rankings = await getDepartmentRankings();

  const topDept = rankings[0]?.department_name ?? null;
  const insight = generateUniversityInsight({
    totalStudents: Number(overview.kpis.total_students_with_results ?? 0),
    avgCgpa: Number(overview.kpis.avg_cgpa ?? 0),
    passRate: Number(overview.kpis.overall_pass_rate ?? 0),
    atRiskCount: 0, // computed separately
    topDept,
  });

  res.json({
    success: true,
    kpis: overview.kpis,
    gradeBreakdown: overview.gradeBreakdown,
    semesterTrend: overview.semesterTrend,
    universityInsight: insight,
  });
});

/**
 * GET /api/ai-analytics/admin/department-rankings
 */
export const departmentRankings = asyncHandler(async (req, res) => {
  const rankings = await getDepartmentRankings();
  res.json({ success: true, rankings });
});

/**
 * GET /api/ai-analytics/admin/risk-students?departmentId=&semester=&limit=
 */
export const riskStudents = asyncHandler(async (req, res) => {
  const departmentId = req.query.departmentId ? Number(req.query.departmentId) : null;
  const semester = req.query.semester ? Number(req.query.semester) : null;
  const limit = req.query.limit ? Math.min(100, Number(req.query.limit)) : 50;

  const students = await getAtRiskStudents({ departmentId, semester, limit });

  res.json({ success: true, riskStudents: students, total: students.length });
});

/**
 * GET /api/ai-analytics/admin/heatmap?departmentId=&semester=
 */
export const subjectHeatmap = asyncHandler(async (req, res) => {
  const departmentId = req.query.departmentId ? Number(req.query.departmentId) : null;
  const semester = req.query.semester ? Number(req.query.semester) : null;

  const heatmap = await getSubjectHeatmap({ departmentId, semester });
  res.json({ success: true, heatmap });
});

/**
 * GET /api/ai-analytics/admin/toppers?departmentId=&semester=&limit=
 */
export const toppersList = asyncHandler(async (req, res) => {
  const departmentId = req.query.departmentId ? Number(req.query.departmentId) : null;
  const semester = req.query.semester ? Number(req.query.semester) : null;
  const limit = req.query.limit ? Math.min(50, Number(req.query.limit)) : 10;

  const toppers = await getToppers({ departmentId, semester, limit });
  res.json({ success: true, toppers });
});

/**
 * GET /api/ai-analytics/admin/cgpa-spikes?departmentId=
 */
export const cgpaSpikes = asyncHandler(async (req, res) => {
  const departmentId = Number(req.query.departmentId);
  if (!departmentId) throw new AppError('departmentId is required', 400);

  const spikes = await detectCgpaSpikes(departmentId);
  res.json({ success: true, spikes });
});

/* ------------------------------------------------------------------ */
/* REPORT GENERATION                                                    */
/* ------------------------------------------------------------------ */

/**
 * POST /api/ai-analytics/report/generate
 * Body: { departmentId, semester, type: 'moderation' | 'summary' }
 */
export const generateReport = asyncHandler(async (req, res) => {
  const { departmentId, semester, type = 'moderation' } = req.body;

  if (!departmentId || !semester) {
    throw new AppError('departmentId and semester are required', 400);
  }

  let reportData;
  if (type === 'moderation') {
    reportData = await generateModerationReport(Number(departmentId), Number(semester));
  } else {
    // Summary report
    const [heatmap, rankings, riskSt] = await Promise.all([
      getSubjectHeatmap({ departmentId: Number(departmentId), semester: Number(semester) }),
      getDepartmentRankings(),
      getAtRiskStudents({ departmentId: Number(departmentId), semester: Number(semester) }),
    ]);
    reportData = { heatmap, rankings, riskStudents: riskSt };
  }

  res.json({ success: true, report: reportData, type, generatedAt: new Date().toISOString() });
});
