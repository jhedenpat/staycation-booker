import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Booking } from '@/types/booking';

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => boolean;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  isDateRangeAvailable: (propertyId: string, checkIn: string, checkOut: string) => boolean;
  getBookingsForProperty: (propertyId: string) => Booking[];
}

const BookingContext = createContext<BookingContextType | null>(null);

const STORAGE_KEY = 'aha_bookings';

function loadBookings(): Booking[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(loadBookings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const isDateRangeAvailable = useCallback((propertyId: string, checkIn: string, checkOut: string) => {
    return !bookings.some(b =>
      b.propertyId === propertyId &&
      b.status !== 'cancelled' &&
      new Date(b.checkIn) < new Date(checkOut) &&
      new Date(b.checkOut) > new Date(checkIn)
    );
  }, [bookings]);

  const addBooking = useCallback((booking: Omit<Booking, 'id' | 'createdAt'>): boolean => {
    if (!isDateRangeAvailable(booking.propertyId, booking.checkIn, booking.checkOut)) {
      return false;
    }
    const newBooking: Booking = {
      ...booking,
      id: `BK-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    setBookings(prev => [...prev, newBooking]);
    return true;
  }, [isDateRangeAvailable]);

  const updateBookingStatus = useCallback((id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }, []);

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
