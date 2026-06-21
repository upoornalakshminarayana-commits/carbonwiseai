import React, { useState, useEffect } from 'react';
import { NavLink, Link, useParams, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { useTheme } from '../hooks/useTheme';
import { LeafIcon, ChartIcon, CalculatorIcon, TargetIcon, ChevronDownIcon, LogoutIcon, UserIcon } from './Icons';

interface NavbarProps {
  user: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#nav-user-dropdown')) setDropdownOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const userId = user?.id;

  const navLinks = userId ? [
    { to: `/dashboard/${userId}`, label: 'Dashboard', icon: <ChartIcon size={15} /> },
    { to: `/log/${userId}`, label: 'Activity Log', icon: <ChartIcon size={15} /> },
    { to: `/calculator/${userId}`, label: 'Calculator', icon: <CalculatorIcon size={15} /> },
    { to: `/goals/${userId}`, label: 'Goals', icon: <TargetIcon size={15} /> },
  ] : [];

  const levelColors = ['var(--color-secondary)', 'var(--color-primary)', 'var(--color-average)', 'var(--color-accent)', '#ff6b9d'];
  const levelColor = user ? levelColors[Math.min(user.level - 1, levelColors.length - 1)] : 'var(--color-primary)';

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={userId ? `/dashboard/${userId}` : '/'} className="nav-logo">
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px var(--color-primary-glow)', flexShrink: 0, color: '#060b14' }}>
            <LeafIcon size={18} />
          </div>
          <span className="nav-logo-text">CarbonWise <span style={{ color: 'var(--color-primary)' }}>AI</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="nav-links">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme Toggle */}
          <button className="theme-toggle" id="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {user ? (
            <div id="nav-user-dropdown" style={{ position: 'relative' }}>
              {/* User avatar + level */}
              <button
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(d => !d); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all var(--t-fast)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'; }}
              >
                <img src={user.avatar} alt={user.name} style={{ width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${levelColor}`, objectFit: 'cover' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.65rem', color: levelColor, fontWeight: 600 }}>Lv.{user.level} · {user.points} XP</span>
                </div>
                <span className="nav-chevron" style={{ display: 'inline-flex', marginLeft: '2px' }}><ChevronDownIcon size={12} color="var(--text-muted)" /></span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '220px', background: 'var(--bg-card-strong)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden', animation: 'fadeInUp 0.2s var(--ease-out) both' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={user.avatar} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `2px solid ${levelColor}`, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>@{user.username}</div>
                    </div>
                  </div>
                  <div style={{ padding: '8px' }}>
                    {[
                      { label: 'My Profile', to: `/profile/${userId}`, icon: <UserIcon size={14} /> },
                      { label: 'Dashboard', to: `/dashboard/${userId}`, icon: <ChartIcon size={14} /> },
                      { label: 'My Goals', to: `/goals/${userId}`, icon: <TargetIcon size={14} /> },
                      { label: 'Calculator', to: `/calculator/${userId}`, icon: <CalculatorIcon size={14} /> },
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '8px', fontSize: '0.84rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all var(--t-fast)' }}
                        onMouseEnter={e => { const a = e.currentTarget as HTMLElement; a.style.background = 'rgba(255,255,255,0.06)'; a.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { const a = e.currentTarget as HTMLElement; a.style.background = ''; a.style.color = 'var(--text-secondary)'; }}>
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                  <div style={{ padding: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <button onClick={() => { setDropdownOpen(false); navigate('/select'); }} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '0.84rem', color: 'var(--color-critical)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', transition: 'all var(--t-fast)', display: 'flex', alignItems: 'center', gap: '8px' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
                      <LogoutIcon size={14} />
                      <span>Switch Profile</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.84rem' }}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.84rem' }}>Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', '@media (max-width: 768px)': { display: 'flex' } } as any}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && navLinks.length > 0 && (
        <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border-color)', background: 'rgba(6,11,20,0.96)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: '4px', animation: 'fadeInUp 0.2s var(--ease-out) both' }}>
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)} style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all var(--t-fast)' }}>
              {l.icon} {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
