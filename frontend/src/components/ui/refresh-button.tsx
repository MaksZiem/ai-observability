"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw
        className={`size-4 ${pending ? "animate-spin motion-reduce:animate-none" : ""}`}
        strokeWidth={1.75}
        aria-hidden
      />
      {t("refresh")}
    </Button>
  );
}
