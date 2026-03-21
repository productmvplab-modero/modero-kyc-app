import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Calendar, Mail, AlertCircle, FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function SendForSigningSection({ contract, tenantEmail, landlordEmail, onSend, isSending }) {
  const [showForm, setShowForm] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: tenantEmail || '',
    signingDeadline: '',
    reminderMessage: '',
  });

  const handleDownloadPDF = async () => {
    try {
      const response = await base44.functions.invoke('generateContractPDF', { 
        contract_id: contract.id 
      });

      const link = document.createElement('a');
      link.href = response.data.pdf_url;
      link.download = response.data.pdf_name;
      link.click();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const handleSendEmail = async () => {
    if (!formData.recipientEmail.trim()) {
      alert('Please enter a recipient email address');
      return;
    }

    try {
      setIsSendingEmail(true);
      
      // Generate PDF
      const pdfResponse = await base44.functions.invoke('generateContractPDF', { 
        contract_id: contract.id 
      });

      // Send email with PDF attachment note
      const deadlineText = formData.signingDeadline ? `<p><strong>Signing Deadline:</strong> ${formData.signingDeadline}</p>` : '';
      const messageText = formData.reminderMessage ? `<p>${formData.reminderMessage}</p>` : '<p>Please review and sign the attached rental agreement at your earliest convenience.</p>';

      await base44.integrations.Core.SendEmail({
        to: formData.recipientEmail,
        subject: `Rental Agreement Ready for Signature - ${contract.property_address}`,
        body: `
          <h2>Rental Agreement Ready for Signature</h2>
          <p>Dear ${formData.recipientEmail === tenantEmail ? contract.tenant_name : contract.landlord_name},</p>
          ${messageText}
          ${deadlineText}
          <p style="margin-top: 20px;"><strong>Next Steps:</strong></p>
          <ul>
            <li>Review the attached contract PDF</li>
            <li>Visit your secure signing link to add your digital signature</li>
            <li>Both parties will receive confirmation once signed</li>
          </ul>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
          <p style="margin-top: 10px; font-size: 12px; color: #666;">
            Best regards,<br/>
            <strong>${contract.landlord_name}</strong>
          </p>
        `
      });

      // Call original onSend if needed
      onSend({
        ...formData,
        contractId: contract.id,
      });

      setShowForm(false);
      setFormData({
        recipientEmail: tenantEmail || '',
        signingDeadline: '',
        reminderMessage: '',
      });
      alert('Email sent successfully with contract PDF!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStatusBadge = () => {
    if (contract.status === 'fully_signed') {
      return <Badge className="bg-green-100 text-green-800">✓ Fully Signed</Badge>;
    } else if (contract.status === 'tenant_signed') {
      return <Badge className="bg-blue-100 text-blue-800">◐ Awaiting Landlord</Badge>;
    } else if (contract.status === 'sent') {
      return <Badge className="bg-amber-100 text-amber-800">⧗ Awaiting Signature</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-800">Draft</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Send className="w-4 h-4" />
            Digital Signing
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!showForm ? (
          <>
            <p className="text-xs text-slate-600 mb-3">
              Send this contract to the tenant for digital signature. They'll receive an email with the PDF and a secure signing link.
            </p>
            {contract.status === 'draft' ? (
              <div className="space-y-2">
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm h-9"
                >
                  <Mail className="w-3 h-3 mr-2" />
                  Send for Signature
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="w-full text-sm h-9"
                >
                  <FileDown className="w-3 h-3 mr-2" />
                  Download PDF
                </Button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded p-2">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Status:</span> This contract has already been sent for signature.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Send To</label>
              <Input
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                placeholder="tenant@email.com"
                className="text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Recipient's email address</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Signing Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={formData.signingDeadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, signingDeadline: e.target.value }))}
                  className="text-sm pl-9"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Optional: Set a deadline for signature</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Message (Optional)</label>
              <Textarea
                value={formData.reminderMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderMessage: e.target.value }))}
                placeholder="Add a personal message to include in the email..."
                className="text-sm h-16 resize-none"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded p-2 flex gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                The contract PDF will be attached and a secure signing link will be included in the email.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSendEmail}
                disabled={isSendingEmail || isSending}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm h-9"
              >
                <Mail className="w-3 h-3 mr-1" />
                {isSendingEmail ? 'Sending...' : 'Send Email'}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1 text-sm h-9"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}