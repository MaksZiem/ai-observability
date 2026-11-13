"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { User } from "@/features/auth/types";
import type { Project } from "@/features/projects/types";
import { useProjectLive } from "@/features/realtime/use-project-live";

type AppShellProps = {
  user: User;
  projects: Project[];
  children: ReactNode;
};

export function AppShell({ user, projects, children }: AppShellProps) {
  const { projectId } = useParams<{ projectId?: string }>();
  const { status, counts } = useProjectLive(projectId);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="flex h-full">
      <Sidebar
        projectId={projectId}
        counts={counts}
        open={menuOpen}
        onClose={closeMenu}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          projects={projects}
          projectId={projectId}
          status={status}
          menuOpen={menuOpen}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
