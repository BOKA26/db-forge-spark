import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Store, Package, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { InquiryDialog } from "@/components/products/InquiryDialog";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);

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
          <div className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Accueil</Link>
            {" > "}
            <Link to={`/produits?categorie=${product.categorie}`} className="hover:text-primary">
              {product.categorie}
            </Link>
            {" > "}
            <span className="text-foreground">{product.nom}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
            {/* Image Gallery - Left Side */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Thumbnail List - Vertical on desktop */}
              {images.length > 1 && (
                <div className="flex lg:flex-col gap-2 order-2 lg:order-1 overflow-x-auto lg:overflow-y-auto max-h-[500px]">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
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
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">{product.nom}</h1>
                <div className="text-sm text-muted-foreground">
                  Pas d'avis pour le moment
                </div>
              </div>

              {/* Supplier Info */}
              <Card className="bg-muted/30 border-none">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{supplierName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-lg">🌍</span>
                        <span>{product.origin_country || "CI"}</span>
                        <span className="text-muted-foreground/60">• 6 ans</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs: Wholesale & Customization */}
              <Tabs defaultValue="wholesale" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="wholesale" className="text-base">Wholesale</TabsTrigger>
                  <TabsTrigger value="customization" className="text-base">Customization</TabsTrigger>
                </TabsList>
                
                <TabsContent value="wholesale" className="mt-6">
                  <Card className="border-2">
                    <CardContent className="p-6 space-y-6">
                      {/* Price Tiers */}
                      <div className="grid grid-cols-3 gap-4">
                        {priceTiers.slice(0, 3).map((tier, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-xs lg:text-sm text-muted-foreground mb-1">{tier.range}</div>
                            <div className="text-xl lg:text-2xl font-bold text-primary">
                              ${parseFloat(String(tier.price)).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* 4th tier - highlighted */}
                      <div className="pt-6 border-t">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-muted-foreground">{priceTiers[3].range}</span>
                          <span className="text-3xl lg:text-4xl font-bold text-primary">
                            ${parseFloat(String(priceTiers[3].price)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Sample Price */}
                      {product.sample_price && (
                        <div className="flex items-center justify-between pt-6 border-t">
                          <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Prix échantillon:</span>
                          </div>
                          <span className="text-lg font-bold">${parseFloat(String(product.sample_price)).toFixed(2)}</span>
                          <Button variant="outline" size="sm">Obtenir échantillon</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="customization" className="mt-6">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-xl">Options de personnalisation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {customizationOptions.map((option: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between py-3 border-b last:border-0">
                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                            <span className="font-medium">{option.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                            (Min. commande: {option.minOrder} pièces)
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Variations */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Variations</h3>
                  <button className="text-sm text-primary hover:underline font-medium">
                    Sélectionner maintenant
                  </button>
                </div>
                
                {/* Color Selection */}
                <div>
                  <div className="mb-3">
                    <span className="text-sm font-semibold">Couleur: {selectedColor + 1}</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {colors.slice(0, 6).map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedColor(idx);
                          if (idx < images.length) setSelectedImage(idx);
                        }}
                        className={`h-14 w-14 lg:h-16 lg:w-16 rounded-lg overflow-hidden border-2 transition-all ${
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
                      <button className="h-14 w-14 lg:h-16 lg:w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-sm font-semibold hover:border-primary transition-colors">
                        +{colors.length - 6}
                      </button>
                    )}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <div className="mb-3">
                    <span className="text-sm font-semibold">Taille</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2.5 rounded-md border-2 font-medium transition-all ${
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
              <div className="flex gap-3 pt-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white h-12 text-base font-semibold"
                  onClick={() => setInquiryOpen(true)}
                  disabled={!inStock}
                >
                  Envoyer une demande
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1 h-12 text-base font-semibold border-2"
                  disabled={!inStock}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat maintenant
                </Button>
              </div>

              {!inStock && (
                <div className="text-center py-4 bg-destructive/10 rounded-lg border-2 border-destructive/20">
                  <p className="text-destructive font-semibold">Produit épuisé</p>
                </div>
              )}

              {/* Shop Card */}
              {product.shops && (
                <Card className="bg-gradient-to-br from-muted/50 to-background border-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      Boutique
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      {product.shops.logo_url && (
                        <img 
                          src={product.shops.logo_url} 
                          alt={product.shops.nom_boutique}
                          className="h-16 w-16 rounded-lg object-cover border-2 border-border"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{product.shops.nom_boutique}</h3>
                        {product.shops.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {product.shops.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link to={`/boutique/${product.shops.id}`}>
                      <Button variant="outline" className="w-full border-2 font-semibold">
                        Voir la boutique
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Product Spotlight / Description */}
          <Card className="mt-12">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-[#FF6B35] rounded-full"></div>
                <CardTitle className="text-2xl">Product spotlights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {product.description || "Aucune description disponible pour ce produit."}
              </p>
            </CardContent>
          </Card>

          {/* Similar Products */}
          {similarProducts && similarProducts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Produits similaires</h2>
                <Link to={`/produits?categorie=${product.categorie}`}>
                  <Button variant="outline" className="border-2 font-semibold">
                    Voir tout
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {similarProducts.map((similarProduct) => {
                  const productImages = Array.isArray(similarProduct.images) 
                    ? similarProduct.images.map(String)
                    : typeof similarProduct.images === 'string'
                    ? [similarProduct.images]
                    : ["/placeholder.svg"];
                  
                  return (
                    <Link key={similarProduct.id} to={`/produit/${similarProduct.id}`}>
                      <Card className="hover:shadow-xl transition-all hover:-translate-y-2 duration-300 h-full overflow-hidden">
                        <CardContent className="p-0">
                          <div className="aspect-square bg-muted overflow-hidden">
                            <img 
                              src={productImages[0]} 
                              alt={similarProduct.nom}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                              {similarProduct.nom}
                            </h3>
                            <p className="text-lg font-bold text-primary">
                              {parseFloat(String(similarProduct.prix)).toLocaleString()} FCFA
                            </p>
                            {similarProduct.price_tier_1 && (
                              <p className="text-xs text-muted-foreground mt-1">
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
