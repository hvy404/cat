import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  ShieldCheck,
  Clock,
  DollarSign,
  ChevronLeft,
  Building,
  Calendar,
  Globe,
  Bookmark,
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
import { fetchJobDetails, toggleBookmark } from "./job-detail-helper";

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
}

const JobMoreDetails: React.FC<JobDetailsProps> = ({ jobId, onBack }) => {
  const [jobDetails, setJobDetails] = useState<any | null>(null);
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
              <CardDescription className="text-base text-gray-600">
                {jobDetails.company ? (
                  jobDetails.company
                ) : (
                  <span className="inline-flex rounded-md text-sm bg-gray-700 text-white px-2 py-0.5">
                    Private Employer
                  </span>
                )}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm font-normal py-0.5 px-2">
                <MapPin className="w-4 h-4 mr-1" />
                {JSON.parse(jobDetails.location)[0]?.city},{" "}
                {JSON.parse(jobDetails.location)[0]?.state}
              </Badge>
              <Badge variant="secondary" className="text-sm font-normal py-0.5 px-2">
                <ShieldCheck className="w-4 h-4 mr-1" />
                {jobDetails.security_clearance}
              </Badge>
              <Badge variant="secondary" className="text-sm font-normal py-0.5 px-2">
                <Briefcase className="w-4 h-4 mr-1" />
                {jobDetails.experience}
              </Badge>
              <Badge variant="secondary" className="text-sm font-normal py-0.5 px-2">
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
                <h3 className="text-base font-semibold mb-2 text-gray-700">
                  Job Description
                </h3>
                <p className="text-sm text-gray-600">{jobDetails.summary}</p>
              </TabsContent>
              <TabsContent value="requirements" className="mt-4">
                <h3 className="text-base font-semibold mb-2 text-gray-700">
                  Requirements
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {jobRelationships.REQUIRES_SKILL?.map(
                    (skill: any, index: number) => (
                      <li key={index}>{capitalizeFirstLetter(skill.name)}</li>
                    )
                  )}
                  {jobRelationships.REQUIRES_QUALIFICATION?.map(
                    (qual: any, index: number) => (
                      <li key={index}>{capitalizeFirstLetter(qual.name)}</li>
                    )
                  )}
                </ul>
                {jobRelationships.REQUIRED_CERTIFICATION &&
                  jobRelationships.REQUIRED_CERTIFICATION.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold mt-3 mb-1 text-gray-700">
                        Certifications
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
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
                <h3 className="text-base font-semibold mb-2 text-gray-700">
                  Benefits
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {jobRelationships.OFFERS_BENEFIT?.map(
                    (benefit: any, index: number) => (
                      <li key={index}>{capitalizeFirstLetter(benefit.name)}</li>
                    )
                  )}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Posted on:{" "}
              {new Date(jobDetails.application_deadline).toLocaleDateString()}
            </div>
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
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2 text-gray-500" />
              <a
                href={jobDetails.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                Company Website
              </a>
            </div>
            <p className="text-sm text-gray-600">
              {jobDetails.company_overview}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobMoreDetails;
