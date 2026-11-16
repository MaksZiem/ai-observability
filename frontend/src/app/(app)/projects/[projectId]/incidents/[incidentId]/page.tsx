import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { getFormat } from "@/lib/format-server";
import { IncidentAnalysisPanel } from "@/features/analysis/components/incident-analysis-panel";
import { IncidentChat } from "@/features/analysis/components/incident-chat";
import { listAnalyses, listChatMessages } from "@/features/analysis/queries";
import { AddNoteForm } from "@/features/incidents/components/add-note-form";
import {
  IncidentSeverityBadge,
  IncidentStatusBadge,
} from "@/features/incidents/components/incident-badges";
import { IncidentEvidence } from "@/features/incidents/components/incident-evidence";
import { IncidentStatusSelect } from "@/features/incidents/components/incident-status-select";
import { IncidentTimeline } from "@/features/incidents/components/incident-timeline";
import { LinkEvidenceForm } from "@/features/incidents/components/link-evidence-form";
import { SimilarIncidents } from "@/features/incidents/components/similar-incidents";
import {
  getIncident,
  getIncidentEvidence,
  getIncidentTimeline,
  listIncidentLinks,
  listSimilarIncidents,
} from "@/features/incidents/queries";
import { getProject } from "@/features/projects/queries";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[projectId]/incidents/[incidentId]">): Promise<Metadata> {
  const { projectId, incidentId } = await params;
  const incident = await getIncident(projectId, incidentId);
  return { title: `#${incident.number} ${incident.title}` };
}

type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel({ title, children }: PanelProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-[18px]">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IncidentPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/incidents/[incidentId]">) {
  const { projectId, incidentId } = await params;
  const selectedAnalysisId = readParam((await searchParams).analysis);

  const [t, format] = await Promise.all([getTranslations("incidents"), getFormat()]);
  await getProject(projectId);
  const incident = await getIncident(projectId, incidentId);
  const [timeline, evidence, links, similar, analyses, messages] =
    await Promise.all([
      getIncidentTimeline(projectId, incidentId),
      getIncidentEvidence(projectId, incidentId),
      listIncidentLinks(projectId, incidentId),
      listSimilarIncidents(projectId, incidentId),
      listAnalyses(projectId, incidentId),
      listChatMessages(projectId, incidentId),
    ]);

  const end = incident.resolvedAt ? new Date(incident.resolvedAt) : new Date();
  const duration = end.getTime() - new Date(incident.startedAt).getTime();

  return (
    <div>
      <PageHeader
        back={{ href: `/projects/${projectId}/incidents`, label: t("title") }}
        title={
          <>
            <span className="font-mono text-fg-muted">#{incident.number}</span>{" "}
            {incident.title}
          </>
        }
        description={incident.description ?? undefined}
        actions={
          <>
            <IncidentSeverityBadge severity={incident.severity} />
            <IncidentStatusBadge status={incident.status} />
            <IncidentStatusSelect
              projectId={projectId}
              incidentId={incident.id}
              status={incident.status}
            />
          </>
        }
      />

      <div className="grid items-start gap-6 p-6 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-6">
          <IncidentAnalysisPanel
            projectId={projectId}
            incidentId={incident.id}
            analyses={analyses}
            selectedId={selectedAnalysisId}
          />

          <Panel title={t("detail.timeline")}>
            <IncidentTimeline projectId={projectId} entries={timeline} />
            <div className="border-t border-border pt-4">
              <AddNoteForm projectId={projectId} incidentId={incident.id} />
            </div>
          </Panel>

          <Panel title={t("detail.evidence")}>
            <IncidentEvidence
              projectId={projectId}
              incidentId={incident.id}
              evidence={evidence}
              links={links}
            />
            <div className="border-t border-border pt-4">
              <LinkEvidenceForm
                projectId={projectId}
                incidentId={incident.id}
              />
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title={t("detail.details")}>
            <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 text-[13px]">
              <dt className="text-fg-muted">{t("detail.started")}</dt>
              <dd className="font-mono tabular-nums">
                {format.dayTime(incident.startedAt)}
              </dd>
              <dt className="text-fg-muted">{t("detail.resolved")}</dt>
              <dd className="font-mono tabular-nums">
                {incident.resolvedAt ? format.dayTime(incident.resolvedAt) : "—"}
              </dd>
              <dt className="text-fg-muted">{t("detail.duration")}</dt>
              <dd className="font-mono tabular-nums">
                {incident.resolvedAt
                  ? format.duration(duration)
                  : t("detail.soFar", { duration: format.duration(duration) })}
              </dd>
            </dl>
          </Panel>

          <Panel title={t("detail.assistant")}>
            <IncidentChat
              projectId={projectId}
              incidentId={incident.id}
              messages={messages}
            />
          </Panel>

          <Panel title={t("detail.similar")}>
            <SimilarIncidents projectId={projectId} similar={similar} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
