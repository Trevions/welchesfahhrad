
CREATE OR REPLACE FUNCTION public._tmp_set_dispatch_secret(_value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
BEGIN
  PERFORM vault.update_secret('6b161954-9283-4280-8a9e-53518e92c458'::uuid, _value);
END;
$$;
