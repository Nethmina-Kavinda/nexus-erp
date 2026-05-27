import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') { setEmail('kavinda@nexus.lk'); setPassword('nexus123'); }
    if (role === 'hr')    { setEmail('malini@nexus.lk');  setPassword('nexus123'); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-accent-blue flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            <span className="text-white font-heading font-bold text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-white">NEXUS ERP</h1>
          <p className="text-text-muted text-[11px] font-mono uppercase tracking-[0.2em] mt-1.5">Enterprise Portal</p>
        </div>

        {/* Card */}
        <div className="bg-surface-1 border border-border rounded-xl p-7">
          <h2 className="text-lg font-heading font-semibold text-white">Sign in</h2>
          <p className="text-[13px] text-text-secondary mt-1">Access your workspace</p>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 bg-accent-red/10 border border-accent-red/30 rounded-lg px-3.5 py-2.5 fade-in">
              <AlertCircle size={15} className="text-accent-red shrink-0 mt-0.5" strokeWidth={2} />
              <div className="text-[13px] text-accent-red">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nexus.lk"
                required
                autoComplete="email"
                className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-text-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-text-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white font-heading font-semibold text-sm py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(59,130,246,0.3)] hover:shadow-[0_0_24px_rgba(59,130,246,0.4)]"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo quick-fill */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-3">Demo accounts</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="group text-left p-3 rounded-lg bg-surface-2 border border-border hover:border-accent-blue/50 hover:bg-surface-3 transition-all"
              >
                <div className="text-[11px] font-heading font-semibold text-accent-blue">Admin</div>
                <div className="text-[11px] font-mono text-text-secondary mt-1 truncate">kavinda@nexus.lk</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('hr')}
                className="group text-left p-3 rounded-lg bg-surface-2 border border-border hover:border-accent-purple/50 hover:bg-surface-3 transition-all"
              >
                <div className="text-[11px] font-heading font-semibold text-accent-purple">HR Manager</div>
                <div className="text-[11px] font-mono text-text-secondary mt-1 truncate">malini@nexus.lk</div>
              </button>
            </div>
            <div className="text-[11px] text-text-muted text-center mt-3">
              Password: <span className="font-mono text-text-secondary">nexus123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
