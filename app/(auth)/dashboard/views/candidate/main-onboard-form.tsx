import { useState } from "react";
import { cn } from "@/lib/utils";
import useStore from "@/app/state/useStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FormattedPhoneInput from "@/app/(auth)/dashboard/views/candidate/helpers/formatPhoneInput";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Check, ChevronsUpDown } from "lucide-react";
import { fetchCandidatePreliminaryData } from "@/lib/dashboard/candidate/onboard-load-data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { states } from "@/lib/data/form-value-states";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import CandidateOnboardingDialog from "@/app/(auth)/dashboard/views/candidate/onboarding-dialog";
import { handleUpload } from "@/lib/dashboard/candidate/onboard-confirm-profile";
import { validateForm } from "@/app/(auth)/dashboard/views/candidate/helpers/form-validation";

interface Education {
  institution: string;
  degree: string;
  start_date?: string;
  end_date?: string;
}

interface WorkExperience {
  organization: string;
  job_title: string;
  responsibilities: string;
  start_date?: string;
  end_date?: string;
}

interface Certification {
  name: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  //title: string;
  clearance_level: string;
  city: string;
  state: string;
  zipcode: string;
  education: Education[];
  work_experience: WorkExperience[];
  certifications: Certification[];
}

interface CandidateData {
  name?: string;
  title?: string;
  company?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  clearance_level?: string;
  location?: {
    city?: string;
    state?: string;
    zipcode?: string;
  };
  education?: Array<{
    institution: string;
    degree: string;
    start_date?: string;
    end_date?: string;
  }>;
  work_experience?: Array<{
    organization: string;
    job_title: string;
    responsibilities: string;
    start_date?: string;
    end_date?: string;
  }>;
  professional_certifications?: string[];
  technical_skills?: string[];
  industry_experience?: string[];
}

