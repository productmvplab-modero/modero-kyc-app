import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function EmailVerificationModal({ email, onVerificationSent, onSkip }) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendVerification = async () => {
    setIsLoading(true);
    try {
      // Simulate sending verification email
      await new Promise(resolve => setTimeout(resolve, 1500));
      onVerificationSent?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Gradient Header */}
        <div className="h-48 bg-gradient-to-br from-orange-100 via-amber-50 to-slate-100 relative overflow-hidden flex items-center justify-center">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-6 w-16 h-16 bg-orange-300 rounded-full blur-3xl" />
            <div className="absolute bottom-2 right-4 w-20 h-20 bg-amber-300 rounded-full blur-3xl" />
          </div>
          
          {/* Mail Icon */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-20 w-20 bg-gradient-to-br from-orange-500 to-amber-400 rounded-full flex items-center justify-center shadow-lg mb-3">
              <Mail className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8 text-center space-y-6">
          {/* Headline */}
          <div>
            <h2 className="text-3xl font-bold text-slate-950 mb-2">
              {t('email_verification_headline')}
            </h2>
            <p className="text-slate-600 text-base">
              {t('email_verification_subtitle')}
            </p>
          </div>

          {/* Email Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <p className="text-sm text-slate-600 mb-1">{t('email_verification_sent_to')}</p>
            <p className="text-base font-semibold text-slate-900 break-all">{email}</p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleSendVerification}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white font-semibold h-12 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('email_verifying')}
              </>
            ) : (
              t('email_verify_button')
            )}
          </Button>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <div className="flex gap-2 items-start">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-semibold text-amber-900 mb-1">
                  🔒 {t('email_verification_notice')}
                </p>
                <p className="text-xs text-amber-800">
                  {t('email_verification_security')}
                </p>
              </div>
            </div>
          </div>

          {/* Skip Option */}
          <button
            onClick={onSkip}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            {t('email_verification_skip')}
          </button>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 text-center">
          <p className="text-xs text-slate-500">
            Powered by <span className="font-semibold text-slate-700">Modero</span>
          </p>
        </div>
      </div>
    </div>
  );
}