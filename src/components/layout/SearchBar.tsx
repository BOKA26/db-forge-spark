import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const SearchBar = ({ className }: { className?: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Popular searches
  const popularSearches = ['Mode', 'Électronique', 'Maison', 'Beauté', 'Alimentation'];

  // Fetch product suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, nom, prix, categorie, images')
        .eq('statut', 'actif')
        .ilike('nom', `%${searchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length >= 2,
  });

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/produits?q=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    navigate(`/produit/${productId}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/produits?categorie=${encodeURIComponent(category)}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher des produits..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 h-11"
        />
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl z-50 max-h-[400px] overflow-y-auto">
          {searchTerm.length < 2 ? (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Recherches populaires</span>
              </div>
              <div className="space-y-1">
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleCategoryClick(search)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-lg transition-colors text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 mb-1 text-xs font-medium text-muted-foreground">
                <Package className="w-3.5 h-3.5" />
                <span>Produits suggérés</span>
              </div>
              {suggestions.map((product) => {
                const images = product.images as string[] | null;
                const imageUrl = images && images.length > 0 ? images[0] : '/placeholder.svg';
                
                return (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                  >
                    <img
                      src={imageUrl}
                      alt={product.nom}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {product.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.categorie}</p>
                    </div>
                    <p className="text-sm font-bold text-primary whitespace-nowrap">
                      {product.prix.toLocaleString()} FCFA
                    </p>
                  </button>
                );
              })}
            </div>
          ) : searchTerm.length >= 2 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Aucun produit trouvé pour "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
