import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-28 lg:pt-44 lg:pb-32"
    >
      {/* Background washes */}
      <div className="absolute inset-0 -z-10 gradient-warm" aria-hidden />
      <div
        className="absolute -top-40 right-[-10%] -z-10 h-[520px] w-[520px] rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-40 left-[-10%] -z-10 h-[480px] w-[480px] rounded-full bg-gold/25 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary animate-fade-in-up"
            style={{ animationDelay: "0.05s" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="tracking-wide uppercase">Smart City Initiative · Bhutan</span>
          </div>

          <h1
            className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            Empowering <span className="text-gradient">Smarter Cities</span>
            <br className="hidden sm:block" /> in Bhutan
          </h1>

          <p
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            Connecting communities with efficient urban services and solutions — from waste
            management to emergency response — built with care for the Land of the Thunder Dragon.
          </p>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in-up"
            style={{ animationDelay: "0.35s" }}
          >
            <Button
              asChild
              size="lg"
              className="gradient-primary text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] flex items-center gap-2 px-6 h-14"
            >
              <a href="#" className="group">
                <svg viewBox="0 0 384 512" className="h-6 w-6" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                <div className="flex flex-col items-start translate-y-0.5">
                  <span className="text-[10px] leading-none uppercase font-semibold opacity-80">Download on the</span>
                  <span className="text-base leading-none font-bold">App Store</span>
                </div>
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/30 bg-card/60 backdrop-blur-md hover:bg-black hover:text-white flex items-center gap-2 px-6 h-14 transition-colors"
            >
              <a href="#">
                <svg viewBox="0 0 512 512" className="h-6 w-6">
                  <path fill="#4caf50" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/>
                  <path fill="#03a9f4" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"/>
                  <path fill="#ffeb3b" d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"/>
                  <path fill="#f44336" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                </svg>
                <div className="flex flex-col items-start translate-y-0.5">
                  <span className="text-[10px] leading-none uppercase font-semibold opacity-80">Get it on</span>
                  <span className="text-base leading-none font-bold">Google Play</span>
                </div>
              </a>
            </Button>
          </div>

          <dl
            className="mt-12 grid max-w-lg grid-cols-3 gap-6 animate-fade-in-up"
            style={{ animationDelay: "0.45s" }}
          >
            {[
              { k: "500+", v: "Issues Resolved" },
              { k: "10k+", v: "Active Citizens" },
              { k: "24/7", v: "Support" },
            ].map((s) => (
              <div key={s.v} className="border-l-2 border-primary/30 pl-4">
                <dt className="font-display text-2xl font-bold text-foreground">{s.k}</dt>
                <dd className="text-xs text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Illustration */}
        <div className="lg:col-span-5">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-md animate-fade-in-up"
      style={{ animationDelay: "0.4s" }}
    >
      {/* Floating accent badges */}
      <div
        className="absolute -left-2 top-10 z-10 rounded-2xl border border-border/70 bg-card/90 px-3 py-2 shadow-elegant backdrop-blur-md"
        style={{ animation: "float 6s ease-in-out infinite" }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Live</p>
        <p className="text-xs font-semibold text-foreground">Thimphu · 24°</p>
      </div>
      <div
        className="absolute -right-2 bottom-16 z-10 rounded-2xl border border-border/70 bg-card/90 px-3 py-2 shadow-gold backdrop-blur-md"
        style={{ animation: "float 6s ease-in-out infinite", animationDelay: "1.2s" }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-saffron">Resolved</p>
        <p className="text-xs font-semibold text-foreground">+38 today</p>
      </div>

      <svg
        viewBox="0 0 480 480"
        className="h-full w-full drop-shadow-xl"
        role="img"
        aria-label="Stylized Bhutan cityscape illustration"
      >
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.95 0.06 75)" />
            <stop offset="100%" stopColor="oklch(0.88 0.1 60)" />
          </linearGradient>
          <linearGradient id="mtn1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.18 25)" />
            <stop offset="100%" stopColor="oklch(0.4 0.12 25)" />
          </linearGradient>
          <linearGradient id="mtn2" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.6 0.1 30)" />
            <stop offset="100%" stopColor="oklch(0.42 0.08 35)" />
          </linearGradient>
          <linearGradient id="bld" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.97 0.02 80)" />
            <stop offset="100%" stopColor="oklch(0.86 0.04 75)" />
          </linearGradient>
          <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="oklch(0.92 0.18 85)" />
            <stop offset="100%" stopColor="oklch(0.78 0.17 82)" />
          </radialGradient>
        </defs>

        {/* Background circle / sky */}
        <circle cx="240" cy="240" r="220" fill="url(#sky)" />

        {/* Sun */}
        <circle cx="340" cy="160" r="46" fill="url(#sun)" />
        <circle cx="340" cy="160" r="64" fill="oklch(0.78 0.17 82 / 0.25)" />

        {/* Distant mountains */}
        <path
          d="M20 320 L100 220 L160 280 L230 200 L310 290 L380 220 L460 320 Z"
          fill="url(#mtn2)"
          opacity="0.85"
        />
        {/* Front mountains */}
        <path
          d="M20 360 L80 280 L150 340 L210 260 L280 340 L340 280 L420 360 Z"
          fill="url(#mtn1)"
        />

        {/* Buildings */}
        <g>
          <rect x="120" y="320" width="48" height="80" fill="url(#bld)" rx="4" />
          <rect x="175" y="290" width="60" height="110" fill="url(#bld)" rx="4" />
          <rect x="242" y="305" width="44" height="95" fill="url(#bld)" rx="4" />
          <rect x="293" y="280" width="56" height="120" fill="url(#bld)" rx="4" />
          {/* Pagoda roof on tallest */}
          <path d="M285 280 L321 258 L357 280 Z" fill="oklch(0.5 0.18 25)" />
          <path d="M278 280 L321 248 L364 280 Z" fill="oklch(0.5 0.18 25 / 0.55)" />
          {/* Windows */}
          {[0, 1, 2].map((row) =>
            [0, 1].map((col) => (
              <rect
                key={`w-${row}-${col}`}
                x={185 + col * 22}
                y={302 + row * 20}
                width="12"
                height="12"
                rx="1.5"
                fill="oklch(0.78 0.17 82)"
              />
            )),
          )}
          {[0, 1, 2, 3].map((row) =>
            [0, 1].map((col) => (
              <rect
                key={`w2-${row}-${col}`}
                x={302 + col * 20}
                y={292 + row * 22}
                width="11"
                height="11"
                rx="1.5"
                fill="oklch(0.78 0.17 82)"
                opacity="0.9"
              />
            )),
          )}
        </g>

        {/* Ground */}
        <path d="M0 400 L480 400 L480 460 L0 460 Z" fill="oklch(0.55 0.08 60)" />

        {/* Prayer flags */}
        <g stroke="oklch(0.45 0.04 35)" strokeWidth="1.5">
          <path d="M40 200 Q240 230 440 200" fill="none" />
        </g>
        {[
          "oklch(0.55 0.18 25)",
          "oklch(0.78 0.17 82)",
          "oklch(0.6 0.12 145)",
          "oklch(0.55 0.16 250)",
          "oklch(0.96 0.012 80)",
          "oklch(0.55 0.18 25)",
          "oklch(0.78 0.17 82)",
          "oklch(0.6 0.12 145)",
          "oklch(0.55 0.16 250)",
        ].map((c, i) => {
          const x = 60 + i * 40;
          const t = (i - 4) / 4;
          const y = 205 + 25 * (1 - Math.cos(t * 1.2));
          return <rect key={i} x={x} y={y} width="14" height="18" fill={c} rx="1" opacity="0.95" />;
        })}
      </svg>
    </div>
  );
}
