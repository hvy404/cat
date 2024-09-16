import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Clock,
  Bookmark,
  Search,
  Bell,
  Zap,
} from "lucide-react";

const handleSignup = (e: React.MouseEvent) => {
  e.preventDefault();
  const target = document.querySelector("#signup");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const AppDemoShowcase = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-12 text-center">
          Two Ways to Find Your Dream Job
        </h2>

        <div className="flex flex-col lg:flex-row items-start lg:items-stretch gap-24 relative">
          {/* Traditional Job Search */}
          <div className="w-full lg:w-1/2 space-y-8">
            <h3 className="text-2xl font-bold text-gray-800">
              1. Traditional Job Search
            </h3>
            <p className="text-lg text-gray-600">
              Search and apply manually - if you still want to.
            </p>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden relative">
              <div className="max-h-[600px] overflow-y-auto">
                <AppDemo />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Divider with "OR" */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
              <span className="text-xl font-bold text-gray-500">OR</span>
            </div>
          </div>

          {/* Proactive Opportunity Alerts */}
          <div className="w-full lg:w-1/2 space-y-8">
            <h3 className="text-2xl font-bold text-gray-800">
              2. Proactive Opportunity Alerts
            </h3>
            <p className="text-lg text-gray-600">
              Or let our AI find the perfect job for you.
            </p>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Zap className="h-8 w-8 text-yellow-300 mr-3" />
                <h3 className="text-2xl font-semibold text-white">
                  AI-Powered Job Matching
                </h3>
              </div>
              <p className="text-blue-100 mb-4">
                Say goodbye to endless scrolling and manual searches. Our AI
                works tirelessly behind the scenes, analyzing thousands of jobs
                to find your perfect match.
              </p>
              <p className="text-blue-100">
                When we discover an ideal opportunity that aligns with your
                skills and career aspirations, we'll notify you immediately. Let
                our intelligent system do the heavy lifting while you focus on
                what matters most - preparing for your dream role.
              </p>
              <button
                onClick={handleSignup}
                className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Ready?
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AppDemo = () => {
  return (
    <div className="flex select-none">
      {/* Left Column - Search Results */}
      <div className="w-2/5 border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-lg font-semibold text-gray-900 mb-4">
            Job Search
          </h1>
          <div className="relative mb-6">
            <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-400">
              Search jobs...
            </div>
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <JobCard
            title="Systems Development Lead"
            location="Remote"
            clearance="Public Trust"
            jobType="Full-Time"
          />
          <JobCard
            title="Senior Software Engineer"
            location="New York, NY"
            clearance="Secret"
            jobType="Contract"
          />
          <JobCard
            title="Data Scientist"
            location="San Francisco, CA"
            clearance="Top Secret"
            jobType="Full-Time"
          />
          <JobCard
            title="DevOps Engineer"
            location="Austin, TX"
            clearance="Secret"
            jobType="Full-Time"
          />
        </div>
      </div>

      {/* Right Column - Job Details */}
      <div className="w-3/5 p-6">
        <Card className="shadow-none border-0">
          <CardHeader className="pb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              Systems Development Lead
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge icon={MapPin}>Remote</Badge>
              <Badge icon={ShieldCheck}>Public Trust</Badge>
              <Badge icon={Clock}>Full-Time</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Lead the technical design and development of complex information
              systems, manage cross-cutting activities, and ensure alignment
              with evolving requirements.
            </p>
            <h4 className="font-semibold text-gray-800 mb-2">
              Key Responsibilities:
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Oversee technical design and development</li>
              <li>Manage project timelines and deliverables</li>
              <li>Collaborate with stakeholders to ensure project success</li>
            </ul>
            <div className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600">
              Apply Now
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const JobCard = ({
  title,
  location,
  clearance,
  jobType,
}: {
  title: string;
  location: string;
  clearance: string;
  jobType: string;
}) => (
  <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {location} • {jobType}
          </p>
        </div>
      </div>
      <div className="mt-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {clearance}
        </span>
      </div>
    </CardContent>
  </Card>
);

const Badge = ({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
}) => (
  <div className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
    <Icon className="w-3 h-3 mr-1" />
    {children}
  </div>
);

export default AppDemoShowcase;
