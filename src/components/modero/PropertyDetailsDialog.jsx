import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  MapPin, Home, Euro, Users, TrendingUp, Clock,
  CheckCircle2, XCircle, FileText, Shield, AlertCircle,
  Phone, Mail, Building2, Upload, User
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

const funnelStages = [
  { key: 'new',        label: 'Inquiry Received',        color: 'bg-blue-500',    light: 'bg-blue-50 text-blue-800',    icon: FileText },
  { key: 'screening',  label: 'Verification in Progress', color: 'bg-amber-500',   light: 'bg-amber-50 text-amber-800',  icon: Shield },
  { key: 'kyc_pending',label: 'KYC Pending',              color: 'bg-amber-500',   light: 'bg-amber-50 text-amber-800',  icon: Clock },
  { key: 'qualified',  label: 'Qualified',                color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
  { key: 'rejected',   label: 'Rejected',                 color: 'bg-red-500',     light: 'bg-red-50 text-red-800',      icon: XCircle },
];

const statusInfo = {
  new:         { label: 'Inquiry Received',        badge: 'bg-blue-100 text-blue-800',     icon: FileText },
  screening:   { label: 'Verification in Progress',badge: 'bg-amber-100 text-amber-800',   icon: Shield },
  kyc_pending: { label: 'KYC Pending',             badge: 'bg-amber-100 text-amber-800',   icon: Clock },
  qualified:   { label: 'Qualified',               badge: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  rejected:    { label: 'Rejected',                badge: 'bg-red-100 text-red-800',       icon: XCircle },
  rented:      { label: 'Rented',                  badge: 'bg-orange-100 text-orange-800', icon: Home },
};

export default function PropertyDetailsDialog({ property, inquiries, open, onOpenChange }) {
  const { t } = useLanguage();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const queryClient = useQueryClient();

  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Property.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });

  const handleAgentPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !property) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updatePropertyMutation.mutate({ id: property.id, data: { agent_photo_url: file_url } });
      toast.success('Agent photo updated');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
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
            <Home className="w-6 h-6 text-orange-500" />
            {property.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('property_information')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{t('address')}</p>
                    <p className="text-sm font-medium">{property.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{t('city')}</p>
                    <p className="text-sm font-medium">{property.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{t('monthly_rent')}</p>
                    <p className="text-sm font-medium">€{property.monthly_rent?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{t('bedrooms')}</p>
                    <p className="text-sm font-medium">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{t('idealista_id')}</p>
                    <p className="text-sm font-medium">{property.idealista_id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{t('property_status_label')}</p>
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
                <TrendingUp className="w-5 h-5 text-orange-500" />
                {t('performance_metrics')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-3xl font-bold text-orange-700">{total}</p>
                  <p className="text-xs text-slate-600 mt-1">{t('total_inquiries')}</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-3xl font-bold text-amber-700">{screeningCount}</p>
                  <p className="text-xs text-slate-600 mt-1">{t('in_screening')}</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-3xl font-bold text-emerald-700">{qualifiedCount}</p>
                  <p className="text-xs text-slate-600 mt-1">{t('status_qualified')}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
                  <p className="text-xs text-slate-600 mt-1">{t('status_rejected')}</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-3xl font-bold text-amber-700">{approvedCount}</p>
                  <p className="text-xs text-slate-600 mt-1">{t('approved_rented')}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-3xl font-bold text-slate-700">{conversionRate}%</p>
                  <p className="text-xs text-slate-600 mt-1">{t('conversion_rate')}</p>
                </div>
              </div>

              {/* Rental Funnel */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">{t('rental_funnel')}</p>
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

          {/* Responsible Real Estate Agent */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                {t('responsible_agent')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Agent photo with upload */}
                <div className="relative shrink-0">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={property.agent_photo_url} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-400 to-amber-400 text-white">
                      {property.agent_first_name ? property.agent_first_name.charAt(0) : <User className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                      {uploadingPhoto ? (
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAgentPhotoUpload}
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>

                {/* Agent details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">{t('name_label')}</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {property.agent_first_name || property.agent_last_name
                        ? `${property.agent_first_name || ''} ${property.agent_last_name || ''}`.trim()
                        : '—'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">{t('agency_label')}</p>
                      <p className="text-sm font-medium text-slate-900">{property.agent_agency || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">{t('city')}</p>
                      <p className="text-sm font-medium text-slate-900">{property.agent_city || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">{t('mobile_label')}</p>
                      {property.agent_phone ? (
                        <a href={`tel:${property.agent_phone}`} className="text-sm font-medium text-orange-600 hover:underline">
                          {property.agent_phone}
                        </a>
                      ) : <p className="text-sm font-medium text-slate-900">—</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">{t('email_label')}</p>
                      {property.agent_email ? (
                        <a href={`mailto:${property.agent_email}`} className="text-sm font-medium text-orange-600 hover:underline">
                          {property.agent_email}
                        </a>
                      ) : <p className="text-sm font-medium text-slate-900">—</p>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Inquiries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                {t('recent_inquiries')}
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
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-semibold text-sm shrink-0">
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
                  <p>{t('no_inquiries')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}