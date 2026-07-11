import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Get busy slots (times) for a peluquero on a date — used to render availability.
export const getBusySlots = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { peluquero_id: string; fecha: string }) =>
    z.object({ peluquero_id: z.string().uuid(), fecha: z.string() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("reservas")
      .select("hora, servicios(duracion_min)")
      .eq("peluquero_id", data.peluquero_id)
      .eq("fecha", data.fecha)
      .in("estado", ["pendiente_pago", "confirmada"]);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => ({
      hora: (r.hora as string).slice(0, 5),
      duracion: r.servicios?.duracion_min ?? 60,
    }));
  });

export const crearReserva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    servicio_id: string;
    peluquero_id: string;
    fecha: string;
    hora: string;
    cliente_id?: string;
  }) =>
    z
      .object({
        servicio_id: z.string().uuid(),
        peluquero_id: z.string().uuid(),
        fecha: z.string(),
        hora: z.string(),
        cliente_id: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const targetClienteId = data.cliente_id ?? context.userId;
    const { data: adminRole } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (data.cliente_id && data.cliente_id !== context.userId && !adminRole) {
      throw new Error("Solo los administradores pueden crear reservas para otro cliente.");
    }

    const { data: row, error } = await context.supabase
      .from("reservas")
      .insert({
        cliente_id: targetClienteId,
        servicio_id: data.servicio_id,
        peluquero_id: data.peluquero_id,
        fecha: data.fecha,
        hora: data.hora,
        estado: "pendiente_pago",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const confirmarPagoReserva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { reserva_id: string; metodo: string }) =>
    z.object({ reserva_id: z.string().uuid(), metodo: z.string().min(2).max(50) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: reserva, error: rErr } = await context.supabase
      .from("reservas")
      .select("id, cliente_id, servicios(precio)")
      .eq("id", data.reserva_id)
      .maybeSingle();
    if (rErr || !reserva) throw new Error("Reserva no encontrada");

    const { data: adminRole } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (reserva.cliente_id !== context.userId && !adminRole) {
      throw new Error("No tienes permiso para confirmar esta reserva.");
    }

    const monto = Number((reserva as any).servicios?.precio ?? 0);

    const { error: pErr } = await context.supabase.from("pagos").insert({
      reserva_id: reserva.id,
      cliente_id: reserva.cliente_id,
      monto,
      metodo: data.metodo,
      estado: "pagado",
      tipo: "web",
    });
    if (pErr) throw new Error(pErr.message);

    const { error: uErr } = await context.supabase
      .from("reservas")
      .update({ estado: "confirmada" })
      .eq("id", reserva.id);
    if (uErr) throw new Error(uErr.message);

    return { ok: true };
  });

export const registrarPedidoWhatsapp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { descripcion: string }) =>
    z.object({ descripcion: z.string().trim().min(3).max(500) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    try {
      const { error } = await context.supabase
        .from("pedidos_personalizados")
        .insert({ cliente_id: context.userId, descripcion: data.descripcion });

      if (error) {
        const isMissingTable = error.message?.includes("does not exist") || error.message?.includes("relation") || error.message?.includes("schema cache");
        if (isMissingTable) {
          console.warn("Pedido personalizado: la tabla no existe en Supabase, se continuará con WhatsApp.", error.message);
          return { ok: true, persisted: false, warning: "No se pudo guardar el pedido en la base de datos, pero se continúa con WhatsApp." };
        }
        throw new Error(error.message);
      }

      return { ok: true, persisted: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Pedido personalizado: error inesperado", message);
      return { ok: true, persisted: false, warning: message };
    }
  });