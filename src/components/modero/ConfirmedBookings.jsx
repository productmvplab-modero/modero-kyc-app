import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, MapPin, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ConfirmedBookings() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['confirmedBookings'],
    queryFn: () => base44.entities.ViewingBooking.filter({ status: 'confirmed' }, '-viewing_date', 20),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const getProperty = (id) => properties.find(p => p.id === id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-orange-500" />Confirmed Viewings</CardTitle></CardHeader>
        <CardContent><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-orange-500" />
            Confirmed Viewings
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">{bookings.length} confirmed</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No confirmed viewings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => {
              const property = getProperty(booking.property_id);
              return (
                <div key={booking.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-orange-50 hover:border-orange-100 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <CalendarCheck className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-slate-800 truncate">{booking.tenant_name || booking.tenant_email}</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Confirmed</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {booking.viewing_date ? format(new Date(booking.viewing_date), 'MMM d, yyyy') : '—'} at {booking.viewing_time}
                      </span>
                      {property && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {property.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}