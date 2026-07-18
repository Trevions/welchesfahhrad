
CREATE OR REPLACE FUNCTION public.exec_read_sql(_sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lower text := lower(btrim(_sql));
  _result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Zugriff verweigert';
  END IF;

  IF _lower !~ '^(select|with)[[:space:]]' THEN
    RAISE EXCEPTION 'Nur SELECT/WITH erlaubt';
  END IF;

  IF _lower ~ '(^|[^a-z_])(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|do|vacuum|analyze|reindex|listen|notify|comment|refresh)([^a-z_]|$)' THEN
    RAISE EXCEPTION 'Verändernde/administrative Statements sind nicht erlaubt';
  END IF;

  IF position(';' in btrim(rtrim(_sql, ';'))) > 0 THEN
    RAISE EXCEPTION 'Nur ein Statement erlaubt';
  END IF;

  EXECUTE format('SELECT COALESCE(jsonb_agg(_x), ''[]''::jsonb) FROM (%s) _x', _sql)
    INTO _result;
  RETURN _result;
END;
$$;

REVOKE ALL ON FUNCTION public.exec_read_sql(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.exec_read_sql(text) TO authenticated;
