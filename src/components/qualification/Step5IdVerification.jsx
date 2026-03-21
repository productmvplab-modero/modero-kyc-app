import React, { useState } from 'react';
import { Shield, Mail, Briefcase, FileCheck, CheckCircle2, AlertCircle, Camera, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StepCard from './StepCard';

function VerificationItem({ icon, iconColor, title, desc, status, onAction, actionLabel, children, verifiedLabel }) {
  const Icon = icon;
  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${status === 'done' ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${status === 'done' ? 'bg-green-100' : 'bg-slate-100'}`}>
          <Icon className={`w-5 h-5 ${status === 'done' ? 'text-green-600' : iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <span className="text-sm font-semibold text-slate-800">{title}</span>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            {status === 'done' ? (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> {verifiedLabel}
              </span>
            ) : (
              <button type="button" onClick={onAction}
                className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1">
                {actionLabel}
                <Send className="w-3 h-3" />
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Step5IdVerification({ formData, updateForm, onNext, onBack, t }) {
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(null);
  const [businessEmail, setBusinessEmail] = useState('');
  const [showIdModal, setShowIdModal] = useState(false);

  const simulate = (field, delay = 1500) => {
    setSimulating(field);
    setTimeout(() => {
      updateForm({ [field]: true });
      setSimulating(null);
    }, delay);
  };

  const simulateId = () => {
    setSimulating('id_verification_status');
    setTimeout(() => {
      updateForm({ id_verification_status: 'completed' });
      setSimulating(null);
    }, 2000);
  };

  const canContinue = formData.email_verified && formData.id_verification_status === 'completed' && formData.gdpr_verified;

  return (
    <StepCard
      icon={Shield}
      title={t('s5_title')}
      subtitle={t('s5_subtitle')}
      onNext={async () => { setLoading(true); await onNext(); setLoading(false); }}
      onBack={onBack}
      nextDisabled={!canContinue}
      loading={loading}
      t={t}
    >
      {/* GDPR */}
      <div className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${formData.gdpr_verified ? 'border-green-300 bg-green-50' : 'border-orange-200 bg-orange-50'}`}
        onClick={() => updateForm({ gdpr_verified: !formData.gdpr_verified })}>
        <div className="flex items-start gap-3">
          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 ${formData.gdpr_verified ? 'border-green-500 bg-green-500' : 'border-orange-400'}`}>
            {formData.gdpr_verified && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{t('s5_gdpr')}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t('s5_gdpr_desc')}</p>
          </div>
        </div>
      </div>

      {/* Email */}
      <VerificationItem
        icon={Mail} iconColor="text-blue-500"
        title={t('s5_email_title')} desc={t('s5_email_desc')}
        status={formData.email_verified ? 'done' : 'pending'}
        onAction={() => simulate('email_verified')}
        actionLabel={simulating === 'email_verified' ? 'Sending...' : 'Verify for Sent'}
        verifiedLabel={t('s5_verified')}
      >
        {!formData.email_verified && (
          <Input
            className="mt-2 text-xs"
            type="email"
            placeholder="your@email.com"
            value={formData.tenant_email}
            onChange={e => updateForm({ tenant_email: e.target.value })}
          />
        )}
      </VerificationItem>

      {/* ID Verification */}
      {showIdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-8 text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Biometric ID Verification</h2>
                <p className="text-sm text-slate-500 mt-2">Verify your identity using facial recognition powered by Identomat</p>
              </div>
              
              {formData.id_verification_status === 'completed' ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-600">Verification Successful</h3>
                    <p className="text-sm text-slate-600 mt-1">Your identity has been verified</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                    <Camera className="w-12 h-12 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Ready to Verify</h3>
                    <p className="text-sm text-slate-600 mt-1">We'll use your device's camera for a secure biometric check. Make sure you're in good lighting.</p>
                  </div>
                  <button
                    onClick={simulateId}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    Start Biometric Verification
                  </button>
                </>
              )}
              
              <button
                onClick={() => setShowIdModal(false)}
                className="w-full text-slate-600 hover:text-slate-900 font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <VerificationItem
        icon={FileCheck} iconColor="text-violet-500"
        title={t('s5_id_title')} desc={t('s5_id_desc')}
        status={formData.id_verification_status === 'completed' ? 'done' : 'pending'}
        onAction={() => setShowIdModal(true)}
        actionLabel={simulating === 'id_verification_status' ? t('s5_processing') : 'Verify'}
        verifiedLabel={t('s5_verified')}
      />

      {/* Business Email */}
      <VerificationItem
        icon={Briefcase} iconColor="text-amber-500"
        title={t('s5_biz_email_title')} desc={t('s5_biz_email_desc')}
        status={formData.business_email_verified ? 'done' : 'pending'}
        onAction={() => formData.business_email_verified ? null : simulate('business_email_verified')}
        actionLabel={simulating === 'business_email_verified' ? t('s5_biz_verifying') : t('s5_biz_verify')}
        verifiedLabel={t('s5_verified')}
      >
        {!formData.business_email_verified && (
          <Input
            className="mt-2 text-xs"
            placeholder={t('s5_biz_email_ph')}
            value={businessEmail}
            onChange={e => setBusinessEmail(e.target.value)}
          />
        )}
      </VerificationItem>

      {!canContinue && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">{t('s5_warning')}</p>
        </div>
      )}
    </StepCard>
  );
}