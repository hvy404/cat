"use client";
import { useState, useEffect } from "react";
import Dropzone from "react-dropzone";
import { PlusIcon } from "@heroicons/react/24/solid";
import { uploadResumeToStorage } from "@/lib/candidate/resume-upload";
import { ResumeUploadEmailForm } from "@/app/candidate/components/resume-upload-email-form";
import ResumeUploadOTP from "@/app/candidate/components/resume-upload-otp";
import { resumeUnconfirmedAddToDatabase } from "@/lib/candidate/resume-upload-entry";
import getIdentityUUID from "@/lib/candidate/uuid-create";
import { storeCandidateOtpRequest } from "@/lib/otp/candidate-store-otp";
import { TOTP } from "totp-generator";

export default function ResumeUploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [fileResponse, setFileResponse] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState<string | null>(null);
  const [candidateID, setCandidateID] = useState("");
  const [candidateGate, setCandidateGate] = useState("");
  const [candidate32, setCandidate32] = useState("");

  // Get the candidate UUID
  useEffect(() => {
    const fetchData = async () => {
      const candidateUUID = await getIdentityUUID();
      setCandidateID(candidateUUID.newUUID); // Set the candidateID state
      setCandidateGate(candidateUUID.newFingerprint); // Set the candidateGate state
      setCandidate32(candidateUUID.finger32); // Set the candidate32 state
    };
    fetchData();
  }, []);

  function handleEmailSubmit(email: string) {
    setCandidateEmail(email);
    setEmailSubmitted(true);
  }

  // Run the file upload process only after email is submitted
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

  // Constant to handle generate OTP and store OTP request
  const handleOTPFlow = async () => {
    const { otp } = TOTP.generate(candidate32, { period: 600 });

    const actionType = "upload";
    await storeCandidateOtpRequest(candidateID, actionType, otp);
  };

  const handleFileUpload = async (acceptedFiles: File[]) => {
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);

    try {
      setUploading(true);
      const uploadResult = await uploadResumeToStorage(formData);
      if (uploadResult && uploadResult.success) {
        let signature = candidateGate;
        let email = candidateEmail;
        let uuid = candidateID;

        const addResult = await resumeUnconfirmedAddToDatabase(
          uuid,
          signature,
          uploadResult.id as string,
          email as string
        );

        if (addResult && addResult.success) {
          setFileResponse("Resume uploaded and confirmed successfully.");
          // Call handleOTPFlow after 3 seconds
          setTimeout(() => {
            handleOTPFlow();
          }, 3000);
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
      <button
        onClick={handleOTPFlow}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Generate OTP
      </button>

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
      {file && !emailSubmitted && !uploading && candidateID && (
        <ResumeUploadEmailForm onEmailSubmit={handleEmailSubmit} />
      )}
      {emailSubmitted && candidateID && !fileResponse && (
        <div>Loading OTP...</div>
      )}
      {emailSubmitted && candidateID && fileResponse && (
        <ResumeUploadOTP candidateID={candidateID} />
      )}
    </div>
  );
}
