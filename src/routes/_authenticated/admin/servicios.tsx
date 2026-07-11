import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ChevronDown, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/servicios")({
  head: () => ({ meta: [{ title: "Gestionar Servicios — Admin" }] }),
  component: AdminServiciosPage,
});

type Categoria = {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
  estado: string;
};

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  requisitos_previos: string | null;
  precio: number;
  duracion_min: number;
  imagen_url: string | null;
  imagenes_carrusel: string[] | null;
  categoria_id: string | null;
  orden: number;
  estado: string;
};

function AdminServiciosPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [expandedCategoria, setExpandedCategoria] = useState<string | null>(null);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [showServicioForm, setShowServicioForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [vista, setVista] = useState<"categorias" | "servicios">("categorias");

  // Queries
  const categoriasQ = useQuery({
    queryKey: ["categorias", "admin"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("categoria_servicios")
        .select("*")
        .order("orden", { ascending: true }) as any);
      if (error) throw error;
      return (data ?? []) as Categoria[];
    },
  });

  const serviciosQ = useQuery({
    queryKey: ["servicios", "admin"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("servicios")
        .select("id,nombre,descripcion,requisitos_previos,precio,duracion_min,imagen_url,imagenes_carrusel,categoria_id,orden,estado") as any);
      if (error) throw error;
      return (data ?? []) as Servicio[];
    },
  });

  // Mutations
  const guardarCategoriaMut = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        const { error } = await (supabase
          .from("categoria_servicios")
          .update({
            nombre: data.nombre,
            descripcion: data.descripcion,
            imagen_url: data.imagen_url,
            estado: data.estado,
            orden: data.orden
          } as any)
          .eq("id", data.id) as any);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from("categoria_servicios")
          .insert([{
            nombre: data.nombre,
            descripcion: data.descripcion,
            imagen_url: data.imagen_url,
            estado: data.estado,
            orden: data.orden || 0
          } as any]) as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias", "admin"] });
      setFormData(null);
      setShowCategoriaForm(false);
      toast.success("Categoría guardada");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const guardarServicioMut = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        const { error } = await supabase
          .from("servicios")
          .update(data)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("servicios")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["servicios", "admin"] });
      setFormData(null);
      setShowServicioForm(null);
      toast.success("Servicio guardado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const eliminarCategoriaMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from("categoria_servicios")
        .delete()
        .eq("id", id) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categorias", "admin"] });
      toast.success("Categoría eliminada");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const eliminarServicioMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("servicios")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["servicios", "admin"] });
      toast.success("Servicio eliminado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleGuardarCategoria = () => {
    if (!formData?.nombre) {
      toast.error("El nombre es obligatorio");
      return;
    }
    guardarCategoriaMut.mutate({
      id: formData.id || undefined,
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      imagen_url: formData.imagen_url || null,
      orden: formData.orden || 0,
      estado: formData.estado || "activo",
    });
  };

  const handleGuardarServicio = () => {
    if (!formData?.nombre || !formData?.categoria_id || !formData?.precio) {
      toast.error("Nombre, categoría y precio son obligatorios");
      return;
    }
    guardarServicioMut.mutate({
      id: formData.id || undefined,
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      requisitos_previos: formData.requisitos_previos || null,
      precio: parseFloat(formData.precio),
      duracion_min: parseInt(formData.duracion_min) || 60,
      imagen_url: formData.imagen_url || null,
      imagenes_carrusel: formData.imagenes_carrusel && formData.imagenes_carrusel.length > 0 
        ? formData.imagenes_carrusel.filter((img: string) => img.trim())
        : [],
      categoria_id: formData.categoria_id,
      orden: formData.orden || 0,
      estado: formData.estado || "activo",
    });
  };

  const serviciosPorCategoria = (categoriaId: string) => {
    return (serviciosQ.data ?? []).filter((s) => s.categoria_id === categoriaId);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold">Gestionar Servicios</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-border bg-background/80 p-1">
            <button onClick={() => setVista("categorias")} className={vista === "categorias" ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" : "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground"}>Categorías</button>
            <button onClick={() => setVista("servicios")} className={vista === "servicios" ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" : "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground"}>Servicios</button>
          </div>
          <Button onClick={() => { setFormData({}); setShowCategoriaForm(true); }} className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Formulario de Categoría */}
      {showCategoriaForm && (
        <Card className="mb-8 p-6">
          <h2 className="font-display text-xl font-semibold mb-4">
            {formData?.id ? "Editar" : "Nueva"} Categoría
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData?.nombre ?? ""}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Cortes de Cabello"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={formData?.descripcion ?? ""}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción de la categoría"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL de Imagen</label>
              <Input
                value={formData?.imagen_url ?? ""}
                onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Orden</label>
              <Input
                type="number"
                value={formData?.orden ?? 0}
                onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleGuardarCategoria} disabled={guardarCategoriaMut.isPending}>
                Guardar
              </Button>
              <Button variant="outline" onClick={() => { setShowCategoriaForm(false); setFormData(null); }}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {vista === "categorias" ? (
        <div className="space-y-4">
          {categoriasQ.data?.map((categoria) => (
            <Card key={categoria.id} className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <button
                  onClick={() => setExpandedCategoria(expandedCategoria === categoria.id ? null : categoria.id)}
                  className="flex items-center gap-4 flex-1 text-left"
                >
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform",
                      expandedCategoria === categoria.id && "rotate-180"
                    )}
                  />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold">{categoria.nombre}</h3>
                    {categoria.descripcion && (
                      <p className="text-sm text-muted-foreground">{categoria.descripcion}</p>
                    )}
                  </div>
                </button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setFormData(categoria); setShowCategoriaForm(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => eliminarCategoriaMut.mutate(categoria.id)}
                    disabled={eliminarCategoriaMut.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expandedCategoria === categoria.id && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <Button
                    size="sm"
                    onClick={() => { setFormData({ categoria_id: categoria.id, imagenes_carrusel: [] }); setShowServicioForm(categoria.id); }}
                    className="rounded-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Servicio
                  </Button>

                  {/* Formulario de Servicio */}
                  {showServicioForm === categoria.id && (
                    <Card className="p-4 bg-muted">
                      <h4 className="font-display font-semibold mb-4">
                        {formData?.id ? "Editar" : "Nuevo"} Servicio
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Nombre</label>
                          <Input
                            value={formData?.nombre ?? ""}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Ej: Corte Bob"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Descripción</label>
                          <Textarea
                            value={formData?.descripcion ?? ""}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="Descripción del servicio"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Requisitos Previos</label>
                          <Textarea
                            value={formData?.requisitos_previos ?? ""}
                            onChange={(e) => setFormData({ ...formData, requisitos_previos: e.target.value })}
                            placeholder="Ej: No se realiza en cabello pintado de menos de 6 meses"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-sm font-medium">Precio</label>
                            <Input
                              type="number"
                              value={formData?.precio ?? ""}
                              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Duración (min)</label>
                            <Input
                              type="number"
                              value={formData?.duracion_min ?? 60}
                              onChange={(e) => setFormData({ ...formData, duracion_min: e.target.value })}
                              placeholder="60"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Orden</label>
                            <Input
                              type="number"
                              value={formData?.orden ?? 0}
                              onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">URL de Imagen Principal</label>
                          <Input
                            value={formData?.imagen_url ?? ""}
                            onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                            placeholder="https://ejemplo.com/imagen.jpg"
                          />
                        </div>

                        {/* Carrusel de Imágenes */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Imágenes del Carrusel</label>
                          <div className="space-y-2 bg-background p-3 rounded border">
                            {(formData?.imagenes_carrusel ?? []).map((img: string, idx: number) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <Input
                                  value={img}
                                  onChange={(e) => {
                                    const newCarrusel = [...(formData?.imagenes_carrusel ?? [])];
                                    newCarrusel[idx] = e.target.value;
                                    setFormData({ ...formData, imagenes_carrusel: newCarrusel });
                                  }}
                                  placeholder={`URL imagen ${idx + 1}`}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newCarrusel = (formData?.imagenes_carrusel ?? []).filter((_: string, i: number) => i !== idx);
                                    setFormData({ ...formData, imagenes_carrusel: newCarrusel });
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newCarrusel = [...(formData?.imagenes_carrusel ?? []), ""];
                                setFormData({ ...formData, imagenes_carrusel: newCarrusel });
                              }}
                              className="w-full"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Agregar Imagen
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleGuardarServicio}
                            disabled={guardarServicioMut.isPending}
                          >
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setShowServicioForm(null); setFormData(null); }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Lista de Servicios */}
                  <div className="space-y-2">
                    {serviciosPorCategoria(categoria.id).map((servicio) => (
                      <Card key={servicio.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-display font-semibold">{servicio.nombre}</h5>
                            {servicio.descripcion && (
                              <p className="text-sm text-muted-foreground">{servicio.descripcion}</p>
                            )}
                            {servicio.requisitos_previos && (
                              <p className="text-xs text-amber-700 mt-1">⚠️ {servicio.requisitos_previos}</p>
                            )}
                            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                              <span>S/ {Number(servicio.precio).toFixed(2)}</span>
                              <span>{servicio.duracion_min} min</span>
                              {servicio.imagenes_carrusel && servicio.imagenes_carrusel.length > 0 && (
                                <span>📸 {servicio.imagenes_carrusel.length} imágenes</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { 
                                setFormData({
                                  ...servicio,
                                  imagenes_carrusel: servicio.imagenes_carrusel || []
                                }); 
                                setShowServicioForm(categoria.id); 
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => eliminarServicioMut.mutate(servicio.id)}
                              disabled={eliminarServicioMut.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {serviciosQ.data?.map((servicio) => (
            <Card key={servicio.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold">{servicio.nombre}</h3>
                  {servicio.descripcion && <p className="mt-1 text-sm text-muted-foreground">{servicio.descripcion}</p>}
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">S/ {Number(servicio.precio).toFixed(0)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{servicio.duracion_min} min</span>
                <span>{servicio.estado}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {categoriasQ.data?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay categorías. ¡Crea la primera!</p>
        </div>
      )}
    </main>
  );
}
