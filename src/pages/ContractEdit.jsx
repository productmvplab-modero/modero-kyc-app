import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageContext';
import Header from '@/components/modero/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';
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
      <div className="max-w-3xl mx-auto px-4 py-8">

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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>Contract Preview</CardTitle>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1 p-6">
              <div className="bg-white border border-slate-200 rounded-lg p-8 whitespace-pre-wrap font-normal text-sm leading-relaxed text-slate-800">
                {formData.contract_content}
              </div>
            </CardContent>
            <div className="border-t p-4 flex gap-3 bg-slate-50">
              <Button onClick={() => setShowPreview(false)} variant="outline" className="flex-1">Close Preview</Button>
              <Button onClick={() => setShowPreview(false)} className="flex-1 bg-orange-600 hover:bg-orange-700">Continue Editing</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}