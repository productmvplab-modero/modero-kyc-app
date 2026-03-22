import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, X, CheckCircle2, Send, FileDown, Mail } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('overview');

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
      const property = properties.find(p => p.id === inquiry.property_id);

      const contractData = {
        property_id: inquiry.property_id,
        inquiry_id: formData.inquiryId,
        tenant_name: inquiry.tenant_name,
        tenant_email: inquiry.tenant_email,
        landlord_name: formData.landlord_name || property?.property_owner || 'Unknown',
        landlord_email: formData.landlord_email || property?.owner_email || '',
        property_address: formData.landlord_address || property?.address || '',
        monthly_rent: formData.monthly_rent || property?.monthly_rent || 0,
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
                  onView={(id) => { setViewingContractId(id); setActiveTab('overview'); }}
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

          {/* Contract Preview Modal - Full Screen */}
          {showPreview && viewingContract && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full h-[95vh] max-w-4xl overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-500 flex items-center justify-between p-6 z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Contract Preview</h2>
                    <p className="text-orange-100 text-sm mt-1">Rental Agreement - {viewingContract.tenant_name}</p>
                  </div>
                  <button onClick={() => setShowPreview(false)} className="text-white hover:bg-orange-700 p-2 rounded-lg transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                  <div className="bg-white border-2 border-slate-200 rounded-xl p-12 whitespace-pre-wrap font-normal text-base leading-relaxed text-slate-800 shadow-md">
                    {viewingContract.contract_content}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white border-t border-slate-200 p-6 flex gap-3 justify-end">
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                    className="h-11"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const response = await base44.functions.invoke('generateContractPDF', { contract_id: viewingContract.id });
                        const link = document.createElement('a');
                        link.href = response.data.pdf_url;
                        link.download = `contract_${viewingContract.tenant_name}.pdf`;
                        link.click();
                      } catch (error) {
                        console.error('Error generating PDF:', error);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-11"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Contract Modal */}
          {viewingContract && !showPreview && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Rental Contract</h2>
                    <p className="text-sm text-slate-500">{viewingContract.tenant_name} · {viewingContract.property_address || 'No address'}</p>
                  </div>
                  <button onClick={() => { setViewingContractId(null); setSignatureName(''); }} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tab Bar */}
                <div className="flex border-b border-slate-200 flex-shrink-0 px-6">
                  {['overview', 'contract', 'financials'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 px-4 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
                        activeTab === tab
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab === 'overview' ? '📋 Overview' : tab === 'contract' ? '📄 Contract' : '💰 Financials'}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">

                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="space-y-5">
                      {/* Signing Status Cards */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Signature Status</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${viewingContract.tenant_signed ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${viewingContract.tenant_signed ? 'bg-green-100' : 'bg-white border-2 border-slate-300'}`}>
                              {viewingContract.tenant_signed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <span className="text-slate-400 text-sm">T</span>}
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Tenant</p>
                              <p className="text-sm font-semibold text-slate-800">{viewingContract.tenant_name}</p>
                              <p className={`text-xs font-medium ${viewingContract.tenant_signed ? 'text-green-600' : 'text-slate-400'}`}>{viewingContract.tenant_signed ? '✓ Signed' : 'Awaiting signature'}</p>
                            </div>
                          </div>
                          <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${viewingContract.landlord_signed ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${viewingContract.landlord_signed ? 'bg-green-100' : 'bg-white border-2 border-slate-300'}`}>
                              {viewingContract.landlord_signed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <span className="text-slate-400 text-sm">L</span>}
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Landlord</p>
                              <p className="text-sm font-semibold text-slate-800">{viewingContract.landlord_name || 'Landlord'}</p>
                              <p className={`text-xs font-medium ${viewingContract.landlord_signed ? 'text-green-600' : 'text-slate-400'}`}>{viewingContract.landlord_signed ? '✓ Signed' : 'Awaiting signature'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Send for Signing */}
                      <SendForSigningSection
                        contract={viewingContract}
                        tenantEmail={viewingContract.tenant_email}
                        landlordEmail={viewingContract.landlord_email}
                        onSend={() => sendContractMutation.mutate(viewingContract.id)}
                        isSending={sendContractMutation.isPending}
                      />

                      {/* Sign Here (Admin) */}
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700">Sign as Admin</h3>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Signing as</label>
                          <select
                            value={signatureRole}
                            onChange={(e) => setSignatureRole(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="landlord">Landlord</option>
                            <option value="tenant">Tenant</option>
                          </select>
                        </div>

                        {isAlreadySigned ? (
                          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                            <p className="text-sm font-semibold text-green-700">Already signed as {signatureRole}</p>
                          </div>
                        ) : (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Type your full name to sign</label>
                              <Input
                                type="text"
                                placeholder="Your full name"
                                value={signatureName}
                                onChange={(e) => setSignatureName(e.target.value)}
                                className="h-11"
                              />
                            </div>
                            {signatureName && (
                              <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg px-4 py-3">
                                <p className="text-xs text-slate-400 mb-1">Signature preview</p>
                                <p className="text-xl text-slate-800" style={{ fontStyle: 'italic', fontFamily: 'cursive' }}>{signatureName}</p>
                              </div>
                            )}
                            <Button
                              onClick={() => signContractMutation.mutate()}
                              disabled={!signatureName.trim() || signContractMutation.isPending}
                              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold h-11"
                            >
                              {signContractMutation.isPending ? 'Signing...' : `Sign as ${signatureRole === 'landlord' ? 'Landlord' : 'Tenant'}`}
                            </Button>
                            {signContractMutation.isError && (
                              <p className="text-red-600 text-sm">{signContractMutation.error.message || 'Error signing contract'}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CONTRACT TAB */}
                  {activeTab === 'contract' && (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <Button onClick={() => setShowPreview(true)} variant="outline" size="sm">
                          <FileDown className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                      </div>
                      <div className="bg-white border-2 border-slate-200 rounded-xl p-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 font-mono">
                        {viewingContract.contract_content}
                      </div>
                    </div>
                  )}

                  {/* FINANCIALS TAB */}
                  {activeTab === 'financials' && (
                    <ContractRightPanel
                      contract={viewingContract}
                      onPreview={() => setShowPreview(true)}
                    />
                  )}

                </div>
              </div>
            </div>
          )}
          </div>
          </div>
          </div>
          );
          }