import React from 'react';
import { CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-slate-100 text-slate-600',  icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700',    icon: RefreshCw },
  verified:    { label: 'Verified',    color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  completed:   { label: 'Verified',    color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  rejected:    { label: 'Rejected',    color: 'bg-red-100 text-red-700',      icon: XCircle },
  failed:      { label: 'Failed',      color: 'bg-red-100 text-red-700',      icon: XCircle },
};

export default function VerificationStatusBadge({ status = 'pending' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const showIcon = status !== 'pending';
  return (
    <span className={['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', cfg.color].join(' ')}>
      {showIcon && <Icon className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}