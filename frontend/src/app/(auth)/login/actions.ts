"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ApiError, apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/session";
import type { AuthResponse } from "@/features/auth/types";

export type LoginState = {
  error: string | null;
  email: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const t = await getTranslations();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: t("auth.errors.credentialsRequired"), email };
  }

  try {
    const { accessToken } = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    await setAccessToken(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { error: t("auth.errors.invalidCredentials"), email };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { error: t("auth.errors.tooManyAttempts"), email };
    }
    return { error: t("errors.unreachable"), email };
  }

  redirect("/");
}
