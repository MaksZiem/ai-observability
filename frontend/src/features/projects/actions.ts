"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ApiError, apiFetch } from "@/lib/api";
import { ENVIRONMENTS } from "@/features/projects/labels";
import type {
  Project,
  ProjectEnvironment,
  ProjectWithApiKey,
} from "@/features/projects/types";

export type CreateProjectState = {
  error: string | null;
  name: string;
  environment: ProjectEnvironment;
  created: { projectId: string; apiKey: string } | null;
};

function readEnvironment(value: FormDataEntryValue | null) {
  return ENVIRONMENTS.find((environment) => environment === value) ?? null;
}

export async function createProject(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const t = await getTranslations();
  const name = String(formData.get("name") ?? "").trim();
  const environment = readEnvironment(formData.get("environment"));

  const entered = {
    name,
    environment: environment ?? "production",
    created: null,
  };

  if (!name) {
    return { ...entered, error: t("projects.form.errors.nameRequired") };
  }
  if (name.length > 100) {
    return { ...entered, error: t("projects.form.errors.nameTooLong") };
  }
  if (!environment) {
    return { ...entered, error: t("projects.form.errors.environmentRequired") };
  }

  try {
    const { project, apiKey } = await apiFetch<ProjectWithApiKey>("/projects", {
      method: "POST",
      body: { name, environment },
    });
    refresh();
    return {
      ...entered,
      error: null,
      created: { projectId: project.id, apiKey },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { ...entered, error: t("errors.validation") };
    }
    return { ...entered, error: t("projects.form.errors.createFailed") };
  }
}

export type UpdateProjectState = {
  error: string | null;
  saved: boolean;
};

export async function updateProject(
  projectId: string,
  _prevState: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const t = await getTranslations();
  const name = String(formData.get("name") ?? "").trim();
  const environment = readEnvironment(formData.get("environment"));

  if (!name) return { error: t("projects.form.errors.nameRequired"), saved: false };
  if (name.length > 100) {
    return { error: t("projects.form.errors.nameTooLong"), saved: false };
  }
  if (!environment) {
    return { error: t("projects.form.errors.environmentRequired"), saved: false };
  }

  try {
    await apiFetch<Project>(`/projects/${projectId}`, {
      method: "PATCH",
      body: { name, environment },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { error: t("errors.validation"), saved: false };
    }
    return { error: t("projects.form.errors.saveFailed"), saved: false };
  }

  refresh();
  return { error: null, saved: true };
}

export async function rotateApiKey(projectId: string) {
  const { apiKey } = await apiFetch<ProjectWithApiKey>(
    `/projects/${projectId}/api-key/rotate`,
    { method: "POST" },
  );
  refresh();
  return apiKey;
}

export async function deleteProject(projectId: string) {
  await apiFetch(`/projects/${projectId}`, { method: "DELETE" });
  redirect("/");
}
