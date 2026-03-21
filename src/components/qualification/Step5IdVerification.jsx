import React, { useState } from 'react';
import { Shield, Mail, Briefcase, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StepCard from './StepCard';

function VerificationItem({ icon: Icon, iconColor, title, desc, status, onAction, actionLabel, children }) {
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
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            ) : (
              <button type="button" onClick={onAction}
                className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0">
                {actionLabel}
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Step5IdVerification({ formData, updateForm, onNext, onBack }) {
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(null);
  const [businessEmail, setBusinessEmail] = useState('');

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
      title="Identity Verification"
      subtitle="We need to verify your identity and contact details"
      onNext={async () => { setLoading(true); await onNext(); setLoading(false); }}
      onBack={onBack}
      nextDisabled={!canContinue}
      loading={loading}
    >
      {/* GDPR */}
      <div className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${formData.gdpr_verified ? 'border-green-300 bg-green-50' : 'border-orange-200 bg-orange-50'}`}
        onClick={() => updateForm({ gdpr_verified: !formData.gdpr_verified })}>
        <div className="flex items-start gap-3">
          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 ${formData.gdpr_verified ? 'border-green-500 bg-green-500' : 'border-orange-400'}`}>
            {formData.gdpr_verified && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">GDPR Consent *</p>
            <p className="text-xs text-slate-500 mt-0.5">I consent to Modero processing my personal data for tenant qualification purposes in accordance with GDPR regulations.</p>
          </div>
        </div>
      </div>

      {/* Email */}
      <VerificationItem
        icon={Mail} iconColor="text-blue-500"
        title="Email Verification" desc="Confirm your email address"
        status={formData.email_verified ? 'done' : 'pending'}
        onAction={() => simulate('email_verified')}
        actionLabel={simulating === 'email_verified' ? 'Sending...' : 'Send Code'}
      />

      {/* ID Verification */}
      <VerificationItem
        icon={FileCheck} iconColor="text-violet-500"
        title="ID Verification (Identomat)" desc="Secure identity check via document scan"
        status={formData.id_verification_status === 'completed' ? 'done' : 'pending'}
        onAction={simulateId}
        actionLabel={simulating === 'id_verification_status' ? 'Processing...' : 'Start Verification'}
      />

      {/* Business Email */}
      <VerificationItem
        icon={Briefcase} iconColor="text-amber-500"
        title="Business Email (Optional)" desc="Verify your work email for faster approval"
        status={formData.business_email_verified ? 'done' : 'pending'}
        onAction={() => formData.business_email_verified ? null : simulate('business_email_verified')}
        actionLabel={simulating === 'business_email_verified' ? 'Verifying...' : 'Verify'}
      >
        {!formData.business_email_verified && (
          <Input
            className="mt-2 text-xs"
            placeholder="your@company.com"
            value={businessEmail}
            onChange={e => setBusinessEmail(e.target.value)}
          />
        )}
      </VerificationItem>

      {!canContinue && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">Please complete GDPR consent, email verification, and ID verification to continue.</p>
        </div>
      )}
    </StepCard>
  );
}