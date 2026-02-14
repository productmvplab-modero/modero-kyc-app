import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Upload, 
  Mail, 
  Phone, 
  Briefcase, 
  DollarSign,
  CreditCard,
  FileText,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  screening: { label: 'Screening', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
  kyc_pending: { label: 'KYC Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
  qualified: { label: 'Qualified', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
  rented: { label: 'Rented', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle2 },
};

const creditCheckConfig = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700', icon: XCircle },
};

export default function TenantDetailsDialog({ inquiry, open, onOpenChange }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const updateInquiryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Inquiry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Profile picture updated');
    },
  });

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateInquiryMutation.mutateAsync({
        id: inquiry.id,
        data: { profile_picture_url: file_url }
      });
    } catch (error) {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (!inquiry) return null;

  const StatusIcon = statusConfig[inquiry.status]?.icon || Clock;
  const CreditIcon = creditCheckConfig[inquiry.credit_check_status || 'pending']?.icon || Clock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tenant Application Details</DialogTitle>
          <DialogDescription>
            Complete KYC verification and financing information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Tenant Profile */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={inquiry.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${inquiry.tenant_name}`} />
                <AvatarFallback className="text-xl">
                  {inquiry.tenant_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="profile-upload" className="absolute bottom-0 right-0 cursor-pointer">
                <div className="bg-indigo-600 rounded-full p-1.5 hover:bg-indigo-700 transition-colors">
                  <Upload className="w-3 h-3 text-white" />
                </div>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900">{inquiry.tenant_name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="secondary" 
                  className={`${statusConfig[inquiry.status]?.color || 'bg-slate-100 text-slate-700'} border flex items-center gap-1`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig[inquiry.status]?.label || inquiry.status}
                </Badge>
                {inquiry.kyc_verified && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    KYC Verified
                  </Badge>
                )}
              </div>
              {inquiry.idealista_id && (
                <p className="text-sm text-slate-600 mt-2">
                  Idealista ID: <span className="font-medium text-slate-900">{inquiry.idealista_id}</span>
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Contact & Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900">{inquiry.tenant_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium text-slate-900">{inquiry.tenant_phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Monthly Income</p>
                <p className="text-sm font-medium text-slate-900">
                  {inquiry.monthly_income ? `€${inquiry.monthly_income.toLocaleString()}` : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Employment</p>
                <p className="text-sm font-medium text-slate-900 capitalize">
                  {inquiry.employment_status?.replace('_', ' ') || '—'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Credit Check - Dun & Bradstreet */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Credit Check Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Dun_%26_Bradstreet_logo.svg/320px-Dun_%26_Bradstreet_logo.svg.png" 
                    alt="Dun & Bradstreet"
                    className="h-8 object-contain"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Dun & Bradstreet</p>
                    <p className="text-xs text-slate-500">Credit Assessment Provider</p>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${creditCheckConfig[inquiry.credit_check_status || 'pending']?.color} flex items-center gap-1`}
                >
                  <CreditIcon className="w-3 h-3" />
                  {creditCheckConfig[inquiry.credit_check_status || 'pending']?.label}
                </Badge>
              </div>
              {inquiry.credit_score && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Credit Score</span>
                    <span className="text-lg font-semibold text-slate-900">{inquiry.credit_score}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        inquiry.credit_score >= 700 ? 'bg-emerald-500' :
                        inquiry.credit_score >= 600 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${(inquiry.credit_score / 850) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financing Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Financing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:border-pink-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Klarna_Logo_black.svg/320px-Klarna_Logo_black.svg.png" 
                      alt="Klarna"
                      className="h-6 object-contain"
                    />
                    {inquiry.financing_options?.includes('klarna') && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600">Pay in installments</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">0% interest available</p>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-red-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/320px-Banco_Santander_Logotipo.svg.png" 
                      alt="Santander"
                      className="h-6 object-contain"
                    />
                    {inquiry.financing_options?.includes('santander') && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600">Bank financing</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">Flexible payment plans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          {inquiry.notes && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Internal Notes</h4>
              <p className="text-sm text-slate-600">{inquiry.notes}</p>
            </div>
          )}

          <div className="text-xs text-slate-500">
            Applied on {format(new Date(inquiry.created_date), "MMMM d, yyyy 'at' h:mm a")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}