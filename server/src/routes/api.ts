import { Router, Request, Response, NextFunction } from 'express';
import { dbRun, dbAll, dbGet } from '../db/database';
import { calculateCarbonFootprint, calculateActivityCO2AndPoints } from '../services/carbonCalculator';
import { generateAIInsights } from '../services/aiRecommendationEngine';

const router = Router();

// Wrap async handlers to catch errors
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 1. GET /api/users - Get all seeded users/personas
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const users = await dbAll('SELECT * FROM users ORDER BY id ASC');
  res.json(users);
}));

// 2. GET /api/users/:id - Get specific user details
router.get('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
}));

// 3. POST /api/users - Create a new user (custom persona)
router.post('/users', asyncHandler(async (req: Request, res: Response) => {
  console.log(req.body);
  const { name, username, avatar } = req.body;
  if (!name || !username) {
    const errRes = { error: 'Name and Username are required' };
    console.log(errRes);
    return res.status(400).json(errRes);
  }

  try {
    const avatarUrl = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    const result = await dbRun(
      'INSERT INTO users (username, name, avatar, persona, points, level) VALUES (?, ?, ?, ?, ?, ?)',
      [username, name, avatarUrl, 'custom', 0, 1]
    );
    const newUser = await dbGet('SELECT * FROM users WHERE id = ?', [result.id]);
    
    const responseData = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username
    };
    
    console.log(responseData);
    res.status(201).json(responseData);
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      const errRes = { error: 'Username is already taken' };
      console.log(errRes);
      return res.status(400).json(errRes);
    }
    throw err;
  }
}));

// 4. GET /api/users/:id/baseline - Fetch carbon footprint baseline
router.get('/users/:id/baseline', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const baseline = await dbGet('SELECT * FROM footprint_baselines WHERE user_id = ?', [id]);
  if (!baseline) {
    return res.status(404).json({ error: 'No baseline calculator footprint found for this user.' });
  }
  res.json(baseline);
}));

