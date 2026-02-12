import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, Filter } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, subYears } from "date-fns";
import { cn } from "@/lib/utils";

export default function DashboardFilters({ 
  dateRange, 
  setDateRange, 
  transactionType, 
  setTransactionType,
  onExport 
}) {
  const presets = [
    { label: "Last 30 days", getValue: () => ({ start: subMonths(new Date(), 1), end: new Date() }) },
    { label: "Last 3 months", getValue: () => ({ start: subMonths(new Date(), 3), end: new Date() }) },
    { label: "Last 6 months", getValue: () => ({ start: subMonths(new Date(), 6), end: new Date() }) },
    { label: "This year", getValue: () => ({ start: startOfYear(new Date()), end: new Date() }) },
    { label: "Last year", getValue: () => ({ 
      start: startOfYear(subYears(new Date(), 1)), 
      end: endOfMonth(subMonths(startOfYear(new Date()), 1))
    }) },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "justify-start text-left font-normal border-slate-200 hover:bg-slate-50",
                "h-9 px-3"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
              <span className="text-sm">
                {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d, yyyy")}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b border-slate-100">
              <div className="flex flex-wrap gap-1">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setDateRange(preset.getValue())}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex">
              <Calendar
                mode="single"
                selected={dateRange.start}
                onSelect={(date) => date && setDateRange({ ...dateRange, start: date })}
                initialFocus
              />
              <Calendar
                mode="single"
                selected={dateRange.end}
                onSelect={(date) => date && setDateRange({ ...dateRange, end: date })}
              />
            </div>
          </PopoverContent>
        </Popover>

        <Select value={transactionType} onValueChange={setTransactionType}>
          <SelectTrigger className="w-[140px] h-9 border-slate-200">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="revenue">Revenue Only</SelectItem>
            <SelectItem value="expense">Expenses Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={onExport}
        className="bg-slate-900 hover:bg-slate-800 text-white h-9"
      >
        <Download className="w-4 h-4 mr-2" />
        Export Report
      </Button>
    </div>
  );
}