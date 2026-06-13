-- Newsletter subscribers with Double-Opt-In
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  source TEXT NOT NULL DEFAULT 'footer',
  confirm_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  unsubscribe_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  ip_hash TEXT,
  user_agent TEXT,
  consent_text TEXT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX newsletter_subscribers_email_unique
  ON public.newsletter_subscribers (lower(email));
CREATE INDEX newsletter_subscribers_status_idx
  ON public.newsletter_subscribers (status);
CREATE INDEX newsletter_subscribers_confirm_token_idx
  ON public.newsletter_subscribers (confirm_token);
CREATE INDEX newsletter_subscribers_unsubscribe_token_idx
  ON public.newsletter_subscribers (unsubscribe_token);

-- Grants
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT INSERT ON public.newsletter_subscribers TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

-- RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone (even anon) to INSERT a new subscription (status defaults to pending)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- Only admins can read subscriber list
CREATE POLICY "Admins can view subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update subscriber records (confirmation/unsubscribe via server fn with service role)
CREATE POLICY "Admins can update subscribers"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete subscribers
CREATE POLICY "Admins can delete subscribers"
  ON public.newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER newsletter_subscribers_touch_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();