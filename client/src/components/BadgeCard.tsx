import React from 'react';
import { LeafIcon, BicycleIcon, SparklesIcon, TrophyIcon, CheckIcon } from './Icons';

interface BadgeCardProps {
  badgeId: string;
  earnedAt?: string;
}

const badgeData: Record<string, { title: string; desc: string; icon: React.ReactNode; color: string; glow: string }> = {
  eco_starter: {
    title: 'Baseline Certified',
    desc: 'Filled out the carbon footprint calculator to establish a baseline.',
    icon: <LeafIcon size={24} />,
    color: 'var(--color-primary)',
    glow: 'var(--color-primary-glow)',
  },
  green_explorer: {
    title: 'Carbon Affiliate',
    desc: 'Reached Level 2 by starting to log daily eco-friendly activities.',
    icon: <BicycleIcon size={24} />,
    color: 'var(--color-secondary)',
    glow: 'var(--color-secondary-glow)',
  },
  sustainability_hero: {
    title: 'Sustainability Lead',
    desc: 'Reached Level 3 through consistent carbon reduction efforts.',
    icon: <SparklesIcon size={24} />,
    color: 'var(--color-accent)',
    glow: 'var(--color-accent-glow)',
  },
  carbon_champion: {
    title: 'Decarbonization Champion',
    desc: 'Accumulated over 1,000 lifetime eco points!',
    icon: <TrophyIcon size={24} />,
    color: 'var(--color-average)',
    glow: 'rgba(251,191,36,0.18)',
  },
};

export const BadgeCard: React.FC<BadgeCardProps> = ({ badgeId, earnedAt }) => {
  const d = badgeData[badgeId] ?? {
    title: 'Sustainability Badge',
    desc: 'A general badge earned for helping the environment.',
    icon: <LeafIcon size={24} />,
    color: 'var(--text-secondary)',
    glow: 'rgba(255,255,255,0.08)',
  };
  const isEarned = !!earnedAt;

  return (
    <div
      className="glass-card"
      id={`badge-${badgeId}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        opacity: isEarned ? 1 : 0.38,
        border: isEarned ? `1px solid ${d.color}40` : '1px solid var(--border-color)',
        boxShadow: isEarned ? `0 0 24px ${d.glow}, 0 0 0 1px ${d.color}18` : 'none',
        filter: isEarned ? 'none' : 'grayscale(0.6)',
        transition: 'all var(--t-normal)',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '60px', height: '60px', flexShrink: 0,
        borderRadius: 'var(--radius-md)',
        background: isEarned ? `${d.color}12` : 'rgba(255,255,255,0.03)',
        border: `2px solid ${isEarned ? d.color + '45' : 'rgba(255,255,255,0.06)'}`,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        fontSize: '1.8rem',
        boxShadow: isEarned ? `0 0 18px ${d.glow}, inset 0 0 12px ${d.glow}` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {isEarned && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at 30% 30%, ${d.color}20, transparent 70%)`,
            borderRadius: 'inherit',
          }} />
        )}
        {d.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <h4 style={{ fontSize: '0.95rem', color: isEarned ? 'var(--text-primary)' : 'var(--text-secondary)', margin: 0 }}>
            {d.title}
          </h4>
          {isEarned && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px',
              background: `${d.color}18`, color: d.color,
              border: `1px solid ${d.color}35`, borderRadius: '99px',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Earned
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.78rem', lineHeight: '1.5', color: 'var(--text-secondary)', margin: 0 }}>
          {d.desc}
        </p>
        {isEarned && earnedAt && (
          <div style={{
            fontSize: '0.7rem', color: d.color, marginTop: '6px',
            display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600,
          }}>
            <CheckIcon size={12} /> Earned {new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
};
