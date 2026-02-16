import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Home,
  Euro,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function PropertyDetailsDialog({ property, inquiries, open, onOpenChange }) {
  if (!property) return null;

  const propertyInquiries = inquiries?.filter(i => i.property_id === property.id) || [];
  const qualifiedCount = propertyInquiries.filter(i => i.status === 'qualified').length;
  const conversionRate = propertyInquiries.length > 0 
    ? ((qualifiedCount / propertyInquiries.length) * 100).toFixed(1)
    : 0;
  const avgIncome = propertyInquiries.length > 0
    ? (propertyInquiries.reduce((sum, i) => sum + (i.monthly_income || 0), 0) / propertyInquiries.length).toFixed(0)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-600" />
            {property.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm font-medium">{property.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">City</p>
                    <p className="text-sm font-medium">{property.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Monthly Rent</p>
                    <p className="text-sm font-medium">€{property.monthly_rent?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Bedrooms</p>
                    <p className="text-sm font-medium">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <Badge className={property.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                      {property.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Idealista ID</p>
                    <p className="text-sm font-medium">{property.idealista_id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-indigo-900">{propertyInquiries.length}</p>
                  <p className="text-xs text-slate-600">Total Inquiries</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-900">{qualifiedCount}</p>
                  <p className="text-xs text-slate-600">Qualified</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{conversionRate}%</p>
                  <p className="text-xs text-slate-600">Conversion</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Euro className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-900">€{avgIncome}</p>
                  <p className="text-xs text-slate-600">Avg Income</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Inquiries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {propertyInquiries.length > 0 ? (
                <div className="space-y-3">
                  {propertyInquiries.slice(0, 5).map((inquiry) => (
                    <div key={inquiry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                          {inquiry.tenant_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{inquiry.tenant_name}</p>
                          <p className="text-xs text-slate-500">{inquiry.tenant_email}</p>
                        </div>
                      </div>
                      <Badge className={
                        inquiry.status === 'qualified' ? 'bg-emerald-100 text-emerald-800' :
                        inquiry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }>
                        {inquiry.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No inquiries yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}