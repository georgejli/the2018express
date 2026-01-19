-- Add INSERT policy to block all direct inserts to ticket_orders
-- Only the stripe-webhook (using service role key) can create orders
CREATE POLICY "No direct inserts - service role only" 
ON public.ticket_orders 
FOR INSERT 
WITH CHECK (false);