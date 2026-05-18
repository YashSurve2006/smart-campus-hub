import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  ArrowLeft, UserPlus, Mail, Lock, Eye, EyeOff,
  Phone, Building2, Hash, BookOpen, CalendarDays,
  Briefcase, BadgeCheck, User, Zap,
} from 'lucide-react';

import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

/* ─── tiny shared primitives ─── */

function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
      {children}
    </label>
  );
}

function InputWrapper({ icon: Icon, iconColor, children }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2"
          style={{ color: iconColor || '#475569' }}
        />
      )}
      {children}
    </div>
  );
}

const inputBase =
  'w-full rounded-xl py-3 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600';
const inputStyle = (focused, color = 'rgba(139,92,246,0.45)') => ({
  background: focused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
  border: focused ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.07)',
  boxShadow: focused ? `0 0 0 3px ${color.replace('0.45', '0.1')}` : 'none',
});

/* ─── main component ─── */

export default function Register() {
  const [role, setRole] = useState('student');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

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
          setForm((f) => ({ ...f, departmentId: String(data.departments[0].id) }));
        }
      } catch {
        toast.error('Could not load departments. Is the API running?');
      }
    })();
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
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
      navigate(role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  });

  /* Focus-aware icon colour */
  const iconColor = (field) => focused === field ? '#a78bfa' : '#475569';

  /* Shared input class with icon padding */
  function fieldClass(withIcon = true, withRightPad = false) {
    return `${inputBase} ${withIcon ? 'pl-10' : 'pl-4'} ${withRightPad ? 'pr-11' : 'pr-4'}`;
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-12 md:py-16" style={{ background: '#05030f' }}>

      {/* ── Aurora blobs ── */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.32) 0%, transparent 70%)' }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-[460px] w-[460px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.28) 0%, transparent 70%)' }} />
      <div aria-hidden className="pointer-events-none absolute bottom-20 left-1/3 h-[320px] w-[320px] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(circle, rgba(192,38,211,0.2) 0%, transparent 70%)' }} />

      {/* ── Grid ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* ── Back button ── */}
      <Link
        to="/"
        className="absolute left-5 top-5 z-30 flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-400 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 mx-auto max-w-2xl"
      >
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-10"
          style={{
            background: 'rgba(9,7,26,0.88)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
            backdropFilter: 'blur(28px)',
          }}
        >
          {/* Top edge highlight */}
          <div aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)' }} />

          {/* ── Header ── */}
          <motion.div {...fadeUp(0.05)} className="mb-8 text-center">
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #0891b2, #7c3aed, #a855f7)',
                boxShadow: '0 0 28px rgba(139,92,246,0.5)',
              }}
            >
              <UserPlus className="h-6 w-6 text-white" />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white">
              Join Smart Campus
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Create your academic workspace and access the campus ecosystem.
            </p>
          </motion.div>

          {/* ── Role selector ── */}
          <motion.div {...fadeUp(0.1)} className="mb-8">
            <div
              className="flex rounded-2xl p-1.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {['student', 'faculty'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="relative flex-1 rounded-xl py-3 text-sm font-bold capitalize transition-all duration-300"
                  style={{ color: role === r ? '#e2e8f0' : '#64748b' }}
                >
                  {role === r && (
                    <motion.div
                      layoutId="role-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(139,92,246,0.35)',
                        boxShadow: '0 0 16px rgba(139,92,246,0.2)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{r}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Form ── */}
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Name row */}
            <motion.div {...fadeUp(0.14)} className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>First Name</FieldLabel>
                <InputWrapper icon={User} iconColor={iconColor('firstName')}>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    onFocus={() => setFocused('firstName')}
                    onBlur={() => setFocused(null)}
                    placeholder="Yash"
                    className={fieldClass()}
                    style={inputStyle(focused === 'firstName')}
                  />
                </InputWrapper>
              </div>
              <div>
                <FieldLabel>Last Name</FieldLabel>
                <InputWrapper icon={User} iconColor={iconColor('lastName')}>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    onFocus={() => setFocused('lastName')}
                    onBlur={() => setFocused(null)}
                    placeholder="Sharma"
                    className={fieldClass()}
                    style={inputStyle(focused === 'lastName')}
                  />
                </InputWrapper>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div {...fadeUp(0.18)}>
              <FieldLabel>Email Address</FieldLabel>
              <InputWrapper icon={Mail} iconColor={iconColor('email')}>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="you@campus.edu"
                  className={fieldClass()}
                  style={inputStyle(focused === 'email', 'rgba(34,211,238,0.45)')}
                />
              </InputWrapper>
            </motion.div>

            {/* Password */}
            <motion.div {...fadeUp(0.22)}>
              <FieldLabel>Password</FieldLabel>
              <InputWrapper icon={Lock} iconColor={iconColor('password')}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="Min. 8 characters"
                  className={fieldClass(true, true)}
                  style={inputStyle(focused === 'password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </InputWrapper>
            </motion.div>

            {/* Phone */}
            <motion.div {...fadeUp(0.26)}>
              <FieldLabel>Phone Number <span className="normal-case text-slate-600 tracking-normal font-medium">(optional)</span></FieldLabel>
              <InputWrapper icon={Phone} iconColor={iconColor('phone')}>
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused(null)}
                  placeholder="+91 98765 43210"
                  className={fieldClass()}
                  style={inputStyle(focused === 'phone')}
                />
              </InputWrapper>
            </motion.div>

            {/* Department */}
            <motion.div {...fadeUp(0.3)}>
              <FieldLabel>Department</FieldLabel>
              <div className="relative">
                <Building2
                  className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2"
                  style={{ color: iconColor('department') }}
                />
                <select
                  required
                  value={form.departmentId}
                  onChange={(e) => update('departmentId', e.target.value)}
                  onFocus={() => setFocused('department')}
                  onBlur={() => setFocused(null)}
                  className={`${fieldClass()} appearance-none cursor-pointer`}
                  style={{
                    ...inputStyle(focused === 'department'),
                    // Override bg so option text stays readable in browser select
                    background: focused === 'department' ? '#12102a' : '#0e0c24',
                  }}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id} style={{ background: '#0e0c24' }}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {/* Chevron */}
                <svg
                  className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </motion.div>

            {/* ── Conditional role fields ── */}
            <AnimatePresence mode="wait">
              {role === 'student' ? (
                <motion.div
                  key="student-fields"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="space-y-5"
                >
                  {/* Student Code */}
                  <div>
                    <FieldLabel>Student Code</FieldLabel>
                    <InputWrapper icon={Hash} iconColor={iconColor('studentCode')}>
                      <input
                        required
                        value={form.studentCode}
                        onChange={(e) => update('studentCode', e.target.value)}
                        onFocus={() => setFocused('studentCode')}
                        onBlur={() => setFocused(null)}
                        placeholder="SCH2024001"
                        className={fieldClass()}
                        style={inputStyle(focused === 'studentCode')}
                      />
                    </InputWrapper>
                  </div>

                  {/* Semester + Year */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Semester</FieldLabel>
                      <InputWrapper icon={BookOpen} iconColor={iconColor('semester')}>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={form.semester}
                          onChange={(e) => update('semester', e.target.value)}
                          onFocus={() => setFocused('semester')}
                          onBlur={() => setFocused(null)}
                          className={fieldClass()}
                          style={inputStyle(focused === 'semester')}
                        />
                      </InputWrapper>
                    </div>
                    <div>
                      <FieldLabel>Enrollment Year</FieldLabel>
                      <InputWrapper icon={CalendarDays} iconColor={iconColor('enrollmentYear')}>
                        <input
                          type="number"
                          value={form.enrollmentYear}
                          onChange={(e) => update('enrollmentYear', e.target.value)}
                          onFocus={() => setFocused('enrollmentYear')}
                          onBlur={() => setFocused(null)}
                          className={fieldClass()}
                          style={inputStyle(focused === 'enrollmentYear')}
                        />
                      </InputWrapper>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="faculty-fields"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="space-y-5"
                >
                  {/* Employee Code */}
                  <div>
                    <FieldLabel>Employee Code</FieldLabel>
                    <InputWrapper icon={BadgeCheck} iconColor={iconColor('employeeCode')}>
                      <input
                        required
                        value={form.employeeCode}
                        onChange={(e) => update('employeeCode', e.target.value)}
                        onFocus={() => setFocused('employeeCode')}
                        onBlur={() => setFocused(null)}
                        placeholder="EMP2024001"
                        className={fieldClass()}
                        style={inputStyle(focused === 'employeeCode')}
                      />
                    </InputWrapper>
                  </div>

                  {/* Designation */}
                  <div>
                    <FieldLabel>Designation</FieldLabel>
                    <InputWrapper icon={Briefcase} iconColor={iconColor('designation')}>
                      <input
                        value={form.designation}
                        onChange={(e) => update('designation', e.target.value)}
                        onFocus={() => setFocused('designation')}
                        onBlur={() => setFocused(null)}
                        placeholder="Assistant Professor"
                        className={fieldClass()}
                        style={inputStyle(focused === 'designation')}
                      />
                    </InputWrapper>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Submit ── */}
            <motion.div {...fadeUp(0.36)} className="pt-1">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.012, boxShadow: '0 0 30px rgba(139,92,246,0.45)' }}
                whileTap={loading ? {} : { scale: 0.985 }}
                className="group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-60"
                style={{
                  background: 'linear-gradient(130deg, #0891b2 0%, #7c3aed 45%, #a855f7 100%)',
                  boxShadow: '0 4px 20px rgba(109,40,217,0.4)',
                  transition: 'box-shadow 0.3s',
                }}
              >
                {/* Shine sweep */}
                <span className="absolute inset-0 -translate-x-full skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating Account…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Create Account
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>

          {/* ── Footer ── */}
          <motion.p {...fadeUp(0.42)} className="mt-7 text-center text-xs text-slate-600">
            Already have access?{' '}
            <Link
              to="/login"
              className="font-bold text-violet-400 transition hover:text-cyan-400"
            >
              Sign in →
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}