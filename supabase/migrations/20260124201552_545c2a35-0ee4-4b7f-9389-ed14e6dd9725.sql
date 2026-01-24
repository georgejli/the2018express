-- Fix ticket_orders SELECT policy - convert RESTRICTIVE to PERMISSIVE for proper role-based access control
-- Current policy is RESTRICTIVE which requires ALL policies to match. 
-- We need a PERMISSIVE policy that grants access ONLY to admins.

-- Drop the existing RESTRICTIVE policy
DROP POLICY IF EXISTS "Admins can view all orders" ON public.ticket_orders;

-- Create a PERMISSIVE policy that explicitly allows only admins to SELECT
-- With RLS enabled and no PERMISSIVE SELECT policies, non-admins cannot read any rows
CREATE POLICY "Admins can view all orders"
  ON public.ticket_orders
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));