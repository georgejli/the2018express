-- Create featured_celebrities table for homepage display
CREATE TABLE public.featured_celebrities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  bio text NOT NULL,
  photo_url text,
  website text,
  display_order integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.featured_celebrities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Featured celebrities are publicly viewable"
ON public.featured_celebrities
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert featured celebrities"
ON public.featured_celebrities
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update featured celebrities"
ON public.featured_celebrities
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete featured celebrities"
ON public.featured_celebrities
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_featured_celebrities_updated_at
BEFORE UPDATE ON public.featured_celebrities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();