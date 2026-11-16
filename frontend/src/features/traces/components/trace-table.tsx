import Link from "next/link";
import { useTranslations } from "next-intl";
import { RAIL_SPACER, statusRail } from "@/components/ui/status-rail";
import { useFormat } from "@/lib/format";
import { SpanStatusBadge } from "@/features/traces/components/span-status-badge";
import { SPAN_STATUS } from "@/features/traces/labels";
import { tracePath } from "@/features/traces/paths";
import type { Span } from "@/features/traces/types";

const COLUMNS =
  "grid grid-cols-[120px_minmax(220px,1fr)_140px_90px_minmax(120px,200px)] items-center gap-4 px-4";

type TraceTableProps = {
  projectId: string;
  traces: Span[];
};

export function TraceTable({ projectId, traces }: TraceTableProps) {
  const t = useTranslations("traces.columns");
  const format = useFormat();
  const slowest = Math.max(...traces.map((trace) => trace.durationMs), 1);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px] text-[13px]">
        <div
          className={`${COLUMNS} ${RAIL_SPACER} border-b border-border py-2 text-xs font-medium text-fg-muted`}
        >
          <span>{t("started")}</span>
          <span>{t("operation")}</span>
          <span>{t("service")}</span>
          <span>{t("status")}</span>
          <span className="text-right">{t("duration")}</span>
        </div>

        <ul>
          {traces.map((trace) => (
            <li key={trace.id} className="border-b border-border">
              <Link
                href={tracePath(projectId, trace.traceId)}
                className={`${COLUMNS} ${statusRail(SPAN_STATUS[trace.status].tone)} py-2.5 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
              >
                <span className="font-mono text-fg-muted tabular-nums">
                  {format.dayTime(trace.startTime)}
                </span>
                <span className="truncate font-mono">{trace.name}</span>
                <span className="truncate font-mono text-fg-muted">
                  {trace.service}
                </span>
                <span>
                  <SpanStatusBadge status={trace.status} />
                </span>
                <span className="flex items-center justify-end gap-2">
                  <span
                    className={`h-1.5 rounded-sm ${
                      trace.status === "error" ? "bg-danger" : "bg-accent"
                    }`}
                    style={{ width: `${(trace.durationMs / slowest) * 100}%` }}
                    aria-hidden
                  />
                  <span className="w-16 shrink-0 text-right font-mono tabular-nums">
                    {format.latency(trace.durationMs)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
