"use client";
import Dropzone from "react-dropzone";
import { jobDescriptionUpload } from "@/lib/dashboard/jd-upload";
import { useState, useEffect } from "react";
import { JDAddDatabaseEntry } from "@/lib/dashboard/jd-add-new-entry";
import { jobDescriptionStartOnboard } from "@/lib/dashboard/start-onboard";

export default function JDUploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [fileResponse, setFileResponse] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [jobDescriptionID, setJobDescriptionID] = useState(""); // ID is provided by JDAddDatabaseEntry function

  const employerID = "f5246ce0-da92-4916-b1c8-dedf415a8dd2"; // This will be dynamic from the user session
  // Job Description ID is 'jobDescriptionID' and will be provided by JDAddDatabaseEntry function
  // Filename is 'uploadedFilename' and will be provided by jobDescriptionUpload function

  const onFileAdded = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setFileResponse("No file selected.");
      return;
    }
    setFile(acceptedFiles[0]);
  };

  // Upload file will also return the filename which is also the job description ID
  const uploadFile = async (fileData: FormData) => {
    try {
      const uploadJD = await jobDescriptionUpload(fileData);
      if (uploadJD && uploadJD.success) {
        setUploadedFilename(uploadJD.filename ?? ""); // Provide a default value of an empty string
        return uploadJD.filename ?? ""; // uploaded filename
      }
      throw new Error("File upload failed.");
    } catch (error) {
      throw new Error("Error during file upload.");
    }
  };

  // Generate job ID and add entry to database
  // This function will be called after the file is uploaded
  const addJobDescriptionEntry = async (employerID: string, filename: string) => {
    try {
      const addEntry = await JDAddDatabaseEntry(employerID, filename);
      if (addEntry.success && addEntry.id) {
        setJobDescriptionID(addEntry.id);
        return addEntry.id;
      }
      throw new Error("Job description upload to database failed.");
    } catch (error) {
      throw new Error("Error uploading job description.");
    }
  };

  // Upload file and get filename
  const handleFileUpload = async (acceptedFiles: File[]) => {
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);

    setUploading(true);
    try {
      const filename = await uploadFile(formData);
      await addJobDescriptionEntry(employerID, filename ?? "");
      setFileResponse("File uploaded successfully.");
    } catch (error) {
      setFileResponse("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  // useeffect to run jobDescriptionStartOnboard when jobDescriptionID, uploadedFilename is set and its values are not empty
  useEffect(() => {
    if (jobDescriptionID && uploadedFilename) {
      console.log("Starting job description onboarding");
      jobDescriptionStartOnboard(jobDescriptionID, employerID, uploadedFilename, "X");
    }
  }, [jobDescriptionID, uploadedFilename]);

  return (
    <div className="flex flex-col space-y-4">
      <Dropzone onDrop={onFileAdded} multiple={false} disabled={uploading}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p className="font-bold">
                Drag 'n' drop some files here, or click to select files
              </p>
            </div>
          </section>
        )}
      </Dropzone>
      {file && (
        <div>
          <button
            onClick={() => handleFileUpload([file])}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Upload
          </button>
          {fileResponse && <p>{fileResponse}</p>}
        </div>
      )}
      <div className="flex flex-col border border-1">
        <p className="font-bold">Employer ID</p>
        <p>{employerID}</p>
        <p className="font-bold">Filename</p>
        <p>{uploadedFilename}</p>
        <p className="font-bold">Job Description ID</p>
        <p>{jobDescriptionID}</p>
      </div>
    </div>
  );
}
