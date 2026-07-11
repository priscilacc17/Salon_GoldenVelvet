-- Fix RLS policies for anon users to not call has_role function

-- Drop problematic policies on servicios
DROP POLICY IF EXISTS "Anyone can read active servicios" ON public.servicios;
DROP POLICY IF EXISTS "Admins manage servicios" ON public.servicios;

-- Recreate servicios policies: separate anon from authenticated
CREATE POLICY "Anon can read active servicios" ON public.servicios FOR SELECT TO anon USING (estado = 'activo');
CREATE POLICY "Authenticated can read active servicios or all if admin" ON public.servicios FOR SELECT TO authenticated USING (estado = 'activo' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert servicios" ON public.servicios FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update servicios" ON public.servicios FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete servicios" ON public.servicios FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Drop problematic policies on peluqueros
DROP POLICY IF EXISTS "Anyone can read active peluqueros" ON public.peluqueros;
DROP POLICY IF EXISTS "Admins manage peluqueros" ON public.peluqueros;

-- Recreate peluqueros policies: separate anon from authenticated
CREATE POLICY "Anon can read active peluqueros" ON public.peluqueros FOR SELECT TO anon USING (estado = 'activo');
CREATE POLICY "Authenticated can read active peluqueros or all if admin" ON public.peluqueros FOR SELECT TO authenticated USING (estado = 'activo' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert peluqueros" ON public.peluqueros FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update peluqueros" ON public.peluqueros FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete peluqueros" ON public.peluqueros FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
