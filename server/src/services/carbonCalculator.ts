export interface CarbonInputs {
  transport_car: number;        // km per month
  transport_ev: number;         // km per month
  transport_bus: number;        // km per month
  transport_train: number;      // km per month
  transport_flights: number;    // km per year (will divide by 12)
  transport_walk_bike: number;  // km per month
  energy_electricity: number;   // kWh per month
  energy_ac: number;            // hours per month
  energy_appliances: number;    // estimated kWh per month
  food_diet: 'vegan' | 'vegetarian' | 'mixed' | 'meat_heavy';
  shopping_clothing: number;    // items purchased per month
  shopping_electronics: number; // items purchased per month
  waste_plastic: number;        // kg per month
  waste_recycling: 'never' | 'sometimes' | 'always';
}

export interface CalculationResult {
  monthly_co2: number;          // kg CO2
  yearly_co2: number;           // kg CO2
  category_score: 'excellent' | 'good' | 'average' | 'high' | 'critical';
  sustainability_score: number; // 0 - 100
}

// Coefficients in kg CO2
export const EMISSION_FACTORS = {
  transport: {
    car: 0.20,         // kg per km
    ev: 0.05,          // kg per km
    bus: 0.08,         // kg per passenger-km
    train: 0.04,        // kg per passenger-km
    flights: 0.12,      // kg per passenger-km (yearly input is divided by 12)
    walk_bike: 0.0
  },
  energy: {
    electricity: 0.38,  // kg per kWh (grid average)
    ac: 0.30,           // kg per hour of usage (approx 0.8kW consumption * grid emissions)
    appliances: 0.38    // kg per kWh
  },
  food: {
    vegan: 60,          // kg per month
    vegetarian: 100,    // kg per month
    mixed: 180,         // kg per month
    meat_heavy: 250     // kg per month
  },
  shopping: {
    clothing: 15.0,     // kg CO2 per clothing item (lifecycle average)
    electronics: 80.0   // kg CO2 per electronic device (lifecycle average)
  },
  waste: {
    plastic: 3.0,       // kg CO2 per kg of plastic
    recyclingReduction: {
      always: 0.60,     // 60% reduction in waste emissions
      sometimes: 0.30,  // 30% reduction
      never: 0.00
    }
  }
};

export function calculateCarbonFootprint(inputs: CarbonInputs): CalculationResult {
  // 1. Transportation emissions (monthly)
  const carCO2 = (inputs.transport_car || 0) * EMISSION_FACTORS.transport.car;
  const evCO2 = (inputs.transport_ev || 0) * EMISSION_FACTORS.transport.ev;
  const busCO2 = (inputs.transport_bus || 0) * EMISSION_FACTORS.transport.bus;
  const trainCO2 = (inputs.transport_train || 0) * EMISSION_FACTORS.transport.train;
  const flightCO2 = ((inputs.transport_flights || 0) * EMISSION_FACTORS.transport.flights) / 12; // convert annual to monthly

  const transportTotal = carCO2 + evCO2 + busCO2 + trainCO2 + flightCO2;

  // 2. Energy emissions (monthly)
  const electricityCO2 = (inputs.energy_electricity || 0) * EMISSION_FACTORS.energy.electricity;
  const acCO2 = (inputs.energy_ac || 0) * EMISSION_FACTORS.energy.ac;
  const appliancesCO2 = (inputs.energy_appliances || 0) * EMISSION_FACTORS.energy.appliances;

  const energyTotal = electricityCO2 + acCO2 + appliancesCO2;

  // 3. Food emissions (monthly)
  const foodTotal = EMISSION_FACTORS.food[inputs.food_diet || 'mixed'];

  // 4. Shopping emissions (monthly)
  const clothingCO2 = (inputs.shopping_clothing || 0) * EMISSION_FACTORS.shopping.clothing;
  const electronicsCO2 = (inputs.shopping_electronics || 0) * EMISSION_FACTORS.shopping.electronics;

  const shoppingTotal = clothingCO2 + electronicsCO2;

  // 5. Waste emissions (monthly)
  const rawWasteCO2 = (inputs.waste_plastic || 0) * EMISSION_FACTORS.waste.plastic;
  const reductionFactor = EMISSION_FACTORS.waste.recyclingReduction[inputs.waste_recycling || 'sometimes'];
  const wasteTotal = rawWasteCO2 * (1 - reductionFactor);

  // Totals
  const monthly_co2 = Math.round((transportTotal + energyTotal + foodTotal + shoppingTotal + wasteTotal) * 10) / 10;
  const yearly_co2 = Math.round(monthly_co2 * 12 * 10) / 10;

  // Carbon Category Score Thresholds (monthly in kg CO2)
  let category_score: CalculationResult['category_score'] = 'average';
  if (monthly_co2 < 200) {
    category_score = 'excellent';
  } else if (monthly_co2 < 350) {
    category_score = 'good';
  } else if (monthly_co2 < 550) {
    category_score = 'average';
  } else if (monthly_co2 < 800) {
    category_score = 'high';
  } else {
    category_score = 'critical';
  }

  // Sustainability Score (0-100 index)
  // 100 corresponds to <= 100 kg CO2 / month, 0 corresponds to >= 1100 kg CO2 / month
  let sustainability_score = Math.round(100 * (1 - Math.max(0, Math.min(1000, monthly_co2 - 100)) / 1000));
  sustainability_score = Math.max(0, Math.min(100, sustainability_score));

  return {
    monthly_co2,
    yearly_co2,
    category_score,
    sustainability_score
  };
}

