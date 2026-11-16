import { useTranslations } from "next-intl";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { deleteProject } from "@/features/projects/actions";
import type { Project } from "@/features/projects/types";

type DeleteProjectFormProps = {
  project: Project;
};

export function DeleteProjectForm({ project }: DeleteProjectFormProps) {
  const t = useTranslations("projects.delete");

  return (
    <ConfirmForm
      action={deleteProject.bind(null, project.id)}
      message={t("confirm", { name: project.name })}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-[13px] text-fg-muted">
        {t("lead")}
      </p>
      <SubmitButton variant="danger" pendingLabel={t("pending")}>
        {t("submit")}
      </SubmitButton>
    </ConfirmForm>
  );
}
