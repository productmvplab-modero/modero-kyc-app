import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingDown, Users, PieChart } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import StatCard from "../components/dashboard/StatCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import ExpensesChart from "../components/dashboard/ExpensesChart";
import CustomerGrowthChart from "../components/dashboard/CustomerGrowthChart";
import FilterPanel from "../components/dashboard/FilterPanel";
import TransactionTable from "../components/dashboard/TransactionTable";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("30days");
  const [category, setCategory] = useState("all");

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date'),
  });

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date'),
  });

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '7days': return subDays(now, 7);
      case '30days': return subDays(now, 30);
      case '90days': return subDays(now, 90);
      case '1year': return subDays(now, 365);
      default: return null;
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const dateFilter = getDateFilter();
    const matchesDate = !dateFilter || new Date(t.date) >= dateFilter;
    const matchesCategory = category === 'all' || t.category === category;
    return matchesDate && matchesCategory;
  });

  const totalRevenue = filteredTransactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  const previousPeriodFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '7days': return { start: subDays(now, 14), end: subDays(now, 7) };
      case '30days': return { start: subDays(now, 60), end: subDays(now, 30) };
      case '90days': return { start: subDays(now, 180), end: subDays(now, 90) };
      default: return null;
    }
  };

  const calculateChange = (current, type) => {
    const period = previousPeriodFilter();
    if (!period) return 0;
    
    const previous = transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === type && date >= period.start && date <= period.end;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getRevenueChartData = () => {
    const data = {};
    filteredTransactions
      .filter(t => t.type === 'revenue')
      .forEach(t => {
        const date = format(new Date(t.date), 'MMM dd');
        data[date] = (data[date] || 0) + t.amount;
      });
    
    return Object.entries(data)
      .map(([date, amount]) => ({ date, amount }))
      .slice(-15);
  };

  const getExpensesChartData = () => {
    const data = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    
    return Object.entries(data)
      .map(([category, amount]) => ({ category: category.replace(/_/g, ' '), amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  };

  const getCustomerGrowthData = () => {
    const dateFilter = getDateFilter();
    const filteredCustomers = dateFilter 
      ? customers.filter(c => new Date(c.created_date) >= dateFilter)
      : customers;
    
    const data = {};
    filteredCustomers.forEach(c => {
      const date = format(new Date(c.created_date), 'MMM dd');
      data[date] = (data[date] || 0) + 1;
    });
    
    let cumulative = 0;
    return Object.entries(data)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => {
        cumulative += count;
        return { date, count: cumulative };
      })
      .slice(-15);
  };

  const exportReport = () => {
    const csvContent = [
      ['Type', 'Description', 'Category', 'Date', 'Amount'],
      ...filteredTransactions.map(t => [
        t.type,
        t.description,
        t.category,
        format(new Date(t.date), 'yyyy-MM-dd'),
        t.amount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Business Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Track your business performance at a glance</p>
          </div>
        </div>

        <FilterPanel
          dateRange={dateRange}
          setDateRange={setDateRange}
          category={category}
          setCategory={setCategory}
          onExport={exportReport}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={calculateChange(totalRevenue, 'revenue')}
            icon={DollarSign}
            gradient="from-emerald-500 to-teal-600"
            index={0}
          />
          <StatCard
            title="Total Expenses"
            value={`$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={-calculateChange(totalExpenses, 'expense')}
            icon={TrendingDown}
            gradient="from-rose-500 to-pink-600"
            index={1}
          />
          <StatCard
            title="Net Profit"
            value={`$${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={calculateChange(totalRevenue, 'revenue') - calculateChange(totalExpenses, 'expense')}
            icon={PieChart}
            gradient="from-indigo-500 to-purple-600"
            index={2}
          />
          <StatCard
            title="Total Customers"
            value={customers.length}
            change={15}
            icon={Users}
            gradient="from-blue-500 to-cyan-600"
            index={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={getRevenueChartData()} />
          <ExpensesChart data={getExpensesChartData()} />
        </div>

        <CustomerGrowthChart data={getCustomerGrowthData()} />

        <TransactionTable transactions={filteredTransactions.slice(0, 10)} />
      </div>
    </div>
  );
}