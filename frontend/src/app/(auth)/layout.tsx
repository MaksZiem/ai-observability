import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo-mark";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <LogoMark className="size-7" />
          <span className="font-semibold">Observability</span>
        </div>
        {children}
      </div>
    </div>
  );
}
