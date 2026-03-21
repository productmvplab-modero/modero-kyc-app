import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { format, addDays, startOfToday, getDay, isAfter, addHours } from 'date-fns';

export default function ApartmentViewing() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [inquiryId, setInquiryId] = useState(null);
  const [tenantData, setTenantData] = useState(null);

  // Get inquiry ID from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('inquiry_id');
    setInquiryId(id);
  }, []);

  // Fetch tenant inquiry details
  const { data: inquiry, isLoading: inquiryLoading } = useQuery({
    queryKey: ['inquiry', inquiryId],
    queryFn: () => inquiryId ? base44.entities.Inquiry.get(inquiryId) : null,
    enabled: !!inquiryId,
  });

  React.useEffect(() => {
    if (inquiry) {
      setTenantData({
        name: inquiry.tenant_name,
        email: inquiry.tenant_email,
        property_id: inquiry.property_id,
      });
    }
  }, [inquiry]);

  // Fetch booking rules for property
  const { data: bookingRules } = useQuery({
    queryKey: ['bookingRules', tenantData?.property_id],
    queryFn: () => tenantData?.property_id ? 
      base44.entities.BookingRules.filter({ property_id: tenantData.property_id }).then(r => r[0]) : null,
    enabled: !!tenantData?.property_id,
  });

  // Generate available dates based on booking rules
  const availableDates = useMemo(() => {
    const dates = [];
    const today = startOfToday();
    const windowDays = bookingRules?.booking_window_days || 30;
    const availableWeekdays = bookingRules?.available_weekdays || [1, 2, 3, 4, 5]; // Default Mon-Fri

    for (let i = 0; i < windowDays; i++) {
      const date = addDays(today, i);
      const dayOfWeek = getDay(date);
      if (availableWeekdays.includes(dayOfWeek)) {
        dates.push(date);
      }
    }
    return dates;
  }, [bookingRules]);

  const timeSlots = bookingRules?.available_time_slots || [];

  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !selectedTime || !tenantData) return;

      const bookingData = {
        inquiry_id: inquiryId,
        property_id: tenantData.property_id,
        tenant_name: tenantData.name,
        tenant_email: tenantData.email,
        viewing_date: format(selectedDate, 'yyyy-MM-dd'),
        viewing_time: selectedTime,
        status: 'pending',
      };

      const booking = await base44.entities.ViewingBooking.create(bookingData);

      // Send confirmation email via backend function
      await base44.functions.invoke('sendViewingConfirmation', {
        booking_id: booking.id,
        tenant_name: tenantData.name,
        tenant_email: tenantData.email,
        viewing_date: format(selectedDate, 'EEEE, MMMM d, yyyy'),
        viewing_time: selectedTime,
        property_id: tenantData.property_id,
      });

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewingBookings'] });
      setSelectedDate(null);
      setSelectedTime(null);
    },
  });

  if (inquiryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-center text-slate-600">Application not found. Please return to your qualification.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canBook = selectedDate && selectedTime && !bookingMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">Schedule Your Apartment Viewing</h1>
          <p className="text-slate-500">Select a convenient date and time to visit the property</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Select Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Available Dates</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableDates.map(date => (
                  <button
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg text-center text-sm font-medium transition-all ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-orange-100'
                    }`}
                  >
                    <div className="text-xs opacity-75">{format(date, 'EEE')}</div>
                    <div>{format(date, 'd MMM')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
             {selectedDate && timeSlots.length > 0 && (
               <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-3">Available Times</label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                   {timeSlots.map(time => (
                     <button
                       key={time}
                       onClick={() => setSelectedTime(time)}
                       className={`p-3 rounded-lg text-center text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                         selectedTime === time
                           ? 'bg-orange-500 text-white'
                           : 'bg-slate-100 text-slate-700 hover:bg-orange-100'
                       }`}
                     >
                       <Clock className="w-4 h-4" />
                       {time}
                     </button>
                   ))}
                 </div>
               </div>
             )}

             {selectedDate && timeSlots.length === 0 && (
               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                 <p className="text-sm text-yellow-800">No time slots available. Please contact the property owner.</p>
               </div>
             )}

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800">Viewing Scheduled</p>
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</strong> at <strong>{selectedTime}</strong>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">A confirmation email will be sent to <strong>{tenantData?.email}</strong></p>
                  </div>
                </div>
              </div>
            )}

            {/* Book Button */}
            <Button
              onClick={() => bookingMutation.mutate()}
              disabled={!canBook}
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center justify-center gap-2"
            >
              {bookingMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  Confirm Viewing
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {bookingMutation.isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="text-sm font-medium">Viewing confirmed! Check your email for details.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}