import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from "framer-motion";

export default function QualityDistribution({ inquiries }) {
  const qualified = inquiries.filter(i => ['qualified', 'rental_ready'].includes(i.status)).length;
  const screening = inquiries.filter(i => ['screening', 'kyc_pending', 'credit_check'].includes(i.status)).length;
  const rejected = inquiries.filter(i => i.status === 'rejected').length;
  const newInquiries = inquiries.filter(i => i.status === 'new').length;

  const data = [
    { name: 'Qualified', value: qualified, color: '#10b981' },
    { name: 'In Screening', value: screening, color: '#f59e0b' },
    { name: 'Rejected', value: rejected, color: '#ef4444' },
    { name: 'New', value: newInquiries, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">Inquiry Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}