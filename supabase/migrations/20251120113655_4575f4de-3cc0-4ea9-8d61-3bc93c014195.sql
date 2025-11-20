-- Ajouter les colonnes pour la vérification d'identité des vendeurs
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS document_identite_url text,
ADD COLUMN IF NOT EXISTS photo_vendeur_url text,
ADD COLUMN IF NOT EXISTS statut_verification text DEFAULT 'en_attente' CHECK (statut_verification IN ('en_attente', 'verifie', 'rejete')),
ADD COLUMN IF NOT EXISTS raison_rejet text,
ADD COLUMN IF NOT EXISTS date_verification timestamp with time zone;

-- Créer un bucket pour les documents d'identité (privé pour la sécurité)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identity-documents', 
  'identity-documents', 
  false,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS pour le bucket identity-documents
-- Les vendeurs peuvent uploader leurs propres documents
CREATE POLICY "Vendors can upload their identity documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'identity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Les vendeurs peuvent voir leurs propres documents
CREATE POLICY "Vendors can view their own identity documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'identity-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Les admins peuvent voir tous les documents
CREATE POLICY "Admins can view all identity documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'identity-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Les admins peuvent supprimer les documents
CREATE POLICY "Admins can delete identity documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'identity-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);