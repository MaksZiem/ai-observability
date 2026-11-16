import type { Metadata } from "next";
import { Rocket } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CreateDeploymentForm } from "@/features/deployments/components/create-deployment-form";
import { DeploymentList } from "@/features/deployments/components/deployment-list";
import { listDeployments } from "@/features/deployments/queries";
import { TimeRangePicker } from "@/features/metrics/components/time-range-picker";
import { parseTimeRange, rangeStart } from "@/features/metrics/time-range";
import { getProject } from "@/features/projects/queries";

const DEPLOYMENTS_LIMIT = 100;

const CI_SNIPPET = `curl -X POST "$OBSERVABILITY_API_URL/ingest/deployments" \\
  -H "x-api-key: $OBSERVABILITY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"version":"v1.42.3","service":"payment-service","commitSha":"'"$GIT_SHA"'"}'`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("deployments");
  return { title: t("title") };
}

export default async function DeploymentsPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/deployments">) {
  const { projectId } = await params;
  const range = parseTimeRange((await searchParams).range);

  const t = await getTranslations("deployments");
  await getProject(projectId);
  const deployments = await listDeployments(projectId, {
    from: rangeStart(range),
    limit: DEPLOYMENTS_LIMIT,
  });

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("lead")}
        actions={<TimeRangePicker value={range} />}
      />

      <div className="grid items-start gap-6 p-6 lg:grid-cols-[1fr_360px]">
        {deployments.length === 0 ? (
          <EmptyState
            icon={Rocket}
            title={t("empty")}
            description={t("emptyHint")}
          />
        ) : (
          <section className="rounded-xl border border-border bg-surface px-[18px] py-2">
            <DeploymentList deployments={deployments} />
          </section>
        )}

        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-border bg-surface p-[18px]">
            <h2 className="mb-4 text-base font-semibold">{t("register")}</h2>
            <CreateDeploymentForm projectId={projectId} />
          </section>

          <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-[18px]">
            <h2 className="text-base font-semibold">{t("fromCi")}</h2>
            <p className="text-[13px] text-fg-muted">{t("fromCiLead")}</p>
            <pre className="overflow-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-xs leading-relaxed">
              {CI_SNIPPET}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
