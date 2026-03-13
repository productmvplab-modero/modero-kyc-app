import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  MapPin, Home, Euro, Users, TrendingUp, Clock,
  CheckCircle2, XCircle, FileText, Shield, AlertCircle,
  Phone, Mail, Building2, Upload, Pencil, Save, X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const funnelStages = [
  { key: 'new',        label: 'Inquiry Received',        color: 'bg-blue-500',    light: 'bg-blue-50 text-blue-800',    icon: FileText },
  { key: 'screening',  label: 'Verification in Progress', color: 'bg-amber-500',   light: 'bg-amber-50 text-amber-800',  icon: Shield },
  { key: 'kyc_pending',label: 'KYC Pending',              color: 'bg-purple-500',  light: 'bg-purple-50 text-purple-800',icon: Clock },
  { key: 'qualified',  label: 'Qualified',                color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
  { key: 'rejected',   label: 'Rejected',                 color: 'bg-red-500',     light: 'bg-red-50 text-red-800',      icon: XCircle },
];

const statusInfo = {
  new:         { label: 'Inquiry Received',        badge: 'bg-blue-100 text-blue-800',     icon: FileText },
  screening:   { label: 'Verification in Progress',badge: 'bg-amber-100 text-amber-800',   icon: Shield },
  kyc_pending: { label: 'KYC Pending',             badge: 'bg-purple-100 text-purple-800', icon: Clock },
  qualified:   { label: 'Qualified',               badge: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  rejected:    { label: 'Rejected',                badge: 'bg-red-100 text-red-800',       icon: XCircle },
  rented:      { label: 'Rented',                  badge: 'bg-indigo-100 text-indigo-800', icon: Home },
};

export default function PropertyDetailsDialog({ property, inquiries, open, onOpenChange }) {
  const [editingAgent, setEditingAgent] = useState(false);
  const [agentForm, setAgentForm] = useState({});
  const [uploadingPic, setUploadingPic] = useState(false);
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
    enabled: !!property,
  });

  const agent = agents.find(a => a.property_id === property?.id);

  useEffect(() => {
    if (agent) setAgentForm({ ...agent });
    else setAgentForm({ first_name: '', last_name: '', agency_name: '', city: '', mobile_phone: '', email: '', profile_picture_url: '' });
  }, [agent?.id, property?.id]);

  const saveMutation = useMutation({
    mutationFn: (data) => agent
      ? base44.entities.Agent.update(agent.id, data)
      : base44.entities.Agent.create({ ...data, property_id: property.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setEditingAgent(false);
      toast.success('Agent information saved');
    },
  });

  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPic(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAgentForm(f => ({ ...f, profile_picture_url: file_url }));
    setUploadingPic(false);
  };

  if (!property) return null;

  const propertyInquiries = (inquiries || []).filter(i => i.property_id === property.id);
  const total = propertyInquiries.length;
  const screeningCount = propertyInquiries.filter(i => i.status === 'screening' || i.status === 'kyc_pending').length;
  const qualifiedCount = propertyInquiries.filter(i => i.status === 'qualified').length;
  const rejectedCount = propertyInquiries.filter(i => i.status === 'rejected').length;
  const approvedCount = propertyInquiries.filter(i => i.status === 'rented').length;
  const conversionRate = total > 0 ? ((qualifiedCount / total) * 100).toFixed(1) : 0;

  const recentInquiries = [...propertyInquiries]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-600" />
            {property.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm font-medium">{property.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">City</p>
                    <p className="text-sm font-medium">{property.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Monthly Rent</p>
                    <p className="text-sm font-medium">€{property.monthly_rent?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Bedrooms</p>
                    <p className="text-sm font-medium">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Idealista ID</p>
                    <p className="text-sm font-medium">{property.idealista_id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <Badge className={property.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                      {property.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-3xl font-bold text-indigo-700">{total}</p>
                  <p className="text-xs text-slate-600 mt-1">Total Inquiries</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-3xl font-bold text-amber-700">{screeningCount}</p>
                  <p className="text-xs text-slate-600 mt-1">In Screening</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-3xl font-bold text-emerald-700">{qualifiedCount}</p>
                  <p className="text-xs text-slate-600 mt-1">Qualified</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
                  <p className="text-xs text-slate-600 mt-1">Rejected</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-3xl font-bold text-purple-700">{approvedCount}</p>
                  <p className="text-xs text-slate-600 mt-1">Approved / Rented</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-3xl font-bold text-slate-700">{conversionRate}%</p>
                  <p className="text-xs text-slate-600 mt-1">Conversion Rate</p>
                </div>
              </div>

              {/* Rental Funnel */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Rental Funnel</p>
                <div className="space-y-2">
                  {funnelStages.map((stage) => {
                    const count = propertyInquiries.filter(i => i.status === stage.key).length;
                    const pct = total > 0 ? (count / total) * 100 : 0;
                    const Icon = stage.icon;
                    return (
                      <div key={stage.key} className="flex items-center gap-3">
                        <div className="w-36 flex items-center gap-1.5 shrink-0">
                          <Icon className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs text-slate-600 truncate">{stage.label}</span>
                        </div>
                        <div className="flex-1">
                          <Progress value={pct} className="h-2" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Inquiries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Recent Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentInquiries.length > 0 ? (
                <div className="space-y-2">
                  {recentInquiries.map((inq) => {
                    const s = statusInfo[inq.status] || statusInfo.new;
                    const Icon = s.icon;
                    return (
                      <div key={inq.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          {inq.tenant_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">{inq.tenant_name}</p>
                          <p className="text-xs text-slate-500 truncate">
                            Ref: #{inq.idealista_id || inq.id?.slice(-6) || '—'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Badge className={`text-xs flex items-center gap-1 ${s.badge}`}>
                            <Icon className="w-3 h-3" />
                            {s.label}
                          </Badge>
                          {inq.created_date && (
                            <span className="text-xs text-slate-400">
                              {format(new Date(inq.created_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No inquiries yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Responsible Real Estate Agent */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Responsible Real Estate Agent
                </CardTitle>
                {!editingAgent ? (
                  <Button size="sm" variant="outline" onClick={() => setEditingAgent(true)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingAgent(false)}>
                      <X className="w-3.5 h-3.5 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => saveMutation.mutate(agentForm)} disabled={saveMutation.isPending}>
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingAgent ? (
                <div className="space-y-4">
                  {/* Profile picture upload */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={agentForm.profile_picture_url} />
                        <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
                          {agentForm.first_name?.charAt(0)}{agentForm.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 cursor-pointer">
                        <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center hover:bg-indigo-700">
                          <Upload className="h-3.5 w-3.5 text-white" />
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePicUpload} disabled={uploadingPic} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500">{uploadingPic ? 'Uploading…' : 'Click the icon to change photo'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'first_name', label: 'First Name' },
                      { key: 'last_name', label: 'Last Name' },
                      { key: 'agency_name', label: 'Agency Name' },
                      { key: 'city', label: 'City' },
                      { key: 'mobile_phone', label: 'Mobile Phone' },
                      { key: 'email', label: 'Email' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-xs text-slate-500 block mb-1">{label}</label>
                        <input
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          value={agentForm[key] || ''}
                          onChange={e => setAgentForm(f => ({ ...f, [key]: e.target.value }))}
                          placeholder={label}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : agent ? (
                <div className="flex items-start gap-5">
                  <Avatar className="h-20 w-20 shrink-0">
                    <AvatarImage src={agent.profile_picture_url} />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
                      {agent.first_name?.charAt(0)}{agent.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="text-sm font-semibold text-slate-900">{agent.first_name} {agent.last_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Agency</p>
                        <p className="text-sm font-medium text-slate-900">{agent.agency_name || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">City</p>
                        <p className="text-sm font-medium text-slate-900">{agent.city || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Mobile</p>
                        <p className="text-sm font-medium text-slate-900">{agent.mobile_phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-medium text-slate-900">{agent.email || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 text-sm mb-3">No agent assigned yet</p>
                  <Button size="sm" variant="outline" onClick={() => setEditingAgent(true)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Add Agent
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}