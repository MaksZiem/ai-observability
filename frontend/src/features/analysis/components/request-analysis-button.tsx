"use client";

import { useState, useTransition } from "react";
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
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="primary"
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await requestAnalysis(projectId, incidentId);
            setError(result.error);
          })
        }
      >
        {pending ? t("requesting") : label}
      </Button>
      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
