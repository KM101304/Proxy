export function LogoMark({ size = 46 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className="shrink-0"
    >
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        fill="#000000"
        stroke="var(--accent)"
        strokeWidth="2"
        rx="0"
      />
      <path
        d="M20 16h20v20H20V16Zm0 20v14"
        fill="none"
        stroke="var(--accent-strong)"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth="4"
      />
      <path
        d="M4 32h10 M50 32h10 M32 4v10 M32 50v10"
        stroke="var(--text-muted)"
        strokeWidth="2"
      />
      <rect 
        x="28" 
        y="24" 
        width="4" 
        height="4" 
        fill="var(--positive)" 
      />
    </svg>
  );
}
