import { Loader2 } from "lucide-react";

export interface ProcessingIndicatorProps {
  message: string;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  message,
}) => {
  return (
    <div className="flex items-center space-x-2 text-gray-500">
      <div className="relative">
        <Loader2 className="h-5 w-5 animate-spin" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-500 rounded-full" />
      </div>
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default ProcessingIndicator;
