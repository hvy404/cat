import { useState } from "react";
import { Book, Briefcase, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const JobDetailsContent: React.FC<{
  jobDetails: any;
  jobRelationships: any;
}> = ({ jobDetails, jobRelationships }) => {
  const [activeSection, setActiveSection] = useState("description");

  const sections = [
    { id: "description", title: "Job Description", icon: Book },
    { id: "requirements", title: "Requirements", icon: Briefcase },
    { id: "benefits", title: "Benefits", icon: Gift },
  ];

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div>
      <nav className="mb-4">
        <div className="flex justify-center space-x-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center p-2 rounded-lg transition-colors text-sm ${
                activeSection === section.id
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <section.icon className="mr-1 w-4 h-4" />
              {section.title}
            </button>
          ))}
        </div>
      </nav>
      <div>
        {activeSection === "description" && (
          <Card className="mb-6 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-md">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{jobDetails.summary}</p>
              {jobDetails.responsibilities &&
                jobDetails.responsibilities.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold mt-3 mb-1 text-gray-700">
                      Responsibilities
                    </h4>
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                      {jobDetails.responsibilities.map(
                        (resp: string, index: number) => (
                          <li key={index}>{capitalizeFirstLetter(resp)}</li>
                        )
                      )}
                    </ul>
                  </>
                )}
            </CardContent>
          </Card>
        )}
        {activeSection === "requirements" && (
          <Card className="mb-6 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-md">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              {jobDetails.experience && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mt-3 mb-1 text-gray-700">
                    Experience
                  </h4>
                  <p className="text-sm text-gray-600">
                    {jobDetails.experience}
                  </p>
                </div>
              )}
              {jobRelationships.REQUIRES_SKILL && (
                <>
                  <h4 className="text-sm font-semibold mt-3 mb-1 text-gray-700">
                    Required Skills
                  </h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {jobRelationships.REQUIRES_SKILL.map(
                      (skill: any, index: number) => (
                        <li key={index}>{capitalizeFirstLetter(skill.name)}</li>
                      )
                    )}
                  </ul>
                </>
              )}
              {jobRelationships.PREFERS_SKILL && (
                <>
                  <h4 className="text-sm font-semibold mt-3 mb-1 text-gray-700">
                    Preferred Skills
                  </h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {jobRelationships.PREFERS_SKILL.map(
                      (skill: any, index: number) => (
                        <li key={index}>{capitalizeFirstLetter(skill.name)}</li>
                      )
                    )}
                  </ul>
                </>
              )}
              {jobRelationships.REQUIRES_QUALIFICATION && (
                <>
                  <h4 className="text-sm font-semibold mt-3 mb-1 text-gray-700">
                    Qualifications
                  </h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {jobRelationships.REQUIRES_QUALIFICATION.map(
                      (qual: any, index: number) => (
                        <li key={index}>{capitalizeFirstLetter(qual.name)}</li>
                      )
                    )}
                  </ul>
                </>
              )}
              {jobRelationships.REQUIRED_EDUCATION && (
                <>
                  <h4 className="text-sm font-semibold mt-3 mb-1 text-gray-700">
                    Education
                  </h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {jobRelationships.REQUIRED_EDUCATION.map(
                      (edu: any, index: number) => (
                        <li key={index}>{`${capitalizeFirstLetter(edu.degree)}${
                          edu.field
                            ? ` in ${capitalizeFirstLetter(edu.field)}`
                            : ""
                        }`}</li>
                      )
                    )}
                  </ul>
                </>
              )}
              {jobRelationships.REQUIRED_CERTIFICATION && (
                <>
                  <h4 className="text-sm font-semibold mt-3 mb-1 text-gray-700">
                    Certifications
                  </h4>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {jobRelationships.REQUIRED_CERTIFICATION.map(
                      (cert: any, index: number) => (
                        <li key={index}>{capitalizeFirstLetter(cert.name)}</li>
                      )
                    )}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        )}
        {activeSection === "benefits" && (
          <Card className="mb-6 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-md">Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              {jobDetails.benefits && jobDetails.benefits.length > 0 && (
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  {jobDetails.benefits.map((benefit: string, index: number) => (
                    <li key={index}>{capitalizeFirstLetter(benefit)}</li>
                  ))}
                </ul>
              )}
              {jobDetails.remote_flexibility && (
                <p className="text-sm text-gray-600 mt-2">
                  This position offers remote work flexibility.
                </p>
              )}
              {jobDetails.leadership_opportunity && (
                <p className="text-sm text-gray-600 mt-2">
                  This position includes leadership opportunities.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobDetailsContent;
