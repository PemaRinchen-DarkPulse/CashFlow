import * as React from "react";
import { Logo } from "./Logo";

export function PageLoader() {
  const [hidden, setHidden] = React.useState(false);
  const [gone, setGone] = React.useState(false);

  React.useEffect(() => {
    const t1 = setTimeout(() => setHidden(true), 700);
    const t2 = setTimeout(() => setGone(true), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-background transition-opacity duration-700 ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={hidden}
    >
      <div className="relative grid place-items-center">
        <span
          className="absolute h-20 w-20 rounded-full bg-primary/30"
          style={{ animation: "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite" }}
        />
        <span
          className="absolute h-20 w-20 rounded-full bg-gold/30"
          style={{
            animation: "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite",
            animationDelay: "0.5s",
          }}
        />
        <Logo size={56} showWordmark={false} />
      </div>
      <p className="mt-6 text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
        AiMedicare Bhutan
      </p>
    </div>
  );
}
