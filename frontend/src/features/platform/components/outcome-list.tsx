import { useTranslations } from "next-intl";
import { useFormat } from "@/lib/format";
import type { OutcomeKind, PlatformStats } from "@/features/platform/types";

type OutcomeListProps = {
  outcomes: PlatformStats["outcomes"];
};

export function OutcomeList({ outcomes }: OutcomeListProps) {
  const t = useTranslations("platform");
  const format = useFormat();
  const kinds = Object.keys(outcomes) as OutcomeKind[];

  return (
    <dl className="flex flex-col text-[13px]">
      {kinds.map((kind) => {
        const { succeeded, failed } = outcomes[kind];
        const total = succeeded + failed;

        return (
          <div
            key={kind}
            className="flex items-baseline justify-between gap-3 border-b border-border py-2.5 first:pt-0 last:border-b-0 last:pb-0"
          >
            <dt>{t(`outcomes.${kind}`)}</dt>
            <dd className="font-mono tabular-nums">
              {t("outcome", { ok: format.count(succeeded) })}
              <span className={failed > 0 ? "text-danger" : "text-fg-muted"}>
                {" · "}
                {t("outcomeFailed", { failed: format.count(failed) })}
              </span>
              {total > 0 && (
                <span className="text-fg-muted">
                  {" · "}
                  {format.percent(failed / total)}
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
