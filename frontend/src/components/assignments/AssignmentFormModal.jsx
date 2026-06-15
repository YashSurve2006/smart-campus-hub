
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function AssignmentFormModal({ open, onClose, initialData = null, onSubmit, assignmentId }) {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        subjectId: initialData?.subject_id || '',
        departmentId: initialData?.department_id || '',
        semester: initialData?.semester || '',
        dueDate: initialData?.due_date
            ? new Date(initialData.due_date).toISOString().slice(0, 16)
            : '',
        maxMarks: initialData?.max_marks || 100,
        allowLateSubmissions: initialData?.allow_late_submissions ?? true,
        latePenaltyPercent: initialData?.late_penalty_percent || '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const createdAssignment = await onSubmit(formData);
            if (files.length > 0 && createdAssignment?.id) {
                const { uploadAssignmentFiles } = await import('../../services/assignmentsApi');
                await uploadAssignmentFiles(createdAssignment.id, files);
            }
            toast.success(initialData ? 'Assignment updated' : 'Assignment created');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={initialData ? 'Edit assignment' : 'Create assignment'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Title
                    </label>
                    <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Description
                    </label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                        rows={4}
                        className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Department
                        </label>
                        <input
                            required
                            type="number"
                            value={formData.departmentId}
                            onChange={(e) => setFormData((d) => ({ ...d, departmentId: Number(e.target.value) }))}
                            className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Semester
                        </label>
                        <input
                            required
                            type="number"
                            min="1"
                            max="12"
                            value={formData.semester}
                            onChange={(e) => setFormData((d) => ({ ...d, semester: Number(e.target.value) }))}
                            className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Subject
                        </label>
                        <input
                            required
                            type="number"
                            value={formData.subjectId}
                            onChange={(e) => setFormData((d) => ({ ...d, subjectId: Number(e.target.value) }))}
                            className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Max marks
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.maxMarks}
                            onChange={(e) => setFormData((d) => ({ ...d, maxMarks: Number(e.target.value) }))}
                            className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Due date
                    </label>
                    <input
                        required
                        type="datetime-local"
                        value={formData.dueDate}
                        onChange={(e) => setFormData((d) => ({ ...d, dueDate: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Attachments
                    </label>
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.zip"
                        onChange={(e) => setFiles([...(e.target.files || [])])}
                        className="w-full text-sm text-slate-600 dark:text-slate-400"
                    />
                    {files.length > 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                            {files.length} file{files.length > 1 ? 's' : ''} selected
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="allowLate"
                        type="checkbox"
                        checked={formData.allowLateSubmissions}
                        onChange={(e) => setFormData((d) => ({ ...d, allowLateSubmissions: e.target.checked }))}
                    />
                    <label htmlFor="allowLate" className="text-sm text-slate-600 dark:text-slate-400">
                        Allow late submissions
                    </label>
                </div>

                {formData.allowLateSubmissions && (
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Late penalty (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.latePenaltyPercent}
                            onChange={(e) =>
                                setFormData((d) => ({
                                    ...d,
                                    latePenaltyPercent: e.target.value ? Number(e.target.value) : null,
                                }))}
                            className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
                        />
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-3">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
