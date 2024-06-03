import { useState, useEffect, use } from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import useStore from "@/app/state/useStore";
import { fetchActiveJobPosts } from "@/app/(employer)/dashboard/views/overview/lib/fetchActiveRoles";

interface Job {
  jd_uuid: string;
  title: string;
  location: any[]; // Replace with the actual type if known
  location_type: string;
  security_clearance: string;
  posted_date: string;
  private_employer: boolean | null;
  new_match?: boolean; // added this property to diagnose typescript error. Add actual data implementation
}

export default function OverviewJobList() {
  const { setDashboardRoleOverview, dashboard_role_overview, user } =
    useStore();

  // Useeffect
  const [jobs, setJobs] = useState<Job[]>([]);

  const handleClick = (job_id: string) => {
    console.log(job_id);
    setDashboardRoleOverview({ active: true, active_role_id: String(job_id) });
  };

  // Development only
  // On click handler call to fetchActiveJobPosts and log the result and store to setJobs usestate
  useEffect(() => {
    const fetchJobs = async () => {
      if (user) {
        // Only proceed if user is not null
        const result = await fetchActiveJobPosts(user.uuid);
        if (result && result.data) {
          console.log(result.data);
          setJobs(result.data);
        } else {
          console.log("No data returned");
          setJobs([]);
        }
      }
    };

    fetchJobs();
  }, [user]); // Depend on user itself, not just user.uuid

  return (
    <>
        {jobs.length > 0 && (
          <ul
            role="list"
            className="divide-y divide-gray-100 overflow-hidden bg-white"
          >
            {jobs.map((job) => (
              <li
                key={job.jd_uuid}
                className={`relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 cursor-pointer ${
                  dashboard_role_overview.active_role_id === job.jd_uuid
                    ? "bg-muted/50"
                    : ""
                }`}
                onClick={
                  dashboard_role_overview.active_role_id !== job.jd_uuid
                    ? () => handleClick(job.jd_uuid)
                    : undefined
                }
              >
                <div className="flex min-w-0 gap-x-4">
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-gray-900">
                      <span className="absolute inset-x-0 -top-px bottom-0" />
                      {job.title}
                    </p>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500 space-x-2">
                      {job.location_type} &bull; Added: {job.posted_date}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-x-4">
                  <div className="hidden sm:flex sm:flex-col sm:items-end">
                    <p className="text-sm leading-6 text-gray-900">
                      {job.location
                        .map((loc: { city: string }) => loc.city)
                        .join(", ")}
                    </p>
                     {job.new_match && (
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
        )}
      {/*       <button onClick={handleClickFetch}>Fetch</button> */}
    </>
  );
}
