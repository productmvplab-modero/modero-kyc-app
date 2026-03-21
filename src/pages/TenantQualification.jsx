import React, { useState, useEffect } from 'react';
import Step1Profile from '@/components/qualification/Step1Profile';
import Step2Personal from '@/components/qualification/Step2Personal';
import Step3Employment from '@/components/qualification/Step3Employment';
import Step4Documents from '@/components/qualification/Step4Documents';
import Step5IdVerification from '@/components/qualification/Step5IdVerification';
import Step6Financial from '@/components/qualification/Step6Financial';
import Step7CreditCheck from '@/components/qualification/Step7CreditCheck';
import Step8Complete from '@/components/qualification/Step8Complete';
import QualificationHeader from '@/components/qualification/QualificationHeader';
import QualificationProgress from '@/components/qualification/QualificationProgress';
import LanguageSelect from '@/components/qualification/LanguageSelect';
import { qLangs } from '@/components/qualification/QualificationLang';
import { base44 } from '@/api/base44Client';

const TOTAL_STEPS = 8;

export default function TenantQualification() {
  const [lang, setLang] = useState(null); // null = language selection screen
  const [welcomed, setWelcomed] = useState(false);
  const [step, setStep] = useState(1);
  const [inquiryId, setInquiryId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', tenant_email: '', tenant_phone: '',
    mobile_verified: false, linkedin_connected: false, xing_connected: false, facebook_connected: false,
    address: '', postal_code: '', city: '', country: 'Spain',
    gender: '', nationality: '', place_of_birth: '', dni_nie_number: '', age: '',
    profile_picture_url: '',
    employment_status: '', company_name: '', number_of_occupants: 1, has_pets: false, pet_details: '',
    documents: { cv_url: '', payslip_url: '', work_contract_url: '', id_document_url: '' },
    id_verification_status: 'pending', email_verified: false, business_email_verified: false, gdpr_verified: false,
    monthly_income: '', bank_account_connected: false, bank_verification_status: 'pending',
    credit_check_status: 'pending', financing_options: [],
    property_id: '', idealista_id: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('property_id') || '';
    const iid = params.get('idealista_id') || '';
    setFormData(prev => ({ ...prev, property_id: pid, idealista_id: iid }));
  }, []);

  const t = (key) => {
    if (!lang) return qLangs.en[key] ?? key;
    return qLangs[lang]?.[key] ?? qLangs.en[key] ?? key;
  };

  const updateForm = (data) => setFormData(prev => ({ ...prev, ...data }));

  const saveInquiry = async (additionalData = {}) => {
    const payload = {
      ...formData,
      ...additionalData,
      tenant_name: `${formData.first_name} ${formData.last_name}`.trim(),
      status: 'screening',
      progress_step: step,
    };
    if (inquiryId) {
      await base44.entities.Inquiry.update(inquiryId, payload);
    } else {
      const created = await base44.entities.Inquiry.create({ ...payload, status: 'new', progress_step: 1 });
      setInquiryId(created.id);
    }
  };

  const next = async (additionalData = {}) => {
    await saveInquiry({ ...additionalData, progress_step: step + 1 });
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Language selection screen
  if (!lang) {
    return <LanguageSelect onSelect={setLang} />;
  }

  const stepProps = { formData, updateForm, onNext: next, onBack: back, inquiryId, t };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <QualificationHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {step < TOTAL_STEPS && (
          <QualificationProgress currentStep={step} totalSteps={TOTAL_STEPS} t={t} />
        )}
        <div className="mt-6">
          {step === 1 && <Step1Profile {...stepProps} />}
          {step === 2 && <Step2Personal {...stepProps} />}
          {step === 3 && <Step3Employment {...stepProps} />}
          {step === 4 && <Step4Documents {...stepProps} />}
          {step === 5 && <Step5IdVerification {...stepProps} />}
          {step === 6 && <Step6Financial {...stepProps} />}
          {step === 7 && <Step7CreditCheck {...stepProps} />}
          {step === 8 && <Step8Complete {...stepProps} />}
        </div>
      </div>
    </div>
  );
}