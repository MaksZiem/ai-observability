import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/status-badge";
import { SPAN_STATUS } from "@/features/traces/labels";
import type { SpanStatus } from "@/features/traces/types";

type SpanStatusBadgeProps = {
  status: SpanStatus;
};

export function SpanStatusBadge({ status }: SpanStatusBadgeProps) {
  const t = useTranslations("traces.status");
  return <StatusBadge {...SPAN_STATUS[status]} label={t(status)} />;
}
