import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  MapPin,
  Mail,
  Phone,
  Info,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { getApplicationDetailedView } from "@/lib/employer/get-application-details";
import { Alert } from "@/components/ui/alert";

type ApplicantDetailPanelProps = {
  applicationId: string;
  onBack: () => void;
};

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
}> = ({
  title,
  candidateItems,
  jobRequiredItems,
  jobPreferredItems,
  isAlternate,
}) => (
  <div className={`p-4 rounded-lg ${isAlternate ? "bg-gray-50" : "bg-white"}`}>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-medium mb-1">Candidate</h4>
        <ul className="list-disc pl-5 space-y-2">
          {candidateItems.map((item, index) => (
            <li key={index} className="text-sm ml-2 break-words">
              {item?.name ||
                item?.job_title ||
                item?.degree ||
                (typeof item === "object" ? JSON.stringify(item) : item) ||
                "N/A"}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-1">Job Requirements</h4>
        <ul className="list-disc pl-5 space-y-2">
          {jobRequiredItems.map((item, index) => (
            <li key={index} className="text-sm ml-2 break-words">
              {item?.name ||
                item?.job_title ||
                item?.degree ||
                (typeof item === "object" ? JSON.stringify(item) : item) ||
                "N/A"}
            </li>
          ))}
          {jobPreferredItems &&
            jobPreferredItems.map((item, index) => (
              <li key={index} className="text-sm ml-2 break-words italic">
                (Preferred){" "}
                {item?.name ||
                  (typeof item === "object" ? JSON.stringify(item) : item) ||
                  "N/A"}
              </li>
            ))}
        </ul>
      </div>
    </div>
  </div>
);

const JobDetails: React.FC<{ jobInfo: any }> = ({ jobInfo }) => {
  if (!jobInfo) return <div>No job information available.</div>;

  return (
    <div className="space-y-4">
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
            <strong>Type:</strong> {jobInfo.type || "N/A"}
          </p>
          <p className="text-sm">
            <strong>Salary Range:</strong> $
            {jobInfo.salary?.min?.toLocaleString() || "N/A"} - $
            {jobInfo.salary?.max?.toLocaleString() || "N/A"}
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
  );
};

const formatLocation = (
  location: Array<{ city: string; state: string; zipcode: string }> | undefined
) => {
  if (!location || location.length === 0) return "N/A";
  const { city, state, zipcode } = location[0];
  return `${city || ""}, ${state || ""} ${zipcode || ""}`.trim() || "N/A";
};

const ApplicantDetailPanel: React.FC<ApplicantDetailPanelProps> = ({
  applicationId,
  onBack,
}) => {
  const [applicationData, setApplicationData] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      setLoading(true);
      try {
        const data = await getApplicationDetailedView(applicationId);
        if ("error" in data) {
          setError(data.error);
        } else {
          // console log the data, ensure arrays are stringified to read
          //console.log("Data:", JSON.stringify(data));
          setApplicationData(data);
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
      jobRequiredItems: jobInfo?.qualifications
        ? [{ degree: jobInfo.qualifications }]
        : [],
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

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10">
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
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              Reject
            </Button>
            <Button variant="outline" size="sm">
              Schedule Interview
            </Button>
            <Button size="sm">Accept</Button>
          </div>
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

        {showAlert && (
          <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200 px-3 relative">
            <button
              onClick={dismissAlert}
              className="absolute top-3 right-3 p-1 text-yellow-500 hover:text-yellow-700"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2 pr-8">
              <Info className="h-6 w-6 flex-shrink-0 text-yellow-500" />
              <p className="text-xs text-yellow-700">
                This candidate discovered your job listing through our
                platform's search feature and submitted their resume to express
                interest. While our AI-driven matching algorithms excel at
                identifying ideal candidates, we encourage a thorough review of
                this self-submitted application to ensure alignment with your
                specific requirements.
              </p>
            </div>
          </Alert>
        )}

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
    </Card>
  );
};

export default ApplicantDetailPanel;
