import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/status-badge";
import { SERVICE_STATUS } from "@/features/services/labels";
import type { ServiceStatus } from "@/features/metrics/types";

type ServiceStatusBadgeProps = {
  status: ServiceStatus;
};

export function ServiceStatusBadge({ status }: ServiceStatusBadgeProps) {
  const t = useTranslations("services.status");
  return <StatusBadge {...SERVICE_STATUS[status]} label={t(status)} />;
}
