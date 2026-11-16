import { useTranslations } from "next-intl";
import { useFormat } from "@/lib/format";
import type {
  PlatformStats,
  TelemetryType,
} from "@/features/platform/types";

const COLUMNS =
  "grid grid-cols-[minmax(110px,1fr)_repeat(6,88px)] items-center gap-3 px-4";

type Column = {
  key: "requests" | "items" | "stored" | "rejected" | "failed" | "deadLettered";
  problem?: "warning" | "danger";
};

const NUMBER_COLUMNS: Column[] = [
  { key: "requests" },
  { key: "items" },
  { key: "stored" },
  { key: "rejected", problem: "warning" },
  { key: "failed", problem: "danger" },
  { key: "deadLettered", problem: "danger" },
];

const PROBLEM_CLASSES = {
  warning: "text-warning",
  danger: "text-danger",
};

type IngestTableProps = {
  ingest: PlatformStats["ingest"];
};

function valueClass(column: Column, value: number) {
  if (!column.problem) return "";
  return value > 0 ? PROBLEM_CLASSES[column.problem] : "text-fg-muted";
}

export function IngestTable({ ingest }: IngestTableProps) {
  const t = useTranslations("platform");
  const format = useFormat();
  const types = Object.keys(ingest) as TelemetryType[];

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <div className="min-w-[720px] text-[13px]">
        <div
          className={`${COLUMNS} border-b border-border py-2 text-xs font-medium text-fg-muted`}
        >
          <span>{t("columns.telemetry")}</span>
          {NUMBER_COLUMNS.map((column) => (
            <span key={column.key} className="text-right">
              {t(`columns.${column.key}`)}
            </span>
          ))}
        </div>
        <ul>
          {types.map((type) => {
            const counters = ingest[type];

            return (
              <li
                key={type}
                className={`${COLUMNS} border-b border-border py-2.5 last:border-b-0`}
              >
                <span>{t(`telemetry.${type}`)}</span>
                {NUMBER_COLUMNS.map((column) => (
                  <span
                    key={column.key}
                    className={`text-right font-mono tabular-nums ${valueClass(column, counters[column.key])}`}
                  >
                    {format.count(counters[column.key])}
                  </span>
                ))}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
