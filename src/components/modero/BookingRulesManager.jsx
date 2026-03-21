import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Save } from 'lucide-react';

export default function BookingRulesManager({ propertyId, ownerEmail }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    available_weekdays: [1, 2, 3, 4, 5],
    available_time_slots: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
    booking_window_days: 30,
    min_advance_hours: 24,
    max_concurrent_bookings: 1,
  });

  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const allTimeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // Fetch existing booking rules
  const { data: bookingRules, isLoading } = useQuery({
    queryKey: ['bookingRules', propertyId],
    queryFn: () => propertyId ? 
      base44.entities.BookingRules.filter({ property_id: propertyId }).then(r => r[0]) : null,
    enabled: !!propertyId,
  });

  React.useEffect(() => {
    if (bookingRules) {
      setFormData({
        available_weekdays: bookingRules.available_weekdays || [1, 2, 3, 4, 5],
        available_time_slots: bookingRules.available_time_slots || [],
        booking_window_days: bookingRules.booking_window_days || 30,
        min_advance_hours: bookingRules.min_advance_hours || 24,
        max_concurrent_bookings: bookingRules.max_concurrent_bookings || 1,
      });
    }
  }, [bookingRules]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        property_id: propertyId,
        owner_email: ownerEmail,
        ...formData,
      };

      if (bookingRules?.id) {
        await base44.entities.BookingRules.update(bookingRules.id, data);
      } else {
        await base44.entities.BookingRules.create(data);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingRules', propertyId] });
    },
  });

  const toggleWeekday = (day) => {
    setFormData(prev => ({
      ...prev,
      available_weekdays: prev.available_weekdays.includes(day)
        ? prev.available_weekdays.filter(d => d !== day)
        : [...prev.available_weekdays, day].sort()
    }));
  };

  const toggleTimeSlot = (time) => {
    setFormData(prev => ({
      ...prev,
      available_time_slots: prev.available_time_slots.includes(time)
        ? prev.available_time_slots.filter(t => t !== time)
        : [...prev.available_time_slots, time].sort()
    }));
  };

  if (isLoading) {
    return <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Booking Rules & Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Weekdays */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Available Days</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {dayLabels.map((label, day) => (
              <label key={day} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.available_weekdays.includes(day)}
                  onChange={() => toggleWeekday(day)}
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Available Time Slots */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Available Time Slots</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {allTimeSlots.map(time => (
              <button
                key={time}
                onClick={() => toggleTimeSlot(time)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  formData.available_time_slots.includes(time)
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-3 h-3 inline mr-1" />
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Window */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Booking Window (days in advance)
          </label>
          <Input
            type="number"
            min="1"
            max="180"
            value={formData.booking_window_days}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              booking_window_days: parseInt(e.target.value) || 30
            }))}
            className="max-w-xs"
          />
          <p className="text-xs text-slate-500 mt-1">How many days in advance can tenants book viewings?</p>
        </div>

        {/* Min Advance Hours */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Minimum Advance Hours
          </label>
          <Input
            type="number"
            min="1"
            max="168"
            value={formData.min_advance_hours}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              min_advance_hours: parseInt(e.target.value) || 24
            }))}
            className="max-w-xs"
          />
          <p className="text-xs text-slate-500 mt-1">Bookings must be made at least this many hours in advance</p>
        </div>

        {/* Max Concurrent Bookings */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Max Concurrent Bookings per Slot
          </label>
          <Input
            type="number"
            min="1"
            max="10"
            value={formData.max_concurrent_bookings}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              max_concurrent_bookings: parseInt(e.target.value) || 1
            }))}
            className="max-w-xs"
          />
          <p className="text-xs text-slate-500 mt-1">How many tenants can book the same time slot?</p>
        </div>

        {/* Save Button */}
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2"
        >
          {saveMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Booking Rules
            </>
          )}
        </Button>

        {saveMutation.isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">✓ Booking rules updated successfully</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}