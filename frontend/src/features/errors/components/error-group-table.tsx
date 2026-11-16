import Link from "next/link";
import { useTranslations } from "next-intl";
import { RAIL_SPACER, statusRail } from "@/components/ui/status-rail";
import { useFormat } from "@/lib/format";
import { ErrorStatusBadge } from "@/features/errors/components/error-status-badge";
import { ERROR_STATUS } from "@/features/errors/labels";
import type { ErrorGroup } from "@/features/errors/types";

const COLUMNS =
  "grid grid-cols-[minmax(240px,1fr)_140px_130px_100px_120px] items-center gap-4 px-4";

type ErrorGroupTableProps = {
  projectId: string;
  groups: ErrorGroup[];
};

export function ErrorGroupTable({ projectId, groups }: ErrorGroupTableProps) {
  const t = useTranslations("errorGroups.columns");
  const format = useFormat();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px] text-[13px]">
        <div
          className={`${COLUMNS} ${RAIL_SPACER} border-b border-border py-2 text-xs font-medium text-fg-muted`}
        >
          <span>{t("error")}</span>
          <span>{t("service")}</span>
          <span>{t("status")}</span>
          <span className="text-right">{t("occurrences")}</span>
          <span className="text-right">{t("lastSeen")}</span>
        </div>

        <ul>
          {groups.map((group) => (
            <li key={group.id} className="border-b border-border">
              <Link
                href={`/projects/${projectId}/errors/${group.id}`}
                className={`${COLUMNS} ${statusRail(ERROR_STATUS[group.status].tone)} py-2.5 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-mono font-medium">
                    {group.type}
                  </span>
                  <span className="truncate text-fg-muted">
                    {group.endpoint && (
                      <span className="font-mono">{group.endpoint} · </span>
                    )}
                    {group.message}
                  </span>
                </span>
                <span className="truncate font-mono text-fg-muted">
                  {group.service}
                </span>
                <span>
                  <ErrorStatusBadge status={group.status} />
                </span>
                <span className="text-right font-mono tabular-nums">
                  {format.count(group.occurrences)}
                </span>
                <span className="text-right font-mono text-fg-muted tabular-nums">
                  {format.dayTime(group.lastSeen)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
