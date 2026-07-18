
-- Soft delete + thread token on article_reports
ALTER TABLE public.article_reports
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS thread_token TEXT;

-- Backfill thread tokens for existing rows (short random URL-safe)
UPDATE public.article_reports
SET thread_token = lower(substring(encode(gen_random_bytes(9), 'base64'), 1, 12))
WHERE thread_token IS NULL;

-- Replace any '+' or '/' with url-safe chars
UPDATE public.article_reports
SET thread_token = translate(thread_token, '+/=', 'abz')
WHERE thread_token ~ '[+/=]';

ALTER TABLE public.article_reports
  ALTER COLUMN thread_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS article_reports_thread_token_key
  ON public.article_reports(thread_token);

-- Default for new rows
ALTER TABLE public.article_reports
  ALTER COLUMN thread_token
  SET DEFAULT lower(translate(substring(encode(gen_random_bytes(9), 'base64'), 1, 12), '+/=', 'abz'));

CREATE INDEX IF NOT EXISTS article_reports_deleted_at_idx
  ON public.article_reports(deleted_at);

-- Messages table (full correspondence)
CREATE TABLE IF NOT EXISTS public.article_report_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.article_reports(id) ON DELETE CASCADE,
  thread_token TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound','auto_reply')),
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  provider_message_id TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.article_report_messages TO authenticated;
GRANT ALL ON public.article_report_messages TO service_role;

ALTER TABLE public.article_report_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff can read messages"
  ON public.article_report_messages
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'editor')
  );

CREATE INDEX IF NOT EXISTS article_report_messages_report_idx
  ON public.article_report_messages(report_id, created_at);
CREATE INDEX IF NOT EXISTS article_report_messages_thread_idx
  ON public.article_report_messages(thread_token, created_at);
