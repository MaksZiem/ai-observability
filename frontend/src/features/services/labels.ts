import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type { ServiceStatus } from "@/features/metrics/types";

export const SERVICE_STATUS: Record<
  ServiceStatus,
  { tone: StatusTone; indicator: StatusIndicator }
> = {
  healthy: { tone: "success", indicator: "dot" },
  degraded: { tone: "warning", indicator: "dot" },
  critical: { tone: "critical", indicator: "pulse" },
};

export const SERVICE_STATUS_ORDER: ServiceStatus[] = [
  "critical",
  "degraded",
  "healthy",
];
