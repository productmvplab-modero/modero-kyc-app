import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";
import Header from "../components/modero/Header";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const COLORS = {
  orange: '#f97316',
  amber: '#f59e0b',
  emerald: '#10b981',
  red: '#ef4444',
  blue: '#3b82f6',
  slate: '#64748b',
  violet: '#8b5cf6',
};

const STATUS_COLORS = {
  new: COLORS.blue,
  screening: COLORS.amber,
  kyc_pending: COLORS.violet,
  qualified: COLORS.emerald,
  rejected: COLORS.red,
  rented: COLORS.orange,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
      <p className="text-xs font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: () => base44.entities.Inquiry.list('-created_date'),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  // --- Application Volume by Month (last 6 months) ---
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return { label: format(d, 'MMM yy'), start: startOfMonth(d), end: endOfMonth(d) };
  });

  const volumeData = last6Months.map(({ label, start, end }) => {
    const inRange = inquiries.filter(inq => {
      try {
        const d = parseISO(inq.created_date);
        return isWithinInterval(d, { start, end });
      } catch { return false; }
    });
    return {
      month: label,
      total: inRange.length,
      qualified: inRange.filter(i => i.status === 'qualified' || i.status === 'rented').length,
      rejected: inRange.filter(i => i.status === 'rejected').length,
    };
  });

  // --- Status Distribution ---
  const statusCounts = ['new', 'screening', 'kyc_pending', 'qualified', 'rejected', 'rented'].map(s => ({
    name: s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: inquiries.filter(i => i.status === s).length,
    color: STATUS_COLORS[s],
  })).filter(s => s.value > 0);

  // --- Pass/Fail Rate ---
  const total = inquiries.length;
  const passed = inquiries.filter(i => i.status === 'qualified' || i.status === 'rented').length;
  const failed = inquiries.filter(i => i.status === 'rejected').length;
  const pending = total - passed - failed;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const failRate = total > 0 ? Math.round((failed / total) * 100) : 0;

  const passFail = [
    { name: 'Qualified / Rented', value: passed, color: COLORS.emerald },
    { name: 'Rejected', value: failed, color: COLORS.red },
    { name: 'In Progress', value: pending, color: COLORS.slate },
  ].filter(d => d.value > 0);

  // --- Risk Flags ---
  const riskFlags = [
    { label: 'Low Credit Score', count: inquiries.filter(i => i.credit_score && i.credit_score < 60).length, color: COLORS.red },
    { label: 'ID Not Verified', count: inquiries.filter(i => i.id_verification_status !== 'completed').length, color: COLORS.orange },
    { label: 'No Bank Connected', count: inquiries.filter(i => !i.bank_account_connected).length, color: COLORS.amber },
    { label: 'Email Unverified', count: inquiries.filter(i => !i.email_verified).length, color: COLORS.violet },
    { label: 'Phone Unverified', count: inquiries.filter(i => !i.mobile_verified).length, color: COLORS.blue },
    { label: 'No Income Docs', count: inquiries.filter(i => !i.documents?.payslip_url).length, color: COLORS.slate },
  ].sort((a, b) => b.count - a.count);

  // --- Employment Distribution ---
  const employmentData = ['employed', 'self_employed', 'student', 'retired', 'unemployed'].map(s => ({
    name: s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: inquiries.filter(i => i.employment_status === s).length,
  })).filter(d => d.value > 0);

  // --- Score Distribution ---
  const scoreBuckets = [
    { range: '0-20', min: 0, max: 20 },
    { range: '21-40', min: 21, max: 40 },
    { range: '41-60', min: 41, max: 60 },
    { range: '61-80', min: 61, max: 80 },
    { range: '81-100', min: 81, max: 100 },
  ].map(b => ({
    range: b.range,
    count: inquiries.filter(i => i.modero_score >= b.min && i.modero_score <= b.max).length,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <Header />
      <div className="p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

          {/* Page Header */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardContent className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
                  <p className="text-sm text-slate-500">Tenant application insights & KYC performance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total Applications', value: total, icon: Users, color: 'blue' },
              { label: 'Pass Rate', value: `${passRate}%`, icon: CheckCircle2, color: 'emerald' },
              { label: 'Rejection Rate', value: `${failRate}%`, icon: XCircle, color: 'red' },
              { label: 'Risk Flags', value: riskFlags.reduce((s, f) => s + f.count, 0), icon: ShieldAlert, color: 'orange' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-0 shadow-md overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${color === 'blue' ? 'from-blue-500 to-blue-400' : color === 'emerald' ? 'from-emerald-500 to-emerald-400' : color === 'red' ? 'from-red-500 to-red-400' : 'from-orange-500 to-amber-400'}`} />
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${color === 'blue' ? 'bg-blue-100' : color === 'emerald' ? 'bg-emerald-100' : color === 'red' ? 'bg-red-100' : 'bg-orange-100'}`}>
                      <Icon className={`w-4 h-4 ${color === 'blue' ? 'text-blue-600' : color === 'emerald' ? 'text-emerald-600' : color === 'red' ? 'text-red-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-xl font-bold text-slate-900">{value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Application Volume Over Time */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                Application Volume — Last 6 Months
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={volumeData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total" name="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="qualified" name="Qualified" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" name="Rejected" fill={COLORS.red} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pass/Fail + Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pass/Fail Pie */}
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-red-400" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-orange-500" />
                  Pass / Fail Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={passFail} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                        {passFail.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 min-w-[130px]">
                    {passFail.map(({ name, value, color }) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <div>
                          <p className="text-xs text-slate-500">{name}</p>
                          <p className="text-sm font-bold text-slate-900">{value} <span className="text-xs font-normal text-slate-400">({total > 0 ? Math.round(value/total*100) : 0}%)</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-violet-400 to-orange-400" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-orange-500" />
                  Application Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statusCounts} dataKey="value" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                        {statusCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 min-w-[130px]">
                    {statusCounts.map(({ name, value, color }) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <div className="flex-1 flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-600">{name}</p>
                          <p className="text-xs font-bold text-slate-900">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Flags + Score Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Risk Flags */}
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 via-orange-400 to-amber-300" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Common Risk Flags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {riskFlags.map(({ label, count, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700">{label}</span>
                      <span className="text-sm font-bold text-slate-900">{count} <span className="text-xs font-normal text-slate-400">({total > 0 ? Math.round(count/total*100) : 0}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Modero Score Distribution */}
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  Modero Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={scoreBuckets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Applicants" radius={[4, 4, 0, 0]}>
                      {scoreBuckets.map((entry, i) => (
                        <Cell key={i} fill={i < 2 ? COLORS.red : i === 2 ? COLORS.amber : COLORS.emerald} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Employment Distribution */}
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Employment Status of Applicants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={employmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Applicants" fill={COLORS.orange} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}