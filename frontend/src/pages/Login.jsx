import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Moon, Sun, ShieldCheck, Users, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import { Button, Field, IconButton, inputClass } from '../components/ui';

const DEMO = [
  { role: 'admin', label: 'Admin',      email: 'kavinda@nexus.lk' },
  { role: 'hr',    label: 'HR Manager', email: 'malini@nexus.lk'  },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const spotRef = useRef(null);
  const spot = useSpotlight(spotRef);

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
    <div className="min-h-screen bg-bg flex">
      {/* Brand panel */}
      <aside className="hidden lg:flex w-[46%] max-w-[640px] bg-side-bg relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute -right-32 -top-32 w-[520px] h-[520px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(closest-side, var(--primary), transparent)' }}
          aria-hidden
        />
        <div className="relative"><Logo /></div>

        <div className="relative">
          <h2 className="text-[36px] leading-[1.15] font-extrabold text-white tracking-tight max-w-md">
            Run your people and operations from one place.
          </h2>
          <p className="text-side-fg text-[16.5px] mt-4 max-w-md leading-relaxed">
            Attendance, payroll and inventory, with attrition risk you can explain to your team.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              { icon: Users,       text: 'Employee records and monthly attendance' },
              { icon: Wallet,      text: 'Payroll with EPF and ETF worked out for you' },
              { icon: ShieldCheck, text: 'Risk scores that show the reasons behind them' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[15.5px] text-side-fg">
                <span className="w-8 h-8 rounded-lg bg-side-active flex items-center justify-center text-white shrink-0">
                  <Icon size={16} strokeWidth={2} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-[14px] text-side-fg-muted">NSBM Green University · Research prototype</div>
      </aside>

      {/* Form */}
      <main
        ref={spotRef}
        onPointerMove={spot.onMove}
        onPointerLeave={spot.onLeave}
        className="login-spotlight relative isolate flex-1 flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 sm:p-6">
          <div className="lg:hidden"><Logo light={false} /></div>
          <IconButton
            label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            className="ml-auto w-10 h-10 bg-surface border border-line text-fg-2"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 pb-16">
          <div className="w-full max-w-[400px]">
            <h1 className="text-[30px] font-extrabold text-fg tracking-tight">Welcome back</h1>
            <p className="text-[15.5px] text-fg-3 mt-1.5">Sign in to your workspace to continue.</p>

            {error && (
              <div className="mt-6 flex items-start gap-2.5 bg-danger-soft rounded-xl px-4 py-3 fade-in" role="alert">
                <AlertCircle size={16} className="text-danger-fg shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-[15px] text-danger-fg font-medium">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-7">
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@nexus.lk"
                  required
                  autoComplete="email"
                  className={`${inputClass} h-11`}
                />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className={`${inputClass} h-11 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-fg-3 hover:text-fg rounded-md"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Button type="submit" disabled={loading} className="w-full h-11 mt-2">
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-8">
              <div className="flex items-center gap-3 text-[14px] text-fg-3 mb-3">
                <span className="h-px flex-1 bg-line" /> Demo accounts <span className="h-px flex-1 bg-line" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DEMO.map((d) => (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => fillDemo(d.role)}
                    className="text-left px-4 py-3 rounded-xl bg-surface border border-line hover:border-primary hover:bg-primary-soft/40 transition-colors"
                  >
                    <div className="text-[15px] font-bold text-fg">{d.label}</div>
                    <div className="text-[14px] text-fg-3 mt-0.5 truncate">{d.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Cursor-following glow for the form side. Writes the pointer position to
 * CSS variables (once per frame) and toggles visibility; the gradient itself
 * lives in index.css under .login-spotlight so light/dark can differ.
 */
function useSpotlight(ref) {
  const frame = useRef(0);

  const onMove = (e) => {
    const el = ref.current;
    if (!el || e.pointerType === 'touch') return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${clientX - r.left}px`);
      el.style.setProperty('--my', `${clientY - r.top}px`);
      el.dataset.spot = 'on';
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    if (ref.current) ref.current.dataset.spot = 'off';
  };

  return { onMove, onLeave };
}
