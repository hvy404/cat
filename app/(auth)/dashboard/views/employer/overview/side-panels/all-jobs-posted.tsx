import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import useStore from "@/app/state/useStore";
import { fetchDetailedJobPosts } from "@/lib/overview/fetchRoles";

interface Job {
  jd_id: string;
  title: string;
  location: any[];
  location_type: string;
  security_clearance: string;
  posted_date: string;
  private_employer: boolean | null;
  new_match?: boolean;
}

const ITEMS_PER_PAGE = 2;

const EmployerAllJobsPosted = () => {
  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;

  const { setEmployerRightPanelView, setDashboardRoleOverview } = useStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [noJobs, setNoJobs] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      if (cuid) {
        const result = await fetchDetailedJobPosts(cuid, "active");
        console.log("Result:", result);
        if (isMounted) {
          setLoadingJobs(false);
          if (result && Array.isArray(result.data) && result.data.length > 0) {
            setJobs(result.data);
            setFilteredJobs(result.data);
          } else {
            setNoJobs(true);
          }
        }
      }
    };

    fetchJobs();
    return () => {
      isMounted = false;
    };
  }, [cuid]);

  useEffect(() => {
    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, jobs]);

  const handleClick = (job_id: string, title: string) => {
    setDashboardRoleOverview({
      active: true,
      active_role_id: String(job_id),
      active_role_name: title,
    });
    setEmployerRightPanelView("roleOverview");
  };

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loadingJobs) return <div>Loading jobs...</div>;
  if (noJobs) return <div>No jobs found.</div>;

  return (
    <Card className="w-full h-full bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          All Jobs Posted
        </h2>
        <div className="mb-4 relative">
          <Input
            type="text"
            placeholder="Search by opportunity title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <div className="space-y-4">
          {paginatedJobs.map((job) => (
            <motion.div
              key={job.jd_id}
              className="rounded-md transition-all duration-300 cursor-pointer"
              onClick={() => handleClick(job.jd_id, job.title)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="px-4 py-2 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {job.title}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location_type}
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    Posted: {job.posted_date}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployerAllJobsPosted;
