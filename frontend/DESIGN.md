---
name: AI Observability Platform
description: Dark, dense developer-tool dashboard for monitoring production systems and investigating incidents. Direction "Signal": cool slate-blue control room, teal signal accent. Quality bar is Grafana / Datadog / Linear.
colors:
  bg: "#0b1016"
  surface: "#101720"
  surface-2: "#162029"
  surface-hover: "#1b2733"
  border: "#1f2b38"
  border-strong: "#2c3b4b"
  fg: "#e4ebf2"
  fg-muted: "#8798ab"
  fg-subtle: "#5a6a7c"
  accent: "#1fb5a6"
  accent-hover: "#3cc8b8"
  accent-fg: "#04201d"
  success: "#74c25a"
  warning: "#e9b44c"
  danger: "#ef5d55"
  critical: "#ff4f87"
---

# Design System: AI Observability Platform

## Overview

**Creative North Star: "Signal".** A dark, cool slate-blue control room. The chrome is quiet blue-grey; colour appears only where it carries meaning: health state, log level, severity, the primary action, focus and selection. Telemetry is the content.

Dark-first. Personality: precise, technical, calm under pressure. Never playful, never "AI magic".

## Colors

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0b1016` | App background, main content |
| `surface` | `#101720` | Sidebar, cards, stat cards, tables |
| `surface-2` | `#162029` | Secondary buttons, active nav, code blocks, chart tooltips |
| `surface-hover` | `#1b2733` | Row / nav / button hover, selected span |
| `border` | `#1f2b38` | Every 1px divider, card border, chart grid lines |
| `border-strong` | `#2c3b4b` | Input borders, focused rows |
| `fg` | `#e4ebf2` | Primary text |
| `fg-muted` | `#8798ab` | Labels, metadata, axis labels, inactive nav |
| `fg-subtle` | `#5a6a7c` | Placeholders, DEBUG logs, disabled. Never body copy. |
| `accent` | `#1fb5a6` | Primary button, focus, links, selection, main chart series, span bars |
| `accent-hover` | `#3cc8b8` | Primary button hover |
| `accent-fg` | `#04201d` | Text and icons on an `accent` background (primary button) |
| `success` | `#74c25a` | Healthy, resolved, OK. Shifted toward yellow-green so it never reads as the teal accent. |
| `warning` | `#e9b44c` | Degraded, WARN, investigating, medium |
| `danger` | `#e5534b` | ERROR, open errors, high, failed, firing |
| `critical` | `#f0436b` | CRITICAL service, FATAL log, critical severity |

### State → colour (single source of truth)

| Domain | Value | Colour | Indicator |
|---|---|---|---|
| Service | `healthy` | `success` | filled dot |
| Service | `degraded` | `warning` | filled dot |
| Service | `critical` | `critical` | filled dot, soft pulse |
| Log level | `debug` | `fg-subtle` | text only |
| Log level | `info` | `fg-muted` | text only |
| Log level | `warn` | `warning` | text only |
| Log level | `error` | `danger` | text + 2px left bar on row |
| Log level | `fatal` | `critical` | text + 2px left bar on row |
| Error / Incident status | `open` | `danger` | filled dot |
| Error / Incident status | `investigating` | `warning` | filled dot |
| Error / Incident status | `resolved` | `success` | ✓ |
| Severity | `low` | `fg-muted` | hollow dot |
| Severity | `medium` | `warning` | filled dot |
| Severity | `high` | `danger` | filled dot |
| Severity | `critical` | `critical` | filled dot |
| Span | `ok` | `accent` | bar |
| Span | `error` | `danger` | bar |
| Alert | `ok` | `success` | filled dot |
| Alert | `firing` | `danger` | filled dot, soft pulse |
| AI analysis | `pending` | `accent` | dot, pulse |
| AI analysis | `completed` | `success` | ✓ |
| AI analysis | `failed` | `danger` | ✕ |

Badges are tinted: text in the state colour, background ~10% alpha, border ~30% alpha (`bg-warning/10 border-warning/30 text-warning`). Labels are human-readable ("Investigating"); the enum stays in data.

## Typography

