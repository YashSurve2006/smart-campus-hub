// FILE:
// frontend/src/pages/faculty/FacultyResultsPage.jsx

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  Lock,
  LockOpen,
  Upload,
  Search,
  Globe,
  GlobeLock,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Users,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  RefreshCw,
  BookOpen,
  FlaskConical,
  FileText,
  GraduationCap,
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';

import {
  getFacultyResultAnalytics,
  getFacultyResults,
  getSubjects,
  lockResults,
  publishResults,
  saveResultRows,
} from '../../services/resultApi';

const EXAM_TYPES = ['internal', 'midterm', 'practical', 'endterm'];

const GRADE_COLORS = [
  '#0ea5e9',
  '#6366f1',
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
];

const EXAM_META = {
  internal: {
    label: 'Internal',
    icon: BookOpen,
  },
  midterm: {
    label: 'Midterm',
    icon: FileText,
  },
  practical: {
    label: 'Practical',
    icon: FlaskConical,
  },
  endterm: {
    label: 'End Term',
    icon: GraduationCap,
  },
};

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.45,
      delay,
    },
  };
}

function Panel({ children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/85 backdrop-blur-xl">
      {children}
    </div>
  );
}

function ActionBtn({
  onClick,
  icon: Icon,
  label,
  className = '',
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </motion.button>
  );
}

function SelectBox({
  value,
  onChange,
  children,
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500"
    >
      {children}
    </select>
  );
}

