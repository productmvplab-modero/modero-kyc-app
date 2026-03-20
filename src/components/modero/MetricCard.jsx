import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from '@/components/LanguageContext';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "indigo", index = 0 }) {
  const { t } = useLanguage();
  const isPositive = trend === "up";
  
  const colorStyles = {
    indigo: "from-orange-500 to-orange-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-400 to-amber-500",
    rose: "from-rose-500 to-rose-600",
    purple: "from-orange-400 to-amber-500",
    blue: "from-amber-500 to-orange-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{title}</p>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              {subtitle && (
                <p className="text-sm text-slate-500">{subtitle}</p>
              )}
              {trendValue !== undefined && (
                <div className="flex items-center gap-1 mt-3">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                  )}
                  <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trendValue}%
                  </span>
                  <span className="text-xs text-slate-500">{t('vs_last_month')}</span>
                </div>
              )}
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorStyles[color]} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}