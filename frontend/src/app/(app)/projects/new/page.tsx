import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { CreateProjectForm } from "@/features/projects/components/create-project-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects");
  return { title: t("new") };
}

export default async function NewProjectPage() {
  const t = await getTranslations("projects");

  return (
    <div>
      <PageHeader
        title={t("new")}
        description={t("newLead")}
      />
      <div className="p-6">
        <div className="max-w-[720px] rounded-xl border border-border bg-surface p-[18px]">
          <CreateProjectForm />
        </div>
      </div>
    </div>
  );
}
