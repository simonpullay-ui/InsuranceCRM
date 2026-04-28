"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { CalendarPlus2, ChevronLeft, ChevronRight, GripVertical, Inbox } from "lucide-react";
import { StatusBadge } from "@/components/branchpulse/status-badge";
import { cn, formatCurrency } from "@/lib/utils";
import {
  installStatusOptions,
  paymentStatusOptions,
  type InstallStatus,
  type Job,
  type Option,
} from "@/lib/types";

type ViewMode = "day" | "week" | "month";

type OperationsCalendarProps = {
  jobs: Job[];
  branches: Option[];
  divisions: Option[];
  projectManagers: Option[];
  installerCrews: Option[];
};

export function OperationsCalendar({
  jobs,
  branches,
  divisions,
  projectManagers,
  installerCrews,
}: OperationsCalendarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localJobs, setLocalJobs] = useState(jobs);
  const [view, setView] = useState<ViewMode>("week");
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [branch, setBranch] = useState("");
  const [division, setDivision] = useState("");
  const [installStatus, setInstallStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [installerCrew, setInstallerCrew] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [activeDropKey, setActiveDropKey] = useState<string | null>(null);

  useEffect(() => {
    setLocalJobs(jobs);
  }, [jobs]);

  const interval = useMemo(() => {
    if (view === "day") {
      return { start: startOfDay(anchorDate), end: startOfDay(anchorDate) };
    }

    if (view === "week") {
      return {
        start: startOfWeek(anchorDate, { weekStartsOn: 1 }),
        end: endOfWeek(anchorDate, { weekStartsOn: 1 }),
      };
    }

    const start = startOfWeek(startOfMonth(anchorDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(anchorDate), { weekStartsOn: 1 });
    return { start, end };
  }, [anchorDate, view]);

  const days = useMemo(() => eachDayOfInterval(interval), [interval]);

  const filteredJobs = useMemo(() => {
    return localJobs.filter((job) => {
      const installDate = job.scheduled_install_date ? new Date(job.scheduled_install_date) : null;
      const matchesDateRange =
        (!startDate || (installDate && installDate >= new Date(startDate))) &&
        (!endDate || (installDate && installDate <= new Date(endDate)));

      return (
        (!branch || job.branch === branch) &&
        (!division || job.division === division) &&
        (!installStatus || job.install_status === installStatus) &&
        (!paymentStatus || job.payment_status === paymentStatus) &&
        (!projectManager || job.project_manager === projectManager) &&
        (!installerCrew || job.installer_crew === installerCrew) &&
        matchesDateRange
      );
    });
  }, [
    branch,
    division,
    endDate,
    installStatus,
    installerCrew,
    localJobs,
    paymentStatus,
    projectManager,
    startDate,
  ]);

  const unscheduledJobs = filteredJobs.filter((job) => !job.scheduled_install_date);
  const visibleJobs = filteredJobs.filter((job) => {
    if (!job.scheduled_install_date) {
      return false;
    }

    const installDate = new Date(job.scheduled_install_date);
    return installDate >= interval.start && installDate <= interval.end;
  });

  const jobsByDay = days.map((day) => ({
    day,
    key: format(day, "yyyy-MM-dd"),
    jobs: visibleJobs.filter(
      (job) => job.scheduled_install_date && isSameDay(new Date(job.scheduled_install_date), day),
    ),
  }));

  function shift(direction: "back" | "forward") {
    if (view === "day") {
      setAnchorDate((current) => addDays(current, direction === "back" ? -1 : 1));
      return;
    }

    if (view === "week") {
      setAnchorDate((current) => (direction === "back" ? subWeeks(current, 1) : addWeeks(current, 1)));
      return;
    }

    setAnchorDate((current) => (direction === "back" ? subMonths(current, 1) : addMonths(current, 1)));
  }

  async function saveScheduleUpdate(jobId: string, scheduledInstallDate: string | null) {
    const previousJobs = localJobs;
    const job = previousJobs.find((item) => item.id === jobId);

    if (!job) {
      return;
    }

    const nextInstallStatus = deriveInstallStatus(job.install_status, scheduledInstallDate);
    const nextJobs = previousJobs.map((item) =>
      item.id === jobId
        ? {
            ...item,
            scheduled_install_date: scheduledInstallDate,
            install_status: nextInstallStatus,
          }
        : item,
    );

    setLocalJobs(nextJobs);
    setActiveDropKey(null);
    setDraggedJobId(null);

    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...job,
        scheduled_install_date: scheduledInstallDate,
        install_status: nextInstallStatus,
      }),
    });

    if (!response.ok) {
      setLocalJobs(previousJobs);
      window.alert("Unable to update the install schedule.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  function handleDrop(targetDate: string | null) {
    if (!draggedJobId) {
      return;
    }

    void saveScheduleUpdate(draggedJobId, targetDate);
  }

  return (
    <section className="space-y-6">
      <div className="surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Operations calendar
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Schedule jobs by dragging them onto the calendar.
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["day", "week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  "rounded-2xl px-4 py-2 text-sm font-semibold transition",
                  view === mode ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700",
                )}
              >
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-8">
          <Select label="All branches" value={branch} onChange={setBranch} options={branches} />
          <Select label="All divisions" value={division} onChange={setDivision} options={divisions} />
          <Select
            label="All install statuses"
            value={installStatus}
            onChange={setInstallStatus}
            options={installStatusOptions.map((option) => ({ label: option, value: option }))}
          />
          <Select
            label="All payment statuses"
            value={paymentStatus}
            onChange={setPaymentStatus}
            options={paymentStatusOptions.map((option) => ({ label: option, value: option }))}
          />
          <Select
            label="All project managers"
            value={projectManager}
            onChange={setProjectManager}
            options={projectManagers}
          />
          <Select
            label="All installer crews"
            value={installerCrew}
            onChange={setInstallerCrew}
            options={installerCrews}
          />
          <input className="field" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <input className="field" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <section className="surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Unscheduled queue
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Ready to place
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {unscheduledJobs.length} jobs
            </span>
          </div>

          <div
            className={cn(
              "mt-5 rounded-3xl border border-dashed p-4 transition",
              activeDropKey === "unscheduled"
                ? "border-sky-400 bg-sky-50"
                : "border-slate-200 bg-slate-50/80",
            )}
            onDragOver={(event) => {
              event.preventDefault();
              setActiveDropKey("unscheduled");
            }}
            onDragLeave={() => setActiveDropKey((current) => (current === "unscheduled" ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              handleDrop(null);
            }}
          >
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600">
              <Inbox className="size-4" />
              Drop here to unschedule a job
            </div>

            <div className="space-y-3">
              {unscheduledJobs.length ? (
                unscheduledJobs.map((job) => (
                  <DraggableJobCard
                    key={job.id}
                    job={job}
                    dragged={draggedJobId === job.id}
                    compact
                    onDragStart={setDraggedJobId}
                    onDragEnd={() => {
                      setDraggedJobId(null);
                      setActiveDropKey(null);
                    }}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                  No unscheduled jobs match the current filters.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="surface overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Current window</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {view === "month"
                  ? format(anchorDate, "MMMM yyyy")
                  : `${format(interval.start, "MMM d")} - ${format(interval.end, "MMM d, yyyy")}`}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Drag any job card onto a day to schedule or reschedule it.
                {isPending ? " Saving changes..." : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shift("back")}
                className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setAnchorDate(new Date())}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shift("forward")}
                className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "grid",
              view === "month" ? "grid-cols-1 md:grid-cols-7" : "grid-cols-1",
              view === "week" ? "md:grid-cols-7" : "",
            )}
          >
            {jobsByDay.map(({ day, key, jobs: dayJobs }) => (
              <div
                key={key}
                className={cn(
                  "min-h-56 border-b border-slate-200 p-4 transition",
                  view !== "day" && "md:border-r",
                  view === "month" && !isSameMonth(day, anchorDate) && "bg-slate-50/80",
                  activeDropKey === key && "bg-sky-50 ring-2 ring-inset ring-sky-300",
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setActiveDropKey(key);
                }}
                onDragLeave={() => setActiveDropKey((current) => (current === key ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(key);
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {format(day, "EEE")}
                    </p>
                    <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                      {format(day, "MMM d")}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {dayJobs.length} jobs
                    </span>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                      Drop zone
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {dayJobs.map((job) => (
                    <DraggableJobCard
                      key={job.id}
                      job={job}
                      dragged={draggedJobId === job.id}
                      onDragStart={setDraggedJobId}
                      onDragEnd={() => {
                        setDraggedJobId(null);
                        setActiveDropKey(null);
                      }}
                    />
                  ))}

                  {dayJobs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                      Drop a job here to schedule {format(day, "MMM d")}.
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DraggableJobCard({
  job,
  dragged,
  compact = false,
  onDragStart,
  onDragEnd,
}: {
  job: Job;
  dragged: boolean;
  compact?: boolean;
  onDragStart: (jobId: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <article
      draggable
      onDragStart={() => onDragStart(job.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:cursor-grabbing",
        dragged && "opacity-50 ring-2 ring-sky-300",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-slate-300">
            <GripVertical className="size-4" />
          </span>
          <div>
            <h4 className="font-semibold text-slate-950">{job.customer_name}</h4>
            <p className="mt-1 text-sm text-slate-500">
              {job.division} • {job.branch}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {job.job_number}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge type="install" value={job.install_status} />
        <StatusBadge type="payment" value={job.payment_status} />
      </div>
      <div className={cn("mt-4 space-y-1 text-sm text-slate-600", compact && "text-xs")}>
        <p>PM: {job.project_manager ?? "Unassigned"}</p>
        <p>Crew: {job.installer_crew ?? "TBD"}</p>
        <p>Value: {formatCurrency(job.contract_amount)}</p>
        {job.scheduled_install_date ? <p>Date: {format(new Date(job.scheduled_install_date), "MMM d, yyyy")}</p> : null}
      </div>
    </article>
  );
}

function deriveInstallStatus(current: InstallStatus, scheduledInstallDate: string | null): InstallStatus {
  if (!scheduledInstallDate) {
    return "Not Scheduled";
  }

  if (current === "Not Scheduled" || current === "Pending Install") {
    return "Scheduled";
  }

  return current;
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label: string;
}) {
  return (
    <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
