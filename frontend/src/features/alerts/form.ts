import { COMPARATOR_KEYS, METRIC_KEYS } from "@/features/alerts/labels";
import type { AlertComparator, AlertMetric } from "@/features/alerts/types";
import { INCIDENT_SEVERITIES } from "@/features/incidents/labels";
import type { IncidentSeverity } from "@/features/incidents/types";

export const MAX_WINDOW_MINUTES = 1440;

export type AlertFormError =
  | "nameRequired"
  | "choicesRequired"
  | "threshold"
  | "window";

export type AlertFormValues = {
  name: string;
  metric: string;
  comparator: string;
  threshold: string;
  windowMinutes: string;
  service: string;
  createIncident: boolean;
  incidentSeverity: string;
  webhookUrl: string;
};

export type AlertPayload = {
  name: string;
  metric: AlertMetric;
  comparator: AlertComparator;
  threshold: number;
  windowMinutes: number;
  service?: string;
  createIncident: boolean;
  incidentSeverity: IncidentSeverity;
  webhookUrl?: string;
};

export const EMPTY_ALERT_VALUES: AlertFormValues = {
  name: "",
  metric: "error_rate",
  comparator: "gt",
  threshold: "",
  windowMinutes: "5",
  service: "",
  createIncident: true,
  incidentSeverity: "high",
  webhookUrl: "",
};

export function readAlertForm(formData: FormData): AlertFormValues {
  const read = (key: string) => String(formData.get(key) ?? "").trim();

  return {
    name: read("name"),
    metric: read("metric"),
    comparator: read("comparator"),
    threshold: read("threshold"),
    windowMinutes: read("windowMinutes"),
    service: read("service"),
    createIncident: formData.get("createIncident") === "on",
    incidentSeverity: read("incidentSeverity"),
    webhookUrl: read("webhookUrl"),
  };
}

export function validateAlertForm(
  values: AlertFormValues,
):
  | { payload: AlertPayload; error: null }
  | { payload: null; error: AlertFormError } {
  const metric = METRIC_KEYS.find((key) => key === values.metric);
  const comparator = COMPARATOR_KEYS.find((key) => key === values.comparator);
  const severity = INCIDENT_SEVERITIES.find(
    (key) => key === values.incidentSeverity,
  );
  const threshold = Number(values.threshold);
  const windowMinutes = Number(values.windowMinutes);

  if (!values.name) return { payload: null, error: "nameRequired" };
  if (!metric || !comparator || !severity) {
    return { payload: null, error: "choicesRequired" };
  }
  if (values.threshold === "" || !Number.isFinite(threshold) || threshold < 0) {
    return { payload: null, error: "threshold" };
  }
  if (
    !Number.isInteger(windowMinutes) ||
    windowMinutes < 1 ||
    windowMinutes > MAX_WINDOW_MINUTES
  ) {
    return { payload: null, error: "window" };
  }

  return {
    error: null,
    payload: {
      name: values.name,
      metric,
      comparator,
      threshold: metric === "error_rate" ? threshold / 100 : threshold,
      windowMinutes,
      service: values.service || undefined,
      createIncident: values.createIncident,
      incidentSeverity: severity,
      webhookUrl: values.webhookUrl || undefined,
    },
  };
}
