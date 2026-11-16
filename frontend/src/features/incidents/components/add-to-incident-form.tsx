"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { linkEvidence, type FormState } from "@/features/incidents/actions";
import type { Incident, IncidentLinkKind } from "@/features/incidents/types";

const INITIAL_STATE: FormState = { error: null, saved: false };

type AddToIncidentFormProps = {
  projectId: string;
  kind: IncidentLinkKind;
  targetId: string;
  incidents: Incident[];
};

export function AddToIncidentForm({
  projectId,
  kind,
  targetId,
  incidents,
}: AddToIncidentFormProps) {
  const t = useTranslations("incidents.link");
  const [state, formAction] = useActionState(
    linkEvidence.bind(null, projectId),
    INITIAL_STATE,
  );

  if (incidents.length === 0) {
    return (
      <p className="text-[13px] text-fg-muted">
        {t("noActive")}{" "}
        <Link
          href={`/projects/${projectId}/incidents/new`}
          className="text-accent hover:underline"
        >
          {t("create")}
        </Link>
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="targetId" value={targetId} />
      <div className="flex flex-wrap gap-2">
        <Select
          name="incidentId"
          aria-label={t("incident")}
          className="min-w-0 flex-1"
        >
          {incidents.map((incident) => (
            <option key={incident.id} value={incident.id}>
              #{incident.number} {incident.title}
            </option>
          ))}
        </Select>
        <SubmitButton pendingLabel={t("adding")}>{t("add")}</SubmitButton>
      </div>
      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p role="status" className="text-xs text-success">
          {t("linked")}
        </p>
      )}
    </form>
  );
}
