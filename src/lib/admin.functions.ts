import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: {
  supabase: any;
  userId: string;
}) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export const listAllReservas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("reservas")
      .select(
        "id, fecha, hora, estado, created_at, servicios(nombre, precio, duracion_min), peluqueros(id, nombre_completo), profiles(nombre_completo, telefono, email)",
      )
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAllClientes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, nombre_completo, dni, email, telefono, direccion, fecha_nacimiento, metodo_auth, estado, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAllPagos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("pagos")
      .select("id, monto, metodo, fecha_pago, estado, tipo, nota, reserva_id, cliente_id, profiles(nombre_completo, email), reservas(servicios(nombre))")
      .order("fecha_pago", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createPeluquero = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    nombre_completo: string;
    dni?: string;
    email?: string;
    telefono?: string;
    especialidad?: string;
    horario?: string;
    foto_url?: string;
  }) =>
    z
      .object({
        nombre_completo: z.string().trim().min(2).max(100),
        dni: z.string().trim().max(20).optional(),
        email: z.string().trim().email().max(255).optional().or(z.literal("")),
        telefono: z.string().trim().max(20).optional(),
        especialidad: z.string().trim().max(200).optional(),
        horario: z.string().trim().max(200).optional(),
        foto_url: z.string().trim().max(500).optional().or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("peluqueros")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updatePeluquero = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id: string;
    nombre_completo: string;
    telefono?: string;
    especialidad?: string;
    horario?: string;
    estado?: string;
    foto_url?: string;
  }) =>
    z
      .object({
        id: z.string().uuid(),
        nombre_completo: z.string().trim().min(2).max(100),
        telefono: z.string().trim().max(20).optional(),
        especialidad: z.string().trim().max(200).optional(),
        horario: z.string().trim().max(200).optional(),
        estado: z.enum(["activo", "inactivo"]).optional(),
        foto_url: z.string().trim().max(500).optional().or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...update } = data;
    const { error } = await context.supabase.from("peluqueros").update(update).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const registrarPagoWhatsapp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    cliente_id: string;
    monto: number;
    metodo: string;
    nota?: string;
  }) =>
    z
      .object({
        cliente_id: z.string().uuid(),
        monto: z.number().positive(),
        metodo: z.string().trim().min(2).max(50),
        nota: z.string().trim().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("pagos").insert({
      cliente_id: data.cliente_id,
      monto: data.monto,
      metodo: data.metodo,
      nota: data.nota,
      tipo: "whatsapp",
      estado: "pagado",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
