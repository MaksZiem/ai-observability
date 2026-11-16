"use client";

import { useOptimistic, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import { updateErrorStatus } from "@/features/errors/actions";
import { ERROR_STATUSES } from "@/features/errors/labels";
import type { ErrorStatus } from "@/features/errors/types";

type ErrorStatusSelectProps = {
  projectId: string;
  errorId: string;
  status: ErrorStatus;
};

export function ErrorStatusSelect({
  projectId,
  errorId,
  status,
}: ErrorStatusSelectProps) {
  const t = useTranslations("errorGroups");
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useOptimistic(status);

  function change(next: ErrorStatus) {
    startTransition(async () => {
      setSelected(next);
      await updateErrorStatus(projectId, errorId, next);
    });
  }

  return (
    <Select
      aria-label={t("statusLabel")}
      value={selected}
      disabled={pending}
      onChange={(event) => change(event.target.value as ErrorStatus)}
    >
      {ERROR_STATUSES.map((option) => (
        <option key={option} value={option}>
          {t(`status.${option}`)}
        </option>
      ))}
    </Select>
  );
}
