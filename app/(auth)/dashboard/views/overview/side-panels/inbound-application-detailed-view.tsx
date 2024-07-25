import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Briefcase,
  Calendar,
  MapPin,
  Mail,
  DollarSign,
  Phone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getApplicationDetailedView } from "@/lib/employer/get-application-details";

type ApplicantDetailPanelProps = {
  applicationId: string;
  onBack: () => void;
};

const ExperienceItem = ({ item, type }) => {
  const {
    organization,
    institution,
    job_title,
    degree,
    start_date,
    end_date,
    responsibilities,
    honors_awards_coursework
  } = item;

  const formatDate = (date) => {
    if (!date) return 'Present';
    const [year, month] = date.split('-');
    return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
  };

  return (
    <li className="mb-4">
      <h3 className="font-semibold">{organization || institution}</h3>
      <p className="text-sm">{job_title || degree}</p>
      <p className="text-xs text-gray-600">
        {formatDate(start_date)} - {formatDate(end_date)}
      </p>
      {responsibilities && (
        <p className="text-sm mt-1">{responsibilities}</p>
      )}
      {honors_awards_coursework && (
        <p className="text-sm mt-1">{honors_awards_coursework}</p>
      )}
    </li>
  );
};

const CandidateExperience = ({ workExperience, education }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Work Experience</h2>
        <ul className="list-none">
          {workExperience.map((exp, index) => (
            <ExperienceItem key={index} item={exp} type="work" />
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Education</h2>
        <ul className="list-none">
          {education.map((edu, index) => (
            <ExperienceItem key={index} item={edu} type="education" />
          ))}
        </ul>
      </div>
    </div>
  );
};

const ApplicantDetailPanel: React.FC<ApplicantDetailPanelProps> = ({
  applicationId,
  onBack,
}) => {
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      setLoading(true);
      try {
        const data = await getApplicationDetailedView(applicationId);
        if ("error" in data) {
          setError(data.error);
        } else {
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading application data: {error}</div>;
  }

  if (!applicationData) {
    return <div>No application data found.</div>;
  }

  const { applicationInfo, jobInfo, candidateInfo } = applicationData;

  // Function to format location
  const formatLocation = (
    location: Array<{ city: string; state: string; zipcode: string }>
  ) => {
    if (!location || location.length === 0) return "N/A";
    const { city, state, zipcode } = location[0];
    return `${city || ""}, ${state || ""} ${zipcode || ""}`.trim() || "N/A";
  };

  // Function to render relationships
  const renderRelationships = (relationships: Record<string, any[]>) => {
    return Object.entries(relationships).map(([type, items]) => {
      // Skip rendering WORKED_AT and STUDIED_AT as they're handled by CandidateExperience
      if (type === 'WORKED_AT' || type === 'STUDIED_AT') return null;
      
      return (
        <div key={type}>
          <h4 className="text-sm font-semibold mt-2">
            {type.replace(/_/g, " ")}
          </h4>
          <ul className="list-disc list-inside">
            {items.map((item, index) => (
              <li key={index} className="text-sm">
                {item.name || item.title || JSON.stringify(item)}
              </li>
            ))}
          </ul>
        </div>
      );
    });
  };

  // Function to truncate job description
  const truncateDescription = (description: string | null): string => {
    if (!description) return "No description available";
    const sentences = description.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length <= 2) return description;
    return sentences.slice(0, 2).join(' ') + '...';
  };

  // Toggle description expansion
  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Determine if the description should be expandable
  const isDescriptionExpandable = (description: string | null): boolean => {
    if (!description) return false;
    const truncated = truncateDescription(description);
    return truncated.length < description.length;
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between">
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
        {candidateInfo && (
          <div>
            <h3 className="text-md font-semibold mb-2">
              Candidate Information
            </h3>
            <div className="space-y-2">
              <p className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4" />
                {candidateInfo.name || "N/A"}
              </p>
              <p className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4" />
                {candidateInfo.email || "N/A"}
              </p>
              <p className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4" />
                {candidateInfo.phone || "N/A"}
              </p>
              <p className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4" />
                {`${candidateInfo.city}, ${candidateInfo.state} ${candidateInfo.zipcode}`.trim() ||
                  "N/A"}
              </p>
              <CandidateExperience 
                workExperience={candidateInfo.relationships.WORKED_AT || []}
                education={candidateInfo.relationships.STUDIED_AT || []}
              />
              {renderRelationships(candidateInfo.relationships)}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-md font-semibold mb-2">Application Details</h3>
          <div className="space-y-2">
            <p className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4" />
              Submitted:{" "}
              {applicationInfo.submitDate
                ? new Date(applicationInfo.submitDate).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="flex items-center text-sm">
              <Briefcase className="mr-2 h-4 w-4" />
              Status: {applicationInfo.status || "N/A"}
            </p>
            <p className="flex items-center text-sm">
              Resume Key: {applicationInfo.resumeKey || "N/A"}
            </p>
          </div>
        </div>

        {jobInfo && (
          <>
            <div>
              <h3 className="text-md font-semibold mb-2">Job Information</h3>
              <div className="space-y-2">
                <p className="font-medium">{jobInfo.title || "N/A"}</p>
                <p className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4" />
                  {formatLocation(jobInfo.location)}
                </p>
                <p className="flex items-center text-sm">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Type: {jobInfo.type || "N/A"}
                </p>
                <p className="flex items-center text-sm">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Salary Range: ${jobInfo.salary?.min.toLocaleString() ||
                    "N/A"}{" "}
                  - ${jobInfo.salary?.max.toLocaleString() || "N/A"}
                </p>
                <p className="text-sm">
                  Experience Required: {jobInfo.experienceRequired || "N/A"}
                </p>
                {renderRelationships(jobInfo.relationships)}
              </div>
            </div>
            <div>
              <h3 className="text-md font-semibold mb-2">Job Description</h3>
              <p className="text-sm">
                {isDescriptionExpanded
                  ? jobInfo.description || "No description available"
                  : truncateDescription(jobInfo.description)}
              </p>
              {isDescriptionExpandable(jobInfo.description) && (
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal mt-1"
                  onClick={toggleDescription}
                >
                  {isDescriptionExpanded ? (
                    <>
                      Show Less <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Read More <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
            <div>
              <h3 className="text-md font-semibold mb-2">Qualifications</h3>
              <ul className="list-disc list-inside">
                {Array.isArray(jobInfo.qualifications) ? (
                  jobInfo.qualifications.map((qual: string, index: number) => (
                    <li key={index} className="text-sm">
                      {qual}
                    </li>
                  ))
                ) : (
                  <li className="text-sm">
                    {jobInfo.qualifications || "No qualifications specified"}
                  </li>
                )}
              </ul>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline">Reject</Button>
          <Button variant="outline">Schedule Interview</Button>
          <Button>Accept</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicantDetailPanel;