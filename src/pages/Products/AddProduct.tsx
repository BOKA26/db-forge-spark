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
import { Loader2, ArrowLeft, Package } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const productSchema = z.object({
  nom: z.string().min(1, 'Le nom du produit est requis'),
  description: z.string().optional(),
  prix: z.string().min(1, 'Le prix est requis'),
  stock: z.string().min(0, 'Le stock doit être positif'),
  categorie: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const categories = [
  'Électronique',
  'Vêtements',
  'Alimentation',
  'Maison & Jardin',
  'Sports & Loisirs',
  'Santé & Beauté',
  'Automobile',
  'Autre',
];

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nom: '',
      description: '',
      prix: '',
      stock: '0',
      categorie: '',
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (values: ProductFormData) => {
      if (!user?.id || !shopId) throw new Error('User or shop not found');

      let imageUrls: string[] = [];

      // Upload images if any
      if (imageFiles.length > 0) {
        setUploading(true);
        const uploadPromises = imageFiles.map(async (file, index) => {
          const filePath = `${user.id}/${shopId}/${Date.now()}_${index}_${file.name}`;
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

                  <div className="space-y-2">
                    <FormLabel>Images du produit</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setImageFiles(files);
                      }}
                    />
                    {imageFiles.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {imageFiles.length} image(s) sélectionnée(s)
                      </p>
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
