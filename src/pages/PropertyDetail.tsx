import { useParams, useNavigate } from 'react-router-dom';
import { properties } from '@/data/properties';
import { useBookings } from '@/context/BookingContext';
import { useWaitlist } from '@/context/WaitlistContext';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState, useMemo, useEffect, useRef } from 'react';
import { format, differenceInDays, addDays, isBefore, isSameDay } from 'date-fns';
import { ArrowLeft, Users, Bed, Wifi, ChefHat, Waves, Eye, Clock, Zap, Bell, CheckCircle2, Star, Award, ChevronDown, CalendarIcon, View, Maximize, X, ChevronLeft, ChevronRight, PlayCircle, ShieldCheck, CigaretteOff, VolumeX, AlertCircle } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import heroImg from '@/assets/hero-staycation.jpg';
import unitImg from '@/assets/unit-preview.jpg';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getPhTime } from '@/lib/utils';
import { getDynamicPrice, isGapFillerDate } from '@/lib/pricing';
import LocationNeighborhood from '@/components/LocationNeighborhood';
import MobileStickyBar from '@/components/MobileStickyBar';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal';
import houseRulesPoster from '@/assets/house_rules_poster.png';
import { ScrollArea } from '@/components/ui/scroll-area';
import HouseRulesUI from '@/components/HouseRulesUI';

const amenityIcons: Record<string, React.ReactNode> = {
  'King Bed': <Bed className="h-4 w-4" />,
  'WiFi': <Wifi className="h-4 w-4" />,
  'Kitchen': <ChefHat className="h-4 w-4" />,
  'Pool Access': <Waves className="h-4 w-4" />,
};

const MOCK_GALLERY = [
  heroImg,
  unitImg,
  "https://images.unsplash.com/photo-15df1f19d2681-337d11ceecce?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=2070&auto=format&fit=crop"
];

