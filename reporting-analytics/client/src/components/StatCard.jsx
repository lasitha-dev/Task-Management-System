import React from 'react';

export const StatCard = ({ title, value, percentage, previousValue, icon: Icon, color = 'primary' }) => {
  const isPositive = percentage >= 0;
  const colorClass = color === 'primary' ? 'bg-gradient-to-br from-primary/20 to-primary-dark/20' : 'bg-dark-surface';

  return (
    <div className={`${colorClass} border border-dark-border rounded-lg p-6 flex justify-between items-start`}>
      <div>
        <p className="text-dark-border text-sm font-medium mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(percentage)}%
          </span>
          <span className="text-xs text-dark-border">vs. previous period</span>
        </div>
      </div>
      {Icon && (
        <div className="text-primary/20">
          <Icon size={48} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
