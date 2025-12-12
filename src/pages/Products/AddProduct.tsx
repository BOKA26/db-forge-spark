import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Package, X, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const productSchema = z.object({
  nom: z.string().min(1, 'Le nom du produit est requis'),
  description: z.string().optional(),
  prix: z.string().min(1, 'Le prix de base est requis'),
  stock: z.string().min(0, 'Le stock doit être positif'),
  categorie: z.string().optional(),
  price_tier_1: z.string().optional(),
  price_tier_2: z.string().optional(),
  price_tier_3: z.string().optional(),
  price_tier_4: z.string().optional(),
  sample_price: z.string().optional(),
  origin_country: z.string().min(1, 'Le pays d\'origine est requis'),
});

type ProductFormData = z.infer<typeof productSchema>;

// Configuration des champs par catégorie
const categoryConfig: Record<string, {
  showSizes: boolean;
  showColors: boolean;
  showCustomization: boolean;
  showWholesale: boolean;
  showSamplePrice: boolean;
  sizes?: string[];
  customizationOptions?: Array<{ type: string; minQty: number }>;
}> = {
  'Vêtements': {
    showSizes: true,
    showColors: true,
    showCustomization: true,
    showWholesale: true,
    showSamplePrice: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    customizationOptions: [
      { type: 'Logo personnalisé', minQty: 100 },
      { type: 'Emballage personnalisé', minQty: 300 },
      { type: 'Graphique personnalisé', minQty: 100 },
    ],
  },
  'Chaussures': {
    showSizes: true,
    showColors: true,
    showCustomization: true,
    showWholesale: true,
    showSamplePrice: true,
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    customizationOptions: [
      { type: 'Logo personnalisé', minQty: 100 },
      { type: 'Emballage personnalisé', minQty: 200 },
    ],
  },
  'Électronique': {
    showSizes: false,
    showColors: true,
    showCustomization: false,
    showWholesale: true,
    showSamplePrice: true,
  },
  'Alimentation': {
    showSizes: false,
    showColors: false,
    showCustomization: true,
    showWholesale: true,
    showSamplePrice: true,
    customizationOptions: [
      { type: 'Emballage personnalisé', minQty: 500 },
      { type: 'Étiquetage personnalisé', minQty: 300 },
    ],
  },
  'Maison & Jardin': {
    showSizes: false,
    showColors: true,
    showCustomization: true,
    showWholesale: true,
    showSamplePrice: true,
    customizationOptions: [
      { type: 'Logo personnalisé', minQty: 100 },
      { type: 'Emballage personnalisé', minQty: 200 },
    ],
  },
  'Sports & Loisirs': {
    showSizes: true,
    showColors: true,
    showCustomization: true,
    showWholesale: true,
    showSamplePrice: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    customizationOptions: [
      { type: 'Logo personnalisé', minQty: 50 },
      { type: 'Graphique personnalisé', minQty: 100 },
    ],
  },
  'Santé & Beauté': {
    showSizes: false,
    showColors: true,
    showCustomization: true,
    showWholesale: true,
    showSamplePrice: true,
    customizationOptions: [
      { type: 'Emballage personnalisé', minQty: 500 },
      { type: 'Étiquetage personnalisé', minQty: 300 },
    ],
  },
  'Automobile': {
    showSizes: false,
    showColors: true,
    showCustomization: false,
    showWholesale: true,
    showSamplePrice: true,
  },
  'Bijoux & Accessoires': {
    showSizes: true,
    showColors: true,
    showCustomization: true,
    showWholesale: true,
    showSamplePrice: true,
    sizes: ['XS', 'S', 'M', 'L', 'Unique'],
    customizationOptions: [
      { type: 'Gravure personnalisée', minQty: 50 },
      { type: 'Emballage personnalisé', minQty: 100 },
    ],
  },
  'Autre': {
    showSizes: false,
    showColors: true,
    showCustomization: true,
    showWholesale: true,
    showSamplePrice: true,
    customizationOptions: [
      { type: 'Logo personnalisé', minQty: 100 },
      { type: 'Emballage personnalisé', minQty: 300 },
    ],
  },
};

