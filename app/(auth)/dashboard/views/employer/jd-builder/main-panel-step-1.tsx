import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import useStore from "@/app/state/useStore";
import PreviousSOWDropdown from "@/app/(auth)/dashboard/views/employer/jd-builder/lib/history/previous-sow";
import SOWUploader from "./lib/sow-uploader/upload";
import { Upload, AlertCircle, FileText } from "lucide-react";
import { grabUserCompanyId } from "@/lib/dashboard/get-company-membership";
import { CompanyProfileAlert } from "@/app/(auth)/dashboard/views/employer/global/company-profile-alert";
import { motion } from "framer-motion";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function JDBuilderNewStart() {
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
    <motion.div
      className="w-full space-y-8 bg-white p-6"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Upload SOW File</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Upload your Statement of Work (SOW) file to begin creating your job description.
        </p>
      </div>

      {!hasCompanyId ? (
        <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            Complete your company profile to access the Job Description wizard
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <SOWUploader />
        </div>
      )}

      {hasCompanyId && (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex-grow h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400 px-2 uppercase tracking-wider">or</span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Select from your previous SOW files</p>
            <PreviousSOWDropdown />
          </div>
        </div>
      )}

      {showCompanyProfileAlert && (
        <CompanyProfileAlert
          showCompanyProfileAlert={showCompanyProfileAlert}
          setShowCompanyProfileAlert={setShowCompanyProfileAlert}
          setSelectedMenuItem={setSelectedMenuItem}
        />
      )}
    </motion.div>
  );
}