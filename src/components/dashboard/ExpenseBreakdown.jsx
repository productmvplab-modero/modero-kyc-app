import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const CATEGORY_LABELS = {
  payroll: "Payroll",
  rent: "Rent",
  utilities: "Utilities",
  marketing: "Marketing",
  supplies: "Supplies",
  software: "Software",
  travel: "Travel",
  other_expense: "Other"
};

const COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", 
  "#ec4899", "#f43f5e", "#f97316", "#eab308"
];

export default function ExpenseBreakdown({ transactions }) {
  const getExpensesByCategory = () => {
    const expenses = transactions.filter(t => t.type === "expense");
    const categoryTotals = {};

    expenses.forEach(expense => {
      const category = expense.category || "other_expense";
      categoryTotals[category] = (categoryTotals[category] || 0) + (expense.amount || 0);
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: CATEGORY_LABELS[category] || category,
        value: amount
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const data = getExpensesByCategory();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-900">{item.name}</p>
          <p className="text-sm text-slate-600">
            ${item.value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy }) => {
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} y={cy - 8} className="text-2xl font-semibold fill-slate-900">
          ${(total / 1000).toFixed(1)}k
        </tspan>
        <tspan x={cx} y={cy + 14} className="text-xs fill-slate-500">
          Total Expenses
        </tspan>
      </text>
    );
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Expense Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}