import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone, User } from "lucide-react";

interface CandidateContactDialogProps {
  candidateInfo: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export const CandidateContactDialog: React.FC<CandidateContactDialogProps> = ({
  candidateInfo,
}) => {
  const formatPhoneNumber = (phoneNumber: string | null): string | null => {
    if (!phoneNumber || phoneNumber.length !== 10) return phoneNumber;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  };

  const renderInfoContainer = (
    icon: React.ReactNode,
    label: string,
    value: string | null
  ) => {
    if (!value) return null;
    const displayValue = label === "Phone" ? formatPhoneNumber(value) : value;
    return (
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
        {icon}
        <div>
          <span className="text-sm text-gray-500">{label}</span>
          <p className="font-semibold text-gray-800">{displayValue}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="flex-1" size="sm">
          Contact Info
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-gray-50 to-gray-100">
        <DialogHeader>
        <DialogTitle className="text-xl font-semibold">
            Candidate Contact Information
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          {renderInfoContainer(
            <User className="text-gray-600" size={24} />,
            "Name",
            candidateInfo.name
          )}
          {renderInfoContainer(
            <Mail className="text-gray-600" size={24} />,
            "Email",
            candidateInfo.email
          )}
          {renderInfoContainer(
            <Phone className="text-gray-600" size={24} />,
            "Phone",
            candidateInfo.phone
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
