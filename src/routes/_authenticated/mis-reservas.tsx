import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Scissors, User, CreditCard, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { confirmarPagoReserva } from "@/lib/reservas.functions";
import { generatePaymentPDF } from "@/lib/pdf-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mis-reservas")({
  head: () => ({ meta: [{ title: "Mis reservas — Golden Velvet" }] }),
  component: MisReservas,
});

function MisReservas() {
  const navigate = useNavigate();
  const pagarFn = useServerFn(confirmarPagoReserva);
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["mis-reservas"],
    queryFn: async () => {
      const { data: reservas, error } = await supabase
        .from("reservas")
        .select("id, fecha, hora, estado, servicios(nombre, precio, duracion_min), peluqueros(nombre_completo)")
        .order("fecha", { ascending: false });
      if (error) throw error;
      
      // Obtener datos del cliente
      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre_completo")
        .single();

      return (reservas ?? []).map(r => ({
        ...r,
        clientName: profile?.nombre_completo || "Cliente"
      }));
    },
  });

  const pagarMut = useMutation({
    mutationFn: async (reservaId: string) => pagarFn({ data: { reserva_id: reservaId, metodo: "Web" } }),
    onSuccess: () => {
      toast.success("¡Pago registrado! Tu cita está confirmada.");
      refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleDescargarPDF = async (reserva: any) => {
    try {
      await generatePaymentPDF(
        reserva.id,
        reserva.clientName,
        reserva.servicios?.nombre || "Servicio",
        reserva.servicios?.precio || 0,
        format(new Date(reserva.fecha), "dd/MM/yyyy"),
        "Web"
      );
      toast.success("PDF descargado correctamente");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo generar el PDF";
      console.error("Error al generar PDF", error);
      toast.error(message);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Mis reservas</h1>
      <p className="mt-1 text-muted-foreground">Historial completo de tus citas.</p>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-muted-foreground">Cargando...</p>}
        {!isLoading && (!data || data.length === 0) && (
          <Card className="p-8 text-center text-muted-foreground">Aún no tienes reservas.</Card>
        )}
        {data?.map((r: any) => (
          <Card key={r.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 font-display text-lg font-semibold"><Scissors className="h-4 w-4 text-primary" /> {r.servicios?.nombre}</div>
              <div className="flex flex-wrap gap-3 text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {r.peluqueros?.nombre_completo}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {format(new Date(r.fecha), "PPP", { locale: es })}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {String(r.hora).slice(0,5)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 sm:justify-end">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg text-primary">S/ {Number(r.servicios?.precio ?? 0).toFixed(0)}</span>
                <Badge variant={r.estado === "confirmada" ? "default" : r.estado === "pendiente_pago" ? "secondary" : "outline"}>{r.estado.replace("_", " ")}</Badge>
              </div>
              <div className="flex gap-2">
                {r.estado === "pendiente_pago" && (
                  <Button 
                    size="sm" 
                    onClick={() => pagarMut.mutate(r.id)}
                    disabled={pagarMut.isPending}
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    {pagarMut.isPending ? "Pagando..." : "Completar pago"}
                  </Button>
                )}
                {r.estado === "confirmada" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDescargarPDF(r)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}