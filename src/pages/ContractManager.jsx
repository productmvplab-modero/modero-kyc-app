import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, X, CheckCircle2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Header from '@/components/modero/Header';
import ContractForm from '@/components/contracts/ContractForm';
import ContractCard from '@/components/contracts/ContractCard';
import ContractPartyDetails from '@/components/contracts/ContractPartyDetails';
import FinancialOverview from '@/components/contracts/FinancialOverview';
import ContractRightPanel from '@/components/contracts/ContractRightPanel';
import SendForSigningSection from '@/components/contracts/SendForSigningSection';

export default function ContractManager() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showNewForm, setShowNewForm] = useState(false);
  const [viewingContractId, setViewingContractId] = useState(null);
  const [signatureName, setSignatureName] = useState('');
  const [signatureRole, setSignatureRole] = useState('landlord');
  const [showPreview, setShowPreview] = useState(false);

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
  
  // Get inquiry and property data for viewing contract
  const viewingInquiry = viewingContract ? inquiries.find(i => i.id === viewingContract.inquiry_id) : null;
  const viewingProperty = viewingContract ? properties.find(p => p.id === viewingContract.property_id) : null;

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

          {/* Contract Preview Modal */}
          {showPreview && viewingContract && (
            <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4">
              <div className="bg-white rounded-t-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-slate-200 flex items-center justify-between p-6 rounded-t-2xl">
                  <h2 className="text-2xl font-bold text-slate-900">Contract Preview</h2>
                  <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-8 bg-slate-50">
                  <div className="bg-white border-2 border-slate-300 rounded-xl p-12 whitespace-pre-wrap font-normal text-base leading-relaxed text-slate-800 shadow-lg">
                    {viewingContract.contract_content}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contract Signature Modal */}
          {viewingContract && !showPreview && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 flex items-center justify-between p-4">
                  <h2 className="text-xl font-semibold text-slate-800">{t('sign_rental_contract')}</h2>
                  <button onClick={() => setViewingContractId(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6 p-6 h-full">
                  {/* Left Section - Contract Content */}
                  <div className="col-span-2 space-y-6 overflow-y-auto">
                    {/* Party Details */}
                    {viewingInquiry && viewingProperty && (
                      <ContractPartyDetails 
                        tenant={viewingInquiry} 
                        property={viewingProperty}
                        idealista_id={viewingInquiry.idealista_id}
                      />
                    )}

                    {/* Contract Content */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('contract_terms_label')}</h3>
                      <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto border border-slate-200">
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                          {viewingContract.contract_content}
                        </pre>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Signing as</label>
                      <select
                        value={signatureRole}
                        onChange={(e) => setSignatureRole(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="landlord">{t('landlord')}</option>
                        <option value="tenant">{t('tenant')}</option>
                      </select>
                    </div>

                    {/* Signature Section */}
                    {isAlreadySigned ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 text-green-700">
                          <CheckCircle2 className="w-6 h-6 shrink-0" />
                          <div>
                            <p className="font-semibold">{t('already_signed')}</p>
                            <p className="text-sm text-green-600">{t('you_have_signed')}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">{t('type_full_name')}</label>
                          <Input
                            type="text"
                            placeholder={t('enter_full_name')}
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            className="text-lg h-12"
                          />
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 border-2 border-dashed border-slate-300">
                          <p className="text-sm text-slate-600 mb-2">{t('your_signature')}:</p>
                          <p className="text-lg text-slate-800" style={{ fontStyle: 'italic', fontFamily: 'cursive' }}>
                            {signatureName || t('your_signature_preview')}
                          </p>
                        </div>

                        <Button
                          onClick={() => signContractMutation.mutate()}
                          disabled={!signatureName.trim() || signContractMutation.isPending}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold h-12"
                        >
                          {signContractMutation.isPending ? t('signing_contract') : t('sign_contract_btn')}
                        </Button>

                        {signContractMutation.isSuccess && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-green-700">{t('contract_signed_success')}</p>
                                <p className="text-sm text-green-600 mt-1">
                                  {signatureRole === 'tenant' ? t('tenant_will_sign_next') : t('both_parties_signed')}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {signContractMutation.isError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700 text-sm">{signContractMutation.error.message || 'Error signing contract'}</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Status Summary */}
                    <div className="pt-4 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('signature_status')}</h3>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className={`p-3 rounded-lg ${viewingContract.tenant_signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                          <p className="text-xs text-slate-600 mb-1">{t('tenant')}</p>
                          <p className="text-sm font-semibold text-slate-800">{viewingContract.tenant_signed ? '✓ ' + t('already_signed') : '○ ' + t('pending')}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${viewingContract.landlord_signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                          <p className="text-xs text-slate-600 mb-1">{t('landlord')}</p>
                          <p className="text-sm font-semibold text-slate-800">{viewingContract.landlord_signed ? '✓ ' + t('already_signed') : '○ ' + t('pending')}</p>
                        </div>
                      </div>

                      {/* Send for Digital Signing Button */}
                      {viewingContract.status === 'draft' && (
                        <Button
                          onClick={() => sendContractMutation.mutate(viewingContract.id)}
                          disabled={sendContractMutation.isPending}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {sendContractMutation.isPending ? 'Sending for Signature...' : 'Send for Digital Signing'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Right Panel - Financial Overview & Company Info */}
                  <div className="col-span-1 border-l border-slate-200 pl-6 overflow-y-auto space-y-4">
                    <SendForSigningSection
                      contract={viewingContract}
                      tenantEmail={viewingContract.tenant_email}
                      landlordEmail={viewingContract.landlord_email}
                      onSend={() => sendContractMutation.mutate(viewingContract.id)}
                      isSending={sendContractMutation.isPending}
                    />
                    <ContractRightPanel 
                      contract={viewingContract}
                      onPreview={() => setShowPreview(true)}
                      isProfessional={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
          </div>
          </div>
          );
          }