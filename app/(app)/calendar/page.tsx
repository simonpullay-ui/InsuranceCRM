import { OperationsCalendar } from "@/components/branchpulse/operations-calendar";
import { buildFilterOptions, fetchJobs } from "@/lib/jobs";

export default async function CalendarPage() {
  const jobs = await fetchJobs();
  const branches = buildFilterOptions(jobs, "branch");
  const divisions = buildFilterOptions(jobs, "division");
  const projectManagers = buildFilterOptions(jobs, "project_manager");
  const installerCrews = buildFilterOptions(jobs, "installer_crew");

  return (
    <OperationsCalendar
      jobs={jobs}
      branches={branches}
      divisions={divisions}
      projectManagers={projectManagers}
      installerCrews={installerCrews}
    />
  );
}
