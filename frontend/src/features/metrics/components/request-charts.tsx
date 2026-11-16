"use client";

import { useTranslations } from "next-intl";
import { useFormat } from "@/lib/format";
import { ChartCard } from "@/features/metrics/components/chart-card";
import {
  TimeSeriesChart,
  type ChartMarker,
} from "@/features/metrics/components/time-series-chart";
import type { Deployment } from "@/features/deployments/types";
import type { Overview } from "@/features/metrics/types";

type RequestChartsProps = {
  overview: Overview;
  deployments: Deployment[];
};

export function RequestCharts({ overview, deployments }: RequestChartsProps) {
  const t = useTranslations("metrics.charts");
  const format = useFormat();
  const { from, to, series, summary } = overview;

  const markers: ChartMarker[] = deployments.map((deployment) => ({
    at: deployment.deployedAt,
    label: deployment.version,
  }));

  const chartProps = { from, to, markers };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <ChartCard title={t("volume")} value={format.count(summary.requests)}>
        <TimeSeriesChart
          {...chartProps}
          label={t("volumeLabel")}
          color="accent"
          formatValue={format.count}
          points={series.map((point) => ({
            at: point.bucket,
            value: point.requests,
          }))}
        />
      </ChartCard>
      <ChartCard title={t("errorRate")} value={format.percent(summary.errorRate)}>
        <TimeSeriesChart
          {...chartProps}
          label={t("errorRateLabel")}
          color="danger"
          formatValue={format.percent}
          points={series.map((point) => ({
            at: point.bucket,
            value: point.requests > 0 ? point.errorRate : null,
          }))}
        />
      </ChartCard>
      <ChartCard
        title={t("p95")}
        value={format.latency(summary.p95LatencyMs)}
      >
        <TimeSeriesChart
          {...chartProps}
          label={t("p95Label")}
          color="accent"
          formatValue={format.latency}
          points={series.map((point) => ({
            at: point.bucket,
            value: point.p95LatencyMs,
          }))}
        />
      </ChartCard>
    </div>
  );
}
