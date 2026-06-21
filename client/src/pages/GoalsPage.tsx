import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Goal, Achievement } from '../types';
import { BadgeCard } from '../components/BadgeCard';
import {
  LeafIcon, GlobeIcon, CalculatorIcon, BrainIcon, ChartIcon, TargetIcon,
  SimulatorIcon, TrophyIcon, BookIcon, RecycleIcon, UserIcon, TransitIcon,
  FlameIcon, ShoppingBagIcon, BoltIcon, LightbulbIcon, SparklesIcon, CheckIcon,
  AlertIcon
} from '../components/Icons';

const challengeIconMap: Record<string, React.ReactNode> = {
  transport: <TransitIcon size={20} color="var(--color-accent)" />,
  food:      <CheckIcon size={20} color="var(--color-primary)" />,
  energy:    <LightbulbIcon size={20} color="var(--color-average)" />,
  waste:     <RecycleIcon size={20} color="var(--color-secondary)" />,
};

// Weekly Challenges
const challenges = [
  { id: 'c1', title: 'Transit Tuesday', desc: 'Use public transport or walk for all commutes today.', reward: 50, category: 'transport', difficulty: 'Easy' },
  { id: 'c2', title: 'Meatless Day', desc: 'Eat a fully plant-based diet for an entire day.', reward: 80, category: 'food', difficulty: 'Medium' },
  { id: 'c3', title: 'Energy Saver', desc: 'Reduce electricity use by turning off all unused appliances.', reward: 40, category: 'energy', difficulty: 'Easy' },
  { id: 'c4', title: 'Zero Waste Hero', desc: 'Sort and recycle all your waste properly for 3 days.', reward: 100, category: 'waste', difficulty: 'Hard' },
];

const categoryColor: Record<string, string> = {
  transport: 'var(--color-accent)',
  food:      'var(--color-primary)',
  energy:    'var(--color-average)',
  waste:     'var(--color-secondary)',
};

const difficultyColor: Record<string, string> = {
  Easy:   'var(--color-primary)',
  Medium: 'var(--color-average)',
  Hard:   'var(--color-critical)',
};

