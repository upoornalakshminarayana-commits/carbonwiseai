import { User, FootprintBaseline, ActivityLog, Goal, Achievement, AIInsights } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_URL}/api`;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const text = await res.text();
    let data: any;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      throw new Error(`Server returned invalid JSON: ${text}`);
    }

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      if (data && data.error) {
        errMsg = typeof data.error === 'string' ? data.error : data.error.message || errMsg;
      }
      throw new Error(errMsg);
    }

    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const apiClient = {
  // Users
  getUsers: () => fetchJson<User[]>(`${API_BASE}/users`),
  getUser: (id: number) => fetchJson<User>(`${API_BASE}/users/${id}`),
  createUser: (name: string, username: string, avatar?: string) =>
    fetchJson<User>(`${API_BASE}/users`, {
      method: 'POST',
      body: JSON.stringify({ name, username, avatar }),
    }),

  // Baseline
  getBaseline: (userId: number) => fetchJson<FootprintBaseline>(`${API_BASE}/users/${userId}/baseline`),
  updateBaseline: (userId: number, inputs: Partial<FootprintBaseline>) =>
    fetchJson<{ message: string; baseline: FootprintBaseline }>(`${API_BASE}/users/${userId}/baseline`, {
      method: 'POST',
      body: JSON.stringify(inputs),
    }),

  // Activity Logs
  getLogs: (userId: number, limit?: number) => {
    const url = limit ? `${API_BASE}/users/${userId}/logs?limit=${limit}` : `${API_BASE}/users/${userId}/logs`;
    return fetchJson<ActivityLog[]>(url);
  },
  addLog: (userId: number, log: { date: string; category: string; activity_type: string; amount: number }) =>
    fetchJson<{ message: string; log: ActivityLog; user: User; newBadgesEarned: string[] }>(
      `${API_BASE}/users/${userId}/logs`,
      {
        method: 'POST',
        body: JSON.stringify(log),
      }
    ),
  deleteLog: (userId: number, logId: number) =>
    fetchJson<{ message: string; user: User }>(`${API_BASE}/users/${userId}/logs/${logId}`, {
      method: 'DELETE',
    }),

  // Goals
  getGoals: (userId: number) => fetchJson<Goal>(`${API_BASE}/users/${userId}/goals`),
  updateGoal: (userId: number, targetReductionPct: number) =>
    fetchJson<{ message: string; goal: Goal }>(`${API_BASE}/users/${userId}/goals`, {
      method: 'POST',
      body: JSON.stringify({ target_reduction_pct: targetReductionPct }),
    }),

  // Insights
  getInsights: (userId: number) => fetchJson<AIInsights>(`${API_BASE}/users/${userId}/insights`),

  // Achievements / Badges
  getAchievements: (userId: number) => fetchJson<Achievement[]>(`${API_BASE}/users/${userId}/achievements`),
};
