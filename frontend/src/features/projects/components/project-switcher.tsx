"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { EnvironmentBadge } from "@/features/projects/components/environment-badge";
import type { Project } from "@/features/projects/types";

type ProjectSwitcherProps = {
  projects: Project[];
  currentProjectId: string | undefined;
};

export function ProjectSwitcher({
  projects,
  currentProjectId,
}: ProjectSwitcherProps) {
  const t = useTranslations("projects.switcher");
  const router = useRouter();
  const pathname = usePathname();
  const current = projects.find((project) => project.id === currentProjectId);

  function switchProject(projectId: string) {
    const section = pathname.split("/")[3];
    router.push(
      section ? `/projects/${projectId}/${section}` : `/projects/${projectId}`,
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        {projects.length > 0 && (
          <Select
            aria-label={t("label")}
            value={current?.id ?? ""}
            onChange={(event) => switchProject(event.target.value)}
            className="w-40 min-w-0 sm:w-56"
          >
            {!current && (
              <option value="" disabled>
                {t("select")}
              </option>
            )}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        )}
        <Link
          href="/projects/new"
          aria-label={t("new")}
          className="flex size-[34px] shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-4" strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
      {current && (
        <div className="hidden sm:block">
          <EnvironmentBadge environment={current.environment} />
        </div>
      )}
    </div>
  );
}
