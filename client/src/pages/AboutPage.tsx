import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { EcoAssistant } from '../components/EcoAssistant';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
  LeafIcon, GlobeIcon, CalculatorIcon, BrainIcon, ChartIcon, TargetIcon,
  SimulatorIcon, TrophyIcon, BookIcon, RecycleIcon, UserIcon, TransitIcon,
  FlameIcon, ShoppingBagIcon, BoltIcon, LightbulbIcon, SparklesIcon
} from '../components/Icons';

const iconMap: Record<string, React.ReactNode> = {
  environment:   <LeafIcon size={22} color="var(--color-primary)" />,
  transparency:  <RecycleIcon size={22} color="var(--color-secondary)" />,
  accessibility: <GlobeIcon size={22} color="var(--color-accent)" />,
  innovation:    <BoltIcon size={22} color="var(--color-pink)" />,
};

const values = [
  { icon: 'environment', title: 'Sustainability First', desc: 'Every feature is designed with ecological responsibility at the core.' },
  { icon: 'transparency', title: 'Radical Transparency', desc: 'Our calculations are open-source and based on peer-reviewed science.' },
  { icon: 'accessibility', title: 'Universal Accessibility', desc: 'Climate tools should be free and available to everyone, everywhere.' },
  { icon: 'innovation', title: 'Constant Innovation', desc: 'We continuously improve our AI models and sustainability guidance.' },
];

const whyPoints = [
  'Hyper-personalized tracking to match your actual lifestyle',
  'Backed by rigorous IPCC and EPA emission standards',
  'AI intelligence that adapts to your behavior patterns',
  'Gamified levels and achievements to maintain motivation',
  'Rich visual analytics to clearly show progress',
  'Completely free public platform for climate action',
];

const team = [
  { name: 'Narayana S', role: 'Founder & Lead Developer', avatar: 'NS', bio: 'Full-stack engineer passionate about climate tech and building tools that drive real behavioral change.' },
  { name: 'AI Engine', role: 'Sustainability Intelligence', avatar: 'AI', bio: 'Our recommendation engine is powered by carefully curated emission models and behavior pattern analysis.' },
  { name: 'The Community', role: '12,000+ Members', avatar: 'TC', bio: 'Every user who logs an activity, earns a badge, or meets a goal is part of our growing green community.' },
];

