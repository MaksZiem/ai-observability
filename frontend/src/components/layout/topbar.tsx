"use client";

import { LogOut, Menu } from "lucide-react";
import { logout } from "@/features/auth/actions";
import type { User } from "@/features/auth/types";
import { ProjectSwitcher } from "@/features/projects/components/project-switcher";
import type { Project } from "@/features/projects/types";
import { LiveIndicator } from "@/features/realtime/components/live-indicator";
import type { StreamStatus } from "@/features/realtime/types";

const ICON_BUTTON =
  "flex size-8 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent";

type TopbarProps = {
  user: User;
  projects: Project[];
  projectId: string | undefined;
  status: StreamStatus;
  menuOpen: boolean;
  onOpenMenu: () => void;
};

export function Topbar({
  user,
  projects,
  projectId,
  status,
  menuOpen,
  onOpenMenu,
}: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="app-sidebar"
        className={`${ICON_BUTTON} md:hidden`}
      >
        <Menu className="size-4" strokeWidth={1.75} aria-hidden />
      </button>

      <ProjectSwitcher projects={projects} currentProjectId={projectId} />
      {projectId && <LiveIndicator status={status} />}

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-[13px] font-medium">{user.name}</p>
          <p className="truncate text-xs text-fg-muted">{user.email}</p>
        </div>
        <form action={logout}>
          <button type="submit" aria-label="Sign out" className={ICON_BUTTON}>
            <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </form>
      </div>
    </header>
  );
}
