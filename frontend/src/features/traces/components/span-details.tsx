import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { JsonBlock } from "@/components/ui/json-block";
import { useFormat } from "@/lib/format";
import { LogLevel } from "@/features/logs/components/log-level";
import type { Log } from "@/features/logs/types";
import { servicePath } from "@/features/services/paths";
import { SpanStatusBadge } from "@/features/traces/components/span-status-badge";
import type { WaterfallRow } from "@/features/traces/waterfall";

type SpanDetailsProps = {
  projectId: string;
  row: WaterfallRow;
  logs: Log[];
  traceStart: string;
};

type DetailProps = {
  label: string;
  children: ReactNode;
};

function Detail({ label, children }: DetailProps) {
  return (
    <>
      <dt className="text-fg-muted">{label}</dt>
      <dd className="min-w-0 truncate font-mono tabular-nums">{children}</dd>
    </>
  );
}

export function SpanDetails({
  projectId,
  row,
  logs,
  traceStart,
}: SpanDetailsProps) {
  const t = useTranslations("traces");
  const format = useFormat();
  const offsetLabel = (ms: number) => `+${format.latency(ms)}`;
  const { span } = row;
  const start = new Date(traceStart).getTime();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 break-words font-mono text-base font-semibold">
            {span.name}
          </h2>
          <SpanStatusBadge status={span.status} />
        </div>
        <Link
          href={servicePath(projectId, span.service)}
          className="self-start font-mono text-[13px] text-accent hover:underline"
        >
          {span.service}
        </Link>
      </div>

      <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 text-[13px]">
        <Detail label={t("span.duration")}>{format.latency(span.durationMs)}</Detail>
        <Detail label={t("span.selfTime")}>{format.latency(row.selfMs)}</Detail>
        <Detail label={t("span.startsAt")}>{offsetLabel(row.offsetMs)}</Detail>
        <Detail label={t("span.kind")}>{t(`kinds.${span.kind}`)}</Detail>
        <Detail label={t("span.spanId")}>{span.spanId}</Detail>
        <Detail label={t("span.parent")}>{span.parentSpanId ?? "—"}</Detail>
      </dl>

      {Object.keys(span.attributes).length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-fg-muted">{t("span.attributes")}</h3>
          <JsonBlock value={span.attributes} />
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-medium text-fg-muted">{t("span.logs")}</h3>
        {logs.length === 0 ? (
          <p className="text-[13px] text-fg-muted">
            {t("span.noLogs")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {logs.map((log) => (
              <li
                key={log.id}
                className="grid grid-cols-[64px_44px_1fr] gap-2 text-[13px]"
              >
                <span className="font-mono text-xs text-fg-muted tabular-nums">
                  {offsetLabel(new Date(log.timestamp).getTime() - start)}
                </span>
                <LogLevel level={log.level} />
                <span className="min-w-0 break-words font-mono">
                  {log.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
