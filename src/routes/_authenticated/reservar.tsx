import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, Clock, CreditCard, Scissors, User, Calendar as CalIcon, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { crearReserva, confirmarPagoReserva, getBusySlots } from "@/lib/reservas.functions";
import { generatePaymentPDF } from "@/lib/pdf-utils";

export const Route = createFileRoute("/_authenticated/reservar")({
  head: () => ({ meta: [{ title: "Reservar cita — Golden Velvet" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    servicioId: search.servicioId as string | undefined,
  }),
  component: ReservarPage,
});

type Servicio = { id: string; nombre: string; precio: number; duracion_min: number; imagen_url: string | null };
type Peluquero = { id: string; nombre_completo: string; foto_url: string | null; especialidad: string | null };
type Cliente = {
  id: string;
  nombre_completo: string;
  email: string | null;
  telefono: string | null;
  dni: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null;
  estado?: string | null;
};

function ReservarPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { servicioId } = Route.useSearch();
  const [step, setStep] = useState(0);
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [peluquero, setPeluquero] = useState<Peluquero | null>(null);
  const [fecha, setFecha] = useState<Date | undefined>();
  const [hora, setHora] = useState<string | null>(null);
  const [reservaId, setReservaId] = useState<string | null>(null);
  const [metodo, setMetodo] = useState("Tarjeta");
  const [clienteName, setClienteName] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [clienteMode, setClienteMode] = useState<"existente" | "nuevo">("existente");
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteForm, setClienteForm] = useState({
    nombre_completo: "",
    email: "",
    telefono: "",
    dni: "",
    direccion: "",
    fecha_nacimiento: "",
  });

  const serviciosQ = useQuery({
    queryKey: ["servicios", "activos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("servicios").select("id,nombre,precio,duracion_min,imagen_url").eq("estado", "activo").order("nombre");
      if (error) throw error;
      return (data ?? []) as Servicio[];
    },
  });

  const peluquerosQ = useQuery({
    queryKey: ["peluqueros", "activos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("peluqueros").select("id,nombre_completo,foto_url,especialidad").eq("estado", "activo");
      if (error) throw error;
      return (data ?? []) as Peluquero[];
    },
  });

  const clientesQ = useQuery({
    queryKey: ["clientes", "reservar"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,nombre_completo,email,telefono,dni,direccion,fecha_nacimiento,estado")
        .order("nombre_completo", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Cliente[];
    },
  });

  useEffect(() => {
    let mounted = true;
    const checkAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!mounted || !userData.user) return;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!mounted) return;
      setIsAdmin(!error && !!data);
    };
    checkAdmin();
    return () => {
      mounted = false;
    };
  }, []);

  const preselectApplied = useRef(false);

  useEffect(() => {
    if (isAdmin === null) return;
    if (servicioId) return; // el otro efecto se encarga de posicionar el paso
    setStep(isAdmin ? 0 : 0);
  }, [isAdmin, servicioId]);

  // Obtener datos del cliente
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("nombre_completo")
        .single();
      if (!error && data) {
        setClienteName(data.nombre_completo);
      }
      return data;
    },
  });

  const serviceStep = isAdmin ? 1 : 0;
  const peluqueroStep = isAdmin ? 2 : 1;
  const dateStep = isAdmin ? 3 : 2;
  const confirmStep = isAdmin ? 4 : 3;
  const payStep = isAdmin ? 5 : 4;
  const doneStep = isAdmin ? 6 : 5;

  // Si viene un servicioId pre-seleccionado desde /servicios, se salta
  // el paso de "elegir servicio" y se pasa directo a "elegir peluquera".
  // Solo se aplica una vez, para no forzar el paso de vuelta si el usuario
  // ya avanzó por el flujo.
  useEffect(() => {
    if (preselectApplied.current) return;
    if (isAdmin === null) return;
    if (!servicioId || !serviciosQ.data) return;
    const s = serviciosQ.data.find((srv) => srv.id === servicioId);
    if (s) {
      preselectApplied.current = true;
      setServicio(s);
      // Clientes normales: saltar directo a elegir peluquera.
      // Admin: mantener el paso 0 (elegir cliente); el servicio ya
      // queda cargado y al continuar se salta el paso de servicio (ver más abajo).
      if (!isAdmin) setStep(peluqueroStep);
    }
  }, [servicioId, serviciosQ.data, isAdmin, peluqueroStep]);

  const fechaStr = fecha ? format(fecha, "yyyy-MM-dd") : null;
  const getBusy = useServerFn(getBusySlots);
  const busyQ = useQuery({
    queryKey: ["busy", peluquero?.id, fechaStr],
    enabled: !!peluquero && !!fechaStr,
    queryFn: async () => {
      const rows = await getBusy({ data: { peluquero_id: peluquero!.id, fecha: fechaStr! } });
      return rows;
    },
  });

  const slots = useMemo(() => {
    // Available slots 9:00-19:00 in 30-min increments
    const arr: string[] = [];
    for (let h = 9; h < 19; h++) {
      arr.push(`${String(h).padStart(2, "0")}:00`);
      arr.push(`${String(h).padStart(2, "0")}:30`);
    }
    return arr;
  }, []);

  const isSlotBusy = (slot: string) => {
    if (!busyQ.data) return false;
    const [sh, sm] = slot.split(":").map(Number);
    const slotStart = sh * 60 + sm;
    const slotEnd = slotStart + (servicio?.duracion_min ?? 60);
    return busyQ.data.some((b) => {
      const [bh, bm] = b.hora.split(":").map(Number);
      const bStart = bh * 60 + bm;
      const bEnd = bStart + b.duracion;
      return slotStart < bEnd && slotEnd > bStart;
    });
  };

  const crearFn = useServerFn(crearReserva);
  const crearMut = useMutation({
    mutationFn: async () =>
      crearFn({
        data: {
          servicio_id: servicio!.id,
          peluquero_id: peluquero!.id,
          fecha: fechaStr!,
          hora: hora!,
          cliente_id: selectedClienteId ?? undefined,
        },
      }),
    onSuccess: (r: any) => {
      setReservaId(r.id);
      setStep(payStep);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const crearClienteMut = useMutation({
    mutationFn: async () => {
      if (!clienteForm.nombre_completo.trim() || !clienteForm.email.trim()) {
        throw new Error("Ingresa nombre y correo del cliente");
      }

      const existing = await supabase
        .from("profiles")
        .select("id,nombre_completo,email,telefono,dni,direccion,fecha_nacimiento")
        .ilike("email", clienteForm.email.trim())
        .maybeSingle();

      if (existing.data) {
        return existing.data;
      }

      const password = Math.random().toString(36).slice(-10);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: clienteForm.email.trim(),
        password,
        options: {
          data: {
            nombre_completo: clienteForm.nombre_completo.trim(),
            metodo_auth: "email",
          },
        },
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || "No se pudo crear el cliente");
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: authData.user.id,
          email: clienteForm.email.trim(),
          nombre_completo: clienteForm.nombre_completo.trim(),
          telefono: clienteForm.telefono.trim() || null,
          dni: clienteForm.dni.trim() || null,
          direccion: clienteForm.direccion.trim() || null,
          fecha_nacimiento: clienteForm.fecha_nacimiento || null,
          metodo_auth: "email",
          estado: "activo",
        },
        { onConflict: "id" },
      );

      if (profileError) throw profileError;

      return {
        id: authData.user.id,
        nombre_completo: clienteForm.nombre_completo.trim(),
        email: clienteForm.email.trim(),
        telefono: clienteForm.telefono.trim() || null,
        dni: clienteForm.dni.trim() || null,
        direccion: clienteForm.direccion.trim() || null,
        fecha_nacimiento: clienteForm.fecha_nacimiento || null,
      } as Cliente;
    },
    onSuccess: (cliente) => {
      setSelectedCliente(cliente);
      setSelectedClienteId(cliente.id);
      setClienteName(cliente.nombre_completo);
      setStep(servicio ? peluqueroStep : serviceStep);
      toast.success(`Cliente listo: ${cliente.nombre_completo}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const pagarFn = useServerFn(confirmarPagoReserva);
  const pagarMut = useMutation({
    mutationFn: async () => pagarFn({ data: { reserva_id: reservaId!, metodo } }),
    onSuccess: () => {
      toast.success("¡Pago registrado! Tu cita está confirmada.");
      qc.invalidateQueries({ queryKey: ["mis-reservas"] });
      setStep(doneStep);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const steps = isAdmin
    ? ["Cliente", "Servicio", "Peluquera", "Fecha & Hora", "Confirmar", "Pagar", "Descargar"]
    : ["Servicio", "Peluquera", "Fecha & Hora", "Confirmar", "Pagar", "Descargar"];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Reservar cita</h1>
      <p className="mt-1 text-muted-foreground">Sigue los pasos para agendar tu experiencia.</p>

      <ol className="mt-8 flex flex-wrap gap-2 text-xs">
        {steps.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-2 rounded-full border px-3 py-1", i === step ? "border-primary bg-primary/10 text-primary" : i < step ? "border-primary/30 text-muted-foreground" : "border-border text-muted-foreground")}>
            {i < step ? <Check className="h-3 w-3" /> : <span className="grid h-4 w-4 place-items-center rounded-full bg-current/20 text-[10px]">{i + 1}</span>}
            {s}
          </li>
        ))}
      </ol>

      <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        {isAdmin && step === 0 && (
          <Card className="mx-auto max-w-3xl space-y-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold">Cliente</h2>
                <p className="text-sm text-muted-foreground">Elige un cliente existente o crea uno nuevo para esta cita.</p>
              </div>
              <div className="flex rounded-full border p-1">
                <button onClick={() => setClienteMode("existente")} className={cn("rounded-full px-3 py-1 text-sm", clienteMode === "existente" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Existente</button>
                <button onClick={() => setClienteMode("nuevo")} className={cn("rounded-full px-3 py-1 text-sm", clienteMode === "nuevo" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Nuevo</button>
              </div>
            </div>

            {clienteMode === "existente" ? (
              <div className="space-y-3">
                <label className="text-sm font-medium">Selecciona un cliente</label>
                <select
                  value={selectedClienteId ?? ""}
                  onChange={(e) => {
                    const cliente = clientesQ.data?.find((c) => c.id === e.target.value) ?? null;
                    setSelectedCliente(cliente);
                    setSelectedClienteId(cliente?.id ?? null);
                    setClienteName(cliente?.nombre_completo ?? "");
                  }}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Elige un cliente</option>
                  {clientesQ.data?.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre_completo} {cliente.email ? `• ${cliente.email}` : ""}
                    </option>
                  ))}
                </select>
                <Button onClick={() => selectedClienteId ? setStep(servicio ? peluqueroStep : serviceStep) : toast.error("Elige un cliente")} className="w-full">Continuar</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Nombre completo</label>
                    <Input value={clienteForm.nombre_completo} onChange={(e) => setClienteForm({ ...clienteForm, nombre_completo: e.target.value })} placeholder="Ej: Ana Torres" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Correo</label>
                    <Input type="email" value={clienteForm.email} onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })} placeholder="cliente@mail.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Teléfono</label>
                    <Input value={clienteForm.telefono} onChange={(e) => setClienteForm({ ...clienteForm, telefono: e.target.value })} placeholder="987654321" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">DNI</label>
                    <Input value={clienteForm.dni} onChange={(e) => setClienteForm({ ...clienteForm, dni: e.target.value })} placeholder="12345678" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dirección</label>
                    <Input value={clienteForm.direccion} onChange={(e) => setClienteForm({ ...clienteForm, direccion: e.target.value })} placeholder="Av. Principal 123" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fecha de nacimiento</label>
                    <Input type="date" value={clienteForm.fecha_nacimiento} onChange={(e) => setClienteForm({ ...clienteForm, fecha_nacimiento: e.target.value })} />
                  </div>
                </div>
                <Button onClick={() => crearClienteMut.mutate()} disabled={crearClienteMut.isPending} className="w-full">
                  {crearClienteMut.isPending ? "Creando cliente..." : "Crear cliente y continuar"}
                </Button>
              </div>
            )}
          </Card>
        )}

        {step === serviceStep && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviciosQ.data?.map((s) => (
              <button key={s.id} onClick={() => { setServicio(s); setStep(peluqueroStep); }} className={cn("group overflow-hidden rounded-2xl border text-left transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg", servicio?.id === s.id ? "border-primary" : "border-border")}> 
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={s.imagen_url ?? ""} alt={s.nombre} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold">{s.nombre}</h3>
                    <span className="font-display text-primary">S/ {Number(s.precio).toFixed(0)}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {s.duracion_min} min</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === peluqueroStep && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {peluquerosQ.data?.map((p) => (
              <button key={p.id} onClick={() => { setPeluquero(p); setStep(dateStep); }} className={cn("flex items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:border-primary", peluquero?.id === p.id ? "border-primary" : "border-border")}>
                <img src={p.foto_url ?? ""} alt={p.nombre_completo} className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <h3 className="font-display font-semibold">{p.nombre_completo}</h3>
                  <p className="text-xs text-muted-foreground">{p.especialidad}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === dateStep && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"><CalIcon className="h-4 w-4" /> Elige una fecha</div>
              <Calendar mode="single" selected={fecha} onSelect={(d) => { setFecha(d); setHora(null); }} disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} className="pointer-events-auto" locale={es} />
            </Card>
            <Card className="p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> Horas disponibles</div>
              {!fecha ? (
                <p className="text-sm text-muted-foreground">Selecciona una fecha para ver los horarios.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((s) => {
                    const busy = isSlotBusy(s);
                    return (
                      <button key={s} disabled={busy} onClick={() => { setHora(s); setStep(confirmStep); }} className={cn("rounded-lg border px-2 py-2 text-sm transition-colors", busy ? "cursor-not-allowed border-border/40 text-muted-foreground line-through" : hora === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary")}>{s}</button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {step === confirmStep && servicio && peluquero && fecha && hora && (
          <Card className="mx-auto max-w-lg space-y-4 p-6">
            <h2 className="font-display text-2xl font-bold">Confirmar reserva</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Scissors className="h-4 w-4 text-primary" /> {servicio.nombre} — <span className="text-primary">S/ {Number(servicio.precio).toFixed(0)}</span></li>
              <li className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> {peluquero.nombre_completo}</li>
              <li className="flex items-center gap-2"><CalIcon className="h-4 w-4 text-primary" /> {format(fecha, "PPP", { locale: es })} · {hora}</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {servicio.duracion_min} min</li>
            </ul>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(dateStep)}>Volver</Button>
              <Button className="flex-1" onClick={() => crearMut.mutate()} disabled={crearMut.isPending}>{crearMut.isPending ? "Creando..." : "Confirmar y pagar"}</Button>
            </div>
          </Card>
        )}

        {step === payStep && servicio && (
          <Card className="mx-auto max-w-lg space-y-4 p-6">
            <h2 className="font-display text-2xl font-bold">Pagar servicio</h2>
            <p className="text-sm text-muted-foreground">Monto a pagar: <span className="font-display text-xl text-primary">S/ {Number(servicio.precio).toFixed(2)}</span></p>
            <div>
              <p className="mb-2 text-sm font-medium">Método de pago</p>
              <div className="grid grid-cols-3 gap-2">
                {["Tarjeta", "Yape", "Plin"].map((m) => (
                  <button key={m} onClick={() => setMetodo(m)} className={cn("rounded-lg border px-3 py-2 text-sm", metodo === m ? "border-primary bg-primary/10 text-primary" : "border-border")}>{m}</button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">* Pago simulado para fines de demostración.</p>
            <Button className="w-full" onClick={() => pagarMut.mutate()} disabled={pagarMut.isPending}>
              <CreditCard className="mr-2 h-4 w-4" />{pagarMut.isPending ? "Procesando..." : "Pagar ahora"}
            </Button>
          </Card>
        )}

        {step === doneStep && servicio && fecha && hora && (
          <Card className="mx-auto max-w-lg space-y-4 p-6">
            <div className="text-center mb-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-3">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl font-bold">¡Listo!</h2>
              <p className="text-sm text-muted-foreground mt-2">Tu cita ha sido confirmada correctamente</p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Servicio:</strong> {servicio.nombre}</p>
              <p><strong>Peluquera:</strong> {peluquero?.nombre_completo}</p>
              <p><strong>Fecha:</strong> {format(fecha, "PPP", { locale: es })}</p>
              <p><strong>Hora:</strong> {hora}</p>
              <p><strong>Monto pagado:</strong> S/ {Number(servicio.precio).toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={async () => {
                  try {
                    await generatePaymentPDF(
                      reservaId || "NA",
                      clienteName,
                      servicio.nombre,
                      servicio.precio,
                      format(fecha, "dd/MM/yyyy"),
                      metodo
                    );
                    toast.success("PDF descargado correctamente");
                  } catch (error) {
                    const message = error instanceof Error ? error.message : "No se pudo generar el PDF";
                    console.error("Error al generar PDF", error);
                    toast.error(message);
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar Comprobante
              </Button>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => navigate({ to: "/mis-reservas" })}
              >
                Ver mis reservas
              </Button>
            </div>
          </Card>
        )}
      </motion.div>
    </main>
  );
}