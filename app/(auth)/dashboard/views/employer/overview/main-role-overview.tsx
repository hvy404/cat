import { useEffect, useState } from "react";
import useStore from "@/app/state/useStore";
import { Button } from "@/components/ui/button";
import {
  fetchJobPostSpecifics,
  jobPostStatus,
} from "@/lib/overview/fetchRoles";
import { ArrowLeft, Settings, Pause, Play, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import AIMatchCandidateOverview from "@/app/(auth)/dashboard/views/employer/overview/mods/match-candidate-grid";
import { deleteJobPost } from "@/lib/gui/delete-job";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

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
  // Clerk
  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;

  const { setJobStatusUpdated } = useStore();

  const {
    setDashboardRoleOverview,
    dashboard_role_overview,
    setEmployerRightPanelView,
  } = useStore();
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (cuid && dashboard_role_overview.active_role_id) {
        try {
          const { data, error } = await fetchJobPostSpecifics(
            cuid,
            dashboard_role_overview.active_role_id
          );

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

    return () => {
      isMounted = false;
    };
  }, [cuid, dashboard_role_overview.active_role_id]);

  if (!dashboard_role_overview.active_role_id) {
    return null; // or return some loading/error component
  }

  const handleReturnToDashboard = () => {
    setDashboardRoleOverview({
      active: false,
      active_role_id: null,
      active_role_name: null,
    });
    setEmployerRightPanelView("default");
  };

  if (error) return <p>{error}</p>; // Display error message if there's an error
  if (!jobDetails)
    return (
      <div className="flex flex-col items-center">
        <p className="text-gray-800 text-sm">Loading job details...</p>
      </div>
    );

  // Update the job status
  const handleJobStatusUpdate = async (status: boolean) => {
    if (cuid && dashboard_role_overview.active_role_id) {
      try {
        const { message, error } = await jobPostStatus(
          cuid,
          dashboard_role_overview.active_role_id,
          status
        );
        if (error) {
          console.error("Error updating job status:", error);
          return;
        }
        if (message === "Success") {
          console.log("Job status updated successfully:");
          setJobDetails((prevDetails) =>
            prevDetails ? { ...prevDetails, active: status } : prevDetails
          );
          setJobStatusUpdated(true); // This will trigger a refresh in JobList
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
    if (cuid && dashboard_role_overview.active_role_id) {
      try {
        const { success } = await deleteJobPost(
          dashboard_role_overview.active_role_id,
          cuid
        );
        if (success) {
          toast.success("Job post deleted successfully");
          handleReturnToDashboard(); // Use the same function to return to dashboard
        } else {
          toast.error("Failed to delete job post");
        }
      } catch (error) {
        console.error("Error deleting job post:", error);
        toast.error("An error occurred while deleting the job post");
      }
    } else {
      console.log("User, UUID or active role ID is missing");
      toast.error("Missing required information to delete job post");
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
          <DropdownMenu>
            <DropdownMenuTrigger>
              {" "}
              <Button variant={"ghost"}>
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                onClick={() => handleJobStatusUpdate(!jobDetails.active)}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100"
              >
                {jobDetails.active ? (
                  <>
                    <Pause className="h-4 w-4 text-yellow-500" />
                    <span>Pause Listing</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 text-green-500" />
                    <span>Resume Listing</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Job</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {dashboard_role_overview.active_role_name}
            </CardTitle>
            <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
              <div
                className={`w-2 h-2 rounded-full ${
                  jobDetails.active ? "bg-green-400" : "bg-yellow-400"
                }`}
              ></div>
              <p className="text-sm font-medium text-gray-700">
                {jobDetails.active ? "Active and visible" : "Paused and hidden"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <JobDetailsView jobDetails={jobDetails} />
        </CardContent>
      </Card>
      <h2 className="text-base font-semibold leading-7 text-gray-900">
        Strong Candidates
      </h2>
      <div className="grid grids-col-2 lg:grid-cols-3 gap-4">
        {dashboard_role_overview.active_role_id && (
          <AIMatchCandidateOverview
            activeJobId={dashboard_role_overview.active_role_id}
          />
        )}
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
