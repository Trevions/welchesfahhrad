ALTER TABLE public.article_sources
  ADD COLUMN IF NOT EXISTS scraped_text TEXT,
  ADD COLUMN IF NOT EXISTS related_sources JSONB;