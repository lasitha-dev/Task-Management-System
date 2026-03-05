import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WeeklyChart = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-3">
            <div className="w-8 h-8 border-4 border-dark-border border-t-primary rounded-full mx-auto"></div>
          </div>
          <p className="text-dark-border">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 h-80 flex items-center justify-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  // Ensure chartData is always an array
  const chartData = (Array.isArray(data) && data.length > 0) ? data : [
    { day: 'Mon', completed: 0 },
    { day: 'Tue', completed: 0 },
    { day: 'Wed', completed: 0 },
    { day: 'Thu', completed: 0 },
    { day: 'Fri', completed: 0 },
    { day: 'Sat', completed: 0 },
    { day: 'Sun', completed: 0 }
  ];

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 col-span-1 lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Tasks Completed per Day</h3>
        <button className="text-dark-border hover:text-primary transition">⋮</button>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            labelStyle={{ color: '#ffffff' }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCompleted)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
