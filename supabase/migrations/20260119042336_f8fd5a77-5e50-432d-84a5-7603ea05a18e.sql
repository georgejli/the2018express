-- Drop the existing restrictive SELECT policy and replace with a proper permissive one
DROP POLICY IF EXISTS "Admins can view all orders" ON public.ticket_orders;

-- Create a permissive SELECT policy that only allows admins
CREATE POLICY "Admins can view all orders" 
ON public.ticket_orders 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));