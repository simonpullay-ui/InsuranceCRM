export const jobStatusOptions = [
  "Open",
  "Approved",
  "Waiting on Materials",
  "Ready to Schedule",
  "Scheduled",
  "Active",
  "Closed",
] as const;

export const installStatusOptions = [
  "Not Scheduled",
  "Pending Install",
  "Scheduled",
  "In Progress",
  "Installed",
  "Delayed",
  "Repair Needed",
  "Completed",
] as const;

export const paymentStatusOptions = [
  "Deposit Pending",
  "Deposit Scheduled",
  "Deposit Collected",
  "Final Payment Owed",
  "Paid in Full",
] as const;

export type JobStatus = (typeof jobStatusOptions)[number];
export type InstallStatus = (typeof installStatusOptions)[number];
export type PaymentStatus = (typeof paymentStatusOptions)[number];

export type Job = {
  id: string;
  customer_name: string;
  job_number: string;
  branch: string;
  division: string;
  lead_source: string | null;
  project_manager: string | null;
  installer_crew: string | null;
  contract_amount: number;
  deposit_amount: number | null;
  deposit_collected_date: string | null;
  final_payment_date: string | null;
  payment_status: PaymentStatus;
  install_status: InstallStatus;
  job_status: JobStatus;
  scheduled_install_date: string | null;
  install_start_date: string | null;
  install_end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type JobFormValues = Omit<Job, "id" | "created_at" | "updated_at">;

export type DashboardMetrics = {
  pendingInstall: number;
  scheduledThisWeek: number;
  inProgress: number;
  delayed: number;
  repairNeeded: number;
  depositPending: number;
  finalPaymentOwed: number;
  paidInFull: number;
  totalInstallValueThisWeek: number;
  totalInstallValueThisMonth: number;
};

export type Option = {
  label: string;
  value: string;
};
