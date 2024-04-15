"use client";
import { useEffect, useState, useCallback, use } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import { generateLiftedStatic } from "@/lib/staticGenerate";
import { generateLiftedInferred } from "@/lib/inferredGenerate";
import { createEmptyPostSchema } from "@/lib/data/postSchema";
import { CodeBlock, dracula } from "react-code-blocks";
import { resumeParserUpload } from "@/lib/receiveUpload";
import { generateCypher } from "@/lib/generateCypher";
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

export default function Home() {
  const [userUuid, setUserUuid] = useState(uuidv4());
  const [isStaticResumeLoading, setIsStaticResumeLoading] = useState(false);
  const [isInferredResumeLoading, setIsInferredResumeLoading] = useState(false);
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

  const handleClickResetAll = () => {
    setResponse("");
    setInferResponse("");
    setFileResponse("");
    setMergedData("");
  };

  useEffect(() => {
    if (fileResponse) {
      setIsStaticResumeLoading(true);
      generateLiftedStatic(fileResponse)
        .then((res) => {
          setResponse(res);
          setIsStaticResumeLoading(false);
        })
        .catch((err) => {
          console.error("Error generating static resume:", err);
          setIsStaticResumeLoading(false);
        });
    }
  }, [fileResponse]);

  useEffect(() => {
    if (fileResponse && response) {
      setIsInferredResumeLoading(true);
      generateLiftedInferred(fileResponse)
        .then((res) => {
          setInferResponse(res);
          setIsInferredResumeLoading(false);
        })
        .catch((err) => {
          console.error("Error generating inferred resume:", err);
          setIsInferredResumeLoading(false);
        });
    }
  }, [fileResponse, response]);

  // Merging response, inferResponse
  useEffect(() => {
    if (response && inferResponse) {
      const merged = {
        ...JSON.parse(response),
        ...JSON.parse(inferResponse),
        ...JSON.parse(JSON.stringify(createEmptyPostSchema())),
        applicant_id: userUuid, // Set the userUuid as applicant_id
      };
      setMergedData(JSON.stringify(merged, null, 2));
    }
  }, [response, inferResponse, userUuid]);

  // onclick to call generateCypher
  const handleGenerateCypher = async () => {

      const cypher = await generateCypher(JSON.parse(mergedData));
      setGenerateCypherResponse(cypher);

  };

  return (
    <div className="mx-auto h-screen max-w-7xl p-4 space-y-8">
      <div className="mt-12 pb-12 font-semibold text-slate-800">
        01 Alpha. Defining schema.
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
          <button onClick={handleClickResetAll}>Reset All</button>
        </div>
        <div className="w-1/3 rounded-md p-4">
          {/* Optional additional UI elements */}
        </div>
      </div>
      <div className="flex flex-row gap-x-8">
        <div className="w-1/3 border border-1 border-gray-400 rounded-md p-4 h-[75vh] max-h-[80vh] overflow-y-scroll">
          {isStaticResumeLoading && <p>Generating points from resume...</p>}
          {response && (
            <MyCoolCodeBlock
              code={response}
              language="json"
              showLineNumbers={false}
            />
          )}
        </div>
        <div className="w-1/3 border border-1 border-gray-400 rounded-md p-4 h-[75vh] max-h-[80vh] overflow-y-scroll">
          {isInferredResumeLoading && <p>Generating inferred points...</p>}
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
