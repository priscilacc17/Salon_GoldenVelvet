import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { listAllPagos, listAllClientes, registrarPagoWhatsapp } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/cobros")({
  head: () => ({ meta: [{ title: "Cobros — Admin" }] }),
  component: CobrosAdmin,
});

function CobrosAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [clienteId, setClienteId] = useState<string>("");
  const [metodo, setMetodo] = useState("Yape");

  const pagosFn = useServerFn(listAllPagos);
  const clientesFn = useServerFn(listAllClientes);
  const registrarFn = useServerFn(registrarPagoWhatsapp);

  const pagosQ = useQuery({ queryKey: ["admin", "pagos"], queryFn: () => pagosFn() });
  const clientesQ = useQuery({ queryKey: ["admin", "clientes"], queryFn: () => clientesFn() });

  const mut = useMutation({
    mutationFn: async (payload: { cliente_id: string; monto: number; metodo: string; nota?: string }) =>
      registrarFn({ data: payload }),
    onSuccess: () => {
      toast.success("Pago registrado");
      qc.invalidateQueries({ queryKey: ["admin", "pagos"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const monto = Number(f.get("monto"));
    if (!clienteId) return toast.error("Selecciona un cliente");
    if (!monto || monto <= 0) return toast.error("Monto inválido");
    mut.mutate({ cliente_id: clienteId, monto, metodo, nota: String(f.get("nota") ?? "") });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Cobros</h1>
          <p className="mt-1 text-muted-foreground">Pagos realizados por la web y acordados vía WhatsApp.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full"><Plus className="mr-2 h-4 w-4" /> Registrar pago WhatsApp</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar pago vía WhatsApp</DialogTitle></DialogHeader>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <Label>Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientesQ.data?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nombre_completo} ({c.email})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Monto (S/)</Label><Input name="monto" type="number" step="0.01" min="0" required /></div>
              <div>
                <Label>Método</Label>
                <Select value={metodo} onValueChange={setMetodo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yape">Yape</SelectItem>
                    <SelectItem value="Plin">Plin</SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Nota</Label><Input name="nota" placeholder="Descripción del servicio acordado" /></div>
              <Button type="submit" className="w-full" disabled={mut.isPending}>{mut.isPending ? "Guardando..." : "Registrar"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mt-8 overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagosQ.data?.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>{format(new Date(p.fecha_pago), "dd/MM/yyyy HH:mm")}</TableCell>
                <TableCell>{p.profiles?.nombre_completo ?? "—"}</TableCell>
                <TableCell>{p.reservas?.servicios?.nombre ?? p.nota ?? "—"}</TableCell>
                <TableCell>{p.metodo}</TableCell>
                <TableCell><Badge variant={p.tipo === "web" ? "default" : "secondary"}>{p.tipo}</Badge></TableCell>
                <TableCell className="text-right font-display text-primary">S/ {Number(p.monto).toFixed(2)}</TableCell>
                <TableCell>{p.estado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}