export function CandidateOnboardingForm() {
  const user = useStore((state) => state.user?.uuid);
  const dashboardStep = useStore((state) => state.candidateDashboard.step);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    //title: "",
    clearance_level: "",
    city: "",
    state: "",
    zipcode: "",
    education: [],
    work_experience: [],
    certifications: [],
  });
  const [originalData, setOriginalData] = useState<CandidateData | null>(null); // State for original data
  const [open, setOpen] = useState(false); // State for State dropdown
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Form validation errors
  const [onboardingDialogOpen, setOnboardingDialogOpen] = useState(true); // State for onboarding dialog
  const [formLoaded, setFormLoaded] = useState(false); // State for form data loaded

  const renderError = (key: string) => {
    if (errors[key]) {
      return <span className="text-red-700 text-sm mt-1">{errors[key]}</span>;
    }
    return null;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number,
    field?: keyof Pick<
      FormData,
      "education" | "work_experience" | "certifications"
    >
  ) => {
    const { name, value } = e.target;
    if (index !== undefined && field !== undefined) {
      setFormData((prev) => {
        const arrayField = prev[field] as Array<any>;
        const newArray = arrayField.map((item, i) =>
          i === index ? { ...item, [name]: value } : item
        );
        return { ...prev, [field]: newArray };
      });
    } else {
      let newValue = value;
      if (name === "zipcode") {
        newValue = value.replace(/\D/g, "").slice(0, 5);
      } else if (name === "name" || name === "city") {
        newValue = value.replace(/[^a-zA-Z0-9.\- ]/g, "");
      }
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  // Dropdown for State
  const handleStateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, state: value }));
    setOpen(false);
  };

  // Dropdown for Clearance Level
  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayAdd = (
    field: keyof Pick<
      FormData,
      "education" | "work_experience" | "certifications"
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === "education"
          ? { institution: "", degree: "", start_date: "", end_date: "" }
          : field === "work_experience"
          ? {
              organization: "",
              job_title: "",
              responsibilities: "",
              start_date: "",
              end_date: "",
            }
          : { name: "" },
      ],
    }));
  };

  const handleArrayRemove = (
    field: keyof Pick<
      FormData,
      "education" | "work_experience" | "certifications"
    >,
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handlePopulate = async () => {
    if (!user) return;
    const result = await fetchCandidatePreliminaryData(user);
    console.log("Result from fetchCandidatePreliminaryData:", result);
    if (result.success && result.data && result.data.length > 0) {
      const data = result.data[0] as CandidateData;
      setOriginalData(data); // Save original data
      setFormData({
        name: data.name || "",
        phone: data.contact?.phone || "",
        email: data.contact?.email || "",
        //title: data.title || "",
        clearance_level: data.clearance_level || "",
        city: data.location?.city || "",
        state: data.location?.state || "",
        zipcode: data.location?.zipcode || "",
        education: data.education || [],
        work_experience: data.work_experience || [],
        certifications:
          data.professional_certifications?.map((cert) => ({ name: cert })) ||
          [],
      });
      setFormLoaded(true);
    }
  };

  const handleFormSubmit = async () => {
    if (!user) {
      toast.error("Unable to save profile. Please try again later.");
      return;
    }
  
    const result = await handleUpload(formData, originalData, user);
    if (result.success) {
      toast.success(result.message);
    } else {
      setErrors(result.errors || {});
      toast.error(result.message);
    }
  };
  

  // if formLoaded is false return <div>Loading...</div>

  if (!formLoaded) {
    return (
      <div className="flex flex-col min-h-[70vh] items-center justify-center">
        <div className="font-merriweather text-2xl text-gray-700 flex items-center">
          Please wait
          <div className="dots ml-2 flex">
            <span className="animate-wave">.</span>
            <span className="animate-wave">.</span>
            <span className="animate-wave">.</span>
          </div>
        </div>
        <CandidateOnboardingDialog
          onboardingDialogOpen={onboardingDialogOpen}
          onboardingDialogOpenClose={() => setOnboardingDialogOpen(false)}
          beginStartOnboarding={() => handlePopulate()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Personal Information */}
      <div className="rounded-lg border hover:border-2 hover:border-slate-800 p-4">
        <h2 className="text-md font-semibold mb-4 text-gray-700">
          Personal Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm" htmlFor="name">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {renderError("name")}
          </div>
          <div>
            <Label className="text-sm" htmlFor="phone">
              Phone <span className="text-xs font-normal">(optional)</span>
            </Label>
            <FormattedPhoneInput
              value={formData.phone}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, phone: value }))
              }
            />
          </div>
          <div>
            <Label className="text-sm" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {renderError("email")}
          </div>
          {/*  <div>
            <Label className="text-sm" htmlFor="title">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div> */}
          <div>
            <Label className="text-sm" htmlFor="clearance_level">
              Clearance Level{" "}
              <span className="text-xs font-normal">(optional)</span>
            </Label>
            <Select
              name="clearance_level"
              value={formData.clearance_level}
              onValueChange={(value) =>
                handleSelectChange(value, "clearance_level")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select clearance level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Unclassified">None</SelectItem>
                  <SelectItem value="Public Trust">Public Trust</SelectItem>
                  <SelectItem value="Secret">Secret</SelectItem>
                  <SelectItem value="Top Secret">Top Secret</SelectItem>
                  <SelectItem value="Top Secret/SCI">Top Secret/SCI</SelectItem>
                  <SelectItem value="Q Clearance">Q Clearance</SelectItem>
                  <SelectItem value="L Clearance">L Clearance</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="rounded-lg border hover:border-2 hover:border-slate-800 p-4">
        <h2 className="text-md font-semibold mb-4 text-gray-700">
          Address Information
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-sm" htmlFor="city">
              City
            </Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
            {renderError("city")}
          </div>
          <div>
            <Label className="text-sm" htmlFor="state">
              State
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {formData.state
                    ? states.find((state) => state.value === formData.state)
                        ?.label
                    : "Select state..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search state..." />
                  <CommandList>
                    <CommandEmpty>No state found.</CommandEmpty>
                    <CommandGroup>
                      {states.map((state) => (
                        <CommandItem
                          key={state.value}
                          value={state.value}
                          onSelect={handleStateChange}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.state === state.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {state.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {renderError("state")}
          </div>
          <div>
            <Label className="text-sm" htmlFor="zipcode">
              Zip Code
            </Label>
            <Input
              id="zipcode"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleInputChange}
            />
            {renderError("zipcode")}
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="rounded-lg border hover:border-2 hover:border-slate-800 p-4">
        <h2 className="text-md font-semibold mb-4 text-gray-700">
          Education <span className="text-xs font-normal">(optional)</span>
        </h2>
        {formData.education.map((edu, index) => (
          <>
            {index > 0 && (
              <hr
                key={`hr-${index}`}
                className="my-6 border-t border-dashed border-gray-400"
              />
            )}
            <div key={index} className="flex flex-col space-y-4 mb-4">
              <div className="flex items-end space-x-4">
                <div className="flex-grow">
                  <Label className="text-sm" htmlFor={`institution-${index}`}>
                    Institution
                  </Label>
                  <Input
                    id={`institution-${index}`}
                    name="institution"
                    value={edu.institution}
                    onChange={(e) => handleInputChange(e, index, "education")}
                  />
                  {renderError(`education_${index}_institution`)}
                </div>
                <div className="flex-grow">
                  <Label className="text-sm" htmlFor={`degree-${index}`}>
                    Degree
                  </Label>
                  <Input
                    id={`degree-${index}`}
                    name="degree"
                    value={edu.degree}
                    onChange={(e) => handleInputChange(e, index, "education")}
                  />
                  {renderError(`education_${index}_degree`)}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={() => handleArrayRemove("education", index)}
                      className="h-10 w-10 p-0 flex-shrink-0 mb-[2px]"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white border-black">
                    <p>Remove {edu.institution}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-end space-x-4">
                <div className="flex-grow">
                  <Label className="text-sm" htmlFor={`start_date-${index}`}>
                    Start Date{" "}
                    <span className="text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id={`start_date-${index}`}
                    name="start_date"
                    type="text"
                    value={edu.start_date}
                    onChange={(e) => handleInputChange(e, index, "education")}
                    placeholder="e.g., Sep 2010 or 2010-09-01"
                  />
                </div>
                <div className="flex-grow">
                  <Label className="text-sm" htmlFor={`end_date-${index}`}>
                    End Date{" "}
                    <span className="text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id={`end_date-${index}`}
                    name="end_date"
                    type="text"
                    value={edu.end_date}
                    onChange={(e) => handleInputChange(e, index, "education")}
                    placeholder="e.g., May 2014 or 2014-05-01"
                  />
                </div>
              </div>
            </div>
          </>
        ))}
        <Button
          type="button"
          onClick={() => handleArrayAdd("education")}
          className="mt-2"
        >
          <Plus className="h-4 w-4" /> Add Education
        </Button>
      </div>

      {/* Work Experience */}
      <div className="rounded-lg border hover:border-2 hover:border-slate-800 p-4">
        <h2 className="text-md font-semibold mb-4 text-gray-700">
          Work Experience
        </h2>
        {formData.work_experience.map((exp, index) => (
          <>
            {index > 0 && (
              <hr
                key={`hr-${index}`}
                className="my-6 border-t border-dashed border-gray-400"
              />
            )}
            <div key={index} className="flex flex-col space-y-4 mb-6">
              <div className="flex items-end space-x-4">
                <div className="flex-grow">
                  <Label className="text-sm" htmlFor={`organization-${index}`}>
                    Organization
                  </Label>
                  <Input
                    id={`organization-${index}`}
                    name="organization"
                    value={exp.organization}
                    onChange={(e) =>
                      handleInputChange(e, index, "work_experience")
                    }
                  />
                  {renderError(`work_${index}_organization`)}
                </div>
                <div className="flex-grow">
                  <Label className="text-sm" htmlFor={`job_title-${index}`}>
                    Job Title
                  </Label>
                  <Input
                    id={`job_title-${index}`}
                    name="job_title"
                    value={exp.job_title}
                    onChange={(e) =>
                      handleInputChange(e, index, "work_experience")
                    }
                  />
                  {renderError(`work_${index}_job_title`)}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={() =>
                        handleArrayRemove("work_experience", index)
                      }
                      className="h-10 w-10 p-0 flex-shrink-0 mb-[2px]"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white border-black">
                    <p>Remove {exp.organization}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div>
                <Label
                  className="text-sm"
                  htmlFor={`responsibilities-${index}`}
                >
                  Responsibilities
                </Label>
                <Textarea
                  id={`responsibilities-${index}`}
                  name="responsibilities"
                  value={exp.responsibilities}
                  onChange={(e) =>
                    handleInputChange(e, index, "work_experience")
                  }
                  className="h-24"
                />
              </div>
              <div className="flex items-end space-x-4">
                <div className="flex-grow">
                  <Label className="text-sm" htmlFor={`start_date-${index}`}>
                    Start Date{" "}
                    <span className="text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id={`start_date-${index}`}
                    name="start_date"
                    type="text"
                    value={exp.start_date}
                    onChange={(e) =>
                      handleInputChange(e, index, "work_experience")
                    }
                    placeholder="e.g., May 2018 or 05-01-2018"
                  />
                </div>
                <div className="flex-grow">
                  <Label className="text-sm" htmlFor={`end_date-${index}`}>
                    End Date{" "}
                    <span className="text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id={`end_date-${index}`}
                    name="end_date"
                    type="text"
                    value={exp.end_date}
                    onChange={(e) =>
                      handleInputChange(e, index, "work_experience")
                    }
                    placeholder="e.g., Apr 2024 or 07-04-2024"
                  />
                </div>
              </div>
            </div>
          </>
        ))}
        <Button
          type="button"
          onClick={() => handleArrayAdd("work_experience")}
          className="mt-2"
        >
          <Plus className="h-4 w-4" /> Add Work Experience
        </Button>
      </div>

      {/* Certifications */}
      <div className="rounded-lg border hover:border-2 hover:border-slate-800 p-4">
        <h2 className="text-md font-semibold mb-4 text-gray-700">
          Certifications <span className="text-xs font-normal">(optional)</span>
        </h2>
        {formData.certifications.map((cert, index) => (
          <div key={index} className="flex items-end space-x-4 mb-4">
            <div className="flex-grow">
              <Label className="text-sm" htmlFor={`certification-${index}`}>
                Certification Name
              </Label>
              <Input
                id={`certification-${index}`}
                name="name"
                value={cert.name}
                onChange={(e) => handleInputChange(e, index, "certifications")}
              />
              {renderError(`certification_${index}_name`)}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={() => handleArrayRemove("certifications", index)}
                  className="h-10 w-10 p-0 flex-shrink-0 mb-[2px]"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-black">
                <p>Remove {cert.name}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => handleArrayAdd("certifications")}
          className="mt-2"
        >
          <Plus className="h-4 w-4" /> Add Certification
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant={"link"} onClick={handlePopulate}>
          Reset
        </Button>
        <Button onClick={handleFormSubmit}>Save Profile</Button>
      </div>
    </div>
  );
}
