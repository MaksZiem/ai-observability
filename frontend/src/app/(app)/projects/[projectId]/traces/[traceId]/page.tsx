import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonClasses } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getFormat } from "@/lib/format-server";
import { decodeParam } from "@/lib/url";
import { logsHref } from "@/features/logs/filters";
import { listLogs } from "@/features/logs/queries";
import { getProject } from "@/features/projects/queries";
import { SpanStatusBadge } from "@/features/traces/components/span-status-badge";
import { TraceView } from "@/features/traces/components/trace-view";
import { getTrace } from "@/features/traces/queries";

const TRACE_LOGS_LIMIT = 200;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("traces");
  return { title: t("trace") };
}

export default async function TracePage({
  params,
}: PageProps<"/projects/[projectId]/traces/[traceId]">) {
  const { projectId, traceId: traceParam } = await params;
  const traceId = decodeParam(traceParam);

  const [t, format] = await Promise.all([getTranslations("traces"), getFormat()]);
  await getProject(projectId);
  const [trace, logs] = await Promise.all([
    getTrace(projectId, traceId),
    listLogs(projectId, { traceId, limit: TRACE_LOGS_LIMIT }),
  ]);

  const summary = [
    format.dayTime(trace.startTime),
    format.latency(trace.durationMs),
    t("detail.spans", { count: trace.spanCount }),
    trace.services.join(", "),
  ].join(" · ");

  return (
    <div>
      <PageHeader
        back={{ href: `/projects/${projectId}/traces`, label: t("title") }}
        title={
          <span className="font-mono">{trace.rootSpan?.name ?? traceId}</span>
        }
        description={summary}
        actions={
          <>
            <SpanStatusBadge status={trace.hasError ? "error" : "ok"} />
            <Link
              href={logsHref(projectId, { traceId })}
              className={buttonClasses("secondary")}
            >
              {t("detail.viewLogs")}
            </Link>
          </>
        }
      />
      <p className="border-b border-border px-6 py-2 font-mono text-xs text-fg-muted">
        {t("detail.traceId", { id: trace.traceId })}
      </p>

      <TraceView projectId={projectId} trace={trace} logs={logs.items} />
    </div>
  );
}
