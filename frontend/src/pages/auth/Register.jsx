import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, UserPlus } from 'lucide-react';

import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

export default function Register() {
  const [role, setRole] = useState('student');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    studentCode: '',
    departmentId: '',
    semester: 1,
    enrollmentYear: new Date().getFullYear(),
    employeeCode: '',
    designation: 'Faculty',
  });

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/departments');

        setDepartments(data.departments || []);

        if (data.departments?.[0]) {
          setForm((f) => ({
            ...f,
            departmentId: String(data.departments[0].id),
          }));
        }
      } catch {
        toast.error('Could not load departments. Is the API running?');
      }
    })();
  }, []);

  function update(key, value) {
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const payload = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        role,
        departmentId: Number(form.departmentId),
      };

      if (role === 'student') {
        payload.studentCode = form.studentCode;
        payload.semester = Number(form.semester);
        payload.enrollmentYear = Number(form.enrollmentYear);
      } else {
        payload.employeeCode = form.employeeCode;
        payload.designation = form.designation;
      }

      const { data } = await api.post('/auth/register', payload);

      setAuth(data.user, data.token);

      toast.success('Account created successfully!');

      navigate(
        role === 'faculty'
          ? '/faculty/dashboard'
          : '/student/dashboard',
        { replace: true }
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-12 md:py-16">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-80" />

      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-hub-blue/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-hub-purple/20 blur-3xl" />

      {/* Back Button */}
      <Link
        to="/"
        className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-white/20 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur transition-all hover:scale-105 hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-2xl"
      >
        <GlassCard className="border border-white/[0.12] bg-[rgba(10,12,40,0.80)] p-8 shadow-2xl backdrop-blur-2xl">

          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-hub-teal via-hub-blue to-hub-purple text-white shadow-xl"
            >
              <UserPlus className="h-7 w-7" />
            </motion.div>

            <h1 className="mt-5 text-3xl font-bold text-white">
              Join Smart Campus
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Create your academic workspace and access the campus ecosystem.
            </p>
          </div>

          {/* Role Selector */}
          <div className="mb-8 flex rounded-2xl bg-white/[0.06] border border-white/[0.08] p-1.5">
            {['student', 'faculty'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold capitalize transition-all duration-300 ${role === r
                  ? 'bg-white/[0.12] text-indigo-300 shadow-lg border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  First Name
                </label>

                <input
                  required
                  value={form.firstName}
                  onChange={(e) =>
                    update('firstName', e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Last Name
                </label>

                <input
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    update('lastName', e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email Address
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Password
              </label>

              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) =>
                  update('password', e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Phone Number
              </label>

              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Department
              </label>

              <select
                required
                value={form.departmentId}
                onChange={(e) =>
                  update('departmentId', e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Fields */}
            {role === 'student' ? (
              <>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Student Code
                  </label>

                  <input
                    required
                    value={form.studentCode}
                    onChange={(e) =>
                      update('studentCode', e.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Semester
                    </label>

                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={form.semester}
                      onChange={(e) =>
                        update('semester', e.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Enrollment Year
                    </label>

                    <input
                      type="number"
                      value={form.enrollmentYear}
                      onChange={(e) =>
                        update('enrollmentYear', e.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Employee Code
                  </label>

                  <input
                    required
                    value={form.employeeCode}
                    onChange={(e) =>
                      update('employeeCode', e.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Designation
                  </label>

                  <input
                    value={form.designation}
                    onChange={(e) =>
                      update('designation', e.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
                  />
                </div>
              </>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-2xl py-3 text-sm font-semibold shadow-xl transition-all hover:scale-[1.02]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Already have access?{' '}
            <Link
              to="/login"
              className="font-semibold text-hub-blue transition hover:text-hub-purple hover:underline"
            >
              Log in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
