import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type { AnalysisStatus } from "@/features/analysis/types";

export const ANALYSIS_STATUS: Record<
  AnalysisStatus,
  { tone: StatusTone; indicator: StatusIndicator }
> = {
  pending: { tone: "accent", indicator: "pulse" },
  completed: { tone: "success", indicator: "check" },
  failed: { tone: "danger", indicator: "cross" },
};
