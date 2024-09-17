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


interface JobCardProps {
  job: {
    id: string | number;
    title: string;
  };
  onClick: () => void;
}


export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => (
  <Card className="w-full bg-white shadow-sm hover:shadow-md transition-all duration-300 border-gray-300 flex flex-col h-full">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-md font-semibold text-gray-800">
          {job.title}
        </CardTitle>
      </div>
    </CardHeader>
    <CardFooter className="pt-2 flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        onClick={onClick}
      >
        View Details <ChevronRight className="ml-1 w-4 h-4" />
      </Button>
    </CardFooter>
  </Card>
);

