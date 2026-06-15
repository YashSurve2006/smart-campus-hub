import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import * as assignmentService from '../services/assignmentService.js';
import * as submissionService from '../services/submissionService.js';
import * as notificationService from '../services/notificationService.js';
import { broadcastAssignmentPublished, broadcastSubmissionCreated, broadcastSubmissionGraded } from '../realtime/socketHub.js';
import { queryOne } from '../config/db.js';

export const create = asyncHandler(async (req, res) => {
    const assignmentId = await assignmentService.createAssignment(req.body, req.user.id);
    const assignment = await assignmentService.getAssignmentById(assignmentId);
    res.status(201).json({ data: assignment });
});

export const update = asyncHandler(async (req, res) => {
    const assignment = await assignmentService.updateAssignment(
        req.params.id, req.body, req.user.id, req.user.role === 'admin'
    );
    res.json({ data: assignment });
});

export const remove = asyncHandler(async (req, res) => {
    await assignmentService.deleteAssignment(
        req.params.id, req.user.id, req.user.role === 'admin'
    );
    res.json({ data: null });
});

export const getOne = asyncHandler(async (req, res) => {
    const assignment = await assignmentService.getAssignmentById(req.params.id);
    if (!assignment) throw new AppError('Assignment not found', 404);
    res.json({ data: assignment });
});

export const getMany = asyncHandler(async (req, res) => {
    const assignments = await assignmentService.getAssignments({
        userId: req.user.id,
        userRole: req.user.role,
        departmentId: req.query.departmentId,
        semester: req.query.semester,
        subjectId: req.query.subjectId,
        status: req.query.status,
        search: req.query.search,
        limit: req.query.limit,
        offset: req.query.offset
    });
    res.json({ data: assignments });
});

export const publish = asyncHandler(async (req, res) => {
    const { published } = req.body;
    const assignment = await assignmentService.publishAssignment(
        req.params.id, req.user.id, req.user.role === 'admin', published
    );

    if (published) {
        await broadcastAssignmentPublished(req.io, assignment);
        await notificationService.sendNotification({
            title: 'New Assignment Published',
            message: `${assignment.title} has been published`,
            type: 'info'
        });
    }

    res.json({ data: assignment });
});

export const close = asyncHandler(async (req, res) => {
    const assignment = await assignmentService.closeAssignment(
        req.params.id, req.user.id, req.user.role === 'admin'
    );
    res.json({ data: assignment });
});

export const uploadAssignmentFiles = asyncHandler(async (req, res) => {
    const attachments = await assignmentService.addAssignmentAttachments(
        req.params.id, req.files, req.user.id
    );
    res.json({ data: attachments });
});

export const deleteAssignmentFile = asyncHandler(async (req, res) => {
    await assignmentService.removeAssignmentAttachment(
        req.params.attachmentId, req.params.id, req.user.id, req.user.role === 'admin'
    );
    res.json({ data: null });
});

export const submit = asyncHandler(async (req, res) => {
    const submission = await submissionService.submitAssignment(
        req.params.id, req.user.id, req.files
    );

    const facultyUser = await queryOne(
        `SELECT u.id as user_id FROM faculty f JOIN users u ON u.id = f.user_id WHERE f.id = ?`,
        [submission.faculty_id]
    );
    if (facultyUser) {
        await broadcastSubmissionCreated(req.io, submission, facultyUser.user_id);
        await notificationService.sendNotification({
            userId: facultyUser.user_id,
            title: 'New Submission Received',
            message: `New submission for "${submission.assignment_title}"`,
            type: 'info'
        });
    }

    res.status(201).json({ data: submission });
});

export const resubmit = asyncHandler(async (req, res) => {
    const submission = await submissionService.resubmitAssignment(
        req.params.id, req.user.id, req.files
    );
    res.json({ data: submission });
});

export const getSubmissions = asyncHandler(async (req, res) => {
    const submissions = await submissionService.getAssignmentSubmissions(req.params.id);
    res.json({ data: submissions });
});

export const getSubmission = asyncHandler(async (req, res) => {
    const submission = await submissionService.getSubmissionById(req.params.submissionId);
    res.json({ data: submission });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
    const { marksObtained, remarks } = req.body;
    const submission = await submissionService.gradeSubmission(
        req.params.submissionId, marksObtained, remarks, req.user.id
    );

    const studentUser = await queryOne(
        `SELECT u.id as user_id FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
        [submission.student_id]
    );
    if (studentUser) {
        await broadcastSubmissionGraded(req.io, submission, studentUser.user_id);
        await notificationService.sendNotification({
            userId: studentUser.user_id,
            title: 'Assignment Graded',
            message: `Your submission for "${submission.assignment_title}" has been graded`,
            type: 'success'
        });
    }

    res.json({ data: submission });
});

export const getAnalytics = asyncHandler(async (req, res) => {
    const analytics = await assignmentService.getAssignmentAnalytics(
        req.query.departmentId,
        req.query.semester,
        req.query.assignmentId
    );
    res.json({ data: analytics });
});

export const getMySubmission = asyncHandler(async (req, res) => {
    const submission = await submissionService.getStudentSubmission(
        req.params.id, req.user.id
    );
    res.json({ data: submission });
});
