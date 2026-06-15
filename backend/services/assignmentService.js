import { pool, query, queryOne } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { recordFile } from './uploadRegistryService.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

async function getFacultyByUserId(userId) {
    return queryOne(`SELECT id, department_id FROM faculty WHERE user_id = ?`, [userId]);
}

export async function createAssignment(data, userId) {
    const faculty = await getFacultyByUserId(userId);
    if (!faculty) throw new AppError('Faculty profile not found', 403);

    const { title, description, subjectId, departmentId, semester, dueDate, maxMarks = 100, allowLateSubmissions = true, latePenaltyPercent } = data;

    const [result] = await pool.execute(
        `INSERT INTO assignments
      (title, description, subject_id, faculty_id, department_id, semester, due_date, max_marks, allow_late_submissions, late_penalty_percent, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
        [
            title, description, subjectId, faculty.id, departmentId, semester, dueDate, maxMarks,
            allowLateSubmissions ? 1 : 0, latePenaltyPercent ?? null, userId
        ]
    );

    return result.insertId;
}

export async function getAssignmentById(assignmentId) {
    return queryOne(
        `SELECT a.*, 
            u.first_name as author_first_name, u.last_name as author_last_name,
            s.name as subject_name, s.code as subject_code,
            d.name as department_name
     FROM assignments a
     JOIN users u ON u.id = a.created_by
     JOIN subjects s ON s.id = a.subject_id
     JOIN departments d ON d.id = a.department_id
     WHERE a.id = ?`,
        [assignmentId]
    );
}

export async function assertAssignmentOwnerOrAdmin(assignmentId, userId, isAdmin) {
    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);
    if (!isAdmin && assignment.created_by !== userId) {
        throw new AppError('You do not have permission to modify this assignment', 403);
    }
    return assignment;
}

export async function updateAssignment(assignmentId, data, userId, isAdmin) {
    await assertAssignmentOwnerOrAdmin(assignmentId, userId, isAdmin);

    const { title, description, subjectId, dueDate, maxMarks, allowLateSubmissions, latePenaltyPercent } = data;

    await pool.execute(
        `UPDATE assignments
     SET title = COALESCE(?, title),
         description = COALESCE(?, description),
         subject_id = COALESCE(?, subject_id),
         due_date = COALESCE(?, due_date),
         max_marks = COALESCE(?, max_marks),
         allow_late_submissions = ?,
         late_penalty_percent = ?
     WHERE id = ?`,
        [
            title ?? null, description ?? null, subjectId ?? null, dueDate ?? null,
            maxMarks ?? null, allowLateSubmissions === undefined ? null : allowLateSubmissions ? 1 : 0,
            latePenaltyPercent === undefined ? null : latePenaltyPercent, assignmentId
        ]
    );

    return getAssignmentById(assignmentId);
}

export async function deleteAssignment(assignmentId, userId, isAdmin) {
    await assertAssignmentOwnerOrAdmin(assignmentId, userId, isAdmin);

    // Delete attachments first
    const attachments = await query(
        `SELECT uf.cloud_public_id 
     FROM assignment_attachments aa
     JOIN uploaded_files uf ON uf.id = aa.uploaded_file_id
     WHERE aa.assignment_id = ?`,
        [assignmentId]
    );
    for (const att of attachments) {
        if (att.cloud_public_id) {
            await deleteFromCloudinary(att.cloud_public_id);
        }
    }

    await pool.execute(`DELETE FROM assignments WHERE id = ?`, [assignmentId]);
}

export async function publishAssignment(assignmentId, userId, isAdmin, published) {
    await assertAssignmentOwnerOrAdmin(assignmentId, userId, isAdmin);

    let newStatus = 'published';
    let publishedAt = null;
    if (published) {
        const assignment = await getAssignmentById(assignmentId);
        if (new Date(assignment.due_date) > new Date()) {
            newStatus = 'active';
        }
        publishedAt = new Date();
    }

    await pool.execute(
        `UPDATE assignments SET status = ?, published_at = ? WHERE id = ?`,
        [newStatus, publishedAt, assignmentId]
    );

    return getAssignmentById(assignmentId);
}

export async function closeAssignment(assignmentId, userId, isAdmin) {
    await assertAssignmentOwnerOrAdmin(assignmentId, userId, isAdmin);
    await pool.execute(
        `UPDATE assignments SET status = 'closed', closed_at = NOW() WHERE id = ?`,
        [assignmentId]
    );
    return getAssignmentById(assignmentId);
}

export async function addAssignmentAttachments(assignmentId, files, userId) {
    const createdIds = [];
    const folder = 'smart-campus-hub/assignments';

    for (const file of files) {
        const uploadResult = await uploadToCloudinary(file.buffer, file.originalname, folder);
        const fileId = await recordFile({
            userId,
            scope: 'assignment_attachment',
            entityType: 'assignment',
            entityId: String(assignmentId),
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
            `INSERT INTO assignment_attachments (assignment_id, uploaded_file_id) VALUES (?, ?)`,
            [assignmentId, fileId]
        );
        createdIds.push(fileId);
    }

    return query(
        `SELECT aa.*, uf.* 
     FROM assignment_attachments aa
     JOIN uploaded_files uf ON uf.id = aa.uploaded_file_id
     WHERE aa.id IN (${createdIds.map(() => '?').join(',')})`,
        createdIds
    );
}

export async function removeAssignmentAttachment(attachmentId, assignmentId, userId, isAdmin) {
    await assertAssignmentOwnerOrAdmin(assignmentId, userId, isAdmin);

    const attachment = await queryOne(
        `SELECT aa.*, uf.cloud_public_id
     FROM assignment_attachments aa
     JOIN uploaded_files uf ON uf.id = aa.uploaded_file_id
     WHERE aa.id = ? AND aa.assignment_id = ?`,
        [attachmentId, assignmentId]
    );
    if (!attachment) throw new AppError('Attachment not found', 404);

    if (attachment.cloud_public_id) {
        await deleteFromCloudinary(attachment.cloud_public_id);
    }

    await pool.execute(`DELETE FROM assignment_attachments WHERE id = ?`, [attachmentId]);
    await pool.execute(`DELETE FROM uploaded_files WHERE id = ?`, [attachment.uploaded_file_id]);
}

export async function getAssignments(filters = {}) {
    const { userId, userRole, departmentId, semester, subjectId, status, search, limit = 50, offset = 0 } = filters;

    let sql = `SELECT DISTINCT a.*,
                    u.first_name as author_first_name, u.last_name as author_last_name,
                    s.name as subject_name, s.code as subject_code,
                    d.name as department_name,
                    (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id AND status != 'not_submitted') as submission_count
             FROM assignments a
             JOIN users u ON u.id = a.created_by
             JOIN subjects s ON s.id = a.subject_id
             JOIN departments d ON d.id = a.department_id`;

    const params = [];

    if (userRole === 'student') {
        sql += ` JOIN students st ON st.department_id = a.department_id AND st.semester = a.semester
             WHERE st.user_id = ?`;
        params.push(userId);
        sql += ` AND a.status IN ('published', 'active', 'expired', 'closed')`;
    } else if (userRole === 'faculty') {
        sql += ` JOIN faculty f ON f.id = a.faculty_id
             WHERE f.user_id = ?`;
        params.push(userId);
    } else { // admin
        sql += ` WHERE 1=1`;
    }

    if (departmentId) {
        sql += ` AND a.department_id = ?`;
        params.push(departmentId);
    }

    if (semester) {
        sql += ` AND a.semester = ?`;
        params.push(semester);
    }

    if (subjectId) {
        sql += ` AND a.subject_id = ?`;
        params.push(subjectId);
    }

    if (status) {
        sql += ` AND a.status = ?`;
        params.push(status);
    }

    if (search) {
        sql += ` AND (a.title LIKE ? OR a.description LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }

    sql += ` ORDER BY a.created_at DESC`;

    const rawLimit = Number.parseInt(limit, 10);
    let lim = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 50;
    lim = Math.max(1, Math.min(100, lim));

    const rawOffset = Number.parseInt(offset, 10);
    const off = Math.max(0, Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0);

    sql += ` LIMIT ${Math.trunc(lim)} OFFSET ${Math.trunc(off)}`;

    return query(sql, params);
}

export async function getAssignmentAnalytics(departmentId, semester, assignmentId = null) {
    let whereClauses = [];
    const params = [];

    if (departmentId) {
        whereClauses.push('a.department_id = ?');
        params.push(departmentId);
    }
    if (semester) {
        whereClauses.push('a.semester = ?');
        params.push(semester);
    }
    if (assignmentId) {
        whereClauses.push('a.id = ?');
        params.push(assignmentId);
    }

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [overview] = await query(
        `SELECT COUNT(DISTINCT a.id) as total_assignments,
            COUNT(DISTINCT asub.id) as total_submissions,
            ROUND(AVG(asub.marks_obtained), 2) as avg_marks
     FROM assignments a
     LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id
     ${whereClause}`,
        params
    );

    const lateSubmissionsWhereClauses = [];
    const lateSubmissionParams = [];
    if (departmentId) {
        lateSubmissionsWhereClauses.push('department_id = ?');
        lateSubmissionParams.push(departmentId);
    }
    if (semester) {
        lateSubmissionsWhereClauses.push('semester = ?');
        lateSubmissionParams.push(semester);
    }
    if (assignmentId) {
        lateSubmissionsWhereClauses.push('id = ?');
        lateSubmissionParams.push(assignmentId);
    }
    const lateSubmissionsWhere = lateSubmissionsWhereClauses.length
        ? `WHERE ${lateSubmissionsWhereClauses.join(' AND ')}`
        : '';

    const lateSubmissions = await queryOne(
        `SELECT COUNT(*) as count 
     FROM assignment_submissions 
     WHERE assignment_id IN (SELECT id FROM assignments ${lateSubmissionsWhere})
     AND status = 'late_submitted'`,
        lateSubmissionParams
    );

    return {
        ...overview,
        lateSubmissions: lateSubmissions?.count || 0
    };
}