export default function FacultyResultsPage() {
  const user = useAuthStore((s) => s.user);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState(1);
  const [semester, setSemester] = useState(5);
  const [subjectId, setSubjectId] = useState('');
  const [examType, setExamType] = useState('endterm');

  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadSubjects() {
    const rows = await getSubjects({
      departmentId,
      semester,
    });

    setSubjects(rows);

    if (rows?.length) {
      setSubjectId(String(rows[0].id));
    }
  }

  async function loadDepartments() {
    try {
      const res = await fetch('http://localhost:5000/api/departments');
      const data = await res.json();

      setDepartments(data.departments || []);
    } catch (err) {
      console.error(err);
    }
  }
  async function refresh() {
    if (!departmentId || !semester || !subjectId) return;

    setLoading(true);

    try {
      const [resultRows, analyticsRows] =
        await Promise.all([
          getFacultyResults({
            departmentId: Number(departmentId),
            semester: Number(semester),
            subjectId: Number(subjectId),
            examType,
            search,
          }),

          getFacultyResultAnalytics({
            departmentId: Number(departmentId),
            semester: Number(semester),
          }),
        ]);

      setResults(resultRows || []);
      setAnalytics(analyticsRows || {});
    } catch (err) {
      console.error(err);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, [semester, departmentId]);

  useEffect(() => {
    loadDepartments();
  }, []);
  useEffect(() => {
    refresh();
  }, [subjectId, semester, examType]);

  const editableRows = useMemo(() => {
    return results.map((r) => ({
      ...r,
      marksObtained: r.marks_obtained,
      remarks: r.remarks || '',
    }));
  }, [results]);

  const [draftRows, setDraftRows] = useState([]);

  useEffect(() => {
    setDraftRows(editableRows);
  }, [editableRows]);

  function updateDraft(id, patch) {
    setDraftRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...patch }
          : r
      )
    );
  }

  async function handleSave() {
    await saveResultRows({
      departmentId,
      semester,
      subjectId: Number(subjectId),
      examType,

      rows: draftRows.map((r) => ({
        studentId: r.student_id,
        marksObtained: Number(r.marksObtained),
        remarks: r.remarks || null,
      })),
    });

    toast.success('Results saved');
    refresh();
  }

  async function handlePublish(published) {
    await publishResults({
      departmentId,
      semester,
      published,
    });

    toast.success(
      published
        ? 'Results published'
        : 'Results unpublished'
    );
  }

  async function handleLock(lock) {
    await lockResults({
      departmentId,
      semester,
      examType,
      lock,
    });

    toast.success(
      lock
        ? 'Results locked'
        : 'Results unlocked'
    );
  }

  return (
    <div className="text-white">

      {/* HEADER */}
      <motion.div
        {...fadeUp(0)}
        className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">
            Faculty · Examinations
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-tight">
            Result Control Center
          </h1>

          <p className="mt-3 text-slate-400">
            Enterprise-grade examination workflow with analytics,
            publishing, and result management.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <ActionBtn
            onClick={() => handlePublish(true)}
            icon={Globe}
            label="Publish"
            className="border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
          />

          <ActionBtn
            onClick={() => handlePublish(false)}
            icon={GlobeLock}
            label="Unpublish"
            className="border-white/10 bg-slate-800"
          />

          <ActionBtn
            onClick={() => handleLock(true)}
            icon={Lock}
            label="Lock"
            className="border-rose-500/40 bg-rose-500/15 text-rose-300"
          />

          <ActionBtn
            onClick={() => handleLock(false)}
            icon={LockOpen}
            label="Unlock"
            className="border-amber-500/40 bg-amber-500/15 text-amber-300"
          />

        </div>
      </motion.div>

      {/* FILTERS */}
      <Panel>
        <div className="p-5">

          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Filters
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-6">

            <SelectBox
              value={departmentId}
              onChange={(e) =>
                setDepartmentId(Number(e.target.value))
              }
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </SelectBox>

            <SelectBox
              value={semester}
              onChange={(e) =>
                setSemester(Number(e.target.value))
              }
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
            </SelectBox>

            <SelectBox
              value={subjectId}
              onChange={(e) =>
                setSubjectId(e.target.value)
              }
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </SelectBox>

            <SelectBox
              value={examType}
              onChange={(e) =>
                setExamType(e.target.value)
              }
            >
              {EXAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EXAM_META[t]?.label}
                </option>
              ))}
            </SelectBox>

            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search student..."
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={refresh}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 font-bold shadow-lg shadow-indigo-500/30"
            >
              Apply
            </button>

          </div>
        </div>
      </Panel>

      {/* KPI */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">

        <Panel>
          <div className="p-6">
            <Users className="mb-4 h-10 w-10 text-cyan-400" />

            <p className="text-5xl font-black">
              {analytics?.overview?.total_entries || 0}
            </p>

            <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">
              Total Entries
            </p>
          </div>
        </Panel>

        <Panel>
          <div className="p-6">
            <TrendingUp className="mb-4 h-10 w-10 text-indigo-400" />

            <p className="text-5xl font-black">
              {analytics?.overview?.avg_percentage || 0}
            </p>

            <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">
              Average %
            </p>
          </div>
        </Panel>

        <Panel>
          <div className="p-6">
            <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-400" />

            <p className="text-5xl font-black">
              {analytics?.overview?.pass_percentage || 0}
            </p>

            <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">
              Pass %
            </p>
          </div>
        </Panel>

      </div>

      {/* CHARTS */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">

        <Panel>
          <div className="p-5">

            <div className="mb-5 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-indigo-400" />

              <div>
                <h3 className="font-bold">Subject Average</h3>
                <p className="text-xs text-slate-500">
                  Subject performance analysis
                </p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.subjectStats || []}>
                  <XAxis dataKey="code" />
                  <YAxis />
                  <Tooltip />

                  <Bar
                    dataKey="average_percentage"
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </Panel>

        <Panel>
          <div className="p-5">

            <div className="mb-5 flex items-center gap-3">
              <PieIcon className="h-5 w-5 text-purple-400" />

              <div>
                <h3 className="font-bold">
                  Grade Distribution
                </h3>

                <p className="text-xs text-slate-500">
                  Student performance spread
                </p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                  <Pie
                    data={analytics?.gradeDistribution || []}
                    dataKey="count"
                    nameKey="grade"
                    outerRadius={100}
                    innerRadius={45}
                  >
                    {(analytics?.gradeDistribution || []).map(
                      (entry, index) => (
                        <Cell
                          key={entry.grade}
                          fill={
                            GRADE_COLORS[
                            index % GRADE_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </Panel>

      </div>

      {/* TABLE */}
      <Panel>
        <div className="mt-6 overflow-hidden">

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

            <div className="flex items-center gap-3">

              <Users className="h-5 w-5 text-indigo-400" />

              <div>
                <h3 className="font-bold">
                  Student Results
                </h3>

                <p className="text-xs text-slate-500">
                  {draftRows.length} records loaded
                </p>
              </div>

            </div>

            <div className="rounded-full bg-indigo-500/15 px-4 py-1 text-xs font-bold text-indigo-300">
              {EXAM_META[examType]?.label}
            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-slate-950/50">

                <tr>
                  {[
                    'Student',
                    'Marks',
                    'Grade',
                    'Status',
                    'Remarks',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs uppercase tracking-widest text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>

              </thead>

              <tbody>

                {draftRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-white/5 hover:bg-indigo-500/5"
                  >

                    <td className="px-5 py-4">

                      <div>
                        <p className="font-semibold">
                          {row.first_name} {row.last_name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {row.student_code}
                        </p>
                      </div>

                    </td>

                    <td className="px-5 py-4">

                      <input
                        type="number"
                        value={row.marksObtained}
                        onChange={(e) =>
                          updateDraft(row.id, {
                            marksObtained:
                              e.target.value,
                          })
                        }
                        className="w-24 rounded-xl border border-white/10 bg-slate-800 px-3 py-2"
                      />

                    </td>

                    <td className="px-5 py-4">

                      <span className="rounded-lg bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-300">
                        {row.grade}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-bold ${row.status === 'pass'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                          }`}
                      >
                        {row.status}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <input
                        value={row.remarks}
                        onChange={(e) =>
                          updateDraft(row.id, {
                            remarks: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2"
                      />

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">

            <ActionBtn
              onClick={refresh}
              icon={RefreshCw}
              label="Refresh"
              className="border-white/10 bg-slate-800"
            />

            <ActionBtn
              onClick={handleSave}
              icon={Upload}
              label="Save Marks"
              className="border-indigo-500/40 bg-indigo-500/20 text-indigo-300"
            />

          </div>

        </div>
      </Panel>

    </div>
  );
}