import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { RefreshButton } from "@/components/ui/refresh-button";
import { StatCard } from "@/components/ui/stat-card";
import { getFormat } from "@/lib/format-server";
import { HealthChecks } from "@/features/platform/components/health-checks";
import { IngestTable } from "@/features/platform/components/ingest-table";
import { OutcomeList } from "@/features/platform/components/outcome-list";
import { QueueStatus } from "@/features/platform/components/queue-status";
import { getHealth, getPlatformStats } from "@/features/platform/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform");
  return { title: t("title") };
}

type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel({ title, children }: PanelProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-[18px]">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function PlatformPage() {
  const [stats, health, t, format] = await Promise.all([
    getPlatformStats(),
    getHealth(),
    getTranslations("platform"),
    getFormat(),
  ]);
  const { ingestDurationMs, telemetryLagMs, queueLagMs, alerts } = stats;
  const deadLettered = stats.queue?.deadLettered ?? 0;

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead", { uptime: format.duration(stats.uptimeSeconds * 1000) })}
        actions={<RefreshButton />}
      />

      <div className="flex flex-col gap-6 p-6">
        <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <StatCard
            label={t("stats.ingestP95")}
            value={format.latency(ingestDurationMs.p95)}
          />
          <StatCard
            label={t("stats.queueLag")}
            value={format.latency(queueLagMs.p95)}
            tone={(queueLagMs.p95 ?? 0) > 60_000 ? "warning" : "default"}
          />
          <StatCard
            label={t("stats.telemetryLag")}
            value={format.latency(telemetryLagMs.p95)}
            tone={(telemetryLagMs.p95 ?? 0) > 60_000 ? "warning" : "default"}
          />
          <StatCard
            label={t("stats.deadLettered")}
            value={format.count(deadLettered)}
            tone={deadLettered > 0 ? "danger" : "default"}
          />
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">{t("ingestion")}</h2>
            <IngestTable ingest={stats.ingest} />
            <p className="text-xs text-fg-muted">{t("ingestionHint")}</p>
          </div>

          <div className="flex flex-col gap-6">
            <Panel title={t("queue")}>
              <QueueStatus stats={stats} />
            </Panel>

            <Panel title={t("dependencies")}>
              <HealthChecks report={health} />
            </Panel>

            <Panel title={t("background")}>
              <OutcomeList outcomes={stats.outcomes} />
              <p className="border-t border-border pt-3 font-mono text-xs text-fg-muted">
                {t("alertRuns", {
                  runs: format.count(alerts.runs),
                  failed: format.count(alerts.failedEvaluations),
                  last: alerts.lastRunAt ? format.dayTime(alerts.lastRunAt) : t("never"),
                })}
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
