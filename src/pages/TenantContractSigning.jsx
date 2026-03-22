import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, FileText, AlertCircle, Loader2, Shield, Clock, MapPin } from 'lucide-react';

export default function TenantContractSigning() {
  // Extract token from path: /invite/TOKEN
  const token = window.location.pathname.split('/invite/')[1]?.split('/')[0];

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signatureName, setSignatureName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (!token) { setError('Invalid signing link.'); setLoading(false); return; }
    loadContract();
  }, [token]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const contracts = await base44.asServiceRole?.entities?.RentalContract?.filter({ signing_token: token })
        .catch(() => null);

      // Fallback: use the public list endpoint via service role through function
      if (!contracts || contracts.length === 0) {
        setError('Contract not found. This link may be invalid or expired.');
        return;
      }

      const c = contracts[0];
      if (c.tenant_signed) {
        setSigned(true);
        setContract(c);
        return;
      }

      setContract(c);
    } catch (err) {
      setError('Unable to load contract. Please contact your landlord.');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signatureName.trim()) return;
    if (!agreed) return;
    setSigning(true);
    try {
      await base44.functions.invoke('signContract', {
        token,
        role: 'tenant',
        signature_name: signatureName.trim(),
      });
      setSigned(true);
    } catch (err) {
      setError(err.message || 'Signing failed. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Loading your contract…</p>
      </div>
    </div>
  );

  if (error && !contract) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center border border-slate-200">
        <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Link Unavailable</h2>
        <p className="text-slate-500">{error}</p>
      </div>
    </div>
  );

  if (signed) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center border border-green-100">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Contract Signed!</h2>
        <p className="text-slate-500 mb-6">You have successfully signed the rental agreement. Your landlord will be notified and will countersign shortly.</p>
        {contract?.audit_id && (
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 border border-slate-200">
            <Shield className="w-4 h-4 inline mr-1 text-orange-500" />
            Audit ID: <span className="font-mono font-bold">{contract.audit_id}</span>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-6">Keep this page for your records. You will receive a confirmation email once both parties have signed.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      {/* Header */}
      <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-400" />
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <span className="font-bold text-slate-800">Modero</span>
            <span className="text-slate-400 ml-2 text-sm">· Contract Signing Portal</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Rental Agreement</h1>
          <p className="text-slate-500 text-sm">Please review the contract below and sign to confirm your agreement.</p>
        </div>

        {/* Contract Summary Card */}
        {contract && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-4">
              <h2 className="text-white font-bold text-lg">Contract Summary</h2>
              <p className="text-orange-100 text-sm">Review these key details before signing</p>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Tenant</p>
                  <p className="font-semibold text-slate-800">{contract.tenant_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Landlord</p>
                  <p className="font-semibold text-slate-800">{contract.landlord_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Property</p>
                  <p className="font-semibold text-slate-800">{contract.property_address || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Monthly Rent</p>
                  <p className="font-bold text-orange-600 text-lg">€{Number(contract.monthly_rent || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Lease Start</p>
                  <p className="font-semibold text-slate-800">{fmt(contract.lease_start_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Lease End</p>
                  <p className="font-semibold text-slate-800">{fmt(contract.lease_end_date)}</p>
                </div>
              </div>
              {contract.deposit_amount && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Security Deposit</p>
                  <p className="font-semibold text-slate-800">€{Number(contract.deposit_amount).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Contract Text */}
        {contract?.contract_content && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-slate-800">Full Contract Terms</h3>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">{contract.contract_content}</pre>
            </div>
          </div>
        )}

        {/* Signature Section */}
        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" /> Digital Signature
            </h3>
            <p className="text-sm text-slate-500 mt-1">By typing your full name below, you are digitally signing this agreement.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type your full name to sign</label>
              <Input
                placeholder={contract?.tenant_name || 'Your full legal name'}
                value={signatureName}
                onChange={e => setSignatureName(e.target.value)}
                className="text-lg font-medium"
              />
              {signatureName && (
                <p className="text-xs text-slate-400 mt-1 italic font-serif text-lg">{signatureName}</p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-slate-600">
                I have read and fully understand the rental agreement above. I agree to all terms and conditions and confirm my digital signature is legally binding.
              </span>
            </label>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              onClick={handleSign}
              disabled={!signatureName.trim() || !agreed || signing}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base"
            >
              {signing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing…</> : '✍️ Sign Contract'}
            </Button>

            <p className="text-xs text-slate-400 text-center">
              <Shield className="w-3 h-3 inline mr-1" />
              Your signature timestamp and IP address will be recorded for audit purposes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 pb-8">
          Powered by <span className="font-bold text-orange-500">Modero</span> · Secure Digital Contract Platform
        </p>
      </div>
    </div>
  );
}