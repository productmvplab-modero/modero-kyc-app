import React, { useState } from 'react';
import { Mail, Calendar, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      
      // Generate PDF
      const pdfResponse = await base44.functions.invoke('generateContractPDF', { 
        contract_id: contract.id 
      });

      // Send email with PDF
      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject: `Rental Agreement Ready for Signature - ${contract.property_address}`,
        body: `
          <h2>Your rental agreement is ready for signature</h2>
          <p>Dear ${recipientEmail === tenantEmail ? contract.tenant_name : contract.landlord_name},</p>
          <p>${customMessage || 'Please review and sign the attached rental agreement.'}</p>
          ${signingDeadline ? `<p><strong>Signing Deadline:</strong> ${signingDeadline}</p>` : ''}
          <p>You can also sign digitally using the provided link.</p>
          <p>Best regards,<br/>${contract.landlord_name}</p>
        `
      });

      setShowForm(false);
      setRecipientEmail(tenantEmail || '');
      setSigningDeadline('');
      setCustomMessage('');
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const isBothSigned = contract.tenant_signed && contract.landlord_signed;

  return (
    <Card className={`border-2 ${isBothSigned ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${isBothSigned ? 'text-green-900' : 'text-orange-900'}`}>
            Digital Signing
          </CardTitle>
          {isBothSigned && (
            <Badge className="bg-green-600 text-white">Fully Signed</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isBothSigned ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center flex-shrink-0">
              <span className="text-green-700 text-lg">✓</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">Contract Fully Signed</p>
              <p className="text-xs text-green-700">Both parties have signed the agreement</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Ready to Send</p>
                <p className="text-xs text-slate-600">Send contract for digital signing</p>
              </div>
            </div>

            <Button
              onClick={() => setShowForm(!showForm)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send for Signature
            </Button>

            {showForm && (
              <div className="bg-white border-2 border-orange-200 rounded-lg p-4 space-y-3 mt-4">
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
                    placeholder="Add a custom message to the email..."
                    className="text-sm h-20"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1 text-sm h-9"
                  >
                    Cancel
                  </Button>
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
      </CardContent>
    </Card>
  );
}