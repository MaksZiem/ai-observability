"use client";

import { useOptimistic, useState } from "react";
import { useTranslations } from "next-intl";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { askAssistant } from "@/features/analysis/actions";
import type { ChatMessage } from "@/features/analysis/types";

type IncidentChatProps = {
  projectId: string;
  incidentId: string;
  messages: ChatMessage[];
};

export function IncidentChat({
  projectId,
  incidentId,
  messages,
}: IncidentChatProps) {
  const t = useTranslations("analysis.chat");
  const suggestions = [
    t("suggestions.latency"),
    t("suggestions.changes"),
    t("suggestions.service"),
  ];
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [visible, addQuestion] = useOptimistic(
    messages,
    (current, question: string): ChatMessage[] => [
      ...current,
      {
        id: "pending",
        incidentId,
        role: "user",
        content: question,
        authorId: null,
        model: null,
        createdAt: new Date().toISOString(),
      },
    ],
  );
  const waiting = visible.length > messages.length;

  async function send(formData: FormData) {
    const question = String(formData.get("message") ?? "").trim();
    if (!question) return;

    setError(null);
    addQuestion(question);
    const result = await askAssistant(projectId, incidentId, question);
    setError(result.error);
    setDraft(result.error ? question : "");
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.length === 0 ? (
        <ul className="flex flex-col gap-1 text-[13px] text-fg-muted">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>“{suggestion}”</li>
          ))}
        </ul>
      ) : (
        <ol className="flex max-h-[480px] flex-col overflow-y-auto text-[13px]">
          {visible.map((message) => (
            <li
              key={message.id}
              className="flex flex-col gap-1 border-b border-border py-2.5 first:pt-0 last:border-b-0"
            >
              <span
                className={`text-xs font-medium ${
                  message.role === "assistant" ? "text-accent" : "text-fg-muted"
                }`}
              >
                {message.role === "assistant" ? t("assistant") : t("you")}
              </span>
              <p className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </li>
          ))}
          {waiting && (
            <li className="py-2.5 text-xs text-fg-muted" aria-live="polite">
              {t("waiting")}
            </li>
          )}
        </ol>
      )}

      <form action={send} className="flex flex-col gap-2">
        <label className="sr-only" htmlFor="incident-question">
          {t("question")}
        </label>
        <Textarea
          id="incident-question"
          name="message"
          rows={2}
          maxLength={2000}
          placeholder={t("placeholder")}
          defaultValue={draft}
          required
        />
        <div className="flex items-center justify-between gap-3">
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
          <SubmitButton pendingLabel={t("asking")}>{t("ask")}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
