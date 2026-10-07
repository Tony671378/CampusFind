'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Lock,
  Mail,
  User,
  GraduationCap,
  Building,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register, quickLogin } = useAuth();

  const [isRegister, setIsRegister] = useState(searchParams.get('tab') === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('3rd Year');
  const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          password,
          college_id: collegeId.trim(),
          department,
          year,
          role,
        });
        if (!res.success) {
          setError(res.error || 'Registration failed');
        } else {
          router.push('/');
        }
      } else {
        const res = await login(email.trim(), password);
        if (!res.success) {
          setError(res.error || 'Login failed');
        } else {
          router.push('/');
        }
      }
    } catch {
      setError('An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      {/* Brand logo */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 mx-auto shadow-xl shadow-indigo-600/30 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Compass className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-heading">
          {isRegister ? 'Join CampusFind' : 'Welcome Back'}
        </h1>
        <p className="text-xs text-slate-400">
          Sign in using your verified college credentials (@college.edu)
        </p>
      </div>

      {/* Quick Demo Logins Section */}
      <div className="p-4 rounded-3xl glass-panel border border-indigo-700/40 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Instant 1-Click Demo Login</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Select any seeded role to immediately test real features without typing:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => quickLogin(1)}
            className="p-2 rounded-xl text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs transition-colors flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">A</div>
            <div>
              <span className="font-bold text-white block">Alex Rivera</span>
              <span className="text-[10px] text-slate-400">Student (CS 3rd Year)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => quickLogin(8)}
            className="p-2 rounded-xl text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs transition-colors flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">H</div>
            <div>
              <span className="font-bold text-white block">Officer Hall</span>
              <span className="text-[10px] text-slate-400">Campus Security (Staff)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => quickLogin(9)}
            className="p-2 rounded-xl text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs transition-colors flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">V</div>
            <div>
              <span className="font-bold text-white block">Dr. Linda Vance</span>
              <span className="text-[10px] text-slate-400">Library Staff</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => quickLogin(10)}
            className="p-2 rounded-xl text-left bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs transition-colors flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs">M</div>
            <div>
              <span className="font-bold text-white block">Dean Miller</span>
              <span className="text-[10px] text-slate-400">Campus Administrator</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Auth Form */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-800 space-y-5 shadow-2xl">
        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`py-2 rounded-xl transition-all ${
              !isRegister ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`py-2 rounded-xl transition-all ${
              isRegister ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">College ID *</label>
                  <input
                    type="text"
                    value={collegeId}
                    onChange={e => setCollegeId(e.target.value)}
                    placeholder="e.g. CS-2023-042"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as 'student' | 'staff' | 'admin')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="student">Student</option>
                    <option value="staff">Campus Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    placeholder="3rd Year"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Campus Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="username@college.edu"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            {isRegister && (
              <span className="text-[10px] text-slate-500 mt-1 block">
                Must end with official domain: @college.edu
              </span>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            {!isRegister && (
              <span className="text-[10px] text-slate-500 mt-1 block">
                Demo accounts password is: <strong>college123</strong>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isRegister ? 'Complete Registration' : 'Sign In to CampusFind'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading authentication...</div>}>
      <LoginContent />
    </Suspense>
  );
}
