import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Upload, 
  CheckCircle2, 
  Clock, 
  FileText, 
  DollarSign,
  CreditCard,
  Building2
} from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  screening: { label: 'Screening', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
  kyc_pending: { label: 'KYC Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  qualified: { label: 'Qualified', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: Clock },
  rented: { label: 'Rented', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle2 },
};

export default function TenantDetailsDialog({ inquiry, open, onOpenChange, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const StatusIcon = statusConfig[inquiry?.status]?.icon || Clock;

  if (!inquiry) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Inquiry.update(inquiry.id, {
        profile_picture_url: file_url
      });
      toast.success('Profile picture updated');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to upload picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Tenant Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-start gap-6 pb-6 border-b">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src={inquiry.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${inquiry.tenant_name}`} />
                <AvatarFallback className="text-2xl">
                  {inquiry.tenant_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Label htmlFor="picture" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="gap-2"
                    onClick={() => document.getElementById('picture').click()}
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </Label>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{inquiry.tenant_name}</h3>
                <p className="text-sm text-slate-600">{inquiry.tenant_email}</p>
                {inquiry.tenant_phone && <p className="text-sm text-slate-600">{inquiry.tenant_phone}</p>}
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge className={`${statusConfig[inquiry.status]?.color} border flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig[inquiry.status]?.label}
                </Badge>
                {inquiry.idealista_id && (
                  <Badge variant="outline" className="gap-1">
                    <FileText className="w-3 h-3" />
                    ID: {inquiry.idealista_id}
                  </Badge>
                )}
                {inquiry.kyc_verified && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    KYC Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b">
            <div>
              <Label className="text-slate-600">Monthly Income</Label>
              <p className="text-lg font-semibold">
                {inquiry.monthly_income ? `€${inquiry.monthly_income.toLocaleString()}` : '—'}
              </p>
            </div>
            <div>
              <Label className="text-slate-600">Employment Status</Label>
              <p className="text-lg font-semibold capitalize">
                {inquiry.employment_status?.replace('_', ' ') || '—'}
              </p>
            </div>
            <div>
              <Label className="text-slate-600">Credit Score</Label>
              <p className="text-lg font-semibold">
                {inquiry.credit_score || '—'}
              </p>
            </div>
            <div>
              <Label className="text-slate-600">Qualification Score</Label>
              <p className="text-lg font-semibold">
                {inquiry.qualification_score ? `${inquiry.qualification_score}/100` : '—'}
              </p>
            </div>
          </div>

          {/* KYC & Credit Check Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              KYC Verification Process
            </h4>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg">
                  <img 
                    src="https://logos-world.net/wp-content/uploads/2022/02/Dun-Bradstreet-Logo.png" 
                    alt="Dun & Bradstreet"
                    className="h-8 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Credit Check via Dun & Bradstreet</p>
                  <p className="text-sm text-slate-600">
                    Comprehensive credit history and risk assessment
                  </p>
                </div>
                {inquiry.kyc_verified ? (
                  <Badge className="bg-green-100 text-green-700">Completed</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <p className="text-xs text-slate-600">Payment History</p>
                  <p className="font-semibold text-sm">
                    {inquiry.credit_score ? (inquiry.credit_score > 700 ? 'Excellent' : inquiry.credit_score > 600 ? 'Good' : 'Fair') : '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600">Debt Ratio</p>
                  <p className="font-semibold text-sm">—</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600">Risk Level</p>
                  <p className="font-semibold text-sm">
                    {inquiry.qualification_score ? (inquiry.qualification_score > 70 ? 'Low' : inquiry.qualification_score > 40 ? 'Medium' : 'High') : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financing Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              Available Financing Options
            </h4>
            
            <div className="grid gap-3">
              {/* Klarna */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white p-2 rounded-lg">
                    <img 
                      src="https://cdn.worldvectorlogo.com/logos/klarna-1.svg" 
                      alt="Klarna"
                      className="h-6 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Klarna Financing</p>
                    <p className="text-sm text-slate-600">Flexible payment plans</p>
                  </div>
                  <CreditCard className="w-5 h-5 text-pink-600" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-600">Interest Rate</p>
                    <p className="font-semibold">From 0% APR</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Term</p>
                    <p className="font-semibold">3-36 months</p>
                  </div>
                </div>
              </div>

              {/* Santander */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white p-2 rounded-lg">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/2560px-Banco_Santander_Logotipo.svg.png" 
                      alt="Santander"
                      className="h-6 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Santander Rental Financing</p>
                    <p className="text-sm text-slate-600">Traditional bank loan</p>
                  </div>
                  <Building2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-600">Interest Rate</p>
                    <p className="font-semibold">From 4.5% APR</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Term</p>
                    <p className="font-semibold">Up to 60 months</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {inquiry.notes && (
            <div className="pt-4 border-t">
              <Label className="text-slate-600">Internal Notes</Label>
              <p className="text-sm text-slate-700 mt-1">{inquiry.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}