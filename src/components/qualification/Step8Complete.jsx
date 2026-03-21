import React, { useEffect } from 'react';
import { CheckCircle2, Star, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function Step8Complete({ formData }) {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f97316', '#fb923c', '#fdba74', '#fcd34d'],
    });
  }, []);

  const score = formData.credit_score || formData.modero_score || 75;
  const name = formData.first_name || 'Applicant';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 text-center">
      {/* Success Icon */}
      <div className="relative inline-flex mb-6">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-orange-500" />
        </div>
        <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
          <Star className="w-4 h-4 text-white fill-white" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        Congratulations, {name}! 🎉
      </h1>
      <p className="text-slate-500 mb-8">Your application has been successfully submitted. Here's your qualification summary.</p>

      {/* Score Card */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white mb-6">
        <p className="text-sm font-medium opacity-80 mb-1">Your Modero Qualification Score</p>
        <div className="text-6xl font-black mb-2">{score}</div>
        <p className="text-sm opacity-80">out of 100</p>
        <div className="mt-4 w-full bg-white/20 rounded-full h-3">
          <div className="h-3 rounded-full bg-white transition-all duration-1000" style={{ width: `${score}%` }} />
        </div>
        <p className="text-xs mt-2 opacity-70">
          {score >= 80 ? '⭐ Excellent profile — high approval likelihood' : score >= 65 ? '✅ Good profile — strong candidate' : '📋 Profile under review'}
        </p>
      </div>

      {/* Summary checklist */}
      <div className="text-left bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
        {[
          { label: 'Identity Verified', done: formData.id_verification_status === 'completed' },
          { label: 'Email Confirmed', done: formData.email_verified },
          { label: 'Documents Submitted', done: !!(formData.documents?.cv_url && formData.documents?.payslip_url) },
          { label: 'Financial Profile', done: !!formData.monthly_income },
          { label: 'Credit Check', done: formData.credit_check_status === 'approved' },
          { label: 'GDPR Consent', done: formData.gdpr_verified },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${item.done ? 'text-green-500' : 'text-slate-300'}`} />
            <span className={`text-sm ${item.done ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
          <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">Review in Progress</p>
            <p className="text-xs text-slate-500">The landlord will review your application within 24-48 hours.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-orange-50 rounded-xl p-4">
          <Mail className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">Check Your Email</p>
            <p className="text-xs text-slate-500">A confirmation has been sent to <strong>{formData.tenant_email}</strong></p>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-6">Thank you for using Modero — your trusted rental qualification platform.</p>
    </div>
  );
}