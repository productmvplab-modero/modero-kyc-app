import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown, Send } from 'lucide-react';
import TenantProfileCard from './TenantProfileCard';
import ContractTemplateSelector from './ContractTemplateSelector';
import FinancingOffers from './FinancingOffers';
import ContractPartyDetails from './ContractPartyDetails';

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

export default function ContractForm({ inquiries, onSubmit, onCancel, isLoading, properties = [], onSendForSigning }) {
  const { t } = useLanguage();
  const [selectedInquiry, setSelectedInquiry] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [templateOption, setTemplateOption] = useState('generate');
  const [financingOffers, setFinancingOffers] = useState([]);
  const [formData, setFormData] = useState({
    lease_start_date: '',
    lease_end_date: '',
    deposit_amount: '',
    contract_content: DEFAULT_CONTRACT_TEMPLATE,
  });

  const selectedTenant = inquiries.find(i => i.id === selectedInquiry);
  const selectedProperty = selectedTenant ? properties.find(p => p.id === selectedTenant.property_id) : null;

  const handleInquiryChange = (inquiryId) => {
    setSelectedInquiry(inquiryId);
    setTemplateOption('generate');
    setFinancingOffers([]);
    
    if (inquiryId) {
      setFormData(prev => ({
        ...prev,
        contract_content: DEFAULT_CONTRACT_TEMPLATE,
      }));
    }
  };

  const handleTemplateOptionChange = (option) => {
    setTemplateOption(option);
  };

  const handlePdfUpload = (file) => {
    // Handle PDF upload - in real app, would process the PDF
    console.log('PDF uploaded:', file);
  };

  const toggleFinancingOffer = (offerId) => {
    setFinancingOffers(prev =>
      prev.includes(offerId) ? prev.filter(id => id !== offerId) : [...prev, offerId]
    );
  };

  const handleSubmit = () => {
    if (!selectedInquiry || !formData.lease_start_date) {
      alert(t('pending'));
      return;
    }
    onSubmit({ inquiryId: selectedInquiry, ...formData });
  };

  const isValid = selectedInquiry && formData.lease_start_date && formData.lease_end_date && formData.deposit_amount;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('create_new_contract')}</CardTitle>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('select_tenant')}</label>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full h-11 px-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between"
            >
              {selectedTenant ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedTenant.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTenant.tenant_name}`} />
                    <AvatarFallback className="text-xs">{selectedTenant.tenant_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-900">{selectedTenant.tenant_name}</span>
                </div>
              ) : (
                <span className="text-sm text-slate-500">-- {t('select_tenant')} --</span>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {inquiries.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    {t('no_inquiries')}
                  </div>
                ) : (
                  inquiries.map(inq => (
                    <button
                      key={inq.id}
                      onClick={() => {
                        handleInquiryChange(inq.id);
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-orange-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={inq.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${inq.tenant_name}`} />
                          <AvatarFallback className="text-xs">{inq.tenant_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">{inq.tenant_name}</p>
                          <p className="text-xs text-slate-500 truncate">{inq.tenant_email}</p>
                        </div>
                      </div>
                      {inq.status === 'qualified' && (
                        <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 flex-shrink-0">✓</Badge>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tenant and Owner Details */}
        {selectedTenant && (
          <>
            <TenantProfileCard tenant={selectedTenant} />
            <ContractPartyDetails 
              tenant={selectedTenant} 
              property={selectedProperty}
              idealista_id={selectedTenant.idealista_id}
            />
          </>
        )}

        {selectedInquiry && (
          <>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('security_deposit')}</label>
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

            {/* Contract Template Selector */}
            <ContractTemplateSelector
              selectedOption={templateOption}
              onOptionChange={handleTemplateOptionChange}
              onPdfUpload={handlePdfUpload}
            />

            {/* Contract Terms - Show only for generate/customize */}
            {(templateOption === 'generate' || templateOption === 'customize') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">{t('contract_terms')}</label>
                  <span className="text-xs text-slate-500">Editable</span>
                </div>
                <Textarea
                  value={formData.contract_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_content: e.target.value }))}
                  rows={12}
                  className="font-normal text-sm leading-relaxed p-4 bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg resize-none"
                  placeholder="Edit your contract terms here..."
                />
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-slate-500">{t('customize_template')}</p>
                  <span className="text-xs text-orange-600 font-medium">• All changes will be saved to the contract</span>
                </div>
              </div>
            )}

            {/* Financing Offers */}
            <FinancingOffers
              selectedOffers={financingOffers}
              onToggleOffer={toggleFinancingOffer}
              eligible={selectedTenant.qualification_score >= 60}
            />

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !isValid}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? t('creating_contract') : t('create_contract')}
              </Button>
              <Button onClick={onCancel} variant="outline" className="flex-1">
                {t('cancel')}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}