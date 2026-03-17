import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/context/BookingContext';
import { useWaitlist } from '@/context/WaitlistContext';
import { properties } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, addDays, isBefore, isSameDay, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, differenceInDays } from 'date-fns';
import { LogOut, CalendarDays, Users, Building2, Zap, Bell, TrendingUp, ChevronRight, Home, CreditCard, Menu, X, LayoutGrid } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { findGaps } from '@/lib/pricing';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import UnitInventoryView from '@/components/UnitInventoryView';

export default function HostDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const { bookings, updateBookingStatus } = useBookings();
  const { entries: waitlistEntries } = useWaitlist();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'waitlist' | 'inventory'>('bookings');
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeTab, dateRange]);

  // Interactive Recharts Mock Data based on filter
  const revenueData = useMemo(() => {
    switch (dateRange) {
      case 'year':
        return [
          { name: 'Jan', revenue: 45000 }, { name: 'Feb', revenue: 52000 }, { name: 'Mar', revenue: 48000 },
          { name: 'Apr', revenue: 61000 }, { name: 'May', revenue: 59000 }, { name: 'Jun', revenue: 65000 },
          { name: 'Jul', revenue: 72000 }, { name: 'Aug', revenue: 75000 }, { name: 'Sep', revenue: 68000 },
          { name: 'Oct', revenue: 62000 }, { name: 'Nov', revenue: 54000 }, { name: 'Dec', revenue: 81000 }
        ];
      case 'quarter':
        return [
          { name: 'Week 1', revenue: 15000 }, { name: 'Week 2', revenue: 18000 }, { name: 'Week 3', revenue: 16500 },
          { name: 'Week 4', revenue: 19000 }, { name: 'Week 5', revenue: 21000 }, { name: 'Week 6', revenue: 20500 },
          { name: 'Week 7', revenue: 22000 }, { name: 'Week 8', revenue: 25000 }, { name: 'Week 9', revenue: 24000 },
          { name: 'Week 10', revenue: 26000 }, { name: 'Week 11', revenue: 28000 }, { name: 'Week 12', revenue: 31000 }
        ];
      case 'month':
      default:
        return [
          { name: '1st', revenue: 2500 }, { name: '4th', revenue: 3200 }, { name: '7th', revenue: 2800 },
          { name: '10th', revenue: 4100 }, { name: '13th', revenue: 3900 }, { name: '16th', revenue: 4500 },
          { name: '19th', revenue: 5200 }, { name: '22nd', revenue: 5500 }, { name: '25th', revenue: 4800 },
          { name: '28th', revenue: 6200 }, { name: '31st', revenue: 5400 }
        ];
    }
  }, [dateRange]);

  // Gap detection across all properties
  const allGaps = useMemo(() => {
    const gaps: { propertyId: string; propertyName: string; date: Date }[] = [];
    properties.forEach(p => {
      const propertyGaps = findGaps(bookings, p.id);
      propertyGaps.forEach(g => {
        gaps.push({ propertyId: p.id, propertyName: p.name, date: g.date });
      });
    });
    return gaps;
  }, [bookings]);

  if (!isAuthenticated) {
    return <Navigate to="/host/login" replace />;
  }

  const sorted = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + b.totalPrice, 0);
  const occupiedNights = bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + differenceInDays(new Date(b.checkOut), new Date(b.checkIn)), 0);
  const occupancyRate = properties.length ? Math.min(100, Math.round((occupiedNights / (properties.length * 30)) * 100)) : 0;

  const getPropertyName = (id: string) => properties.find(p => p.id === id)?.name ?? id;

  // Multi-calendar data
  const today = new Date();
  const calendarStart = startOfMonth(today);
  const calendarEnd = endOfMonth(addMonths(today, 1));
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getBookingForDay = (propertyId: string, day: Date) => {
    return bookings.find(b =>
      b.propertyId === propertyId &&
      b.status !== 'cancelled' &&
      new Date(b.checkIn) <= day &&
      new Date(b.checkOut) > day
    );
  };


  return (
    <div className="min-h-screen bg-muted/20">
      {/* Breadcrumbs & Mobile Header */}
      <div className="bg-background border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[60px]">
          <div className="flex items-center text-sm text-muted-foreground w-full truncate">
            <Home className="h-4 w-4 mr-2 shrink-0 hidden sm:block" />
            <span className="hidden sm:block shrink-0">Staycation Booker</span>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0 hidden sm:block" />
            <span className="text-foreground font-medium shrink-0">Host Dashboard</span>
            <ChevronRight className="h-4 w-4 mx-1 opacity-50 shrink-0" />
            <span className="text-foreground capitalize truncate">{activeTab === 'calendar' ? 'Multi-Calendar' : activeTab}</span>
          </div>
          
          <button 
            className="lg:hidden p-2 -mr-2 min-w-[40px] flex items-center justify-center text-slate-500 hover:text-slate-900 bg-slate-50 rounded-md shrink-0 border border-border/50 shadow-sm transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 relative">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Sidebar Drawer */}
          <div className={cn(
            "lg:w-64 shrink-0 lg:block space-y-6 lg:static absolute top-2 left-4 right-4 z-40 bg-background lg:bg-transparent p-6 lg:p-0 rounded-xl lg:rounded-none border lg:border-none shadow-xl lg:shadow-none transition-all duration-300",
            isMobileMenuOpen ? "block" : "hidden"
          )}>
            <div>
              <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
              <p className="text-sm text-muted-foreground mb-6">Manage properties</p>
            </div>

            <nav className="flex flex-col gap-2">
              {(['bookings', 'calendar', 'waitlist', 'inventory'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                    activeTab === tab 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === 'bookings' && <CalendarDays className="h-4 w-4" />}
                  {tab === 'calendar' && <Building2 className="h-4 w-4" />}
                  {tab === 'waitlist' && <Bell className="h-4 w-4" />}
                  {tab === 'inventory' && <LayoutGrid className="h-4 w-4" />}
                  <span className="capitalize">{tab === 'calendar' ? 'Multi-Calendar' : tab === 'inventory' ? 'Unit Inventory' : tab}</span>
                </button>
              ))}
            </nav>

            <Button variant="outline" className="w-full justify-start mt-6 text-slate-600 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors" onClick={() => { logout(); navigate('/host/login'); }}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>

          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-12 sm:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ── Unit Inventory Tab ── */}
            {activeTab === 'inventory' && (
              <div className="space-y-2">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Unit Inventory</h2>
                  <p className="text-sm text-muted-foreground mt-1">Real-time status of all managed units</p>
                </div>
                <UnitInventoryView bookings={bookings} />
              </div>
            )}

            {/* SaaS Metrics Row */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center sm:hidden mb-4">
                  <h2 className="font-display text-lg font-semibold">Overview</h2>
                  <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="border border-border bg-background rounded-md text-sm py-1.5 px-3 focus:ring-1 focus:ring-ring"
                  >
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                  <div className="bg-card rounded-xl p-5 border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CreditCard className="w-16 h-16"/></div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Total Revenue</p>
                    {isLoading ? (
                      <div className="space-y-2 mt-2">
                        <div className="h-8 bg-muted rounded animate-pulse w-1/2"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold font-display">₱{totalRevenue.toLocaleString()}</p>
                        <div className="mt-2 flex items-center text-xs text-success font-medium">
                          <TrendingUp className="h-3 w-3 mr-1"/>
                          <span>+12% from last month</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="bg-card rounded-xl p-5 border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Building2 className="w-16 h-16"/></div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Occupancy Rate</p>
                    {isLoading ? (
                      <div className="space-y-2 mt-2">
                        <div className="h-8 bg-muted rounded animate-pulse w-1/2"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold font-display">{occupancyRate}%</p>
                        <div className="mt-2 flex items-center text-xs text-success font-medium">
                          <TrendingUp className="h-3 w-3 mr-1"/>
                          <span>+5% from last month</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-card rounded-xl p-5 border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users className="w-16 h-16"/></div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Confirmed Bookings</p>
                    {isLoading ? (
                      <div className="space-y-2 mt-2">
                        <div className="h-8 bg-muted rounded animate-pulse w-1/3"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold font-display">{confirmed}</p>
                        <div className="mt-2 flex items-center text-xs text-muted-foreground font-medium">
                          <span>{sorted.length - confirmed} pending actions</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-card rounded-xl p-5 border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap className="w-16 h-16"/></div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Gap Alerts</p>
                    {isLoading ? (
                      <div className="space-y-2 mt-2">
                        <div className="h-8 bg-muted rounded animate-pulse w-1/3"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold font-display">{allGaps.length}</p>
                        <div className="mt-2 flex items-center text-xs text-destructive font-medium">
                          <Zap className="h-3 w-3 mr-1"/>
                          <span>Action required</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Analytical Chart Row */}
                <div className="bg-card rounded-xl border shadow-sm p-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-display text-lg font-semibold">Revenue Overview</h3>
                      <p className="text-sm text-muted-foreground">Performance across your portfolio</p>
                    </div>
                    <div className="hidden sm:block">
                      <select 
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="border border-border bg-background rounded-md text-sm py-1.5 px-3 focus:ring-1 focus:ring-ring focus:outline-none"
                      >
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">Last Year</option>
                      </select>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    {isLoading ? (
                      <div className="w-full h-full bg-muted/40 rounded-lg animate-pulse" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="name" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => `₱${value >= 1000 ? (value / 1000) + 'k' : value}`}
                        />
                        <Tooltip 
                          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                          labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#1E3A8A" 
                          strokeWidth={3} 
                          dot={{ r: 0 }} 
                          activeDot={{ r: 6, fill: '#1E3A8A', stroke: 'hsl(var(--card))', strokeWidth: 2 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">All Bookings</h2>
              {allGaps.length > 0 && (
                <Badge variant="outline" className="gap-1 text-destructive border-destructive/30">
                  <Zap className="h-3 w-3" /> {allGaps.length} gap{allGaps.length > 1 ? 's' : ''} detected
                </Badge>
              )}
            </div>

            {sorted.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No bookings yet. Guests will appear here once they book.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-6 py-3 font-medium">Booking ID</th>
                      <th className="text-left px-6 py-3 font-medium">Guest</th>
                      <th className="text-left px-6 py-3 font-medium">Unit</th>
                      <th className="text-left px-6 py-3 font-medium">Dates</th>
                      <th className="text-left px-6 py-3 font-medium">Total</th>
                      <th className="text-left px-6 py-3 font-medium">Status</th>
                      <th className="text-left px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(b => (
                      <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{b.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{b.guestName}</p>
                          <p className="text-xs text-muted-foreground">{b.guestEmail}</p>
                        </td>
                        <td className="px-6 py-4">{getPropertyName(b.propertyId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {format(new Date(b.checkIn), 'MMM d')} – {format(new Date(b.checkOut), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 font-medium">₱{b.totalPrice.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <Badge variant={b.status === 'confirmed' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'secondary'}>
                            {b.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {b.status === 'confirmed' && (
                            <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, 'cancelled')}>
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Multi-Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-display text-lg font-semibold">Unit Availability — {format(calendarStart, 'MMM yyyy')} to {format(calendarEnd, 'MMM yyyy')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-3 py-2 font-medium sticky left-0 bg-muted/50 min-w-[140px]">Unit</th>
                    {allDays.map(day => (
                      <th key={day.toISOString()} className={cn(
                        "px-1 py-2 font-medium text-center min-w-[28px]",
                        isSameDay(day, today) && "bg-secondary/20"
                      )}>
                        <div>{format(day, 'd')}</div>
                        <div className="text-[10px] text-muted-foreground">{format(day, 'EEE')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {properties.map(p => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium sticky left-0 bg-card whitespace-nowrap">{p.name}</td>
                      {allDays.map(day => {
                        const booking = getBookingForDay(p.id, day);
                        const isGap = allGaps.some(g => g.propertyId === p.id && isSameDay(g.date, day));
                        return (
                          <td key={day.toISOString()} className={cn(
                            "px-1 py-2 text-center",
                            booking && "bg-secondary/30",
                            isGap && "bg-destructive/20",
                            isSameDay(day, today) && "ring-1 ring-inset ring-secondary/50"
                          )}>
                            {booking && <div className="w-2 h-2 rounded-full bg-secondary mx-auto" />}
                            {isGap && <Zap className="h-3 w-3 text-destructive mx-auto" />}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {allGaps.length > 0 && (
              <div className="px-6 py-4 border-t bg-muted/30">
                <p className="text-sm font-medium mb-2 flex items-center gap-1"><Zap className="h-4 w-4 text-destructive" /> Gap Filler Opportunities</p>
                <div className="flex flex-wrap gap-2">
                  {allGaps.map((g, i) => (
                    <Badge key={i} variant="outline" className="gap-1 text-destructive border-destructive/30">
                      {g.propertyName} — {format(g.date, 'MMM d')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-display text-lg font-semibold">Waitlist Entries</h2>
            </div>
            {waitlistEntries.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No waitlist entries yet. Guests can join when dates are unavailable.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-6 py-3 font-medium">ID</th>
                      <th className="text-left px-6 py-3 font-medium">Guest</th>
                      <th className="text-left px-6 py-3 font-medium">Unit</th>
                      <th className="text-left px-6 py-3 font-medium">Desired Dates</th>
                      <th className="text-left px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistEntries.map(e => (
                      <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{e.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{e.guestName}</p>
                          <p className="text-xs text-muted-foreground">{e.guestEmail}</p>
                        </td>
                        <td className="px-6 py-4">{getPropertyName(e.propertyId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {format(new Date(e.desiredCheckIn), 'MMM d')} – {format(new Date(e.desiredCheckOut), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={e.notified ? 'default' : 'secondary'}>
                            {e.notified ? 'Notified' : 'Waiting'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
