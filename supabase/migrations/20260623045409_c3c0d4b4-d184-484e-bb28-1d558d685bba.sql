
CREATE TABLE public.bikes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  category TEXT NOT NULL CHECK (category IN ('bike','ebike')),
  bike_type TEXT,
  price_eur INTEGER,
  image_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  manufacturer_url TEXT,
  excerpt TEXT,
  description TEXT,
  highlights JSONB NOT NULL DEFAULT '{"pros":[],"cons":[]}'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  ebike JSONB,
  ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  intended_use TEXT[] NOT NULL DEFAULT '{}',
  terrain TEXT[] NOT NULL DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX bikes_published_idx ON public.bikes (published, published_at DESC NULLS LAST);
CREATE INDEX bikes_category_idx ON public.bikes (category);
CREATE INDEX bikes_brand_idx ON public.bikes (brand);

GRANT SELECT ON public.bikes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bikes TO authenticated;
GRANT ALL ON public.bikes TO service_role;

ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published bikes"
ON public.bikes FOR SELECT
USING (published = true);

CREATE POLICY "Staff can read all bikes"
ON public.bikes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

CREATE POLICY "Staff can insert bikes"
ON public.bikes FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

CREATE POLICY "Staff can update bikes"
ON public.bikes FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

CREATE POLICY "Staff can delete bikes"
ON public.bikes FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'editor'));

CREATE TRIGGER bikes_touch_updated_at
BEFORE UPDATE ON public.bikes
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
