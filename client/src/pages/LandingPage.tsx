import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { EcoAssistant } from '../components/EcoAssistant';
import { useScrollReveal } from '../hooks/useScrollReveal';
import {
  LeafIcon, GlobeIcon, CalculatorIcon, BrainIcon, ChartIcon, TargetIcon,
  SimulatorIcon, TrophyIcon, BookIcon, RecycleIcon, UserIcon, TransitIcon,
  FlameIcon, ShoppingBagIcon, BoltIcon, LightbulbIcon, SparklesIcon
} from '../components/Icons';

const iconMap: Record<string, React.ReactNode> = {
  calculator: <CalculatorIcon size={22} color="var(--color-primary)" />,
  ai:         <BrainIcon size={22} color="var(--color-secondary)" />,
  tracking:   <ChartIcon size={22} color="var(--color-accent)" />,
  analytics:  <ChartIcon size={22} color="var(--color-average)" />,
  goals:      <TargetIcon size={22} color="var(--color-pink)" />,
  simulator:  <SimulatorIcon size={22} color="#34d399" />,
  rewards:    <TrophyIcon size={22} color="#fbbf24" />,
  education:  <BookIcon size={22} color="#f472b6" />,
  
  environment: <LeafIcon size={22} color="var(--color-primary)" />,
  habits:      <RecycleIcon size={22} color="var(--color-secondary)" />,
  guidance:    <BrainIcon size={22} color="var(--color-accent)" />,
  progress:    <ChartIcon size={22} color="var(--color-average)" />,
  community:   <UserIcon size={22} color="var(--color-primary)" />,
  science:     <SimulatorIcon size={22} color="var(--color-secondary)" />,
};

const features = [
  { icon: 'calculator', title: 'Smart Carbon Calculator', desc: 'Calculate your exact carbon footprint instantly across 5 life categories.', color: 'var(--color-primary)' },
  { icon: 'ai', title: 'AI Sustainability Coach', desc: 'Receive personalized, data-driven reduction recommendations weekly.', color: 'var(--color-secondary)' },
  { icon: 'tracking', title: 'Activity Tracking', desc: 'Monitor daily habits and their real environmental impact in real-time.', color: 'var(--color-accent)' },
  { icon: 'analytics', title: 'Analytics Dashboard', desc: 'Visualize trends, category breakdowns, and your progress over time.', color: 'var(--color-average)' },
  { icon: 'goals', title: 'Goal Planner', desc: 'Set ambitious carbon reduction goals with timeline tracking.', color: 'var(--color-pink)' },
  { icon: 'simulator', title: 'Carbon Simulator', desc: 'See the instant impact of lifestyle changes before committing.', color: '#34d399' },
  { icon: 'rewards', title: 'Rewards & Badges', desc: 'Earn sustainability achievements as you hit green milestones.', color: '#fbbf24' },
  { icon: 'education', title: 'Education Hub', desc: 'Learn proven eco-friendly habits from curated guides.', color: '#f472b6' },
];

const benefits = [
  { icon: 'environment', title: 'Save the Environment', desc: 'Reduce emissions through informed, data-driven daily decisions.' },
  { icon: 'habits', title: 'Build Sustainable Habits', desc: 'Track and continuously improve your daily environmental behavior.' },
  { icon: 'guidance', title: 'Personalized Guidance', desc: 'AI recommendations tailored specifically to your lifestyle.' },
  { icon: 'progress', title: 'Visual Progress Tracking', desc: 'Watch your impact improve through beautiful charts and metrics.' },
  { icon: 'community', title: 'Community Impact', desc: 'Contribute toward a greener collective future with others.' },
  { icon: 'science', title: 'Data-Driven Decisions', desc: 'Understand precisely which changes matter most for your impact.' },
];

