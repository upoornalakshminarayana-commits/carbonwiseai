import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ActivityLog, User } from '../types';
import { LeafIcon, TransitIcon, BoltIcon, ShoppingBagIcon, RecycleIcon } from '../components/Icons';

interface LayoutContextType {
  user: User | null;
  refetchUser: () => Promise<void>;
}

const activityOptions: Record<string, { value: string; label: string; unit: string; defaultVal: string }[]> = {
  transport: [
    { value: 'walk_bike',  label: 'Walking / Biking (0 kg CO₂)',             unit: 'km',            defaultVal: '5' },
    { value: 'ev',         label: 'Electric Vehicle (0.05 kg CO₂/km)',        unit: 'km',            defaultVal: '20' },
    { value: 'bus',        label: 'Public Bus (0.08 kg CO₂/km)',              unit: 'km',            defaultVal: '10' },
    { value: 'train',      label: 'Train / Metro (0.04 kg CO₂/km)',           unit: 'km',            defaultVal: '15' },
    { value: 'car',        label: 'Gasoline/Diesel Car (0.20 kg CO₂/km)',     unit: 'km',            defaultVal: '15' },
  ],
  energy: [
    { value: 'electricity', label: 'Electricity Consumption (0.38 kg/kWh)',   unit: 'kWh',           defaultVal: '8' },
    { value: 'ac',          label: 'Air Conditioner Usage (0.30 kg/hr)',       unit: 'hours',         defaultVal: '4' },
  ],
  food: [
    { value: 'meal_vegan',       label: 'Vegan Meal (2.0 kg CO₂)',           unit: 'meals',         defaultVal: '1' },
    { value: 'meal_vegetarian',  label: 'Vegetarian Meal (3.3 kg CO₂)',      unit: 'meals',         defaultVal: '1' },
    { value: 'meal_mixed',       label: 'Mixed Meal (6.0 kg CO₂)',           unit: 'meals',         defaultVal: '1' },
    { value: 'meal_meat_heavy',  label: 'Meat-Heavy Meal (8.3 kg CO₂)',      unit: 'meals',         defaultVal: '1' },
  ],
  shopping: [
    { value: 'clothing',     label: 'Clothing Purchased (15 kg CO₂/item)',  unit: 'items',         defaultVal: '1' },
    { value: 'electronics',  label: 'Electronics Purchased (80 kg CO₂)',    unit: 'items',         defaultVal: '1' },
  ],
  waste: [
    { value: 'recycle_action', label: 'Sorting & Recycling (0 kg CO₂)',   unit: 'actions',       defaultVal: '1' },
    { value: 'waste_bag',      label: 'Trash Disposal (3.0 kg CO₂/kg)',   unit: 'kg of plastic', defaultVal: '2' },
  ],
};

const categoryMeta: Record<string, { icon: React.ReactNode; color: string }> = {
  transport: { icon: <TransitIcon size={16} />, color: 'var(--color-accent)' },
  energy:    { icon: <BoltIcon size={16} />, color: 'var(--color-average)' },
  food:      { icon: <LeafIcon size={16} />, color: 'var(--color-primary)' },
  shopping:  { icon: <ShoppingBagIcon size={16} />, color: 'var(--color-pink)' },
  waste:     { icon: <RecycleIcon size={16} />, color: 'var(--color-secondary)' },
};

