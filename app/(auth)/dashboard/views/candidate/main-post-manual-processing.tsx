import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QueryEventStatus } from "@/lib/dashboard/query-runner-status";
import { motion } from "framer-motion";

interface ProcessAlertDialogProps {
  runId: string;
  onComplete: () => void;
}

export function ProcessAlertDialog({
  runId,
  onComplete,
}: ProcessAlertDialogProps) {
  const [status, setStatus] = useState<string>("Running");

  useEffect(() => {
    const checkStatus = async () => {
      const currentStatus = await QueryEventStatus(runId);
      setStatus(currentStatus);

      if (currentStatus === "Completed") {
        console.log("Process completed");
        onComplete();
        setTimeout(() => {
          window.location.reload(); // todo: not the most elegant
        }, 1500);
      } else if (currentStatus !== "Running") {
        //console.error(`Process ${currentStatus}`);
      } else {
        setTimeout(checkStatus, 5000);
      }
    };

    checkStatus();
  }, [runId, onComplete]);

  return (
    <AlertDialog open={status !== "Completed"}>
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
            Processing Your Resume
          </h2>
          <p className="text-gray-600 text-center text-sm">
            Please wait while we analyze your professional story...
          </p>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
