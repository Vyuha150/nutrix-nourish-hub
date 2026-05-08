interface LogoProps {
  size?: number;
  variant?: "light" | "dark" | "leaf";
  withWordmark?: boolean;
  className?: string;
}

// "The Vital Node" — central node + 4 radial satellites
export const Logo = ({ size = 36, variant = "light", withWordmark = true, className }: LogoProps) => {
  const ring =
    variant === "dark" ? "hsl(var(--leaf))" : variant === "leaf" ? "hsl(var(--primary))" : "hsl(var(--forest))";
  const sat =
    variant === "dark" ? "hsl(var(--leaf))" : variant === "leaf" ? "hsl(var(--primary))" : "hsl(var(--leaf))";
  const core = variant === "dark" ? "hsl(var(--dew))" : "hsl(var(--primary))";
  const wordColor = variant === "dark" ? "hsl(var(--dew))" : "hsl(var(--primary))";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Nutrix logo">
        <circle cx="32" cy="32" r="29" stroke={ring} strokeWidth="2.5" />
        {/* axes */}
        <line x1="32" y1="14" x2="32" y2="50" stroke={ring} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        <line x1="14" y1="32" x2="50" y2="32" stroke={ring} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        {/* satellites */}
        <circle cx="32" cy="14" r="3.5" fill={sat} />
        <circle cx="32" cy="50" r="3.5" fill={sat} />
        <circle cx="14" cy="32" r="3.5" fill={sat} />
        <circle cx="50" cy="32" r="3.5" fill={sat} />
        {/* core */}
        <circle cx="32" cy="32" r="5" fill={core} />
      </svg>
      {withWordmark && (
        <span className="font-serif text-xl font-semibold tracking-tight" style={{ color: wordColor }}>
          Nutrix
        </span>
      )}
    </div>
  );
};
