import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StepCard from './StepCard';

export default function Step3Employment({ formData, updateForm, onNext, onBack, t }) {
  const [loading, setLoading] = useState(false);
  const canContinue = !!formData.employment_status;

  const employmentOptions = [
    { value: 'employed', label: t('s3_employed'), desc: t('s3_employed_desc') },
    { value: 'self_employed', label: t('s3_self_employed'), desc: t('s3_self_employed_desc') },
    { value: 'student', label: t('s3_student'), desc: t('s3_student_desc') },
    { value: 'retired', label: t('s3_retired'), desc: t('s3_retired_desc') },
    { value: 'unemployed', label: t('s3_unemployed'), desc: t('s3_unemployed_desc') },
  ];

  const occupants = formData.number_of_occupants || 1;

  return (
    <StepCard
      icon={Briefcase}
      title={t('s3_title')}
      subtitle={t('s3_subtitle')}
      onNext={async () => { setLoading(true); await onNext(); setLoading(false); }}
      onBack={onBack}
      nextDisabled={!canContinue}
      loading={loading}
      t={t}
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">{t('s3_emp_label')}</label>
        <div className="space-y-2">
          {employmentOptions.map(opt => (
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
          <label className="block text-sm font-medium text-slate-700 mb-1.5">{t('s3_company')}</label>
          <Input value={formData.company_name} onChange={e => updateForm({ company_name: e.target.value })} placeholder={t('s3_company_ph')} />
        </div>
      )}

      <div className="border-t border-slate-100 pt-4">
        <label className="block text-sm font-medium text-slate-700 mb-3">{t('s3_occupants')}</label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => updateForm({ number_of_occupants: Math.max(1, occupants - 1) })}
            className="h-9 w-9 rounded-full border-2 border-slate-200 flex items-center justify-center text-lg font-bold hover:border-orange-400 transition-colors">−</button>
          <span className="text-xl font-bold text-slate-800 w-8 text-center">{occupants}</span>
          <button type="button" onClick={() => updateForm({ number_of_occupants: Math.min(10, occupants + 1) })}
            className="h-9 w-9 rounded-full border-2 border-slate-200 flex items-center justify-center text-lg font-bold hover:border-orange-400 transition-colors">+</button>
          <span className="text-sm text-slate-500">{occupants !== 1 ? t('s3_persons') : t('s3_person')} {t('s3_will_live')}</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <label className="block text-sm font-medium text-slate-700 mb-3">{t('s3_pets')}</label>
        <div className="flex gap-3">
          {[{ val: false, label: t('s3_no_pets') }, { val: true, label: t('s3_yes_pets') }].map(opt => (
            <button key={String(opt.val)} type="button"
              onClick={() => updateForm({ has_pets: opt.val })}
              className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${formData.has_pets === opt.val ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 hover:border-orange-200 text-slate-600'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {formData.has_pets && (
          <div className="mt-3">
            <Input value={formData.pet_details} onChange={e => updateForm({ pet_details: e.target.value })} placeholder={t('s3_pets_ph')} />
          </div>
        )}
      </div>
    </StepCard>
  );
}