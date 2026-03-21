import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const DEFAULT_CONTRACT_TEMPLATE = `RENTAL AGREEMENT

This Rental Agreement ("Contract") is entered into between:

LANDLORD:
Name: [LANDLORD_NAME]
Address: [LANDLORD_ADDRESS]
Email: [LANDLORD_EMAIL]

TENANT:
Name: [TENANT_NAME]
Email: [TENANT_EMAIL]

PROPERTY:
Address: [PROPERTY_ADDRESS]
Description: Residential apartment

TERMS AND CONDITIONS:

1. LEASE PERIOD
   Start Date: [LEASE_START]
   End Date: [LEASE_END]

2. RENT PAYMENT
   Monthly Rent: €[MONTHLY_RENT]
   Payment Due: 1st of each month
   Payment Method: Bank transfer

3. SECURITY DEPOSIT
   Amount: €[DEPOSIT_AMOUNT]
   Refundable upon lease termination

4. UTILITIES & SERVICES
   Tenant responsible for: Water, gas, electricity, internet
   Landlord responsible for: Property maintenance, insurance

5. HOUSE RULES
   - Quiet hours: 10 PM to 8 AM
   - No smoking inside the property
   - No unauthorized pets
   - No illegal activities
   - No subletting without written consent

6. MAINTENANCE & REPAIRS
   Tenant shall report any damages immediately.
   Landlord will repair structural issues within 15 days.

7. TERMINATION
   Either party may terminate with 30 days written notice.

8. LIABILITY
   Tenant is responsible for personal property insurance.
   Landlord maintains building insurance.

9. DISPUTE RESOLUTION
   Disputes shall be resolved through mediation.

10. GOVERNING LAW
    This contract is governed by Spanish law.

Both parties agree to the terms and conditions above.`;

export default function ContractManager() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.RentalContract.list('-created_date', 50),
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries', 'qualified'],
    queryFn: () => base44.entities.Inquiry.filter({ status: 'qualified' }),
  });

  const createContractMutation = useMutation({
    mutationFn: async (contractData) => {
      return await base44.entities.RentalContract.create(contractData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setShowNewForm(false);
      setSelectedInquiry(null);
    },
  });

  const sendContractMutation = useMutation({
    mutationFn: async (contractId) => {
      const response = await base44.functions.invoke('sendContractForSignature', { contract_id: contractId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setEditingContract(null);
    },
  });

  const handleCreateContract = async () => {
    if (!selectedInquiry || !editingContract) return;

    const inquiry = inquiries.find(i => i.id === selectedInquiry);
    const property = await base44.entities.Property.get(inquiry.property_id);

    const contractData = {
      property_id: inquiry.property_id,
      inquiry_id: selectedInquiry,
      tenant_name: inquiry.tenant_name,
      tenant_email: inquiry.tenant_email,
      landlord_name: property.property_owner,
      landlord_email: property.owner_email,
      property_address: property.address,
      monthly_rent: property.monthly_rent,
      lease_start_date: editingContract.lease_start_date,
      lease_end_date: editingContract.lease_end_date,
      deposit_amount: editingContract.deposit_amount,
      contract_content: editingContract.contract_content,
      status: 'draft',
    };

    await createContractMutation.mutateAsync(contractData);
  };

  if (contractsLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">{t('rental_contracts')}</h1>
          <p className="text-slate-600">{t('contracts_subtitle')}</p>
        </div>

        {/* Create New Contract Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowNewForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-11"
          >
            <FileText className="w-5 h-5 mr-2" />
            {t('create_new_contract')}
          </Button>
        </div>

        {/* New Contract Form */}
        {showNewForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('create_new_contract')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Select Qualified Tenant */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('select_tenant')}</label>
                <select
                  value={selectedInquiry}
                  onChange={(e) => setSelectedInquiry(e.target.value)}
                  className="w-full h-10 px-4 border border-slate-200 rounded-md"
                >
                  <option value="">-- {t('select_tenant')} --</option>
                  {inquiries.map(inq => (
                    <option key={inq.id} value={inq.id}>
                      {inq.tenant_name} ({inq.tenant_email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInquiry && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">{t('lease_start_date')}</label>
                      <Input
                        type="date"
                        value={editingContract?.lease_start_date || ''}
                        onChange={(e) => setEditingContract(prev => ({ ...prev, lease_start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">{t('lease_end_date')}</label>
                      <Input
                        type="date"
                        value={editingContract?.lease_end_date || ''}
                        onChange={(e) => setEditingContract(prev => ({ ...prev, lease_end_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('security_deposit')}</label>
                    <Input
                      type="number"
                      placeholder="2000"
                      value={editingContract?.deposit_amount || ''}
                      onChange={(e) => setEditingContract(prev => ({ ...prev, deposit_amount: parseFloat(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t('contract_terms')}</label>
                    <Textarea
                      value={editingContract?.contract_content || DEFAULT_CONTRACT_TEMPLATE}
                      onChange={(e) => setEditingContract(prev => ({ ...prev, contract_content: e.target.value }))}
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-2">{t('customize_template')}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleCreateContract}
                      disabled={createContractMutation.isPending || !editingContract?.lease_start_date}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      {createContractMutation.isPending ? t('creating_contract') : t('create_contract')}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNewForm(false);
                        setSelectedInquiry(null);
                        setEditingContract(null);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contracts List */}
        <div className="grid gap-4">
          {contracts.map(contract => (
            <Card key={contract.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{contract.property_address}</h3>
                      {contract.status === 'fully_signed' && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {contract.status === 'tenant_signed' && (
                        <Clock className="w-5 h-5 text-blue-500" />
                      )}
                      {contract.status === 'draft' && (
                        <AlertCircle className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{t('tenant')}: {contract.tenant_name}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">{t('monthly_rent')}:</span>
                        <p className="font-semibold text-slate-800">€{contract.monthly_rent}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">{t('lease_period')}:</span>
                        <p className="font-semibold text-slate-800">{format(new Date(contract.lease_start_date), 'MMM d')} - {format(new Date(contract.lease_end_date), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">{t('status')}:</span>
                        <p className="font-semibold text-slate-800 capitalize">{contract.status}</p>
                      </div>
                    </div>

                    {/* Signing Status */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg ${contract.tenant_signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                        <p className="text-xs text-slate-600">{t('tenant_signature_label')}</p>
                        {contract.tenant_signed ? (
                          <p className="text-sm font-semibold text-green-700">{contract.tenant_signature} - {format(new Date(contract.tenant_signed_date), 'MMM d, yyyy')}</p>
                        ) : (
                          <p className="text-sm text-slate-500">{t('pending')}</p>
                        )}
                      </div>
                      <div className={`p-3 rounded-lg ${contract.landlord_signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                        <p className="text-xs text-slate-600">{t('landlord_signature_label')}</p>
                        {contract.landlord_signed ? (
                          <p className="text-sm font-semibold text-green-700">{contract.landlord_signature} - {format(new Date(contract.landlord_signed_date), 'MMM d, yyyy')}</p>
                        ) : (
                          <p className="text-sm text-slate-500">{t('pending')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2">
                    {contract.status === 'draft' && (
                      <Button
                        onClick={() => sendContractMutation.mutate(contract.id)}
                        disabled={sendContractMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        {sendContractMutation.isPending ? t('sending') : t('send_for_signature')}
                      </Button>
                    )}
                    {contract.status === 'tenant_signed' && (
                      <Button
                        variant="outline"
                        className="whitespace-nowrap"
                        disabled
                      >
                        {t('awaiting_your_signature')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}