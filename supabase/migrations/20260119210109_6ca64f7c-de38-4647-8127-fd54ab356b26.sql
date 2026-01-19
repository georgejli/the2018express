-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  date text NOT NULL,
  month text NOT NULL,
  year text NOT NULL,
  day_of_week text NOT NULL,
  time text NOT NULL,
  early_bird_time text,
  venue text NOT NULL,
  address text NOT NULL,
  ga_price integer NOT NULL DEFAULT 10,
  vip_price integer NOT NULL DEFAULT 15,
  ga_features text[] NOT NULL DEFAULT ARRAY['Access to all vendor tables', 'Browse thousands of sports cards', 'Meet fellow collectors', 'Entry after 10:00 AM', 'Meet special guests'],
  vip_features text[] NOT NULL DEFAULT ARRAY['Early entry at 9:00 AM', 'Exclusive VIP access to merchandise', 'First access to guest meet and greets', 'Priority access to all vendors'],
  poster text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view events (public)
CREATE POLICY "Events are publicly viewable"
ON public.events
FOR SELECT
TO public
USING (true);

-- Only admins can insert events
CREATE POLICY "Admins can insert events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update events
CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete events
CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();