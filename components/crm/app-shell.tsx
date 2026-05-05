"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  Settings2,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { navigation } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = {
  "/dashboard": LayoutDashboard,
  "/pipelines": Workflow,
  "/dialer": PhoneCall,
  "/settings": Settings2,
};

const notificationSections = [
  {
    title: "Leads",
    body: "New opportunities and stage updates will appear here.",
  },
  {
    title: "Tasks",
    body: "Pending follow-ups, callbacks, and operator reminders.",
  },
  {
    title: "Resolve alerts",
    body: "Important issues that need attention across the workspace.",
  },
  {
    title: "System updates",
    body: "Deployment notices and platform updates from Auralis Core.",
  },
];

type AppShellProps = {
  children: ReactNode;
  userEmail: string;
  logout: (formData: FormData) => Promise<void>;
};

export function AppShell({ children, userEmail, logout }: AppShellProps) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const activeItem = useMemo(
    () => navigation.find((item) => pathname === item.href) ?? navigation[0],
    [pathname],
  );

  return (
    <div className="auralis-shell">
      <div className="relative z-10 min-h-screen px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="auralis-scroll surface sticky top-4 h-fit overflow-hidden border-white/55 bg-white/52 px-4 py-5 backdrop-blur-2xl lg:min-h-[calc(100vh-8.5rem)] lg:px-5">
            <div className="flex items-center gap-4">
              <div className="auralis-brand-mark size-14 text-xl font-bold">A</div>
              <div>
                <p className="auralis-wordmark text-2xl font-semibold text-slate-950">Auralis</p>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Operational clarity
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/55 bg-white/46 p-4">
              <p className="text-sm font-semibold text-slate-950">
                Operational Clarity. Powered by Intelligence.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Navigate your live workspace, surface priorities faster, and keep every team
                operating inside one premium control layer.
              </p>
            </div>

            <nav className="mt-7 grid gap-3">
              {navigation.map((item) => {
                const Icon = icons[item.href as keyof typeof icons] ?? LayoutDashboard;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-[22px] border px-4 py-4 transition backdrop-blur-xl",
                      active
                        ? "border-blue-200/70 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(59,130,246,0.1))] text-slate-950 shadow-[0_18px_42px_rgba(37,99,235,0.16)]"
                        : "border-white/45 bg-white/34 text-slate-700 hover:border-blue-200/55 hover:bg-white/50 hover:text-slate-950",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-2xl",
                          active ? "bg-blue-600 text-white" : "bg-white/70 text-slate-500",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <p className={cn("mt-3 text-sm leading-6", active ? "text-slate-700" : "text-slate-500")}>
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-7 rounded-[24px] border border-white/55 bg-white/42 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600/12 text-blue-700">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Signed in as
                  </p>
                  <p className="mt-1 break-all font-semibold text-slate-900">{userEmail}</p>
                </div>
              </div>

              <form action={logout} className="mt-4">
                <button type="submit" className="auralis-button-secondary w-full">
                  <LogOut className="size-4" />
                  Log out
                </button>
              </form>
            </div>
          </aside>

          <div className="relative flex min-h-[calc(100vh-2rem)] flex-col gap-4 pb-24">
            <header className="surface flex flex-col gap-4 border-white/55 bg-white/50 px-5 py-4 backdrop-blur-2xl sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/52 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700">
                  <Sparkles className="size-3.5" />
                  Auralis Core
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  Auralis
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Operational Clarity. Powered by Intelligence.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((current) => !current)}
                  className="auralis-button-secondary"
                >
                  <Bell className="size-4" />
                  Notifications
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    4
                  </span>
                </button>

                <div className="surface-muted flex items-center gap-3 px-4 py-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600/12 text-blue-700">
                    <BriefcaseBusiness className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Workspace operator
                    </p>
                    <p className="font-semibold text-slate-900">{userEmail}</p>
                  </div>
                </div>
              </div>
            </header>

            <main className="auralis-workspace relative z-10">{children}</main>

            {notificationsOpen ? (
              <aside className="surface absolute right-0 top-[5.5rem] z-30 w-full max-w-sm border-white/60 bg-white/58 p-5 backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Notification Center
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                      Auralis alerts
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="auralis-button-secondary size-11 p-0"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {notificationSections.map((item) => (
                    <div key={item.title} className="surface-muted p-4">
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                    </div>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-40 sm:inset-x-5 lg:left-[calc(300px+2.5rem)] lg:right-6">
        <div className="surface flex flex-col gap-3 border-white/55 bg-white/54 px-4 py-3 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Active module
              </p>
              <p className="font-semibold text-slate-950">{activeItem?.label ?? "Dashboard"}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setNotificationsOpen((current) => !current)}
              className="auralis-button-secondary"
            >
              <Bell className="size-4" />
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                4
              </span>
            </button>

            <div className="surface-muted flex items-center gap-3 px-4 py-3 text-sm text-slate-600">
              <Clock3 className="size-4 text-blue-700" />
              <span className="font-medium text-slate-800">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(now)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSessionActive((current) => !current)}
              className={sessionActive ? "auralis-button-secondary" : "auralis-button-primary"}
            >
              {sessionActive ? "End Session" : "Start Session"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
