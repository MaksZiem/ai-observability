"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import {
  createIncident,
  type CreateIncidentState,
} from "@/features/incidents/actions";
import { INCIDENT_SEVERITIES } from "@/features/incidents/labels";

const INITIAL_STATE: CreateIncidentState = {
  error: null,
  title: "",
  description: "",
  severity: "high",
};

type CreateIncidentFormProps = {
  projectId: string;
};

export function CreateIncidentForm({ projectId }: CreateIncidentFormProps) {
  const t = useTranslations("incidents");
  const [state, formAction] = useActionState(
    createIncident.bind(null, projectId),
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField
        label={t("form.title")}
        hint={t("form.titleHint")}
      >
        <Input
          name="title"
          maxLength={200}
          defaultValue={state.title}
          required
        />
      </FormField>
      <FormField label={t("form.severity")}>
        <Select name="severity" defaultValue={state.severity}>
          {INCIDENT_SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>
              {t(`severity.${severity}`)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={t("form.description")} hint={t("form.descriptionHint")}>
        <Textarea
          name="description"
          rows={5}
          maxLength={5000}
          defaultValue={state.description}
        />
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