export const LogPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = parseInt(userId || '0');
  const { refetchUser } = useOutletContext<LayoutContextType>();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('transport');
  const [activityType, setActivityType] = useState('walk_bike');
  const [amount, setAmount] = useState('5');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const opts = activityOptions[category];
    if (opts?.length > 0) {
      setActivityType(opts[0].value);
      setAmount(opts[0].defaultVal);
    }
  }, [category]);

  const fetchLogs = async () => {
    if (!parsedUserId) return;
    try {
      setLoading(true);
      const data = await apiClient.getLogs(parsedUserId);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [parsedUserId]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedUserId) return;
    try {
      setSubmitting(true);
      setSuccessMsg(null);
      const response = await apiClient.addLog(parsedUserId, {
        date, category, activity_type: activityType, amount: parseFloat(amount) || 0,
      });
      let msg = `Activity logged successfully! +${response.log.points_earned} XP earned!`;
      if (response.newBadgesEarned?.length > 0) {
        msg += ` Badge Unlocked: ${response.newBadgesEarned.join(', ')}`;
      }
      setSuccessMsg(msg);
      const currentOpts = activityOptions[category];
      const matchingOpt = currentOpts?.find(o => o.value === activityType);
      setAmount(matchingOpt?.defaultVal || '1');
      await refetchUser();
      await fetchLogs();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to log activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId: number) => {
    if (!window.confirm('Delete this log? XP and carbon scores will be recalculated.')) return;
    try {
      await apiClient.deleteLog(parsedUserId, logId);
      await refetchUser();
      await fetchLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete log');
    }
  };

  const getUnit = () => {
    const match = activityOptions[category]?.find(o => o.value === activityType);
    return match?.unit || '';
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '28px', alignItems: 'start' }}>

      {/* ── Log Form ── */}
      <div style={{ position: 'sticky', top: '96px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Log Daily Activity</h2>
        <p style={{ fontSize: '0.85rem', marginBottom: '22px' }}>
          Record your eco-actions to earn XP and offset carbon.
        </p>

        {successMsg && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,229,160,0.12), rgba(0,179,124,0.08))',
            border: '1px solid rgba(0,229,160,0.3)',
            padding: '14px 16px', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)', fontSize: '0.85rem',
            marginBottom: '18px', lineHeight: '1.5',
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleLogSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          <div className="form-group">
            <label htmlFor="log-date">Activity Date</label>
            <input id="log-date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="log-category">Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px', marginBottom: '2px' }}>
              {Object.entries(categoryMeta).map(([cat, meta]) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '10px 4px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '1.1rem',
                    flexDirection: 'column',
                    gap: '4px',
                    background: category === cat ? `${meta.color}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${category === cat ? meta.color + '50' : 'var(--border-color)'}`,
                    color: category === cat ? meta.color : 'var(--text-secondary)',
                    transition: 'all var(--t-fast)',
                    cursor: 'pointer',
                  }}
                  title={cat}
                >
                  {meta.icon}
                </button>
              ))}
            </div>
            <select
              id="log-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ display: 'none' }}
            >
              {Object.keys(activityOptions).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="log-activity-type">Activity Type</label>
            <select id="log-activity-type" value={activityType} onChange={e => setActivityType(e.target.value)}>
              {activityOptions[category]?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="log-amount">Amount ({getUnit()})</label>
            <input
              id="log-amount"
              type="number"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            id="log-submit-btn"
            disabled={submitting}
            style={{ marginTop: '4px', padding: '13px' }}
          >
            {submitting ? 'Recording...' : 'Log Activity & Earn XP'}
          </button>
        </form>
      </div>

      {/* ── Log History ── */}
      <div>
        <div className="section-header" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Activity History</h2>
          <Link to={`/dashboard/${parsedUserId}`} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
            ← Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="loading-container" style={{ minHeight: '200px' }}>
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="glass-card" style={{ border: '1px solid rgba(248,113,113,0.3)', padding: '24px', color: 'var(--color-critical)' }}>
            {error}
          </div>
        ) : logs.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Activity</th>
                  <th>Amount</th>
                  <th>CO₂</th>
                  <th>XP</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td>
                      <span className={`badge badge-category-${log.category}`}>{log.category}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                      {log.activity_type.replace(/_/g, ' ')}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {log.amount} <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {activityOptions[log.category]?.find(o => o.value === log.activity_type)?.unit || ''}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.co2_emitted} kg</td>
                    <td style={{ color: log.points_earned > 0 ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>
                      +{log.points_earned}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '0.72rem', borderRadius: 'var(--radius-xs)' }}
                        onClick={() => handleDeleteLog(log.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card empty-state">
            <span className="empty-state-icon" style={{ color: 'var(--color-primary)' }}><LeafIcon size={44} /></span>
            <h4>No activities logged yet</h4>
            <p style={{ fontSize: '0.84rem' }}>Use the form to log your first eco-friendly action!</p>
          </div>
        )}
      </div>
    </div>
  );
};
