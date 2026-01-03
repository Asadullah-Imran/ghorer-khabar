import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
}

export default function StatCard({ label, value, change, trend, color }: StatProps) {
  return (
    <div className="rounded-xl border border-border-dark bg-surface-dark p-5 shadow-sm">
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-primary' : 'text-red-400'}`}>
        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{change}</span>
      </div>
    </div>
  );
}