import Link from "next/link";
import { useTranslations } from "next-intl";
import { useFormat } from "@/lib/format";
import { IncidentStatusBadge } from "@/features/incidents/components/incident-badges";
import { incidentPath } from "@/features/incidents/paths";
import type { SimilarIncident } from "@/features/incidents/types";

type SimilarIncidentsProps = {
  projectId: string;
  similar: SimilarIncident[];
};

export function SimilarIncidents({
  projectId,
  similar,
}: SimilarIncidentsProps) {
  const t = useTranslations("incidents.similar");
  const format = useFormat();

  if (similar.length === 0) {
    return (
      <p className="text-[13px] text-fg-muted">
        {t("empty")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col text-[13px]">
      {similar.map(({ incident, matches }) => (
        <li
          key={incident.id}
          className="border-b border-border py-2.5 first:pt-0 last:border-b-0"
        >
          <Link
            href={incidentPath(projectId, incident.id)}
            className="flex flex-col gap-1 hover:underline"
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate font-medium">
                <span className="font-mono text-fg-muted">
                  #{incident.number}
                </span>{" "}
                {incident.title}
              </span>
              <IncidentStatusBadge status={incident.status} />
            </span>
            <span className="text-fg-muted">
              {format.dayTime(incident.startedAt)} ·{" "}
              {matches
                .map((match) => t(match.kind, { value: match.value ?? "" }))
                .join(", ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
