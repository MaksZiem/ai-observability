import Link from "next/link";
import { RAIL_SPACER, statusRail } from "@/components/ui/status-rail";
import { formatCount, formatLatency, formatPercent } from "@/lib/format";
import { errorRateTone, latencyTone } from "@/features/metrics/health";
import { ServiceStatusBadge } from "@/features/services/components/service-status-badge";
import {
  SERVICE_STATUS,
  SERVICE_STATUS_ORDER,
} from "@/features/services/labels";
import { servicePath } from "@/features/services/paths";
import type { ServiceHealth, TimeRange } from "@/features/metrics/types";

const COLUMNS =
  "grid grid-cols-[minmax(160px,1fr)_120px_100px_100px_100px] items-center gap-4 px-4";

const VALUE_TONE_CLASSES = {
  default: "",
  warning: "text-warning",
  critical: "text-critical",
};

type ServiceTableProps = {
  projectId: string;
  range: TimeRange;
  services: ServiceHealth[];
};

function byStatusThenName(a: ServiceHealth, b: ServiceHealth) {
  const status =
    SERVICE_STATUS_ORDER.indexOf(a.status) -
    SERVICE_STATUS_ORDER.indexOf(b.status);
  return status !== 0 ? status : a.service.localeCompare(b.service);
}

export function ServiceTable({
  projectId,
  range,
  services,
}: ServiceTableProps) {
  const sorted = [...services].sort(byStatusThenName);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] text-[13px]">
        <div
          className={`${COLUMNS} ${RAIL_SPACER} border-b border-border py-2 text-xs font-medium text-fg-muted`}
        >
          <span>Service</span>
          <span>Status</span>
          <span className="text-right">Requests</span>
          <span className="text-right">Error rate</span>
          <span className="text-right">P95 latency</span>
        </div>

        <ul>
          {sorted.map((service) => (
            <li key={service.service} className="border-b border-border">
              <Link
                href={`${servicePath(projectId, service.service)}?range=${range}`}
                className={`${COLUMNS} ${statusRail(SERVICE_STATUS[service.status].tone)} py-2.5 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
              >
                <span className="truncate font-mono font-medium">
                  {service.service}
                </span>
                <span>
                  <ServiceStatusBadge status={service.status} />
                </span>
                <span className="text-right font-mono tabular-nums">
                  {formatCount(service.requests)}
                </span>
                <span
                  className={`text-right font-mono tabular-nums ${VALUE_TONE_CLASSES[errorRateTone(service)]}`}
                >
                  {formatPercent(service.errorRate)}
                </span>
                <span
                  className={`text-right font-mono tabular-nums ${VALUE_TONE_CLASSES[latencyTone(service)]}`}
                >
                  {formatLatency(service.p95LatencyMs)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
