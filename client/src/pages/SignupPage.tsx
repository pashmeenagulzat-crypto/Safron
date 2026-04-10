import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../utils/api';
import { isValidIndianMobile } from '../utils/validation';

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof form, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!isValidIndianMobile(form.mobile)) { setError('Enter a valid 10-digit mobile'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    const res = await signup({ name: form.name, mobile: form.mobile, email: form.email || undefined, password: form.password });
    setLoading(false);
    if (res.success) {
      navigate('/login?registered=1');
    } else {
      setError(res.message ?? 'Signup failed');
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
          <h1 className="text-2xl font-extrabold text-saffron-text">Create Account</h1>
          <p className="text-saffron-muted mt-1">Join thousands of happy Safron customers</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name',    label: 'Full Name',    type: 'text',     placeholder: 'Your full name' },
              { key: 'mobile',  label: 'Mobile',       type: 'tel',      placeholder: '10-digit mobile' },
              { key: 'email',   label: 'Email (opt)',  type: 'email',    placeholder: 'your@email.com' },
              { key: 'password',label: 'Password',     type: 'password', placeholder: 'Min 6 characters' },
              { key: 'confirm', label: 'Confirm Pass', type: 'password', placeholder: 'Re-enter password' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-saffron-text mb-1.5">{label}</label>
                <input type={type} value={form[key as keyof typeof form]} placeholder={placeholder}
                  onChange={e => set(key as keyof typeof form, e.target.value)}
                  required={key !== 'email'} className="form-input" />
              </div>
            ))}
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-base mt-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-saffron-muted">
            Already have an account? <Link to="/login" className="text-gold-600 font-semibold hover:text-gold-700">Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
