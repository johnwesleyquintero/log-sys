import React from 'react';
import { DataSource } from '../types';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface DataSourceBadgeProps {
  source?: DataSource | null;
  size?: 'sm' | 'xs';
  showIcon?: boolean;
  className?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  source,
  size = 'xs',
  showIcon = true,
  className = '',
}) => {
  // "If we haven't collected it yet, leave it blank."
  if (!source || source === '') {
    return null;
  }

  const isHA = source === 'HA data';
  const isDemo = source === 'demo data';

  if (!isHA && !isDemo) {
    return null;
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-1.5 py-0.5 text-[10px]';

  if (isHA) {
    return (
      <span
        title="HA data: Provided directly by Hungry Artisan operations"
        className={`inline-flex items-center gap-1 font-medium rounded border border-emerald-500/40 bg-emerald-950/70 text-emerald-300 tracking-wide ${paddingClass} ${className}`}
      >
        {showIcon && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
        <span>HA data</span>
      </span>
    );
  }

  return (
    <span
      title="demo data: Invented for demonstration & market benchmark simulations"
      className={`inline-flex items-center gap-1 font-medium rounded border border-purple-500/40 bg-purple-950/60 text-purple-300 tracking-wide ${paddingClass} ${className}`}
    >
      {showIcon && <Sparkles className="w-2.5 h-2.5 text-purple-400 shrink-0" />}
      <span>demo data</span>
    </span>
  );
};
