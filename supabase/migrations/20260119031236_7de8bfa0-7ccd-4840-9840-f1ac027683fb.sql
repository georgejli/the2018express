-- Remove the vulnerable public SELECT policy since order access is now handled
-- securely through the get-order-by-session edge function which validates the session ID
DROP POLICY IF EXISTS "Allow reading orders by valid session id" ON public.ticket_orders;