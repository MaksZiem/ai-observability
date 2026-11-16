"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { requestAnalysis } from "@/features/analysis/actions";

type RequestAnalysisButtonProps = {
  projectId: string;
  incidentId: string;
  disabled: boolean;
  label: string;
};

export function RequestAnalysisButton({
  projectId,
  incidentId,
  disabled,
  label,
}: RequestAnalysisButtonProps) {
  const t = useTranslations("analysis.panel");
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="primary"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(() => requestAnalysis(projectId, incidentId))
      }
    >
      {pending ? t("requesting") : label}
    </Button>
  );
}
