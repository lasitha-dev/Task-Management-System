import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const StatusChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-3">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full mx-auto"></div>
          </div>
          <p className="text-slate-400">Loading chart...</p>
        </div>
      </div>
    );
  }

  const chartData = data && Array.isArray(data) ? data : [
    { name: 'Completed', count: 65, percentage: 65 },
    { name: 'In Progress', count: 20, percentage: 20 },
    { name: 'Pending', count: 15, percentage: 15 }
  ];

  const total = chartData.reduce((sum, item) => sum + item.count, 0);
  const colors = ['#3b82f6', '#60a5fa', '#1e40af'];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Task Status</h3>
        <button className="text-slate-400 hover:text-white transition"></button>
      </div>

      <div className="flex flex-col items-center relative">
        <div style={{position: 'relative', width: '100%', height: 220}}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text overlay */}
          <div style={{position:'absolute', top:'42%', left:'50%', 
            transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents: 'none'}}>
            <div style={{fontSize:'28px', fontWeight:'bold', color:'white'}}>{total}</div>
            <div style={{fontSize:'11px', color:'#94a3b8', letterSpacing:'1px'}}>TOTAL</div>
          </div>
        </div>

        <div className="text-center mt-2 mb-6">
          {/* Removed duplicate total display */}
        </div>
      </div>

      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[index] }}></div>
              <span className="text-xs text-slate-300 font-medium">{item.name}</span>
            </div>
            <span className="text-xs font-semibold text-white ml-2">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusChart;
