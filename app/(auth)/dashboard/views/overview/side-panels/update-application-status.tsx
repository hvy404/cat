import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, FileText, User, Calendar, ThumbsUp, X, LucideIcon } from 'lucide-react';

type StatusKey = 'submitted' | 'reviewed' | 'interview' | 'accepted' | 'rejected';

interface StatusConfig {
  key: StatusKey;
  label: string;
  icon: LucideIcon;
  color: string;
}

const statusConfig: StatusConfig[] = [
  { key: 'submitted', label: 'Submitted', icon: FileText, color: 'text-blue-500' },
  { key: 'reviewed', label: 'Reviewed', icon: User, color: 'text-yellow-500' },
  { key: 'interview', label: 'Interview', icon: Calendar, color: 'text-purple-500' },
  { key: 'accepted', label: 'Accepted', icon: ThumbsUp, color: 'text-green-500' },
  { key: 'rejected', label: 'Rejected', icon: X, color: 'text-red-500' },
];

interface UpdateApplicationStatusProps {
  currentStatus: StatusKey;
  onStatusChange: (newStatus: StatusKey) => void;
}

const UpdateApplicationStatus: React.FC<UpdateApplicationStatusProps> = ({ currentStatus, onStatusChange }) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusConfig | null>(null);

  const handleStatusSelect = (status: StatusConfig) => {
    if (status.key !== currentStatus) {
      setSelectedStatus(status);
      setIsAlertOpen(true);
    }
  };

  const handleConfirm = () => {
    if (selectedStatus) {
      onStatusChange(selectedStatus.key);
      setIsAlertOpen(false);
    }
  };

  const currentStatusConfig = statusConfig.find(status => status.key === currentStatus) || statusConfig[0];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`w-44 justify-between ${currentStatusConfig.color}`}
          >
            <span className="flex items-center">
              {React.createElement(currentStatusConfig.icon, { className: "mr-2 h-4 w-4" })}
              {currentStatusConfig.label}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          {statusConfig.map((status) => (
            <DropdownMenuItem
              key={status.key}
              onSelect={() => handleStatusSelect(status)}
              className={`flex items-center justify-between ${
                status.key === currentStatus ? 'bg-gray-100' : ''
              }`}
            >
              <span className="flex items-center">
                {React.createElement(status.icon, { className: `mr-2 h-4 w-4 ${status.color}` })}
                {status.label}
              </span>
              {status.key === currentStatus && (
                <span className="text-sm font-medium text-gray-500">Current</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the application status from {currentStatusConfig.label} to {selectedStatus?.label}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UpdateApplicationStatus;