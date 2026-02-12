import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, Filter, CheckCircle, Star } from "lucide-react";

export default function ConversionFunnel({ inquiries }) {
  const totalInquiries = inquiries.length;
  const screening = inquiries.filter(i => ['screening', 'kyc_pending', 'credit_check'].includes(i.status)).length;
  const qualified = inquiries.filter(i => i.status === 'qualified').length;
  const rentalReady = inquiries.filter(i => i.status === 'rental_ready').length;

  const stages = [
    { label: 'Total Inquiries', count: totalInquiries, icon: Users, color: 'from-blue-500 to-blue-600', percentage: 100 },
    { label: 'In Screening', count: screening, icon: Filter, color: 'from-amber-500 to-amber-600', percentage: totalInquiries ? (screening / totalInquiries * 100) : 0 },
    { label: 'Qualified', count: qualified, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', percentage: totalInquiries ? (qualified / totalInquiries * 100) : 0 },
    { label: 'Rental Ready', count: rentalReady, icon: Star, color: 'from-purple-500 to-purple-600', percentage: totalInquiries ? (rentalReady / totalInquiries * 100) : 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">Qualification Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const width = stage.percentage;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${stage.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{stage.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900">{stage.count}</span>
                      <span className="text-xs text-slate-500 ml-2">({width.toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${stage.color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}