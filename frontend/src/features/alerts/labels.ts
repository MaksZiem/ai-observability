import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type { Format } from "@/lib/format";
import type {
  AlertComparator,
  AlertMetric,
  AlertRule,
} from "@/features/alerts/types";

export const METRIC_KEYS: AlertMetric[] = [
  "error_rate",
  "p95_latency",
  "request_count",
];

export function formatMetric(format: Format, metric: AlertMetric, value: number) {
  if (metric === "error_rate") return format.percent(value);
  if (metric === "p95_latency") return format.latency(value);
  return format.count(value);
}

export const COMPARATORS: Record<AlertComparator, string> = {
  gt: ">",
  lt: "<",
};

export const COMPARATOR_KEYS = Object.keys(COMPARATORS) as AlertComparator[];

export type AlertState = "paused" | "firing" | "ok";

type BadgeStyle = {
  state: AlertState;
  tone: StatusTone;
  indicator: StatusIndicator;
};

export function alertBadge(
  rule: Pick<AlertRule, "enabled" | "status">,
): BadgeStyle {
  if (!rule.enabled) {
    return { state: "paused", tone: "neutral", indicator: "hollow" };
  }
  return rule.status === "firing"
    ? { state: "firing", tone: "danger", indicator: "pulse" }
    : { state: "ok", tone: "success", indicator: "dot" };
}
