import type { TimeRange } from "@/features/metrics/types";

export const TIME_RANGES: TimeRange[] = ["15m", "1h", "24h", "7d"];

export const DEFAULT_TIME_RANGE: TimeRange = "1h";

export function parseTimeRange(value: string | string[] | undefined) {
  return TIME_RANGES.find((range) => range === value) ?? DEFAULT_TIME_RANGE;
}

const MINUTE_MS = 60_000;

const TIME_RANGE_MS: Record<TimeRange, number> = {
  "15m": 15 * MINUTE_MS,
  "1h": 60 * MINUTE_MS,
  "24h": 24 * 60 * MINUTE_MS,
  "7d": 7 * 24 * 60 * MINUTE_MS,
};

export function rangeStart(range: TimeRange, now = new Date()) {
  return new Date(now.getTime() - TIME_RANGE_MS[range]).toISOString();
}
