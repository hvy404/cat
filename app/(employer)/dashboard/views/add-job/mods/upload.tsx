import useStore from "@/app/state/useStore";
import Dropzone from "react-dropzone";
import { jobDescriptionUpload } from "@/lib/dashboard/jd-upload";
import { useState, useEffect } from "react";
import { JDAddDatabaseEntry } from "@/lib/dashboard/jd-add-new-entry";
import { jobDescriptionStartOnboard } from "@/lib/dashboard/start-onboard";
import { setUploadSession } from "@/lib/dashboard/ingest-jd/set-local-session";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { jdSetProcessStatus } from "@/lib/dashboard/ingest-jd/jd-process-status";

export default function AddNewJobStart() {
  // Define selectors for the specific parts of the store you need
  const { user, addJD, setAddJD } = useStore((state) => ({
    user: state.user,
    addJD: state.addJD,
    setAddJD: state.setAddJD,
  }));

  //const [file, setFile] = useState<File | null>(null); // File to be uploaded - using regular useState
  const [fileResponse, setFileResponse] = useState<string | null>(null); // Response after file upload - using regular useState
  //const [uploading, setUploading] = useState(false); // Uploading state - using regular useState

  // Set local session on upload
  const setSessionOnUpload = async () => {
    if (addJD.session !== null) {
      const session = await setUploadSession(addJD.session);
    } else {
      console.log("Session is not authorized.");
    }
  };

  // Update the session on upload state
  const handleStartProcessing = async () => {
    if (user && user.uuid && addJD.session) {
      await jdSetProcessStatus(user.uuid, addJD.session, true);
    } else {
      console.error("Session is not authorized.");
    }
  };

  const onFileAdded = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setFileResponse("No file selected.");
      return;
    }
    //setFile(acceptedFiles[0]);
    setAddJD({
      file: acceptedFiles[0],
    });
  };

  // Function to clear the file state
  const clearSelectedFile = () => {
    //setFile(null);
    setAddJD({
      file: null,
    });
  };

  // Consolidate file upload and database entry addition
  const handleFileUpload = async (acceptedFiles: File[]) => {
    if (user?.uuid && acceptedFiles.length > 0) {
      const formData = new FormData();
      formData.append("file", acceptedFiles[0]);
      //setUploading(true);
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

          // Add job description entry to the database
          const jdEntryId = await JDAddDatabaseEntry(
            user.uuid,
            uploadResponse.filename
          );
          if (jdEntryId.success && jdEntryId.id) {
            setAddJD({ jdEntryID: jdEntryId.id }); // Keep separate from filename
            setAddJD({ filename: uploadResponse.filename }); // Keep separate from jdEntryID
            setSessionOnUpload(); // Set local session data on upload
            handleStartProcessing(); // Set the processing status to true
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

  // useeffect to run jobDescriptionStartOnboard when jobDescriptionID, uploadedFilename is set and its values are not empty
  useEffect(() => {
    const startOnboardProcess = async () => {
      if (user) {
        if (addJD.jdEntryID && addJD.filename && user.uuid && addJD.session) {
          console.log("Triggering onboarding process.");
          const startOnboard = await jobDescriptionStartOnboard(addJD.jdEntryID, user.uuid, addJD.filename, addJD.session);

          // get startOnboard response
          //console.log("Start onboard response:", startOnboard);

          // Console log startOnboard response
          //console.log("Start onboard response:", startOnboard.success);
        }
      }
    };

    startOnboardProcess();
  }, [addJD.jdEntryID, addJD.filename, user?.uuid]);

  return (
    <div className="flex flex-col h-full items-center justify-center rounded-lg border border-dashed hover:border-slate-500 shadow-sm transition-colors duration-500 ease-in-out">
     {!addJD.isProcessing && (
      <>
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
                  <p className="text-xs text-muted-foreground">.pdf or .docx only</p>
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
      </>
      )}
      {addJD.isProcessing && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-gray-900">Processing...</p>
        </div>
      )}
    </div>
  );
}
