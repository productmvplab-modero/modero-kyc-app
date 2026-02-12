import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { subMonths, isWithinInterval, parseISO } from "date-fns";
import { DollarSign, TrendingUp, Users, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import StatsCard from "@/components/dashboard/StatsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ExpenseBreakdown from "@/components/dashboard/ExpenseBreakdown";
import CustomerGrowth from "@/components/dashboard/CustomerGrowth";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import TopCustomers from "@/components/dashboard/TopCustomers";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    start: subMonths(new Date(), 6),
    end: new Date()
  });
  const [transactionType, setTransactionType] = useState("all");

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => base44.entities.Transaction.list("-date", 500)
  });

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-total_spent", 100)
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (!t.date) return false;
      const transactionDate = parseISO(t.date);
      const inRange = isWithinInterval(transactionDate, { start: dateRange.start, end: dateRange.end });
      const typeMatch = transactionType === "all" || t.type === transactionType;
      return inRange && typeMatch;
    });
  }, [transactions, dateRange, transactionType]);

  const stats = useMemo(() => {
    const revenue = filteredTransactions
      .filter((t) => t.type === "revenue")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const profit = revenue - expenses;
    const activeCustomers = customers.filter((c) => c.status === "active").length;

    return { revenue, expenses, profit, activeCustomers };
  }, [filteredTransactions, customers]);

  const handleExport = () => {
    const csvContent = [
      ["Date", "Type", "Category", "Description", "Amount", "Client"],
      ...filteredTransactions.map((t) => [
        t.date,
        t.type,
        t.category,
        t.description || "",
        t.amount,
        t.client_name || ""
      ])
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const isLoading = loadingTransactions || loadingCustomers;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Track your business performance and financial health
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <DashboardFilters
            dateRange={dateRange}
            setDateRange={setDateRange}
            transactionType={transactionType}
            setTransactionType={setTransactionType}
            onExport={handleExport}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))
          ) : (
            <>
              <StatsCard
                title="Total Revenue"
                value={`$${stats.revenue.toLocaleString()}`}
                icon={DollarSign}
                color="indigo"
                trend="up"
                trendValue="+12.5%"
              />
              <StatsCard
                title="Total Expenses"
                value={`$${stats.expenses.toLocaleString()}`}
                icon={Receipt}
                color="rose"
                trend="down"
                trendValue="-3.2%"
              />
              <StatsCard
                title="Net Profit"
                value={`$${stats.profit.toLocaleString()}`}
                icon={TrendingUp}
                color="emerald"
                trend={stats.profit >= 0 ? "up" : "down"}
                trendValue={stats.profit >= 0 ? "+8.1%" : "-5.2%"}
              />
              <StatsCard
                title="Active Customers"
                value={stats.activeCustomers.toLocaleString()}
                icon={Users}
                color="amber"
                trend="up"
                trendValue="+24"
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RevenueChart transactions={filteredTransactions} dateRange={dateRange} />
          </div>
          <ExpenseBreakdown transactions={filteredTransactions} />
        </div>

        {/* Customer Growth & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CustomerGrowth customers={customers} dateRange={dateRange} />
          <TopCustomers customers={customers} />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions transactions={filteredTransactions} />
      </div>
    </div>
  );
}