import { StatCard } from "@/components/ui/stat-card";
import { formatCount, formatLatency, formatPercent } from "@/lib/format";
import {
  CRITICAL_ERROR_RATE,
  DEGRADED_ERROR_RATE,
  DEGRADED_P95_MS,
  errorRateTone,
  latencyTone,
} from "@/features/metrics/health";
import type { RequestStats } from "@/features/metrics/types";

const GAUGE_HEADROOM = 1.2;

const ERROR_RATE_STATUS = {
  default: undefined,
  warning: "Degraded",
  critical: "Critical",
};

type RequestStatsGridProps = {
  summary: RequestStats;
};

export function RequestStatsGrid({ summary }: RequestStatsGridProps) {
  const errorTone = errorRateTone(summary);
  const p95 = summary.p95LatencyMs ?? 0;
  const slow = latencyTone(summary) === "warning";

  return (
    <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <StatCard label="Requests" value={formatCount(summary.requests)} />
      <StatCard
        label="Error rate"
        value={formatPercent(summary.errorRate)}
        tone={errorTone}
        status={ERROR_RATE_STATUS[errorTone]}
        gauge={{
          value: summary.errorRate,
          max: Math.max(
            CRITICAL_ERROR_RATE * GAUGE_HEADROOM,
            summary.errorRate,
          ),
          marks: [
            {
              at: DEGRADED_ERROR_RATE,
              label: formatPercent(DEGRADED_ERROR_RATE),
            },
            {
              at: CRITICAL_ERROR_RATE,
              label: formatPercent(CRITICAL_ERROR_RATE),
            },
          ],
        }}
      />
      <StatCard
        label="P95 latency"
        value={formatLatency(summary.p95LatencyMs)}
        tone={latencyTone(summary)}
        status={slow ? "Slow" : undefined}
        gauge={{
          value: p95,
          max: Math.max(DEGRADED_P95_MS * 2, p95 * GAUGE_HEADROOM),
          marks: [
            { at: DEGRADED_P95_MS, label: formatLatency(DEGRADED_P95_MS) },
          ],
        }}
      />
      <StatCard
        label="Errors"
        value={formatCount(summary.errors)}
        tone={summary.errors > 0 ? "danger" : "default"}
      />
    </section>
  );
}
