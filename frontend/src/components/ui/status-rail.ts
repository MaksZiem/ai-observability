import type { StatusTone } from "@/components/ui/status-badge";

const RAIL_COLORS: Record<StatusTone, string> = {
  neutral: "border-l-border-strong",
  accent: "border-l-accent",
  success: "border-l-success/45",
  warning: "border-l-warning",
  danger: "border-l-danger",
  critical: "border-l-critical",
};

export const RAIL_SPACER = "border-l-[3px] border-l-transparent";

export function statusRail(tone: StatusTone) {
  return `border-l-[3px] ${RAIL_COLORS[tone]}`;
}
