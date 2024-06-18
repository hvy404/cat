import useStore from "@/app/state/useStore";
import Dropzone from "react-dropzone";
import { jobDescriptionUpload } from "@/lib/dashboard/jd-upload";
import { useState, useEffect } from "react";
import { JDAddDatabaseEntry } from "@/lib/dashboard/jd-add-new-entry";
import { jobDescriptionStartOnboard } from "@/lib/dashboard/start-onboard";
import { QueryEventStatus } from "@/lib/dashboard/query-runner-status";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { motion } from "framer-motion";

export default function AddNewJobStart() {
  // Define selectors for the specific parts of the store you need
  const { user, addJD, setAddJD } = useStore((state) => ({
    user: state.user,
    addJD: state.addJD,
    setAddJD: state.setAddJD,
  }));

  const [fileResponse, setFileResponse] = useState<string | null>(null); // Response after file upload

  // Define the animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.5,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }),
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

  // Onclick function to clear the file state
  const clearSelectedFile = () => {
    setAddJD({
      file: null,
    });
  };

  // Consolidate file upload and database entry addition
  const handleFileUpload = async (acceptedFiles: File[]) => {
    if (user?.uuid && acceptedFiles.length > 0) {
      const formData = new FormData();
      formData.append("file", acceptedFiles[0]);
      setAddJD({ isProcessing: true });

      try {
        // Upload the job description file
        const uploadResponse = await jobDescriptionUpload(formData);
        if (
          uploadResponse &&
          uploadResponse.success &&
          uploadResponse.filename
        ) {
          // Add the uploaded filename to the store
          setAddJD({ filename: uploadResponse.filename });

          // Create a entry for the uploaded job description
          const jdEntryId = await JDAddDatabaseEntry(
            user.uuid,
            uploadResponse.filename // filename from uploadResponse
          );
          if (jdEntryId.success && jdEntryId.id) {
            setAddJD({ jdEntryID: jdEntryId.id }); // Keep separate from filename
            setAddJD({ filename: uploadResponse.filename }); // Keep separate from jdEntryID
            setFileResponse("File uploaded successfully.");
          } else {
            throw new Error("Job description upload to database failed.");
          }
        } else {
          throw new Error("File upload failed.");
        }
      } catch (error) {
        setFileResponse("Error uploading file.");
      } finally {
        //setUploading(false);
      }
    } else {
      console.log("User is null or no file selected. File upload aborted.");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startOnboardProcess = async () => {
      if (user && addJD.step === 1) {
        if (addJD.jdEntryID && addJD.filename && user.uuid && addJD.session) {
          console.log("Triggering onboarding process - step #1");

          console.log(
            "Starting onboard for",
            addJD.jdEntryID,
            user.uuid,
            addJD.filename,
            addJD.session
          );

          const startOnboard = await jobDescriptionStartOnboard(
            addJD.jdEntryID,
            user.uuid,
            addJD.filename,
            addJD.session
          );

          if (startOnboard.success && startOnboard.event) {
            const eventID = startOnboard.event[0];

            setAddJD({
              publishingRunnerID: eventID,
            });
          }
        }
      }
    };

    startOnboardProcess();

    return () => {
      isMounted = false;
    };
  }, [addJD.filename, user?.uuid, addJD.jdEntryID, addJD.session, addJD.step]);

  // Poll the JD processing status
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

    // Cleanup
    return () => {
      clearInterval(interval);
      isMounted = false;
    };
  }, [addJD.publishingRunnerID]);

  return (
    <div className="flex flex-col h-full items-center justify-center rounded-lg border border-dashed hover:border-slate-500 shadow-sm transition-colors duration-500 ease-in-out">
      {!addJD.isProcessing && (
        <motion.div
        initial="hidden"
          variants={messageVariants}
          animate="visible"
          custom={0} // No delay for the first message
        >
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
              <section>
                <div
                  {...getRootProps()}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <input {...getInputProps()} />
                  <h3 className="text-2xl font-bold tracking-tight">
                    Add a new job
                  </h3>
                  {!addJD.file?.name && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Upload a job description to get started
                      </p>
                      <Button>Select JD</Button>
                      <p className="text-xs text-muted-foreground">
                        .pdf or .docx only
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </Dropzone>

          <div className="space-y-2 flex flex-col">
            {addJD.file?.name && (
              <div className="flex flex-row items-center gap-2 mt-4">
                <p className="text-base text-gray-900 leading-7">
                  File selected: {addJD.file.name}
                </p>{" "}
                <Trash
                  onClick={() => {
                    clearSelectedFile();
                  }}
                  className="h-4 w-5 text-red-700 hover:text-red-500"
                />
              </div>
            )}
            {addJD.file?.name && (
              <div className="flex flex-col mx-auto gap-2">
                <Button
                  disabled={!addJD.file || addJD.isProcessing}
                  onClick={() => addJD.file && handleFileUpload([addJD.file])}
                  className="mt-4"
                >
                  Upload JD
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {addJD.isProcessing && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-gray-900">Processing...</p>
        </div>
      )}
    </div>
  );
}
