import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createPeluquero, updatePeluquero } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/peluqueros")({
  head: () => ({ meta: [{ title: "Peluqueros — Admin" }] }),
  component: PeluquerosAdmin,
});

function PeluquerosAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "peluqueros"],
    queryFn: async () => {
      const { data, error } = await supabase.from("peluqueros").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const createFn = useServerFn(createPeluquero);
  const updateFn = useServerFn(updatePeluquero);

  const saveMut = useMutation({
    mutationFn: async (payload: any) => editing ? updateFn({ data: { ...payload, id: editing.id } }) : createFn({ data: payload }),
    onSuccess: () => {
      toast.success(editing ? "Peluquera actualizada" : "Peluquera agregada");
      qc.invalidateQueries({ queryKey: ["admin", "peluqueros"] });
      qc.invalidateQueries({ queryKey: ["peluqueros"] });
      setOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    saveMut.mutate({
      nombre_completo: String(f.get("nombre_completo") ?? ""),
      dni: String(f.get("dni") ?? ""),
      email: String(f.get("email") ?? ""),
      telefono: String(f.get("telefono") ?? ""),
      especialidad: String(f.get("especialidad") ?? ""),
      horario: String(f.get("horario") ?? ""),
      foto_url: String(f.get("foto_url") ?? ""),
      estado: (f.get("estado") as string) ?? "activo",
    });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Peluqueras</h1>
          <p className="mt-1 text-muted-foreground">Administra tu equipo.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-full" onClick={() => setEditing(null)}><Plus className="mr-2 h-4 w-4" /> Agregar</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Agregar"} peluquera</DialogTitle></DialogHeader>
            <form onSubmit={onSubmit} className="space-y-3">
              <div><Label>Nombre completo</Label><Input name="nombre_completo" defaultValue={editing?.nombre_completo} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>DNI</Label><Input name="dni" defaultValue={editing?.dni ?? ""} /></div>
                <div><Label>Teléfono</Label><Input name="telefono" defaultValue={editing?.telefono ?? ""} /></div>
              </div>
              <div><Label>Email</Label><Input name="email" type="email" defaultValue={editing?.email ?? ""} /></div>
              <div><Label>Especialidad</Label><Input name="especialidad" defaultValue={editing?.especialidad ?? ""} /></div>
              <div><Label>Horario</Label><Input name="horario" defaultValue={editing?.horario ?? ""} placeholder="Lun-Sáb 9:00-18:00" /></div>
              <div><Label>Foto (URL)</Label><Input name="foto_url" defaultValue={editing?.foto_url ?? ""} /></div>
              {editing && (
                <div><Label>Estado</Label>
                  <select name="estado" defaultValue={editing.estado} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={saveMut.isPending}>{saveMut.isPending ? "Guardando..." : "Guardar"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((p: any) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start gap-4">
              <img src={p.foto_url ?? ""} alt={p.nombre_completo} className="h-16 w-16 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display truncate text-lg font-semibold">{p.nombre_completo}</h3>
                  <Badge variant={p.estado === "activo" ? "default" : "secondary"}>{p.estado}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.especialidad}</p>
                <p className="text-xs text-muted-foreground">{p.horario}</p>
                <p className="text-xs text-muted-foreground">{p.telefono} · {p.email}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="mr-1 h-3 w-3" /> Editar</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}