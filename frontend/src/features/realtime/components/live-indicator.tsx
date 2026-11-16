import { useTranslations } from "next-intl";
import type { StreamStatus } from "@/features/realtime/types";

const STATUS_DOT: Record<StreamStatus, string> = {
  connecting: "border border-fg-muted",
  live: "bg-success",
  offline: "bg-warning",
};

type LiveIndicatorProps = {
  status: StreamStatus;
};

export function LiveIndicator({ status }: LiveIndicatorProps) {
  const t = useTranslations("live");
  const dot = STATUS_DOT[status];
  const label = t(status);

  return (
    <p
      role="status"
      className="flex items-center gap-1.5 text-xs text-fg-muted"
      title={t("hint")}
    >
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </p>
  );
}
