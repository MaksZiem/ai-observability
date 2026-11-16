import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/status-badge";
import { ANALYSIS_STATUS } from "@/features/analysis/labels";
import type { AnalysisStatus } from "@/features/analysis/types";

type AnalysisStatusBadgeProps = {
  status: AnalysisStatus;
};

export function AnalysisStatusBadge({ status }: AnalysisStatusBadgeProps) {
  const t = useTranslations("analysis.status");
  return <StatusBadge {...ANALYSIS_STATUS[status]} label={t(status)} />;
}
