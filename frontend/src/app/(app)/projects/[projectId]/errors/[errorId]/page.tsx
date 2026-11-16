import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { getFormat } from "@/lib/format-server";
import { ErrorEventList } from "@/features/errors/components/error-event-list";
import { ErrorStatusBadge } from "@/features/errors/components/error-status-badge";
import { ErrorStatusSelect } from "@/features/errors/components/error-status-select";
import { getErrorGroup, listErrorEvents } from "@/features/errors/queries";
import { AddToIncidentForm } from "@/features/incidents/components/add-to-incident-form";
import { listIncidents } from "@/features/incidents/queries";
import { getProject } from "@/features/projects/queries";
import { servicePath } from "@/features/services/paths";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[projectId]/errors/[errorId]">): Promise<Metadata> {
  const { projectId, errorId } = await params;
  const group = await getErrorGroup(projectId, errorId);
  return { title: group.type };
}

type DetailProps = {
  label: string;
  children: ReactNode;
};

function Detail({ label, children }: DetailProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="truncate font-mono text-[13px] tabular-nums">
        {children}
      </dd>
    </div>
  );
}

export default async function ErrorPage({
  params,
}: PageProps<"/projects/[projectId]/errors/[errorId]">) {
  const { projectId, errorId } = await params;

  const [t, format] = await Promise.all([getTranslations("errorGroups"), getFormat()]);
  await getProject(projectId);
  const [group, events, openIncidents, investigatingIncidents] =
    await Promise.all([
      getErrorGroup(projectId, errorId),
      listErrorEvents(projectId, errorId),
      listIncidents(projectId, "open"),
      listIncidents(projectId, "investigating"),
    ]);
  const activeIncidents = [...openIncidents, ...investigatingIncidents];

  return (
    <div>
      <PageHeader
        back={{ href: `/projects/${projectId}/errors`, label: t("title") }}
        title={<span className="font-mono">{group.type}</span>}
        description={group.message}
        actions={
          <>
            <ErrorStatusBadge status={group.status} />
            <ErrorStatusSelect
              projectId={projectId}
              errorId={group.id}
              status={group.status}
            />
          </>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-surface p-[18px] lg:grid-cols-5">
          <Detail label={t("detail.service")}>
            <Link
              href={servicePath(projectId, group.service)}
              className="text-accent hover:underline"
            >
              {group.service}
            </Link>
          </Detail>
          <Detail label={t("detail.endpoint")}>{group.endpoint ?? "—"}</Detail>
          <Detail label={t("detail.occurrences")}>{format.count(group.occurrences)}</Detail>
          <Detail label={t("detail.firstSeen")}>{format.dayTime(group.firstSeen)}</Detail>
          <Detail label={t("detail.lastSeen")}>{format.dayTime(group.lastSeen)}</Detail>
        </dl>

        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-[18px]">
          <h2 className="text-base font-semibold">{t("detail.addToIncident")}</h2>
          <AddToIncidentForm
            projectId={projectId}
            kind="error_group"
            targetId={group.id}
            incidents={activeIncidents}
          />
        </section>

        <section className="rounded-xl border border-border bg-surface p-[18px]">
          <h2 className="mb-4 text-base font-semibold">{t("detail.recentEvents")}</h2>
          {events.length === 0 ? (
            <p className="text-[13px] text-fg-muted">{t("detail.noEvents")}</p>
          ) : (
            <ErrorEventList projectId={projectId} events={events} />
          )}
        </section>
      </div>
    </div>
  );
}
