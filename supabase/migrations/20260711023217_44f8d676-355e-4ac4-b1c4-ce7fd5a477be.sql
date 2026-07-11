
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'cliente');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  dni TEXT,
  email TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  fecha_nacimiento DATE,
  metodo_auth TEXT NOT NULL DEFAULT 'email',
  estado TEXT NOT NULL DEFAULT 'activo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles policies
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Roles policies
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trigger: create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  admin_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, nombre_completo, email, dni, telefono, direccion, fecha_nacimiento, metodo_auth)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'dni',
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'direccion',
    NULLIF(NEW.raw_user_meta_data->>'fecha_nacimiento', '')::DATE,
    COALESCE(NEW.raw_user_meta_data->>'metodo_auth', CASE WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google' ELSE 'email' END)
  );

  IF lower(NEW.email) = 'carrascalpriscila@gmail.com' THEN
    admin_role := 'admin';
  ELSE
    admin_role := 'cliente';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, admin_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Peluqueros
CREATE TABLE public.peluqueros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT NOT NULL,
  dni TEXT,
  email TEXT,
  telefono TEXT,
  especialidad TEXT,
  horario TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  foto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.peluqueros TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.peluqueros TO authenticated;
GRANT ALL ON public.peluqueros TO service_role;
ALTER TABLE public.peluqueros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active peluqueros" ON public.peluqueros FOR SELECT TO anon, authenticated USING (estado = 'activo' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage peluqueros" ON public.peluqueros FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Servicios
CREATE TABLE public.servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10,2) NOT NULL,
  duracion_min INTEGER NOT NULL DEFAULT 60,
  imagen_url TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.servicios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicios TO authenticated;
GRANT ALL ON public.servicios TO service_role;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active servicios" ON public.servicios FOR SELECT TO anon, authenticated USING (estado = 'activo' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage servicios" ON public.servicios FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Reservas
CREATE TABLE public.reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  peluquero_id UUID NOT NULL REFERENCES public.peluqueros(id),
  servicio_id UUID NOT NULL REFERENCES public.servicios(id),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente_pago',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservas TO authenticated;
GRANT ALL ON public.reservas TO service_role;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own reservas" ON public.reservas FOR SELECT TO authenticated USING (auth.uid() = cliente_id);
CREATE POLICY "Clients create own reservas" ON public.reservas FOR INSERT TO authenticated WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Clients update own reservas" ON public.reservas FOR UPDATE TO authenticated USING (auth.uid() = cliente_id);
CREATE POLICY "Admins read all reservas" ON public.reservas FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all reservas" ON public.reservas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- Public can read only busy slots (for availability calc). Read via server fn instead — no anon policy needed.

-- Pagos
CREATE TABLE public.pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID REFERENCES public.reservas(id) ON DELETE SET NULL,
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monto NUMERIC(10,2) NOT NULL,
  metodo TEXT NOT NULL,
  fecha_pago TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado TEXT NOT NULL DEFAULT 'pagado',
  tipo TEXT NOT NULL DEFAULT 'web',
  nota TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagos TO authenticated;
GRANT ALL ON public.pagos TO service_role;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own pagos" ON public.pagos FOR SELECT TO authenticated USING (auth.uid() = cliente_id);
CREATE POLICY "Clients create own pagos" ON public.pagos FOR INSERT TO authenticated WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Admins manage all pagos" ON public.pagos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Pedidos personalizados
CREATE TABLE public.pedidos_personalizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado TEXT NOT NULL DEFAULT 'enviado',
  descripcion TEXT
);
GRANT SELECT, INSERT ON public.pedidos_personalizados TO authenticated;
GRANT ALL ON public.pedidos_personalizados TO service_role;
ALTER TABLE public.pedidos_personalizados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own pedidos" ON public.pedidos_personalizados FOR SELECT TO authenticated USING (auth.uid() = cliente_id);
CREATE POLICY "Clients create own pedidos" ON public.pedidos_personalizados FOR INSERT TO authenticated WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Admins read all pedidos" ON public.pedidos_personalizados FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
