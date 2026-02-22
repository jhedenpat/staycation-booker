import { Link } from 'react-router-dom';
import { Property } from '@/types/booking';
import { Users, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import unitPreview from '@/assets/unit-preview.jpg';

interface Props {
  property: Property;
}

export default function PropertyCard({ property }: Props) {
  return (
    <Link to={`/property/${property.id}`} className="group block">
      <div className="rounded-xl overflow-hidden bg-card border shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={unitPreview}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">{property.name}</h3>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />{property.maxGuests} pax
            </Badge>
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> MOA Complex · {property.floor}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
          <p className="font-semibold text-secondary">₱{property.pricePerNight.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/ night</span></p>
        </div>
      </div>
    </Link>
  );
}
