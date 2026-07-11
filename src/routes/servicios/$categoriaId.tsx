import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/ImageCarousel";

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  requisitos_previos: string | null;
  precio: number;
  duracion_min: number;
  imagen_url: string | null;
  imagenes_carrusel: string[] | null;
  orden: number;
};

type Categoria = {
  nombre: string;
  descripcion: string | null;
};

const serviciosByCategoriaQuery = (categoriaId: string) =>
  queryOptions({
    queryKey: ["servicios", "categoria", categoriaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servicios")
        .select("id,nombre,descripcion,requisitos_previos,precio,duracion_min,imagen_url,imagenes_carrusel,orden")
        .eq("categoria_id", categoriaId)
        .eq("estado", "activo")
        .order("orden", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Servicio[];
    },
  });

const categoriaByCategoriaQuery = (categoriaId: string) =>
  queryOptions({
    queryKey: ["categoria", categoriaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categoria_servicios")
        .select("nombre,descripcion")
        .eq("id", categoriaId)
        .eq("estado", "activo")
        .single();
      if (error) throw error;
      return data as Categoria;
    },
  });

export const Route = createFileRoute("/servicios/$categoriaId")({
  head: ({ params }) => ({
    meta: [
      { title: `Servicios — Salón Golden Velvet` },
      { name: "description", content: "Explora nuestros servicios premium." },
    ],
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(serviciosByCategoriaQuery(params.categoriaId));
    context.queryClient.ensureQueryData(categoriaByCategoriaQuery(params.categoriaId));
  },
  component: ServiciosCategoriaPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">Error: {error.message}</div>
  ),
});

function ServiciosCategoriaPage() {
  const navigate = useNavigate();
  const { categoriaId } = Route.useParams();
  const { data: servicios } = useSuspenseQuery(serviciosByCategoriaQuery(categoriaId));
  const { data: categoria } = useSuspenseQuery(categoriaByCategoriaQuery(categoriaId));
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);

  const handleReservar = (servicioId: string) => {
    navigate({
      to: "/reservar",
      search: { servicioId },
    });
  };

  const getCarouselImages = (servicio: Servicio): string[] => {
    const images: string[] = [];
    
    // Agregar imágenes del carrusel si existen
    if (servicio.imagenes_carrusel && Array.isArray(servicio.imagenes_carrusel)) {
      images.push(...servicio.imagenes_carrusel.filter((img): img is string => typeof img === 'string' && img.length > 0));
    }
    
    // Si no hay carrusel, usar la imagen principal
    if (images.length === 0 && servicio.imagen_url) {
      images.push(servicio.imagen_url);
    }
    
    return images;
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <button
        onClick={() => navigate({ to: "/servicios" })}
        className="mb-8 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a categorías
      </button>

      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          {categoria.nombre}
        </h1>
        {categoria.descripcion && (
          <p className="mt-3 text-lg text-muted-foreground">{categoria.descripcion}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {servicios.map((s, i) => {
          const carouselImages = getCarouselImages(s);
          return (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.08 }}
              className="group flex h-full flex-col rounded-[1.75rem] border border-border/70 bg-card/80 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.28)]"
            >
              {s.imagen_url && (
                <button
                  onClick={() => setSelectedServicio(s)}
                  className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 cursor-pointer"
                >
                  <img
                    src={s.imagen_url}
                    alt={s.nombre}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {carouselImages.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                      <div className="rounded-full bg-white/90 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6-3a1 1 0 11-2 0 1 1 0 012 0zm2 0a1 1 0 11-2 0 1 1 0 012 0zm2 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              )}

              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    S/ {Number(s.precio).toFixed(0)}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="font-display text-xl font-semibold">{s.nombre}</h3>
                  {s.descripcion && (
                    <p className="text-sm leading-6 text-muted-foreground">{s.descripcion}</p>
                  )}
                  
                  {/* Requisitos previos */}
                  {s.requisitos_previos && (
                    <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Requisitos previos:</p>
                      <p className="text-xs leading-5 text-amber-800">{s.requisitos_previos}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t border-border/60 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{s.duracion_min} min</span>
                  </div>
                  <Button
                    onClick={() => handleReservar(s.id)}
                    className="w-full rounded-full"
                    size="sm"
                  >
                    Reservar
                  </Button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {servicios.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay servicios disponibles en esta categoría.</p>
        </div>
      )}

      {/* Carrusel Modal */}
      {selectedServicio && (
        <ImageCarousel
          images={getCarouselImages(selectedServicio)}
          title={selectedServicio.nombre}
          onClose={() => setSelectedServicio(null)}
        />
      )}
    </main>
  );
}
