import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertCircle, CheckCircle2, Clock, Eye, Plus } from 'lucide-react';

const statusConfig = {
  paid: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Paid' },
  pending: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Pending' },
  overdue: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Overdue' },
};

export default function FinancialOverview({ contract, onAddPayment, onViewDetails }) {
  // Sample financial data - in production, this would come from backend
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
        paidDate: '2026-03-01',
      },
      {
        id: 2,
        month: 'April 2026',
        amount: contract?.monthly_rent || 0,
        dueDate: '2026-04-01',
        status: 'pending',
        paidDate: null,
      },
    ],
    utilities: [
      {
        id: 1,
        type: 'Electricity',
        amount: 120,
        dueDate: '2026-04-15',
        status: 'pending',
      },
      {
        id: 2,
        type: 'Water',
        amount: 45,
        dueDate: '2026-03-20',
        status: 'overdue',
      },
    ],
    depositStatus: 'held',
  };

  const getTotalRent = () => {
    return financialData.payments.reduce((sum, p) => sum + p.amount, 0);
  };

  const getPaidAmount = () => {
    return financialData.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getPendingAmount = () => {
    return financialData.payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getUtilitiesTotalDue = () => {
    return financialData.utilities.reduce((sum, u) => sum + u.amount, 0);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">Monthly Rent</p>
          <p className="text-2xl font-bold text-blue-900">€{financialData.monthlyRent.toFixed(2)}</p>
          <p className="text-xs text-blue-600 mt-2">{financialData.payments.length} month(s)</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">Received</p>
          <p className="text-2xl font-bold text-green-900">€{getPaidAmount().toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-2">Paid on time</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
          <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-amber-900">€{getPendingAmount().toFixed(2)}</p>
          <p className="text-xs text-amber-600 mt-2">{financialData.payments.filter(p => p.status !== 'paid').length} pending</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <p className="text-xs text-orange-700 font-semibold uppercase tracking-wide mb-1">Security Deposit</p>
          <p className="text-2xl font-bold text-orange-900">€{financialData.depositAmount.toFixed(2)}</p>
          <p className="text-xs text-orange-600 mt-2 capitalize">{financialData.depositStatus}</p>
        </div>
      </div>

      {/* Rent Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Rent Payments
          </CardTitle>
          <Button size="sm" variant="outline" className="text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Record Payment
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {financialData.payments.map(payment => {
              const config = statusConfig[payment.status];
              const Icon = config.icon;
              return (
                <div key={payment.id} className={`${config.bg} border border-slate-200 rounded-lg p-4 flex items-start justify-between`}>
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-900">{payment.month}</p>
                        <Badge className={config.bg + ' text-xs border-0'}>{config.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Due: {new Date(payment.dueDate).toLocaleDateString('es-ES')}
                      </p>
                      {payment.paidDate && (
                        <p className="text-xs text-slate-500">
                          Paid: {new Date(payment.paidDate).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-slate-900">€{payment.amount.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Utility Invoices */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Utility Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {financialData.utilities.length > 0 ? (
              financialData.utilities.map(utility => {
                const config = statusConfig[utility.status];
                const Icon = config.icon;
                return (
                  <div key={utility.id} className={`${config.bg} border border-slate-200 rounded-lg p-4 flex items-start justify-between`}>
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900">{utility.type}</p>
                          <Badge className={config.bg + ' text-xs border-0'}>{config.label}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          Due: {new Date(utility.dueDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-slate-900">€{utility.amount.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No utility invoices recorded</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Total Utilities Due:</p>
            <p className="text-lg font-bold text-slate-900">€{getUtilitiesTotalDue().toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}