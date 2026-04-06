import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#01696f"/>
            <path d="M10 24 L18 12 L26 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M13 20 H23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>FinanceOS</span>
        </div>
        <h1>Sign in</h1>
        <p className="login-sub">Finance Dashboard</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Email
            <input type="email" value={form.email} required
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="admin@finance.dev" />
          </label>
          <label>Password
            <input type="password" value={form.password} required
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="password123" />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="demo-accounts">
          <p>Demo accounts (password: <code>password123</code>)</p>
          <div className="demo-list">
            <span onClick={() => setForm({email:'admin@finance.dev', password:'password123'})}>👤 Admin</span>
            <span onClick={() => setForm({email:'analyst@finance.dev', password:'password123'})}>📊 Analyst</span>
            <span onClick={() => setForm({email:'viewer@finance.dev', password:'password123'})}>👁 Viewer</span>
          </div>
        </div>
      </div>
    </div>
  );
}