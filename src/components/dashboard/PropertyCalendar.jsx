import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Home, Clock, DollarSign } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

export default function PropertyCalendar({ contracts = [], viewingBookings = [], properties = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Collect all events
  const events = useMemo(() => {
    const allEvents = [];

    // Lease start dates
    contracts.forEach(contract => {
      if (contract.lease_start_date) {
        allEvents.push({
          date: new Date(contract.lease_start_date),
          type: 'lease_start',
          title: `Lease Start: ${contract.tenant_name}`,
          property: properties.find(p => p.id === contract.property_id)?.address || 'Property',
          color: 'bg-green-100 text-green-700',
          icon: '📋',
        });
      }
    });

    // Lease end dates
    contracts.forEach(contract => {
      if (contract.lease_end_date) {
        allEvents.push({
          date: new Date(contract.lease_end_date),
          type: 'lease_end',
          title: `Lease End: ${contract.tenant_name}`,
          property: properties.find(p => p.id === contract.property_id)?.address || 'Property',
          color: 'bg-orange-100 text-orange-700',
          icon: '📅',
        });
      }
    });

    // Viewing appointments
    viewingBookings.forEach(booking => {
      if (booking.viewing_date) {
        allEvents.push({
          date: new Date(booking.viewing_date),
          type: 'viewing',
          title: `Viewing: ${booking.tenant_name}`,
          property: properties.find(p => p.id === booking.property_id)?.address || 'Property',
          time: booking.viewing_time,
          color: 'bg-blue-100 text-blue-700',
          icon: '👁️',
        });
      }
    });

    return allEvents;
  }, [contracts, viewingBookings, properties]);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group by weeks
  const weeks = [];
  let week = [];
  calendarDays.forEach(day => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Property Calendar</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayLabels.map(label => (
            <div key={label} className="text-center text-xs font-semibold text-slate-500 py-2">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {weeks.map((week, weekIdx) =>
            week.map(day => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-24 p-2 rounded-lg border-2 transition-colors ${
                    isCurrentMonth
                      ? isToday
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <p
                    className={`text-xs font-semibold mb-1 ${
                      isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {format(day, 'd')}
                  </p>

                  {/* Events */}
                  <div className="space-y-1 text-xs">
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className={`${event.color} px-1.5 py-0.5 rounded text-xs truncate font-medium`}
                      >
                        {event.icon} {event.title.split(':')[0]}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-slate-500 px-1.5 py-0.5 text-xs">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-300" />
            <span className="text-xs text-slate-600">Lease Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-300" />
            <span className="text-xs text-slate-600">Lease End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300" />
            <span className="text-xs text-slate-600">Viewing</span>
          </div>
        </div>

        {/* Upcoming Events List */}
        {events.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Upcoming Events</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events
                .filter(event => event.date >= new Date())
                .sort((a, b) => a.date - b.date)
                .slice(0, 5)
                .map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-lg">{event.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{event.title}</p>
                      <p className="text-xs text-slate-500">{event.property}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(event.date, 'MMM d, yyyy')} {event.time && `at ${event.time}`}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}