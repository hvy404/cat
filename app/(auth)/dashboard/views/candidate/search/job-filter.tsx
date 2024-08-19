import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SerializableJobResult } from "./job-search";

interface FilterOptions {
    jobTypes: string[];
    securityClearances: string[];
    locationTypes: string[];
    compensationTypes: string[];
    remoteFlexibility: boolean[];
  }

const JobFilters: React.FC<{
    jobs: SerializableJobResult[];
    onFilterChange: (filters: any) => void;
  }> = ({ jobs, onFilterChange }) => {
    const [filters, setFilters] = useState<{
      jobType: string[];
      securityClearance: string[];
      locationType: string[];
      compensationType: string[];
      remoteFlexibility: boolean | null;
      salaryMin: string;
      salaryMax: string;
    }>({
      jobType: [],
      securityClearance: [],
      locationType: [],
      compensationType: [],
      remoteFlexibility: null,
      salaryMin: "",
      salaryMax: "",
    });
  
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
      jobTypes: [],
      securityClearances: [],
      locationTypes: [],
      compensationTypes: [],
      remoteFlexibility: [],
    });
  
    const [currentFilters, setCurrentFilters] = useState(filters);
  
    useEffect(() => {
      const options: FilterOptions = {
        jobTypes: Array.from(
          new Set(jobs.map((job) => job.job_type).filter(Boolean))
        ),
        securityClearances: Array.from(
          new Set(jobs.map((job) => job.security_clearance).filter(Boolean))
        ),
        locationTypes: Array.from(
          new Set(jobs.map((job) => job.location_type).filter(Boolean))
        ),
        compensationTypes: Array.from(
          new Set(jobs.map((job) => job.compensation_type).filter(Boolean))
        ),
        remoteFlexibility: Array.from(
          new Set(jobs.map((job) => job.remote_flexibility))
        ),
      };
      setFilterOptions(options);
    }, [jobs]);
  
    const handleFilterChange = (filterType: string, value: any) => {
      setCurrentFilters((prevFilters) => ({
        ...prevFilters,
        [filterType]: value,
      }));
    };
  
    const applyFilters = () => {
      setFilters(currentFilters);
      onFilterChange(currentFilters);
    };
  
    return (
      <div className="space-y-4">
        {filterOptions.jobTypes.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Job Type</h3>
            {filterOptions.jobTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`job-type-${type}`}
                  checked={currentFilters.jobType.includes(type)}
                  onCheckedChange={(checked) => {
                    handleFilterChange(
                      "jobType",
                      checked
                        ? [...currentFilters.jobType, type]
                        : currentFilters.jobType.filter((t) => t !== type)
                    );
                  }}
                />
                <Label htmlFor={`job-type-${type}`}>{type}</Label>
              </div>
            ))}
          </div>
        )}
  
        {filterOptions.securityClearances.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Security Clearance</h3>
            <Select
              value={currentFilters.securityClearance[0] || ""}
              onValueChange={(value) =>
                handleFilterChange("securityClearance", [value])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select clearance" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.securityClearances.map((clearance) => (
                  <SelectItem key={clearance} value={clearance}>
                    {clearance}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
  
        {filterOptions.locationTypes.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Location Type</h3>
            {filterOptions.locationTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-type-${type}`}
                  checked={currentFilters.locationType.includes(type)}
                  onCheckedChange={(checked) => {
                    handleFilterChange(
                      "locationType",
                      checked
                        ? [...currentFilters.locationType, type]
                        : currentFilters.locationType.filter((t) => t !== type)
                    );
                  }}
                />
                <Label htmlFor={`location-type-${type}`}>{type}</Label>
              </div>
            ))}
          </div>
        )}
  
        {filterOptions.remoteFlexibility.includes(true) && (
          <div>
            <h3 className="font-semibold mb-2">Remote Flexibility</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote-flexibility"
                checked={currentFilters.remoteFlexibility === true}
                onCheckedChange={(checked) =>
                  handleFilterChange("remoteFlexibility", checked ? true : null)
                }
              />
              <Label htmlFor="remote-flexibility">Remote</Label>
            </div>
          </div>
        )}
  
        {filterOptions.compensationTypes.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Compensation Type</h3>
            <Select
              value={currentFilters.compensationType[0] || ""}
              onValueChange={(value) =>
                handleFilterChange("compensationType", [value])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.compensationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
  
        <div>
          <h3 className="font-semibold mb-2">Salary Range</h3>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={currentFilters.salaryMin}
              onChange={(e) => handleFilterChange("salaryMin", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={currentFilters.salaryMax}
              onChange={(e) => handleFilterChange("salaryMax", e.target.value)}
            />
          </div>
        </div>
  
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    );
  };

  export default JobFilters;
