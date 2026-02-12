import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function RecentInquiries({ inquiries }) {
  const statusColors = {
    new: 'bg-blue-100 text-blue-800 border-blue-200',
    screening: 'bg-amber-100 text-amber-800 border-amber-200',
    kyc_pending: 'bg-orange-100 text-orange-800 border-orange-200',
    credit_check: 'bg-purple-100 text-purple-800 border-purple-200',
    qualified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rental_ready: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
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
                  <TableHead className="font-semibold">Property</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Quality Score</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No inquiries yet
                    </TableCell>
                  </TableRow>
                ) : (
                  inquiries.slice(0, 10).map((inquiry) => (
                    <TableRow key={inquiry.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{inquiry.tenant_name}</p>
                          <p className="text-xs text-slate-500">{inquiry.tenant_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {inquiry.property_title}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`${statusColors[inquiry.status]} border capitalize`}
                        >
                          {inquiry.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {inquiry.quality_score ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  inquiry.quality_score >= 80 ? 'bg-emerald-500' : 
                                  inquiry.quality_score >= 60 ? 'bg-amber-500' : 
                                  'bg-rose-500'
                                }`}
                                style={{ width: `${inquiry.quality_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{inquiry.quality_score}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {format(new Date(inquiry.created_date), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}