import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import type { User } from "@/features/auth/types";
import { listProjects } from "@/features/projects/queries";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  const [user, projects] = await Promise.all([
    apiFetch<User>("/auth/me"),
    listProjects(),
  ]);

  return (
    <AppShell user={user} projects={projects}>
      {children}
    </AppShell>
  );
}
