type StatTone = "default" | "warning" | "danger" | "critical";

const TEXT_CLASSES: Record<StatTone, string> = {
  default: "text-fg",
  warning: "text-warning",
  danger: "text-danger",
  critical: "text-critical",
};

const RAIL_CLASSES: Record<StatTone, string> = {
  default: "border-l-border-strong",
  warning: "border-l-warning",
  danger: "border-l-danger",
  critical: "border-l-critical",
};

const BAR_CLASSES: Record<StatTone, string> = {
  default: "bg-accent",
  warning: "bg-warning",
  danger: "bg-danger",
  critical: "bg-critical",
};

export type StatGauge = {
  value: number;
  max: number;
  marks: { at: number; label: string }[];
};

type StatCardProps = {
  label: string;
  value: string;
  tone?: StatTone;
  status?: string;
  gauge?: StatGauge;
};

function percentOf(value: number, max: number) {
  return Math.min(Math.max((value / max) * 100, 0), 100);
}

function Gauge({ gauge, tone }: { gauge: StatGauge; tone: StatTone }) {
  return (
    <div className="flex flex-col gap-1 pt-1" aria-hidden>
      <div className="relative h-1 rounded-full bg-surface-2">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${BAR_CLASSES[tone]}`}
          style={{ width: `${percentOf(gauge.value, gauge.max)}%` }}
        />
        {gauge.marks.map((mark) => (
          <div
            key={mark.label}
            className="absolute -inset-y-[3px] w-px bg-fg-muted"
            style={{ left: `${percentOf(mark.at, gauge.max)}%` }}
          />
        ))}
      </div>
      <div className="relative h-3.5 font-mono text-[10px] text-fg-muted">
        {gauge.marks.map((mark) => (
          <span
            key={mark.label}
            className="absolute -translate-x-1/2"
            style={{ left: `${percentOf(mark.at, gauge.max)}%` }}
          >
            {mark.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  tone = "default",
  status,
  gauge,
}: StatCardProps) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-lg border border-l-[3px] border-border bg-surface px-3 py-2.5 ${RAIL_CLASSES[tone]}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-fg-muted">{label}</span>
        {status && (
          <span className={`text-[11px] font-medium ${TEXT_CLASSES[tone]}`}>
            {status}
          </span>
        )}
      </div>
      <span
        className={`font-mono text-2xl font-medium tabular-nums ${TEXT_CLASSES[tone]}`}
      >
        {value}
      </span>
      {gauge && <Gauge gauge={gauge} tone={tone} />}
    </div>
  );
}
