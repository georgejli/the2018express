-- Create table for storing ticket orders
CREATE TABLE public.ticket_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  event_id TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_name TEXT NOT NULL,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('GA', 'VIP')),
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 10),
  unit_price INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  subscribe_to_updates BOOLEAN DEFAULT false,
  qr_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.ticket_orders ENABLE ROW LEVEL SECURITY;

-- Policy to allow public inserts (for creating pending orders)
CREATE POLICY "Allow public insert for pending orders"
ON public.ticket_orders
FOR INSERT
TO public
WITH CHECK (status = 'pending');

-- Policy to allow reading own orders by email (for success page)
CREATE POLICY "Allow reading orders by session id"
ON public.ticket_orders
FOR SELECT
TO public
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_ticket_orders_stripe_session_id ON public.ticket_orders(stripe_session_id);
CREATE INDEX idx_ticket_orders_status ON public.ticket_orders(status);
CREATE INDEX idx_ticket_orders_event_id ON public.ticket_orders(event_id);