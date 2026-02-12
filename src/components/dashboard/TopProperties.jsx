import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function TopProperties({ properties }) {
  const topProperties = properties
    .sort((a, b) => (b.total_inquiries || 0) - (a.total_inquiries || 0))
    .slice(0, 5);

  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    rented: 'bg-blue-50 text-blue-700 border-blue-200',
    inactive: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-xl font-bold text-slate-900">Top Performing Properties</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {topProperties.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                No properties yet
              </div>
            ) : (
              topProperties.map((property, index) => (
                <div 
                  key={property.id} 
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-indigo-50">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{property.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{property.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-xs text-slate-500">Inquiries:</span>
                      <span className="text-sm font-bold text-slate-900">{property.total_inquiries || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-slate-500">Qualified:</span>
                      <span className="text-sm font-semibold text-emerald-600">{property.qualified_inquiries || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}