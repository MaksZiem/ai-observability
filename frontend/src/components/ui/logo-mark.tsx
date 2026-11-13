type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className = "" }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="7"
        className="fill-surface-2 stroke-border-strong"
      />
      <path
        d="M5 17h5l2.5-7 4 13 3-9 2 3H27"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-accent"
      />
    </svg>
  );
}
