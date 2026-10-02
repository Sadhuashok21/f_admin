import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number | string;
  trendDirection?: 'up' | 'down';
  comparisonText?: string;
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendDirection = 'up',
  comparisonText = 'Compared to last 28 days',
  icon
}) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && <div className="stat-icon">{icon}</div>}
      </div>

      <div className="stat-value">
        <span>{typeof value === 'number' ? value.toLocaleString() : value}</span>
        {trend && (
          <span className={`stat-trend ${trendDirection === 'up' ? 'trend-up' : 'trend-down'}`}>
            {trendDirection === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trend}%
          </span>
        )}
      </div>

      {comparisonText && <div className="stat-footer">{comparisonText}</div>}
    </div>
  );
};
