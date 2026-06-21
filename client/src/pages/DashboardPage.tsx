import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { FootprintBaseline, ActivityLog, Goal, AIInsights, User } from '../types';
import { InsightCard } from '../components/InsightCard';
import { CO2Chart } from '../components/CO2Chart';
import { CarbonSimulator } from '../components/CarbonSimulator';
import {
  LeafIcon, GlobeIcon, CalculatorIcon, BrainIcon, ChartIcon, TargetIcon,
  SimulatorIcon, TrophyIcon, BookIcon, RecycleIcon, UserIcon, TransitIcon,
  FlameIcon, ShoppingBagIcon, BoltIcon, LightbulbIcon, SparklesIcon, CheckIcon,
  AlertIcon, ChevronDownIcon
} from '../components/Icons';

interface LayoutContextType { user: User | null; refetchUser: () => Promise<void>; }

// ── Level System ──────────────────────────────────────────
const levelNames  = ['Associate', 'Carbon Specialist', 'Sustainability Strategist', 'Decarbonization Director', 'Climate Intelligence Fellow'];
const levelColors = ['var(--color-secondary)', 'var(--color-primary)', 'var(--color-average)', 'var(--color-accent)', '#ff6b9d'];

// ── Weekly Chart ─────────────────────────────────────────
const WeeklyChart: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = new Date();
  const weekData = days.map((day, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLogs = logs.filter(l => l.date === dateStr);
    const co2 = dayLogs.reduce((s, l) => s + l.co2_emitted, 0);
    return { day, co2: Math.round(co2 * 10) / 10, date: dateStr };
  });
  const max = Math.max(...weekData.map(d => d.co2), 1);
  return (
    <div className="weekly-bar-container">
      {weekData.map((d, i) => (
        <div key={i} className="weekly-bar-wrap">
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>{d.co2 > 0 ? `${d.co2}` : ''}</div>
          <div className="weekly-bar" style={{ height: `${Math.max((d.co2 / max) * 90, d.co2 > 0 ? 10 : 4)}px`, opacity: d.co2 > 0 ? 1 : 0.3 }} />
          <div className="weekly-bar-label">{d.day}</div>
        </div>
      ))}
    </div>
  );
};

