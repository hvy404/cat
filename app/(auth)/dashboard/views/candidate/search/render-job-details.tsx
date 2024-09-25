import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { MapPin, ShieldCheck, Clock, DollarSign, Bookmark } from "lucide-react";
import { SerializableJobResult } from "./job-search";

export const renderJobDetails = (
  job: SerializableJobResult,
  bookmarkedJobs: { [key: string]: boolean },
  handleBookmarkToggle: (jobId: string) => void,
  viewDetails: (jobId: string) => void,
  formatSalary: (salary: number) => string,
  formatHourlyRate: (rate: number) => string
): JSX.Element => {
  const location = JSON.parse(job.location)[0];
  const hasLocation = location?.city || location?.state;

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Card
      key={job.job_id}
      className="mb-4 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          {job.job_title && (
            <CardTitle className="text-lg font-semibold text-gray-800">
              {job.job_title}
            </CardTitle>
          )}
          <CardDescription className="text-sm text-gray-600">
            {job.company ? (
              capitalizeWords(job.company)
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
                Private Employer
              </span>
            )}
          </CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleBookmarkToggle(job.job_id)}
              >
                <Bookmark
                  className={`h-5 w-5 ${
                    bookmarkedJobs[job.job_id]
                      ? "fill-current text-gray-800"
                      : "text-gray-500"
                  }`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white border-0">
              <p>
                {bookmarkedJobs[job.job_id]
                  ? "Remove bookmark"
                  : "Bookmark this job"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 space-y-2">
        {hasLocation && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            <span>
              {[location.city, location.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
        {job.security_clearance && (
          <div className="flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2 text-gray-500" />
            <span>Security Clearance: {job.security_clearance}</span>
          </div>
        )}
        {job.job_type && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <span>Job Type: {job.job_type}</span>
          </div>
        )}
        {job.salary_disclose && (
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
            {job.compensation_type === "salary" &&
              job.starting_salary &&
              job.maximum_salary && (
                <span>
                  Salary Range: {formatSalary(job.starting_salary)} -{" "}
                  {formatSalary(job.maximum_salary)}
                </span>
              )}
            {job.compensation_type === "hourly" &&
              job.hourly_comp_min &&
              job.hourly_comp_max && (
                <span>
                  Hourly Rate: {formatHourlyRate(job.hourly_comp_min)} -{" "}
                  {formatHourlyRate(job.hourly_comp_max)}
                </span>
              )}
            {job.compensation_type === "commission" &&
              job.ote_salary &&
              job.commission_percent && (
                <span>
                  OTE: {formatSalary(job.ote_salary)} (Commission:{" "}
                  {job.commission_percent}%)
                </span>
              )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => viewDetails(job.job_id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
