import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  MapPin,
  ShieldCheck,
  Clock,
  DollarSign,
  ChevronLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchJobDetails } from "@/app/(auth)/dashboard/views/candidate/search/job-detail-helper";
import { JobNode, NodeWithId, CompanyNode } from "@/lib/jobs/mutation"; // type definition for JobNode
import { getResumes } from "@/lib/candidate/apply/resume-choice";
import CompanyInfoCard from "@/app/(auth)/dashboard/views/candidate/search/company-info-card";
import AtomicRecordApplicationSubmission, {
  checkExistingApplication,
} from "@/lib/match-system/relationship/record-application-submission";
import JobDetailsContent from "@/app/(auth)/dashboard/views/candidate/search/job-details-content";

import { toast } from "sonner";

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
}

interface Resume {
  resume_name: string;
  address: string;
}

interface ResumeCardProps {
  resume: Resume;
  onSelect: (resume: Resume) => void;
  isSelected: boolean;
}

type JobNodeWithoutEmbedding = Omit<JobNode, "embedding">;

const JobMoreDetails: React.FC<JobDetailsProps> = ({ jobId, onBack }) => {
  const { user: clerkUser } = useUser();
  const [jobDetails, setJobDetails] = useState<
    (JobNodeWithoutEmbedding & NodeWithId) | null
  >(null);
  const [jobRelationships, setJobRelationships] = useState<any | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  /*   const [companyInfo, setCompanyInfo] = useState<Partial<CompanyNode> | null>(
    null
  ); */
  const [hasApplied, setHasApplied] = useState(false);

  const candidateId = clerkUser?.publicMetadata?.aiq_cuid as string;

  useEffect(() => {
    const loadJobDetails = async () => {
      if (!candidateId) return;

      setIsLoading(true);
      try {
        const { jobDetails, jobRelationships, isBookmarked } =
          await fetchJobDetails(jobId);

        //console.log("Fetched job relationships:", jobRelationships);

        setJobDetails(jobDetails);
        setJobRelationships(jobRelationships);
        setIsBookmarked(isBookmarked);
      } catch (err) {
        setError("Failed to fetch job details. Please try again later.");
        setIsErrorDialogOpen(true);
        console.error("Error fetching job details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId, candidateId]);

  useEffect(() => {
    const checkApplication = async () => {
      if (candidateId) {
        try {
          const exists = await checkExistingApplication(candidateId, jobId);
          setHasApplied(exists);
        } catch (error) {
          console.error("Error checking application");
        }
      }
    };

    checkApplication();
  }, [jobId, candidateId]);

  const handleApplyNow = async () => {
    if (!candidateId) return;

    try {
      const resumeData = await getResumes(candidateId);
      setResumes(resumeData);
      setIsResumeDialogOpen(true);
    } catch (err) {
      setResumeError("Failed to fetch resumes. Please try again later.");
      console.error("Error fetching resumes");
    }
  };

  const handleResumeSelect = (resume: Resume) => {
    setSelectedResume(resume);
  };

  const handleApplyWithResume = async () => {
    if (selectedResume && candidateId) {
      try {
        // Check for existing application first
        const exists = await checkExistingApplication(candidateId, jobId);

        if (exists) {
          setHasApplied(true);
          toast.info("You have already applied for this job.");
          handleCloseResumeDialog();
          return;
        }

        const result = await AtomicRecordApplicationSubmission(
          candidateId,
          jobId,
          selectedResume.address,
          jobDetails?.job_title || ""
        );

        if (result.success) {
          setHasApplied(true);
          toast.success("Your application has been submitted successfully!");
          // Send email to employer about application
          handleCloseResumeDialog();
        } else {
          toast.error(`Failed to submit application.`);
        }
      } catch (error) {
        console.error("Error submitting application:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleCloseResumeDialog = () => {
    setIsResumeDialogOpen(false);
    setSelectedResume(null);
  };

  if (!candidateId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[90vh]">
        <div className="text-xl font-bold text-gray-400 flex items-center">
          Loading
          <div className="dots ml-2 flex">
            <span className="animate-wave">.</span>
            <span className="animate-wave">.</span>
            <span className="animate-wave">.</span>
          </div>
        </div>
      </div>
    );
  }

  const ResumeCard: React.FC<ResumeCardProps> = ({
    resume,
    onSelect,
    isSelected,
  }) => (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-gray-200 border-gray-400"
          : "hover:bg-gray-100 hover:border-gray-300"
      }`}
      onClick={() => onSelect(resume)}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          {resume.resume_name}
        </CardTitle>
        {isSelected && <Check className="h-4 w-4 text-gray-600" />}
      </CardHeader>
    </Card>
  );

  const formatSalary = (salary: number | null) => {
    if (salary === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatHourlyRate = (rate: number | null) => {
    if (rate === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rate);
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[90vh]">
        <div className="text-xl font-bold text-gray-400 flex items-center">
          Loading
          <div className="dots ml-2 flex">
            <span className="animate-wave">.</span>
            <span className="animate-wave">.</span>
            <span className="animate-wave">.</span>
          </div>
        </div>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <h2 className="text-md font-semibold text-gray-700 mb-2">
            No Job Details Found
          </h2>
          <p className="text-gray-600 text-sm">
            We couldn't find any information for this opportunity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 rounded-xl">
      <div className="p-4 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4 text-sm">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>{error}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsErrorDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="mb-6">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">
                {jobDetails?.job_title}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {jobDetails?.location && jobDetails.location.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-sm font-normal py-0.5 px-2"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  {jobDetails.location[0].city && jobDetails.location[0].state
                    ? `${jobDetails.location[0].city}, ${jobDetails.location[0].state}`
                    : jobDetails.location[0].state ||
                      jobDetails.location[0].city ||
                      "Location not specified"}
                </Badge>
              )}
              {jobDetails.security_clearance && (
                <Badge
                  variant="secondary"
                  className="text-sm font-normal py-0.5 px-2"
                >
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  {jobDetails.security_clearance}
                </Badge>
              )}
              {jobDetails.job_type && (
                <Badge
                  variant="secondary"
                  className="text-sm font-normal py-0.5 px-2"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  {jobDetails.job_type}
                </Badge>
              )}
            </div>

            {jobDetails?.salary_disclose && (
              <div className="bg-gray-50 rounded-md p-3 mt-3">
                <h4 className="text-base font-semibold text-gray-700 mb-1 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Compensation
                </h4>
                <div className="text-sm text-gray-600">
                  {jobDetails.compensation_type === "salary" && (
                    <span>
                      Salary: {formatSalary(jobDetails.starting_salary)} -{" "}
                      {formatSalary(jobDetails.maximum_salary)}
                    </span>
                  )}
                  {jobDetails.compensation_type === "hourly" && (
                    <span>
                      Hourly: {formatHourlyRate(jobDetails.hourly_comp_min)} -{" "}
                      {formatHourlyRate(jobDetails.hourly_comp_max)}
                    </span>
                  )}
                  {jobDetails.compensation_type === "commission" && (
                    <span>
                      OTE: {formatSalary(jobDetails.ote_salary)} (Commission:{" "}
                      {jobDetails.commission_percent}%)
                    </span>
                  )}
                </div>
              </div>
            )}

            <Separator />

            <JobDetailsContent
              jobDetails={jobDetails}
              jobRelationships={jobRelationships}
            />
          </CardContent>

          <CardFooter className="flex justify-between items-center mt-4">
            <Button
              size="sm"
              className="text-sm"
              onClick={handleApplyNow}
              disabled={hasApplied}
            >
              {hasApplied
                ? "You've Submitted An Application"
                : "Send Your Resume"}
            </Button>
          </CardFooter>
        </Card>

        <CompanyInfoCard
          company={jobRelationships.POSTED_BY?.[0]}
          isPrivateEmployer={jobDetails?.private_employer ?? false}
        />
      </div>
      <Dialog open={isResumeDialogOpen} onOpenChange={handleCloseResumeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Select a Resume
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Choose the resume you'd like to use for this application.
            </DialogDescription>
          </DialogHeader>
          {resumeError ? (
            <p className="text-red-500">{resumeError}</p>
          ) : resumes.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-center">
              <div className="flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="font-medium text-yellow-700">No resumes found</p>
              </div>
              <p className="text-sm text-yellow-600 mt-2">
                Create a tailored resume quickly with Resume Copilot.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {resumes.map((resume, index) => (
                <ResumeCard
                  key={index}
                  resume={resume}
                  onSelect={handleResumeSelect}
                  isSelected={selectedResume === resume}
                />
              ))}
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            {selectedResume ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseResumeDialog}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleApplyWithResume}
                  className="w-full sm:w-auto"
                >
                  Apply with Selected Resume
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseResumeDialog}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobMoreDetails;
