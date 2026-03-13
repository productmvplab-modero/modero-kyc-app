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
import { useLanguage } from "@/components/LanguageContext";

export default function Dashboard() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  // Scroll to Recent Inquiries section when filter changes
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
                <SelectTrigger className="w-[180px] border-slate-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Inquiries</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="kyc_pending">KYC Pending</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Properties"
            value={activeProperties}
            subtitle={`${totalProperties} total listings`}
            icon={Building2}
            trend="up"
            trendValue={12}
            color="indigo"
            index={0}
          />
          <MetricCard
            title="Total Inquiries"
            value={totalInquiries}
            subtitle={`${avgInquiriesPerProperty} avg per property`}
            icon={MessageSquare}
            trend="up"
            trendValue={24}
            color="purple"
            index={1}
          />
          <MetricCard
            title="Qualified Tenants"
            value={qualifiedTenants}
            subtitle={`${conversionRate}% conversion rate`}
            icon={UserCheck}
            trend="up"
            trendValue={8}
            color="emerald"
            index={2}
          />
          <MetricCard
            title="Verification Rate"
            value={`${verificationRate}%`}
            subtitle={`${verificationCompleted} verified tenants`}
            icon={ShieldCheck}
            trend="up"
            trendValue={18}
            color="amber"
            index={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InquiryFunnel inquiries={filteredInquiries} />
          <RevenueChart propertyOwners={propertyOwners} />
        </div>

        <PropertyPerformance 
          properties={properties} 
          inquiries={inquiries}
          onPropertyClick={(p) => { setSelectedProperty(p); setPropertyDialogOpen(true); }} 
        />

        <div id="recent-inquiries">
          <RecentInquiries inquiries={filteredInquiries} properties={properties} />
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