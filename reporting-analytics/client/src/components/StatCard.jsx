import React from 'react';

export const StatCard = ({ title, value, percentage, previousValue, icon: Icon, color = 'primary', isLoading = false, error = null }) => {
  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/20 rounded-lg p-6 flex justify-between items-start">
        <div>
          <p className="text-dark-border text-sm font-medium mb-2">{title}</p>
          <p className="text-danger text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 flex justify-between items-start">
        <div>
          <p className="text-dark-border text-sm font-medium mb-2">{title}</p>
          <div className="animate-pulse flex gap-2">
            <div className="h-8 w-20 bg-dark-border rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = percentage >= 0;
  const colorClass = color === 'primary' ? 'bg-gradient-to-br from-primary/20 to-primary-dark/20' : 'bg-dark-surface';
  const displayValue = value !== null && value !== undefined ? value : '--';

  return (
    <div className={`${colorClass} border border-dark-border rounded-lg p-6 flex justify-between items-start`}>
      <div>
        <p className="text-dark-border text-sm font-medium mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-2">{displayValue}</h3>
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
