import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, MessageSquare, UserCheck, ShieldCheck, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import MetricCard from "../components/modero/MetricCard";
import InquiryFunnel from "../components/modero/InquiryFunnel";
import PropertyPerformance from "../components/modero/PropertyPerformance";
import RecentInquiries from "../components/modero/RecentInquiries";
import RevenueChart from "../components/modero/RevenueChart";
import PropertyDetailsDialog from "../components/modero/PropertyDetailsDialog";
import Header from "../components/modero/Header";
import SlackIntegration from "../components/modero/SlackIntegration";
import ConfirmedBookings from "../components/modero/ConfirmedBookings";
import { useLanguage } from "@/components/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: () => base44.entities.Inquiry.list('-created_date'),
  });

  const { data: propertyOwners = [] } = useQuery({
    queryKey: ['propertyOwners'],
    queryFn: () => base44.entities.PropertyOwner.list('-created_date'),
  });



  const filteredInquiries = statusFilter === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === statusFilter);

  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'active').length;
  const totalInquiries = inquiries.length;
  const qualifiedTenants = inquiries.filter(i => i.status === 'qualified' || i.status === 'rented').length;
  const conversionRate = totalInquiries > 0 ? Math.round((qualifiedTenants / totalInquiries) * 100) : 0;
  
  const avgInquiriesPerProperty = totalProperties > 0 
    ? Math.round(totalInquiries / totalProperties) 
    : 0;

  const verificationCompleted = inquiries.filter(i => i.id_verification_status === 'completed').length;
  const verificationRate = totalInquiries > 0 ? Math.round((verificationCompleted / totalInquiries) * 100) : 0;
  const avgScore = inquiries.filter(i => i.modero_score).length > 0
    ? Math.round(inquiries.filter(i => i.modero_score).reduce((sum, i) => sum + i.modero_score, 0) / inquiries.filter(i => i.modero_score).length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <Card className="overflow-hidden border-0 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300" />
            <CardContent className="bg-card border-b border-border p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    if (value !== 'all') {
                      setTimeout(() => {
                        const inquiriesSection = document.getElementById('recent-inquiries');
                        if (inquiriesSection) {
                          inquiriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px] border-slate-200 text-sm">
                    <SelectValue placeholder={t('filter_by_status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all_inquiries')}</SelectItem>
                    <SelectItem value="new">{t('status_new')}</SelectItem>
                    <SelectItem value="screening">{t('status_screening')}</SelectItem>
                    <SelectItem value="kyc_pending">{t('status_kyc_pending')}</SelectItem>
                    <SelectItem value="qualified">{t('status_qualified')}</SelectItem>
                    <SelectItem value="rejected">{t('status_rejected')}</SelectItem>
                    <SelectItem value="rented">{t('status_rented')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <MetricCard title={t('active_properties')} value={activeProperties} subtitle={`${totalProperties} ${t('total_listings')}`} icon={Building2} trend="up" trendValue={12} color="indigo" index={0} />
            <MetricCard title={t('total_inquiries')} value={totalInquiries} subtitle={`${avgInquiriesPerProperty} ${t('avg_per_property')}`} icon={MessageSquare} trend="up" trendValue={24} color="blue" index={1} />
            <MetricCard title={t('qualified_tenants_label')} value={qualifiedTenants} subtitle={`${conversionRate}% ${t('conversion_rate').toLowerCase()}`} icon={UserCheck} trend="up" trendValue={8} color="emerald" index={2} />
            <MetricCard title={t('verification_rate')} value={`${verificationRate}%`} subtitle={`${verificationCompleted} ${t('verified_tenants')}`} icon={ShieldCheck} trend="up" trendValue={18} color="amber" index={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 items-stretch">
            <InquiryFunnel inquiries={filteredInquiries} />
            <RevenueChart propertyOwners={propertyOwners} />
          </div>

          <div>
            <PropertyPerformance
              properties={properties}
              inquiries={inquiries}
              onPropertyClick={(p) => { setSelectedProperty(p); setPropertyDialogOpen(true); }}
            />
          </div>

          <div id="recent-inquiries">
            <RecentInquiries inquiries={filteredInquiries} properties={properties} />
          </div>

          <ConfirmedBookings />
          <SlackIntegration />
        </div>
      </div>

      <PropertyDetailsDialog
        property={selectedProperty}
        inquiries={inquiries}
        open={propertyDialogOpen}
        onOpenChange={setPropertyDialogOpen}
      />
    </div>
  );
}