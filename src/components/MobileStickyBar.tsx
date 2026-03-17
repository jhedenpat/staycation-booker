import { motion } from 'framer-motion';
import { ShoppingCart, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileStickyBarProps {
  pricePerNight: number;
  onBookNow: () => void;
  /** Pass true once the main booking widget is on-screen so the bar hides */
  widgetVisible?: boolean;
}

export default function MobileStickyBar({ pricePerNight, onBookNow, widgetVisible = false }: MobileStickyBarProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: widgetVisible ? 100 : 0, opacity: widgetVisible ? 0 : 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
    >
      <div
        className="flex items-center justify-between rounded-2xl px-5 py-3.5 shadow-2xl"
        style={{
          background: 'rgba(2,6,23,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Price info */}
        <div>
          <p className="text-white/50 text-[11px] font-medium uppercase tracking-wide leading-none mb-1">
            Starting from
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-white text-2xl font-bold leading-none">
              ₱{pricePerNight.toLocaleString()}
            </span>
            <span className="text-white/40 text-xs">/night</span>
          </div>
        </div>

        {/* Book Now CTA */}
        <Button
          onClick={onBookNow}
          size="lg"
          className="px-6 h-12 text-sm font-bold rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
        >
          <ShoppingCart className="h-4 w-4 mr-2 opacity-80" />
          Book Now
        </Button>
      </div>
    </motion.div>
  );
}
