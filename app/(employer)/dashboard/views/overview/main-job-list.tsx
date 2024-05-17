import { ChevronRightIcon } from "@heroicons/react/20/solid";
import useStore from "@/app/state/useStore";

const jobs = [
  {
    job_id: "1",
    roleTitle: "Co-Founder / CEO",
    location: "San Francisco, CA",
    datePosted: "05/01/2024",
    status: "Open",
    applicationDeadline: "2024-06-01",
    hiringManager: "John Doe",
    jobType: "Full-time",
    department: "Executive",
    priority: "High",
    lastActivityDate: "2024-05-10",
    candidatesInProcess: 5,
    lastSeenDateTime: "2023-01-23T13:23Z",
    newMatch: true,
  },
  {
    job_id: "2",
    roleTitle: "Co-Founder / CTO",
    location: "Remote",
    datePosted: "05/01/2024",
    status: "Open",
    applicationDeadline: "2024-06-01",
    hiringManager: "Jane Smith",
    jobType: "Full-time",
    department: "Executive",
    priority: "High",
    lastActivityDate: "2024-05-10",
    candidatesInProcess: 4,
    lastSeenDateTime: "2023-01-23T13:23Z",
    newMatch: false,
  },
  {
    job_id: "3",
    roleTitle: "Business Relations",
    location: "Atlanta, GA",
    datePosted: "05/01/2024",
    status: "Open",
    applicationDeadline: "2024-05-25",
    hiringManager: "Emily Johnson",
    jobType: "Full-time",
    department: "Business",
    priority: "Medium",
    lastActivityDate: "2024-05-09",
    candidatesInProcess: 3,
    newMatch: true,
  },
  {
    job_id: "4",
    roleTitle: "Front-end Developer",
    location: "San Francisco, CA",
    datePosted: "05/01/2024",
    status: "Open",
    applicationDeadline: "2024-06-01",
    hiringManager: "Michael Brown",
    jobType: "Full-time",
    department: "Engineering",
    priority: "High",
    lastActivityDate: "2024-05-10",
    candidatesInProcess: 7,
    lastSeenDateTime: "2023-01-23T13:23Z",
    newMatch: false,
  },
];

export default function OverviewJobList() {
  const { setDashboardRoleOverview, dashboard_role_overview } = useStore();

  const handleClick = (job_id: string) => {
    console.log(job_id);
    setDashboardRoleOverview({ active: true, active_role_id: String(job_id) });
  };

  return (
    <ul
      role="list"
      className="divide-y divide-gray-100 overflow-hidden bg-white"
    >
      {jobs.map((jobs) => (
        <li
          key={jobs.job_id}
          className={`relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 ${
            dashboard_role_overview.active_role_id === jobs.job_id
              ? "bg-muted/50"
              : ""
          }`}
          onClick={() => handleClick(jobs.job_id)}
        >
          <div className="flex min-w-0 gap-x-4">
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                <span className="absolute inset-x-0 -top-px bottom-0" />
                {jobs.roleTitle}
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500 space-x-2">
                {jobs.department} &bull; Added: {jobs.datePosted}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-x-4">
            <div className="hidden sm:flex sm:flex-col sm:items-end">
              <p className="text-sm leading-6 text-gray-900">{jobs.location}</p>
              {jobs.newMatch && (
                <div className="mt-1 flex items-center gap-x-1.5">
                  <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs leading-5 text-gray-500">
                    Candidates Matched
                  </p>
                </div>
              )}
            </div>
            <ChevronRightIcon
              className="h-5 w-5 flex-none text-gray-400"
              aria-hidden="true"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
