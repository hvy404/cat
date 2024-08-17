import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Building, FileText, UserCheck } from "lucide-react";

interface CompanyProfileAlertProps {
  showCompanyProfileAlert: boolean;
  setShowCompanyProfileAlert: (show: boolean) => void;
  setSelectedMenuItem: (menuItem: string) => void;
}

export const CompanyProfileAlert: React.FC<CompanyProfileAlertProps> = ({
  showCompanyProfileAlert,
  setShowCompanyProfileAlert,
  setSelectedMenuItem,
}) => {
  return (
    <AlertDialog
      open={showCompanyProfileAlert}
      onOpenChange={setShowCompanyProfileAlert}
    >
      <AlertDialogContent className="max-w-md bg-white rounded-lg shadow-xl border border-gray-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold text-gray-900">
            Complete Your Company Profile
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-4 text-gray-700">
            <p className="mb-4">
              To optimize your job postings and attract qualified candidates, we recommend completing your company profile. This information helps us tailor our matching process to your organization's needs.
            </p>
            <div className="space-y-3 mb-4">
              <p className="flex items-center text-gray-800">
                <Building className="w-5 h-5 mr-3 text-gray-500" />
                <span>Company overview</span>
              </p>
              <p className="flex items-center text-gray-800">
                <FileText className="w-5 h-5 mr-3 text-gray-500" />
                <span>Detailed description</span>
              </p>
              <p className="flex items-center text-gray-800">
                <UserCheck className="w-5 h-5 mr-3 text-gray-500" />
                <span>Industry and location details</span>
              </p>
            </div>
            <p className="text-sm text-gray-600">
              This process takes just a few minutes and significantly enhances the quality of your job listings.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-end space-x-3 mt-6">
          <AlertDialogCancel className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 border border-gray-300 rounded-md">
            Not Now
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => setSelectedMenuItem("company-profile")}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Complete Profile
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CompanyProfileAlert;