// 5. POST /api/users/:id/baseline - Upsert carbon footprint baseline
router.post('/users/:id/baseline', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const inputs = {
    transport_car: parseFloat(req.body.transport_car) || 0,
    transport_ev: parseFloat(req.body.transport_ev) || 0,
    transport_bus: parseFloat(req.body.transport_bus) || 0,
    transport_train: parseFloat(req.body.transport_train) || 0,
    transport_flights: parseFloat(req.body.transport_flights) || 0,
    transport_walk_bike: parseFloat(req.body.transport_walk_bike) || 0,
    energy_electricity: parseFloat(req.body.energy_electricity) || 0,
    energy_ac: parseFloat(req.body.energy_ac) || 0,
    energy_appliances: parseFloat(req.body.energy_appliances) || 0,
    food_diet: req.body.food_diet || 'mixed',
    shopping_clothing: parseFloat(req.body.shopping_clothing) || 0,
    shopping_electronics: parseFloat(req.body.shopping_electronics) || 0,
    waste_plastic: parseFloat(req.body.waste_plastic) || 0,
    waste_recycling: req.body.waste_recycling || 'sometimes',
  };

  const results = calculateCarbonFootprint(inputs);

  // Check if baseline exists
  const existingBaseline = await dbGet('SELECT id FROM footprint_baselines WHERE user_id = ?', [id]);

  if (existingBaseline) {
    await dbRun(
      `UPDATE footprint_baselines SET 
        transport_car = ?, transport_ev = ?, transport_bus = ?, transport_train = ?, transport_flights = ?, transport_walk_bike = ?,
        energy_electricity = ?, energy_ac = ?, energy_appliances = ?, food_diet = ?,
        shopping_clothing = ?, shopping_electronics = ?, waste_plastic = ?, waste_recycling = ?,
        monthly_co2 = ?, yearly_co2 = ?, category_score = ?, sustainability_score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?`,
      [
        inputs.transport_car, inputs.transport_ev, inputs.transport_bus, inputs.transport_train, inputs.transport_flights, inputs.transport_walk_bike,
        inputs.energy_electricity, inputs.energy_ac, inputs.energy_appliances, inputs.food_diet,
        inputs.shopping_clothing, inputs.shopping_electronics, inputs.waste_plastic, inputs.waste_recycling,
        results.monthly_co2, results.yearly_co2, results.category_score, results.sustainability_score,
        id
      ]
    );
  } else {
    await dbRun(
      `INSERT INTO footprint_baselines 
      (user_id, transport_car, transport_ev, transport_bus, transport_train, transport_flights, transport_walk_bike, energy_electricity, energy_ac, energy_appliances, food_diet, shopping_clothing, shopping_electronics, waste_plastic, waste_recycling, monthly_co2, yearly_co2, category_score, sustainability_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        inputs.transport_car, inputs.transport_ev, inputs.transport_bus, inputs.transport_train, inputs.transport_flights, inputs.transport_walk_bike,
        inputs.energy_electricity, inputs.energy_ac, inputs.energy_appliances, inputs.food_diet,
        inputs.shopping_clothing, inputs.shopping_electronics, inputs.waste_plastic, inputs.waste_recycling,
        results.monthly_co2, results.yearly_co2, results.category_score, results.sustainability_score
      ]
    );
  }

  // Award eco_starter badge upon filling out calculator
  await dbRun('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)', [id, 'eco_starter']);

  const updatedBaseline = await dbGet('SELECT * FROM footprint_baselines WHERE user_id = ?', [id]);
  res.json({ message: 'Baseline updated successfully', baseline: updatedBaseline });
}));

// 6. GET /api/users/:id/logs - Fetch user's activity logs
router.get('/users/:id/logs', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { limit } = req.query;

  let query = 'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY date DESC, id DESC';
  const params: any[] = [id];

  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit as string) || 30);
  }

  const logs = await dbAll(query, params);
  res.json(logs);
}));

// 7. POST /api/users/:id/logs - Log a daily activity & earn points
router.post('/users/:id/logs', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, category, activity_type, amount } = req.body;

  if (!date || !category || !activity_type || amount === undefined) {
    return res.status(400).json({ error: 'date, category, activity_type, and amount are required.' });
  }

  const user = await dbGet<{ points: number }>('SELECT points FROM users WHERE id = ?', [id]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const parsedAmount = parseFloat(amount);
  const { co2, points } = calculateActivityCO2AndPoints(category, activity_type, parsedAmount);

  // Insert log
  const logResult = await dbRun(
    `INSERT INTO activity_logs (user_id, date, category, activity_type, amount, co2_emitted, points_earned)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, date, category, activity_type, parsedAmount, co2, points]
  );

  // Update user score/level
  const newPoints = user.points + points;
  const newLevel = Math.floor(newPoints / 200) + 1; // 200 points per level

  await dbRun('UPDATE users SET points = ?, level = ? WHERE id = ?', [newPoints, newLevel, id]);

  // Check achievements logic
  const achievements = await dbAll<{ badge_id: string }>('SELECT badge_id FROM achievements WHERE user_id = ?', [id]);
  const activeBadges = achievements.map(a => a.badge_id);

  const newBadgesEarned: string[] = [];

  // Earn green_explorer at Level 2
  if (newLevel >= 2 && !activeBadges.includes('green_explorer')) {
    await dbRun('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)', [id, 'green_explorer']);
    newBadgesEarned.push('green_explorer');
  }

  // Earn sustainability_hero at Level 3
  if (newLevel >= 3 && !activeBadges.includes('sustainability_hero')) {
    await dbRun('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)', [id, 'sustainability_hero']);
    newBadgesEarned.push('sustainability_hero');
  }

  // Earn carbon_champion at 1000 points
  if (newPoints >= 1000 && !activeBadges.includes('carbon_champion')) {
    await dbRun('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)', [id, 'carbon_champion']);
    newBadgesEarned.push('carbon_champion');
  }

  const newLog = await dbGet('SELECT * FROM activity_logs WHERE id = ?', [logResult.id]);
  const updatedUser = await dbGet('SELECT * FROM users WHERE id = ?', [id]);

  res.status(201).json({
    message: 'Activity logged successfully',
    log: newLog,
    user: updatedUser,
    newBadgesEarned
  });
}));

