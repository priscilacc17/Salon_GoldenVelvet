import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Scissors, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/use-session";
import { cn } from "@/lib/utils";

const publicLinks = [
  { to: "/", label: "Inicio" },
  { to: "/servicios", label: "Servicios" },
];

const clientLinks = [
  { to: "/reservar", label: "Reservar" },
  { to: "/mis-reservas", label: "Mis Reservas" },
  { to: "/pedido-personalizado", label: "Pedido Personalizado" },
];

const adminLinks = [
  { to: "/admin/servicios", label: "Catálogo" },
  { to: "/admin/agenda", label: "Agenda" },
  { to: "/admin/peluqueros", label: "Peluqueros" },
  { to: "/admin/clientes", label: "Clientes" },
  { to: "/admin/cobros", label: "Cobros" },
];

export function Navbar() {
  const { session, isAdmin, loading } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    ...publicLinks,
    ...(session && !isAdmin ? clientLinks : []),
    ...(isAdmin ? adminLinks : []),
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-xl transition-colors",
        scrolled ? "bg-background/90" : "bg-background/60",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:flex sm:justify-between sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Scissors className="h-5 w-5 shrink-0 text-primary" />
          <span className="font-display truncate text-lg font-bold tracking-wide sm:text-xl">
            Salón <span className="gold-gradient-text">Golden Velvet</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === l.to ? "text-primary" : "text-foreground/80",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {loading ? null : session ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Cerrar sesión
            </Button>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 sm:hidden"
          aria-label="Menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-background/95 px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  pathname === l.to ? "bg-secondary text-primary" : "text-foreground/80",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-border/40 pt-2">
              {session ? (
                <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                  Cerrar sesión
                </Button>
              ) : (
                <Button asChild size="sm" className="w-full rounded-full">
                  <Link to="/auth">Iniciar sesión</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}