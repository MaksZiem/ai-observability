"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { register, type RegisterState } from "./actions";

const INITIAL_STATE: RegisterState = { error: null, name: "", email: "" };

export function RegisterForm() {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(register, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label={t("fields.name")}>
        <Input
          name="name"
          autoComplete="name"
          maxLength={100}
          defaultValue={state.name}
          required
        />
      </FormField>
      <FormField label={t("fields.email")}>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          maxLength={254}
          defaultValue={state.email}
          required
        />
      </FormField>
      <FormField label={t("fields.password")} hint={t("fields.passwordHint")}>
        <Input
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
      </FormField>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}

      <SubmitButton variant="primary" pendingLabel={t("signUp.pending")}>
        {t("signUp.submit")}
      </SubmitButton>
    </form>
  );
}
