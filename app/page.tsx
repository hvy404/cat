"use client";
import { useEffect, useState, useCallback } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import { generateLiftedStatic } from "@/lib/staticGenerate";
import { generateLiftedInferred } from "@/lib/inferredGenerate";
import { CodeBlock, dracula } from "react-code-blocks";
import { resumeParserUpload } from "@/lib/receiveUpload";

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
  const [isStaticResumeLoading, setIsStaticResumeLoading] =
    useState<boolean>(false);
  const [isInferredResumeLoading, setIsInferredResumeLoading] =
    useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [response, setResponse] = useState<string>("");
  const [inferResponse, setInferResponse] = useState<string>("");
  const [fileResponse, setFileResponse] = useState<string>("");

  const handleFileUpload = async (files: File[]) => {
    const formData = new FormData();
    formData.append("file", files[0]); // Append the first file

    const response = await resumeParserUpload(formData);
    console.log({ response });
    setFileResponse(response); // Set inital resume data to trigger rest of actions
  };

  const handleClickResetAll = () => {
    setResponse("");
    setInferResponse("");
    setFileResponse("");
  };

  // Generate static schema
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

  // Generate inferred schema
  useEffect(() => {
    if (fileResponse && response) {
      // Only generate inferred schema if static schema is generated
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

  return (
    <div className="mx-auto h-screen max-w-7xl p-4 max-h-[80vh] space-y-8">
      <div className="mt-12 pb-12 font-semibold text-slate-800">
        01 Alpha. Defining schema.
      </div>
      <div className="flex flex-row gap-x-8">
        <div className="w-1/2 border border-1 border-gray-400 rounded-md p-4 flex justify-between">
          <Dropzone onDrop={handleFileUpload} multiple={false} disabled={!!fileResponse}>
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
        <div className="w-1/2 rounded-md p-4"></div>
      </div>
      <div className="flex flex-row gap-x-8">
        <div className="w-1/2 border border-1 border-gray-400 rounded-md p-4">
          {isStaticResumeLoading && <p>Generating points from resume...</p>}
          {response && (
            <MyCoolCodeBlock
              code={response}
              language="json"
              showLineNumbers={true}
            />
          )}
        </div>
        <div className="w-1/2 border border-1 border-gray-400 rounded-md p-4 h-[75vh] max-h-[80vh] overflow-y-scroll">
          {isInferredResumeLoading && <p>Generating inferred points...</p>}
          {inferResponse && (
            <MyCoolCodeBlock
              code={inferResponse}
              language="json"
              showLineNumbers={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
