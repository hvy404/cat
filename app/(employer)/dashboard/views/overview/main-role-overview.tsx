import { useEffect, useState } from "react";
import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";
import { fetchJobPostSpecifics } from "@/app/(employer)/dashboard/views/overview/lib/fetchRoles";
import { ArrowLeft, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AIMatchCandidateOverview from "@/app/(employer)/dashboard/views/overview/mods/match-candidate-grid";
import { jobPostStatus } from "@/app/(employer)/dashboard/views/overview/lib/jobStatus";
import { deleteJobPost } from "@/lib/gui/delete-job";

interface JobDetails {
  description: string;
  job_type: string;
  active: boolean;
  private_employer: boolean;
  min_salary: number;
  max_salary: number;
  location_type: string;
  security_clearance: string;
  salary_disclose: boolean;
  commission_percent: number;
  ote_salary: number | null;
  compensation_type: string;
  hourly_comp_min: number;
  hourly_comp_max: number;
}

export default function EmployerDashboardOverviewRoles() {
  const { setDashboardRoleOverview, dashboard_role_overview, user } =
    useStore();
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  const handleReturnToDashboard = () => {
    setDashboardRoleOverview({
      active: false,
      active_role_id: null,
      active_role_name: null,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.uuid && dashboard_role_overview.active_role_id) {
        try {
          const { data, error } = await fetchJobPostSpecifics(
            user.uuid,
            dashboard_role_overview.active_role_id
          );

          console.log("Job Specific Data:", data);

          if (error) {
            console.error("Error fetching job specifics:", error);
            setError("Failed to load job details.");
            return;
          }
          if (data && data.length > 0) {
            setJobDetails(data[0]); // Assuming data[0] is of type JobDetails
          } else {
            setError("No data available.");
          }
        } catch (error) {
          console.error("Unexpected error:", error);
          setError("An unexpected error occurred.");
        }
      } else {
        console.log("User, UUID or active role ID is missing");
        setError("Missing required user details.");
      }
    };

    fetchData();
  }, [user, dashboard_role_overview.active_role_id]);

  if (error) return <p>{error}</p>; // Display error message if there's an error
  if (!jobDetails) return <p>Loading job details...</p>;

  // Update the job status
  const handleJobStatusUpdate = async (status: boolean) => {
    if (user && user.uuid && dashboard_role_overview.active_role_id) {
      try {
        const { message, error } = await jobPostStatus(
          user.uuid,
          dashboard_role_overview.active_role_id,
          status
        );
        if (error) {
          console.error("Error updating job status:", error);
          //setError("Failed to update job status.");
          return;
        }
        if (message === "Success") {
          console.log("Job status updated successfully:");
          // Update the jobDetails.active state
          setJobDetails((prevDetails) =>
            prevDetails ? { ...prevDetails, active: status } : prevDetails
          );
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    } else {
      console.log("User, UUID or active role ID is missing");
    }
  };

  // Onclick handler for deleting the job post
  const handleDeleteJobPost = async () => {
    if (user && user.uuid && dashboard_role_overview.active_role_id) {
      try {
        const { success } = await deleteJobPost(
          dashboard_role_overview.active_role_id,
          user.uuid
        );
        if (success) {
          console.log("Job post deleted successfully");
          // Redirect to dashboard
          setDashboardRoleOverview({
            active: false,
            active_role_id: null,
            active_role_name: null,
          });
        } else {
          console.error("Failed to delete job post");
        }
      } catch (error) {
        console.error("Error deleting job post:", error);
      }
    } else {
      console.log("User, UUID or active role ID is missing");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handleReturnToDashboard}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to Dashboard</span>
        </Button>
        <div className="flex flex-row items-center">
          <div className="text-xs rounded-lg border border-gray-200/60 bg-gray-100/60 text-gray-500 px-2">
            <p>
              {jobDetails.active
                ? "This job opportunity is active and visible publically"
                : "This job opportunity is paused and not visible"}
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => handleJobStatusUpdate(!jobDetails.active)}
                variant="ghost"
              >
                {jobDetails.active ? "Pause Listing" : "Resume Listing"}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-black border-none text-white">
              {jobDetails.active
                ? "Click here to pause job opportunity"
                : "Click here to resume job opportunity"}
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger>
              {" "}
              <Button variant={"ghost"}>
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="tmt-1 max-w-2xl text-sm leading-6 text-gray-900">
            {dashboard_role_overview.active_role_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JobDetailsView jobDetails={jobDetails} />
        </CardContent>
      </Card>
      <h2 className="text-base font-semibold leading-7 text-gray-900">
        Strong Candidates
      </h2>
      <div className="grid grids-col-2 lg:grid-cols-3 gap-4">
        <AIMatchCandidateOverview />
      </div>
      {showDeleteDialog && (
        <DeleteJobPostDialog
          onConfirm={handleDeleteJobPost}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}

export const JobDetailsView = ({ jobDetails }: { jobDetails: JobDetails }) => {
  return (
    <div className="grid md:grid-cols-1">
      <div className="flex flex-col text-sm text-gray-600">
        <p className="border-b-2 border-dotted border-gray-200 p-2">
          <span className="font-medium text-gray-700 leading-6">Job Type:</span>{" "}
          {jobDetails.job_type}
        </p>
        <p className="border-b-2 border-dotted border-gray-200 p-2">
          <span className="font-medium text-gray-700 leading-6">
            Incognito Hire:
          </span>{" "}
          {jobDetails.private_employer
            ? "Company name redacted from listing"
            : "No"}
        </p>
        <p className="border-b-2 border-dotted border-gray-200 p-2">
          <span className="font-medium text-gray-700 leading-6">Location:</span>{" "}
          {jobDetails.location_type}
        </p>
        <p className="border-b-2 border-dotted border-gray-200 p-2">
          <span className="font-medium text-gray-700 leading-6">
            Security Clearance:
          </span>{" "}
          {jobDetails.security_clearance}
        </p>
        <p className="border-b-2 border-dotted border-gray-200 p-2">
          <span className="font-medium text-gray-700 leading-6">
            Salary Disclosure:
          </span>{" "}
          {jobDetails.salary_disclose ? "Yes" : "No"}
        </p>
        <p className="border-b-2 border-dotted border-gray-200 p-2">
          <span className="font-medium text-gray-700 leading-6">
            Compensation Type:
          </span>{" "}
          {jobDetails.compensation_type}
        </p>
        {jobDetails.compensation_type === "Salary" && (
          <p className="border-b-2 border-dotted border-gray-200 p-2">
            <span className="font-medium text-gray-700 leading-6">Salary:</span>{" "}
            ${jobDetails.min_salary} - ${jobDetails.max_salary}
          </p>
        )}
        {jobDetails.compensation_type === "Hourly" && (
          <p className="border-b-2 border-dotted border-gray-200 p-2">
            <span className="font-medium text-gray-700 leading-6">
              Hourly Rate:
            </span>{" "}
            ${jobDetails.hourly_comp_min} - ${jobDetails.hourly_comp_max}
          </p>
        )}
        {jobDetails.compensation_type === "Commission" && (
          <p className="border-b-2 border-dotted border-gray-200 p-2">
            <span className="font-medium text-gray-700 leading-6">
              On-Target Salary:
            </span>{" "}
            ${jobDetails.ote_salary} -{" "}
            <span className="font-medium text-gray-700 leading-6">
              Commission Percentage:
            </span>{" "}
            {jobDetails.commission_percent}%
          </p>
        )}
      </div>

      {jobDetails.description && (
        <Accordion type="single" collapsible className="p-2">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="text-sm py-2 font-medium *:text-gray-700">
              Description
            </AccordionTrigger>
            <AccordionContent>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-700">
                {jobDetails.description}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

// Delete confirmation dialog
export const DeleteJobPostDialog = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <AlertDialog open onOpenChange={() => onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Job Post</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          This is a permanent action and cannot be undone. Are you sure you want
          to delete this job post?
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
