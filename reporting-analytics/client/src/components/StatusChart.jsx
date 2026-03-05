import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

export const StatusChart = ({ data, loading }) => {
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

  const chartData = data && Array.isArray(data) ? data : [
    { name: 'Completed', value: 65, color: '#3b82f6' },
    { name: 'In Progress', value: 20, color: '#60a5fa' },
    { name: 'Pending', value: 15, color: '#1e40af' }
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 col-span-1">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Task Status</h3>
        <button className="text-dark-border hover:text-primary transition">⋮</button>
      </div>

      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="text-center -mt-12 mb-4">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-dark-border uppercase tracking-wider">TOTAL</p>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-dark-border">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-white">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusChart;
