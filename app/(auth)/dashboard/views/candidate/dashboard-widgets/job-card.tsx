import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  salary?: string;
  match?: number;
  status?: string;
  progress?: number;
}

interface JobCardProps {
  job: Job;
  type: "invited" | "applied";
}

export const JobCard: React.FC<JobCardProps> = ({ job, type }) => (
  <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-gray-300 flex flex-col h-full">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-md font-semibold text-gray-800">
          {job.title}
        </CardTitle>
        {type === "invited" && job.match && (
          <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
            {job.match}% Match
          </span>
        )}
      </div>
      <CardDescription className="text-sm text-gray-600">
        {job.company}
      </CardDescription>
    </CardHeader>
    <CardContent className="py-2 flex-grow">Content...</CardContent>
    <CardFooter className="pt-2 flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      >
        View Details <ChevronRight className="ml-1 w-4 h-4" />
      </Button>
    </CardFooter>
  </Card>
);
