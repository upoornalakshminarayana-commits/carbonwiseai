import { CarbonInputs, EMISSION_FACTORS } from './carbonCalculator';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number; // kg CO2 per month
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export interface ActivityLog {
  category: string;
  activity_type: string;
  amount: number;
  co2_emitted: number;
  date: string;
}

export interface AIInsights {
  dominantSources: string[];
  recommendations: Recommendation[];
  projections: {
    baseline: number;          // baseline monthly CO2
    currentTrajectory: number; // projected monthly CO2 based on recent logs
    targetGoal: number;        // target monthly CO2 under goal pct
    status: 'on_track' | 'off_track' | 'needs_attention';
  };
}

export function generateAIInsights(
  baseline: CarbonInputs & { monthly_co2: number },
  recentLogs: ActivityLog[],
  targetReductionPct: number
): AIInsights {
  const recommendations: Recommendation[] = [];

  // --- 1. TRANSPORT RECOMMENDATIONS ---
  if ((baseline.transport_car || 0) > 300) {
    const carKm = baseline.transport_car;
    const swappedKm = Math.round(carKm * 0.3); // swap 30% of trips
    // car factor: 0.20, bus factor: 0.08. difference: 0.12
    const savings = Math.round(swappedKm * (EMISSION_FACTORS.transport.car - EMISSION_FACTORS.transport.bus));
    recommendations.push({
      id: 'trans_car_bus',
      title: 'Swap Car Commutes for Transit',
      description: `Switching 30% of your car travel (approx. ${swappedKm} km/month) to public bus or train will reduce emissions.`,
      potentialSavings: savings,
      category: 'transport',
      priority: savings >= 30 ? 'high' : 'medium',
      actionable: true
    });
  }

  if ((baseline.transport_flights || 0) > 5000) {
    const flightsKm = baseline.transport_flights;
    const savings = Math.round((flightsKm * 0.15 * EMISSION_FACTORS.transport.flights) / 12); // avoid 15% flight distances
    recommendations.push({
      id: 'trans_flight_reduce',
      title: 'Choose Direct Routes or Video Calls',
      description: `Avoiding 15% of annual air travel distances (e.g. through virtual meetings or train alternatives) saves high-altitude emissions.`,
      potentialSavings: savings,
      category: 'transport',
      priority: savings >= 30 ? 'high' : 'medium',
      actionable: false
    });
  }

  // --- 2. ENERGY RECOMMENDATIONS ---
  if ((baseline.energy_ac || 0) > 20) {
    // 1 hr daily AC reduction = 30 hours per month
    const hoursReduced = 30;
    const savings = Math.round(hoursReduced * EMISSION_FACTORS.energy.ac);
    recommendations.push({
      id: 'energy_ac_timer',
      title: 'Optimize AC Usage with Timers',
      description: 'Reducing AC usage by 1 hour daily can save emissions and lower electricity bills.',
      potentialSavings: savings,
      category: 'energy',
      priority: savings >= 30 ? 'high' : 'medium',
      actionable: true
    });
  }

  if ((baseline.energy_electricity || 0) > 250) {
    const electricity = baseline.energy_electricity;
    const savings = Math.round(electricity * 0.15 * EMISSION_FACTORS.energy.electricity); // 15% savings
    recommendations.push({
      id: 'energy_led_unplug',
      title: 'Transition to LEDs & Smart Strips',
      description: 'Transitioning to energy-efficient LED lighting and disabling phantom power on appliances can cut household power draw by 15%.',
      potentialSavings: savings,
      category: 'energy',
      priority: savings >= 30 ? 'high' : 'medium',
      actionable: true
    });
  }

  // --- 3. FOOD RECOMMENDATIONS ---
  if (baseline.food_diet === 'meat_heavy') {
    const savings = Math.round(EMISSION_FACTORS.food.meat_heavy - EMISSION_FACTORS.food.vegetarian);
    recommendations.push({
      id: 'food_meatless_mon',
      title: 'Shift from Meat-Heavy to Vegetarian',
      description: 'Shifting your primary diet from meat-heavy to vegetarian will eliminate high methane production emissions.',
      potentialSavings: savings,
      category: 'food',
      priority: 'high',
      actionable: true
    });
  } else if (baseline.food_diet === 'mixed') {
    const savings = Math.round(EMISSION_FACTORS.food.mixed - EMISSION_FACTORS.food.vegan);
    recommendations.push({
      id: 'food_vegan_swap',
      title: 'Incorporate 100% Plant-Based Days',
      description: 'Transitioning from a mixed diet to vegan meals just 4 days a week can significantly offset high-impact agriculture.',
      potentialSavings: Math.round(savings * (4 / 7)),
      category: 'food',
      priority: 'medium',
      actionable: true
    });
  }

  // --- 4. SHOPPING RECOMMENDATIONS ---
  if ((baseline.shopping_clothing || 0) > 3) {
    const items = baseline.shopping_clothing;
    const savings = Math.round(2 * EMISSION_FACTORS.shopping.clothing); // save 2 items
    recommendations.push({
      id: 'shop_clothing_secondhand',
      title: 'Embrace Secondhand & Vintage Fashion',
      description: 'Reducing new clothes purchases by 2 items monthly and opting for pre-owned or rental garments helps curb fast fashion manufacturing.',
      potentialSavings: savings,
      category: 'shopping',
      priority: savings >= 30 ? 'high' : 'medium',
      actionable: true
    });
  }

  // --- 5. WASTE RECOMMENDATIONS ---
  if (baseline.waste_recycling !== 'always' && (baseline.waste_plastic || 0) > 2) {
    const plastic = baseline.waste_plastic;
    // Difference between 'always' (60%) and 'never' (0%) or 'sometimes' (30%)
    const currentReduction = EMISSION_FACTORS.waste.recyclingReduction[baseline.waste_recycling || 'sometimes'];
    const alwaysReduction = EMISSION_FACTORS.waste.recyclingReduction.always;
    const savings = Math.round(plastic * EMISSION_FACTORS.waste.plastic * (alwaysReduction - currentReduction));

    recommendations.push({
      id: 'waste_sort_recycle',
      title: 'Adopt Rigorous Sorting and Composting',
      description: 'Sorting 100% of paper, glass, and recyclable plastic waste prevents landfill methane release and saves manufacturing raw materials.',
      potentialSavings: savings,
      category: 'waste',
      priority: savings >= 15 ? 'medium' : 'low',
      actionable: true
    });
  }

  // Sort recommendations by potential savings descending
  recommendations.sort((a, b) => b.potentialSavings - a.potentialSavings);

  // --- DOMINANT SOURCES ANALYSIS ---
  const sources: { name: string; value: number }[] = [
    {
      name: 'Transportation',
      value:
        (baseline.transport_car || 0) * EMISSION_FACTORS.transport.car +
        (baseline.transport_ev || 0) * EMISSION_FACTORS.transport.ev +
        (baseline.transport_bus || 0) * EMISSION_FACTORS.transport.bus +
        (baseline.transport_train || 0) * EMISSION_FACTORS.transport.train +
        ((baseline.transport_flights || 0) * EMISSION_FACTORS.transport.flights) / 12
    },
    {
      name: 'Home Energy',
      value:
        (baseline.energy_electricity || 0) * EMISSION_FACTORS.energy.electricity +
        (baseline.energy_ac || 0) * EMISSION_FACTORS.energy.ac +
        (baseline.energy_appliances || 0) * EMISSION_FACTORS.energy.appliances
    },
    { name: 'Dietary Choices', value: EMISSION_FACTORS.food[baseline.food_diet || 'mixed'] },
    {
      name: 'Shopping & Goods',
      value:
        (baseline.shopping_clothing || 0) * EMISSION_FACTORS.shopping.clothing +
        (baseline.shopping_electronics || 0) * EMISSION_FACTORS.shopping.electronics
    },
    {
      name: 'Waste & Plastics',
      value:
        (baseline.waste_plastic || 0) *
        EMISSION_FACTORS.waste.plastic *
        (1 - EMISSION_FACTORS.waste.recyclingReduction[baseline.waste_recycling || 'sometimes'])
    }
  ];

  // Sort sources descending
  sources.sort((a, b) => b.value - a.value);
  const dominantSources = sources.slice(0, 2).map((s) => s.name);

  // --- TRAJECTORY PROJECTIONS ---
  const baselineMonthly = baseline.monthly_co2;
  const targetGoal = Math.round(baselineMonthly * (1 - targetReductionPct / 100) * 10) / 10;

  // Estimate current projected monthly footprint using recent logs (e.g. from the last 7 days)
  // If user has logs, scale them up to a 30-day period. If not, default to baseline.
  let currentTrajectory = baselineMonthly;
  if (recentLogs && recentLogs.length > 0) {
    const logsCO2Sum = recentLogs.reduce((acc, log) => acc + log.co2_emitted, 0);
    // Find number of unique days logged in recent logs
    const loggedDates = new Set(recentLogs.map((log) => log.date));
    const uniqueDaysCount = Math.max(1, loggedDates.size);

    // Project over 30 days
    currentTrajectory = Math.round((logsCO2Sum / uniqueDaysCount) * 30 * 10) / 10;
  }

  // Status check
  let status: AIInsights['projections']['status'] = 'on_track';
  if (currentTrajectory > baselineMonthly) {
    status = 'needs_attention';
  } else if (currentTrajectory > targetGoal) {
    status = 'off_track';
  } else {
    status = 'on_track';
  }

  return {
    dominantSources,
    recommendations,
    projections: {
      baseline: baselineMonthly,
      currentTrajectory,
      targetGoal,
      status
    }
  };
}
