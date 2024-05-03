"use client";
import { resumeParserUpload } from "@/lib/candidate/ingest-resume/retrieve-resume";
import { candidateStartOnboard } from "@/lib/candidate/onboard/extractResume";


function Careers() {
    // handle onclick resumeParserUpload
    const resume = async () => {
        const candidateID = "60ba0d16-5f0d-4fa6-b06a-74cedf022df0";
        const pageContent = await candidateStartOnboard(candidateID);
        console.log(pageContent);
    }

  return (
    <div>
      <button onClick={resume}>Test</button>
    </div>
  )
}

export default Careers