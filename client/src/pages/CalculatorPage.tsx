import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { apiClient } from '../api/client';
import { FootprintBaseline, User } from '../types';
import { TransitIcon, BoltIcon, LeafIcon, ShoppingBagIcon, RecycleIcon, CarIcon, LightbulbIcon } from '../components/Icons';

interface LayoutContextType {
  user: User | null;
  refetchUser: () => Promise<void>;
}

export const CalculatorPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const parsedUserId = parseInt(userId || '0');
  
  const { refetchUser } = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    transport_car: 0,
    transport_ev: 0,
    transport_bus: 0,
    transport_train: 0,
    transport_flights: 0,
    transport_walk_bike: 0,
    energy_electricity: 0,
    energy_ac: 0,
    energy_appliances: 0,
    food_diet: 'mixed' as FootprintBaseline['food_diet'],
    shopping_clothing: 0,
    shopping_electronics: 0,
    waste_plastic: 0,
    waste_recycling: 'sometimes' as FootprintBaseline['waste_recycling'],
  });

  const [liveCO2, setLiveCO2] = useState(0);

  // Load existing baseline if available
  useEffect(() => {
    const loadBaseline = async () => {
      if (!parsedUserId) return;
      try {
        setLoading(true);
        const data = await apiClient.getBaseline(parsedUserId);
        if (data) {
          setFormData({
            transport_car: data.transport_car || 0,
            transport_ev: data.transport_ev || 0,
            transport_bus: data.transport_bus || 0,
            transport_train: data.transport_train || 0,
            transport_flights: data.transport_flights || 0,
            transport_walk_bike: data.transport_walk_bike || 0,
            energy_electricity: data.energy_electricity || 0,
            energy_ac: data.energy_ac || 0,
            energy_appliances: data.energy_appliances || 0,
            food_diet: data.food_diet || 'mixed',
            shopping_clothing: data.shopping_clothing || 0,
            shopping_electronics: data.shopping_electronics || 0,
            waste_plastic: data.waste_plastic || 0,
            waste_recycling: data.waste_recycling || 'sometimes',
          });
        }
      } catch (err) {
        // No baseline yet, which is fine!
      } finally {
        setLoading(false);
      }
    };

    loadBaseline();
  }, [parsedUserId]);

  // Live Carbon Calculator on state changes
  useEffect(() => {
    const carCO2 = (formData.transport_car || 0) * 0.20;
    const evCO2 = (formData.transport_ev || 0) * 0.05;
    const busCO2 = (formData.transport_bus || 0) * 0.08;
    const trainCO2 = (formData.transport_train || 0) * 0.04;
    const flightCO2 = ((formData.transport_flights || 0) * 0.12) / 12;

    const electricityCO2 = (formData.energy_electricity || 0) * 0.38;
    const acCO2 = (formData.energy_ac || 0) * 0.30;
    const appliancesCO2 = (formData.energy_appliances || 0) * 0.38;

    const foodCoeffs = { vegan: 60, vegetarian: 100, mixed: 180, meat_heavy: 250 };
    const foodTotal = foodCoeffs[formData.food_diet] || 180;

    const clothingCO2 = (formData.shopping_clothing || 0) * 15.0;
    const electronicsCO2 = (formData.shopping_electronics || 0) * 80.0;

    const rawWasteCO2 = (formData.waste_plastic || 0) * 3.0;
    const wasteReductions = { always: 0.60, sometimes: 0.30, never: 0.00 };
    const wasteTotal = rawWasteCO2 * (1 - (wasteReductions[formData.waste_recycling] || 0.30));

    const total = carCO2 + evCO2 + busCO2 + trainCO2 + flightCO2 +
                  electricityCO2 + acCO2 + appliancesCO2 +
                  foodTotal + clothingCO2 + electronicsCO2 + wasteTotal;

    setLiveCO2(Math.round(total * 10) / 10);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedVal = e.target.type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedVal
    }));
  };

  const handleNext = () => setActiveStep(prev => Math.min(prev + 1, 5));
  const handlePrev = () => setActiveStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.updateBaseline(parsedUserId, formData);
      await refetchUser();
      navigate(`/dashboard/${parsedUserId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to save carbon footprint baseline');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Loading your calculator data...</span>
      </div>
    );
  }

  const stepsList = [
    { id: 1, title: 'Transportation', icon: <TransitIcon size={16} /> },
    { id: 2, title: 'Home Energy', icon: <BoltIcon size={16} /> },
    { id: 3, title: 'Food & Diet', icon: <LeafIcon size={16} /> },
    { id: 4, title: 'Shopping', icon: <ShoppingBagIcon size={16} /> },
    { id: 5, title: 'Waste Management', icon: <RecycleIcon size={16} /> },
  ];

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Form Area */}
      <div>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Carbon Footprint Calculator</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tell us about your monthly habits across 5 categories. We'll calculate your sustainability score and generate AI recommendations.</p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Step {activeStep} of 5</span>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{Math.round((activeStep / 5) * 100)}% complete</span>
        </div>
        <div className="progress-bar-track" style={{ marginBottom: '24px', height: '6px' }}>
          <div className="progress-bar-fill" style={{ width: `${(activeStep / 5) * 100}%`, transition: 'width 0.4s var(--ease-out)' }} />
        </div>

        {/* Step Indicators */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {stepsList.map((step) => {
            const isActive = activeStep === step.id;
            const isDone = activeStep > step.id;
            return (
              <div 
                key={step.id} 
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '10px 8px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(0,229,160,0.1)' : isDone ? 'rgba(0,229,160,0.04)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,229,160,0.35)' : isDone ? '1px solid rgba(0,229,160,0.15)' : '1px solid transparent',
                  color: isActive ? 'var(--color-primary)' : isDone ? 'var(--color-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: isDone ? 0.7 : 1,
                }}
                onClick={() => setActiveStep(step.id)}
              >
                <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isDone ? '✓' : step.icon}</span>
                <span className="step-title" style={{ display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px' }}>{step.title}</span>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="glass-card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Step 1: Transport */}
            {activeStep === 1 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CarIcon size={20} color="var(--color-accent)" /> Transportation Monthly Distances
                </h3>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label htmlFor="transport_car">Gasoline/Diesel Car (km/month)</label>
                    <input 
                      id="transport_car"
                      type="number" 
                      name="transport_car" 
                      value={formData.transport_car} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="transport_ev">Electric Vehicle (EV) (km/month)</label>
                    <input 
                      id="transport_ev"
                      type="number" 
                      name="transport_ev" 
                      value={formData.transport_ev} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="transport_bus">Public Bus (km/month)</label>
                    <input 
                      id="transport_bus"
                      type="number" 
                      name="transport_bus" 
                      value={formData.transport_bus} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="transport_train">Train / Metro (km/month)</label>
                    <input 
                      id="transport_train"
                      type="number" 
                      name="transport_train" 
                      value={formData.transport_train} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="transport_flights">Flights (km / year)</label>
                    <input 
                      id="transport_flights"
                      type="number" 
                      name="transport_flights" 
                      value={formData.transport_flights} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="transport_walk_bike">Walking / Biking (km/month)</label>
                    <input 
                      id="transport_walk_bike"
                      type="number" 
                      name="transport_walk_bike" 
                      value={formData.transport_walk_bike} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Energy */}
            {activeStep === 2 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BoltIcon size={20} color="var(--color-average)" /> Household Utility Consumption
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="energy_electricity">Electricity Consumption (kWh/month)</label>
                    <input 
                      id="energy_electricity"
                      type="number" 
                      name="energy_electricity" 
                      value={formData.energy_electricity} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="energy_ac">Air Conditioner Usage (Hours/month)</label>
                    <input 
                      id="energy_ac"
                      type="number" 
                      name="energy_ac" 
                      value={formData.energy_ac} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="energy_appliances">Other Electrical Appliances (Estimated kWh/month)</label>
                    <input 
                      id="energy_appliances"
                      type="number" 
                      name="energy_appliances" 
                      value={formData.energy_appliances} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Food */}
            {activeStep === 3 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LeafIcon size={20} color="var(--color-primary)" /> Dietary Habits
                </h3>
                <div className="form-group">
                  <label htmlFor="food_diet">What best describes your primary diet?</label>
                  <select 
                    id="food_diet"
                    name="food_diet" 
                    value={formData.food_diet} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '14px' }}
                  >
                    <option value="vegan">Vegan (No animal products, lowest emissions)</option>
                    <option value="vegetarian">Vegetarian (No meat, consumes dairy/eggs)</option>
                    <option value="mixed">Mixed (Average meat, dairy, and veggies)</option>
                    <option value="meat_heavy">Meat-Heavy (Consumes beef/pork daily, highest emissions)</option>
                  </select>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '24px' }}>
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.6', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ display: 'flex', flexShrink: 0, marginTop: '2px' }}><LightbulbIcon size={16} color="var(--color-average)" /></span>
                    <span><strong>Environmental Impact:</strong> Animal agriculture represents nearly 15% of global greenhouse gas emissions. Switching to plant-based meals cuts up to 60-70% of food-related carbon.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Shopping */}
            {activeStep === 4 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBagIcon size={20} color="var(--color-pink)" /> Shopping & Manufactured Goods
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="shopping_clothing">New Clothing Purchases (Items/month)</label>
                    <input 
                      id="shopping_clothing"
                      type="number" 
                      name="shopping_clothing" 
                      value={formData.shopping_clothing} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shopping_electronics">New Electronic Devices (Items/month)</label>
                    <input 
                      id="shopping_electronics"
                      type="number" 
                      name="shopping_electronics" 
                      value={formData.shopping_electronics} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Waste */}
            {activeStep === 5 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RecycleIcon size={20} color="var(--color-secondary)" /> Household Waste & Recycling
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="waste_plastic">Discarded Plastic Waste (kg/month)</label>
                    <input 
                      id="waste_plastic"
                      type="number" 
                      name="waste_plastic" 
                      value={formData.waste_plastic} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="waste_recycling">Do you sort and recycle waste?</label>
                    <select 
                      id="waste_recycling"
                      name="waste_recycling" 
                      value={formData.waste_recycling} 
                      onChange={handleChange}
                      style={{ width: '100%', padding: '14px' }}
                    >
                      <option value="always">Always (Rigorously separate paper, glass, plastic, organic)</option>
                      <option value="sometimes">Sometimes (Recycle paper/cans occasionally)</option>
                      <option value="never">Never (Throw everything in general trash)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '30px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handlePrev}
              disabled={activeStep === 1}
            >
              Previous
            </button>

            {activeStep < 5 ? (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleNext}
              >
                Next Step
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting}
              >
                {submitting ? 'Saving Baseline...' : 'Save & Calculate'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sidebar Live Preview */}
      <div>
        <div 
          className="glass-card" 
          style={{
            position: 'sticky',
            top: '100px',
            border: '1px solid var(--color-primary-glow)',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-primary)' }}><LeafIcon size={36} /></div>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Live Estimate
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px', margin: '12px 0' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                {liveCO2}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>kg/mo</span>
            </div>
            <p style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
              Your emissions are estimated dynamically as you complete the questionnaire.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', fontSize: '0.75rem', textAlign: 'left', lineHeight: '1.5' }}>
            <strong>Comparative metrics:</strong>
            <ul style={{ paddingLeft: '14px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>&lt; 200 kg: Excellent Eco</li>
              <li>200 - 350 kg: Good</li>
              <li>350 - 550 kg: Average</li>
              <li>550 - 800 kg: High</li>
              <li>&gt; 800 kg: Critical</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
