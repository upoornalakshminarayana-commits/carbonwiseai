import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { User, Achievement, FootprintBaseline } from '../types';
import {
  UserIcon, LeafIcon, BicycleIcon, SparklesIcon, TrophyIcon,
  EditIcon, ChartIcon, SettingsIcon, LogoutIcon, BoltIcon
} from '../components/Icons';

const levelNames = ['Associate', 'Carbon Specialist', 'Sustainability Strategist', 'Decarbonization Director', 'Climate Intelligence Fellow'];
const levelColors = ['var(--color-secondary)', 'var(--color-primary)', 'var(--color-average)', 'var(--color-accent)', '#ff6b9d'];
const badgeData: Record<string, { icon: React.ReactNode; title: string; desc: string }> = {
  eco_starter:         { icon: <LeafIcon size={24} />, title: 'Baseline Certified',         desc: 'Completed the carbon footprint baseline calculator.' },
  green_explorer:      { icon: <BicycleIcon size={24} />, title: 'Carbon Affiliate',       desc: 'Reached Level 2 through daily eco activities.' },
  sustainability_hero: { icon: <SparklesIcon size={24} />, title: 'Sustainability Lead',  desc: 'Reached Level 3 — a consistent eco warrior.' },
  carbon_champion:     { icon: <TrophyIcon size={24} />, title: 'Decarbonization Champion',      desc: 'Accumulated over 1,000 eco points!' },
};

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = parseInt(userId || '0');
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [baseline, setBaseline] = useState<FootprintBaseline | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!parsedUserId) return;
      try {
        const [u, badges] = await Promise.all([
          apiClient.getUser(parsedUserId),
          apiClient.getAchievements(parsedUserId),
        ]);
        setUser(u);
        setEditName(u.name);
        setAchievements(badges);
        try { setBaseline(await apiClient.getBaseline(parsedUserId)); } catch {}
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [parsedUserId]);

  const levelProgress = user ? ((user.points % 1000) / 1000) * 100 : 0;
  const levelColor = user ? levelColors[Math.min(user.level - 1, levelColors.length - 1)] : 'var(--color-primary)';
  const levelName = user ? levelNames[Math.min(user.level - 1, levelNames.length - 1)] : '';

  const co2Reduction = baseline ? Math.max(0, Math.round((baseline.monthly_co2 - (baseline.monthly_co2 * 0.75)) * 10) / 10) : 0;

  if (loading) return (
    <div className="loading-container"><div className="spinner"></div><span className="loading-text">Loading profile...</span></div>
  );

  if (!user) return (
    <div className="glass-card fade-in" style={{ maxWidth: '480px', margin: '60px auto', textAlign: 'center', padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '16px' }}><UserIcon size={48} /></div>
      <p>User not found.</p>
      <Link to="/select" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Select Profile</Link>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Cover + Avatar */}
      <div>
        <div className="profile-cover"></div>
        <div style={{ padding: '0 24px', marginTop: '-36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <img src={user.avatar} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', border: `3px solid ${levelColor}`, boxShadow: `0 0 20px ${levelColor}40`, objectFit: 'cover', background: 'var(--bg-card-strong)' }} />
              <div style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--bg-card-strong)', border: '2px solid var(--border-color)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                {user.level}
              </div>
            </div>
            <div style={{ paddingBottom: '8px' }}>
              {editing ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', fontWeight: 800, background: 'var(--bg-input)', border: '1px solid var(--color-primary)', borderRadius: '8px', padding: '4px 10px', color: 'var(--text-primary)' }} />
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { setEditing(false); setUser(prev => prev ? { ...prev, name: editName } : prev); }}>Save</button>
                  <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => { setEditing(false); setEditName(user.name); }}>Cancel</button>
                </div>
              ) : (
                <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{user.name}</h1>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{user.username}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: levelColor, background: `${levelColor}12`, border: `1px solid ${levelColor}30`, padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{levelName}</span>
                <span className={`badge badge-category-${user.persona}`}>{user.persona}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', paddingBottom: '8px' }}>
            {!editing && (
              <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.84rem' }} onClick={() => setEditing(true)}>
                <EditIcon size={14} /> Edit Profile
              </button>
            )}
            <Link to={`/dashboard/${parsedUserId}`} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.84rem' }}>
              <ChartIcon size={14} /> Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="glass-card">
        <div className="flex-space" style={{ marginBottom: '12px' }}>
          <div>
            <div className="stat-label">Current Level</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: levelColor }}>{levelName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stat-label">XP Progress</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{user.points % 1000} / 1,000 XP</div>
          </div>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${levelProgress}%`, background: `linear-gradient(90deg, ${levelColor}, ${levelColor}cc)`, boxShadow: `0 0 10px ${levelColor}50` }}></div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          {Math.round(1000 - (user.points % 1000))} XP until {levelNames[Math.min(user.level, levelNames.length - 1)]}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-4">
        {[
          { icon: <TrophyIcon size={24} />, label: 'Level', value: user.level, color: levelColor },
          { icon: <BoltIcon size={24} />, label: 'Total XP', value: `${user.points}`, color: 'var(--color-secondary)' },
          { icon: <SparklesIcon size={24} />, label: 'Badges', value: achievements.length, color: 'var(--color-average)' },
          { icon: <ChartIcon size={24} />, label: 'CO₂ Reduced', value: baseline ? `${co2Reduction} kg` : '—', color: 'var(--color-primary)' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ textAlign: 'center', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: s.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: s.color, marginBottom: '4px' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Baseline Summary */}
      {baseline && (
        <div className="glass-card">
          <div className="section-title" style={{ marginBottom: '18px', fontSize: '1rem' }}>
            <span style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChartIcon size={16} color="var(--color-primary)" />
            </span>
            Carbon Footprint Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {[
              { label: 'Monthly CO₂', value: `${baseline.monthly_co2} kg`, color: 'var(--color-critical)' },
              { label: 'Yearly CO₂', value: `${baseline.yearly_co2} kg`, color: 'var(--color-high)' },
              { label: 'Eco Score', value: `${baseline.sustainability_score}/100`, color: 'var(--color-primary)' },
              { label: 'Primary Diet', value: baseline.food_diet, color: 'var(--color-good)' },
              { label: 'Impact Level', value: baseline.category_score, color: baseline.category_score === 'excellent' ? 'var(--color-excellent)' : baseline.category_score === 'good' ? 'var(--color-good)' : 'var(--color-average)' },
              { label: 'Recycling', value: baseline.waste_recycling, color: 'var(--color-secondary)' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div className="stat-label">{s.label}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: s.color, textTransform: 'capitalize', marginTop: '4px' }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to={`/calculator/${parsedUserId}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Recalculate</Link>
            <Link to={`/goals/${parsedUserId}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Manage Goals</Link>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="glass-card">
        <div className="section-title" style={{ marginBottom: '18px', fontSize: '1rem' }}>
          <span style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrophyIcon size={16} color="#fbbf24" />
          </span>
          Earned Badges
        </div>
        {achievements.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {achievements.map(a => {
              const bd = badgeData[a.badge_id] || { icon: <LeafIcon size={24} />, title: a.badge_id, desc: 'Eco achievement unlocked!' };
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>{bd.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '3px' }}>{bd.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{bd.desc}</div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                    {new Date(a.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '12px' }}><TrophyIcon size={32} color="var(--text-muted)" /></div>
            <p style={{ fontSize: '0.85rem' }}>No badges yet. Log activities and complete goals to earn achievements!</p>
            <Link to={`/log/${parsedUserId}`} className="btn btn-primary" style={{ marginTop: '8px' }}>Log First Activity</Link>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <div className="section-title" style={{ marginBottom: '16px', fontSize: '1rem' }}>
          <span style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SettingsIcon size={16} color="var(--color-secondary)" />
          </span>
          Account Details
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Username</span>
            <span style={{ fontWeight: 600 }}>@{user.username}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Persona Type</span>
            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{user.persona}</span>
          </div>
          {user.created_at && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Member Since</span>
              <span style={{ fontWeight: 600 }}>{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          )}
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)' }} onClick={() => navigate('/select')}>
            <UserIcon size={14} /> Switch Profile
          </button>
          <button className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--color-critical)', padding: '8px 16px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <LogoutIcon size={14} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
