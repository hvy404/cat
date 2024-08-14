import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/app/state/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LucideIcon,
  FileText,
  Clock,
  Search,
  UserCheck,
  Zap,
  Target,
  ChevronRight,
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

interface ProcessingStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const MotionCard = motion(Card);

const funFacts = [
  "Fun fact: The average hiring process takes 23 days. We're here to speed that up!",
  "Interesting: 75% of HR managers say AI will play a key role in recruitment in the next 5 years.",
  "Quick tip: Clear job descriptions lead to 47% more qualified applicants.",
];

export default function AddJDStepOne() {
  const { addJD, setAddJD } = useStore();
  const [funFact, setFunFact] = useState("");
  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;
  const [fileResponse, setFileResponse] = useState<string | null>(null);
  const [currentFact, setCurrentFact] = useState(funFacts[0]);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    }, 8000);

    return () => clearInterval(factInterval);
  }, []);

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
      console.log("User is null or no file selected. File upload aborted.");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startOnboardProcess = async () => {
      if (cuid && addJD.step === 1) {
        if (addJD.jdEntryID && addJD.filename && cuid && addJD.session) {
          const startOnboard = await jobDescriptionStartOnboard(
            addJD.jdEntryID,
            cuid,
            addJD.filename
          );

          if (startOnboard.success && startOnboard.event) {
            const eventID = startOnboard.event[0];
            console.log("Session ID: ", startOnboard.session);
            setAddJD({ publishingRunnerID: eventID });
          }
        }
      }
    };

    startOnboardProcess();

    return () => {
      isMounted = false;
    };
  }, [addJD.filename, cuid, addJD.jdEntryID, addJD.session, addJD.step]);

  useEffect(() => {
    let isMounted = true;

    const pollEventStatus = async () => {
      if (addJD.publishingRunnerID) {
        const status = await QueryEventStatus(addJD.publishingRunnerID);
        console.log("Status:", status);

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
  }, [addJD.publishingRunnerID]);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    }, 5000);

    return () => clearInterval(factInterval);
  }, []);

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
                className="text-gray-600 space-y-4"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
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
                      className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg"
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
            <CardContent className="p-4 space-y-4">
              <Dropzone
                onDrop={onFileAdded}
                multiple={false}
                disabled={addJD.isProcessing}
                accept={{
                  "application/pdf": [".pdf"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    [".docx"],
                }}
              >
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="flex flex-col items-center gap-2 text-center mt-4"
                  >
                    <input {...getInputProps()} />
                    {!addJD.file?.name ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Upload a job description to get started
                        </p>
                        <Button>Select JD</Button>
                        <p className="text-xs text-muted-foreground">
                          .pdf or .docx only
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <p className="text-sm text-gray-900">
                            {addJD.file.name}
                          </p>
                          <Trash
                            onClick={(e) => {
                              e.stopPropagation();
                              clearSelectedFile();
                            }}
                            className="w-4 h-4 text-red-700 hover:text-red-500 cursor-pointer"
                          />
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            addJD.file && handleFileUpload([addJD.file]);
                          }}
                        >
                          Upload JD
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Dropzone>
              {fileResponse && (
                <p className="text-sm text-center text-gray-600 mt-4">
                  {fileResponse}
                </p>
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
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
            <CardTitle className="text-base font-medium flex items-center space-x-2 text-gray-700">
              <Zap className="w-5 h-5" />
              <span>Analyzing Your Job Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            <div className="flex justify-center">
              <LoadingAnimation />
            </div>

            <motion.p
              className="text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              "Our AI is analyzing your job description to identify optimal
              matching criteria. This process typically takes 2-3 minutes.
            </motion.p>

            <motion.div
              className="bg-gray-50 p-3 rounded-lg shadow-inner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="text-xs font-semibold mb-1 flex items-center text-gray-700">
                <ChevronRight className="w-4 h-4 mr-1" />
                Did You Know?
              </h4>
              <p className="text-xs text-gray-600">{currentFact}</p>
            </motion.div>
          </CardContent>
        </MotionCard>
      )}
    </AnimatePresence>
  );
}