const GalleryLightbox = ({ 
  images, 
  isOpen, 
  onClose, 
  currentIndex, 
  setCurrentIndex 
}: { 
  images: string[], isOpen: boolean, onClose: () => void, currentIndex: number, setCurrentIndex: (idx: number) => void 
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentIndex, images.length, onClose, setCurrentIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-sm flex flex-col cursor-pointer"
        onClick={onClose}
      >
        <div className="flex items-center justify-between p-4 md:p-6 absolute top-0 w-full z-10">
          <span className="text-white/60 font-medium tracking-widest text-sm uppercase">
            {currentIndex + 1} / {images.length}
          </span>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/25 rounded-full backdrop-blur-md transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 relative flex items-center justify-center overflow-hidden h-full">
          <button 
            className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full z-10 backdrop-blur transition-all hidden sm:block"
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(Math.max(0, currentIndex - 1)); }}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            className="w-full h-full object-contain max-h-screen px-0 sm:px-24"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -10000 && currentIndex < images.length - 1) {
                setCurrentIndex(currentIndex + 1);
              } else if (swipe > 10000 && currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
              }
            }}
          />

          <button 
            className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full z-10 backdrop-blur transition-all hidden sm:block"
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(Math.min(images.length - 1, currentIndex + 1)); }}
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addBooking, getBookingsForProperty, bookings } = useBookings();
  const { addToWaitlist } = useWaitlist();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guests, setGuests] = useState(1);
  const [step, setStep] = useState(1);
  const [showTerms, setShowTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  
  // Gallery State
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Mobile sticky bar: detect when booking widget is on-screen
  const bookingWidgetRef = useRef<HTMLDivElement>(null);
  const [widgetVisible, setWidgetVisible] = useState(false);
  useEffect(() => {
    const el = bookingWidgetRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setWidgetVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const property = properties.find(p => p.id === id);

  const bookedDates = useMemo(() => {
    if (!property) return [];
    const propertyBookings = getBookingsForProperty(property.id);
    const dates: Date[] = [];
    propertyBookings.forEach(b => {
      let current = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      while (isBefore(current, end) || isSameDay(current, end)) {
        dates.push(new Date(current));
        current = addDays(current, 1);
      }
    });
    return dates;
  }, [property, getBookingsForProperty]);

  const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0;

  const pricing = useMemo(() => {
    if (!dateRange?.from || !property) return null;
    const isGap = isGapFillerDate(dateRange.from, bookings, property.id);
    return getDynamicPrice(property.pricePerNight, dateRange.from, isGap);
  }, [dateRange?.from, property, bookings]);

  const effectivePrice = pricing?.price ?? (property?.pricePerNight ?? 0);
  const total = nights * effectivePrice;

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Property not found.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
    const result = await addBooking({
      propertyId: property.id,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: dateRange.from.toISOString(),
      checkOut: dateRange.to.toISOString(),
      guests,
      status: 'pending',
      totalPrice: total,
    });

    if (result) {
      setConfirmedBookingId(result);
      setStep(4);
      toast.success('Booking confirmed!', { description: `${property.name} · ${nights} night${nights > 1 ? 's' : ''}` });
    } else {
      toast.error('These dates are no longer available.');
      setShowWaitlist(true);
    }
    setSubmitting(false);
  };

  const handleJoinWaitlist = () => {
    if (!dateRange?.from || !dateRange?.to || !guestName || !guestEmail) {
      toast.error('Please fill in your details and select dates');
      return;
    }
    addToWaitlist({
      propertyId: property.id,
      guestName,
      guestEmail,
      guestPhone,
      desiredCheckIn: dateRange.from.toISOString(),
      desiredCheckOut: dateRange.to.toISOString(),
    });
    toast.success('Added to waitlist!', { description: "We'll notify you if these dates open up." });
    setShowWaitlist(false);
  };

  const galleryImages = property.gallery || MOCK_GALLERY;

  return (
    <div className="min-h-screen bg-background relative">
      <GalleryLightbox 
        images={galleryImages} 
        isOpen={galleryOpen} 
        onClose={() => setGalleryOpen(false)} 
        currentIndex={photoIndex} 
        setCurrentIndex={setPhotoIndex} 
      />

      {/* High-Performance Unit Gallery */}
      <div className="max-w-[1400px] mx-auto pt-0 sm:pt-4 px-0 sm:px-6 relative group mb-8">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-4 sm:top-8 sm:left-10 bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-md border border-white/20 text-white p-2.5 rounded-full z-20 transition-all duration-200">
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Floating Action Buttons */}
        <div className="absolute bottom-6 right-4 sm:right-10 z-20 flex gap-3">
          <Button 
            variant="secondary" 
            className="bg-slate-950/60 hover:bg-slate-950/80 text-white border-white/20 backdrop-blur-md font-semibold font-sans rounded-xl overflow-hidden group shadow-2xl transition-all h-11 px-5"
            onClick={() => setGalleryOpen(true)}
          >
            <Maximize className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            View all {galleryImages.length} photos
          </Button>
        </div>

        {/* Mobile Full-Bleed Layout */}
        <div className="block sm:hidden relative w-full h-[60vh] min-h-[400px]">
          <img src={galleryImages[0]} alt={property.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90 pointer-events-none" />
          <div className="absolute bottom-24 left-4 z-10 flex gap-3 flex-col items-start text-white">
            <Badge className="bg-emerald-500/20 text-emerald-100 dark:text-emerald-300 border-emerald-500/30 backdrop-blur-md flex gap-1.5 items-center px-2.5 py-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Property
            </Badge>
            <span className="font-semibold tracking-wide drop-shadow-md">650 sq ft</span>
          </div>
        </div>

        {/* Desktop 3-Col Asymmetrical Grid */}
        <div className="hidden sm:grid grid-cols-3 gap-2 h-[65vh] min-h-[500px] max-h-[700px] rounded-2xl overflow-hidden bg-slate-100 border">
          {/* Main Hero Photo */}
          <div className="col-span-2 relative group-hover:brightness-95 hover:!brightness-110 transition-all duration-300 cursor-pointer overflow-hidden" onClick={() => { setPhotoIndex(0); setGalleryOpen(true); }}>
            <img loading="lazy" src={galleryImages[0]} alt={property.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent opacity-80 pointer-events-none" />
            <div className="absolute bottom-6 left-6 z-10 flex items-center gap-4 text-white">
              <Badge className="bg-emerald-500/20 text-emerald-100 dark:text-emerald-300 border-emerald-500/30 backdrop-blur-md flex gap-1.5 items-center px-3 py-1.5 shadow-lg">
                <ShieldCheck className="w-4 h-4" /> Verified Property
              </Badge>
              <span className="font-semibold tracking-widest text-sm text-white/90 uppercase drop-shadow-md">650 sq ft</span>
            </div>
            
            <Button variant="outline" className="hidden lg:flex absolute top-6 right-6 bg-slate-950/40 hover:bg-slate-950/80 border-white/20 text-white backdrop-blur-md shadow-2xl z-10">
              <PlayCircle className="w-4 h-4 mr-2" /> Virtual Tour
            </Button>
          </div>
          
          {/* Right Detail Stack */}
          <div className="col-span-1 flex flex-col gap-2">
            <div className="h-1/2 relative group-hover:brightness-95 hover:!brightness-110 transition-all duration-300 cursor-pointer overflow-hidden" onClick={() => { setPhotoIndex(1); setGalleryOpen(true); }}>
              <img loading="lazy" src={galleryImages[1]} alt="Bedroom Unit" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-50 pointer-events-none" />
            </div>
            <div className="h-1/2 relative group-hover:brightness-95 hover:!brightness-110 transition-all duration-300 cursor-pointer overflow-hidden" onClick={() => { setPhotoIndex(2); setGalleryOpen(true); }}>
              <img loading="lazy" src={galleryImages[2]} alt="Living Area" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content (70%) */}
          <div className="w-full lg:w-[65%] xl:w-[70%] space-y-8">
            <div className="border-b pb-8">
              <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">{property.name}</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-6 font-medium">MOA Complex · {property.floor}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                <span className="flex items-center gap-1.5 text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                  <Star className="h-4 w-4 fill-slate-900" /> 4.96
                </span>
                <span className="text-slate-500 dark:text-slate-400 underline decoration-slate-300 underline-offset-4 hover:text-slate-900 dark:hover:text-slate-50 transition-colors duration-200 cursor-pointer">128 reviews</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5 text-slate-900">
                  <Award className="h-4 w-4 text-primary" /> Guest Favorite
                </span>
              </div>
            </div>

            <div className="flex gap-6 border-b pb-8 text-slate-900">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-slate-400" />
                <div><span className="block font-semibold">Max guests</span><span className="text-slate-500 dark:text-slate-400 text-sm">{property.maxGuests} guests allowed</span></div>
              </div>
              <div className="flex items-center gap-3">
                <Bed className="h-6 w-6 text-slate-400" />
                <div><span className="block font-semibold">Bedding</span><span className="text-slate-500 dark:text-slate-400 text-sm">1 King + Sofa Bed</span></div>
              </div>
            </div>

            <div className="border-b pb-8">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">About this space</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{property.description}</p>
            </div>

            <LocationNeighborhood propertyName={property.name} rating={property.rating} />

            <div className="border-b pb-8">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">What this place offers</h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                {property.amenities.map(a => (
                  <div key={a} className="flex items-center gap-4 text-slate-700">
                    <span className="text-slate-400">{amenityIcons[a] || <Eye className="h-6 w-6" />}</span>
                    <span className="text-base">{a}</span>
                  </div>
                ))}
              </div>
            </div>            {/* ── House Rules Section ── */}
            <div className="border-b pb-12">
              <h2 className="text-2xl font-black font-display tracking-tight text-foreground mb-8">House Rules & Policies</h2>
              <div className="rounded-3xl overflow-hidden border border-border shadow-sm bg-card transition-all duration-500">
                <HouseRulesUI isInline={true} onAccept={() => {}} />
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Philippine LGU Compliant
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <Clock className="h-3.5 w-3.5" />
                  Contactless Key Handover
                </div>
              </div>
            </div>

            <div className="pb-8 hidden xl:block">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Ratings & Reviews</h2>
              <div className="flex gap-16 mb-8">
                <div>
                  <div className="text-slate-500 mb-1">Cleanliness</div>
                  <div className="flex items-center gap-2"><div className="w-32 h-1 bg-slate-200 rounded-full"><div className="w-[98%] h-full bg-slate-900 rounded-full"></div></div><span className="text-sm font-medium text-slate-900">4.9</span></div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Communication</div>
                  <div className="flex items-center gap-2"><div className="w-32 h-1 bg-slate-200 rounded-full"><div className="w-[100%] h-full bg-slate-900 rounded-full"></div></div><span className="text-sm font-medium text-slate-900">5.0</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Booking Widget (30%) */}
          <div className="w-full lg:w-[35%] xl:w-[30%]">
            <div ref={bookingWidgetRef} className="bg-background rounded-2xl p-6 border shadow-sm sticky top-28 bottom-0 lg:bottom-auto z-50 lg:z-auto">
              
              {/* Progress Indicator */}
              {step < 4 && (
                <div className="flex items-center justify-between mb-8 relative px-2">
                  <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
                  <div className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500 ease-in-out" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
                  
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-500 bg-background border-2", step >= s ? "border-primary text-primary" : "border-slate-200 text-slate-400", step === s && "bg-primary text-primary-foreground")}>
                      {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                    </div>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="mb-6">
                    <p className="text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                      ₱{property.pricePerNight.toLocaleString()} <span className="text-sm font-normal text-slate-500 dark:text-slate-400 font-sans">night</span>
                    </p>
                    {pricing && pricing.discount > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-destructive/10 text-destructive border-transparent gap-1 rounded-sm mt-1">
                          {pricing.label === 'Gap Filler Deal' ? <Zap className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {pricing.discount}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="border border-slate-300 rounded-xl overflow-hidden mb-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center justify-between p-3 border-b border-slate-300 text-left hover:bg-slate-50 transition-colors">
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-900 dark:text-white tracking-wider">Check-in</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">{dateRange?.from ? format(dateRange.from, 'MM/dd/yyyy') : 'Add date'}</span>
                          </div>
                          <div className="border-l border-slate-300 pl-3">
                            <span className="block text-[10px] font-bold uppercase text-slate-900 dark:text-white tracking-wider">Checkout</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">{dateRange?.to ? format(dateRange.to, 'MM/dd/yyyy') : 'Add date'}</span>
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={1}
                          disabled={[{ before: getPhTime() }, ...bookedDates.map(d => d)]}
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <div className="p-3">
                      <Label htmlFor="guests" className="block text-[10px] font-bold uppercase text-slate-900 dark:text-white tracking-wider mb-1">Guests</Label>
                      <Select value={guests.toString()} onValueChange={(val) => setGuests(Number(val))}>
                        <SelectTrigger id="guests" className="w-full bg-transparent border-0 px-0 py-0 h-auto text-sm text-slate-900 dark:text-white focus:ring-0 focus:ring-offset-0 shadow-none">
                          <SelectValue placeholder="Select guests" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-[#0f172a] dark:border-white/10">
                          {Array.from({length: property.maxGuests}, (_, i) => i + 1).map(num => (
                            <SelectItem key={num} value={num.toString()} className="cursor-pointer dark:text-white dark:focus:bg-white/10 dark:focus:text-white">
                              {num} guest{num > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {nights > 0 && (
                     <div className="space-y-3 mb-4 text-slate-600">
                        <div className="flex justify-between">
                          <span className="underline decoration-slate-300 underline-offset-4">
                            {pricing && pricing.discount > 0 ? (
                              <>₱{effectivePrice.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</>
                            ) : (
                              <>₱{property.pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</>
                            )}
                          </span>
                          <span>₱{total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 pt-3 border-t">
                          <span>Total</span>
                          <span>₱{total.toLocaleString()}</span>
                        </div>
                     </div>
                  )}

                  <Button type="button" className="w-full font-bold text-base py-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200" disabled={nights < 1} onClick={() => setStep(2)}>
                    Reserve
                  </Button>
                  
                  <p className={cn("text-center text-sm mt-4 font-medium", nights < 1 ? "text-amber-600 dark:text-amber-500" : "text-slate-500")}>
                    {nights < 1 ? "Please select check-in and checkout dates to proceed" : "You won't be charged yet"}
                  </p>

                  {showWaitlist && (
                    <Button type="button" variant="outline" className="w-full gap-2 mt-4 transition-all duration-200" onClick={handleJoinWaitlist}>
                      <Bell className="h-4 w-4" /> Join Waitlist
                    </Button>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-2 mb-6">
                    <button type="button" onClick={() => setStep(1)} className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-colors"><ArrowLeft className="h-4 w-4"/></button>
                    <h3 className="text-xl font-bold font-display tracking-tight text-slate-900">Guest Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className={cn(!guestName && "text-muted-foreground")}>Full Name <span className="text-destructive">*</span></Label>
                      <Input id="name" required value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Juan Dela Cruz" className="mt-1 focus-visible:ring-primary transition-all duration-200" />
                    </div>
                    <div>
                      <Label htmlFor="email" className={cn(!guestEmail && "text-muted-foreground")}>Email <span className="text-destructive">*</span></Label>
                      <Input id="email" type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="juan@email.com" className="mt-1 focus-visible:ring-primary transition-all duration-200" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className={cn(!guestPhone && "text-muted-foreground")}>Phone <span className="text-destructive">*</span></Label>
                      <Input id="phone" type="tel" required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" className="mt-1 focus-visible:ring-primary transition-all duration-200" />
                    </div>
                    
                    <Button type="button" className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20" size="lg" disabled={!guestName || !guestEmail || !guestPhone} onClick={() => setStep(3)}>
                      Review Booking
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-2 mb-6">
                    <button type="button" onClick={() => setStep(2)} className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-colors"><ArrowLeft className="h-4 w-4"/></button>
                    <h3 className="text-xl font-bold font-display tracking-tight text-slate-900">Confirm & Pay</h3>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-5 border border-border/50 space-y-4 mb-6 text-sm">
                    <div className="flex justify-between border-b border-border/50 pb-3">
                      <span className="text-muted-foreground">Dates</span>
                      <span className="font-medium text-right">{format(dateRange!.from!, 'MMM d')} → {format(dateRange!.to!, 'MMM d, yyyy')}<br/><span className="text-xs text-muted-foreground font-normal">{nights} night{nights > 1 ? 's' : ''}</span></span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-3">
                      <span className="text-muted-foreground">Guests</span>
                      <span className="font-medium text-right">{guests} Guest{guests > 1 ? 's' : ''}<br/><span className="text-xs text-muted-foreground font-normal">{guestName}</span></span>
                    </div>
                    <div className="flex justify-between pt-1 items-center">
                      <span className="text-foreground font-medium">Total (PHP)</span>
                      <span className="font-bold text-xl text-primary">₱{total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-xl shadow-primary/20" 
                    size="lg" 
                    disabled={submitting}
                    onClick={() => setShowTerms(true)}
                  >
                    {submitting ? 'Processing...' : 'Confirm Reservation'}
                  </Button>

                  <TermsAndConditionsModal 
                    isOpen={showTerms}
                    onClose={() => setShowTerms(false)}
                    onAccept={async () => {
                      setShowTerms(false);
                      await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                    }}
                  />
                </div>
              )}

              {step === 4 && confirmedBookingId && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-display tracking-tight text-slate-900 mb-2">Booking Confirmed!</h3>
                  <p className="text-slate-600 mb-6">You're all set for your stay at <span className="font-semibold text-slate-900">{property.name}</span>.</p>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 text-left space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Booking Details</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Booking ID</span>
                      <span className="font-bold text-slate-900 font-mono text-base">{confirmedBookingId}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-3">
                      <span className="text-slate-600">Dates</span>
                      <span className="font-medium text-slate-900 text-right">{format(dateRange!.from!, 'MMM d')} → {format(dateRange!.to!, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-3">
                      <span className="text-slate-600">Total Amount</span>
                      <span className="font-bold text-primary">₱{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-amber-800 text-sm flex items-start gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p>Please take a screenshot of your <strong>Booking ID</strong> for your reference or check your bookings from the home page.</p>
                  </div>

                  <Button 
                    type="button" 
                    className="w-full transition-all duration-300 shadow-xl" 
                    size="lg" 
                    onClick={() => navigate('/')}
                  >
                    Return to Home
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <MobileStickyBar
        pricePerNight={property.pricePerNight}
        widgetVisible={widgetVisible}
        onBookNow={() => {
          bookingWidgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />
    </div>
  );
}
