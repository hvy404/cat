import { useUser } from "@clerk/nextjs";
import useStore from "@/app/state/useStore";
import { PaperclipIcon, Trash, Loader } from "lucide-react";
import Dropzone from "react-dropzone";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { sowUpload } from "@/lib/jd-builder/sow-upload"; // SOW Ingest - Step 1
import { StartSOWParse } from "@/app/(auth)/dashboard/views/employer/jd-builder/lib/runners/starting-sow-parse"; // Start background SOW ingest

export default function SOWUploader() {
  const { user: clerkUser } = useUser();
  const {
    jdBuilderWizard,
    setJDBuilderWizard,
    updateJDBuilderWizardStep,
  } = useStore();

  const candidateId = clerkUser?.publicMetadata?.aiq_cuid as string;

  // Handler to set the user selected files in state
  const onFileAdded = (acceptedFiles: File[]) => {
    // Update the JD Builder Wizard state
    setJDBuilderWizard({
      files: acceptedFiles,
    });
  };

  // Onclick handler to remove the selected file
  const removeSelectedFile = () => {
    // Update the JD Builder Wizard state
    setJDBuilderWizard({
      files: [],
    });
  };

  // File upload handler
  const handleFileUpload = async () => {
    const formData = new FormData();
    jdBuilderWizard.files.forEach((file) => {
      formData.append("file", file);
    });

    try {
      const filenames = await uploadFile(formData);
      //console.log("Filenames: ", filenames);
    } catch (error) {
      //console.log("Error uploading file", error);
    }
  };

  const uploadFile = async (fileData: FormData) => {
    const employerID = candidateId
    const sowUUID = jdBuilderWizard.sowID;

    // set the fileUploading state to true
    setJDBuilderWizard({
      fileUploading: true,
    });

    if (!employerID || !sowUUID) {
      throw new Error("Employer ID or SOW UUID is missing.");
    }

    try {
      const uploadJD = await sowUpload(fileData, sowUUID, employerID);
      if (uploadJD && uploadJD.success && Array.isArray(uploadJD.files)) {
        const filenames = uploadJD.files.map(
          (file: { filename: string }) => file.filename
        );
        // Get the current sowFile state
        const uploadSowFile = filenames[0];
        console.log("Upload SOW File: ", uploadSowFile);

        setJDBuilderWizard({
          sowFile: [uploadSowFile],
        });

        // Set the fileUploading state to false
        setJDBuilderWizard({
          fileUploading: false,
        });

        // Trigger the SOW Parse
        // It will run in background so we continue to the next step

        if (jdBuilderWizard.sowID === null) {
          // handle the error, e.g., show an error message
        } else {
          const startIngest = await StartSOWParse({
            sowID: jdBuilderWizard.sowID,
            employerID: candidateId,
            filename: uploadSowFile,
          });

          if (startIngest.success) {
            setJDBuilderWizard({ sowParseRunnerID: startIngest.runner }); // Runner ID of the SOW background ingest
          }
        }

        // Move interface to next steps
        updateJDBuilderWizardStep(2);

        return filenames; // Return uploaded filenames
      }
    } catch (error) {
      throw new Error("Error during file upload.");
    }
  };

  // Cleanup the files in state when the component is unmounted
  useEffect(() => {
    return () => {
      // Clear the files in state
      setJDBuilderWizard({
        files: [],
      });
    };
  }, []);

  return (
    <div className="flex flex-row items-center bg-gray-100 m-1.5 rounded-md p-4 gap-4">
      {jdBuilderWizard.files.length === 0 && (
        <>
          <PaperclipIcon
            className={`w-4 h-4 text-gray-500 flex-shrink-0 ${
              jdBuilderWizard.files.length === 0 ? "animate-bounce" : ""
            }`}
          />
          <div>
            <Dropzone
              onDrop={onFileAdded}
              multiple={false}
              maxFiles={1}
              accept={{
                "application/pdf": [],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [],
              }}
            >
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p className="text-gray-700 leading-7 text-sm">
                      Click here to upload your SOW / PWS
                    </p>
                  </div>
                </section>
              )}
            </Dropzone>
          </div>
        </>
      )}

      {jdBuilderWizard.files.length > 0 && (
        <div className="flex flex-col w-full justify-between gap-4 items-center align-middle">
          <p className="text-gray-700 leading-7 text-sm">
            {jdBuilderWizard.files.map((file: File) => (
              <div key={file.name}
              className="flex flex-row items-center gap-2">
                <div
                  onClick={removeSelectedFile}
                  className="p-1 bg-gray-200 rounded-full hover:bg-gray-200/50 text-gray-500 hover:text-red-600"
                >
                  <Trash className="w-4 h-4  flex-shrink-0" />
                </div>
                <span key={file.name}>{file.name}</span>
              </div>
            ))}
          </p>
          <Button
            onClick={handleFileUpload}
            disabled={jdBuilderWizard.fileUploading}
            className="font-medium"
          >
            {jdBuilderWizard.fileUploading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
