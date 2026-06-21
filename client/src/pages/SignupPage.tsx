import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useTheme } from '../hooks/useTheme';
import { LeafIcon, GlobeIcon, ChartIcon, TrophyIcon, AlertIcon, SparklesIcon, CheckIcon, GraduationCapIcon, BriefcaseIcon, HomeIcon, SettingsIcon } from '../components/Icons';

const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
  if (!pass) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  const levels = [
    { label: 'Too weak', color: '#f87171' },
    { label: 'Weak', color: '#fb923c' },
    { label: 'Fair', color: '#fbbf24' },
    { label: 'Good', color: '#4ade80' },
    { label: 'Strong', color: 'var(--color-primary)' },
  ];
  return { score, ...levels[score] };
};

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [diet, setDiet] = useState<'student' | 'professional' | 'family' | 'custom'>('student');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) { setError('Name and username are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    try {
      setSubmitting(true);
      setError('');
      const avatarOptions = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' + username,
      ];
      const user = await apiClient.createUser(name.trim(), username.trim().toLowerCase(), avatarOptions[0]);
      navigate(`/calculator/${user.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Username may already be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  const personas = [
    { id: 'student', icon: <GraduationCapIcon size={20} />, label: 'Eco Student', desc: 'Low-budget, transit & cycling lifestyle' },
    { id: 'professional', icon: <BriefcaseIcon size={20} />, label: 'Professional', desc: 'High-travel, office commute lifestyle' },
    { id: 'family', icon: <HomeIcon size={20} />, label: 'Suburban Family', desc: 'Family household with SUV & utilities' },
    { id: 'custom', icon: <SettingsIcon size={20} />, label: 'Custom', desc: 'Define your own lifestyle baseline' },
  ];

  return (
    <div className="auth-page">
      {/* Left Visual */}
      <div className="auth-visual">
        <div style={{ position: 'absolute', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(var(--color-secondary), transparent 70%)', filter: 'blur(130px)', opacity: 0.08, top: '-5%', left: '-15%' }}></div>
        <div style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(var(--color-primary), transparent 70%)', filter: 'blur(110px)', opacity: 0.1, bottom: '10%', right: '-10%' }}></div>

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '24px', filter: 'drop-shadow(0 0 24px rgba(56,189,248,0.3))' }}>
            <LeafIcon size={64} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
            Start Your<br />
            <span style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Green Journey</span>
          </h2>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.75', color: 'var(--text-secondary)', marginBottom: '36px' }}>
            Join over 12,000 individuals taking climate action through data-driven sustainability choices.
          </p>

          {/* Benefits list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            {[
              { icon: <CheckIcon size={16} color="var(--color-primary)" />, text: 'Instant carbon footprint calculation' },
              { icon: <SparklesIcon size={16} color="var(--color-secondary)" />, text: 'AI-personalized coaching insights' },
              { icon: <TrophyIcon size={16} color="var(--color-average)" />, text: 'Gamified XP, levels & achievement badges' },
              { icon: <ChartIcon size={16} color="var(--color-accent)" />, text: 'Beautiful analytics dashboard' },
              { icon: <CheckIcon size={16} color="var(--color-primary)" />, text: '100% free — no credit card required' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{b.icon}</div>
                <span style={{ fontSize: '0.87rem' }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="auth-form-side">
        <div className="auth-form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060b14' }}>
                <LeafIcon size={16} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CarbonWise AI</span>
            </Link>
            <button className="theme-toggle" onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.9rem' }}>
            Set up your profile in 30 seconds and start tracking.
          </p>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '20px', fontSize: '0.84rem', color: 'var(--color-critical)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid grid-2" style={{ gap: '12px' }}>
              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <input id="signup-name" type="text" placeholder="Alex Green" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="signup-username">Username</label>
                <input id="signup-username" type="text" placeholder="alex_green" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input id="signup-password" type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
              {password.length > 0 && (
                <div>
                  <div className="password-strength-bar">
                    <div className="password-strength-fill" style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }}></div>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: strength.color, marginTop: '5px', fontWeight: 600 }}>{strength.label}</div>
                </div>
              )}
            </div>

            {/* Lifestyle Preference */}
            <div className="form-group">
              <label>Lifestyle Type <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>(helps calibrate your calculator)</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {personas.map(p => (
                  <button key={p.id} type="button" onClick={() => setDiet(p.id as any)} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: diet === p.id ? 'rgba(0,229,160,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${diet === p.id ? 'rgba(0,229,160,0.35)' : 'var(--border-color)'}`, cursor: 'pointer', textAlign: 'left', transition: 'all var(--t-fast)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ color: diet === p.id ? 'var(--color-primary)' : 'var(--text-secondary)' }}>{p.icon}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: diet === p.id ? 'var(--color-primary)' : 'var(--text-primary)', marginBottom: '2px' }}>{p.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input type="checkbox" id="agree-terms" required style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
              <label htmlFor="agree-terms" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 'normal', fontWeight: 400, cursor: 'pointer', lineHeight: '1.5' }}>
                I agree to the <a href="#" style={{ color: 'var(--color-primary)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--color-primary)' }}>Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" id="signup-btn" disabled={submitting} style={{ padding: '13px', fontSize: '0.95rem' }}>
              {submitting ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
