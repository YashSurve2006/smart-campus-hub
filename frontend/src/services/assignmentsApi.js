import api from './api';

/**
 * Get all assignments
 */
export async function getAssignments(params = {}) {
    const res = await api.get('/assignments', { params });
    return res.data;
}

/**
 * Get single assignment by id
 */
export async function getAssignment(assignmentId) {
    const res = await api.get(`/assignments/${assignmentId}`);
    return res.data;
}

/**
 * Create new assignment (faculty/admin only)
 */
export async function createAssignment(data) {
    const res = await api.post('/assignments', data);
    return res.data;
}

/**
 * Update existing assignment
 */
export async function updateAssignment(assignmentId, data) {
    const res = await api.patch(`/assignments/${assignmentId}`, data);
    return res.data;
}

/**
 * Delete assignment
 */
export async function deleteAssignment(assignmentId) {
    const res = await api.delete(`/assignments/${assignmentId}`);
    return res.data;
}

/**
 * Publish assignment
 */
export async function publishAssignment(assignmentId, published) {
    const res = await api.post(`/assignments/${assignmentId}/publish`, { published });
    return res.data;
}

/**
 * Close assignment
 */
export async function closeAssignment(assignmentId) {
    const res = await api.post(`/assignments/${assignmentId}/close`);
    return res.data;
}

/**
 * Upload attachments for assignment
 */
export async function uploadAssignmentAttachments(assignmentId, files) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const res = await api.post(`/assignments/${assignmentId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

/**
 * Delete attachment
 */
export async function deleteAssignmentAttachment(assignmentId, attachmentId) {
    const res = await api.delete(`/assignments/${assignmentId}/attachments/${attachmentId}`);
    return res.data;
}

/**
 * Submit assignment (student)
 */
export async function submitAssignment(assignmentId, files) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const res = await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

/**
 * Resubmit assignment
 */
export async function resubmitAssignment(assignmentId, files) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const res = await api.post(`/assignments/${assignmentId}/resubmit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

/**
 * Get submissions for assignment
 */
export async function getAssignmentSubmissions(assignmentId) {
    const res = await api.get(`/assignments/${assignmentId}/submissions`);
    return res.data;
}

/**
 * Get single submission
 */
export async function getSubmission(submissionId) {
    const res = await api.get(`/assignments/submissions/${submissionId}`);
    return res.data;
}

/**
 * Get student's own submission for assignment
 */
export async function getStudentSubmission(assignmentId) {
    const res = await api.get(`/assignments/${assignmentId}/submission`);
    return res.data;
}

/**
 * Grade submission
 */
export async function gradeSubmission(submissionId, data) {
    const res = await api.patch(`/assignments/submissions/${submissionId}/grade`, data);
    return res.data;
}

/**
 * Get analytics
 */
export async function getAssignmentAnalytics(params = {}) {
    const res = await api.get('/assignments/analytics', { params });
    return res.data;
}
