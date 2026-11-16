import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { PageHeader } from "@/components/ui/page-header";
import { ApiKeySettings } from "@/features/projects/components/api-key-settings";
import { DeleteProjectForm } from "@/features/projects/components/delete-project-form";
import { ProjectSettingsForm } from "@/features/projects/components/project-settings-form";
import { getProject } from "@/features/projects/queries";
import { ChangePasswordForm } from "./change-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects.settings");
  return { title: t("title") };
}

type SettingsSectionProps = {
  title: string;
  description: string;
  tone?: "default" | "danger";
  children: ReactNode;
};

function SettingsSection({
  title,
  description,
  tone = "default",
  children,
}: SettingsSectionProps) {
  return (
    <section
      className={`flex flex-col gap-4 rounded-xl border bg-surface p-[18px] ${
        tone === "danger" ? "border-danger/30" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-[13px] text-fg-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default async function SettingsPage({
  params,
}: PageProps<"/projects/[projectId]/settings">) {
  const { projectId } = await params;
  const [project, t] = await Promise.all([
    getProject(projectId),
    getTranslations("projects.settings"),
  ]);

  return (
    <div>
      <PageHeader title={t("title")} description={project.name} />

      <div className="flex max-w-[720px] flex-col gap-6 p-6">
        <SettingsSection
          title={t("project")}
          description={t("projectLead")}
        >
          <ProjectSettingsForm project={project} />
        </SettingsSection>

        <SettingsSection
          title={t("apiKey")}
          description={t("apiKeyLead")}
        >
          <ApiKeySettings
            projectId={project.id}
            apiKeyPrefix={project.apiKeyPrefix}
          />
        </SettingsSection>

        <SettingsSection
          title={t("account")}
          description={t("accountLead")}
        >
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-fg-muted">{t("language")}</span>
            <LocaleSwitcher />
          </div>
          <ChangePasswordForm />
        </SettingsSection>

        <SettingsSection
          title={t("danger")}
          description={t("dangerLead")}
          tone="danger"
        >
          <DeleteProjectForm project={project} />
        </SettingsSection>
      </div>
    </div>
  );
}
