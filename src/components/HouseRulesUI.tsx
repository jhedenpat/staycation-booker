import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Clock, 
  CigaretteOff, 
  VolumeX, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  CreditCard, 
  Info,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  penalty?: string;
  index: number;
}

const RuleCard = ({ icon, title, description, penalty, index }: RuleCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.6, margin: "-10% 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { 
            type: "spring", 
            stiffness: 260, 
            damping: 20, 
            mass: 1 
          } 
        }
      }}
      animate={{
        scale: isInView ? 1.02 : 1,
        filter: isInView ? "grayscale(0%)" : "grayscale(50%)",
        opacity: isInView ? 1 : 0.6,
        boxShadow: isInView 
          ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" 
          : "0 0px 0px 0px rgb(0 0 0 / 0)",
      }}
      className={cn(
        "relative p-6 rounded-2xl border transition-all duration-500 bg-card",
        isInView ? "border-primary/30 ring-1 ring-primary/10" : "border-border"
      )}
    >
      <div className="flex gap-4 items-start">
        <div className={cn(
          "p-3 rounded-xl transition-colors duration-500 shadow-sm",
          isInView ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" })}
        </div>
        <div className="flex-1">
          <h3 className={cn(
            "font-bold text-lg font-display transition-colors duration-500",
            isInView ? "text-foreground" : "text-muted-foreground"
          )}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
          {penalty && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -10 }}
              className="mt-3 flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {penalty}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Active Indicator Dot */}
      <AnimatePresence>
        {isInView && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function HouseRulesUI({ onAccept }: { onAccept: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const stickyHeaderOpacity = useTransform(scrollYProgress, [0.1, 0.15], [0, 1]);
  const stickyHeaderY = useTransform(scrollYProgress, [0.1, 0.15], [-20, 0]);

  const rules = [
    {
      icon: <Clock />,
      title: "Check-in & Checkout",
      description: "Standard Check-in is at 2:00 PM. Checkout is strictly at 12:00 PM to allow for professional sanitation."
    },
    {
      icon: <CigaretteOff />,
      title: "Smoking Policy",
      description: "Strictly non-smoking unit. This includes the balcony area and common hallways.",
      penalty: "₱5,000 deep-cleaning penalty"
    },
    {
      icon: <CreditCard />,
      title: "Security Deposit",
      description: "A refundable security deposit is required via GCash or Bank Transfer before key handover.",
      penalty: "₱2,000 (Refundable upon checkout)"
    },
    {
      icon: <ShieldCheck />,
      title: "LGU Compliance",
      description: "Valid government-issued IDs for all guests must be submitted 24 hours before check-in.",
    },
    {
      icon: <VolumeX />,
      title: "Quiet Hours",
      description: "Please respect our neighbors. No loud music or parties from 10:00 PM to 8:00 AM.",
    },
    {
      icon: <Users />,
      title: "Max Occupancy",
      description: "Maximum of 4 guests for this unit type. Unregistered visitors are not allowed overnight.",
    }
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto pb-24 bg-background overflow-hidden min-h-[80vh]">
      {/* Sticky Glass Nav */}
      <motion.div 
        style={{ opacity: stickyHeaderOpacity, y: stickyHeaderY }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between"
      >
        <h2 className="font-display font-bold text-lg text-foreground">House Rules</h2>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
          Tropical Minimalist
        </Badge>
      </motion.div>

      {/* Main Header */}
      <motion.div 
        style={{ opacity: headerOpacity }}
        className="px-6 pt-12 pb-8"
      >
        <Badge className="bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-1">
          Antigravity Principles
        </Badge>
        <h1 className="text-4xl font-black font-display tracking-tight text-foreground leading-tight">
          House Rules & <br /> Stay Terms
        </h1>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed max-w-[280px]">
          Designed for your comfort and safety in our Philippine-based staycation.
        </p>
      </motion.div>

      {/* Staggered Content Grid */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.08
            }
          }
        }}
        className="px-6 space-y-4"
      >
        {rules.map((rule, idx) => (
          <RuleCard 
            key={idx} 
            index={idx}
            icon={rule.icon}
            title={rule.title}
            description={rule.description}
            penalty={rule.penalty}
          />
        ))}

        {/* Info Disclosure */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1 }
          }}
          className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 mt-8"
        >
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
              By proceeding, you agree to comply with all building policies and LGU regulations of Pasay City / MOA Complex.
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Haptic CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none sm:max-w-md sm:mx-auto">
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ y: -2 }}
          onClick={onAccept}
          className="pointer-events-auto w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] flex items-center justify-center gap-2 group relative overflow-hidden"
        >
          <motion.div 
            className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
          />
          I Agree & Accept
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold !font-sans transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === "default" ? "border-transparent bg-primary text-primary-foreground" : "border border-border text-foreground",
      className
    )}>
      {children}
    </span>
  );
}
