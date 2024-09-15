import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Zap,
  FileText,
  FileSearch,
  Globe,
  Users,
  ChevronDown,
  MapPin,
  ShieldCheck,
  Clock,
  DollarSign,
  Bookmark,
} from "lucide-react";

const AppDemo = () => {
  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex">
        {/* Left Column - Search Results */}
        <div className="w-1/3 border-r">
          <div className="p-4">
            <h1 className="text-md font-bold text-gray-900 mb-6">
              Opportunity Search
            </h1>
            <div className="flex space-x-2 mb-6">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
                placeholder="Enter job title or keywords"
                type="text"
                value="IT Project Manager"
              />
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Search
              </button>
            </div>
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-800 mb-2">
                Search Results
              </h2>
              <JobCard
                title="Systems and Technology Development Lead"
                location="AK"
                clearance="Public Trust"
                jobType="Full-Time"
              />
              {/* Add more JobCard components as needed */}
            </div>
          </div>
        </div>

        {/* Right Column - Job Details */}
        <div className="w-2/3 p-4">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-4 text-sm">
            <ChevronDown className="w-4 h-4 mr-2" />
            Back
          </button>
          <Card>
            <CardHeader>
              <h3 className="tracking-tight text-xl font-bold text-gray-800">
                Systems and Technology Development Lead
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge icon={MapPin}>AK</Badge>
                <Badge icon={ShieldCheck}>Public Trust</Badge>
                <Badge icon={Clock}>Full-Time</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Technical Design Lead for complex information systems,
                responsible for technical design and development, project
                management, and collaboration with stakeholders...
              </p>
              <h4 className="text-sm font-semibold mt-3 mb-1 text-gray-700">
                Responsibilities
              </h4>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>
                  Lead the technical design and development of complex
                  information systems
                </li>
                <li>
                  Manage cross-cutting development, operations, and maintenance
                  activities
                </li>
                <li>
                  Ensure alignment with evolving executive, regulatory, and
                  policy reporting requirements
                </li>
                {/* Add more list items as needed */}
              </ul>
              <div className="flex justify-between items-center mt-4">
                <button className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 text-sm">
                  Send Your Resume
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const JobCard = ({ title, location, clearance, jobType }) => (
  <Card className="mb-4">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">
            <span className="inline-flex rounded-xl text-xs bg-gray-700 text-white px-2 py-1">
              Private Employer
            </span>
          </p>
        </div>
        <button className="text-gray-500">
          <Bookmark className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-2 space-y-1">
        {location && (
          <div className="flex items-center text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            <span>{location}</span>
          </div>
        )}
        {clearance && (
          <div className="flex items-center text-sm text-gray-700">
            <ShieldCheck className="w-4 h-4 mr-2 text-gray-500" />
            <span>Security Clearance: {clearance}</span>
          </div>
        )}
        {jobType && (
          <div className="flex items-center text-sm text-gray-700">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <span>Job Type: {jobType}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const Badge = ({ children, icon: Icon }) => (
  <div className="inline-flex items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-normal py-0.5 px-2">
    <Icon className="w-4 h-4 mr-1" />
    {children}
  </div>
);

export default AppDemo;
