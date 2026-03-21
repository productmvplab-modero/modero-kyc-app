import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function TenantProfileCard({ tenant }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6 space-y-4">
      {/* Header with Status */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{tenant.tenant_name}</h3>
          <p className="text-sm text-slate-600">{tenant.tenant_email}</p>
        </div>
        <div className="flex items-center gap-2">
          {tenant.status === 'qualified' && (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Qualified
            </span>
          )}
        </div>
      </div>

      {/* Score and Key Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {/* Qualification Score */}
        <div className={`border rounded-lg p-3 ${getScoreBg(tenant.qualification_score)}`}>
          <p className="text-xs text-slate-600 mb-1">Score</p>
          <p className={`text-2xl font-bold ${getScoreColor(tenant.qualification_score)}`}>
            {tenant.qualification_score || '-'}
          </p>
        </div>

        {/* Employment */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">Employment</p>
          <p className="font-semibold text-slate-900 capitalize text-sm">{tenant.employment_status || '-'}</p>
        </div>

        {/* Income */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">Monthly Income</p>
          <p className="font-semibold text-slate-900 text-sm">
            €{tenant.monthly_income?.toLocaleString() || '-'}
          </p>
        </div>

        {/* Occupants */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">Occupants</p>
          <p className="font-semibold text-slate-900 text-sm">{tenant.number_of_occupants || '-'}</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div>
          <p className="text-xs text-slate-600 mb-1">Age</p>
          <p className="font-semibold text-slate-900">{tenant.age || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Pets</p>
          <p className="font-semibold text-slate-900">{tenant.has_pets ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Smoker</p>
          <p className="font-semibold text-slate-900">{tenant.is_smoker ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Warnings */}
      {tenant.qualification_score < 60 && (
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