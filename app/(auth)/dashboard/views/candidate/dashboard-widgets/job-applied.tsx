import React from "react";
import { FileText, PlusCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ApplicationWithJobTitle {
  job_id: string;
  title: string;
}

interface JobAppliedProps {
  appliedJobs: ApplicationWithJobTitle[];
  handleViewMoreDetails: (jobId: string) => void;
}

const EmptyStateCard = ({
  title,
  description,
  buttonText,
}: {
  title: string;
  description: string;
  buttonText: string;
}) => (
  <Card className="w-full h-full bg-white shadow-sm hover:shadow-md transition-all duration-300 border-gray-300 flex flex-col">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-semibold text-gray-800">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="py-4 flex-grow flex flex-col justify-between">
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Button
        variant="outline"
        size="sm"
        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 self-start"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> {buttonText}
      </Button>
    </CardContent>
  </Card>
);

export const JobApplied: React.FC<JobAppliedProps> = ({
  appliedJobs,
  handleViewMoreDetails,
}) => {
  const hasAppliedJobs = appliedJobs && appliedJobs.length > 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center space-x-2 pb-2">
        <div className="flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          <CardTitle className="text-md font-semibold text-gray-800">
            Jobs You've Applied To
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {hasAppliedJobs ? (
          <div className="space-y-4">
            {appliedJobs.map((job) => (
              <div
                key={job.job_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div>
                  <h3 className="font-medium text-sm">{job.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewMoreDetails(job.job_id)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No applied jobs yet.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Browse Jobs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobApplied;