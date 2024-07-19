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
import { MonthYearPicker } from "@/app/(auth)/dashboard/views/candidate/assets/date-picker-my";

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
  issuing_organization?: string;
  date_obtained?: string;
  expiration_date?: string;
  credential_id?: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
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
  phone?: string;
  email?: string;
  clearance_level?: string;
  location?: {
    city?: string;
    state?: string;
    zipcode?: string;
  };
  education?: Education[];
  work_experience?: WorkExperience[];
  professional_certifications?: Certification[]; // Change this line
  technical_skills?: string[];
  industry_experience?: string[];
}

type InputChangeEvent = 
    | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    | { target: { name: string; value: string | undefined } };

  type ArrayField = "education" | "work_experience" | "certifications";

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
    e: InputChangeEvent,
    index?: number,
    field?: ArrayField
  ) => {
    const { name, value } = e.target;

    if (index !== undefined && field !== undefined) {
      setFormData((prev) => {
        const arrayField = prev[field];
        const newArray = arrayField.map((item, i) => {
          if (i === index) {
            return { ...item, [name]: value ?? "" };
          }
          return item;
        });
        console.log(`Updated ${field} ${name} for index ${index}:`, value);
        return { ...prev, [field]: newArray };
      });
    } else {
      setFormData((prev) => {
        let newValue: string = typeof value === 'string' ? value : '';

        if (name === "zipcode") {
          newValue = newValue.replace(/\D/g, "").slice(0, 5);
        } else if (name === "name" || name === "city") {
          newValue = newValue.replace(/[^a-zA-Z0-9.\- ]/g, "");
        }

        return { ...prev, [name]: newValue };
      });
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
          : { name: "", issuing_organization: "", date_obtained: "", expiration_date: "", credential_id: "" },
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
        phone: data.phone || "",
        email: data.email || "",
        clearance_level: data.clearance_level || "",
        city: data.location?.city || "",
        state: data.location?.state || "",
        zipcode: data.location?.zipcode || "",
        education: data.education || [],
        work_experience: data.work_experience || [],
        certifications: data.professional_certifications || [],
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
          <div
            key={index}
            className={cn(
              "p-4 rounded-md mb-4",
              index % 2 === 0 ? "bg-gray-50" : "bg-white"
            )}
          >
            <div className="flex flex-col space-y-4">
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
                  <MonthYearPicker
                    value={edu.start_date}
                    onChange={(value) =>
                      handleInputChange(
                        { target: { name: "start_date", value } },
                        index,
                        "education"
                      )
                    }
                  />
                </div>
                <div className="flex-grow">
                  <Label className="text-sm" htmlFor={`end_date-${index}`}>
                    End Date{" "}
                    <span className="text-xs font-normal">(optional)</span>
                  </Label>
                  <MonthYearPicker
                    value={edu.end_date}
                    onChange={(value) =>
                      handleInputChange(
                        { target: { name: "end_date", value } },
                        index,
                        "education"
                      )
                    }
                    allowPresent={true}
                  />
                </div>
              </div>
            </div>
          </div>
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
          <div
            key={index}
            className={cn(
              "p-4 rounded-md mb-4",
              index % 2 === 0 ? "bg-gray-50" : "bg-white"
            )}
          >
            <div className="flex flex-col space-y-4">
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
                  <MonthYearPicker
                    value={exp.start_date}
                    onChange={(value) =>
                      handleInputChange(
                        { target: { name: "start_date", value } },
                        index,
                        "work_experience"
                      )
                    }
                  />
                </div>
                <div className="flex-grow">
                  <Label className="text-sm" htmlFor={`end_date-${index}`}>
                    End Date{" "}
                    <span className="text-xs font-normal">(optional)</span>
                  </Label>
                  <MonthYearPicker
                    value={exp.end_date}
                    onChange={(value) =>
                      handleInputChange(
                        { target: { name: "end_date", value } },
                        index,
                        "work_experience"
                      )
                    }
                    allowPresent={true}
                  />
                </div>
              </div>
            </div>
          </div>
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
    <div key={index} className="p-4 rounded-md mb-4 bg-gray-50">
      <div className="flex flex-col space-y-4">
        <div className="flex items-end space-x-4">
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
          <div className="flex-grow">
            <Label className="text-sm" htmlFor={`issuing-org-${index}`}>
              Issuing Organization
            </Label>
            <Input
              id={`issuing-org-${index}`}
              name="issuing_organization"
              value={cert.issuing_organization}
              onChange={(e) => handleInputChange(e, index, "certifications")}
            />
          </div>
        </div>
        <div className="flex items-end space-x-4">
          <div className="flex-grow">
            <Label className="text-sm" htmlFor={`date-obtained-${index}`}>
              Date Obtained
            </Label>
            <MonthYearPicker
              value={cert.date_obtained}
              onChange={(value) =>
                handleInputChange(
                  { target: { name: "date_obtained", value } },
                  index,
                  "certifications"
                )
              }
            />
          </div>
          <div className="flex-grow">
            <Label className="text-sm" htmlFor={`expiration-date-${index}`}>
              Expiration Date
            </Label>
            <MonthYearPicker
              value={cert.expiration_date}
              onChange={(value) =>
                handleInputChange(
                  { target: { name: "expiration_date", value } },
                  index,
                  "certifications"
                )
              }
              allowPresent={true}
            />
          </div>
        </div>
        <div className="flex items-end space-x-4">
          <div className="flex-grow">
            <Label className="text-sm" htmlFor={`credential-id-${index}`}>
              Credential ID
            </Label>
            <Input
              id={`credential-id-${index}`}
              name="credential_id"
              value={cert.credential_id}
              onChange={(e) => handleInputChange(e, index, "certifications")}
            />
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
      </div>
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
