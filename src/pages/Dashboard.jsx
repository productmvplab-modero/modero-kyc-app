import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, CheckCircle, Star } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import ConversionFunnel from "../components/dashboard/ConversionFunnel";
import PropertyPerformance from "../components/dashboard/PropertyPerformance";
import QualityDistribution from "../components/dashboard/QualityDistribution";
import RecentInquiries from "../components/dashboard/RecentInquiries";
import TopProperties from "../components/dashboard/TopProperties";

export default function Dashboard() {
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: () => base44.entities.Inquiry.list('-created_date'),
  });

  const { data: owners = [] } = useQuery({
    queryKey: ['owners'],
    queryFn: () => base44.entities.PropertyOwner.list('-created_date'),
  });

  const activeProperties = properties.filter(p => p.status === 'active').length;
  const totalInquiries = inquiries.length;
  const qualifiedInquiries = inquiries.filter(i => ['qualified', 'rental_ready'].includes(i.status)).length;
  const rentalReadyInquiries = inquiries.filter(i => i.status === 'rental_ready').length;
  const conversionRate = totalInquiries > 0 ? ((qualifiedInquiries / totalInquiries) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
              Modero Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Tenant qualification made simple</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Properties"
            value={activeProperties}
            subtitle={`${properties.length} total`}
            icon={Building2}
            gradient="from-indigo-500 to-purple-600"
            trend={12}
            index={0}
          />
          <StatCard
            title="Total Inquiries"
            value={totalInquiries}
            subtitle="All time"
            icon={Users}
            gradient="from-blue-500 to-cyan-600"
            trend={24}
            index={1}
          />
          <StatCard
            title="Qualified Tenants"
            value={qualifiedInquiries}
            subtitle={`${conversionRate}% conversion`}
            icon={CheckCircle}
            gradient="from-emerald-500 to-teal-600"
            trend={18}
            index={2}
          />
          <StatCard
            title="Rental Ready"
            value={rentalReadyInquiries}
            subtitle="Ready to move in"
            icon={Star}
            gradient="from-amber-500 to-orange-600"
            trend={8}
            index={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ConversionFunnel inquiries={inquiries} />
          </div>
          <QualityDistribution inquiries={inquiries} />
        </div>

        <PropertyPerformance properties={properties} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentInquiries inquiries={inquiries} />
          <TopProperties properties={properties} />
        </div>
      </div>
    </div>
  );
}