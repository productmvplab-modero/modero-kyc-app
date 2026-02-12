import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = "indigo" }) {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600"
  };

  const isPositive = trend === "up";

  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">
              {title}
            </p>
            <p className="text-3xl font-semibold text-slate-900 tracking-tight">
              {value}
            </p>
          </div>
          <div className={cn("p-3 rounded-xl", colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        {trendValue && (
          <div className="mt-4 flex items-center gap-1.5">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-500" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-emerald-600" : "text-rose-600"
            )}>
              {trendValue}
            </span>
            <span className="text-sm text-slate-400">vs last period</span>
          </div>
        )}
      </div>
      
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1",
        color === "indigo" && "bg-gradient-to-r from-indigo-400 to-indigo-600",
        color === "emerald" && "bg-gradient-to-r from-emerald-400 to-emerald-600",
        color === "rose" && "bg-gradient-to-r from-rose-400 to-rose-600",
        color === "amber" && "bg-gradient-to-r from-amber-400 to-amber-600"
      )} />
    </Card>
  );
}