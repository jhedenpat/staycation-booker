import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Booking } from '@/types/booking';
import { supabase } from '@/integrations/supabase/client';

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<string | false>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  isDateRangeAvailable: (propertyId: string, checkIn: string, checkOut: string) => boolean;
  getBookingsForProperty: (propertyId: string) => Booking[];
}

const BookingContext = createContext<BookingContextType | null>(null);

type BookingRow = {
  booking_code: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  guests_count: number;
  status: Booking['status'];
  created_at: string;
  total_price: number;
  properties: { property_code: string | null } | null;
};

function mapBookingRow(row: BookingRow): Booking {
  return {
    id: row.booking_code,
    propertyId: row.properties?.property_code ?? '',
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone ?? '',
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests_count,
    status: row.status,
    paymentStatus: 'pending',
    createdAt: row.created_at,
    totalPrice: Number(row.total_price),
  };
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const refreshBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('booking_code, guest_name, guest_email, guest_phone, check_in, check_out, guests_count, status, created_at, total_price, properties(property_code)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch bookings from Supabase:', error.message);
      return;
    }

    const mapped = (data ?? [])
      .map((row) => mapBookingRow(row as unknown as BookingRow))
      .filter((b) => !!b.propertyId);
    setBookings(mapped);
  }, []);

  useEffect(() => {
    void refreshBookings();
  }, [refreshBookings]);

  const isDateRangeAvailable = useCallback((propertyId: string, checkIn: string, checkOut: string) => {
    return !bookings.some(b =>
      b.propertyId === propertyId &&
      b.status !== 'cancelled' &&
      new Date(b.checkIn) < new Date(checkOut) &&
      new Date(b.checkOut) > new Date(checkIn)
    );
  }, [bookings]);

  const addBooking = useCallback(async (booking: Omit<Booking, 'id' | 'createdAt'>): Promise<string | false> => {
    if (!isDateRangeAvailable(booking.propertyId, booking.checkIn, booking.checkOut)) {
      return false;
    }

    const { data: propertyRow, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('property_code', booking.propertyId)
      .maybeSingle();

    if (propertyError || !propertyRow?.id) {
      console.error('Property mapping failed for booking:', propertyError?.message ?? 'Property not found');
      return false;
    }

    const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}`;
    const { error: insertError } = await supabase.from('bookings').insert({
      booking_code: bookingCode,
      property_id: propertyRow.id,
      guest_name: booking.guestName,
      guest_email: booking.guestEmail,
      guest_phone: booking.guestPhone,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      guests_count: booking.guests,
      status: booking.status,
      total_price: booking.totalPrice,
    });

    if (insertError) {
      console.error('Failed to insert booking into Supabase:', insertError.message);
      return false;
    }

    await refreshBookings();
    return bookingCode;
  }, [isDateRangeAvailable, refreshBookings]);

  const updateBookingStatus = useCallback(async (id: string, status: Booking['status']) => {
    const patch: Record<string, string | null> = { status };
    if (status === 'confirmed') patch.confirmed_at = new Date().toISOString();
    if (status === 'cancelled') patch.cancelled_at = new Date().toISOString();

    const { error } = await supabase
      .from('bookings')
      .update(patch)
      .eq('booking_code', id);

    if (error) {
      console.error('Failed to update booking status in Supabase:', error.message);
      return;
    }

    await refreshBookings();
  }, [refreshBookings]);

  const getBookingsForProperty = useCallback((propertyId: string) => {
    return bookings.filter(b => b.propertyId === propertyId && b.status !== 'cancelled');
  }, [bookings]);

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBookingStatus, isDateRangeAvailable, getBookingsForProperty }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used within BookingProvider');
  return ctx;
}
