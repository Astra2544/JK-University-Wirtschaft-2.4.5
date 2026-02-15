/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  LOGIN PAGE | ÖH Wirtschaft Website
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const pv = { 
  initial: { opacity: 0 }, 
  animate: { opacity: 1, transition: { duration: 0.5 } }, 
  exit: { opacity: 0, transition: { duration: 0.2 } } 
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login fehlgeschlagen');
      }

      // Store token and admin data
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('admin', JSON.stringify(data.admin));

      // Redirect to admin panel
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={pv} initial="initial" animate="animate" exit="exit" className="min-h-screen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Zurück zur Website
        </button>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="text-white" size={28} />
            </div>
            <h1 data-testid="login-page-title" className="text-xl font-bold text-white mb-1">Admin Login</h1>
            <p className="text-blue-100 text-sm">ÖH Wirtschaft Verwaltung</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Benutzername</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  data-testid="login-username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Dein Benutzername"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Passwort</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  data-testid="login-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Dein Passwort"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Anmelden...
                </>
              ) : (
                'Anmelden'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-6">
            <p className="text-xs text-slate-400 text-center">
              Nur für autorisierte Administratoren.
              <br />
              Bei Problemen kontaktiere: <a href="mailto:wirtschaft@oeh.jku.at" className="text-blue-500 hover:underline">wirtschaft@oeh.jku.at</a>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
