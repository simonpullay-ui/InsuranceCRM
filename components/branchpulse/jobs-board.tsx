"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { JobFormSheet } from "@/components/branchpulse/job-form-sheet";
import { StatusBadge } from "@/components/branchpulse/status-badge";
import {
  installStatusOptions,
  jobStatusOptions,
  paymentStatusOptions,
  type Job,
  type Option,
} from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type JobsBoardProps = {
  jobs: Job[];
  branches: Option[];
  divisions: Option[];
};

export function JobsBoard({ jobs, branches, divisions }: JobsBoardProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("");
  const [division, setDivision] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [installStatus, setInstallStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        [job.customer_name, job.job_number, job.project_manager, job.installer_crew]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (!branch || job.branch === branch) &&
        (!division || job.division === division) &&
        (!jobStatus || job.job_status === jobStatus) &&
        (!installStatus || job.install_status === installStatus) &&
        (!paymentStatus || job.payment_status === paymentStatus)
      );
    });
  }, [branch, division, installStatus, jobStatus, jobs, paymentStatus, search]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this job? This cannot be undone.")) {
      return;
    }

    const response = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (!response.ok) {
      window.alert("Unable to delete job.");
      return;
    }

    router.refresh();
  }

  function openNewJob() {
    setSelectedJob(null);
    setSheetOpen(true);
  }

  function openEditJob(job: Job) {
    setSelectedJob(job);
    setSheetOpen(true);
  }

  return (
    <>
      <section className="surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Jobs master table
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Search, filter, and manage every active job.
            </h1>
          </div>
          <button
            type="button"
            onClick={openNewJob}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="size-4" />
            New job
          </button>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="field pl-11"
              placeholder="Search customer, job #, PM, crew"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select value={branch} onChange={setBranch} label="All branches" options={branches} />
          <Select value={division} onChange={setDivision} label="All divisions" options={divisions} />
          <Select value={jobStatus} onChange={setJobStatus} label="All job statuses" options={jobStatusOptions.map((option) => ({ label: option, value: option }))} />
          <Select value={installStatus} onChange={setInstallStatus} label="All install statuses" options={installStatusOptions.map((option) => ({ label: option, value: option }))} />
        </div>

        <div className="mt-3 grid gap-3 xl:grid-cols-6">
          <Select value={paymentStatus} onChange={setPaymentStatus} label="All payment statuses" options={paymentStatusOptions.map((option) => ({ label: option, value: option }))} />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-500">
                {["Customer", "Job #", "Branch", "Division", "Install", "Payment", "Scheduled", "Value", "Actions"].map((column) => (
                  <th key={column} className="px-3 py-3 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100 align-top text-slate-700">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-slate-950">{job.customer_name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      PM {job.project_manager ?? "Unassigned"} • Crew {job.installer_crew ?? "TBD"}
                    </p>
                  </td>
                  <td className="px-3 py-4">{job.job_number}</td>
                  <td className="px-3 py-4">{job.branch}</td>
                  <td className="px-3 py-4">{job.division}</td>
                  <td className="px-3 py-4">
                    <StatusBadge type="install" value={job.install_status} />
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge type="payment" value={job.payment_status} />
                  </td>
                  <td className="px-3 py-4">{formatDate(job.scheduled_install_date)}</td>
                  <td className="px-3 py-4 font-semibold text-slate-950">
                    {formatCurrency(job.contract_amount)}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEditJob(job)} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(job.id)} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center text-sm text-slate-500">
                    No jobs match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <JobFormSheet
        open={sheetOpen}
        job={selectedJob}
        onClose={() => setSheetOpen(false)}
        onSaved={() => router.refresh()}
      />
    </>
  );
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
