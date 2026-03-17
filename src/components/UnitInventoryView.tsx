import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, SlidersHorizontal, BedDouble, Users, DollarSign, Calendar, CheckCircle2, Clock, Brush, AlertTriangle, ChevronRight, ArrowUpRight } from 'lucide-react';
import { properties } from '@/data/properties';
import { Booking } from '@/types/booking';
import { format, isWithinInterval, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────
type UnitStatus = 'occupied' | 'available' | 'pending-checkin' | 'housekeeping' | 'maintenance';
type UnitType = 'Solo' | 'Couple' | 'Family';

interface UnitRow {
  id: string;
  unitNumber: string;
  type: UnitType;
  status: UnitStatus;
  guestName: string;
  checkIn: string | null;
  checkOut: string | null;
  floor: string;
  pricePerNight: number;
  maxGuests: number;
  sqft?: number;
  bookingId?: string;
}

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<UnitStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  'occupied':        { label: 'Occupied',         bg: 'bg-emerald-100 dark:bg-emerald-950/50',  text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  'available':       { label: 'Available',        bg: 'bg-slate-100 dark:bg-slate-800',    text: 'text-slate-600 dark:text-slate-300',   border: 'border-slate-200 dark:border-slate-700',   dot: 'bg-slate-400'   },
  'pending-checkin': { label: 'Pending Check-in', bg: 'bg-amber-100 dark:bg-amber-950/50',    text: 'text-amber-700 dark:text-amber-300',   border: 'border-amber-200 dark:border-amber-700',   dot: 'bg-amber-500 dark:bg-amber-400'   },
  'housekeeping':    { label: 'Housekeeping',     bg: 'bg-blue-100 dark:bg-blue-950/50',     text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-700',    dot: 'bg-blue-500 dark:bg-blue-400'    },
  'maintenance':     { label: 'Maintenance',      bg: 'bg-red-100 dark:bg-red-950/50',      text: 'text-red-700 dark:text-red-300',     border: 'border-red-200 dark:border-red-700',     dot: 'bg-red-500 dark:bg-red-400'     },
};

const ALL_STATUSES: UnitStatus[] = ['occupied', 'available', 'pending-checkin', 'housekeeping', 'maintenance'];

function StatusBadge({ status }: { status: UnitStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border', cfg.bg, cfg.text, cfg.border)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─── Metric Card ────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  trend?: string;
}
function MetricCard({ label, value, sub, icon, accent, trend }: MetricCardProps) {
  return (
    <div className="bg-card rounded-xl p-5 border shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md">
      {/* Background Icon Detail - Matching HostDashboard style */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
        {React.cloneElement(icon as React.ReactElement, { className: "w-16 h-16" })}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shadow-sm', accent)}>
            {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" })}
          </div>
          {trend && (
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3 w-3" />{trend}
            </span>
          )}
        </div>
        
        <div>
          <p className="text-2xl font-bold font-display tracking-tight text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground font-medium mt-1">{sub}</p>}
        </div>
        
        <div className="mt-auto pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Slide-over Panel ───────────────────────────────────────────────────────
const NEXT_STATUSES: UnitStatus[] = ['available', 'occupied', 'pending-checkin', 'housekeeping', 'maintenance'];

function SlideOver({ unit, onClose, onStatusChange }: { unit: UnitRow; onClose: () => void; onStatusChange: (id: string, s: UnitStatus) => void }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const cfg = STATUS_CONFIG[unit.status];

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      className={cn("fixed inset-y-0 right-0 w-full sm:w-[400px] z-50 flex flex-col shadow-2xl bg-card border-l border-border")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Unit Details</p>
          <h2 className="text-xl font-black text-foreground mt-0.5 font-display">{unit.unitNumber}</h2>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Status badge + change */}
        <div className="flex items-center justify-between">
          <StatusBadge status={unit.status} />
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 border border-border transition-colors"
            >
              Change Status <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <AnimatePresence>
              {showStatusMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute right-0 top-full mt-1 w-52 rounded-xl overflow-hidden shadow-2xl z-10 border border-border bg-card"
                >
                  {NEXT_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => { onStatusChange(unit.id, s); setShowStatusMenu(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-left transition-colors',
                        s === unit.status ? 'bg-muted/60' : 'hover:bg-muted/40'
                      )}
                    >
                      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', STATUS_CONFIG[s].dot)} />
                      <span className="text-foreground">{STATUS_CONFIG[s].label}</span>
                      {s === unit.status && <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Type',         value: unit.type,                         icon: <BedDouble className="h-4 w-4" /> },
            { label: 'Floor',        value: unit.floor,                        icon: <ChevronRight className="h-4 w-4" /> },
            { label: 'Max Guests',   value: `${unit.maxGuests} pax`,           icon: <Users className="h-4 w-4" /> },
            { label: 'Rate/Night',   value: `₱${unit.pricePerNight.toLocaleString()}`, icon: <DollarSign className="h-4 w-4" /> },
            ...(unit.sqft ? [{ label: 'Size', value: `${unit.sqft} sqft`, icon: <SlidersHorizontal className="h-4 w-4" /> }] : []),
          ].map(item => (
            <div key={item.label} className="bg-muted/30 dark:bg-muted/20 rounded-xl p-3.5 border border-border/50 transition-colors">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                {item.icon}
                <span className="text-[10px] uppercase tracking-wider font-semibold">{item.label}</span>
              </div>
              <p className="text-sm font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Guest info */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/40 border-b border-border/50">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Current Guest</p>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                {unit.guestName !== '—' ? unit.guestName[0].toUpperCase() : '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{unit.guestName}</p>
                <p className="text-[11px] text-muted-foreground">{unit.status === 'occupied' ? 'Currently staying' : 'No active guest'}</p>
              </div>
            </div>
            {unit.checkIn && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/40 rounded-lg px-3 py-2 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Check-in</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{format(new Date(unit.checkIn), 'MMM d, yyyy')}</p>
                </div>
                <div className="bg-muted/40 rounded-lg px-3 py-2 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Check-out</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{unit.checkOut ? format(new Date(unit.checkOut), 'MMM d, yyyy') : '—'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
interface UnitInventoryViewProps {
  bookings: Booking[];
}

export default function UnitInventoryView({ bookings }: UnitInventoryViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UnitStatus[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitRow | null>(null);
  const [unitStatuses, setUnitStatuses] = useState<Record<string, UnitStatus>>({});

  const today = startOfDay(new Date());

  // derive unit rows from properties + bookings
  const unitRows: UnitRow[] = useMemo(() => {
    return properties.map((p): UnitRow => {
      const activeBooking = bookings.find(b =>
        b.propertyId === p.id &&
        b.status === 'confirmed' &&
        isWithinInterval(today, { start: startOfDay(new Date(b.checkIn)), end: startOfDay(new Date(b.checkOut)) })
      );
      const pendingCheckin = bookings.find(b =>
        b.propertyId === p.id &&
        b.status === 'pending' &&
        startOfDay(new Date(b.checkIn)).getTime() === today.getTime()
      );

      const nameNum = p.id.toUpperCase(); // e.g. MOA-101
      const unitNum = p.name; // e.g. 'Bay Breeze Suite'

      // Derive type from maxGuests
      const type: UnitType = p.maxGuests >= 4 ? 'Family' : p.maxGuests >= 2 ? 'Couple' : 'Solo';

      // Auto-derive status
      let autoStatus: UnitStatus = 'available';
      if (activeBooking) autoStatus = 'occupied';
      else if (pendingCheckin) autoStatus = 'pending-checkin';

      const status: UnitStatus = unitStatuses[p.id] ?? autoStatus;

      // Next availability: first future booking
      const nextBooking = bookings
        .filter(b => b.propertyId === p.id && b.status !== 'cancelled' && new Date(b.checkIn) > today)
        .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())[0];

      return {
        id: p.id,
        unitNumber: unitNum,
        type,
        status,
        guestName: activeBooking?.guestName ?? pendingCheckin?.guestName ?? '—',
        checkIn: activeBooking?.checkIn ?? pendingCheckin?.checkIn ?? null,
        checkOut: activeBooking?.checkOut ?? null,
        floor: p.floor ?? 'Ground',
        pricePerNight: p.pricePerNight,
        maxGuests: p.maxGuests,
        sqft: p.sqft,
        bookingId: activeBooking?.id,
      };
    });
  }, [bookings, unitStatuses, today]);

  // Metrics
  const metrics = useMemo(() => {
    const total = unitRows.length;
    const occupied = unitRows.filter(u => u.status === 'occupied').length;
    const pendingCI = unitRows.filter(u => u.status === 'pending-checkin').length;
    const hk = unitRows.filter(u => u.status === 'housekeeping').length;
    return { total, occupied, pct: total ? Math.round((occupied / total) * 100) : 0, pendingCI, hk };
  }, [unitRows]);

  // Filter
  const filtered = useMemo(() => {
    return unitRows.filter(u => {
      const matchSearch = !search || u.unitNumber.toLowerCase().includes(search.toLowerCase()) || u.guestName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(u.status);
      return matchSearch && matchStatus;
    });
  }, [unitRows, search, statusFilter]);

  const handleStatusChange = (id: string, s: UnitStatus) => {
    setUnitStatuses(prev => ({ ...prev, [id]: s }));
    if (selectedUnit?.id === id) setSelectedUnit(prev => prev ? { ...prev, status: s } : null);
  };

  const toggleStatus = (s: UnitStatus) => setStatusFilter(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  return (
    <div className="space-y-6">
      {/* ── Metrics Header ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Total Units"
          value={metrics.total}
          sub={`${properties.length} properties managed`}
          icon={<BedDouble className="h-5 w-5 text-slate-300" />}
          accent="bg-slate-700"
        />
        <MetricCard
          label="Occupied"
          value={`${metrics.pct}%`}
          sub={`${metrics.occupied} of ${metrics.total} units`}
          icon={<Users className="text-emerald-600 dark:text-emerald-400" />}
          accent="bg-emerald-50 dark:bg-emerald-500/10"
          trend="+4%"
        />
        <MetricCard
          label="Pending Check-ins"
          value={metrics.pendingCI}
          sub="Arriving today"
          icon={<Calendar className="text-amber-600 dark:text-amber-400 font-bold" />}
          accent="bg-amber-50 dark:bg-amber-500/10"
        />
        <MetricCard
          label="Housekeeping"
          value={metrics.hk}
          sub="Units marked dirty"
          icon={<Brush className="text-blue-600 dark:text-blue-400" />}
          accent="bg-blue-50 dark:bg-blue-500/10"
        />
      </div>

      {/* ── Search & Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by unit number or guest name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter by Status */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap shadow-sm',
              statusFilter.length > 0
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-background border-border text-muted-foreground hover:border-muted-foreground/50'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter by Status
            {statusFilter.length > 0 && (
              <span className="bg-white/20 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {statusFilter.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border overflow-hidden shadow-2xl z-20 bg-card"
              >
                <div className="px-3 py-2.5 border-b border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filter by Status</p>
                </div>
                {ALL_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors"
                  >
                    <div className={cn('w-4 h-4 rounded flex items-center justify-center border transition-colors', statusFilter.includes(s) ? 'bg-primary border-primary' : 'border-border')}>
                      {statusFilter.includes(s) && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_CONFIG[s].dot)} />
                    <span className="text-foreground text-xs font-medium">{STATUS_CONFIG[s].label}</span>
                  </button>
                ))}
                {statusFilter.length > 0 && (
                  <button onClick={() => setStatusFilter([])} className="w-full px-4 py-2.5 text-xs text-slate-400 hover:text-white border-t border-slate-700 transition-colors text-center">
                    Clear filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="rounded-xl border border-border overflow-hidden shadow-sm bg-card">
        {/* Table header */}
        <div
          className="grid grid-cols-[1fr_90px_160px_140px_150px_40px] items-center px-4 py-3 border-b border-border gap-3 bg-muted/30"
        >
          {['Unit Name', 'Type', 'Status', 'Guest Name', 'Next Availability', ''].map(h => (
            <span key={h} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm bg-[#0f172a]">
            No units match your search or filter.
          </div>
        ) : (
          filtered.map((unit, i) => (
            <motion.button
              key={unit.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedUnit(unit)}
              className={cn(
                "w-full grid grid-cols-[1fr_90px_160px_140px_150px_40px] items-center px-4 py-3.5 gap-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors text-left group"
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors">{unit.unitNumber}</p>
                <p className="text-[10px] text-muted-foreground uppercase mt-0.5 tracking-tight">{unit.id}</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{unit.type}</span>
              <div><StatusBadge status={unit.status} /></div>
              <span className={cn('text-sm font-medium truncate', unit.guestName === '—' ? 'text-muted-foreground/50 italic' : 'text-foreground')}>
                {unit.guestName}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {unit.checkOut
                  ? `Free ${format(new Date(unit.checkOut), 'MMM d')}`
                  : unit.status === 'available' ? 'Now' : '—'}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </motion.button>
          ))
        )}
      </div>

      {/* Row count footer */}
      <p className="text-xs text-slate-600 text-right">
        Showing {filtered.length} of {unitRows.length} units
      </p>

      {/* ── Slide-over panel + backdrop ── */}
      <AnimatePresence>
        {selectedUnit && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedUnit(null)}
            />
            <SlideOver
              unit={selectedUnit}
              onClose={() => setSelectedUnit(null)}
              onStatusChange={handleStatusChange}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
