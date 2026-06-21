import React from 'react';
import { Recommendation } from '../types';
import { BicycleIcon, BoltIcon, LeafIcon, ShoppingBagIcon, RecycleIcon } from './Icons';

interface InsightCardProps {
  recommendation: Recommendation;
  onAction?: (recId: string) => void;
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; glow: string }> = {
  transport: { icon: <BicycleIcon size={18} />, color: 'var(--color-accent)', glow: 'var(--color-accent-glow)' },
  energy:    { icon: <BoltIcon size={18} />, color: 'var(--color-average)', glow: 'rgba(251,191,36,0.15)' },
  food:      { icon: <LeafIcon size={18} />, color: 'var(--color-primary)', glow: 'var(--color-primary-glow)' },
  shopping:  { icon: <ShoppingBagIcon size={18} />, color: 'var(--color-pink)', glow: 'var(--color-pink-glow)' },
  waste:     { icon: <RecycleIcon size={18} />, color: 'var(--color-secondary)', glow: 'var(--color-secondary-glow)' },
};

export const InsightCard: React.FC<InsightCardProps> = ({ recommendation, onAction }) => {
  const cfg = categoryConfig[recommendation.category] || { icon: <LeafIcon size={18} />, color: 'var(--color-primary)', glow: 'var(--color-primary-glow)' };

  return (
    <div
      className="glass-card shimmer-card"
      id={`insight-${recommendation.id}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px',
        background: `linear-gradient(180deg, ${cfg.color}, transparent)`,
        borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
      }} />

      {/* Header */}
      <div className="flex-space" style={{ paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: 'var(--radius-sm)',
            background: `${cfg.color}12`,
            border: `1px solid ${cfg.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: `0 0 12px ${cfg.glow}`,
            flexShrink: 0,
          }}>
            {cfg.icon}
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.3' }}>
            {recommendation.title}
          </h4>
        </div>
        <span className={`badge badge-priority-${recommendation.priority}`} style={{ flexShrink: 0 }}>
          {recommendation.priority}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.83rem', lineHeight: '1.65', color: 'var(--text-secondary)', paddingLeft: '8px' }}>
        {recommendation.description}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '14px',
        paddingLeft: '8px',
        marginTop: 'auto',
      }}>
        <div>
          <div className="stat-label" style={{ marginBottom: '3px' }}>Est. Monthly Savings</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: cfg.color }}>
            −{recommendation.potentialSavings} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>kg CO₂</span>
          </div>
        </div>

        {recommendation.actionable && onAction && (
          <button
            className="btn btn-secondary"
            id={`action-btn-${recommendation.id}`}
            style={{ padding: '7px 14px', fontSize: '0.78rem' }}
            onClick={() => onAction(recommendation.id)}
          >
            Log Action
          </button>
        )}
      </div>
    </div>
  );
};