export const GoalsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = parseInt(userId || '0');

  const [goal, setGoal] = useState<Goal | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderVal, setSliderVal] = useState(10);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [acceptedChallenges, setAcceptedChallenges] = useState<string[]>([]);

  const fetchData = async () => {
    if (!parsedUserId) return;
    try {
      setLoading(true); setError(null);
      const [goalData, badgesData] = await Promise.all([
        apiClient.getGoals(parsedUserId),
        apiClient.getAchievements(parsedUserId),
      ]);
      setGoal(goalData);
      setSliderVal(goalData?.target_reduction_pct || 10);
      setAchievements(badgesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load goals & achievements');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [parsedUserId]);

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true); setSuccessMsg(null);
      const response = await apiClient.updateGoal(parsedUserId, sliderVal);
      setGoal(response.goal);
      setSuccessMsg('Reduction target updated!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) { alert(err.message || 'Failed to update goal'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><span className="loading-text">Loading goals & badges...</span></div>;
  if (error) return (
    <div className="glass-card fade-in" style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center', padding: '40px', border: '1px solid rgba(248,113,113,0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-critical)', marginBottom: '16px' }}><AlertIcon size={44} /></div>
      <p style={{ color: 'var(--color-critical)' }}>{error}</p>
      <button className="btn btn-secondary" onClick={fetchData} style={{ marginTop: '20px' }}>Retry</button>
    </div>
  );

  const allBadgeIds = ['eco_starter', 'green_explorer', 'sustainability_hero', 'carbon_champion'];
  const earnedCount = achievements.length;

  const getSliderColor = (val: number) => {
    if (val <= 10) return 'var(--color-secondary)';
    if (val <= 20) return 'var(--color-primary)';
    if (val <= 35) return 'var(--color-average)';
    return 'var(--color-critical)';
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Header ── */}
      <div className="flex-space" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ marginBottom: '6px' }}>Goals & Achievements</h2>
          <p style={{ fontSize: '0.88rem' }}>Set reduction targets, take on weekly challenges, and track your credentials.</p>
        </div>
        <Link to={`/dashboard/${parsedUserId}`} className="btn btn-secondary" style={{ padding: '9px 16px', fontSize: '0.84rem' }}>
          ← Dashboard
        </Link>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-3 stagger-children">
        <div className="glass-card card-glow-primary" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'rgba(0,229,160,0.12)', border: '1px solid rgba(0,229,160,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px var(--color-primary-glow)', flexShrink: 0, color: 'var(--color-primary)' }}><TargetIcon size={24} /></div>
          <div>
            <div className="stat-label">Current Target</div>
            <div className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>{goal?.target_reduction_pct || sliderVal}%</div>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-secondary)' }}><ChartIcon size={24} /></div>
          <div>
            <div className="stat-label">Target Monthly CO₂</div>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>{goal?.target_monthly_co2 || '—'} <span className="stat-unit">kg</span></div>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-average)' }}><TrophyIcon size={24} /></div>
          <div>
            <div className="stat-label">Badges Earned</div>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>{earnedCount} <span className="stat-unit">/ {allBadgeIds.length}</span></div>
          </div>
        </div>
      </div>

      {/* ── Goal Setting + Context ── */}
      <div className="grid grid-2">
        {/* Slider */}
        <div className="glass-card">
          <div className="section-title" style={{ marginBottom: '20px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}><TargetIcon size={16} /></span>
            Adjust Reduction Target
          </div>

          {successMsg && (
            <div style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.25)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckIcon size={14} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleGoalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div className="flex-space" style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>Reduction Target</span>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: getSliderColor(sliderVal), textShadow: `0 0 20px ${getSliderColor(sliderVal)}60` }}>
                  {sliderVal}%
                </span>
              </div>
              <input id="goal-slider" type="range" min="5" max="50" step="5" value={sliderVal} onChange={e => setSliderVal(parseInt(e.target.value))} style={{ width: '100%' }} />
              <div className="flex-space" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                <span>5% Minimal</span><span>25% Moderate</span><span>50% Aggressive</span>
              </div>
            </div>

            {goal && goal.target_monthly_co2 > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', fontSize: '0.83rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex-space"><span style={{ color: 'var(--text-secondary)' }}>Target Monthly CO₂</span><strong style={{ color: 'var(--color-secondary)' }}>{goal.target_monthly_co2} kg</strong></div>
                <div className="flex-space"><span style={{ color: 'var(--text-secondary)' }}>Plan Start</span><strong>{new Date(goal.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
                <div className="flex-space"><span style={{ color: 'var(--text-secondary)' }}>Status</span><span className={`badge badge-${goal.status === 'active' ? 'good' : 'average'}`}>{goal.status}</span></div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={updating} style={{ padding: '13px' }}>
              {updating ? 'Saving...' : 'Update Reduction Target'}
            </button>
          </form>
        </div>

        {/* Context */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
          <div>
            <div className="section-title" style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}><LightbulbIcon size={16} /></span>
              Why Set a Target?
            </div>
            <p style={{ fontSize: '0.84rem', lineHeight: '1.75', color: 'var(--text-secondary)' }}>
              Concrete reduction targets are the most effective driver of behavioral change. CarbonWise AI calibrates your coaching to hit your specific monthly CO₂ budget automatically.
            </p>
          </div>
          <div style={{ background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.18)', borderRadius: 'var(--radius-sm)', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}><GlobeIcon size={22} /></span>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600, lineHeight: '1.6', margin: 0 }}>
              A 30% reduction aligns with Paris Accord targets for limiting global warming to 1.5°C.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { pct: '5–10%', label: 'Easy wins: LED lighting & habits', color: 'var(--color-secondary)' },
              { pct: '10–25%', label: 'Diet & transport changes', color: 'var(--color-primary)' },
              { pct: '25–50%', label: 'Lifestyle transformation', color: 'var(--color-average)' },
            ].map(item => (
              <div key={item.pct} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: item.color, background: `${item.color}10`, border: `1px solid ${item.color}28`, padding: '3px 8px', borderRadius: '99px', flexShrink: 0 }}>{item.pct}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Weekly Challenges ── */}
      <section>
        <div className="section-header" style={{ marginBottom: '20px' }}>
          <div className="section-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-pink)' }}><BoltIcon size={15} /></span>
            Weekly Eco Challenges
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)', padding: '4px 10px', borderRadius: '99px' }}>
            {acceptedChallenges.length}/{challenges.length} accepted
          </span>
        </div>
        <div className="grid grid-2 stagger-children">
          {challenges.map(ch => {
            const isAccepted = acceptedChallenges.includes(ch.id);
            const catColor = categoryColor[ch.category] || 'var(--color-primary)';
            return (
              <div key={ch.id} className="glass-card" style={{ border: isAccepted ? `1px solid ${catColor}40` : '1px solid var(--border-color)', background: isAccepted ? `${catColor}06` : 'var(--bg-card)', transition: 'all var(--t-normal)', position: 'relative', overflow: 'hidden' }}>
                {isAccepted && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,${catColor},transparent)` }}></div>}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-sm)', background: isAccepted ? `${catColor}12` : 'rgba(255,255,255,0.04)', border: `1px solid ${isAccepted ? catColor + '35' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {challengeIconMap[ch.category]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{ch.title}</h4>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '99px', background: `${difficultyColor[ch.difficulty]}12`, color: difficultyColor[ch.difficulty], border: `1px solid ${difficultyColor[ch.difficulty]}30` }}>
                        {ch.difficulty}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.81rem', lineHeight: '1.55', color: 'var(--text-secondary)', marginBottom: '14px' }}>{ch.desc}</p>
                    <div className="flex-space">
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-average)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrophyIcon size={12} /> +{ch.reward} XP
                      </span>
                      <button
                        onClick={() => setAcceptedChallenges(prev => isAccepted ? prev.filter(id => id !== ch.id) : [...prev, ch.id])}
                        className="btn"
                        style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)', background: isAccepted ? `${catColor}18` : 'rgba(255,255,255,0.05)', border: `1px solid ${isAccepted ? catColor + '45' : 'var(--border-color)'}`, color: isAccepted ? catColor : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, transition: 'all var(--t-fast)' }}
                      >
                        {isAccepted ? 'Accepted' : 'Accept Challenge'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Badges Gallery ── */}
      <section style={{ marginBottom: '20px' }}>
        <div className="section-header" style={{ marginBottom: '20px' }}>
          <div className="section-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-average)' }}><TrophyIcon size={15} /></span>
            Sustainability Credentials
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{earnedCount} of {allBadgeIds.length} earned</span>
        </div>
        <div className="grid grid-2 stagger-children" style={{ gap: '16px' }}>
          {allBadgeIds.map(badgeId => {
            const achievement = achievements.find(a => a.badge_id === badgeId);
            return <BadgeCard key={badgeId} badgeId={badgeId} earnedAt={achievement?.earned_at} />;
          })}
        </div>
      </section>
    </div>
  );
};
