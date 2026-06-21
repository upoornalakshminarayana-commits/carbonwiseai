import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { User } from '../types';
import { Navbar } from './Navbar';
import { EcoAssistant } from './EcoAssistant';
import { useTheme } from '../hooks/useTheme';
import { ErrorBoundary } from './ErrorBoundary';

export const Layout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Detect userId from URL
  const pathMatch = window.location.pathname.match(/\/(dashboard|calculator|log|goals|profile)\/(\d+)/);
  const urlUserId = pathMatch ? parseInt(pathMatch[2]) : null;

  const fetchUser = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getUser(id);
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const refetchUser = async () => {
    if (urlUserId) await fetchUser(urlUserId);
  };

  useEffect(() => {
    if (urlUserId) {
      fetchUser(urlUserId);
    } else {
      setLoading(false);
    }
  }, [urlUserId]);

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (loading && urlUserId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
        <Navbar user={null} />
        <main className="main-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-container">
            <div className="spinner"></div>
            <span className="loading-text">Loading CarbonWise AI...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
        <Navbar user={null} />
        <main className="main-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card fade-in" style={{ maxWidth: '460px', textAlign: 'center', padding: '48px 40px', border: '1px solid rgba(248,113,113,0.25)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--color-critical)' }}>!</div>
            <h3 style={{ color: 'var(--color-critical)', marginBottom: '12px' }}>Something went wrong</h3>
            <p style={{ marginBottom: '28px', fontSize: '0.9rem' }}>{error}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => { if (urlUserId) fetchUser(urlUserId); }}>Try Again</button>
              <button className="btn btn-primary" onClick={() => navigate('/select')}>Select Profile</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', position: 'relative' }}>
      {/* Background orbs */}
      <div className="bg-glow-container">
        <div className="bg-glow-orb bg-glow-orb-1"></div>
        <div className="bg-glow-orb bg-glow-orb-2"></div>
        <div className="bg-glow-orb bg-glow-orb-3"></div>
      </div>

      <Navbar user={user} />

      <main className="main-content" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <ErrorBoundary>
          <Outlet context={{ user, refetchUser }} />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          © 2026 CarbonWise AI — Sustaining a greener future.
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Home</a>
          <a href="/about" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>About</a>
          <a href="#" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</a>
        </div>
      </footer>

      <EcoAssistant />
    </div>
  );
};
