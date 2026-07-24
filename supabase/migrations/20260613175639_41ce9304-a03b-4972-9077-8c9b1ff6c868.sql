
DROP FUNCTION IF EXISTS public._tmp_set_dispatch_secret(text);

-- Schedule weekly newsletter dispatch.
-- pg_cron runs on UTC. To always fire at 12:00 Berlin time across DST,
-- we schedule TWO jobs (10:00 UTC = summer, 11:00 UTC = winter).
-- The dispatch endpoint itself verifies the current Berlin hour is 12
-- and silently skips otherwise, so only the correct one actually sends.

DO $$
DECLARE
  v_url text := 'https://welchesfahrrad.de/api/public/newsletter/dispatch';
  v_secret text;
BEGIN
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE id = '6b161954-9283-4280-8a9e-53518e92c458'::uuid;

  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'Dispatch secret not present in vault';
  END IF;

  -- Unschedule any previous versions
  PERFORM cron.unschedule(jobname) FROM cron.job WHERE jobname IN ('newsletter-weekly-summer','newsletter-weekly-winter');

  PERFORM cron.schedule(
    'newsletter-weekly-summer',
    '0 10 * * 0',
    format($f$SELECT net.http_post(
      url := %L,
      headers := jsonb_build_object('Content-Type','application/json','x-dispatch-secret', %L),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    );$f$, v_url, v_secret)
  );

  PERFORM cron.schedule(
    'newsletter-weekly-winter',
    '0 11 * * 0',
    format($f$SELECT net.http_post(
      url := %L,
      headers := jsonb_build_object('Content-Type','application/json','x-dispatch-secret', %L),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    );$f$, v_url, v_secret)
  );
END $$;
