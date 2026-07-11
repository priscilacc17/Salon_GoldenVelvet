-- Create categoria_servicios table
CREATE TABLE public.categoria_servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categoria_servicios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categoria_servicios TO authenticated;
GRANT ALL ON public.categoria_servicios TO service_role;
ALTER TABLE public.categoria_servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read active categories" ON public.categoria_servicios FOR SELECT TO anon USING (estado = 'activo');
CREATE POLICY "Authenticated can read categories or all if admin" ON public.categoria_servicios FOR SELECT TO authenticated USING (estado = 'activo' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert categories" ON public.categoria_servicios FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update categories" ON public.categoria_servicios FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete categories" ON public.categoria_servicios FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add categoria_id to servicios
ALTER TABLE public.servicios ADD COLUMN categoria_id UUID REFERENCES public.categoria_servicios(id) ON DELETE SET NULL;

-- Add ordering to servicios
ALTER TABLE public.servicios ADD COLUMN orden INTEGER DEFAULT 0;

-- Update servicios RLS to include categoria_id
DROP POLICY IF EXISTS "Anon can read active servicios" ON public.servicios;
DROP POLICY IF EXISTS "Authenticated can read active servicios or all if admin" ON public.servicios;
DROP POLICY IF EXISTS "Admins insert servicios" ON public.servicios;
DROP POLICY IF EXISTS "Admins update servicios" ON public.servicios;
DROP POLICY IF EXISTS "Admins delete servicios" ON public.servicios;

CREATE POLICY "Anon can read active servicios" ON public.servicios FOR SELECT TO anon USING (estado = 'activo');
CREATE POLICY "Authenticated can read active servicios or all if admin" ON public.servicios FOR SELECT TO authenticated USING (estado = 'activo' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert servicios" ON public.servicios FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update servicios" ON public.servicios FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete servicios" ON public.servicios FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
