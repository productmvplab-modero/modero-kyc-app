import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Calendar, Mail, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SendForSigningSection({ contract, tenantEmail, landlordEmail, onSend, isSending }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: tenantEmail || '',
    signingDeadline: '',
    reminderMessage: '',
  });

  const handleSubmit = () => {
    if (!formData.recipientEmail.trim()) {
      alert('Please enter a recipient email address');
      return;
    }
    onSend({
      ...formData,
      contractId: contract.id,
    });
    setShowForm(false);
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
              Send this contract to the tenant for digital signature. They'll receive an email with a secure signing link.
            </p>
            {contract.status === 'draft' ? (
              <Button
                onClick={() => setShowForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
              >
                <Send className="w-3 h-3 mr-2" />
                Start Signing Process
              </Button>
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
              <p className="text-xs text-slate-500 mt-1">Tenant's email address to receive signing link</p>
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
                placeholder="Add a personal message to include in the signing email..."
                className="text-sm h-16 resize-none"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-2 flex gap-2">
              <AlertCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">
                The tenant will receive a secure email with a link to review and sign the contract electronically.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isSending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
              >
                <Send className="w-3 h-3 mr-1" />
                {isSending ? 'Sending...' : 'Send for Signature'}
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