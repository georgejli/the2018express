-- Create storage bucket for event posters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-posters', 'event-posters', true);

-- Allow public read access to event posters
CREATE POLICY "Public read access for event posters"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-posters');

-- Allow authenticated admins to upload event posters
CREATE POLICY "Admins can upload event posters"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-posters' 
  AND auth.role() = 'authenticated'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to update event posters
CREATE POLICY "Admins can update event posters"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-posters' 
  AND auth.role() = 'authenticated'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to delete event posters
CREATE POLICY "Admins can delete event posters"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-posters' 
  AND auth.role() = 'authenticated'
  AND public.has_role(auth.uid(), 'admin')
);