import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageContext';
import Header from '@/components/modero/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, X, Download, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TenantProfileCard from '@/components/contracts/TenantProfileCard';
import ContractPartyDetails from '@/components/contracts/ContractPartyDetails';
import ContractTemplateSelector from '@/components/contracts/ContractTemplateSelector';
import FinancingOffers from '@/components/contracts/FinancingOffers';

export default function ContractEdit() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('id');
  const queryClient = useQueryClient();

  const { data: contract, isLoading: contractLoading } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => base44.entities.RentalContract.filter({ id: contractId }).then(r => r[0]),
    enabled: !!contractId,
  });

  // Fetch inquiry linked to this contract so we can show TenantProfileCard
  const { data: inquiry } = useQuery({
    queryKey: ['inquiry', contract?.inquiry_id],
    queryFn: () => base44.entities.Inquiry.filter({ id: contract.inquiry_id }).then(r => r[0]),
    enabled: !!contract?.inquiry_id,
  });

  // Fetch property
  const { data: property } = useQuery({
    queryKey: ['property', contract?.property_id],
    queryFn: () => base44.entities.Property.filter({ id: contract.property_id }).then(r => r[0]),
    enabled: !!contract?.property_id,
  });

  const [formData, setFormData] = useState(null);
  const [templateOption, setTemplateOption] = useState('customize');
  const [financingOffers, setFinancingOffers] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (contract && !formData) {
      setFormData({
        lease_start_date: contract.lease_start_date || '',
        lease_end_date: contract.lease_end_date || '',
        monthly_rent: contract.monthly_rent || '',
        deposit_amount: contract.deposit_amount || '',
        contract_content: contract.contract_content || '',
        landlord_name: contract.landlord_name || '',
        landlord_email: contract.landlord_email || '',
        landlord_phone: '',
        landlord_address: contract.property_address || '',
      });
    }
  }, [contract]);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.RentalContract.update(contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      navigate('/ContractManager');
    },
  });

  const toggleFinancingOffer = (offerId) => {
    setFinancingOffers(prev =>
      prev.includes(offerId) ? prev.filter(id => id !== offerId) : [...prev, offerId]
    );
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (contractLoading || !formData) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <Header />
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">

        <Link to="/ContractManager" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Contracts
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Edit Contract</CardTitle>
            <Link to="/ContractManager" className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Tenant Profile */}
            {inquiry && <TenantProfileCard tenant={inquiry} />}

            {/* Party Details */}
            {inquiry && (
              <ContractPartyDetails
                tenant={inquiry}
                property={property}
              />
            )}

            {/* Landlord Info (editable) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Landlord Name</label>
                <Input
                  type="text"
                  placeholder="Full name"
                  value={formData.landlord_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, landlord_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Landlord Email</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.landlord_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, landlord_email: e.target.value }))}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('lease_start_date')}</label>
                <Input
                  type="date"
                  value={formData.lease_start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, lease_start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('lease_end_date')}</label>
                <Input
                  type="date"
                  value={formData.lease_end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, lease_end_date: e.target.value }))}
                />
              </div>
            </div>

            {/* Financials */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Rent (€)</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">€</span>
                  <Input
                    type="number"
                    placeholder="1200"
                    value={formData.monthly_rent}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_rent: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t('security_deposit')} (€)</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">€</span>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, deposit_amount: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            {/* Template Selector */}
            <ContractTemplateSelector
              selectedOption={templateOption}
              onOptionChange={setTemplateOption}
              onPdfUpload={() => {}}
            />

            {/* Contract Text */}
            {(templateOption === 'generate' || templateOption === 'customize') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">{t('contract_terms')}</label>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setShowPreview(true)} variant="outline" size="sm" className="text-xs">
                      👁️ Preview
                    </Button>
                    <span className="text-xs text-slate-500">Editable</span>
                  </div>
                </div>
                <Textarea
                  value={formData.contract_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_content: e.target.value }))}
                  rows={12}
                  className="font-normal text-sm leading-relaxed p-4 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg resize-none"
                  placeholder="Edit your contract terms here..."
                />
                <p className="text-xs text-slate-500 mt-2">{t('customize_template')}</p>
              </div>
            )}

            {/* Financing Offers */}
            {inquiry && (
              <FinancingOffers
                selectedOffers={financingOffers}
                onToggleOffer={toggleFinancingOffer}
                eligible={inquiry.qualification_score >= 60}
              />
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {saveMutation.isPending
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
              </Button>
              <Link to="/ContractManager" className="flex-1">
                <Button variant="outline" className="w-full">{t('cancel')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl border border-slate-200 bg-white">

            {/* Modero-branded header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">M</span>
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-tight">Modero</p>
                  <p className="text-orange-100 text-xs">Contract Preview</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-orange-100 text-xs">
                  {contract?.tenant_name && `For: ${contract.tenant_name}`}
                </span>
                <button
                  onClick={() => setShowPreview(false)}
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Document meta strip */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center gap-6 text-xs text-slate-500 flex-shrink-0">
              {contract?.property_address && <span>📍 {contract.property_address}</span>}
              {contract?.monthly_rent && <span>💶 €{Number(contract.monthly_rent).toLocaleString()}/mo</span>}
              {contract?.lease_start_date && <span>📅 {new Date(contract.lease_start_date).toLocaleDateString('en-GB')}</span>}
              <span className="ml-auto flex items-center gap-1"><Eye className="w-3 h-3" /> Preview mode</span>
            </div>

            {/* Document body */}
            <div className="overflow-y-auto flex-1 p-6 bg-slate-100">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-3xl mx-auto">
                {/* Doc header */}
                <div className="px-10 pt-10 pb-6 border-b border-slate-100 text-center">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">M</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Modero</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Residential Rental Agreement</h2>
                  <div className="h-0.5 w-24 bg-orange-400 mx-auto mt-3 rounded-full" />
                  <p className="text-xs text-slate-400 mt-2">{new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Parties */}
                {(contract?.landlord_name || contract?.tenant_name) && (
                  <div className="px-10 py-6 border-b border-slate-100">
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Parties</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-400 mb-1">LANDLORD</p>
                        <p className="font-semibold text-slate-800 text-sm">{formData.landlord_name || '—'}</p>
                        <p className="text-xs text-slate-500">{formData.landlord_email || '—'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs text-slate-400 mb-1">TENANT</p>
                        <p className="font-semibold text-slate-800 text-sm">{contract?.tenant_name || '—'}</p>
                        <p className="text-xs text-slate-500">{contract?.tenant_email || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financials */}
                {(formData.monthly_rent || formData.deposit_amount) && (
                  <div className="px-10 py-5 border-b border-slate-100 bg-orange-50/50">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-xs text-slate-400">Monthly Rent</p>
                        <p className="text-2xl font-bold text-orange-600">€{Number(formData.monthly_rent || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Security Deposit</p>
                        <p className="text-2xl font-bold text-slate-800">€{Number(formData.deposit_amount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contract body text */}
                <div className="px-10 py-8">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Terms & Conditions</p>
                  <div className="whitespace-pre-wrap font-normal text-sm leading-relaxed text-slate-700">
                    {formData.contract_content || <span className="text-slate-400 italic">No contract content yet.</span>}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
                  <span className="text-xs text-orange-500 font-semibold">Modero</span>
                  <span className="text-xs text-slate-400">www.moderokyc.com · Legally binding once signed</span>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="border-t border-slate-200 px-6 py-4 flex gap-3 bg-white flex-shrink-0">
              <Button onClick={() => setShowPreview(false)} variant="outline" className="flex-1">Close Preview</Button>
              <Button onClick={() => setShowPreview(false)} className="flex-1 bg-orange-600 hover:bg-orange-700">
                <Save className="w-4 h-4 mr-2" /> Continue Editing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}