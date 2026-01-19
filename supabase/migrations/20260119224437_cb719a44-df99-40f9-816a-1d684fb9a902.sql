-- Create vendor_applications table
CREATE TABLE public.vendor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  event_date TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  table_tier TEXT NOT NULL,
  table_tier_label TEXT NOT NULL,
  table_quantity INTEGER NOT NULL DEFAULT 1,
  vendor_count INTEGER NOT NULL DEFAULT 1,
  price_per_table INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  merchandise_description TEXT NOT NULL,
  special_requests TEXT,
  has_paid BOOLEAN NOT NULL DEFAULT false,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  payment_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced_to_sheets_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all vendor applications" 
ON public.vendor_applications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert vendor applications" 
ON public.vendor_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update vendor applications" 
ON public.vendor_applications 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete vendor applications" 
ON public.vendor_applications 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vendor_applications_updated_at
BEFORE UPDATE ON public.vendor_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster event-based queries
CREATE INDEX idx_vendor_applications_event_id ON public.vendor_applications(event_id);
CREATE INDEX idx_vendor_applications_event_date ON public.vendor_applications(event_date);
CREATE INDEX idx_vendor_applications_status ON public.vendor_applications(status);