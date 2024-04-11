"use client";
import { useEffect, useState, useCallback } from "react";
import Dropzone, { useDropzone } from "react-dropzone";
import { ingestResume } from "@/lib/ingestResume";
import { generateLiftedStatic } from "@/lib/staticGenerate";
import { generateLiftedInferred } from "@/lib/inferredGenerate";
import { CodeBlock, dracula } from "react-code-blocks";
import { resumeParserUpload } from "@/lib/receiveUpload";
import { set } from "zod";

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

  useEffect(() => {
    setIsStaticResumeLoading(true);
    fileResponse &&
      generateLiftedStatic(fileResponse).then((res) => setResponse(res));

    setIsStaticResumeLoading(false);
  }, [fileResponse]);

  const generateInferredDataPoints = async () => {
    setIsInferredResumeLoading(true);
    const res = await generateLiftedInferred(fileResponse);
    setInferResponse(res);
    setIsInferredResumeLoading(false);
  };

  useEffect(() => {
    response && generateInferredDataPoints();
  }, [response]);

  return (
    <div className="mx-auto h-screen max-w-7xl p-4 max-h-[80vh] space-y-8">
      <div className="mt-12 pb-12 font-semibold text-slate-800">01 Alpha. Defining schema.</div>
      <div className="flex flex-row gap-x-8">
        <div className="w-1/2 border border-1 border-gray-400 rounded-md p-4">
          {/* <button onClick={handleClick}>Ingest</button> */}
          <Dropzone onDrop={handleFileUpload} multiple={false}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag and drop a file here, or click to select a file</p>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
        <div className="w-1/2 rounded-md p-4"></div>
      </div>
      <div className="flex flex-row gap-x-8">
        <div className="w-1/2 border border-1 border-gray-400 rounded-md p-4">
          {isStaticResumeLoading && <p>Generating...</p>}
          {response && (
            <MyCoolCodeBlock
              code={response}
              language="json"
              showLineNumbers={true}
            />
          )}
        </div>
        <div className="w-1/2 border border-1 border-gray-400 rounded-md p-4 h-[75vh] max-h-[80vh] overflow-y-scroll">
          {isInferredResumeLoading && <p>Generating...</p>}
          {response && (
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
