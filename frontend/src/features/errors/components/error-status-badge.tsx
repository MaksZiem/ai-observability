import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/status-badge";
import { ERROR_STATUS } from "@/features/errors/labels";
import type { ErrorStatus } from "@/features/errors/types";

type ErrorStatusBadgeProps = {
  status: ErrorStatus;
};

export function ErrorStatusBadge({ status }: ErrorStatusBadgeProps) {
  const t = useTranslations("errorGroups.status");
  return <StatusBadge {...ERROR_STATUS[status]} label={t(status)} />;
}
