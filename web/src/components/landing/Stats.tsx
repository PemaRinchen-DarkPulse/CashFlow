import { useInView, useCountUp } from "@/hooks/use-in-view";

type Stat = { value: number; suffix: string; label: string };

const STATS: Stat[] = [
  { value: 20, suffix: "", label: "Dzongkhags Reached" },
  { value: 100, suffix: "%", label: "Free Healthcare" },
  { value: 3, suffix: " Nodes", label: "Health Eco-System" },
  { value: 24, suffix: "/7", label: "Telecare Support" },
];

export function Stats() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/70 p-8 shadow-elegant backdrop-blur-md sm:p-12"
        >
          <div
            className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-20 -right-10 h-60 w-60 rounded-full bg-gold/25 blur-3xl"
            aria-hidden
          />

          <div className="relative grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((s) => (
              <Counter key={s.label} {...s} active={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Counter({ value, suffix, label, active }: Stat & { active: boolean }) {
  const v = useCountUp(value, 1800, active);
  const display = v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `${v}`;
  return (
    <div className="text-center">
      <div className="font-display text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
        {display}
        <span className="text-foreground">{suffix}</span>
      </div>
      <p className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
