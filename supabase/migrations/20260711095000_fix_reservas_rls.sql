ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients read own reservas" ON public.reservas;
DROP POLICY IF EXISTS "Clients create own reservas" ON public.reservas;
DROP POLICY IF EXISTS "Clients update own reservas" ON public.reservas;
DROP POLICY IF EXISTS "Admins read all reservas" ON public.reservas;
DROP POLICY IF EXISTS "Admins update all reservas" ON public.reservas;
DROP POLICY IF EXISTS "Admins insert all reservas" ON public.reservas;

CREATE POLICY "Clients read own reservas"
  ON public.reservas FOR SELECT
  TO authenticated
  USING (auth.uid() = cliente_id);

CREATE POLICY "Clients create own reservas"
  ON public.reservas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Clients update own reservas"
  ON public.reservas FOR UPDATE
  TO authenticated
  USING (auth.uid() = cliente_id)
  WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Admins read all reservas"
  ON public.reservas FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert all reservas"
  ON public.reservas FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update all reservas"
  ON public.reservas FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
