import Link from "next/link";
import { useTranslations } from "next-intl";
import type { TimeRange } from "@/features/metrics/types";
import type { SpanStatus } from "@/features/traces/types";

const FILTERS: (SpanStatus | null)[] = [null, "error", "ok"];

type TraceStatusFilterProps = {
  projectId: string;
  range: TimeRange;
  active: SpanStatus | null;
};

export function TraceStatusFilter({
  projectId,
  range,
  active,
}: TraceStatusFilterProps) {
  const t = useTranslations("traces.filter");

  return (
    <nav aria-label={t("label")} className="flex flex-wrap gap-1">
      {FILTERS.map((status) => {
        const label = t(status ?? "all");
        const query = new URLSearchParams({ range });
        if (status) query.set("status", status);
        const isActive = status === active;

        return (
          <Link
            key={status ?? "all"}
            href={`/projects/${projectId}/traces?${query}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-2.5 py-1 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              isActive
                ? "bg-surface-2 text-fg"
                : "text-fg-muted hover:bg-surface-hover hover:text-fg"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
