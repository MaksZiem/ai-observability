"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { login, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = { error: null, email: "" };

export function LoginForm() {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(login, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label={t("fields.email")}>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state.email}
          required
        />
      </FormField>
      <FormField label={t("fields.password")}>
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          maxLength={128}
          required
        />
      </FormField>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}

      <SubmitButton variant="primary" pendingLabel={t("signIn.pending")}>
        {t("signIn.submit")}
      </SubmitButton>
    </form>
  );
}
