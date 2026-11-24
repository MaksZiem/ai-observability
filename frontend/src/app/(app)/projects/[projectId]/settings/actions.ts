"use server";

import { getTranslations } from "next-intl/server";
import { ApiError, apiFetch } from "@/lib/api";

export type ChangePasswordState = {
  error: string | null;
  success: boolean;
};

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const t = await getTranslations();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: t("projects.password.errors.fillAll"), success: false };
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    return { error: t("projects.password.errors.length"), success: false };
  }
  if (newPassword !== confirmPassword) {
    return { error: t("projects.password.errors.mismatch"), success: false };
  }
  if (newPassword === currentPassword) {
    return { error: t("projects.password.errors.sameAsCurrent"), success: false };
  }

  try {
    await apiFetch("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      const message =
        error.code === "CURRENT_PASSWORD_INCORRECT"
          ? t("projects.password.errors.CURRENT_PASSWORD_INCORRECT")
          : t("errors.validation");
      return { error: message, success: false };
    }
    if (error instanceof ApiError && error.code === "DEMO_ACCOUNT_LOCKED") {
      return { error: t("projects.password.errors.DEMO_ACCOUNT_LOCKED"), success: false };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { error: t("auth.errors.tooManyAttempts"), success: false };
    }
    throw error;
  }

  return { error: null, success: true };
}
