CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT EXISTS (
  SELECT 1 FROM public.user_roles r JOIN auth.users u ON u.id = r.user_id
  WHERE r.user_id = _user_id AND r.role = _role
    AND lower(u.email) = 'infolcrhouse@gmail.com' AND u.email_confirmed_at IS NOT NULL
 );
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;