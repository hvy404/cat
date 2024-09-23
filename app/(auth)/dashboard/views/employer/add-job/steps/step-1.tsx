import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/app/state/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Clock,
  Search,
  UserCheck,
  Zap,
  Upload,
  Trash,
} from "lucide-react";
import LoadingAnimation from "@/app/(auth)/dashboard/views/employer/add-job/mods/uploading-animation";
import Dropzone from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { jobDescriptionUpload } from "@/lib/dashboard/jd-upload";
import { JDAddDatabaseEntry } from "@/lib/dashboard/jd-add-new-entry";
import { jobDescriptionStartOnboard } from "@/lib/dashboard/start-onboard";
import { QueryEventStatus } from "@/lib/dashboard/query-runner-status";
import { CancelJDParser } from "@/lib/dashboard/infer/from-jd/cancel-jd-parser";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CleanUpOnCancel } from "@/lib/dashboard/ingest-jd/cleanup-on-cancel";
import { grabUserCompanyId } from "@/lib/dashboard/get-company-membership";
import { CompanyProfileAlert } from "@/app/(auth)/dashboard/views/employer/global/company-profile-alert";

const MotionCard = motion(Card);

const funFacts = [
  "Fun fact: Our AI-powered matching system analyzes over dynamic data points to find the most suitable candidates for your role.",
  "Our AI matching algorithm excludes name, age, gender, ethnicity, and personal contact details, focusing solely on professional qualifications and experience to ensure fair and unbiased candidate selection.",
  "Interesting: 75% of HR managers say AI will play a key role in recruitment in the next 5 years.",
  "Quick tip: Detailed job descriptions in our system lead to 47% more accurately matched candidates, saving you time in the screening process.",
];

