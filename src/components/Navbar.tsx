import { Link, useLocation } from 'react-router-dom';
import { Building2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHost = location.pathname.startsWith('/host');

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-secondary" />
            <span className="font-display text-xl font-bold tracking-tight">RR Twins</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Properties</Link>
            <Link to="/host/login">
              <Button variant="outline" size="sm">Host Dashboard</Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-card px-4 py-4 space-y-3">
          <Link to="/" onClick={() => setOpen(false)} className="block text-sm font-medium">Properties</Link>
          <Link to="/host/login" onClick={() => setOpen(false)} className="block text-sm font-medium">Host Dashboard</Link>
        </div>
      )}
    </nav>
  );
}
