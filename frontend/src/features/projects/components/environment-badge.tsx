import { useTranslations } from "next-intl";
import type { ProjectEnvironment } from "@/features/projects/types";

type EnvironmentBadgeProps = {
  environment: ProjectEnvironment;
};

export function EnvironmentBadge({ environment }: EnvironmentBadgeProps) {
  const t = useTranslations("projects.environments");

  return (
    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-fg-muted">
      {t(environment)}
    </span>
  );
}
