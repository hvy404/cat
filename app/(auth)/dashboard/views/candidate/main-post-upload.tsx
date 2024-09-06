import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ArrowLeft, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { uploadResumeToStorage } from "@/lib/candidate/resume-upload";
import { resumeUnconfirmedAddToDatabase } from "@/lib/candidate/resume-upload-entry";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { candidateStartOnboard } from "@/lib/candidate/onboard/onboardResume";
import { QueryWorkerStatus } from "@/lib/workers/check-worker-status";
import EnhancedLoadingComponent from "@/app/candidate/components/loading-status-bar";
import { CandidateOnboardingForm } from "@/app/(auth)/dashboard/views/candidate/main-onboard-form";

interface ResumeUploadProps {
  onBack: () => void;
  email: string;
  candidateId: string;
}

export function ResumeUpload({
  onBack,
  email,
  candidateId,
}: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [workerStatus, setWorkerStatus] = useState<string | undefined>(
    undefined
  );
  const [uploadCompleted, setUploadCompleted] = useState(false);

  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  const pollWorkerStatus = useCallback(
    async (eventId: string) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const fetchStatus = async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
          const result = await QueryWorkerStatus(eventId);
          setWorkerStatus(result.status);

          if (
            result.status === "completed" ||
            result.status === "failed" ||
            result.status === "cancelled"
          ) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }

            if (result.status === "completed") {
              console.log("Worker completed successfully");
              toast.success("Resume processing completed!");
              // TODO: We need to now display the confirmation component
              setIsLoading(false);
              router.push("/dashboard");
            } else {
              console.error("Worker failed or was cancelled");
              toast.error(
                "There was an error processing your resume. Please try again."
              );
            }
          }
        } catch (error) {
          console.error("Error fetching worker status:", error);
        } finally {
          isFetchingRef.current = false;
        }
      };

      await fetchStatus();
      intervalRef.current = setInterval(fetchStatus, 10000);
    },
    [router]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("No file selected.");
      return;
    }

    setIsLoading(true);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadResult = await uploadResumeToStorage(formData);
      console.log("Upload result:", uploadResult);

      if (!uploadResult || !uploadResult.success || !uploadResult.id) {
        throw new Error("Failed to upload resume.");
      }

      const addResult = await resumeUnconfirmedAddToDatabase(
        candidateId,
        uploadResult.id,
        email
      );
      //console.log("Add to database result:", addResult);

      if (!addResult || !addResult.success) {
        throw new Error("Failed to confirm resume upload.");
      }

      //toast.success("Resume uploaded and confirmed successfully.");

      const onboardResult = await candidateStartOnboard(candidateId);
      console.log("Onboarding Run", onboardResult);

      if (
        onboardResult.message !== "Success" ||
        !onboardResult.event ||
        onboardResult.event.length === 0
      ) {
        throw new Error(
          onboardResult.error || "Failed to start onboarding process."
        );
      }

      toast.success("Onboarding process started successfully.");
      // TODO: Disable the back and submit button
      setUploadCompleted(true);
      setRunId(onboardResult.event[0]);
      pollWorkerStatus(onboardResult.event[0]);
    } catch (error) {
      //console.error("Error during file upload or processing:", error);
      toast.error(
        "There was an error uploading or processing your resume. Please try again."
      );
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <EnhancedLoadingComponent workerStatus={workerStatus} />;
  }

  if (uploadCompleted) {
    return <CandidateOnboardingForm />;
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 p-12 max-w-3xl w-full"
      >
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Upload Your Resume
        </h1>
        <div
          {...getRootProps()}
          className={`p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ease-in-out ${
            isDragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
          }`}
        >
          <input {...getInputProps()} />
          <AnimatePresence>
            {file ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center space-x-4"
              >
                <FileText className="h-10 w-10 text-indigo-500" />
                <span className="text-lg font-medium text-gray-700">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Upload className="mx-auto h-16 w-16 text-indigo-400" />
                <p className="mt-4 text-md font-medium text-gray-700">
                  {isDragActive
                    ? "Drop your resume here"
                    : "Drag & drop your resume here, or click to select a file"}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Supported formats: PDF, DOCX
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex justify-between items-center">
          <Button
            onClick={onBack}
            variant="outline"
            disabled={isUploading}
            className="flex items-center px-6 py-3 text-indigo-600 hover:bg-indigo-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
            disabled={!file || isUploading}
            onClick={handleFileUpload}
          >
            Upload Resume
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
