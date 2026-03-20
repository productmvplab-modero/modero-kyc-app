import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, TrendingUp } from "lucide-react";
import { useLanguage } from '@/components/LanguageContext';

export default function PropertyPerformance({ properties, inquiries = [], onPropertyClick }) {
  const { t } = useLanguage();
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
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
        <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">{t('my_properties')}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">{t('click_property_details')}</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">{t('property_label')}</TableHead>
                <TableHead className="font-semibold">{t('rent')}</TableHead>
                <TableHead className="font-semibold">{t('inquiries_label')}</TableHead>
                <TableHead className="font-semibold">{t('status_qualified')}</TableHead>
                <TableHead className="font-semibold">{t('conversion')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProperties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    {t('no_properties')}
                  </TableCell>
                </TableRow>
              ) : (
                topProperties.map((property) => (
                  <TableRow 
                    key={property.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onPropertyClick?.(property)}
                  >
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
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
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