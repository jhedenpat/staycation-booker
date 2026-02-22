import { properties } from '@/data/properties';
import PropertyCard from '@/components/PropertyCard';
import heroImg from '@/assets/hero-staycation.jpg';
import { Search } from 'lucide-react';
import { useState } from 'react';

const Index = () => {
  const [search, setSearch] = useState('');
  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img src={heroImg} alt="Staycation hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative z-10 text-center px-4 max-w-2xl">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Your MOA <span className="text-gradient">Staycation</span> Awaits
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Book directly. Skip the fees. 9 premium units at Mall of Asia.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search units..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-card/90 backdrop-blur border text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-display text-2xl font-bold mb-8">Available Units</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No units found matching your search.</p>
        )}
      </section>
    </div>
  );
};

export default Index;
