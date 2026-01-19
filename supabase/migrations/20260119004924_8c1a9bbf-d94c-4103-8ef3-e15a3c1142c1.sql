-- Add check-in columns to ticket_orders
ALTER TABLE public.ticket_orders
ADD COLUMN checked_in BOOLEAN DEFAULT false,
ADD COLUMN checked_in_at TIMESTAMPTZ,
ADD COLUMN checked_in_by UUID REFERENCES auth.users(id);

-- Create index for faster check-in lookups
CREATE INDEX idx_ticket_orders_qr_code ON public.ticket_orders(qr_code);
CREATE INDEX idx_ticket_orders_checked_in ON public.ticket_orders(checked_in);