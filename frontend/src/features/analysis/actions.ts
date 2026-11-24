"use server";

import { refresh } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { ApiError, apiFetch } from "@/lib/api";
import type { ChatMessage, IncidentAnalysis } from "@/features/analysis/types";

const MESSAGE_MAX = 2000;

function incidentApiPath(projectId: string, incidentId: string) {
  return `/projects/${projectId}/incidents/${incidentId}`;
}

export async function requestAnalysis(
  projectId: string,
  incidentId: string,
): Promise<{ error: string | null }> {
  try {
    await apiFetch<IncidentAnalysis>(
      `${incidentApiPath(projectId, incidentId)}/analyses`,
      { method: "POST", body: { language: await getLocale() } },
    );
  } catch (error) {
    if (error instanceof ApiError && error.code === "AI_DAILY_LIMIT") {
      const t = await getTranslations("analysis.panel");
      return { error: t("AI_DAILY_LIMIT") };
    }
    throw error;
  }
  refresh();
  return { error: null };
}

export async function askAssistant(
  projectId: string,
  incidentId: string,
  message: string,
): Promise<{ error: string | null }> {
  const tAnalysis = await getTranslations("analysis");
  const t = (
    key: "empty" | "tooLong" | "AI_UNAVAILABLE" | "AI_DAILY_LIMIT" | "rateLimited" | "failed",
    values?: { max: number },
  ) =>
    tAnalysis(`chat.errors.${key}`, values);
  const question = message.trim();

  if (!question) return { error: t("empty") };
  if (question.length > MESSAGE_MAX) {
    return { error: t("tooLong", { max: MESSAGE_MAX }) };
  }

  try {
    await apiFetch<ChatMessage[]>(
      `${incidentApiPath(projectId, incidentId)}/chat`,
      { method: "POST", body: { message: question } },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 503) {
      return { error: t("AI_UNAVAILABLE") };
    }
    if (error instanceof ApiError && error.code === "AI_DAILY_LIMIT") {
      return { error: t("AI_DAILY_LIMIT") };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { error: t("rateLimited") };
    }
    return { error: t("failed") };
  }

  refresh();
  return { error: null };
}
