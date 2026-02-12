import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function TopCustomers({ customers }) {
  const topCustomers = [...customers]
    .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
    .slice(0, 5);

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  };

  const statusColors = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-slate-50 text-slate-600 border-slate-200",
    lead: "bg-amber-50 text-amber-700 border-amber-200"
  };

  const avatarColors = [
    "bg-indigo-100 text-indigo-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700"
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Top Customers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {topCustomers.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No customers yet
            </div>
          ) : (
            topCustomers.map((customer, index) => (
              <div 
                key={customer.id} 
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className={cn("h-10 w-10", avatarColors[index % avatarColors.length])}>
                    <AvatarFallback className="text-sm font-medium bg-transparent">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{customer.name}</p>
                    <p className="text-xs text-slate-500">{customer.company || customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ${(customer.total_spent || 0).toLocaleString()}
                  </p>
                  <Badge 
                    variant="outline"
                    className={cn("mt-1 text-xs font-normal border", statusColors[customer.status || "active"])}
                  >
                    {customer.status || "active"}
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