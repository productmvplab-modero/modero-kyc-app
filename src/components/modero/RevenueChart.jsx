import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

export default function RevenueChart({ propertyOwners }) {
  const getMonthlyRevenue = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => {
      const baseRevenue = propertyOwners
        .filter(po => po.status === 'active')
        .reduce((sum, po) => sum + (po.monthly_fee || 0), 0);
      
      const monthlyRevenue = baseRevenue * (0.7 + (index * 0.05));
      
      return {
        month,
        revenue: Math.round(monthlyRevenue)
      };
    });
  };

  const data = getMonthlyRevenue();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">Monthly Revenue</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Subscription revenue trend</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value) => [`€${value}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}