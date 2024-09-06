import React from "react";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

export function LoadingAlert() {
  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 rounded-xl p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-6"
          />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Saving Your Profile
          </h2>
          <p className="text-gray-600 text-center text-sm">
            Please wait while we process your information...
          </p>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
