
-- Key-value site settings table
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are publicly readable"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert site settings"
ON public.site_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed the default banner text
INSERT INTO public.site_settings (key, value) VALUES ('ticker_text', 'NEXT SHOW: SUN, MAY 31 2026');
