import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hdagbgxumbskxaetqqhq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_nG2Vs3CybMIfHbZ2btzHtA_U47tl2L7";

// Necesitamos la SERVICE ROLE KEY para operaciones administrativas
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada");
  console.log("\n📋 Pasos para obtener la SERVICE ROLE KEY:");
  console.log("1. Ve a https://app.supabase.com");
  console.log("2. Selecciona tu proyecto");
  console.log("3. Ve a Settings → API → Project API Keys");
  console.log("4. Copia la clave 'service_role' (la más larga)");
  console.log("5. Copia este comando en PowerShell:");
  console.log('   $env:SUPABASE_SERVICE_ROLE_KEY="TU_CLAVE_AQUI"; node setup-admin.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setupAdmin() {
  console.log("🚀 Iniciando setup del admin...\n");

  try {
    // 1. Crear usuario admin
    console.log("1️⃣ Creando usuario admin...");
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email: "carrascalpriscila@gmail.com",
      password: "contraseña123",
      email_confirm: true,
    });

    if (signUpError) {
      if (signUpError.message.includes("already exists")) {
        console.log("   ✅ Usuario ya existe");
      } else {
        throw signUpError;
      }
    } else {
      console.log("   ✅ Usuario creado:", user?.user?.id);
    }

    // 2. Crear tabla de categorías
    console.log("\n2️⃣ Creando tabla de categorías...");
    const { error: createTableError } = await supabase.rpc("execute_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.categoria_servicios (
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

        DROP POLICY IF EXISTS "Anon can read active categories" ON public.categoria_servicios;
        DROP POLICY IF EXISTS "Authenticated can read categories or all if admin" ON public.categoria_servicios;
        DROP POLICY IF EXISTS "Admins insert categories" ON public.categoria_servicios;
        DROP POLICY IF EXISTS "Admins update categories" ON public.categoria_servicios;
        DROP POLICY IF EXISTS "Admins delete categories" ON public.categoria_servicios;

        CREATE POLICY "Anon can read active categories" ON public.categoria_servicios FOR SELECT TO anon USING (estado = 'activo');
        CREATE POLICY "Authenticated can read categories or all if admin" ON public.categoria_servicios FOR SELECT TO authenticated USING (estado = 'activo' OR public.has_role(auth.uid(), 'admin'));
        CREATE POLICY "Admins insert categories" ON public.categoria_servicios FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
        CREATE POLICY "Admins update categories" ON public.categoria_servicios FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
        CREATE POLICY "Admins delete categories" ON public.categoria_servicios FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

        ALTER TABLE public.servicios ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES public.categoria_servicios(id) ON DELETE SET NULL;
        ALTER TABLE public.servicios ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;
      `,
    });

    if (createTableError) {
      console.log("   ⚠️  (puede ser que ya exista):", createTableError.message);
    } else {
      console.log("   ✅ Tabla creada");
    }

    // 3. Insertar categorías
    console.log("\n3️⃣ Insertando categorías...");
    const { error: insertCatError } = await supabase
      .from("categoria_servicios")
      .insert([
        {
          nombre: "Cortes de Cabello",
          descripcion: "Descubre nuestras opciones de cortes modernos y clásicos",
          imagen_url: "https://images.unsplash.com/photo-1559599810-46d1953a6310?w=500&h=400&fit=crop",
          orden: 0,
          estado: "activo",
        },
        {
          nombre: "Coloración",
          descripcion: "Técnicas avanzadas de color y tinturas profesionales",
          imagen_url: "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=500&h=400&fit=crop",
          orden: 1,
          estado: "activo",
        },
        {
          nombre: "Tratamientos Capilares",
          descripcion: "Restaura y nutre tu cabello con nuestros tratamientos premium",
          imagen_url: "https://images.unsplash.com/photo-1570157139519-a95d156e3878?w=500&h=400&fit=crop",
          orden: 2,
          estado: "activo",
        },
        {
          nombre: "Alisado y Planchado",
          descripcion: "Cabello liso, brillante y duradero",
          imagen_url: "https://images.unsplash.com/photo-1597066300935-579e22a3fa6e?w=500&h=400&fit=crop",
          orden: 3,
          estado: "activo",
        },
        {
          nombre: "Manicure y Pedicure",
          descripcion: "Cuidado experto de manos y pies",
          imagen_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=400&fit=crop",
          orden: 4,
          estado: "activo",
        },
        {
          nombre: "Maquillaje",
          descripcion: "Maquillaje profesional para cualquier ocasión",
          imagen_url: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&h=400&fit=crop",
          orden: 5,
          estado: "activo",
        },
      ])
      .select("id,nombre");

    if (insertCatError) {
      console.log("   ⚠️  Error:", insertCatError.message);
    } else {
      console.log("   ✅ Categorías insertadas");
    }

    // 4. Obtener categorías para insertar servicios
    console.log("\n4️⃣ Insertando servicios...");
    const { data: categorias } = await supabase
      .from("categoria_servicios")
      .select("id,nombre")
      .eq("estado", "activo");

    if (categorias && categorias.length > 0) {
      const categoriasMap = Object.fromEntries(categorias.map((c) => [c.nombre, c.id]));

      // Insertar servicios por categoría
      const servicios = [
        // Cortes
        {
          nombre: "Corte Clásico",
          descripcion: "Corte moderno y personalizado con acabado profesional",
          precio: 80,
          duracion_min: 45,
          imagen_url: "https://images.unsplash.com/photo-1559599810-46d1953a6310?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Cortes de Cabello"],
          orden: 0,
        },
        {
          nombre: "Corte Bob",
          descripcion: "Clásico corte bob con capas y volumen",
          precio: 85,
          duracion_min: 45,
          imagen_url: "https://images.unsplash.com/photo-1535307671215-eba6d0cdeaf8?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Cortes de Cabello"],
          orden: 1,
        },
        {
          nombre: "Corte Mariposa",
          descripcion: "Corte vaporoso con movimiento y ligereza",
          precio: 90,
          duracion_min: 50,
          imagen_url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Cortes de Cabello"],
          orden: 2,
        },
        {
          nombre: "Corte Pixie",
          descripcion: "Corte corto y moderno para rostros redondos o cuadrados",
          precio: 75,
          duracion_min: 40,
          imagen_url: "https://images.unsplash.com/photo-1584932917961-826c08ee6d45?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Cortes de Cabello"],
          orden: 3,
        },
        // Coloración
        {
          nombre: "Coloración Completa",
          descripcion: "Tinte profesional con cobertura completa y duradero",
          precio: 150,
          duracion_min: 120,
          imagen_url: "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Coloración"],
          orden: 0,
        },
        {
          nombre: "Balayage Moderno",
          descripcion: "Técnica de iluminación natural para efecto degradado",
          precio: 200,
          duracion_min: 150,
          imagen_url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Coloración"],
          orden: 1,
        },
        {
          nombre: "Ombré Hair",
          descripcion: "Efecto de color gradual de oscuro a claro",
          precio: 180,
          duracion_min: 140,
          imagen_url: "https://images.unsplash.com/photo-1596703690583-8c9ec03fd66e?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Coloración"],
          orden: 2,
        },
        // Tratamientos
        {
          nombre: "Tratamiento Capilar Profundo",
          descripcion: "Mascarilla hidratante intensiva",
          precio: 90,
          duracion_min: 60,
          imagen_url: "https://images.unsplash.com/photo-1570157139519-a95d156e3878?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Tratamientos Capilares"],
          orden: 0,
        },
        {
          nombre: "Botox Capilar",
          descripcion: "Reconstrucción profunda con proteínas y queratina",
          precio: 120,
          duracion_min: 90,
          imagen_url: "https://images.unsplash.com/photo-1583881298891-b3a2f2311838?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Tratamientos Capilares"],
          orden: 1,
        },
        // Alisado
        {
          nombre: "Alisado Brasileño",
          descripcion: "Tratamiento alisador permanente y duradero",
          precio: 180,
          duracion_min: 180,
          imagen_url: "https://images.unsplash.com/photo-1597066300935-579e22a3fa6e?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Alisado y Planchado"],
          orden: 0,
        },
        {
          nombre: "Planchado Clásico",
          descripcion: "Planchado temporal con plancha de calidad profesional",
          precio: 60,
          duracion_min: 50,
          imagen_url: "https://images.unsplash.com/photo-1522338242992-94a2893ba3a7?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Alisado y Planchado"],
          orden: 1,
        },
        // Manicure y Pedicure
        {
          nombre: "Manicure Gel",
          descripcion: "Gel resistente con acabado impecable",
          precio: 65,
          duracion_min: 60,
          imagen_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Manicure y Pedicure"],
          orden: 0,
        },
        {
          nombre: "Pedicure Spa",
          descripcion: "Cuidado relajante para los pies con masaje",
          precio: 75,
          duracion_min: 70,
          imagen_url: "https://images.unsplash.com/photo-1604302307066-81342ee5ff30?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Manicure y Pedicure"],
          orden: 1,
        },
        // Maquillaje
        {
          nombre: "Maquillaje Profesional",
          descripcion: "Maquillaje artístico para eventos especiales",
          precio: 120,
          duracion_min: 90,
          imagen_url: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Maquillaje"],
          orden: 0,
        },
        {
          nombre: "Maquillaje de Novia",
          descripcion: "Maquillaje perfecto para tu día especial",
          precio: 150,
          duracion_min: 120,
          imagen_url: "https://images.unsplash.com/photo-1578926078328-123a79edd688?w=500&h=400&fit=crop",
          categoria_id: categoriasMap["Maquillaje"],
          orden: 1,
        },
      ];

      const { error: insertServError } = await supabase.from("servicios").insert(
        servicios
          .filter((s) => s.categoria_id)
          .map((s) => ({
            ...s,
            estado: "activo",
          }))
      );

      if (insertServError) {
        console.log("   ⚠️  Error:", insertServError.message);
      } else {
        console.log("   ✅ Servicios insertados:", servicios.length);
      }
    }

    console.log("\n✅ Setup completado exitosamente!\n");
    console.log("📍 Datos de acceso admin:");
    console.log("   Email: carrascalpriscila@gmail.com");
    console.log("   Contraseña: contraseña123");
    console.log("\n🔗 Para iniciar sesión:");
    console.log("   1. Ve a http://localhost:5173");
    console.log("   2. Haz clic en 'Iniciar Sesión'");
    console.log("   3. Ingresa las credenciales");
    console.log("   4. Verás el menú admin con 'Servicios'");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

setupAdmin();
