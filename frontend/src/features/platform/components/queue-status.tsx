import { useTranslations } from "next-intl";
import { useFormat } from "@/lib/format";
import type { PlatformStats } from "@/features/platform/types";

type QueueStatusProps = {
  stats: PlatformStats;
};

export function QueueStatus({ stats }: QueueStatusProps) {
  const t = useTranslations("platform.queueRows");
  const format = useFormat();
  const { queue, queueLagMs, ingest } = stats;

  if (!queue) {
    return (
      <p role="alert" className="text-[13px] text-danger">
        {t("unavailable")}
      </p>
    );
  }

  const retried = Object.values(ingest).reduce(
    (total, counters) => total + counters.retried,
    0,
  );

  const rows = [
    { label: t("waiting"), value: format.count(queue.waiting) },
    { label: t("processing"), value: format.count(queue.active) },
    {
      label: t("delayed"),
      value: format.count(queue.delayed),
      tone: queue.delayed > 0 ? "text-warning" : "",
    },
    {
      label: t("deadLettered"),
      value: format.count(queue.deadLettered),
      tone: queue.deadLettered > 0 ? "text-danger" : "",
    },
    { label: t("retries"), value: format.count(retried) },
    {
      label: t("lag"),
      value: `${format.latency(queueLagMs.p50)} / ${format.latency(queueLagMs.p95)}`,
    },
  ];

  return (
    <dl className="flex flex-col text-[13px]">
      {rows.map(({ label, value, tone = "" }) => (
        <div
          key={label}
          className="flex items-baseline justify-between gap-3 border-b border-border py-2 first:pt-0 last:border-b-0 last:pb-0"
        >
          <dt className="text-fg-muted">{label}</dt>
          <dd className={`font-mono tabular-nums ${tone}`}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
