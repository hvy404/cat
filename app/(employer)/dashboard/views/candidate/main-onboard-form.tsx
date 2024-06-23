import React, { useState } from "react";
import useStore from "@/app/state/useStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { fetchCandidatePreliminaryData } from "@/lib/dashboard/candidate/onboard-load-data";

interface Education {
  institution: string;
  degree: string;
}

interface WorkExperience {
  organization: string;
  job_title: string;
  responsibilities: string;
}

interface Certification {
  name: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  title: string;
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
  contact?: {
    phone?: string;
    email?: string;
  };
  title?: string;
  clearance_level?: string;
  location?: {
    city?: string;
    state?: string;
    zipcode?: string;
  };
  education?: Education[];
  work_experience?: WorkExperience[];
  professional_certifications?: string[];
}

export function CandidateOnboardingForm() {
  const { user } = useStore();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    title: "",
    clearance_level: "",
    city: "",
    state: "",
    zipcode: "",
    education: [],
    work_experience: [],
    certifications: [],
  });

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
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
          ? { institution: "", degree: "" }
          : field === "work_experience"
          ? { organization: "", job_title: "", responsibilities: "" }
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
    if (!user?.uuid) return;
    const result = await fetchCandidatePreliminaryData(user.uuid);
    if (result.success && result.data && result.data.length > 0) {
      const data = result.data[0] as CandidateData;
      setFormData({
        name: data.name || "",
        phone: data.contact?.phone || "",
        email: data.contact?.email || "",
        title: data.title || "",
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
    }
  };

  const handleUpload = () => {
    console.log("Form data to upload:", formData);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Personal Information */}
      <div className="rounded-lg border p-4">
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
          </div>
          <div>
            <Label className="text-sm" htmlFor="phone">
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
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
          </div>
          <div>
            <Label className="text-sm" htmlFor="title">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label className="text-sm" htmlFor="clearance_level">
              Clearance Level
            </Label>
            <Input
              id="clearance_level"
              name="clearance_level"
              value={formData.clearance_level}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="rounded-lg border p-4">
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
          </div>
          <div>
            <Label className="text-sm" htmlFor="state">
              State
            </Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
            />
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
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="rounded-lg border p-4">
        <h2 className="text-md font-semibold mb-4 text-gray-700">Education</h2>
        {formData.education.map((edu, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm" htmlFor={`institution-${index}`}>
                Institution
              </Label>
              <Input
                id={`institution-${index}`}
                name="institution"
                value={edu.institution}
                onChange={(e) => handleInputChange(e, index, "education")}
              />
            </div>
            <div>
              <Label className="text-sm" htmlFor={`degree-${index}`}>
                Degree
              </Label>
              <Input
                id={`degree-${index}`}
                name="degree"
                value={edu.degree}
                onChange={(e) => handleInputChange(e, index, "education")}
              />
            </div>
            <Button
              type="button"
              onClick={() => handleArrayRemove("education", index)}
              className="mt-2"
            >
              <Minus className="h-4 w-4" />
            </Button>
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
      <div className="rounded-lg border p-4">
        <h2 className="text-md font-semibold mb-4 text-gray-700">
          Work Experience
        </h2>
        {formData.work_experience.map((exp, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm" htmlFor={`organization-${index}`}>
                Organization
              </Label>
              <Input
                id={`organization-${index}`}
                name="organization"
                value={exp.organization}
                onChange={(e) => handleInputChange(e, index, "work_experience")}
              />
            </div>
            <div>
              <Label className="text-sm" htmlFor={`job_title-${index}`}>
                Job Title
              </Label>
              <Input
                id={`job_title-${index}`}
                name="job_title"
                value={exp.job_title}
                onChange={(e) => handleInputChange(e, index, "work_experience")}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-sm" htmlFor={`responsibilities-${index}`}>
                Responsibilities
              </Label>
              <Textarea
                id={`responsibilities-${index}`}
                name="responsibilities"
                value={exp.responsibilities}
                onChange={(e) => handleInputChange(e, index, "work_experience")}
              />
            </div>
            <Button
              type="button"
              onClick={() => handleArrayRemove("work_experience", index)}
              className="mt-2"
            >
              <Minus className="h-4 w-4" />
            </Button>
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
      <div className="rounded-lg border p-4">
        <h2 className="text-md font-semibold mb-4 text-gray-700">
          Certifications
        </h2>
        {formData.certifications.map((cert, index) => (
          <div key={index} className="flex items-center gap-4 mb-4">
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
            </div>
            <Button
              type="button"
              onClick={() => handleArrayRemove("certifications", index)}
              className="mt-6"
            >
              <Minus className="h-4 w-4" />
            </Button>
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
        <Button onClick={handlePopulate}>Populate</Button>
        <Button onClick={handleUpload}>Upload</Button>
      </div>
    </div>
  );
}
