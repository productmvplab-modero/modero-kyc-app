import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, Clock, AlertCircle, Eye } from 'lucide-react';

const statusConfig = {
  paid: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Paid' },
  pending: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Pending' },
  overdue: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Overdue' },
};

export default function ContractRightPanel({ contract, onPreview }) {
  const financialData = {
    monthlyRent: contract?.monthly_rent || 0,
    depositAmount: contract?.deposit_amount || 0,
    payments: [
      { id: 1, month: 'March 2026', amount: contract?.monthly_rent || 0, dueDate: '2026-03-01', status: 'paid' },
      { id: 2, month: 'April 2026', amount: contract?.monthly_rent || 0, dueDate: '2026-04-01', status: 'pending' },
    ],
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
      <Button onClick={onPreview} className="w-full bg-slate-600 hover:bg-slate-700 text-white">
        <Eye className="w-4 h-4 mr-2" />
        Preview Contract
      </Button>
    </div>
  );
}