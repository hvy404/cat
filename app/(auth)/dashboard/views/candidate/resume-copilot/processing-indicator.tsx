import React from "react";
import { Loader2 } from "lucide-react";

export interface ProcessingIndicatorProps {
  message: string;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  message,
}) => {
  return (
    <div className="w-full mb-6 mt-4">
      <div className="inline-flex bg-gradient-to-br from-blue-500 to-blue-600 rounded-md py-2 px-4 shadow-md items-center space-x-3">
        <div className="relative flex-shrink-0">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full" />
        </div>
        <p className="text-white text-sm font-medium truncate">{message}</p>
      </div>
    </div>
  );
};

export default ProcessingIndicator;