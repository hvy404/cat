"use client";
import { useEffect, useState, useCallback, use } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import { generateLiftedStaticJD } from "./lib/staticJDGenerate";
import { generateLiftedInferredJD } from "./lib/inferredJDGenerate";
//import { createEmptyPostSchema } from "./lib/postSchema";
import { CodeBlock, dracula } from "react-code-blocks";
import { resumeParserUpload } from "@/lib/receiveUpload";
import { generateJobCypher } from "./lib/generateCypher";
import { v4 as uuidv4 } from "uuid";

function MyCoolCodeBlock({
  code,
  language,
  showLineNumbers,
}: {
  code: string;
  language: string;
  showLineNumbers: boolean;
}) {
  return (
    <CodeBlock
      text={code}
      language={language}
      showLineNumbers={showLineNumbers}
      theme={dracula}
    />
  );
}

export default function Employer() {
  const [jobDescriptionUuid, setjobDescriptionUuid] = useState(uuidv4());
  const [isStaticJDLoading, setIsStaticJDLoading] = useState(false);
  const [isInferredJDLoading, setIsInferredJDLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [inferResponse, setInferResponse] = useState("");
  const [fileResponse, setFileResponse] = useState("");
  const [mergedData, setMergedData] = useState("");
  const [generateCypherResponse, setGenerateCypherResponse] = useState("");

  const handleFileUpload = async (files: File[]) => {
    const formData = new FormData();
    formData.append("file", files[0]);
    const response = await resumeParserUpload(formData);
    setFileResponse(response);
  };

  /*   const handleClickResetAll = () => {
    setResponse("");
    setInferResponse("");
    setFileResponse("");
    setMergedData("");
  }; */

  useEffect(() => {
    if (fileResponse) {
      setIsStaticJDLoading(true);
      generateLiftedStaticJD(fileResponse)
        .then((res) => {
          setResponse(res);
          setIsStaticJDLoading(false);
        })
        .catch((err) => {
          console.error("Error generating static JD:", err);
          setIsStaticJDLoading(false);
        });
    }
  }, [fileResponse]);

  useEffect(() => {
    if (fileResponse && response) {
      setIsInferredJDLoading(true);
      generateLiftedInferredJD(fileResponse)
        .then((res) => {
          setInferResponse(res);
          setIsInferredJDLoading(false);
        })
        .catch((err) => {
          console.error("Error generating inferred JD:", err);
          setIsInferredJDLoading(false);
        });
    }
  }, [fileResponse, response]);

  // Merging response, inferResponse
  useEffect(() => {
    if (response && inferResponse) {
      const merged = {
        ...JSON.parse(response),
        ...JSON.parse(inferResponse),
        jobDescription_id: jobDescriptionUuid, 
      };
      setMergedData(JSON.stringify(merged, null, 2));
    }
  }, [response, inferResponse, jobDescriptionUuid]);

  // onclick to call generateCypher
  const handleGenerateCypher = async () => {
    const cypher = await generateJobCypher(JSON.parse(mergedData));
    setGenerateCypherResponse(cypher);
  };

  return (
    <div className="mx-auto h-screen max-w-7xl p-4 space-y-8">
      <div className="mt-12 pb-12 font-semibold text-slate-800">
        01 Alpha (Employer Upload). Defining schema.
      </div>
      <div className="flex flex-row gap-x-8">
        <div className="w-1/3 border border-1 border-gray-400 rounded-md p-4 flex justify-between">
          <Dropzone
            onDrop={handleFileUpload}
            multiple={false}
            disabled={!!fileResponse}
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
          {/* <button onClick={handleClickResetAll}>Reset All</button> */}
        </div>
        <div className="w-1/3 rounded-md p-4">
          {/* Optional additional UI elements */}
        </div>
      </div>
      <div className="flex flex-row gap-x-8">
        <div className="w-1/3 border border-1 border-gray-400 rounded-md p-4 h-[75vh] max-h-[80vh] overflow-y-scroll">
          {isStaticJDLoading && <p>Generating points from JD...</p>}
          {response && (
            <MyCoolCodeBlock
              code={response}
              language="json"
              showLineNumbers={false}
            />
          )}
        </div>
        <div className="w-1/3 border border-1 border-gray-400 rounded-md p-4 h-[75vh] max-h-[80vh] overflow-y-scroll">
          {isInferredJDLoading && <p>Generating inferred points...</p>}
          {inferResponse && (
            <MyCoolCodeBlock
              code={inferResponse}
              language="json"
              showLineNumbers={false}
            />
          )}
        </div>
        <div className="w-1/3 border border-1 border-gray-400 rounded-md p-4 h-[75vh] max-h-[80vh] overflow-y-scroll">
          {mergedData ? (
            <MyCoolCodeBlock
              code={mergedData}
              language="json"
              showLineNumbers={false}
            />
          ) : (
            "No merged data available."
          )}
        </div>
      </div>
      <div className="w-full flex flex-row border border-1 border-gray-200 mb-8">
        <button onClick={handleGenerateCypher}>Generate</button>
        {generateCypherResponse && (
          <MyCoolCodeBlock
            code={generateCypherResponse}
            language="cypher"
            showLineNumbers={false}
          />
        )}
      </div>
    </div>
  );
}
