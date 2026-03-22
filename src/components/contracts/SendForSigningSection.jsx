import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, Circle, Clock, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

export default function SendForSigningSection({ contract, tenantEmail, landlordEmail, onSend, isSending }) {
  const [showForm, setShowForm] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(tenantEmail || '');
  const [signingDeadline, setSigningDeadline] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const handleSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      await base44.functions.invoke('generateContractPDF', { contract_id: contract.id });
      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject: `Rental Agreement Ready for Signature - ${contract.property_address}`,
        body: `
          <h2>Your rental agreement is ready for signature</h2>
          <p>Dear ${recipientEmail === tenantEmail ? contract.tenant_name : contract.landlord_name},</p>
          <p>${customMessage || 'Please review and sign the attached rental agreement.'}</p>
          ${signingDeadline ? `<p><strong>Signing Deadline:</strong> ${signingDeadline}</p>` : ''}
          <p>Best regards,<br/>${contract.landlord_name}</p>
        `
      });
      setShowForm(false);
      setRecipientEmail(tenantEmail || '');
      setSigningDeadline('');
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const isBothSigned = contract.tenant_signed && contract.landlord_signed;
  const isPartialSigned = contract.tenant_signed || contract.landlord_signed;

  const parties = [
    {
      label: 'Tenant',
      name: contract.tenant_name,
      email: tenantEmail,
      signed: contract.tenant_signed,
      signedDate: contract.tenant_signed_date,
      icon: User,
    },
    {
      label: 'Landlord',
      name: contract.landlord_name,
      email: landlordEmail,
      signed: contract.landlord_signed,
      signedDate: contract.landlord_signed_date,
      icon: Home,
    },
  ];

  return (
    <div className="border-2 border-orange-200 rounded-xl p-5 bg-orange-50 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-orange-200">
        <h3 className="text-lg font-bold text-orange-900">Digital Signing</h3>
        {isBothSigned && (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully Signed
          </span>
        )}
        {isPartialSigned && !isBothSigned && (
          <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 border border-orange-300 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </span>
        )}
        {!isPartialSigned && (
          <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold">
            <Circle className="w-3.5 h-3.5" /> Pending
          </span>
        )}
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        {parties.map((party, index) => {
          const Icon = party.icon;
          return (
            <div key={party.label} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                party.signed
                  ? 'bg-green-100 border-green-400'
                  : 'bg-white border-orange-300'
              }`}>
                {party.signed
                  ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                  : <Icon className="w-4 h-4 text-orange-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{party.name || party.label}</p>
                <p className="text-xs text-slate-500 truncate">{party.email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {party.signed ? (
                  <span className="text-xs font-semibold text-green-700">✓ Signed</span>
                ) : (
                  <span className="text-xs text-slate-400">Awaiting</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{parties.filter(p => p.signed).length}/{parties.length} signed</span>
          </div>
          <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(parties.filter(p => p.signed).length / parties.length) * 100}%`,
                background: isBothSigned ? '#16a34a' : '#f97316'
              }}
            />
          </div>
        </div>
      </div>

      {/* Send Action */}
      {!isBothSigned && (
        <div className="pt-2 border-t border-orange-200">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send for Signature
          </Button>

          {showForm && (
            <div className="bg-white border-2 border-orange-200 rounded-lg p-4 space-y-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-orange-700 mb-1">Recipient Email</label>
                <Input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-orange-700 mb-1">Signing Deadline (Optional)</label>
                <Input
                  type="date"
                  value={signingDeadline}
                  onChange={(e) => setSigningDeadline(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-orange-700 mb-1">Message (Optional)</label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add a custom message..."
                  className="text-sm h-16"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1 text-sm h-9">Cancel</Button>
                <Button
                  onClick={handleSendEmail}
                  disabled={!recipientEmail || isSendingEmail}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm h-9"
                >
                  <Send className="w-3 h-3 mr-1" />
                  {isSendingEmail ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}