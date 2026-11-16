import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { AlertRuleList } from "@/features/alerts/components/alert-rule-list";
import { CreateAlertForm } from "@/features/alerts/components/create-alert-form";
import { listAlertRules } from "@/features/alerts/queries";
import { getProject } from "@/features/projects/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("alerts");
  return { title: t("title") };
}

export default async function AlertsPage({
  params,
}: PageProps<"/projects/[projectId]/alerts">) {
  const { projectId } = await params;

  const t = await getTranslations("alerts");
  await getProject(projectId);
  const rules = await listAlertRules(projectId);

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
      />

      <div className="grid items-start gap-6 p-6 lg:grid-cols-[1fr_360px]">
        {rules.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t("empty")}
            description={t("emptyHint")}
          />
        ) : (
          <AlertRuleList projectId={projectId} rules={rules} />
        )}

        <section className="rounded-xl border border-border bg-surface p-[18px]">
          <h2 className="mb-4 text-base font-semibold">{t("new")}</h2>
          <CreateAlertForm projectId={projectId} />
        </section>
      </div>
    </div>
  );
}
