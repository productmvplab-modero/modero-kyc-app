import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, AlertCircle, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import TenantDetailsDialog from "./TenantDetailsDialog";
import PropertyDetailsDialog from "./PropertyDetailsDialog";
import { useLanguage } from '@/components/LanguageContext';

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  screening: { label: 'Screening', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
  kyc_pending: { label: 'KYC Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
  qualified: { label: 'Qualified', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
  rented: { label: 'Rented', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle2 },
};

export default function RecentInquiries({ inquiries, properties = [] }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (inquiryId) => base44.entities.Inquiry.delete(inquiryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Inquiry deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete inquiry');
    }
  });

  const recentInquiries = [...inquiries]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const handleRowClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    setDialogOpen(true);
  };

  const handleDelete = (e, inquiryId) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this inquiry?')) {
      deleteMutation.mutate(inquiryId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
        <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">{t('recent_inquiries')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {recentInquiries.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {t('no_inquiries')}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentInquiries.map((inquiry) => {
                const StatusIcon = statusConfig[inquiry.status]?.icon || Clock;
                const isDeleting = deleteMutation.isPending && deleteMutation.variables === inquiry.id;
                return (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all ${!isDeleting ? 'cursor-pointer' : 'opacity-50'}`}
                    onClick={() => !isDeleting && handleRowClick(inquiry)}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={inquiry.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${inquiry.tenant_name}`} />
                          <AvatarFallback>{inquiry.tenant_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(e, inquiry.id)}
                          disabled={deleteMutation.isPending}
                          className="h-6 w-6 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm line-clamp-1">{inquiry.tenant_name}</p>
                        <p className="text-xs text-slate-500">{inquiry.tenant_email}</p>
                      </div>
                      <div className="space-y-2">
                        {inquiry.monthly_income && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-600">{t('income')}</span>
                            <span className="font-medium text-slate-900">€{(inquiry.monthly_income / 1000).toFixed(0)}k</span>
                          </div>
                        )}
                        {inquiry.qualification_score && (
                          <div className="flex justify-between items-center gap-2 text-xs">
                            <span className="text-slate-600">{t('score')}</span>
                            <div className="flex items-center gap-1">
                              <div className="w-12 bg-slate-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    inquiry.qualification_score >= 70 ? 'bg-emerald-500' :
                                    inquiry.qualification_score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${inquiry.qualification_score}%` }}
                                />
                              </div>
                              <span className="font-medium text-slate-700 w-6">{inquiry.qualification_score}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`${statusConfig[inquiry.status]?.color || 'bg-slate-100 text-slate-700'} border flex items-center gap-0.5 text-xs`}
                        >
                          <StatusIcon className="w-2.5 h-2.5 flex-shrink-0" />
                          <span>{statusConfig[inquiry.status]?.label || inquiry.status}</span>
                        </Badge>
                        <span className="text-xs text-slate-500">{format(new Date(inquiry.created_date), "MMM d")}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TenantDetailsDialog
        inquiry={selectedInquiry}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        properties={properties}
        onOpenProperty={(p) => {
          setPropertyDialogOpen(true);
          setSelectedProperty(p);
        }}
      />
      <PropertyDetailsDialog
        property={selectedProperty}
        inquiries={inquiries}
        open={propertyDialogOpen}
        onOpenChange={setPropertyDialogOpen}
      />
    </motion.div>
  );
}