export const AboutPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  useScrollReveal();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,11,20,0.88)', backdropFilter: 'blur(20px)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060b14' }}>
            <LeafIcon size={16} />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CarbonWise AI</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="theme-toggle" onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.86rem' }}>Sign In</Link>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.86rem' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: '80px 32px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(var(--color-primary), transparent 70%)', filter: 'blur(160px)', opacity: 0.07, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}></div>
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px', color: 'var(--color-primary)', display: 'flex', justifyContent: 'center' }}>
            <LeafIcon size={56} />
          </div>
          <span className="section-eyebrow" style={{ display: 'block', textAlign: 'center' }}>Our Story</span>
          <div className="glow-line" style={{ margin: '14px auto 24px' }}></div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.4rem,4vw,3.6rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px', color: 'var(--text-primary)' }}>
            Built for a{' '}
            <span style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Greener Future</span>
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px' }}>
            CarbonWise AI was born from a simple belief: <strong style={{ color: 'var(--text-primary)' }}>you can't change what you don't measure.</strong> We built the tools we wished existed — beautiful, intelligent, and genuinely helpful.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '12px 28px' }}>Start Your Journey</Link>
            <Link to="/" className="btn btn-secondary" style={{ padding: '12px 24px' }}>Back to Home</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '60px 32px', background: 'rgba(0,229,160,0.03)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '32px', textAlign: 'center' }}>
          {[
            { value: '12,400+', label: 'Active Users', icon: <UserIcon size={26} /> },
            { value: '2.5M kg', label: 'CO₂ Tracked', icon: <ChartIcon size={26} /> },
            { value: '8', label: 'Core Features', icon: <BoltIcon size={26} /> },
            { value: '50+', label: 'Countries', icon: <GlobeIcon size={26} /> },
          ].map((s, i) => (
            <div key={i} className={`reveal-scale delay-${i + 1}`}>
              <div style={{ marginBottom: '12px', color: 'var(--color-primary)', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="landing-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '80px' }}>
          <div className="glass-card card-glow-primary reveal-left">
            <div style={{ color: 'var(--color-primary)', marginBottom: '16px', display: 'flex' }}><TargetIcon size={40} /></div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>Our Mission</h2>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              To empower every individual on Earth to understand and meaningfully reduce their environmental impact through accessible, intelligent, and beautifully designed digital tools.
            </p>
          </div>
          <div className="glass-card card-glow-blue reveal-right">
            <div style={{ color: 'var(--color-secondary)', marginBottom: '16px', display: 'flex' }}><GlobeIcon size={40} /></div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>Our Vision</h2>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              A future where everyone — students, professionals, families — actively understands their carbon footprint and makes daily choices that collectively bend the climate curve.
            </p>
          </div>
        </div>

        {/* Why CarbonWise */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '80px' }}>
          <div className="reveal-left">
            <span className="section-eyebrow">Why Choose Us</span>
            <div className="glow-line"></div>
            <h2 className="section-heading">Why CarbonWise AI?</h2>
            <p className="section-subheading" style={{ marginBottom: '28px' }}>
              We're not just another sustainability app. We're a comprehensive platform that combines scientific rigor with beautiful design and AI intelligence.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {whyPoints.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }} className="reveal-fade">
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="reveal-right">
            {[
              { metric: '87%', label: 'User satisfaction score', color: 'var(--color-primary)' },
              { metric: '29%', label: 'Average CO₂ reduction achieved', color: 'var(--color-secondary)' },
              { metric: '14 days', label: 'Average streak maintained', color: 'var(--color-accent)' },
            ].map((m, i) => (
              <div key={i} className={`glass-card reveal-scale delay-${i + 1}`} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: m.color, flexShrink: 0 }}>{m.metric}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }} className="reveal">
            <span className="section-eyebrow">Core Principles</span>
            <div className="glow-line" style={{ margin: '14px auto 20px' }}></div>
            <h2 className="section-heading" style={{ margin: '0 auto' }}>Our Values</h2>
          </div>
          <div className="grid grid-4" style={{ gap: '20px' }}>
            {values.map((v, i) => (
              <div key={i} className={`value-card reveal delay-${i + 1}`}>
                <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>{iconMap[v.icon]}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>{v.title}</h3>
                <p style={{ fontSize: '0.83rem', lineHeight: '1.65', color: 'var(--text-secondary)', margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '48px' }} className="reveal">
            <span className="section-eyebrow">The Team</span>
            <div className="glow-line" style={{ margin: '14px auto 20px' }}></div>
            <h2 className="section-heading" style={{ margin: '0 auto' }}>Built With Passion</h2>
          </div>
          <div className="grid grid-3">
            {team.map((t, i) => (
              <div key={i} className={`glass-card reveal delay-${i + 1}`} style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)', margin: '0 auto 20px' }}>{t.avatar}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{t.name}</h3>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.role}</div>
                <p style={{ fontSize: '0.83rem', lineHeight: '1.65', color: 'var(--text-secondary)', margin: 0 }}>{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 32px', textAlign: 'center', borderTop: '1px solid var(--border-color)', background: 'linear-gradient(135deg,rgba(0,229,160,0.05),rgba(56,189,248,0.05))', overflow: 'hidden' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }} className="reveal-scale">
          <div style={{ marginBottom: '16px', color: 'var(--color-primary)', display: 'flex', justifyContent: 'center' }}>
            <GlobeIcon size={44} />
          </div>
          <h2 className="section-heading" style={{ margin: '0 auto 16px' }}>Join the Movement</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.75', marginBottom: '32px' }}>
            Every action logged, every goal met, every badge earned — it all adds up to real change. Start today.
          </p>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>Get Started Free</Link>
        </div>
      </div>

      <footer style={{ padding: '28px 32px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>© 2026 CarbonWise AI — Built for a greener planet · <Link to="/" style={{ color: 'var(--color-primary)' }}>Home</Link> · <Link to="/login" style={{ color: 'var(--color-secondary)' }}>Sign In</Link></span>
      </footer>

      <EcoAssistant />
    </div>
  );
};
