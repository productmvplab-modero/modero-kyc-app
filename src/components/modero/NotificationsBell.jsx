import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, FileText, CreditCard, Shield, Clock, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
  follow_up: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Follow Up' },
  document_review: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Document Review' },
  id_verification: { icon: Shield, color: 'text-violet-500', bg: 'bg-violet-50', label: 'ID Verification' },
  credit_check: { icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Credit Check' },
  decision_pending: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Decision Needed' },
};

export default function NotificationsBell({ onOpenInquiry }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', 50),
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(notifications.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-sm text-slate-800">Action Required</span>
                {unreadCount > 0 && (
                  <Badge className="bg-red-100 text-red-700 text-xs">{unreadCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-xs text-slate-500 hover:text-orange-600 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">All caught up! No pending actions.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const cfg = typeConfig[notif.type] || typeConfig.follow_up;
                  const Icon = cfg.icon;
                  return (
                    <div key={notif.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <Badge className={`${cfg.bg} ${cfg.color} text-[10px] px-1.5 py-0 border-0`}>
                              {cfg.label}
                            </Badge>
                            <span className="text-[10px] text-slate-400">
                              {notif.hours_stagnant}h stagnant
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">{notif.message}</p>
                          <div className="flex items-center justify-between mt-1.5 gap-2">
                            <span className="text-[10px] text-slate-400">
                              {notif.created_date ? formatDistanceToNow(new Date(notif.created_date), { addSuffix: true }) : ''}
                            </span>
                            <div className="flex items-center gap-2">
                              {onOpenInquiry && (
                                <button
                                  onClick={() => {
                                    onOpenInquiry(notif.inquiry_id);
                                    markReadMutation.mutate(notif.id);
                                    setOpen(false);
                                  }}
                                  className="text-[10px] text-orange-600 hover:underline flex items-center gap-0.5"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" /> View
                                </button>
                              )}
                              <button
                                onClick={() => markReadMutation.mutate(notif.id)}
                                className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}