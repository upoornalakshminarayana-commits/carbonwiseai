import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon } from './Icons';

interface Message {
  id: number;
  text: string;
  from: 'bot' | 'user';
}

const knowledgeBase: { keywords: string[]; answer: string }[] = [
  { keywords: ['hello', 'hi', 'hey', 'start'], answer: "Hello! I'm CarbonWise AI, your Climate Intelligence Co-Pilot. Ask me anything about carbon footprints, sustainability metrics, or how the platform works." },
  { keywords: ['carbon footprint', 'what is', 'footprint'], answer: "A carbon footprint measures the total greenhouse gases — primarily CO₂ — you produce through daily activities. It covers transport, energy, food, shopping, and waste. The global average is ~450 kg/month." },
  { keywords: ['transport', 'car', 'bus', 'commute', 'travel'], answer: "Transport emissions represent a primary source of carbon. Switching just 2 car commutes per week to public transit can reduce your transport CO₂ by up to 30%. Electric vehicles reduce it by ~75% vs gasoline cars." },
  { keywords: ['food', 'diet', 'eat', 'meal', 'meat', 'vegan', 'vegetarian'], answer: "Dietary choices have a significant footprint. A meat-heavy diet produces ~250 kg CO₂/month, while a vegan diet is only ~60 kg. Even one meatless day per week reduces food emissions by 14%. Small changes add up fast." },
  { keywords: ['energy', 'electricity', 'ac', 'appliance', 'power'], answer: "Home utility consumption typically accounts for 20-35% of your footprint. Setting your AC 2°C warmer saves ~15% energy. Switching to LED lighting and unplugging idle devices can cut 10-20% off your energy emissions." },
  { keywords: ['goal', 'target', 'reduce', 'reduction'], answer: "Setting specific reduction targets is essential. Research shows people with concrete goals reduce emissions 40% more than those without. The Paris Accord recommends a 30% reduction per person by 2030 to limit warming." },
  { keywords: ['badge', 'achievement', 'reward', 'xp', 'points', 'level'], answer: "CarbonWise rewards sustainable habits. Log daily activities to earn XP and level up from Associate to Climate Intelligence Fellow. Each level unlocks new professional badges." },
  { keywords: ['score', 'sustainability score', 'index'], answer: "Your Sustainability Index (0-100) is calculated based on your monthly CO₂ compared to global averages. 80+ = Excellent, 60-79 = Good, 40-59 = Average, below 40 = High impact. The goal is to reach 75+." },
  { keywords: ['shopping', 'clothes', 'electronics', 'buy'], answer: "Consumer goods carry a significant carbon footprint. A single new smartphone = 80 kg CO₂. Fast fashion clothing averages 15 kg/item. Buying secondhand or reducing purchases by 50% makes a major difference." },
  { keywords: ['recycle', 'waste', 'plastic', 'trash'], answer: "Effective waste separation and recycling can reduce your waste-related emissions by up to 60%! Composting food waste prevents methane production. Reducing plastic use by bringing reusable bags/bottles makes an immediate impact." },
  { keywords: ['how does', 'work', 'calculate'], answer: "CarbonWise calculates your footprint using IPCC-standard emission coefficients. You input your monthly lifestyle data across 5 categories, and our calculation engine computes your total CO₂ and personalized reduction strategies." },
  { keywords: ['accurate', 'accuracy', 'reliable'], answer: "Our calculations are based on IPCC and EPA emission factors with ±10% accuracy for lifestyle footprints. They're consistent with tools used by major climate organizations worldwide." },
];

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  for (const item of knowledgeBase) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.answer;
    }
  }
  return "Thank you for your question. I can assist with topics like carbon footprints, transport emissions, diet, energy saving, waste sorting, and achievements. What would you like to explore?";
};

let msgId = 0;

export const EcoAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: ++msgId, text: "Hello, I am CarbonWise AI, your Climate Intelligence Co-Pilot. How can I help you optimize your carbon footprint today?", from: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: ++msgId, text: trimmed, from: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const botMsg: Message = { id: ++msgId, text: getResponse(trimmed), from: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    }, 900 + Math.random() * 600);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  const quickTopics = ['Transport tips', 'Diet impact', 'Energy saving', 'Credentials & XP'];

  return (
    <div className="eco-assistant-bubble">
      {open && (
        <div className="eco-chat-panel">
          <div className="eco-chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px var(--color-primary-glow)', color: '#060b14' }}>
                <SparklesIcon size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>CarbonWise Co-Pilot</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block', animation: 'pulse-glow 2s infinite' }}></span>
                  Online · AI Powered
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem', padding: '4px' }}>✕</button>
          </div>

          <div className="eco-chat-messages">
            {messages.map(m => (
              <div key={m.id} className={`eco-message eco-message-${m.from}`}>{m.text}</div>
            ))}
            {typing && (
              <div className="eco-message eco-message-bot eco-typing">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {messages.length <= 2 && (
            <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--border-color)' }}>
              {quickTopics.map((t, i) => (
                <button key={i} onClick={() => { setInput(t); }} style={{ padding: '5px 10px', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.73rem', cursor: 'pointer', transition: 'all var(--t-fast)', fontFamily: 'var(--font-sans)' }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--color-primary)'; (e.target as HTMLButtonElement).style.color = 'var(--color-primary)'; }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--border-color)'; (e.target as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}>
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="eco-chat-input-row">
            <input
              className="eco-chat-input"
              placeholder="Ask about sustainability..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="eco-chat-send" onClick={sendMessage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>Send</button>
          </div>
        </div>
      )}

      <button className="eco-assistant-btn" onClick={() => setOpen(o => !o)} title="Open CarbonWise Co-Pilot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060b14' }}>
        {open ? '✕' : <SparklesIcon size={20} />}
      </button>
    </div>
  );
};
