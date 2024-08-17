import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import useStore from "@/app/state/useStore";
import PreviousSOWDropdown from "@/app/(auth)/dashboard/views/employer/jd-builder/lib/history/previous-sow";
import SOWUploader from "./lib/sow-uploader/upload";
import { Upload } from "lucide-react";
import { grabUserCompanyId } from "@/lib/dashboard/get-company-membership";
import { CompanyProfileAlert } from "@/app/(auth)/dashboard/views/employer/global/company-profile-alert";

export default function JDBuilderNewStart() {
  // Get state from the store
  const { jdBuilderWizard, setSelectedMenuItem } = useStore();
  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;

  const [showCompanyProfileAlert, setShowCompanyProfileAlert] = useState(false);
  const [hasCompanyId, setHasCompanyId] = useState(false);

  useEffect(() => {
    const getCompanyId = async () => {
      if (cuid) {
        const result = await grabUserCompanyId(cuid);
        if (result.success && result.companyId !== null) {
          setHasCompanyId(true);
        } else if (result.success && result.companyId === null) {
          setShowCompanyProfileAlert(true);
          setHasCompanyId(false);
        } else {
          console.error("Error fetching user company");
        }
      }
    };

    getCompanyId();
  }, [cuid]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 items-center overflow-y-auto justify-center min-h-[60vh]">
        {jdBuilderWizard.sowFile.length === 0 && (
          <div className="w-full bg-white rounded-lg">
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Upload className="w-4 h-4 text-gray-600" />
                </div>
                <h2 className="text-md font-semibold text-gray-800">
                  Upload SOW File
                </h2>
              </div>
              {!hasCompanyId && (
              <div className="border border-1 border-gray-200 rounded-md p-4 text-gray-800 text-sm">
                Complete your company profile to access the Job Description
                wizard
              </div>
              )}
              {hasCompanyId && <SOWUploader />}
            </div>
          </div>
        )}
        {hasCompanyId && (
          <div className="flex flex-row items-center gap-2">
            <PreviousSOWDropdown />
          </div>
        )}
      </div>
      {showCompanyProfileAlert && (
        <CompanyProfileAlert
          showCompanyProfileAlert={showCompanyProfileAlert}
          setShowCompanyProfileAlert={setShowCompanyProfileAlert}
          setSelectedMenuItem={setSelectedMenuItem}
        />
      )}
    </div>
  );
}
