import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Callback error", error);
        toast.error("No se pudo completar el inicio de sesión con Google");
        navigate({ to: "/auth" });
        return;
      }

      if (data.session) {
        toast.success("¡Has iniciado sesión con Google!");
        navigate({ to: "/" });
      } else {
        navigate({ to: "/auth" });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Completando acceso con Google...</p>
    </main>
  );
}
