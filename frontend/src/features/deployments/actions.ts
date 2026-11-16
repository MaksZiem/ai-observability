"use server";

import { refresh } from "next/cache";
import { getTranslations } from "next-intl/server";
import { ApiError, apiFetch } from "@/lib/api";
import type { Deployment } from "@/features/deployments/types";

type DeploymentValues = {
  version: string;
  service: string;
  commitSha: string;
  description: string;
};

export type CreateDeploymentState = {
  error: string | null;
  values: DeploymentValues;
  createdVersion: string | null;
};

const EMPTY_VALUES: DeploymentValues = {
  version: "",
  service: "",
  commitSha: "",
  description: "",
};

const MAX_LENGTH: Record<keyof DeploymentValues, number> = {
  version: 100,
  service: 100,
  commitSha: 64,
  description: 2000,
};

function readValues(formData: FormData): DeploymentValues {
  const read = (key: keyof DeploymentValues) =>
    String(formData.get(key) ?? "").trim();

  return {
    version: read("version"),
    service: read("service"),
    commitSha: read("commitSha"),
    description: read("description"),
  };
}

async function validate(values: DeploymentValues) {
  const t = await getTranslations("deployments");
  if (!values.version) return t("errors.versionRequired");

  const tooLong = (Object.keys(MAX_LENGTH) as (keyof DeploymentValues)[]).find(
    (key) => values[key].length > MAX_LENGTH[key],
  );
  if (!tooLong) return null;

  return t("errors.tooLong", {
    field: t(`fields.${tooLong}`),
    max: MAX_LENGTH[tooLong],
  });
}

export async function createDeployment(
  projectId: string,
  _prevState: CreateDeploymentState,
  formData: FormData,
): Promise<CreateDeploymentState> {
  const t = await getTranslations();
  const values = readValues(formData);
  const error = await validate(values);

  if (error) return { error, values, createdVersion: null };

  try {
    const deployment = await apiFetch<Deployment>(
      `/projects/${projectId}/deployments`,
      {
        method: "POST",
        body: {
          version: values.version,
          service: values.service || undefined,
          commitSha: values.commitSha || undefined,
          description: values.description || undefined,
        },
      },
    );
    refresh();
    return {
      error: null,
      values: EMPTY_VALUES,
      createdVersion: deployment.version,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { error: t("errors.validation"), values, createdVersion: null };
    }
    return {
      error: t("deployments.errors.failed"),
      values,
      createdVersion: null,
    };
  }
}
