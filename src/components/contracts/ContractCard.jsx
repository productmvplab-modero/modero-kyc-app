import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Send, CheckCircle2, Clock, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  draft: { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Draft' },
  sent: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Sent' },
  tenant_signed: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Tenant Signed' },
  fully_signed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Fully Signed' },
};

export default function ContractCard({ contract, onSend, onView, onDelete, isSending }) {
  const { t } = useLanguage();
  const config = statusConfig[contract.status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Property & Tenant Info */}
          <div className="md:col-span-2">
            <div className="flex items-start gap-3 mb-3">
              <FileText className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-800">{contract.property_address}</h3>
                <p className="text-sm text-slate-600">{t('tenant')}: {contract.tenant_name}</p>
              </div>
            </div>
          </div>

          {/* Lease Info */}
          <div>
            <p className="text-xs text-slate-500 mb-1">{t('lease_period')}</p>
            <p className="font-semibold text-slate-800">
              {format(new Date(contract.lease_start_date), 'MMM d')} - {format(new Date(contract.lease_end_date), 'MMM d')}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs text-slate-500 mb-1">{t('status_label')}</p>
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className="text-sm font-semibold text-slate-700">{contract.status}</span>
            </div>
          </div>

          {/* Signature Status */}
          <div className="md:col-span-4 pt-3 border-t">
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-2.5 rounded-lg text-sm ${contract.tenant_signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                <p className="text-xs text-slate-600 mb-1">{t('tenant_signature_label')}</p>
                {contract.tenant_signed ? (
                  <p className="font-semibold text-green-700">{contract.tenant_signature}</p>
                ) : (
                  <p className="text-slate-500">{t('pending')}</p>
                )}
              </div>
              <div className={`p-2.5 rounded-lg text-sm ${contract.landlord_signed ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'}`}>
                <p className="text-xs text-slate-600 mb-1">{t('landlord_signature_label')}</p>
                {contract.landlord_signed ? (
                  <p className="font-semibold text-green-700">{contract.landlord_signature}</p>
                ) : (
                  <p className="text-slate-500">{t('pending')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="md:col-span-4 flex flex-wrap gap-2 pt-3 border-t">
            {contract.status === 'draft' && (
              <Button
                onClick={() => onSend(contract.id)}
                disabled={isSending}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Send className="w-4 h-4 mr-1" />
                {isSending ? t('sending') : t('send_for_signature')}
              </Button>
            )}
            <Button
              onClick={() => onView(contract.id)}
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              onClick={() => onDelete(contract.id)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}