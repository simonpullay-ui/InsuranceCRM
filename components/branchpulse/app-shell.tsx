"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarRange, CircleDollarSign, LayoutDashboard, LogOut, BriefcaseBusiness } from "lucide-react";
import type { ReactNode } from "react";
import { navigation } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = {
  "/calendar": CalendarRange,
  "/dashboard": LayoutDashboard,
  "/jobs": BriefcaseBusiness,
};

type AppShellProps = {
  children: ReactNode;
  userEmail: string;
  logout: (formData: FormData) => Promise<void>;
};

export function AppShell({ children, userEmail, logout }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="surface border-b border-white/70 bg-white/52 px-5 py-6 text-slate-900 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-6">
        <div className="flex items-center gap-3">
          <div className="auralis-brand-mark size-12">
            <CircleDollarSign className="size-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Operations Core
            </p>
            <h1 className="auralis-wordmark text-xl font-bold tracking-tight">Auralis</h1>
          </div>
        </div>

        <nav className="mt-8 grid gap-2">
          {navigation.map((item) => {
            const Icon = icons[item.href as keyof typeof icons] ?? CalendarRange;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-[linear-gradient(135deg,#2563eb,#3b82f6)] text-white shadow-lg"
                    : "text-slate-600 hover:bg-white/80 hover:text-slate-950",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="surface-muted mt-8 p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Signed in as</p>
          <p className="mt-2 break-all font-medium text-slate-950">{userEmail}</p>
          <form action={logout} className="mt-4">
            <button type="submit" className="auralis-button-secondary w-full">
              <LogOut className="size-4" />
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
