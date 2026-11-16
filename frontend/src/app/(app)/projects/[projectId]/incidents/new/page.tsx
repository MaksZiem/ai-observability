import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { CreateIncidentForm } from "@/features/incidents/components/create-incident-form";
import { getProject } from "@/features/projects/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("incidents");
  return { title: t("new") };
}

export default async function NewIncidentPage({
  params,
}: PageProps<"/projects/[projectId]/incidents/new">) {
  const { projectId } = await params;
  const t = await getTranslations("incidents");
  await getProject(projectId);

  return (
    <div>
      <PageHeader
        back={{ href: `/projects/${projectId}/incidents`, label: t("title") }}
        title={t("new")}
        description={t("newLead")}
      />
      <div className="p-6">
        <div className="max-w-[720px] rounded-xl border border-border bg-surface p-[18px]">
          <CreateIncidentForm projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
