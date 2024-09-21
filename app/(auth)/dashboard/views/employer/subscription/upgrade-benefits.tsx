import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionDialog({ isOpen, onClose }: SubscriptionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade to Premium</DialogTitle>
          <DialogDescription>
            Unlock the full potential of our platform with a Premium subscription.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Premium benefits:</h4>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <Check className="text-green-500 mr-2" size={16} />
              Unlimited AI-powered talent matches
            </li>
            <li className="flex items-center text-sm">
              <Check className="text-green-500 mr-2" size={16} />
              Advanced analytics and reporting
            </li>
            <li className="flex items-center text-sm">
              <Check className="text-green-500 mr-2" size={16} />
              Priority customer support
            </li>
            <li className="flex items-center text-sm">
              <Check className="text-green-500 mr-2" size={16} />
              Custom branding options
            </li>
          </ul>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={onClose}
          >
            Upgrade Now <ArrowRight className="ml-2" size={16} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}