const categories = Object.keys(categoryConfig);

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [customOptions, setCustomOptions] = useState<Array<{ type: string; minQty: number }>>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nom: '',
      description: '',
      prix: '',
      stock: '0',
      categorie: '',
      price_tier_1: '',
      price_tier_2: '',
      price_tier_3: '',
      price_tier_4: '',
      sample_price: '',
      origin_country: 'CI',
    },
  });

  // Récupérer la catégorie sélectionnée pour adapter les champs
  const selectedCategory = form.watch('categorie');
  const currentConfig = selectedCategory ? categoryConfig[selectedCategory] : null;

  const createProductMutation = useMutation({
    mutationFn: async (values: ProductFormData) => {
      if (!user?.id || !shopId) throw new Error('User or shop not found');

      let imageUrls: string[] = [];

      // Upload images if any
      if (imageFiles.length > 0) {
        setUploading(true);
        const uploadPromises = imageFiles.map(async (file, index) => {
          // Sanitize filename: remove accents, special chars, spaces
          const sanitizeFilename = (name: string) => {
            const extension = name.split('.').pop()?.toLowerCase() || 'jpg';
            const baseName = name.replace(/\.[^/.]+$/, '');
            const sanitized = baseName
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Remove accents
              .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscore
              .replace(/_+/g, '_') // Remove consecutive underscores
              .replace(/^_|_$/g, '') // Remove leading/trailing underscores
              .substring(0, 50); // Limit length
            return `${sanitized || 'image'}.${extension}`;
          };
          
          const safeFileName = sanitizeFilename(file.name);
          const filePath = `${user.id}/${shopId}/${Date.now()}_${index}_${safeFileName}`;
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        imageUrls = await Promise.all(uploadPromises);
        setUploading(false);
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          nom: values.nom,
          description: values.description || null,
          prix: parseFloat(values.prix),
          stock: parseInt(values.stock),
          categorie: values.categorie || null,
          shop_id: shopId,
          vendeur_id: user.id,
          images: imageUrls,
          statut: 'actif',
          price_tier_1: values.price_tier_1 ? parseFloat(values.price_tier_1) : null,
          price_tier_2: values.price_tier_2 ? parseFloat(values.price_tier_2) : null,
          price_tier_3: values.price_tier_3 ? parseFloat(values.price_tier_3) : null,
          price_tier_4: values.price_tier_4 ? parseFloat(values.price_tier_4) : null,
          sample_price: values.sample_price ? parseFloat(values.sample_price) : null,
          origin_country: values.origin_country,
          sizes: sizes,
          colors: colors,
          customization_options: customOptions,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      toast({
        title: '✅ Produit créé avec succès',
      });
      navigate('/ma-boutique');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: ProductFormData) => {
    createProductMutation.mutate(values);
  };

  if (!shopId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Erreur</h2>
                <p className="text-muted-foreground">
                  Aucune boutique spécifiée.
                </p>
                <Button onClick={() => navigate('/ma-boutique')}>
                  Retour à ma boutique
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/ma-boutique')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                <CardTitle>Ajouter un produit</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du produit *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Smartphone XYZ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez votre produit..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="prix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix (€) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="0"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="categorie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="origin_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays d'origine *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un pays" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CI">🇨🇮 Côte d'Ivoire</SelectItem>
                            <SelectItem value="CN">🇨🇳 Chine</SelectItem>
                            <SelectItem value="FR">🇫🇷 France</SelectItem>
                            <SelectItem value="US">🇺🇸 États-Unis</SelectItem>
                            <SelectItem value="GB">🇬🇧 Royaume-Uni</SelectItem>
                            <SelectItem value="DE">🇩🇪 Allemagne</SelectItem>
                            <SelectItem value="IT">🇮🇹 Italie</SelectItem>
                            <SelectItem value="ES">🇪🇸 Espagne</SelectItem>
                            <SelectItem value="TR">🇹🇷 Turquie</SelectItem>
                            <SelectItem value="IN">🇮🇳 Inde</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message si aucune catégorie sélectionnée */}
                  {!selectedCategory && (
                    <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                      <p className="text-sm text-muted-foreground text-center">
                        Sélectionnez une catégorie pour afficher les options spécifiques au produit
                      </p>
                    </div>
                  )}

                  {/* Prix en gros - affiché si la catégorie le permet */}
                  {currentConfig?.showWholesale && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Prix de gros (wholesale)</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Définissez les prix par tranche de quantité
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price_tier_1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>5-49 pièces (FCFA)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="Ex: 5000"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="price_tier_2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>50-299 pièces (FCFA)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="Ex: 4500"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="price_tier_3"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>300-99999 pièces (FCFA)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="Ex: 4000"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="price_tier_4"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>100000+ pièces (FCFA)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="Ex: 3500"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {currentConfig?.showSamplePrice && (
                        <FormField
                          control={form.control}
                          name="sample_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prix de l'échantillon (FCFA)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="Ex: 6000"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}

                  {/* Tailles - affiché si la catégorie le permet */}
                  {currentConfig?.showSizes && currentConfig.sizes && (
                    <div className="space-y-4">
                      <FormLabel>Tailles disponibles</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {currentConfig.sizes.map((size) => (
                          <Badge
                            key={size}
                            variant={sizes.includes(size) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              setSizes(prev =>
                                prev.includes(size)
                                  ? prev.filter(s => s !== size)
                                  : [...prev, size]
                              );
                            }}
                          >
                            {size}
                          </Badge>
                        ))}
                      </div>
                      {sizes.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Sélectionnées: {sizes.join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Couleurs - affiché si la catégorie le permet */}
                  {currentConfig?.showColors && (
                    <div className="space-y-4">
                      <FormLabel>Couleurs disponibles</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Rouge, Bleu, Vert..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = e.currentTarget.value.trim();
                              if (value && !colors.includes(value)) {
                                setColors([...colors, value]);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                            const value = input.value.trim();
                            if (value && !colors.includes(value)) {
                              setColors([...colors, value]);
                              input.value = '';
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {colors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              {color}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => setColors(colors.filter((_, i) => i !== idx))}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Options de personnalisation - affiché si la catégorie le permet */}
                  {currentConfig?.showCustomization && currentConfig.customizationOptions && (
                    <div className="space-y-4">
                      <FormLabel>Options de personnalisation</FormLabel>
                      <div className="space-y-2">
                        {currentConfig.customizationOptions.map((option) => (
                          <div key={option.type} className="flex items-center space-x-2">
                            <Checkbox
                              id={option.type}
                              checked={customOptions.some(o => o.type === option.type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCustomOptions([...customOptions, option]);
                                } else {
                                  setCustomOptions(customOptions.filter(o => o.type !== option.type));
                                }
                              }}
                            />
                            <label
                              htmlFor={option.type}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option.type} <span className="text-muted-foreground">(min. {option.minQty} pcs)</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <FormLabel>Images du produit</FormLabel>
                    
                    {/* Zone de dépôt de fichiers */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="product-images"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            const newFiles = [...imageFiles, ...files];
                            setImageFiles(newFiles);
                            
                            // Créer les aperçus
                            files.forEach(file => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImagePreviews(prev => [...prev, reader.result as string]);
                              };
                              reader.readAsDataURL(file);
                            });
                          }
                        }}
                      />
                      <label htmlFor="product-images" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 rounded-full bg-primary/10">
                            <Upload className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Cliquez pour ajouter des images</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP jusqu'à 10MB</p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Galerie d'aperçu */}
                    {imagePreviews.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          {imagePreviews.length} image(s) sélectionnée(s)
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border-2 border-muted">
                                <img
                                  src={preview}
                                  alt={`Aperçu ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setImageFiles(files => files.filter((_, i) => i !== index));
                                  setImagePreviews(previews => previews.filter((_, i) => i !== index));
                                }}
                                className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-white truncate">
                                  {imageFiles[index]?.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {imagePreviews.length === 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <ImageIcon className="h-4 w-4" />
                        <span>Aucune image ajoutée</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createProductMutation.isPending || uploading}
                  >
                    {(createProductMutation.isPending || uploading) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Créer le produit
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddProduct;
