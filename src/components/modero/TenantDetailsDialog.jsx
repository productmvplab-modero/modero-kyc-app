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
  AlertCircle,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Users,
  Paperclip,
  Link,
  MapPin,
  Shield,
  Linkedin,
  Facebook,
  Globe,
  Target,
  ThumbsUp,
  ThumbsDown,
  Minus
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

const processSteps = [
  { step: 1, label: 'Initial Contact' },
  { step: 2, label: 'Document Review' },
  { step: 3, label: 'Credit Check' },
  { step: 4, label: 'Final Review' },
  { step: 5, label: 'Approved' },
];

export default function TenantDetailsDialog({ inquiry, open, onOpenChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const queryClient = useQueryClient();

  const updateInquiryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Inquiry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Updated successfully');
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

  const handleProgressChange = (newStep) => {
    updateInquiryMutation.mutate({
      id: inquiry.id,
      data: { progress_step: newStep }
    });
  };

  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(docType);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const documents = inquiry.documents || {};
      documents[docType] = file_url;
      
      await updateInquiryMutation.mutateAsync({
        id: inquiry.id,
        data: { documents }
      });
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleBankConnect = () => {
    updateInquiryMutation.mutate({
      id: inquiry.id,
      data: { 
        bank_account_connected: true,
        bank_verification_status: 'verified'
      }
    });
    toast.success('Bank account connected successfully');
  };

  const handleLandlordDecision = (decision) => {
    let newStatus = inquiry.status;
    if (decision === 'approved') {
      newStatus = 'qualified';
    } else if (decision === 'rejected') {
      newStatus = 'rejected';
    }
    
    updateInquiryMutation.mutate({
      id: inquiry.id,
      data: { 
        landlord_decision: decision,
        status: newStatus
      }
    });
  };

  if (!inquiry) return null;

  const StatusIcon = statusConfig[inquiry.status]?.icon || Clock;
  const CreditIcon = creditCheckConfig[inquiry.credit_check_status || 'pending']?.icon || Clock;

  const incomeRatio = inquiry.income_ratio || 0;
  const isIncomeRatioGood = incomeRatio <= 40;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tenant Application Details</DialogTitle>
          <DialogDescription>
            Complete KYC verification and financing information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Overall Score Card */}
          {inquiry.overall_score && (
            <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm mb-1">Modero Overall Score</p>
                    <p className="text-5xl font-bold">{inquiry.overall_score}<span className="text-2xl">/100</span></p>
                  </div>
                  <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                    <Target className="w-10 h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Bar */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-900">Application Progress</h4>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleProgressChange(Math.max(1, (inquiry.progress_step || 1) - 1))}
                    disabled={!inquiry.progress_step || inquiry.progress_step <= 1}
                    className="h-8 w-8 p-0 hover:bg-indigo-100 transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-medium text-slate-600 min-w-[80px] text-center">
                    Step {inquiry.progress_step || 1} of 5
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleProgressChange(Math.min(5, (inquiry.progress_step || 1) + 1))}
                    disabled={inquiry.progress_step >= 5}
                    className="h-8 w-8 p-0 hover:bg-indigo-100 transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {processSteps.map((step) => (
                    <button
                      key={step.step}
                      onClick={() => handleProgressChange(step.step)}
                      className="flex flex-col items-center gap-1 flex-1 group cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all transform ${
                        (inquiry.progress_step || 1) >= step.step
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-110'
                          : 'bg-slate-200 text-slate-400'
                      } group-hover:scale-125 group-hover:shadow-xl`}>
                        {step.step}
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        (inquiry.progress_step || 1) >= step.step
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="absolute top-5 left-0 right-0 h-2 bg-slate-200 -z-10 rounded-full" style={{ marginLeft: '10%', marginRight: '10%' }}>
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${((inquiry.progress_step || 1) - 1) * 25}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Profile */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={inquiry.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${inquiry.tenant_name}`} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
                  {inquiry.tenant_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="profile-upload" className="absolute bottom-0 right-0 cursor-pointer">
                <div className="bg-indigo-600 rounded-full p-2 hover:bg-indigo-700 transition-colors shadow-lg">
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
              <h3 className="text-2xl font-bold text-slate-900">{inquiry.tenant_name}</h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                {inquiry.gdpr_verified && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    <Shield className="w-3 h-3 mr-1" />
                    GDPR Verified
                  </Badge>
                )}
              </div>
              {inquiry.idealista_id && (
                <p className="text-sm text-slate-600 mt-2">
                  Idealista Ref: <span className="font-mono font-medium text-slate-900">{inquiry.idealista_id}</span>
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-4">Personal Information</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Age</p>
                  <p className="text-sm font-medium text-slate-900">{inquiry.age || 32}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Gender</p>
                  <p className="text-sm font-medium text-slate-900 capitalize">{inquiry.gender || 'Male'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Nationality</p>
                  <p className="text-sm font-medium text-slate-900">{inquiry.nationality || 'Spanish'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Place of Birth</p>
                  <p className="text-sm font-medium text-slate-900">{inquiry.place_of_birth || 'Madrid'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">DNI/NIE Number</p>
                  <p className="text-sm font-medium text-slate-900 font-mono">{inquiry.dni_nie_number || '12345678A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Occupants</p>
                  <p className="text-sm font-medium text-slate-900">
                    {inquiry.number_of_occupants || 2} {(inquiry.number_of_occupants || 2) === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact & Address */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-4">Contact & Address</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email {inquiry.email_verified && <CheckCircle2 className="inline w-3 h-3 text-emerald-600 ml-1" />}</p>
                  <p className="text-sm font-medium text-slate-900">{inquiry.tenant_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone {inquiry.phone_verified && <CheckCircle2 className="inline w-3 h-3 text-emerald-600 ml-1" />}</p>
                  <p className="text-sm font-medium text-slate-900">{inquiry.tenant_phone || '+34 600 123 456'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="text-sm font-medium text-slate-900">
                    {inquiry.address || 'Calle Gran Via, 123'}, {inquiry.postal_code || '28013'} {inquiry.city || 'Madrid'}, {inquiry.country || 'Spain'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Business Email {inquiry.business_email_verified && <CheckCircle2 className="inline w-3 h-3 text-emerald-600 ml-1" />}</p>
                  <p className="text-sm font-medium text-slate-900">{inquiry.tenant_email.replace('@', '@company.')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PawPrint className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Pets</p>
                  <p className="text-sm font-medium text-slate-900">
                    {inquiry.has_pets ? (inquiry.pet_details || 'Yes, 1 dog') : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* ID Verification */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                ID Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://identomat.com/wp-content/uploads/2023/06/identomat-logo-1.png" 
                    alt="Identomat"
                    className="h-8 object-contain"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Verified by Identomat</p>
                    <p className="text-xs text-slate-500">Identity verification provider</p>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${
                    inquiry.id_verification_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                    inquiry.id_verification_status === 'failed' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-700'
                  } flex items-center gap-1`}
                >
                  {inquiry.id_verification_status === 'verified' ? <CheckCircle2 className="w-3 h-3" /> :
                   inquiry.id_verification_status === 'failed' ? <XCircle className="w-3 h-3" /> :
                   <Clock className="w-3 h-3" />}
                  {inquiry.id_verification_status === 'verified' ? 'Verified' :
                   inquiry.id_verification_status === 'failed' ? 'Failed' : 'Pending'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Connections */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Social Media & Professional Networks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">LinkedIn</p>
                    <div className="flex items-center gap-1">
                      {inquiry.linkedin_connected ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="text-xs font-medium text-slate-900">
                            {inquiry.linkedin_verification_status === 'confirmed' ? 'Verified' :
                             inquiry.linkedin_verification_status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Not connected</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-teal-600 rounded flex items-center justify-center text-white text-xs font-bold">X</div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">XING</p>
                    {inquiry.xing_connected ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-slate-900">Connected</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Not connected</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-blue-700" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Facebook</p>
                    {inquiry.facebook_connected ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-slate-900">Connected</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Not connected</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Employment Info */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Employment Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Employment Status</p>
                  <p className="text-sm font-medium text-slate-900 capitalize">
                    {inquiry.employment_status?.replace('_', ' ') || 'Employed'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Company</p>
                  <p className="text-sm font-medium text-slate-900">
                    {inquiry.company_name || 'Telefónica España'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Monthly Income (After Tax)</p>
                  <p className="text-sm font-medium text-slate-900">
                    {inquiry.monthly_income ? `€${inquiry.monthly_income.toLocaleString()}` : '€3,200'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className={`w-5 h-5 ${isIncomeRatioGood ? 'text-emerald-500' : 'text-rose-500'}`} />
                <div>
                  <p className="text-xs text-slate-500">Income to Rent Ratio</p>
                  <p className={`text-sm font-medium ${isIncomeRatioGood ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {incomeRatio || 28}% {isIncomeRatioGood ? '✓ Under 40%' : '✗ Over 40%'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bank Account Verification */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Link className="w-5 h-5" />
                Income Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Connect bank account to automatically verify monthly income
              </p>
              {inquiry.bank_account_connected ? (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-900">Bank Account Connected</p>
                    <p className="text-xs text-emerald-700">
                      Status: {inquiry.bank_verification_status === 'verified' ? 'Verified ✓' : 'Pending verification'}
                    </p>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleBankConnect}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Connect Bank Account
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Document Uploads */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* CV Upload */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">CV / Resume</span>
                    {inquiry.documents?.cv_url && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  {inquiry.documents?.cv_url ? (
                    <div>
                      <a 
                        href={inquiry.documents.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View CV_Resume.pdf
                      </a>
                      <p className="text-xs text-slate-500 mt-1">Uploaded</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        {uploadingDoc === 'cv_url' ? 'Uploading...' : 'Upload'}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleDocumentUpload(e, 'cv_url')}
                        disabled={uploadingDoc === 'cv_url'}
                      />
                    </label>
                  )}
                </div>

                {/* Payslip Upload */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Payslips</span>
                    {inquiry.documents?.payslip_url && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  {inquiry.documents?.payslip_url ? (
                    <div>
                      <a 
                        href={inquiry.documents.payslip_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View Payslips.pdf
                      </a>
                      <p className="text-xs text-slate-500 mt-1">Uploaded</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        {uploadingDoc === 'payslip_url' ? 'Uploading...' : 'Upload'}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        className="hidden"
                        onChange={(e) => handleDocumentUpload(e, 'payslip_url')}
                        disabled={uploadingDoc === 'payslip_url'}
                      />
                    </label>
                  )}
                </div>

                {/* Work Contract Upload */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Work Contract</span>
                    {inquiry.documents?.work_contract_url && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  {inquiry.documents?.work_contract_url ? (
                    <div>
                      <a 
                        href={inquiry.documents.work_contract_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View Contract.pdf
                      </a>
                      <p className="text-xs text-slate-500 mt-1">Uploaded</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        {uploadingDoc === 'work_contract_url' ? 'Uploading...' : 'Upload'}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleDocumentUpload(e, 'work_contract_url')}
                        disabled={uploadingDoc === 'work_contract_url'}
                      />
                    </label>
                  )}
                </div>

                {/* ID Document Upload */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">ID Document</span>
                    {inquiry.documents?.id_document_url && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  {inquiry.documents?.id_document_url ? (
                    <div>
                      <a 
                        href={inquiry.documents.id_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View ID_Document.pdf
                      </a>
                      <p className="text-xs text-slate-500 mt-1">Uploaded</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        {uploadingDoc === 'id_document_url' ? 'Uploading...' : 'Upload'}
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        className="hidden"
                        onChange={(e) => handleDocumentUpload(e, 'id_document_url')}
                        disabled={uploadingDoc === 'id_document_url'}
                      />
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                    src="https://logos-world.net/wp-content/uploads/2022/04/Dun-Bradstreet-Symbol.png" 
                    alt="Dun & Bradstreet"
                    className="h-10 object-contain"
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
                    <span className="text-xl font-bold text-slate-900">{inquiry.credit_score}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        inquiry.credit_score >= 75 ? 'bg-emerald-500' :
                        inquiry.credit_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${inquiry.credit_score}%` }}
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
                    <div className="h-7 flex items-center">
                      <span className="text-pink-600 font-bold text-2xl">klarna</span>
                    </div>
                    {inquiry.financing_options?.includes('klarna') && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600">Pay in installments</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">0% interest available</p>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-red-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-7 flex items-center">
                      <span className="text-red-600 font-bold text-lg">Santander</span>
                    </div>
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

          {/* Landlord Decision */}
          <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Landlord Decision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">Review and make your decision on this application</p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleLandlordDecision('approved')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={inquiry.landlord_decision === 'approved'}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {inquiry.landlord_decision === 'approved' ? 'Approved' : 'Approve'}
                </Button>
                <Button 
                  onClick={() => handleLandlordDecision('pending')}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  disabled={inquiry.landlord_decision === 'pending'}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  {inquiry.landlord_decision === 'pending' ? 'Pending' : 'Set Pending'}
                </Button>
                <Button 
                  onClick={() => handleLandlordDecision('rejected')}
                  className="flex-1 bg-rose-600 hover:bg-rose-700"
                  disabled={inquiry.landlord_decision === 'rejected'}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  {inquiry.landlord_decision === 'rejected' ? 'Rejected' : 'Reject'}
                </Button>
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