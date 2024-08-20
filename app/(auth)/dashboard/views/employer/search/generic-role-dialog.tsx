import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap } from "lucide-react";

interface GenericRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role?: string;
  qualifier?: string;
}

export const GenericRoleDialog: React.FC<GenericRoleDialogProps> = ({
  isOpen,
  onClose,
  role = "engineer",
  qualifier = "network",
}) => {
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTypedText("");
      let i = 0;
      const typing = setInterval(() => {
        setTypedText(qualifier.slice(0, i));
        i++;
        if (i > qualifier.length) clearInterval(typing);
      }, 150);
      return () => clearInterval(typing);
    }
  }, [isOpen, qualifier]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-700 flex items-center">
            <Search className="w-6 h-6 mr-2 text-indigo-500" />
            Refine Your Search
          </DialogTitle>
          <DialogDescription className="text-base text-gray-700 mt-2">
            Your search term "{role}" is too broad. Let's narrow it down to find
            candidates who precisely match your job requirements.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-lg shadow-inner">
            <p className="text-base font-semibold text-gray-800 mb-2">
              Example:
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2 text-xl font-bold"
            >
              <span className="text-indigo-600">{typedText}</span>
              <span className="text-gray-800">{role}</span>
            </motion.div>
          </div>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-indigo-100 p-4 rounded-lg"
            >
              <h3 className="text-base font-semibold text-indigo-800 flex items-center mb-2">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                Pro Tip
              </h3>
              <p className="text-sm text-gray-700">
                Add specific qualifiers like '{qualifier} {role}' to find more
                relevant candidates for your role.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        <DialogFooter className="mt-5">
          <Button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
