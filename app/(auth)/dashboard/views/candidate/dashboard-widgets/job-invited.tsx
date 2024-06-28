import React from "react";
import { Briefcase, FileText, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/app/(auth)/dashboard/views/candidate/dashboard-widgets/job-card";

interface Job {
  id: number;
  title: string;
  company: string;
  salary?: string;
  match?: number;
  status?: string;
  progress?: number;
}

interface DashboardData {
  invitedJobs: Job[];
  appliedJobs: Job[];
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
  <Card className="w-full h-full bg-white shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-gray-300 flex flex-col">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-semibold text-gray-800">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="py-4 flex-grow flex flex-col justify-between">
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {/* Button is commented out as per your original code */}
      {/* <Button
        variant="outline"
        size="sm"
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 self-start"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> {buttonText}
      </Button> */}
    </CardContent>
  </Card>
);

export const JobInvited = ({ invitedJobs }: { invitedJobs: Job[] }) => {
  const hasInvitedJobs = invitedJobs && invitedJobs.length > 0;

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
        <Briefcase className="w-4 h-4 mr-2 text-gray-700" />
        Jobs You're Invited To
      </h2>
      <div className="flex-grow">
        {hasInvitedJobs ? (
          <div className="grid grid-cols-1 gap-4 h-full">
            {invitedJobs.map((job) => (
              <JobCard key={job.id} job={job} type="invited" />
            ))}
          </div>
        ) : (
          <EmptyStateCard
            title="Stay Tuned"
            description="We're actively looking for great job matches for you. Check back soon and in the meantime, keep your profile updated."
            buttonText="Update Profile"
          />
        )}
      </div>
    </div>
  );
};

export default JobInvited;