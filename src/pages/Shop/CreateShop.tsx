import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Store, MapPin, Phone, Mail, Globe, FileText, Camera, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const formSchema = z.object({
  nom_boutique: z.string().min(1, 'Le nom de la boutique est requis'),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  adresse: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  site_web: z.string().url('URL invalide').optional().or(z.literal('')),
  document_identite_url: z.string().optional(),
  photo_vendeur_url: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CreateShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [idDocFile, setIdDocFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom_boutique: '',
      description: '',
      logo_url: '',
      adresse: '',
      telephone: '',
      email: '',
      site_web: '',
      document_identite_url: '',
      photo_vendeur_url: '',
    },
  });

  // Check if shop already exists
  const { data: existingShop, isLoading } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('vendeur_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // If shop exists, redirect to shop page
  useEffect(() => {
    if (existingShop) {
      navigate('/ma-boutique');
    }
  }, [existingShop, navigate]);

  const createShopMutation = useMutation({
    mutationFn: async (values: FormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      let logoUrl = values.logo_url;
      let idDocUrl = values.document_identite_url;
      let photoUrl = values.photo_vendeur_url;

      setUploading(true);

      // Upload logo if file is selected
      if (logoFile) {
        const filePath = `${user.id}/logo.png`;
        const { error: uploadError } = await supabase.storage
          .from('shops')
          .upload(filePath, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('shops')
          .getPublicUrl(filePath);
        
        logoUrl = publicUrl;
      }

      // Upload ID document if file is selected
      if (idDocFile) {
        const timestamp = Date.now();
        const ext = idDocFile.name.split('.').pop();
        const filePath = `${user.id}/id_document_${timestamp}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('identity-documents')
          .upload(filePath, idDocFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('identity-documents')
          .getPublicUrl(filePath);
        
        idDocUrl = publicUrl;
      }

      // Upload seller photo if file is selected
      if (photoFile) {
        const timestamp = Date.now();
        const ext = photoFile.name.split('.').pop();
        const filePath = `${user.id}/photo_${timestamp}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('identity-documents')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('identity-documents')
          .getPublicUrl(filePath);
        
        photoUrl = publicUrl;
      }

      setUploading(false);

      const { data, error } = await supabase
        .from('shops')
        .insert({
          vendeur_id: user.id,
          nom_boutique: values.nom_boutique,
          description: values.description || null,
          logo_url: logoUrl || null,
          adresse: values.adresse || null,
          telephone: values.telephone || null,
          email: values.email || null,
          site_web: values.site_web || null,
          document_identite_url: idDocUrl || null,
          photo_vendeur_url: photoUrl || null,
          statut: 'en_attente',
          statut_verification: 'en_attente',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      toast({
        title: '🎉 Boutique créée avec succès !',
        description: 'Votre boutique est maintenant active.',
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

  const onSubmit = (values: FormData) => {
    createShopMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <CardTitle>Créer ma boutique</CardTitle>
            </div>
            <CardDescription>
              Remplissez le formulaire pour créer votre boutique en ligne
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="nom_boutique"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la boutique *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ma Super Boutique" {...field} />
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
                          placeholder="Décrivez votre boutique..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Logo (upload)</FormLabel>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setLogoFile(file);
                      }}
                      className="flex-1"
                    />
                    {logoFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        {logoFile.name}
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="adresse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Adresse
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="123 Rue de la Paix, Paris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+33 1 23 45 67 89" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@maboutique.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="site_web"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Site web
                      </FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://www.maboutique.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createShopMutation.isPending || uploading}
                >
                  {(createShopMutation.isPending || uploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Créer ma boutique
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CreateShop;
