type LogoProps = {
  size?: number;
  showWordmark?: boolean;
};

export function Logo({ size = 36, showWordmark = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative grid place-items-center rounded-xl gradient-primary shadow-elegant"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary-foreground"
          width={size * 0.6}
          height={size * 0.6}
        >
          {/* Mountain + sun mark */}
          <circle cx="17.5" cy="6.5" r="2.2" fill="currentColor" opacity="0.95" />
          <path d="M2 19 L8 9 L12.5 15 L16 11 L22 19 Z" fill="currentColor" opacity="0.95" />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight text-foreground">
            AiMedicare
          </span>
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Bhutan
          </span>
        </div>
      )}
    </div>
  );
}
