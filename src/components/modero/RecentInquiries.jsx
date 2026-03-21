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
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);

  const recentInquiries = [...inquiries]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 10);

  const handleRowClick = (inquiry) => {
    setSelectedInquiry(inquiry);
    setDialogOpen(true);
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
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold whitespace-nowrap text-xs sm:text-sm">{t('tenant_label')}</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">{t('idealista_id')}</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">{t('income')}</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap text-xs sm:text-sm">{t('score')}</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap text-xs sm:text-sm">{t('status_label')}</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">{t('date_label')}</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap text-xs sm:text-sm hidden xl:table-cell text-right">{t('contact')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      {t('no_inquiries')}
                    </TableCell>
                  </TableRow>
                ) : (
                  recentInquiries.map((inquiry) => {
                    const StatusIcon = statusConfig[inquiry.status]?.icon || Clock;
                    return (
                      <TableRow 
                        key={inquiry.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(inquiry)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={inquiry.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${inquiry.tenant_name}`} />
                              <AvatarFallback className="text-xs">{inquiry.tenant_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900 text-xs sm:text-sm line-clamp-1">{inquiry.tenant_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                          {inquiry.idealista_id ? (
                            <Badge variant="outline" className="text-xs">{inquiry.idealista_id}</Badge>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-slate-900 hidden md:table-cell whitespace-nowrap">
                          {inquiry.monthly_income ? `€${(inquiry.monthly_income / 1000).toFixed(0)}k` : '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {inquiry.qualification_score ? (
                            <div className="flex items-center gap-1">
                              <div className="w-8 bg-slate-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    inquiry.qualification_score >= 70 ? 'bg-emerald-500' :
                                    inquiry.qualification_score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${inquiry.qualification_score}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-700">{inquiry.qualification_score}</span>
                            </div>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge 
                            variant="secondary" 
                            className={`${statusConfig[inquiry.status]?.color || 'bg-slate-100 text-slate-700'} border flex items-center gap-0.5 w-fit text-xs`}
                          >
                            <StatusIcon className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="hidden sm:inline">{statusConfig[inquiry.status]?.label || inquiry.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 hidden lg:table-cell whitespace-nowrap">
                          {format(new Date(inquiry.created_date), "MMM d")}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 hidden xl:table-cell text-right">
                          {inquiry.tenant_email}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
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