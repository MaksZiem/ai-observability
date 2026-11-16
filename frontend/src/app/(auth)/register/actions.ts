"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ApiError, apiFetch } from "@/lib/api";
import { setAccessToken } from "@/lib/session";
import type { AuthResponse } from "@/features/auth/types";

export type RegisterState = {
  error: string | null;
  name: string;
  email: string;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const t = await getTranslations();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const entered = { name, email };

  if (!name || !email || !password) {
    return { ...entered, error: t("auth.errors.fillAll") };
  }
  if (name.length > 100) {
    return { ...entered, error: t("auth.errors.nameTooLong") };
  }
  if (password.length < 8 || password.length > 128) {
    return { ...entered, error: t("auth.errors.passwordLength") };
  }

  try {
    const { accessToken } = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    });
    await setAccessToken(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { ...entered, error: t("auth.errors.emailTaken") };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { ...entered, error: t("errors.validation") };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { ...entered, error: t("auth.errors.tooManyAttempts") };
    }
    return { ...entered, error: t("errors.unreachable") };
  }

  redirect("/");
}
