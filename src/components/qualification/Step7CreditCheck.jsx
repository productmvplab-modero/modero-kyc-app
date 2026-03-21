import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import StepCard from './StepCard';

const FINANCING_OPTIONS = [
  { key: 'klarna', label: 'Klarna', icon: '🟢', color: 'border-green-300 bg-green-50', desc1: 'Buy now, pay later', desc2: 'Flexible instalments' },
  { key: 'santander', label: 'Santander', icon: '🔴', color: 'border-red-200 bg-red-50', desc1: 'Personal financing', desc2: 'Competitive rates' },
];

export default function Step7CreditCheck({ formData, updateForm, onNext, onBack }) {
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [creditScore, setCreditScore] = useState(null);

  const runCreditCheck = () => {
    setRunning(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 30) + 65; // 65–95
      setCreditScore(score);
      updateForm({ credit_check_status: 'approved', credit_score: score });
      setRunning(false);
    }, 2500);
  };

  const toggleFinancing = (key) => {
    const current = formData.financing_options || [];
    if (current.includes(key)) {
      updateForm({ financing_options: current.filter(k => k !== key) });
    } else {
      updateForm({ financing_options: [...current, key] });
    }
  };

  const scoreColor = creditScore >= 80 ? 'text-green-600' : creditScore >= 65 ? 'text-amber-600' : 'text-red-600';
  const scoreLabel = creditScore >= 80 ? 'Excellent' : creditScore >= 65 ? 'Good' : 'Needs Improvement';

  return (
    <StepCard
      icon={CreditCard}
      title="Credit Check & Financing"
      subtitle="Final financial assessment — this step is required for qualification"
      onNext={async () => { setLoading(true); await onNext({ status: 'qualified', modero_score: creditScore || 70 }); setLoading(false); }}
      onBack={onBack}
      nextDisabled={formData.credit_check_status === 'pending'}
      loading={loading}
      nextLabel="Submit Application"
    >
      {/* Credit Check */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Dun & Bradstreet Credit Check</p>
            <p className="text-xs text-slate-500">Authoritative credit risk assessment</p>
          </div>
        </div>

        {formData.credit_check_status === 'approved' && creditScore ? (
          <div className="text-center py-4">
            <div className={`text-5xl font-bold ${scoreColor} mb-1`}>{creditScore}</div>
            <div className={`text-sm font-semibold ${scoreColor}`}>{scoreLabel}</div>
            <div className="text-xs text-slate-500 mt-1">out of 100</div>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all duration-1000 ${creditScore >= 80 ? 'bg-green-500' : creditScore >= 65 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${creditScore}%` }} />
            </div>
            <div className="flex items-center justify-center gap-1 mt-3 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Credit check completed</span>
            </div>
          </div>
        ) : (
          <button type="button" onClick={runCreditCheck} disabled={running}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70">
            {running ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running assessment...</>
            ) : (
              <><Zap className="w-4 h-4" /> Run Credit Check</>
            )}
          </button>
        )}
      </div>

      {/* Financing Options */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-1">Financing Options (Optional)</p>
        <p className="text-xs text-slate-400 mb-3">Select any financing options you'd like to explore for your rental</p>
        <div className="grid grid-cols-2 gap-3">
          {FINANCING_OPTIONS.map(opt => {
            const selected = (formData.financing_options || []).includes(opt.key);
            return (
              <button key={opt.key} type="button" onClick={() => toggleFinancing(opt.key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${selected ? opt.color : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <div className="text-2xl mb-2">{opt.icon}</div>
                <div className="text-sm font-bold text-slate-800">{opt.label}</div>
                <div className="text-xs text-slate-500 mt-1">{opt.desc1}</div>
                <div className="text-xs text-slate-400">{opt.desc2}</div>
                {selected && <div className="mt-2"><CheckCircle2 className="w-4 h-4 text-green-500" /></div>}
              </button>
            );
          })}
        </div>
      </div>
    </StepCard>
  );
}