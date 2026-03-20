import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  ChevronDown,
  PawPrint,
  Users,
  Paperclip,
  Link,
  MapPin,
  Globe,
  User,
  Shield,
  TrendingUp,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Linkedin,
  Facebook
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import VerificationStatusBadge from '@/components/modero/VerificationStatusBadge';

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800', icon: Clock },
  screening: { label: 'Screening', color: 'bg-amber-100 text-amber-800', icon: FileText },
  kyc_pending: { label: 'KYC Pending', color: 'bg-orange-100 text-orange-800', icon: Shield },
  qualified: { label: 'Qualified', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  rented: { label: 'Rented', color: 'bg-orange-100 text-orange-800', icon: Building },
};

const creditCheckConfig = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-800', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-amber-100 text-amber-800', icon: FileText },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const progressSteps = [
  { step: 1, label: 'Initial Contact', description: 'First inquiry received' },
  { step: 2, label: 'Document Upload', description: 'Documents submitted' },
  { step: 3, label: 'ID Verification', description: 'Identity confirmed' },
  { step: 4, label: 'Financial Check', description: 'Income & credit verified' },
  { step: 5, label: 'Final Review', description: 'Ready for decision' },
];

// TenantDetailsDialog - v2
export default function TenantDetailsDialog({ inquiry, open, onOpenChange, properties = [], onOpenProperty }) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [notesValue, setNotesValue] = React.useState('');
  const [notesSaved, setNotesSaved] = React.useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    employment: true,
    financial: true,
    documents: true,
    verification: false,
    profiles: false,
    credit: false,
    notes: false,
  });
  const queryClient = useQueryClient();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Sync notesValue when inquiry changes
  useEffect(() => {
    setNotesValue(inquiry?.notes || '');
    setNotesSaved(false);
  }, [inquiry?.id]);

  const updateInquiryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Inquiry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Updated successfully');
    },
  });

  if (!inquiry) return null;

  const currentStatus = statusConfig[inquiry.status] || statusConfig.new;
  const creditStatus = creditCheckConfig[inquiry.credit_check_status] || creditCheckConfig.pending;

  // Calculate income ratio
  const incomeRatio = inquiry.monthly_income && inquiry.property_id 
    ? (1200 / inquiry.monthly_income * 100).toFixed(1) // Assuming rent is €1200 for demo
    : 0;
  const incomeRatioHealthy = incomeRatio <= 40;

  // Calculate Modero score
  const moderoScore = inquiry.modero_score || Math.floor(
    (inquiry.kyc_verified ? 30 : 0) +
    (inquiry.credit_score || 0) * 0.3 +
    (inquiry.bank_account_connected ? 20 : 0) +
    (inquiry.id_verification_status === 'completed' ? 20 : 0)
  );

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
      toast.success('Profile picture updated');
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
    const statusMap = {
      approved: 'qualified',
      rejected: 'rejected',
      pending: 'kyc_pending'
    };

    updateInquiryMutation.mutate({
      id: inquiry.id,
      data: { 
        landlord_decision: decision,
        status: statusMap[decision] || inquiry.status
      }
    });
    toast.success(`Application ${decision}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-auto [&>button]:p-2 sm:[&>button]:p-3 [&>button]:rounded-lg sm:[&>button]:rounded-xl [&>button]:right-2 sm:[&>button]:right-3 [&>button]:top-2 sm:[&>button]:top-3 [&>button]:hover:bg-slate-100 [&>button>svg]:h-4 sm:[&>button>svg]:h-5 [&>button>svg]:w-4 sm:[&>button>svg]:w-5">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 pr-8 flex-wrap">
            <DialogTitle className="text-lg sm:text-2xl font-bold">{t('tenant_profile')}</DialogTitle>
            <Badge className={`${currentStatus.color} text-xs sm:text-sm`}>
              <currentStatus.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {currentStatus.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Modero Score Highlight */}
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-200">
                    <span className="text-3xl font-bold text-white">{moderoScore}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{t('modero_score')}</h3>
                    <p className="text-sm text-slate-600">{t('overall_rating')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {moderoScore >= 80 && <Badge className="bg-emerald-100 text-emerald-800">{t('excellent')}</Badge>}
                      {moderoScore >= 60 && moderoScore < 80 && <Badge className="bg-amber-100 text-amber-800">{t('good')}</Badge>}
                      {moderoScore < 60 && <Badge className="bg-red-100 text-red-800">{t('needs_review')}</Badge>}
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          {/* Landlord Decision */}
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{t('landlord_decision')}</h3>
                  <p className="text-sm text-slate-600">{t('review_approve_desc')}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLandlordDecision('pending')}
                    className={inquiry.landlord_decision === 'pending' ? 'bg-amber-50' : ''}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {t('pending')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLandlordDecision('approved')}
                    className={inquiry.landlord_decision === 'approved' ? 'bg-emerald-50 text-emerald-700' : ''}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {t('approve')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLandlordDecision('rejected')}
                    className={inquiry.landlord_decision === 'rejected' ? 'bg-red-50 text-red-700' : ''}
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    {t('reject')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={inquiry.profile_picture_url} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-400 to-amber-300 text-white">
                  {inquiry.tenant_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="flex-1 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{inquiry.tenant_name}</h2>
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="text-slate-600 text-sm">{t('idealista_id')}:</span>
                {inquiry.idealista_id ? (
                  <button
                    onClick={() => {
                      const linkedProperty = properties.find(p => p.idealista_id === inquiry.idealista_id || p.id === inquiry.property_id);
                      if (linkedProperty && onOpenProperty) {
                        onOpenChange(false);
                        setTimeout(() => onOpenProperty(linkedProperty), 150);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-800 hover:underline transition-colors"
                    title={t('property_information')}
                  >
                    <Link className="w-3.5 h-3.5" />
                    #{inquiry.idealista_id}
                  </button>
                ) : (
                  <span className="text-slate-500 text-sm">—</span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {inquiry.age && <Badge variant="outline">{inquiry.age} years old</Badge>}
                {inquiry.gender && <Badge variant="outline">{inquiry.gender}</Badge>}
                {inquiry.nationality && <Badge variant="outline">{inquiry.nationality}</Badge>}
              </div>
            </div>
          </div>

          {/* Application Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('application_progress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 transition-all duration-500"
                    style={{ width: `${(inquiry.progress_step / 5) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {progressSteps.map((step) => (
                    <button
                      key={step.step}
                      onClick={() => handleProgressChange(step.step)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        inquiry.progress_step >= step.step
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {inquiry.progress_step >= step.step ? (
                          <CheckCircle2 className="w-4 h-4 text-orange-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                        <span className="text-xs font-semibold">Step {step.step}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-900">{step.label}</p>
                      <p className="text-xs text-slate-500">{step.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <button
                onClick={() => toggleSection('personal')}
                className="w-full flex items-center justify-between hover:bg-slate-50 rounded-lg p-1 -m-1 transition-colors"
              >
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <User className="w-4 sm:w-5 h-4 sm:h-5" />
                  {t('personal_information')}
                </CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.personal ? 'rotate-180' : ''}`} />
              </button>
            </CardHeader>
            {expandedSections.personal && (
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{inquiry.tenant_email}</p>
                      {inquiry.email_verified && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{inquiry.tenant_phone || '—'}</p>
                      {inquiry.mobile_verified && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm font-medium text-slate-900">{inquiry.address || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Postal Code</p>
                    <p className="text-sm font-medium text-slate-900">{inquiry.postal_code || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">City</p>
                    <p className="text-sm font-medium text-slate-900">{inquiry.city || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Country</p>
                    <p className="text-sm font-medium text-slate-900">{inquiry.country || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Place of Birth</p>
                    <p className="text-sm font-medium text-slate-900">{inquiry.place_of_birth || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">DNI/NIE Number</p>
                    <p className="text-sm font-medium text-slate-900">{inquiry.dni_nie_number || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">GDPR Verified</p>
                    <Badge className={inquiry.gdpr_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                      {inquiry.gdpr_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            )}
            </Card>

            {/* ID Verification - Identomat */}
            <Card className="overflow-hidden border-0 shadow-md">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                {t('id_verification')}
                <span className="ml-1 text-xs font-normal px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">Identomat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className={`relative flex items-center justify-between p-5 rounded-xl border-2 ${
                inquiry.id_verification_status === 'completed' ? 'border-emerald-200 bg-emerald-50' :
                inquiry.id_verification_status === 'failed' ? 'border-red-200 bg-red-50' :
                inquiry.id_verification_status === 'in_progress' ? 'border-amber-200 bg-amber-50' :
                'border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50'
              }`}>

                <div className="flex items-center gap-4">
                  {(inquiry.id_verification_status === 'completed' || inquiry.id_verification_status === 'failed' || inquiry.id_verification_status === 'in_progress') && (
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-md ${
                      inquiry.id_verification_status === 'completed' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                      inquiry.id_verification_status === 'failed' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      inquiry.id_verification_status === 'in_progress' ? 'bg-gradient-to-br from-amber-400 to-amber-500' :
                      ''
                    }`}>
                      {inquiry.id_verification_status === 'completed' ? (
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      ) : inquiry.id_verification_status === 'failed' ? (
                        <XCircle className="w-7 h-7 text-white" />
                      ) : inquiry.id_verification_status === 'in_progress' ? (
                        <Clock className="w-7 h-7 text-white" />
                      ) : null}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 text-base">Identity Verification</p>
                    <p className="text-sm text-slate-500 mt-0.5">Biometric ID check via Identomat</p>
                    {inquiry.dni_nie_number && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-orange-400" />
                        <p className="text-xs text-slate-500">NIE/DNI: <span className="font-semibold text-slate-700">{inquiry.dni_nie_number}</span></p>
                      </div>
                    )}
                  </div>
                </div>
                <div className={['px-4 py-2 rounded-full text-sm font-semibold', inquiry.id_verification_status === 'completed' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' : inquiry.id_verification_status === 'failed' ? 'bg-red-100 text-red-700 ring-1 ring-red-300' : inquiry.id_verification_status === 'in_progress' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'].join(' ')}>
                  {inquiry.id_verification_status === 'completed' ? '✓ Completed' :
                   inquiry.id_verification_status === 'failed' ? '✗ Failed' :
                   inquiry.id_verification_status === 'in_progress' ? '⏳ In Progress' :
                   'Pending'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Integrations */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 pb-3 px-4 sm:pb-4">
              <button
                onClick={() => toggleSection('verification')}
                className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
                    <Shield className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  </div>
                  Verification Integrations
                </CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.verification ? 'rotate-180' : ''}`} />
              </button>
            </CardHeader>
            {expandedSections.verification && (
            <CardContent className="pt-4 sm:pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    logo: 'in', name: 'LinkedIn', provider: 'Employment Verification',
                    bg: 'bg-blue-600',
                    status: inquiry.linkedin_connected
                      ? (inquiry.linkedin_verification_status === 'confirmed' ? 'verified'
                        : inquiry.linkedin_verification_status === 'rejected' ? 'rejected'
                        : 'in_progress')
                      : 'pending',
                  },
                  {
                    logo: '🪪', name: 'Identomat', provider: 'Biometric ID Verification',
                    bg: 'bg-violet-600',
                    status: inquiry.id_verification_status === 'completed' ? 'verified'
                      : inquiry.id_verification_status === 'failed' ? 'rejected'
                      : inquiry.id_verification_status === 'in_progress' ? 'in_progress'
                      : 'pending',
                  },
                  {
                    logo: '💬', name: 'Twilio SMS', provider: 'Mobile Verification',
                    bg: 'bg-red-600',
                    status: inquiry.mobile_verified ? 'verified' : 'pending',
                  },
                  {
                    logo: '@', name: 'Business Email', provider: 'Email Verification',
                    bg: 'bg-emerald-600',
                    status: inquiry.business_email_verified ? 'verified' : 'pending',
                  },
                  {
                    logo: 'D&B', name: 'Dun & Bradstreet', provider: 'Credit Check',
                    bg: 'bg-amber-600',
                    status: inquiry.credit_check_status === 'approved' ? 'verified'
                      : inquiry.credit_check_status === 'rejected' ? 'rejected'
                      : inquiry.credit_check_status === 'in_review' ? 'in_progress'
                      : 'pending',
                  },
                  {
                    logo: '🏦', name: 'PSD2 Banking', provider: 'Bank Account Verification',
                    bg: 'bg-orange-500',
                    status: inquiry.bank_account_connected
                      ? (inquiry.bank_verification_status === 'verified' ? 'verified'
                        : inquiry.bank_verification_status === 'failed' ? 'rejected'
                        : 'in_progress')
                      : 'pending',
                  },
                ].map(({ logo, name, provider, bg, status }) => (
                  <div key={name} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className={['h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0', bg].join(' ')}>
                      {logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">{provider}</p>
                    </div>
                    <VerificationStatusBadge status={status} />
                  </div>
                ))}
              </div>
            </CardContent>
            )}
          </Card>

          {/* Social Profiles */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 pb-3 px-4 sm:pb-4">
              <button
                onClick={() => toggleSection('profiles')}
                className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
                    <Link className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  </div>
                  {t('connected_profiles')}
                </CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.profiles ? 'rotate-180' : ''}`} />
              </button>
            </CardHeader>
            {expandedSections.profiles && (
            <CardContent className="pt-4 sm:pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className={['p-4 rounded-lg border-2', inquiry.linkedin_connected ? 'border-blue-500 bg-blue-50' : 'border-slate-200'].join(' ')}>
                  <div className="flex items-center gap-2 mb-2">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">LinkedIn</span>
                  </div>
                  {inquiry.linkedin_connected ? (
                    <div>
                      <Badge className={
                        inquiry.linkedin_verification_status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        inquiry.linkedin_verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }>
                        {inquiry.linkedin_verification_status}
                      </Badge>
                      <p className="text-xs text-slate-600 mt-1">Employment verification</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Not connected</p>
                  )}
                </div>
                <div className={['p-4 rounded-lg border-2', inquiry.xing_connected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'].join(' ')}>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">XING</span>
                  </div>
                  <p className="text-xs text-slate-500">{inquiry.xing_connected ? 'Connected' : 'Not connected'}</p>
                </div>
                <div className={['p-4 rounded-lg border-2', inquiry.facebook_connected ? 'border-orange-500 bg-orange-50' : 'border-slate-200'].join(' ')}>
                  <div className="flex items-center gap-2 mb-2">
                    <Facebook className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Facebook</span>
                  </div>
                  <p className="text-xs text-slate-500">{inquiry.facebook_connected ? 'Connected' : 'Not connected'}</p>
                </div>
              </div>
            </CardContent>
            )}
          </Card>

          {/* Employment Information - REMOVED (moved to collapsible section) */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 pb-3 px-4 sm:pb-4">
              <button
                onClick={() => toggleSection('employment')}
                className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
                    <Briefcase className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  </div>
                  {t('employment_information')}
                </CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.employment ? 'rotate-180' : ''}`} />
              </button>
            </CardHeader>
            {expandedSections.employment && (
            <CardContent className="pt-4 sm:pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Employment Status</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">{inquiry.employment_status || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Company</p>
                    <p className="text-sm font-medium text-slate-900">{inquiry.company_name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Business Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {inquiry.business_email_verified ? 'Verified' : 'Not verified'}
                      </p>
                      {inquiry.business_email_verified && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            )}
            </Card>

            {/* Financial Information */}
            <Card className="overflow-hidden border-0 shadow-md">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 pb-3 px-4 sm:pb-4">
              <button
                onClick={() => toggleSection('financial')}
                className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
                    <DollarSign className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  </div>
                  {t('financial_information')}
                </CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.financial ? 'rotate-180' : ''}`} />
              </button>
            </CardHeader>
            {expandedSections.financial && (
            <CardContent className="pt-4 sm:pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Monthly Income</p>
                    <p className="text-sm font-medium text-slate-900">
                      {inquiry.monthly_income ? ('€' + inquiry.monthly_income.toLocaleString()) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Income Ratio</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{incomeRatio}%</p>
                      <Badge className={incomeRatioHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                        {incomeRatioHealthy ? 'Healthy' : 'High'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">Target: &lt;40%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Credit Score</p>
                    <p className="text-sm font-medium text-slate-900">
                      {inquiry.credit_score ? (inquiry.credit_score + '/100') : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Occupants</p>
                    <p className="text-sm font-medium text-slate-900">
                      {inquiry.number_of_occupants || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PawPrint className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Pets</p>
                    <p className="text-sm font-medium text-slate-900">
                      {inquiry.has_pets ? (inquiry.pet_details || 'Yes') : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            )}
          </Card>

          <Separator />

          {/* Bank Account Verification */}
          <Card className="border-orange-100">
            <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-xl border-b border-orange-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
                  <Link className="w-4 h-4 text-white" />
                </div>
                <span>{t('income_verification')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <p className="text-sm text-slate-500">
                Connect bank account to automatically verify monthly income
              </p>
              {inquiry.bank_account_connected ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-900">Bank Account Connected</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {inquiry.bank_verification_status === 'verified' ? 'Verified ✓' : 'Pending verification'}
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleBankConnect}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Connect Bank Account
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Document Uploads */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 pb-3 px-4 sm:pb-4">
              <button
                onClick={() => toggleSection('documents')}
                className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
                    <Paperclip className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  </div>
                  {t('required_documents')}
                </CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.documents ? 'rotate-180' : ''}`} />
              </button>
            </CardHeader>
            {expandedSections.documents && (
            <CardContent className="space-y-3 pt-4 sm:pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CV Upload */}
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">CV / Resume</span>
                    {inquiry.documents?.cv_url && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  {inquiry.documents?.cv_url ? (
                    <div className="space-y-1">
                      <a 
                        href={inquiry.documents.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View Document
                      </a>
                      <p className="text-xs text-emerald-600">✓ Uploaded</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1">
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
                    <div className="space-y-1">
                      <a 
                        href={inquiry.documents.payslip_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View Document
                      </a>
                      <p className="text-xs text-emerald-600">✓ Uploaded</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1">
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
                    <div className="space-y-1">
                      <a 
                        href={inquiry.documents.work_contract_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View Document
                      </a>
                      <p className="text-xs text-emerald-600">✓ Uploaded</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1">
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
                    <div className="space-y-1">
                      <a 
                        href={inquiry.documents.id_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        View Document
                      </a>
                      <p className="text-xs text-emerald-600">✓ Uploaded</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1">
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
            )}
          </Card>

          <Separator />

          {/* Credit Check */}
          <Card className="border-amber-100 overflow-hidden border-0 shadow-md">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardHeader className="pb-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-t-xl border-b border-amber-100 px-4 sm:pb-4">
              <button
                onClick={() => toggleSection('credit')}
                className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
                    <BarChart3 className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  </div>
                  <span>{t('credit_check')}</span>
                </CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.credit ? 'rotate-180' : ''}`} />
              </button>
            </CardHeader>
            {expandedSections.credit && (
            <CardContent className="pt-4 sm:pt-5">
              <div className={`relative flex items-center justify-between p-5 rounded-xl border-2 ${
                inquiry.credit_check_status === 'approved' ? 'border-emerald-200 bg-emerald-50' :
                inquiry.credit_check_status === 'rejected' ? 'border-red-200 bg-red-50' :
                inquiry.credit_check_status === 'in_review' ? 'border-amber-200 bg-amber-50' :
                'border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50'
              }`}>
                <div className="flex items-center gap-4">
                  {(inquiry.credit_check_status === 'approved' || inquiry.credit_check_status === 'rejected' || inquiry.credit_check_status === 'in_review') && (
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-md ${
                      inquiry.credit_check_status === 'approved' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                      inquiry.credit_check_status === 'rejected' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      inquiry.credit_check_status === 'in_review' ? 'bg-gradient-to-br from-amber-400 to-amber-500' :
                      ''
                    }`}>
                      {inquiry.credit_check_status === 'approved' ? (
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      ) : inquiry.credit_check_status === 'rejected' ? (
                        <XCircle className="w-7 h-7 text-white" />
                      ) : inquiry.credit_check_status === 'in_review' ? (
                        <Clock className="w-7 h-7 text-white" />
                      ) : null}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 text-base">{t('credit_verification')}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{t('db_assessment')}</p>
                    {inquiry.credit_score && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                        <p className="text-xs text-slate-500">Score: <span className="font-semibold text-slate-700">{inquiry.credit_score}/100</span></p>
                      </div>
                    )}
                  </div>
                </div>
                <div className={['px-4 py-2 rounded-full text-sm font-semibold', inquiry.credit_check_status === 'approved' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' : inquiry.credit_check_status === 'rejected' ? 'bg-red-100 text-red-700 ring-1 ring-red-300' : inquiry.credit_check_status === 'in_review' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'].join(' ')}>
                  {creditStatus.label}
                </div>
              </div>
            </CardContent>
            )}
          </Card>

          {/* Financing Options - only for qualified tenants */}
          {(inquiry.status === 'qualified' || inquiry.status === 'rented') && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Financing Options
                  <span className="ml-auto text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Tenant Qualified</span>
                </CardTitle>
                <p className="text-sm text-slate-500">Recommend a financing solution to this tenant</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Klarna */}
                    {(['klarna', 'both'].includes(inquiry.recommended_financing) ? true : true) && (
                      <button
                        onClick={() => updateInquiryMutation.mutate({
                          id: inquiry.id,
                          data: { recommended_financing: inquiry.recommended_financing === 'klarna' ? null : 'klarna' }
                        })}
                        className={['relative flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left', inquiry.recommended_financing === 'klarna' ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-slate-200 bg-white hover:border-pink-300 hover:bg-pink-50/50'].join(' ')}
                    >
                      <div className="h-10 w-16 bg-gradient-to-r from-pink-500 to-rose-400 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm tracking-tight">K</span>
                        <span className="text-white font-semibold text-xs ml-0.5">larna</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm sm:text-base text-slate-900">Klarna</p>
                        <p className="text-xs text-slate-500">Buy now, pay later</p>
                        <p className="text-xs text-slate-500">Flexible instalments</p>
                      </div>
                      {inquiry.recommended_financing === 'klarna' && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-500" />
                        </div>
                      )}
                    </button>
                  )}

                  {/* Santander */}
                  <button
                    onClick={() => updateInquiryMutation.mutate({
                      id: inquiry.id,
                      data: { recommended_financing: inquiry.recommended_financing === 'santander' ? null : 'santander' }
                    })}
                    className={['relative flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left', inquiry.recommended_financing === 'santander' ? 'border-red-500 bg-red-50 shadow-md' : 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/50'].join(' ')}
                  >
                    <div className="h-10 w-16 bg-gradient-to-r from-red-600 to-red-500 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs text-center leading-tight px-1">Santander</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base text-slate-900">Santander</p>
                      <p className="text-xs text-slate-500">Personal financing</p>
                      <p className="text-xs text-slate-500">Competitive rates</p>
                    </div>
                    {inquiry.recommended_financing === 'santander' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </button>
                </div>

                {inquiry.recommended_financing && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-sm text-emerald-800">
                      <span className="font-medium capitalize">{inquiry.recommended_financing}</span> financing recommended to tenant
                    </p>
                    <button
                      onClick={() => updateInquiryMutation.mutate({ id: inquiry.id, data: { recommended_financing: null } })}
                      className="ml-auto text-xs text-slate-500 hover:text-slate-700 underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes - editable */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 pb-3 px-4 sm:pb-4">
              <button
                onClick={() => toggleSection('notes')}
                className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
              >
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
                    <FileText className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  </div>
                  {t('internal_notes')}
                </CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.notes ? 'rotate-180' : ''}`} />
              </button>
            </CardHeader>
            {expandedSections.notes && (
            <CardContent className="space-y-3 pt-4 sm:pt-5">
              <textarea
                className="w-full min-h-[120px] p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y text-slate-700 bg-white"
                placeholder={t('add_notes_placeholder')}
                value={notesValue}
                onChange={(e) => { setNotesValue(e.target.value); setNotesSaved(false); }}
              />
              <div className="flex items-center justify-between">
                {notesSaved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" /> Notes saved
                  </span>
                )}
                <div className="ml-auto">
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => {
                      updateInquiryMutation.mutate(
                        { id: inquiry.id, data: { notes: notesValue } },
                        { onSuccess: () => setNotesSaved(true) }
                      );
                    }}
                    disabled={updateInquiryMutation.isPending}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    {t('save_notes')}
                  </Button>
                </div>
              </div>
            </CardContent>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}