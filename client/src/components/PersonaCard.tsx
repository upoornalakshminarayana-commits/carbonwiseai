import React from 'react';
import { User } from '../types';
import { BicycleIcon, PlaneIcon, HomeIcon, LeafIcon } from './Icons';

interface PersonaCardProps {
  user: User;
  onSelect: (id: number) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ user, onSelect }) => {
  const getPersonaConfig = (persona: string) => {
    switch (persona) {
      case 'student':
        return {
          badge: <span className="badge badge-category-food">Eco Student</span>,
          desc: 'Low-impact vegan lifestyle, relies mostly on walking, biking, and public transit.',
          accentColor: 'var(--color-primary)',
          glowColor: 'var(--color-primary-glow)',
          icon: <BicycleIcon size={12} color="var(--color-primary)" />,
        };
      case 'professional':
        return {
          badge: <span className="badge badge-category-transport">Professional</span>,
          desc: 'High carbon footprint from frequent flights, car commuting, and a meat-heavy diet.',
          accentColor: 'var(--color-accent)',
          glowColor: 'var(--color-accent-glow)',
          icon: <PlaneIcon size={12} color="var(--color-accent)" />,
        };
      case 'family':
        return {
          badge: <span className="badge badge-category-energy">Suburban Family</span>,
          desc: 'Moderate footprint from suburban utility consumption and family vehicle usage.',
          accentColor: 'var(--color-average)',
          glowColor: 'rgba(251,191,36,0.15)',
          icon: <HomeIcon size={12} color="var(--color-average)" />,
        };
      default:
        return {
          badge: <span className="badge badge-category-waste">Custom Persona</span>,
          desc: 'Tailored carbon footprint baseline and customized eco daily habits.',
          accentColor: 'var(--color-secondary)',
          glowColor: 'var(--color-secondary-glow)',
          icon: <LeafIcon size={12} color="var(--color-secondary)" />,
        };
    }
  };

  const config = getPersonaConfig(user.persona);

  return (
    <div
      className="glass-card shimmer-card"
      id={`persona-card-${user.id}`}
      onClick={() => onSelect(user.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        cursor: 'pointer',
        border: `1px solid var(--border-color)`,
        transition: 'all var(--t-normal)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = config.accentColor + '55';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${config.glowColor}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      {/* Top bar accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${config.accentColor}, transparent)`,
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
      }} />

      <div>
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: '58px', height: '58px', borderRadius: '50%',
                border: `2px solid ${config.accentColor}`,
                boxShadow: `0 0 14px ${config.glowColor}`,
                objectFit: 'cover',
              }}
            />
            <span style={{
              position: 'absolute', bottom: -4, right: -4,
              background: 'var(--bg-card-strong)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '22px', height: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem',
            }}>
              {config.icon}
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', color: 'var(--text-primary)' }}>
              {user.name}
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{user.username}</span>
              {config.badge}
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.84rem', lineHeight: '1.65', marginBottom: '20px', color: 'var(--text-secondary)' }}>
          {config.desc}
        </p>
      </div>

      {/* Footer stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px',
        marginTop: 'auto',
      }}>
        <div>
          <div className="stat-label">Rank</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            Level {user.level}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-label">Eco Points</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: config.accentColor }}>
            {user.points} XP
          </div>
        </div>
        <div style={{
          padding: '7px 14px',
          borderRadius: 'var(--radius-sm)',
          background: `${config.accentColor}15`,
          border: `1px solid ${config.accentColor}33`,
          color: config.accentColor,
          fontSize: '0.78rem',
          fontWeight: 700,
        }}>
          Select →
        </div>
      </div>
    </div>
  );
};
