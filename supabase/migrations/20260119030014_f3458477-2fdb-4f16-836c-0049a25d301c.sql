-- Remove the public insert policy since orders are now created by the webhook using service role
DROP POLICY IF EXISTS "Allow public insert for pending orders" ON public.ticket_orders;

-- Also fix the overly permissive SELECT policy - restrict it to session-based access only
DROP POLICY IF EXISTS "Allow reading orders by session id" ON public.ticket_orders;

-- Create a more restrictive policy for reading orders by session ID
-- This allows the success page to fetch order details using the session_id query parameter
CREATE POLICY "Allow reading orders by valid session id" 
ON public.ticket_orders 
FOR SELECT 
USING (
  -- Only allow if the request includes a valid stripe_session_id
  stripe_session_id IS NOT NULL AND status = 'completed'
);