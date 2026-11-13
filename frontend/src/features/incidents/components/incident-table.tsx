import Link from "next/link";
import { RAIL_SPACER, statusRail } from "@/components/ui/status-rail";
import { formatDayTime } from "@/lib/format";
import {
  IncidentSeverityBadge,
  IncidentStatusBadge,
} from "@/features/incidents/components/incident-badges";
import { INCIDENT_STATUS } from "@/features/incidents/labels";
import { incidentPath } from "@/features/incidents/paths";
import type { Incident } from "@/features/incidents/types";

const COLUMNS =
  "grid grid-cols-[64px_minmax(240px,1fr)_110px_130px_130px] items-center gap-4 px-4";

type IncidentTableProps = {
  projectId: string;
  incidents: Incident[];
};

export function IncidentTable({ projectId, incidents }: IncidentTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px] text-[13px]">
        <div
          className={`${COLUMNS} ${RAIL_SPACER} border-b border-border py-2 text-xs font-medium text-fg-muted`}
        >
          <span>#</span>
          <span>Title</span>
          <span>Severity</span>
          <span>Status</span>
          <span className="text-right">Started</span>
        </div>

        <ul>
          {incidents.map((incident) => (
            <li key={incident.id} className="border-b border-border">
              <Link
                href={incidentPath(projectId, incident.id)}
                className={`${COLUMNS} ${statusRail(INCIDENT_STATUS[incident.status].tone)} py-2.5 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
              >
                <span className="font-mono text-fg-muted tabular-nums">
                  #{incident.number}
                </span>
                <span className="truncate font-medium">{incident.title}</span>
                <span>
                  <IncidentSeverityBadge severity={incident.severity} />
                </span>
                <span>
                  <IncidentStatusBadge status={incident.status} />
                </span>
                <span className="text-right font-mono text-fg-muted tabular-nums">
                  {formatDayTime(incident.startedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
