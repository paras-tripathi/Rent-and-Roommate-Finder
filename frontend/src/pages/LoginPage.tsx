import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Eye, EyeOff, LogIn, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'TENANT') navigate('/dashboard/tenant');
      else if (user.role === 'OWNER') navigate('/dashboard/owner');
      else navigate('/dashboard/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center p-4 bg-grid-pattern">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25"
            >
              <Home size={22} className="text-white" />
            </motion.div>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 dark:from-indigo-400 dark:to-pink-400">
            Welcome Back
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1.5 text-sm">Sign in to continue your search</p>
        </div>

        <div className="card p-8 bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-850 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                id="email-input"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-indigo-500 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 glow-btn bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2.5 flex items-center gap-1.5">
              <Key size={12} /> DEMO CREDENTIALS
            </p>
            <div className="space-y-1.5 text-xs text-dark-600 dark:text-dark-300">
              <p>👤 <span className="font-semibold text-dark-800 dark:text-dark-100">Tenant:</span> alice.tenant@example.com <span className="text-dark-400">/</span> tenant123456</p>
              <p>🏠 <span className="font-semibold text-dark-800 dark:text-dark-100">Owner:</span> sarah.owner@example.com <span className="text-dark-400">/</span> owner123456</p>
              <p>⚙️ <span className="font-semibold text-dark-800 dark:text-dark-100">Admin:</span> admin@rentflatmate.com <span className="text-dark-400">/</span> admin123456</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
