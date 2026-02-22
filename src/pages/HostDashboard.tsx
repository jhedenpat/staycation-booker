import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/context/BookingContext';
import { properties } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { LogOut, CalendarDays, Users, Building2 } from 'lucide-react';

export default function HostDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const { bookings, updateBookingStatus } = useBookings();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/host/login', { replace: true });
    return null;
  }

  const sorted = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const pending = bookings.filter(b => b.status === 'pending').length;

  const getPropertyName = (id: string) => properties.find(p => p.id === id)?.name ?? id;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your staycation bookings</p>
          </div>
          <Button variant="outline" onClick={() => { logout(); navigate('/host/login'); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: CalendarDays, color: 'text-secondary' },
            { label: 'Confirmed', value: confirmed, icon: Users, color: 'text-success' },
            { label: 'Properties', value: 9, icon: Building2, color: 'text-foreground' },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-xl p-5 border shadow-sm">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-display text-lg font-semibold">All Bookings</h2>
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
      </div>
    </div>
  );
}
