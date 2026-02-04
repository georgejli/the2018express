-- Create unified celebrities table
CREATE TABLE public.celebrities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT,
  website TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  featured_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for event-celebrity relationships
CREATE TABLE public.event_celebrity_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  celebrity_id UUID NOT NULL REFERENCES public.celebrities(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, celebrity_id)
);

-- Enable RLS on both tables
ALTER TABLE public.celebrities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_celebrity_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for celebrities table
CREATE POLICY "Celebrities are publicly viewable" 
ON public.celebrities FOR SELECT USING (true);

CREATE POLICY "Admins can insert celebrities" 
ON public.celebrities FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update celebrities" 
ON public.celebrities FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete celebrities" 
ON public.celebrities FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for event_celebrity_links table
CREATE POLICY "Event celebrity links are publicly viewable" 
ON public.event_celebrity_links FOR SELECT USING (true);

CREATE POLICY "Admins can insert event celebrity links" 
ON public.event_celebrity_links FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update event celebrity links" 
ON public.event_celebrity_links FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete event celebrity links" 
ON public.event_celebrity_links FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at on celebrities
CREATE TRIGGER update_celebrities_updated_at
BEFORE UPDATE ON public.celebrities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate data from featured_celebrities to new celebrities table
INSERT INTO public.celebrities (name, bio, photo_url, website, is_featured, featured_order, created_at, updated_at)
SELECT name, bio, photo_url, website, is_active, display_order, created_at, updated_at
FROM public.featured_celebrities;

-- Migrate data from event_celebrities to new celebrities table (avoiding duplicates by name)
INSERT INTO public.celebrities (name, bio, photo_url, website, is_featured, featured_order, created_at, updated_at)
SELECT ec.name, ec.bio, ec.photo_url, ec.website, false, 0, ec.created_at, ec.updated_at
FROM public.event_celebrities ec
WHERE NOT EXISTS (
  SELECT 1 FROM public.celebrities c WHERE LOWER(c.name) = LOWER(ec.name)
);

-- Create links for event_celebrities
INSERT INTO public.event_celebrity_links (event_id, celebrity_id, display_order, created_at)
SELECT ec.event_id, c.id, ec.display_order, ec.created_at
FROM public.event_celebrities ec
JOIN public.celebrities c ON LOWER(c.name) = LOWER(ec.name);