export default function AddJDStepOne() {
  const { addJD, setAddJD, setSelectedMenuItem } = useStore();
  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;
  const [fileResponse, setFileResponse] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showCompanyProfileAlert, setShowCompanyProfileAlert] = useState(false);
  const [hasCompanyId, setHasCompanyId] = useState(false);

  useEffect(() => {
    const getCompanyId = async () => {
      if (cuid) {
        const result = await grabUserCompanyId(cuid);
        if (result.success && result.companyId !== null) {
          setHasCompanyId(true);
        } else if (result.success && result.companyId === null) {
          setShowCompanyProfileAlert(true);
          setHasCompanyId(false);
        } else {
          console.error("Error fetching user company");
        }
      }
    };

    getCompanyId();
  }, [cuid]);

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const iconVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: { delay: 0.2, type: "spring", stiffness: 200 },
    },
  };

  const onFileAdded = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setFileResponse("No file selected.");
      return;
    }
    setAddJD({
      file: acceptedFiles[0],
    });
  };

  const clearSelectedFile = () => {
    setAddJD({
      file: null,
    });
  };

  const handleFileUpload = async (acceptedFiles: File[]) => {
    if (cuid && acceptedFiles.length > 0) {
      const formData = new FormData();
      formData.append("file", acceptedFiles[0]);
      setAddJD({ isProcessing: true });

      try {
        const uploadResponse = await jobDescriptionUpload(formData);
        if (
          uploadResponse &&
          uploadResponse.success &&
          uploadResponse.filename
        ) {
          setAddJD({ filename: uploadResponse.filename });

          const jdEntryId = await JDAddDatabaseEntry(
            cuid,
            uploadResponse.filename
          );
          if (jdEntryId.success && jdEntryId.id) {
            setAddJD({
              jdEntryID: jdEntryId.id,
              filename: uploadResponse.filename,
            });
            setFileResponse("File uploaded successfully.");
          } else {
            throw new Error("Job description upload to database failed.");
          }
        } else {
          throw new Error("File upload failed.");
        }
      } catch (error) {
        setFileResponse("Error uploading file.");
        setAddJD({ isProcessing: false });
      }
    } else {
      //console.log("User is null or no file selected. File upload aborted.");
    }
  };

  // Return to dashboard after completed
  const goToDashboard = () => {
    // Clean up the state
    setAddJD({
      filename: null,
      jdEntryID: null,
      session: null,
      isProcessing: false,
      isFinalizing: false,
      file: null,
      step: 1,
      jobDetails: [
        {
          jobTitle: "",
          location_type: "",
          min_salary: 0,
          max_salary: 0,
          salary_ote: 0,
          commission_percent: 0,
          security_clearance: "",
          salary_disclose: false,
          commission_pay: false,
        },
      ],
      jobDescriptionTitles: [],
      activeField: null,
      publishingRunnerID: null,
      onboardingStarted: false,
      finishingStarted: false,
    });

    setSelectedMenuItem("dashboard");
  };

  const activeSession = addJD.session;
  const handleCancelPosting = async () => {
    if (!activeSession) {
      console.error("No active session found");
      return;
    }

    try {
      await CancelJDParser({ sessionID: activeSession });

      const cleanupResult = await CleanUpOnCancel({
        jdId: addJD.jdEntryID ?? "",
        employerId: cuid ?? "",
        filename: addJD.filename,
      });

      setAddJD({ onboardingStarted: false, finishingStarted: false });

      if (cleanupResult.success) {
        goToDashboard();
      } else {
        console.error("There was an error cleaning up session");
      }
    } catch (error) {
      console.error("Error cancelling job posting");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startOnboardProcess = async () => {
      if (cuid && addJD.step === 1 && !addJD.onboardingStarted) {
        if (addJD.jdEntryID && addJD.filename && cuid && addJD.session) {
          setAddJD({ onboardingStarted: true });
          const startOnboard = await jobDescriptionStartOnboard(
            addJD.jdEntryID,
            cuid,
            addJD.filename,
            addJD.session
          );

          if (startOnboard.success && startOnboard.event) {
            const eventID = startOnboard.event[0];
            //console.log("Session ID: ", startOnboard.session);
            setAddJD({ publishingRunnerID: eventID });
          }
        }
      }
    };

    startOnboardProcess();

    return () => {
      isMounted = false;
    };
  }, [addJD.filename, cuid, addJD.jdEntryID, addJD.session, addJD.step, addJD.onboardingStarted, setAddJD]);

  useEffect(() => {
    let isMounted = true;

    const pollEventStatus = async () => {
      if (addJD.publishingRunnerID) {
        const status = await QueryEventStatus(addJD.publishingRunnerID);
        //console.log("Status:", status);

        if (status === "Completed") {
          setAddJD({
            step: 2,
            isProcessing: false,
            publishingRunnerID: null,
          });
        }
      }
    };

    const interval = setInterval(() => {
      pollEventStatus();
    }, 5000);

    return () => {
      clearInterval(interval);
      isMounted = false;
    };
  }, [addJD.publishingRunnerID, setAddJD]);

  return (
    <AnimatePresence mode="wait">
      {!addJD.isProcessing ? (
        <div className="space-y-6">
          <MotionCard
            key="info"
            className="w-full bg-white text-gray-800 overflow-hidden shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-300"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CardHeader className="bg-gray-50 p-4 border-b border-gray-200">
              <CardTitle className="text-md font-medium flex items-center space-x-2 text-gray-800">
                <motion.div
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                >
                  <FileText className="w-4 h-4 text-gray-700" />
                </motion.div>
                <span>Add Your Job Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-8">
              <motion.div
                className="text-gray-600 space-y-8 m-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm leading-relaxed">
                  Streamline your hiring process with our advanced AI
                  technology. Simply upload your job description, and our system
                  will automatically extract key information, populate your
                  forms, and start matching ideal candidates.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: Clock, text: "Save hours on manual data entry" },
                    { icon: Search, text: "Intelligent candidate matching" },
                    {
                      icon: UserCheck,
                      text: "Build a continuous talent pipeline",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg"
                    >
                      <item.icon className="w-8 h-8 text-gray-600 mb-2" />
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </CardContent>
          </MotionCard>

          <MotionCard
            key="upload"
            className="w-full bg-white text-gray-800 overflow-hidden shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-300"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CardHeader className="bg-gray-50 p-4 border-b border-gray-200">
              <CardTitle className="text-md font-medium flex items-center space-x-2 text-gray-800">
                <Upload className="w-4 h-4 text-gray-700" />
                <span>Upload Job Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Dropzone
                onDrop={onFileAdded}
                multiple={false}
                disabled={addJD.isProcessing || !hasCompanyId}
                accept={{
                  "application/pdf": [".pdf"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    [".docx"],
                }}
              >
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div
                    {...getRootProps()}
                    className={`flex flex-col items-center justify-center gap-4 p-8 border border-dashed rounded-lg transition-all duration-300 ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {!addJD.file?.name ? (
                      <>
                        <Upload className="w-12 h-12 text-gray-400" />
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-700">
                            Upload Job Description
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Drag & drop your file here or click to browse
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="mt-2"
                          disabled={!hasCompanyId}
                        >
                          {hasCompanyId
                            ? "Select File"
                            : "Company Profile Required"}
                        </Button>
                        <p className="text-xs text-gray-400 mt-2">
                          Accepted formats: PDF, DOCX
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex items-center justify-between w-full max-w-md p-3 bg-gray-100 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {addJD.file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(addJD.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearSelectedFile();
                            }}
                          >
                            <Trash className="w-5 h-5 text-red-500 hover:text-red-600" />
                          </Button>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            addJD.file && handleFileUpload([addJD.file]);
                          }}
                          className="w-full max-w-md"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Job Description
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Dropzone>
              {fileResponse && (
                <div className="text-sm text-center p-3 bg-gray-50 rounded-md border border-gray-200">
                  {fileResponse}
                </div>
              )}
            </CardContent>
          </MotionCard>
        </div>
      ) : (
        <MotionCard
          key="processing"
          className="w-full bg-white text-gray-800 shadow-lg border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200 bg-opacity-50 backdrop-filter backdrop-blur-sm">
            <CardTitle className="text-base font-medium flex items-center space-x-2 text-gray-700">
              <Zap className="w-5 h-5" />
              <span>Analyzing Your Job Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            <div className="flex justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <LoadingAnimation />
              </motion.div>
            </div>

            <motion.p
              className="text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Our AI is analyzing your job description to identify optimal
              matching criteria. This process typically takes 2-3 minutes.
            </motion.p>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    className="mt-4 hover:bg-gray-200 transition-colors duration-300"
                  >
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be reversed. Are you sure you want to
                      cancel the job posting process?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, continue posting</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelPosting}>
                      Yes, cancel posting
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          </CardContent>
        </MotionCard>
      )}

      {showCompanyProfileAlert && (
        <CompanyProfileAlert
          showCompanyProfileAlert={showCompanyProfileAlert}
          setShowCompanyProfileAlert={setShowCompanyProfileAlert}
          setSelectedMenuItem={setSelectedMenuItem}
        />
      )}
    </AnimatePresence>
  );
}
