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

      {/* Company Information - Professional Realtor */}
      {isProfessional && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Company Information</CardTitle>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-slate-400 hover:text-slate-600"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-orange-600 uppercase mb-1">Company Name</label>
                  <Input
                    value={editData.companyName}
                    onChange={(e) => setEditData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Company name"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-orange-600 uppercase mb-1">Company Logo</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center cursor-pointer hover:border-orange-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {editData.companyLogo ? (
                        <img src={editData.companyLogo} alt="Logo" className="h-12 mx-auto mb-1" />
                      ) : (
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      )}
                      <p className="text-xs text-slate-600">Upload Logo</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-orange-600 uppercase mb-1">Tax ID</label>
                  <Input
                    value={editData.taxId}
                    onChange={(e) => setEditData(prev => ({ ...prev, taxId: e.target.value }))}
                    placeholder="ES12345678A"
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-orange-600 uppercase mb-1">Bank Account</label>
                  <Input
                    value={editData.bankAccount}
                    onChange={(e) => setEditData(prev => ({ ...prev, bankAccount: e.target.value }))}
                    placeholder="ES91 2100 0418 4502..."
                    className="text-sm"
                  />
                </div>

                <Button
                  onClick={() => setIsEditing(false)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm h-8"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                {editData.companyLogo && (
                  <div className="text-center pb-2 border-b">
                    <img src={editData.companyLogo} alt="Logo" className="h-10 mx-auto" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-600">Company</p>
                  <p className="text-sm font-semibold text-slate-900">{editData.companyName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Tax ID</p>
                  <p className="text-sm font-semibold text-slate-900">{editData.taxId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Bank Account</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{editData.bankAccount}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

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