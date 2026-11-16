import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/status-badge";
import { useFormat } from "@/lib/format";
import { AlertRuleActions } from "@/features/alerts/components/alert-rule-actions";
import {
  alertBadge,
  COMPARATORS,
  formatMetric,
} from "@/features/alerts/labels";
import type { AlertRule } from "@/features/alerts/types";

type AlertRuleListProps = {
  projectId: string;
  rules: AlertRule[];
};

export function AlertRuleList({ projectId, rules }: AlertRuleListProps) {
  const t = useTranslations();
  const format = useFormat();

  function describeCondition(rule: AlertRule) {
    return t("alerts.condition", {
      metric: t(`alerts.metrics.${rule.metric}`),
      comparator: COMPARATORS[rule.comparator],
      threshold: formatMetric(format, rule.metric, rule.threshold),
      minutes: rule.windowMinutes,
    });
  }

  function describeActions(rule: AlertRule) {
    const actions = [];
    if (rule.createIncident) {
      actions.push(
        t("alerts.actions.createsIncident", {
          severity: t(`incidents.severity.${rule.incidentSeverity}`).toLowerCase(),
        }),
      );
    }
    if (rule.webhookUrl) {
      actions.push(
        t("alerts.actions.calls", { host: new URL(rule.webhookUrl).host }),
      );
    }
    return actions.length > 0
      ? t("alerts.actions.then", {
          actions: actions.join(t("alerts.actions.and")),
        })
      : t("alerts.actions.none");
  }

  return (
    <ul className="flex flex-col rounded-xl border border-border bg-surface">
      {rules.map((rule) => {
        const badge = alertBadge(rule);

        return (
          <li
            key={rule.id}
            className="flex flex-col gap-3 border-b border-border p-[18px] last:border-b-0"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-semibold">
                    {rule.name}
                  </h3>
                  <StatusBadge
                    tone={badge.tone}
                    indicator={badge.indicator}
                    label={t(`alerts.states.${badge.state}`)}
                  />
                </div>
                <p className="font-mono text-[13px]">
                  {describeCondition(rule)}
                  {rule.service && (
                    <span className="text-fg-muted"> · {rule.service}</span>
                  )}
                </p>
                <p className="text-[13px] text-fg-muted">
                  {describeActions(rule)}
                </p>
              </div>
              <AlertRuleActions
                projectId={projectId}
                ruleId={rule.id}
                name={rule.name}
                enabled={rule.enabled}
              />
            </div>

            <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
              <div className="flex gap-1.5">
                <dt className="text-fg-muted">{t("alerts.list.lastValue")}</dt>
                <dd className="font-mono tabular-nums">
                  {rule.lastValue === null
                    ? "—"
                    : formatMetric(format, rule.metric, rule.lastValue)}
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-fg-muted">{t("alerts.list.evaluated")}</dt>
                <dd className="font-mono tabular-nums">
                  {rule.lastEvaluatedAt
                    ? format.dayTime(rule.lastEvaluatedAt)
                    : t("alerts.list.never")}
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-fg-muted">{t("alerts.list.lastFired")}</dt>
                <dd className="font-mono tabular-nums">
                  {rule.lastTriggeredAt
                    ? format.dayTime(rule.lastTriggeredAt)
                    : t("alerts.list.never")}
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
