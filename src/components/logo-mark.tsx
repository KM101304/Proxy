export function LogoMark({ size = 46 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className="shrink-0"
    >
      <defs>
        <linearGradient id="proxy-mark-fill" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(199,160,106,0.32)" />
          <stop offset="100%" stopColor="rgba(199,160,106,0.08)" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="url(#proxy-mark-fill)"
        stroke="rgba(199,160,106,0.3)"
        strokeWidth="1.5"
      />
      <path
        d="M18 20h28M18 32h28M18 44h28"
        fill="none"
        opacity="0.28"
        stroke="var(--text-muted)"
        strokeLinecap="round"
        strokeWidth="1.3"
      />
      <path
        d="M20 18h12.5c7.5 0 12.5 5 12.5 11.5S40 41 32.5 41H20V18Zm0 23v9"
        fill="none"
        stroke="var(--accent-strong)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.25"
      />
      <path
        d="M30 22 43 42M43 22 30 42"
        fill="none"
        stroke="var(--text-primary)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.25"
      />
    </svg>
  );
}
