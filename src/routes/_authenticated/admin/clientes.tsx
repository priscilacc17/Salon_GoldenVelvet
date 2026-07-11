import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Edit, Trash2, Plus } from "lucide-react";
import { listAllClientes } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/clientes")({
  head: () => ({ meta: [{ title: "Gestionar Clientes — Admin" }] }),
  component: ClientesAdmin,
});

type Cliente = {
  id: string;
  nombre_completo: string;
  dni?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  metodo_auth: string;
  estado: string;
  created_at: string;
};

function ClientesAdmin() {
  const qc = useQueryClient();
  const fn = useServerFn(listAllClientes);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente> | null>(null);

  const { data, isLoading } = useQuery({ 
    queryKey: ["admin", "clientes"], 
    queryFn: () => fn() 
  });

  const updateClienteMut = useMutation({
    mutationFn: async (cliente: Partial<Cliente>) => {
      const { id, ...updateData } = cliente;
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "clientes"] });
      setFormData(null);
      setShowForm(false);
      toast.success("Cliente actualizado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteClienteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ estado: "inactivo" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "clientes"] });
      toast.success("Cliente desactivado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Gestionar Clientes</h1>
          <p className="mt-1 text-muted-foreground">Información completa de las clientas registradas.</p>
        </div>
        <Button 
          onClick={() => { setFormData({}); setShowForm(true); }} 
          className="rounded-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Formulario de Cliente */}
      {showForm && (
        <Card className="mb-8 p-6">
          <h2 className="font-display text-xl font-semibold mb-4">
            {formData?.id ? "Editar" : "Nuevo"} Cliente
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre Completo *</label>
              <Input
                value={formData?.nombre_completo ?? ""}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className="text-sm font-medium">DNI</label>
              <Input
                value={formData?.dni ?? ""}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="DNI"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData?.email ?? ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={formData?.telefono ?? ""}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Teléfono"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Dirección</label>
              <Textarea
                value={formData?.direccion ?? ""}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Dirección completa"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fecha de Nacimiento</label>
              <Input
                type="date"
                value={formData?.fecha_nacimiento ?? ""}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Estado</label>
              <select 
                value={formData?.estado ?? "activo"}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={() => {
                if (!formData?.nombre_completo || !formData?.email) {
                  toast.error("Nombre y email son obligatorios");
                  return;
                }
                updateClienteMut.mutate(formData as Cliente);
              }}
              disabled={updateClienteMut.isPending}
            >
              Guardar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => { setShowForm(false); setFormData(null); }}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Tabla de Clientes */}
      <Card className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Nacimiento</TableHead>
              <TableHead>Auth</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            )}
            {!isLoading && (!data || data.length === 0) && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No hay clientes registrados</TableCell>
              </TableRow>
            )}
            {data?.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nombre_completo}</TableCell>
                <TableCell>{c.dni ?? "—"}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.telefono ?? "—"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{c.direccion ?? "—"}</TableCell>
                <TableCell>{c.fecha_nacimiento ?? "—"}</TableCell>
                <TableCell className="text-xs">{c.metodo_auth}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded ${c.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.estado}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(c.created_at), "dd/MM/yyyy")}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setFormData(c); setShowForm(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteClienteMut.mutate(c.id)}
                    disabled={deleteClienteMut.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}