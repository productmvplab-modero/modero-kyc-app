import React, { useState } from 'react';
import { Banknote, Building2, CheckCircle2, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StepCard from './StepCard';

export default function Step6Financial({ formData, updateForm, onNext, onBack }) {
  const [loading, setLoading] = useState(false);
  const [connectingBank, setConnectingBank] = useState(false);

  const income = parseFloat(formData.monthly_income) || 0;
  // Assume rent is roughly monthly_rent from URL params (not available here, use generic guidance)
  const canContinue = income > 0;

  const handleBankConnect = () => {
    setConnectingBank(true);
    setTimeout(() => {
      updateForm({ bank_account_connected: true, bank_verification_status: 'verified' });
      setConnectingBank(false);
    }, 2000);
  };

  return (
    <StepCard
      icon={Banknote}
      title="Financial Information"
      subtitle="Provide your income details for the qualification assessment"
      onNext={async () => { setLoading(true); await onNext(); setLoading(false); }}
      onBack={onBack}
      nextDisabled={!canContinue}
      loading={loading}
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly Net Income (€) *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">€</span>
          <Input
            type="number"
            min={0}
            className="pl-8"
            placeholder="e.g. 2500"
            value={formData.monthly_income}
            onChange={e => updateForm({ monthly_income: e.target.value })}
          />
        </div>
        {income > 0 && (
          <p className="text-xs text-slate-500 mt-1">Annual: €{(income * 12).toLocaleString()}</p>
        )}
      </div>

      {/* Income ratio indicator */}
      {income > 0 && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">Income Assessment</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Your monthly income</span>
              <span className="font-semibold text-slate-800">€{income.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Recommended max rent (40%)</span>
              <span className="font-semibold text-orange-600">€{(income * 0.4).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bank Connect */}
      <div className={`rounded-xl border-2 p-4 transition-all ${formData.bank_account_connected ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${formData.bank_account_connected ? 'bg-green-100' : 'bg-blue-50'}`}>
            <Building2 className={`w-5 h-5 ${formData.bank_account_connected ? 'text-green-600' : 'text-blue-500'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-sm font-semibold text-slate-800">Connect Bank Account</span>
                <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>
                <p className="text-xs text-slate-500 mt-0.5">Automatically verify your income via PSD2 — speeds up approval</p>
              </div>
              {formData.bank_account_connected ? (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              ) : (
                <button type="button" onClick={handleBankConnect} disabled={connectingBank}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 shrink-0">
                  {connectingBank ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Building2 className="w-3 h-3" />}
                  {connectingBank ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </StepCard>
  );
}