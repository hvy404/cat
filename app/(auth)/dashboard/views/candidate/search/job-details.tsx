import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  ShieldCheck,
  Clock,
  DollarSign,
  ChevronLeft,
  Building,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { fetchJobDetails } from "./job-detail-helper";
import { JobNode, NodeWithId } from "@/lib/jobs/mutation";

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
}

type JobNodeWithoutEmbedding = Omit<JobNode, "embedding">;

const JobMoreDetails: React.FC<JobDetailsProps> = ({ jobId, onBack }) => {
  const [jobDetails, setJobDetails] = useState<
    (JobNodeWithoutEmbedding & NodeWithId) | null
  >(null);
  const [jobRelationships, setJobRelationships] = useState<any | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  useEffect(() => {
    const loadJobDetails = async () => {
      setIsLoading(true);
      try {
        const { jobDetails, jobRelationships, isBookmarked } =
          await fetchJobDetails(jobId);
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
  }, [jobId]);

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatHourlyRate = (rate: number) => {
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
    return <div>No job details found.</div>;
  }

  return (
    <div className="w-full bg-gray-50 rounded-xl">
      <div className="p-4 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4 text-sm">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Search Results
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
                {jobDetails.job_title}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="text-sm font-normal py-0.5 px-2"
              >
                <MapPin className="w-4 h-4 mr-1" />
                {JSON.parse(jobDetails.location)[0]?.city},{" "}
                {JSON.parse(jobDetails.location)[0]?.state}
              </Badge>
              <Badge
                variant="secondary"
                className="text-sm font-normal py-0.5 px-2"
              >
                <ShieldCheck className="w-4 h-4 mr-1" />
                {jobDetails.security_clearance}
              </Badge>
              <Badge
                variant="secondary"
                className="text-sm font-normal py-0.5 px-2"
              >
                <Briefcase className="w-4 h-4 mr-1" />
                {jobDetails.experience}
              </Badge>
              <Badge
                variant="secondary"
                className="text-sm font-normal py-0.5 px-2"
              >
                <Clock className="w-4 h-4 mr-1" />
                {jobDetails.job_type}
              </Badge>
            </div>

            {jobDetails.salary_disclose && (
              <div className="flex items-center text-green-600 font-semibold text-sm">
                <DollarSign className="w-5 h-5 mr-2" />
                {jobDetails.compensation_type === "salary" && (
                  <span>
                    Salary Range: {formatSalary(jobDetails.starting_salary)} -{" "}
                    {formatSalary(jobDetails.maximum_salary)}
                  </span>
                )}
                {jobDetails.compensation_type === "hourly" && (
                  <span>
                    Hourly Rate: {formatHourlyRate(jobDetails.hourly_comp_min)}{" "}
                    - {formatHourlyRate(jobDetails.hourly_comp_max)}
                  </span>
                )}
                {jobDetails.compensation_type === "commission" && (
                  <span>
                    OTE: {formatSalary(jobDetails.ote_salary)} (Commission:{" "}
                    {jobDetails.commission_percent}%)
                  </span>
                )}
              </div>
            )}

            <Separator />

            <Tabs defaultValue="description" className="w-full">
              <TabsList>
                <TabsTrigger value="description" className="text-sm">
                  Job Description
                </TabsTrigger>
                <TabsTrigger value="requirements" className="text-sm">
                  Requirements
                </TabsTrigger>
                <TabsTrigger value="benefits" className="text-sm">
                  Benefits
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
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
              </TabsContent>
              <TabsContent value="requirements" className="mt-4">
                {jobRelationships.REQUIRES_SKILL && (
                  <>
                    <h4 className="text-sm font-semibold mt-3 mb-1 text-gray-700">
                      Required Skills
                    </h4>
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                      {jobRelationships.REQUIRES_SKILL.map(
                        (skill: any, index: number) => (
                          <li key={index}>
                            {capitalizeFirstLetter(skill.name)}
                          </li>
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
                          <li key={index}>
                            {capitalizeFirstLetter(skill.name)}
                          </li>
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
                          <li key={index}>
                            {capitalizeFirstLetter(qual.name)}
                          </li>
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
                          <li key={index}>{`${capitalizeFirstLetter(
                            edu.degree
                          )}${
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
                          <li key={index}>
                            {capitalizeFirstLetter(cert.name)}
                          </li>
                        )
                      )}
                    </ul>
                  </>
                )}
              </TabsContent>
              <TabsContent value="benefits" className="mt-4">
                {jobDetails.benefits && jobDetails.benefits.length > 0 && (
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    {jobDetails.benefits.map(
                      (benefit: string, index: number) => (
                        <li key={index}>{capitalizeFirstLetter(benefit)}</li>
                      )
                    )}
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
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between items-center mt-4">
            <Button size="sm" className="text-sm">
              Apply Now
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              <Building className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-semibold text-sm">
                {jobDetails.company}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              TODO: Add company description here. If private employer, show a
              message that the company is private.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobMoreDetails;
