import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  Loader2,
  Wand2,
  MessageCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getApplicationDetailedView } from "@/lib/employer/get-application-details";
import AlertMessage from "./manual-application-alert";
import { applicantDetailCopilot } from "@/lib/employer/applicant-details-copilot";
import { updateApplicationStatus, getApplicationStatus } from "@/lib/employer/update-application-status";
import CopilotResponseSheet from "@/app/(auth)/dashboard/views/employer/overview/side-panels/inbound-application-copilot";
import UpdateApplicationStatus from "@/app/(auth)/dashboard/views/employer/overview/side-panels/update-application-status";

type ApplicantDetailPanelProps = {
  applicationId: string;
  onBack: () => void;
};

type ApplicationStatus = 'submitted' | 'reviewed' | 'interview' | 'rejected' | 'accepted';

interface ExperienceItemProps {
  item: {
    organization?: string;
    institution?: string;
    job_title?: string;
    degree?: string;
    start_date?: string;
    end_date?: string;
    responsibilities?: string;
    honors_awards_coursework?: string;
  };
  type: "work" | "education";
}

interface JobInfo {
  title?: string;
  description?: string;
  location?: Array<{ city: string; state: string; zipcode: string }>;
  type?: string;
  salaryDisclose?: boolean;
  compensationType?: string;
  hourlyCompMin?: number;
  hourlyCompMax?: number;
  startingSalary?: number;
  maximumSalary?: number;
  commissionPay?: boolean;
  commissionPercent?: number;
  oteSalary?: number;
  experienceRequired?: string;
  relationships?: {
    REQUIRES_SKILL?: any[];
    PREFERS_SKILL?: any[];
    REQUIRED_CERTIFICATION?: any[];
  };
}

