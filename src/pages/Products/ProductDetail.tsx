import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Store, Package, ChevronLeft, ChevronRight, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { InquiryDialog } from "@/components/products/InquiryDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter au panier");
        navigate("/login");
        return;
      }

      if (!product) return;

      const { error } = await supabase
        .from("orders")
        .insert({
          acheteur_id: user.id,
          vendeur_id: product.vendeur_id,
          produit_id: product.id,
          quantite: 1,
          montant: product.prix,
          statut: "en_attente_paiement",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produit ajouté au panier !");
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout au panier");
    },
  });

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          shops (
            id,
            nom_boutique,
            logo_url,
            vendeur_id,
            description
          ),
          users!products_vendeur_id_fkey (
            nom,
            entreprise
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Fetch similar products
  const { data: similarProducts } = useQuery({
    queryKey: ["similar-products", product?.categorie],
    queryFn: async () => {
      if (!product?.categorie) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("categorie", product.categorie)
        .eq("statut", "actif")
        .neq("id", id)
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!product?.categorie,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center space-y-4">
              <h2 className="text-2xl font-semibold">Produit non trouvé</h2>
              <Button onClick={() => navigate("/produits")}>
                Retour aux produits
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const images = Array.isArray(product.images) 
    ? product.images.map(String)
    : typeof product.images === 'string'
    ? [product.images]
    : ["/placeholder.svg"];

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 
    ? product.sizes.map(String)
    : ["S", "M", "L", "XL", "2XL", "3XL"];
    
  const colors = Array.isArray(product.colors) && product.colors.length > 0 
    ? product.colors.map(String)
    : images;
    
  const customizationOptions = Array.isArray(product.customization_options) && product.customization_options.length > 0
    ? product.customization_options 
    : [
        { name: "Logo personnalisé", minOrder: 100 },
        { name: "Emballage personnalisé", minOrder: 300 },
        { name: "Graphique personnalisé", minOrder: 100 }
      ];

  const priceTiers = [
    { range: "5 - 49 pièces", price: product.price_tier_1 || product.prix },
    { range: "50 - 299 pièces", price: product.price_tier_2 || product.prix * 0.95 },
    { range: "300 - 99999 pièces", price: product.price_tier_3 || product.prix * 0.85 },
    { range: "≥ 100000 pièces", price: product.price_tier_4 || product.prix * 0.75 },
  ];

  const supplierName = product.users?.nom || product.users?.entreprise || "Fournisseur";
  const inStock = (product.stock || 0) > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container py-8">
          {/* Breadcrumb */}
          <div className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link to="/" className="hover:text-primary">Accueil</Link>
            {" > "}
            <Link to={`/produits?categorie=${product.categorie}`} className="hover:text-primary">
              {product.categorie}
            </Link>
            {" > "}
            <span className="text-foreground truncate inline-block max-w-[150px] md:max-w-none align-bottom">{product.nom}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 md:gap-8">
            {/* Image Gallery - Left Side */}
            <div className="flex flex-col lg:flex-row gap-2 md:gap-4">
              {/* Thumbnail List - Horizontal on mobile, Vertical on desktop */}
              {images.length > 1 && (
                <div className="flex lg:flex-col gap-2 order-2 lg:order-1 overflow-x-auto lg:overflow-y-auto max-h-[500px] pb-2 lg:pb-0">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-md lg:rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.nom} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <Card className="overflow-hidden order-1 lg:order-2 w-full lg:w-[500px]">
                <CardContent className="p-0 relative group">
                  <div className="aspect-square">
                    <img
                      src={images[selectedImage]}
                      alt={product.nom}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {/* Favorite Button */}
                  <button className="absolute top-4 right-4 bg-background/80 hover:bg-background p-2 rounded-full">
                    <Heart className="h-5 w-5" />
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Product Info - Right Side */}
            <div className="space-y-4 md:space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2 leading-tight">{product.nom}</h1>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Pas d'avis pour le moment
                </div>
              </div>

              {/* Supplier Info */}
              <Card className="bg-muted/30 border-none">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Store className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm md:text-base truncate">{supplierName}</div>
                      <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-1 md:gap-2">
                        <span className="text-base md:text-lg">🌍</span>
                        <span>{product.origin_country || "CI"}</span>
                        <span className="text-muted-foreground/60">• 6 ans</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs: Wholesale & Customization */}
              <Tabs defaultValue="wholesale" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-10 md:h-12">
                  <TabsTrigger value="wholesale" className="text-xs md:text-base">Wholesale</TabsTrigger>
                  <TabsTrigger value="customization" className="text-xs md:text-base">Customization</TabsTrigger>
                </TabsList>
                
                <TabsContent value="wholesale" className="mt-3 md:mt-6">
                  <Card className="border-2">
                    <CardContent className="p-3 md:p-6 space-y-4 md:space-y-6">
                      {/* Price Tiers */}
                      <div className="grid grid-cols-3 gap-2 md:gap-4">
                        {priceTiers.slice(0, 3).map((tier, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-[10px] md:text-xs lg:text-sm text-muted-foreground mb-1 leading-tight">{tier.range}</div>
                            <div className="text-sm md:text-xl lg:text-2xl font-bold text-primary">
                              ${parseFloat(String(tier.price)).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* 4th tier - highlighted */}
                      <div className="pt-3 md:pt-6 border-t">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs md:text-sm text-muted-foreground leading-tight">{priceTiers[3].range}</span>
                          <span className="text-xl md:text-3xl lg:text-4xl font-bold text-primary">
                            ${parseFloat(String(priceTiers[3].price)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Sample Price */}
                      {product.sample_price && (
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between pt-3 md:pt-6 border-t">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            <span className="text-xs md:text-sm font-medium">Prix échantillon:</span>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-3">
                            <span className="text-base md:text-lg font-bold">${parseFloat(String(product.sample_price)).toFixed(2)}</span>
                            <Button variant="outline" size="sm" className="text-xs">Obtenir échantillon</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="customization" className="mt-3 md:mt-6">
                  <Card className="border-2">
                    <CardHeader className="p-3 md:p-6">
                      <CardTitle className="text-base md:text-xl">Options de personnalisation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6 pt-0">
                      {customizationOptions.map((option: any, idx: number) => (
                        <div key={idx} className="flex flex-col md:flex-row md:items-start md:justify-between py-2 md:py-3 border-b last:border-0 gap-1 md:gap-4">
                          <div className="flex items-start gap-2 md:gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary mt-1 md:mt-2 flex-shrink-0"></div>
                            <span className="font-medium text-sm md:text-base">{option.name}</span>
                          </div>
                          <span className="text-xs md:text-sm text-muted-foreground ml-5 md:ml-0 md:whitespace-nowrap">
                            (Min. commande: {option.minOrder} pièces)
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Variations */}
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-bold">Variations</h3>
                  <button className="text-xs md:text-sm text-primary hover:underline font-medium">
                    Sélectionner maintenant
                  </button>
                </div>
                
                {/* Color Selection */}
                <div>
                  <div className="mb-2 md:mb-3">
                    <span className="text-xs md:text-sm font-semibold">Couleur: {selectedColor + 1}</span>
                  </div>
                  <div className="flex gap-2 md:gap-3 flex-wrap">
                    {colors.slice(0, 6).map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedColor(idx);
                          if (idx < images.length) setSelectedImage(idx);
                        }}
                        className={`h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-md md:rounded-lg overflow-hidden border-2 transition-all ${
                          selectedColor === idx 
                            ? "border-primary ring-2 ring-primary/20 scale-105" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img 
                          src={typeof color === 'string' ? color : images[0]} 
                          alt={`Couleur ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {colors.length > 6 && (
                      <button className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-md md:rounded-lg border-2 border-dashed border-border flex items-center justify-center text-xs md:text-sm font-semibold hover:border-primary transition-colors">
                        +{colors.length - 6}
                      </button>
                    )}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <div className="mb-2 md:mb-3">
                    <span className="text-xs md:text-sm font-semibold">Taille</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 md:px-5 md:py-2.5 rounded-md border-2 font-medium text-sm md:text-base transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50 hover:bg-accent"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-3 pt-3 md:pt-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white h-11 md:h-12 text-sm md:text-base font-semibold"
                  onClick={() => setInquiryOpen(true)}
                  disabled={!inStock}
                >
                  Envoyer une demande
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1 h-11 md:h-12 text-sm md:text-base font-semibold border-2"
                  disabled={!inStock || addToCartMutation.isPending}
                  onClick={() => addToCartMutation.mutate()}
                >
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Ajouter au panier
                </Button>
              </div>

              {!inStock && (
                <div className="text-center py-3 md:py-4 bg-destructive/10 rounded-lg border-2 border-destructive/20">
                  <p className="text-destructive font-semibold text-sm md:text-base">Produit épuisé</p>
                </div>
              )}

              {/* Shop Card */}
              {product.shops && (
                <Card className="bg-gradient-to-br from-muted/50 to-background border-2">
                  <CardHeader className="p-3 md:p-6 pb-3 md:pb-4">
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <Store className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      Boutique
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6 pt-0">
                    <div className="flex items-center gap-3 md:gap-4">
                      {product.shops.logo_url && (
                        <img 
                          src={product.shops.logo_url} 
                          alt={product.shops.nom_boutique}
                          className="h-12 w-12 md:h-16 md:w-16 rounded-md md:rounded-lg object-cover border-2 border-border flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm md:text-lg truncate">{product.shops.nom_boutique}</h3>
                        {product.shops.description && (
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-0.5 md:mt-1">
                            {product.shops.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link to={`/boutique/${product.shops.id}`}>
                      <Button variant="outline" className="w-full border-2 font-semibold text-sm md:text-base h-9 md:h-10">
                        Voir la boutique
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Product Spotlight / Description */}
          <Card className="mt-6 md:mt-12">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <div className="h-5 md:h-6 w-0.5 md:w-1 bg-[#FF6B35] rounded-full"></div>
                <CardTitle className="text-lg md:text-2xl">Product spotlights</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-sm md:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                {product.description || "Aucune description disponible pour ce produit."}
              </p>
            </CardContent>
          </Card>

          {/* Similar Products */}
          {similarProducts && similarProducts.length > 0 && (
            <div className="mt-8 md:mt-16">
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <h2 className="text-lg md:text-2xl font-bold">Produits similaires</h2>
                <Link to={`/produits?categorie=${product.categorie}`}>
                  <Button variant="outline" className="border-2 font-semibold text-xs md:text-base h-8 md:h-10 px-3 md:px-4">
                    Voir tout
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {similarProducts.map((similarProduct) => {
                  const productImages = Array.isArray(similarProduct.images) 
                    ? similarProduct.images.map(String)
                    : typeof similarProduct.images === 'string'
                    ? [similarProduct.images]
                    : ["/placeholder.svg"];
                  
                  return (
                    <Link key={similarProduct.id} to={`/produit/${similarProduct.id}`}>
                      <Card className="hover:shadow-xl transition-all hover:-translate-y-1 md:hover:-translate-y-2 duration-300 h-full overflow-hidden">
                        <CardContent className="p-0">
                          <div className="aspect-square bg-muted overflow-hidden">
                            <img 
                              src={productImages[0]} 
                              alt={similarProduct.nom}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-2 md:p-4">
                            <h3 className="font-medium text-xs md:text-sm mb-1 md:mb-2 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
                              {similarProduct.nom}
                            </h3>
                            <p className="text-sm md:text-lg font-bold text-primary">
                              {parseFloat(String(similarProduct.prix)).toLocaleString()} FCFA
                            </p>
                            {similarProduct.price_tier_1 && (
                              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                                À partir de ${parseFloat(String(similarProduct.price_tier_1)).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Inquiry Dialog */}
      <InquiryDialog 
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        productId={id!}
        productName={product.nom}
      />
    </div>
  );
};

export default ProductDetail;
