import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { registrarPedidoWhatsapp } from "@/lib/reservas.functions";

const WHATSAPP_NUMBER = "51938970992";

export const Route = createFileRoute("/_authenticated/pedido-personalizado")({
  head: () => ({ meta: [{ title: "Pedido personalizado — Golden Velvet" }] }),
  component: PedidoPersonalizado,
});

function PedidoPersonalizado() {
  const [desc, setDesc] = useState("");
  const fn = useServerFn(registrarPedidoWhatsapp);
  const mut = useMutation({
    mutationFn: async () => fn({ data: { descripcion: desc } }),
    onSuccess: (result: any) => {
      const text = encodeURIComponent(`Hola Salón Golden Velvet, quisiera una cotización para: ${desc}`);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
      if (result?.persisted === false) {
        toast.warning(result.warning || "Se abrió WhatsApp, pero no se pudo guardar el pedido en la base de datos.");
      } else {
        toast.success("Te redirigimos a WhatsApp");
      }
      setDesc("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Pedido personalizado</h1>
      <p className="mt-1 text-muted-foreground">Cuéntanos qué necesitas y te enviaremos a WhatsApp para una cotización directa.</p>

      <Card className="mt-8 space-y-4 p-6">
        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Ej: Quisiera un servicio para novia con maquillaje, peinado y prueba previa."
          rows={6}
          maxLength={500}
        />
        <Button size="lg" className="w-full rounded-full" onClick={() => desc.trim().length >= 3 ? mut.mutate() : toast.error("Escribe una descripción")} disabled={mut.isPending}>
          <MessageCircle className="mr-2 h-4 w-4" /> {mut.isPending ? "Enviando..." : "Enviar por WhatsApp"}
        </Button>
      </Card>
    </main>
  );
}