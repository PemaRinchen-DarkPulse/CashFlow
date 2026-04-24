import { Activity, Stethoscope, FileText, Pill, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

type Step = { num: string; icon: LucideIcon; title: string; desc: string };

const STEPS: Step[] = [
  {
    num: "01",
    icon: Activity,
    title: "Symptom Check",
    desc: "Open AiMedicare and let the AI symptom checker guide you to the right care level.",
  },
  {
    num: "02",
    icon: Stethoscope,
    title: "Consultation",
    desc: "Provider reviews your longitudinal health history before you even step in.",
  },
  {
    num: "03",
    icon: FileText,
    title: "Digital Prescription",
    desc: "Your doctor issues an instant, paperless prescription to your app and pharmacy.",
  },
  {
    num: "04",
    icon: Pill,
    title: "Dispensary Fulfillment",
    desc: "Verify identity via QR to safely collect medicines labelled in Dzongkha and English.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden bg-secondary/40 py-24 sm:py-32">
      <div
        className="absolute inset-x-0 -top-px mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            From symptoms to care in <span className="text-gradient">four simple steps</span>
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <div className="absolute left-[12%] right-[12%] top-12 hidden h-px lg:block" aria-hidden>
            <div className="h-full w-full bg-gradient-to-r from-primary/20 via-gold/60 to-primary/20" />
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 120} className="relative">
                <StepCard {...s} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ num, icon: Icon, title, desc }: Step) {
  return (
    <div className="group relative flex flex-col items-center text-center">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full bg-primary/30 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />
        <div className="relative grid h-24 w-24 place-items-center rounded-full border-2 border-primary/20 bg-background shadow-elegant transition-transform duration-500 group-hover:scale-105">
          <div className="grid h-16 w-16 place-items-center rounded-full gradient-primary text-primary-foreground">
            <Icon className="h-7 w-7" />
          </div>
        </div>
        <span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-gold text-xs font-bold text-gold-foreground shadow-gold">
          {num}
        </span>
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}
