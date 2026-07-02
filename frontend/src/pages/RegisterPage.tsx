import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Eye, EyeOff, UserPlus, Building2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TENANT' as 'TENANT' | 'OWNER',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      if (form.role === 'TENANT') navigate('/dashboard/tenant');
      else navigate('/dashboard/owner');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-violet-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Home size={22} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Join thousands of users today</p>
        </div>

        <div className="card p-8">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              ['TENANT', 'I need a room', User, 'Looking for a place to rent'],
              ['OWNER', 'I have a room', Building2, 'List your property'],
            ] as const).map(([role, label, Icon, sublabel]) => (
              <button
                key={role}
                id={`role-${role.toLowerCase()}-btn`}
                type="button"
                onClick={() => setForm(f => ({ ...f, role }))}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  form.role === role
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'border-dark-200 dark:border-dark-700 hover:border-dark-300 dark:hover:border-dark-600 text-dark-600 dark:text-dark-400'
                }`}
              >
                <Icon size={22} />
                <div className="text-center">
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-dark-500 dark:text-dark-400">{sublabel}</p>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                id="name-input"
                type="text"
                className="input"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                id="register-email-input"
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
                  id="register-password-input"
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && form.password.length < 8 && (
                <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
              )}
            </div>
            <button
              id="register-submit-btn"
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? 'Creating...' : `Create ${form.role === 'TENANT' ? 'Tenant' : 'Owner'} Account`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
