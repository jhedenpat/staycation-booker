import { Link } from 'react-router-dom';
import { useBookings } from '@/context/BookingContext';
import { isWithinInterval, startOfDay } from 'date-fns';
import { properties } from '@/data/properties';
import PropertyCard from '@/components/PropertyCard';
import heroImg from '@/assets/hero-staycation.jpg';
import { MapPin, Users, Building2, ShoppingBag, Briefcase, Sparkles, BellRing, Star } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// The featured property is always the Pearl Suite (moa-303) — highest floor, "penthouse" feel.
// We use gallery image [2] (The View shot) since it has a right-side focal point (city skyline)
// which leaves breathing room for the left-aligned text.
const FEATURED_ID = 'moa-303';

function FeaturedSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(inViewRef, { once: true, margin: '-10% 0px' });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Background image moves at 50% scroll speed → parallax effect
  const bgY = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);

  // Dynamically pull the featured property from the data array; fallback gracefully
  const featuredProp = properties.find(p => p.id === FEATURED_ID) ?? properties[properties.length - 1];
  const bgImage = featuredProp.gallery?.[2] ?? featuredProp.gallery?.[0];

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-slate-950"
      style={{ height: 'clamp(480px, 65vh, 800px)' }}
    >
      {/* ── Parallax Background ── */}
      <motion.div
        className="absolute inset-x-0 top-[-12%] bottom-[-12%] z-0"
        style={{ y: bgY }}
      >
        {/* Scroll-triggered reveal: fade-in + scale-up as section enters viewport */}
        <div ref={inViewRef} className="w-full h-full">
          <motion.img
            src={bgImage}
            alt={featuredProp.name}
            className="w-full h-full object-cover object-right"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
            transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
      </motion.div>

      {/* ── Dark Gradient Overlay (Dark Mode optimised) ── */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.55) 55%, rgba(15,23,42,0.15) 100%), linear-gradient(to bottom, transparent 40%, rgba(15,23,42,0.8) 100%)'
        }}
      />

      {/* ── Foreground Content ── */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-center">

        {/* Elegant Heading (Playfair Display) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mb-8 lg:mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary/80 mb-3">Featured Spotlight</p>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our <em className="not-italic text-amber-300">Crown Jewel</em><br className="hidden sm:block" /> Unit
          </h2>
        </motion.div>

        {/* ── Glassmorphism Floating Info Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.45 }}
          whileHover={{ y: -6, transition: { duration: 0.3 } }}
          className="w-full max-w-sm"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-950/40 border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Top accent bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-primary to-transparent" />

            <div className="p-6 lg:p-8">
              {/* 5-Star Rating Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Badge className="bg-amber-400/15 text-amber-300 border-amber-400/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  5-Star Premium
                </Badge>
              </div>

              {/* Unit Name & Floor */}
              <h3
                className="text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {featuredProp.name}
              </h3>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
                MOA Complex · {featuredProp.floor}
              </p>

              {/* Premium Description */}
              <p className="text-sm text-white/70 leading-relaxed mb-6 line-clamp-3">
                {featuredProp.description}
              </p>

              {/* Price + CTA */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-white">₱{featuredProp.pricePerNight.toLocaleString()}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wide">per night</p>
                </div>
                <Link
                  to={`/property/${featuredProp.id}`}
                  className="flex-1"
                >
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 px-5 rounded-xl font-bold text-sm text-slate-900 transition-all duration-300 shadow-lg shadow-amber-400/20 hover:shadow-amber-400/40"
                    style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                  >
                    View Availability →
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const VIBES = [

  { id: 'city', label: 'City Scapes', icon: Building2 },
  { id: 'mall', label: 'Near the Mall', icon: ShoppingBag },
  { id: 'business', label: 'Business Ready', icon: Briefcase },
  { id: 'hidden', label: 'Hidden Gems', icon: Sparkles },
];

const Index = () => {
  const [showProof, setShowProof] = useState(false);
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const { bookings } = useBookings();
  const today = startOfDay(new Date());

  const checkAvailability = (propertyId: string) => {
    return !bookings.some(b => 
      b.propertyId === propertyId && 
      b.status === 'confirmed' && 
      isWithinInterval(today, { start: startOfDay(new Date(b.checkIn)), end: startOfDay(new Date(b.checkOut)) })
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowProof(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Map every unit to at least one vibe category explicitly
  const vibeMapping: Record<string, string[]> = {
    'city': ['moa-102', 'moa-203', 'moa-302', 'moa-303'],
    'mall': ['moa-101', 'moa-103', 'moa-202', 'moa-301'],
    'business': ['moa-102', 'moa-201', 'moa-203', 'moa-303'],
    'hidden': ['moa-101', 'moa-103', 'moa-201', 'moa-202', 'moa-301', 'moa-302'],
  };

  const filtered = activeVibe 
    ? properties.filter(p => vibeMapping[activeVibe]?.includes(p.id))
    : properties;

  return (
    <div className="min-h-screen">
      {/* Split Hero */}
      <section className="relative min-h-[85vh] lg:min-h-[75vh] flex flex-col lg:flex-row border-b border-border/50">
        
        {/* Mobile Background (Hidden on Desktop) */}
        <div className="absolute inset-0 lg:hidden -z-10">
          <img src={heroImg} alt="Staycation hero" className="w-full h-full object-cover opacity-30 dark:opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        </div>

        {/* Left: Text & CTA */}
        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end px-4 sm:px-6 lg:px-12 py-16 lg:py-24 z-10">
          <div className="w-full max-w-xl lg:ml-auto">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 px-3 py-1 text-xs">
              Direct Booking Exclusive
            </Badge>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] tracking-tight text-slate-900 dark:text-white">
              Stay in the <span className="text-secondary dark:text-primary italic">Heart</span> of MOA.
            </h1>
            <p className="text-slate-600 dark:text-white/70 text-xl mb-12 max-w-md leading-relaxed">
              Discover a curated collection of premium residences, hand-picked for quality and comfort.
            </p>
            <div className="flex flex-wrap gap-4">
               <Button onClick={() => document.getElementById('units')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-7 text-lg font-bold rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                 Browse Available Units
               </Button>
               <Button variant="outline" className="px-8 py-7 text-lg font-bold rounded-2xl border-2 hover:bg-slate-50 transition-all">
                 Our Standards
               </Button>
            </div>
          </div>
        </div>

        {/* Right: Rich Media & Social Proof */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
          <img 
            src={heroImg} 
            alt="Premium Staycation" 
            className="absolute inset-0 w-full h-full object-cover scale-105 animate-in zoom-in duration-[20000ms] fill-mode-forwards"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80" />
          
          {/* Live Social Proof Toast */}
          <AnimatePresence>
            {showProof && (
              <motion.div 
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-12 left-12 bg-white/95 dark:bg-amber-950/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20 dark:border-amber-500/30 flex items-center gap-4 max-w-sm z-30"
              >
                <div className="relative flex min-w-10 min-h-10 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-20 dark:opacity-40"></span>
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-2.5 rounded-full border border-amber-200 dark:border-amber-700/50">
                    <BellRing className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">High Demand!</p>
                  <p className="text-xs text-slate-500 dark:text-amber-200/70 mt-0.5">3 people booked a unit in MOA within the last hour.</p>
                </div>
                <button onClick={() => setShowProof(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600">
                  <span className="sr-only">Close</span>
                  <div className="text-[10px] p-1">&times;</div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Vibe Categories */}
      <section className="bg-white dark:bg-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-start lg:justify-center gap-6 sm:gap-12 overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
            {VIBES.map(vibe => {
              const Icon = vibe.icon;
              const isActive = activeVibe === vibe.id;
              return (
                <button 
                  key={vibe.id} 
                  onClick={() => setActiveVibe(isActive ? null : vibe.id)}
                  className="group flex flex-col items-center gap-3 min-w-[80px] outline-none"
                >
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary shadow-lg shadow-primary/20 scale-110' : 'bg-slate-100 dark:bg-slate-800/50 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-110'}`}>
                    <Icon className={`h-7 w-7 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-white'}`} />
                  </div>
                  <span className={`text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                    {vibe.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      {/* ═══════════════════════════════════════════════════════ */}
      {/* Featured Spotlight — Parallax Section                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <FeaturedSpotlight />

      {/* Listings */}
      <section id="units" className="bg-slate-50 dark:bg-background border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">Available Units</h2>
            <p className="text-slate-500 dark:text-white/60 text-lg max-w-2xl mx-auto">Discover our collection of 5-star units, each verified for quality and comfort.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, index) => (
              <PropertyCard key={p.id} property={p} isFeaturedBento={false} isAvailable={checkAvailability(p.id)} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12 col-span-full">No units found matching your search.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
