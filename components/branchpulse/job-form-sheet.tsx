"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import {
  installStatusOptions,
  jobStatusOptions,
  paymentStatusOptions,
  type Job,
  type JobFormValues,
} from "@/lib/types";

const emptyJob: JobFormValues = {
  customer_name: "",
  job_number: "",
  branch: "",
  division: "",
  lead_source: "",
  project_manager: "",
  installer_crew: "",
  contract_amount: 0,
  deposit_amount: 0,
  deposit_collected_date: null,
  final_payment_date: null,
  payment_status: "Deposit Pending",
  install_status: "Not Scheduled",
  job_status: "Open",
  scheduled_install_date: null,
  install_start_date: null,
  install_end_date: null,
  notes: "",
};

type JobFormSheetProps = {
  job?: Job | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function JobFormSheet({ job, open, onClose, onSaved }: JobFormSheetProps) {
  const [values, setValues] = useState<JobFormValues>(emptyJob);
  const [saving, setSaving] = useState(false);
  const isEditing = useMemo(() => Boolean(job?.id), [job?.id]);

  useEffect(() => {
    if (job) {
      setValues({
        customer_name: job.customer_name,
        job_number: job.job_number,
        branch: job.branch,
        division: job.division,
        lead_source: job.lead_source ?? "",
        project_manager: job.project_manager ?? "",
        installer_crew: job.installer_crew ?? "",
        contract_amount: job.contract_amount ?? 0,
        deposit_amount: job.deposit_amount ?? 0,
        deposit_collected_date: job.deposit_collected_date,
        final_payment_date: job.final_payment_date,
        payment_status: job.payment_status,
        install_status: job.install_status,
        job_status: job.job_status,
        scheduled_install_date: job.scheduled_install_date,
        install_start_date: job.install_start_date,
        install_end_date: job.install_end_date,
        notes: job.notes ?? "",
      });
      return;
    }

    setValues(emptyJob);
  }, [job, open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...values,
      lead_source: values.lead_source || null,
      project_manager: values.project_manager || null,
      installer_crew: values.installer_crew || null,
      deposit_amount: values.deposit_amount ? Number(values.deposit_amount) : null,
      deposit_collected_date: values.deposit_collected_date || null,
      final_payment_date: values.final_payment_date || null,
      scheduled_install_date: values.scheduled_install_date || null,
      install_start_date: values.install_start_date || null,
      install_end_date: values.install_end_date || null,
      notes: values.notes || null,
      contract_amount: Number(values.contract_amount),
    };

    const endpoint = isEditing ? `/api/jobs/${job?.id}` : "/api/jobs";
    const method = isEditing ? "PATCH" : "POST";
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      window.alert(result?.error ?? "Unable to save job.");
      return;
    }

    onSaved();
    onClose();
  }

  function update<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden border border-white/55 bg-white/72 backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              {isEditing ? "Edit job" : "New job"}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {isEditing ? values.customer_name : "Create Auralis job"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="auralis-button-secondary size-11 p-0"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Customer Name">
              <input className="field" value={values.customer_name} onChange={(event) => update("customer_name", event.target.value)} required />
            </Field>
            <Field label="Job Number">
              <input className="field" value={values.job_number} onChange={(event) => update("job_number", event.target.value)} required />
            </Field>
            <Field label="Branch">
              <input className="field" value={values.branch} onChange={(event) => update("branch", event.target.value)} required />
            </Field>
            <Field label="Division">
              <input className="field" value={values.division} onChange={(event) => update("division", event.target.value)} required />
            </Field>
            <Field label="Lead Source">
              <input className="field" value={values.lead_source ?? ""} onChange={(event) => update("lead_source", event.target.value)} />
            </Field>
            <Field label="Project Manager">
              <input className="field" value={values.project_manager ?? ""} onChange={(event) => update("project_manager", event.target.value)} />
            </Field>
            <Field label="Installer Crew">
              <input className="field" value={values.installer_crew ?? ""} onChange={(event) => update("installer_crew", event.target.value)} />
            </Field>
            <Field label="Contract Amount">
              <input className="field" type="number" min="0" step="0.01" value={values.contract_amount} onChange={(event) => update("contract_amount", Number(event.target.value))} required />
            </Field>
            <Field label="Deposit Amount">
              <input className="field" type="number" min="0" step="0.01" value={values.deposit_amount ?? 0} onChange={(event) => update("deposit_amount", Number(event.target.value))} />
            </Field>
            <Field label="Deposit Collected Date">
              <input className="field" type="date" value={values.deposit_collected_date ?? ""} onChange={(event) => update("deposit_collected_date", event.target.value || null)} />
            </Field>
            <Field label="Final Payment Date">
              <input className="field" type="date" value={values.final_payment_date ?? ""} onChange={(event) => update("final_payment_date", event.target.value || null)} />
            </Field>
            <Field label="Scheduled Install Date">
              <input className="field" type="date" value={values.scheduled_install_date ?? ""} onChange={(event) => update("scheduled_install_date", event.target.value || null)} />
            </Field>
            <Field label="Install Start Date">
              <input className="field" type="date" value={values.install_start_date ?? ""} onChange={(event) => update("install_start_date", event.target.value || null)} />
            </Field>
            <Field label="Install End Date">
              <input className="field" type="date" value={values.install_end_date ?? ""} onChange={(event) => update("install_end_date", event.target.value || null)} />
            </Field>
            <Field label="Job Status">
              <select className="field" value={values.job_status} onChange={(event) => update("job_status", event.target.value as Job["job_status"])}>
                {jobStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Install Status">
              <select className="field" value={values.install_status} onChange={(event) => update("install_status", event.target.value as Job["install_status"])}>
                {installStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Payment Status">
              <select className="field" value={values.payment_status} onChange={(event) => update("payment_status", event.target.value as Job["payment_status"])}>
                {paymentStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes">
                <textarea className="field min-h-32" value={values.notes ?? ""} onChange={(event) => update("notes", event.target.value)} />
              </Field>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="auralis-button-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="auralis-button-primary disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Saving..." : isEditing ? "Update job" : "Create job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
