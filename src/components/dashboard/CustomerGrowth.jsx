import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, eachMonthOfInterval, parseISO } from "date-fns";

export default function CustomerGrowth({ customers, dateRange }) {
  const getMonthlyGrowth = () => {
    const months = eachMonthOfInterval({
      start: dateRange.start,
      end: dateRange.end
    });

    let cumulative = 0;
    
    return months.map(month => {
      const monthStr = format(month, "yyyy-MM");
      const newCustomers = customers.filter(c => 
        c.acquisition_date && c.acquisition_date.startsWith(monthStr)
      ).length;

      cumulative += newCustomers;

      return {
        month: format(month, "MMM"),
        fullMonth: format(month, "MMMM yyyy"),
        new: newCustomers,
        total: cumulative
      };
    });
  };

  const data = getMonthlyGrowth();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-lg">
          <p className="text-sm font-medium text-slate-900 mb-2">
            {payload[0]?.payload?.fullMonth}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">New Customers:</span>
              <span className="font-semibold text-slate-900">{payload[0]?.value}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Customer Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="new" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}