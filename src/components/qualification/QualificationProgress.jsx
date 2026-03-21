import React from 'react';

const STEP_LABELS = [
  'Profile', 'Personal', 'Employment', 'Documents',
  'Verification', 'Financial', 'Credit', 'Complete'
];

export default function QualificationProgress({ currentStep, totalSteps }) {
  const pct = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">
          Step {currentStep} of {totalSteps - 1}: {STEP_LABELS[currentStep - 1]}
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
        {STEP_LABELS.slice(0, totalSteps - 1).map((label, i) => (
          <div key={i} className="flex flex-col items-center flex-shrink-0">
            <div className={`h-2 w-2 rounded-full ${i + 1 < currentStep ? 'bg-orange-500' : i + 1 === currentStep ? 'bg-orange-400 ring-2 ring-orange-200' : 'bg-slate-200'}`} />
            <span className={`text-[9px] mt-1 font-medium hidden sm:block ${i + 1 <= currentStep ? 'text-orange-500' : 'text-slate-300'}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}