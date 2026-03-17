import { useState } from 'react';
import { ExternalLink, PersonStanding, Car, Train, Utensils, Camera, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    icon: <Train className="h-3.5 w-3.5" />,
    items: [
      { label: 'MOA Bus Terminal', distance: '3 min walk', mode: 'walk' },
      { label: 'Mall of Asia Arena', distance: '5 min walk', mode: 'walk' },
      { label: 'NAIA Terminal 1', distance: '12 min drive', mode: 'car' },
    ],
  },
  {
    id: 'dining',
    name: 'Dining',
    icon: <Utensils className="h-3.5 w-3.5" />,
    items: [
      { label: 'S Maison, Conrad Manila', distance: '2 min walk', mode: 'walk' },
      { label: 'MOA Complex Food Court', distance: '3 min walk', mode: 'walk' },
      { label: 'Dampa Seaside Market', distance: '8 min drive', mode: 'car' },
    ],
  },
  {
    id: 'attractions',
    name: 'Attractions',
    icon: <Camera className="h-3.5 w-3.5" />,
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
  const gmapsUrl = 'https://maps.google.com/?q=Mall+of+Asia+Complex,+Pasay,+Metro+Manila,+Philippines';

  return (
    <div className="border-b pb-10">
      {/* Section header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Location &amp; Neighborhood
          </h2>
          <p className="text-sm text-slate-500 dark:text-white/50 flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5" />
            MOA Complex, Pasay City, Metro Manila
          </p>
        </div>
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in Maps
        </a>
      </div>

      {/* Main two-column layout */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── REAL MAP (OpenStreetMap embed) ── */}
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md" style={{ width: '460px', height: '400px', flexShrink: 0, margin: '0 auto' }}>

          {/* OSM Iframe — marker is built into the URL, no overlays needed */}
          <iframe
            title="MOA Property Location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=120.9800%2C14.5320%2C120.9910%2C14.5420&layer=mapnik&marker=14.5358,120.9841"
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* ── NEIGHBORHOOD HIGHLIGHTS SIDEBAR ── */}
        <div className="lg:w-[290px] flex flex-col gap-3">

          {/* Category tab strip */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-[#0f172a] p-1 gap-1 border border-slate-200 dark:border-[#1e293b]">
            {NEIGHBORHOOD_DATA.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200',
                  activeCategory === cat.id
                    ? 'bg-white dark:bg-[#1e293b] text-primary shadow-sm'
                    : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70'
                )}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Category label */}
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 px-1">
            Nearby {activeData.name}
          </p>

          {/* Items */}
          <div className="flex flex-col gap-2 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-2"
              >
                {activeData.items.map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.07 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] hover:border-primary/30 transition-colors group"
                  >
                    {/* Mode icon */}
                    <div className={cn(
                      'flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                      item.mode === 'walk'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20'
                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20'
                    )}>
                      {item.mode === 'walk'
                        ? <PersonStanding className="h-4 w-4" />
                        : <Car className="h-4 w-4" />
                      }
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-900 dark:text-white text-sm font-semibold truncate leading-tight">{item.label}</p>
                      <p className={cn(
                        'text-xs mt-0.5 font-medium',
                        item.mode === 'walk'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-500 dark:text-blue-400'
                      )}>{item.distance}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-slate-400 dark:text-white/30 text-center px-2">
            Distances are estimated based on typical conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
