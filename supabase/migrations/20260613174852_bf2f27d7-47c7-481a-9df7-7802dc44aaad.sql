
CREATE TABLE public.newsletter_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_date date NOT NULL UNIQUE,
  subject text NOT NULL,
  preheader text,
  html text NOT NULL,
  text text NOT NULL,
  article_ids uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed','skipped')),
  recipients_total integer NOT NULL DEFAULT 0,
  recipients_sent integer NOT NULL DEFAULT 0,
  recipients_failed integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

GRANT SELECT ON public.newsletter_issues TO authenticated;
GRANT ALL ON public.newsletter_issues TO service_role;

ALTER TABLE public.newsletter_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view newsletter issues"
  ON public.newsletter_issues FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER newsletter_issues_touch_updated_at
  BEFORE UPDATE ON public.newsletter_issues
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.newsletter_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES public.newsletter_issues(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed','skipped')),
  attempts integer NOT NULL DEFAULT 0,
  message_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issue_id, subscriber_id)
);

GRANT SELECT ON public.newsletter_deliveries TO authenticated;
GRANT ALL ON public.newsletter_deliveries TO service_role;

ALTER TABLE public.newsletter_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view newsletter deliveries"
  ON public.newsletter_deliveries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX newsletter_deliveries_issue_idx ON public.newsletter_deliveries(issue_id);
CREATE INDEX newsletter_deliveries_status_idx ON public.newsletter_deliveries(status);

CREATE TRIGGER newsletter_deliveries_touch_updated_at
  BEFORE UPDATE ON public.newsletter_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
