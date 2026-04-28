import { JobsBoard } from "@/components/branchpulse/jobs-board";
import { buildFilterOptions, fetchJobs } from "@/lib/jobs";

export default async function JobsPage() {
  const jobs = await fetchJobs();
  const branches = buildFilterOptions(jobs, "branch");
  const divisions = buildFilterOptions(jobs, "division");

  return <JobsBoard jobs={jobs} branches={branches} divisions={divisions} />;
}
