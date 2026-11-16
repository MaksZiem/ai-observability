"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  createAlertRule,
  type CreateAlertState,
} from "@/features/alerts/actions";
import { EMPTY_ALERT_VALUES } from "@/features/alerts/form";
import {
  COMPARATOR_KEYS,
  COMPARATORS,
  METRIC_KEYS,
} from "@/features/alerts/labels";
import { INCIDENT_SEVERITIES } from "@/features/incidents/labels";

const INITIAL_STATE: CreateAlertState = {
  error: null,
  values: EMPTY_ALERT_VALUES,
  createdName: null,
};

type CreateAlertFormProps = {
  projectId: string;
};

export function CreateAlertForm({ projectId }: CreateAlertFormProps) {
  const t = useTranslations();
  const [state, formAction] = useActionState(
    createAlertRule.bind(null, projectId),
    INITIAL_STATE,
  );
  const { values } = state;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label={t("alerts.form.name")}>
        <Input
          name="name"
          placeholder={t("alerts.form.namePlaceholder")}
          maxLength={100}
          defaultValue={values.name}
          required
        />
      </FormField>

      <div className="grid grid-cols-[1fr_72px] gap-2">
        <FormField label={t("alerts.form.metric")}>
          <Select name="metric" defaultValue={values.metric}>
            {METRIC_KEYS.map((metric) => (
              <option key={metric} value={metric}>
                {t(`alerts.metrics.${metric}`)} ({t(`alerts.units.${metric}`)})
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t("alerts.form.condition")}>
          <Select name="comparator" defaultValue={values.comparator}>
            {COMPARATOR_KEYS.map((comparator) => (
              <option key={comparator} value={comparator}>
                {COMPARATORS[comparator]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FormField
          label={t("alerts.form.threshold")}
          hint={t("alerts.form.thresholdHint")}
        >
          <Input
            name="threshold"
            type="number"
            min={0}
            step="any"
            defaultValue={values.threshold}
            className="font-mono"
            required
          />
        </FormField>
        <FormField label={t("alerts.form.window")}>
          <Input
            name="windowMinutes"
            type="number"
            min={1}
            max={1440}
            step={1}
            defaultValue={values.windowMinutes}
            className="font-mono"
            required
          />
        </FormField>
      </div>

      <FormField label={t("alerts.form.service")} hint={t("alerts.form.serviceHint")}>
        <Input
          name="service"
          placeholder="payment-service"
          maxLength={100}
          defaultValue={values.service}
          className="font-mono"
        />
      </FormField>

      <fieldset className="flex flex-col gap-3 border-t border-border pt-4">
        <legend className="sr-only">{t("alerts.form.whenFires")}</legend>
        <label className="flex items-center gap-2 text-[13px] font-medium">
          <input
            type="checkbox"
            name="createIncident"
            defaultChecked={values.createIncident}
            className="size-4 accent-accent"
          />
          {t("alerts.form.createIncident")}
        </label>
        <FormField label={t("alerts.form.severity")}>
          <Select
            name="incidentSeverity"
            defaultValue={values.incidentSeverity}
          >
            {INCIDENT_SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>
                {t(`incidents.severity.${severity}`)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label={t("alerts.form.webhook")}
          hint={t("alerts.form.webhookHint")}
        >
          <Input
            name="webhookUrl"
            type="url"
            placeholder="https://hooks.example.com/alerts"
            maxLength={2048}
            defaultValue={values.webhookUrl}
            className="font-mono"
          />
        </FormField>
      </fieldset>

      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}
      {state.createdName && (
        <p role="status" className="text-xs text-success">
          {t("alerts.form.created", { name: state.createdName })}
        </p>
      )}

      <SubmitButton
        variant="primary"
        pendingLabel={t("alerts.form.pending")}
        className="self-start"
      >
        {t("alerts.form.submit")}
      </SubmitButton>
    </form>
  );
}
