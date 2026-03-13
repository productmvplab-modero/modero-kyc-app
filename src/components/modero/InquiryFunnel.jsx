import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageContext";

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#f43f5e'];

export default function InquiryFunnel({ inquiries }) {
  const { t } = useLanguage();
  const getFunnelData = () => {
    const stages = {
      [t('status_new')]: inquiries.filter(i => i.status === 'new').length,
      [t('status_screening')]: inquiries.filter(i => i.status === 'screening').length,
      [t('status_kyc_pending')]: inquiries.filter(i => i.status === 'kyc_pending').length,
      [t('status_qualified')]: inquiries.filter(i => i.status === 'qualified').length,
      [t('status_rented')]: inquiries.filter(i => i.status === 'rented').length,
    };

    return Object.entries(stages).map(([stage, count]) => ({
      stage,
      count
    }));
  };

  const data = getFunnelData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">{t('inquiry_pipeline')}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">{t('tenant_qual_funnel')}</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis 
                dataKey="stage" 
                type="category" 
                stroke="#64748b" 
                style={{ fontSize: '12px' }}
                width={100}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}