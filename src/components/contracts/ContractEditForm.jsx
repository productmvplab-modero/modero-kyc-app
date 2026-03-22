import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

export default function ContractEditForm({ contract, onSave, isSaving }) {
  const [form, setForm] = useState({
    landlord_name: contract.landlord_name || '',
    landlord_email: contract.landlord_email || '',
    property_address: contract.property_address || '',
    monthly_rent: contract.monthly_rent || '',
    deposit_amount: contract.deposit_amount || '',
    lease_start_date: contract.lease_start_date || '',
    lease_end_date: contract.lease_end_date || '',
    contract_content: contract.contract_content || '',
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Landlord Name</label>
          <Input value={form.landlord_name} onChange={e => update('landlord_name', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Landlord Email</label>
          <Input type="email" value={form.landlord_email} onChange={e => update('landlord_email', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-600 mb-1 block">Property Address</label>
          <Input value={form.property_address} onChange={e => update('property_address', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Monthly Rent (€)</label>
          <Input type="number" value={form.monthly_rent} onChange={e => update('monthly_rent', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Deposit Amount (€)</label>
          <Input type="number" value={form.deposit_amount} onChange={e => update('deposit_amount', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Lease Start Date</label>
          <Input type="date" value={form.lease_start_date} onChange={e => update('lease_start_date', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Lease End Date</label>
          <Input type="date" value={form.lease_end_date} onChange={e => update('lease_end_date', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">Contract Text</label>
        <Textarea
          value={form.contract_content}
          onChange={e => update('contract_content', e.target.value)}
          className="min-h-[200px] text-sm font-mono"
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => onSave(form)}
          disabled={isSaving}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}