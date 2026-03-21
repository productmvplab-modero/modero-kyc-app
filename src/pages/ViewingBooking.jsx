import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from '@/components/modero/Header';
import { format, addDays, startOfToday, getDay } from 'date-fns';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
];

export default function ViewingBooking() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [inquiryId, setInquiryId] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [step, setStep] = useState('select'); // 'select', 'confirm', 'success'
  const queryClient = useQueryClient();

  const { data: inquiries } = useQuery({
    queryKey: ['inquiries'],
    queryFn: () => base44.entities.Inquiry.list(),
    initialData: [],
  });

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
    initialData: [],
  });

  const { data: bookings } = useQuery({
    queryKey: ['viewingBookings'],
    queryFn: () => base44.entities.ViewingBooking.list(),
    initialData: [],
  });

  const selectedInquiry = inquiries.find(i => i.id === inquiryId);
  const selectedProperty = properties.find(p => p.id === propertyId);

  const bookedDates = useMemo(() => {
    if (!propertyId) return [];
    return bookings
      .filter(b => b.property_id === propertyId && b.status !== 'cancelled')
      .map(b => b.viewing_date);
  }, [bookings, propertyId]);

  const bookedTimes = useMemo(() => {
    if (!selectedDate || !propertyId) return [];
    return bookings
      .filter(
        b =>
          b.property_id === propertyId &&
          b.viewing_date === selectedDate &&
          b.status !== 'cancelled'
      )
      .map(b => b.viewing_time);
  }, [bookings, propertyId, selectedDate]);

  const availableDates = useMemo(() => {
    const dates = [];
    const today = startOfToday();
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, i);
      const dayOfWeek = getDay(date);
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Monday-Friday
        dates.push(date);
      }
    }
    return dates;
  }, []);

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const booking = await base44.entities.ViewingBooking.create({
        inquiry_id: inquiryId,
        property_id: propertyId,
        tenant_name: selectedInquiry.tenant_name,
        tenant_email: selectedInquiry.tenant_email,
        viewing_date: format(selectedDate, 'yyyy-MM-dd'),
        viewing_time: selectedTime,
        status: 'confirmed',
      });

      // Send confirmation email
      await base44.functions.invoke('sendViewingConfirmation', {
        booking_id: booking.id,
        inquiry_id: inquiryId,
        property_id: propertyId,
        tenant_name: selectedInquiry.tenant_name,
        tenant_email: selectedInquiry.tenant_email,
        viewing_date: format(selectedDate, 'EEEE, MMMM d, yyyy'),
        viewing_time: selectedTime,
        property_address: selectedProperty.address,
        property_city: selectedProperty.city,
      });

      // Update inquiry with booking info
      await base44.entities.Inquiry.update(inquiryId, {
        viewing_booked: true,
        viewing_date: format(selectedDate, 'yyyy-MM-dd'),
        viewing_time: selectedTime,
      });

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewingBookings'] });
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      setStep('success');
    },
  });

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
        <Header />
        <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Book Your Apartment Viewing</h1>
            <p className="text-slate-600">Select an available date and time to tour the property</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Select Inquiry */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Application</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inquiries.filter(i => i.status === 'qualified').map(inquiry => (
                    <button
                      key={inquiry.id}
                      onClick={() => {
                        setInquiryId(inquiry.id);
                        setPropertyId(inquiry.property_id);
                        setSelectedDate(null);
                        setSelectedTime(null);
                      }}
                      className={`w-full p-3 rounded-lg text-left border-2 transition-all ${
                        inquiryId === inquiry.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200 hover:border-orange-200'
                      }`}
                    >
                      <div className="font-semibold text-sm">{inquiry.tenant_name}</div>
                      <div className="text-xs text-slate-500">{inquiry.tenant_email}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Select Date */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableDates.map(date => {
                    const isBooked = bookedDates.includes(format(date, 'yyyy-MM-dd'));
                    const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                    return (
                      <button
                        key={format(date, 'yyyy-MM-dd')}
                        onClick={() => !isBooked && setSelectedDate(date)}
                        disabled={isBooked || !inquiryId}
                        className={`w-full p-2 rounded-lg text-sm border-2 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : isBooked
                            ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                            : 'border-slate-200 hover:border-orange-200'
                        }`}
                      >
                        <div className="font-semibold">{format(date, 'd MMM')}</div>
                        <div className="text-xs text-slate-500">{format(date, 'EEEE')}</div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Select Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {TIME_SLOTS.map(time => {
                    const isBooked = bookedTimes.includes(time);
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => !isBooked && setSelectedTime(time)}
                        disabled={isBooked || !selectedDate}
                        className={`w-full p-2 rounded-lg text-sm border-2 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : isBooked
                            ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                            : 'border-slate-200 hover:border-orange-200'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedDate && selectedTime && (
            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => setStep('confirm')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Continue to Confirmation
              </Button>
            </div>
          )}
        </div>
      </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
        <Header />
        <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Confirm Your Viewing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-700 mb-1">Applicant</h3>
                  <p className="text-slate-900">{selectedInquiry.tenant_name}</p>
                  <p className="text-sm text-slate-500">{selectedInquiry.tenant_email}</p>
                </div>
                <div>
                   <h3 className="font-semibold text-slate-700 mb-1">Property</h3>
                   <p className="text-slate-900">{selectedProperty?.address || '-'}</p>
                   <p className="text-sm text-slate-500">{selectedProperty?.city || '-'}</p>
                 </div>
                <div>
                  <h3 className="font-semibold text-slate-700 mb-1">Date</h3>
                  <p className="text-slate-900">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700 mb-1">Time</h3>
                  <p className="text-slate-900">{selectedTime}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  A confirmation email will be sent to <strong>{selectedInquiry.tenant_email}</strong> with the viewing details and property address.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                  disabled={createBookingMutation.isPending}
                >
                  Back
                </Button>
                <Button
                  onClick={() => createBookingMutation.mutate()}
                  disabled={createBookingMutation.isPending}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex-1"
                >
                  {createBookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <Header />
      <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Viewing Confirmed!</h2>
            <p className="text-slate-600 mb-6">
              Confirmation email sent to <strong>{selectedInquiry.tenant_email}</strong>
            </p>
            <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
              <p className="text-sm font-semibold text-slate-600 mb-4">Appointment Details:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Applicant:</span>
                  <span className="font-semibold">{selectedInquiry.tenant_name}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-600">Property:</span>
                   <span className="font-semibold">{selectedProperty?.address || '-'}</span>
                 </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date & Time:</span>
                  <span className="font-semibold">{format(selectedDate, 'd MMM yyyy')} at {selectedTime}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setStep('select');
                setInquiryId(null);
                setPropertyId(null);
                setSelectedDate(null);
                setSelectedTime(null);
              }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Book Another Viewing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}