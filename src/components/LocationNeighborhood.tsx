import { useState } from 'react';
import { MapPin, Star, ExternalLink, PersonStanding, Car, Train, Utensils, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Highlight {
  label: string;
  distance: string;
  mode: 'walk' | 'car';
}

interface NeighborhoodCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: Highlight[];
}

const NEIGHBORHOOD_DATA: NeighborhoodCategory[] = [
  {
    id: 'transport',
    name: 'Transport',
    icon: <Train className="h-4 w-4" />,
    items: [
      { label: 'MOA Bus Terminal', distance: '3 min walk', mode: 'walk' },
      { label: 'Mall of Asia Arena', distance: '5 min walk', mode: 'walk' },
      { label: 'NAIA Terminal 1', distance: '12 min drive', mode: 'car' },
    ],
  },
  {
    id: 'dining',
    name: 'Dining',
    icon: <Utensils className="h-4 w-4" />,
    items: [
      { label: 'S Maison, Conrad Manila', distance: '2 min walk', mode: 'walk' },
      { label: 'MOA Complex Food Court', distance: '3 min walk', mode: 'walk' },
      { label: 'Dampa Seaside Market', distance: '8 min drive', mode: 'car' },
    ],
  },
  {
    id: 'attractions',
    name: 'Attractions',
    icon: <Camera className="h-4 w-4" />,
    items: [
      { label: 'Mall of Asia', distance: '2 min walk', mode: 'walk' },
      { label: 'MOA Eye (Giant Ferris Wheel)', distance: '5 min walk', mode: 'walk' },
      { label: 'SM by the Bay', distance: '7 min walk', mode: 'walk' },
    ],
  },
];

interface LocationNeighborhoodProps {
  propertyName: string;
  rating?: number | string;
}

export default function LocationNeighborhood({ propertyName, rating = 4.9 }: LocationNeighborhoodProps) {
  const [activeCategory, setActiveCategory] = useState('transport');
  const [showMarkerCard, setShowMarkerCard] = useState(false);

  const activeData = NEIGHBORHOOD_DATA.find(c => c.id === activeCategory)!;

  const gmapsUrl = `https://maps.google.com/?q=Mall+of+Asia+Complex,+Pasay,+Metro+Manila,+Philippines`;

  return (
    <div className="border-b pb-8">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
        Location &amp; Neighborhood
      </h2>
      <p className="text-sm text-slate-500 dark:text-white/60 mb-6">
        MOA Complex, Pasay City, Metro Manila
      </p>

      {/* Main layout: map + sidebar */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* ── MAP SECTION ── */}
        <div className="relative flex-1 rounded-xl overflow-hidden border border-[#1e293b] min-h-[280px] lg:min-h-[360px]">

          {/* iFrame embed (no API key needed) */}
          <iframe
            title="Property Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3862.017596018!2d120.97853!3d14.53598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cf10c7a46169%3A0x9f90ceabb9b6ae61!2sSM%20Mall%20of%20Asia!5e0!3m2!1sen!2sph!4v1710000000000!5m2!1sen!2sph"
            className="absolute inset-0 w-full h-full"
            style={{ filter: 'invert(90%) hue-rotate(180deg) saturate(0.6) brightness(0.85)' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Dark overlay tint for a more Navy/Slate aesthetic */}
          <div className="pointer-events-none absolute inset-0 bg-[#020617]/20" />

          {/* Pulse Marker */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            onMouseEnter={() => setShowMarkerCard(true)}
            onMouseLeave={() => setShowMarkerCard(false)}
          >
            {/* Outer pulse rings */}
            <span className="absolute inline-flex h-12 w-12 rounded-full bg-primary/20 animate-ping -inset-2" />
            <span className="absolute inline-flex h-8 w-8 rounded-full bg-primary/30 animate-ping -inset-0 animation-delay-150" />

            {/* Core pin */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative z-10 flex items-center justify-center w-8 h-8 bg-primary rounded-full shadow-xl shadow-primary/50 ring-2 ring-white/80"
            >
              <MapPin className="h-4 w-4 text-white fill-white" />
            </motion.div>

            {/* Hover mini-card */}
            {showMarkerCard && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 pointer-events-none"
              >
                <div
                  className="rounded-xl px-3 py-2 text-center min-w-[160px] shadow-2xl"
                  style={{
                    background: 'rgba(15,23,42,0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <p className="text-white text-xs font-semibold">{propertyName}</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-amber-400 text-xs font-bold">{rating}</span>
                    <span className="text-white/50 text-xs">· MOA Complex</span>
                  </div>
                  {/* Caret */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[rgba(15,23,42,0.85)]" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Glassmorphism 'View in Google Maps' button */}
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(15,23,42,0.70)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            View in Google Maps
          </a>
        </div>

        {/* ── NEIGHBORHOOD HIGHLIGHTS SIDEBAR ── */}
        <div className="lg:w-[300px] flex flex-col gap-3">
          {/* Category tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-[#0f172a] p-1 gap-1">
            {NEIGHBORHOOD_DATA.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200',
                  activeCategory === cat.id
                    ? 'bg-white dark:bg-[#1e293b] text-primary shadow-sm'
                    : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
                )}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Items list */}
          <div className="flex flex-col gap-2 flex-1">
            {activeData.items.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.06 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b]"
              >
                {/* Mode icon */}
                <div className={cn(
                  'flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full',
                  item.mode === 'walk'
                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                )}>
                  {item.mode === 'walk'
                    ? <PersonStanding className="h-4 w-4" />
                    : <Car className="h-4 w-4" />
                  }
                </div>

                {/* Text */}
                <div className="min-w-0">
                  <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{item.label}</p>
                  <p className="text-slate-500 dark:text-white/60 text-xs mt-0.5">{item.distance}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-xs text-slate-400 dark:text-white/40 text-center">
            All distances are approximate estimates.
          </p>
        </div>
      </div>
    </div>
  );
}
