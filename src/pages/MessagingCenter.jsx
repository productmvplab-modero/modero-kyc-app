import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, FileText, CheckCircle2, AlertCircle, Clock, Zap, Search, Filter, Smartphone, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Header from '@/components/modero/Header';

const TEMPLATES = [
  {
    id: 'document_request',
    label: 'Request Documents',
    icon: FileText,
    color: 'bg-amber-100 text-amber-700',
    subject: 'Documents Needed for Your Application',
    body: (name) => `Dear ${name},\n\nTo process your application faster, please provide the following documents:\n\n• Proof of income (payslips or tax declaration)\n• Employment contract\n• ID document (passport or national ID)\n\nPlease reply to this email with the requested documents.\n\nThank you,\nModero Team`,
  },
  {
    id: 'status_update',
    label: 'Status Update',
    icon: Clock,
    color: 'bg-blue-100 text-blue-700',
    subject: 'Application Status Update',
    body: (name) => `Dear ${name},\n\nYour application is currently under review. We will notify you of any updates within 3-5 business days.\n\nThank you for your patience.\n\nBest regards,\nModero Team`,
  },
  {
    id: 'approval',
    label: 'Approval',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-700',
    subject: '🎉 Your Application Has Been Approved!',
    body: (name) => `Dear ${name},\n\nCongratulations! Your application has been approved. We would like to proceed with scheduling a viewing at your earliest convenience.\n\nPlease reply to confirm your availability.\n\nBest regards,\nModero Team`,
  },
  {
    id: 'schedule_viewing',
    label: 'Schedule Viewing',
    icon: Clock,
    color: 'bg-indigo-100 text-indigo-700',
    subject: 'Schedule Your Property Viewing',
    body: (name) => `Dear ${name},\n\nWe would like to invite you to view the property. Please let us know your preferred date and time from the available slots.\n\nBest regards,\nModero Team`,
  },
  {
    id: 'rejection',
    label: 'Rejection',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700',
    subject: 'Application Update',
    body: (name) => `Dear ${name},\n\nThank you for your interest and for completing the screening process. After careful review, we have decided to move forward with another applicant.\n\nWe wish you the best in your search.\n\nBest regards,\nModero Team`,
  },
];

const statusBadge = {
  new: 'bg-slate-100 text-slate-700',
  screening: 'bg-blue-100 text-blue-700',
  kyc_pending: 'bg-amber-100 text-amber-700',
  qualified: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  rented: 'bg-purple-100 text-purple-700',
};

export default function MessagingCenter() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch all inquiries for this owner
  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['inquiries', user?.email],
    queryFn: () => user?.email ? base44.entities.Inquiry.filter({ created_by: user.email }, '-created_date') : Promise.resolve([]),
    enabled: !!user?.email,
  });

  // Fetch messages for selected inquiry
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedInquiry?.id],
    queryFn: () => selectedInquiry?.id ? 
      base44.entities.Message.filter({ inquiry_id: selectedInquiry.id }, '-created_date', 50) : Promise.resolve([]),
    enabled: !!selectedInquiry?.id,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (payload) => base44.functions.invoke('sendTenantMessage', payload),
    onSuccess: () => {
      toast.success('Message sent successfully');
      setSubject('');
      setBody('');
      setSelectedType('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedInquiry.id] });
    },
    onError: () => toast.error('Failed to send message'),
  });

  const applyTemplate = (template) => {
    setSubject(template.subject);
    setBody(template.body(selectedInquiry.tenant_name || 'Applicant'));
    setSelectedType(template.id);
  };

  const handleSendMessage = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    sendMutation.mutate({
      inquiry_id: selectedInquiry.id,
      tenant_name: selectedInquiry.tenant_name,
      tenant_email: selectedInquiry.tenant_email,
      subject,
      body,
      type: selectedType || 'custom',
    });
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = inq.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inq.tenant_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h1 className="text-3xl font-bold text-slate-900">Messaging Center</h1>
            <Badge className="bg-green-100 text-green-700 whitespace-nowrap">💬 WhatsApp API Available</Badge>
          </div>
          <p className="text-slate-600">Manage applicant communications via email or WhatsApp, request documents, and schedule viewings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applicants List */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                  Applicants ({filteredInquiries.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 flex-1 overflow-y-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex flex-wrap gap-1">
                  {['', 'new', 'screening', 'qualified', 'rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                        statusFilter === status
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {status ? status.replace('_', ' ') : 'All'}
                    </button>
                  ))}
                </div>

                {/* Applicants */}
                <div className="space-y-2">
                  {filteredInquiries.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No applicants found</p>
                  ) : (
                    filteredInquiries.map(inquiry => (
                      <button
                        key={inquiry.id}
                        onClick={() => setSelectedInquiry(inquiry)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedInquiry?.id === inquiry.id
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-slate-200 hover:border-orange-200 hover:bg-orange-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">{inquiry.tenant_name}</p>
                            <p className="text-xs text-slate-500 truncate">{inquiry.tenant_email}</p>
                          </div>
                          <Badge className={`${statusBadge[inquiry.status] || statusBadge.new} text-xs whitespace-nowrap shrink-0`}>
                            {inquiry.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          {format(new Date(inquiry.created_date), 'MMM d, yyyy')}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Composer */}
          <div className="lg:col-span-2">
            {selectedInquiry ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b pb-3">
                  <CardTitle className="text-lg">
                    {selectedInquiry.tenant_name}
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{selectedInquiry.tenant_email}</p>
                </CardHeader>

                <CardContent className="pt-6 space-y-4 flex-1 overflow-y-auto">
                  {/* Quick Templates */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick Templates</p>
                    <div className="flex flex-wrap gap-2">
                      {TEMPLATES.map(template => {
                        const Icon = template.icon;
                        return (
                          <button
                            key={template.id}
                            onClick={() => applyTemplate(template)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:shadow-sm ${template.color} border-transparent`}
                          >
                            <Icon className="w-3 h-3" />
                            {template.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Compose */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Subject</label>
                      <Input
                        placeholder="Enter subject..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Message</label>
                      <textarea
                        className="w-full min-h-[150px] px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y bg-white"
                        placeholder="Write your message..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handleSendMessage}
                      disabled={sendMutation.isPending}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {sendMutation.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>

                  {/* Message History */}
                  {messages.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Message History</p>
                      <div className="space-y-3">
                        {messages.map(msg => (
                          <div key={msg.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{msg.subject}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{format(new Date(msg.created_date), 'MMM d, HH:mm')}</p>
                              </div>
                              <Badge className="text-xs">{msg.type}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap break-words">{msg.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-96">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">Select an applicant to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}