
REVOKE EXECUTE ON FUNCTION public.exec_read_sql(text) FROM authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.exec_read_sql(text) TO service_role;
