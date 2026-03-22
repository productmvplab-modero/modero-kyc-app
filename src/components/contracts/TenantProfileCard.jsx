import React from 'react';
import { CheckCircle2, AlertCircle, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function TenantProfileCard({ tenant }) {
  const score = tenant.qualification_score;

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (s) => {
    if (s >= 80) return 'bg-green-50 border-green-200';
    if (s >= 60) return 'bg-orange-50 border-orange-300';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="border-2 border-orange-200 rounded-xl p-5 bg-orange-50 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-orange-200">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={tenant.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tenant.tenant_name}`} />
            <AvatarFallback className="bg-orange-200 text-orange-700 text-sm font-semibold">
              {tenant.tenant_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-bold text-orange-900">{tenant.tenant_name}</h3>
            <p className="text-sm text-orange-700">{tenant.tenant_email}</p>
          </div>
        </div>
        {tenant.status === 'qualified' && (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Qualified
          </span>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`border rounded-lg p-3 ${getScoreBg(score)}`}>
          <p className="text-xs text-slate-600 mb-1">Score</p>
          <p className={`text-2xl font-bold ${getScoreColor(score)}`}>{score || '-'}</p>
        </div>
        <div className="bg-white border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">Employment</p>
          <p className="font-semibold text-slate-900 capitalize text-sm">{tenant.employment_status?.replace('_', ' ') || '-'}</p>
        </div>
        <div className="bg-white border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">Monthly Income</p>
          <p className="font-semibold text-slate-900 text-sm">
            {tenant.monthly_income ? `€${tenant.monthly_income.toLocaleString()}` : '-'}
          </p>
        </div>
        <div className="bg-white border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">Occupants</p>
          <p className="font-semibold text-slate-900 text-sm">{tenant.number_of_occupants || '-'}</p>
        </div>
      </div>

      {/* Secondary Info */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-orange-100 rounded-lg px-3 py-2">
          <p className="text-xs text-orange-600 font-semibold mb-0.5">Age</p>
          <p className="font-semibold text-slate-800">{tenant.age || '-'}</p>
        </div>
        <div className="bg-white border border-orange-100 rounded-lg px-3 py-2">
          <p className="text-xs text-orange-600 font-semibold mb-0.5">Pets</p>
          <p className="font-semibold text-slate-800">{tenant.has_pets ? 'Yes' : 'No'}</p>
        </div>
        <div className="bg-white border border-orange-100 rounded-lg px-3 py-2">
          <p className="text-xs text-orange-600 font-semibold mb-0.5">Smoker</p>
          <p className="font-semibold text-slate-800">{tenant.is_smoker ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Warning */}
      {score < 60 && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-900">Review Recommended</p>
            <p className="text-xs text-yellow-700">This tenant may need additional verification</p>
          </div>
        </div>
      )}
    </div>
  );
}