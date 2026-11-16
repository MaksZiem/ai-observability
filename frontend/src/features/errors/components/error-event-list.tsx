import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { JsonBlock } from "@/components/ui/json-block";
import { useFormat } from "@/lib/format";
import type { ErrorEvent } from "@/features/errors/types";
import { tracePath } from "@/features/traces/paths";

type ErrorEventListProps = {
  projectId: string;
  events: ErrorEvent[];
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <>
      <dt className="text-fg-muted">{label}</dt>
      <dd className="min-w-0 truncate font-mono">{children}</dd>
    </>
  );
}

export function ErrorEventList({ projectId, events }: ErrorEventListProps) {
  const t = useTranslations("errorGroups.event");
  const format = useFormat();

  return (
    <ul className="flex flex-col">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="min-w-0 font-mono text-[13px]">{event.message}</p>
            <span className="font-mono text-xs text-fg-muted tabular-nums">
              {format.dayTime(event.timestamp)}
            </span>
          </div>

          <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-1.5 text-[13px] sm:grid-cols-[96px_1fr_96px_1fr]">
            <Field label={t("service")}>{event.service}</Field>
            {event.endpoint && <Field label={t("endpoint")}>{event.endpoint}</Field>}
            {event.traceId && (
              <Field label={t("trace")}>
                <Link
                  href={tracePath(projectId, event.traceId)}
                  className="text-accent hover:underline"
                >
                  {event.traceId}
                </Link>
              </Field>
            )}
            {event.requestId && (
              <Field label={t("request")}>{event.requestId}</Field>
            )}
          </dl>

          {event.stackTrace && (
            <details>
              <summary className="cursor-pointer text-[13px] text-fg-muted hover:text-fg">
                {t("stackTrace")}
              </summary>
              <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-xs leading-relaxed">
                {event.stackTrace}
              </pre>
            </details>
          )}

          {Object.keys(event.attributes).length > 0 && (
            <details>
              <summary className="cursor-pointer text-[13px] text-fg-muted hover:text-fg">
                {t("attributes")}
              </summary>
              <div className="mt-2">
                <JsonBlock value={event.attributes} />
              </div>
            </details>
          )}
        </li>
      ))}
    </ul>
  );
}
