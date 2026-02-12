import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS = {
  sales: "Sales",
  services: "Services",
  subscriptions: "Subscriptions",
  other_income: "Other Income",
  payroll: "Payroll",
  rent: "Rent",
  utilities: "Utilities",
  marketing: "Marketing",
  supplies: "Supplies",
  software: "Software",
  travel: "Travel",
  other_expense: "Other"
};

export default function RecentTransactions({ transactions }) {
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No transactions yet
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    transaction.type === "revenue" 
                      ? "bg-emerald-50" 
                      : "bg-rose-50"
                  )}>
                    {transaction.type === "revenue" ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {transaction.description || CATEGORY_LABELS[transaction.category] || transaction.category}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">
                        {transaction.date && format(new Date(transaction.date), "MMM d, yyyy")}
                      </span>
                      {transaction.client_name && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">{transaction.client_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-semibold",
                    transaction.type === "revenue" ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {transaction.type === "revenue" ? "+" : "-"}${transaction.amount?.toLocaleString()}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className="mt-1 text-xs bg-slate-100 text-slate-600 font-normal"
                  >
                    {CATEGORY_LABELS[transaction.category] || transaction.category}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}