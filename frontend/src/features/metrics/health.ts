import type { RequestStats, ServiceStatus } from "@/features/metrics/types";

export const DEGRADED_ERROR_RATE = 0.02;
export const CRITICAL_ERROR_RATE = 0.25;
export const DEGRADED_P95_MS = 1000;

export function errorRateTone({ errorRate }: RequestStats) {
  if (errorRate >= CRITICAL_ERROR_RATE) return "critical";
  if (errorRate >= DEGRADED_ERROR_RATE) return "warning";
  return "default";
}

export function latencyTone({ p95LatencyMs }: RequestStats) {
  return (p95LatencyMs ?? 0) >= DEGRADED_P95_MS ? "warning" : "default";
}

export function getServiceStatus(stats: RequestStats): ServiceStatus {
  if (stats.errorRate >= CRITICAL_ERROR_RATE) return "critical";
  if (
    stats.errorRate >= DEGRADED_ERROR_RATE ||
    (stats.p95LatencyMs ?? 0) >= DEGRADED_P95_MS
  ) {
    return "degraded";
  }
  return "healthy";
}
