import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import TenantProfileCard from './TenantProfileCard';
import ContractTemplateSelector from './ContractTemplateSelector';
import FinancingOffers from './FinancingOffers';

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

export default function ContractForm({ inquiries, onSubmit, onCancel, isLoading, properties = [] }) {
  const { t } = useLanguage();
  const [selectedInquiry, setSelectedInquiry] = useState('');
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
          <select
            value={selectedInquiry}
            onChange={(e) => handleInquiryChange(e.target.value)}
            className="w-full h-10 px-4 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">-- {t('select_tenant')} --</option>
            {inquiries.map(inq => (
              <option key={inq.id} value={inq.id}>
                {inq.tenant_name} • {inq.tenant_email} {inq.status === 'qualified' ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Tenant Profile Summary */}
        {selectedTenant && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
            <h4 className="font-semibold text-slate-900 mb-3">Tenant Profile</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-600 text-xs mb-1">Status</p>
                <p className="font-semibold text-slate-900 capitalize flex items-center gap-2">
                  {selectedTenant.status} {selectedTenant.status === 'qualified' && <span className="text-orange-600">✓</span>}
                </p>
              </div>
              <div>
                <p className="text-slate-600 text-xs mb-1">Qualification Score</p>
                <p className="font-semibold text-slate-900">{selectedTenant.qualification_score || 'N/A'}/100</p>
              </div>
              <div>
                <p className="text-slate-600 text-xs mb-1">Employment</p>
                <p className="font-semibold text-slate-900 capitalize">{selectedTenant.employment_status || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-600 text-xs mb-1">Monthly Income</p>
                <p className="font-semibold text-slate-900">€{selectedTenant.monthly_income?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </div>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('contract_terms')}</label>
              <Textarea
                value={formData.contract_content}
                onChange={(e) => setFormData(prev => ({ ...prev, contract_content: e.target.value }))}
                rows={10}
                className="font-mono text-xs"
              />
              <p className="text-xs text-slate-500 mt-2">{t('customize_template')}</p>
            </div>

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