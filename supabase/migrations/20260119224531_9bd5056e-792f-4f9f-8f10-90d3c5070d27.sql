-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Admins can insert vendor applications" ON public.vendor_applications;

-- Create a more restrictive INSERT policy
-- Only service role (edge function) can insert - no direct client inserts
CREATE POLICY "No direct inserts - service role only" 
ON public.vendor_applications 
FOR INSERT 
WITH CHECK (false);