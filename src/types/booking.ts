export interface Property {
  id: string;
  name: string;
  floor: string;
  description: string;
  amenities: string[];
  maxGuests: number;
  pricePerNight: number;
  imageIndex: number;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  totalPrice: number;
}
