import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type {
  IncidentLinkKind,
  IncidentSeverity,
  IncidentStatus,
} from "@/features/incidents/types";

type BadgeStyle = {
  tone: StatusTone;
  indicator: StatusIndicator;
};

export const INCIDENT_STATUS: Record<IncidentStatus, BadgeStyle> = {
  open: { tone: "danger", indicator: "dot" },
  investigating: { tone: "warning", indicator: "dot" },
  resolved: { tone: "success", indicator: "check" },
};

export const INCIDENT_SEVERITY: Record<IncidentSeverity, BadgeStyle> = {
  low: { tone: "neutral", indicator: "hollow" },
  medium: { tone: "warning", indicator: "dot" },
  high: { tone: "danger", indicator: "dot" },
  critical: { tone: "critical", indicator: "dot" },
};

export const INCIDENT_STATUSES = Object.keys(
  INCIDENT_STATUS,
) as IncidentStatus[];

export const INCIDENT_SEVERITIES = Object.keys(
  INCIDENT_SEVERITY,
) as IncidentSeverity[];

export const LINK_KINDS: IncidentLinkKind[] = [
  "error_group",
  "trace",
  "deployment",
  "log",
];

export function parseIncidentStatus(value: string | string[] | undefined) {
  return INCIDENT_STATUSES.find((status) => status === value) ?? null;
}
