import React from 'react';

export default function QualificationProgress({ currentStep, totalSteps, t }) {
  const pct = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);
  const stepKeys = ['step_profile','step_personal','step_employment','step_documents','step_verification','step_financial','step_credit','step_complete'];
  const label = t(stepKeys[currentStep - 1]) || stepKeys[currentStep - 1];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">
          {t('step_of')} {currentStep} {t('of')} {totalSteps - 1}: {label}
        </span>
        <span className="text-sm font-bold text-orange-500">{pct}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-3 overflow-x-auto gap-1">
        {stepKeys.slice(0, totalSteps - 1).map((key, i) => (
          <div key={i} className="flex flex-col items-center flex-shrink-0">
            <div className={`h-2 w-2 rounded-full ${i + 1 < currentStep ? 'bg-orange-500' : i + 1 === currentStep ? 'bg-orange-400 ring-2 ring-orange-200' : 'bg-slate-200'}`} />
            <span className={`text-[9px] mt-1 font-medium hidden sm:block ${i + 1 <= currentStep ? 'text-orange-500' : 'text-slate-300'}`}>{t(key)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}