const ExperienceItem: React.FC<ExperienceItemProps> = ({ item, type }) => {
  const {
    organization,
    institution,
    job_title,
    degree,
    start_date,
    end_date,
    responsibilities,
    honors_awards_coursework,
  } = item;

  const formatDate = (date: string | undefined): string => {
    if (!date || date.toLowerCase() === "present") return "Present";
    const [year, month] = date.split("-");
    return `${new Date(Number(year), Number(month) - 1).toLocaleString(
      "default",
      { month: "short" }
    )} ${year}`;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <h3 className="font-semibold">{organization || institution}</h3>
        <p className="text-sm">{job_title || degree}</p>
        <p className="text-xs text-gray-600">
          {formatDate(start_date)} - {formatDate(end_date)}
        </p>
        {responsibilities && <p className="text-sm mt-1">{responsibilities}</p>}
        {honors_awards_coursework && (
          <p className="text-sm mt-1">{honors_awards_coursework}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface CandidateExperienceProps {
  workExperience: Array<ExperienceItemProps["item"]>;
  education: Array<ExperienceItemProps["item"]>;
}

const CandidateExperience: React.FC<CandidateExperienceProps> = ({
  workExperience,
  education,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Work Experience</h2>
        <div className="space-y-4">
          {workExperience.map((exp, index) => (
            <ExperienceItem key={index} item={exp} type="work" />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Education</h2>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <ExperienceItem key={index} item={edu} type="education" />
          ))}
        </div>
      </div>
    </div>
  );
};

const ListSection: React.FC<{
  title: string;
  items: any[];
  icon: React.ElementType;
}> = ({ title, items, icon: Icon }) => (
  <div className="mt-4">
    <h4 className="text-sm font-semibold mb-2">{title}</h4>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center bg-gray-50 p-2 rounded-md"
        >
          <Icon className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
          <span className="text-sm">
            {typeof item === "string"
              ? item
              : item.name || item.title || JSON.stringify(item)}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ComparisonSection: React.FC<{
  title: string;
  candidateItems: any[];
  jobRequiredItems: any[];
  jobPreferredItems?: any[];
  isAlternate: boolean;
  applicationId: string;
  setCopilotResponse: React.Dispatch<React.SetStateAction<string>>;
  setCopilotTitle: React.Dispatch<React.SetStateAction<string>>;
  setIsCopilotDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  title,
  candidateItems,
  jobRequiredItems,
  jobPreferredItems,
  isAlternate,
  applicationId,
  setCopilotResponse,
  setCopilotTitle,
  setIsCopilotDialogOpen,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sectionResponses, setSectionResponses] = useState<
    Record<string, string>
  >({});

  const renderItems = (items: any[]) => (
    <ul className="list-disc pl-5 space-y-2">
      {items.map((item, index) => (
        <li key={index} className="text-sm ml-2 break-words">
          {Array.isArray(item)
            ? item.map((subItem, subIndex) => <p key={subIndex}>{subItem}</p>)
            : item?.name ||
              item?.job_title ||
              item?.degree ||
              (typeof item === "object" ? JSON.stringify(item) : item) ||
              "N/A"}
        </li>
      ))}
    </ul>
  );

  const handleCopilotWand = async () => {
    setIsLoading(true);
    try {
      const { message } = await applicantDetailCopilot(applicationId, title);
      const response = message ?? "No response from Copilot";
      setSectionResponses((prev) => ({ ...prev, [title]: response }));
      setCopilotResponse(response);
      setCopilotTitle(title);
      setIsCopilotDialogOpen(true);
    } catch (error) {
      console.error("Error fetching copilot response:", error);
      setCopilotResponse("Error fetching Copilot response");
      setCopilotTitle("Error");
      setIsCopilotDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const openSavedResponse = () => {
    setCopilotResponse(sectionResponses[title]);
    setCopilotTitle(title);
    setIsCopilotDialogOpen(true);
  };

  return (
    <div
      className={`p-4 rounded-lg ${
        isAlternate ? "bg-gray-50" : "bg-white"
      } relative`}
    >
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <Tooltip>
        <TooltipTrigger asChild>
          {sectionResponses[title] ? (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={openSavedResponse}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleCopilotWand}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="h-5 w-5" />
              )}
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent className="bg-black border-0 text-white">
          <p className="text-sm">
            {sectionResponses[title]
              ? "View saved copilot analysis"
              : isLoading
              ? "Loading..."
              : "One-click candidate evaluation with your hiring copilot."}
          </p>
        </TooltipContent>
      </Tooltip>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Candidate</h4>
          {renderItems(candidateItems)}
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Job Requirements</h4>
          {renderItems(jobRequiredItems)}
          {jobPreferredItems && (
            <>
              <h4 className="text-sm font-medium mt-2 mb-1">Preferred</h4>
              {renderItems(jobPreferredItems)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const formatLocation = (
  location: Array<{ city: string; state: string; zipcode: string }> | undefined
) => {
  if (!location || location.length === 0) return "N/A";
  const { city, state, zipcode } = location[0];

  const parts = [
    city && city.trim(),
    state && state.trim(),
    zipcode && zipcode.trim(),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "N/A";
};

const formatCompensation = (jobInfo: JobInfo): string => {
  if (jobInfo.salaryDisclose === false) return "Salary not disclosed";
  if (!jobInfo.compensationType) return "Compensation details not available";

  switch (jobInfo.compensationType) {
    case "hourly":
      return `$${jobInfo.hourlyCompMin?.toFixed(2) || "N/A"} - $${
        jobInfo.hourlyCompMax?.toFixed(2) || "N/A"
      } per hour`;
    case "salary":
      return `$${jobInfo.startingSalary?.toLocaleString() || "N/A"} - $${
        jobInfo.maximumSalary?.toLocaleString() || "N/A"
      } per year`;
    case "commission":
      if (jobInfo.oteSalary) {
        return `OTE: $${jobInfo.oteSalary.toLocaleString()} per year${
          jobInfo.commissionPercent
            ? ` (includes ${jobInfo.commissionPercent}% commission)`
            : ""
        }`;
      }
      return jobInfo.commissionPercent
        ? `Commission-based: ${jobInfo.commissionPercent}% commission`
        : "Commission-based (details not provided)";
    default:
      return "Compensation structure not specified";
  }
};

const JobDetails: React.FC<{ jobInfo: JobInfo | null }> = ({ jobInfo }) => {
  if (!jobInfo) return <div>No job information available.</div>;

  return (
    <div>
      <div className="space-y-6 mt-4">
        <h3 className="text-lg font-semibold">{jobInfo.title || "N/A"}</h3>
        <p className="text-sm">
          {jobInfo.description || "No description available."}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm">
              <strong>Location:</strong> {formatLocation(jobInfo.location)}
            </p>
            <p className="text-sm">
              <strong>Type:</strong>{" "}
              {(jobInfo.type &&
                jobInfo.type.charAt(0).toUpperCase() + jobInfo.type.slice(1)) ||
                "N/A"}
            </p>
            <p className="text-sm">
              <strong>Compensation:</strong> {formatCompensation(jobInfo)}
            </p>
          </div>
          <div>
            <p className="text-sm">
              <strong>Experience Required:</strong>{" "}
              {jobInfo.experienceRequired || "N/A"}
            </p>
          </div>
        </div>
        <ListSection
          title="Required Skills"
          items={jobInfo.relationships?.REQUIRES_SKILL || []}
          icon={ChevronRight}
        />
        <ListSection
          title="Preferred Skills"
          items={jobInfo.relationships?.PREFERS_SKILL || []}
          icon={ChevronRight}
        />
        <ListSection
          title="Required Certifications"
          items={jobInfo.relationships?.REQUIRED_CERTIFICATION || []}
          icon={ChevronRight}
        />
      </div>
    </div>
  );
};

const ApplicantDetailPanel: React.FC<ApplicantDetailPanelProps> = ({
  applicationId,
  onBack,
}) => {
  const [applicationData, setApplicationData] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  const [showAlert, setShowAlert] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchedRef = useRef(false);

  const [isCopilotDialogOpen, setIsCopilotDialogOpen] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState("");
  const [copilotTitle, setCopilotTitle] = useState("");

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (fetchedRef.current) return; // Skip if already fetched
      fetchedRef.current = true;

      setLoading(true);
      try {
        const data = await getApplicationDetailedView(applicationId);
        if ("error" in data) {
          setError(data.error);
        } else {
          setApplicationData(data);
          // Fetch the current status
          const statusResult = await getApplicationStatus(applicationId);
          if (statusResult.success) {
            setCurrentStatus(statusResult.status);
          } else {
            console.error("Failed to fetch application status:", statusResult.message);
          }
        }
      } catch (error) {
        console.error("Error fetching application details:", error);
        setError(
          "An unexpected error occurred while fetching application details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh] space-y-2">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-gray-500">Loading application details...</p>
      </div>
    );
  }

  if (error) {
    return <div>We encountered an error. Please try again later.</div>;
  }

  if (!applicationData) {
    return <div>No application data found.</div>;
  }

  const { applicationInfo, jobInfo, candidateInfo } = applicationData;

  // Comparison chart builder
  const comparisonSections = [
    {
      title: "Skills",
      candidateItems: candidateInfo?.relationships.HAS_SKILL || [],
      jobRequiredItems: jobInfo?.relationships.REQUIRES_SKILL || [],
      jobPreferredItems: jobInfo?.relationships.PREFERS_SKILL || [],
    },
    {
      title: "Experience",
      candidateItems: candidateInfo?.relationships.WORKED_AT || [],
      jobRequiredItems: jobInfo?.experienceRequired
        ? [{ job_title: jobInfo.experienceRequired }]
        : [],
    },
    {
      title: "Education",
      candidateItems: candidateInfo?.relationships.STUDIED_AT || [],
      jobRequiredItems: jobInfo?.education || [],
    },
    {
      title: "Certifications",
      candidateItems: candidateInfo?.relationships.HAS_CERTIFICATION || [],
      jobRequiredItems: jobInfo?.relationships.REQUIRED_CERTIFICATION || [],
    },
  ];

  const availableSections = comparisonSections.filter(
    (section) =>
      section.candidateItems.length > 0 || section.jobRequiredItems.length > 0
  );

  const dismissAlert = () => setShowAlert(false);

  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "N/A";

    if (/^\d{10}$/.test(phone)) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }

    return phone;
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    try {
      const result = await updateApplicationStatus(applicationId, newStatus);
      if (result.success) {
        setCurrentStatus(newStatus);
        console.log(`Application status updated to: ${newStatus}`);
      } else {
        console.error("Failed to update application status:", result.message);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white">
        <CardTitle className="text-md font-semibold flex items-center">
          <User className="mr-2 h-5 w-5" />
          Application Details
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{candidateInfo?.name || "N/A"}</h2>
          <UpdateApplicationStatus
            currentStatus={currentStatus || applicationInfo.status}
            onStatusChange={handleStatusChange}
          />
        </div>

        <div className="flex space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <Mail className="mr-1 h-4 w-4" />
            {candidateInfo?.email || "N/A"}
          </span>
          <div className="flex items-center">
            <Phone className="mr-1 h-4 w-4" />
            <span>{formatPhoneNumber(candidateInfo?.phone)}</span>
          </div>

          <span className="flex items-center">
            <MapPin className="mr-1 h-4 w-4" />
            {`${candidateInfo?.city}, ${candidateInfo?.state}`.trim() || "N/A"}
          </span>
        </div>

        <AlertMessage showAlert={showAlert} dismissAlert={dismissAlert} />

        <Tabs defaultValue="comparison" className="w-full">
          <TabsList>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="candidate">Candidate Details</TabsTrigger>
            <TabsTrigger value="job">Job Details</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison">
            <div className="space-y-4">
              {availableSections.map((section, index) => (
                <ComparisonSection
                  key={section.title}
                  title={section.title}
                  candidateItems={section.candidateItems}
                  jobRequiredItems={section.jobRequiredItems}
                  jobPreferredItems={section.jobPreferredItems}
                  isAlternate={index % 2 !== 0}
                  applicationId={applicationId}
                  setCopilotResponse={setCopilotResponse}
                  setCopilotTitle={setCopilotTitle}
                  setIsCopilotDialogOpen={setIsCopilotDialogOpen}
                />
              ))}
              {availableSections.length === 0 && (
                <p className="text-center text-gray-500">
                  No comparison data available.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="candidate">
            <CandidateExperience
              workExperience={candidateInfo?.relationships.WORKED_AT || []}
              education={candidateInfo?.relationships.STUDIED_AT || []}
            />
          </TabsContent>

          <TabsContent value="job">
            <JobDetails jobInfo={jobInfo} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CopilotResponseSheet
        isOpen={isCopilotDialogOpen}
        onClose={() => setIsCopilotDialogOpen(false)}
        response={copilotResponse}
        title={copilotTitle}
      />
    </Card>
  );
};

export default ApplicantDetailPanel;
