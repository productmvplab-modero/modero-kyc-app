import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, AlertCircle, Plus, CheckCheck, XCircle } from 'lucide-react';
import Header from '@/components/modero/Header';
import { format, addDays, startOfToday, getDay } from 'date-fns';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function ViewingBooking() {
  const [activeTab, setActiveTab] = useState('manage');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [inquiryId, setInquiryId] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [step, setStep] = useState('select');
  const [filterStatus, setFilterStatus] = useState('all');
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
      .filter(b =>
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
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(date);
      }
    }
    return dates;
  }, []);

  const filteredBookings = useMemo(() => {
    if (filterStatus === 'all') return bookings;
    return bookings.filter(b => b.status === filterStatus);
  }, [bookings, filterStatus]);

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ViewingBooking.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['viewingBookings'] }),
  });

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

  // ── MANAGE TAB ──────────────────────────────────────────────────────────────
  if (activeTab === 'manage') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Viewing Bookings</h1>
              <p className="text-slate-500 text-sm mt-1">Manage all apartment viewing appointments</p>
            </div>
            <Button
              onClick={() => { setActiveTab('book'); setStep('select'); }}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Booking
            </Button>
          </div>

          {/* Status filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  filterStatus === s
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
                }`}
              >
                {s === 'all' ? `All (${bookings.length})` : `${s} (${bookings.filter(b => b.status === s).length})`}
              </button>
            ))}
          </div>

          {/* Bookings list */}
          <div className="space-y-3">
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No bookings found</p>
                <Button
                  onClick={() => { setActiveTab('book'); setStep('select'); }}
                  className="mt-4 bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create First Booking
                </Button>
              </div>
            ) : [...filteredBookings].sort((a, b) => new Date(b.viewing_date) - new Date(a.viewing_date)).map(booking => {
              const prop = properties.find(p => p.id === booking.property_id);
              return (
                <div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800">{booking.tenant_name || '—'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-600'}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{booking.tenant_email}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-orange-400" />{booking.viewing_date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange-400" />{booking.viewing_time}</span>
                      {prop && <span className="text-slate-400 text-xs">📍 {prop.address}, {prop.city}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {booking.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'confirmed' })}
                        className="bg-green-600 hover:bg-green-700 text-xs h-8"
                      >
                        <CheckCheck className="w-3.5 h-3.5 mr-1" /> Confirm
                      </Button>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'completed' })}
                        className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                      </Button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'cancelled' })}
                        className="text-red-500 border-red-200 hover:bg-red-50 text-xs h-8"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── BOOK: SELECT STEP ──────────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
        <Header />
        <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setActiveTab('manage')} className="text-slate-500 hover:text-orange-600 text-sm flex items-center gap-1 mb-6">
            ← Back to Bookings
          </button>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Book Apartment Viewing</h1>
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

  // ── BOOK: CONFIRM STEP ────────────────────────────────────────────────────
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
                  A confirmation email will be sent to <strong>{selectedInquiry.tenant_email}</strong> with the viewing details.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('select')} disabled={createBookingMutation.isPending}>
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

  // ── SUCCESS ───────────────────────────────────────────────────────────────
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
              Confirmation email sent to <strong>{selectedInquiry?.tenant_email}</strong>
            </p>
            <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
              <p className="text-sm font-semibold text-slate-600 mb-4">Appointment Details:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Applicant:</span>
                  <span className="font-semibold">{selectedInquiry?.tenant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Property:</span>
                  <span className="font-semibold">{selectedProperty?.address || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date & Time:</span>
                  <span className="font-semibold">{selectedDate && format(selectedDate, 'd MMM yyyy')} at {selectedTime}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setActiveTab('manage')}
              >
                View All Bookings
              </Button>
              <Button
                onClick={() => {
                  setStep('select');
                  setActiveTab('book');
                  setInquiryId(null);
                  setPropertyId(null);
                  setSelectedDate(null);
                  setSelectedTime(null);
                }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Book Another Viewing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}