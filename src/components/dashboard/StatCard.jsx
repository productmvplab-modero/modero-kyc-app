import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function StatCard({ title, value, subtitle, icon: Icon, gradient, trend, index = 0 }) {
  const isPositive = trend && trend >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-slate-500">{subtitle}</p>
              )}
              {trend !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                  )}
                  <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {Math.abs(trend)}%
                  </span>
                  <span className="text-xs text-slate-500">vs last week</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}