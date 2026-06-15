import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { getAssignmentById } from './assignmentService.js';
import { recordFile } from './uploadRegistryService.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

async function getStudentByUserId(userId) {
    return queryOne(
        `SELECT s.id, s.department_id, s.semester 
     FROM students s 
     WHERE s.user_id = ?`,
        [userId]
    );
}

async function getCurrentVersion(submissionId) {
    const result = await queryOne(
        `SELECT COALESCE(MAX(submission_version), 0) as max_version 
     FROM submission_attachments 
     WHERE submission_id = ?`,
        [submissionId]
    );
    return result?.max_version || 0;
}

function calculateSubmissionStatus(dueDate, submittedAt) {
    const now = new Date();
    const due = new Date(dueDate);
    const submitted = submittedAt ? new Date(submittedAt) : null;

    if (!submitted) return 'not_submitted';

    if (submitted > due) return 'late_submitted';

    return 'submitted';
}

export async function submitAssignment(assignmentId, userId, files) {
    console.log('submitAssignment called with files:', files);
    const student = await getStudentByUserId(userId);
    if (!student) throw new AppError('Student profile not found', 403);

    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);

    if (assignment.status === 'closed') throw new AppError('Assignment is closed for submissions', 400);
    if (!['published', 'active', 'expired'].includes(assignment.status)) {
        throw new AppError('Assignment is not available for submissions', 400);
    }
    if (assignment.status === 'expired' && !assignment.allow_late_submissions) {
        throw new AppError('Assignment is past due and late submissions are not allowed', 400);
    }

    // Check existing submission
    let submission = await queryOne(
        `SELECT * FROM assignment_submissions 
     WHERE assignment_id = ? AND student_id = ?`,
        [assignmentId, student.id]
    );

    const now = new Date();
    const status = calculateSubmissionStatus(assignment.due_date, now);

    if (!submission) {
        const [result] = await pool.execute(
            `INSERT INTO assignment_submissions
        (assignment_id, student_id, status, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
            [assignmentId, student.id, status]
        );
        submission = await queryOne(`SELECT * FROM assignment_submissions WHERE id = ?`, [result.insertId]);
    } else {
        await pool.execute(
            `UPDATE assignment_submissions 
       SET status = ?, updated_at = NOW()
       WHERE id = ?`,
            [status, submission.id]
        );
        submission.status = status;
        submission.updated_at = now;
    }

    // Upload files
    if (files && files.length > 0) {
        const nextVersion = await getCurrentVersion(submission.id) + 1;
        const folder = `smart-campus-hub/submissions/${assignmentId}/${student.id}`;

        for (const file of files) {
            const uploadResult = await uploadToCloudinary(file.buffer, file.originalname, folder);
            const fileId = await recordFile({
                userId,
                scope: 'submission_attachment',
                entityType: 'submission',
                entityId: String(submission.id),
                publicPath: uploadResult.cloudUrl,
                storedName: uploadResult.publicId,
                originalName: file.originalname,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                cloudUrl: uploadResult.cloudUrl,
                cloudPublicId: uploadResult.publicId,
                cloudFolder: uploadResult.folder
            });

            await pool.execute(
                `INSERT INTO submission_attachments 
          (submission_id, uploaded_file_id, submission_version)
         VALUES (?, ?, ?)`,
                [submission.id, fileId, nextVersion]
            );
        }
    }

    return getSubmissionById(submission.id);
}

export async function resubmitAssignment(assignmentId, userId, files) {
    return submitAssignment(assignmentId, userId, files);
}

export async function getSubmissionById(submissionId) {
    const submission = await queryOne(
        `SELECT asub.*,
            s.student_code,
            u.first_name as student_first_name, u.last_name as student_last_name,
            a.title as assignment_title, a.max_marks
     FROM assignment_submissions asub
     JOIN students s ON s.id = asub.student_id
     JOIN users u ON u.id = s.user_id
     JOIN assignments a ON a.id = asub.assignment_id
     WHERE asub.id = ?`,
        [submissionId]
    );
    if (!submission) throw new AppError('Submission not found', 404);

    // Get attachments
    const attachments = await query(
        `SELECT sa.id, sa.submission_version, uf.*
     FROM submission_attachments sa
     JOIN uploaded_files uf ON uf.id = sa.uploaded_file_id
     WHERE sa.submission_id = ?
     ORDER BY sa.submission_version DESC, sa.created_at DESC`,
        [submissionId]
    );

    return { ...submission, attachments };
}

export async function getAssignmentSubmissions(assignmentId) {
    const submissions = await query(
        `SELECT asub.*,
            s.student_code,
            u.first_name as student_first_name, u.last_name as student_last_name
     FROM assignment_submissions asub
     JOIN students s ON s.id = asub.student_id
     JOIN users u ON u.id = s.user_id
     WHERE asub.assignment_id = ?
     ORDER BY asub.created_at DESC`,
        [assignmentId]
    );
    return submissions;
}

export async function gradeSubmission(submissionId, marksObtained, remarks, userId) {
    const submission = await getSubmissionById(submissionId);
    const assignment = await getAssignmentById(submission.assignment_id);

    if (marksObtained > assignment.max_marks) {
        throw new AppError('Marks cannot exceed assignment maximum marks', 400);
    }

    await pool.execute(
        `UPDATE assignment_submissions
     SET marks_obtained = ?, remarks = ?, graded_by = ?, graded_at = NOW(), status = 'graded', updated_at = NOW()
     WHERE id = ?`,
        [marksObtained, remarks ?? null, userId, submissionId]
    );

    return getSubmissionById(submissionId);
}

export async function getStudentSubmission(assignmentId, userId) {
    const student = await getStudentByUserId(userId);
    if (!student) throw new AppError('Student profile not found', 403);

    const submission = await queryOne(
        `SELECT asub.*
     FROM assignment_submissions asub
     WHERE asub.assignment_id = ? AND asub.student_id = ?`,
        [assignmentId, student.id]
    );
    if (!submission) return null;

    return getSubmissionById(submission.id);
}
