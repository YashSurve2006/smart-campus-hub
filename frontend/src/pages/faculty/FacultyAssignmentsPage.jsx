import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Eye,
    Upload,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    publishAssignment,
    closeAssignment,
    getAssignmentSubmissions,
    gradeSubmission,
} from '../../services/assignmentsApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { AssignmentStatusBadge } from '../../components/assignments/AssignmentStatusBadge';
import { AssignmentFormModal } from '../../components/assignments/AssignmentFormModal';

const statuses = [
    { id: '', label: 'All status' },
    { id: 'draft', label: 'Draft' },
    { id: 'published', label: 'Published' },
    { id: 'active', label: 'Active' },
    { id: 'expired', label: 'Expired' },
    { id: 'closed', label: 'Closed' },
];

export default function FacultyAssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editAssignment, setEditAssignment] = useState(null);
    const [submissionsModal, setSubmissionsModal] = useState(null);
    const [gradingSubmission, setGradingSubmission] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAssignments({ search, status: statusFilter || undefined });
            setAssignments(res.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load assignments');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        load();
    }, [load]);

    const handleCreate = async (data) => {
        const response = await createAssignment(data);
        load();
        return response.data;
    };

    const handleUpdate = async (data) => {
        await updateAssignment(editAssignment.id, data);
        setEditAssignment(null);
        load();
    };

    const handleDelete = async (assignmentId) => {
        if (!confirm('Are you sure you want to delete this assignment?')) return;
        await deleteAssignment(assignmentId);
        toast.success('Assignment deleted');
        load();
    };

    const handlePublish = async (assignment, publish) => {
        await publishAssignment(assignment.id, publish);
        toast.success(`Assignment ${publish ? 'published' : 'unpublished'}`);
        load();
    };

    const handleClose = async (assignment) => {
        await closeAssignment(assignment.id);
        toast.success('Assignment closed');
        load();
    };

    const openSubmissions = async (assignment) => {
        try {
            const res = await getAssignmentSubmissions(assignment.id);
            setSubmissionsModal({ ...assignment, submissions: res.data || [] });
        } catch (err) {
            toast.error('Failed to load submissions');
        }
    };

    const handleGrade = async () => {
        if (!gradingSubmission) return;
        await gradeSubmission(gradingSubmission.id, {
            marksObtained: gradingSubmission.marks,
            remarks: gradingSubmission.remarks,
        });
        toast.success('Submission graded');
        setGradingSubmission(null);
        if (submissionsModal) {
            openSubmissions(submissionsModal);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage assignments</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Create, edit, publish, and grade assignments.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    New assignment
                </Button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search assignments…"
                        className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-hub-purple/35 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    >
                        {statuses.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-3 md:grid-cols-2">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {assignments.map((a, i) => (
                        <motion.div
                            key={a.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <GlassCard className="h-full border-white/60 p-4 transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-slate-900/50">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <AssignmentStatusBadge status={a.status} />
                                            {a.submission_count > 0 && (
                                                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300">
                                                    {a.submission_count} submission(s)
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">{a.title}</h2>
                                        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                            {a.description}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500">
                                            Due: {new Date(a.due_date).toLocaleString()} · Max {a.max_marks} marks
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openSubmissions(a)}
                                    >
                                        <Eye className="h-3.5 w-3.5 mr-1" />
                                        Submissions
                                    </Button>
                                    {a.status === 'draft' && (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={() => handlePublish(a, true)}
                                        >
                                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                            Publish
                                        </Button>
                                    )}
                                    {(a.status === 'published' || a.status === 'active') && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handlePublish(a, false)}
                                            >
                                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                                Unpublish
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleClose(a)}
                                            >
                                                Close
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditAssignment(a)}
                                    >
                                        <Edit className="h-3.5 w-3.5 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleDelete(a.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            {!loading && !assignments.length && (
                <GlassCard className="p-10 text-center text-slate-500 dark:text-slate-400">
                    No assignments yet. Create your first one!
                </GlassCard>
            )}

            <AssignmentFormModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreate}
            />

            <AssignmentFormModal
                open={!!editAssignment}
                initialData={editAssignment}
                onClose={() => setEditAssignment(null)}
                onSubmit={handleUpdate}
            />

            <Modal
                open={!!submissionsModal}
                onClose={() => setSubmissionsModal(null)}
                title={`Submissions: ${submissionsModal?.title}`}
                size="xl"
            >
                {submissionsModal && (
                    <div className="space-y-3">
                        {submissionsModal.submissions.length === 0 ? (
                            <p className="text-center text-sm text-slate-600 dark:text-slate-400 py-6">
                                No submissions yet.
                            </p>
                        ) : (
                            submissionsModal.submissions.map((sub) => (
                                <GlassCard key={sub.id} className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {sub.student_first_name} {sub.student_last_name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Status: <span className="capitalize">{sub.status}</span>
                                                {sub.graded_at &&
                                                    ` · Graded at ${new Date(sub.graded_at).toLocaleString()}`}
                                            </p>
                                            {sub.marks_obtained !== null && (
                                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                                    Marks: {sub.marks_obtained}/{submissionsModal.max_marks}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setGradingSubmission({
                                                    ...sub,
                                                    marks: sub.marks_obtained || '',
                                                    remarks: sub.remarks || '',
                                                })
                                            }
                                        >
                                            Grade
                                        </Button>
                                    </div>
                                </GlassCard>
                            ))
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                open={!!gradingSubmission}
                onClose={() => setGradingSubmission(null)}
                title="Grade submission"
            >
                {gradingSubmission && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Marks obtained
                            </label>
                            <input
                                type="number"
                                min="0"
                                max={submissionsModal?.max_marks || 100}
                                value={gradingSubmission.marks}
                                onChange={(e) =>
                                    setGradingSubmission((s) => ({ ...s, marks: Number(e.target.value) }))
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Remarks (optional)
                            </label>
                            <textarea
                                value={gradingSubmission.remarks}
                                onChange={(e) =>
                                    setGradingSubmission((s) => ({ ...s, remarks: e.target.value }))
                                }
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setGradingSubmission(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleGrade}>Save grade</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
