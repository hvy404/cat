import useStore from "@/app/state/useStore";
import { useEffect, useState } from "react";
import EditCompanyProfile from "@/app/(auth)/dashboard/views/company-profile/form";
import { CompanyProfileData } from "@/lib/company/validation";
import { v4 as uuidv4 } from "uuid";
import CompanyProfileRightPanel from "@/app/(auth)/dashboard/views/company-profile/right-panel";
import CompanyProfileImportance from "@/app/(auth)/dashboard/views/company-profile/right-panel-intro";
import EmployerCompanyCheck from "@/app/(auth)/dashboard/views/company-profile/check-membership";
import { checkUserCompany } from "@/lib/company/check-company-membership";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getCompanyNode } from "@/lib/company/mutation";

// Enum for company states
enum CompanyState {
  LOADING,
  HAS_COMPANY,
  CREATING_COMPANY,
  JOINING_COMPANY,
  INITIAL,
}

export default function EmployerDashboardCompanyProfile() {
  const defaultFormData: CompanyProfileData = {
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
  };

  const { isExpanded, setExpanded, user } = useStore();
  const [companyState, setCompanyState] = useState<CompanyState>(
    CompanyState.LOADING
  );
  const [formData, setFormData] = useState<CompanyProfileData>(defaultFormData);

  useEffect(() => {
    const checkCompany = async () => {
      if (user?.uuid) {
        try {
          const result = await checkUserCompany({ employerId: user.uuid });
          if (result.hasCompany && result.companyId) {
            setCompanyState(CompanyState.HAS_COMPANY);
            try {
              const companyNode = await getCompanyNode(result.companyId);
              console.log("Company Node:", companyNode);
              if (companyNode) {
                setFormData({
                  ...defaultFormData,
                  ...companyNode,
                });
              }
            } catch (error) {
              console.error("Error retrieving Company node:", error);
            }
          } else {
            setCompanyState(CompanyState.INITIAL);
          }
        } catch (error) {
          console.error("Error checking company:", error);
          setCompanyState(CompanyState.INITIAL);
        }
      } else {
        setCompanyState(CompanyState.INITIAL);
      }
    };
  
    checkCompany();
  
    return () => {
      setExpanded(false);
    };
  }, [user?.uuid, setExpanded]);


  // Early return if user is not logged in
  if (!user?.uuid) {
    return null;
  }

  const handleCreateCompany = () =>
    setCompanyState(CompanyState.CREATING_COMPANY);
  const handleJoinCompany = () => setCompanyState(CompanyState.JOINING_COMPANY);
  const handleBack = () => {
    setCompanyState(CompanyState.INITIAL);
    setFormData(defaultFormData);
  };

  const renderContent = () => {
    const backButton = (
      <Button variant="outline" onClick={handleBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
    );

    switch (companyState) {
      case CompanyState.LOADING:
        return <div>Loading...</div>;
      case CompanyState.HAS_COMPANY:
        return (
          <EditCompanyProfile
            formData={formData}
            setFormData={setFormData}
            createNew={false}
            isInitialOwner={false}
            employerId={user.uuid}
          />
        );
      case CompanyState.CREATING_COMPANY:
        return (
          <>
            {backButton}
            <EditCompanyProfile
              formData={formData}
              setFormData={setFormData}
              createNew={true}
              isInitialOwner={true}
              employerId={user.uuid}
            />
          </>
        );
      case CompanyState.JOINING_COMPANY:
        return (
          <>
            {backButton}
            <div>Request access</div>
          </>
        );
      case CompanyState.INITIAL:
      default:
        return (
          <EmployerCompanyCheck
            setIsCreatingCompany={handleCreateCompany}
            setIsJoiningCompany={handleJoinCompany}
          />
        );
    }
  };

  return (
    <main className="flex flex-1 gap-4 p-4 max-h-screen">
      <div
        className={`flex flex-col gap-4 transition-all duration-700 ease-in-out w-full md:w-full ${
          isExpanded ? "lg:w-3/4" : "lg:w-1/2"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border p-4">
            <div className="flex flex-col items-start gap-4">
              {renderContent()}
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