-- Arreglar políticas RLS de pagos
-- El problema es que los clientes no pueden insertar pagos correctamente

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Clients read own pagos" ON public.pagos;
DROP POLICY IF EXISTS "Clients create own pagos" ON public.pagos;
DROP POLICY IF EXISTS "Admins manage all pagos" ON public.pagos;
DROP POLICY IF EXISTS "Clients update own pagos" ON public.pagos;
DROP POLICY IF EXISTS "Admins read all pagos" ON public.pagos;

-- Crear nuevas políticas más permisivas
-- Los clientes pueden leer sus propios pagos
CREATE POLICY "Clients read own pagos" ON public.pagos 
  FOR SELECT TO authenticated 
  USING (auth.uid() = cliente_id);

-- Los clientes pueden crear sus propios pagos (el cliente_id debe coincidir con su auth.uid())
CREATE POLICY "Clients create own pagos" ON public.pagos 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = cliente_id);

-- Los clientes pueden actualizar sus propios pagos
CREATE POLICY "Clients update own pagos" ON public.pagos 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = cliente_id)
  WITH CHECK (auth.uid() = cliente_id);

-- Los admins pueden ver y editar todos los pagos
CREATE POLICY "Admins manage all pagos" ON public.pagos 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
