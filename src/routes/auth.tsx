import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Salón Golden Velvet" },
      { name: "description", content: "Accede a tu cuenta para reservar citas en Salón Golden Velvet." },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const signUpSchema = signInSchema.extend({
  nombre_completo: z.string().trim().min(2, "Ingresa tu nombre").max(100),
  dni: z.string().trim().min(6, "DNI inválido").max(20),
  telefono: z.string().trim().min(6, "Teléfono inválido").max(20),
  direccion: z.string().trim().min(3, "Dirección requerida").max(200),
  fecha_nacimiento: z.string().min(1, "Fecha de nacimiento requerida"),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signupNotice, setSignupNotice] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        setSignupNotice(null);
        toast.success("¡Sesión iniciada automáticamente!");
        navigate({ to: "/" });
      }
    };

    handleSession();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted || !session) return;
      if (event === "SIGNED_IN") {
        setSignupNotice(null);
        toast.success("¡Cuenta confirmada! Has iniciado sesión automáticamente.");
        navigate({ to: "/" });
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGoogle = async () => {
    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    setLoading(false);

    if (error) {
      console.error("Google OAuth error", error);
      toast.error(error.message || "Error al iniciar sesión con Google");
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("¡Bienvenida!");
    navigate({ to: "/" });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nombre_completo: parsed.data.nombre_completo,
          dni: parsed.data.dni,
          telefono: parsed.data.telefono,
          direccion: parsed.data.direccion,
          fecha_nacimiento: parsed.data.fecha_nacimiento,
          metodo_auth: "email",
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);

    setSignupNotice(
      "Te enviamos la confirmación de registro a tu correo. Confirma tu cuenta para iniciar sesión automáticamente.",
    );
    toast.success("Te enviamos la confirmación de registro a tu correo. Confirma tu cuenta para iniciar sesión automáticamente.");
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6 rounded-3xl border border-border/60 bg-card/60 p-8 backdrop-blur"
      >
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">
            Bienvenida a <span className="gold-gradient-text">Golden Velvet</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Accede o crea tu cuenta</p>
        </div>

        {signupNotice ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            {signupNotice}
          </div>
        ) : null}

        <Button variant="outline" className="w-full rounded-full" onClick={handleGoogle}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.2 35.7 26.7 37 24 37c-5.2 0-9.6-3.1-11.3-7.5l-6.5 5C9.6 40.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.5 35.7 45 30.4 45 24c0-1.2-.1-2.3-.4-3.5z" />
          </svg>
          Continuar con Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60" /></div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-card/60 px-2 text-muted-foreground">o</span></div>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="signup">Registrarse</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <Label htmlFor="s-email">Email</Label>
                <Input id="s-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="s-pass">Contraseña</Label>
                <Input id="s-pass" name="password" type="password" required autoComplete="current-password" />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full">
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <Label htmlFor="nombre_completo">Nombre completo</Label>
                <Input id="nombre_completo" name="nombre_completo" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dni">DNI</Label>
                  <Input id="dni" name="dni" required />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" name="telefono" required />
                </div>
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" name="direccion" required />
              </div>
              <div>
                <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
                <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" required />
              </div>
              <div>
                <Label htmlFor="u-email">Email</Label>
                <Input id="u-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="u-pass">Contraseña</Label>
                <Input id="u-pass" name="password" type="password" required autoComplete="new-password" minLength={6} />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full">
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}