- **IBM Plex Sans** (400/500/600) for UI, **IBM Plex Mono** (400/500) for machine values (`next/font/google` in `layout.tsx`).
- **Mono is semantic:** trace IDs, span IDs, request IDs, endpoints (`POST /payments`), service names, versions (`v1.42.3`), durations, timestamps, counts, percentages, log messages, JSON metadata, API keys.
- Every number uses `tabular-nums`.

| Role | Tailwind |
|---|---|
| Page title | `text-2xl font-semibold tracking-tight` |
| Section / card title | `text-base font-semibold` |
| Body | `text-sm` |
| Secondary / table | `text-[13px]` |
| Label / badge / meta | `text-xs font-medium` |
| Metric value | `font-mono text-lg font-medium tabular-nums` |
| Hero metric (overview) | `font-mono text-2xl font-medium tabular-nums` |
| Code / log line | `font-mono text-[13px]` |

## Layout

- **App shell** (`components/layout/app-shell.tsx`): icon rail on the left (`w-[76px]`, `bg-surface`, `border-r border-border`), top bar above the content, main area `bg-bg` scrolls independently. The shell owns the single live (SSE) connection and passes status and counts down.
- **Top bar** (`topbar.tsx`): `h-14 bg-surface border-b border-border px-4`. Left: project switcher (select + new project + environment badge) and the Live indicator. Right: user name/email and logout. On mobile it also holds the menu button that slides the rail in.
- **Page header:** title, optional one-line description; on the right: time-range selector (`15m / 1h / 24h / 7d`) and actions. `px-6 py-5`, bottom border.
- **Content:** `p-6`, blocks `gap-6`, inside cards `gap-3` / `gap-4`.
- **Metric row:** `grid grid-cols-2 lg:grid-cols-4 gap-2.5`.
- **Detail screens** (trace, incident, error): main column `flex-1` + right panel `w-[400px]`, separated by a 1px border. Below `1024px` the panel stacks.
- **Collections** are tables / row lists, never card grids.
- Forms max `max-w-[720px]`.
- Spacing steps: 1, 2, 3, 4, 5, 6, 8, 12.

## Elevation & Shapes

- Flat. Depth from tonal layers (`bg` → `surface` → `surface-2`) and 1px borders. Shadows only on floating layers: `shadow-lg shadow-black/40 border-border-strong`.
- Radii: the Tailwind scale is overridden in `globals.css`: `rounded` 4px (chips), `rounded-md` 4px (buttons, inputs, nav), `rounded-lg` 5px (stat cards, code), `rounded-xl` 6px (cards, dialogs), `rounded-full` (badges, dots). Max 6px except pills.
- Icons: `lucide-react`, `size-4`, `strokeWidth={1.75}`, `text-fg-muted` unless they signal state.

## Components

**Icon rail.** Groups separated by a 1px `border-border` line: Overview, Services, Metrics | Errors, Logs, Traces | Incidents, Deploys, AI, Alerts | Settings; Platform health pinned to the bottom. Item: 18px icon over a `text-[10.5px]` short label, `rounded-md px-1 py-2`, full label in `title` and `aria-label`. Inactive `text-fg-muted`, hover `bg-surface-hover text-fg`; active `bg-surface-2 text-fg` with the icon in `accent`. Errors and Incidents show a count pill in the item's top-right corner (`bg-danger/15 text-danger text-[10px] rounded-full`) only when open count > 0.

**Logo.** `LogoMark` (`components/ui/logo-mark.tsx`): a teal signal trace (`stroke-accent`) on a `surface-2` tile with a `border-strong` outline, `rx` 7 on a 32 grid. Used in the icon rail (`size-8`) and the auth screens (`size-7`). `app/icon.svg` is the same mark with hard-coded hex values for the browser tab.

**Buttons.** `h-[34px] rounded-md px-3.5 text-sm font-medium`.
- Primary `bg-accent text-accent-fg hover:bg-accent-hover`, one per region.
- Secondary `bg-surface-2 border border-border hover:bg-surface-hover`.
- Danger: secondary chrome + `text-danger`, always confirmed.
- Ghost `text-fg-muted hover:text-fg hover:bg-surface-hover`.
- Focus `focus-visible:outline-2 outline-offset-2 outline-accent`. Disabled `opacity-50 cursor-not-allowed`.

