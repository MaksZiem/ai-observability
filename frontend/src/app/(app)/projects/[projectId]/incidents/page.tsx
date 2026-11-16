import type { Metadata } from "next";
import Link from "next/link";
import { Siren } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { IncidentStatusFilter } from "@/features/incidents/components/incident-status-filter";
import { IncidentTable } from "@/features/incidents/components/incident-table";
import { parseIncidentStatus } from "@/features/incidents/labels";
import { listIncidents } from "@/features/incidents/queries";
import { getProject } from "@/features/projects/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("incidents");
  return { title: t("title") };
}

export default async function IncidentsPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/incidents">) {
  const { projectId } = await params;
  const status = parseIncidentStatus((await searchParams).status);

  const t = await getTranslations("incidents");
  await getProject(projectId);
  const incidents = await listIncidents(projectId, status ?? undefined);

  const newIncident = (
    <Link
      href={`/projects/${projectId}/incidents/new`}
      className={buttonClasses("primary")}
    >
      {t("new")}
    </Link>
  );

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
        actions={newIncident}
      />

      <div className="flex flex-col gap-4 p-6">
        <IncidentStatusFilter projectId={projectId} active={status} />

        {incidents.length === 0 ? (
          <EmptyState
            icon={Siren}
            title={status ? t("emptyStatus") : t("emptyAll")}
            description={t("emptyHint")}
          />
        ) : (
          <IncidentTable projectId={projectId} incidents={incidents} />
        )}
      </div>
    </div>
  );
}
