"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ApiError, apiFetch } from "@/lib/api";
import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  LINK_KINDS,
} from "@/features/incidents/labels";
import { incidentPath } from "@/features/incidents/paths";
import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "@/features/incidents/types";

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 5000;
const NOTE_MAX = 10000;

function apiPath(projectId: string, incidentId: string) {
  return `/projects/${projectId}/incidents/${incidentId}`;
}

async function errorMessage(error: unknown, fallback: string) {
  const t = await getTranslations();
  if (
    error instanceof ApiError &&
    (error.code === "INCIDENT_LINK_EXISTS" || error.code === "INCIDENT_TARGET_INVALID")
  ) {
    return t(`incidents.link.errors.${error.code}`);
  }
  if (error instanceof ApiError && error.status === 400) {
    return t("errors.validation");
  }
  if (error instanceof ApiError && error.status === 404) {
    return t("incidents.link.errors.notFound");
  }
  return fallback;
}

export type CreateIncidentState = {
  error: string | null;
  title: string;
  description: string;
  severity: IncidentSeverity;
};

export async function createIncident(
  projectId: string,
  _prevState: CreateIncidentState,
  formData: FormData,
): Promise<CreateIncidentState> {
  const t = await getTranslations("incidents.form.errors");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const severity =
    INCIDENT_SEVERITIES.find((value) => value === formData.get("severity")) ??
    null;

  const entered = { title, description, severity: severity ?? "high" };

  if (!title) return { ...entered, error: t("titleRequired") };
  if (title.length > TITLE_MAX) {
    return { ...entered, error: t("titleTooLong", { max: TITLE_MAX }) };
  }
  if (description.length > DESCRIPTION_MAX) {
    return { ...entered, error: t("descriptionTooLong", { max: DESCRIPTION_MAX }) };
  }
  if (!severity) return { ...entered, error: t("severityRequired") };

  let incident: Incident;
  try {
    incident = await apiFetch<Incident>(`/projects/${projectId}/incidents`, {
      method: "POST",
      body: { title, severity, description: description || undefined },
    });
  } catch (error) {
    return {
      ...entered,
      error: await errorMessage(error, t("createFailed")),
    };
  }

  redirect(incidentPath(projectId, incident.id));
}

export async function updateIncidentStatus(
  projectId: string,
  incidentId: string,
  status: IncidentStatus,
) {
  if (!INCIDENT_STATUSES.includes(status)) {
    throw new Error(`Unknown incident status: ${status}`);
  }

  await apiFetch<Incident>(apiPath(projectId, incidentId), {
    method: "PATCH",
    body: { status },
  });
  refresh();
}

export type FormState = {
  error: string | null;
  saved: boolean;
};

export type NoteState = {
  error: string | null;
  body: string;
};

export async function addIncidentNote(
  projectId: string,
  incidentId: string,
  _prevState: NoteState,
  formData: FormData,
): Promise<NoteState> {
  const t = await getTranslations("incidents.note.errors");
  const body = String(formData.get("body") ?? "").trim();

  if (!body) return { error: t("empty"), body };
  if (body.length > NOTE_MAX) {
    return { error: t("tooLong", { max: NOTE_MAX }), body };
  }

  try {
    await apiFetch(`${apiPath(projectId, incidentId)}/notes`, {
      method: "POST",
      body: { body },
    });
  } catch (error) {
    return {
      error: await errorMessage(error, t("failed")),
      body,
    };
  }

  refresh();
  return { error: null, body: "" };
}

export async function linkEvidence(
  projectId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const t = await getTranslations("incidents.link.errors");
  const incidentId = String(formData.get("incidentId") ?? "");
  const targetId = String(formData.get("targetId") ?? "").trim();
  const kind = LINK_KINDS.find((value) => value === formData.get("kind"));

  if (!incidentId) return { error: t("incidentRequired"), saved: false };
  if (!kind) return { error: t("kindRequired"), saved: false };
  if (!targetId) return { error: t("idRequired"), saved: false };

  try {
    await apiFetch(`${apiPath(projectId, incidentId)}/links`, {
      method: "POST",
      body: { kind, targetId },
    });
  } catch (error) {
    return {
      error: await errorMessage(error, t("failed")),
      saved: false,
    };
  }

  refresh();
  return { error: null, saved: true };
}

export async function unlinkEvidence(
  projectId: string,
  incidentId: string,
  linkId: string,
) {
  await apiFetch(`${apiPath(projectId, incidentId)}/links/${linkId}`, {
    method: "DELETE",
  });
  refresh();
}
