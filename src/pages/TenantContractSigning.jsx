import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, FileText, AlertCircle, Loader2, Shield, Clock, MapPin, Euro, Home } from 'lucide-react';

export default function TenantContractSigning() {
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

      if (!contracts || contracts.length === 0) {
        setError('Contract not found. This link may be invalid or expired.');
        return;
      }

      const c = contracts[0];
      if (c.tenant_signed) { setSigned(true); setContract(c); return; }
      setContract(c);
    } catch (err) {
      setError('Unable to load contract. Please contact your landlord.');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signatureName.trim() || !agreed) return;
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

  // ── Shared page shell ──
  const Shell = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      {/* Orange accent bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300" />
      {/* Branded header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-sm">
            <span className="text-white text-xl font-bold">M</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg">Modero</span>
            <span className="text-slate-400 ml-2 text-sm">· Contract Signing Portal</span>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {children}
      </div>
    </div>
  );

  if (loading) return (
    <Shell>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-5" />
        <p className="text-slate-500 font-medium">Loading your contract…</p>
      </div>
    </Shell>
  );

  if (error && !contract) return (
    <Shell>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Link Unavailable</h2>
        <p className="text-slate-500">{error}</p>
      </div>
    </Shell>
  );

  if (signed) return (
    <Shell>
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Contract Signed!</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">You have successfully signed the rental agreement. Your landlord will be notified and will countersign shortly.</p>
        {contract?.audit_id && (
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 text-sm text-slate-700">
            <Shield className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span>Audit ID: <span className="font-mono font-bold text-slate-900">{contract.audit_id}</span></span>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-8">Keep this page for your records. You will receive a confirmation email once both parties have signed.</p>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <div className="space-y-6">
        {/* Page title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Rental Agreement</h1>
          <p className="text-slate-500 text-sm">Please review the contract below and sign to confirm your agreement.</p>
        </div>

        {/* Contract summary */}
        {contract && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4">
              <h2 className="text-white font-bold text-lg">Contract Summary</h2>
              <p className="text-orange-100 text-sm">Review these key details before signing</p>
            </div>
            {/* Summary grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <SummaryItem icon={<span className="text-orange-500 text-base">👤</span>} label="Tenant" value={contract.tenant_name} />
                <SummaryItem icon={<span className="text-orange-500 text-base">🏢</span>} label="Landlord" value={contract.landlord_name} />
                <SummaryItem icon={<MapPin className="w-4 h-4 text-orange-500" />} label="Property" value={contract.property_address || '—'} />
                <SummaryItem icon={<span className="text-orange-500 font-bold text-sm">€</span>} label="Monthly Rent" value={`€${Number(contract.monthly_rent || 0).toLocaleString()}`} highlight />
                <SummaryItem icon={<Clock className="w-4 h-4 text-orange-500" />} label="Lease Start" value={fmt(contract.lease_start_date)} />
                <SummaryItem icon={<Clock className="w-4 h-4 text-orange-500" />} label="Lease End" value={fmt(contract.lease_end_date)} />
              </div>
              {contract.deposit_amount && (
                <div className="border-t border-slate-100 mt-4 pt-4">
                  <SummaryItem icon={<Shield className="w-4 h-4 text-orange-500" />} label="Security Deposit" value={`€${Number(contract.deposit_amount).toLocaleString()}`} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full contract text */}
        {contract?.contract_content && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
              <FileText className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-slate-800">Full Contract Terms</h3>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">{contract.contract_content}</pre>
            </div>
          </div>
        )}

        {/* Signature section */}
        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Digital Signature</h3>
              <p className="text-xs text-slate-500">Type your full name below to digitally sign this agreement</p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full legal name</label>
              <Input
                placeholder={contract?.tenant_name || 'Your full legal name'}
                value={signatureName}
                onChange={e => setSignatureName(e.target.value)}
                className="h-11 text-base"
              />
              {signatureName && (
                <div className="mt-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg px-4 py-2">
                  <p className="text-xs text-slate-400 mb-0.5">Signature preview</p>
                  <p className="text-xl text-slate-800 italic" style={{ fontFamily: 'Georgia, serif' }}>{signatureName}</p>
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-orange-500 flex-shrink-0"
              />
              <span className="text-sm text-slate-600 leading-relaxed">
                I have read and fully understand the rental agreement above. I agree to all terms and conditions and confirm my digital signature is legally binding.
              </span>
            </label>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              onClick={handleSign}
              disabled={!signatureName.trim() || !agreed || signing}
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base"
            >
              {signing
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing…</>
                : <><Shield className="w-4 h-4 mr-2" /> Sign Contract</>
              }
            </Button>

            <p className="text-xs text-slate-400 text-center">
              Your signature timestamp and IP address will be securely recorded for audit purposes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 pb-4">
          Powered by <span className="font-bold text-orange-500">Modero</span> · Secure Digital Contract Platform
        </p>
      </div>
    </Shell>
  );
}

function SummaryItem({ icon, label, value, highlight }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {icon} {label}
      </p>
      <p className={`font-semibold ${highlight ? 'text-orange-600 text-lg' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}