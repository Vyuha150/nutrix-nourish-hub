interface AnimatedLogoProps {
  size?: number;
  variant?: "light" | "dark" | "leaf";
  className?: string;
}

/**
 * "The Vital Node" — animated logo
 * Sequence:
 *  1. Outer ring draws on (stroke-dashoffset)
 *  2. Axes draw outward from the centre
 *  3. Satellites scale-in then orbit slowly
 *  4. Core pulses with a soft glow
 */
export const AnimatedLogo = ({
  size = 220,
  variant = "dark",
  className,
}: AnimatedLogoProps) => {
  const ring =
    variant === "dark"
      ? "hsl(var(--leaf))"
      : variant === "leaf"
      ? "hsl(var(--primary))"
      : "hsl(var(--forest))";
  const sat =
    variant === "dark"
      ? "hsl(var(--leaf))"
      : variant === "leaf"
      ? "hsl(var(--primary))"
      : "hsl(var(--leaf))";
  const core = variant === "dark" ? "hsl(var(--dew))" : "hsl(var(--primary))";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-label="Nutrix animated logo"
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={core} stopOpacity="0.9" />
          <stop offset="60%" stopColor={core} stopOpacity="0.15" />
          <stop offset="100%" stopColor={core} stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ambient glow behind the mark */}
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="url(#coreGlow)"
        className="nx-glow"
      />

      {/* outer ring — draws on */}
      <circle
        cx="32"
        cy="32"
        r="29"
        stroke={ring}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="nx-ring"
        pathLength={1}
      />

      {/* axes — wipe outward from centre */}
      <g className="nx-axes" stroke={ring} strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <line x1="32" y1="32" x2="32" y2="14" className="nx-axis nx-axis-up" />
        <line x1="32" y1="32" x2="32" y2="50" className="nx-axis nx-axis-down" />
        <line x1="32" y1="32" x2="14" y2="32" className="nx-axis nx-axis-left" />
        <line x1="32" y1="32" x2="50" y2="32" className="nx-axis nx-axis-right" />
      </g>

      {/* satellites — orbit group rotates; satellites pop in */}
      <g className="nx-orbit" style={{ transformOrigin: "32px 32px" }} filter="url(#softGlow)">
        <circle cx="32" cy="14" r="3.5" fill={sat} className="nx-sat nx-sat-1" style={{ transformOrigin: "32px 14px" }} />
        <circle cx="50" cy="32" r="3.5" fill={sat} className="nx-sat nx-sat-2" style={{ transformOrigin: "50px 32px" }} />
        <circle cx="32" cy="50" r="3.5" fill={sat} className="nx-sat nx-sat-3" style={{ transformOrigin: "32px 50px" }} />
        <circle cx="14" cy="32" r="3.5" fill={sat} className="nx-sat nx-sat-4" style={{ transformOrigin: "14px 32px" }} />
      </g>

      {/* core */}
      <circle
        cx="32"
        cy="32"
        r="5"
        fill={core}
        className="nx-core"
        style={{ transformOrigin: "32px 32px" }}
        filter="url(#softGlow)"
      />

      <style>{`
        .nx-ring {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: nxDraw 1.4s cubic-bezier(.65,.05,.36,1) 0.1s forwards;
        }
        @keyframes nxDraw { to { stroke-dashoffset: 0; } }

        .nx-axis { stroke-dasharray: 18; stroke-dashoffset: 18; opacity: 0; }
        .nx-axis-up    { animation: nxAxis .55s ease-out  0.9s forwards; }
        .nx-axis-right { animation: nxAxis .55s ease-out  1.05s forwards; }
        .nx-axis-down  { animation: nxAxis .55s ease-out  1.2s forwards; }
        .nx-axis-left  { animation: nxAxis .55s ease-out  1.35s forwards; }
        @keyframes nxAxis { to { stroke-dashoffset: 0; opacity: .55; } }

        .nx-sat { transform: scale(0); opacity: 0; }
        .nx-sat-1 { animation: nxPop .5s cubic-bezier(.34,1.56,.64,1) 1.5s forwards, nxBlink 3.2s ease-in-out 2.4s infinite; }
        .nx-sat-2 { animation: nxPop .5s cubic-bezier(.34,1.56,.64,1) 1.65s forwards, nxBlink 3.2s ease-in-out 2.8s infinite; }
        .nx-sat-3 { animation: nxPop .5s cubic-bezier(.34,1.56,.64,1) 1.8s forwards, nxBlink 3.2s ease-in-out 3.2s infinite; }
        .nx-sat-4 { animation: nxPop .5s cubic-bezier(.34,1.56,.64,1) 1.95s forwards, nxBlink 3.2s ease-in-out 3.6s infinite; }
        @keyframes nxPop { to { transform: scale(1); opacity: 1; } }
        @keyframes nxBlink {
          0%, 100% { filter: brightness(1); }
          50%      { filter: brightness(1.6); }
        }

        .nx-orbit {
          animation: nxSpin 28s linear 2.2s infinite;
        }
        @keyframes nxSpin { to { transform: rotate(360deg); } }

        .nx-core {
          transform: scale(0);
          animation: nxCore .7s cubic-bezier(.34,1.56,.64,1) 2.1s forwards,
                     nxPulse 3s ease-in-out 3s infinite;
        }
        @keyframes nxCore { to { transform: scale(1); } }
        @keyframes nxPulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%      { transform: scale(1.18); opacity: .85; }
        }

        .nx-glow {
          transform-origin: 32px 32px;
          animation: nxGlow 4s ease-in-out 2.4s infinite;
          opacity: 0;
        }
        @keyframes nxGlow {
          0%, 100% { transform: scale(.9); opacity: .35; }
          50%      { transform: scale(1.1); opacity: .7; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nx-ring, .nx-axis, .nx-sat, .nx-core, .nx-orbit, .nx-glow {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            stroke-dashoffset: 0 !important;
          }
          .nx-axis { opacity: .55 !important; }
        }
      `}</style>
    </svg>
  );
};
