-- Create event_celebrities table
CREATE TABLE public.event_celebrities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  name text NOT NULL,
  bio text NOT NULL,
  photo_url text,
  website text,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create event_sponsors table
CREATE TABLE public.event_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  name text NOT NULL,
  bio text NOT NULL,
  photo_url text,
  website text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_celebrities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Celebrities are publicly viewable"
  ON public.event_celebrities FOR SELECT
  USING (true);

CREATE POLICY "Sponsors are publicly viewable"
  ON public.event_sponsors FOR SELECT
  USING (true);

-- Admin management policies
CREATE POLICY "Admins can insert celebrities"
  ON public.event_celebrities FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update celebrities"
  ON public.event_celebrities FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete celebrities"
  ON public.event_celebrities FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sponsors"
  ON public.event_sponsors FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sponsors"
  ON public.event_sponsors FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sponsors"
  ON public.event_sponsors FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for celebrity/sponsor photos
INSERT INTO storage.buckets (id, name, public) VALUES ('event-media', 'event-media', true);

-- Storage policies for event-media bucket
CREATE POLICY "Event media is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-media');

CREATE POLICY "Admins can upload event media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-media' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update event media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-media' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete event media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-media' AND public.has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_event_celebrities_updated_at
  BEFORE UPDATE ON public.event_celebrities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_sponsors_updated_at
  BEFORE UPDATE ON public.event_sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();