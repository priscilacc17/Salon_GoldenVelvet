import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Categoria = {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
};

type ServicioListItem = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion_min: number;
  imagen_url: string | null;
  categoria_id: string | null;
};

const categoriasQuery = queryOptions({
  queryKey: ["categorias", "activos"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categoria_servicios")
      .select("id,nombre,descripcion,imagen_url,orden")
      .eq("estado", "activo")
      .order("orden", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Categoria[];
  },
});

const serviciosQuery = queryOptions({
  queryKey: ["servicios", "activos", "listado"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("servicios")
      .select("id,nombre,descripcion,precio,duracion_min,imagen_url,categoria_id")
      .eq("estado", "activo")
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ServicioListItem[];
  },
});

export const Route = createFileRoute("/servicios/")({
  head: () => ({
    meta: [
      { title: "Categorías de Servicios — Salón Golden Velvet" },
      { name: "description", content: "Explora nuestras categorías de servicios premium para consentirte de pies a cabeza." },
      { property: "og:title", content: "Categorías de Servicios" },
      { property: "og:description", content: "Descubre nuestras categorías de servicios premium." },
    ],
  }),
  loader: ({ context }) => {
    return Promise.all([
      context.queryClient.ensureQueryData(categoriasQuery),
      context.queryClient.ensureQueryData(serviciosQuery),
    ]);
  },
  component: ServiciosPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">Error: {error.message}</div>
  ),
});

function ServiciosPage() {
  const { data: categorias } = useSuspenseQuery(categoriasQuery);
  const { data: servicios } = useSuspenseQuery(serviciosQuery);
  const [vista, setVista] = useState<"categorias" | "servicios">("categorias");

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Nuestras <span className="gold-gradient-text">experiencias</span>
        </h1>
        <p className="mt-3 text-muted-foreground">Explora por categorías o mira todos los servicios disponibles.</p>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-background/80 p-1">
          <button onClick={() => setVista("categorias")} className={vista === "categorias" ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" : "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground"}>Categorías</button>
          <button onClick={() => setVista("servicios")} className={vista === "servicios" ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" : "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground"}>Servicios</button>
        </div>
      </div>

      {vista === "categorias" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 3) * 0.08 }}
          >
            <Link
              to={`/servicios/$categoriaId`}
              params={{ categoriaId: c.id }}
              className="group flex h-full flex-col rounded-[1.75rem] border border-border/70 bg-card/80 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.28)]"
            >
              {c.imagen_url && (
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  <img
                    src={c.imagen_url}
                    alt={c.nombre}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="font-display text-xl font-semibold">{c.nombre}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{c.descripcion}</p>
                </div>

                <div className="mt-2 flex items-center justify-end text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
                  Ver servicios <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {servicios.map((servicio, i) => (
            <motion.div
              key={servicio.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.06 }}
              className="rounded-[1.5rem] border border-border/70 bg-card/80 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl font-semibold">{servicio.nombre}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{servicio.descripcion}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">S/ {Number(servicio.precio).toFixed(0)}</div>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
                <span>{servicio.duracion_min} min</span>
                {servicio.categoria_id ? <span>Servicio</span> : null}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
