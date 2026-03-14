import { useNavigate } from 'react-router-dom';
import { Property } from '@/types/booking';
import { Users, MapPin, Star, Wifi, Maximize2, CheckCircle2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import unitPreview from '@/assets/unit-preview.jpg';
import { useState } from 'react';


interface Props {
  property: Property;
  isFeaturedBento?: boolean;
}

export default function PropertyCard({ property, isFeaturedBento }: Props) {
  const navigate = useNavigate();
  const [showQuickLook, setShowQuickLook] = useState(false);

  return (
    <div className={`group rounded-[12px] overflow-hidden bg-white dark:bg-card border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 h-full flex flex-col ${isFeaturedBento ? 'md:col-span-2 lg:row-span-2 md:flex-row' : ''}`}>
      
      {/* Image Container */}
      <div className={`overflow-hidden relative ${isFeaturedBento ? 'md:w-3/5 min-h-[280px] md:min-h-[400px]' : 'aspect-[4/3] w-full'}`}>
        <img
          src={property.gallery?.[0] ?? unitPreview}
          alt={property.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Top Right Overlays */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
          <Badge className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white border-none shadow-sm px-2 py-1 text-[10px] font-bold">
            ₱{property.pricePerNight.toLocaleString()} <span className="font-normal opacity-70">/ night</span>
          </Badge>
          <div className="bg-emerald-500/90 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
          </div>
        </div>

        {/* Quick Look Overlay (Visible on Hover) */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Dialog open={showQuickLook} onOpenChange={setShowQuickLook}>
            <DialogTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-xl scale-90 group-hover:scale-100 transition-all duration-300 border-none">
                <Eye className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-2xl bg-white dark:bg-slate-950">
              <div className="grid grid-cols-1 md:grid-cols-2 h-[400px]">
                <img 
                  src={property.gallery?.[0] ?? unitPreview} 
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                       <span className="text-sm font-bold">{property.rating ?? '4.8'}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{property.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300 line-clamp-4 leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                  <Button onClick={() => navigate(`/property/${property.id}`)} className="w-full bg-primary text-white font-bold py-6 rounded-xl shadow-lg shadow-primary/20">
                    Book Now for ₱{property.pricePerNight.toLocaleString()}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Content Container */}
      <div className={`flex flex-col flex-1 ${isFeaturedBento ? 'p-6 lg:p-10 justify-center' : 'p-5'}`}>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-display font-bold text-slate-900 dark:text-white transition-colors group-hover:text-primary ${isFeaturedBento ? 'text-2xl lg:text-3xl' : 'text-lg'}`}>
              {property.name}
            </h3>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">{property.rating ?? '4.8'}</span>
            </div>
          </div>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 italic">
            "{property.bestFeature ?? 'Premium experience with a view'}"
          </p>
        </div>
        
        {/* Quick Icons */}
        <div className="flex items-center gap-6 my-4 border-y border-slate-100 dark:border-slate-800/50 py-3">
          <div className="flex flex-col items-center gap-1 flex-1">
            <Maximize2 className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{property.sqft ?? '32'} sqm</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 border-x border-slate-100 dark:border-slate-800/50">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{property.maxGuests} Guests</span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <Wifi className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{property.wifi ?? '100Mbps'}</span>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Button 
            onClick={() => navigate(`/property/${property.id}`)}
            className="w-full bg-slate-900 dark:bg-primary text-white font-bold py-6 rounded-xl hover:scale-[1.02] transition-transform shadow-md shadow-primary/10"
          >
            Book Now
          </Button>
        </div>
      </div>

    </div>
  );
}
