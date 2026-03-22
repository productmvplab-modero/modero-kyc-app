import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageContext';
import Header from '@/components/modero/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ContractEdit() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('id');

  const queryClient = useQueryClient();

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => base44.entities.RentalContract.filter({ id: contractId }).then(r => r[0]),
    enabled: !!contractId,
  });

  const [formData, setFormData] = useState(null);

  // Initialise form once contract loads
  React.useEffect(() => {
    if (contract && !formData) {
      setFormData({
        tenant_name: contract.tenant_name || '',
        tenant_email: contract.tenant_email || '',
        landlord_name: contract.landlord_name || '',
        landlord_email: contract.landlord_email || '',
        property_address: contract.property_address || '',
        monthly_rent: contract.monthly_rent || '',
        deposit_amount: contract.deposit_amount || '',
        lease_start_date: contract.lease_start_date || '',
        lease_end_date: contract.lease_end_date || '',
        contract_content: contract.contract_content || '',
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

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  if (isLoading || !formData) return (
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
        {/* Back */}
        <Link to="/ContractManager" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-orange-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Contracts
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Edit Contract</h1>
          <p className="text-sm text-slate-500 mt-1">Tenant: {contract?.tenant_name}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Parties */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Parties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Tenant Name" value={formData.tenant_name} onChange={v => set('tenant_name', v)} />
              <Field label="Tenant Email" value={formData.tenant_email} onChange={v => set('tenant_email', v)} type="email" />
              <Field label="Landlord Name" value={formData.landlord_name} onChange={v => set('landlord_name', v)} />
              <Field label="Landlord Email" value={formData.landlord_email} onChange={v => set('landlord_email', v)} type="email" />
            </div>
          </div>

          {/* Property & Financials */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Property & Financials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Property Address" value={formData.property_address} onChange={v => set('property_address', v)} />
              </div>
              <Field label="Monthly Rent (€)" value={formData.monthly_rent} onChange={v => set('monthly_rent', v)} type="number" />
              <Field label="Security Deposit (€)" value={formData.deposit_amount} onChange={v => set('deposit_amount', v)} type="number" />
              <Field label="Lease Start" value={formData.lease_start_date} onChange={v => set('lease_start_date', v)} type="date" />
              <Field label="Lease End" value={formData.lease_end_date} onChange={v => set('lease_end_date', v)} type="date" />
            </div>
          </div>

          {/* Contract Text */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Contract Terms</h3>
            <Textarea
              value={formData.contract_content}
              onChange={e => set('contract_content', e.target.value)}
              rows={16}
              className="font-mono text-sm leading-relaxed"
            />
          </div>

          {/* Save */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {saveMutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>
            <Link to="/ContractManager">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-10"
      />
    </div>
  );
}