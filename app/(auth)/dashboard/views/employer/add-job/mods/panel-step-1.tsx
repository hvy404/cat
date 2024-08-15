import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Trash, Loader } from "lucide-react";
import useStore from "@/app/state/useStore";
import Dropzone from "react-dropzone";
import { jobDescriptionUpload } from "@/lib/dashboard/jd-upload";
import { JDAddDatabaseEntry } from "@/lib/dashboard/jd-add-new-entry";
import { jobDescriptionStartOnboard } from "@/lib/dashboard/start-onboard";
import { QueryEventStatus } from "@/lib/dashboard/query-runner-status";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

export default function AddNewJobStart() {
  const { addJD, setAddJD } = useStore((state) => ({
    addJD: state.addJD,
    setAddJD: state.setAddJD,
  }));

  const { user: clerkUser } = useUser();
  const cuid = clerkUser?.publicMetadata?.aiq_cuid as string | undefined;

  const [fileResponse, setFileResponse] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 20,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
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
            addJD.filename,
            addJD.session
          );

          if (startOnboard.success && startOnboard.event) {
            const eventID = startOnboard.event[0];
            const sessionId = startOnboard.session;
            setAddJD({ publishingRunnerID: eventID, session: sessionId });
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
  }, [addJD.publishingRunnerID]);

  return (
    <motion.div
      className="flex flex-col items-center h-full justify-center p-6 md:p-8 lg:p-12 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 space-y-4"
        variants={itemVariants}
      >
        <motion.div
          className="flex flex-col items-center space-y-3"
          variants={iconVariants}
        >
          <div className="p-2 bg-gray-100 rounded-full">
            <Upload className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="text-md font-semibold text-gray-800">Add a new job</h2>
        </motion.div>

        {!addJD.isProcessing ? (
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
                      <p className="text-sm text-gray-900">{addJD.file.name}</p>
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
        ) : (
          <div className="flex flex-col items-center gap-4 mt-4">
            <Loader className="w-6 h-6 text-gray-600 animate-spin" />
            <p className="text-sm text-gray-900">Processing...</p>
          </div>
        )}

        {fileResponse && (
          <p className="text-sm text-center text-gray-600 mt-4">
            {fileResponse}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
