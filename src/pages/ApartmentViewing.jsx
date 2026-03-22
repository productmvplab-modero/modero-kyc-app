import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { format, addDays, startOfToday, getDay, isAfter, addHours } from 'date-fns';
import Header from '@/components/modero/Header';
import ViewingCalendar from '@/components/apartment/ViewingCalendar';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export default function ApartmentViewing() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [inquiryId, setInquiryId] = useState(null);
  const [tenantData, setTenantData] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [adminInquiryId, setAdminInquiryId] = useState(null);
  const [adminPropertyId, setAdminPropertyId] = useState(null);
  const [adminSelectedDate, setAdminSelectedDate] = useState(null);
  const [adminSelectedTime, setAdminSelectedTime] = useState(null);
  const [step, setStep] = useState('select'); // 'select', 'confirm', 'success'
  const [calendarMonth, setCalendarMonth] = useState(new Date());

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

  // Fetch all inquiries for admin mode
  const { data: adminInquiries = [] } = useQuery({
    queryKey: ['adminInquiries'],
    queryFn: () => base44.entities.Inquiry.list(),
    enabled: adminMode,
  });

  // Fetch selected inquiry details in admin mode
  const { data: adminInquiryData = {} } = useQuery({
    queryKey: ['adminInquiryData', adminInquiryId],
    queryFn: () => adminInquiryId ? base44.entities.Inquiry.get(adminInquiryId) : null,
    enabled: !!adminInquiryId,
  });

  // Fetch selected property details in admin mode
  const { data: adminPropertyData = {} } = useQuery({
    queryKey: ['adminPropertyData', adminPropertyId],
    queryFn: () => adminPropertyId ? base44.entities.Property.get(adminPropertyId) : null,
    enabled: !!adminPropertyId,
  });

  // Get booking rules for admin property
  const { data: adminBookingRules } = useQuery({
    queryKey: ['adminBookingRules', adminPropertyId],
    queryFn: () => adminPropertyId ? 
      base44.entities.BookingRules.filter({ property_id: adminPropertyId }).then(r => r[0]) : null,
    enabled: !!adminPropertyId,
  });

  // Generate available dates for admin
  const adminAvailableDates = useMemo(() => {
    const dates = [];
    const today = startOfToday();
    const windowDays = adminBookingRules?.booking_window_days || 30;
    const availableWeekdays = adminBookingRules?.available_weekdays || [1, 2, 3, 4, 5];

    for (let i = 0; i < windowDays; i++) {
      const date = addDays(today, i);
      const dayOfWeek = getDay(date);
      if (availableWeekdays.includes(dayOfWeek)) {
        dates.push(date);
      }
    }
    return dates;
  }, [adminBookingRules]);

  // Fetch existing bookings for admin to show booked slots
  const { data: adminBookings = [] } = useQuery({
    queryKey: ['adminBookings', adminPropertyId],
    queryFn: () => adminPropertyId ? 
      base44.entities.ViewingBooking.filter({ property_id: adminPropertyId }) : [],
    enabled: !!adminPropertyId,
  });

  // Fetch all bookings for the property calendar in tenant mode
  const { data: propertyBookings = [] } = useQuery({
    queryKey: ['propertyBookings', tenantData?.property_id],
    queryFn: () => tenantData?.property_id ? 
      base44.entities.ViewingBooking.filter({ property_id: tenantData.property_id }) : [],
    enabled: !!tenantData?.property_id,
  });

  const adminBookedDates = adminBookings.map(b => b.viewing_date);
  const adminBookedTimes = adminBookings
    .filter(b => adminSelectedDate && b.viewing_date === format(adminSelectedDate, 'yyyy-MM-dd'))
    .map(b => b.viewing_time);

  // Create booking mutation (tenant mode)
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

  // Create booking mutation (admin mode)
  const adminBookingMutation = useMutation({
    mutationFn: async () => {
      const booking = await base44.entities.ViewingBooking.create({
        inquiry_id: adminInquiryId,
        property_id: adminPropertyId,
        tenant_name: adminInquiryData.tenant_name,
        tenant_email: adminInquiryData.tenant_email,
        viewing_date: format(adminSelectedDate, 'yyyy-MM-dd'),
        viewing_time: adminSelectedTime,
        status: 'confirmed',
      });

      await base44.functions.invoke('sendViewingConfirmation', {
        booking_id: booking.id,
        inquiry_id: adminInquiryId,
        property_id: adminPropertyId,
        tenant_name: adminInquiryData.tenant_name,
        tenant_email: adminInquiryData.tenant_email,
        viewing_date: format(adminSelectedDate, 'EEEE, MMMM d, yyyy'),
        viewing_time: adminSelectedTime,
        property_address: adminPropertyData.address,
        property_city: adminPropertyData.city,
      });

      await base44.entities.Inquiry.update(adminInquiryId, {
        viewing_booked: true,
        viewing_date: format(adminSelectedDate, 'yyyy-MM-dd'),
        viewing_time: adminSelectedTime,
      });

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings', 'adminInquiries'] });
      setStep('success');
    },
  });

  if (!adminMode && inquiryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!adminMode && !inquiry) {
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

  // Admin mode view
  if (adminMode) {
    if (step === 'select') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
          <Header />
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">Book Apartment Viewing</h1>
                  <p className="text-slate-600">Admin: Select an inquiry and available date/time</p>
                </div>
                <Button variant="outline" onClick={() => setAdminMode(false)}>Tenant Mode</Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Select Application</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {adminInquiries.filter(i => i.status === 'qualified').map(inquiry => (
                        <button
                          key={inquiry.id}
                          onClick={() => {
                            setAdminInquiryId(inquiry.id);
                            setAdminPropertyId(inquiry.property_id);
                            setAdminSelectedDate(null);
                            setAdminSelectedTime(null);
                          }}
                          className={`w-full p-3 rounded-lg text-left border-2 transition-all ${
                            adminInquiryId === inquiry.id
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

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {adminAvailableDates.map(date => {
                        const isBooked = adminBookedDates.includes(format(date, 'yyyy-MM-dd'));
                        const isSelected = adminSelectedDate && format(adminSelectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                        return (
                          <button
                            key={format(date, 'yyyy-MM-dd')}
                            onClick={() => !isBooked && setAdminSelectedDate(date)}
                            disabled={isBooked || !adminInquiryId}
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
                        const isBooked = adminBookedTimes.includes(time);
                        const isSelected = adminSelectedTime === time;
                        return (
                          <button
                            key={time}
                            onClick={() => !isBooked && setAdminSelectedTime(time)}
                            disabled={isBooked || !adminSelectedDate}
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

              {adminSelectedDate && adminSelectedTime && (
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
                      <p className="text-slate-900">{adminInquiryData.tenant_name}</p>
                      <p className="text-sm text-slate-500">{adminInquiryData.tenant_email}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-1">Property</h3>
                      <p className="text-slate-900">{adminPropertyData.address}</p>
                      <p className="text-sm text-slate-500">{adminPropertyData.city}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-1">Date</h3>
                      <p className="text-slate-900">{format(adminSelectedDate, 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-1">Time</h3>
                      <p className="text-slate-900">{adminSelectedTime}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      A confirmation email will be sent to <strong>{adminInquiryData.tenant_email}</strong> with the viewing details.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('select')}
                      disabled={adminBookingMutation.isPending}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => adminBookingMutation.mutate()}
                      disabled={adminBookingMutation.isPending}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex-1"
                    >
                      {adminBookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
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
                  Confirmation email sent to <strong>{adminInquiryData.tenant_email}</strong>
                </p>
                <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
                  <p className="text-sm font-semibold text-slate-600 mb-4">Appointment Details:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Applicant:</span>
                      <span className="font-semibold">{adminInquiryData.tenant_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Property:</span>
                      <span className="font-semibold">{adminPropertyData.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Date & Time:</span>
                      <span className="font-semibold">{format(adminSelectedDate, 'd MMM yyyy')} at {adminSelectedTime}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setStep('select');
                    setAdminInquiryId(null);
                    setAdminPropertyId(null);
                    setAdminSelectedDate(null);
                    setAdminSelectedTime(null);
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
              </div>
              );
              }

  // Tenant mode view
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <Header />
      <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
        <div className="flex items-center justify-between mb-8 lg:col-span-3">
          <div>
            <h1 className="text-3xl font-bold text-orange-600 mb-2">Schedule Your Apartment Viewing</h1>
            <p className="text-slate-500">Select a convenient date and time to visit the property</p>
          </div>
          <Button variant="outline" onClick={() => setAdminMode(true)}>Admin Mode</Button>
        </div>

        {/* Calendar - Left sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <ViewingCalendar 
            bookings={propertyBookings} 
            currentDate={calendarMonth}
            onDateChange={setCalendarMonth}
          />
        </div>

        {/* Booking Form - Right content */}
        <Card className="lg:col-span-2 order-1 lg:order-2">
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
            </div>
            );
            }