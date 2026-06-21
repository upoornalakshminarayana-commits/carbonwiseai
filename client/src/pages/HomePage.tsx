import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { User } from '../types';
import { PersonaCard } from '../components/PersonaCard';
import {
  LeafIcon, GlobeIcon, CalculatorIcon, BrainIcon, ChartIcon, TargetIcon,
  TrophyIcon, PlusIcon
} from '../components/Icons';

const iconMap: Record<string, React.ReactNode> = {
  calculator: <CalculatorIcon size={22} color="var(--color-primary)" />,
  ai:         <BrainIcon size={22} color="var(--color-secondary)" />,
  rewards:    <TrophyIcon size={22} color="#fbbf24" />,
};

export const HomePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSelectUser = (id: number) => navigate(`/dashboard/${id}`);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username) { setFormError('Name and Username are required'); return; }
    try {
      setSubmitting(true);
      setFormError(null);
      const newUser = await apiClient.createUser(name, username);
      setUsers(prev => [...prev, newUser]);
      setShowForm(false);
      setName('');
      setUsername('');
      navigate(`/calculator/${newUser.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: 'calculator', title: 'Carbon Calculator', desc: 'Establish a baseline across transportation, energy, diet, shopping, and waste to understand where you stand.' },
    { icon: 'ai', title: 'AI Recommendations', desc: 'Receive personalized coaching suggestions to systematically optimize your habits and lower your footprint.' },
    { icon: 'rewards', title: 'XP & Achievements', desc: 'Earn points and climb levels by logging sustainable daily actions. Collect digital badges as marks of honor.' },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>

      {/* ── Hero Section ── */}
      <header style={{ textAlign: 'center', marginBottom: '72px', marginTop: '48px' }}>
        <div className="gradient-pill" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <GlobeIcon size={13} /> Your Personal Sustainability Journey
        </div>
        <h1 style={{ marginBottom: '20px', maxWidth: '800px', margin: '0 auto 20px auto' }}>
          Meet Your Personal<br />Carbon Coach
        </h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          Track daily emissions, set reduction goals, and earn gamified achievements. Choose a persona below or create a custom profile to begin your sustainability journey.
        </p>
      </header>

      {/* ── Profile Selection ── */}
      <section style={{ marginBottom: '72px' }}>
        <div className="flex-space" style={{ marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Select a Profile</h2>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Choose an existing persona or build a custom one</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            id="toggle-custom-profile-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {showForm ? 'Cancel' : <><PlusIcon size={14} /> Custom Profile</>}
          </button>
        </div>

        {showForm && (
          <div className="glass-card card-glow-primary" style={{ maxWidth: '480px', margin: '0 auto 40px auto', animation: 'fadeInUp 0.35s var(--ease-out) both' }}>
            <h3 style={{ marginBottom: '6px', fontSize: '1.1rem' }}>Create New Persona</h3>
            <p style={{ fontSize: '0.82rem', marginBottom: '24px' }}>Set up your custom carbon tracking profile</p>

            {formError && (
              <div style={{
                color: 'var(--color-critical)',
                fontSize: '0.85rem',
                marginBottom: '16px',
                background: 'rgba(248, 113, 113, 0.08)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(248, 113, 113, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="custom-name">Full Name</label>
                <input
                  id="custom-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="custom-username">Username</label>
                <input
                  id="custom-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex_green"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                id="create-profile-btn"
                disabled={submitting}
                style={{ marginTop: '8px' }}
              >
                {submitting ? 'Creating...' : 'Create & Get Started'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading-container" style={{ minHeight: '200px' }}>
            <div className="spinner"></div>
            <span className="loading-text">Loading profiles...</span>
          </div>
        ) : error ? (
          <div className="glass-card" style={{ border: '1px solid rgba(248,113,113,0.3)', textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px', color: 'var(--color-critical)' }}>X</div>
            <p style={{ color: 'var(--color-critical)' }}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchUsers} style={{ marginTop: '16px' }}>
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-3 stagger-children">
            {users.map((user) => (
              <PersonaCard
                key={user.id}
                user={user}
                onSelect={handleSelectUser}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Feature Highlights ── */}
      <footer style={{ borderTop: '1px solid var(--border-color)', paddingTop: '56px', marginTop: '40px' }}>
        <p style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '36px' }}>
          Platform Features
        </p>
        <div className="grid grid-3 stagger-children" style={{ gap: '32px' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {iconMap[f.icon]}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{f.title}</h4>
                <p style={{ fontSize: '0.84rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};
