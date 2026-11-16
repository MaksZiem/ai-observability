import Link from "next/link";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

type ApiKeyRevealProps = {
  projectId: string;
  apiKey: string;
};

export function ApiKeyReveal({ projectId, apiKey }: ApiKeyRevealProps) {
  const t = useTranslations("projects.created");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="text-[13px] text-fg-muted">{t("lead")}</p>
      </div>

      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-[13px]">
          {apiKey}
        </code>
        <CopyButton value={apiKey} />
      </div>

      <p className="text-[13px] text-fg-muted">
        {t.rich("usage", {
          code: (chunks) => <code className="font-mono text-fg">{chunks}</code>,
        })}
      </p>

      <Link
        href={`/projects/${projectId}`}
        className={`${buttonClasses("primary")} self-start`}
      >
        {t("continue")}
      </Link>
    </div>
  );
}
