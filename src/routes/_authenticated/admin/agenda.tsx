import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { listAllReservas } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Admin" }] }),
  component: AgendaPage,
});

function AgendaPage() {
  const fn = useServerFn(listAllReservas);
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["admin", "reservas"],
    queryFn: () => fn(),
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-muted-foreground">Cargando agenda...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Agenda general</h1>
        <Card className="mt-6 p-6 text-destructive">
          <p className="font-medium">Error al cargar las reservas:</p>
          <pre className="mt-2 whitespace-pre-wrap text-sm">{(error as Error)?.message ?? String(error)}</pre>
        </Card>
      </main>
    );
  }
  const [filtro, setFiltro] = useState("");
  const [peluId, setPeluId] = useState<string>("all");

  const peluqueros = useMemo(() => {
    const map = new Map<string, string>();
    (data ?? []).forEach((r: any) => r.peluqueros && map.set(r.peluqueros.id, r.peluqueros.nombre_completo));
    return Array.from(map, ([id, nombre]) => ({ id, nombre }));
  }, [data]);

  const filtered = (data ?? []).filter((r: any) => {
    const name = r.peluqueros?.nombre_completo?.toLowerCase() ?? "";
    if (peluId !== "all" && r.peluqueros?.id !== peluId) return false;
    if (filtro && !name.includes(filtro.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce((acc: Record<string, any[]>, r: any) => {
    (acc[r.fecha] ??= []).push(r);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Agenda general</h1>
      <p className="mt-1 text-muted-foreground">Todas las citas de la peluquería.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_260px]">
        <Input placeholder="Buscar por peluquera..." value={filtro} onChange={(e) => setFiltro(e.target.value)} />
        <Select value={peluId} onValueChange={setPeluId}>
          <SelectTrigger><SelectValue placeholder="Filtrar por peluquera" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las peluqueras</SelectItem>
            {peluqueros.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 space-y-6">
        {Object.entries(grouped).map(([fecha, rows]) => (
          <div key={fecha}>
            <h2 className="font-display text-xl font-semibold text-primary">{format(new Date(fecha), "EEEE d 'de' MMMM, yyyy", { locale: es })}</h2>
            <div className="mt-3 grid gap-2">
              {rows.sort((a: any, b: any) => a.hora.localeCompare(b.hora)).map((r: any) => (
                <Card key={r.id} className="grid gap-2 p-4 sm:grid-cols-[80px_1fr_1fr_1fr_auto] sm:items-center">
                  <div className="font-display text-lg text-primary">{String(r.hora).slice(0,5)}</div>
                  <div className="text-sm"><div className="font-medium">{r.servicios?.nombre}</div><div className="text-muted-foreground">{r.servicios?.duracion_min} min</div></div>
                  <div className="text-sm"><div className="font-medium">{r.profiles?.nombre_completo}</div><div className="text-muted-foreground">{r.profiles?.telefono}</div></div>
                  <div className="text-sm"><div className="text-muted-foreground">Peluquera</div><div className="font-medium">{r.peluqueros?.nombre_completo}</div></div>
                  <Badge variant={r.estado === "confirmada" ? "default" : "secondary"}>{r.estado.replace("_"," ")}</Badge>
                </Card>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <Card className="p-8 text-center text-muted-foreground">Sin citas.</Card>}
      </div>
    </main>
  );
}