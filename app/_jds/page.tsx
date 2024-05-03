"use client";
import { useEffect, useState, useCallback } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import { sowParser } from "./parser";
import { retrieveMatches } from "./retrieve";
import { getType } from "./getType";
import { getRoles } from "./getRoles";
import { getKeyPersonnel } from "./getKeyPersonnel";
import { getJobDescription } from "./getJobDescription";
import { getScopeSummary } from "./getScopeSummary";
import { getFinalJobDescriptions } from "./getFinalJobDescription";

export default function JDGenerator() {
  const owner = "f7b3b3b4-4b7b-4b7b-8b7b-4b7b3b7b3b7b";

  const [documentType, setDocumentType] = useState();
  const [keyPersonnel, setKeyPersonnel] = useState([]);
  const [roles, setRoles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [finalJobDescription, setFinalJobDescription] = useState("");
  const [scopeSummary, setScopeSummary] = useState("");

  const handleFileUpload = async (files: File[]) => {
    const formData = new FormData();
    formData.append("file", files[0]);
    const response = await sowParser(formData);
  };

  // handle button click, call retrieveMatches and console.log the response
  const handleRetrieve = async () => {
    const response = await retrieveMatches();
  };

  // handle button click, call retrieveMatches and console.log the response
  const handleIdentifyDocument = async () => {
    const response = await getType(owner);
    setDocumentType(response.document_type);
  };

  // handle getRoles button click, call getRoles and set the roles state
  const handleGetRoles = async () => {
    console.log("handleGetRoles");
    const response = await getRoles(owner);
    setRoles(response.personnel_roles);
  };

  const handleGetKeyPersonnel = async () => {
    const response = await getKeyPersonnel(owner);
    setKeyPersonnel(response.key_personnel_roles);
  };

  const handleGetJobDescription = async (role: string) => {
    const response = await getJobDescription(owner, role);
    setJobDescription(response);
    console.log(response);
  };

  const handleGetScopeSummary = async () => {
    const response = await getScopeSummary(owner);
    setScopeSummary(response);
    console.log(response);
  };

  const handleGetFinalJobDescription = async () => {
    const response = await getFinalJobDescriptions(
      owner,
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
          onDrop={handleFileUpload}
          multiple={false}
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
        <div className="p-4 flex flex-col">
          <button onClick={handleRetrieve}>
            <div className="font-bold">Retreive</div>
          </button>
          <button onClick={handleIdentifyDocument}>
            <div className="font-bold">Identify PWS/SOW</div>
          </button>
          <button onClick={handleGetKeyPersonnel}>
            <div className="font-bold">Get Key Personnel</div>
          </button>
          <button onClick={handleGetRoles} className="font-bold">
            Get Roles
          </button>
          <button
            disabled={!!scopeSummary}
            onClick={handleGetScopeSummary}
            className="font-bold"
          >
            Get Scope Summary
          </button>
          <button disabled={!jobDescription && !scopeSummary} onClick={handleGetFinalJobDescription} className="font-bold">
            Get Final Job Description
          </button>
        </div>
        <div className="p-4">
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
