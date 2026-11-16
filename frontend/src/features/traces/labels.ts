import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type { SpanStatus } from "@/features/traces/types";

export const SPAN_STATUS: Record<
  SpanStatus,
  { tone: StatusTone; indicator: StatusIndicator }
> = {
  ok: { tone: "neutral", indicator: "check" },
  error: { tone: "danger", indicator: "cross" },
};

export function parseSpanStatus(value: string | string[] | undefined) {
  return value === "error" || value === "ok" ? value : null;
}
