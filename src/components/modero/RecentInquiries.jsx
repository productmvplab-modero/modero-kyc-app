import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  screening: { label: 'Screening', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock },
  kyc_pending: { label: 'KYC Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
  qualified: { label: 'Qualified', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: XCircle },
  rented: { label: 'Rented', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle2 },
};

export default function RecentInquiries({ inquiries }) {
  const recentInquiries = [...inquiries]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-xl font-bold text-slate-900">Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Tenant</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Income</TableHead>
                  <TableHead className="font-semibold">Score</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No inquiries yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentInquiries.map((inquiry) => {
                    const StatusIcon = statusConfig[inquiry.status]?.icon || Clock;
                    return (
                      <TableRow key={inquiry.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${inquiry.tenant_name}`} />
                              <AvatarFallback>{inquiry.tenant_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900">{inquiry.tenant_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {inquiry.tenant_email}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {inquiry.monthly_income ? `€${inquiry.monthly_income.toLocaleString()}` : '—'}
                        </TableCell>
                        <TableCell>
                          {inquiry.qualification_score ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-slate-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    inquiry.qualification_score >= 70 ? 'bg-emerald-500' :
                                    inquiry.qualification_score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${inquiry.qualification_score}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-slate-700">
                                {inquiry.qualification_score}
                              </span>
                            </div>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${statusConfig[inquiry.status]?.color || 'bg-slate-100 text-slate-700'} border flex items-center gap-1 w-fit`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[inquiry.status]?.label || inquiry.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {format(new Date(inquiry.created_date), "MMM d, yyyy")}
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
    </motion.div>
  );
}