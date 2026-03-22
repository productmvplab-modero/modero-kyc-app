import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

export default function ViewingCalendar({ bookings = [], currentDate, onDateChange }) {
  // Get booked dates
  const bookedDates = useMemo(() => {
    return bookings.map(b => new Date(b.viewing_date));
  }, [bookings]);

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

  const getBookingForDate = (date) => {
    return bookings.find(b => isSameDay(new Date(b.viewing_date), date));
  };

  return (
    <Card className="border-0 shadow-sm overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-600" />
          <CardTitle className="text-lg">Booked Viewings</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDateChange(subMonths(currentDate, 1))}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[120px] text-center text-slate-700">
            {format(currentDate, 'MMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDateChange(addMonths(currentDate, 1))}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map(label => (
            <div key={label} className="text-center text-xs font-semibold text-slate-500 py-2">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, weekIdx) =>
            week.map(day => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const booking = getBookingForDate(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square p-1 rounded-lg border-2 flex flex-col items-center justify-center text-center transition-colors ${
                    isCurrentMonth
                      ? isToday
                        ? 'border-orange-400 bg-orange-50'
                        : booking
                        ? 'border-green-400 bg-green-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-slate-100 bg-slate-50'
                  }`}
                  title={booking ? `Viewing booked at ${booking.viewing_time}` : ''}
                >
                  <p
                    className={`text-xs font-semibold ${
                      isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {format(day, 'd')}
                  </p>
                  {booking && (
                    <div className="text-lg">✓</div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-400" />
            <span className="text-slate-600">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-slate-300" />
            <span className="text-slate-600">Available</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}