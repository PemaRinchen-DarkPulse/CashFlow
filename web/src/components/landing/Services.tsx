import {
  FileText,
  Video,
  Hospital,
  ShieldAlert,
  Leaf,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";

type Service = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const SERVICES: Service[] = [
  {
    icon: FileText,
    title: "Longitudinal Health Records",
    desc: "A single secure health ID connecting patient history across all BHUs and hospitals.",
  },
  {
    icon: Video,
    title: "Virtual Teleconsultation",
    desc: "Connecting rural health workers directly with specialists in Thimphu and Paro.",
  },
  {
    icon: Hospital,
    title: "Digital Pharmacy Fulfillment",
    desc: "Real-time drug inventory tracking and instant digital prescriptions to local pharmacies.",
  },
  {
    icon: ShieldAlert,
    title: "AI CDS & Emergency SOS",
    desc: "Clinical Decision Support for Community Health Workers during remote medical emergencies.",
  },
  {
    icon: Activity,
    title: "NCD & Wellness Self-Monitoring",
    desc: "Track critical vitals with culturally grounded insights aligning with Gross National Happiness.",
  },
  {
    icon: Leaf,
    title: "Sowa Rigpa Integration",
    desc: "Bridging the traditional medicine system with allopathic care inside one protected file.",
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            What we do
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Seamless healthcare, reimagined for <span className="text-gradient">every citizen</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            A unified platform integrating health providers, patients, and pharmacies across Bhutan.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <ServiceCard {...s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ icon: Icon, title, desc }: Service) {
  return (
    <div className="group relative h-full overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-7 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-elegant">
      {/* Glow */}
      <div
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-gold/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative">
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-elegant transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        <div className="mt-5 inline-flex items-center text-sm font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Learn more
          <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </div>
  );
}
