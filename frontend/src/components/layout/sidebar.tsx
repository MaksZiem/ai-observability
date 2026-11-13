"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Boxes,
  Bug,
  ChartLine,
  FileSearch,
  LayoutDashboard,
  Rocket,
  ScrollText,
  Settings,
  Siren,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import type { OpenCounts } from "@/features/realtime/types";

type NavItem = {
  section: string;
  label: string;
  short?: string;
  icon: LucideIcon;
};

const NAV_GROUPS: NavItem[][] = [
  [
    { section: "", label: "Overview", icon: LayoutDashboard },
    { section: "services", label: "Services", icon: Boxes },
    { section: "metrics", label: "Metrics", icon: ChartLine },
  ],
  [
    { section: "errors", label: "Errors", icon: Bug },
    { section: "logs", label: "Logs", icon: ScrollText },
    { section: "traces", label: "Traces", icon: Waypoints },
  ],
  [
    { section: "incidents", label: "Incidents", icon: Siren },
    {
      section: "deployments",
      label: "Deployments",
      short: "Deploys",
      icon: Rocket,
    },
    {
      section: "analysis",
      label: "AI Analysis",
      short: "AI",
      icon: FileSearch,
    },
    { section: "alerts", label: "Alerts", icon: Bell },
  ],
  [{ section: "settings", label: "Settings", icon: Settings }],
];

const MAX_COUNT = 99;

const ITEM_CLASSES =
  "relative flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10.5px] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function sectionHref(projectId: string, section: string) {
  return section
    ? `/projects/${projectId}/${section}`
    : `/projects/${projectId}`;
}

function countFor(section: string, counts: OpenCounts | null) {
  if (section === "errors") return counts?.errors ?? 0;
  if (section === "incidents") return counts?.incidents ?? 0;
  return 0;
}

function isActive(pathname: string, href: string, section: string) {
  if (!section) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type RailLinkProps = {
  href: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  active: boolean;
  count: number;
  onNavigate: () => void;
};

function RailLink({
  href,
  label,
  short,
  icon: Icon,
  active,
  count,
  onNavigate,
}: RailLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={label}
      aria-label={count > 0 ? `${label}, ${count} open` : label}
      aria-current={active ? "page" : undefined}
      className={`${ITEM_CLASSES} ${
        active
          ? "bg-surface-2 text-fg"
          : "text-fg-muted hover:bg-surface-hover hover:text-fg"
      }`}
    >
      <Icon
        className={`size-[18px] ${active ? "text-accent" : ""}`}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="max-w-full truncate">{short ?? label}</span>
      {count > 0 && (
        <span
          className="absolute top-1 right-1.5 min-w-4 rounded-full bg-danger/15 px-1 text-center font-mono text-[10px] leading-4 text-danger tabular-nums"
          aria-hidden
        >
          {count > MAX_COUNT ? `${MAX_COUNT}+` : count}
        </span>
      )}
    </Link>
  );
}

type SidebarProps = {
  projectId: string | undefined;
  counts: OpenCounts | null;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ projectId, counts, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Main"
        className={`fixed inset-y-0 left-0 z-50 flex w-[76px] shrink-0 flex-col overflow-y-auto border-r border-border bg-surface px-1.5 py-3 transition-[transform,visibility] duration-200 motion-reduce:transition-none md:static md:visible md:translate-x-0 ${
          open ? "translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <Link
          href="/"
          onClick={onClose}
          aria-label="Observability home"
          className="mx-auto mb-3 flex size-9 shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-accent"
        >
          <LogoMark className="size-8" />
        </Link>

        {projectId && (
          <nav className="flex flex-col">
            {NAV_GROUPS.map((group, index) => (
              <div
                key={group[0].section || "monitor"}
                className={`flex flex-col gap-0.5 ${
                  index > 0 ? "mt-1.5 border-t border-border pt-1.5" : ""
                }`}
              >
                {group.map(({ section, label, short, icon }) => {
                  const href = sectionHref(projectId, section);

                  return (
                    <RailLink
                      key={section || "overview"}
                      href={href}
                      label={label}
                      short={short}
                      icon={icon}
                      active={isActive(pathname, href, section)}
                      count={countFor(section, counts)}
                      onNavigate={onClose}
                    />
                  );
                })}
              </div>
            ))}
          </nav>
        )}

        <div className="mt-auto flex flex-col border-t border-border pt-1.5">
          <RailLink
            href="/platform"
            label="Platform health"
            short="Platform"
            icon={Activity}
            active={pathname === "/platform"}
            count={0}
            onNavigate={onClose}
          />
        </div>
      </aside>
    </>
  );
}
