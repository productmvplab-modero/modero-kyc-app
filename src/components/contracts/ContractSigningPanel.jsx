import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, PenLine, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

/**
 * Clear two-step signing panel:
 * Step 1 — Send the contract by email to each party
 * Step 2 — Sign manually as landlord (admin action)
 */
export default function ContractSigningPanel({
  contract,
  signatureName,
  setSignatureName,
  signatureRole,
  setSignatureRole,
  onSign,
  isSigning,
}) {
  const [sendingTo, setSendingTo] = useState(null); // 'tenant' | 'landlord'
  const [emailSent, setEmailSent] = useState({}); // { tenant: bool, landlord: bool }

  const tenantSigned = contract.tenant_signed;
  const landlordSigned = contract.landlord_signed;
  const bothSigned = tenantSigned && landlordSigned;
  const isAlreadySigned = signatureRole === 'tenant' ? tenantSigned : landlordSigned;

  const handleSendEmail = async (role) => {
    const email = role === 'tenant' ? contract.tenant_email : contract.landlord_email;
    const name = role === 'tenant' ? contract.tenant_name : (contract.landlord_name || 'Landlord');
    setSendingTo(role);
    try {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `Action Required: Sign Your Rental Agreement - ${contract.property_address || ''}`,
        body: `
          <p>Dear ${name},</p>
          <p>Your rental agreement is ready for your signature. Please review and sign at your earliest convenience.</p>
          <p><strong>Property:</strong> ${contract.property_address || 'N/A'}</p>
          <p><strong>Monthly Rent:</strong> €${contract.monthly_rent || 0}</p>
          <br/>
          <p>Best regards,<br/>${contract.landlord_name || 'The Landlord'}</p>
        `,
      });
      setEmailSent(prev => ({ ...prev, [role]: true }));
    } catch (e) {
      console.error('Failed to send email', e);
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <div className="space-y-4">

      {/* ── All done banner ── */}
      {bothSigned && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
          <div>
            <p className="font-bold text-green-800 text-base">Contract Fully Signed</p>
            <p className="text-sm text-green-600">Both parties have signed this agreement.</p>
          </div>
        </div>
      )}

      {/* ── STEP 1: Email parties ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">1</div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Notify parties by email</p>
            <p className="text-xs text-slate-500">Send the contract to tenant and landlord for review</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {/* Tenant row */}
          <PartyEmailRow
            label="Tenant"
            name={contract.tenant_name}
            email={contract.tenant_email}
            signed={tenantSigned}
            signedDate={contract.tenant_signed_date}
            isSending={sendingTo === 'tenant'}
            wasSent={emailSent.tenant}
            onSend={() => handleSendEmail('tenant')}
          />
          {/* Landlord row */}
          <PartyEmailRow
            label="Landlord"
            name={contract.landlord_name || 'Landlord'}
            email={contract.landlord_email}
            signed={landlordSigned}
            signedDate={contract.landlord_signed_date}
            isSending={sendingTo === 'landlord'}
            wasSent={emailSent.landlord}
            onSend={() => handleSendEmail('landlord')}
          />
        </div>
      </div>

      {/* ── STEP 2: Admin signs manually ── */}
      {!bothSigned && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">2</div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Sign on behalf of a party</p>
              <p className="text-xs text-slate-500">Sign directly as landlord or tenant</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {/* Role toggle */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
              {['landlord', 'tenant'].map(role => (
                <button
                  key={role}
                  onClick={() => { setSignatureRole(role); setSignatureName(''); }}
                  className={`flex-1 py-2 font-medium transition-colors capitalize ${
                    signatureRole === role
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {role === 'landlord' ? `Landlord${landlordSigned ? ' ✓' : ''}` : `Tenant${tenantSigned ? ' ✓' : ''}`}
                </button>
              ))}
            </div>

            {isAlreadySigned ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  {signatureRole === 'landlord' ? contract.landlord_name : contract.tenant_name} has already signed.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type full name to sign</label>
                  <Input
                    type="text"
                    placeholder={`Full legal name of the ${signatureRole}`}
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="h-11"
                  />
                </div>
                {signatureName.trim() && (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg px-4 py-3">
                    <p className="text-xs text-slate-400 mb-1">Signature preview</p>
                    <p className="text-2xl text-slate-800" style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>{signatureName}</p>
                  </div>
                )}
                <Button
                  onClick={onSign}
                  disabled={!signatureName.trim() || isSigning}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold h-11"
                >
                  <PenLine className="w-4 h-4 mr-2" />
                  {isSigning ? 'Signing...' : `Sign as ${signatureRole === 'landlord' ? 'Landlord' : 'Tenant'}`}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PartyEmailRow({ label, name, email, signed, signedDate, isSending, wasSent, onSend }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${signed ? 'bg-green-100' : 'bg-white border-2 border-slate-300'}`}>
        {signed
          ? <CheckCircle2 className="w-4 h-4 text-green-600" />
          : <span className="text-xs font-bold text-slate-400">{label[0]}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
        <p className="text-xs text-slate-500 truncate">{email || '—'}</p>
        {signed && signedDate && (
          <p className="text-xs text-green-600">Signed {new Date(signedDate).toLocaleDateString()}</p>
        )}
      </div>
      <div className="shrink-0">
        {signed ? (
          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">✓ Signed</span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={onSend}
            disabled={isSending || !email}
            className={`text-xs h-8 ${wasSent ? 'border-green-300 text-green-700' : ''}`}
          >
            {isSending ? (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Sending…</span>
            ) : wasSent ? (
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sent</span>
            ) : (
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}