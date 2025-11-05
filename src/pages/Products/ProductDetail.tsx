import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ShoppingCart, Store, Tag, Minus, Plus, Image as ImageIcon } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shops (
            id,
            nom_boutique,
            logo_url,
            vendeur_id
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Add to cart mutation (creates an order)
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !product) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          acheteur_id: user.id,
          vendeur_id: product.vendeur_id,
          produit_id: product.id,
          quantite: quantity,
          montant: parseFloat(String(product.prix)) * quantity,
          statut: 'en_attente_paiement',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: '🛒 Ajouté au panier',
        description: `${quantity} article(s) ajouté(s) avec succès`,
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/panier');
    },
    onError: (error: any) => {
      if (error.message === 'User not authenticated') {
        toast({
          title: 'Connexion requise',
          description: 'Veuillez vous connecter pour ajouter des produits au panier',
          variant: 'destructive',
        });
        navigate('/connexion');
      } else {
        toast({
          title: 'Erreur',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Store className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Produit non trouvé</h2>
                <Button onClick={() => navigate('/boutiques')}>
                  Retour aux boutiques
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images.map(String) : [];
  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
            {/* Image Gallery - Left Side */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Thumbnail List - Vertical on desktop */}
              {images.length > 1 && (
                <div className="flex lg:flex-col gap-2 order-2 lg:order-1 overflow-x-auto lg:overflow-y-auto max-h-[500px]">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.nom} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Main Image */}
              <Card className="overflow-hidden order-1 lg:order-2 w-full lg:w-[500px]">
                <CardContent className="p-0">
                  {hasImages ? (
                    <div className="aspect-square relative bg-muted">
                      <img
                        src={images[selectedImage]}
                        alt={product.nom}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-muted">
                      <ImageIcon className="h-24 w-24 text-muted-foreground/30" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Product Info - Right Side */}
            <div className="space-y-6">
              {/* Title and Category */}
              <div className="space-y-2">
                <h1 className="text-2xl lg:text-3xl font-bold leading-tight">{product.nom}</h1>
                {product.categorie && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm">{product.categorie}</span>
                  </div>
                )}
              </div>

              {/* Price Section */}
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-primary">
                        {parseFloat(String(product.prix)).toLocaleString()} FCFA
                      </span>
                      <Badge variant={product.statut === 'actif' ? 'default' : 'secondary'}>
                        {product.statut}
                      </Badge>
                    </div>
                    
                    {/* Quantity selector */}
                    {product.stock > 0 && (
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <span className="text-sm font-medium min-w-fit">Quantité:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => handleQuantityChange(1)}
                            disabled={quantity >= product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {product.stock > 0 && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={() => addToCartMutation.mutate()}
                    disabled={addToCartMutation.isPending || product.stock === 0}
                  >
                    {addToCartMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Ajout en cours...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Ajouter au panier
                      </>
                    )}
                  </Button>
                </div>
              )}

              {product.stock === 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4">
                    <p className="text-center text-destructive font-medium">
                      Produit en rupture de stock
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Shop info */}
              {product.shops && (
                <Card className="bg-muted/50 border-2">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">Vendu par</p>
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/boutique/${product.shops.id}`)}
                    >
                      {product.shops.logo_url ? (
                        <img
                          src={product.shops.logo_url}
                          alt={product.shops.nom_boutique}
                          className="w-12 h-12 rounded-full object-cover border-2"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2">
                          <Store className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{product.shops.nom_boutique}</p>
                        <p className="text-sm text-muted-foreground">Voir la boutique →</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {product.description && (
                <Card>
                  <CardContent className="p-6 space-y-3">
                    <h2 className="text-xl font-semibold">Description du produit</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
