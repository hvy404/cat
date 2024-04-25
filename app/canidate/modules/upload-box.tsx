"use client";
import { useState, useEffect } from "react";
import Dropzone from "react-dropzone";
import { PlusIcon } from "@heroicons/react/24/solid";
import { uploadResumeToStorage } from "@/mod/canidate/resume-upload";
import { ResumeUploadEmailForm } from "@/mod/canidate/resume-upload-email-form";
import ResumeUploadOTP from "@/mod/canidate/resume-upload-otp";
import { resumeUnconfirmedAddToDatabase } from "@/mod/canidate/resume-upload-entry";
import getIdentityUUID from "@/mod/canidate/uuid-create";

export default function ResumeUploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [fileResponse, setFileResponse] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState<string | null>(null);

  function handleEmailSubmit(email: string) {
    console.log("Email submitted:", email);
    setCandidateEmail(email);
    setEmailSubmitted(true);
  }

  useEffect(() => {
    if (candidateEmail && file && emailSubmitted) {
      handleFileUpload([file]);
    }
  }, [candidateEmail, file, emailSubmitted]);

  const onFileAdded = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setFileResponse("No file selected.");
      return;
    }
    setFile(acceptedFiles[0]);
    setFileResponse(null); // Clear previous responses if any
    setEmailSubmitted(false); // Ready to show email form next
  };

  const handleFileUpload = async (acceptedFiles: File[]) => {
    const candidateUUID = await getIdentityUUID();
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);

    try {
      setUploading(true);
      const uploadResult = await uploadResumeToStorage(formData);
      if (uploadResult && uploadResult.success) {
        let signature = candidateUUID.newFingerprint;
        let email = candidateEmail;
        let uuid = candidateUUID.newUUID;

        const addResult = await resumeUnconfirmedAddToDatabase(
          uuid,
          signature,
          uploadResult.id as string,
          email as string
        );
        if (addResult && addResult.success) {
          setFileResponse("Resume uploaded and confirmed successfully.");
        } else {
          setFileResponse("Failed to confirm resume upload.");
        }
      } else {
        setFileResponse("Failed to upload resume.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileResponse("Error during file upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="absolute flex flex-row p-8 items-center left-0 top-0 w-[50rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10 min-h-full">
      {!file && (
        <Dropzone onDrop={onFileAdded} multiple={false} disabled={uploading}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <PlusIcon className="h-24 w-24 text-white animate-pulse" />
              </div>
            </section>
          )}
        </Dropzone>
      )}
      {file && !emailSubmitted && !uploading && (
        <ResumeUploadEmailForm onEmailSubmit={handleEmailSubmit} />
      )}
      {emailSubmitted && <ResumeUploadOTP />}
    </div>
  );
}