// 8. DELETE /api/users/:id/logs/:logId - Delete daily activity
router.delete('/users/:id/logs/:logId', asyncHandler(async (req: Request, res: Response) => {
  const { id, logId } = req.params;

  const log = await dbGet<{ co2_emitted: number, points_earned: number }>(
    'SELECT co2_emitted, points_earned FROM activity_logs WHERE id = ? AND user_id = ?',
    [logId, id]
  );

  if (!log) {
    return res.status(404).json({ error: 'Log entry not found' });
  }

  const user = await dbGet<{ points: number }>('SELECT points FROM users WHERE id = ?', [id]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Delete the log
  await dbRun('DELETE FROM activity_logs WHERE id = ?', [logId]);

  // Adjust points/level
  const newPoints = Math.max(0, user.points - log.points_earned);
  const newLevel = Math.floor(newPoints / 200) + 1;

  await dbRun('UPDATE users SET points = ?, level = ? WHERE id = ?', [newPoints, newLevel, id]);

  const updatedUser = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
  res.json({
    message: 'Log entry deleted successfully',
    user: updatedUser
  });
}));

// 9. GET /api/users/:id/insights - Fetch dynamic AI coaching insights and trajectory projections
router.get('/users/:id/insights', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const baseline = await dbGet<any>('SELECT * FROM footprint_baselines WHERE user_id = ?', [id]);
  if (!baseline) {
    return res.status(400).json({ error: 'Please set up your baseline carbon footprint before generating insights.' });
  }

  const goal = await dbGet<{ target_reduction_pct: number }>('SELECT target_reduction_pct FROM goals WHERE user_id = ?', [id]);
  const goalPct = goal ? goal.target_reduction_pct : 10; // Default to 10% target

  // Fetch recent activity logs from the last 7 days to calculate trajectory
  const recentLogs = await dbAll<any>(
    "SELECT * FROM activity_logs WHERE user_id = ? AND date >= date('now', '-7 days') ORDER BY date DESC",
    [id]
  );

  const insights = generateAIInsights(baseline, recentLogs, goalPct);
  res.json(insights);
}));

// 10. GET /api/users/:id/goals - Get user target reduction plans
router.get('/users/:id/goals', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const goal = await dbGet('SELECT * FROM goals WHERE user_id = ?', [id]);
  if (!goal) {
    return res.json({ target_reduction_pct: 0, status: 'none', target_monthly_co2: 0 });
  }
  res.json(goal);
}));

// 11. POST /api/users/:id/goals - Create/Update reduction goals
router.post('/users/:id/goals', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { target_reduction_pct } = req.body;

  if (target_reduction_pct === undefined) {
    return res.status(400).json({ error: 'target_reduction_pct is required' });
  }

  const baseline = await dbGet<{ monthly_co2: number }>('SELECT monthly_co2 FROM footprint_baselines WHERE user_id = ?', [id]);
  if (!baseline) {
    return res.status(400).json({ error: 'Please set up your baseline carbon footprint before setting goals.' });
  }

  const targetMonthly = Math.round(baseline.monthly_co2 * (1 - target_reduction_pct / 100) * 10) / 10;
  const todayStr = new Date().toISOString().split('T')[0];

  const existingGoal = await dbGet('SELECT id FROM goals WHERE user_id = ?', [id]);
  if (existingGoal) {
    await dbRun(
      'UPDATE goals SET target_reduction_pct = ?, target_monthly_co2 = ?, start_date = ? WHERE user_id = ?',
      [target_reduction_pct, targetMonthly, todayStr, id]
    );
  } else {
    await dbRun(
      'INSERT INTO goals (user_id, target_reduction_pct, start_date, target_monthly_co2) VALUES (?, ?, ?, ?)',
      [id, target_reduction_pct, todayStr, targetMonthly]
    );
  }

  const updatedGoal = await dbGet('SELECT * FROM goals WHERE user_id = ?', [id]);
  res.json({ message: 'Goal updated successfully', goal: updatedGoal });
}));

// 12. GET /api/users/:id/achievements - Get user achievements / badges
router.get('/users/:id/achievements', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const achievements = await dbAll('SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_at DESC', [id]);
  res.json(achievements);
}));

export default router;
