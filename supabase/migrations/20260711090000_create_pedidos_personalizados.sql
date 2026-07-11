CREATE TABLE IF NOT EXISTS public.pedidos_personalizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado TEXT NOT NULL DEFAULT 'enviado',
  descripcion TEXT
);

GRANT SELECT, INSERT ON public.pedidos_personalizados TO authenticated;
GRANT ALL ON public.pedidos_personalizados TO service_role;

ALTER TABLE public.pedidos_personalizados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients read own pedidos" ON public.pedidos_personalizados;
DROP POLICY IF EXISTS "Clients create own pedidos" ON public.pedidos_personalizados;
DROP POLICY IF EXISTS "Admins read all pedidos" ON public.pedidos_personalizados;

CREATE POLICY "Clients read own pedidos" ON public.pedidos_personalizados
  FOR SELECT TO authenticated
  USING (auth.uid() = cliente_id);

CREATE POLICY "Clients create own pedidos" ON public.pedidos_personalizados
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Admins read all pedidos" ON public.pedidos_personalizados
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
