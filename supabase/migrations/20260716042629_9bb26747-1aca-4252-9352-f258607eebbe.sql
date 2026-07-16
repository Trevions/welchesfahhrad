
CREATE TABLE public.lexikon_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  term TEXT NOT NULL,
  short_definition TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Allgemein',
  synonyms TEXT[] NOT NULL DEFAULT '{}',
  related_article_slugs TEXT[] NOT NULL DEFAULT '{}',
  related_term_slugs TEXT[] NOT NULL DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX lexikon_terms_status_idx ON public.lexikon_terms(status);
CREATE INDEX lexikon_terms_category_idx ON public.lexikon_terms(category);

GRANT SELECT ON public.lexikon_terms TO anon;
GRANT SELECT ON public.lexikon_terms TO authenticated;
GRANT ALL ON public.lexikon_terms TO service_role;

ALTER TABLE public.lexikon_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published lexikon terms"
  ON public.lexikon_terms FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage lexikon terms"
  ON public.lexikon_terms FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER lexikon_terms_touch_updated_at
  BEFORE UPDATE ON public.lexikon_terms
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
