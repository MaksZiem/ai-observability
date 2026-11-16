import type { Metadata } from "next";
import { Waypoints } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { parseTimeRange, rangeStart } from "@/features/metrics/time-range";
import { getProject } from "@/features/projects/queries";
import { TraceStatusFilter } from "@/features/traces/components/trace-status-filter";
import { TraceTable } from "@/features/traces/components/trace-table";
import { parseSpanStatus } from "@/features/traces/labels";
import { listTraces } from "@/features/traces/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("traces");
  return { title: t("title") };
}

export default async function TracesPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/traces">) {
  const { projectId } = await params;
  const query = await searchParams;
  const range = parseTimeRange(query.range);
  const status = parseSpanStatus(query.status);

  const t = await getTranslations("traces");
  await getProject(projectId);
  const traces = await listTraces(projectId, {
    from: rangeStart(range),
    status: status ?? undefined,
  });

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
        actions={<TimeRangePicker value={range} />}
      />

      <div className="flex flex-col gap-4 p-6">
        <TraceStatusFilter
          projectId={projectId}
          range={range}
          active={status}
        />

        {traces.length === 0 ? (
          <EmptyState
            icon={Waypoints}
            title={t("empty")}
            description={t("emptyHint")}
          />
        ) : (
          <TraceTable projectId={projectId} traces={traces} />
        )}
      </div>
    </div>
  );
}
