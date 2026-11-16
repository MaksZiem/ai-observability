import type { Metadata } from "next";
import { ScrollText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { LogFilters } from "@/features/logs/components/log-filters";
import { LogStream } from "@/features/logs/components/log-stream";
import { readLogFilters } from "@/features/logs/filters";
import { listLogs } from "@/features/logs/queries";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { parseTimeRange, rangeStart } from "@/features/metrics/time-range";
import { getProject } from "@/features/projects/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("logs");
  return { title: t("title") };
}

export default async function LogsPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/logs">) {
  const { projectId } = await params;
  const query = await searchParams;
  const range = parseTimeRange(query.range);
  const filters = readLogFilters(query);
  const filter = { ...filters, from: rangeStart(range) };

  const t = await getTranslations("logs");
  await getProject(projectId);
  const page = await listLogs(projectId, filter);

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
        actions={<TimeRangePicker value={range} />}
      />

      <div className="flex flex-col gap-4 p-6">
        <LogFilters projectId={projectId} range={range} filters={filters} />

        {page.items.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title={t("empty")}
            description={t("emptyHint")}
          />
        ) : (
          <LogStream
            key={JSON.stringify({ ...filters, range })}
            projectId={projectId}
            filter={filter}
            initialPage={page}
          />
        )}
      </div>
    </div>
  );
}
