/**
 * AI Analytics API Service
 * ────────────────────────
 * All frontend API calls for /api/ai-analytics/* endpoints.
 * Uses the existing authenticated axios instance from services/api.js.
 * Clean separation from existing resultApi.js.
 */

import api from './api';

/* ------------------------------------------------------------------ */
/* STUDENT                                                              */
/* ------------------------------------------------------------------ */

/**
 * Fetches AI insights, predictions, and recommendations for the
 * current authenticated student.
 */
export async function getStudentAIInsights() {
  const { data } = await api.get('/ai-analytics/student/insights');
  return data;
}

/* ------------------------------------------------------------------ */
/* FACULTY                                                              */
/* ------------------------------------------------------------------ */

/**
 * Fetches moderation candidates and faculty recommendations.
 */
export async function getFacultyModeration({ departmentId, semester }) {
  const { data } = await api.get('/ai-analytics/faculty/moderation', {
    params: { departmentId, semester },
  });
  return data;
}

/**
 * Fetches anomaly detection report for a department + semester.
 */
export async function getFacultyAnomalies({ departmentId, semester }) {
  const { data } = await api.get('/ai-analytics/faculty/anomalies', {
    params: { departmentId, semester },
  });
  return data;
}

/**
 * Fetches subject difficulty ranking for a department + semester.
 */
export async function getSubjectDifficulty({ departmentId, semester }) {
  const { data } = await api.get('/ai-analytics/faculty/subject-difficulty', {
    params: { departmentId, semester },
  });
  return data;
}

/**
 * Fetches failure rate matrix (subject × exam_type) with student risk.
 */
export async function getFailureMatrix({ departmentId, semester }) {
  const { data } = await api.get('/ai-analytics/faculty/failure-matrix', {
    params: { departmentId, semester },
  });
  return data;
}

/* ------------------------------------------------------------------ */
/* ADMIN                                                                */
/* ------------------------------------------------------------------ */

/**
 * Fetches university-wide KPIs, grade breakdown, semester trends.
 */
export async function getAdminOverview() {
  const { data } = await api.get('/ai-analytics/admin/overview');
  return data;
}

/**
 * Fetches department performance rankings.
 */
export async function getDepartmentRankings() {
  const { data } = await api.get('/ai-analytics/admin/department-rankings');
  return data;
}

/**
 * Fetches at-risk students list.
 * @param {object} params - { departmentId?, semester?, limit? }
 */
export async function getRiskStudents(params = {}) {
  const { data } = await api.get('/ai-analytics/admin/risk-students', { params });
  return data;
}

/**
 * Fetches subject heatmap data.
 * @param {object} params - { departmentId?, semester? }
 */
export async function getSubjectHeatmap(params = {}) {
  const { data } = await api.get('/ai-analytics/admin/heatmap', { params });
  return data;
}

/**
 * Fetches top performers.
 * @param {object} params - { departmentId?, semester?, limit? }
 */
export async function getToppers(params = {}) {
  const { data } = await api.get('/ai-analytics/admin/toppers', { params });
  return data;
}

/**
 * Fetches CGPA spike/drop detections.
 */
export async function getCgpaSpikes({ departmentId }) {
  const { data } = await api.get('/ai-analytics/admin/cgpa-spikes', {
    params: { departmentId },
  });
  return data;
}

/* ------------------------------------------------------------------ */
/* REPORT GENERATION                                                    */
/* ------------------------------------------------------------------ */

/**
 * Generates a smart report (moderation or summary).
 * @param {object} payload - { departmentId, semester, type }
 */
export async function generateAIReport(payload) {
  const { data } = await api.post('/ai-analytics/report/generate', payload);
  return data;
}
