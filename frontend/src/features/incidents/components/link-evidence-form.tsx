"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { linkEvidence, type FormState } from "@/features/incidents/actions";
import { LINK_KINDS } from "@/features/incidents/labels";

const INITIAL_STATE: FormState = { error: null, saved: false };

type LinkEvidenceFormProps = {
  projectId: string;
  incidentId: string;
};

export function LinkEvidenceForm({
  projectId,
  incidentId,
}: LinkEvidenceFormProps) {
  const t = useTranslations("incidents");
  const [state, formAction] = useActionState(
    linkEvidence.bind(null, projectId),
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="incidentId" value={incidentId} />
      <div className="flex flex-wrap gap-2">
        <Select name="kind" aria-label={t("link.type")} defaultValue="trace">
          {LINK_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {t(`linkKinds.${kind}`)}
            </option>
          ))}
        </Select>
        <Input
          name="targetId"
          aria-label={t("link.id")}
          placeholder={t("link.placeholder")}
          maxLength={64}
          className="min-w-0 flex-1 font-mono"
          required
        />
        <SubmitButton pendingLabel={t("link.pending")}>{t("link.submit")}</SubmitButton>
      </div>
      {state.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
