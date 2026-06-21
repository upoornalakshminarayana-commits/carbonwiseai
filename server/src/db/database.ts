import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(__dirname, '../../carbonwise.db');

// Ensure db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
  }
});

// Helper wrapper for async database operations
export const dbRun = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const dbAll = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};

export const dbGet = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
};

export async function initDatabase() {
  // Create tables
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      persona TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS footprint_baselines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      transport_car REAL DEFAULT 0,
      transport_ev REAL DEFAULT 0,
      transport_bus REAL DEFAULT 0,
      transport_train REAL DEFAULT 0,
      transport_flights REAL DEFAULT 0,
      transport_walk_bike REAL DEFAULT 0,
      energy_electricity REAL DEFAULT 0,
      energy_ac REAL DEFAULT 0,
      energy_appliances REAL DEFAULT 0,
      food_diet TEXT DEFAULT 'mixed',
      shopping_clothing REAL DEFAULT 0,
      shopping_electronics REAL DEFAULT 0,
      waste_plastic REAL DEFAULT 0,
      waste_recycling TEXT DEFAULT 'sometimes',
      monthly_co2 REAL DEFAULT 0,
      yearly_co2 REAL DEFAULT 0,
      category_score TEXT DEFAULT 'average',
      sustainability_score INTEGER DEFAULT 50,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      amount REAL NOT NULL,
      co2_emitted REAL NOT NULL,
      points_earned INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      target_reduction_pct INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      start_date TEXT NOT NULL,
      target_monthly_co2 REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Seed data if database is empty
  const userCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if (userCount && userCount.count === 0) {
    console.log('Database empty. Seeding carbon personas...');
    await seedPersonas();
  }
}

