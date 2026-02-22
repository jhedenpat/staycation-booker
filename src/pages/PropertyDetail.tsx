import { useParams, useNavigate } from 'react-router-dom';
import { properties } from '@/data/properties';
import { useBookings } from '@/context/BookingContext';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { format, differenceInDays, addDays, isBefore, isSameDay } from 'date-fns';
import { ArrowLeft, Users, Bed, Wifi, ChefHat, Waves, Eye } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import heroImg from '@/assets/hero-staycation.jpg';
import unitImg from '@/assets/unit-preview.jpg';
import { cn } from '@/lib/utils';

const amenityIcons: Record<string, React.ReactNode> = {
  'King Bed': <Bed className="h-4 w-4" />,
  'WiFi': <Wifi className="h-4 w-4" />,
  'Kitchen': <ChefHat className="h-4 w-4" />,
  'Pool Access': <Waves className="h-4 w-4" />,
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = properties.find(p => p.id === id);
  const { addBooking, getBookingsForProperty } = useBookings();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guests, setGuests] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const bookedDates = useMemo(() => {
    if (!property) return [];
    const bookings = getBookingsForProperty(property.id);
    const dates: Date[] = [];
    bookings.forEach(b => {
      let current = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      while (isBefore(current, end) || isSameDay(current, end)) {
        dates.push(new Date(current));
        current = addDays(current, 1);
      }
    });
    return dates;
  }, [property, getBookingsForProperty]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Property not found.</p>
      </div>
    );
  }

  const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0;
  const total = nights * property.pricePerNight;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (nights < 1) {
      toast.error('Minimum 1 night stay required');
      return;
    }

    setSubmitting(true);
    const success = addBooking({
      propertyId: property.id,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: dateRange.from.toISOString(),
      checkOut: dateRange.to.toISOString(),
      guests,
      status: 'confirmed',
      totalPrice: total,
    });

    if (success) {
      toast.success('Booking confirmed!', { description: `${property.name} · ${nights} night${nights > 1 ? 's' : ''}` });
      navigate('/');
    } else {
      toast.error('These dates are no longer available. Please choose different dates.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      {/* Image header */}
      <div className="relative h-[40vh] min-h-[280px]">
        <img src={property.imageIndex % 2 === 0 ? heroImg : unitImg} alt={property.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-card/80 backdrop-blur p-2 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Details */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <h1 className="font-display text-3xl font-bold mb-1">{property.name}</h1>
              <p className="text-muted-foreground mb-4">MOA Complex · {property.floor}</p>
              <p className="text-foreground/80 mb-6">{property.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {property.amenities.map(a => (
                  <Badge key={a} variant="outline" className="gap-1.5 py-1.5">
                    {amenityIcons[a] || <Eye className="h-4 w-4" />}
                    {a}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Max {property.maxGuests} guests</span>
                <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> 1 King + Sofa Bed</span>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <h2 className="font-display text-xl font-semibold mb-4">Select Dates</h2>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
                disabled={[{ before: new Date() }, ...bookedDates.map(d => d)]}
                className={cn("p-3 pointer-events-auto w-full")}
              />
              {bookedDates.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">Grayed out dates are already booked.</p>
              )}
            </div>
          </div>

          {/* Booking form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl p-6 border shadow-sm sticky top-20">
              <p className="text-2xl font-bold mb-1">
                ₱{property.pricePerNight.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ night</span>
              </p>

              {nights > 0 && (
                <div className="bg-muted rounded-lg p-3 my-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{format(dateRange!.from!, 'MMM d')} → {format(dateRange!.to!, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>₱{property.pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span className="font-semibold">₱{total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Juan Dela Cruz" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="juan@email.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" />
                </div>
                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input id="guests" type="number" min={1} max={property.maxGuests} value={guests} onChange={e => setGuests(Number(e.target.value))} />
                </div>

                <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" size="lg" disabled={submitting || nights < 1}>
                  {nights < 1 ? 'Select Dates to Book' : `Confirm Booking · ₱${total.toLocaleString()}`}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
