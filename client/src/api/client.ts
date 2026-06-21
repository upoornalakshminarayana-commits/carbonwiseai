import { User, FootprintBaseline, ActivityLog, Goal, Achievement, AIInsights } from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData?.error) {
        errMsg = typeof errData.error === 'string' ? errData.error : errData.error.message || errMsg;
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
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
