
CREATE TABLE public.article_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES public.articles(id) ON DELETE SET NULL,
  source_url text NOT NULL UNIQUE,
  source_title text,
  source_domain text,
  content_hash text,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'processed',
  skip_reason text,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX article_sources_discovered_idx ON public.article_sources (discovered_at DESC);
CREATE INDEX article_sources_status_idx ON public.article_sources (status);

GRANT SELECT ON public.article_sources TO authenticated;
GRANT ALL ON public.article_sources TO service_role;
ALTER TABLE public.article_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read article_sources" ON public.article_sources
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.article_generation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  sources_found integer NOT NULL DEFAULT 0,
  articles_created integer NOT NULL DEFAULT 0,
  errors_count integer NOT NULL DEFAULT 0,
  error_summary text,
  trigger text NOT NULL DEFAULT 'cron'
);
CREATE INDEX article_generation_runs_started_idx ON public.article_generation_runs (started_at DESC);

GRANT SELECT ON public.article_generation_runs TO authenticated;
GRANT ALL ON public.article_generation_runs TO service_role;
ALTER TABLE public.article_generation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read article_generation_runs" ON public.article_generation_runs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
