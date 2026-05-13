import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Users, Search, Trash2, Mail, Hash, Building2, Briefcase, BadgeCheck } from 'lucide-react';
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
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
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

export default function ManageFaculty() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');

  async function load() {
    const { data } = await api.get('/api/admin/faculty', { params: { search } });
    setRows(data.faculty || []);
  }

  useEffect(() => { load(); }, [search]);

  async function patch(userId, body) {
    try {
      await api.patch(`/api/admin/faculty/${userId}`, body);
      toast.success('Updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <Orb className="h-96 w-96 -left-32 -top-20 bg-violet-600/15" />
      <Orb className="h-72 w-72 right-0 top-40 bg-purple-600/10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="space-y-7">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="relative">
            <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-48 rounded-full bg-violet-500/10 blur-2xl" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Admin · Faculty</p>
            <h1 className="mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Manage Faculty
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">Keep roster codes and designations accurate.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatPill icon={Users} label="Total" value={rows.length} color="border-violet-500/25 bg-violet-500/10 text-violet-300" />
          </div>
        </motion.div>

        {/* Search */}
        <motion.div {...fadeUp(0.06)}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, code…"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 backdrop-blur focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div {...fadeUp(0.1)} className="group relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-violet-500/15 to-purple-500/10 opacity-60 blur transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Faculty', 'Code', 'Department', 'Designation', 'Actions'].map((h) => (
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
                      className="group/row border-t border-white/5 transition-colors duration-150 hover:bg-violet-500/5"
                    >
                      {/* Faculty */}
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
                          <span className="text-xs font-mono font-semibold text-slate-300">{r.employee_code}</span>
                        </div>
                      </td>

                      {/* Dept */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-sm text-slate-300">{r.department_name}</span>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                          <input
                            defaultValue={r.designation}
                            className="min-w-[130px] rounded-lg border border-white/10 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-200 transition focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                            onBlur={(e) => {
                              const v = e.target.value;
                              if (v !== r.designation) patch(r.id, { designation: v });
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
                  <Users className="h-10 w-10 text-slate-700" />
                  <p className="text-sm font-medium text-slate-500">No faculty found</p>
                  <p className="text-xs text-slate-600">Try adjusting your search query</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}