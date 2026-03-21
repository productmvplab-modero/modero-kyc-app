import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Header from '@/components/modero/Header';
import ContractForm from '@/components/contracts/ContractForm';
import ContractCard from '@/components/contracts/ContractCard';

export default function ContractManager() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showNewForm, setShowNewForm] = useState(false);
  const [viewingContractId, setViewingContractId] = useState(null);
  const [signatureName, setSignatureName] = useState('');
  const [signatureRole, setSignatureRole] = useState('landlord');

  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => base44.entities.RentalContract.list('-created_date', 50),
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries', 'qualified'],
    queryFn: () => base44.entities.Inquiry.filter({ status: 'qualified' }),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const createContractMutation = useMutation({
    mutationFn: async (formData) => {
      const inquiry = inquiries.find(i => i.id === formData.inquiryId);
      const property = await base44.entities.Property.get(inquiry.property_id);

      const contractData = {
        property_id: inquiry.property_id,
        inquiry_id: formData.inquiryId,
        tenant_name: inquiry.tenant_name,
        tenant_email: inquiry.tenant_email,
        landlord_name: property.property_owner,
        landlord_email: property.owner_email,
        property_address: property.address,
        monthly_rent: property.monthly_rent,
        lease_start_date: formData.lease_start_date,
        lease_end_date: formData.lease_end_date,
        deposit_amount: formData.deposit_amount,
        contract_content: formData.contract_content,
        status: 'draft',
      };

      return await base44.entities.RentalContract.create(contractData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setShowNewForm(false);
    },
  });

  const sendContractMutation = useMutation({
    mutationFn: async (contractId) => {
      return await base44.functions.invoke('sendContractForSignature', { contract_id: contractId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  const deleteContractMutation = useMutation({
    mutationFn: async (contractId) => {
      return await base44.entities.RentalContract.delete(contractId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  const signContractMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('signContract', {
        contract_id: viewingContractId,
        role: signatureRole,
        signature_name: signatureName,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setViewingContractId(null);
      setSignatureName('');
    },
  });

  const viewingContract = viewingContractId ? contracts.find(c => c.id === viewingContractId) : null;
  const isAlreadySigned = viewingContract && (signatureRole === 'tenant' ? viewingContract.tenant_signed : viewingContract.landlord_signed);

  if (contractsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = {
    total: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    signed: contracts.filter(c => c.status === 'fully_signed').length,
    pending: contracts.filter(c => c.status === 'tenant_signed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-orange-600 mb-2">{t('rental_contracts')}</h1>
            <p className="text-slate-600">{t('contracts_subtitle')}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600">Total Contracts</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600">Drafts</p>
              <p className="text-2xl font-bold text-orange-600">{stats.draft}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600">Awaiting Signature</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600">Fully Signed</p>
              <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
            </div>
          </div>

          {/* Create Button */}
          <div className="mb-6">
            <Button
              onClick={() => setShowNewForm(!showNewForm)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-11"
            >
              <FileText className="w-5 h-5 mr-2" />
              {t('create_new_contract')}
            </Button>
          </div>

          {/* Form */}
          {showNewForm && (
            <div className="mb-8">
              <ContractForm
                inquiries={inquiries}
                properties={properties}
                onSubmit={(data) => createContractMutation.mutate(data)}
                onCancel={() => setShowNewForm(false)}
                isLoading={createContractMutation.isPending}
              />
            </div>
          )}

          {/* Empty State */}
          {contracts.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No contracts yet. Create your first contract to get started.</p>
            </div>
          )}

          {/* Contracts List */}
          {contracts.length > 0 && (
            <div className="space-y-4">
              {contracts.map(contract => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onSend={(id) => sendContractMutation.mutate(id)}
                  onView={(id) => setViewingContractId(id)}
                  onDelete={(id) => {
                    if (confirm('Are you sure you want to delete this contract?')) {
                      deleteContractMutation.mutate(id);
                    }
                  }}
                  isSending={sendContractMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}