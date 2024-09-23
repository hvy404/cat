import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import useStore from "@/app/state/useStore";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddNewJobStart() {
  const { addJD } = useStore((state) => ({
    addJD: state.addJD,
  }));

  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;

  const [currentTip, setCurrentTip] = useState(0);
  const tips = [
    "Ensure your job description is clear and concise for best results.",
    "Include specific skills and qualifications to attract the right candidates.",
    "Highlight your company culture to appeal to suitable applicants.",
    "Be transparent about salary range and benefits to save time in the hiring process.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [tips.length]);
  

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 border-b p-4">
          <CardTitle className="text-md font-medium flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Job Posting Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-3 text-sm">
            {[
              { text: "Upload your job description file", done: !!addJD.file },
              { text: "AI analysis of your job description", done: addJD.isProcessing },
              { text: "Review and edit extracted information", done: false },
              { text: "Publish your job posting", done: false },
            ].map((step, index) => (
              <motion.li
                key={index}
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {step.done ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
                <span className={step.done ? "text-gray-700" : "text-gray-500"}>
                  {step.text}
                </span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 border-b p-4">
          <CardTitle className="text-md font-medium flex items-center space-x-2">
            <HelpCircle className="w-5 h-5" />
            <span>Tips for Success</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-sm text-gray-600"
          >
            {tips[currentTip]}
          </motion.div>
        </CardContent>
      </Card>

      {!cuid && (
        <Card className="bg-yellow-50 shadow-md rounded-lg overflow-hidden">
          <CardHeader className="bg-yellow-100 border-b">
            <CardTitle className="text-md font-medium flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span>Account Notice</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-yellow-700">
              Please complete your account setup to access all features of the job posting process.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}