import useStore from "@/app/state/useStore";
import { useEffect, useState } from "react";
import EditCompanyProfile from "@/app/(auth)/dashboard/views/company-profile/form";
import { CompanyProfileData } from "@/lib/company/validation";
import { v4 as uuidv4 } from "uuid";
import CompanyProfileRightPanel from "@/app/(auth)/dashboard/views/company-profile/right-panel";
import CompanyProfileImportance from "@/app/(auth)/dashboard/views/company-profile/right-panel-intro";

export default function EmployerDashboardCompanyProfile() {
  const { isExpanded, setExpanded, toggleExpansion } = useStore();

  // Reset expanded state when component unmounts
  useEffect(() => {
    return () => {
      setExpanded(false);
    };
  }, [setExpanded]);

  const [formData, setFormData] = useState<CompanyProfileData>({
    id: uuidv4(),
    name: "",
    industry: "",
    size: "",
    foundedYear: "",
    website: "",
    description: "",
    headquarters: {
      city: "",
      state: "",
      country: "",
    },
    socialMedia: {
      linkedin: "",
      twitter: "",
      facebook: "",
    },
    contactEmail: "",
    phoneNumber: "",
    admin: [],
    manager: [],
  });

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <EditCompanyProfile
                formData={formData}
                setFormData={setFormData}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className={`hidden md:flex flex-col gap-4 transition-all duration-700 ease-in-out ${
          isExpanded ? "lg:w-1/4" : "lg:w-1/2"
        }`}
      >
        <div className="min-h-[90vh] rounded-xl bg-muted/50 p-4 overflow-auto space-y-6">
          {formData.name && <CompanyProfileRightPanel formData={formData} />}
          <CompanyProfileImportance />
        </div>
      </div>
    </main>
  );
}
