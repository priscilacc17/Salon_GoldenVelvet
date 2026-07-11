import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Clock, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.82 0.15 85 / 0.35), transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.68 0.22 350 / 0.25), transparent 50%)",
          }}
        />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center gap-6"
          >
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" /> Belleza premium
            </span>
            <h1 className="font-display text-4xl leading-tight font-bold sm:text-6xl md:text-7xl">
              Realza tu <span className="gold-gradient-text">esencia</span> con
              cada visita
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              En Salón Golden Velvet transformamos tu cabello en una obra de arte.
              Estilistas expertas, productos premium y una experiencia diseñada
              para ti.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/reservar">
                  Reservar cita <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/servicios">Ver servicios</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80"
              alt="Peluquería premium para mujeres"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Star, title: "Estilistas expertas", text: "Profesionales certificadas en las últimas tendencias." },
            { icon: Heart, title: "Productos premium", text: "Trabajamos con las mejores marcas del mundo." },
            { icon: Clock, title: "Reserva 24/7", text: "Elige tu servicio, día y hora en segundos." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl border border-border/60 bg-card/60 p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-10 text-center md:p-16">
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Tu próximo <span className="gold-gradient-text">look</span> te está esperando
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Reserva en línea y ahorra tiempo. Nuestro equipo tiene todo listo para consentirte.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full">
            <Link to="/reservar">Agendar mi cita</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Salón Golden Velvet. Todos los derechos reservados.
      </footer>
    </main>
  );
}
