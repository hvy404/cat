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

  // set demo data to mergedData
  const demoData = {
    "name": "Noelle Harrell",
    "contact": {
      "phone": "703 587-4950",
      "email": "noelleharrell33@gmail.com",
      "location": "Norwalk, CT"
    },
    "professional_certifications": [],
    "education": [
      {
        "degree": "Bachelor of Science",
        "institution": "Skidmore College",
        "end_date": "N/A",
        "start_date": "N/A"
      }
    ],
    "work_experience": [
      {
        "job_title": "Senior Manager, Growth Markets",
        "organization": "Kaseya US LLC (formerly Datto, Inc.)",
        "start_date": "August 2021",
        "end_date": "April 2023",
        "responsibilities": "Assess, develop, and scale an established team of 12 to drive revenue across our Managed SaaS business in the Eastern US. Responsible for recruiting, hiring, performance management, training, and establishing new sales processes and KPIs. Quota $6.8M, promoted June 2022. 106% (2022); 110% (2021) - a 22% increase per HC. 54% of direct reports were promoted during tenure. Initiated cross-functional learning track for Go-to-Market Leaders and direct reports, resulting in increased profitability, decreased employee churn, and operational excellence. Restructured territories and ‘mini teams’, which incentivized a multi-pronged revenue strategy and grass-roots development opportunities. Winner, Richardson Sales Leadership Competition, Q1 2022. Project Ascend Senior Leadership Program, Completed 2022."
      },
      {
        "job_title": "Senior Manager, Mid-Market Acquisitions",
        "organization": "TrueCommerce, Inc. Reston, VA",
        "start_date": "July 2018",
        "end_date": "July 2021",
        "responsibilities": "Built a new Mid-Market organization of 8 to acquire new logos (B2B and Channel). Responsible for recruiting, hiring, and training as well as operational collaboration with Marketing, Implementation, Product Management, Engineering, and Support. Quota $2.6M. Achieved 127% growth YOY. President’s Club Award 2018, 2019, and 2020. Contributed to the execution of various projects, including the establishment of sales training and sales processes to resolve and eliminate key departmental issues. Partnered with project leaders to communicate changes affecting timelines, or to implement new deliverables and requirements. Conducted a comprehensive audit of historical sales data and an active assessment of activities, KPIs, and available resources to increase revenue achievement. Built and managed strong relationships with department heads to present as ‘One Team’ and provide support through implementation during the initial project lifecycle."
      },
      {
        "job_title": "Senior Leader, New Business Acquisitions (Turnaround) and Sales Specialist",
        "organization": "Deltek, Inc. (formerly INPUT, Inc.)",
        "start_date": "2010",
        "end_date": "2018",
        "responsibilities": "Promoted internally to conduct turnaround of low producing & tenured sales team of 10 located across the US selling B2B. Responsible for assessment, hiring, performance management, training, and development of all team members. Increased sales by 31% and cut expenses by 30% in 24 months. Established KPIs, including process efficiencies, territory planning, demonstration training, and negotiation limits. Initiated a cross-departmental retention pilot program which reduced attrition by 80%."
      },
      {
        "job_title": "Sales Manager, Account Management",
        "organization": "Everest Software, Inc. (formerly iCode, Inc.)",
        "start_date": "2005",
        "end_date": "2009",
        "responsibilities": "Overachieved quotas across all 4 available roles in Sales. Managed full sales cycle and interdisciplinary collaboration selling ERP software and Professional Services. Improved operating profit margins, revenue growth, and retention rates. Created strategic plans and redesigned territories to increase market share."
      },
      {
        "job_title": "Major Accounts Manager, Account Manager",
        "organization": "SAVVIS Communications Corp. Herndon, VA",
        "start_date": "2002",
        "end_date": "2005",
        "responsibilities": "Hired to drive renewals and identify upsell and cross-sell opportunities, ranked Top 10% across all N.A. Sales. Provided direct support to the Executive Team for both acquisitions by WorldCom & then by Allegiance."
      },
      {
        "job_title": "Department Head, Account Management",
        "organization": "Allegiance Telecom, Inc. (formerly WorldCom/Intermedia/DIGEX) Bethesda, MD",
        "start_date": "1998",
        "end_date": "2002",
        "responsibilities": "Selected by SVP to spearhead a new org for Account Management, with autonomy for strategy, sales process, territory alignment, compensation plans, and their execution. Carried responsibility for recruiting, hiring, training, and quota of up to 2 Managers and 22 ICs. Conducted Sales Audits of new and existing sales in support of acquisition activities. Quota $41M, promoted 3 times during tenure."
      }
    ],
    "technical_skills": [],
    "soft_skills": [],
    "industry_experience": [],
    "company": "Kaseya US LLC (formerly Datto, Inc.)",
    "title": "Senior Manager, Growth Markets",
    "security_clearance": [],
    "fedcon_experience": [],
    "manager_trait": {
      "manager_trait_reason": "Sales Management Professional with 14 years of proven success at Software, Security, Consulting, and IT firms. Goal-oriented problem solver with a consistent track record of overachievement. Able to create infrastructure, assess gaps, benchmark trends, and communicate effectively. Highly adaptive with keen business acumen, strong commitment, and high integrity. Demonstrated ability to create customer, partner, and organizational loyalty. Recognized for developing effective sales leaders, a high EQ, and a strong cross-functional skillset.",
      "manager_boolean": true
    },
    "potential_roles": [
      "Sales Director",
      "Sales VP",
      "Sales Operations Manager"
    ],
    "applicant_id": "9b00ceff-42c4-4967-9e2a-40746eae1853",
    "embedding": [2323, 233, -9.09, -0.08],
    "matching_opt_in": null,
    "active_looking": null,
    "active_looking_confirmed_date": null,
    "applied_at": [],
    "jds_viewed": [],
    "interviewed_by": [],
    "resume_matched_to_jd": [],
    "resume_requested_by_company": [],
    "professional_network": {
      "mentors": [],
      "references": [],
      "colleagues": []
    }
  };

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

  // const to add json data to mergedData
  // TODO: only used in development testing
  useEffect(() => {
    if (!mergedData) {
      setMergedData(JSON.stringify(demoData, null, 2));
    }
  }, [mergedData]);

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