**Status badge.** `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium` + 6px dot, colours from the state table.

**Stat card.** `bg-surface border border-border border-l-[3px] rounded-lg px-3 py-2.5`; the left edge takes the tone colour (`border-strong` when healthy, else `warning` / `danger` / `critical`). Top row: label `text-xs text-fg-muted`, optional status word on the right in the tone colour (`Degraded`, `Critical`, `Slow`). Value: metric style in the tone colour. Optional threshold gauge below: 4px track `bg-surface-2`, fill in the tone colour (`accent` when healthy), 1px `fg-muted` ticks at each health threshold with mono `text-[10px]` labels underneath. Error rate shows ticks at 2% and 25%, P95 at 1s; thresholds come from `features/metrics/health.ts`.

**Card.** `bg-surface border border-border rounded-xl p-[18px]`, title row on top.

**Table.** No card around it: no outer border, no background, only 1px `border-border` lines. `text-[13px]`. Header `text-xs font-medium text-fg-muted border-b border-border` with `RAIL_SPACER` so columns align. Rows `py-2.5 border-b border-border hover:bg-surface`, whole row clickable, with a 3px left status rail from `statusRail(tone)` (`components/ui/status-rail.ts`) using the row's tone from the state table (`success` at 45% so healthy rows stay quiet). Numeric cells over a health threshold take the state colour (error rate, P95). IDs, timestamps, durations mono.

**Inputs / select / textarea.** `bg-bg border border-border-strong rounded-md h-[34px] px-2.5 text-sm placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25`. Label `text-[13px] font-medium`, help `text-xs text-fg-muted`, error `text-xs text-danger`.

**Time-series chart.** Inline SVG, no chart library. Grid lines `stroke-border`, axis labels `text-[11px] fill-fg-muted font-mono`. Requests series `accent`, errors `danger`, latency `accent` (P95 solid, P50 at 50% opacity). Area fill at 10% alpha. Deployments: vertical dashed `fg-muted` line with a small version label on top. Hover shows a `surface-2` tooltip with mono values.

**Trace waterfall.** Rows: grid `220px 1fr 64px`. Left: service (mono, muted) + operation (mono). Middle: bar positioned by offset/duration on a shared time axis, `h-2 rounded-sm`, `bg-accent` or `bg-danger` for error spans. The slowest span's bar is full opacity, others 70%. Right: duration mono. Selected row `bg-surface-hover`; details in the right panel.

**Log row.** Grid `96px 56px 140px 1fr`: time (mono, muted), level (mono, uppercase, level colour), service (mono, muted), message (mono, `fg`). ERROR / FATAL rows get a 2px left bar in the level colour. Click expands metadata as a JSON block.

**JSON / code block.** `bg-surface-2 border border-border rounded-lg p-3 font-mono text-[13px] overflow-auto`.

**AI analysis.** Rendered as structured sections, not chat bubbles: Summary, Evidence (each item links to the source: error, trace, log, deployment), Potential causes (labelled "Hypothesis"), Suggested investigation. Facts and hypotheses must look different: hypotheses get a `warning` "Hypothesis" chip.

**Empty state.** Centred muted 24px icon, one line `text-sm text-fg`, one muted explanation, one primary action.

**Motion.** 150ms `ease-out` for hover/colour; new live rows fade in over 200ms; pulse only on dots. Respect `prefers-reduced-motion`.

## Do's and Don'ts

**Do**
- Show backend state verbatim, with colour, indicator and label from the state table.
- Use mono for every machine value.
- Link every correlated entity (error → trace → logs → service → deployment).
- Keep screens dense and aligned.

**Don't**
- No gradients, glows, glass, "AI sparkle" icons.
- No colour on decoration.
- No shadows on in-flow cards, no radius above 6px (pills excepted).
- No more than one primary button per region.
- No `fg-subtle` text the user must read.
- No chat bubbles for AI analysis (the incident chat uses plain rows with a role label).
