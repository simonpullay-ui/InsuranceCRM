import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
};

export function MetricCard({ label, value, hint, icon }: MetricCardProps) {
  return (
    <article className="surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        </div>
        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">{icon}</div>
      </div>
    </article>
  );
}
