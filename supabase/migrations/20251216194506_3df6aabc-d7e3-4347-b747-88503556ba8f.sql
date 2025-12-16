-- Create storage bucket for investor videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('investor-videos', 'investor-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload videos
CREATE POLICY "Admins can upload investor videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'investor-videos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update videos
CREATE POLICY "Admins can update investor videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'investor-videos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete videos
CREATE POLICY "Admins can delete investor videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'investor-videos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow anyone to view investor videos (public)
CREATE POLICY "Anyone can view investor videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'investor-videos');