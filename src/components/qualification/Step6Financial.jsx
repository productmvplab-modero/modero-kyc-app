import React, { useState } from 'react';
import { Banknote, Building2, CheckCircle2, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StepCard from './StepCard';
import BankSelectionModal from './BankSelectionModal';
import BankConnectingModal from './BankConnectingModal';

export default function Step6Financial({ formData, updateForm, onNext, onBack, t }) {
  const [loading, setLoading] = useState(false);
  const [showBankSelect, setShowBankSelect] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  const income = parseFloat(formData.monthly_income) || 0;
  const salaryDay = formData.salary_day_of_month || 1;
  const canContinue = income > 0;

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setShowBankSelect(false);
  };

  const handleBankSuccess = (bank) => {
    updateForm({
      bank_account_connected: true,
      bank_verification_status: 'verified',
      connected_bank: bank.name
    });
    setSelectedBank(null);
  };

  return (
    <StepCard
      icon={Banknote}
      title={t('s6_title')}
      subtitle={t('s6_subtitle')}
      onNext={async () => { setLoading(true); await onNext(); setLoading(false); }}
      onBack={onBack}
      nextDisabled={!canContinue}
      loading={loading}
      t={t}
    >
      <div className="grid grid-cols-2 gap-3">
         <div>
           <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('s6_income')}</label>
           <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">€</span>
             <Input
               type="number"
               min={0}
               className="pl-8"
               placeholder="3000"
               value={formData.monthly_income}
               onChange={e => updateForm({ monthly_income: e.target.value })}
             />
           </div>
         </div>
         <div>
           <label className="block text-sm font-medium text-slate-700 mb-1.5">Salary Day of Month</label>
           <Input
             type="number"
             min={1}
             max={31}
             placeholder="1"
             value={salaryDay}
             onChange={e => updateForm({ salary_day_of_month: parseInt(e.target.value) || 1 })}
           />
         </div>
       </div>

      {income > 0 && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">{t('s6_assessment')}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t('s6_your_income')}</span>
              <span className="font-semibold text-slate-800">€{income.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{t('s6_max_rent')}</span>
              <span className="font-semibold text-orange-600">€{(income * 0.4).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800">Connect your bank account</h3>
            <p className="text-xs text-slate-600 mt-0.5">via PSD2 secure open banking</p>
          </div>
        </div>
        <p className="text-xs text-slate-700 mb-3">Choose your bank to connect via PSD2 and verify your income — this will give you a <span className="text-orange-600 font-semibold">better chance to get qualified</span>.</p>
        <div className="flex gap-2 mb-3">
          <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg border border-green-300">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs text-slate-700 font-medium">Encrypted & secure</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg border border-orange-300">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-slate-700 font-medium">Boosts your score</span>
          </div>
        </div>

        {formData.bank_account_connected ? (
          <div className="bg-green-500 text-white rounded-xl p-4 text-center font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Bank Connected — {formData.connected_bank}
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowBankSelect(true)}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all mb-3"
            >
              <Building2 className="w-5 h-5" />
              Connect my bank
            </button>
          </>
        )}

        {formData.bank_account_connected && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Employer', icon: '👤' },
              { label: 'Salary Amount', icon: '€' },
              { label: 'Pay Dates', icon: '📅' },
            ].map((item, idx) => (
              <div key={idx} className="bg-green-100 rounded-lg p-3 text-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-green-700">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBankSelect && <BankSelectionModal onClose={() => setShowBankSelect(false)} onSelect={handleBankSelect} />}
      {selectedBank && <BankConnectingModal bank={selectedBank} onClose={() => setSelectedBank(null)} onSuccess={handleBankSuccess} />}
    </StepCard>
  );
}