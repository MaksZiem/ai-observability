import type { StatusIndicator, StatusTone } from "@/components/ui/status-badge";
import type { ErrorStatus } from "@/features/errors/types";

export const ERROR_STATUS: Record<
  ErrorStatus,
  { tone: StatusTone; indicator: StatusIndicator }
> = {
  open: { tone: "danger", indicator: "dot" },
  investigating: { tone: "warning", indicator: "dot" },
  resolved: { tone: "success", indicator: "check" },
};

export const ERROR_STATUSES = Object.keys(ERROR_STATUS) as ErrorStatus[];

export function parseErrorStatus(value: string | string[] | undefined) {
  return ERROR_STATUSES.find((status) => status === value) ?? null;
}