async function seedPersonas() {
  // 1. Anya - The Eco Student
  const anya = await dbRun(
    'INSERT INTO users (username, name, avatar, persona, points, level) VALUES (?, ?, ?, ?, ?, ?)',
    ['anya_eco', 'Anya Patel', 'https://api.dicebear.com/7.x/avataaars/svg?seed=anya', 'student', 840, 3]
  );
  await dbRun(
    `INSERT INTO footprint_baselines 
    (user_id, transport_car, transport_ev, transport_bus, transport_train, transport_flights, transport_walk_bike, energy_electricity, energy_ac, energy_appliances, food_diet, shopping_clothing, shopping_electronics, waste_plastic, waste_recycling, monthly_co2, yearly_co2, category_score, sustainability_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [anya.id, 0, 0, 80, 50, 0, 100, 120, 10, 10, 'vegan', 1, 0.1, 2, 'always', 145.2, 1742.4, 'excellent', 88]
  );
  await dbRun(
    'INSERT INTO goals (user_id, target_reduction_pct, start_date, target_monthly_co2) VALUES (?, ?, ?, ?)',
    [anya.id, 10, '2026-05-20', 130.68]
  );
  await dbRun('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)', [anya.id, 'eco_starter']);
  await dbRun('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)', [anya.id, 'green_explorer']);
  await dbRun('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)', [anya.id, 'sustainability_hero']);

  // 2. Marcus - The Busy Professional
  const marcus = await dbRun(
    'INSERT INTO users (username, name, avatar, persona, points, level) VALUES (?, ?, ?, ?, ?, ?)',
    ['marcus_pro', 'Marcus Vance', 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', 'professional', 120, 1]
  );
  await dbRun(
    `INSERT INTO footprint_baselines 
    (user_id, transport_car, transport_ev, transport_bus, transport_train, transport_flights, transport_walk_bike, energy_electricity, energy_ac, energy_appliances, food_diet, shopping_clothing, shopping_electronics, waste_plastic, waste_recycling, monthly_co2, yearly_co2, category_score, sustainability_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [marcus.id, 1200, 0, 0, 0, 1500, 10, 480, 90, 40, 'meat_heavy', 8, 1.2, 12, 'never', 980.5, 11766.0, 'critical', 25]
  );
  await dbRun(
    'INSERT INTO goals (user_id, target_reduction_pct, start_date, target_monthly_co2) VALUES (?, ?, ?, ?)',
    [marcus.id, 30, '2026-06-01', 686.35]
  );
  await dbRun('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)', [marcus.id, 'eco_starter']);

  // 3. The Miller Family - Suburban Household
  const millers = await dbRun(
    'INSERT INTO users (username, name, avatar, persona, points, level) VALUES (?, ?, ?, ?, ?, ?)',
    ['millers_fam', 'The Miller Family', 'https://api.dicebear.com/7.x/avataaars/svg?seed=millers', 'family', 450, 2]
  );
  await dbRun(
    `INSERT INTO footprint_baselines 
    (user_id, transport_car, transport_ev, transport_bus, transport_train, transport_flights, transport_walk_bike, energy_electricity, energy_ac, energy_appliances, food_diet, shopping_clothing, shopping_electronics, waste_plastic, waste_recycling, monthly_co2, yearly_co2, category_score, sustainability_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [millers.id, 600, 400, 20, 10, 300, 30, 650, 45, 60, 'mixed', 4, 0.4, 8, 'sometimes', 525.8, 6309.6, 'average', 58]
  );
  await dbRun(
    'INSERT INTO goals (user_id, target_reduction_pct, start_date, target_monthly_co2) VALUES (?, ?, ?, ?)',
    [millers.id, 20, '2026-06-05', 420.64]
  );
  await dbRun('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)', [millers.id, 'eco_starter']);
  await dbRun('INSERT OR IGNORE INTO achievements (user_id, badge_id) VALUES (?, ?)', [millers.id, 'green_explorer']);

  // Seed 4 weeks of historical daily logs for the personas
  const categories = ['transport', 'energy', 'food', 'shopping', 'waste'];
  const today = new Date('2026-06-17'); // Keep anchored to local time standard

  // Helper to subtract days
  const subDays = (d: Date, days: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() - days);
    return res.toISOString().split('T')[0];
  };

  for (let i = 28; i >= 0; i--) {
    const dateStr = subDays(today, i);

    // Seed Anya's daily logs (Low impact, high points)
    await dbRun(
      `INSERT INTO activity_logs (user_id, date, category, activity_type, amount, co2_emitted, points_earned) VALUES
      (?, ?, 'transport', 'bus', 4, ?, 15),
      (?, ?, 'food', 'meal_vegan', 3, ?, 30),
      (?, ?, 'energy', 'electricity', 4, ?, 10),
      (?, ?, 'waste', 'recycle_action', 1, 0, 20)`,
      [anya.id, dateStr, 4 * 0.08, anya.id, dateStr, 3 * 0.7, anya.id, dateStr, 4 * 0.38, anya.id, dateStr]
    );

    // Seed Marcus's daily logs (High impact, low points)
    // Sometimes logs a flight or shopping item
    let marcusTransportType = 'car';
    let marcusTransportAmount = 40;
    let marcusCO2 = 40 * 0.20;
    let marcusPoints = 5;
    
    // Add extra items on weekends
    const dayOfWeek = new Date(dateStr).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    await dbRun(
      `INSERT INTO activity_logs (user_id, date, category, activity_type, amount, co2_emitted, points_earned) VALUES
      (?, ?, 'transport', ?, ?, ?, ?),
      (?, ?, 'food', 'meal_meat_heavy', 3, ?, 0),
      (?, ?, 'energy', 'ac', 6, ?, 5)`,
      [marcus.id, dateStr, marcusTransportType, marcusTransportAmount, marcusCO2, marcusPoints, marcus.id, dateStr, 3 * 2.5, marcus.id, dateStr, 6 * 0.3]
    );

    if (isWeekend && i % 7 === 0) {
      await dbRun(
        `INSERT INTO activity_logs (user_id, date, category, activity_type, amount, co2_emitted, points_earned) VALUES
        (?, ?, 'shopping', 'clothing', 2, ?, 5)`,
        [marcus.id, dateStr, 2 * 15]
      );
    }

    // Seed Millers family daily logs (Medium impact)
    await dbRun(
      `INSERT INTO activity_logs (user_id, date, category, activity_type, amount, co2_emitted, points_earned) VALUES
      (?, ?, 'transport', 'car', 15, ?, 5),
      (?, ?, 'transport', 'ev', 10, ?, 15),
      (?, ?, 'food', 'meal_mixed', 3, ?, 10),
      (?, ?, 'energy', 'electricity', 20, ?, 10)`,
      [millers.id, dateStr, 15 * 0.20, millers.id, dateStr, 10 * 0.05, millers.id, dateStr, 3 * 1.5, millers.id, dateStr, 20 * 0.38]
    );

    if (i % 3 === 0) {
      await dbRun(
        `INSERT INTO activity_logs (user_id, date, category, activity_type, amount, co2_emitted, points_earned) VALUES
        (?, ?, 'waste', 'recycle_action', 1, 0, 20)`,
        [millers.id, dateStr]
      );
    }
  }

  console.log('CarbonWise AI Persona Data seeded successfully.');
}