export function calculateActivityCO2AndPoints(
  category: string,
  activityType: string,
  amount: number
): { co2: number; points: number } {
  let co2 = 0;
  let points = 0;

  switch (category) {
    case 'transport':
      if (activityType === 'car') {
        co2 = amount * EMISSION_FACTORS.transport.car;
        points = 5; // standard log point
      } else if (activityType === 'ev') {
        co2 = amount * EMISSION_FACTORS.transport.ev;
        points = 15; // EV bonus
      } else if (activityType === 'bus') {
        co2 = amount * EMISSION_FACTORS.transport.bus;
        points = 10; // Transit bonus
      } else if (activityType === 'train') {
        co2 = amount * EMISSION_FACTORS.transport.train;
        points = 12; // Transit bonus
      } else if (activityType === 'walk_bike') {
        co2 = 0;
        points = 25; // High green points
      }
      break;

    case 'energy':
      if (activityType === 'electricity') {
        co2 = amount * EMISSION_FACTORS.energy.electricity;
        points = amount < 10 ? 15 : 5; // Bonus for low energy use logs
      } else if (activityType === 'ac') {
        co2 = amount * EMISSION_FACTORS.energy.ac;
        points = amount < 3 ? 15 : 5; // Bonus for low AC use logs
      }
      break;

    case 'food':
      if (activityType === 'meal_vegan') {
        co2 = 2.0; // approx daily vegan emissions
        points = 30; // High plant-based points
      } else if (activityType === 'meal_vegetarian') {
        co2 = 3.3; // approx daily vegetarian emissions
        points = 20;
      } else if (activityType === 'meal_mixed') {
        co2 = 6.0;
        points = 10;
      } else if (activityType === 'meal_meat_heavy') {
        co2 = 8.3;
        points = 0;
      }
      break;

    case 'shopping':
      if (activityType === 'clothing') {
        co2 = amount * EMISSION_FACTORS.shopping.clothing;
        points = 5;
      } else if (activityType === 'electronics') {
        co2 = amount * EMISSION_FACTORS.shopping.electronics;
        points = 2;
      }
      break;

    case 'waste':
      if (activityType === 'recycle_action') {
        co2 = 0; // Recycling action acts as credit
        points = 20; // High points for recycling
      } else if (activityType === 'waste_bag') {
        co2 = amount * EMISSION_FACTORS.waste.plastic; // treat amount as kg of plastic
        points = 5;
      }
      break;
  }

  return {
    co2: Math.round(co2 * 10) / 10,
    points
  };
}
