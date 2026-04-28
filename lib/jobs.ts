import { endOfMonth, endOfWeek, isWithinInterval, startOfMonth, startOfWeek } from "date-fns";
import type { DashboardMetrics, Job, Option } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function fetchJobs() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("jobs").select("*").order("scheduled_install_date", {
    ascending: true,
    nullsFirst: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Job[];
}

export function buildFilterOptions(jobs: Job[], key: keyof Pick<Job, "branch" | "division" | "project_manager" | "installer_crew">): Option[] {
  const values = Array.from(new Set(jobs.map((job) => job[key]).filter(Boolean))) as string[];

  return values
    .sort((left, right) => left.localeCompare(right))
    .map((value) => ({ label: value, value }));
}

export function calculateDashboardMetrics(jobs: Job[]): DashboardMetrics {
  const now = new Date();
  const week = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  const month = { start: startOfMonth(now), end: endOfMonth(now) };

  const withinRange = (date: string | null, range: { start: Date; end: Date }) =>
    Boolean(date) && isWithinInterval(new Date(date!), range);

  return {
    pendingInstall: jobs.filter((job) => job.install_status === "Pending Install").length,
    scheduledThisWeek: jobs.filter((job) => withinRange(job.scheduled_install_date, week)).length,
    inProgress: jobs.filter((job) => job.install_status === "In Progress").length,
    delayed: jobs.filter((job) => job.install_status === "Delayed").length,
    repairNeeded: jobs.filter((job) => job.install_status === "Repair Needed").length,
    depositPending: jobs.filter((job) => job.payment_status === "Deposit Pending").length,
    finalPaymentOwed: jobs.filter((job) => job.payment_status === "Final Payment Owed").length,
    paidInFull: jobs.filter((job) => job.payment_status === "Paid in Full").length,
    totalInstallValueThisWeek: jobs
      .filter((job) => withinRange(job.scheduled_install_date, week))
      .reduce((sum, job) => sum + (job.contract_amount ?? 0), 0),
    totalInstallValueThisMonth: jobs
      .filter((job) => withinRange(job.scheduled_install_date, month))
      .reduce((sum, job) => sum + (job.contract_amount ?? 0), 0),
  };
}
