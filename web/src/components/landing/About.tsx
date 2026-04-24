import { CheckCircle2, Heart, Mountain } from "lucide-react";
import { Reveal } from "./Reveal";

const POINTS = [
  "Equitable access to free healthcare",
  "Full data sovereignty residing locally",
  "Aligned with Gross National Happiness values",
];

export function About() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">About Us</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            A platform crafted for the{" "}
            <span className="text-gradient">Land of the Thunder Dragon</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            AiMedicare Bhutan is a mission-driven health ecosystem bridging geographic hurdles. Connecting remote villages to referral hospitals, we blend traditional Sowa Rigpa with modern clinical support so every citizen thrives.
          </p>

          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <span className="text-sm text-foreground/85">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <AboutVisual />
        </Reveal>
      </div>
    </section>
  );
}

function AboutVisual() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
      <div className="absolute inset-0 rounded-[2.5rem] gradient-primary opacity-90" aria-hidden />
      <div
        className="absolute inset-0 rounded-[2.5rem] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, oklch(0.95 0.1 80 / 0.4), transparent 50%)",
        }}
        aria-hidden
      />

      <svg viewBox="0 0 320 400" className="absolute inset-0 h-full w-full" aria-hidden>
        {/* Mountains silhouette */}
        <path
          d="M0 320 L60 240 L120 290 L180 200 L240 270 L320 220 L320 400 L0 400 Z"
          fill="oklch(0.25 0.04 30 / 0.35)"
        />
        <path
          d="M0 360 L60 300 L130 340 L200 280 L280 330 L320 310 L320 400 L0 400 Z"
          fill="oklch(0.18 0.03 30 / 0.5)"
        />
        {/* Sun */}
        <circle cx="240" cy="100" r="50" fill="oklch(0.92 0.15 85 / 0.85)" />
      </svg>

      {/* Floating badges */}
      <div
        className="absolute -left-4 top-10 rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-elegant backdrop-blur-md"
        style={{ animation: "float 6s ease-in-out infinite" }}
      >
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Mission-driven</span>
        </div>
      </div>
      <div
        className="absolute -right-4 bottom-12 rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-gold backdrop-blur-md"
        style={{ animation: "float 6s ease-in-out infinite", animationDelay: "1.5s" }}
      >
        <div className="flex items-center gap-2">
          <Mountain className="h-4 w-4 text-gold" />
          <span className="text-xs font-semibold text-foreground">Made in Bhutan</span>
        </div>
      </div>
    </div>
  );
}
