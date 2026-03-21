import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, MessageSquare, Send, FileText, CheckCircle2, AlertCircle, Clock, Mail, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TEMPLATES = [
  {
    id: 'document_request',
    label: 'Request Missing Docs',
    icon: FileText,
    color: 'bg-amber-100 text-amber-700',
    subject: 'Action Required: Missing Documents for Your Application',
    body: (name) => `Dear ${name},\n\nThank you for your interest. To continue processing your application, we need the following documents:\n\n• Proof of income (payslips or bank statements)\n• Valid ID document (passport or DNI/NIE)\n• Work contract or employment letter\n\nPlease upload them at your earliest convenience through the tenant portal.\n\nBest regards,\nModero KYC Team`,
  },
  {
    id: 'status_update',
    label: 'Application Update',
    icon: Clock,
    color: 'bg-blue-100 text-blue-700',
    subject: 'Update on Your Rental Application',
    body: (name) => `Dear ${name},\n\nWe wanted to let you know that your rental application is currently under review.\n\nOur team is verifying your documents and will be in touch shortly with the outcome.\n\nThank you for your patience.\n\nBest regards,\nModero KYC Team`,
  },
  {
    id: 'approval',
    label: 'Approval Notification',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-700',
    subject: '🎉 Congratulations! Your Application Has Been Approved',
    body: (name) => `Dear ${name},\n\nWe are delighted to inform you that your rental application has been approved!\n\nThe landlord has reviewed your profile and selected you as the preferred tenant. Our team will reach out to you within 24 hours to proceed with the next steps, including signing the rental agreement.\n\nCongratulations and welcome!\n\nBest regards,\nModero KYC Team`,
  },
  {
    id: 'rejection',
    label: 'Rejection Notice',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700',
    subject: 'Update on Your Rental Application',
    body: (name) => `Dear ${name},\n\nThank you for applying and for taking the time to complete the screening process.\n\nAfter careful review, we regret to inform you that your application was not selected for this particular property. This decision is not a reflection of your profile, as many factors influence the final selection.\n\nWe encourage you to explore other listings and wish you the best in your search.\n\nBest regards,\nModero KYC Team`,
  },
  {
    id: 'reminder',
    label: 'Verification Reminder',
    icon: Zap,
    color: 'bg-orange-100 text-orange-700',
    subject: 'Reminder: Complete Your Verification Steps',
    body: (name) => `Dear ${name},\n\nThis is a friendly reminder that your application still has pending verification steps.\n\nTo speed up the process and improve your qualification score, please complete:\n\n• ID verification via Identomat\n• Mobile number verification\n• Bank account connection (PSD2)\n\nCompleting these steps significantly improves your chances of approval.\n\nBest regards,\nModero KYC Team`,
  },
];

const typeIcon = {
  custom: MessageSquare,
  document_request: FileText,
  status_update: Clock,
  approval: CheckCircle2,
  rejection: AlertCircle,
  reminder: Zap,
};

const typeBadge = {
  custom: 'bg-slate-100 text-slate-700',
  document_request: 'bg-amber-100 text-amber-700',
  status_update: 'bg-blue-100 text-blue-700',
  approval: 'bg-emerald-100 text-emerald-700',
  rejection: 'bg-red-100 text-red-700',
  reminder: 'bg-orange-100 text-orange-700',
};

export default function MessagingPanel({ inquiry }) {
  const [expanded, setExpanded] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedType, setSelectedType] = useState('custom');
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', inquiry?.id],
    queryFn: () => base44.entities.Message.filter({ inquiry_id: inquiry.id }, '-created_date', 20),
    enabled: !!inquiry?.id && expanded,
  });

  const sendMutation = useMutation({
    mutationFn: (payload) => base44.functions.invoke('sendTenantMessage', payload),
    onSuccess: () => {
      toast.success('Message sent successfully');
      setSubject('');
      setBody('');
      setSelectedType('custom');
      queryClient.invalidateQueries({ queryKey: ['messages', inquiry.id] });
    },
    onError: (err) => toast.error('Failed to send message'),
  });

  const applyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setBody(tpl.body(inquiry.tenant_name || 'Applicant'));
    setSelectedType(tpl.id);
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }
    sendMutation.mutate({
      inquiry_id: inquiry.id,
      tenant_name: inquiry.tenant_name,
      tenant_email: inquiry.tenant_email,
      subject,
      body,
      type: selectedType,
    });
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
      <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 pb-3 px-3 sm:px-6 sm:pb-4">
        <button
          onClick={() => setExpanded(p => !p)}
          className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
        >
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
              <MessageSquare className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
            </div>
            Messaging
            {messages.length > 0 && (
              <Badge className="bg-orange-100 text-orange-700 text-xs ml-1">{messages.length}</Badge>
            )}
          </CardTitle>
          <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-4 sm:pt-5 px-3 sm:px-6 space-y-5">

          {/* Quick Templates */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick Templates</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:shadow-sm ${tpl.color} border-transparent`}
                  >
                    <Icon className="w-3 h-3" />
                    {tpl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compose */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">To</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700 truncate">{inquiry.tenant_name}</span>
                <span className="text-xs text-slate-400 truncate">({inquiry.tenant_email})</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Subject</label>
              <input
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                placeholder="Subject..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Message</label>
              <textarea
                className="w-full min-h-[120px] px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y bg-white"
                placeholder="Write your message..."
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                Sends via email + in-app log
              </div>
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                onClick={handleSend}
                disabled={sendMutation.isPending}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {sendMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>

          {/* Message History */}
          {messages.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Message History</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {messages.map((msg) => {
                  const Icon = typeIcon[msg.type] || MessageSquare;
                  return (
                    <div key={msg.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${typeBadge[msg.type]} text-xs`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {msg.type?.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs font-medium text-slate-700 line-clamp-1">{msg.subject}</span>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                          {msg.created_date ? format(new Date(msg.created_date), 'MMM d, HH:mm') : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{msg.body}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs text-emerald-600">Sent</span>
                        <span className="text-xs text-slate-400">· by {msg.sent_by}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}