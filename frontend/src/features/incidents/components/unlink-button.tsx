"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { unlinkEvidence } from "@/features/incidents/actions";

type UnlinkButtonProps = {
  projectId: string;
  incidentId: string;
  linkId: string;
};

export function UnlinkButton({
  projectId,
  incidentId,
  linkId,
}: UnlinkButtonProps) {
  const t = useTranslations("incidents.link");
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={t("remove")}
      disabled={pending}
      onClick={() =>
        startTransition(() => unlinkEvidence(projectId, incidentId, linkId))
      }
      className="flex size-7 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
    >
      <X className="size-4" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
