import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { listServiceHealth } from "@/features/metrics/queries";
import { parseTimeRange } from "@/features/metrics/time-range";
import { getProject } from "@/features/projects/queries";
import { ServiceTable } from "@/features/services/components/service-table";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("services");
  return { title: t("title") };
}

export default async function ServicesPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/services">) {
  const { projectId } = await params;
  const range = parseTimeRange((await searchParams).range);

  const t = await getTranslations("services");
  await getProject(projectId);
  const services = await listServiceHealth(projectId, range);

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
        actions={<TimeRangePicker value={range} />}
      />

      <div className="p-6">
        {services.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title={t("empty")}
            description={t("emptyHint")}
          />
        ) : (
          <ServiceTable
            projectId={projectId}
            range={range}
            services={services}
          />
        )}
      </div>
    </div>
  );
}
