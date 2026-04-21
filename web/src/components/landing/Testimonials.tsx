import { Quote } from "lucide-react";
import { Reveal } from "./Reveal";

type Testimonial = {
  name: string;
  role: string;
  initials: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Tenzin Dorji",
    role: "Resident · Thimphu",
    initials: "TD",
    quote:
      "I reported a broken streetlight near my home and it was fixed in 48 hours. AiMedicare finally makes the city listen.",
  },
  {
    name: "Karma Yangzom",
    role: "Community Leader · Paro",
    initials: "KY",
    quote:
      "Organizing volunteer drives became effortless. Our last clean-up brought together 200+ neighbors.",
  },
  {
    name: "Sonam Wangchuk",
    role: "Engineer · Phuentsholing",
    initials: "SW",
    quote:
      "The infrastructure dashboards give my team real visibility. We're catching issues before they become emergencies.",
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-secondary/40 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Voices from our cities
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Loved by citizens <span className="text-gradient">across Bhutan</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <Card t={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="relative h-full rounded-3xl border border-border/70 bg-card/80 p-7 shadow-elegant backdrop-blur-md transition-transform duration-300 hover:-translate-y-1">
      <Quote className="absolute right-6 top-6 h-9 w-9 text-gold/60" aria-hidden />
      <blockquote className="text-sm leading-relaxed text-foreground/90 sm:text-base">
        "{t.quote}"
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full gradient-primary text-sm font-semibold text-primary-foreground shadow-elegant">
          {t.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}
