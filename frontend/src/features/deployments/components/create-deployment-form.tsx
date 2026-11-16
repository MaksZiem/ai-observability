"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  createDeployment,
  type CreateDeploymentState,
} from "@/features/deployments/actions";

const INITIAL_STATE: CreateDeploymentState = {
  error: null,
  values: { version: "", service: "", commitSha: "", description: "" },
  createdVersion: null,
};

type CreateDeploymentFormProps = {
  projectId: string;
};

export function CreateDeploymentForm({ projectId }: CreateDeploymentFormProps) {
  const t = useTranslations("deployments");
  const [state, formAction] = useActionState(
    createDeployment.bind(null, projectId),
    INITIAL_STATE,
  );
  const { values } = state;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label={t("fields.version")}>
        <Input
          name="version"
          placeholder="v1.42.3"
          maxLength={100}
          defaultValue={values.version}
          className="font-mono"
          required
        />
      </FormField>
      <FormField
        label={t("fields.service")}
        hint={t("fields.serviceHint")}
      >
        <Input
          name="service"
          placeholder="payment-service"
          maxLength={100}
          defaultValue={values.service}
          className="font-mono"
        />
      </FormField>
      <FormField label={t("fields.commitSha")}>
        <Input
          name="commitSha"
          maxLength={64}
          defaultValue={values.commitSha}
          className="font-mono"
        />
      </FormField>
      <FormField label={t("fields.description")}>
        <Input
          name="description"
          maxLength={2000}
          defaultValue={values.description}
        />
      </FormField>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}
      {state.createdVersion && (
        <p role="status" className="text-xs text-success">
          {t.rich("registered", {
            version: state.createdVersion,
            code: (chunks) => <span className="font-mono">{chunks}</span>,
          })}
        </p>
      )}

      <SubmitButton
        variant="primary"
        pendingLabel={t("registering")}
        className="self-start"
      >
        {t("register")}
      </SubmitButton>
    </form>
  );
}
