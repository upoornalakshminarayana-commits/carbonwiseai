export interface User {
  id: number;
  username: string;
  name: string;
  avatar: string;
  persona: string;
  points: number;
  level: number;
  created_at?: string;
}

export interface FootprintBaseline {
  id?: number;
  user_id?: number;
  transport_car: number;
  transport_ev: number;
  transport_bus: number;
  transport_train: number;
  transport_flights: number;
  transport_walk_bike: number;
  energy_electricity: number;
  energy_ac: number;
  energy_appliances: number;
  food_diet: 'vegan' | 'vegetarian' | 'mixed' | 'meat_heavy';
  shopping_clothing: number;
  shopping_electronics: number;
  waste_plastic: number;
  waste_recycling: 'never' | 'sometimes' | 'always';
  monthly_co2: number;
  yearly_co2: number;
  category_score: 'excellent' | 'good' | 'average' | 'high' | 'critical';
  sustainability_score: number;
  updated_at?: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  date: string;
  category: string;
  activity_type: string;
  amount: number;
  co2_emitted: number;
  points_earned: number;
  created_at?: string;
}

export interface Goal {
  id?: number;
  user_id?: number;
  target_reduction_pct: number;
  status: 'none' | 'active' | 'completed';
  start_date: string;
  target_monthly_co2: number;
  created_at?: string;
}

export interface Achievement {
  id: number;
  user_id: number;
  badge_id: string;
  earned_at: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export interface AIInsights {
  dominantSources: string[];
  recommendations: Recommendation[];
  projections: {
    baseline: number;
    currentTrajectory: number;
    targetGoal: number;
    status: 'on_track' | 'off_track' | 'needs_attention';
  };
}
