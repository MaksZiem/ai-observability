import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
} from "@/features/incidents/labels";
import type {
  IncidentSeverity,
  IncidentStatus,
} from "@/features/incidents/types";

type IncidentStatusBadgeProps = {
  status: IncidentStatus;
};

export function IncidentStatusBadge({ status }: IncidentStatusBadgeProps) {
  const t = useTranslations("incidents.status");
  return <StatusBadge {...INCIDENT_STATUS[status]} label={t(status)} />;
}

type IncidentSeverityBadgeProps = {
  severity: IncidentSeverity;
};

export function IncidentSeverityBadge({
  severity,
}: IncidentSeverityBadgeProps) {
  const t = useTranslations("incidents.severity");
  return <StatusBadge {...INCIDENT_SEVERITY[severity]} label={t(severity)} />;
}
