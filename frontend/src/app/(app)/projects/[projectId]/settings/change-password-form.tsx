"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { changePassword, type ChangePasswordState } from "./actions";

const INITIAL_STATE: ChangePasswordState = { error: null, success: false };

export function ChangePasswordForm() {
  const t = useTranslations("projects.password");
  const tCommon = useTranslations("common");
  const [state, formAction] = useActionState(changePassword, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label={t("current")}>
        <Input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          maxLength={128}
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("new")} hint={t("newHint")}>
          <Input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
        </FormField>
        <FormField label={t("confirm")}>
          <Input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
        </FormField>
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-xs text-success">
          {t("changed")}
        </p>
      )}

      <SubmitButton
        variant="primary"
        pendingLabel={tCommon("saving")}
        className="self-start"
      >
        {t("submit")}
      </SubmitButton>
    </form>
  );
}