const steps = [
  { n: '01', title: 'Add Your Data', desc: 'Enter your lifestyle details across transport, energy, diet, and shopping.' },
  { n: '02', title: 'Calculate Footprint', desc: 'CarbonWise instantly calculates your monthly CO₂ baseline.' },
  { n: '03', title: 'AI Analysis', desc: 'Our AI engine analyzes patterns and identifies largest emission sources.' },
  { n: '04', title: 'Get Suggestions', desc: 'Receive personalized, actionable coaching recommendations.' },
  { n: '05', title: 'Track Progress', desc: 'Log daily actions and watch your emissions reduce over time.' },
];

const testimonials = [
  {
    name: 'Priya Sharma', role: 'Graduate Student', avatar: 'PS',
    quote: 'CarbonWise helped me realize my diet was contributing 40% of my footprint. Switching to plant-based meals 4 days a week cut my score dramatically within weeks.',
    reduction: '28% reduction', color: 'var(--color-primary)',
  },
  {
    name: 'Arjun Mehta', role: 'Software Engineer', avatar: 'AM',
    quote: 'The AI coaching is genuinely smart. It told me exactly which car trips to replace with transit. My sustainability score went from 35 to 71 in two months.',
    reduction: '41% reduction', color: 'var(--color-secondary)',
  },
  {
    name: 'Lakshmi Reddy', role: 'Parent of Two', avatar: 'LR',
    quote: "As a family, we were shocked by our energy consumption. CarbonWise's goal tracker made it a fun challenge. We've saved money AND emissions!",
    reduction: '22% reduction', color: 'var(--color-accent)',
  },
];

const faqs = [
  { q: 'How accurate are the carbon calculations?', a: 'Our calculations are based on internationally recognized emissions coefficients from the IPCC and EPA. They provide excellent estimates for lifestyle carbon footprints with ±10% accuracy.' },
  { q: 'Is my personal data secure and private?', a: 'Absolutely. All data stays on your device session. We use no third-party trackers, and your carbon data is never sold or shared with advertisers.' },
  { q: 'How does the AI generate recommendations?', a: 'The AI engine analyzes your baseline data, identifies your three dominant emission sources, and generates tailored reduction strategies with quantified CO₂ savings for each action.' },
  { q: 'Can I track my long-term progress?', a: 'Yes! CarbonWise maintains a full history of your activity logs, monthly trajectories, and progress toward your reduction goals with visual charts.' },
  { q: 'Is the platform completely free to use?', a: 'CarbonWise AI is 100% free to use. Our mission is to democratize sustainability education and make climate action accessible to everyone.' },
];

