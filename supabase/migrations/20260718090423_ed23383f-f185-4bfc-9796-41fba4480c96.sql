
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.notify_lexikon_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  hook_url TEXT := 'https://radmap.de/api/public/hooks/lexikon-changed';
  payload JSONB;
  event_kind TEXT;
  target_slug TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'published' THEN
      RETURN OLD;
    END IF;
    event_kind := 'deleted';
    target_slug := OLD.slug;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'published' THEN
      RETURN NEW;
    END IF;
    event_kind := 'created';
    target_slug := NEW.slug;
  ELSE -- UPDATE
    -- only fire when the row is (or becomes) published AND something
    -- SEO-relevant actually changed, to avoid spamming IndexNow.
    IF NEW.status <> 'published' AND OLD.status <> 'published' THEN
      RETURN NEW;
    END IF;
    IF NEW.status = OLD.status
       AND NEW.slug              IS NOT DISTINCT FROM OLD.slug
       AND NEW.term              IS NOT DISTINCT FROM OLD.term
       AND NEW.short_definition  IS NOT DISTINCT FROM OLD.short_definition
       AND NEW.body              IS NOT DISTINCT FROM OLD.body
       AND NEW.category          IS NOT DISTINCT FROM OLD.category
       AND NEW.synonyms          IS NOT DISTINCT FROM OLD.synonyms
       AND NEW.related_article_slugs IS NOT DISTINCT FROM OLD.related_article_slugs
       AND NEW.related_term_slugs    IS NOT DISTINCT FROM OLD.related_term_slugs
       AND NEW.seo_title         IS NOT DISTINCT FROM OLD.seo_title
       AND NEW.seo_description   IS NOT DISTINCT FROM OLD.seo_description
    THEN
      RETURN NEW;
    END IF;
    event_kind := 'updated';
    target_slug := NEW.slug;
  END IF;

  payload := jsonb_build_object('slug', target_slug, 'event', event_kind);

  BEGIN
    PERFORM net.http_post(
      url := hook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := payload,
      timeout_milliseconds := 3000
    );
  EXCEPTION WHEN OTHERS THEN
    -- never let a failed ping block the write
    RAISE WARNING 'notify_lexikon_change failed for %: %', target_slug, SQLERRM;
  END;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_lexikon_terms_notify_change ON public.lexikon_terms;

CREATE TRIGGER trg_lexikon_terms_notify_change
AFTER INSERT OR UPDATE OR DELETE ON public.lexikon_terms
FOR EACH ROW EXECUTE FUNCTION public.notify_lexikon_change();
