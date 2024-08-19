import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Briefcase, Shield, MapPin, DollarSign, Wifi } from "lucide-react";
import { SerializableJobResult } from "./job-search";

interface JobFiltersProps {
  jobs: SerializableJobResult[];
  onFilterChange: (filters: any) => void;
  filterChoices: {
    jobType: string[];
    securityClearance: string[];
    locationType: string[];
    compensationType: string[];
    remoteFlexibility: boolean | null;
    salaryMin: string;
    salaryMax: string;
  };
  setFilterChoices: React.Dispatch<
    React.SetStateAction<{
      jobType: string[];
      securityClearance: string[];
      locationType: string[];
      compensationType: string[];
      remoteFlexibility: boolean | null;
      salaryMin: string;
      salaryMax: string;
    }>
  >;
}

const FilterSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <Card className="mb-4">
    <CardHeader className="flex flex-row items-center space-x-2 pb-2">
      {icon}
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const CheckboxGroup: React.FC<{
  items: string[];
  selectedItems: string[];
  onChange: (items: string[]) => void;
}> = ({ items, selectedItems, onChange }) => (
  <div className="space-y-2">
    {items.map((item) => (
      <div key={item} className="flex items-center space-x-2">
        <Checkbox
          id={`checkbox-${item}`}
          checked={selectedItems.includes(item)}
          onCheckedChange={(checked) => {
            const newItems = checked
              ? [...selectedItems, item]
              : selectedItems.filter((i) => i !== item);
            onChange(newItems);
          }}
        />
        <Label htmlFor={`checkbox-${item}`}>{item}</Label>
      </div>
    ))}
  </div>
);

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};


const JobFilters: React.FC<JobFiltersProps> = ({
  jobs,
  onFilterChange,
  filterChoices,
  setFilterChoices,
}) => {
  const handleFilterChange = (filterType: string, value: any) => {
    const newFilterChoices = {
      ...filterChoices,
      [filterType]: value,
    };
    setFilterChoices(newFilterChoices);
    onFilterChange(newFilterChoices);
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  
  const jobTypes = [...Array.from(new Set(jobs.map((job) => job.job_type)))].map(capitalizeFirstLetter);
  
  const securityClearances = [
    ...Array.from(new Set(jobs.map((job) => job.security_clearance))),
  ].map(capitalizeFirstLetter);
  
  const locationTypes = [
    ...Array.from(new Set(jobs.map((job) => job.location_type))),
  ].map(capitalizeFirstLetter);
  
  const compensationTypes = [
    ...Array.from(new Set(jobs.map((job) => job.compensation_type))),
  ].map(capitalizeFirstLetter);
  

  return (
    <div className="space-y-4">
      <FilterSection title="Job Type" icon={<Briefcase className="w-5 h-5" />}>
        <CheckboxGroup
          items={jobTypes}
          selectedItems={filterChoices.jobType}
          onChange={(items) => handleFilterChange("jobType", items)}
        />
      </FilterSection>

      <FilterSection
        title="Security Clearance"
        icon={<Shield className="w-5 h-5" />}
      >
        <CheckboxGroup
          items={securityClearances}
          selectedItems={filterChoices.securityClearance}
          onChange={(items) => handleFilterChange("securityClearance", items)}
        />
      </FilterSection>

      <FilterSection
        title="Location Type"
        icon={<MapPin className="w-5 h-5" />}
      >
        <CheckboxGroup
          items={locationTypes}
          selectedItems={filterChoices.locationType}
          onChange={(items) => handleFilterChange("locationType", items)}
        />
      </FilterSection>

      <FilterSection
        title="Compensation Type"
        icon={<DollarSign className="w-5 h-5" />}
      >
        <CheckboxGroup
          items={compensationTypes}
          selectedItems={filterChoices.compensationType}
          onChange={(items) => handleFilterChange("compensationType", items)}
        />
      </FilterSection>

      <FilterSection
        title="Remote Flexibility"
        icon={<Wifi className="w-5 h-5" />}
      >
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote-flexibility"
            checked={filterChoices.remoteFlexibility === true}
            onCheckedChange={(checked) => {
              handleFilterChange("remoteFlexibility", checked ? true : null);
            }}
          />
          <Label htmlFor="remote-flexibility">Remote</Label>
        </div>
      </FilterSection>

      <FilterSection
        title="Salary Range"
        icon={<DollarSign className="w-5 h-5" />}
      >
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Min"
            value={filterChoices.salaryMin}
            onChange={(e) => handleFilterChange("salaryMin", e.target.value)}
            className="w-24"
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filterChoices.salaryMax}
            onChange={(e) => handleFilterChange("salaryMax", e.target.value)}
            className="w-24"
          />
        </div>
      </FilterSection>
    </div>
  );
};

export default JobFilters;