export const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [counts, setCounts] = useState({ users: 0, co2: 0, score: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useScrollReveal();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animated counter
  useEffect(() => {
    const targets = { users: 12400, co2: 2.5, score: 87 };
    const duration = 2000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts({
        users: Math.round(targets.users * eased),
        co2: Math.round(targets.co2 * eased * 10) / 10,
        score: Math.round(targets.score * eased),
      });
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing-page">
      {/* ── Fixed Navbar ── */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav-scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px var(--color-primary-glow)', color: '#060b14' }}>
              <LeafIcon size={18} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CarbonWise AI</span>
          </Link>

          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#how-it-works" className="landing-nav-link">How It Works</a>
            <Link to="/about" className="landing-nav-link">About</Link>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">{theme === 'dark' ? 'Light' : 'Dark'}</button>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.86rem' }}>Sign In</Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.86rem' }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section" ref={heroRef}>
        <div className="bg-glow-container" style={{ position: 'absolute' }}>
          <div className="bg-glow-orb bg-glow-orb-1"></div>
          <div className="bg-glow-orb bg-glow-orb-2"></div>
          <div className="bg-glow-orb bg-glow-orb-3"></div>
        </div>

        <div className="hero-content">
          {/* Left */}
          <div>
            <div className="hero-badge reveal-fade" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <GlobeIcon size={13} /> Trusted by 12,000+ sustainability advocates
            </div>
            <h1 className="hero-title reveal delay-1">
              Track Your{' '}
              <span className="hero-title-gradient">Carbon Footprint.</span>
              <br />Build a Greener Future.
            </h1>
            <p className="hero-subtitle reveal delay-2">
              CarbonWise AI helps individuals understand, monitor, and reduce their environmental impact through personalized AI-driven sustainability insights.
            </p>
            <div className="hero-ctas reveal delay-3">
              <Link to="/signup" className="btn btn-primary" id="hero-get-started" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary" id="hero-explore-btn" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Explore Dashboard →
              </Link>
            </div>

            <div className="hero-stats">
              {[
                { value: `${counts.users.toLocaleString()}+`, label: 'Active Users' },
                { value: `${counts.co2}M kg`, label: 'CO₂ Tracked' },
                { value: `${counts.score}%`, label: 'Avg. Score Improvement' },
              ].map((s, i) => (
                <div key={i} className={`reveal-scale delay-${i + 4}`}>
                  <div className="hero-stat-value counter-animate">{s.value}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – floating cards + planet */}
          <div className="hero-visual">
            <div className="hero-planet" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <GlobeIcon size={120} />
            </div>

            <div className="eco-card-float">
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Monthly CO₂</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>142 kg</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}>↓ 28% from baseline</div>
            </div>

            <div className="eco-card-float">
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.08em' }}>Eco Score</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-secondary)' }}>78 / 100</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-good)' }}>★ Excellent</div>
            </div>

            <div className="eco-card-float" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-average)' }}><TrophyIcon size={24} /></span>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Badge Earned!</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Carbon Champion</div>
              </div>
            </div>

            <div className="eco-card-float">
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.08em' }}>Today's Streak</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-average)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <FlameIcon size={18} /> 14 Days
              </div>
            </div>

            <div className="eco-card-float" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-secondary)' }}><BrainIcon size={22} /></span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', maxWidth: '140px' }}>
                "Switch 2 car trips to transit — save 12 kg CO₂/mo"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-section" id="features">
        <div style={{ textAlign: 'center', marginBottom: '60px' }} className="reveal">
          <span className="section-eyebrow">Everything You Need</span>
          <div className="glow-line" style={{ margin: '14px auto 22px' }}></div>
          <h2 className="section-heading" style={{ margin: '0 auto 16px' }}>A Complete Sustainability Platform</h2>
          <p className="section-subheading" style={{ margin: '0 auto', textAlign: 'center' }}>
            Eight powerful tools working together to help you understand and reduce your environmental impact.
          </p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} className={`feature-card reveal delay-${(i % 4) + 1}`}>
              <div className="feature-icon-box">{iconMap[f.icon]}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ fontSize: '0.84rem', lineHeight: '1.65', color: 'var(--text-secondary)', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section style={{ padding: '80px 32px', background: 'rgba(0,229,160,0.03)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="landing-section" style={{ padding: '0' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }} className="reveal">
            <span className="section-eyebrow">Why CarbonWise</span>
            <div className="glow-line" style={{ margin: '14px auto 22px' }}></div>
            <h2 className="section-heading" style={{ margin: '0 auto 14px' }}>Built for Real Impact</h2>
            <p className="section-subheading" style={{ margin: '0 auto', textAlign: 'center' }}>
              Every feature is designed with one goal — helping you make meaningful, measurable environmental changes.
            </p>
          </div>
          <div className="grid grid-3">
            {benefits.map((b, i) => (
              <div key={i} className={`glass-card reveal-scale delay-${(i % 3) + 1}`} style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {iconMap[b.icon]}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{b.title}</h3>
                  <p style={{ fontSize: '0.83rem', lineHeight: '1.65', color: 'var(--text-secondary)', margin: 0 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="landing-section" id="how-it-works">
        <div style={{ textAlign: 'center', marginBottom: '64px' }} className="reveal">
          <span className="section-eyebrow">Simple Process</span>
          <div className="glow-line" style={{ margin: '14px auto 22px' }}></div>
          <h2 className="section-heading" style={{ margin: '0 auto 14px' }}>How It Works</h2>
          <p className="section-subheading" style={{ margin: '0 auto', textAlign: 'center' }}>
            From setup to actionable insights in under 5 minutes.
          </p>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className={`step-item reveal delay-${i + 1}`}>
              <div className="step-number">{s.n}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ fontSize: '0.82rem', lineHeight: '1.65', color: 'var(--text-secondary)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '80px 32px', background: 'rgba(56,189,248,0.03)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="landing-section" style={{ padding: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }} className="reveal">
            <span className="section-eyebrow">Real Stories</span>
            <div className="glow-line" style={{ margin: '14px auto 22px' }}></div>
            <h2 className="section-heading" style={{ margin: '0 auto' }}>Loved by Sustainability Advocates</h2>
          </div>
          <div className="grid grid-3">
            {testimonials.map((t, i) => (
              <div key={i} className={`testimonial-card reveal delay-${(i % 3) + 1}`}>
                <div className="testimonial-quote">"</div>
                <div className="stars">{'★★★★★'}</div>
                <p style={{ fontSize: '0.88rem', lineHeight: '1.75', color: 'var(--text-secondary)', marginBottom: '24px', fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${t.color}18`, border: `2px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, color: t.color, background: `${t.color}12`, border: `1px solid ${t.color}30`, padding: '4px 10px', borderRadius: '99px' }}>{t.reduction}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="landing-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '80px', alignItems: 'start' }}>
          <div className="reveal-left">
            <span className="section-eyebrow">FAQ</span>
            <div className="glow-line"></div>
            <h2 className="section-heading">Frequently Asked Questions</h2>
            <p className="section-subheading" style={{ marginBottom: '32px' }}>
              Have more questions? Reach out via the chatbot or our contact page.
            </p>
            <Link to="/signup" className="btn btn-primary">Get Started Free →</Link>
          </div>
          <div className="reveal-right delay-2">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'faq-open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="faq-icon">+</span>
                </button>
                <div className={`faq-answer ${openFaq === i ? 'faq-open' : ''}`}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '80px 32px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(0,229,160,0.06), rgba(56,189,248,0.06))', borderTop: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }} className="reveal-scale">
          <div style={{ marginBottom: '16px', color: 'var(--color-primary)', display: 'flex', justifyContent: 'center' }}>
            <LeafIcon size={44} />
          </div>
          <h2 className="section-heading" style={{ margin: '0 auto 16px' }}>Ready to Make a Difference?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.75' }}>
            Join thousands of people already using CarbonWise AI to track, reduce, and offset their environmental impact.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>Get Started Free</Link>
            <Link to="/about" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>Learn More</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060b14' }}>
                  <LeafIcon size={18} />
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CarbonWise AI</span>
              </div>
              <p style={{ fontSize: '0.84rem', lineHeight: '1.75', color: 'var(--text-secondary)', maxWidth: '260px' }}>
                Empowering individuals to understand and reduce their environmental impact through AI-driven insights.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '16px' }}>Product</div>
              <a href="#features" className="footer-link">Features</a>
              <Link to="/login" className="footer-link">Dashboard</Link>
              <Link to="/signup" className="footer-link">Get Started</Link>
              <Link to="/about" className="footer-link">About</Link>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '16px' }}>Legal</div>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms & Conditions</a>
              <a href="#" className="footer-link">Cookie Policy</a>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '16px' }}>Connect</div>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">GitHub Repository</a>
              <a href="#" className="footer-link">Contact Us</a>
              <a href="#" className="footer-link">Report Issue</a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 CarbonWise AI. Sustaining a greener future.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <LeafIcon size={16} />
              <RecycleIcon size={16} />
              <GlobeIcon size={16} />
            </div>
          </div>
        </div>
      </footer>

      <EcoAssistant />
    </div>
  );
};
