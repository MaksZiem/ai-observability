"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  deleteAlertRule,
  evaluateAlertRule,
  setAlertRuleEnabled,
} from "@/features/alerts/actions";

type AlertRuleActionsProps = {
  projectId: string;
  ruleId: string;
  name: string;
  enabled: boolean;
};

export function AlertRuleActions({
  projectId,
  ruleId,
  name,
  enabled,
}: AlertRuleActionsProps) {
  const t = useTranslations("alerts.list");
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(action);
  }

  return (
    <div className="flex flex-wrap gap-2" aria-busy={pending}>
      <Button
        disabled={pending || !enabled}
        onClick={() => run(() => evaluateAlertRule(projectId, ruleId))}
      >
        {t("evaluate")}
      </Button>
      <Button
        disabled={pending}
        onClick={() =>
          run(() => setAlertRuleEnabled(projectId, ruleId, !enabled))
        }
      >
        {enabled ? t("pause") : t("resume")}
      </Button>
      <Button
        variant="danger"
        disabled={pending}
        onClick={() => {
          if (window.confirm(t("deleteConfirm", { name }))) {
            run(() => deleteAlertRule(projectId, ruleId));
          }
        }}
      >
        {t("delete")}
      </Button>
    </div>
  );
}
