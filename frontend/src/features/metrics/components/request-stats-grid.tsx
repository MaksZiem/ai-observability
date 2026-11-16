import { useTranslations } from "next-intl";
import { StatCard } from "@/components/ui/stat-card";
import { useFormat } from "@/lib/format";
import {
  CRITICAL_ERROR_RATE,
  DEGRADED_ERROR_RATE,
  DEGRADED_P95_MS,
  errorRateTone,
  latencyTone,
} from "@/features/metrics/health";
import type { RequestStats } from "@/features/metrics/types";

const GAUGE_HEADROOM = 1.2;

type RequestStatsGridProps = {
  summary: RequestStats;
};

export function RequestStatsGrid({ summary }: RequestStatsGridProps) {
  const t = useTranslations("metrics.stats");
  const format = useFormat();
  const errorTone = errorRateTone(summary);
  const p95 = summary.p95LatencyMs ?? 0;
  const slow = latencyTone(summary) === "warning";

  return (
    <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <StatCard label={t("requests")} value={format.count(summary.requests)} />
      <StatCard
        label={t("errorRate")}
        value={format.percent(summary.errorRate)}
        tone={errorTone}
        status={
          errorTone === "critical"
            ? t("critical")
            : errorTone === "warning"
              ? t("degraded")
              : undefined
        }
        gauge={{
          value: summary.errorRate,
          max: Math.max(
            CRITICAL_ERROR_RATE * GAUGE_HEADROOM,
            summary.errorRate,
          ),
          marks: [
            {
              at: DEGRADED_ERROR_RATE,
              label: format.percent(DEGRADED_ERROR_RATE),
            },
            {
              at: CRITICAL_ERROR_RATE,
              label: format.percent(CRITICAL_ERROR_RATE),
            },
          ],
        }}
      />
      <StatCard
        label={t("p95")}
        value={format.latency(summary.p95LatencyMs)}
        tone={latencyTone(summary)}
        status={slow ? t("slow") : undefined}
        gauge={{
          value: p95,
          max: Math.max(DEGRADED_P95_MS * 2, p95 * GAUGE_HEADROOM),
          marks: [
            { at: DEGRADED_P95_MS, label: format.latency(DEGRADED_P95_MS) },
          ],
        }}
      />
      <StatCard
        label={t("errors")}
        value={format.count(summary.errors)}
        tone={summary.errors > 0 ? "danger" : "default"}
      />
    </section>
  );
}
