import useStore from "@/app/state/useStore";
import PreviousSOWDropdown from "@/app/(auth)/dashboard/views/employer/jd-builder/lib/history/previous-sow";
import SOWUploader from "./lib/sow-uploader/upload";
import { Upload } from "lucide-react";

export default function JDBuilderNewStart() {
  // Get state from the store
  const { jdBuilderWizard, setJDBuilderWizard } = useStore();

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
              <SOWUploader />
            </div>
          </div>
        )}
        <div className="flex flex-row items-center gap-2">
          
          <PreviousSOWDropdown />
        </div>
      </div>
    </div>
  );
}
