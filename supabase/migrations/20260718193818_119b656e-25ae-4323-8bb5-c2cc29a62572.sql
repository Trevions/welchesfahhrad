
CREATE TABLE public.article_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text NOT NULL,
  article_title text,
  reporter_name text NOT NULL,
  reporter_email text NOT NULL,
  reason text,
  description text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','resolved','archived')),
  user_agent text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.article_reports TO authenticated;
GRANT ALL ON public.article_reports TO service_role;

ALTER TABLE public.article_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read article reports"
  ON public.article_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can update article reports"
  ON public.article_reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can delete article reports"
  ON public.article_reports FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_article_reports_touch
  BEFORE UPDATE ON public.article_reports
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_article_reports_status ON public.article_reports(status, created_at DESC);
CREATE INDEX idx_article_reports_slug ON public.article_reports(article_slug);
