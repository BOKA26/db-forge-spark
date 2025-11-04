-- Create products storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Policy: Vendors can upload their own product images
CREATE POLICY "Vendors can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Vendors can update their own product images
CREATE POLICY "Vendors can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Vendors can delete their own product images
CREATE POLICY "Vendors can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);