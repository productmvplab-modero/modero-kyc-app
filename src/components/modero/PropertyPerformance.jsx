import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, TrendingUp } from "lucide-react";

export default function PropertyPerformance({ properties }) {
  const topProperties = [...properties]
    .sort((a, b) => b.total_inquiries - a.total_inquiries)
    .slice(0, 5);

  const getConversionRate = (property) => {
    if (property.total_inquiries === 0) return 0;
    return Math.round((property.qualified_tenants / property.total_inquiries) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">Top Performing Properties</CardTitle>
          <p className="text-sm text-slate-500 mt-1">By inquiry volume</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Property</TableHead>
                <TableHead className="font-semibold">Rent</TableHead>
                <TableHead className="font-semibold">Inquiries</TableHead>
                <TableHead className="font-semibold">Qualified</TableHead>
                <TableHead className="font-semibold">Conversion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProperties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No properties yet
                  </TableCell>
                </TableRow>
              ) : (
                topProperties.map((property) => (
                  <TableRow key={property.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{property.title}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          {property.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      €{property.monthly_rent.toLocaleString()}/mo
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                        {property.total_inquiries}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        {property.qualified_tenants}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {getConversionRate(property)}%
                        </span>
                        {getConversionRate(property) > 10 && (
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}