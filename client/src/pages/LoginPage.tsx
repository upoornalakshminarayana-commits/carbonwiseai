import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { User } from '../types';
import { useTheme } from '../hooks/useTheme';
import { EcoAssistant } from '../components/EcoAssistant';
import { LeafIcon, GlobeIcon, ChartIcon, TrophyIcon, AlertIcon, SparklesIcon, GraduationCapIcon, BriefcaseIcon, HomeIcon } from '../components/Icons';

export const LoginPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.getUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.name.toLowerCase() === username.toLowerCase());
    if (!found) {
      setError('No profile found with that name or username. Try an existing persona or sign up.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => navigate(`/dashboard/${found.id}`), 600);
  };

  const handlePersonaSelect = (user: User) => {
    navigate(`/dashboard/${user.id}`);
  };

  const personaColors: Record<string, string> = {
    student: 'var(--color-primary)',
    professional: 'var(--color-accent)',
    family: 'var(--color-average)',
    default: 'var(--color-secondary)',
  };

  const personaIcons: Record<string, React.ReactNode> = {
    student: <GraduationCapIcon size={14} />,
    professional: <BriefcaseIcon size={14} />,
    family: <HomeIcon size={14} />,
    default: <LeafIcon size={14} />,
  };

  return (
    <div className="auth-page">
      {/* Left Visual Panel */}
      <div className="auth-visual">
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(var(--color-primary), transparent 70%)', filter: 'blur(120px)', opacity: 0.1, top: '-10%', right: '-10%' }}></div>
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(var(--color-accent), transparent 70%)', filter: 'blur(100px)', opacity: 0.08, bottom: '0%', left: '0%' }}></div>

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '24px', filter: 'drop-shadow(0 0 30px rgba(0,229,160,0.3))' }}>
            <GlobeIcon size={64} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
            Welcome Back,<br />
            <span style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Eco Warrior</span>
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.75', color: 'var(--text-secondary)', marginBottom: '36px' }}>
            Continue your sustainability journey. Your planet needs your action.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { icon: <ChartIcon size={22} color="var(--color-primary)" />, label: 'CO₂ Tracked', value: '2.5M kg' },
              { icon: <TrophyIcon size={22} color="var(--color-secondary)" />, label: 'Badges Earned', value: '48K+' },
              { icon: <LeafIcon size={22} color="var(--color-primary)" />, label: 'Active Users', value: '12.4K' },
              { icon: <ChartIcon size={22} color="var(--color-accent)" />, label: 'Avg Reduction', value: '29%' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-side">
        <div className="auth-form-card">
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060b14' }}>
                <LeafIcon size={16} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CarbonWise AI</span>
            </Link>
            <button className="theme-toggle" onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Sign in to your account</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>
            Enter your name or username, or select a persona below.
          </p>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '20px', fontSize: '0.84rem', color: 'var(--color-critical)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div className="form-group">
              <label htmlFor="login-username">Name or Username</label>
              <input id="login-username" type="text" placeholder="e.g. Alex or alex_green" value={username} onChange={e => { setUsername(e.target.value); setError(''); }} required />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" type="password" placeholder="••••••••" defaultValue="demo123" />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <a href="#" style={{ fontSize: '0.78rem', color: 'var(--color-secondary)' }}>Forgot password?</a>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="remember-me" style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }} />
              <label htmlFor="remember-me" style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 'normal', fontWeight: 400, cursor: 'pointer' }}>Remember me</label>
            </div>
            <button type="submit" className="btn btn-primary" id="login-btn" disabled={submitting} style={{ padding: '13px', fontSize: '0.95rem' }}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Persona Quick Select */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }}>
              — Or select a persona —
            </div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '56px' }}></div>)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.map(u => {
                  const color = personaColors[u.persona] || personaColors.default;
                  const icon = personaIcons[u.persona] || personaIcons.default;
                  return (
                    <button key={u.id} onClick={() => handlePersonaSelect(u)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all var(--t-fast)', fontFamily: 'var(--font-sans)', textAlign: 'left', width: '100%' }}
                      onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = color; b.style.background = `${color}10`; }}
                      onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = 'var(--border-color)'; b.style.background = 'rgba(255,255,255,0.03)'; }}>
                      <img src={u.avatar} alt={u.name} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `2px solid ${color}50`, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {icon} <span style={{ textTransform: 'capitalize' }}>{u.persona}</span> · Lvl {u.level} · {u.points} XP
                        </div>
                      </div>
                      <span style={{ fontSize: '0.78rem', color, fontWeight: 700 }}>Select →</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '28px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
