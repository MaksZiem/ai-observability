import type { Metadata } from "next";
import { Bug } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorGroupTable } from "@/features/errors/components/error-group-table";
import { ErrorStatusFilter } from "@/features/errors/components/error-status-filter";
import { parseErrorStatus } from "@/features/errors/labels";
import { listErrorGroups } from "@/features/errors/queries";
import { getProject } from "@/features/projects/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("errorGroups");
  return { title: t("title") };
}

export default async function ErrorsPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/errors">) {
  const { projectId } = await params;
  const status = parseErrorStatus((await searchParams).status);

  const t = await getTranslations("errorGroups");
  await getProject(projectId);
  const groups = await listErrorGroups(projectId, {
    status: status ?? undefined,
  });

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
      />

      <div className="flex flex-col gap-4 p-6">
        <ErrorStatusFilter projectId={projectId} active={status} />

        {groups.length === 0 ? (
          <EmptyState
            icon={Bug}
            title={status ? t("emptyStatus") : t("emptyAll")}
            description={t("emptyHint")}
          />
        ) : (
          <ErrorGroupTable projectId={projectId} groups={groups} />
        )}
      </div>
    </div>
  );
}
