"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  Settings2,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";
import { navigation } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = {
  "/jobs": BriefcaseBusiness,
  "/calendar": CalendarRange,
  "/dashboard": LayoutDashboard,
  "/pipelines": Workflow,
  "/dialer": PhoneCall,
  "/settings": Settings2,
};

type AppShellProps = {
  children: ReactNode;
  userEmail: string;
  logout: (formData: FormData) => Promise<void>;
};

export function AppShell({ children, userEmail, logout }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.14),transparent_18%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] lg:grid lg:grid-cols-[300px_1fr]">
      <aside className="border-b border-white/70 bg-slate-950 px-5 py-6 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/12 p-3 text-cyan-200">
            <BriefcaseBusiness className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
              Life Insurance CRM
            </p>
            <h1 className="text-xl font-bold tracking-tight">PolicyFlow</h1>
          </div>
        </div>

        <nav className="mt-8 grid gap-3">
          {navigation.map((item) => {
            const Icon = icons[item.href as keyof typeof icons] ?? LayoutDashboard;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-3xl border px-4 py-4 transition",
                  active
                    ? "border-cyan-200/40 bg-white text-slate-950 shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4" />
                  <span className="font-semibold">{item.label}</span>
                </div>
                <p className={cn("mt-2 text-sm", active ? "text-slate-600" : "text-slate-300")}>
                  {item.description}
                </p>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/6 p-4 text-sm text-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">Signed in as</p>
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
