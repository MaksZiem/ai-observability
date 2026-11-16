"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  createProject,
  type CreateProjectState,
} from "@/features/projects/actions";
import { ApiKeyReveal } from "@/features/projects/components/api-key-reveal";
import { ENVIRONMENTS } from "@/features/projects/labels";

const INITIAL_STATE: CreateProjectState = {
  error: null,
  name: "",
  environment: "production",
  created: null,
};

export function CreateProjectForm() {
  const t = useTranslations("projects");
  const [state, formAction] = useActionState(createProject, INITIAL_STATE);

  if (state.created) {
    return (
      <ApiKeyReveal
        projectId={state.created.projectId}
        apiKey={state.created.apiKey}
      />
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label={t("form.name")} hint={t("form.nameHint")}>
        <Input name="name" maxLength={100} defaultValue={state.name} required />
      </FormField>
      <FormField label={t("form.environment")}>
        <Select name="environment" defaultValue={state.environment}>
          {ENVIRONMENTS.map((environment) => (
            <option key={environment} value={environment}>
              {t(`environments.${environment}`)}
            </option>
          ))}
        </Select>
      </FormField>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}

      <SubmitButton
        variant="primary"
        pendingLabel={t("form.creating")}
        className="self-start"
      >
        {t("form.create")}
      </SubmitButton>
    </form>
  );
}
