"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { rotateApiKey } from "@/features/projects/actions";

type ApiKeySettingsProps = {
  projectId: string;
  apiKeyPrefix: string;
};

export function ApiKeySettings({
  projectId,
  apiKeyPrefix,
}: ApiKeySettingsProps) {
  const t = useTranslations("projects.apiKey");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function rotate() {
    const confirmed = window.confirm(t("rotateConfirm"));
    if (!confirmed) return;

    startTransition(async () => {
      setNewKey(await rotateApiKey(projectId));
    });
  }

  if (newKey) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] text-fg-muted">
          {t("newKey")}
        </p>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-[13px]">
            {newKey}
          </code>
          <CopyButton value={newKey} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-[13px] text-fg-muted">
        {t.rich("current", {
          prefix: apiKeyPrefix,
          code: (chunks) => <code className="font-mono text-fg">{chunks}</code>,
        })}
      </p>
      <Button variant="danger" disabled={pending} onClick={rotate}>
        {pending ? t("rotating") : t("rotate")}
      </Button>
    </div>
  );
}
