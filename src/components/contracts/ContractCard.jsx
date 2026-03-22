import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { FileText, Send, CheckCircle2, Clock, AlertCircle, Eye, Trash2, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const statusConfig = {
  draft: { icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-100', label: 'Draft' },
  sent: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Sent' },
  tenant_signed: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Tenant Signed' },
  fully_signed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Fully Signed' },
};

export default function ContractCard({ contract, onSend, onView, onDelete, isSending }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[contract.status] || statusConfig.draft;
  const Icon = config.icon;

  const fmtDate = (d) => {
    try { return d ? format(new Date(d), 'MMM d, yyyy') : '—'; } catch { return '—'; }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Collapsed row — click to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-orange-500" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{contract.tenant_name}</p>
            <p className="text-xs text-slate-400 truncate">{contract.property_address || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 space-y-4">
          {/* Details row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Lease Start</p>
              <p className="font-medium text-slate-700">{fmtDate(contract.lease_start_date)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Lease End</p>
              <p className="font-medium text-slate-700">{fmtDate(contract.lease_end_date)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Monthly Rent</p>
              <p className="font-semibold text-orange-600">€{Number(contract.monthly_rent || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Landlord</p>
              <p className="font-medium text-slate-700 truncate">{contract.landlord_name || '—'}</p>
            </div>
          </div>

          {/* Signature status */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-2.5 rounded-lg text-sm border ${contract.tenant_signed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
              <p className="text-xs text-slate-500 mb-1">{t('tenant_signature_label')}</p>
              {contract.tenant_signed
                ? <p className="font-semibold text-green-700">{contract.tenant_signature}</p>
                : <p className="text-slate-400">{t('pending')}</p>}
            </div>
            <div className={`p-2.5 rounded-lg text-sm border ${contract.landlord_signed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}>
              <p className="text-xs text-slate-500 mb-1">{t('landlord_signature_label')}</p>
              {contract.landlord_signed
                ? <p className="font-semibold text-green-700">{contract.landlord_signature}</p>
                : <p className="text-slate-400">{t('pending')}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {contract.status === 'draft' && (
              <Button
                onClick={() => onSend(contract.id)}
                disabled={isSending}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
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
              <Eye className="w-4 h-4" />
            </Button>
            <Link to={`/ContractEdit?id=${contract.id}`}>
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
            </Link>
            <Button
              onClick={() => onDelete(contract.id)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:border-red-300 ml-auto"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}