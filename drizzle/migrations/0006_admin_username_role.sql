-- The "admin" username signs in as admin@lchouse.app (see 0003). Grant it the admin role
-- automatically once confirmed, like the company email, and backfill any existing account.
CREATE OR REPLACE FUNCTION public.assign_company_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF lower(NEW.email) IN ('infolcrhouse@gmail.com', 'admin@lchouse.app') AND NEW.email_confirmed_at IS NOT NULL THEN
  INSERT INTO public.user_roles(user_id, role) VALUES(NEW.id, 'admin') ON CONFLICT(user_id, role) DO NOTHING;
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_company_admin() FROM PUBLIC, anon, authenticated;

INSERT INTO public.user_roles(user_id, role)
SELECT id, 'admin' FROM auth.users
WHERE lower(email) IN ('infolcrhouse@gmail.com', 'admin@lchouse.app') AND email_confirmed_at IS NOT NULL
ON CONFLICT(user_id, role) DO NOTHING;
