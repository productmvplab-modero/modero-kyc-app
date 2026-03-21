import React, { useState } from 'react';
import { Linkedin, Facebook, Mail, CheckCircle2, ChevronDown, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
];

export default function Step1Profile({ formData, updateForm, onNext, t }) {
  const [phoneInput, setPhoneInput] = useState('');
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryList, setShowCountryList] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSocialConnect = async (platform) => {
    if (platform === 'linkedin') {
      setLoading(true);
      try {
        // LinkedIn data fetch (simulated - in production this would call a backend function)
        const linkedinData = {
          first_name: 'John',
          last_name: 'Doe',
          tenant_email: 'john.doe@example.com',
        };
        updateForm({ ...linkedinData, linkedin_connected: true });
      } catch (error) {
        console.error('LinkedIn connection failed:', error);
      } finally {
        setLoading(false);
      }
    } else {
      updateForm({ [`${platform}_connected`]: true });
    }
  };

  const handleSendCode = () => {
    if (!phoneInput) return;
    setVerifying(true);
    setTimeout(() => {
      setCodeSent(true);
      setVerifying(false);
    }, 1200);
  };

  const handleVerifyCode = () => {
    if (!smsCode || smsCode.length !== 6) return;
    setVerifyingCode(true);
    setTimeout(() => {
      updateForm({ tenant_phone: `${countryCode.code}${phoneInput}`, mobile_verified: true });
      setVerifyingCode(false);
      setCodeSent(false);
      setSmsCode('');
    }, 1200);
  };

  const handleResendCode = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
    }, 1200);
  };

  const canContinue = formData.first_name && formData.last_name && formData.tenant_email && formData.mobile_verified;

  const handleNext = async () => {
    setLoading(true);
    await onNext();
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-orange-600">{t('s1_title')}</h1>
        <p className="text-slate-500 text-sm mt-2">{t('s1_subtitle')}</p>
      </div>

      {/* Social Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => handleSocialConnect('linkedin')}
          disabled={loading || formData.linkedin_connected}
          className={`w-full h-11 flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-all ${formData.linkedin_connected ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 hover:border-orange-300 bg-white disabled:opacity-50'}`}
        >
          {loading && !formData.linkedin_connected ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : 
          formData.linkedin_connected ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Linkedin className="w-5 h-5 text-[#0A66C2]" />}
          {formData.linkedin_connected ? t('s1_linkedin_done') : t('s1_linkedin')}
        </button>
        <button
          onClick={() => handleSocialConnect('xing')}
          className={`w-full h-11 flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-all ${formData.xing_connected ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 hover:border-orange-300 bg-white'}`}
        >
          {formData.xing_connected ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <span className="w-5 h-5 flex items-center justify-center font-bold text-[#006567]">X</span>}
          {formData.xing_connected ? t('s1_xing_done') : t('s1_xing')}
        </button>
        <button
          onClick={() => handleSocialConnect('facebook')}
          className={`w-full h-11 flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-all ${formData.facebook_connected ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 hover:border-orange-300 bg-white'}`}
        >
          {formData.facebook_connected ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Facebook className="w-5 h-5 text-[#1877F2]" />}
          {formData.facebook_connected ? t('s1_facebook_done') : t('s1_facebook')}
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="h-px w-full bg-slate-200" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-slate-400 font-medium">{t('s1_or')}</span>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('s1_first_name')}</label>
          <Input placeholder="John" value={formData.first_name} onChange={e => updateForm({ first_name: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('s1_last_name')}</label>
          <Input placeholder="Doe" value={formData.last_name} onChange={e => updateForm({ last_name: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('s1_email')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input type="email" placeholder="you@example.com" className="pl-10" value={formData.tenant_email} onChange={e => updateForm({ tenant_email: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('s1_mobile')}</label>
          <div className="space-y-4">
            {/* Country Code Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryList(p => !p)}
                disabled={codeSent || formData.mobile_verified}
                className="w-full h-11 flex items-center justify-between px-4 border border-slate-200 rounded-md bg-white text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{countryCode.flag}</span>
                  <span>{countryCode.name}</span>
                  <span className="text-slate-500 ml-2">{countryCode.code}</span>
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {showCountryList && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {COUNTRY_CODES.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-orange-50 text-left transition-colors"
                      onClick={() => { setCountryCode(c); setShowCountryList(false); }}
                    >
                      <span>{c.flag}</span><span>{c.name}</span><span className="text-slate-400 ml-auto">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!codeSent && !formData.mobile_verified && (
              <>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="612 345 678"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    className="flex-1 h-11"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={!phoneInput || verifying}
                    className="flex-1 h-11 rounded-md bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {verifying ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Sent ✓</>}
                  </button>
                </div>
              </>
            )}

            {codeSent && !formData.mobile_verified && (
              <>
                <p className="text-slate-500 text-sm">Enter the 6-digit code sent to {countryCode.code}{phoneInput}</p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="123456"
                    value={smsCode}
                    onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength="6"
                    className="flex-1 h-11 text-center text-2xl tracking-widest font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={smsCode.length !== 6 || verifyingCode}
                    className="flex-1 h-11 rounded-md bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {verifyingCode ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirm Code'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  Resend code
                </button>
              </>
            )}

            {formData.mobile_verified && (
              <div className="h-11 rounded-md bg-green-100 border border-green-300 flex items-center justify-center px-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-700 font-medium text-sm">{countryCode.code}{phoneInput} verified</span>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleNext}
          disabled={!canContinue || loading}
          className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold mt-6 flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>{t('s1_continue')} <ArrowRight className="w-4 h-4" /></>}
        </Button>
        <p className="text-xs text-slate-400 text-center mt-2">{t('s1_footer')}</p>
      </div>
    </div>
  );
}