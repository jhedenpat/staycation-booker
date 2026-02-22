import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function HostLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/host/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/host/dashboard');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Host Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your bookings</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border shadow-sm space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="host@rrtwins.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Lock className="h-4 w-4 mr-2" /> Sign In
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Demo: host@rrtwins.com / admin123
        </p>
      </div>
    </div>
  );
}
