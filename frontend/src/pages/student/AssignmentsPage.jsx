import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    FileText,
    Upload,
    Clock,
    Calendar,
    CheckCircle,
} from 'lucide-react';
import {
    getAssignments,
    getStudentSubmission,
    submitAssignment,
} from '../../services/assignmentsApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { AssignmentStatusBadge } from '../../components/assignments/AssignmentStatusBadge';

const statuses = [
    { id: '', label: 'All status' },
    { id: 'published', label: 'Published' },
    { id: 'active', label: 'Active' },
    { id: 'expired', label: 'Expired' },
];

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [detail, setDetail] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submissionFiles, setSubmissionFiles] = useState([]);

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

    const handleSubmit = async (assignmentId) => {
        if (submissionFiles.length === 0) {
            toast.error('Please select files');
            return;
        }

        setSubmitting(true);
        try {
            await submitAssignment(assignmentId, submissionFiles);
            toast.success('Submission successful!');
            setSubmissionFiles([]);
            load();
            setDetail(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    const openDetail = async (assignment) => {
        setDetail(assignment);
        try {
            const submissionRes = await getStudentSubmission(assignment.id);
            if (submissionRes.data) {
                setDetail({ ...assignment, submission: submissionRes.data });
            }
        } catch (e) {
            // No submission yet
        }
    };

    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Assignments</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        View and submit your assignments.
                    </p>
                </div>
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
                            <GlassCard
                                role="button"
                                tabIndex={0}
                                onClick={() => openDetail(a)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') openDetail(a);
                                }}
                                className="h-full border-white/60 p-4 transition-shadow hover:shadow-lg cursor-pointer dark:border-white/10 dark:bg-slate-900/50"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <AssignmentStatusBadge status={a.status} />
                                            {a.submission && (
                                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                                                    Submitted
                                                </span>
                                            )}
                                            {isOverdue(a.due_date) && !a.submission && (
                                                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">{a.title}</h2>
                                        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                            {a.description}
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Due: {new Date(a.due_date).toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FileText className="h-3.5 w-3.5" />
                                                Max: {a.max_marks} marks
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            )}

            {!loading && !assignments.length && (
                <GlassCard className="p-10 text-center text-slate-500 dark:text-slate-400">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-hub-purple" />
                    No assignments match your filters.
                </GlassCard>
            )}

            <Modal
                open={!!detail}
                onClose={() => setDetail(null)}
                title={detail?.title}
                size="lg"
            >
                {detail && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <AssignmentStatusBadge status={detail.status} />
                            {detail.submission?.status === 'graded' && (
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                                    Graded: {detail.submission.marks_obtained}/{detail.max_marks}
                                </span>
                            )}
                        </div>

                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            <p className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                Due: {new Date(detail.due_date).toLocaleString()}
                            </p>
                            <p className="flex items-center gap-2 mt-1">
                                <FileText className="h-3.5 w-3.5" />
                                Max marks: {detail.max_marks}
                            </p>
                        </div>

                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                            {detail.description}
                        </div>

                        {detail.submission && (
                            <div className="border-t border-slate-100 pt-3 dark:border-white/10">
                                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                                    Your submission
                                </p>
                                <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Status: <span className="capitalize">{detail.submission.status}</span>
                                    </p>
                                    {detail.submission.marks_obtained !== null && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Marks: {detail.submission.marks_obtained}/{detail.max_marks}
                                        </p>
                                    )}
                                    {detail.submission.remarks && (
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            Remarks: {detail.submission.remarks}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {(!detail.submission || detail.status === 'active') && (
                            <div className="border-t border-slate-100 pt-3 dark:border-white/10">
                                <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                                    Submit assignment
                                </p>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.zip"
                                        onChange={(e) => setSubmissionFiles([...(e.target.files || [])])}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => setDetail(null)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => handleSubmit(detail.id)}
                                            disabled={submitting || submissionFiles.length === 0}
                                        >
                                            <Upload className="h-4 w-4 mr-1" />
                                            {submitting ? 'Submitting...' : 'Submit'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
