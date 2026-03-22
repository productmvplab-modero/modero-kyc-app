import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, Clock, AlertCircle, Eye, Upload, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

const statusConfig = {
  paid: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Paid' },
  pending: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Pending' },
  overdue: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Overdue' },
};

export default function ContractRightPanel({ contract, onPreview, isProfessional = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    companyName: 'Your Company Name',
    companyLogo: null,
    taxId: 'ES12345678A',
    bankAccount: 'ES91 2100 0418 4502 0005 1332',
    customFields: [],
  });

  const addCustomField = () => setEditData(prev => ({ ...prev, customFields: [...prev.customFields, { label: '', value: '' }] }));
  const removeCustomField = (i) => setEditData(prev => ({ ...prev, customFields: prev.customFields.filter((_, idx) => idx !== i) }));
  const updateCustomField = (i, key, val) => setEditData(prev => {
    const updated = [...prev.customFields];
    updated[i] = { ...updated[i], [key]: val };
    return { ...prev, customFields: updated };
  });

  const financialData = {
    monthlyRent: contract?.monthly_rent || 0,
    depositAmount: contract?.deposit_amount || 0,
    payments: [
      {
        id: 1,
        month: 'March 2026',
        amount: contract?.monthly_rent || 0,
        dueDate: '2026-03-01',
        status: 'paid',
      },
      {
        id: 2,
        month: 'April 2026',
        amount: contract?.monthly_rent || 0,
        dueDate: '2026-04-01',
        status: 'pending',
      },
    ],
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditData(prev => ({ ...prev, companyLogo: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">Monthly Rent</p>
          <p className="text-xl font-bold text-blue-900">€{financialData.monthlyRent.toFixed(2)}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-orange-700 font-semibold uppercase tracking-wide mb-1">Deposit</p>
          <p className="text-xl font-bold text-orange-900">€{financialData.depositAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Rent Payments List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Rent Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {financialData.payments.map(payment => {
            const config = statusConfig[payment.status];
            const Icon = config.icon;
            return (
              <div key={payment.id} className={`${config.bg} border border-slate-200 rounded p-2`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Icon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900">{payment.month}</p>
                      <p className="text-xs text-slate-600">{new Date(payment.dueDate).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                  <Badge className="ml-2 text-xs">{config.label}</Badge>
                </div>
                <p className="text-sm font-semibold text-slate-900 mt-1">€{payment.amount.toFixed(2)}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Preview Button */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-orange-200">
          <h3 className="text-lg font-bold text-orange-900">Real Estate Agent</h3>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            size="sm"
            className={isEditing ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'border border-orange-300 bg-white text-orange-700 hover:bg-orange-100'}
            variant="outline"
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-orange-700 mb-1">Company Name</label>
              <Input value={editData.companyName} onChange={(e) => setEditData(prev => ({ ...prev, companyName: e.target.value }))} placeholder="Company name" className="text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-orange-700 mb-1">Company Logo</label>
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-3 text-center cursor-pointer hover:border-orange-500 transition">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  {editData.companyLogo ? (
                    <img src={editData.companyLogo} alt="Logo" className="h-12 mx-auto mb-1" />
                  ) : (
                    <Upload className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  )}
                  <p className="text-xs text-orange-600">Upload Logo</p>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-orange-700 mb-1">Tax ID</label>
                <Input value={editData.taxId} onChange={(e) => setEditData(prev => ({ ...prev, taxId: e.target.value }))} placeholder="ES12345678A" className="text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-orange-700 mb-1">Bank Account</label>
                <Input value={editData.bankAccount} onChange={(e) => setEditData(prev => ({ ...prev, bankAccount: e.target.value }))} placeholder="ES91 2100 0418..." className="text-sm" />
              </div>
            </div>

            {editData.customFields.map((field, i) => (
              <div key={i} className="flex gap-2 items-end border-t border-orange-200 pt-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Field Name</label>
                  <Input value={field.label} onChange={e => updateCustomField(i, 'label', e.target.value)} placeholder="e.g. License No." className="text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Value</label>
                  <Input value={field.value} onChange={e => updateCustomField(i, 'value', e.target.value)} placeholder="Value" className="text-sm" />
                </div>
                <Button onClick={() => removeCustomField(i)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 mb-0.5">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button onClick={addCustomField} variant="outline" className="w-full text-orange-600 border-orange-300 hover:bg-orange-100">
              <Plus className="w-4 h-4 mr-2" /> Add Field
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {editData.companyLogo && (
              <div className="col-span-2 text-center pb-2 border-b border-orange-200">
                <img src={editData.companyLogo} alt="Logo" className="h-10 mx-auto" />
              </div>
            )}
            <div className="bg-white border border-orange-200 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-orange-600 mb-0.5">Company</p>
              <p className="text-sm font-medium text-slate-800">{editData.companyName}</p>
            </div>
            <div className="bg-white border border-orange-200 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-orange-600 mb-0.5">Tax ID</p>
              <p className="text-sm font-medium text-slate-800">{editData.taxId}</p>
            </div>
            <div className="col-span-2 bg-white border border-orange-200 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-orange-600 mb-0.5">Bank Account</p>
              <p className="text-sm font-medium text-slate-800 truncate">{editData.bankAccount}</p>
            </div>
            {editData.customFields.filter(f => f.label).map((field, i) => (
              <div key={i} className="bg-white border border-orange-200 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-orange-600 mb-0.5">{field.label}</p>
                <p className="text-sm font-medium text-slate-800">{field.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Button */}
      <Button
        onClick={onPreview}
        className="w-full bg-slate-600 hover:bg-slate-700 text-white"
      >
        <Eye className="w-4 h-4 mr-2" />
        Preview Contract
      </Button>
    </div>
  );
}

ContractRightPanel.defaultProps = {
  isProfessional: false,
};