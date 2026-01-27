-- Add instagram_handle column to vendor_applications table
ALTER TABLE public.vendor_applications
ADD COLUMN instagram_handle text NULL;