// ── Leaderboard ──────────────────────────────────────────
const LeaderboardPanel: React.FC<{ currentUserId: number }> = ({ currentUserId }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    apiClient.getUsers().then(users => {
      const sorted = [...users].sort((a, b) => b.points - a.points).slice(0, 5);
      setAllUsers(sorted);
    }).catch(() => {});
  }, []);

  const rankLabels = ['#1', '#2', '#3', '#4', '#5'];

  return (
    <div>
      {allUsers.map((u, i) => (
        <div key={u.id} className="leaderboard-item" style={{ border: u.id === currentUserId ? '1px solid rgba(0,229,160,0.3)' : '1px solid var(--border-color)', background: u.id === currentUserId ? 'rgba(0,229,160,0.05)' : 'rgba(255,255,255,0.02)' }}>
          <span className={`leaderboard-rank rank-${i + 1}`} style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '24px', display: 'inline-block' }}>{rankLabels[i]}</span>
          <img src={u.avatar} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${levelColors[Math.min(u.level - 1, levelColors.length - 1)]}`, objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.87rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {u.name} {u.id === currentUserId && <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', background: 'rgba(0,229,160,0.12)', border: '1px solid rgba(0,229,160,0.25)', padding: '1px 6px', borderRadius: '99px' }}>You</span>}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Level {u.level} · {levelNames[Math.min(u.level - 1, levelNames.length - 1)]}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem', color: levelColors[Math.min(u.level - 1, levelColors.length - 1)] }}>{u.points}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>XP</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Main Dashboard ───────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = parseInt(userId || '0');
  const { user, refetchUser } = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  const [baseline, setBaseline] = useState<FootprintBaseline | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noBaseline, setNoBaseline] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  const fetchDashboardData = async () => {
    if (!parsedUserId) return;
    try {
      setLoading(true); setError(null);
      try {
        const baselineData = await apiClient.getBaseline(parsedUserId);
        setBaseline(baselineData); setNoBaseline(false);
      } catch (err: any) {
        if (err.message?.includes('404') || err.message?.includes('not found')) { setNoBaseline(true); setLoading(false); return; }
        throw err;
      }
      const [goalData, logsData, insightsData] = await Promise.all([
        apiClient.getGoals(parsedUserId),
        apiClient.getLogs(parsedUserId, 30),
        apiClient.getInsights(parsedUserId),
      ]);
      setGoal(goalData); setLogs(logsData); setInsights(insightsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, [parsedUserId]);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleDeleteLog = async (logId: number) => {
    if (!window.confirm('Delete this activity log?')) return;
    try {
      await apiClient.deleteLog(parsedUserId, logId);
      showNotification('Log deleted', 'info');
      await refetchUser(); await fetchDashboardData();
    } catch (err: any) { alert(err.message || 'Failed to delete log'); }
  };

  const handleActionRecommendation = async (recId: string) => {
    const actionMap: Record<string, { category: string; activity_type: string; amount: number; description: string }> = {
      trans_car_bus:            { category: 'transport', activity_type: 'bus',             amount: 10, description: '10 km bus commute' },
      energy_ac_timer:          { category: 'energy',    activity_type: 'ac',              amount: 1,  description: '1 hour AC limit' },
      energy_led_unplug:        { category: 'energy',    activity_type: 'electricity',     amount: 5,  description: '5 kWh reduction' },
      food_meatless_mon:        { category: 'food',      activity_type: 'meal_vegetarian', amount: 1,  description: 'Vegetarian meal' },
      food_vegan_swap:          { category: 'food',      activity_type: 'meal_vegan',      amount: 1,  description: 'Vegan meal' },
      shop_clothing_secondhand: { category: 'shopping',  activity_type: 'clothing',        amount: 0,  description: 'Secondhand clothing' },
      waste_sort_recycle:       { category: 'waste',     activity_type: 'recycle_action',  amount: 1,  description: 'Sorted & recycled' },
    };
    const action = actionMap[recId];
    if (!action) { showNotification('Log this manually on the Activity Log page.', 'info'); return; }
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const result = await apiClient.addLog(parsedUserId, { date: todayStr, ...action });
      let msg = `${action.description} logged! +${result.log.points_earned} XP`;
      if (result.newBadgesEarned?.length > 0) msg += ` Badge Unlocked: ${result.newBadgesEarned.join(', ')}!`;
      showNotification(msg, 'success');
      await refetchUser(); await fetchDashboardData();
    } catch (err: any) { alert(err.message || 'Failed to log activity'); }
  };

  // ── States ──────────────────────────────────────────────
  if (loading) return <div className="loading-container"><div className="spinner"></div><span className="loading-text">Loading dashboard...</span></div>;

  if (noBaseline) return (
    <div className="glass-card fade-in card-glow-primary" style={{ maxWidth: '580px', margin: '80px auto', textAlign: 'center', padding: '52px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-primary)', marginBottom: '20px' }}><ChartIcon size={48} /></div>
      <h2 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Setup Your Baseline First</h2>
      <p style={{ marginBottom: '32px', lineHeight: '1.8' }}>
        Welcome, <strong style={{ color: 'var(--color-primary)' }}>{user?.name}</strong>! Complete the Carbon Footprint Calculator to unlock your personalized dashboard.
      </p>
      <button className="btn btn-primary" onClick={() => navigate(`/calculator/${parsedUserId}`)} style={{ padding: '14px 32px', fontSize: '1rem' }}>
        Open Carbon Calculator
      </button>
    </div>
  );

  if (error) return (
    <div className="glass-card fade-in" style={{ maxWidth: '540px', margin: '60px auto', border: '1px solid rgba(248,113,113,0.3)', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--color-critical)' }}>!</div>
      <h3 style={{ color: 'var(--color-critical)', marginBottom: '10px' }}>Dashboard Error</h3>
      <p style={{ marginBottom: '24px' }}>{error}</p>
      <button className="btn btn-secondary" onClick={fetchDashboardData}>Retry</button>
    </div>
  );

  // ── Calculations ─────────────────────────────────────────
  const score = baseline?.sustainability_score || 50;
  const radius = 58, circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const getScoreColor = (v: number) => v >= 80 ? 'var(--color-excellent)' : v >= 60 ? 'var(--color-good)' : v >= 40 ? 'var(--color-average)' : v >= 25 ? 'var(--color-high)' : 'var(--color-critical)';
  const scoreColor = getScoreColor(score);
  const recentLogs = logs.slice(0, 10);
  const reductionPct = Math.round(((baseline?.monthly_co2 || 0) - (insights?.projections.currentTrajectory || 0)) / (baseline?.monthly_co2 || 1) * 100);
  const activeGoals = goal && goal.status === 'active' ? 1 : 0;
  const carbonSaved = Math.max(0, Math.round(((baseline?.monthly_co2 || 0) - (insights?.projections.currentTrajectory || 0)) * 10) / 10);
  const levelColor = user ? levelColors[Math.min(user.level - 1, levelColors.length - 1)] : 'var(--color-primary)';

  const getCategoryEmissions = () => {
    if (!baseline) return [];
    const car = (baseline.transport_car || 0) * 0.20;
    const ev = (baseline.transport_ev || 0) * 0.05;
    const bus = (baseline.transport_bus || 0) * 0.08;
    const train = (baseline.transport_train || 0) * 0.04;
    const flights = ((baseline.transport_flights || 0) * 0.12) / 12;
    const transport = Math.round((car + ev + bus + train + flights) * 10) / 10;
    const energy = Math.round(((baseline.energy_electricity || 0) * 0.38 + (baseline.energy_ac || 0) * 0.30 + (baseline.energy_appliances || 0) * 0.38) * 10) / 10;
    const foodCoeffs: Record<string, number> = { vegan: 60, vegetarian: 100, mixed: 180, meat_heavy: 250 };
    const food = foodCoeffs[baseline.food_diet] || 180;
    const shopping = Math.round(((baseline.shopping_clothing || 0) * 15 + (baseline.shopping_electronics || 0) * 80) * 10) / 10;
    const wasteRed: Record<string, number> = { always: 0.60, sometimes: 0.30, never: 0 };
    const waste = Math.round(((baseline.waste_plastic || 0) * 3 * (1 - (wasteRed[baseline.waste_recycling] || 0.3))) * 10) / 10;
    return [
      { name: 'Transport',   value: transport, color: 'var(--color-accent)' },
      { name: 'Home Energy', value: energy,    color: 'var(--color-average)' },
      { name: 'Diet',        value: food,      color: 'var(--color-excellent)' },
      { name: 'Shopping',    value: shopping,  color: 'var(--color-pink)' },
      { name: 'Waste',       value: waste,     color: 'var(--color-secondary)' },
    ].filter(c => c.value > 0);
  };

  const trajectoryStatus = insights?.projections.status;
  const trajectoryInfo = {
    on_track:       { text: 'On Track',        color: 'var(--color-excellent)', icon: <CheckIcon size={16} /> },
    off_track:      { text: 'Off Track',        color: 'var(--color-critical)',  icon: <GlobeIcon size={16} /> },
    needs_attention:{ text: 'Needs Attention',  color: 'var(--color-average)',   icon: <ChartIcon size={16} /> },
    default:        { text: 'Start Logging',    color: 'var(--text-secondary)',  icon: <ChartIcon size={16} /> },
  }[trajectoryStatus || 'default'] || { text: 'Start Logging', color: 'var(--text-secondary)', icon: <ChartIcon size={16} /> };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Toast ── */}
      {notification && (
        <div className={`toast ${notification.type === 'success' ? 'toast-success' : 'toast-info'}`}>
          <span style={{ display: 'flex', alignItems: 'center' }}>{notification.type === 'success' ? <CheckIcon size={15} /> : <LeafIcon size={15} />}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: '1.4' }}>{notification.message}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex-space" style={{ flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h2 style={{ margin: 0 }}>Welcome back, {user?.name?.split(' ')[0]}</h2>
            <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: `${levelColor}12`, border: `1px solid ${levelColor}30`, color: levelColor }}>
              Lv.{user?.level} · {levelNames[Math.min((user?.level || 1) - 1, levelNames.length - 1)]}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem' }}>Here's your sustainability analysis and active reduction targets.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to={`/profile/${parsedUserId}`} className="btn btn-secondary" style={{ padding: '9px 16px', fontSize: '0.84rem' }}>Profile</Link>
          <Link to={`/log/${parsedUserId}`} className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '0.84rem' }}>+ Log Activity</Link>
        </div>
      </div>

      {/* ── KPI Cards (4 cards) ── */}
      <div className="grid grid-4 stagger-children" style={{ gap: '16px' }}>
        {/* Eco Score */}
        <div className="glass-card card-glow-primary" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="score-circle-container" style={{ flexShrink: 0 }}>
            <svg className="score-circle-svg" viewBox="0 0 130 130">
              <circle className="score-circle-bg" cx="65" cy="65" r={radius} />
              <circle className="score-circle-bar" cx="65" cy="65" r={radius} stroke={scoreColor} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
            </svg>
            <div className="score-text">
              <span className="score-number" style={{ color: scoreColor, fontSize: '1.4rem' }}>{score}</span>
              <span className="score-label">Index</span>
            </div>
          </div>
          <div>
            <div className="stat-label">Eco Score</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Sustainability Index</div>
            <span className={`badge badge-${baseline?.category_score || 'average'}`}>{baseline?.category_score} impact</span>
          </div>
        </div>

        {/* Monthly CO2 */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Monthly Footprint</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', margin: '8px 0 6px' }}>
              <span className="stat-value">{insights?.projections.currentTrajectory || baseline?.monthly_co2}</span>
              <span className="stat-unit">kg CO₂</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Baseline: {baseline?.monthly_co2} kg</div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${Math.min(Math.max(reductionPct, 0), 100)}%` }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: reductionPct >= 0 ? 'var(--color-primary)' : 'var(--color-critical)', marginTop: '5px', fontWeight: 600 }}>
              {reductionPct >= 0 ? `↓ ${reductionPct}% saved` : `↑ ${Math.abs(reductionPct)}% increase`}
            </div>
          </div>
        </div>

        {/* Carbon Saved */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Carbon Saved</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', margin: '8px 0 6px' }}>
              <span className="stat-value" style={{ color: carbonSaved > 0 ? 'var(--color-primary)' : 'var(--text-secondary)' }}>{carbonSaved}</span>
              <span className="stat-unit">kg CO₂/mo</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Since baseline setup</div>
          </div>
          <div style={{ marginTop: '14px', fontSize: '0.78rem', color: carbonSaved > 0 ? 'var(--color-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {carbonSaved > 0 ? (
              <>
                <LeafIcon size={12} /> ~{Math.round(carbonSaved / 22)} trees planted equiv.
              </>
            ) : 'Log activities to start saving'}
          </div>
        </div>

        {/* Active Goals */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Goal Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0 6px' }}>
              <span style={{ display: 'flex', alignItems: 'center', color: trajectoryInfo.color }}>{trajectoryInfo.icon}</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', color: trajectoryInfo.color }}>{trajectoryInfo.text}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Target: {goal?.target_monthly_co2 || '—'} kg/mo
            </div>
          </div>
          <Link to={`/goals/${parsedUserId}`} style={{ marginTop: '14px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            Manage plan →
          </Link>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-2">
        <div className="glass-card">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}><ChartIcon size={14} /></span>
              Projected Trajectory
            </div>
          </div>
          {insights && <CO2Chart type="projection" projectionData={insights.projections} />}
        </div>

        <div className="glass-card">
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-average)' }}><GlobeIcon size={14} /></span>
              Emissions by Category
            </div>
          </div>
          <CO2Chart type="category" categoryData={getCategoryEmissions()} />
        </div>
      </div>

      {/* ── Weekly Chart ── */}
      <div className="glass-card">
        <div className="section-header" style={{ marginBottom: '18px' }}>
          <div className="section-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}><ChartIcon size={14} /></span>
            This Week's CO₂ Activity
          </div>
          <Link to={`/log/${parsedUserId}`} style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600 }}>View all →</Link>
        </div>
        {logs.length > 0 ? (
          <WeeklyChart logs={logs} />
        ) : (
          <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', fontStyle: 'italic' }}>
            No activities logged this week yet
          </div>
        )}
      </div>

      {/* ── AI Insights + Leaderboard ── */}
      <div className="grid grid-2" style={{ gap: '24px' }}>
        {/* AI Insights */}
        <div>
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}><BrainIcon size={14} /></span>
              AI Coaching Insights
            </div>
          </div>

          {insights?.dominantSources && insights.dominantSources.length > 0 && (
            <div style={{ padding: '13px 18px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '0.84rem', lineHeight: '1.6', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'flex', flexShrink: 0 }}><AlertIcon size={16} color="var(--color-accent)" /></span>
              <div>
                Top sources: <strong style={{ color: 'var(--color-accent)' }}>{insights.dominantSources.join(' & ')}</strong>. Target these first.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {insights?.recommendations?.slice(0, 3).map((rec) => (
              <InsightCard key={rec.id} recommendation={rec} onAction={handleActionRecommendation} />
            ))}
            {(!insights?.recommendations || insights.recommendations.length === 0) && (
              <div className="glass-card empty-state" style={{ padding: '24px' }}>
                <span className="empty-state-icon" style={{ color: 'var(--color-primary)' }}><GlobeIcon size={24} /></span>
                <p style={{ fontSize: '0.84rem' }}>Your footprint is already very low — excellent eco practice!</p>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div className="section-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-average)' }}><TrophyIcon size={14} /></span>
              Sustainability Leaderboard
            </div>
          </div>
          <LeaderboardPanel currentUserId={parsedUserId} />
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Ranked by total eco XP earned
          </div>
        </div>
      </div>

      {/* ── Carbon Simulator ── */}
      <div className="glass-card card-glow-primary">
        <div className="section-header" style={{ marginBottom: '4px' }}>
          <div className="section-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}><SimulatorIcon size={14} /></span>
            Carbon Impact Simulator
          </div>
          <button onClick={() => setSimulatorOpen(s => !s)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            {simulatorOpen ? 'Close' : 'Configure'}
          </button>
        </div>
        {!simulatorOpen && (
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
            Use the interactive simulator to see how lifestyle changes could reduce your monthly CO₂ before committing.
          </p>
        )}
        {simulatorOpen && (
          <div style={{ marginTop: '20px' }}>
            <CarbonSimulator baselineMonthly={baseline?.monthly_co2 || 300} />
          </div>
        )}
      </div>

      {/* ── Recent Activity Logs ── */}
      <section style={{ marginBottom: '20px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}><ChartIcon size={14} /></span>
            Recent Activity
          </div>
          <Link to={`/log/${parsedUserId}`} style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600 }}>View all →</Link>
        </div>

        {recentLogs.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Activity</th>
                  <th>CO₂</th>
                  <th>XP</th>
                  <th style={{ width: '70px' }}></th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td><span className={`badge badge-category-${log.category}`}>{log.category}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{log.activity_type.replace(/_/g, ' ')}</td>
                    <td style={{ fontWeight: 600, fontSize: '0.84rem' }}>{log.co2_emitted} kg</td>
                    <td style={{ color: log.points_earned > 0 ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.84rem' }}>+{log.points_earned}</td>
                    <td>
                      <button className="btn btn-danger" style={{ padding: '4px 9px', fontSize: '0.7rem', borderRadius: '6px' }} onClick={() => handleDeleteLog(log.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card empty-state">
            <span className="empty-state-icon" style={{ color: 'var(--color-primary)' }}><LeafIcon size={24} /></span>
            <h4 style={{ margin: 0 }}>No activities logged yet</h4>
            <p style={{ fontSize: '0.84rem' }}>Start logging eco-friendly actions to track progress and earn XP.</p>
            <Link to={`/log/${parsedUserId}`} className="btn btn-primary" style={{ marginTop: '4px' }}>Log First Activity</Link>
          </div>
        )}
      </section>
    </div>
  );
};
