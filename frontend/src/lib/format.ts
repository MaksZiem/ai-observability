import { useLocale } from "next-intl";

export type FormatLocale = "pl" | "en";

const INTL_LOCALE: Record<FormatLocale, string> = {
  pl: "pl-PL",
  en: "en-GB",
};

const NUMBER_LOCALE: Record<FormatLocale, string> = {
  pl: "pl-PL",
  en: "en-US",
};

const TIME: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

const DAY: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

function unit(locale: FormatLocale, name: string, value: number, digits = 0) {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    style: "unit",
    unit: name,
    unitDisplay: "narrow",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCount(value: number, locale: FormatLocale = "en") {
  return new Intl.NumberFormat(
    NUMBER_LOCALE[locale],
    value < 1000 ? {} : { notation: "compact", maximumFractionDigits: 2 },
  ).format(value);
}

export function formatPercent(ratio: number, locale: FormatLocale = "en") {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(ratio);
}

export function formatLatency(ms: number | null, locale: FormatLocale = "en") {
  if (ms === null) return "—";
  if (ms < 1000) return unit(locale, "millisecond", Math.round(ms));
  return unit(locale, "second", ms / 1000, 2);
}

export function formatDayTime(iso: string, locale: FormatLocale = "en") {
  const date = new Date(iso);
  const tag = INTL_LOCALE[locale];
  return `${date.toLocaleDateString(tag, DAY)}, ${date.toLocaleTimeString(tag, TIME)}`;
}

export function formatAxisTime(
  iso: string,
  spansDays: boolean,
  locale: FormatLocale = "en",
) {
  const date = new Date(iso);
  const tag = INTL_LOCALE[locale];
  return spansDays
    ? date.toLocaleDateString(tag, DAY)
    : date.toLocaleTimeString(tag, TIME);
}

export function formatClock(iso: string, locale: FormatLocale = "en") {
  return new Date(iso).toLocaleTimeString(INTL_LOCALE[locale], {
    ...TIME,
    second: "2-digit",
  });
}

export function formatDuration(ms: number, locale: FormatLocale = "en") {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return unit(locale, "second", Math.max(Math.round(ms / 1000), 0));
  if (minutes < 60) return unit(locale, "minute", minutes);

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${unit(locale, "hour", hours)} ${unit(locale, "minute", minutes % 60)}`;
  }

  return `${unit(locale, "day", Math.floor(hours / 24))} ${unit(locale, "hour", hours % 24)}`;
}

export function createFormat(locale: FormatLocale) {
  return {
    count: (value: number) => formatCount(value, locale),
    percent: (ratio: number) => formatPercent(ratio, locale),
    latency: (ms: number | null) => formatLatency(ms, locale),
    dayTime: (iso: string) => formatDayTime(iso, locale),
    axisTime: (iso: string, spansDays: boolean) => formatAxisTime(iso, spansDays, locale),
    clock: (iso: string) => formatClock(iso, locale),
    duration: (ms: number) => formatDuration(ms, locale),
  };
}

export type Format = ReturnType<typeof createFormat>;

export function useFormat(): Format {
  return createFormat(useLocale());
}
