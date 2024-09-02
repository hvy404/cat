import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, ThumbsUp } from "lucide-react";

interface ResumeDownloadDialogProps {
  onDownload: (sendEmail: boolean) => void;
}


const ResumeDownloadDialog: React.FC<ResumeDownloadDialogProps> = ({
  onDownload,
}) => {
  const [notifyCandidate, setNotifyCandidate] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          View Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-6">
        <DialogHeader>
        <DialogTitle className="text-xl font-semibold">
            Download Resume
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Notifying candidates when you view their resume can significantly
              improve your recruitment experience:
            </p>
            <div className="grid grid-cols-3 gap-6 mt-4">
              {[
                { icon: User, text: "Warm Introduction" },
                { icon: Mail, text: "Increased Engagement" },
                { icon: ThumbsUp, text: "Improved Response Rates" },
              ].map(({ icon: Icon, text }, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="bg-blue-50 p-3 rounded-full mb-3">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
            <Checkbox
              id="notify-candidate"
              checked={notifyCandidate}
              onCheckedChange={(checked) =>
                setNotifyCandidate(checked as boolean)
              }
            />
            <label
              htmlFor="notify-candidate"
              className="text-sm font-medium text-gray-700 leading-tight"
            >
              Notify candidate of resume view
            </label>
          </div>
        </div>
        <div className="mt-8">
          <Button
             onClick={() => {
              onDownload(notifyCandidate);
            }}
            className="w-full py-2 text-sm font-medium"
          >
            Download Resume
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeDownloadDialog;