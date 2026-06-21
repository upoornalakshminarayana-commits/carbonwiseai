import React, { useState } from 'react';
import { CarIcon, BoltIcon, LeafIcon, CheckIcon, TreeIcon } from './Icons';

interface SimulatorResults {
  monthlySavings: number;
  annualSavings: number;
  reductionPct: number;
}

interface CarbonSimulatorProps {
  baselineMonthly?: number;
}

export const CarbonSimulator: React.FC<CarbonSimulatorProps> = ({ baselineMonthly = 300 }) => {
  const [carReduction, setCarReduction] = useState(0);      // km/month less by car
  const [energySaving, setEnergySaving] = useState(0);      // kWh/month saved
  const [dietShift, setDietShift] = useState(0);            // 0=none, 1=reduce meat 1day, 2=vegetarian, 3=vegan

  const dietLabels = ['No Change', 'Meatless Mondays', 'Vegetarian', 'Mostly Vegan'];
  const dietSavings = [0, 30, 80, 120]; // kg CO2/month

  const results: SimulatorResults = (() => {
    const transportSavings = carReduction * 0.20;
    const energySavingsKg = energySaving * 0.38;
    const foodSavings = dietSavings[dietShift] || 0;
    const totalSavings = transportSavings + energySavingsKg + foodSavings;
    const pct = Math.round((totalSavings / Math.max(baselineMonthly, 1)) * 100);
    return {
      monthlySavings: Math.round(totalSavings * 10) / 10,
      annualSavings: Math.round(totalSavings * 12 * 10) / 10,
      reductionPct: Math.min(pct, 100),
    };
  })();

  const isPositive = results.monthlySavings > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Transport Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.84rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CarIcon size={16} /> Reduce Car Trips
          </span>
          <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{carReduction} km/mo less</span>
        </div>
        <input type="range" min="0" max="500" step="10" value={carReduction} onChange={e => setCarReduction(+e.target.value)} style={{ width: '100%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          <span>No change</span><span>250 km</span><span>500 km</span>
        </div>
      </div>

      {/* Energy Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.84rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BoltIcon size={16} /> Save Home Energy
          </span>
          <span style={{ color: 'var(--color-average)', fontWeight: 700 }}>{energySaving} kWh/mo saved</span>
        </div>
        <input type="range" min="0" max="300" step="10" value={energySaving} onChange={e => setEnergySaving(+e.target.value)} style={{ width: '100%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          <span>No change</span><span>150 kWh</span><span>300 kWh</span>
        </div>
      </div>

      {/* Diet Shift Toggle */}
      <div>
        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LeafIcon size={16} /> Dietary Shift
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
          {dietLabels.map((label, i) => (
            <button key={i} onClick={() => setDietShift(i)} style={{ padding: '8px 4px', borderRadius: 'var(--radius-xs)', fontSize: '0.72rem', fontWeight: 600, background: dietShift === i ? 'rgba(0,229,160,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${dietShift === i ? 'rgba(0,229,160,0.35)' : 'var(--border-color)'}`, color: dietShift === i ? 'var(--color-primary)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all var(--t-fast)', fontFamily: 'var(--font-sans)', textAlign: 'center', lineHeight: 1.3 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ background: isPositive ? 'rgba(0,229,160,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isPositive ? 'rgba(0,229,160,0.2)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', padding: '20px', transition: 'all var(--t-normal)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isPositive ? 'var(--color-primary)' : 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isPositive ? (
            <>
              <CheckIcon size={14} /> Projected Impact
            </>
          ) : 'Adjust sliders to see impact'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {[
            { label: 'Monthly Savings', value: isPositive ? `${results.monthlySavings} kg` : '—', color: 'var(--color-primary)' },
            { label: 'Annual Savings', value: isPositive ? `${results.annualSavings} kg` : '—', color: 'var(--color-secondary)' },
            { label: 'CO₂ Reduction', value: isPositive ? `${results.reductionPct}%` : '—', color: 'var(--color-average)' },
          ].map((r, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: isPositive ? r.color : 'var(--text-muted)', marginBottom: '4px', transition: 'all 0.4s ease' }}>
                {r.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.label}</div>
            </div>
          ))}
        </div>
        {isPositive && results.annualSavings > 0 && (
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(0,229,160,0.06)', border: '1px solid rgba(0,229,160,0.15)', borderRadius: 'var(--radius-xs)', fontSize: '0.78rem', color: 'var(--color-primary)', lineHeight: '1.5', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TreeIcon size={16} /> Equivalent to planting ~{Math.round(results.annualSavings / 22)} trees per year!
          </div>
        )}
      </div>
    </div>
  );
};
