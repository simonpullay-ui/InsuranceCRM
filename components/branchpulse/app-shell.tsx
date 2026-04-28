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
      <aside className="border-b border-white/70 bg-slate-950 px-5 py-6 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <CircleDollarSign className="size-6 text-cyan-200" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/80">
              Internal Ops
            </p>
            <h1 className="text-xl font-bold tracking-tight">BranchPulse</h1>
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
                    ? "bg-white text-slate-950 shadow-lg"
                    : "text-slate-200 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/6 p-4 text-sm text-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/80">Signed in as</p>
          <p className="mt-2 break-all font-medium text-white">{userEmail}</p>
          <form action={logout} className="mt-4">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-semibold text-white transition hover:bg-white/12"
            >
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
