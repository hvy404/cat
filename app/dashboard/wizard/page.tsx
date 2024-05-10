"use client";
import { useEffect, useState, useCallback } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import { sowParser } from "../../../lib/jd-builder/sow-parse";
//import { retrieveMatches } from "./retrieve";
import { getType } from "../../../lib/jd-builder/getType";
import { getRoles } from "../../../lib/jd-builder/getRoles";
import { getKeyPersonnel } from "../../../lib/jd-builder/getKeyPersonnel";
import { getJobDescription } from "../../../lib/jd-builder/buildJobDescription";
import { getScopeSummary } from "../../../lib/jd-builder/getScopeSummary";
import { getFinalJobDescriptions } from "../../../lib/jd-builder/getFinalJobDescription";
import { sowUpload } from "@/lib/jd-builder/sow-upload";

export default function JDGenerator() {
  const employerID = "f5246ce0-da92-4916-b1c8-dedf415a8dd2"; // TODO: This will be dynamic from the user session
  const sowUUID = "ec3350f7-cba8-4b1f-a11c-cf042844a603";

  //const [sowUUID, setSowUUID] = useState("");
  const [documentType, setDocumentType] = useState();
  const [files, setFiles] = useState<File[]>([]); // Updated to handle multiple files

  const [keyPersonnel, setKeyPersonnel] = useState([]);
  const [roles, setRoles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [finalJobDescription, setFinalJobDescription] = useState("");
  const [scopeSummary, setScopeSummary] = useState("");
  const [sowFile, setSowFile] = useState<string[]>([]);

  const onFileAdded = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles); // Handle multiple files
  };

  const handleParse = async () => {
    try {
      let filename = sowFile[0]; // get first item in sowFile array
      const response = await sowParser(sowUUID, employerID, filename);
      console.log(response);
    } catch (error) {
      console.log("Error parsing SOW", error);
    }
  };

  const uploadFile = async (fileData: FormData) => {
    try {
      const uploadJD = await sowUpload(fileData, sowUUID, employerID);
      if (uploadJD && uploadJD.success && Array.isArray(uploadJD.files)) {
        const filenames = uploadJD.files.map(
          (file: { filename: string }) => file.filename
        );
        setSowFile((prevFilenames) => [...prevFilenames, ...filenames]); // Append to filenames array in state
        return filenames; // Return uploaded filenames
      }
    } catch (error) {
      throw new Error("Error during file upload.");
    }
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });

    try {
      const filenames = await uploadFile(formData);
      console.log("Filenames: ", filenames);
    } catch (error) {
      console.log("Error uploading file", error);
    } finally {
      console.log("Files uploaded successfully");
    }
  };

  // handle button click, call retrieveMatches and console.log the response
  // this function find matching K from the embeddings
  //const handleRetrieve = async () => {
  //  const response = await retrieveMatches(employerID, sowUUID);
  //};

  // handle button click, call retrieveMatches and console.log the response
  // Identify if this is a PWS or SOW
  const handleIdentifyDocument = async () => {
    const response = await getType(employerID, sowUUID);
    setDocumentType(response.document_type);
  };

  // handle getRoles button click, call getRoles and set the roles state
  // this function gets the potential roles from the document
  const handleGetRoles = async () => {
    console.log("handleGetRoles");
    const response = await getRoles(employerID);
    setRoles(response.personnel_roles);
  };

  // handle getKeyPersonnel button click, call getKeyPersonnel and set the keyPersonnel state
  // this function gets the key personnel from the document
  const handleGetKeyPersonnel = async () => {
    const response = await getKeyPersonnel(employerID, sowUUID);
    setKeyPersonnel(response.key_personnel_roles);
  };

  // handle getJobDescription button click, call getJobDescription and set the jobDescription state
  // this function gets the job description for a role. Role is provided as an argument
  const handleGetJobDescription = async (role: string) => {
    const response = await getJobDescription(employerID, /* role, */ sowUUID);
    //setJobDescription(response);
    console.log(response);
  };

  // handle getScopeSummary button click, call getScopeSummary and set the scopeSummary state
  // this function gets the scope summary from the document
  // It gets set to state and passed to getFinalJobDescriptions as one of the context paremeters.
  const handleGetScopeSummary = async () => {
    const response = await getScopeSummary(employerID, sowUUID);
    setScopeSummary(response);
    console.log(response);
  };

  // handle getFinalJobDescription button click, call getFinalJobDescription and set the finalJobDescription state
  // this function gets the final job description from the document
  // this enhances the job description with the scope summary
  const handleGetFinalJobDescription = async () => {
    const response = await getFinalJobDescriptions(
      employerID,
      jobDescription,
      scopeSummary
    );
    setFinalJobDescription(response);
    console.log(response);
  };

  return (
    <div>
      <div>SOW Upload</div>
      <div>
        <Dropzone
          onDrop={onFileAdded}
          multiple={true}
          //disabled={!!fileResponse}
        >
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag and drop a file here, or click to select a file</p>
              </div>
            </section>
          )}
        </Dropzone>
        <button onClick={handleFileUpload} className="font-bold">
          Upload
        </button>
        <div className="p-4 flex flex-col">
          {/* <button onClick={handleRetrieve}>
            <div className="font-bold">Retreive</div>
          </button> */}
          <button onClick={handleIdentifyDocument}>
            <div className="font-bold">Identify PWS/SOW</div>
          </button>
          <button onClick={handleGetKeyPersonnel}>
            <div className="font-bold">Get Key Personnel</div>
          </button>
          <button onClick={handleGetRoles} className="font-bold">
            Get Roles
          </button>
          <button onClick={handleGetScopeSummary} className="font-bold">
            Get Scope Summary
          </button>
          <button
            disabled={!jobDescription && !scopeSummary}
            onClick={handleGetFinalJobDescription}
            className="font-bold"
          >
            Get Final Job Description
          </button>
          <button onClick={handleParse} className="font-bold">
            Parse SOW
          </button>
        </div>
        <div className="p-4">
          <div>
            <h2 className="font-semibold">SOW ID</h2>
            <div>{sowUUID}</div>
          </div>
          <div>
            <h2 className="font-semibold">Potential Roles</h2>
            <ul>
              {roles.map((role) => (
                <li
                  onClick={() => handleGetJobDescription(role)}
                  key={role}
                  className="cursor-pointer"
                >
                  {role}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Key Personnel</h2>
            <ul>
              {keyPersonnel.map((person) => (
                <li key={person}>{person}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col">
            <h2 className="font-semibold">Refined Job Description</h2>
            <div>{finalJobDescription}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
