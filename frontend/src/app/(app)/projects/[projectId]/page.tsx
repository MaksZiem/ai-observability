import type { Metadata } from "next";
import { Activity } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listDeployments } from "@/features/deployments/queries";
import { RequestCharts } from "@/features/metrics/components/request-charts";
import { RequestStatsGrid } from "@/features/metrics/components/request-stats-grid";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { getOverview } from "@/features/metrics/queries";
import { parseTimeRange } from "@/features/metrics/time-range";
import { EnvironmentBadge } from "@/features/projects/components/environment-badge";
import { getProject } from "@/features/projects/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metrics");
  return { title: t("overview") };
}

export default async function OverviewPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]">) {
  const { projectId } = await params;
  const range = parseTimeRange((await searchParams).range);

  const t = await getTranslations("metrics");
  const project = await getProject(projectId);
  const overview = await getOverview(projectId, range);
  const deployments = await listDeployments(projectId, {
    from: overview.from,
    to: overview.to,
  });

  return (
    <div>
      <PageHeader
        title={t("overview")}
        description={project.name}
        actions={
          <>
            <EnvironmentBadge environment={project.environment} />
            <TimeRangePicker value={range} />
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        {overview.summary.requests === 0 ? (
          <EmptyState
            icon={Activity}
            title={t("noRequests")}
            description={t("noRequestsOverview")}
          />
        ) : (
          <>
            <RequestStatsGrid summary={overview.summary} />
            <RequestCharts overview={overview} deployments={deployments} />
          </>
        )}
      </div>
    </div>
  );
}
