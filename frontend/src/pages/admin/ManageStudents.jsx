import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { GraduationCap, Search, SlidersHorizontal, Trash2, BookOpen, Mail, Hash, Building2, Users } from 'lucide-react';
import api from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const Orb = ({ className }) => (
  <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />
);

const Avatar = ({ name }) => {
  const initials = name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '??';
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-violet-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-xs font-bold text-white shadow-lg`}>
      {initials}
    </div>
  );
};

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-2 rounded-xl border ${color} px-3 py-2 backdrop-blur`}>
    <Icon className="h-3.5 w-3.5" />
    <span className="text-xs font-medium">{label}:</span>
    <span className="text-xs font-bold">{value}</span>
  </div>
);

export default function ManageStudents() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [departments, setDepartments] = useState([]);

  async function load() {
    const { data } = await api.get('/api/admin/students', {
      params: { search, departmentId: dept || undefined },
    });
    setRows(data.students || []);
  }

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/api/departments');
      setDepartments(data.departments || []);
    })();
  }, []);

  useEffect(() => { load(); }, [search, dept]);

  async function patch(userId, patch) {
    try {
      await api.patch(`/api/admin/students/${userId}`, patch);
      toast.success('Updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <Orb className="h-96 w-96 -left-32 -top-20 bg-blue-600/15" />
      <Orb className="h-72 w-72 right-0 top-40 bg-indigo-600/10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="space-y-7">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="relative">
            <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-48 rounded-full bg-blue-500/10 blur-2xl" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Admin · Students</p>
            <h1 className="mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Manage Students
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">Search, filter, and adjust academic metadata.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatPill icon={Users} label="Total" value={rows.length} color="border-blue-500/25 bg-blue-500/10 text-blue-300" />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div {...fadeUp(0.06)} className="flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, code…"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 backdrop-blur focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="appearance-none rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-9 pr-8 text-sm text-slate-200 backdrop-blur focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div {...fadeUp(0.1)} className="group relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 opacity-60 blur transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Student', 'Code', 'Department', 'Semester', 'Actions'].map((h) => (
                      <th key={h} className="bg-slate-950/60 px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group/row border-t border-white/5 transition-colors duration-150 hover:bg-blue-500/5"
                    >
                      {/* Student */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${r.first_name} ${r.last_name}`} />
                          <div>
                            <p className="font-semibold text-slate-200">
                              {r.first_name} {r.last_name}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                              <Mail className="h-3 w-3" /> {r.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-2.5 py-1 w-fit">
                          <Hash className="h-3 w-3 text-slate-500" />
                          <span className="text-xs font-mono font-semibold text-slate-300">{r.student_code}</span>
                        </div>
                      </td>

                      {/* Dept */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm text-slate-300">{r.department_name}</span>
                        </div>
                      </td>

                      {/* Semester */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                          <input
                            type="number"
                            defaultValue={r.semester}
                            className="w-16 rounded-lg border border-white/10 bg-slate-800/60 px-2 py-1 text-center text-xs font-semibold text-slate-200 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (v !== r.semester) patch(r.id, { semester: v });
                            }}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async () => {
                            if (!confirm('Delete user?')) return;
                            await api.delete(`/api/admin/users/${r.id}`);
                            toast.success('Removed');
                            load();
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all duration-200 hover:border-rose-500/50 hover:bg-rose-500/20 hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {!rows.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-16"
                >
                  <GraduationCap className="h-10 w-10 text-slate-700" />
                  <p className="text-sm font-medium text-slate-500">No students found</p>
                  <p className="text-xs text-slate-600">Try adjusting your search or department filter</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}