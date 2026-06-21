import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface CO2ChartProps {
  type: 'projection' | 'category';
  projectionData?: {
    baseline: number;
    currentTrajectory: number;
    targetGoal: number;
  };
  categoryData?: {
    name: string;
    value: number;
    color: string;
  }[];
}

export const CO2Chart: React.FC<CO2ChartProps> = ({ type, projectionData, categoryData }) => {
  if (type === 'projection' && projectionData) {
    const data = [
      {
        name: 'Baseline',
        value: projectionData.baseline,
        description: 'Estimated standard footprint',
      },
      {
        name: 'Current Trajectory',
        value: projectionData.currentTrajectory,
        description: 'Based on last 7 days of logs',
      },
      {
        name: 'Target Goal',
        value: projectionData.targetGoal,
        description: 'Your target reduction goal',
      },
    ];

    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 15, 30, 0.95)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: any) => [`${value} kg CO₂/mo`, 'Emissions']}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              <Cell fill="var(--color-accent)" />
              <Cell fill={projectionData.currentTrajectory <= projectionData.targetGoal ? 'var(--color-primary)' : 'var(--color-critical)'} />
              <Cell fill="var(--color-secondary)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'category' && categoryData) {
    return (
      <div style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 15, 30, 0.95)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: any) => [`${value} kg CO₂/mo`, 'Emissions']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
          {categoryData.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
