import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StepCard from './StepCard';

const EMPLOYMENT_OPTIONS = [
  { value: 'employed', label: '👔 Employed', desc: 'Working for a company' },
  { value: 'self_employed', label: '💼 Self-Employed', desc: 'Running your own business' },
  { value: 'student', label: '🎓 Student', desc: 'Currently studying' },
  { value: 'retired', label: '🏖️ Retired', desc: 'Receiving pension' },
  { value: 'unemployed', label: '🔍 Unemployed', desc: 'Looking for work' },
];

export default function Step3Employment({ formData, updateForm, onNext, onBack }) {
  const [loading, setLoading] = useState(false);
  const canContinue = !!formData.employment_status;

  return (
    <StepCard
      icon={Briefcase}
      title="Employment & Living"
      subtitle="Help us understand your work situation and living needs"
      onNext={async () => { setLoading(true); await onNext(); setLoading(false); }}
      onBack={onBack}
      nextDisabled={!canContinue}
      loading={loading}
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Employment Status *</label>
        <div className="space-y-2">
          {EMPLOYMENT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateForm({ employment_status: opt.value })}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${formData.employment_status === opt.value ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-200 bg-white'}`}
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{opt.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${formData.employment_status === opt.value ? 'border-orange-500' : 'border-slate-300'}`}>
                {formData.employment_status === opt.value && <div className="h-2 w-2 rounded-full bg-orange-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {(formData.employment_status === 'employed' || formData.employment_status === 'self_employed') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Company / Business Name</label>
          <Input value={formData.company_name} onChange={e => updateForm({ company_name: e.target.value })} placeholder="e.g. Acme Corp" />
        </div>
      )}

      <div className="border-t border-slate-100 pt-4">
        <label className="block text-sm font-medium text-slate-700 mb-3">Number of Occupants</label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => updateForm({ number_of_occupants: Math.max(1, (formData.number_of_occupants || 1) - 1) })}
            className="h-9 w-9 rounded-full border-2 border-slate-200 flex items-center justify-center text-lg font-bold hover:border-orange-400 transition-colors">−</button>
          <span className="text-xl font-bold text-slate-800 w-8 text-center">{formData.number_of_occupants || 1}</span>
          <button type="button" onClick={() => updateForm({ number_of_occupants: Math.min(10, (formData.number_of_occupants || 1) + 1) })}
            className="h-9 w-9 rounded-full border-2 border-slate-200 flex items-center justify-center text-lg font-bold hover:border-orange-400 transition-colors">+</button>
          <span className="text-sm text-slate-500">person{(formData.number_of_occupants || 1) !== 1 ? 's' : ''} will live in the apartment</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <label className="block text-sm font-medium text-slate-700 mb-3">Do you have pets?</label>
        <div className="flex gap-3">
          {[{ val: false, label: '🚫 No pets' }, { val: true, label: '🐾 Yes, I have pets' }].map(opt => (
            <button key={String(opt.val)} type="button"
              onClick={() => updateForm({ has_pets: opt.val })}
              className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${formData.has_pets === opt.val ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 hover:border-orange-200 text-slate-600'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {formData.has_pets && (
          <div className="mt-3">
            <Input value={formData.pet_details} onChange={e => updateForm({ pet_details: e.target.value })} placeholder="Describe your pet(s) — type, breed, size..." />
          </div>
        )}
      </div>
    </StepCard>
  );
}