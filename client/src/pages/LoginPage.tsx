import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { isValidIndianMobile } from '../utils/validation';

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!isValidIndianMobile(mobile)) { setError('Enter a valid 10-digit Indian mobile number'); return; }
    if (!password) { setError('Password is required'); return; }
    setLoading(true);
    const res = await login(mobile, password);
    setLoading(false);
    if (res.success && res.user) {
      setUser(res.user);
      // Restrict to strict relative paths only (must start with '/', no '//', no encoded sequences)
      const redirect = params.get('redirect') ?? '/';
      const safePath = /^\/[a-zA-Z0-9_\-./]*$/.test(redirect) ? redirect : '/';
      navigate(safePath, { replace: true });
    } else {
      setError(res.message ?? 'Login failed');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-6 pt-20 pb-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🌸</span>
            <span className="text-2xl font-extrabold text-gradient-gold">Safron</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-saffron-text">Welcome Back</h1>
          <p className="text-saffron-muted mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8">
          {/* Demo hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-sm text-blue-700">
            <strong>Demo:</strong> Mobile: <code>9999999999</code> / Password: <code>demo123</code>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-saffron-text mb-1.5">Mobile Number</label>
              <input
                type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                placeholder="10-digit mobile number" maxLength={10} required
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-saffron-text mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Your password" required
                className="form-input"
              />
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-base mt-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-saffron-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="text-gold-600 font-semibold hover:text-gold-700">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
